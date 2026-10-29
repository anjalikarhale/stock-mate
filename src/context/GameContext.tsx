import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  PlayerProfile,
  GameId,
  DistrictId,
  StockQuote,
  Order,
  Position,
  TradingJournalEntry,
  MistakeEntry,
  MarketWeather,
  DailyQuest,
  AppMode
} from '../types';
import { INITIAL_STOCKS } from '../data/marketData';
import { PROGRESSION_LEVELS, INITIAL_DAILY_QUESTS } from '../data/curriculum';
import { BEGINNER_MISSIONS } from '../data/missionsData';
import { NCFM_LESSONS } from '../data/ncfmCourseData';
import { loadSavedProfile, saveProfile, DEFAULT_PLAYER_PROFILE, clearAllLearningProgress } from '../utils/storage';
import { soundEffects, isSoundEnabled, setSoundEnabled } from '../utils/audio';

interface GameContextType {
  profile: PlayerProfile;
  activeGame: GameId | null;
  activeMissionId: string | null;
  selectedDistrict: DistrictId | null;
  marketWeather: MarketWeather;
  stocks: StockQuote[];
  dailyQuests: DailyQuest[];
  isAIMentorOpen: boolean;
  aiMentorInitialPrompt: string | null;
  openAIMentorWithPrompt: (prompt: string) => void;
  clearAIMentorInitialPrompt: () => void;
  isProfileModalOpen: boolean;
  isLeaderboardOpen: boolean;
  soundOn: boolean;
  totalPortfolioValue: number;
  totalNetWorth: number;
  setActiveGame: (game: GameId | null) => void;
  setActiveMissionId: (missionId: string | null) => void;
  setSelectedDistrict: (district: DistrictId | null) => void;
  setAIMentorOpen: (open: boolean) => void;
  setProfileModalOpen: (open: boolean) => void;
  setLeaderboardOpen: (open: boolean) => void;
  toggleSound: () => void;
  addXP: (amount: number, reason?: string) => void;
  addVirtualCash: (amount: number) => void;
  deductVirtualCash: (amount: number) => boolean;
  addTraderFiTokens: (amount: number) => void;
  spendTraderFiTokens: (amount: number) => boolean;
  recordTournamentResult: (won: boolean, profit: number, rank: number) => void;
  executeTrade: (order: Omit<Order, 'id' | 'timestamp' | 'status'>) => boolean;
  recordMistake: (category: MistakeEntry['category'], description: string, financialLoss: number, tip: string) => void;
  completeDailyQuest: (questId: string) => void;
  updateStats: (statDeltas: Partial<PlayerProfile['stats']>) => void;
  resetProgress: () => void;
  // Journey & Progressive Unlock Handlers
  setAppMode: (mode: AppMode) => void;
  completeOnboarding: (data: { username: string; avatar: string; nickname?: string }) => void;
  startMission: (missionId: string) => void;
  completeMission: (missionId: string) => void;
  completeNcfmLesson: (lessonId: string, earnedXp: number) => void;
  completeCourseTopic: (topicId: string, earnedXp: number) => void;
  resetLearningProgress: () => void;
  toggleWatchlist: (symbol: string) => void;
  isNcfmLessonUnlocked: (lessonId: string) => boolean;
  skipTutorialWithDiagnostic: (scorePercent: number) => void;
  isFeatureUnlocked: (featureName: string) => boolean;
  isDistrictUnlocked: (districtId: DistrictId) => boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<PlayerProfile>(loadSavedProfile);
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictId | null>(null);
  const [marketWeather, setMarketWeather] = useState<MarketWeather>('BULL');
  const [stocks, setStocks] = useState<StockQuote[]>(INITIAL_STOCKS);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(INITIAL_DAILY_QUESTS);
  const [isAIMentorOpen, setAIMentorOpen] = useState(false);
  const [aiMentorInitialPrompt, setAiMentorInitialPrompt] = useState<string | null>(null);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isLeaderboardOpen, setLeaderboardOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  const openAIMentorWithPrompt = (prompt: string) => {
    setAiMentorInitialPrompt(prompt);
    setAIMentorOpen(true);
  };

  const clearAIMentorInitialPrompt = () => {
    setAiMentorInitialPrompt(null);
  };

  // Auto-save on state change
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  // Periodic subtle market fluctuations (Simulated live ticks)
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prevStocks =>
        prevStocks.map(stock => {
          const deltaPct = (Math.random() - 0.49) * 0.003;
          const newPrice = Math.round((stock.price * (1 + deltaPct)) * 100) / 100;
          const change = Math.round((newPrice - (stock.price - stock.change)) * 100) / 100;
          const changePercent = Math.round(((change / (newPrice - change)) * 100) * 100) / 100;
          return {
            ...stock,
            price: newPrice,
            change,
            changePercent,
          };
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Calculate holdings value
  const totalHoldingsValue = profile.positions.reduce((acc, pos) => {
    const liveStock = stocks.find(s => s.symbol === pos.symbol);
    const price = liveStock ? liveStock.price : pos.currentPrice;
    return acc + pos.quantity * price;
  }, 0);

  const totalPortfolioValue = totalHoldingsValue;
  const totalNetWorth = profile.virtualCash + totalHoldingsValue;

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) soundEffects.click();
  };

  const addXP = (amount: number, _reason?: string) => {
    setProfile(prev => {
      const newXp = prev.xp + amount;
      let newLevel = prev.level;
      
      const currentLevelDef = PROGRESSION_LEVELS.find(l => l.level === prev.level);
      if (currentLevelDef && newXp >= currentLevelDef.maxXp && prev.level < 11) {
        newLevel = prev.level + 1;
        soundEffects.levelUp();
        try {
          confetti({
            particleCount: 140,
            spread: 90,
            origin: { y: 0.5 }
          });
        } catch {}
      } else {
        soundEffects.correct();
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
      };
    });
  };

  const addVirtualCash = (amount: number) => {
    soundEffects.cashTrade();
    setProfile(prev => ({
      ...prev,
      virtualCash: prev.virtualCash + amount,
    }));
  };

  const deductVirtualCash = (amount: number): boolean => {
    if (profile.virtualCash < amount) {
      soundEffects.wrong();
      return false;
    }
    setProfile(prev => ({
      ...prev,
      virtualCash: prev.virtualCash - amount,
    }));
    return true;
  };

  const addTraderFiTokens = (amount: number) => {
    soundEffects.levelUp();
    setProfile(prev => ({
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
    setProfile(prev => ({
      ...prev,
      traderFiTokens: Math.max(0, (prev.traderFiTokens ?? 100) - amount),
    }));
    return true;
  };

  const recordTournamentResult = (won: boolean, _profit: number, _rank: number) => {
    setProfile(prev => ({
      ...prev,
      tournamentsPlayed: (prev.tournamentsPlayed ?? 0) + 1,
      tournamentsWon: won ? (prev.tournamentsWon ?? 0) + 1 : (prev.tournamentsWon ?? 0),
    }));
  };

  const executeTrade = (orderParams: Omit<Order, 'id' | 'timestamp' | 'status'>): boolean => {
    const totalCost = orderParams.quantity * orderParams.price;

    if (orderParams.action === 'BUY') {
      if (profile.virtualCash < totalCost) {
        soundEffects.wrong();
        return false;
      }

      soundEffects.cashTrade();
      setProfile(prev => {
        const remainingCash = prev.virtualCash - totalCost;
        const existingPosIndex = prev.positions.findIndex(p => p.symbol === orderParams.symbol);
        let updatedPositions = [...prev.positions];

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

        const newJournalEntry: TradingJournalEntry = {
          id: `jnl-${Date.now()}`,
          orderId: newOrder.id,
          timestamp: newOrder.timestamp,
          symbol: orderParams.symbol,
          action: 'BUY',
          price: orderParams.price,
          quantity: orderParams.quantity,
          strategy: orderParams.rationale || 'Market Execution',
          reason: orderParams.rationale || 'Technical / Fundamental setup',
          emotionalState: orderParams.emotionalState || 'CALM',
        };

        return {
          ...prev,
          virtualCash: remainingCash,
          positions: updatedPositions,
          orders: [newOrder, ...prev.orders],
          journal: [newJournalEntry, ...prev.journal],
        };
      });

      addXP(25, 'Virtual Trade Executed');
      return true;
    } else {
      // SELL ACTION
      const existingPos = profile.positions.find(p => p.symbol === orderParams.symbol);
      if (!existingPos || existingPos.quantity < orderParams.quantity) {
        soundEffects.wrong();
        return false;
      }

      soundEffects.cashTrade();
      const proceeds = orderParams.quantity * orderParams.price;
      const costBasis = orderParams.quantity * existingPos.averageBuyPrice;
      const realizedPnL = proceeds - costBasis;

      setProfile(prev => {
        let updatedPositions = [...prev.positions];
        const idx = updatedPositions.findIndex(p => p.symbol === orderParams.symbol);
        if (idx >= 0) {
          const current = updatedPositions[idx];
          const newQty = current.quantity - orderParams.quantity;
          if (newQty <= 0) {
            updatedPositions = updatedPositions.filter(p => p.symbol !== orderParams.symbol);
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

        const newJournalEntry: TradingJournalEntry = {
          id: `jnl-${Date.now()}`,
          orderId: newOrder.id,
          timestamp: newOrder.timestamp,
          symbol: orderParams.symbol,
          action: 'SELL',
          price: orderParams.price,
          quantity: orderParams.quantity,
          strategy: orderParams.rationale || 'Profit Taking / Stop Exit',
          reason: orderParams.rationale || 'Target hit or risk control',
          emotionalState: orderParams.emotionalState || 'CALM',
          pnl: Math.round(realizedPnL * 100) / 100,
          lessonLearned: realizedPnL >= 0 ? 'Good discipline on taking profits.' : 'Respecting stop loss preserved capital.',
        };

        return {
          ...prev,
          virtualCash: prev.virtualCash + proceeds,
          positions: updatedPositions,
          orders: [newOrder, ...prev.orders],
          journal: [newJournalEntry, ...prev.journal],
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
    setProfile(prev => {
      const existing = prev.mistakes.find(m => m.category === category);
      let updatedMistakes: MistakeEntry[];
      if (existing) {
        updatedMistakes = prev.mistakes.map(m =>
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
        );
      } else {
        updatedMistakes = [
          ...prev.mistakes,
          {
            id: `mst-${Date.now()}`,
            category,
            count: 1,
            lastOccurred: new Date().toISOString(),
            description,
            financialImpactVirtual: financialLoss,
            remedyTip: tip,
          }
        ];
      }
      return {
        ...prev,
        mistakes: updatedMistakes,
      };
    });
  };

  const completeDailyQuest = (questId: string) => {
    setDailyQuests(prev =>
      prev.map(q => {
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
    setProfile(prev => {
      const newStats = { ...prev.stats };
      Object.keys(statDeltas).forEach(key => {
        const k = key as keyof PlayerProfile['stats'];
        newStats[k] = Math.min(100, Math.max(0, (newStats[k] || 0) + (statDeltas[k] || 0)));
      });
      return {
        ...prev,
        stats: newStats,
      };
    });
  };

  const resetProgress = () => {
    setProfile(DEFAULT_PLAYER_PROFILE);
    saveProfile(DEFAULT_PLAYER_PROFILE);
    setActiveGame(null);
    setActiveMissionId(null);
    soundEffects.click();
  };

  // --- JOURNEY MODE & PROGRESSIVE UNLOCK FUNCTIONS ---

  const setAppMode = (mode: AppMode) => {
    soundEffects.click();
    setProfile(prev => ({
      ...prev,
      appMode: mode,
    }));
  };

  const completeOnboarding = (data: { username: string; avatar: string; nickname?: string }) => {
    soundEffects.levelUp();
    setProfile(prev => ({
      ...prev,
      username: data.username.trim() || 'MarketExplorer',
      avatar: data.avatar || '🦁',
      nickname: data.nickname?.trim() || 'Rookie Trader',
      hasCompletedOnboarding: true,
      appMode: 'JOURNEY',
      currentMissionId: 'mission-1',
      unlockedFeatures: ['Stock Basics', 'mission-1'],
    }));
  };

  const startMission = (missionId: string) => {
    soundEffects.click();
    setActiveMissionId(missionId);
    setActiveGame(null); // Return from mini-game if in progress
  };

  const completeMission = (missionId: string) => {
    const mission = BEGINNER_MISSIONS.find(m => m.id === missionId);
    if (!mission) return;

    soundEffects.levelUp();
    try {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {}

    const missionIndex = BEGINNER_MISSIONS.findIndex(m => m.id === missionId);
    const nextMission = BEGINNER_MISSIONS[missionIndex + 1];

    setProfile(prev => {
      const alreadyCompleted = prev.completedMissions.includes(missionId);
      const updatedCompleted = alreadyCompleted ? prev.completedMissions : [...prev.completedMissions, missionId];
      const updatedUnlocked = [...prev.unlockedFeatures];

      if (mission.unlockedFeatureName && !updatedUnlocked.includes(mission.unlockedFeatureName)) {
        updatedUnlocked.push(mission.unlockedFeatureName);
      }

      if (nextMission && !updatedUnlocked.includes(nextMission.id)) {
        updatedUnlocked.push(nextMission.id);
      }

      // If all 10 missions completed, unlock Free Mode fully
      if (updatedCompleted.length >= 10 && !updatedUnlocked.includes('Free Mode')) {
        updatedUnlocked.push('Free Mode');
      }

      // Update skill stats based on mission category
      const statBonus: Partial<PlayerProfile['stats']> = {};
      if (mission.category === 'INVESTING_BASICS') statBonus.knowledgeScore = 15;
      if (mission.category === 'STOCKS') statBonus.fundamentalAnalysisScore = 15;
      if (mission.category === 'DEMAND_SUPPLY') statBonus.tradingDisciplineScore = 15;
      if (mission.category === 'TRADING') statBonus.tradingDisciplineScore = 20;
      if (mission.category === 'PORTFOLIO') statBonus.portfolioScore = 20;
      if (mission.category === 'RISK') statBonus.riskManagementScore = 25;
      if (mission.category === 'VOLATILITY') statBonus.psychologyScore = 20;
      if (mission.category === 'CHARTS') statBonus.technicalAnalysisScore = 20;
      if (mission.category === 'CANDLESTICKS') statBonus.technicalAnalysisScore = 30;
      if (mission.category === 'SUPPORT_RESISTANCE') statBonus.technicalAnalysisScore = 35;

      const newStats = { ...prev.stats };
      Object.keys(statBonus).forEach(k => {
        const key = k as keyof PlayerProfile['stats'];
        newStats[key] = Math.min(100, (newStats[key] || 0) + (statBonus[key] || 0));
      });

      return {
        ...prev,
        xp: prev.xp + mission.xpReward,
        virtualCash: prev.virtualCash + mission.cashReward,
        completedMissions: updatedCompleted,
        currentMissionId: nextMission ? nextMission.id : 'mission-10',
        unlockedFeatures: updatedUnlocked,
        stats: newStats,
      };
    });
  };

  const isNcfmLessonUnlocked = (lessonId: string): boolean => {
    const lesson = NCFM_LESSONS.find(l => l.id === lessonId);
    if (!lesson) return false;
    if (lesson.prerequisites.length === 0) return true;
    const completed = profile.completedNcfmLessons || [];
    return lesson.prerequisites.every(pId => completed.includes(pId));
  };

  const completeNcfmLesson = (lessonId: string, earnedXp: number) => {
    setProfile(prev => {
      const alreadyCompleted = (prev.completedNcfmLessons || []).includes(lessonId);
      if (alreadyCompleted) return prev;
      const updated = [...(prev.completedNcfmLessons || []), lessonId];
      return {
        ...prev,
        xp: prev.xp + earnedXp,
        completedNcfmLessons: updated,
      };
    });
  };

  const completeCourseTopic = (topicId: string, earnedXp: number) => {
    setProfile(prev => {
      const alreadyCompleted = (prev.completedCourseTopics || []).includes(topicId);
      if (alreadyCompleted) return prev;
      const updated = [...(prev.completedCourseTopics || []), topicId];
      return {
        ...prev,
        xp: prev.xp + earnedXp,
        completedCourseTopics: updated,
      };
    });
    soundEffects.correct();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  const resetLearningProgress = () => {
    clearAllLearningProgress();
    setProfile(prev => ({
      ...prev,
      completedCourseTopics: [],
      completedMissions: [],
      completedNcfmLessons: [],
      xp: 0,
      level: 1,
    }));
    soundEffects.click();
  };

  const toggleWatchlist = (symbol: string) => {
    soundEffects.click();
    setProfile(prev => {
      const list = prev.watchlist || ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'];
      const nextList = list.includes(symbol)
        ? list.filter(s => s !== symbol)
        : [...list, symbol];
      return {
        ...prev,
        watchlist: nextList,
      };
    });
  };

  const skipTutorialWithDiagnostic = (scorePercent: number) => {
    soundEffects.levelUp();
    let unlockedMissionCount = 3;
    let newLevel = 1;
    let initialXp = 400;

    if (scorePercent >= 75) {
      unlockedMissionCount = 10;
      newLevel = 4;
      initialXp = 1500;
    } else if (scorePercent >= 50) {
      unlockedMissionCount = 6;
      newLevel = 2;
      initialXp = 800;
    }

    const unlockedMissions = BEGINNER_MISSIONS.slice(0, unlockedMissionCount).map(m => m.id);
    const nextMission = BEGINNER_MISSIONS[unlockedMissionCount] || BEGINNER_MISSIONS[BEGINNER_MISSIONS.length - 1];

    setProfile(prev => ({
      ...prev,
      hasCompletedOnboarding: true,
      appMode: scorePercent >= 75 ? 'FREE' : 'JOURNEY',
      level: newLevel,
      xp: prev.xp + initialXp,
      completedMissions: unlockedMissions,
      currentMissionId: nextMission.id,
      unlockedFeatures: [
        'Stock Basics',
        'Order Floor',
        'Portfolio Tracker',
        'Chart Arena',
        'Candlestick Combat Arena',
        ...(scorePercent >= 75 ? ['Free Mode', 'Full Free Mode & Advanced Districts'] : [])
      ],
      stats: {
        knowledgeScore: Math.round(scorePercent * 0.7),
        tradingDisciplineScore: Math.round(scorePercent * 0.6),
        riskManagementScore: Math.round(scorePercent * 0.6),
        technicalAnalysisScore: Math.round(scorePercent * 0.5),
        fundamentalAnalysisScore: Math.round(scorePercent * 0.5),
        portfolioScore: Math.round(scorePercent * 0.5),
        psychologyScore: Math.round(scorePercent * 0.5),
        overallMasteryScore: Math.round(scorePercent * 0.6),
      }
    }));
  };

  const isFeatureUnlocked = (featureName: string): boolean => {
    if (profile.appMode === 'FREE' && profile.completedMissions.length >= 7) return true;
    return profile.unlockedFeatures.includes(featureName);
  };

  const isDistrictUnlocked = (districtId: DistrictId): boolean => {
    if (profile.appMode === 'FREE') return true;
    switch (districtId) {
      case 'bank-district':
        return true; // Always unlocked (Stage 1)
      case 'stock-exchange':
        return profile.completedMissions.includes('mission-2');
      case 'chart-arena':
        return profile.completedMissions.includes('mission-7');
      case 'corporate-district':
        return profile.completedMissions.includes('mission-10') || profile.level >= 4;
      case 'psychology-lab':
        return profile.completedMissions.includes('mission-10') || profile.level >= 5;
      case 'portfolio-tower':
        return profile.completedMissions.includes('mission-10') || profile.level >= 6;
      case 'derivatives-arena':
        return profile.level >= 9;
      case 'quant-lab':
        return profile.level >= 8;
      default:
        return false;
    }
  };

  return (
    <GameContext.Provider
      value={{
        profile,
        activeGame,
        activeMissionId,
        selectedDistrict,
        marketWeather,
        stocks,
        dailyQuests,
        isAIMentorOpen,
        aiMentorInitialPrompt,
        openAIMentorWithPrompt,
        clearAIMentorInitialPrompt,
        isProfileModalOpen,
        isLeaderboardOpen,
        soundOn,
        totalPortfolioValue,
        totalNetWorth,
        setActiveGame,
        setActiveMissionId,
        setSelectedDistrict,
        setAIMentorOpen,
        setProfileModalOpen,
        setLeaderboardOpen,
        toggleSound,
        addXP,
        addVirtualCash,
        deductVirtualCash,
        addTraderFiTokens,
        spendTraderFiTokens,
        recordTournamentResult,
        executeTrade,
        recordMistake,
        completeDailyQuest,
        updateStats,
        resetProgress,
        // Journey & Progressive Unlock Handlers
        setAppMode,
        completeOnboarding,
        startMission,
        completeMission,
        completeNcfmLesson,
        completeCourseTopic,
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
