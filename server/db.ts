// Server-side persistent database for StockMate Classroom system
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
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
  PersistentTransaction,
  StudentPortfolioState,
  StudentCourseProgressState,
} from './types.ts';
import { generate5RoundsForStock, SUPPORTED_STOCKS } from './marketService.ts';

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
};

// --------------------------------------------------------------------------
// Cryptographic Password Hashing Helpers
// --------------------------------------------------------------------------
export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
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

      // Ensure quizAnswers, attempts, sessions arrays exist
      db.quizAnswers = db.quizAnswers || [];
      db.attempts = db.attempts || [];
      db.sessions = db.sessions || {};

      // Sanitize: Purge legacy hardcoded fake demo students
      const fakeStudentIds = new Set(['student_anjali', 'student_rahul', 'student_priya', 'student_vikram']);
      db.users = (db.users || []).filter(u => !fakeStudentIds.has(u.id));
      db.members = (db.members || []).filter(m => !fakeStudentIds.has(m.userId));
      db.participants = (db.participants || []).filter(p => !fakeStudentIds.has(p.studentId));
      db.submissions = (db.submissions || []).filter(s => !fakeStudentIds.has(s.studentId));
      db.quizAnswers = (db.quizAnswers || []).filter(a => !fakeStudentIds.has(a.studentId));

      // Recalculate student counts for all classrooms
      for (const classroom of db.classrooms || []) {
        classroom.studentCount = (db.members || []).filter(
          m => m.classroomId === classroom.id && m.role === 'STUDENT'
        ).length;
      }

      // Ensure teacher exists with password hash
      let teacher = db.users.find(u => u.role === 'TEACHER');
      if (!teacher) {
        const teacherSalt = generateSalt();
        const teacherHash = hashPassword('teacher123', teacherSalt);
        teacher = {
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
        db.users.push(teacher);
      } else if (!teacher.passwordHash) {
        teacher.passwordSalt = generateSalt();
        teacher.passwordHash = hashPassword('teacher123', teacher.passwordSalt);
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

      saveDatabase();
    } else {
      db = createDefaultSeed();
      saveDatabase();
    }
  } catch (err) {
    console.error('Failed to load database file, creating seed:', err);
    db = createDefaultSeed();
  }
}

// --------------------------------------------------------------------------
// Asynchronous, Non-Blocking, Debounced & Atomic Database Persistence
// --------------------------------------------------------------------------
let saveTimeout: NodeJS.Timeout | null = null;
let isWriting = false;
let writeQueued = false;

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
    doSaveAsync().catch(console.error);
  }, 100);
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
  saveDatabase();
  return token;
}

export function getUserByToken(token: string): User | null {
  if (!token || !db.sessions) return null;
  const session = db.sessions[token];
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    delete db.sessions[token];
    saveDatabase();
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
    saveDatabase();
  }
}

export function getUserById(id: string): User | undefined {
  return db.users.find(u => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function registerUser(data: {
  name: string;
  email: string;
  password?: string;
  role: 'TEACHER' | 'STUDENT';
  avatar?: string;
}): { success: boolean; user?: User; token?: string; error?: string } {
  const cleanEmail = data.email.trim().toLowerCase();
  if (!data.name || !data.name.trim()) {
    return { success: false, error: 'Full name is required' };
  }
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Valid email address is required' };
  }

  const existing = getUserByEmail(cleanEmail);
  if (existing) {
    return { success: false, error: 'An account with this email already exists. Please log in.' };
  }

  const salt = generateSalt();
  const hash = data.password ? hashPassword(data.password, salt) : undefined;

  const newUser: User = {
    id: `${data.role === 'TEACHER' ? 'tch' : 'std'}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: data.name.trim(),
    email: cleanEmail,
    role: data.role,
    avatar: data.avatar || (data.role === 'TEACHER' ? '👨‍🏫' : '👨‍🎓'),
    xp: data.role === 'TEACHER' ? 3500 : 200,
    level: data.role === 'TEACHER' ? 15 : 1,
    createdAt: new Date().toISOString(),
    passwordSalt: salt,
    passwordHash: hash,
  };

  db.users.push(newUser);
  const token = createSessionToken(newUser.id);
  saveDatabase();

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
  const cleanEmail = email.trim().toLowerCase();
  const user = getUserByEmail(cleanEmail);

  if (!user) {
    return { success: false, error: 'No account found with this email address' };
  }

  if (expectedRole && user.role !== expectedRole) {
    return {
      success: false,
      error: `This account is registered as a ${user.role}. Please log in through the ${user.role} portal.`,
    };
  }

  // If user has a password set and password is provided, verify hash
  if (user.passwordHash && user.passwordSalt && password) {
    const isTeacherSeed = user.id === 'user_prof_sharma' && ['teacher123', 'teacherpassword', 'teacher', 'admin'].includes(password);
    const computedHash = hashPassword(password, user.passwordSalt);
    if (!isTeacherSeed && computedHash !== user.passwordHash) {
      return { success: false, error: 'Incorrect password. Please check your credentials.' };
    }
  }

  const safeUser = { ...user };
  delete safeUser.passwordHash;
  delete safeUser.passwordSalt;

  const token = createSessionToken(user.id);

  return { success: true, user: safeUser, token };
}

export function createOrUpdateUser(userData: Partial<User> & { id: string; name: string; role: 'TEACHER' | 'STUDENT' }): User {
  const existingIndex = db.users.findIndex(u => u.id === userData.id);
  if (existingIndex >= 0) {
    db.users[existingIndex] = { ...db.users[existingIndex], ...userData };
    saveDatabase();
    return db.users[existingIndex];
  }
  const newUser: User = {
    id: userData.id,
    name: userData.name,
    email: userData.email || `${userData.name.toLowerCase().replace(/\s+/g, '_')}@stockmate.edu`,
    role: userData.role,
    avatar: userData.avatar || (userData.role === 'TEACHER' ? '👨‍🏫' : '👨‍🎓'),
    xp: userData.xp || 100,
    level: userData.level || 1,
  };
  db.users.push(newUser);
  saveDatabase();
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
      realizedPnL: 0,
      positions: [],
      orders: [],
      transactions: [],
      watchlist: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'],
      journal: [],
      lastUpdated: new Date().toISOString(),
    };
    saveDatabase();
  }

  return db.portfolios[userId];
}

export function executeOrderOnPortfolio(
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
): { success: boolean; order?: PersistentOrder; error?: string } {
  const portfolio = getStudentPortfolio(userId);
  const stock = SUPPORTED_STOCKS.find(s => s.symbol === orderRequest.symbol);

  const stockName = stock?.name || orderRequest.symbol;
  const exchange = stock?.exchange || 'NSE';
  const executionPrice = orderRequest.type === 'MARKET' ? (stock?.basePrice || orderRequest.price) : orderRequest.price;
  const orderAmount = orderRequest.quantity * executionPrice;
  const simulatedFee = Math.round(orderAmount * SIMULATED_BROKERAGE_PCT * 100) / 100;
  const totalDeduction = orderAmount + simulatedFee;

  if (orderRequest.quantity <= 0) {
    return { success: false, error: 'Order quantity must be greater than zero.' };
  }

  // Handle BUY Order
  if (orderRequest.action === 'BUY') {
    if (portfolio.virtualCash < totalDeduction) {
      return {
        success: false,
        error: `Insufficient virtual cash. Required: ₹${totalDeduction.toLocaleString('en-IN')}, Available: ₹${portfolio.virtualCash.toLocaleString('en-IN')}`,
      };
    }

    // If LIMIT order and price is lower than market price, keep as PENDING
    const isPending = orderRequest.type === 'LIMIT' && executionPrice < (stock?.basePrice || orderRequest.price);

    const orderId = `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newOrder: PersistentOrder = {
      id: orderId,
      userId,
      symbol: orderRequest.symbol,
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
      // Deduct cash
      portfolio.virtualCash -= totalDeduction;

      // Update positions
      const existingPos = portfolio.positions.find(p => p.symbol === orderRequest.symbol);
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
        existingPos.unrealizedPnLPercent = Math.round((existingPos.unrealizedPnL / existingPos.investedValue) * 10000) / 100;
        existingPos.updatedAt = new Date().toISOString();
      } else {
        portfolio.positions.push({
          symbol: orderRequest.symbol,
          name: stockName,
          exchange,
          quantity: orderRequest.quantity,
          averageBuyPrice: executionPrice,
          currentPrice: executionPrice,
          investedValue: Math.round(orderAmount * 100) / 100,
          currentValue: Math.round(orderAmount * 100) / 100,
          unrealizedPnL: 0,
          unrealizedPnLPercent: 0,
          updatedAt: new Date().toISOString(),
        });
      }

      // Add transaction ledger entry
      portfolio.transactions.unshift({
        id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        orderId: newOrder.id,
        userId,
        symbol: orderRequest.symbol,
        name: stockName,
        exchange,
        side: 'BUY',
        quantity: orderRequest.quantity,
        executionPrice,
        totalAmount: orderAmount,
        simulatedFee,
        timestamp: new Date().toISOString(),
      });

      // Add to trading journal
      portfolio.journal.unshift({
        id: `jnl_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        orderId: newOrder.id,
        timestamp: newOrder.timestamp,
        symbol: orderRequest.symbol,
        action: 'BUY',
        price: executionPrice,
        quantity: orderRequest.quantity,
        emotionalState: orderRequest.emotionalState || 'CALM',
        strategy: orderRequest.rationale || 'Technical / Fundamental setup',
        reason: orderRequest.rationale || 'Support bounce or breakout setup',
      });
    }

    portfolio.lastUpdated = new Date().toISOString();
    saveDatabase();
    return { success: true, order: newOrder };
  } else {
    // Handle SELL Order
    const existingPos = portfolio.positions.find(p => p.symbol === orderRequest.symbol);
    if (!existingPos || existingPos.quantity < orderRequest.quantity) {
      return {
        success: false,
        error: `Insufficient holdings. You own ${existingPos?.quantity || 0} shares of ${orderRequest.symbol}. Cannot sell ${orderRequest.quantity}.`,
      };
    }

    const proceeds = orderAmount - simulatedFee;
    const costBasis = orderRequest.quantity * existingPos.averageBuyPrice;
    const tradeRealizedPnL = Math.round((orderAmount - costBasis) * 100) / 100;

    const orderId = `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newOrder: PersistentOrder = {
      id: orderId,
      userId,
      symbol: orderRequest.symbol,
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

    // Credit cash
    portfolio.virtualCash += proceeds;
    portfolio.realizedPnL += tradeRealizedPnL;

    // Adjust position
    const remainingQty = existingPos.quantity - orderRequest.quantity;
    if (remainingQty <= 0) {
      portfolio.positions = portfolio.positions.filter(p => p.symbol !== orderRequest.symbol);
    } else {
      existingPos.quantity = remainingQty;
      existingPos.investedValue = Math.round(remainingQty * existingPos.averageBuyPrice * 100) / 100;
      existingPos.currentValue = Math.round(remainingQty * executionPrice * 100) / 100;
      existingPos.unrealizedPnL = Math.round((existingPos.currentValue - existingPos.investedValue) * 100) / 100;
      existingPos.unrealizedPnLPercent = Math.round((existingPos.unrealizedPnL / existingPos.investedValue) * 10000) / 100;
      existingPos.updatedAt = new Date().toISOString();
    }

    // Ledger entry
    portfolio.transactions.unshift({
      id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      orderId: newOrder.id,
      userId,
      symbol: orderRequest.symbol,
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

    // Journal entry
    portfolio.journal.unshift({
      id: `jnl_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      orderId: newOrder.id,
      timestamp: newOrder.timestamp,
      symbol: orderRequest.symbol,
      action: 'SELL',
      price: executionPrice,
      quantity: orderRequest.quantity,
      emotionalState: orderRequest.emotionalState || 'CALM',
      strategy: orderRequest.rationale || 'Profit Taking / Stop Loss Exit',
      reason: orderRequest.rationale || 'Target achieved or disciplined stop-loss execution',
      pnl: tradeRealizedPnL,
      lessonLearned: tradeRealizedPnL >= 0 ? 'Disciplined profit taking booked real returns.' : 'Strict stop-loss execution protected remaining capital.',
    });

    portfolio.lastUpdated = new Date().toISOString();
    saveDatabase();
    return { success: true, order: newOrder };
  }
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
  saveDatabase();
  return { success: true };
}

export function updateStudentWatchlist(userId: string, watchlist: string[]): string[] {
  const portfolio = getStudentPortfolio(userId);
  portfolio.watchlist = Array.from(new Set(watchlist));
  portfolio.lastUpdated = new Date().toISOString();
  saveDatabase();
  return portfolio.watchlist;
}

export function getStudentCourseProgress(userId: string): StudentCourseProgressState {
  if (!db.courseProgress) {
    db.courseProgress = {};
  }
  if (!db.courseProgress[userId]) {
    db.courseProgress[userId] = {
      userId,
      completedLessons: [],
      lessonScores: {},
      awardedXpLessons: [],
      lastUpdated: new Date().toISOString(),
    };
    saveDatabase();
  }
  return db.courseProgress[userId];
}

export function saveStudentCourseProgress(
  userId: string,
  lessonId: string,
  score: number,
  earnedXp: number
): { progress: StudentCourseProgressState; xpAwarded: boolean } {
  const progress = getStudentCourseProgress(userId);
  const alreadyAwarded = progress.awardedXpLessons.includes(lessonId);

  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
  }
  progress.lessonScores[lessonId] = Math.max(progress.lessonScores[lessonId] || 0, score);

  let xpAwarded = false;
  if (!alreadyAwarded) {
    progress.awardedXpLessons.push(lessonId);
    xpAwarded = true;

    // Update user xp in db
    const user = db.users.find(u => u.id === userId);
    if (user) {
      user.xp = (user.xp || 0) + earnedXp;
      user.level = Math.max(1, Math.floor(user.xp / 300) + 1);
    }
  }

  progress.lastUpdated = new Date().toISOString();
  saveDatabase();
  return { progress, xpAwarded };
}


