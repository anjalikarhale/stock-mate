// Server-side types for StockMate Classroom Activity System

export type UserRole = 'TEACHER' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  xp: number;
  level: number;
  createdAt?: string;
  passwordHash?: string;
  passwordSalt?: string;
}

export interface ActivityAttempt {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  classroomId: string;
  classroomName?: string;
  activityId: string;
  activityName: string;
  round1Score: number;
  round1Correct: number;
  round1TotalQuestions: number;
  round2Score: number;
  round2Correct: number;
  round2TotalQuestions: number;
  finalScore: number;
  totalCorrect: number;
  totalQuestions: number;
  accuracyPercentage: number;
  rank: number;
  xpEarned: number;
  achievements: string[];
  startTime: string;
  completionTime: string;
}

export interface StudentProfileData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  xp: number;
  level: number;
  createdAt: string;
  completedActivitiesCount: number;
  totalScore: number;
  averageAccuracy: number;
  attempts: ActivityAttempt[];
  achievements: string[];
}

export interface Classroom {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  teacherName: string;
  department?: string;
  year?: string;
  batch?: string;
  createdAt: string;
  studentCount: number;
}

export interface ClassroomMember {
  id: string;
  classroomId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  role: UserRole;
  joinedAt: string;
  isOnline?: boolean;
}

export type ActivityType =
  | 'MARKET_DECISION'
  | 'STOCK_ANALYSIS'
  | 'TECHNICAL_ANALYSIS'
  | 'FUNDAMENTAL_ANALYSIS'
  | 'RISK_MANAGEMENT'
  | 'PORTFOLIO_CHALLENGE';

export type ActivityStatus = 'DRAFT' | 'WAITING' | 'LIVE' | 'PAUSED' | 'COMPLETED';

export interface ActivityRound {
  id: string;
  activityId: string;
  roundNumber: number;
  title: string;
  scenarioTitle: string;
  scenarioDescription: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCondition: string;
  durationSeconds: number;
  candles: {
    time: string;
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
  optimalAction: 'BUY' | 'SELL' | 'HOLD';
  optimalRationale: string;
}

export interface ClassroomActivity {
  id: string;
  classroomId: string;
  name: string;
  description: string;
  concept: string;
  activityType: ActivityType;
  symbol: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMinutes: number;
  maxScore: number;
  xpReward: number;
  totalRounds: number;
  status: ActivityStatus;
  currentRoundNumber: number; // 1 to totalRounds
  startTime?: number; // epoch ms
  endTime?: number; // epoch ms
  roundStartTime?: number; // epoch ms
  roundEndTime?: number; // epoch ms
  pausedRemainingSeconds?: number;
  createdAt: string;
}

export interface StudentQuizAnswer {
  id: string;
  activityId: string;
  roundNumber: 1 | 2;
  questionNumber: number;
  questionId: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  selectedOption: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  score: number; // 100 or 0
  submittedAt: string;
  submittedTimestamp: number;
}

export interface ActivityParticipant {
  id: string;
  activityId: string;
  classroomId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string;
  status: 'JOINED' | 'ACTIVE' | 'SUBMITTED' | 'COMPLETED';
  currentRound: number;
  totalScore: number;
  decisionScore: number;
  riskScore: number;
  analysisScore: number;
  timingScore: number;
  participationScore: number;
  roundsCompleted: number;
  accuracyPercent: number;
  riskPercent: number;
  round1Correct?: number;
  round1Score?: number;
  round2Correct?: number;
  round2Score?: number;
  totalCorrect?: number;
  totalQuestionsAnswered?: number;
  joinedAt: string;
  completedAt?: string;
}

export interface ActivitySubmission {
  id: string;
  activityId: string;
  roundId: string;
  roundNumber: number;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  decision: 'BUY' | 'SELL' | 'HOLD';
  quantity: number;
  stopLoss: number;
  target: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  reasoning: string;
  submittedAt: string;
  submittedTimestamp: number;
  decisionScore: number;
  riskScore: number;
  analysisScore: number;
  timingScore: number;
  participationScore: number;
  totalScore: number;
  feedback: string;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  studentEmail?: string;
  totalScore: number;
  roundsCompleted: number;
  accuracyPercent: number;
  riskPercent: number;
  xpEarned: number;
  status: 'JOINED' | 'ACTIVE' | 'SUBMITTED' | 'COMPLETED';
  round1Correct?: number;
  round1Score?: number;
  round2Correct?: number;
  round2Score?: number;
  totalCorrect?: number;
  totalQuestionsAnswered?: number;
  lastActiveTime?: string;
}

export interface PersistentPosition {
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  updatedAt: string;
}

export interface PersistentOrder {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  action: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP_LOSS';
  quantity: number;
  price: number;
  triggerPrice?: number;
  stopLossPrice?: number;
  status: 'EXECUTED' | 'PENDING' | 'CANCELLED' | 'REJECTED';
  executionPrice?: number;
  simulatedFee: number;
  totalAmount: number;
  timestamp: string;
  rationale?: string;
  emotionalState?: string;
}

export interface PersistentTransaction {
  id: string;
  orderId: string;
  userId: string;
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  side: 'BUY' | 'SELL';
  quantity: number;
  executionPrice: number;
  totalAmount: number;
  simulatedFee: number;
  realizedPnL?: number;
  timestamp: string;
}

export interface StudentPortfolioState {
  userId: string;
  virtualCash: number;
  realizedPnL: number;
  positions: PersistentPosition[];
  orders: PersistentOrder[];
  transactions: PersistentTransaction[];
  watchlist: string[];
  journal: {
    id: string;
    orderId?: string;
    timestamp: string;
    symbol: string;
    action: 'BUY' | 'SELL';
    price: number;
    quantity: number;
    emotionalState: string;
    strategy: string;
    reason: string;
    lessonLearned?: string;
    pnl?: number;
  }[];
  lastUpdated: string;
}

export interface StudentCourseProgressState {
  userId: string;
  completedLessons: string[];
  lessonScores: Record<string, number>;
  awardedXpLessons: string[];
  lastUpdated: string;
}

