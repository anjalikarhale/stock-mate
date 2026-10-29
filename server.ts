import express from "express";
import http from "http";
import path from "path";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import {
  initDatabase,
  getUserById,
  getUserByEmail,
  createOrUpdateUser,
  getAllUsers,
  registerUser,
  authenticateUser,
  getClassroomById,
  getClassroomByCode,
  createClassroom,
  getClassroomMembers,
  joinClassroom,
  getUserClassrooms,
  getActivityById,
  getClassroomActivities,
  createActivity,
  updateActivityStatus,
  getActivityRounds,
  getActivityRound,
  getOrCreateParticipant,
  getActivityParticipants,
  createSubmission,
  getStudentSubmissions,
  getAllActivitySubmissions,
  saveStudentQuizAnswer,
  getStudentQuizAnswers,
  getAllActivityQuizAnswers,
  getActivityLeaderboard,
  saveDatabase,
  getUserByToken,
  invalidateToken,
  saveActivityAttempt,
  getStudentAttempts,
  getStudentProfile,
  getStudentPortfolio,
  executeOrderOnPortfolio,
  executeOptionOrderOnPortfolio,
  cancelStudentOrder,
  updateStudentWatchlist,
  getStudentCourseProgress,
  saveStudentCourseProgress,
  resetStudentCourseProgress,
  getStudentGameScores,
  saveStudentGameScore,
  authenticateAdmin,
  getAllUsersProgress,
} from "./server/db.ts";
import { getAllSupportedStocksWithCache, getStockInfo } from "./server/marketService.ts";
import { startMarketFeed } from "./server/marketFeed.ts";
import { getAllRegisteredInstruments, getRegisteredInstrument } from "./server/instrumentRegistry.ts";
import {
  getInstrumentQuote,
  getBatchLtp,
  getBatchOhlcSnapshot,
  getHistoricalCandles,
  getIndexOptionChain,
  getOptionContractGreeks,
  isGrowwConfigured,
  isIndianMarketOpenNow,
  SupportedTimeframe,
} from "./server/growwService.ts";
import { calculateRoundScore, evaluateQuizAnswer } from "./server/scoringEngine.ts";
import {
  MARKET_CHALLENGE_QUESTIONS,
  getClientQuestionsForRound,
  getQuestionsForRound,
} from "./server/marketChallengeQuestions.ts";
import { User, ActivityRound } from "./server/types.ts";

dotenv.config();

// Initialize database
initDatabase();

const app = express();
const PORT = 3000;

// Enable proxy trusting so Cloud Run reverse proxies correctly populate client IP
app.set("trust proxy", 1);

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

startMarketFeed(io);

app.use(express.json());

// --------------------------------------------------------------------------
// Rate Limiters for Authentication and AI Endpoints
// --------------------------------------------------------------------------
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 40, // Limit each IP to 40 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: false },
  message: { error: "Too many authentication requests. Please try again after 15 minutes." },
});

const aiRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 60, // Limit each IP to 60 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: false },
  message: { error: "Too many AI requests. Please slow down and try again shortly." },
});

const marketRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 180,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: false },
  message: { error: "Market data rate limit exceeded. Please wait a moment." },
});

app.use("/api/auth", authRateLimiter);
app.use("/api/ai", aiRateLimiter);
app.use("/api/chart-mentor", aiRateLimiter);
app.use("/api/market", marketRateLimiter);

// Lazy-initialized Gemini client helper (server-side ONLY)
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        timeout: 8000,
        headers: { "User-Agent": "aistudio-build" },
      },
    });
  }
  return aiClient;
}

function withGeminiTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Gemini request timed out after ${ms}ms`));
    }, ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// --------------------------------------------------------------------------
// Real-time Socket.IO Connection, Rooms & Presence Tracking
// --------------------------------------------------------------------------
// Map classroomId -> Set of online user IDs
const classroomOnlineUsers = new Map<string, Set<string>>();
// Map socketId -> { userId: string; classroomId: string }
const socketClassrooms = new Map<string, { userId: string; classroomId: string }>();

function getOnlineUsersInClassroom(classroomId: string): string[] {
  const set = classroomOnlineUsers.get(classroomId);
  return set ? Array.from(set) : [];
}

io.on("connection", (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Join classroom room
  socket.on("join-classroom", ({ classroomId, user }) => {
    if (!classroomId) return;
    const room = `classroom:${classroomId}`;
    socket.join(room);

    if (user && user.id) {
      if (!classroomOnlineUsers.has(classroomId)) {
        classroomOnlineUsers.set(classroomId, new Set());
      }
      classroomOnlineUsers.get(classroomId)!.add(user.id);
      socketClassrooms.set(socket.id, { userId: user.id, classroomId });

      const onlineUserIds = getOnlineUsersInClassroom(classroomId);

      // Notify classroom of joined member & presence
      const eventPayload = {
        user,
        classroomId,
        onlineUserIds,
        timestamp: Date.now(),
      };

      socket.to(room).emit("MEMBER_JOINED", eventPayload);
      socket.to(room).emit("student:joined", eventPayload);
      io.to(room).emit("PRESENCE_UPDATED", { classroomId, onlineUserIds });
      io.to(room).emit("student:presence", { classroomId, onlineUserIds });
    }

    console.log(`[Socket.IO] ${user?.name || socket.id} joined room ${room}`);
  });

  // Join activity room
  socket.on("join-activity", ({ activityId, classroomId, user }) => {
    if (!activityId) return;
    const room = `activity:${activityId}`;
    socket.join(room);
    if (classroomId) {
      socket.join(`classroom:${classroomId}`);
      if (user && user.id) {
        if (!classroomOnlineUsers.has(classroomId)) {
          classroomOnlineUsers.set(classroomId, new Set());
        }
        classroomOnlineUsers.get(classroomId)!.add(user.id);
        socketClassrooms.set(socket.id, { userId: user.id, classroomId });
        const onlineUserIds = getOnlineUsersInClassroom(classroomId);
        io.to(`classroom:${classroomId}`).emit("PRESENCE_UPDATED", { classroomId, onlineUserIds });
      }
    }

    console.log(`[Socket.IO] ${user?.name || socket.id} joined activity ${room}`);

    // If student, record participation
    if (user && user.role === "STUDENT") {
      const participant = getOrCreateParticipant(activityId, classroomId || "", user);
      io.to(room).emit("PARTICIPANT_JOINED", {
        participant,
        totalParticipants: getActivityParticipants(activityId).length,
      });
      io.to(room).emit("student:joined", {
        participant,
        totalParticipants: getActivityParticipants(activityId).length,
      });
    }

    // Send latest leaderboard and current state to this socket immediately
    const leaderboard = getActivityLeaderboard(activityId);
    socket.emit("LEADERBOARD_UPDATED", { leaderboard });
    socket.emit("leaderboard:updated", { leaderboard });
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    const meta = socketClassrooms.get(socket.id);
    if (meta) {
      const { userId, classroomId } = meta;
      socketClassrooms.delete(socket.id);

      const set = classroomOnlineUsers.get(classroomId);
      if (set) {
        // Check if user has other open sockets for this classroom
        let userHasOtherSocket = false;
        for (const session of socketClassrooms.values()) {
          if (session.userId === userId && session.classroomId === classroomId) {
            userHasOtherSocket = true;
            break;
          }
        }
        if (!userHasOtherSocket) {
          set.delete(userId);
        }
        const onlineUserIds = Array.from(set);
        io.to(`classroom:${classroomId}`).emit("PRESENCE_UPDATED", { classroomId, onlineUserIds });
        io.to(`classroom:${classroomId}`).emit("student:presence", { classroomId, onlineUserIds });
        io.to(`classroom:${classroomId}`).emit("student:left", { userId, classroomId });
      }
    }
  });
});

// --------------------------------------------------------------------------
// Health check & System info
// --------------------------------------------------------------------------
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "StockMate Classroom & RPG",
    version: "3.0.0",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()),
    growwConfigured: isGrowwConfigured(),
    marketOpen: isIndianMarketOpenNow(),
    realtime: "Socket.IO Enabled",
  });
});

// --------------------------------------------------------------------------
// Centralized Market Data API (Groww Live Data + Per-Symbol Historical Candles)
// --------------------------------------------------------------------------
app.get("/api/market/status", (_req, res) => {
  res.json({
    growwConfigured: isGrowwConfigured(),
    marketOpen: isIndianMarketOpenNow(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/market/instruments", (req, res) => {
  const kind = req.query.type as "EQUITY" | "INDEX" | "ETF" | undefined;
  res.json({
    instruments: getAllRegisteredInstruments(kind),
    growwConfigured: isGrowwConfigured(),
    marketOpen: isIndianMarketOpenNow(),
  });
});

app.get("/api/market/quote", async (req, res) => {
  const symbol = String(req.query.symbol || req.query.trading_symbol || "").trim();
  if (!symbol) {
    return res.status(400).json({ error: "Query parameter 'symbol' is required." });
  }
  const quote = await getInstrumentQuote(symbol);
  if (!quote) {
    return res.status(404).json({ error: `Instrument '${symbol}' is not in the supported NSE/BSE registry.` });
  }
  return res.json(quote);
});

app.get("/api/market/ltp", async (req, res) => {
  const segment = (String(req.query.segment || "CASH").toUpperCase() === "FNO" ? "FNO" : "CASH") as "CASH" | "FNO";
  const rawSymbols = String(req.query.exchange_symbols || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const result = await getBatchLtp(segment, rawSymbols);
  if (!result.success) {
    return res.status(400).json({ error: result.error, meta: result.meta });
  }
  return res.json(result);
});

app.get("/api/market/ohlc", async (req, res) => {
  const segment = (String(req.query.segment || "CASH").toUpperCase() === "FNO" ? "FNO" : "CASH") as "CASH" | "FNO";
  const rawSymbols = String(req.query.exchange_symbols || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const result = await getBatchOhlcSnapshot(segment, rawSymbols);
  if (!result.success) {
    return res.status(400).json({ error: result.error, meta: result.meta });
  }
  return res.json(result);
});

app.get("/api/market/history/:symbol", async (req, res) => {
  const symbol = String(req.params.symbol || "").trim();
  const tfRaw = String(req.query.timeframe || "3M").toUpperCase();
  const allowedTf: SupportedTimeframe[] = ["5D", "1M", "3M", "6M", "1Y"];
  const timeframe: SupportedTimeframe = allowedTf.includes(tfRaw as SupportedTimeframe)
    ? (tfRaw as SupportedTimeframe)
    : "3M";

  const chartData = await getHistoricalCandles(symbol, timeframe);
  if (chartData.meta.status === "UNAVAILABLE") {
    return res.status(404).json(chartData);
  }
  return res.json(chartData);
});

app.get("/api/market/option-chain", async (req, res) => {
  const underlying = String(req.query.underlying || "NIFTY").trim().toUpperCase();
  const expiryDate = req.query.expiry_date ? String(req.query.expiry_date).trim() : undefined;
  const allowSim = req.query.allow_simulation !== "false";

  const inst = getRegisteredInstrument(underlying);
  if (!inst || !inst.supportsOptions) {
    return res.status(400).json({
      error: `Underlying '${underlying}' does not support index options in this registry. Supported: NIFTY, BANKNIFTY, SENSEX.`,
    });
  }

  const chain = await getIndexOptionChain(inst.symbol, expiryDate, allowSim);
  if (!chain) {
    return res.status(404).json({ error: `Option chain unavailable for ${underlying}.` });
  }
  return res.json(chain);
});

app.get("/api/market/greeks", async (req, res) => {
  const exchange = (String(req.query.exchange || "NSE").toUpperCase() === "BSE" ? "BSE" : "NSE") as "NSE" | "BSE";
  const underlying = String(req.query.underlying || "").trim().toUpperCase();
  const tradingSymbol = String(req.query.trading_symbol || "").trim();
  const expiry = String(req.query.expiry || "").trim();

  if (!underlying || !tradingSymbol || !expiry) {
    return res.status(400).json({ error: "Parameters 'underlying', 'trading_symbol', and 'expiry' are required." });
  }

  const result = await getOptionContractGreeks({ exchange, underlying, tradingSymbol, expiry });
  if (!result.success) {
    return res.status(404).json(result);
  }
  return res.json(result);
});

// Legacy Classroom market endpoints preserved
app.get("/api/market/stocks", (_req, res) => {
  res.json(getAllSupportedStocksWithCache());
});

app.get("/api/market/stocks/:symbol", (req, res) => {
  const stock = getStockInfo(req.params.symbol);
  res.json(stock);
});

// --------------------------------------------------------------------------
// User / Auth Helpers (Enables secure Student & Teacher login and registration)
// --------------------------------------------------------------------------
app.get("/api/auth/users", (_req, res) => {
  res.json(getAllUsers());
});

app.post("/api/auth/signup", (req, res) => {
  const { name, email, password, role, avatar } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Full name is required" });
  }
  if (!email || !email.trim() || !email.includes("@")) {
    return res.status(400).json({ error: "A valid email address is required" });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  }
  if (!role || (role !== "STUDENT" && role !== "TEACHER")) {
    return res.status(400).json({ error: "Role must be STUDENT or TEACHER" });
  }

  // Require environment variable TEACHER_INVITE_CODE for TEACHER signup
  if (role === "TEACHER") {
    const requiredCode = process.env.TEACHER_INVITE_CODE;
    if (!requiredCode) {
      return res.status(500).json({ error: "Teacher registration is disabled: TEACHER_INVITE_CODE is not configured in environment." });
    }
    const providedCode = (req.body.inviteCode || req.body.teacherInviteCode || "").trim();
    if (!providedCode || providedCode !== requiredCode.trim()) {
      return res.status(403).json({ error: "Invalid Teacher Invite Code. Please request authorization from the administrator." });
    }
  }

  const result = registerUser({
    name: name.trim(),
    email: email.trim(),
    password,
    role,
    avatar: avatar || (role === "TEACHER" ? "👨‍🏫" : "👨‍🎓"),
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.status(201).json({ success: true, user: result.user, token: result.token });
});

// Alias for registration
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role, avatar } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Full name is required" });
  }
  if (!email || !email.trim() || !email.includes("@")) {
    return res.status(400).json({ error: "A valid email address is required" });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  }
  if (!role || (role !== "STUDENT" && role !== "TEACHER")) {
    return res.status(400).json({ error: "Role must be STUDENT or TEACHER" });
  }

  if (role === "TEACHER") {
    const requiredCode = process.env.TEACHER_INVITE_CODE;
    if (!requiredCode) {
      return res.status(500).json({ error: "Teacher registration is disabled: TEACHER_INVITE_CODE is not configured in environment." });
    }
    const providedCode = (req.body.inviteCode || req.body.teacherInviteCode || "").trim();
    if (!providedCode || providedCode !== requiredCode.trim()) {
      return res.status(403).json({ error: "Invalid Teacher Invite Code. Please request authorization from the administrator." });
    }
  }

  const result = registerUser({
    name: name.trim(),
    email: email.trim(),
    password,
    role,
    avatar: avatar || (role === "TEACHER" ? "👨‍🏫" : "👨‍🎓"),
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.status(201).json({ success: true, user: result.user, token: result.token });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ error: "Email address is required" });
  }

  const result = authenticateUser(email.trim(), password, role);
  if (!result.success) {
    return res.status(401).json({ error: result.error });
  }

  return res.json({ success: true, user: result.user, token: result.token });
});

// Helper to authenticate user via Bearer token ONLY
function getAuthenticatedUser(req: express.Request): User | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const user = getUserByToken(token);
      if (user) return user;
    }
  }
  return null;
}

// Current User verification
app.get("/api/auth/me", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthenticated session" });
  }
  return res.json({ success: true, user });
});

// Logout session
app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    invalidateToken(token);
  }
  return res.json({ success: true, message: "Logged out successfully" });
});

// --------------------------------------------------------------------------
// Admin Portal Authentication & Progress Tracking Endpoints
// --------------------------------------------------------------------------
app.post("/api/admin/login", (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: "Administrator identifier and password are required." });
  }

  const result = authenticateAdmin(identifier.trim(), password);
  if (!result.success) {
    return res.status(401).json({ error: result.error || "Invalid administrator credentials." });
  }

  return res.json({ success: true, user: result.user, token: result.token });
});

app.get("/api/admin/users-progress", (req, res) => {
  const user = getAuthenticatedUser(req);
  // Allow if user is admin or if valid admin token exists
  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied. Administrator privileges required." });
  }

  const learnersProgress = getAllUsersProgress();
  return res.json({
    success: true,
    totalCount: learnersProgress.length,
    users: learnersProgress,
    generatedAt: new Date().toISOString(),
  });
});

app.post("/api/auth/user", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }
  const { name, email, avatar } = req.body;
  const user = createOrUpdateUser({
    id: authUser.id,
    name: name || authUser.name,
    email: email || authUser.email,
    role: authUser.role,
    avatar: avatar || authUser.avatar,
  });
  res.json(user);
});

// --------------------------------------------------------------------------
// Student Persistent Profile & Attempts Endpoints
// --------------------------------------------------------------------------
app.get("/api/students/:id/profile", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }
  const targetId = authUser.role === "STUDENT" ? authUser.id : req.params.id;
  const profileData = getStudentProfile(targetId);
  if (!profileData) {
    const user = getUserById(targetId) || authUser;
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      xp: user.xp || 100,
      level: user.level || 1,
      createdAt: user.createdAt || new Date().toISOString(),
      completedActivitiesCount: 0,
      totalScore: 0,
      averageAccuracy: 0,
      attempts: [],
      achievements: ['New Trader'],
    });
  }
  return res.json(profileData);
});

app.get("/api/student/profile", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }
  const profileData = getStudentProfile(authUser.id);
  if (!profileData) {
    return res.json({
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      role: authUser.role,
      avatar: authUser.avatar,
      xp: authUser.xp || 100,
      level: authUser.level || 1,
      createdAt: authUser.createdAt || new Date().toISOString(),
      completedActivitiesCount: 0,
      totalScore: 0,
      averageAccuracy: 0,
      attempts: [],
      achievements: ['New Trader'],
    });
  }
  return res.json(profileData);
});

app.get("/api/students/:id/attempts", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }
  const targetId = authUser.role === "STUDENT" ? authUser.id : req.params.id;
  const attempts = getStudentAttempts(targetId);
  return res.json(attempts);
});

app.get("/api/student/attempts", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }
  const attempts = getStudentAttempts(authUser.id);
  return res.json(attempts);
});

app.post("/api/activities/:id/attempts", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }

  const activityId = req.params.id;
  const {
    classroomId,
    classroomName,
    activityName,
    round1Score,
    round1Correct,
    round1TotalQuestions,
    round2Score,
    round2Correct,
    round2TotalQuestions,
    finalScore,
    totalCorrect,
    totalQuestions,
    accuracyPercentage,
    rank,
    xpEarned,
    achievements,
    startTime,
    completionTime,
  } = req.body;

  // Derive student identity strictly from the authenticated Bearer token
  const saved = saveActivityAttempt({
    studentId: authUser.id,
    studentName: authUser.name,
    studentEmail: authUser.email,
    classroomId: classroomId || "",
    classroomName: classroomName || "Stock Market Basics",
    activityId,
    activityName: activityName || "StockMate Market Challenge",
    round1Score: Number(round1Score) || 0,
    round1Correct: Number(round1Correct) || 0,
    round1TotalQuestions: Number(round1TotalQuestions) || 10,
    round2Score: Number(round2Score) || 0,
    round2Correct: Number(round2Correct) || 0,
    round2TotalQuestions: Number(round2TotalQuestions) || 10,
    finalScore: Number(finalScore) || 0,
    totalCorrect: Number(totalCorrect) || 0,
    totalQuestions: Number(totalQuestions) || 20,
    accuracyPercentage: Number(accuracyPercentage) || 0,
    rank: Number(rank) || 1,
    xpEarned: Number(xpEarned) || 100,
    achievements: Array.isArray(achievements) ? achievements : [],
    startTime: startTime || new Date().toISOString(),
    completionTime: completionTime || new Date().toISOString(),
  });

  return res.status(201).json({ success: true, attempt: saved });
});

// --------------------------------------------------------------------------
// Student Persistent Portfolio, Orders, Watchlist & Journal API
// --------------------------------------------------------------------------
app.get("/api/student/portfolio", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }
  const portfolio = getStudentPortfolio(authUser.id);
  return res.json(portfolio);
});

app.post("/api/student/orders", async (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }

  const { symbol, action, type, quantity, price, triggerPrice, stopLossPrice, rationale, emotionalState } = req.body;
  if (!symbol || !action || !quantity) {
    return res.status(400).json({ error: "symbol, action, and quantity are required" });
  }

  const result = await executeOrderOnPortfolio(authUser.id, {
    symbol,
    action,
    type: type || "MARKET",
    quantity: Number(quantity),
    price: Number(price) || 100,
    triggerPrice: triggerPrice ? Number(triggerPrice) : undefined,
    stopLossPrice: stopLossPrice ? Number(stopLossPrice) : undefined,
    rationale,
    emotionalState,
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  const updatedPortfolio = getStudentPortfolio(authUser.id);
  return res.status(201).json({ success: true, order: result.order, portfolio: updatedPortfolio });
});

app.post("/api/student/options/orders", async (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }

  const { underlying, expiry, strike, optionType, action, lots, rationale } = req.body;
  if (!underlying || !expiry || strike === undefined || !optionType || !action || !lots) {
    return res.status(400).json({
      error: "underlying, expiry, strike, optionType, action, and lots are required.",
    });
  }

  const result = await executeOptionOrderOnPortfolio(authUser.id, {
    underlying: String(underlying),
    expiry: String(expiry),
    strike: Number(strike),
    optionType: optionType === "PE" ? "PE" : "CE",
    action: action === "SELL" ? "SELL" : "BUY",
    lots: Number(lots),
    rationale: rationale ? String(rationale) : undefined,
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.status(201).json({
    success: true,
    order: result.order,
    portfolio: result.portfolio || getStudentPortfolio(authUser.id),
  });
});

app.post("/api/student/orders/:orderId/cancel", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }

  const { orderId } = req.params;
  if (!orderId) {
    return res.status(400).json({ error: "orderId is required" });
  }

  const result = cancelStudentOrder(authUser.id, orderId);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  const updatedPortfolio = getStudentPortfolio(authUser.id);
  return res.json({ success: true, portfolio: updatedPortfolio });
});

app.post("/api/student/watchlist", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }

  const { watchlist } = req.body;
  if (!Array.isArray(watchlist)) {
    return res.status(400).json({ error: "watchlist array is required" });
  }
  const updated = updateStudentWatchlist(authUser.id, watchlist);
  return res.json({ success: true, watchlist: updated });
});

// --------------------------------------------------------------------------
// Student 16-Module Course Progression & Game Scores API
// --------------------------------------------------------------------------
app.get("/api/student/course-progress", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }
  const progress = getStudentCourseProgress(authUser.id);
  return res.json(progress);
});

app.post("/api/student/course-progress", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }

  const {
    lessonId,
    score,
    earnedXp,
    moduleId,
    exerciseId,
    moduleCompleted,
    moduleQuizScore,
    lastActiveModuleId,
    lastActiveLessonId,
    worksheetDraft,
  } = req.body;

  if (!lessonId && !moduleId && !exerciseId && !worksheetDraft && !lastActiveModuleId) {
    return res.status(400).json({ error: "Progress update payload is required" });
  }

  const result = saveStudentCourseProgress(
    authUser.id,
    lessonId || "__meta_only__",
    Number(score) || 100,
    Number(earnedXp) || 0,
    {
      moduleId,
      exerciseId,
      moduleCompleted: Boolean(moduleCompleted),
      moduleQuizScore: typeof moduleQuizScore === "number" ? moduleQuizScore : undefined,
      lastActiveModuleId,
      lastActiveLessonId,
      worksheetDraft,
    }
  );
  return res.json({ success: true, ...result });
});

app.post("/api/student/course-progress/reset", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }
  const progress = resetStudentCourseProgress(authUser.id);
  return res.json({ success: true, progress });
});

app.get("/api/student/game-scores", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }
  const scores = getStudentGameScores(authUser.id);
  return res.json(scores);
});

app.post("/api/student/game-scores", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }
  const { gameId, gameTitle, moduleId, score, maxPossibleScore, difficulty, completed, xpReward } = req.body;
  if (!gameId) {
    return res.status(400).json({ error: "gameId is required" });
  }
  const diff =
    difficulty === "Advanced" ? "Advanced" : difficulty === "Intermediate" ? "Intermediate" : "Beginner";

  const result = saveStudentGameScore(authUser.id, {
    gameId: String(gameId),
    gameTitle: String(gameTitle || gameId),
    moduleId: String(moduleId || "module-1"),
    score: Number(score) || 0,
    maxPossibleScore: Number(maxPossibleScore) || 100,
    difficulty: diff,
    completed: Boolean(completed),
    xpReward: Number(xpReward) || 75,
  });
  return res.json({ success: true, ...result });
});

// --------------------------------------------------------------------------
// AI Chart Mentor API (Server-Side Proxy with @google/genai & gemini-3.8-flash)
// --------------------------------------------------------------------------
app.post("/api/chart-mentor", async (req, res) => {
  const {
    question,
    symbol,
    companyName,
    timeframe,
    currentPrice,
    changePercent,
    high,
    low,
    lastCandles,
    indicators,
  } = req.body;

  if (!question) {
    return res.status(400).json({ error: "A question or inquiry is required." });
  }

  const chartContextSummary = `
Instrument: ${symbol || 'NIFTY'} (${companyName || 'Stock'})
Timeframe: ${timeframe || 'Daily'}
Current Price: ₹${currentPrice || 'N/A'} (Today: ${changePercent ? `${changePercent}%` : 'N/A'})
Session High: ₹${high || 'N/A'}, Session Low: ₹${low || 'N/A'}
Recent 5 Candles (OHLC): ${JSON.stringify(lastCandles || [])}
Active Indicators: ${JSON.stringify(indicators || {})}
Data Status: Historical NSE Feed / Delayed Simulation (~15 min delay). All funds simulated.
`;

  const systemInstruction = `You are the StockMate AI Chart Mentor, an expert educational tutor teaching technical analysis aligned with the National Stock Exchange of India (NSE) NCFM curriculum.
You must adhere strictly to these rules:
1. Act as an educational tutor, NOT an automated trading signal generator or financial advisor. Never promise guaranteed returns or give personalized financial advice.
2. Only use the chart data actually supplied in the context. If data is missing, stale, or unavailable, state that honestly.
3. Distinguish objective observations (e.g. "Price closed below the 20 EMA with rising volume") from interpretations (e.g. "Some traders may view this as short-term bearish pressure").
4. Point out uncertainty, risk of whipsaws, and indicator limitations (e.g., "RSI can remain overbought in strong bull trends").
5. Connect observations to NCFM course concepts: Support/Resistance, Candlestick anatomy (Hammer, Doji, Engulfing), Dow Theory, Moving Averages, RSI extremes, MACD, or Risk Management (stop loss & position sizing).
6. Keep explanations clear, engaging, concise, and structured with bullet points.`;

  try {
    const ai = getAIClient();
    if (ai) {
      const response = await withGeminiTimeout(
        ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `CURRENT CHART CONTEXT:\n${chartContextSummary}\n\nSTUDENT QUESTION:\n${question}`,
          config: {
            systemInstruction,
            temperature: 0.5,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            abortSignal: AbortSignal.timeout(8000),
          },
        }),
        8500
      );

      const reply = response.text || "I have analyzed the provided chart context. Let me know if you would like to explore specific candlestick patterns or support levels.";
      return res.json({ success: true, reply, source: "gemini-3.8-flash" });
    }
  } catch (err: any) {
    console.warn("[ChartMentor] Gemini API call failed or rate-limited, falling back to rule-based tutor:", err?.message);
  }

  // Educational Fallback Mentor Engine when Gemini API key is not configured
  const rsiVal = indicators?.rsi;
  const sma20 = indicators?.sma20;
  const isAboveSma = sma20 && currentPrice ? currentPrice >= sma20 : null;

  let fallbackReply = `**Educational Chart Analysis for ${symbol || 'NSE Instrument'} (${timeframe || 'Daily'} Timeframe)**:\n\n`;

  if (question.toLowerCase().includes('candle') || question.toLowerCase().includes('pattern')) {
    fallbackReply += `• **Candle Anatomy**: Notice the interaction between Open, High, Low, and Close. Long lower shadows indicate that sellers attempted to push the price lower, but buyers stepped in to bid it back up into the close (Hammer/Umbrella line psychology).\n`;
    fallbackReply += `• **Volume Confirmation**: In NCFM Technical Analysis, any reversal candlestick pattern requires positive follow-through the next day with expanding volume to be considered valid.\n`;
  } else if (question.toLowerCase().includes('rsi') || question.toLowerCase().includes('indicator')) {
    fallbackReply += `• **RSI Momentum Context**: ${rsiVal ? `Current RSI is ~${Math.round(rsiVal)}.` : 'RSI is a momentum oscillator ranging between 0 and 100.'}\n`;
    fallbackReply += `• **Zone Shifts**: Under the NCFM curriculum, in a bull market, RSI extreme zones shift up to **70 and 40** (dips to 40 are potential support). In a bear market, extreme zones shift down to **60 and 30**.\n`;
    fallbackReply += `• **Limitation**: An overbought reading alone is NOT a reason to short sell in a strong bull market, because momentum can remain elevated for extended periods.\n`;
  } else if (question.toLowerCase().includes('support') || question.toLowerCase().includes('resistance')) {
    fallbackReply += `• **Support & Resistance**: S&R levels represent areas of market memory where supply and demand reach equilibrium. Support is the price floor where demand halts declines; Resistance is the ceiling where supply halts advances.\n`;
    fallbackReply += `• **Price Zones**: Remember that support and resistance operate as *zones* rather than exact penny levels. Volatile momentum moves frequently test 1-2% beyond the exact line before stabilizing.\n`;
    fallbackReply += `• **Role Reversal**: If support is decisively broken on high volume, it flips into future resistance.\n`;
  } else {
    fallbackReply += `• **Trend & Moving Averages**: Price is currently trading at ₹${currentPrice || 'N/A'}${isAboveSma !== null ? ` (${isAboveSma ? 'above' : 'below'} the 20-period moving average of ₹${sma20})` : ''}. In technical analysis, trading with the primary trend offers the highest statistical edge.\n`;
    fallbackReply += `• **Risk Management**: Always define your invalidation point before entering any trade. Place a stop-loss order and ensure your potential reward is at least 1.5 times your risk, while never risking more than 2% of your capital on a single position.\n`;
  }

  fallbackReply += `\n*Recommended Course Lesson: Chapter 4 (Major Indicators) & Chapter 7 (Risk Management & Trading Psychology).*`;

  return res.json({ success: true, reply: fallbackReply, source: "educational-tutor-rules" });
});

app.get("/api/classrooms", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }
  res.json(getUserClassrooms(authUser.id));
});

app.post("/api/classrooms", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }
  if (authUser.role !== "TEACHER" && authUser.role !== "ADMIN") {
    return res.status(403).json({ error: "Unauthorized: Only TEACHER accounts can create classrooms." });
  }

  const { name, department, year, batch } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Classroom name is required" });
  }

  // Derive teacher identity strictly from token
  const classroom = createClassroom({
    name: name.trim(),
    teacherId: authUser.id,
    teacherName: authUser.name,
    department,
    year,
    batch,
  });

  res.status(201).json(classroom);
});

app.post("/api/classrooms/join", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }

  const { code } = req.body;
  if (!code || !code.trim()) {
    return res.status(400).json({ error: "Classroom code is required" });
  }

  const classroom = getClassroomByCode(code.trim().toUpperCase());
  if (!classroom) {
    return res.status(404).json({ error: "Invalid classroom code. Check the code and try again." });
  }

  // Derive user identity strictly from token, never from body
  const result = joinClassroom(classroom.id, authUser);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  // Notify classroom room with both event formats
  const joinPayload = {
    user: authUser,
    classroom: result.classroom,
    onlineUserIds: getOnlineUsersInClassroom(classroom.id),
  };
  io.to(`classroom:${classroom.id}`).emit("MEMBER_JOINED", joinPayload);
  io.to(`classroom:${classroom.id}`).emit("student:joined", joinPayload);

  res.json(result);
});

app.get("/api/classrooms/:id", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }
  const classroom = getClassroomById(req.params.id);
  if (!classroom) {
    return res.status(404).json({ error: "Classroom not found" });
  }
  res.json(classroom);
});

app.get("/api/classrooms/:id/members", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }
  const members = getClassroomMembers(req.params.id);
  const onlineIds = new Set(getOnlineUsersInClassroom(req.params.id));
  const annotated = members.map((m) => ({
    ...m,
    isOnline: onlineIds.has(m.userId),
  }));
  res.json(annotated);
});

app.get("/api/classrooms/:id/students", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }
  const members = getClassroomMembers(req.params.id);
  const onlineIds = new Set(getOnlineUsersInClassroom(req.params.id));
  const students = members
    .filter((m) => m.role === "STUDENT")
    .map((m) => ({
      ...m,
      isOnline: onlineIds.has(m.userId),
    }));
  res.json(students);
});

app.get("/api/classrooms/:id/activities", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }
  const activities = getClassroomActivities(req.params.id);
  res.json(activities);
});

app.post("/api/classrooms/:id/activities", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  }
  if (authUser.role !== "TEACHER" && authUser.role !== "ADMIN") {
    return res.status(403).json({ error: "Unauthorized: Only TEACHER accounts can create activities." });
  }

  const classroomId = req.params.id;
  const classroom = getClassroomById(classroomId);
  if (!classroom) {
    return res.status(404).json({ error: "Classroom not found" });
  }

  if (classroom.teacherId !== authUser.id && authUser.role !== "ADMIN") {
    return res.status(403).json({ error: "Unauthorized: Only the assigned classroom teacher can create activities." });
  }

  const {
    name,
    description,
    concept,
    activityType,
    symbol,
    difficulty,
    durationMinutes,
    maxScore,
    xpReward,
  } = req.body;

  const activity = createActivity({
    classroomId,
    name: name || "Market Decision Challenge",
    description: description || "Analyze real-time market action and make disciplined trading decisions.",
    concept: concept || "Price Action & Risk Management",
    activityType: activityType || "MARKET_DECISION",
    symbol: symbol || "RELIANCE",
    difficulty: difficulty || "Beginner",
    durationMinutes: Number(durationMinutes) || 10,
    maxScore: Number(maxScore) || 100,
    xpReward: Number(xpReward) || 200,
  });

  // Broadcast to classroom
  io.to(`classroom:${classroomId}`).emit("ACTIVITY_CREATED", { activity });

  res.status(201).json(activity);
});

// --------------------------------------------------------------------------
// Activity Control & Real-time Progression API
// --------------------------------------------------------------------------
app.get("/api/activities/:id", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  const activity = getActivityById(req.params.id);
  if (!activity) return res.status(404).json({ error: "Activity not found" });
  res.json(activity);
});

app.post("/api/activities/:id/join", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  const activity = getActivityById(req.params.id);
  if (!activity) return res.status(404).json({ error: "Activity not found" });

  // Derive user identity strictly from token
  const participant = getOrCreateParticipant(activity.id, activity.classroomId, authUser);

  // Broadcast to room
  io.to(`activity:${activity.id}`).emit("PARTICIPANT_JOINED", {
    participant,
    totalParticipants: getActivityParticipants(activity.id).length,
  });

  res.json(participant);
});

// START ACTIVITY (Teacher Only)
app.post("/api/activities/:id/start", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  const activity = getActivityById(req.params.id);
  if (!activity) return res.status(404).json({ error: "Activity not found" });

  const classroom = getClassroomById(activity.classroomId);
  if (authUser.role !== "ADMIN" && (!classroom || classroom.teacherId !== authUser.id)) {
    return res.status(403).json({ error: "Unauthorized: Only the assigned classroom teacher can start this activity" });
  }

  const now = Date.now();
  // 5 minutes (300 seconds) server-authoritative round duration
  const roundDurationMs = 300 * 1000;
  const round = getActivityRound(activity.id, 1);

  const updated = updateActivityStatus(activity.id, "LIVE", {
    startTime: now,
    roundStartTime: now,
    roundEndTime: now + roundDurationMs,
    currentRoundNumber: 1,
  });

  // Real-time broadcast to all students
  const payload = {
    activityId: activity.id,
    classroomId: activity.classroomId,
    status: "LIVE",
    currentRound: 1,
    round,
    roundStartTime: now,
    roundEndTime: now + roundDurationMs,
    serverTime: now,
  };

  io.to(`classroom:${activity.classroomId}`).emit("ACTIVITY_STARTED", payload);
  io.to(`classroom:${activity.classroomId}`).emit("activity:started", payload);
  io.to(`activity:${activity.id}`).emit("ACTIVITY_STARTED", payload);
  io.to(`activity:${activity.id}`).emit("activity:started", payload);
  io.to(`activity:${activity.id}`).emit("ROUND_STARTED", payload);
  io.to(`activity:${activity.id}`).emit("round:started", payload);

  res.json(updated);
});

// PAUSE ACTIVITY (Teacher Only)
app.post("/api/activities/:id/pause", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  const activity = getActivityById(req.params.id);
  if (!activity) return res.status(404).json({ error: "Activity not found" });

  const classroom = getClassroomById(activity.classroomId);
  if (authUser.role !== "ADMIN" && (!classroom || classroom.teacherId !== authUser.id)) {
    return res.status(403).json({ error: "Unauthorized: Only the assigned classroom teacher can pause this activity" });
  }

  const now = Date.now();
  const remainingSeconds = activity.roundEndTime
    ? Math.max(0, Math.round((activity.roundEndTime - now) / 1000))
    : 0;

  const updated = updateActivityStatus(activity.id, "PAUSED", {
    pausedRemainingSeconds: remainingSeconds,
  });

  const pausePayload = { activityId: activity.id };
  io.to(`classroom:${activity.classroomId}`).emit("ACTIVITY_PAUSED", pausePayload);
  io.to(`classroom:${activity.classroomId}`).emit("activity:paused", pausePayload);
  io.to(`activity:${activity.id}`).emit("ACTIVITY_PAUSED", pausePayload);
  io.to(`activity:${activity.id}`).emit("activity:paused", pausePayload);

  res.json(updated);
});

// RESUME ACTIVITY (Teacher Only)
app.post("/api/activities/:id/resume", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  const activity = getActivityById(req.params.id);
  if (!activity) return res.status(404).json({ error: "Activity not found" });

  const classroom = getClassroomById(activity.classroomId);
  if (authUser.role !== "ADMIN" && (!classroom || classroom.teacherId !== authUser.id)) {
    return res.status(403).json({ error: "Unauthorized: Only the assigned classroom teacher can resume this activity" });
  }

  const now = Date.now();
  const remainingMs = (activity.pausedRemainingSeconds || 60) * 1000;

  const updated = updateActivityStatus(activity.id, "LIVE", {
    roundStartTime: now,
    roundEndTime: now + remainingMs,
  });

  const payload = {
    activityId: activity.id,
    status: "LIVE",
    roundStartTime: now,
    roundEndTime: now + remainingMs,
    serverTime: now,
  };

  io.to(`classroom:${activity.classroomId}`).emit("ACTIVITY_RESUMED", payload);
  io.to(`classroom:${activity.classroomId}`).emit("activity:resumed", payload);
  io.to(`activity:${activity.id}`).emit("ACTIVITY_RESUMED", payload);
  io.to(`activity:${activity.id}`).emit("activity:resumed", payload);

  res.json(updated);
});

// ADVANCE TO NEXT ROUND (Teacher or Auto-timer)
app.post("/api/activities/:id/next-round", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  const activity = getActivityById(req.params.id);
  if (!activity) return res.status(404).json({ error: "Activity not found" });

  const classroom = getClassroomById(activity.classroomId);
  if (authUser.role !== "ADMIN" && (!classroom || classroom.teacherId !== authUser.id)) {
    return res.status(403).json({ error: "Unauthorized: Only the assigned classroom teacher can advance rounds" });
  }

  const nextRoundNumber = activity.currentRoundNumber + 1;
  if (nextRoundNumber > activity.totalRounds) {
    // End activity if rounds complete
    const ended = updateActivityStatus(activity.id, "COMPLETED", {
      endTime: Date.now(),
    });

    const leaderboard = getActivityLeaderboard(activity.id);
    const endPayload = { activityId: activity.id, leaderboard };
    io.to(`classroom:${activity.classroomId}`).emit("ACTIVITY_ENDED", endPayload);
    io.to(`classroom:${activity.classroomId}`).emit("activity:ended", endPayload);
    io.to(`activity:${activity.id}`).emit("ACTIVITY_ENDED", endPayload);
    io.to(`activity:${activity.id}`).emit("activity:ended", endPayload);

    return res.json(ended);
  }

  const now = Date.now();
  // 5 minutes (300 seconds) server-authoritative round duration
  const roundDurationMs = 300 * 1000;
  const round = getActivityRound(activity.id, nextRoundNumber);

  const updated = updateActivityStatus(activity.id, "LIVE", {
    currentRoundNumber: nextRoundNumber,
    roundStartTime: now,
    roundEndTime: now + roundDurationMs,
  });

  const payload = {
    activityId: activity.id,
    currentRound: nextRoundNumber,
    round,
    roundStartTime: now,
    roundEndTime: now + roundDurationMs,
    serverTime: now,
  };

  io.to(`classroom:${activity.classroomId}`).emit("ROUND_STARTED", payload);
  io.to(`classroom:${activity.classroomId}`).emit("round:started", payload);
  io.to(`activity:${activity.id}`).emit("ROUND_STARTED", payload);
  io.to(`activity:${activity.id}`).emit("round:started", payload);

  res.json(updated);
});

// END ACTIVITY (Teacher Only)
app.post("/api/activities/:id/end", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  const activity = getActivityById(req.params.id);
  if (!activity) return res.status(404).json({ error: "Activity not found" });

  const classroom = getClassroomById(activity.classroomId);
  if (authUser.role !== "ADMIN" && (!classroom || classroom.teacherId !== authUser.id)) {
    return res.status(403).json({ error: "Unauthorized: Only the assigned classroom teacher can end this activity" });
  }

  const updated = updateActivityStatus(activity.id, "COMPLETED", {
    endTime: Date.now(),
  });

  const leaderboard = getActivityLeaderboard(activity.id);
  const endPayload = { activityId: activity.id, leaderboard };
  io.to(`classroom:${activity.classroomId}`).emit("ACTIVITY_ENDED", endPayload);
  io.to(`classroom:${activity.classroomId}`).emit("activity:ended", endPayload);
  io.to(`activity:${activity.id}`).emit("ACTIVITY_ENDED", endPayload);
  io.to(`activity:${activity.id}`).emit("activity:ended", endPayload);

  res.json(updated);
});

// REFRESH & RECONNECT STATE RECOVERY
app.get("/api/activities/:id/state", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });
  const activity = getActivityById(req.params.id);
  if (!activity) return res.status(404).json({ error: "Activity not found" });

  // Derive student ID strictly from authenticated user
  const studentId = authUser.id;
  const rounds = getActivityRounds(activity.id);
  const currentRound = getActivityRound(activity.id, activity.currentRoundNumber);
  const submissions = getStudentSubmissions(activity.id, studentId);
  const participants = getActivityParticipants(activity.id);
  const leaderboard = getActivityLeaderboard(activity.id);

  res.json({
    activity,
    currentRound,
    totalRounds: rounds.length,
    studentSubmissions: submissions,
    hasSubmittedCurrentRound: submissions.some((s) => s.roundNumber === activity.currentRoundNumber),
    participantsCount: participants.length,
    leaderboard,
    serverTime: Date.now(),
  });
});

// PROCESS STUDENT DECISION SUBMISSION (Helper)
function processRoundSubmission(req: express.Request, res: express.Response, activity: any, round: any, authUser: User) {
  const activityId = activity.id;
  const roundId = round.id;

  if (activity.status !== "LIVE") {
    return res.status(400).json({ error: "Activity is not currently active" });
  }

  // Derive student identity strictly from the authenticated token
  const studentId = authUser.id;
  const studentName = authUser.name;
  const studentAvatar = authUser.avatar || "👨‍🎓";

  const {
    decision,
    quantity,
    stopLoss,
    target,
    targetPrice,
    entryPrice,
    riskLevel,
    reasoning,
    reasoningRationale,
  } = req.body;

  if (!decision) {
    return res.status(400).json({ error: "Decision (BUY/SELL/HOLD) is required" });
  }

  // Prevent duplicate submission for this round
  const existing = getStudentSubmissions(activityId, studentId);
  if (existing.some((s) => s.roundId === roundId || s.roundNumber === round.roundNumber)) {
    return res.status(400).json({ error: "You have already submitted a decision for this round" });
  }

  const effectiveTarget = target !== undefined ? target : targetPrice;
  const effectiveReasoning = reasoning || reasoningRationale || "";

  const now = Date.now();
  // Server-side scoring calculation
  const scoreResult = calculateRoundScore(round, {
    decision,
    quantity: Number(quantity) || 1,
    stopLoss: Number(stopLoss) || 0,
    target: Number(effectiveTarget) || 0,
    riskLevel: riskLevel || "MEDIUM",
    reasoning: effectiveReasoning,
    submittedTimestamp: now,
    roundStartTime: activity.roundStartTime || now - 60000,
    roundEndTime: activity.roundEndTime || now + 60000,
  });

  const submission = createSubmission({
    activityId,
    roundId,
    roundNumber: round.roundNumber,
    studentId,
    studentName,
    studentAvatar,
    decision,
    quantity: Number(quantity) || 1,
    stopLoss: Number(stopLoss) || 0,
    target: Number(effectiveTarget) || 0,
    riskLevel: riskLevel || "MEDIUM",
    reasoning: effectiveReasoning,
    submittedAt: new Date().toISOString(),
    submittedTimestamp: now,
    decisionScore: scoreResult.decisionScore,
    riskScore: scoreResult.riskScore,
    analysisScore: scoreResult.analysisScore,
    timingScore: scoreResult.timingScore,
    participationScore: scoreResult.participationScore,
    totalScore: scoreResult.totalScore,
    feedback: scoreResult.feedback,
  });

  // Update leaderboard & broadcast
  const leaderboard = getActivityLeaderboard(activityId);
  const participants = getActivityParticipants(activityId);

  const submitPayload = {
    studentId,
    studentName,
    roundNumber: round.roundNumber,
    totalSubmissionsForRound: getAllActivitySubmissions(activityId).filter((s) => s.roundNumber === round.roundNumber).length,
    totalParticipants: participants.length,
  };

  io.to(`activity:${activityId}`).emit("STUDENT_SUBMITTED", submitPayload);
  io.to(`activity:${activityId}`).emit("student:submitted", submitPayload);
  io.to(`classroom:${activity.classroomId}`).emit("STUDENT_SUBMITTED", submitPayload);
  io.to(`classroom:${activity.classroomId}`).emit("student:submitted", submitPayload);

  io.to(`activity:${activityId}`).emit("LEADERBOARD_UPDATED", { leaderboard });
  io.to(`activity:${activityId}`).emit("leaderboard:updated", { leaderboard });
  io.to(`classroom:${activity.classroomId}`).emit("LEADERBOARD_UPDATED", { leaderboard });
  io.to(`classroom:${activity.classroomId}`).emit("leaderboard:updated", { leaderboard });

  return res.status(201).json({
    submission,
    score: scoreResult.totalScore,
    scoreBreakdown: scoreResult,
    scoreResult,
    leaderboard,
  });
}

// SUBMIT STUDENT DECISION by round ID (Backend scored & recorded)
app.post("/api/activities/:id/rounds/:roundId/submit", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });

  const activity = getActivityById(req.params.id);
  if (!activity) return res.status(404).json({ error: "Activity not found" });

  const rounds = getActivityRounds(activity.id);
  const round = rounds.find((r) => r.id === req.params.roundId) || getActivityRound(activity.id, activity.currentRoundNumber);
  if (!round) return res.status(404).json({ error: "Round not found" });

  return processRoundSubmission(req, res, activity, round, authUser);
});

// SUBMIT STUDENT DECISION by activity ID (Convenience alias using currentRoundNumber)
app.post("/api/activities/:id/submit", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });

  const activity = getActivityById(req.params.id);
  if (!activity) return res.status(404).json({ error: "Activity not found" });

  const roundNum = Number(req.body.roundNumber) || activity.currentRoundNumber || 1;
  const round = getActivityRound(activity.id, roundNum);
  if (!round) return res.status(404).json({ error: "Round not found" });

  return processRoundSubmission(req, res, activity, round, authUser);
});

// --------------------------------------------------------------------------
// StockMate Market Challenge Quiz API (2 Rounds, 10 Questions each, 100 pts/correct)
// --------------------------------------------------------------------------
app.get("/api/activities/:id/quiz/questions", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });

  const roundNum = Number(req.query.roundNumber) === 2 ? 2 : 1;
  const questions = getClientQuestionsForRound(roundNum as 1 | 2);
  res.json({
    roundNumber: roundNum,
    questions,
    totalQuestions: questions.length,
    scoringRule: "Correct = 100 points, Wrong = 0 points. Strictly no speed bonus.",
  });
});

app.post("/api/activities/:id/quiz/submit", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });

  const activityId = req.params.id;
  const activity = getActivityById(activityId);
  if (!activity) {
    return res.status(404).json({ error: "Activity not found" });
  }

  const {
    roundNumber,
    questionNumber,
    questionId,
    selectedOption,
  } = req.body;

  if (!selectedOption || !questionId) {
    return res.status(400).json({ error: "selectedOption and questionId are required" });
  }

  // Derive student identity strictly from the authenticated Bearer token
  const studentId = authUser.id;
  const studentName = authUser.name;
  const studentAvatar = authUser.avatar || "👨‍🎓";

  const rNum = Number(roundNumber) === 2 ? 2 : 1;
  const qNum = Number(questionNumber) || 1;

  // Find question definition
  const questionDef = MARKET_CHALLENGE_QUESTIONS.find(
    (q) => q.id === questionId || (q.roundNumber === rNum && q.questionNumber === qNum)
  );

  if (!questionDef) {
    return res.status(404).json({ error: "Question definition not found" });
  }

  // Fixed scoring: Correct = 100, Wrong = 0. NO SPEED BONUS.
  const evalResult = evaluateQuizAnswer(
    selectedOption as 'A' | 'B' | 'C' | 'D',
    questionDef.correctOption,
    questionDef.explanation
  );

  const answer = saveStudentQuizAnswer({
    activityId,
    roundNumber: rNum as 1 | 2,
    questionNumber: qNum,
    questionId: questionDef.id,
    studentId,
    studentName,
    studentAvatar,
    selectedOption: selectedOption as 'A' | 'B' | 'C' | 'D',
    isCorrect: evalResult.isCorrect,
    score: evalResult.score,
    submittedAt: new Date().toISOString(),
    submittedTimestamp: Date.now(),
  });

  const leaderboard = getActivityLeaderboard(activityId);
  const allAnswers = getAllActivityQuizAnswers(activityId);
  const studentAnswers = allAnswers.filter((a) => a.studentId === studentId);
  const questionAnswerCount = allAnswers.filter(
    (a) => a.roundNumber === rNum && a.questionNumber === qNum
  ).length;

  const quizSubmitPayload = {
    studentId,
    studentName,
    studentAvatar,
    roundNumber: rNum,
    questionNumber: qNum,
    totalAnswered: studentAnswers.length,
    questionAnswerCount,
  };

  // Broadcast real-time updates
  io.to(`activity:${activityId}`).emit("QUIZ_ANSWER_SUBMITTED", quizSubmitPayload);
  io.to(`activity:${activityId}`).emit("quiz:answer_submitted", quizSubmitPayload);
  io.to(`classroom:${activity.classroomId}`).emit("QUIZ_ANSWER_SUBMITTED", quizSubmitPayload);
  io.to(`classroom:${activity.classroomId}`).emit("quiz:answer_submitted", quizSubmitPayload);

  io.to(`activity:${activityId}`).emit("LEADERBOARD_UPDATED", { leaderboard });
  io.to(`activity:${activityId}`).emit("leaderboard:updated", { leaderboard });
  io.to(`classroom:${activity.classroomId}`).emit("LEADERBOARD_UPDATED", { leaderboard });
  io.to(`classroom:${activity.classroomId}`).emit("leaderboard:updated", { leaderboard });

  return res.status(201).json({
    success: true,
    answerId: answer.id,
    isCorrect: evalResult.isCorrect,
    score: evalResult.score,
    selectedOption,
    questionNumber: qNum,
    roundNumber: rNum,
    leaderboard,
  });
});

app.get("/api/activities/:id/quiz/student-answers", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });

  const activityId = req.params.id;
  const targetStudentId = authUser.role === "STUDENT" ? authUser.id : ((req.query.studentId as string) || authUser.id);

  const answers = getStudentQuizAnswers(activityId, targetStudentId);
  res.json(answers);
});

app.get("/api/activities/:id/quiz/summary", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });

  const activityId = req.params.id;
  const activity = getActivityById(activityId);
  if (!activity) return res.status(404).json({ error: "Activity not found" });

  const participants = getActivityParticipants(activityId);
  const allAnswers = getAllActivityQuizAnswers(activityId);
  const leaderboard = getActivityLeaderboard(activityId);

  // Calculate per-question statistics
  const round1Questions = getQuestionsForRound(1).map((q) => {
    const qAnswers = allAnswers.filter((a) => a.roundNumber === 1 && a.questionNumber === q.questionNumber);
    const correctCount = qAnswers.filter((a) => a.isCorrect).length;
    return {
      questionNumber: q.questionNumber,
      question: q.question,
      correctOption: q.correctOption,
      explanation: q.explanation,
      totalResponses: qAnswers.length,
      correctCount,
      correctPercentage: qAnswers.length > 0 ? Math.round((correctCount / qAnswers.length) * 100) : 0,
      distribution: {
        A: qAnswers.filter((a) => a.selectedOption === "A").length,
        B: qAnswers.filter((a) => a.selectedOption === "B").length,
        C: qAnswers.filter((a) => a.selectedOption === "C").length,
        D: qAnswers.filter((a) => a.selectedOption === "D").length,
      },
    };
  });

  const round2Questions = getQuestionsForRound(2).map((q) => {
    const qAnswers = allAnswers.filter((a) => a.roundNumber === 2 && a.questionNumber === q.questionNumber);
    const correctCount = qAnswers.filter((a) => a.isCorrect).length;
    return {
      questionNumber: q.questionNumber,
      question: q.question,
      correctOption: q.correctOption,
      explanation: q.explanation,
      visualType: q.visualType,
      totalResponses: qAnswers.length,
      correctCount,
      correctPercentage: qAnswers.length > 0 ? Math.round((correctCount / qAnswers.length) * 100) : 0,
      distribution: {
        A: qAnswers.filter((a) => a.selectedOption === "A").length,
        B: qAnswers.filter((a) => a.selectedOption === "B").length,
        C: qAnswers.filter((a) => a.selectedOption === "C").length,
        D: qAnswers.filter((a) => a.selectedOption === "D").length,
      },
    };
  });

  res.json({
    activity,
    leaderboard,
    participantsCount: participants.length,
    totalAnswersSubmitted: allAnswers.length,
    round1Questions,
    round2Questions,
  });
});

// LEADERBOARD
app.get("/api/activities/:id/leaderboard", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });

  const leaderboard = getActivityLeaderboard(req.params.id);
  res.json(leaderboard);
});

// RESULTS & DETAILED ANALYSIS
app.get("/api/activities/:id/results", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) return res.status(401).json({ error: "Unauthorized: Valid Bearer token required" });

  const activity = getActivityById(req.params.id);
  if (!activity) return res.status(404).json({ error: "Activity not found" });

  const participants = getActivityParticipants(activity.id);
  const submissions = getAllActivitySubmissions(activity.id);
  const leaderboard = getActivityLeaderboard(activity.id);

  // Overall classroom statistics
  const totalScores = participants.map((p) => p.totalScore);
  const avgScore = totalScores.length > 0 ? Math.round(totalScores.reduce((a, b) => a + b, 0) / totalScores.length) : 0;
  const highestScore = totalScores.length > 0 ? Math.max(...totalScores) : 0;
  const lowestScore = totalScores.length > 0 ? Math.min(...totalScores) : 0;
  const avgAccuracy = participants.length > 0 ? Math.round(participants.reduce((a, b) => a + b.accuracyPercent, 0) / participants.length) : 0;
  const completedCount = participants.filter((p) => p.roundsCompleted >= activity.totalRounds).length;
  const completionRate = participants.length > 0 ? Math.round((completedCount / participants.length) * 100) : 0;

  res.json({
    activity,
    leaderboard,
    participants,
    submissions,
    stats: {
      totalParticipants: participants.length,
      averageScore: avgScore,
      highestScore,
      lowestScore,
      averageAccuracy: avgAccuracy,
      completionRate,
      completedCount,
    },
  });
});

// CSV EXPORT FOR TEACHER
app.get("/api/activities/:id/export", (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) return res.status(401).send("Unauthorized: Valid Bearer token required");

  const activity = getActivityById(req.params.id);
  if (!activity) return res.status(404).send("Activity not found");

  const leaderboard = getActivityLeaderboard(activity.id);
  const participants = getActivityParticipants(activity.id);

  let csv = "Rank,Student,Email,Score,Accuracy %,Risk Score,Rounds Completed,Status\n";
  leaderboard.forEach((entry) => {
    const p = participants.find((part) => part.studentId === entry.studentId);
    csv += `${entry.rank},"${entry.studentName}","${entry.studentEmail || p?.studentEmail || ""}",${entry.totalScore},${entry.accuracyPercent}%,${entry.riskPercent}%,${entry.roundsCompleted}/${activity.totalRounds},${entry.status}\n`;
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="Classroom_${activity.symbol}_Results.csv"`);
  res.send(csv);
});

// --------------------------------------------------------------------------
// Socratic AI Mentor & Trade Analysis Endpoints (Existing Preserved Features)
// --------------------------------------------------------------------------
app.post("/api/ai/mentor", async (req, res) => {
  try {
    const { message, context, chatHistory } = req.body;
    const cleanMsg = String(message || "").trim();
    if (!cleanMsg) {
      return res.status(400).json({ error: "Please enter a question for the AI Mentor." });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.json({
        reply: generateSocraticFallback(cleanMsg, context),
        source: "curriculum-tutor-fallback",
        geminiConfigured: false,
        notice: "GEMINI_API_KEY is not configured — answering using built-in 16-Module Curriculum Tutor.",
      });
    }

    const moduleTitle = context?.activeModuleTitle || context?.moduleTitle;
    const lessonTitle = context?.activeLessonTitle || context?.lessonTitle;
    const activeTab = context?.activeTab || context?.currentTab || "Learn";
    const virtualCashVal = context?.cash ?? context?.virtualCash;

    const contextBlock = context
      ? `Active Student Context:
- Screen/Tab: ${activeTab}
- Current Module: ${moduleTitle || "N/A"} (${context.levelLabel || ""})
- Current Lesson: ${lessonTitle || "N/A"}
- Selected Symbol: ${context.selectedSymbol || "N/A"}
- Trading Mode: ${context.tradingMode || "N/A"}
- Virtual Cash: ₹${virtualCashVal ?? "N/A"}`
      : "";

    const systemInstruction = `You are the StockMate Educational AI Mentor for the Indian stock market (NSE, BSE, SEBI, NSDL/CDSL, Nifty 50, Sensex, Nifty Bank).
Ground your explanations in StockMate's 16-module curriculum:
- Level 1 Beginner (Modules 1–5): Shares & ownership, market price vs company value, SEBI/NSE/BSE/NSDL/CDSL/clearing, Bank+Trading+Demat accounts, Nifty 50/Sensex/Nifty Bank (indices are benchmarks, not directly purchasable shares), Market/Limit/SL/SL-M orders, bid-ask spread, slippage, Investing vs Trading.
- Level 2 Intermediate (Modules 6–14): P&L, Balance Sheet (Assets = Liabilities + Equity), Cash Flow Statement (profit vs cash flow), Ratios (EPS, P/E = Price/EPS, P/B, ROE, ROCE, D/E, Current Ratio, Margins, FCF = CFO - CapEx), Valuation (Relative, DCF, DDM P0 = D1/(r-g) for r > g, Bear/Base/Bull scenarios), Macro/RBI/FII-DII, Candlesticks (OHLC, Hammer, Engulfing, Doji, Shooting Star require context), Trends & S/R zones, Indicators (SMA, EMA, RSI, MACD, Bollinger, VWAP, ATR), Price Action (BOS, CHoCH, Order Blocks, FVG — note methodological variations), Volume & OI (Long/Short buildup conventions, PCR OI vs Volume).
- Level 3 Advanced (Modules 15–16): Futures & Options (Calls/Puts, ITM/ATM/OTM, IV & skew, Delta/Gamma/Theta/Vega/Rho as local sensitivity estimates, SEBI finding that 93% of individual F&O traders incurred losses in FY2022–FY2024), Trading Systems & Risk Management (Position size = Max planned loss / (Entry - Stop) for long trades where Entry > Stop, R:R, expectancy, drawdown, backtesting biases).

STRICT RULES:
1. Distinguish educational explanations from personalized financial advice. NEVER recommend buying or selling a real security and NEVER guarantee profits.
2. NEVER invent live market prices. Only refer to prices explicitly provided in the student's context, or use clearly labelled hypothetical ₹ examples.
3. Keep answers concise (120–220 words), well-structured with short bullet points, INR (₹) formatting, and one Socratic check-for-understanding question at the end.`;

    const contents: any[] = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      for (const msg of chatHistory.slice(-8)) {
        if (msg && typeof msg.text === "string" && msg.text.trim()) {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.text }],
          });
        }
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: contextBlock ? `${contextBlock}\n\nStudent Question: ${cleanMsg}` : cleanMsg }],
    });

    const response = await withGeminiTimeout(
      ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.5,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          abortSignal: AbortSignal.timeout(8000),
        },
      }),
      8500
    );

    const replyText = (response.text || "").trim();
    if (!replyText) {
      return res.json({
        reply: generateSocraticFallback(cleanMsg, context),
        source: "curriculum-tutor-fallback",
        geminiConfigured: true,
        notice: "Model returned an empty response; showing grounded curriculum explanation.",
      });
    }

    return res.json({
      reply: replyText,
      source: "gemini-3.8-flash",
      geminiConfigured: true,
    });
  } catch (error: any) {
    console.error("AI Mentor error:", error?.message || error);
    return res.json({
      reply: generateSocraticFallback(req.body?.message || "", req.body?.context),
      source: "curriculum-tutor-fallback",
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      notice: "Live AI service temporarily unavailable — using built-in curriculum tutor.",
    });
  }
});

function generateSocraticFallback(message: string, context: any): string {
  const lower = (message || "").toLowerCase();
  const modName = context?.activeModuleTitle || context?.moduleTitle;
  const lessonHint = modName ? `*(Connected to ${modName})*\n\n` : "";

  if (lower.includes("p/e") || lower.includes("pe ") || lower.includes("roe") || lower.includes("ratio")) {
    return `${lessonHint}**Financial Ratios (Module 7):**
- **P/E Ratio** = Market Price per Share ÷ EPS. A low P/E is *not* automatically a bargain—earnings may be cyclical or declining.
- **ROE** = (Profit Attributable to Shareholders ÷ Average Shareholders' Equity) × 100. High ROE can come from strong operations *or* heavy debt leverage.
- Always compare ratios against sector peers and cash-flow conversion (**FCF = Operating Cash Flow − CapEx**).

*Check:* Why might two companies in different sectors (say IT vs Banking) naturally trade at very different P/E multiples?`;
  }
  if (lower.includes("option") || lower.includes("greek") || lower.includes("theta") || lower.includes("delta") || lower.includes("ce") || lower.includes("pe")) {
    return `${lessonHint}**Options & Greeks (Module 15):**
- **Call (CE)** gives the buyer the right to buy; **Put (PE)** gives the buyer the right to sell. Buyers pay a **premium** (Intrinsic Value + Time Value), while sellers face potentially large obligations and require margin.
- **Greeks** are local sensitivity estimates: **Delta** (underlying move), **Gamma** (change in Delta), **Theta** (time decay), **Vega** (implied volatility), **Rho** (interest rates).
- *Risk Reminder:* SEBI reported that 93% of individual equity F&O traders incurred net losses in FY2022–FY2024.

*Check:* What happens to an Out-of-the-Money (OTM) option's time value as expiry approaches if the index stays flat?`;
  }
  if (lower.includes("position size") || lower.includes("stop") || lower.includes("risk")) {
    return `${lessonHint}**Position Sizing & Risk Control (Module 16):**
- **Formula (Long Trade, Entry > Stop):**
  \`Position Size = Maximum Planned Loss ÷ (Entry Price − Stop Price)\`
- Example: With ₹1,00,000 capital and 1% risk (₹1,000 max planned loss), buying at ₹500 with a stop at ₹485 risks ₹15/share → \`1000 ÷ 15 = 66 shares\`.
- Note: Gaps, slippage, and transaction charges can make actual loss exceed planned risk.

*Check:* If your stop-loss distance widens from ₹15 to ₹30, how should your share quantity change to keep rupee risk constant?`;
  }
  if (lower.includes("candlestick") || lower.includes("hammer") || lower.includes("doji") || lower.includes("support") || lower.includes("resistance")) {
    return `${lessonHint}**Candlesticks & Market Structure (Modules 10–11):**
- A candlestick summarizes **Open, High, Low, Close (OHLC)** for one period.
- Patterns like a **Hammer**, **Bullish Engulfing**, **Doji**, or **Shooting Star** are *not* standalone guarantees—evaluate them near **Support/Resistance zones** with volume and trend context.

*Check:* Why is a Hammer forming after a prolonged decline near a prior support zone more meaningful than the same candle inside a choppy sideways range?`;
  }
  return `${lessonHint}**StockMate Curriculum Guide:**
- Connect **business quality & cash flows** (Modules 6–9), **price structure & liquidity** (Modules 10–14), and **strict position sizing** (Modules 15–16) before making any simulated paper trade.
- Ask me about any concept—such as **SEBI/Demat settlement**, **Balance Sheet vs Cash Flow**, **DCF/DDM valuation**, **RSI/VWAP/ATR**, **Option Chain & Greeks**, or **Position Sizing**!

*Educational Note: All explanations are for learning and simulated paper trading, not financial advice.*`;
}

function generateTradeAnalysisFallback(trade: any): string {
  if (!trade) return "Discipline is the key to longevity in trading.";
  return `### 📊 Trade Review
- **Symbol:** ${trade.symbol || "NIFTY 50"}
- **Action:** ${trade.action || "BUY"} at ₹${trade.price || 0}
- **Quantity:** ${trade.quantity || 1}
Always set an automatic Stop-Loss to safeguard capital!`;
}

// --------------------------------------------------------------------------
// Vite middleware & Static serving
// --------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[StockMate RPG & Classroom] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
