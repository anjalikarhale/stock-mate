import { PlayerProfile } from '../types';
import { INITIAL_ACHIEVEMENTS, INITIAL_DAILY_QUESTS } from '../data/curriculum';
import { APP_CONFIG } from '../config/theme';

const STORAGE_KEY = 'market_quest_rpg_profile_v2';

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
  orders: [],
  journal: [],
  mistakes: [],
  achievements: INITIAL_ACHIEVEMENTS,
  completedQuests: [],
  streakDays: 1,
  lastActiveDate: new Date().toISOString(),
  highScoreCombat: 0,
  highScoreDetective: 0,
  crashesSurvived: 0,
  // Progressive Journey Setup
  appMode: 'HOME',
  hasCompletedOnboarding: false,
  completedMissions: [],
  completedNcfmLessons: [],
  watchlist: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'],
  currentMissionId: 'mission-1',
  unlockedFeatures: ['Stock Basics', 'mission-1'],
  traderFiTokens: 100,
  tournamentsWon: 0,
  tournamentsPlayed: 0,
};

export function loadSavedProfile(): PlayerProfile {
  if (typeof window === 'undefined') return DEFAULT_PLAYER_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PLAYER_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PLAYER_PROFILE,
      ...parsed,
      stats: {
        ...DEFAULT_PLAYER_PROFILE.stats,
        ...(parsed.stats || {})
      },
      positions: parsed.positions || [],
      achievements: parsed.achievements || INITIAL_ACHIEVEMENTS,
      completedMissions: parsed.completedMissions || [],
      completedNcfmLessons: parsed.completedNcfmLessons || [],
      watchlist: parsed.watchlist || ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'],
      unlockedFeatures: parsed.unlockedFeatures || ['Stock Basics', 'mission-1'],
    };
  } catch {
    return DEFAULT_PLAYER_PROFILE;
  }
}

export function saveProfile(profile: PlayerProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile state:', err);
  }
}
