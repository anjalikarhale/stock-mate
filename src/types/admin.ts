export interface ModuleProgressBreakdown {
  completed: number;
  total: number;
  percent: number;
}

export interface UserClassroomMembership {
  id: string;
  name: string;
  code: string;
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
  module1Progress: ModuleProgressBreakdown;
  module2Progress: ModuleProgressBreakdown;
  module3Progress: ModuleProgressBreakdown;
  topicScores: Record<string, number>;
  virtualCash: number;
  totalHoldingsValue: number;
  netWorth: number;
  totalTrades: number;
  realizedPnL: number;
  winRate: number;
  positionsCount: number;
  classrooms: UserClassroomMembership[];
  attemptsCount: number;
  avgAttemptScore: number;
}

export interface AdminAuthResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
    xp: number;
    level: number;
  };
  token?: string;
  error?: string;
}
