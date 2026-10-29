import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Classroom,
  ClassroomActivity,
  ClassroomMember,
  ClassroomUser,
  LeaderboardEntry,
  ActivityRound,
  ActivitySubmission,
  ClassroomResultsResponse,
  ActivityAttempt,
  StudentProfileData,
} from '../types/classroom';
import { classroomApi } from '../services/classroomApi';
import { getSocket, joinClassroomRoom, joinActivityRoom } from '../services/socket';
import { useGame } from './GameContext';

interface ClassroomContextType {
  currentUser: ClassroomUser | null;
  isAuthenticated: boolean;
  studentProfile: StudentProfileData | null;
  refreshStudentProfile: () => Promise<void>;
  availableUsers: ClassroomUser[];
  onlineUserIds: string[];
  switchUser: (user: ClassroomUser) => void;
  updateUserProfile: (updates: Partial<ClassroomUser>) => Promise<void>;
  loginAsTeacher: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsStudent: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signupStudent: (data: { name: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  signupTeacher: (data: { name: string; email: string; password: string; inviteCode?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  myClassrooms: Classroom[];
  activeClassroom: Classroom | null;
  selectClassroom: (classroom: Classroom | null) => void;
  classroomMembers: ClassroomMember[];
  classroomActivities: ClassroomActivity[];
  activeActivity: ClassroomActivity | null;
  currentRound: ActivityRound | null;
  activitySubmissions: ActivitySubmission[];
  hasSubmittedCurrentRound: boolean;
  leaderboard: LeaderboardEntry[];
  results: ClassroomResultsResponse | null;
  isConnecting: boolean;
  activeView: 'LIST' | 'WAITING_ROOM' | 'ACTIVITY' | 'TEACHER_MONITOR' | 'RESULTS';
  setActiveView: (view: 'LIST' | 'WAITING_ROOM' | 'ACTIVITY' | 'TEACHER_MONITOR' | 'RESULTS') => void;
  roundTimeRemaining: number; // in seconds
  // Actions
  refreshClassrooms: () => Promise<void>;
  createClassroom: (name: string, department?: string, year?: string, batch?: string) => Promise<Classroom>;
  joinClassroomByCode: (code: string) => Promise<{ success: boolean; message: string }>;
  createActivity: (data: any) => Promise<ClassroomActivity>;
  selectActivity: (activity: ClassroomActivity | null) => Promise<void>;
  startActivity: (activityId: string) => Promise<void>;
  pauseActivity: (activityId: string) => Promise<void>;
  resumeActivity: (activityId: string) => Promise<void>;
  nextRound: (activityId: string) => Promise<void>;
  endActivity: (activityId: string) => Promise<void>;
  submitDecision: (data: {
    decision: 'BUY' | 'SELL' | 'HOLD';
    quantity: number;
    stopLoss: number;
    target: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    reasoning: string;
  }) => Promise<any>;
  fetchResults: (activityId: string) => Promise<void>;
}

const ClassroomContext = createContext<ClassroomContextType | null>(null);

const CLASSROOM_USER_KEY = 'stockmate_classroom_user_v2';

function loadInitialUser(): ClassroomUser | null {
  if (typeof window !== 'undefined') {
    try {
      const token = classroomApi.getAuthToken();
      if (!token) {
        localStorage.removeItem(CLASSROOM_USER_KEY);
        return null;
      }
      const raw = localStorage.getItem(CLASSROOM_USER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Exclude legacy demo student IDs
        const legacyIds = new Set(['student_anjali', 'student_rahul', 'student_priya', 'student_vikram']);
        if (parsed && parsed.id && !legacyIds.has(parsed.id) && parsed.email) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading stored classroom user:', e);
    }
  }
  return null;
}

export const ClassroomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, addXp } = useGame();

  const [currentUser, setCurrentUser] = useState<ClassroomUser | null>(() => loadInitialUser());
  const [studentProfile, setStudentProfile] = useState<StudentProfileData | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<ClassroomUser[]>([]);
  const [myClassrooms, setMyClassrooms] = useState<Classroom[]>([]);
  const [activeClassroom, setActiveClassroom] = useState<Classroom | null>(null);
  const [classroomMembers, setClassroomMembers] = useState<ClassroomMember[]>([]);
  const [classroomActivities, setClassroomActivities] = useState<ClassroomActivity[]>([]);
  const [activeActivity, setActiveActivity] = useState<ClassroomActivity | null>(null);
  const [currentRound, setCurrentRound] = useState<ActivityRound | null>(null);
  const [activitySubmissions, setActivitySubmissions] = useState<ActivitySubmission[]>([]);
  const [hasSubmittedCurrentRound, setHasSubmittedCurrentRound] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [results, setResults] = useState<ClassroomResultsResponse | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'LIST' | 'WAITING_ROOM' | 'ACTIVITY' | 'TEACHER_MONITOR' | 'RESULTS'>('LIST');
  const [roundTimeRemaining, setRoundTimeRemaining] = useState<number>(0);

  // Validate session token on mount
  useEffect(() => {
    const token = classroomApi.getAuthToken();
    if (token) {
      classroomApi.getMe().then((res) => {
        if (!res.success || !res.user) {
          setCurrentUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem(CLASSROOM_USER_KEY);
          }
          classroomApi.setAuthToken(null);
        } else {
          setCurrentUser(res.user);
        }
      }).catch(() => {
        // network error
      });
    } else {
      setCurrentUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(CLASSROOM_USER_KEY);
      }
    }
  }, []);

  // Sync user with backend on init or change
  useEffect(() => {
    if (currentUser && currentUser.id) {
      classroomApi.setUser(currentUser).catch(console.error);
    }
  }, [currentUser]);

  // Load available sample users
  useEffect(() => {
    classroomApi.getUsers().then((users) => {
      if (users && users.length > 0) {
        setAvailableUsers(users);
      }
    }).catch(console.error);
  }, []);

  // Refresh student persistent profile
  const refreshStudentProfile = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'STUDENT') return;
    try {
      const p = await classroomApi.getStudentProfile(currentUser.id);
      setStudentProfile(p);
    } catch (err) {
      console.error('Failed to load student profile:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.id && currentUser?.role === 'STUDENT') {
      refreshStudentProfile();
    }
  }, [currentUser?.id, currentUser?.role, refreshStudentProfile]);

  // Refresh classrooms for current user
  const refreshClassrooms = useCallback(async () => {
    if (!currentUser?.id) {
      setMyClassrooms([]);
      return;
    }
    try {
      const list = await classroomApi.getClassrooms(currentUser.id);
      setMyClassrooms(list);
      // Auto-select first classroom if none selected
      if (!activeClassroom && list.length > 0) {
        setActiveClassroom(list[0]);
      }
    } catch (err) {
      console.error('Failed to load classrooms:', err);
    }
  }, [currentUser?.id, activeClassroom]);

  useEffect(() => {
    if (currentUser?.id) {
      refreshClassrooms();
    }
  }, [currentUser?.id]);

  // Load classroom activities & members when active classroom changes
  useEffect(() => {
    if (!activeClassroom || !currentUser) return;

    joinClassroomRoom(activeClassroom.id, currentUser);

    classroomApi.getClassroomActivities(activeClassroom.id).then((acts) => {
      setClassroomActivities(acts);
    }).catch(console.error);

    classroomApi.getClassroomStudents(activeClassroom.id).then((mems) => {
      setClassroomMembers(mems);
    }).catch(console.error);
  }, [activeClassroom, currentUser]);

  // Handle countdown timer based on server end timestamp
  useEffect(() => {
    if (!activeActivity || activeActivity.status !== 'LIVE' || !activeActivity.roundEndTime) {
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.round((activeActivity.roundEndTime! - now) / 1000));
      setRoundTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeActivity]);

  // Socket.IO real-time event listeners
  useEffect(() => {
    const socket = getSocket();

    const handleActivityStarted = (payload: any) => {
      console.log('[Socket] ACTIVITY_STARTED received:', payload);
      setActiveActivity((prev) => {
        if (!prev || prev.id === payload.activityId) {
          return {
            ...(prev || {}),
            id: payload.activityId,
            classroomId: payload.classroomId,
            status: 'LIVE',
            currentRoundNumber: payload.currentRound,
            roundStartTime: payload.roundStartTime,
            roundEndTime: payload.roundEndTime,
          } as ClassroomActivity;
        }
        return prev;
      });

      if (payload.round) {
        setCurrentRound(payload.round);
      }
      setHasSubmittedCurrentRound(false);

      if (currentUser?.role === 'TEACHER') {
        setActiveView('TEACHER_MONITOR');
      } else {
        setActiveView('ACTIVITY');
      }
    };

    const handleRoundStarted = (payload: any) => {
      console.log('[Socket] ROUND_STARTED received:', payload);
      setActiveActivity((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'LIVE',
          currentRoundNumber: payload.currentRound,
          roundStartTime: payload.roundStartTime,
          roundEndTime: payload.roundEndTime,
        };
      });

      if (payload.round) {
        setCurrentRound(payload.round);
      }
      setHasSubmittedCurrentRound(false);
    };

    const handleActivityPaused = () => {
      setActiveActivity((prev) => prev ? { ...prev, status: 'PAUSED' } : null);
    };

    const handleActivityResumed = (payload: any) => {
      setActiveActivity((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'LIVE',
          roundStartTime: payload.roundStartTime,
          roundEndTime: payload.roundEndTime,
        };
      });
    };

    const handleActivityEnded = (payload: any) => {
      console.log('[Socket] ACTIVITY_ENDED received:', payload);
      setActiveActivity((prev) => prev ? { ...prev, status: 'COMPLETED' } : null);
      if (payload.leaderboard) {
        setLeaderboard(payload.leaderboard);
      }
      if (payload.activityId) {
        classroomApi.getResults(payload.activityId).then(setResults).catch(console.error);
      }
      setActiveView('RESULTS');
    };

    const handleLeaderboardUpdated = (payload: any) => {
      if (payload.leaderboard) {
        setLeaderboard(payload.leaderboard);
      }
    };

    const handleMemberJoined = () => {
      if (activeClassroom) {
        classroomApi.getClassroomStudents(activeClassroom.id).then(setClassroomMembers).catch(console.error);
      }
    };

    const handlePresenceUpdated = (payload: any) => {
      if (payload.onlineUserIds) {
        setOnlineUserIds(payload.onlineUserIds);
      }
      if (activeClassroom) {
        classroomApi.getClassroomStudents(activeClassroom.id).then(setClassroomMembers).catch(console.error);
      }
    };

    // Listen to both uppercase and lowercase colon-based events
    socket.on('ACTIVITY_STARTED', handleActivityStarted);
    socket.on('activity:started', handleActivityStarted);
    socket.on('ROUND_STARTED', handleRoundStarted);
    socket.on('round:started', handleRoundStarted);
    socket.on('ACTIVITY_PAUSED', handleActivityPaused);
    socket.on('activity:paused', handleActivityPaused);
    socket.on('ACTIVITY_RESUMED', handleActivityResumed);
    socket.on('activity:resumed', handleActivityResumed);
    socket.on('ACTIVITY_ENDED', handleActivityEnded);
    socket.on('activity:ended', handleActivityEnded);
    socket.on('LEADERBOARD_UPDATED', handleLeaderboardUpdated);
    socket.on('leaderboard:updated', handleLeaderboardUpdated);
    socket.on('MEMBER_JOINED', handleMemberJoined);
    socket.on('student:joined', handleMemberJoined);
    socket.on('PRESENCE_UPDATED', handlePresenceUpdated);
    socket.on('student:presence', handlePresenceUpdated);

    return () => {
      socket.off('ACTIVITY_STARTED', handleActivityStarted);
      socket.off('activity:started', handleActivityStarted);
      socket.off('ROUND_STARTED', handleRoundStarted);
      socket.off('round:started', handleRoundStarted);
      socket.off('ACTIVITY_PAUSED', handleActivityPaused);
      socket.off('activity:paused', handleActivityPaused);
      socket.off('ACTIVITY_RESUMED', handleActivityResumed);
      socket.off('activity:resumed', handleActivityResumed);
      socket.off('ACTIVITY_ENDED', handleActivityEnded);
      socket.off('activity:ended', handleActivityEnded);
      socket.off('LEADERBOARD_UPDATED', handleLeaderboardUpdated);
      socket.off('leaderboard:updated', handleLeaderboardUpdated);
      socket.off('MEMBER_JOINED', handleMemberJoined);
      socket.off('student:joined', handleMemberJoined);
      socket.off('PRESENCE_UPDATED', handlePresenceUpdated);
      socket.off('student:presence', handlePresenceUpdated);
    };
  }, [activeClassroom, currentUser?.role]);

  // Select active activity & restore state (Supports refresh / reconnect!)
  const selectActivity = async (activity: ClassroomActivity | null) => {
    if (!activity) {
      setActiveActivity(null);
      setCurrentRound(null);
      setActiveView('LIST');
      return;
    }

    setIsConnecting(true);
    try {
      setActiveActivity(activity);

      if (currentUser) {
        // Join socket room
        joinActivityRoom(activity.id, activity.classroomId, currentUser);

        // Fetch state from server for refresh / reconnect restoration
        const state = await classroomApi.getActivityState(activity.id, currentUser.id);
        setActiveActivity(state.activity);
        setCurrentRound(state.currentRound);
        setActivitySubmissions(state.studentSubmissions || []);
        setHasSubmittedCurrentRound(state.hasSubmittedCurrentRound || false);
        setLeaderboard(state.leaderboard || []);

        // Route to appropriate view
        if (state.activity.status === 'WAITING' || state.activity.status === 'DRAFT') {
          setActiveView(currentUser.role === 'TEACHER' ? 'TEACHER_MONITOR' : 'WAITING_ROOM');
        } else if (state.activity.status === 'LIVE' || state.activity.status === 'PAUSED') {
          setActiveView(currentUser.role === 'TEACHER' ? 'TEACHER_MONITOR' : 'ACTIVITY');
        } else if (state.activity.status === 'COMPLETED') {
          await fetchResults(activity.id);
          setActiveView('RESULTS');
        }
      }
    } catch (err) {
      console.error('Failed to select activity:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const switchUser = (newUser: ClassroomUser) => {
    setCurrentUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CLASSROOM_USER_KEY, JSON.stringify(newUser));
    }
    setActiveView('LIST');
    setActiveActivity(null);
  };

  const updateUserProfile = async (updates: Partial<ClassroomUser>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CLASSROOM_USER_KEY, JSON.stringify(updated));
    }
    await classroomApi.setUser(updated);
    await refreshClassrooms();
  };

  const loginAsStudent = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await classroomApi.login({ email, password, role: 'STUDENT' });
      if (!res.success || !res.user) {
        return { success: false, error: res.error || 'Student login failed. Please verify email and password.' };
      }
      setCurrentUser(res.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem(CLASSROOM_USER_KEY, JSON.stringify(res.user));
      }
      try {
        const p = await classroomApi.getStudentProfile(res.user.id);
        setStudentProfile(p);
      } catch (e) {
        // profile can be empty on first sign in
      }
      await refreshClassrooms();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Student login error' };
    }
  };

  const signupStudent = async (data: { name: string; email: string; password: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await classroomApi.signup({
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'STUDENT',
      });
      if (!res.success || !res.user) {
        return { success: false, error: res.error || 'Student registration failed.' };
      }
      setCurrentUser(res.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem(CLASSROOM_USER_KEY, JSON.stringify(res.user));
      }
      try {
        const p = await classroomApi.getStudentProfile(res.user.id);
        setStudentProfile(p);
      } catch (e) {
        // empty profile ok
      }
      await refreshClassrooms();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Student signup error' };
    }
  };

  const loginAsTeacher = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await classroomApi.login({ email, password, role: 'TEACHER' });
      if (!res.success || !res.user) {
        return { success: false, error: res.error || 'Teacher login failed. Check email or password.' };
      }
      setCurrentUser(res.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem(CLASSROOM_USER_KEY, JSON.stringify(res.user));
      }
      await refreshClassrooms();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Teacher login error' };
    }
  };

  const signupTeacher = async (data: { name: string; email: string; password: string; inviteCode?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await classroomApi.signup({
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'TEACHER',
        inviteCode: data.inviteCode,
      });
      if (!res.success || !res.user) {
        return { success: false, error: res.error || 'Teacher registration failed.' };
      }
      setCurrentUser(res.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem(CLASSROOM_USER_KEY, JSON.stringify(res.user));
      }
      await refreshClassrooms();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Teacher signup error' };
    }
  };

  const logout = async () => {
    await classroomApi.logout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CLASSROOM_USER_KEY);
      window.history.pushState({}, '', '/');
    }
    setCurrentUser(null);
    setStudentProfile(null);
    setActiveClassroom(null);
    setActiveActivity(null);
    setActiveView('LIST');
  };

  const createClassroom = async (
    name: string,
    department?: string,
    year?: string,
    batch?: string
  ): Promise<Classroom> => {
    if (!currentUser || currentUser.role !== 'TEACHER') {
      throw new Error('Only verified teachers can create classrooms.');
    }
    const created = await classroomApi.createClassroom(
      name,
      currentUser.id,
      currentUser.name,
      department,
      year,
      batch
    );
    await refreshClassrooms();
    setActiveClassroom(created);
    return created;
  };

  const joinClassroomByCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Please log in to your student account first.' };
    }
    const res = await classroomApi.joinClassroom(code, currentUser);
    if (res.success && res.classroom) {
      await refreshClassrooms();
      setActiveClassroom(res.classroom);
    }
    return res;
  };

  const createActivity = async (data: any): Promise<ClassroomActivity> => {
    if (!activeClassroom) throw new Error('No active classroom');
    const act = await classroomApi.createActivity(activeClassroom.id, data);
    const updated = await classroomApi.getClassroomActivities(activeClassroom.id);
    setClassroomActivities(updated);
    return act;
  };

  const startActivity = async (activityId: string) => {
    if (!currentUser) return;
    const updated = await classroomApi.startActivity(activityId, currentUser.id);
    setActiveActivity(updated);
    setActiveView(currentUser?.role === 'TEACHER' ? 'TEACHER_MONITOR' : 'ACTIVITY');
  };

  const pauseActivity = async (activityId: string) => {
    if (!currentUser) return;
    const updated = await classroomApi.pauseActivity(activityId, currentUser.id);
    setActiveActivity(updated);
  };

  const resumeActivity = async (activityId: string) => {
    if (!currentUser) return;
    const updated = await classroomApi.resumeActivity(activityId, currentUser.id);
    setActiveActivity(updated);
  };

  const nextRound = async (activityId: string) => {
    if (!currentUser) return;
    const updated = await classroomApi.nextRound(activityId, currentUser.id);
    setActiveActivity(updated);
    if (updated.status === 'COMPLETED') {
      await fetchResults(activityId);
      setActiveView('RESULTS');
    }
  };

  const endActivity = async (activityId: string) => {
    if (!currentUser) return;
    const updated = await classroomApi.endActivity(activityId, currentUser.id);
    setActiveActivity(updated);
    await fetchResults(activityId);
    setActiveView('RESULTS');
  };

  const submitDecision = async (data: {
    decision: 'BUY' | 'SELL' | 'HOLD';
    quantity: number;
    stopLoss: number;
    target: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    reasoning: string;
  }) => {
    if (!currentUser) return;
    if (!activeActivity || !currentRound) {
      throw new Error('No active round to submit to');
    }

    const res = await classroomApi.submitDecision(activeActivity.id, currentRound.id, {
      studentId: currentUser.id,
      studentName: currentUser.name,
      ...data,
    });

    setActivitySubmissions((prev) => [...prev, res.submission]);
    setHasSubmittedCurrentRound(true);
    setLeaderboard(res.leaderboard);

    // Award XP to player profile!
    addXp(Math.round(res.submission.totalScore / 2));

    return res;
  };

  const fetchResults = async (activityId: string) => {
    try {
      const res = await classroomApi.getResults(activityId);
      setResults(res);
      setLeaderboard(res.leaderboard);
    } catch (err) {
      console.error('Failed to fetch results:', err);
    }
  };

  return (
    <ClassroomContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        studentProfile,
        refreshStudentProfile,
        availableUsers,
        onlineUserIds,
        switchUser,
        updateUserProfile,
        loginAsTeacher,
        loginAsStudent,
        signupStudent,
        signupTeacher,
        logout,
        myClassrooms,
        activeClassroom,
        selectClassroom: setActiveClassroom,
        classroomMembers,
        classroomActivities,
        activeActivity,
        currentRound,
        activitySubmissions,
        hasSubmittedCurrentRound,
        leaderboard,
        results,
        isConnecting,
        activeView,
        setActiveView,
        roundTimeRemaining,
        refreshClassrooms,
        createClassroom,
        joinClassroomByCode,
        createActivity,
        selectActivity,
        startActivity,
        pauseActivity,
        resumeActivity,
        nextRound,
        endActivity,
        submitDecision,
        fetchResults,
      }}
    >
      {children}
    </ClassroomContext.Provider>
  );
};

export const useClassroom = () => {
  const context = useContext(ClassroomContext);
  if (!context) {
    throw new Error('useClassroom must be used within ClassroomProvider');
  }
  return context;
};
