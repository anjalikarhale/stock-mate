import { classroomApi } from './classroomApi';
import {
  CompanyWorksheetDraft,
  GameScoreRecord,
  OptionOrder,
  OptionPosition,
  Order,
  Position,
  TradingJournalEntry,
} from '../types';

export type MarketDataStatus =
  | 'LIVE'
  | 'CACHED'
  | 'DELAYED'
  | 'HISTORICAL'
  | 'SIMULATED'
  | 'UNAVAILABLE';

export interface MarketMeta {
  status: MarketDataStatus;
  source: string;
  lastUpdated: string;
  marketOpen: boolean;
  growwConfigured: boolean;
  notice?: string;
}

export interface RegisteredInstrumentItem {
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  segment: 'CASH' | 'FNO';
  instrumentType: 'EQUITY' | 'INDEX' | 'ETF';
  growwTradingSymbol: string;
  growwExchangeSymbol: string;
  yahooTicker: string;
  sector: string;
  lotSize: number;
  strikeStep?: number;
  supportsOptions: boolean;
  relatedEtfSymbol?: string;
  referencePrice: number;
  peRatio: number;
  pbRatio: number;
  roe: number;
  roce: number;
  debtToEquity: number;
  marketCapCr: number;
  eps: number;
  dividendYield: number;
  high52w: number;
  low52w: number;
}

export interface NormalizedMarketQuote {
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  segment: 'CASH' | 'FNO';
  instrumentType: 'EQUITY' | 'INDEX' | 'ETF';
  lastPrice: number | null;
  dayChange: number | null;
  dayChangePerc: number | null;
  ohlc: {
    open: number | null;
    high: number | null;
    low: number | null;
    close: number | null;
  };
  averagePrice: number | null;
  volume: number | null;
  lastTradeQuantity: number | null;
  lastTradeTime: string | null;
  bidPrice: number | null;
  bidQuantity: number | null;
  offerPrice: number | null;
  offerQuantity: number | null;
  totalBuyQuantity: number | null;
  totalSellQuantity: number | null;
  upperCircuitLimit: number | null;
  lowerCircuitLimit: number | null;
  highTradeRange: number | null;
  lowTradeRange: number | null;
  week52High: number | null;
  week52Low: number | null;
  openInterest: number | null;
  oiDayChange: number | null;
  oiDayChangePerc: number | null;
  impliedVolatility: number | null;
  depth: {
    buy: { price: number; quantity: number; orders?: number }[];
    sell: { price: number; quantity: number; orders?: number }[];
  } | null;
  fundamentals: {
    peRatio: number | null;
    pbRatio: number | null;
    roe: number | null;
    roce: number | null;
    debtToEquity: number | null;
    eps: number | null;
    dividendYield: number | null;
    marketCapCr: number | null;
    sector: string;
    lotSize: number;
    relatedEtfSymbol?: string;
  };
  meta: MarketMeta;
}

export type SupportedChartTimeframe = '5D' | '1M' | '3M' | '6M' | '1Y';

export interface HistoricalCandleBar {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
}

export interface HistoricalChartPayload {
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  instrumentType: 'EQUITY' | 'INDEX' | 'ETF';
  timeframe: SupportedChartTimeframe;
  interval: string;
  candles: HistoricalCandleBar[];
  latestPrice: number | null;
  previousClose: number | null;
  change: number | null;
  changePercent: number | null;
  meta: MarketMeta;
}

export interface OptionGreeksData {
  delta: number | null;
  gamma: number | null;
  theta: number | null;
  vega: number | null;
  rho: number | null;
  iv: number | null;
}

export interface OptionContractSide {
  tradingSymbol: string;
  ltp: number | null;
  dayChange: number | null;
  dayChangePerc: number | null;
  openInterest: number | null;
  oiChange: number | null;
  volume: number | null;
  bidPrice: number | null;
  askPrice: number | null;
  impliedVolatility: number | null;
  greeks: OptionGreeksData | null;
  greeksAvailable: boolean;
}

export interface OptionChainStrikeRow {
  strikePrice: number;
  ce: OptionContractSide | null;
  pe: OptionContractSide | null;
}

export interface OptionChainPayload {
  underlying: string;
  underlyingName: string;
  exchange: 'NSE' | 'BSE';
  underlyingLtp: number | null;
  lotSize: number;
  strikeStep: number;
  expiryDate: string;
  availableExpiries: string[];
  daysToExpiry: number;
  strikes: OptionChainStrikeRow[];
  pcrOi: number | null;
  pcrVolume: number | null;
  meta: MarketMeta;
}

export interface ServerStudentPortfolio {
  studentId: string;
  virtualCash: number;
  positions: Position[];
  orders: Order[];
  optionPositions?: OptionPosition[];
  optionOrders?: OptionOrder[];
  watchlist: string[];
  journal: TradingJournalEntry[];
  updatedAt: string;
}

export interface ServerCourseProgress {
  studentId: string;
  completedLessons: string[];
  completedModules?: string[];
  completedExercises?: string[];
  quizScores: Record<string, number>;
  moduleQuizScores?: Record<string, number>;
  xpEarnedFromCourse: number;
  lastActiveModuleId?: string;
  lastActiveLessonId?: string;
  streakDays?: number;
  lastStudyDate?: string;
  worksheetDraft?: CompanyWorksheetDraft;
  updatedAt: string;
}

export interface ServerGameScores {
  studentId: string;
  scores: Record<string, GameScoreRecord>;
  totalXpFromGames: number;
  updatedAt: string;
}

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = classroomApi.getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const marketApi = {
  async getInstruments(type?: 'EQUITY' | 'INDEX' | 'ETF', signal?: AbortSignal): Promise<{
    instruments: RegisteredInstrumentItem[];
    growwConfigured: boolean;
    marketOpen: boolean;
  }> {
    const qs = type ? `?type=${encodeURIComponent(type)}` : '';
    const res = await fetch(`/api/market/instruments${qs}`, { signal });
    if (!res.ok) throw new Error('Failed to load instruments');
    return res.json();
  },

  async getQuote(symbol: string, signal?: AbortSignal): Promise<NormalizedMarketQuote> {
    const res = await fetch(`/api/market/quote?symbol=${encodeURIComponent(symbol)}`, { signal });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to load quote for ${symbol}`);
    }
    return res.json();
  },

  async getBatchLtp(
    segment: 'CASH' | 'FNO',
    exchangeSymbols: string[],
    signal?: AbortSignal
  ): Promise<{
    success: boolean;
    data: Record<string, number | null>;
    ltpMap: Record<string, number | null>;
    meta: MarketMeta;
  }> {
    const trimmed = exchangeSymbols.slice(0, 50);
    const res = await fetch(
      `/api/market/ltp?segment=${segment}&exchange_symbols=${encodeURIComponent(trimmed.join(','))}`,
      { signal }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to load batch LTP');
    }
    const raw = await res.json();
    const map = raw.data || raw.ltpMap || {};
    return {
      success: Boolean(raw.success),
      data: map,
      ltpMap: map,
      meta: raw.meta,
    };
  },

  async getHistory(
    symbol: string,
    timeframe: SupportedChartTimeframe = '3M',
    signal?: AbortSignal
  ): Promise<HistoricalChartPayload> {
    const res = await fetch(
      `/api/market/history/${encodeURIComponent(symbol)}?timeframe=${encodeURIComponent(timeframe)}`,
      { signal }
    );
    const data = await res.json();
    if (!res.ok && !data?.meta) {
      throw new Error(data?.error || `Historical chart unavailable for ${symbol}`);
    }
    return data;
  },

  async getOptionChain(
    underlying: string,
    expiryDate?: string,
    signal?: AbortSignal
  ): Promise<OptionChainPayload> {
    const params = new URLSearchParams({ underlying });
    if (expiryDate) params.set('expiry_date', expiryDate);
    const res = await fetch(`/api/market/option-chain?${params.toString()}`, { signal });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Option chain unavailable for ${underlying}`);
    }
    return res.json();
  },

  async getOptionGreeks(
    params: { exchange: 'NSE' | 'BSE'; underlying: string; tradingSymbol: string; expiry: string },
    signal?: AbortSignal
  ): Promise<{ success: boolean; greeks: OptionGreeksData | null; meta: MarketMeta }> {
    const qs = new URLSearchParams({
      exchange: params.exchange,
      underlying: params.underlying,
      trading_symbol: params.tradingSymbol,
      expiry: params.expiry,
    });
    const res = await fetch(`/api/market/greeks?${qs.toString()}`, { signal });
    return res.json();
  },

  // -------------------------------------------------------------------------
  // Authenticated Student State Endpoints (Normalized to Frontend Schema)
  // -------------------------------------------------------------------------
  async getStudentPortfolio(): Promise<ServerStudentPortfolio | null> {
    const token = classroomApi.getAuthToken();
    if (!token) return null;
    const res = await fetch('/api/student/portfolio', { headers: getAuthHeaders() });
    if (!res.ok) return null;
    const raw = await res.json();
    return normalizeServerPortfolio(raw);
  },

  async submitEquityOrder(payload: {
    symbol: string;
    action: 'BUY' | 'SELL';
    type?: 'MARKET' | 'LIMIT' | 'STOP_LOSS';
    quantity: number;
    price: number;
    triggerPrice?: number;
    stopLossPrice?: number;
    rationale?: string;
    emotionalState?: string;
  }): Promise<{ success: boolean; error?: string; order?: Order; portfolio?: ServerStudentPortfolio }> {
    const res = await fetch('/api/student/orders', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Order execution failed' };
    }
    return {
      success: Boolean(data.success),
      order: data.order,
      portfolio: data.portfolio ? normalizeServerPortfolio(data.portfolio) : undefined,
    };
  },

  async submitOptionOrder(payload: {
    underlying: string;
    expiry: string;
    strike: number;
    optionType: 'CE' | 'PE';
    action: 'BUY' | 'SELL';
    lots: number;
    rationale?: string;
  }): Promise<{
    success: boolean;
    error?: string;
    order?: OptionOrder;
    portfolio?: ServerStudentPortfolio;
  }> {
    const res = await fetch('/api/student/options/orders', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Option order execution failed' };
    }
    return {
      success: Boolean(data.success),
      order: data.order ? normalizeOptionOrder(data.order) : undefined,
      portfolio: data.portfolio ? normalizeServerPortfolio(data.portfolio) : undefined,
    };
  },

  async cancelEquityOrder(orderId: string): Promise<{
    success: boolean;
    error?: string;
    portfolio?: ServerStudentPortfolio;
  }> {
    const res = await fetch(`/api/student/orders/${encodeURIComponent(orderId)}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to cancel pending order' };
    }
    return {
      success: Boolean(data.success),
      portfolio: data.portfolio ? normalizeServerPortfolio(data.portfolio) : undefined,
    };
  },

  async updateWatchlist(watchlist: string[]): Promise<string[] | null> {
    const token = classroomApi.getAuthToken();
    if (!token) return null;
    const res = await fetch('/api/student/watchlist', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ watchlist }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.watchlist || watchlist;
  },

  async getCourseProgress(): Promise<ServerCourseProgress | null> {
    const token = classroomApi.getAuthToken();
    if (!token) return null;
    const res = await fetch('/api/student/course-progress', { headers: getAuthHeaders() });
    if (!res.ok) return null;
    const raw = await res.json();
    return normalizeCourseProgress(raw);
  },

  async saveCourseProgress(payload: {
    lessonId?: string;
    score?: number;
    earnedXp?: number;
    moduleId?: string;
    exerciseId?: string;
    moduleCompleted?: boolean;
    moduleQuizScore?: number;
    lastActiveModuleId?: string;
    lastActiveLessonId?: string;
    worksheetDraft?: CompanyWorksheetDraft;
  }): Promise<{ success: boolean; progress?: ServerCourseProgress }> {
    const token = classroomApi.getAuthToken();
    if (!token) return { success: false };
    const res = await fetch('/api/student/course-progress', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { success: false };
    const data = await res.json();
    return {
      success: Boolean(data.success),
      progress: data.progress ? normalizeCourseProgress(data.progress) : undefined,
    };
  },

  async resetCourseProgress(): Promise<{ success: boolean; progress?: ServerCourseProgress }> {
    const token = classroomApi.getAuthToken();
    if (!token) return { success: false };
    const res = await fetch('/api/student/course-progress/reset', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) return { success: false };
    const data = await res.json();
    return {
      success: Boolean(data.success),
      progress: data.progress ? normalizeCourseProgress(data.progress) : undefined,
    };
  },

  async getGameScores(): Promise<ServerGameScores | null> {
    const token = classroomApi.getAuthToken();
    if (!token) return null;
    const res = await fetch('/api/student/game-scores', { headers: getAuthHeaders() });
    if (!res.ok) return null;
    const raw = await res.json();
    return normalizeGameScores(raw);
  },

  async saveGameScore(payload: {
    gameId: string;
    gameTitle: string;
    moduleId: string;
    score: number;
    maxPossibleScore: number;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    completed: boolean;
    xpReward?: number;
  }): Promise<{ success: boolean; entry?: GameScoreRecord; allScores?: ServerGameScores }> {
    const token = classroomApi.getAuthToken();
    if (!token) return { success: false };
    const res = await fetch('/api/student/game-scores', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { success: false };
    const data = await res.json();
    const normalizedAll = data.gameScores
      ? normalizeGameScores(data.gameScores)
      : data.allScores
      ? normalizeGameScores(data.allScores)
      : undefined;
    const entry = normalizedAll?.scores?.[payload.gameId] || (data.entry ? normalizeGameScoreEntry(data.entry) : undefined);
    return {
      success: Boolean(data.success),
      entry,
      allScores: normalizedAll,
    };
  },
};

function normalizeOptionPosition(raw: any): OptionPosition {
  const underlying = String(raw.underlying || 'NIFTY').toUpperCase();
  const expiry = String(raw.expiry || '');
  const strike = Number(raw.strike || 0);
  const optionType: 'CE' | 'PE' = raw.optionType === 'PE' ? 'PE' : 'CE';
  const rawSide = String(raw.side || 'LONG').toUpperCase();
  const side: 'LONG' | 'SHORT' = rawSide === 'SHORT' || rawSide === 'SELL' ? 'SHORT' : 'LONG';

  return {
    contractKey:
      raw.contractKey ||
      raw.id ||
      `${underlying}_${expiry}_${strike}_${optionType}`,
    underlying,
    exchange: raw.exchange === 'BSE' ? 'BSE' : 'NSE',
    expiry,
    strike,
    optionType,
    tradingSymbol: String(raw.tradingSymbol || raw.contractSymbol || `${underlying} ${strike} ${optionType}`),
    side,
    lots: Number(raw.lots || 1),
    lotSize: Number(raw.lotSize || 1),
    quantity: Number(raw.quantity || 1),
    averagePrice: Number(raw.averagePrice ?? raw.averageEntryPremium ?? 0),
    currentPrice: Number(raw.currentPrice ?? raw.currentPremium ?? raw.averageEntryPremium ?? 0),
    marginBlocked: Number(raw.marginBlocked ?? 0),
    unrealizedPnL: Number(raw.unrealizedPnL ?? 0),
    unrealizedPnLPercent: Number(raw.unrealizedPnLPercent ?? 0),
    openedAt: String(raw.openedAt || raw.updatedAt || raw.marketDataTimestamp || new Date().toISOString()),
    dataStatus: raw.dataStatus || raw.dataSource,
  };
}

function normalizeOptionOrder(raw: any): OptionOrder {
  const underlying = String(raw.underlying || 'NIFTY').toUpperCase();
  const expiry = String(raw.expiry || '');
  const strike = Number(raw.strike || 0);
  const optionType: 'CE' | 'PE' = raw.optionType === 'PE' ? 'PE' : 'CE';
  const executionPrice = Number(raw.executionPrice ?? raw.executionPremium ?? raw.premium ?? 0);
  const quantity = Number(raw.quantity || 1);

  return {
    id: String(raw.id || `optord_${Date.now()}`),
    contractKey:
      raw.contractKey ||
      `${underlying}_${expiry}_${strike}_${optionType}`,
    underlying,
    exchange: raw.exchange === 'BSE' ? 'BSE' : 'NSE',
    expiry,
    strike,
    optionType,
    tradingSymbol: String(raw.tradingSymbol || raw.contractSymbol || `${underlying} ${strike} ${optionType}`),
    action: raw.action === 'SELL' ? 'SELL' : 'BUY',
    lots: Number(raw.lots || 1),
    lotSize: Number(raw.lotSize || 1),
    quantity,
    executionPrice,
    premiumTurnover: Number(
      raw.premiumTurnover ?? Math.round(executionPrice * quantity * 100) / 100
    ),
    estimatedCharges: Number(raw.estimatedCharges ?? raw.estimatedFee ?? 0),
    marginImpact: Number(raw.marginImpact ?? raw.marginRequired ?? 0),
    realizedPnL: raw.realizedPnL !== undefined ? Number(raw.realizedPnL) : undefined,
    status: raw.status === 'REJECTED' ? 'REJECTED' : 'EXECUTED',
    timestamp: String(raw.timestamp || new Date().toISOString()),
    rationale: raw.rationale ? String(raw.rationale) : undefined,
    dataStatus: raw.dataStatus || raw.dataSource,
  };
}

function normalizeServerPortfolio(raw: any): ServerStudentPortfolio {
  return {
    studentId: String(raw.studentId || raw.userId || ''),
    virtualCash: Number(raw.virtualCash ?? 100000),
    positions: Array.isArray(raw.positions) ? raw.positions : [],
    orders: Array.isArray(raw.orders) ? raw.orders : [],
    optionPositions: Array.isArray(raw.optionPositions)
      ? raw.optionPositions.map(normalizeOptionPosition)
      : [],
    optionOrders: Array.isArray(raw.optionOrders)
      ? raw.optionOrders.map(normalizeOptionOrder)
      : [],
    watchlist: Array.isArray(raw.watchlist)
      ? raw.watchlist
      : ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'],
    journal: Array.isArray(raw.journal) ? raw.journal : [],
    updatedAt: String(raw.updatedAt || raw.lastUpdated || new Date().toISOString()),
  };
}

function normalizeCourseProgress(raw: any): ServerCourseProgress {
  return {
    studentId: String(raw.studentId || raw.userId || ''),
    completedLessons: Array.isArray(raw.completedLessons) ? raw.completedLessons : [],
    completedModules: Array.isArray(raw.completedModules) ? raw.completedModules : [],
    completedExercises: Array.isArray(raw.completedExercises) ? raw.completedExercises : [],
    quizScores: raw.quizScores || raw.lessonScores || {},
    moduleQuizScores: raw.moduleQuizScores || {},
    xpEarnedFromCourse: Number(raw.xpEarnedFromCourse || 0),
    lastActiveModuleId: raw.lastActiveModuleId || 'module-1',
    lastActiveLessonId: raw.lastActiveLessonId || 'm1-lesson-1',
    streakDays: Number(raw.streakDays || 1),
    lastStudyDate: raw.lastStudyDate,
    worksheetDraft: raw.worksheetDraft,
    updatedAt: String(raw.updatedAt || raw.lastUpdated || new Date().toISOString()),
  };
}

function normalizeGameScoreEntry(raw: any): GameScoreRecord {
  const diff = raw.bestDifficulty || raw.lastDifficulty;
  return {
    gameId: String(raw.gameId || ''),
    gameTitle: String(raw.gameTitle || raw.gameId || ''),
    moduleId: String(raw.moduleId || 'module-1'),
    bestScore: Number(raw.bestScore || 0),
    lastScore: Number(raw.lastScore || 0),
    maxPossibleScore: Number(raw.maxPossibleScore || 100),
    bestDifficulty:
      diff === 'Advanced' ? 'Advanced' : diff === 'Intermediate' ? 'Intermediate' : 'Beginner',
    attemptsCount: Number(raw.attemptsCount ?? raw.attempts ?? 1),
    completed: Boolean(raw.completed),
    lastPlayedAt: String(raw.lastPlayedAt || new Date().toISOString()),
  };
}

function normalizeGameScores(raw: any): ServerGameScores {
  const sourceMap = raw?.scores || raw?.games || {};
  const scores: Record<string, GameScoreRecord> = {};
  for (const key of Object.keys(sourceMap)) {
    scores[key] = normalizeGameScoreEntry(sourceMap[key]);
  }
  return {
    studentId: String(raw?.studentId || raw?.userId || ''),
    scores,
    totalXpFromGames: Number(raw?.totalXpFromGames || 0),
    updatedAt: String(raw?.updatedAt || raw?.lastUpdated || new Date().toISOString()),
  };
}
