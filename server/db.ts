// Server-side persistent database for StockMate Classroom system
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  UserRole,
  Classroom,
  ClassroomMember,
  ClassroomActivity,
  ActivityRound,
  ActivityParticipant,
  ActivitySubmission,
  StudentQuizAnswer,
  LeaderboardEntry,
  ActivityAttempt,
  StudentProfileData,
  PersistentPosition,
  PersistentOrder,
  PersistentOptionPosition,
  PersistentOptionOrder,
  PersistentTransaction,
  StudentPortfolioState,
  StudentCourseProgressState,
  CompanyWorksheetDraft,
  StudentGameScoreEntry,
  StudentGameScoresState,
} from './types.ts';
import { generate5RoundsForStock, SUPPORTED_STOCKS } from './marketService.ts';
import { getMarketQuote } from './marketFeed.ts';
import { getRegisteredInstrument } from './instrumentRegistry.ts';
import { getInstrumentQuote, resolveServerOptionContractQuote } from './growwService.ts';

const DB_FILE = path.join(process.cwd(), 'data', 'classroom_db.json');

export interface DatabaseSchema {
  users: User[];
  classrooms: Classroom[];
  members: ClassroomMember[];
  activities: ClassroomActivity[];
  rounds: ActivityRound[];
  participants: ActivityParticipant[];
  submissions: ActivitySubmission[];
  quizAnswers: StudentQuizAnswer[];
  attempts: ActivityAttempt[];
  sessions?: Record<string, { userId: string; createdAt: string; expiresAt: number }>;
  portfolios?: Record<string, StudentPortfolioState>;
  courseProgress?: Record<string, StudentCourseProgressState>;
  gameScores?: Record<string, StudentGameScoresState>;
}

// In-memory working cache
let db: DatabaseSchema = {
  users: [],
  classrooms: [],
  members: [],
  activities: [],
  rounds: [],
  participants: [],
  submissions: [],
  quizAnswers: [],
  attempts: [],
  sessions: {},
  portfolios: {},
  courseProgress: {},
  gameScores: {},
};

// --------------------------------------------------------------------------
// Cryptographic Password Hashing Helpers
// --------------------------------------------------------------------------
export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

// Initial test seed: ONLY ONE teacher test account (no demo students)
function createDefaultSeed(): DatabaseSchema {
  const teacherSalt = generateSalt();
  const teacherHash = hashPassword('teacher123', teacherSalt);

  const teacher: User = {
    id: 'user_prof_sharma',
    name: 'Prof. A. Sharma',
    email: 'sharma@stockmate.edu',
    role: 'TEACHER',
    avatar: '👨‍🏫',
    xp: 3500,
    level: 15,
    passwordSalt: teacherSalt,
    passwordHash: teacherHash,
  };

  const demoClassroom: Classroom = {
    id: 'classroom_demo_lab',
    name: 'StockMate Economics & Finance Lab',
    code: 'SM2026',
    teacherId: teacher.id,
    teacherName: teacher.name,
    department: 'Finance & Economics',
    year: '2026',
    batch: 'Batch A',
    createdAt: new Date().toISOString(),
    studentCount: 0,
  };

  const members: ClassroomMember[] = [
    {
      id: `mem_teacher_${teacher.id}`,
      classroomId: demoClassroom.id,
      userId: teacher.id,
      userName: teacher.name,
      userEmail: teacher.email,
      userAvatar: teacher.avatar,
      role: 'TEACHER',
      joinedAt: new Date().toISOString(),
    },
  ];

  const activityId = 'activity_market_challenge_1';
  const rounds = generate5RoundsForStock(activityId, 'RELIANCE').slice(0, 2);
  rounds[0].title = 'Round 1: Market Basics';
  rounds[0].scenarioTitle = 'Market Fundamentals & Concepts';
  rounds[0].durationSeconds = 300; // 5 minutes

  if (rounds[1]) {
    rounds[1].title = 'Round 2: Charts & Trading Basics';
    rounds[1].scenarioTitle = 'Visual Price Action & Candlestick Analysis';
    rounds[1].durationSeconds = 300; // 5 minutes
  }

  const defaultActivity: ClassroomActivity = {
    id: activityId,
    classroomId: demoClassroom.id,
    name: 'StockMate Market Challenge',
    description: '2-round Kahoot-style classroom quiz competition covering Market Basics and Charts/Trading Basics.',
    concept: 'Market Fundamentals & Technical Charts',
    activityType: 'MARKET_DECISION',
    symbol: 'NIFTY50',
    difficulty: 'Beginner',
    durationMinutes: 10,
    maxScore: 2000,
    xpReward: 500,
    totalRounds: 2,
    status: 'WAITING',
    currentRoundNumber: 1,
    createdAt: new Date().toISOString(),
  };

  return {
    users: [teacher],
    classrooms: [demoClassroom],
    members,
    activities: [defaultActivity],
    rounds,
    participants: [],
    submissions: [],
    quizAnswers: [],
    attempts: [],
    sessions: {},
    portfolios: {},
    courseProgress: {},
    gameScores: {},
  };
}

export function initDatabase() {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(data);

      // Non-destructive schema migration: preserve all existing collections and initialize new maps
      db.users = Array.isArray(db.users) ? db.users : [];
      db.classrooms = Array.isArray(db.classrooms) ? db.classrooms : [];
      db.members = Array.isArray(db.members) ? db.members : [];
      db.activities = Array.isArray(db.activities) ? db.activities : [];
      db.rounds = Array.isArray(db.rounds) ? db.rounds : [];
      db.participants = Array.isArray(db.participants) ? db.participants : [];
      db.submissions = Array.isArray(db.submissions) ? db.submissions : [];
      db.quizAnswers = Array.isArray(db.quizAnswers) ? db.quizAnswers : [];
      db.attempts = Array.isArray(db.attempts) ? db.attempts : [];
      db.sessions = db.sessions || {};
      db.portfolios = db.portfolios || {};
      db.courseProgress = db.courseProgress || {};
      db.gameScores = db.gameScores || {};

      // Sanitize: Purge legacy hardcoded fake demo students ONLY
      const fakeStudentIds = new Set(['student_anjali', 'student_rahul', 'student_priya', 'student_vikram']);
      db.users = db.users.filter(u => !fakeStudentIds.has(u.id));
      db.members = db.members.filter(m => !fakeStudentIds.has(m.userId));
      db.participants = db.participants.filter(p => !fakeStudentIds.has(p.studentId));
      db.submissions = db.submissions.filter(s => !fakeStudentIds.has(s.studentId));
      db.quizAnswers = db.quizAnswers.filter(a => !fakeStudentIds.has(a.studentId));

      // Normalize emails consistently (lowercase + trim) and deduplicate without losing real password hashes
      const seenEmails = new Map<string, User>();
      for (const u of db.users) {
        u.email = (u.email || '').trim().toLowerCase();
        if (!u.email) continue;
        const existing = seenEmails.get(u.email);
        if (!existing) {
          seenEmails.set(u.email, u);
        } else if (!existing.passwordHash && u.passwordHash) {
          seenEmails.set(u.email, u);
        }
      }
      db.users = Array.from(seenEmails.values());

      // Recalculate student counts for all classrooms
      for (const classroom of db.classrooms) {
        classroom.studentCount = db.members.filter(
          m => m.classroomId === classroom.id && m.role === 'STUDENT'
        ).length;
      }

      // Ensure default demo teacher exists WITHOUT overwriting any existing user's password hash
      let demoTeacher = db.users.find(u => u.id === 'user_prof_sharma');
      if (!demoTeacher && !db.users.some(u => u.email === 'sharma@stockmate.edu')) {
        const teacherSalt = generateSalt();
        const teacherHash = hashPassword('teacher123', teacherSalt);
        demoTeacher = {
          id: 'user_prof_sharma',
          name: 'Prof. A. Sharma',
          email: 'sharma@stockmate.edu',
          role: 'TEACHER',
          avatar: '👨‍🏫',
          xp: 3500,
          level: 15,
          passwordSalt: teacherSalt,
          passwordHash: teacherHash,
        };
        db.users.push(demoTeacher);
      } else if (demoTeacher && (!demoTeacher.passwordHash || !demoTeacher.passwordSalt)) {
        demoTeacher.passwordSalt = generateSalt();
        demoTeacher.passwordHash = hashPassword('teacher123', demoTeacher.passwordSalt);
      }

      // Migrate portfolios safely so optionPositions & optionOrders arrays always exist
      for (const userId of Object.keys(db.portfolios)) {
        const p = db.portfolios[userId];
        if (p) {
          p.positions = Array.isArray(p.positions) ? p.positions : [];
          p.orders = Array.isArray(p.orders) ? p.orders : [];
          p.optionPositions = Array.isArray(p.optionPositions) ? p.optionPositions : [];
          p.optionOrders = Array.isArray(p.optionOrders) ? p.optionOrders : [];
          p.transactions = Array.isArray(p.transactions) ? p.transactions : [];
          p.watchlist = Array.isArray(p.watchlist) ? p.watchlist : ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'];
          p.journal = Array.isArray(p.journal) ? p.journal : [];
          p.marginBlocked = typeof p.marginBlocked === 'number' ? p.marginBlocked : 0;
        }
      }

      // Migrate courseProgress safely
      for (const userId of Object.keys(db.courseProgress)) {
        const cp = db.courseProgress[userId];
        if (cp) {
          cp.completedLessons = Array.isArray(cp.completedLessons) ? cp.completedLessons : [];
          cp.completedModules = Array.isArray(cp.completedModules) ? cp.completedModules : [];
          cp.completedExercises = Array.isArray(cp.completedExercises) ? cp.completedExercises : [];
          cp.moduleQuizScores = cp.moduleQuizScores || {};
          cp.lessonScores = cp.lessonScores || {};
          cp.awardedXpLessons = Array.isArray(cp.awardedXpLessons) ? cp.awardedXpLessons : [];
        }
      }

      // Ensure StockMate Market Challenge default activity exists
      let challengeActivity = db.activities.find(a => a.name === 'StockMate Market Challenge');
      if (!challengeActivity && db.classrooms.length > 0) {
        challengeActivity = {
          id: 'activity_market_challenge_1',
          classroomId: db.classrooms[0].id,
          name: 'StockMate Market Challenge',
          description: '2-round Kahoot-style classroom quiz competition covering Market Basics and Charts/Trading Basics.',
          concept: 'Market Fundamentals & Technical Charts',
          activityType: 'MARKET_DECISION',
          symbol: 'NIFTY50',
          difficulty: 'Beginner',
          durationMinutes: 10,
          maxScore: 2000,
          xpReward: 500,
          totalRounds: 2,
          status: 'WAITING',
          currentRoundNumber: 1,
          createdAt: new Date().toISOString(),
        };
        db.activities.unshift(challengeActivity);
      }

      saveDatabaseSync();
    } else {
      db = createDefaultSeed();
      saveDatabaseSync();
    }
  } catch (err) {
    console.error('Failed to load database file:', err);
    // Back up corrupted file rather than silently overwriting user accounts
    try {
      if (fs.existsSync(DB_FILE)) {
        fs.copyFileSync(DB_FILE, `${DB_FILE}.corrupt.${Date.now()}.bak`);
      }
    } catch {}
    db = createDefaultSeed();
    saveDatabaseSync();
  }
}

// --------------------------------------------------------------------------
// Atomic Synchronous & Debounced Asynchronous Database Persistence
// --------------------------------------------------------------------------
let saveTimeout: NodeJS.Timeout | null = null;
let isWriting = false;
let writeQueued = false;

export function saveDatabaseSync(): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const content = JSON.stringify(db, null, 2);
    const tempFile = `${DB_FILE}.sync.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tempFile, content, 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to save database synchronously:', err);
  }
}

// Flush pending writes cleanly on process exit/restart signals
let shutdownHooksRegistered = false;
if (!shutdownHooksRegistered) {
  shutdownHooksRegistered = true;
  const flushOnShutdown = () => {
    if (saveTimeout) {
      saveDatabaseSync();
    }
  };
  process.on('beforeExit', flushOnShutdown);
  process.on('SIGINT', () => {
    saveDatabaseSync();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    saveDatabaseSync();
    process.exit(0);
  });
}

async function doSaveAsync(): Promise<void> {
  if (isWriting) {
    writeQueued = true;
    return;
  }
  isWriting = true;
  writeQueued = false;

  try {
    const dir = path.dirname(DB_FILE);
    await fs.promises.mkdir(dir, { recursive: true });
    const content = JSON.stringify(db, null, 2);
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    await fs.promises.writeFile(tempFile, content, 'utf-8');
    await fs.promises.rename(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to save database asynchronously:', err);
  } finally {
    isWriting = false;
    if (writeQueued) {
      doSaveAsync().catch(console.error);
    }
  }
}

export function saveDatabase() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    saveTimeout = null;
    doSaveAsync().catch(console.error);
  }, 80);
}

// --------------------------------------------------------------------------
// Authentication & User Management
// --------------------------------------------------------------------------
export function createSessionToken(userId: string): string {
  if (!db.sessions) db.sessions = {};
  const token = `tok_${crypto.randomBytes(24).toString('hex')}`;
  // 30 day expiration
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  db.sessions[token] = {
    userId,
    createdAt: new Date().toISOString(),
    expiresAt,
  };
  saveDatabaseSync();
  return token;
}

export function getUserByToken(token: string): User | null {
  if (!token || !db.sessions) return null;
  const session = db.sessions[token];
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    delete db.sessions[token];
    saveDatabaseSync();
    return null;
  }
  const user = getUserById(session.userId);
  if (!user) return null;

  const safe = { ...user };
  delete safe.passwordHash;
  delete safe.passwordSalt;
  return safe;
}

export function invalidateToken(token: string): void {
  if (token && db.sessions && db.sessions[token]) {
    delete db.sessions[token];
    saveDatabaseSync();
  }
}

export function getUserById(id: string): User | undefined {
  return db.users.find(u => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  const normalized = (email || '').trim().toLowerCase();
  if (!normalized) return undefined;
  return db.users.find(u => (u.email || '').trim().toLowerCase() === normalized);
}

export function registerUser(data: {
  name: string;
  email: string;
  password?: string;
  role: 'TEACHER' | 'STUDENT';
  avatar?: string;
}): { success: boolean; user?: User; token?: string; error?: string } {
  const cleanEmail = (data.email || '').trim().toLowerCase();
  if (!data.name || !data.name.trim()) {
    return { success: false, error: 'Full name is required' };
  }
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { success: false, error: 'A valid email address is required' };
  }
  if (!data.password || data.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long' };
  }

  const existing = getUserByEmail(cleanEmail);
  if (existing) {
    return { success: false, error: 'An account with this email already exists. Please log in.' };
  }

  const salt = generateSalt();
  const hash = hashPassword(data.password, salt);

  const newUser: User = {
    id: `${data.role === 'TEACHER' ? 'tch' : 'std'}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: data.name.trim(),
    email: cleanEmail,
    role: data.role,
    avatar: data.avatar || (data.role === 'TEACHER' ? '👨‍🏫' : '👨‍🎓'),
    xp: data.role === 'TEACHER' ? 3500 : 100,
    level: data.role === 'TEACHER' ? 15 : 1,
    createdAt: new Date().toISOString(),
    passwordSalt: salt,
    passwordHash: hash,
  };

  db.users.push(newUser);
  // Initialize clean portfolio, course progress, and game scores immediately for new student
  if (newUser.role === 'STUDENT') {
    getStudentPortfolio(newUser.id);
    getStudentCourseProgress(newUser.id);
    getStudentGameScores(newUser.id);
  }
  const token = createSessionToken(newUser.id);
  saveDatabaseSync();

  const safeUser = { ...newUser };
  delete safeUser.passwordHash;
  delete safeUser.passwordSalt;

  return { success: true, user: safeUser, token };
}

export function authenticateUser(
  email: string,
  password?: string,
  expectedRole?: 'TEACHER' | 'STUDENT'
): { success: boolean; user?: User; token?: string; error?: string } {
  const cleanEmail = (email || '').trim().toLowerCase();
  const user = getUserByEmail(cleanEmail);

  if (!user) {
    return { success: false, error: 'Invalid email or password. Please check your credentials or sign up first.' };
  }

  if (expectedRole && user.role !== expectedRole) {
    return {
      success: false,
      error: `This email is registered as a ${user.role.toLowerCase()} account. Please use the ${user.role.toLowerCase()} login form.`,
    };
  }

  if (!password || !password.trim()) {
    return { success: false, error: 'Password is required.' };
  }

  if (!user.passwordHash || !user.passwordSalt) {
    return { success: false, error: 'Account credentials could not be verified. Please contact your administrator.' };
  }

  const computedHash = hashPassword(password, user.passwordSalt);
  if (computedHash !== user.passwordHash) {
    return { success: false, error: 'Invalid email or password. Please check your credentials.' };
  }

  const safeUser = { ...user };
  delete safeUser.passwordHash;
  delete safeUser.passwordSalt;

  const token = createSessionToken(user.id);
  saveDatabaseSync();

  return { success: true, user: safeUser, token };
}

export function createOrUpdateUser(userData: Partial<User> & { id: string; name: string; role: UserRole }): User {
  const existingIndex = db.users.findIndex(u => u.id === userData.id);
  if (existingIndex >= 0) {
    const current = db.users[existingIndex];
    // Preserve passwordHash, passwordSalt, email, role, xp, level, and createdAt strictly!
    db.users[existingIndex] = {
      ...current,
      name: userData.name ? userData.name.trim() : current.name,
      avatar: userData.avatar || current.avatar,
    };
    saveDatabaseSync();
    const safe = { ...db.users[existingIndex] };
    delete safe.passwordHash;
    delete safe.passwordSalt;
    return safe;
  }
  const normalizedEmail = (userData.email || `${userData.name.toLowerCase().replace(/\s+/g, '_')}@stockmate.edu`)
    .trim()
    .toLowerCase();
  const byEmail = getUserByEmail(normalizedEmail);
  if (byEmail) {
    const safe = { ...byEmail };
    delete safe.passwordHash;
    delete safe.passwordSalt;
    return safe;
  }
  const newUser: User = {
    id: userData.id,
    name: userData.name.trim(),
    email: normalizedEmail,
    role: userData.role,
    avatar: userData.avatar || (userData.role === 'TEACHER' ? '👨‍🏫' : '👨‍🎓'),
    xp: userData.xp || 100,
    level: userData.level || 1,
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);
  saveDatabaseSync();
  return newUser;
}

export function getAllUsers(): User[] {
  return db.users.map(u => {
    const safe = { ...u };
    delete safe.passwordHash;
    delete safe.passwordSalt;
    return safe;
  });
}

// --------------------------------------------------------------------------
// Classroom Queries
// --------------------------------------------------------------------------
export function getClassroomById(id: string): Classroom | undefined {
  return db.classrooms.find(c => c.id === id);
}

export function getClassroomByCode(code: string): Classroom | undefined {
  return db.classrooms.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
}

export function createClassroom(data: {
  name: string;
  teacherId: string;
  teacherName: string;
  department?: string;
  year?: string;
  batch?: string;
}): Classroom {
  // Generate distinct short code like SM4821
  let code = `SM${Math.floor(1000 + Math.random() * 9000)}`;
  while (db.classrooms.some(c => c.code === code)) {
    code = `SM${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const newClassroom: Classroom = {
    id: `classroom_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: data.name.trim(),
    code,
    teacherId: data.teacherId,
    teacherName: data.teacherName,
    department: data.department?.trim() || undefined,
    year: data.year?.trim() || undefined,
    batch: data.batch?.trim() || undefined,
    createdAt: new Date().toISOString(),
    studentCount: 0,
  };

  db.classrooms.unshift(newClassroom);

  // Add teacher as member
  const teacherUser = getUserById(data.teacherId);
  db.members.push({
    id: `mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    classroomId: newClassroom.id,
    userId: data.teacherId,
    userName: data.teacherName,
    userEmail: teacherUser?.email || 'teacher@stockmate.edu',
    userAvatar: teacherUser?.avatar || '👨‍🏫',
    role: 'TEACHER',
    joinedAt: new Date().toISOString(),
  });

  // Automatically create the StockMate Market Challenge for this new classroom
  const challengeActivity: ClassroomActivity = {
    id: `activity_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    classroomId: newClassroom.id,
    name: 'StockMate Market Challenge',
    description: '2-round Kahoot-style classroom quiz competition covering Market Basics and Charts/Trading Basics.',
    concept: 'Market Fundamentals & Technical Charts',
    activityType: 'MARKET_DECISION',
    symbol: 'NIFTY50',
    difficulty: 'Beginner',
    durationMinutes: 10,
    maxScore: 2000,
    xpReward: 500,
    totalRounds: 2,
    status: 'WAITING',
    currentRoundNumber: 1,
    createdAt: new Date().toISOString(),
  };
  db.activities.unshift(challengeActivity);

  saveDatabase();
  return newClassroom;
}

export function getClassroomMembers(classroomId: string): ClassroomMember[] {
  return db.members.filter(m => m.classroomId === classroomId);
}

export function joinClassroom(classroomId: string, user: User): { success: boolean; message: string; classroom?: Classroom } {
  const classroom = getClassroomById(classroomId);
  if (!classroom) {
    return { success: false, message: 'Classroom not found' };
  }

  createOrUpdateUser(user);

  const existing = db.members.find(m => m.classroomId === classroomId && m.userId === user.id);
  if (existing) {
    return { success: true, message: 'Already a member', classroom };
  }

  const member: ClassroomMember = {
    id: `mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    classroomId,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userAvatar: user.avatar,
    role: user.role,
    joinedAt: new Date().toISOString(),
  };

  db.members.push(member);
  classroom.studentCount = db.members.filter(m => m.classroomId === classroomId && m.role === 'STUDENT').length;
  saveDatabase();

  return { success: true, message: 'Successfully joined classroom', classroom };
}

export function getUserClassrooms(userId: string): Classroom[] {
  const memberClassroomIds = db.members.filter(m => m.userId === userId).map(m => m.classroomId);
  return db.classrooms.filter(c => memberClassroomIds.includes(c.id) || c.teacherId === userId);
}

// --------------------------------------------------------------------------
// Activity Queries
// --------------------------------------------------------------------------
export function getActivityById(id: string): ClassroomActivity | undefined {
  return db.activities.find(a => a.id === id);
}

export function getClassroomActivities(classroomId: string): ClassroomActivity[] {
  return db.activities
    .filter(a => a.classroomId === classroomId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createActivity(data: {
  classroomId: string;
  name: string;
  description: string;
  concept: string;
  activityType: any;
  symbol: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMinutes: number;
  maxScore: number;
  xpReward: number;
}): ClassroomActivity {
  const activityId = `activity_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const rounds = generate5RoundsForStock(activityId, data.symbol || 'NIFTY50').slice(0, 2);
  rounds[0].title = 'Round 1: Market Basics';
  rounds[0].durationSeconds = 300;
  if (rounds[1]) {
    rounds[1].title = 'Round 2: Charts & Trading Basics';
    rounds[1].durationSeconds = 300;
  }

  const newActivity: ClassroomActivity = {
    id: activityId,
    classroomId: data.classroomId,
    name: data.name.trim() || 'StockMate Market Challenge',
    description: data.description.trim() || '2-round Kahoot-style classroom quiz competition covering Market Basics and Charts/Trading Basics.',
    concept: data.concept || 'Market Fundamentals & Technical Charts',
    activityType: data.activityType || 'MARKET_DECISION',
    symbol: (data.symbol || 'NIFTY50').toUpperCase(),
    difficulty: data.difficulty || 'Beginner',
    durationMinutes: data.durationMinutes || 10,
    maxScore: data.maxScore || 2000,
    xpReward: data.xpReward || 500,
    totalRounds: 2,
    status: 'WAITING',
    currentRoundNumber: 1,
    createdAt: new Date().toISOString(),
  };

  db.activities.unshift(newActivity);
  db.rounds.push(...rounds);
  saveDatabase();

  return newActivity;
}

export function updateActivityStatus(
  activityId: string,
  status: 'DRAFT' | 'WAITING' | 'LIVE' | 'PAUSED' | 'COMPLETED',
  updates?: Partial<ClassroomActivity>
): ClassroomActivity | undefined {
  const activity = getActivityById(activityId);
  if (!activity) return undefined;

  activity.status = status;
  if (updates) {
    Object.assign(activity, updates);
  }
  saveDatabase();
  return activity;
}

export function getActivityRounds(activityId: string): ActivityRound[] {
  return db.rounds
    .filter(r => r.activityId === activityId)
    .sort((a, b) => a.roundNumber - b.roundNumber);
}

export function getActivityRound(activityId: string, roundNumber: number): ActivityRound | undefined {
  return db.rounds.find(r => r.activityId === activityId && r.roundNumber === roundNumber);
}

// --------------------------------------------------------------------------
// Participants
// --------------------------------------------------------------------------
export function getOrCreateParticipant(activityId: string, classroomId: string, user: User): ActivityParticipant {
  let participant = db.participants.find(p => p.activityId === activityId && p.studentId === user.id);
  if (!participant) {
    participant = {
      id: `part_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      activityId,
      classroomId,
      studentId: user.id,
      studentName: user.name,
      studentEmail: user.email,
      studentAvatar: user.avatar,
      status: 'JOINED',
      currentRound: 1,
      totalScore: 0,
      decisionScore: 0,
      riskScore: 0,
      analysisScore: 0,
      timingScore: 0,
      participationScore: 0,
      roundsCompleted: 0,
      accuracyPercent: 0,
      riskPercent: 0,
      round1Correct: 0,
      round1Score: 0,
      round2Correct: 0,
      round2Score: 0,
      totalCorrect: 0,
      totalQuestionsAnswered: 0,
      joinedAt: new Date().toISOString(),
    };
    db.participants.push(participant);
    saveDatabase();
  }
  return participant;
}

export function getActivityParticipants(activityId: string): ActivityParticipant[] {
  return db.participants.filter(p => p.activityId === activityId);
}

// --------------------------------------------------------------------------
// StockMate Market Challenge Quiz Submissions & Scoring
// --------------------------------------------------------------------------
export function saveStudentQuizAnswer(answerData: Omit<StudentQuizAnswer, 'id'>): StudentQuizAnswer {
  if (!db.quizAnswers) {
    db.quizAnswers = [];
  }

  // Prevent duplicate submission for same activity, round, questionNumber, studentId
  const existingIndex = db.quizAnswers.findIndex(
    a =>
      a.activityId === answerData.activityId &&
      a.roundNumber === answerData.roundNumber &&
      a.questionNumber === answerData.questionNumber &&
      a.studentId === answerData.studentId
  );

  if (existingIndex >= 0) {
    return db.quizAnswers[existingIndex];
  }

  const newAnswer: StudentQuizAnswer = {
    id: `ans_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    ...answerData,
  };

  db.quizAnswers.push(newAnswer);

  // Update participant cumulative scores
  let participant = db.participants.find(
    p => p.activityId === answerData.activityId && p.studentId === answerData.studentId
  );

  if (!participant) {
    const user = getUserById(answerData.studentId) || {
      id: answerData.studentId,
      name: answerData.studentName,
      email: `${answerData.studentId}@stockmate.edu`,
      role: 'STUDENT' as const,
      avatar: answerData.studentAvatar || '👨‍🎓',
      xp: 100,
      level: 1,
    };
    const activity = getActivityById(answerData.activityId);
    participant = getOrCreateParticipant(answerData.activityId, activity?.classroomId || '', user);
  }

  if (participant) {
    const studentAnswers = db.quizAnswers.filter(
      a => a.activityId === answerData.activityId && a.studentId === answerData.studentId
    );

    const r1Answers = studentAnswers.filter(a => a.roundNumber === 1);
    const r2Answers = studentAnswers.filter(a => a.roundNumber === 2);

    const r1Correct = r1Answers.filter(a => a.isCorrect).length;
    const r2Correct = r2Answers.filter(a => a.isCorrect).length;
    const totalCorrect = r1Correct + r2Correct;

    // SCORING RULE: Correct = 100, Wrong = 0. NO SPEED BONUS.
    const round1Score = r1Correct * 100;
    const round2Score = r2Correct * 100;
    const totalScore = totalCorrect * 100; // max 2000 points (20 questions)

    participant.round1Correct = r1Correct;
    participant.round1Score = round1Score;
    participant.round2Correct = r2Correct;
    participant.round2Score = round2Score;
    participant.totalCorrect = totalCorrect;
    participant.totalScore = totalScore;
    participant.totalQuestionsAnswered = studentAnswers.length;
    participant.accuracyPercent = Math.round((totalCorrect / Math.max(1, studentAnswers.length)) * 100);
    participant.roundsCompleted = (r1Answers.length >= 10 ? 1 : 0) + (r2Answers.length >= 10 ? 1 : 0);
    participant.status = studentAnswers.length >= 20 ? 'COMPLETED' : 'SUBMITTED';

    if (participant.status === 'COMPLETED' && !participant.completedAt) {
      participant.completedAt = new Date().toISOString();
    }

    // Automatically persist student activity attempt in db.attempts
    const act = getActivityById(answerData.activityId);
    const cls = act ? getClassroomById(act.classroomId) : undefined;
    saveActivityAttempt({
      studentId: answerData.studentId,
      studentName: answerData.studentName,
      studentEmail: participant.studentEmail,
      classroomId: act?.classroomId || '',
      classroomName: cls?.name || 'Stock Market Basics',
      activityId: answerData.activityId,
      activityName: act?.name || 'StockMate Market Challenge',
      round1Score,
      round1Correct: r1Correct,
      round1TotalQuestions: 10,
      round2Score,
      round2Correct: r2Correct,
      round2TotalQuestions: 10,
      finalScore: totalScore,
      totalCorrect,
      totalQuestions: 20,
      accuracyPercentage: Math.round((totalCorrect / Math.max(1, studentAnswers.length)) * 100),
      rank: 1,
      xpEarned: Math.round(totalScore / 10),
      achievements: [
        ...(Math.round((totalCorrect / Math.max(1, studentAnswers.length)) * 100) >= 80 ? ['Accuracy Master'] : []),
        ...(round2Score >= 800 ? ['Chart Reader'] : []),
        ...(totalScore >= 1600 ? ['Market Guru'] : []),
      ],
      startTime: participant.joinedAt,
      completionTime: participant.completedAt || new Date().toISOString(),
    });
  }

  saveDatabase();
  return newAnswer;
}

export function getStudentQuizAnswers(activityId: string, studentId: string): StudentQuizAnswer[] {
  return (db.quizAnswers || []).filter(a => a.activityId === activityId && a.studentId === studentId);
}

export function getAllActivityQuizAnswers(activityId: string): StudentQuizAnswer[] {
  return (db.quizAnswers || []).filter(a => a.activityId === activityId);
}

// --------------------------------------------------------------------------
// Legacy / General Submissions (Price Action Simulator)
// --------------------------------------------------------------------------
export function createSubmission(submissionData: Omit<ActivitySubmission, 'id'>): ActivitySubmission {
  const newSubmission: ActivitySubmission = {
    id: `sub_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    ...submissionData,
  };

  db.submissions.push(newSubmission);

  // Update participant cumulative scores
  let participant = db.participants.find(
    p => p.activityId === submissionData.activityId && p.studentId === submissionData.studentId
  );

  if (!participant) {
    const user = getUserById(submissionData.studentId) || {
      id: submissionData.studentId,
      name: submissionData.studentName,
      email: `${submissionData.studentId}@stockmate.edu`,
      role: 'STUDENT' as const,
      avatar: '👨‍🎓',
      xp: 100,
      level: 1,
    };
    const activity = getActivityById(submissionData.activityId);
    participant = getOrCreateParticipant(submissionData.activityId, activity?.classroomId || '', user);
  }

  if (participant) {
    const studentSubs = db.submissions.filter(
      s => s.activityId === submissionData.activityId && s.studentId === submissionData.studentId
    );

    const roundsCompleted = studentSubs.length;
    const avgScore = Math.round(studentSubs.reduce((acc, s) => acc + s.totalScore, 0) / roundsCompleted);
    const avgDecision = Math.round(studentSubs.reduce((acc, s) => acc + s.decisionScore, 0) / roundsCompleted);
    const avgRisk = Math.round(studentSubs.reduce((acc, s) => acc + s.riskScore, 0) / roundsCompleted);
    const avgAnalysis = Math.round(studentSubs.reduce((acc, s) => acc + s.analysisScore, 0) / roundsCompleted);
    const avgTiming = Math.round(studentSubs.reduce((acc, s) => acc + s.timingScore, 0) / roundsCompleted);

    participant.status = roundsCompleted >= 2 ? 'COMPLETED' : 'SUBMITTED';
    participant.roundsCompleted = roundsCompleted;
    participant.totalScore = avgScore;
    participant.decisionScore = avgDecision;
    participant.riskScore = avgRisk;
    participant.analysisScore = avgAnalysis;
    participant.timingScore = avgTiming;
    participant.accuracyPercent = Math.round((avgDecision / 40) * 100);
    participant.riskPercent = Math.round((avgRisk / 25) * 100);

    if (participant.status === 'COMPLETED' && !participant.completedAt) {
      participant.completedAt = new Date().toISOString();
    }
  }

  saveDatabase();
  return newSubmission;
}

export function getStudentSubmissions(activityId: string, studentId: string): ActivitySubmission[] {
  return db.submissions.filter(s => s.activityId === activityId && s.studentId === studentId);
}

export function getAllActivitySubmissions(activityId: string): ActivitySubmission[] {
  return db.submissions.filter(s => s.activityId === activityId);
}

// --------------------------------------------------------------------------
// Unified Leaderboard Calculation (Real students only, server-calculated)
// --------------------------------------------------------------------------
export function getActivityLeaderboard(activityId: string): LeaderboardEntry[] {
  const participants = getActivityParticipants(activityId);
  const quizAnswers = getAllActivityQuizAnswers(activityId);
  const isQuizGame = quizAnswers.length > 0 || participants.some(p => (p.totalQuestionsAnswered || 0) > 0);

  // Calculate stats for each participant
  const list = participants.map(p => {
    if (isQuizGame) {
      const studentAnswers = quizAnswers.filter(a => a.studentId === p.studentId);
      const r1Answers = studentAnswers.filter(a => a.roundNumber === 1);
      const r2Answers = studentAnswers.filter(a => a.roundNumber === 2);
      const r1Correct = r1Answers.filter(a => a.isCorrect).length;
      const r2Correct = r2Answers.filter(a => a.isCorrect).length;
      const totalCorrect = r1Correct + r2Correct;
      const totalScore = totalCorrect * 100; // strictly 100 pts per correct answer!
      const totalQuestionsAnswered = studentAnswers.length;
      const accuracyPercent = Math.round((totalCorrect / Math.max(1, totalQuestionsAnswered)) * 100);

      return {
        studentId: p.studentId,
        studentName: p.studentName,
        studentAvatar: p.studentAvatar,
        studentEmail: p.studentEmail,
        totalScore,
        round1Correct: r1Correct,
        round1Score: r1Correct * 100,
        round2Correct: r2Correct,
        round2Score: r2Correct * 100,
        totalCorrect,
        totalQuestionsAnswered,
        roundsCompleted: (r1Answers.length >= 10 ? 1 : 0) + (r2Answers.length >= 10 ? 1 : 0),
        accuracyPercent,
        riskPercent: 0,
        xpEarned: Math.round(totalScore / 4),
        status: p.status,
      };
    } else {
      return {
        studentId: p.studentId,
        studentName: p.studentName,
        studentAvatar: p.studentAvatar,
        studentEmail: p.studentEmail,
        totalScore: p.totalScore,
        roundsCompleted: p.roundsCompleted,
        accuracyPercent: p.accuracyPercent,
        riskPercent: p.riskPercent,
        xpEarned: Math.round((p.totalScore / 100) * 200),
        status: p.status,
      };
    }
  });

  // Sort descending by totalScore, then by totalCorrect, then by studentName
  list.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    if ((b.totalCorrect || 0) !== (a.totalCorrect || 0)) {
      return (b.totalCorrect || 0) - (a.totalCorrect || 0);
    }
    return a.studentName.localeCompare(b.studentName);
  });

  return list.map((item, index) => ({
    rank: index + 1,
    ...item,
  }));
}

// --------------------------------------------------------------------------
// Student Activity Attempts & Persistent Results History
// --------------------------------------------------------------------------
export function saveActivityAttempt(attemptData: Omit<ActivityAttempt, 'id'>): ActivityAttempt {
  if (!db.attempts) {
    db.attempts = [];
  }

  // Find existing attempt for this student and activity (update or append)
  const existingIndex = db.attempts.findIndex(
    a => a.studentId === attemptData.studentId && a.activityId === attemptData.activityId
  );

  const attemptId = existingIndex >= 0 ? db.attempts[existingIndex].id : `att_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const newAttempt: ActivityAttempt = {
    id: attemptId,
    ...attemptData,
  };

  if (existingIndex >= 0) {
    db.attempts[existingIndex] = newAttempt;
  } else {
    db.attempts.unshift(newAttempt);
  }

  // Update user's cumulative XP and Level in db.users
  const user = db.users.find(u => u.id === attemptData.studentId);
  if (user) {
    user.xp = Math.max(user.xp || 0, 100) + (attemptData.xpEarned || 50);
    user.level = Math.max(1, Math.floor(user.xp / 300) + 1);
  }

  saveDatabase();
  return newAttempt;
}

export function getStudentAttempts(studentId: string): ActivityAttempt[] {
  if (!db.attempts) return [];
  return db.attempts
    .filter(a => a.studentId === studentId)
    .sort((a, b) => new Date(b.completionTime || b.startTime).getTime() - new Date(a.completionTime || a.startTime).getTime());
}

export function getStudentProfile(studentId: string): StudentProfileData | null {
  const user = getUserById(studentId);
  if (!user) return null;

  const attempts = getStudentAttempts(studentId);
  const completedActivitiesCount = attempts.length;
  const totalScore = attempts.reduce((acc, curr) => acc + (curr.finalScore || 0), 0);
  const averageAccuracy = attempts.length > 0
    ? Math.round(attempts.reduce((acc, curr) => acc + (curr.accuracyPercentage || 0), 0) / attempts.length)
    : 0;

  // Derive achievements earned across completed activities
  const achievementsSet = new Set<string>();
  if (attempts.length >= 1) achievementsSet.add('First Challenge');
  if (attempts.some(a => a.accuracyPercentage >= 80)) achievementsSet.add('Accuracy Master');
  if (attempts.some(a => a.round2Score >= 800)) achievementsSet.add('Chart Reader');
  if (attempts.some(a => a.rank === 1)) achievementsSet.add('Classroom Champion');
  if (attempts.some(a => a.finalScore >= 1600)) achievementsSet.add('Market Guru');
  attempts.forEach(a => {
    (a.achievements || []).forEach(ach => achievementsSet.add(ach));
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    xp: user.xp,
    level: user.level,
    createdAt: user.createdAt || new Date().toISOString(),
    completedActivitiesCount,
    totalScore,
    averageAccuracy,
    attempts,
    achievements: Array.from(achievementsSet),
  };
}

// --------------------------------------------------------------------------
// Student Portfolio, Orders, Watchlist & Trading Journal Persistence
// --------------------------------------------------------------------------
const INITIAL_VIRTUAL_CASH = 100000; // ₹1,00,000 starting paper capital
const SIMULATED_BROKERAGE_PCT = 0.0005; // 0.05% simulated STT + transaction fee

export function getStudentPortfolio(userId: string): StudentPortfolioState {
  if (!db.portfolios) {
    db.portfolios = {};
  }

  if (!db.portfolios[userId]) {
    db.portfolios[userId] = {
      userId,
      virtualCash: INITIAL_VIRTUAL_CASH,
      marginBlocked: 0,
      realizedPnL: 0,
      positions: [],
      orders: [],
      optionPositions: [],
      optionOrders: [],
      transactions: [],
      watchlist: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'],
      journal: [],
      lastUpdated: new Date().toISOString(),
    };
    saveDatabaseSync();
  } else {
    const p = db.portfolios[userId];
    p.positions = Array.isArray(p.positions) ? p.positions : [];
    p.orders = Array.isArray(p.orders) ? p.orders : [];
    p.optionPositions = Array.isArray(p.optionPositions) ? p.optionPositions : [];
    p.optionOrders = Array.isArray(p.optionOrders) ? p.optionOrders : [];
    p.transactions = Array.isArray(p.transactions) ? p.transactions : [];
    p.watchlist = Array.isArray(p.watchlist) ? p.watchlist : ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'];
    p.journal = Array.isArray(p.journal) ? p.journal : [];
    p.marginBlocked = typeof p.marginBlocked === 'number' ? p.marginBlocked : 0;
  }

  return db.portfolios[userId];
}

export async function executeOrderOnPortfolio(
  userId: string,
  orderRequest: {
    symbol: string;
    action: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT' | 'STOP_LOSS';
    quantity: number;
    price: number;
    triggerPrice?: number;
    stopLossPrice?: number;
    rationale?: string;
    emotionalState?: string;
  }
): Promise<{ success: boolean; order?: PersistentOrder; error?: string }> {
  const portfolio = getStudentPortfolio(userId);
  const cleanSym = (orderRequest.symbol || '').trim().toUpperCase();
  const regInst = getRegisteredInstrument(cleanSym);

  if (regInst && regInst.instrumentType === 'INDEX') {
    return {
      success: false,
      error: `${regInst.name} (${regInst.symbol}) is a market benchmark index, not a directly purchasable stock. To gain index exposure, trade an eligible Index ETF (${regInst.relatedEtfSymbol || 'NIFTYBEES'}) or switch to Options Paper Trading.`,
    };
  }

  if (!Number.isFinite(orderRequest.quantity) || orderRequest.quantity <= 0 || !Number.isInteger(orderRequest.quantity)) {
    return { success: false, error: 'Order quantity must be a positive whole number of shares.' };
  }

  const stock = SUPPORTED_STOCKS.find(s => s.symbol.toUpperCase() === cleanSym);
  const feedQuote = getMarketQuote(cleanSym);
  const serverQuote = await getInstrumentQuote(cleanSym);

  const serverMarketPrice =
    serverQuote?.lastPrice ??
    (feedQuote && feedQuote.status !== 'STALE' ? feedQuote.price : null) ??
    regInst?.referencePrice ??
    stock?.basePrice ??
    null;

  if (!serverMarketPrice || serverMarketPrice <= 0) {
    return {
      success: false,
      error: `Verified market quote unavailable for ${cleanSym}. Cannot execute simulated order.`,
    };
  }

  let executionPrice: number;
  if (orderRequest.type === 'MARKET') {
    // Always use verified server price for MARKET orders; never trust client-supplied price
    executionPrice = serverMarketPrice;
  } else {
    if (!Number.isFinite(orderRequest.price) || orderRequest.price <= 0) {
      return { success: false, error: 'Limit/Stop price must be greater than zero.' };
    }
    executionPrice = Math.round(orderRequest.price * 100) / 100;
  }

  const stockName = regInst?.name || stock?.name || feedQuote?.name || cleanSym;
  const exchange = regInst?.exchange || stock?.exchange || 'NSE';
  const orderAmount = Math.round(orderRequest.quantity * executionPrice * 100) / 100;
  const simulatedFee = Math.round(orderAmount * SIMULATED_BROKERAGE_PCT * 100) / 100;
  const totalDeduction = Math.round((orderAmount + simulatedFee) * 100) / 100;

  // Handle BUY Order
  if (orderRequest.action === 'BUY') {
    if (portfolio.virtualCash < totalDeduction) {
      return {
        success: false,
        error: `Insufficient virtual cash. Required: ₹${totalDeduction.toLocaleString('en-IN')}, Available: ₹${portfolio.virtualCash.toLocaleString('en-IN')}`,
      };
    }

    const isPending = orderRequest.type === 'LIMIT' && executionPrice < serverMarketPrice * 0.998;

    const orderId = `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newOrder: PersistentOrder = {
      id: orderId,
      userId,
      symbol: cleanSym,
      name: stockName,
      exchange,
      action: 'BUY',
      type: orderRequest.type,
      quantity: orderRequest.quantity,
      price: executionPrice,
      triggerPrice: orderRequest.triggerPrice,
      stopLossPrice: orderRequest.stopLossPrice,
      status: isPending ? 'PENDING' : 'EXECUTED',
      executionPrice: isPending ? undefined : executionPrice,
      simulatedFee,
      totalAmount: totalDeduction,
      timestamp: new Date().toISOString(),
      rationale: orderRequest.rationale,
      emotionalState: orderRequest.emotionalState || 'CALM',
    };

    portfolio.orders.unshift(newOrder);

    if (!isPending) {
      portfolio.virtualCash = Math.round((portfolio.virtualCash - totalDeduction) * 100) / 100;

      const existingPos = portfolio.positions.find(p => p.symbol === cleanSym);
      if (existingPos) {
        const newQty = existingPos.quantity + orderRequest.quantity;
        const totalInvested = (existingPos.quantity * existingPos.averageBuyPrice) + orderAmount;
        const newAvg = totalInvested / newQty;
        existingPos.quantity = newQty;
        existingPos.averageBuyPrice = Math.round(newAvg * 100) / 100;
        existingPos.investedValue = Math.round(newQty * newAvg * 100) / 100;
        existingPos.currentPrice = executionPrice;
        existingPos.currentValue = Math.round(newQty * executionPrice * 100) / 100;
        existingPos.unrealizedPnL = Math.round((existingPos.currentValue - existingPos.investedValue) * 100) / 100;
        existingPos.unrealizedPnLPercent =
          existingPos.investedValue > 0
            ? Math.round((existingPos.unrealizedPnL / existingPos.investedValue) * 10000) / 100
            : 0;
        existingPos.updatedAt = new Date().toISOString();
      } else {
        portfolio.positions.push({
          symbol: cleanSym,
          name: stockName,
          exchange,
          quantity: orderRequest.quantity,
          averageBuyPrice: executionPrice,
          currentPrice: executionPrice,
          investedValue: orderAmount,
          currentValue: orderAmount,
          unrealizedPnL: 0,
          unrealizedPnLPercent: 0,
          updatedAt: new Date().toISOString(),
        });
      }

      portfolio.transactions.unshift({
        id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        orderId: newOrder.id,
        userId,
        symbol: cleanSym,
        name: stockName,
        exchange,
        side: 'BUY',
        quantity: orderRequest.quantity,
        executionPrice,
        totalAmount: orderAmount,
        simulatedFee,
        timestamp: new Date().toISOString(),
      });

      portfolio.journal.unshift({
        id: `jnl_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        orderId: newOrder.id,
        timestamp: newOrder.timestamp,
        symbol: cleanSym,
        action: 'BUY',
        price: executionPrice,
        quantity: orderRequest.quantity,
        emotionalState: orderRequest.emotionalState || 'CALM',
        strategy: orderRequest.rationale || 'Technical / Fundamental setup',
        reason: orderRequest.rationale || 'Simulated Equity Buy Execution',
      });
    }

    portfolio.lastUpdated = new Date().toISOString();
    saveDatabaseSync();
    return { success: true, order: newOrder };
  } else {
    // Handle SELL Order
    const existingPos = portfolio.positions.find(p => p.symbol === cleanSym);
    if (!existingPos || existingPos.quantity < orderRequest.quantity) {
      return {
        success: false,
        error: `Insufficient holdings. You own ${existingPos?.quantity || 0} shares of ${cleanSym}. Cannot sell ${orderRequest.quantity}.`,
      };
    }

    const proceeds = Math.round((orderAmount - simulatedFee) * 100) / 100;
    const costBasis = orderRequest.quantity * existingPos.averageBuyPrice;
    const tradeRealizedPnL = Math.round((orderAmount - costBasis - simulatedFee) * 100) / 100;

    const orderId = `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newOrder: PersistentOrder = {
      id: orderId,
      userId,
      symbol: cleanSym,
      name: stockName,
      exchange,
      action: 'SELL',
      type: orderRequest.type,
      quantity: orderRequest.quantity,
      price: executionPrice,
      status: 'EXECUTED',
      executionPrice,
      simulatedFee,
      totalAmount: proceeds,
      timestamp: new Date().toISOString(),
      rationale: orderRequest.rationale,
      emotionalState: orderRequest.emotionalState || 'CALM',
    };

    portfolio.orders.unshift(newOrder);
    portfolio.virtualCash = Math.round((portfolio.virtualCash + proceeds) * 100) / 100;
    portfolio.realizedPnL = Math.round((portfolio.realizedPnL + tradeRealizedPnL) * 100) / 100;

    const remainingQty = existingPos.quantity - orderRequest.quantity;
    if (remainingQty <= 0) {
      portfolio.positions = portfolio.positions.filter(p => p.symbol !== cleanSym);
    } else {
      existingPos.quantity = remainingQty;
      existingPos.investedValue = Math.round(remainingQty * existingPos.averageBuyPrice * 100) / 100;
      existingPos.currentValue = Math.round(remainingQty * executionPrice * 100) / 100;
      existingPos.unrealizedPnL = Math.round((existingPos.currentValue - existingPos.investedValue) * 100) / 100;
      existingPos.unrealizedPnLPercent =
        existingPos.investedValue > 0
          ? Math.round((existingPos.unrealizedPnL / existingPos.investedValue) * 10000) / 100
          : 0;
      existingPos.updatedAt = new Date().toISOString();
    }

    portfolio.transactions.unshift({
      id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      orderId: newOrder.id,
      userId,
      symbol: cleanSym,
      name: stockName,
      exchange,
      side: 'SELL',
      quantity: orderRequest.quantity,
      executionPrice,
      totalAmount: proceeds,
      simulatedFee,
      realizedPnL: tradeRealizedPnL,
      timestamp: new Date().toISOString(),
    });

    portfolio.journal.unshift({
      id: `jnl_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      orderId: newOrder.id,
      timestamp: newOrder.timestamp,
      symbol: cleanSym,
      action: 'SELL',
      price: executionPrice,
      quantity: orderRequest.quantity,
      emotionalState: orderRequest.emotionalState || 'CALM',
      strategy: orderRequest.rationale || 'Profit Taking / Stop Loss Exit',
      reason: orderRequest.rationale || 'Target achieved or disciplined stop-loss execution',
      pnl: tradeRealizedPnL,
      lessonLearned:
        tradeRealizedPnL >= 0
          ? 'Disciplined exit captured net profit after estimated brokerage.'
          : 'Stop-loss exit limited further downside on remaining capital.',
    });

    portfolio.lastUpdated = new Date().toISOString();
    saveDatabaseSync();
    return { success: true, order: newOrder };
  }
}

// --------------------------------------------------------------------------
// Index Options Paper Trading Execution & Position Accounting (Section 9)
// --------------------------------------------------------------------------
function computeEstimatedOptionFee(premiumTurnover: number, action: 'BUY' | 'SELL'): number {
  // Realistic Indian F&O estimated cost structure: ₹20 flat brokerage + ~0.0625% STT on sell + GST/SEBI/Exchange (~0.05%)
  const brokerage = 20;
  const stt = action === 'SELL' ? premiumTurnover * 0.000625 : 0;
  const exchangeAndGst = brokerage * 0.18 + premiumTurnover * 0.0005;
  return Math.round((brokerage + stt + exchangeAndGst) * 100) / 100;
}

export async function executeOptionOrderOnPortfolio(
  userId: string,
  reqData: {
    underlying: string;
    expiry: string;
    strike: number;
    optionType: 'CE' | 'PE';
    action: 'BUY' | 'SELL';
    lots: number;
    rationale?: string;
  }
): Promise<{ success: boolean; order?: PersistentOptionOrder; portfolio?: StudentPortfolioState; error?: string }> {
  const portfolio = getStudentPortfolio(userId);
  portfolio.optionPositions = portfolio.optionPositions || [];
  portfolio.optionOrders = portfolio.optionOrders || [];

  const lots = Number(reqData.lots);
  if (!Number.isFinite(lots) || !Number.isInteger(lots) || lots <= 0 || lots > 50) {
    return { success: false, error: 'Lots must be a positive whole number between 1 and 50.' };
  }
  if (reqData.optionType !== 'CE' && reqData.optionType !== 'PE') {
    return { success: false, error: 'Option type must be CE (Call) or PE (Put).' };
  }
  if (reqData.action !== 'BUY' && reqData.action !== 'SELL') {
    return { success: false, error: 'Action must be BUY or SELL.' };
  }

  const verified = await resolveServerOptionContractQuote({
    underlying: reqData.underlying,
    expiry: reqData.expiry,
    strike: Number(reqData.strike),
    optionType: reqData.optionType,
  });

  if (!verified.found || !verified.premium || !verified.lotSize || !verified.contractSymbol || !verified.exchange) {
    return {
      success: false,
      error: verified.error || 'Unable to verify option contract quote on server.',
    };
  }

  const lotSize = verified.lotSize;
  const quantity = lots * lotSize;
  const executionPremium = verified.premium;
  const premiumTurnover = Math.round(executionPremium * quantity * 100) / 100;
  const estimatedFee = computeEstimatedOptionFee(premiumTurnover, reqData.action);
  const spotRef = verified.underlyingLtp || Number(reqData.strike);

  // Check if user already holds an opposite position on the exact same contract (square-off / partial close)
  const existingIdx = portfolio.optionPositions.findIndex(
    p =>
      p.underlying === reqData.underlying.toUpperCase() &&
      p.expiry === reqData.expiry &&
      Math.abs(p.strike - Number(reqData.strike)) < 0.01 &&
      p.optionType === reqData.optionType
  );

  if (existingIdx >= 0 && portfolio.optionPositions[existingIdx].side !== reqData.action) {
    const pos = portfolio.optionPositions[existingIdx];
    if (lots > pos.lots) {
      return {
        success: false,
        error: `You currently hold ${pos.lots} lot(s) (${pos.quantity} qty) ${pos.side} in ${pos.contractSymbol}. Close at most ${pos.lots} lot(s) first before reversing.`,
      };
    }

    const closeQty = lots * pos.lotSize;
    // Long option P/L: (Exit premium - Avg entry premium) * qty
    // Short option P/L: (Avg entry premium - Exit premium) * qty
    const grossPnL =
      pos.side === 'BUY'
        ? (executionPremium - pos.averageEntryPremium) * closeQty
        : (pos.averageEntryPremium - executionPremium) * closeQty;
    const netRealizedPnL = Math.round((grossPnL - estimatedFee) * 100) / 100;

    if (pos.side === 'BUY') {
      // Closing a long option: credit proceeds minus fee
      const proceeds = Math.max(0, Math.round((executionPremium * closeQty - estimatedFee) * 100) / 100);
      portfolio.virtualCash = Math.round((portfolio.virtualCash + proceeds) * 100) / 100;
    } else {
      // Closing a short option: release proportional blocked margin + gross P/L - exit fee
      const releasedMargin = Math.round((pos.marginBlocked * (lots / pos.lots)) * 100) / 100;
      portfolio.marginBlocked = Math.max(0, Math.round(((portfolio.marginBlocked || 0) - releasedMargin) * 100) / 100);
      portfolio.virtualCash = Math.max(
        0,
        Math.round((portfolio.virtualCash + releasedMargin + grossPnL - estimatedFee) * 100) / 100
      );
      pos.marginBlocked = Math.max(0, Math.round((pos.marginBlocked - releasedMargin) * 100) / 100);
    }

    portfolio.realizedPnL = Math.round((portfolio.realizedPnL + netRealizedPnL) * 100) / 100;

    const remLots = pos.lots - lots;
    if (remLots <= 0) {
      portfolio.optionPositions.splice(existingIdx, 1);
    } else {
      pos.lots = remLots;
      pos.quantity = remLots * pos.lotSize;
      pos.currentPremium = executionPremium;
      pos.premiumValue = Math.round(pos.quantity * executionPremium * 100) / 100;
      pos.unrealizedPnL =
        pos.side === 'BUY'
          ? Math.round((executionPremium - pos.averageEntryPremium) * pos.quantity * 100) / 100
          : Math.round((pos.averageEntryPremium - executionPremium) * pos.quantity * 100) / 100;
      pos.updatedAt = new Date().toISOString();
    }

    const exitOrder: PersistentOptionOrder = {
      id: `optord_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId,
      contractSymbol: verified.contractSymbol,
      underlying: reqData.underlying.toUpperCase(),
      exchange: verified.exchange,
      expiry: reqData.expiry,
      strike: Number(reqData.strike),
      optionType: reqData.optionType,
      action: reqData.action,
      isExit: true,
      lotSize,
      lots,
      quantity: closeQty,
      premium: executionPremium,
      executionPremium,
      contractTurnover: Math.round(spotRef * closeQty * 100) / 100,
      marginRequired: 0,
      estimatedFee,
      realizedPnL: netRealizedPnL,
      status: 'EXECUTED',
      marketDataTimestamp: verified.marketDataTimestamp || new Date().toISOString(),
      dataSource: verified.dataSource || 'Server Option Chain',
      timestamp: new Date().toISOString(),
      rationale: reqData.rationale || 'Squared off open index option position',
    };

    portfolio.optionOrders.unshift(exitOrder);
    portfolio.journal.unshift({
      id: `jnl_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      orderId: exitOrder.id,
      timestamp: exitOrder.timestamp,
      symbol: verified.contractSymbol,
      action: reqData.action,
      price: executionPremium,
      quantity: closeQty,
      emotionalState: 'CALM',
      strategy: 'Index Options Square-Off',
      reason: reqData.rationale || `Closed ${lots} lot(s) of ${verified.contractSymbol}`,
      pnl: netRealizedPnL,
      lessonLearned:
        netRealizedPnL >= 0
          ? 'Booked option P/L while accounting for lot multiplier and transaction fees.'
          : 'Option loss realized — review Theta decay, IV shift, and strike selection.',
    });

    portfolio.lastUpdated = new Date().toISOString();
    saveDatabaseSync();
    return { success: true, order: exitOrder, portfolio };
  }

  // Opening or adding to an option position:
  // Long Option (BUY): requires Premium * Quantity + Fee
  // Short Option (SELL): requires simulated SPAN+Exposure Margin (~2.5% of notional contract value, min ₹25,000/lot) + Fee
  const marginRequired =
    reqData.action === 'BUY'
      ? premiumTurnover
      : Math.round(Math.max(25000 * lots, spotRef * quantity * 0.025) * 100) / 100;
  const totalCashNeeded = Math.round((marginRequired + estimatedFee) * 100) / 100;

  if (portfolio.virtualCash < totalCashNeeded) {
    return {
      success: false,
      error:
        reqData.action === 'BUY'
          ? `Insufficient cash for option premium + fees. Required: ₹${totalCashNeeded.toLocaleString('en-IN')} (${lots} lot × ${lotSize} qty @ ₹${executionPremium}), Available: ₹${portfolio.virtualCash.toLocaleString('en-IN')}.`
          : `Insufficient cash for short-option margin + fees. Option writing requires ₹${totalCashNeeded.toLocaleString('en-IN')} simulated margin, Available: ₹${portfolio.virtualCash.toLocaleString('en-IN')}.`,
    };
  }

  portfolio.virtualCash = Math.round((portfolio.virtualCash - totalCashNeeded) * 100) / 100;
  if (reqData.action === 'SELL') {
    portfolio.marginBlocked = Math.round(((portfolio.marginBlocked || 0) + marginRequired) * 100) / 100;
  }

  if (existingIdx >= 0) {
    const pos = portfolio.optionPositions[existingIdx];
    const newLots = pos.lots + lots;
    const newQty = newLots * lotSize;
    const newAvg = (pos.averageEntryPremium * pos.quantity + executionPremium * quantity) / newQty;
    pos.lots = newLots;
    pos.quantity = newQty;
    pos.averageEntryPremium = Math.round(newAvg * 100) / 100;
    pos.currentPremium = executionPremium;
    pos.premiumValue = Math.round(newQty * executionPremium * 100) / 100;
    if (reqData.action === 'SELL') {
      pos.marginBlocked = Math.round((pos.marginBlocked + marginRequired) * 100) / 100;
    }
    pos.unrealizedPnL =
      pos.side === 'BUY'
        ? Math.round((executionPremium - pos.averageEntryPremium) * newQty * 100) / 100
        : Math.round((pos.averageEntryPremium - executionPremium) * newQty * 100) / 100;
    const denom = pos.side === 'BUY' ? pos.averageEntryPremium * newQty : pos.marginBlocked || 1;
    pos.unrealizedPnLPercent = denom > 0 ? Math.round((pos.unrealizedPnL / denom) * 10000) / 100 : 0;
    pos.marketDataTimestamp = verified.marketDataTimestamp || new Date().toISOString();
    pos.dataSource = verified.dataSource || 'Server Option Chain';
    pos.updatedAt = new Date().toISOString();
  } else {
    portfolio.optionPositions.unshift({
      id: `optpos_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      contractSymbol: verified.contractSymbol,
      underlying: reqData.underlying.toUpperCase(),
      exchange: verified.exchange,
      expiry: reqData.expiry,
      strike: Number(reqData.strike),
      optionType: reqData.optionType,
      side: reqData.action,
      lotSize,
      lots,
      quantity,
      averageEntryPremium: executionPremium,
      currentPremium: executionPremium,
      premiumValue: premiumTurnover,
      marginBlocked: reqData.action === 'SELL' ? marginRequired : 0,
      unrealizedPnL: 0,
      unrealizedPnLPercent: 0,
      marketDataTimestamp: verified.marketDataTimestamp || new Date().toISOString(),
      dataSource: verified.dataSource || 'Server Option Chain',
      updatedAt: new Date().toISOString(),
    });
  }

  const newOptOrder: PersistentOptionOrder = {
    id: `optord_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userId,
    contractSymbol: verified.contractSymbol,
    underlying: reqData.underlying.toUpperCase(),
    exchange: verified.exchange,
    expiry: reqData.expiry,
    strike: Number(reqData.strike),
    optionType: reqData.optionType,
    action: reqData.action,
    isExit: false,
    lotSize,
    lots,
    quantity,
    premium: executionPremium,
    executionPremium,
    contractTurnover: Math.round(spotRef * quantity * 100) / 100,
    marginRequired,
    estimatedFee,
    status: 'EXECUTED',
    marketDataTimestamp: verified.marketDataTimestamp || new Date().toISOString(),
    dataSource: verified.dataSource || 'Server Option Chain',
    timestamp: new Date().toISOString(),
    rationale: reqData.rationale || `Index Option ${reqData.action} (${lots} lot × ${lotSize})`,
  };

  portfolio.optionOrders.unshift(newOptOrder);
  portfolio.journal.unshift({
    id: `jnl_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    orderId: newOptOrder.id,
    timestamp: newOptOrder.timestamp,
    symbol: verified.contractSymbol,
    action: reqData.action,
    price: executionPremium,
    quantity,
    emotionalState: 'CALM',
    strategy: `Index Options (${reqData.optionType})`,
    reason: reqData.rationale || `${reqData.action} ${lots} lot(s) ${verified.contractSymbol} @ ₹${executionPremium}`,
  });

  portfolio.lastUpdated = new Date().toISOString();
  saveDatabaseSync();
  return { success: true, order: newOptOrder, portfolio };
}

export function cancelStudentOrder(userId: string, orderId: string): { success: boolean; error?: string } {
  const portfolio = getStudentPortfolio(userId);
  const order = portfolio.orders.find(o => o.id === orderId);
  if (!order) {
    return { success: false, error: 'Order not found' };
  }
  if (order.status !== 'PENDING') {
    return { success: false, error: `Cannot cancel order with status ${order.status}` };
  }

  order.status = 'CANCELLED';
  portfolio.lastUpdated = new Date().toISOString();
  saveDatabaseSync();
  return { success: true };
}

export function updateStudentWatchlist(userId: string, watchlist: string[]): string[] {
  const portfolio = getStudentPortfolio(userId);
  portfolio.watchlist = Array.from(new Set(watchlist));
  portfolio.lastUpdated = new Date().toISOString();
  saveDatabaseSync();
  return portfolio.watchlist;
}

// --------------------------------------------------------------------------
// Student 16-Module Course Progress & Worksheet Persistence
// --------------------------------------------------------------------------
export function getStudentCourseProgress(userId: string): StudentCourseProgressState {
  if (!db.courseProgress) {
    db.courseProgress = {};
  }
  if (!db.courseProgress[userId]) {
    db.courseProgress[userId] = {
      userId,
      completedLessons: [],
      completedModules: [],
      completedExercises: [],
      moduleQuizScores: {},
      lessonScores: {},
      awardedXpLessons: [],
      lastActiveModuleId: 'module-1',
      lastActiveLessonId: 'm1-lesson-1',
      streakDays: 1,
      lastStudyDate: new Date().toISOString().slice(0, 10),
      lastUpdated: new Date().toISOString(),
    };
    saveDatabaseSync();
  }
  return db.courseProgress[userId];
}

function updateStudyStreak(progress: StudentCourseProgressState): void {
  const today = new Date().toISOString().slice(0, 10);
  if (!progress.lastStudyDate) {
    progress.streakDays = 1;
    progress.lastStudyDate = today;
    return;
  }
  if (progress.lastStudyDate === today) {
    progress.streakDays = Math.max(1, progress.streakDays || 1);
    return;
  }
  const prevDate = new Date(`${progress.lastStudyDate}T00:00:00Z`).getTime();
  const currDate = new Date(`${today}T00:00:00Z`).getTime();
  const diffDays = Math.round((currDate - prevDate) / (24 * 60 * 60 * 1000));
  if (diffDays === 1) {
    progress.streakDays = (progress.streakDays || 1) + 1;
  } else {
    progress.streakDays = 1;
  }
  progress.lastStudyDate = today;
}

export function saveStudentCourseProgress(
  userId: string,
  lessonId: string,
  score: number,
  earnedXp: number,
  extra?: {
    moduleId?: string;
    exerciseId?: string;
    moduleCompleted?: boolean;
    moduleQuizScore?: number;
    lastActiveModuleId?: string;
    lastActiveLessonId?: string;
    worksheetDraft?: CompanyWorksheetDraft;
  }
): { progress: StudentCourseProgressState; xpAwarded: boolean; user?: User } {
  const progress = getStudentCourseProgress(userId);
  progress.completedModules = progress.completedModules || [];
  progress.completedExercises = progress.completedExercises || [];
  progress.moduleQuizScores = progress.moduleQuizScores || {};

  updateStudyStreak(progress);

  let xpAwarded = false;

  if (lessonId && lessonId !== '__meta_only__') {
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }
    progress.lessonScores[lessonId] = Math.max(progress.lessonScores[lessonId] || 0, score);

    if (!progress.awardedXpLessons.includes(lessonId) && earnedXp > 0) {
      progress.awardedXpLessons.push(lessonId);
      xpAwarded = true;
    }
  }

  if (extra?.exerciseId && !progress.completedExercises.includes(extra.exerciseId)) {
    progress.completedExercises.push(extra.exerciseId);
    const exRewardKey = `ex:${extra.exerciseId}`;
    if (!progress.awardedXpLessons.includes(exRewardKey)) {
      progress.awardedXpLessons.push(exRewardKey);
      xpAwarded = true;
    }
  }

  if (extra?.moduleId && typeof extra.moduleQuizScore === 'number') {
    progress.moduleQuizScores[extra.moduleId] = Math.max(
      progress.moduleQuizScores[extra.moduleId] || 0,
      extra.moduleQuizScore
    );
  }

  if (extra?.moduleId && extra?.moduleCompleted && !progress.completedModules.includes(extra.moduleId)) {
    progress.completedModules.push(extra.moduleId);
    const modKey = `mod:${extra.moduleId}`;
    if (!progress.awardedXpLessons.includes(modKey)) {
      progress.awardedXpLessons.push(modKey);
      xpAwarded = true;
    }
  }

  if (extra?.lastActiveModuleId) {
    progress.lastActiveModuleId = extra.lastActiveModuleId;
  }
  if (extra?.lastActiveLessonId) {
    progress.lastActiveLessonId = extra.lastActiveLessonId;
  }
  if (extra?.worksheetDraft) {
    progress.worksheetDraft = {
      ...extra.worksheetDraft,
      updatedAt: new Date().toISOString(),
    };
  }

  const user = db.users.find(u => u.id === userId);
  if (xpAwarded && user && earnedXp > 0) {
    user.xp = (user.xp || 100) + earnedXp;
    user.level = Math.max(1, Math.floor(user.xp / 300) + 1);
  }

  progress.lastUpdated = new Date().toISOString();
  saveDatabaseSync();

  const safeUser = user ? { ...user } : undefined;
  if (safeUser) {
    delete safeUser.passwordHash;
    delete safeUser.passwordSalt;
  }

  return { progress, xpAwarded, user: safeUser };
}

export function resetStudentCourseProgress(userId: string): StudentCourseProgressState {
  if (!db.courseProgress) db.courseProgress = {};
  db.courseProgress[userId] = {
    userId,
    completedLessons: [],
    completedModules: [],
    completedExercises: [],
    moduleQuizScores: {},
    lessonScores: {},
    awardedXpLessons: db.courseProgress[userId]?.awardedXpLessons || [],
    lastActiveModuleId: 'module-1',
    lastActiveLessonId: 'm1-lesson-1',
    streakDays: db.courseProgress[userId]?.streakDays || 1,
    lastStudyDate: db.courseProgress[userId]?.lastStudyDate || new Date().toISOString().slice(0, 10),
    worksheetDraft: db.courseProgress[userId]?.worksheetDraft,
    lastUpdated: new Date().toISOString(),
  };
  saveDatabaseSync();
  return db.courseProgress[userId];
}

// --------------------------------------------------------------------------
// Student Educational Stock-Market Game Scores Persistence (Section 6)
// --------------------------------------------------------------------------
export function getStudentGameScores(userId: string): StudentGameScoresState {
  if (!db.gameScores) {
    db.gameScores = {};
  }
  if (!db.gameScores[userId]) {
    db.gameScores[userId] = {
      userId,
      games: {},
      totalGamesCompleted: 0,
      lastUpdated: new Date().toISOString(),
    };
    saveDatabaseSync();
  }
  return db.gameScores[userId];
}

export function saveStudentGameScore(
  userId: string,
  payload: {
    gameId: string;
    gameTitle: string;
    moduleId: string;
    score: number;
    maxPossibleScore: number;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    completed: boolean;
    xpReward?: number;
  }
): { gameScores: StudentGameScoresState; xpAwarded: number; user?: User } {
  const state = getStudentGameScores(userId);
  const prev = state.games[payload.gameId];
  const accuracy =
    payload.maxPossibleScore > 0
      ? Math.min(100, Math.round((payload.score / payload.maxPossibleScore) * 100))
      : 0;

  const prevDiffs = prev?.completedDifficulties || [];
  const isNewDifficultyCompletion = payload.completed && !prevDiffs.includes(payload.difficulty);
  const updatedDiffs = isNewDifficultyCompletion ? [...prevDiffs, payload.difficulty] : prevDiffs;

  const entry: StudentGameScoreEntry = {
    gameId: payload.gameId,
    gameTitle: payload.gameTitle,
    moduleId: payload.moduleId,
    bestScore: Math.max(prev?.bestScore || 0, payload.score),
    lastScore: payload.score,
    maxPossibleScore: payload.maxPossibleScore,
    accuracyPercent: Math.max(prev?.accuracyPercent || 0, accuracy),
    attempts: (prev?.attempts || 0) + 1,
    completedDifficulties: updatedDiffs,
    lastDifficulty: payload.difficulty,
    completed: Boolean(prev?.completed || payload.completed),
    lastPlayedAt: new Date().toISOString(),
  };

  state.games[payload.gameId] = entry;
  state.totalGamesCompleted = Object.values(state.games).filter(g => g.completed).length;
  state.lastUpdated = new Date().toISOString();

  let xpAwarded = 0;
  const user = db.users.find(u => u.id === userId);
  if (isNewDifficultyCompletion && user) {
    xpAwarded = payload.xpReward || 75;
    user.xp = (user.xp || 100) + xpAwarded;
    user.level = Math.max(1, Math.floor(user.xp / 300) + 1);
  }

  saveDatabaseSync();

  const safeUser = user ? { ...user } : undefined;
  if (safeUser) {
    delete safeUser.passwordHash;
    delete safeUser.passwordSalt;
  }

  return { gameScores: state, xpAwarded, user: safeUser };
}

// --------------------------------------------------------------------------
// Admin Authentication & Platform-Wide Progress Aggregation
// --------------------------------------------------------------------------
export const ADMIN_CREDENTIALS = {
  id: 'user_admin_anjali',
  username: 'anjalikarhale26',
  email: 'anjalikarhale26@gmail.com',
  password: 'AnjaliAdmin@2026',
  name: 'Anjali Karhale (Admin)',
};

export function authenticateAdmin(
  identifier: string,
  password?: string
): { success: boolean; user?: User; token?: string; error?: string } {
  const cleanId = (identifier || '').trim().toLowerCase();
  const isAdminId =
    cleanId === ADMIN_CREDENTIALS.email.toLowerCase() ||
    cleanId === ADMIN_CREDENTIALS.username.toLowerCase() ||
    cleanId === 'anjali';

  if (!isAdminId) {
    return { success: false, error: 'Access restricted. Only the designated administrator may log in.' };
  }

  if (password !== ADMIN_CREDENTIALS.password) {
    return { success: false, error: 'Incorrect administrator password.' };
  }

  let admin = db.users.find(u => u.id === ADMIN_CREDENTIALS.id);
  if (!admin) {
    const salt = generateSalt();
    const hash = hashPassword(ADMIN_CREDENTIALS.password, salt);
    admin = {
      id: ADMIN_CREDENTIALS.id,
      name: ADMIN_CREDENTIALS.name,
      email: ADMIN_CREDENTIALS.email,
      role: 'ADMIN',
      avatar: '🛡️',
      xp: 99999,
      level: 99,
      createdAt: '2026-01-01T00:00:00.000Z',
      passwordSalt: salt,
      passwordHash: hash,
    };
    db.users.push(admin);
    saveDatabaseSync();
  } else {
    admin.role = 'ADMIN';
  }

  const token = createSessionToken(admin.id);
  const safeUser = { ...admin };
  delete safeUser.passwordHash;
  delete safeUser.passwordSalt;

  return { success: true, user: safeUser, token };
}

export interface UserDetailedProgress {
  id: string;
  name: string;
  email: string;
  role: 'TEACHER' | 'STUDENT' | 'ADMIN';
  avatar: string;
  level: number;
  xp: number;
  createdAt: string;
  lastActive: string;
  completedTopicsCount: number;
  totalTopicsCount: number;
  courseProgressPercent: number;
  completedTopicIds: string[];
  module1Progress: { completed: number; total: number; percent: number };
  module2Progress: { completed: number; total: number; percent: number };
  module3Progress: { completed: number; total: number; percent: number };
  topicScores: Record<string, number>;
  virtualCash: number;
  totalHoldingsValue: number;
  netWorth: number;
  totalTrades: number;
  realizedPnL: number;
  winRate: number;
  positionsCount: number;
  classrooms: { id: string; name: string; code: string }[];
  attemptsCount: number;
  avgAttemptScore: number;
}

export function getAllUsersProgress(): UserDetailedProgress[] {
  const TOTAL_MODULES = 16;
  const LEVEL1_TOTAL = 5;  // Modules 1-5 (Beginner)
  const LEVEL2_TOTAL = 9;  // Modules 6-14 (Intermediate)
  const LEVEL3_TOTAL = 2;  // Modules 15-16 (Advanced)

  const standardUsers = db.users.filter(u => u.role !== 'ADMIN');

  return standardUsers.map(user => {
    const progress = db.courseProgress?.[user.id] || {
      userId: user.id,
      completedLessons: [],
      completedModules: [],
      lessonScores: {},
      awardedXpLessons: [],
      lastUpdated: user.createdAt || new Date().toISOString(),
    };

    const completedModules = progress.completedModules || [];
    const completedTopicIds = completedModules.length > 0 ? completedModules : (progress.completedLessons || []);
    const completedModCount = completedModules.length;

    const lvl1Completed = completedModules.filter(id => /^module-[1-5]$/.test(id)).length;
    const lvl2Completed = completedModules.filter(id => /^module-(6|7|8|9|10|11|12|13|14)$/.test(id)).length;
    const lvl3Completed = completedModules.filter(id => /^module-(15|16)$/.test(id)).length;

    const portfolio = db.portfolios?.[user.id] || {
      userId: user.id,
      virtualCash: 100000,
      marginBlocked: 0,
      realizedPnL: 0,
      positions: [],
      orders: [],
      optionPositions: [],
      optionOrders: [],
      transactions: [],
      journal: [],
      watchlist: [],
      lastUpdated: user.createdAt || new Date().toISOString(),
    };

    const equityHoldingsValue = (portfolio.positions || []).reduce((acc, pos) => {
      return acc + (pos.quantity * (pos.currentPrice || pos.averageBuyPrice));
    }, 0);

    const optionNetValue = (portfolio.optionPositions || []).reduce((acc, opt) => {
      if (opt.side === 'BUY') {
        return acc + opt.quantity * opt.currentPremium;
      }
      return acc + opt.marginBlocked + opt.unrealizedPnL;
    }, 0);

    const totalHoldingsValue = equityHoldingsValue + optionNetValue;
    const netWorth = (portfolio.virtualCash || 0) + totalHoldingsValue;
    const totalTrades = (portfolio.transactions || []).length + (portfolio.optionOrders || []).length;
    const realizedPnL = portfolio.realizedPnL || 0;
    const winningTrades =
      (portfolio.transactions || []).filter(t => (t.realizedPnL || 0) > 0).length +
      (portfolio.optionOrders || []).filter(o => (o.realizedPnL || 0) > 0).length;
    const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;

    const enrolledMemberships = (db.members || []).filter(m => m.userId === user.id);
    const userClassrooms = enrolledMemberships.map(m => {
      const cls = db.classrooms.find(c => c.id === m.classroomId);
      return {
        id: m.classroomId,
        name: cls?.name || 'Classroom',
        code: cls?.code || 'N/A',
      };
    });

    const userAttempts = (db.attempts || []).filter(a => a.studentId === user.id);
    const avgScore = userAttempts.length > 0
      ? Math.round(userAttempts.reduce((acc, a) => acc + (a.accuracyPercentage || 0), 0) / userAttempts.length)
      : 0;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      level: user.level || 1,
      xp: user.xp || 0,
      createdAt: user.createdAt || '2026-01-01T00:00:00.000Z',
      lastActive: progress.lastUpdated || portfolio.lastUpdated || user.createdAt || new Date().toISOString(),
      completedTopicsCount: completedModCount,
      totalTopicsCount: TOTAL_MODULES,
      courseProgressPercent: Math.min(100, Math.round((completedModCount / TOTAL_MODULES) * 100)),
      completedTopicIds,
      module1Progress: {
        completed: Math.min(LEVEL1_TOTAL, lvl1Completed),
        total: LEVEL1_TOTAL,
        percent: Math.min(100, Math.round((lvl1Completed / LEVEL1_TOTAL) * 100)),
      },
      module2Progress: {
        completed: Math.min(LEVEL2_TOTAL, lvl2Completed),
        total: LEVEL2_TOTAL,
        percent: Math.min(100, Math.round((lvl2Completed / LEVEL2_TOTAL) * 100)),
      },
      module3Progress: {
        completed: Math.min(LEVEL3_TOTAL, lvl3Completed),
        total: LEVEL3_TOTAL,
        percent: Math.min(100, Math.round((lvl3Completed / LEVEL3_TOTAL) * 100)),
      },
      topicScores: progress.moduleQuizScores || progress.lessonScores || {},
      virtualCash: Math.round(portfolio.virtualCash || 0),
      totalHoldingsValue: Math.round(totalHoldingsValue),
      netWorth: Math.round(netWorth),
      totalTrades,
      realizedPnL: Math.round(realizedPnL * 100) / 100,
      winRate,
      positionsCount: (portfolio.positions || []).length + (portfolio.optionPositions || []).length,
      classrooms: userClassrooms,
      attemptsCount: userAttempts.length,
      avgAttemptScore: avgScore,
    };
  });
}



