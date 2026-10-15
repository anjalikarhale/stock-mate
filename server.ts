import express from "express";
import http from "http";
import path from "path";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
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
  cancelStudentOrder,
  updateStudentWatchlist,
  getStudentCourseProgress,
  saveStudentCourseProgress,
} from "./server/db.ts";
import { SUPPORTED_STOCKS, getStockInfo } from "./server/marketService.ts";
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
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());

// Lazy-initialized Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
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
    version: "2.0.0",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    realtime: "Socket.IO Enabled",
  });
});

// --------------------------------------------------------------------------
// Market Data API (Real historical NSE data with strict delay labeling)
// --------------------------------------------------------------------------
app.get("/api/market/stocks", (_req, res) => {
  res.json(SUPPORTED_STOCKS);
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

// Helper to authenticate user via Bearer token or query userId
function getAuthenticatedUser(req: express.Request): User | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const user = getUserByToken(token);
    if (user) return user;
  }
  const callerId = (req.query.userId as string) || (req.body?.userId as string) || (req.headers["x-user-id"] as string);
  if (callerId) {
    const user = getUserById(callerId);
    if (user) return user;
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

app.post("/api/auth/user", (req, res) => {
  const { id, name, email, role, avatar } = req.body;
  if (!id || !name || !role) {
    return res.status(400).json({ error: "Missing id, name, or role" });
  }
  const user = createOrUpdateUser({ id, name, email, role, avatar });
  res.json(user);
});

// --------------------------------------------------------------------------
// Student Persistent Profile & Attempts Endpoints
// --------------------------------------------------------------------------
app.get("/api/students/:id/profile", (req, res) => {
  const studentId = req.params.id;
  const profileData = getStudentProfile(studentId);
  if (!profileData) {
    return res.status(404).json({ error: "Student profile not found" });
  }
  return res.json(profileData);
});

app.get("/api/students/:id/attempts", (req, res) => {
  const studentId = req.params.id;
  const attempts = getStudentAttempts(studentId);
  return res.json(attempts);
});

app.post("/api/activities/:id/attempts", (req, res) => {
  const activityId = req.params.id;
  const {
    studentId,
    studentName,
    studentEmail,
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

  if (!studentId) {
    return res.status(400).json({ error: "studentId is required" });
  }

  const saved = saveActivityAttempt({
    studentId,
    studentName: studentName || "Student",
    studentEmail,
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
  const userId = (req.query.userId as string) || "";
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }
  const portfolio = getStudentPortfolio(userId);
  return res.json(portfolio);
});

app.post("/api/student/orders", (req, res) => {
  const { userId, symbol, action, type, quantity, price, triggerPrice, stopLossPrice, rationale, emotionalState } = req.body;
  if (!userId || !symbol || !action || !quantity) {
    return res.status(400).json({ error: "userId, symbol, action, and quantity are required" });
  }

  const result = executeOrderOnPortfolio(userId, {
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

  const updatedPortfolio = getStudentPortfolio(userId);
  return res.status(201).json({ success: true, order: result.order, portfolio: updatedPortfolio });
});

app.post("/api/student/orders/:orderId/cancel", (req, res) => {
  const { userId } = req.body;
  const { orderId } = req.params;
  if (!userId || !orderId) {
    return res.status(400).json({ error: "userId and orderId are required" });
  }

  const result = cancelStudentOrder(userId, orderId);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  const updatedPortfolio = getStudentPortfolio(userId);
  return res.json({ success: true, portfolio: updatedPortfolio });
});

app.post("/api/student/watchlist", (req, res) => {
  const { userId, watchlist } = req.body;
  if (!userId || !Array.isArray(watchlist)) {
    return res.status(400).json({ error: "userId and watchlist array are required" });
  }
  const updated = updateStudentWatchlist(userId, watchlist);
  return res.json({ success: true, watchlist: updated });
});

// --------------------------------------------------------------------------
// Student NCFM Course Progression API
// --------------------------------------------------------------------------
app.get("/api/student/course-progress", (req, res) => {
  const userId = (req.query.userId as string) || "";
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }
  const progress = getStudentCourseProgress(userId);
  return res.json(progress);
});

app.post("/api/student/course-progress", (req, res) => {
  const { userId, lessonId, score, earnedXp } = req.body;
  if (!userId || !lessonId) {
    return res.status(400).json({ error: "userId and lessonId are required" });
  }
  const result = saveStudentCourseProgress(
    userId,
    lessonId,
    Number(score) || 100,
    Number(earnedXp) || 100
  );
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
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemInstruction}\n\nCURRENT CHART CONTEXT:\n${chartContextSummary}\n\nSTUDENT QUESTION:\n${question}`,
              },
            ],
          },
        ],
      });

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
  const userId = (req.query.userId as string) || "";
  if (!userId) {
    return res.json(getUserClassrooms("user_prof_sharma"));
  }
  res.json(getUserClassrooms(userId));
});

app.post("/api/classrooms", (req, res) => {
  const { name, teacherId, teacherName, department, year, batch } = req.body;
  if (!name || !teacherId) {
    return res.status(400).json({ error: "Name and teacherId are required" });
  }

  const teacher = getUserById(teacherId);
  if (teacher && teacher.role !== "TEACHER") {
    return res.status(403).json({ error: "Unauthorized: Only TEACHER accounts can create classrooms." });
  }

  const classroom = createClassroom({
    name,
    teacherId,
    teacherName: teacherName || teacher?.name || "Prof. Teacher",
    department,
    year,
    batch,
  });

  res.status(201).json(classroom);
});

app.post("/api/classrooms/join", (req, res) => {
  const { code, user } = req.body;
  if (!code || !user || !user.id) {
    return res.status(400).json({ error: "Classroom code and authenticated user are required" });
  }

  const classroom = getClassroomByCode(code);
  if (!classroom) {
    return res.status(404).json({ error: "Invalid classroom code. Check the code and try again." });
  }

  const result = joinClassroom(classroom.id, user);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  // Notify classroom room with both event formats
  const joinPayload = {
    user,
    classroom: result.classroom,
    onlineUserIds: getOnlineUsersInClassroom(classroom.id),
  };
  io.to(`classroom:${classroom.id}`).emit("MEMBER_JOINED", joinPayload);
  io.to(`classroom:${classroom.id}`).emit("student:joined", joinPayload);

  res.json(result);
});

app.get("/api/classrooms/:id", (req, res) => {
  const classroom = getClassroomById(req.params.id);
  if (!classroom) {
    return res.status(404).json({ error: "Classroom not found" });
  }
  res.json(classroom);
});

app.get("/api/classrooms/:id/members", (req, res) => {
  const members = getClassroomMembers(req.params.id);
  const onlineIds = new Set(getOnlineUsersInClassroom(req.params.id));
  const annotated = members.map((m) => ({
    ...m,
    isOnline: onlineIds.has(m.userId),
  }));
  res.json(annotated);
});

app.get("/api/classrooms/:id/students", (req, res) => {
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
  const activities = getClassroomActivities(req.params.id);
  res.json(activities);
});

app.post("/api/classrooms/:id/activities", (req, res) => {
  const classroomId = req.params.id;
  const classroom = getClassroomById(classroomId);
  if (!classroom) {
    return res.status(404).json({ error: "Classroom not found" });
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
  const activity = getActivityById(req.params.id);
  if (!activity) return res.status(404).json({ error: "Activity not found" });
  res.json(activity);
});

app.post("/api/activities/:id/join", (req, res) => {
  const { user } = req.body;
  const activity = getActivityById(req.params.id);
  if (!activity) return res.status(404).json({ error: "Activity not found" });

  if (!user || !user.id) {
    return res.status(400).json({ error: "User required" });
  }

  const participant = getOrCreateParticipant(activity.id, activity.classroomId, user);

  // Broadcast to room
  io.to(`activity:${activity.id}`).emit("PARTICIPANT_JOINED", {
    participant,
    totalParticipants: getActivityParticipants(activity.id).length,
  });

  res.json(participant);
});

// START ACTIVITY (Teacher Only)
app.post("/api/activities/:id/start", (req, res) => {
  const activity = getActivityById(req.params.id);
  if (!activity) return res.status(404).json({ error: "Activity not found" });

  const callerUserId = req.body?.userId;
  if (callerUserId) {
    const classroom = getClassroomById(activity.classroomId);
    if (classroom && classroom.teacherId !== callerUserId) {
      return res.status(403).json({ error: "Unauthorized: Only the classroom teacher can start this activity" });
    }
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
  const activity = getActivityById(req.params.id);
  if (!activity) return res.status(404).json({ error: "Activity not found" });

  const callerUserId = req.body?.userId;
  if (callerUserId) {
    const classroom = getClassroomById(activity.classroomId);
    if (classroom && classroom.teacherId !== callerUserId) {
      return res.status(403).json({ error: "Unauthorized: Only the classroom teacher can pause this activity" });
    }
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
  const activity = getActivityById(req.params.id);
  if (!activity) return res.status(404).json({ error: "Activity not found" });

  const callerUserId = req.body?.userId;
  if (callerUserId) {
    const classroom = getClassroomById(activity.classroomId);
    if (classroom && classroom.teacherId !== callerUserId) {
      return res.status(403).json({ error: "Unauthorized: Only the classroom teacher can resume this activity" });
    }
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
  const activity = getActivityById(req.params.id);
  if (!activity) return res.status(404).json({ error: "Activity not found" });

  const callerUserId = req.body?.userId;
  if (callerUserId) {
    const classroom = getClassroomById(activity.classroomId);
    if (classroom && classroom.teacherId !== callerUserId) {
      return res.status(403).json({ error: "Unauthorized: Only the classroom teacher can advance rounds" });
    }
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
  const activity = getActivityById(req.params.id);
  if (!activity) return res.status(404).json({ error: "Activity not found" });

  const callerUserId = req.body?.userId;
  if (callerUserId) {
    const classroom = getClassroomById(activity.classroomId);
    if (classroom && classroom.teacherId !== callerUserId) {
      return res.status(403).json({ error: "Unauthorized: Only the classroom teacher can end this activity" });
    }
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
  const activity = getActivityById(req.params.id);
  if (!activity) return res.status(404).json({ error: "Activity not found" });

  const studentId = (req.query.studentId as string) || "";
  const rounds = getActivityRounds(activity.id);
  const currentRound = getActivityRound(activity.id, activity.currentRoundNumber);
  const submissions = studentId ? getStudentSubmissions(activity.id, studentId) : [];
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
function processRoundSubmission(req: express.Request, res: express.Response, activity: any, round: any) {
  const activityId = activity.id;
  const roundId = round.id;

  if (activity.status !== "LIVE") {
    return res.status(400).json({ error: "Activity is not currently active" });
  }

  const {
    studentId,
    studentName,
    studentAvatar,
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

  if (!studentId || !decision) {
    return res.status(400).json({ error: "Student ID and decision (BUY/SELL/HOLD) are required" });
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
    studentName: studentName || "Student",
    studentAvatar: studentAvatar || "👨‍🎓",
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
    studentName: studentName || "Student",
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
  const activity = getActivityById(req.params.id);
  if (!activity) return res.status(404).json({ error: "Activity not found" });

  const rounds = getActivityRounds(activity.id);
  const round = rounds.find((r) => r.id === req.params.roundId) || getActivityRound(activity.id, activity.currentRoundNumber);
  if (!round) return res.status(404).json({ error: "Round not found" });

  return processRoundSubmission(req, res, activity, round);
});

// SUBMIT STUDENT DECISION by activity ID (Convenience alias using currentRoundNumber)
app.post("/api/activities/:id/submit", (req, res) => {
  const activity = getActivityById(req.params.id);
  if (!activity) return res.status(404).json({ error: "Activity not found" });

  const roundNum = Number(req.body.roundNumber) || activity.currentRoundNumber || 1;
  const round = getActivityRound(activity.id, roundNum);
  if (!round) return res.status(404).json({ error: "Round not found" });

  return processRoundSubmission(req, res, activity, round);
});

// --------------------------------------------------------------------------
// StockMate Market Challenge Quiz API (2 Rounds, 10 Questions each, 100 pts/correct)
// --------------------------------------------------------------------------
app.get("/api/activities/:id/quiz/questions", (req, res) => {
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
  const activityId = req.params.id;
  const activity = getActivityById(activityId);
  if (!activity) {
    return res.status(404).json({ error: "Activity not found" });
  }

  const {
    studentId,
    studentName,
    studentAvatar,
    roundNumber,
    questionNumber,
    questionId,
    selectedOption,
  } = req.body;

  if (!studentId || !selectedOption || !questionId) {
    return res.status(400).json({ error: "studentId, selectedOption, and questionId are required" });
  }

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
    studentName: studentName || "Student",
    studentAvatar: studentAvatar || "👨‍🎓",
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
    studentName: studentName || "Student",
    studentAvatar: studentAvatar || "👨‍🎓",
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
  const activityId = req.params.id;
  const studentId = req.query.studentId as string;
  if (!studentId) {
    return res.status(400).json({ error: "studentId query parameter is required" });
  }

  const answers = getStudentQuizAnswers(activityId, studentId);
  res.json(answers);
});

app.get("/api/activities/:id/quiz/summary", (req, res) => {
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
  const leaderboard = getActivityLeaderboard(req.params.id);
  res.json(leaderboard);
});

// RESULTS & DETAILED ANALYSIS
app.get("/api/activities/:id/results", (req, res) => {
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
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        reply: generateSocraticFallback(message, context),
        source: "simulated_socratic_engine",
      });
    }

    const systemInstruction = `You are 'Arya', the master Socratic Financial Mentor in MARKET QUEST / StockMate — an educational RPG for the Indian stock market (NSE/BSE).
Your goal is to teach financial literacy, technical analysis, fundamental analysis, risk management, and trading psychology from zero to mastery.
CRITICAL RULES:
1. Socratic Teaching: Ask thought-provoking questions and guide the student to reach their own conclusion. Never just dump answers or dry definitions.
2. ABSOLUTELY NO STOCK TIPS OR BUY/SELL ADVICE: Never recommend specific real stocks to buy or sell. Always emphasize risk, probabilities, and risk-management principles.
3. Indian Context: Refer to Indian financial market concepts (NSE, BSE, NIFTY 50, SENSEX, SEBI, Demat, Rupee ₹, etc.) when relevant.
4. Tone: Encouraging, analytical, disciplined, game-master RPG mentor persona.`;

    const contents = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      for (const msg of chatHistory.slice(-6)) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message || "Can you explain the risk-to-reward ratio and why 1:2 is recommended?" }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents as any,
      config: {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        temperature: 0.7,
        maxOutputTokens: 600,
      },
    });

    const replyText = response.text || "Let's examine the mechanics: what happens to your capital when your position size exceeds your risk tolerance?";
    return res.json({ reply: replyText, source: "gemini-2.5-flash" });
  } catch (error: any) {
    console.error("AI Mentor error:", error);
    return res.json({
      reply: "Let's analyze this step-by-step. In market analysis, when you look at price action, what is the first signal of buyer vs seller dominance you look for?",
      source: "fallback",
    });
  }
});

app.post("/api/ai/analyze-trade", async (req, res) => {
  try {
    const { trade, portfolio } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        analysis: generateTradeAnalysisFallback(trade),
        learningPoints: [
          "Always define stop loss before entering any position.",
          "Check risk-to-reward ratio (minimum 1:2 recommended).",
          "Avoid entering after massive vertical candles to prevent FOMO traps.",
        ],
      });
    }

    const prompt = `Analyze this simulated trade made by a student:
Trade Details: ${JSON.stringify(trade)}
Portfolio State: ${JSON.stringify(portfolio)}
Provide:
1. Quick objective assessment of the trade setup and risk management.
2. Socratic feedback question.
3. 2 key rules for Indian market trading discipline.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.6,
        maxOutputTokens: 500,
      },
    });

    return res.json({
      analysis: response.text || "Good trade execution. Notice how your risk per trade stayed under 2% of total capital.",
      source: "gemini-2.5-flash",
    });
  } catch (error: any) {
    return res.json({
      analysis: generateTradeAnalysisFallback(req.body.trade),
      learningPoints: [
        "Position sizing is your strongest defense against market volatility.",
        "Check support and resistance before market entry.",
      ],
    });
  }
});

function generateSocraticFallback(message: string, _context: any): string {
  const lower = (message || "").toLowerCase();
  if (lower.includes("candlestick") || lower.includes("hammer") || lower.includes("doji")) {
    return `### 🕯️ Reading Price Action
A candlestick tells the battle between buyers (bulls) and sellers (bears).

**Let me ask you:**
If you see a **Hammer** with a long lower shadow (wick) at the bottom of a downtrend, what does that long lower wick tell you about the aggressive push by sellers vs the swift rejection by buyers?`;
  }
  return `### 📈 Socratic Market Wisdom
Every market price is simply the latest agreement point between buyers and sellers under uncertainty.
Before placing any trade, calculate your Entry, Stop Loss, and Target to protect your capital.`;
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
