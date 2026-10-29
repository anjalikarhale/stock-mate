import { PlayerProfile } from '../types';
import { INITIAL_ACHIEVEMENTS } from '../data/curriculum';
import { APP_CONFIG } from '../config/theme';

const LEGACY_STORAGE_KEY = 'stockmate_course_progress_v5';

function getUserStorageKey(userId?: string | null): string {
  if (userId && userId.trim().length > 0 && userId !== 'player-alpha-1') {
    return `stockmate_user_state_${userId.trim()}`;
  }
  return LEGACY_STORAGE_KEY;
}

export const DEFAULT_PLAYER_PROFILE: PlayerProfile = {
  id: 'player-alpha-1',
  username: 'MarketExplorer',
  avatar: '🦁',
  nickname: 'Rookie Trader',
  level: 1,
  xp: 0,
  virtualCash: APP_CONFIG.initialVirtualCash,
  careerPath: 'INVESTOR',
  stats: {
    knowledgeScore: 0,
    tradingDisciplineScore: 0,
    riskManagementScore: 0,
    technicalAnalysisScore: 0,
    fundamentalAnalysisScore: 0,
    portfolioScore: 0,
    psychologyScore: 0,
    overallMasteryScore: 0,
  },
  positions: [],
  optionPositions: [],
  orders: [],
  optionOrders: [],
  journal: [],
  mistakes: [],
  achievements: INITIAL_ACHIEVEMENTS,
  completedQuests: [],
  streakDays: 1,
  lastActiveDate: new Date().toISOString(),
  highScoreCombat: 0,
  highScoreDetective: 0,
  crashesSurvived: 0,
  appMode: 'HOME',
  hasCompletedOnboarding: false,
  completedMissions: [],
  completedNcfmLessons: [],
  completedCourseTopics: [],
  completedModules: [],
  completedLessons: [],
  completedExercises: [],
  moduleQuizScores: {},
  lastActiveModuleId: 'module-1',
  lastActiveLessonId: 'm1-lesson-1',
  gameScores: {},
  watchlist: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'],
  currentMissionId: 'module-1',
  unlockedFeatures: ['Stock Basics', 'module-1'],
  traderFiTokens: 100,
  tournamentsWon: 0,
  tournamentsPlayed: 0,
};

export function loadSavedProfile(userId?: string | null): PlayerProfile {
  if (typeof window === 'undefined') return DEFAULT_PLAYER_PROFILE;
  try {
    const key = getUserStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      return {
        ...DEFAULT_PLAYER_PROFILE,
        id: userId || DEFAULT_PLAYER_PROFILE.id,
      };
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PLAYER_PROFILE,
      ...parsed,
      id: userId || parsed.id || DEFAULT_PLAYER_PROFILE.id,
      stats: {
        ...DEFAULT_PLAYER_PROFILE.stats,
        ...(parsed.stats || {}),
      },
      positions: parsed.positions || [],
      optionPositions: parsed.optionPositions || [],
      orders: parsed.orders || [],
      optionOrders: parsed.optionOrders || [],
      achievements: parsed.achievements || INITIAL_ACHIEVEMENTS,
      completedMissions: parsed.completedMissions || [],
      completedNcfmLessons: parsed.completedNcfmLessons || [],
      completedCourseTopics: parsed.completedCourseTopics || [],
      completedModules: parsed.completedModules || [],
      completedLessons: parsed.completedLessons || [],
      completedExercises: parsed.completedExercises || [],
      moduleQuizScores: parsed.moduleQuizScores || {},
      gameScores: parsed.gameScores || {},
      watchlist: parsed.watchlist || ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'],
      unlockedFeatures: parsed.unlockedFeatures || ['Stock Basics', 'module-1'],
    };
  } catch {
    return {
      ...DEFAULT_PLAYER_PROFILE,
      id: userId || DEFAULT_PLAYER_PROFILE.id,
    };
  }
}

export function saveProfile(profile: PlayerProfile, userId?: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getUserStorageKey(userId || profile.id);
    localStorage.setItem(key, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile state:', err);
  }
}

export function clearAllLearningProgress(userId?: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('market_quest_rpg_profile_v2');
    localStorage.removeItem('market_quest_course_profile_v3');
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    if (userId) {
      localStorage.removeItem(getUserStorageKey(userId));
    }
  } catch (err) {
    console.error('Error clearing progress:', err);
  }
}
