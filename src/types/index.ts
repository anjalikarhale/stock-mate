// Core types for Market Quest RPG

export type DistrictId =
  | 'bank-district'
  | 'stock-exchange'
  | 'corporate-district'
  | 'chart-arena'
  | 'portfolio-tower'
  | 'psychology-lab'
  | 'derivatives-arena'
  | 'quant-lab';

export type GameId =
  | 'traderfi-arena'
  | 'tournament-lobby'
  | 'candlestick-combat'
  | 'chart-detective'
  | 'market-crash'
  | 'candlestick-memory'
  | 'company-forensics'
  | 'fomo-trap'
  | 'portfolio-tetris'
  | 'market-replay'
  | 'price-prediction'
  | 'portfolio-tycoon'
  | 'strategy-backtest'
  | 'escape-room'
  | 'trading-terminal'
  | 'boss-battle';

export type CareerPath =
  | 'INVESTOR'
  | 'TRADER'
  | 'FUNDAMENTAL_ANALYST'
  | 'PORTFOLIO_MANAGER'
  | 'QUANT';

export type MarketWeather =
  | 'BULL'
  | 'STABLE'
  | 'CORRECTION'
  | 'VOLATILE'
  | 'BEAR';

export type OrderType = 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'STOP_LIMIT';
export type OrderAction = 'BUY' | 'SELL';
export type OrderStatus = 'EXECUTED' | 'PENDING' | 'CANCELLED' | 'REJECTED';

export interface Candle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockQuote {
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  high52w: number;
  low52w: number;
  peRatio: number;
  pbRatio: number;
  roe: number;
  roce: number;
  debtToEquity: number;
  marketCapCr: number; // in Crores
  eps: number;
  dividendYield: number;
  historicalCandles: Candle[];
  dataSource: 'HISTORICAL_NSE' | 'DEMO_DATA';
}

export interface Position {
  symbol: string;
  name: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface Order {
  id: string;
  symbol: string;
  name: string;
  action: OrderAction;
  type: OrderType;
  quantity: number;
  price: number;
  targetPrice?: number;
  stopLossPrice?: number;
  status: OrderStatus;
  timestamp: string;
  executionPrice?: number;
  rationale?: string;
  emotionalState?: 'CALM' | 'FOMO' | 'FEARFUL' | 'GREEDY' | 'REVENGE';
}

export interface TradingJournalEntry {
  id: string;
  orderId: string;
  timestamp: string;
  symbol: string;
  action: OrderAction;
  price: number;
  quantity: number;
  strategy: string;
  reason: string;
  emotionalState: string;
  pnl?: number;
  lessonLearned?: string;
}

export interface PlayerStats {
  knowledgeScore: number;
  tradingDisciplineScore: number;
  riskManagementScore: number;
  technicalAnalysisScore: number;
  fundamentalAnalysisScore: number;
  portfolioScore: number;
  psychologyScore: number;
  overallMasteryScore: number;
}

export interface MistakeEntry {
  id: string;
  category:
    | 'FOMO'
    | 'NO_STOP_LOSS'
    | 'POOR_RISK_REWARD'
    | 'OVERTRADING'
    | 'POOR_DIVERSIFICATION'
    | 'EMOTIONAL_DECISION'
    | 'IGNORING_FUNDAMENTALS'
    | 'CHASING_PEAK';
  count: number;
  lastOccurred: string;
  description: string;
  financialImpactVirtual: number;
  remedyTip: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'BEGINNER' | 'TECHNICAL' | 'FUNDAMENTAL' | 'RISK' | 'PSYCHOLOGY' | 'MASTER';
  xpReward: number;
  unlockedAt?: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  category: 'EXPLORATION' | 'TRADING' | 'CHART' | 'ANALYSIS' | 'RISK';
  target: number;
  current: number;
  completed: boolean;
  xpReward: number;
  cashReward: number;
  actionGameId: GameId;
}

export interface LevelInfo {
  level: number;
  title: string;
  rankBadge: string;
  minXp: number;
  maxXp: number;
  unlockedDistricts: DistrictId[];
  unlockedFeatures: string[];
  bossRequirement?: string;
}

export type AppMode = 'HOME' | 'LEARN' | 'PLAY' | 'TRADE' | 'PORTFOLIO' | 'PROFILE' | 'CLASSROOM' | 'PRACTICE' | 'JOURNEY' | 'FREE' | 'CHART_ANALYSIS';

export type OnboardingStep =
  | 'WELCOME'
  | 'MENTOR_INTRO'
  | 'CHARACTER_CREATION'
  | 'DIAGNOSTIC_ASSESSMENT'
  | 'ONBOARDING_COMPLETE';

export interface Mission {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  stage: number;
  stageName: string;
  category: 'INVESTING_BASICS' | 'STOCKS' | 'DEMAND_SUPPLY' | 'TRADING' | 'PORTFOLIO' | 'RISK' | 'VOLATILITY' | 'CHARTS' | 'CANDLESTICKS' | 'SUPPORT_RESISTANCE';
  estimatedMinutes: number;
  xpReward: number;
  cashReward: number;
  unlocksBadge?: string;
  unlockedFeatureName?: string;
  icon: string;
  keyTakeaway: string;
}

export interface PlayerProfile {
  id: string;
  username: string;
  avatar: string;
  nickname?: string;
  level: number;
  xp: number;
  virtualCash: number;
  careerPath: CareerPath;
  stats: PlayerStats;
  positions: Position[];
  orders: Order[];
  journal: TradingJournalEntry[];
  mistakes: MistakeEntry[];
  achievements: Achievement[];
  completedQuests: string[];
  streakDays: number;
  lastActiveDate: string;
  highScoreCombat: number;
  highScoreDetective: number;
  crashesSurvived: number;
  // Guided Journey & Progressive Unlocks State
  appMode: AppMode;
  hasCompletedOnboarding: boolean;
  completedMissions: string[];
  completedNcfmLessons?: string[];
  completedCourseTopics?: string[];
  watchlist?: string[];
  currentMissionId: string;
  unlockedFeatures: string[];
  traderFiTokens?: number;
  tournamentsWon?: number;
  tournamentsPlayed?: number;
}

export interface District {
  id: DistrictId;
  name: string;
  hindiTitle?: string;
  icon: string;
  color: string;
  accentGradient: string;
  requiredLevel: number;
  description: string;
  topics: string[];
  games: {
    id: GameId;
    title: string;
    description: string;
    rewardXp: number;
    badgeIcon: string;
  }[];
  boss: {
    name: string;
    title: string;
    description: string;
    unlocked: boolean;
    rewardBadge: string;
  };
}
