// Classroom and Activity REST client
import {
  Classroom,
  ClassroomActivity,
  ClassroomMember,
  ClassroomResultsResponse,
  LeaderboardEntry,
  ActivityRound,
  ActivitySubmission,
  ClassroomUser,
  ActivityAttempt,
  StudentProfileData,
} from '../types/classroom';

const TOKEN_STORAGE_KEY = 'stockmate_auth_token_v1';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const classroomApi = {
  // Auth / Users
  getAuthToken,
  setAuthToken,

  async getUsers(): Promise<ClassroomUser[]> {
    const res = await fetch('/api/auth/users');
    return res.json();
  },

  async signup(data: {
    name: string;
    email: string;
    password?: string;
    role: 'TEACHER' | 'STUDENT';
    avatar?: string;
    inviteCode?: string;
    teacherInviteCode?: string;
  }): Promise<{ success: boolean; user?: ClassroomUser; token?: string; error?: string }> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.token) {
      setAuthToken(result.token);
    }
    return result;
  },

  async login(data: {
    email: string;
    password?: string;
    role?: 'TEACHER' | 'STUDENT';
  }): Promise<{ success: boolean; user?: ClassroomUser; token?: string; error?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.token) {
      setAuthToken(result.token);
    }
    return result;
  },

  async getMe(): Promise<{ success: boolean; user?: ClassroomUser; error?: string }> {
    const token = getAuthToken();
    if (!token) return { success: false, error: 'No token' };
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return { success: false, error: 'Unauthorized' };
    return res.json();
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (e) {
      // ignore network errors on logout
    } finally {
      setAuthToken(null);
    }
  },

  async getStudentProfile(studentId: string): Promise<StudentProfileData> {
    const token = getAuthToken();
    if (!token) {
      return {
        id: studentId,
        name: 'Student',
        email: '',
        role: 'STUDENT',
        avatar: '👨‍🎓',
        xp: 100,
        level: 1,
        createdAt: new Date().toISOString(),
        completedActivitiesCount: 0,
        totalScore: 0,
        averageAccuracy: 0,
        attempts: [],
        achievements: [],
      };
    }
    try {
      const res = await fetch(`/api/students/${encodeURIComponent(studentId)}/profile`, {
        headers: getAuthHeaders(),
      });
      if (res.status === 401) {
        setAuthToken(null);
      }
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // ignore network errors
    }
    return {
      id: studentId,
      name: 'Student',
      email: '',
      role: 'STUDENT',
      avatar: '👨‍🎓',
      xp: 100,
      level: 1,
      createdAt: new Date().toISOString(),
      completedActivitiesCount: 0,
      totalScore: 0,
      averageAccuracy: 0,
      attempts: [],
      achievements: [],
    };
  },

  async getStudentAttempts(studentId: string): Promise<ActivityAttempt[]> {
    const token = getAuthToken();
    if (!token) return [];
    try {
      const res = await fetch(`/api/students/${encodeURIComponent(studentId)}/attempts`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // ignore network errors
    }
    return [];
  },

  async saveActivityAttempt(activityId: string, attemptData: Partial<ActivityAttempt>): Promise<{ success: boolean; attempt: ActivityAttempt }> {
    const res = await fetch(`/api/activities/${encodeURIComponent(activityId)}/attempts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(attemptData),
    });
    return res.json();
  },

  async setUser(user: Partial<ClassroomUser> & { id: string; name: string; role: 'TEACHER' | 'STUDENT' }): Promise<ClassroomUser> {
    const res = await fetch('/api/auth/user', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(user),
    });
    return res.json();
  },

  // Market
  async getStocks(): Promise<any[]> {
    const res = await fetch('/api/market/stocks');
    return res.json();
  },

  async getStock(symbol: string): Promise<any> {
    const res = await fetch(`/api/market/stocks/${symbol}`);
    return res.json();
  },

  // Classrooms
  async getClassrooms(_userId?: string): Promise<Classroom[]> {
    const res = await fetch('/api/classrooms', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getClassroom(id: string): Promise<Classroom> {
    const res = await fetch(`/api/classrooms/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createClassroom(
    name: string,
    teacherId: string,
    teacherName: string,
    department?: string,
    year?: string,
    batch?: string
  ): Promise<Classroom> {
    const res = await fetch('/api/classrooms', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, teacherId, teacherName, department, year, batch }),
    });
    return res.json();
  },

  async joinClassroom(code: string, user: ClassroomUser): Promise<{ success: boolean; message: string; classroom?: Classroom }> {
    const res = await fetch('/api/classrooms/join', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code, user }),
    });
    return res.json();
  },

  async getClassroomStudents(classroomId: string): Promise<ClassroomMember[]> {
    const res = await fetch(`/api/classrooms/${classroomId}/students`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getClassroomActivities(classroomId: string): Promise<ClassroomActivity[]> {
    const res = await fetch(`/api/classrooms/${classroomId}/activities`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createActivity(classroomId: string, data: any): Promise<ClassroomActivity> {
    const res = await fetch(`/api/classrooms/${classroomId}/activities`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Activity Controls
  async getActivity(activityId: string): Promise<ClassroomActivity> {
    const res = await fetch(`/api/activities/${activityId}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async joinActivity(activityId: string, user: ClassroomUser): Promise<any> {
    const res = await fetch(`/api/activities/${activityId}/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ user }),
    });
    return res.json();
  },

  async startActivity(activityId: string, userId?: string): Promise<ClassroomActivity> {
    const res = await fetch(`/api/activities/${activityId}/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },

  async pauseActivity(activityId: string, userId?: string): Promise<ClassroomActivity> {
    const res = await fetch(`/api/activities/${activityId}/pause`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },

  async resumeActivity(activityId: string, userId?: string): Promise<ClassroomActivity> {
    const res = await fetch(`/api/activities/${activityId}/resume`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },

  async nextRound(activityId: string, userId?: string): Promise<ClassroomActivity> {
    const res = await fetch(`/api/activities/${activityId}/next-round`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },

  async endActivity(activityId: string, userId?: string): Promise<ClassroomActivity> {
    const res = await fetch(`/api/activities/${activityId}/end`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },

  async getActivityState(activityId: string, studentId?: string): Promise<{
    activity: ClassroomActivity;
    currentRound: ActivityRound;
    totalRounds: number;
    studentSubmissions: ActivitySubmission[];
    hasSubmittedCurrentRound: boolean;
    participantsCount: number;
    leaderboard: LeaderboardEntry[];
    serverTime: number;
  }> {
    const url = `/api/activities/${activityId}/state${studentId ? `?studentId=${encodeURIComponent(studentId)}` : ''}`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async submitDecision(
    activityId: string,
    roundId: string,
    data: {
      studentId?: string;
      studentName?: string;
      decision: 'BUY' | 'SELL' | 'HOLD';
      quantity: number;
      stopLoss: number;
      target: number;
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
      reasoning: string;
    }
  ): Promise<{
    submission: ActivitySubmission;
    scoreResult: any;
    leaderboard: LeaderboardEntry[];
  }> {
    const res = await fetch(`/api/activities/${activityId}/rounds/${roundId}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Submission failed');
    }
    return res.json();
  },

  async getLeaderboard(activityId: string): Promise<LeaderboardEntry[]> {
    const res = await fetch(`/api/activities/${activityId}/leaderboard`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getResults(activityId: string): Promise<ClassroomResultsResponse> {
    const res = await fetch(`/api/activities/${activityId}/results`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // StockMate Market Challenge Quiz
  async getQuizQuestions(activityId: string, roundNumber: 1 | 2): Promise<{
    roundNumber: number;
    questions: any[];
    totalQuestions: number;
    scoringRule: string;
  }> {
    const res = await fetch(`/api/activities/${activityId}/quiz/questions?roundNumber=${roundNumber}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async submitQuizAnswer(
    activityId: string,
    data: {
      studentId?: string;
      studentName?: string;
      studentAvatar?: string;
      roundNumber: 1 | 2;
      questionNumber: number;
      questionId: string;
      selectedOption: 'A' | 'B' | 'C' | 'D';
    }
  ): Promise<{
    success: boolean;
    answerId: string;
    isCorrect: boolean;
    score: number;
    selectedOption: string;
    questionNumber: number;
    roundNumber: number;
    leaderboard: LeaderboardEntry[];
  }> {
    const res = await fetch(`/api/activities/${activityId}/quiz/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit quiz answer');
    }
    return res.json();
  },

  async getStudentQuizAnswers(activityId: string, studentId?: string): Promise<any[]> {
    const query = studentId ? `?studentId=${encodeURIComponent(studentId)}` : '';
    const res = await fetch(`/api/activities/${activityId}/quiz/student-answers${query}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getQuizSummary(activityId: string): Promise<any> {
    const res = await fetch(`/api/activities/${activityId}/quiz/summary`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getExportUrl(activityId: string): string {
    return `/api/activities/${activityId}/export`;
  },
};
