import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  PlayerProfile,
  GameId,
  DistrictId,
  StockQuote,
  Order,
  Position,
  OptionPosition,
  OptionOrder,
  CompanyWorksheetDraft,
  GameScoreRecord,
  ActiveMentorContext,
  MistakeEntry,
  MarketWeather,
  DailyQuest,
  AppMode,
} from '../types';
import { INITIAL_STOCKS } from '../data/marketData';
import { PROGRESSION_LEVELS, INITIAL_DAILY_QUESTS } from '../data/curriculum';
import { BEGINNER_MISSIONS } from '../data/missionsData';
import { NCFM_LESSONS } from '../data/ncfmCourseData';
import {
  loadSavedProfile,
  saveProfile,
  DEFAULT_PLAYER_PROFILE,
  clearAllLearningProgress,
} from '../utils/storage';
import { soundEffects, setSoundEnabled } from '../utils/audio';
import { useClassroom } from './ClassroomContext';
import { marketApi, ServerStudentPortfolio } from '../services/marketApi';

interface GameContextType {
  profile: PlayerProfile;
  isHydratingServerState: boolean;
  activeGame: GameId | null;
  activeMissionId: string | null;
  selectedDistrict: DistrictId | null;
  marketWeather: MarketWeather;
  stocks: StockQuote[];
  dailyQuests: DailyQuest[];
  isAIMentorOpen: boolean;
  isAIMentorMinimized: boolean;
  setAIMentorMinimized: (minimized: boolean) => void;
  aiMentorInitialPrompt: string | null;
  openAIMentorWithPrompt: (prompt: string) => void;
  clearAIMentorInitialPrompt: () => void;
  mentorContext: ActiveMentorContext;
  updateMentorContext: (partial: Partial<ActiveMentorContext>) => void;
  navigateTargetModuleId: string | null;
  setNavigateTargetModuleId: (moduleId: string | null) => void;
  navigateTargetTradeSymbol: string | null;
  setNavigateTargetTradeSymbol: (symbol: string | null) => void;
  isProfileModalOpen: boolean;
  isLeaderboardOpen: boolean;
  soundOn: boolean;
  totalPortfolioValue: number;
  totalOptionsUnrealizedPnL: number;
  totalOptionsMarginBlocked: number;
  totalNetWorth: number;
  setActiveGame: (game: GameId | null) => void;
  setActiveMissionId: (missionId: string | null) => void;
  setSelectedDistrict: (district: DistrictId | null) => void;
  setAIMentorOpen: (open: boolean) => void;
  setProfileModalOpen: (open: boolean) => void;
  setLeaderboardOpen: (open: boolean) => void;
  toggleSound: () => void;
  addXP: (amount: number, reason?: string) => void;
  addXp: (amount: number, reason?: string) => void;
  addVirtualCash: (amount: number) => void;
  deductVirtualCash: (amount: number) => boolean;
  addTraderFiTokens: (amount: number) => void;
  spendTraderFiTokens: (amount: number) => boolean;
  recordTournamentResult: (won: boolean, profit: number, rank: number) => void;
  executeTrade: (order: Omit<Order, 'id' | 'timestamp' | 'status'>) => boolean;
  placeEquityOrder: (payload: {
    symbol: string;
    name?: string;
    action: 'BUY' | 'SELL';
    type?: 'MARKET' | 'LIMIT' | 'STOP_LOSS';
    quantity: number;
    price: number;
    triggerPrice?: number;
    stopLossPrice?: number;
    rationale?: string;
    emotionalState?: 'CALM' | 'FOMO' | 'FEARFUL' | 'GREEDY' | 'REVENGE';
  }) => Promise<{ success: boolean; error?: string; order?: Order }>;
  cancelEquityOrder: (orderId: string) => Promise<{ success: boolean; error?: string }>;
  placeOptionOrder: (payload: {
    underlying: string;
    expiry: string;
    strike: number;
    optionType: 'CE' | 'PE';
    action: 'BUY' | 'SELL';
    lots: number;
    rationale?: string;
  }) => Promise<{ success: boolean; error?: string; order?: OptionOrder }>;
  refreshPortfolioFromServer: () => Promise<void>;
  recordMistake: (
    category: MistakeEntry['category'],
    description: string,
    financialLoss: number,
    tip: string
  ) => void;
  completeDailyQuest: (questId: string) => void;
  updateStats: (statDeltas: Partial<PlayerProfile['stats']>) => void;
  resetProgress: () => void;
  // Course & 16-Module Progression Handlers
  setAppMode: (mode: AppMode) => void;
  completeOnboarding: (data: { username: string; avatar: string; nickname?: string }) => void;
  startMission: (missionId: string) => void;
  completeMission: (missionId: string) => void;
  completeNcfmLesson: (lessonId: string, earnedXp: number) => void;
  completeCourseTopic: (topicId: string, earnedXp: number) => void;
  recordLessonProgress: (params: {
    moduleId: string;
    lessonId: string;
    earnedXp?: number;
  }) => Promise<void>;
  recordExerciseCompletion: (params: {
    moduleId: string;
    exerciseId: string;
    earnedXp?: number;
  }) => Promise<void>;
  recordModuleAssessment: (params: {
    moduleId: string;
    scorePercent: number;
    passed: boolean;
    earnedXp?: number;
  }) => Promise<void>;
  setLastActiveCourseLocation: (moduleId: string, lessonId?: string) => void;
  saveCompanyWorksheet: (draft: CompanyWorksheetDraft) => Promise<boolean>;
  recordGameScore: (params: {
    gameId: string;
    gameTitle: string;
    moduleId: string;
    score: number;
    maxPossibleScore: number;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    completed: boolean;
    xpReward?: number;
  }) => Promise<void>;
  resetLearningProgress: () => Promise<void>;
  toggleWatchlist: (symbol: string) => void;
  isNcfmLessonUnlocked: (lessonId: string) => boolean;
  skipTutorialWithDiagnostic: (scorePercent: number) => void;
  isFeatureUnlocked: (featureName: string) => boolean;
  isDistrictUnlocked: (districtId: DistrictId) => boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated } = useClassroom();
  const activeUserId = isAuthenticated && currentUser?.id ? currentUser.id : null;

  const [profile, setProfile] = useState<PlayerProfile>(() => loadSavedProfile(activeUserId));
  const [isHydratingServerState, setIsHydratingServerState] = useState<boolean>(false);
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictId | null>(null);
  const [marketWeather] = useState<MarketWeather>('BULL');
  const [stocks, setStocks] = useState<StockQuote[]>(INITIAL_STOCKS);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(INITIAL_DAILY_QUESTS);
  const [isAIMentorOpen, setAIMentorOpen] = useState(false);
  const [isAIMentorMinimized, setAIMentorMinimized] = useState(false);
  const [aiMentorInitialPrompt, setAiMentorInitialPrompt] = useState<string | null>(null);
  const [mentorContext, setMentorContext] = useState<ActiveMentorContext>({
    currentTab: 'HOME',
    activeModuleId: 'module-1',
    activeModuleTitle: 'Module 1: What Is the Stock Market?',
    selectedSymbol: 'RELIANCE',
    selectedTimeframe: '3M',
    tradingMode: 'EQUITY',
  });
  const [navigateTargetModuleId, setNavigateTargetModuleId] = useState<string | null>(null);
  const [navigateTargetTradeSymbol, setNavigateTargetTradeSymbol] = useState<string | null>(null);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isLeaderboardOpen, setLeaderboardOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  const updateMentorContext = useCallback((partial: Partial<ActiveMentorContext>) => {
    setMentorContext((prev) => ({ ...prev, ...partial }));
  }, []);

  const openAIMentorWithPrompt = (prompt: string) => {
    setAiMentorInitialPrompt(prompt);
    setAIMentorMinimized(false);
    setAIMentorOpen(true);
  };

  const clearAIMentorInitialPrompt = () => {
    setAiMentorInitialPrompt(null);
  };

  const applyServerPortfolioToProfile = useCallback((serverPort: ServerStudentPortfolio) => {
    setProfile((prev) => ({
      ...prev,
      virtualCash: serverPort.virtualCash,
      positions: serverPort.positions || [],
      orders: serverPort.orders || [],
      optionPositions: serverPort.optionPositions || [],
      optionOrders: serverPort.optionOrders || [],
      watchlist: serverPort.watchlist || prev.watchlist || ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'],
      journal: serverPort.journal || prev.journal || [],
    }));
  }, []);

  const refreshPortfolioFromServer = useCallback(async () => {
    if (!activeUserId) return;
    try {
      const serverPort = await marketApi.getStudentPortfolio();
      if (serverPort) {
        applyServerPortfolioToProfile(serverPort);
      }
    } catch (err) {
      console.error('Failed to refresh student portfolio:', err);
    }
  }, [activeUserId, applyServerPortfolioToProfile]);

  // Hydrate authenticated student state from backend on login / session restore / user switch
  useEffect(() => {
    if (!activeUserId || !currentUser) {
      setProfile(DEFAULT_PLAYER_PROFILE);
      setActiveGame(null);
      setActiveMissionId(null);
      return;
    }

    // Load scoped local snapshot immediately for snappy render, then overwrite with authoritative server state
    const localSnapshot = loadSavedProfile(activeUserId);
    setProfile({
      ...localSnapshot,
      id: currentUser.id,
      username: currentUser.name || localSnapshot.username,
      avatar: currentUser.avatar || localSnapshot.avatar,
      xp: currentUser.xp ?? localSnapshot.xp,
      level: currentUser.level ?? localSnapshot.level,
    });

    if (currentUser.role !== 'STUDENT') {
      return;
    }

    let cancelled = false;
    setIsHydratingServerState(true);

    Promise.all([
      marketApi.getStudentPortfolio(),
      marketApi.getCourseProgress(),
      marketApi.getGameScores(),
    ])
      .then(([serverPort, serverCourse, serverGames]) => {
        if (cancelled) return;
        setProfile((prev) => {
          const completedLessons = serverCourse?.completedLessons || prev.completedLessons || [];
          const completedModules = serverCourse?.completedModules || prev.completedModules || [];
          const completedExercises = serverCourse?.completedExercises || prev.completedExercises || [];
          const moduleQuizScores = serverCourse?.moduleQuizScores || prev.moduleQuizScores || {};
          const gameScoresMap: Record<string, GameScoreRecord> =
            serverGames?.scores || prev.gameScores || {};

          return {
            ...prev,
            id: currentUser.id,
            username: currentUser.name || prev.username,
            avatar: currentUser.avatar || prev.avatar,
            xp: Math.max(prev.xp, currentUser.xp || 0),
            level: Math.max(prev.level, currentUser.level || 1),
            virtualCash: serverPort ? serverPort.virtualCash : prev.virtualCash,
            positions: serverPort ? serverPort.positions || [] : prev.positions,
            orders: serverPort ? serverPort.orders || [] : prev.orders,
            optionPositions: serverPort ? serverPort.optionPositions || [] : prev.optionPositions,
            optionOrders: serverPort ? serverPort.optionOrders || [] : prev.optionOrders,
            watchlist: serverPort?.watchlist || prev.watchlist || ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'],
            journal: serverPort?.journal || prev.journal || [],
            completedLessons,
            completedCourseTopics: completedLessons,
            completedModules,
            completedExercises,
            moduleQuizScores,
            lastActiveModuleId:
              serverCourse?.lastActiveModuleId || prev.lastActiveModuleId || 'module-1',
            lastActiveLessonId:
              serverCourse?.lastActiveLessonId || prev.lastActiveLessonId || 'm1-lesson-1',
            streakDays: serverCourse?.streakDays || prev.streakDays || 1,
            worksheetDraft: serverCourse?.worksheetDraft || prev.worksheetDraft,
            gameScores: gameScoresMap,
          };
        });
      })
      .catch((err) => {
        console.error('Error hydrating student state from backend:', err);
      })
      .finally(() => {
        if (!cancelled) setIsHydratingServerState(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeUserId, currentUser?.id, currentUser?.role, currentUser?.name, currentUser?.avatar]);

  // Save per-user local cache whenever profile updates while logged in
  useEffect(() => {
    if (activeUserId) {
      saveProfile(profile, activeUserId);
    }
  }, [profile, activeUserId]);

  // Fetch real/cached batch prices periodically from backend instead of local random fake ticks
  useEffect(() => {
    if (!activeUserId) return;
    let cancelled = false;

    const syncQuotes = async () => {
      try {
        const exchangeSymbols = INITIAL_STOCKS.map((s) => `${s.exchange}_${s.symbol}`);
        const res = await marketApi.getBatchLtp('CASH', exchangeSymbols);
        if (cancelled || !res.success || !res.data) return;

        setStocks((prevStocks) =>
          prevStocks.map((st) => {
            const key = `${st.exchange}_${st.symbol}`;
            const ltp = res.data[key];
            if (typeof ltp === 'number' && ltp > 0) {
              const prevClose = st.price - st.change || st.price;
              const change = Math.round((ltp - prevClose) * 100) / 100;
              const changePercent =
                prevClose > 0 ? Math.round(((change / prevClose) * 100) * 100) / 100 : 0;
              return {
                ...st,
                price: ltp,
                change,
                changePercent,
              };
            }
            return st;
          })
        );
      } catch {
        // Silent fallback if offline
      }
    };

    syncQuotes();
    const timer = setInterval(syncQuotes, 30000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [activeUserId]);

  // Calculate equity holdings value safely
  const totalHoldingsValue = (profile.positions || []).reduce((acc, pos) => {
    const liveStock = stocks.find((s) => s.symbol === pos.symbol);
    const price = liveStock ? liveStock.price : pos.currentPrice;
    return acc + pos.quantity * price;
  }, 0);

  // Calculate open index options metrics
  const optionPositions: OptionPosition[] = profile.optionPositions || [];
  const totalOptionsUnrealizedPnL = optionPositions.reduce(
    (sum, opt) => sum + (opt.unrealizedPnL || 0),
    0
  );
  const totalOptionsMarginBlocked = optionPositions.reduce(
    (sum, opt) => sum + (opt.marginBlocked || 0),
    0
  );
  const longOptionsLiquidationValue = optionPositions
    .filter((o) => o.side === 'LONG')
    .reduce((sum, o) => sum + o.currentPrice * o.quantity, 0);
  const shortOptionsEquityValue = optionPositions
    .filter((o) => o.side === 'SHORT')
    .reduce((sum, o) => sum + o.marginBlocked + o.unrealizedPnL, 0);

  const totalPortfolioValue =
    totalHoldingsValue + longOptionsLiquidationValue + shortOptionsEquityValue;
  const totalNetWorth = profile.virtualCash + totalPortfolioValue;

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) soundEffects.click();
  };

  const addXP = useCallback((amount: number, _reason?: string) => {
    setProfile((prev) => {
      const newXp = prev.xp + amount;
      let newLevel = prev.level;

      const currentLevelDef = PROGRESSION_LEVELS.find((l) => l.level === prev.level);
      if (currentLevelDef && newXp >= currentLevelDef.maxXp && prev.level < 11) {
        newLevel = prev.level + 1;
        soundEffects.levelUp();
        try {
          confetti({
            particleCount: 120,
            spread: 85,
            origin: { y: 0.5 },
          });
        } catch {}
      } else if (amount > 0) {
        soundEffects.correct();
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
      };
    });
  }, []);

  const addVirtualCash = (amount: number) => {
    soundEffects.cashTrade();
    setProfile((prev) => ({
      ...prev,
      virtualCash: prev.virtualCash + amount,
    }));
  };

  const deductVirtualCash = (amount: number): boolean => {
    if (profile.virtualCash < amount) {
      soundEffects.wrong();
      return false;
    }
    setProfile((prev) => ({
      ...prev,
      virtualCash: prev.virtualCash - amount,
    }));
    return true;
  };

  const addTraderFiTokens = (amount: number) => {
    soundEffects.levelUp();
    setProfile((prev) => ({
      ...prev,
      traderFiTokens: (prev.traderFiTokens ?? 100) + amount,
    }));
  };

  const spendTraderFiTokens = (amount: number): boolean => {
    if ((profile.traderFiTokens ?? 100) < amount) {
      soundEffects.wrong();
      return false;
    }
    soundEffects.cashTrade();
    setProfile((prev) => ({
      ...prev,
      traderFiTokens: Math.max(0, (prev.traderFiTokens ?? 100) - amount),
    }));
    return true;
  };

  const recordTournamentResult = (won: boolean, _profit: number, _rank: number) => {
    setProfile((prev) => ({
      ...prev,
      tournamentsPlayed: (prev.tournamentsPlayed ?? 0) + 1,
      tournamentsWon: won ? (prev.tournamentsWon ?? 0) + 1 : prev.tournamentsWon ?? 0,
    }));
  };

  // Server-persisted Equity Order execution
  const placeEquityOrder = useCallback(
    async (payload: {
      symbol: string;
      name?: string;
      action: 'BUY' | 'SELL';
      type?: 'MARKET' | 'LIMIT' | 'STOP_LOSS';
      quantity: number;
      price: number;
      triggerPrice?: number;
      stopLossPrice?: number;
        rationale?: string;
        emotionalState?: 'CALM' | 'FOMO' | 'FEARFUL' | 'GREEDY' | 'REVENGE';
      }): Promise<{ success: boolean; error?: string; order?: Order }> => {
        if (activeUserId) {
          const res = await marketApi.submitEquityOrder({
            symbol: payload.symbol,
            action: payload.action,
            type: payload.type || 'MARKET',
            quantity: payload.quantity,
            price: payload.price,
            triggerPrice: payload.triggerPrice,
            stopLossPrice: payload.stopLossPrice,
            rationale: payload.rationale,
            emotionalState: payload.emotionalState,
          });
          if (!res.success) {
            soundEffects.wrong();
            return { success: false, error: res.error || 'Order rejected by trading engine.' };
          }
          if (res.portfolio) {
            applyServerPortfolioToProfile(res.portfolio);
          }
          soundEffects.cashTrade();
          addXP(25, 'Equity Paper Order Executed');
          return { success: true, order: res.order };
        }

        // Unauthenticated local fallback
        const ok = executeTrade({
          symbol: payload.symbol,
          name: payload.name || payload.symbol,
          action: payload.action,
          type: payload.type || 'MARKET',
          quantity: payload.quantity,
          price: payload.price,
          stopLossPrice: payload.stopLossPrice,
          rationale: payload.rationale,
          emotionalState: payload.emotionalState,
        });
        return ok
          ? {
              success: true,
              order: {
                id: `ord-local-${Date.now()}`,
                symbol: payload.symbol,
                name: payload.name || payload.symbol,
                action: payload.action,
                type: payload.type || 'MARKET',
                quantity: payload.quantity,
                price: payload.price,
                executionPrice: payload.price,
                status: 'EXECUTED',
                timestamp: new Date().toISOString(),
              },
            }
          : { success: false, error: 'Insufficient cash or holdings.' };
      },
      [activeUserId, applyServerPortfolioToProfile, addXP]
    );

    const cancelEquityOrder = useCallback(
      async (orderId: string): Promise<{ success: boolean; error?: string }> => {
        if (!activeUserId) {
          setProfile((prev) => ({
            ...prev,
            orders: (prev.orders || []).map((o) =>
              o.id === orderId ? { ...o, status: 'CANCELLED' } : o
            ),
          }));
          return { success: true };
        }
        const res = await marketApi.cancelEquityOrder(orderId);
        if (!res.success) {
          soundEffects.wrong();
          return { success: false, error: res.error || 'Unable to cancel order.' };
        }
        if (res.portfolio) {
          applyServerPortfolioToProfile(res.portfolio);
        }
        soundEffects.click();
        return { success: true };
      },
      [activeUserId, applyServerPortfolioToProfile]
    );

  // Server-persisted Index Options Order execution
  const placeOptionOrder = useCallback(
    async (payload: {
      underlying: string;
      expiry: string;
      strike: number;
      optionType: 'CE' | 'PE';
      action: 'BUY' | 'SELL';
      lots: number;
      rationale?: string;
    }): Promise<{ success: boolean; error?: string; order?: OptionOrder }> => {
      const res = await marketApi.submitOptionOrder(payload);
      if (!res.success) {
        soundEffects.wrong();
        return { success: false, error: res.error || 'Option order rejected.' };
      }
      if (res.portfolio) {
        applyServerPortfolioToProfile(res.portfolio);
      }
      soundEffects.cashTrade();
      addXP(35, 'Index Option Paper Order Executed');
      return { success: true, order: res.order };
    },
    [applyServerPortfolioToProfile, addXP]
  );

  // Synchronous compatibility wrapper (triggers server persistence when logged in)
  const executeTrade = (orderParams: Omit<Order, 'id' | 'timestamp' | 'status'>): boolean => {
    if (activeUserId) {
      marketApi
        .submitEquityOrder({
          symbol: orderParams.symbol,
          action: orderParams.action,
          type:
            orderParams.type === 'STOP_LIMIT'
              ? 'STOP_LOSS'
              : (orderParams.type as 'MARKET' | 'LIMIT' | 'STOP_LOSS'),
          quantity: orderParams.quantity,
          price: orderParams.price,
          stopLossPrice: orderParams.stopLossPrice,
          rationale: orderParams.rationale,
          emotionalState: orderParams.emotionalState,
        })
        .then((res) => {
          if (res.success && res.portfolio) {
            applyServerPortfolioToProfile(res.portfolio);
          }
        })
        .catch(console.error);
    }

    const totalCost = orderParams.quantity * orderParams.price;
    if (orderParams.action === 'BUY') {
      if (profile.virtualCash < totalCost) {
        soundEffects.wrong();
        return false;
      }
      soundEffects.cashTrade();
      setProfile((prev) => {
        const remainingCash = prev.virtualCash - totalCost;
        const existingPosIndex = prev.positions.findIndex((p) => p.symbol === orderParams.symbol);
        const updatedPositions: Position[] = [...prev.positions];

        if (existingPosIndex >= 0) {
          const existing = updatedPositions[existingPosIndex];
          const newQty = existing.quantity + orderParams.quantity;
          const newAvg = (existing.quantity * existing.averageBuyPrice + totalCost) / newQty;
          updatedPositions[existingPosIndex] = {
            ...existing,
            quantity: newQty,
            averageBuyPrice: Math.round(newAvg * 100) / 100,
            investedValue: Math.round(newQty * newAvg * 100) / 100,
            currentPrice: orderParams.price,
            currentValue: Math.round(newQty * orderParams.price * 100) / 100,
          };
        } else {
          updatedPositions.push({
            symbol: orderParams.symbol,
            name: orderParams.name,
            quantity: orderParams.quantity,
            averageBuyPrice: orderParams.price,
            currentPrice: orderParams.price,
            investedValue: totalCost,
            currentValue: totalCost,
            unrealizedPnL: 0,
            unrealizedPnLPercent: 0,
          });
        }

        const newOrder: Order = {
          ...orderParams,
          id: `ord-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'EXECUTED',
          executionPrice: orderParams.price,
        };

        return {
          ...prev,
          virtualCash: remainingCash,
          positions: updatedPositions,
          orders: [newOrder, ...prev.orders],
        };
      });
      addXP(25, 'Virtual Trade Executed');
      return true;
    } else {
      const existingPos = profile.positions.find((p) => p.symbol === orderParams.symbol);
      if (!existingPos || existingPos.quantity < orderParams.quantity) {
        soundEffects.wrong();
        return false;
      }
      soundEffects.cashTrade();
      const proceeds = orderParams.quantity * orderParams.price;
      setProfile((prev) => {
        let updatedPositions = [...prev.positions];
        const idx = updatedPositions.findIndex((p) => p.symbol === orderParams.symbol);
        if (idx >= 0) {
          const current = updatedPositions[idx];
          const newQty = current.quantity - orderParams.quantity;
          if (newQty <= 0) {
            updatedPositions = updatedPositions.filter((p) => p.symbol !== orderParams.symbol);
          } else {
            updatedPositions[idx] = {
              ...current,
              quantity: newQty,
              investedValue: Math.round(newQty * current.averageBuyPrice * 100) / 100,
              currentValue: Math.round(newQty * orderParams.price * 100) / 100,
            };
          }
        }
        const newOrder: Order = {
          ...orderParams,
          id: `ord-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'EXECUTED',
          executionPrice: orderParams.price,
        };
        return {
          ...prev,
          virtualCash: prev.virtualCash + proceeds,
          positions: updatedPositions,
          orders: [newOrder, ...prev.orders],
        };
      });
      addXP(30, 'Sell Order Completed');
      return true;
    }
  };

  const recordMistake = (
    category: MistakeEntry['category'],
    description: string,
    financialLoss: number,
    tip: string
  ) => {
    setProfile((prev) => {
      const existing = prev.mistakes.find((m) => m.category === category);
      const updatedMistakes: MistakeEntry[] = existing
        ? prev.mistakes.map((m) =>
            m.category === category
              ? {
                  ...m,
                  count: m.count + 1,
                  lastOccurred: new Date().toISOString(),
                  financialImpactVirtual: m.financialImpactVirtual + financialLoss,
                  description,
                  remedyTip: tip,
                }
              : m
          )
        : [
            ...prev.mistakes,
            {
              id: `mst-${Date.now()}`,
              category,
              count: 1,
              lastOccurred: new Date().toISOString(),
              description,
              financialImpactVirtual: financialLoss,
              remedyTip: tip,
            },
          ];
      return { ...prev, mistakes: updatedMistakes };
    });
  };

  const completeDailyQuest = (questId: string) => {
    setDailyQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId && !q.completed) {
          addXP(q.xpReward);
          addVirtualCash(q.cashReward);
          return { ...q, completed: true, current: q.target };
        }
        return q;
      })
    );
  };

  const updateStats = (statDeltas: Partial<PlayerProfile['stats']>) => {
    setProfile((prev) => {
      const newStats = { ...prev.stats };
      Object.keys(statDeltas).forEach((key) => {
        const k = key as keyof PlayerProfile['stats'];
        newStats[k] = Math.min(100, Math.max(0, (newStats[k] || 0) + (statDeltas[k] || 0)));
      });
      return { ...prev, stats: newStats };
    });
  };

  const resetProgress = () => {
    setProfile(DEFAULT_PLAYER_PROFILE);
    saveProfile(DEFAULT_PLAYER_PROFILE, activeUserId);
    setActiveGame(null);
    setActiveMissionId(null);
    soundEffects.click();
  };

  const setAppMode = (mode: AppMode) => {
    soundEffects.click();
    setProfile((prev) => ({
      ...prev,
      appMode: mode,
    }));
    updateMentorContext({ currentTab: mode });
  };

  const completeOnboarding = (data: { username: string; avatar: string; nickname?: string }) => {
    soundEffects.levelUp();
    setProfile((prev) => ({
      ...prev,
      username: data.username.trim() || 'MarketExplorer',
      avatar: data.avatar || '🦁',
      nickname: data.nickname?.trim() || 'Rookie Trader',
      hasCompletedOnboarding: true,
      appMode: 'HOME',
    }));
  };

  const startMission = (missionId: string) => {
    soundEffects.click();
    setActiveMissionId(missionId);
    setActiveGame(null);
  };

  const completeMission = (missionId: string) => {
    const mission = BEGINNER_MISSIONS.find((m) => m.id === missionId);
    if (!mission) return;
    soundEffects.levelUp();
    setProfile((prev) => {
      const alreadyCompleted = prev.completedMissions.includes(missionId);
      const updatedCompleted = alreadyCompleted
        ? prev.completedMissions
        : [...prev.completedMissions, missionId];
      return {
        ...prev,
        xp: prev.xp + mission.xpReward,
        virtualCash: prev.virtualCash + mission.cashReward,
        completedMissions: updatedCompleted,
      };
    });
  };

  const isNcfmLessonUnlocked = (lessonId: string): boolean => {
    const lesson = NCFM_LESSONS.find((l) => l.id === lessonId);
    if (!lesson) return false;
    if (lesson.prerequisites.length === 0) return true;
    const completed = profile.completedNcfmLessons || [];
    return lesson.prerequisites.every((pId) => completed.includes(pId));
  };

  const completeNcfmLesson = (lessonId: string, earnedXp: number) => {
    setProfile((prev) => {
      const alreadyCompleted = (prev.completedNcfmLessons || []).includes(lessonId);
      if (alreadyCompleted) return prev;
      return {
        ...prev,
        xp: prev.xp + earnedXp,
        completedNcfmLessons: [...(prev.completedNcfmLessons || []), lessonId],
      };
    });
  };

  const completeCourseTopic = (topicId: string, earnedXp: number) => {
    setProfile((prev) => {
      const alreadyCompleted = (prev.completedCourseTopics || []).includes(topicId);
      if (alreadyCompleted) return prev;
      const updated = [...(prev.completedCourseTopics || []), topicId];
      return {
        ...prev,
        xp: prev.xp + earnedXp,
        completedCourseTopics: updated,
        completedLessons: Array.from(new Set([...(prev.completedLessons || []), topicId])),
      };
    });
    if (activeUserId) {
      marketApi
        .saveCourseProgress({ lessonId: topicId, score: 100, earnedXp })
        .catch(console.error);
    }
    soundEffects.correct();
  };

  // 16-Module Lesson Completion (Server-Persisted)
  const recordLessonProgress = useCallback(
    async (params: { moduleId: string; lessonId: string; earnedXp?: number }) => {
      const xpToAward = params.earnedXp ?? 25;
      let isNew = false;

      setProfile((prev) => {
        const existingLessons = prev.completedLessons || [];
        isNew = !existingLessons.includes(params.lessonId);
        const nextLessons = isNew ? [...existingLessons, params.lessonId] : existingLessons;
        return {
          ...prev,
          completedLessons: nextLessons,
          completedCourseTopics: nextLessons,
          lastActiveModuleId: params.moduleId,
          lastActiveLessonId: params.lessonId,
          xp: isNew ? prev.xp + xpToAward : prev.xp,
        };
      });

      if (isNew) {
        soundEffects.correct();
      }

      if (activeUserId) {
        const res = await marketApi.saveCourseProgress({
          moduleId: params.moduleId,
          lessonId: params.lessonId,
          earnedXp: isNew ? xpToAward : 0,
          lastActiveModuleId: params.moduleId,
          lastActiveLessonId: params.lessonId,
        });
        if (res.success && res.progress) {
          setProfile((prev) => ({
            ...prev,
            completedLessons: res.progress!.completedLessons || prev.completedLessons,
            completedModules: res.progress!.completedModules || prev.completedModules,
            completedExercises: res.progress!.completedExercises || prev.completedExercises,
            streakDays: res.progress!.streakDays || prev.streakDays,
          }));
        }
      }
    },
    [activeUserId]
  );

  // 16-Module Interactive Exercise Completion (Server-Persisted)
  const recordExerciseCompletion = useCallback(
    async (params: { moduleId: string; exerciseId: string; earnedXp?: number }) => {
      const xpToAward = params.earnedXp ?? 35;
      let isNew = false;

      setProfile((prev) => {
        const existing = prev.completedExercises || [];
        isNew = !existing.includes(params.exerciseId);
        return {
          ...prev,
          completedExercises: isNew ? [...existing, params.exerciseId] : existing,
          lastActiveModuleId: params.moduleId,
          xp: isNew ? prev.xp + xpToAward : prev.xp,
        };
      });

      if (isNew) {
        soundEffects.correct();
      }

      if (activeUserId) {
        const res = await marketApi.saveCourseProgress({
          moduleId: params.moduleId,
          exerciseId: params.exerciseId,
          earnedXp: isNew ? xpToAward : 0,
          lastActiveModuleId: params.moduleId,
        });
        if (res.success && res.progress) {
          setProfile((prev) => ({
            ...prev,
            completedExercises: res.progress!.completedExercises || prev.completedExercises,
          }));
        }
      }
    },
    [activeUserId]
  );

  // 16-Module Assessment & Module Completion (Server-Persisted)
  const recordModuleAssessment = useCallback(
    async (params: {
      moduleId: string;
      scorePercent: number;
      passed: boolean;
      earnedXp?: number;
    }) => {
      const xpToAward = params.passed ? params.earnedXp ?? 120 : 15;
      let newlyCompletedModule = false;

      setProfile((prev) => {
        const existingModules = prev.completedModules || [];
        newlyCompletedModule = params.passed && !existingModules.includes(params.moduleId);
        const nextModules = newlyCompletedModule
          ? [...existingModules, params.moduleId]
          : existingModules;
        const prevBest = (prev.moduleQuizScores || {})[params.moduleId] ?? 0;

        return {
          ...prev,
          completedModules: nextModules,
          moduleQuizScores: {
            ...(prev.moduleQuizScores || {}),
            [params.moduleId]: Math.max(prevBest, params.scorePercent),
          },
          lastActiveModuleId: params.moduleId,
          xp: newlyCompletedModule ? prev.xp + xpToAward : prev.xp,
        };
      });

      if (newlyCompletedModule) {
        soundEffects.levelUp();
        try {
          confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
        } catch {}
      } else if (params.passed) {
        soundEffects.correct();
      }

      if (activeUserId) {
        const res = await marketApi.saveCourseProgress({
          moduleId: params.moduleId,
          moduleCompleted: params.passed,
          moduleQuizScore: params.scorePercent,
          earnedXp: newlyCompletedModule ? xpToAward : 0,
          lastActiveModuleId: params.moduleId,
        });
        if (res.success && res.progress) {
          setProfile((prev) => ({
            ...prev,
            completedModules: res.progress!.completedModules || prev.completedModules,
            moduleQuizScores: res.progress!.moduleQuizScores || prev.moduleQuizScores,
            streakDays: res.progress!.streakDays || prev.streakDays,
          }));
        }
      }
    },
    [activeUserId]
  );

  const setLastActiveCourseLocation = useCallback(
    (moduleId: string, lessonId?: string) => {
      setProfile((prev) => ({
        ...prev,
        lastActiveModuleId: moduleId,
        lastActiveLessonId: lessonId || prev.lastActiveLessonId,
      }));
      if (activeUserId) {
        marketApi
          .saveCourseProgress({
            lastActiveModuleId: moduleId,
            lastActiveLessonId: lessonId,
          })
          .catch(() => {});
      }
    },
    [activeUserId]
  );

  const saveCompanyWorksheet = useCallback(
    async (draft: CompanyWorksheetDraft): Promise<boolean> => {
      setProfile((prev) => ({
        ...prev,
        worksheetDraft: draft,
      }));
      if (!activeUserId) return true;
      const res = await marketApi.saveCourseProgress({
        worksheetDraft: draft,
      });
      return res.success;
    },
    [activeUserId]
  );

  const recordGameScore = useCallback(
    async (params: {
      gameId: string;
      gameTitle: string;
      moduleId: string;
      score: number;
      maxPossibleScore: number;
      difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
      completed: boolean;
      xpReward?: number;
    }) => {
      const xpToAward = params.completed ? params.xpReward ?? 80 : 25;
      addXP(xpToAward, `Completed ${params.gameTitle}`);

      setProfile((prev) => {
        const prevMap = prev.gameScores || {};
        const existing = prevMap[params.gameId];
        const nextEntry: GameScoreRecord = {
          gameId: params.gameId,
          gameTitle: params.gameTitle,
          moduleId: params.moduleId,
          bestScore: existing ? Math.max(existing.bestScore, params.score) : params.score,
          lastScore: params.score,
          maxPossibleScore: params.maxPossibleScore,
          bestDifficulty: params.difficulty,
          attemptsCount: (existing?.attemptsCount || 0) + 1,
          completed: Boolean(existing?.completed || params.completed),
          lastPlayedAt: new Date().toISOString(),
        };
        return {
          ...prev,
          gameScores: {
            ...prevMap,
            [params.gameId]: nextEntry,
          },
        };
      });

      if (activeUserId) {
        const res = await marketApi.saveGameScore(params);
        if (res.success && res.allScores) {
          setProfile((prev) => ({
            ...prev,
            gameScores: res.allScores!.scores,
          }));
        }
      }
    },
    [activeUserId, addXP]
  );

  const resetLearningProgress = async () => {
    clearAllLearningProgress(activeUserId);
    if (activeUserId) {
      await marketApi.resetCourseProgress();
    }
    setProfile((prev) => ({
      ...prev,
      completedCourseTopics: [],
      completedModules: [],
      completedLessons: [],
      completedExercises: [],
      moduleQuizScores: {},
      lastActiveModuleId: 'module-1',
      lastActiveLessonId: 'm1-lesson-1',
      completedMissions: [],
      completedNcfmLessons: [],
    }));
    soundEffects.click();
  };

  const toggleWatchlist = (symbol: string) => {
    soundEffects.click();
    setProfile((prev) => {
      const list = prev.watchlist || ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'];
      const nextList = list.includes(symbol)
        ? list.filter((s) => s !== symbol)
        : [...list, symbol];
      if (activeUserId) {
        marketApi.updateWatchlist(nextList).catch(console.error);
      }
      return {
        ...prev,
        watchlist: nextList,
      };
    });
  };

  const skipTutorialWithDiagnostic = (scorePercent: number) => {
    soundEffects.levelUp();
    setProfile((prev) => ({
      ...prev,
      hasCompletedOnboarding: true,
      appMode: scorePercent >= 75 ? 'FREE' : 'JOURNEY',
    }));
  };

  const isFeatureUnlocked = (_featureName: string): boolean => {
    return true;
  };

  const isDistrictUnlocked = (_districtId: DistrictId): boolean => {
    return true;
  };

  return (
    <GameContext.Provider
      value={{
        profile,
        isHydratingServerState,
        activeGame,
        activeMissionId,
        selectedDistrict,
        marketWeather,
        stocks,
        dailyQuests,
        isAIMentorOpen,
        isAIMentorMinimized,
        setAIMentorMinimized,
        aiMentorInitialPrompt,
        openAIMentorWithPrompt,
        clearAIMentorInitialPrompt,
        mentorContext,
        updateMentorContext,
        navigateTargetModuleId,
        setNavigateTargetModuleId,
        navigateTargetTradeSymbol,
        setNavigateTargetTradeSymbol,
        isProfileModalOpen,
        isLeaderboardOpen,
        soundOn,
        totalPortfolioValue,
        totalOptionsUnrealizedPnL,
        totalOptionsMarginBlocked,
        totalNetWorth,
        setActiveGame,
        setActiveMissionId,
        setSelectedDistrict,
        setAIMentorOpen,
        setProfileModalOpen,
        setLeaderboardOpen,
        toggleSound,
        addXP,
        addXp: addXP,
        addVirtualCash,
        deductVirtualCash,
        addTraderFiTokens,
        spendTraderFiTokens,
        recordTournamentResult,
        executeTrade,
        placeEquityOrder,
        cancelEquityOrder,
        placeOptionOrder,
        refreshPortfolioFromServer,
        recordMistake,
        completeDailyQuest,
        updateStats,
        resetProgress,
        setAppMode,
        completeOnboarding,
        startMission,
        completeMission,
        completeNcfmLesson,
        completeCourseTopic,
        recordLessonProgress,
        recordExerciseCompletion,
        recordModuleAssessment,
        setLastActiveCourseLocation,
        saveCompanyWorksheet,
        recordGameScore,
        resetLearningProgress,
        toggleWatchlist,
        isNcfmLessonUnlocked,
        skipTutorialWithDiagnostic,
        isFeatureUnlocked,
        isDistrictUnlocked,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
