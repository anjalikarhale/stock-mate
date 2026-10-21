import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  HelpCircle,
  BarChart2,
  Volume2,
  VolumeX,
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  Award,
  Layers,
  ChevronDown,
  Camera,
  Maximize2,
  Sliders,
  DollarSign,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../context/GameContext';
import { soundEffects } from '../../utils/audio';
import { TraderFiHowToPlayModal } from './TraderFiHowToPlayModal';

interface TradeRecord {
  id: number;
  side: 'BUY' | 'SELL';
  price: number;
  qty: number;
  remainingPos: number;
  status: 'FILLED' | 'CLOSED';
  orderType: 'MKT' | 'LMT';
  date: string;
  time: string;
  pnl?: number;
}

interface Competitor {
  id: string;
  name: string;
  avatar: string;
  profit: number;
  tradesCount: number;
  winRate: number;
  isUser?: boolean;
}

interface PriceTick {
  time: string;
  last: number;
  change: number;
  size: number;
  market: string;
}

interface ArenaCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const TraderFiArenaGame: React.FC = () => {
  const {
    profile,
    setActiveGame,
    addXP,
    addTraderFiTokens,
    recordTournamentResult,
    soundOn,
    toggleSound,
  } = useGame();

  // 1. GAME START & TIMER FLOW:
  // - Show How to Play popup immediately when game starts
  // - Timer only starts when user asks to start via "START MATCH"
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(true);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [roundOver, setRoundOver] = useState<boolean>(false);

  // Chart Style (Candle vs Line vs Area)
  const [chartType, setChartType] = useState<'CANDLE' | 'LINE' | 'AREA'>('CANDLE');

  // Bottom Console Tab
  const [bottomTab, setBottomTab] = useState<'TRADES' | 'STATS' | 'LEADERBOARD'>('TRADES');

  // Virtual Trading Engine State
  const initialBuyingPower = 100000;
  const [buyingPower, setBuyingPower] = useState<number>(initialBuyingPower);
  const [positionQty, setPositionQty] = useState<number>(0);
  const [avgEntryPrice, setAvgEntryPrice] = useState<number>(0);
  const [realizedPnL, setRealizedPnL] = useState<number>(0);

  // Order Console Inputs
  const [orderQty, setOrderQty] = useState<number>(100);
  const [orderType, setOrderType] = useState<'MKT' | 'LMT'>('MKT');
  const [selectedStockSymbol] = useState<string>('NVDA');

  // Trades Ledger
  const [trades, setTrades] = useState<TradeRecord[]>([]);

  // Real-time market tick generator & historical candles
  const [currentPrice, setCurrentPrice] = useState<number>(38.47);

  // Initial realistic historical candles sequence for NVDA
  const [candles, setCandles] = useState<ArenaCandle[]>([
    { time: '09:30', open: 38.25, high: 38.35, low: 38.20, close: 38.30, volume: 14200 },
    { time: '09:31', open: 38.30, high: 38.42, low: 38.28, close: 38.38, volume: 18500 },
    { time: '09:32', open: 38.38, high: 38.45, low: 38.35, close: 38.40, volume: 16100 },
    { time: '09:33', open: 38.40, high: 38.48, low: 38.38, close: 38.44, volume: 22000 },
    { time: '09:34', open: 38.44, high: 38.46, low: 38.39, close: 38.41, volume: 13800 },
    { time: '09:35', open: 38.41, high: 38.49, low: 38.40, close: 38.47, volume: 25400 },
    { time: '09:36', open: 38.47, high: 38.52, low: 38.44, close: 38.49, volume: 29800 },
    { time: '09:37', open: 38.49, high: 38.50, low: 38.42, close: 38.45, volume: 17600 },
    { time: '09:38', open: 38.45, high: 38.48, low: 38.41, close: 38.43, volume: 15300 },
    { time: '09:39', open: 38.43, high: 38.55, low: 38.43, close: 38.52, volume: 34100 },
    { time: '09:40', open: 38.52, high: 38.54, low: 38.46, close: 38.48, volume: 21900 },
    { time: '09:41', open: 38.48, high: 38.51, low: 38.45, close: 38.47, volume: 19400 },
  ]);

  const [tapeTicks, setTapeTicks] = useState<PriceTick[]>([
    { time: '09:42:38', last: 38.4724, change: -0.01, size: 3687, market: 'NYSE' },
    { time: '09:42:38', last: 38.4875, change: 0.03, size: 3687, market: 'NYSE' },
    { time: '09:42:38', last: 38.4750, change: 0.00, size: 3687, market: 'NYSE' },
  ]);

  // Simulated live tournament competitors
  const [competitors, setCompetitors] = useState<Competitor[]>([
    { id: 'bot-1', name: 'AlphaScalper', avatar: '⚡', profit: 1240.50, tradesCount: 8, winRate: 75 },
    { id: 'bot-2', name: 'VortexTrader', avatar: '🦅', profit: 980.20, tradesCount: 6, winRate: 66 },
    { id: 'bot-3', name: 'MomentumQueen', avatar: '👑', profit: 640.00, tradesCount: 5, winRate: 80 },
    { id: 'bot-4', name: 'BullRider', avatar: '🐂', profit: 310.40, tradesCount: 7, winRate: 57 },
    { id: 'bot-5', name: 'RiskHedger', avatar: '🛡️', profit: -120.00, tradesCount: 4, winRate: 50 },
    { id: 'bot-6', name: 'BreakoutBot', avatar: '🤖', profit: -450.80, tradesCount: 9, winRate: 44 },
  ]);

  // Bid / Ask spread
  const bidPrice = Math.round((currentPrice - 0.01) * 100) / 100;
  const askPrice = Math.round((currentPrice + 0.01) * 100) / 100;

  // Unrealized P&L
  const unrealizedPnL = positionQty > 0 ? (currentPrice - avgEntryPrice) * positionQty : 0;
  const totalPnL = Math.round((realizedPnL + unrealizedPnL) * 100) / 100;

  // Start the match explicitly
  const handleStartMatch = () => {
    soundEffects.levelUp();
    setGameStarted(true);
    setIsPaused(false);
    setShowHowToPlay(false);
  };

  // 1. Match Timer Loop (Only counts down when gameStarted is true!)
  useEffect(() => {
    if (!gameStarted || isPaused || roundOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRoundEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, isPaused, roundOver]);

  // 2. High-speed market tick & tape engine (Only streams when gameStarted is true!)
  useEffect(() => {
    if (!gameStarted || isPaused || roundOver) return;

    const tickInterval = setInterval(() => {
      const delta = (Math.random() - 0.48) * 0.04;
      const nextPrice = Math.round(Math.max(30, currentPrice + delta) * 100) / 100;
      const changePct = Math.round(((nextPrice - currentPrice) / currentPrice) * 10000) / 100;
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      setCurrentPrice(nextPrice);

      // Update latest candle or add a new candle
      setCandles(prev => {
        const lastCandle = prev[prev.length - 1];
        if (!lastCandle) return prev;

        const updatedLast: ArenaCandle = {
          ...lastCandle,
          high: Math.max(lastCandle.high, nextPrice),
          low: Math.min(lastCandle.low, nextPrice),
          close: nextPrice,
          volume: lastCandle.volume + Math.floor(Math.random() * 800) + 200,
        };

        // Every 6 ticks, push a new candle to keep chart moving forward
        if (Math.random() > 0.65 && prev.length < 35) {
          const newCandle: ArenaCandle = {
            time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
            open: nextPrice,
            high: nextPrice,
            low: nextPrice,
            close: nextPrice,
            volume: Math.floor(Math.random() * 5000) + 5000,
          };
          return [...prev.slice(-30), updatedLast, newCandle];
        }

        return [...prev.slice(0, -1), updatedLast];
      });

      // Tape ticks stream
      setTapeTicks(prev => [
        {
          time: timeStr,
          last: Number(nextPrice.toFixed(4)),
          change: changePct,
          size: Math.floor(Math.random() * 4000) + 500,
          market: 'NYSE',
        },
        ...prev.slice(0, 6),
      ]);

      // Subtly fluctuate competitor scores for live realism
      setCompetitors(prev =>
        prev.map(c => ({
          ...c,
          profit: Math.round((c.profit + (Math.random() - 0.47) * 45) * 100) / 100,
        }))
      );
    }, 1200);

    return () => clearInterval(tickInterval);
  }, [gameStarted, currentPrice, isPaused, roundOver]);

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Order Execution Handlers
  const handleBuy = () => {
    if (!gameStarted) {
      handleStartMatch();
      return;
    }

    if (orderQty <= 0) return;
    const cost = orderQty * askPrice;
    if (buyingPower < cost) {
      soundEffects.wrong();
      return;
    }

    soundEffects.cashTrade();
    const newTotalQty = positionQty + orderQty;
    const newAvg = (positionQty * avgEntryPrice + cost) / newTotalQty;

    setBuyingPower(prev => prev - cost);
    setPositionQty(newTotalQty);
    setAvgEntryPrice(Math.round(newAvg * 100) / 100);

    const now = new Date();
    const newTrade: TradeRecord = {
      id: trades.length + 1,
      side: 'BUY',
      price: askPrice,
      qty: orderQty,
      remainingPos: newTotalQty,
      status: 'FILLED',
      orderType,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
    };
    setTrades(prev => [newTrade, ...prev]);
  };

  const handleSell = () => {
    if (!gameStarted || positionQty <= 0) {
      soundEffects.wrong();
      return;
    }

    const sellQty = Math.min(positionQty, orderQty);
    const proceeds = sellQty * bidPrice;
    const costBasis = sellQty * avgEntryPrice;
    const tradePnL = Math.round((proceeds - costBasis) * 100) / 100;

    if (tradePnL >= 0) soundEffects.correct();
    else soundEffects.wrong();

    const remainingQty = positionQty - sellQty;
    setBuyingPower(prev => prev + proceeds);
    setPositionQty(remainingQty);
    setRealizedPnL(prev => Math.round((prev + tradePnL) * 100) / 100);

    if (remainingQty === 0) setAvgEntryPrice(0);

    const now = new Date();
    const newTrade: TradeRecord = {
      id: trades.length + 1,
      side: 'SELL',
      price: bidPrice,
      qty: sellQty,
      remainingPos: remainingQty,
      status: remainingQty === 0 ? 'CLOSED' : 'FILLED',
      orderType,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      pnl: tradePnL,
    };
    setTrades(prev => [newTrade, ...prev]);
  };

  const handleCloseTrade = () => {
    if (!gameStarted || positionQty <= 0) return;
    const proceeds = positionQty * bidPrice;
    const costBasis = positionQty * avgEntryPrice;
    const tradePnL = Math.round((proceeds - costBasis) * 100) / 100;

    if (tradePnL >= 0) soundEffects.correct();
    else soundEffects.wrong();

    setBuyingPower(prev => prev + proceeds);
    setRealizedPnL(prev => Math.round((prev + tradePnL) * 100) / 100);
    setPositionQty(0);
    setAvgEntryPrice(0);

    const now = new Date();
    const newTrade: TradeRecord = {
      id: trades.length + 1,
      side: 'SELL',
      price: bidPrice,
      qty: positionQty,
      remainingPos: 0,
      status: 'CLOSED',
      orderType: 'MKT',
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      pnl: tradePnL,
    };
    setTrades(prev => [newTrade, ...prev]);
  };

  // End of Round Evaluation
  const handleRoundEnd = () => {
    setRoundOver(true);
    const isWin = totalPnL > 0;
    if (isWin) {
      soundEffects.levelUp();
      addXP(200, '5-Min Tournament Profit');
      addTraderFiTokens(15);
      recordTournamentResult(true, totalPnL, 1);
      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch {}
    } else {
      soundEffects.wrong();
      addXP(50, 'Tournament Completed');
      recordTournamentResult(false, totalPnL, 4);
    }
  };

  // Rank calculation against competitors
  const allCompetitorsWithUser = useMemo(() => {
    const list: Competitor[] = [
      ...competitors,
      {
        id: 'user',
        name: profile.username || 'You',
        avatar: profile.avatar || '🦁',
        profit: totalPnL,
        tradesCount: trades.length,
        winRate: trades.filter(t => (t.pnl || 0) > 0).length > 0
          ? Math.round((trades.filter(t => (t.pnl || 0) > 0).length / Math.max(1, trades.filter(t => t.pnl !== undefined).length)) * 100)
          : 0,
        isUser: true,
      },
    ];
    return list.sort((a, b) => b.profit - a.profit);
  }, [competitors, totalPnL, trades, profile]);

  const userRank = allCompetitorsWithUser.findIndex(c => c.isUser) + 1;

  // =========================================================================
  // HIGH-PRECISION SVG CHART SCALING & COORDINATES
  // Uses strict numerical coordinates (no invalid percentage strings in path d!)
  // =========================================================================
  const VIEW_WIDTH = 1000;
  const VIEW_HEIGHT = 280;
  const PADDING_TOP = 25;
  const PADDING_BOTTOM = 45;
  const PADDING_LEFT = 30;
  const PADDING_RIGHT = 85; // Right price axis margin

  const availableWidth = VIEW_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const availableHeight = VIEW_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  const allHighs = candles.map(c => c.high);
  const allLows = candles.map(c => c.low);
  const minChart = Math.min(...allLows, currentPrice) * 0.9985;
  const maxChart = Math.max(...allHighs, currentPrice) * 1.0015;
  const priceRange = maxChart - minChart || 0.01;

  const getY = (price: number): number => {
    return Number((VIEW_HEIGHT - PADDING_BOTTOM - ((price - minChart) / priceRange) * availableHeight).toFixed(2));
  };

  const getX = (index: number): number => {
    if (candles.length <= 1) return PADDING_LEFT;
    return Number((PADDING_LEFT + (index / (candles.length - 1)) * availableWidth).toFixed(2));
  };

  // Candle width based on count
  const candleBodyWidth = Math.max(5, Math.min(22, (availableWidth / candles.length) * 0.65));

  // Line & Area path strings
  const linePath = useMemo(() => {
    return candles.map((c, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(c.close)}`).join(' ');
  }, [candles, minChart, maxChart]);

  const areaPath = useMemo(() => {
    if (candles.length === 0) return '';
    const lastX = getX(candles.length - 1);
    const firstX = getX(0);
    const bottomY = VIEW_HEIGHT - PADDING_BOTTOM;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [linePath, candles]);

  // SMA 9 Moving Average Path
  const smaPath = useMemo(() => {
    const period = 5;
    const points: { x: number; y: number }[] = [];
    candles.forEach((_, i) => {
      if (i < period - 1) return;
      const slice = candles.slice(i - period + 1, i + 1);
      const avg = slice.reduce((acc, c) => acc + c.close, 0) / period;
      points.push({ x: getX(i), y: getY(avg) });
    });
    if (points.length === 0) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [candles, minChart, maxChart]);

  // Volume scaling
  const maxVol = Math.max(...candles.map(c => c.volume), 1000);

  // Key horizontal price levels for grid
  const midPrice = (minChart + maxChart) / 2;
  const currentY = getY(currentPrice);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 pb-12 animate-fadeIn text-slate-100 select-none">
      {/* 1. TOP BRAND HEADER & TIMER BAR matching Screenshot 5 */}
      <div className="flex items-center justify-between bg-[#110729] rounded-2xl border border-purple-500/30 px-4 py-3 shadow-xl">
        {/* Brand Logo & Back to Arcade */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveGame(null)}
            className="p-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Exit Arena"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl font-black italic tracking-wider bg-gradient-to-r from-amber-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              TraderFi
            </span>
            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-500/30 hidden sm:inline">
              5-MIN ARENA
            </span>
          </div>
        </div>

        {/* Central Match Clock: 04:59 ⏸️ */}
        <div className="flex items-center gap-3 bg-[#190c3d] border border-purple-500/50 px-4 py-1.5 rounded-2xl shadow-inner">
          <span className={`font-mono text-xl sm:text-2xl font-black tracking-wider ${!gameStarted ? 'text-slate-400' : 'text-amber-300'}`}>
            {formatTime(timeLeft)}
          </span>
          {gameStarted ? (
            <button
              onClick={() => {
                soundEffects.click();
                setIsPaused(p => !p);
              }}
              className="p-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-amber-400 hover:text-white transition-colors cursor-pointer"
              title={isPaused ? 'Resume Match' : 'Pause Match'}
            >
              {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
            </button>
          ) : (
            <button
              onClick={handleStartMatch}
              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md transition-all cursor-pointer"
            >
              <Play className="w-3 h-3 fill-slate-950" />
              <span>START</span>
            </button>
          )}
        </div>

        {/* Right Controls: How To Play, Sound, Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              soundEffects.click();
              setShowHowToPlay(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-700/40 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">How To Play?</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-900 border border-purple-500/30 text-slate-300 hover:text-white cursor-pointer"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-sm shadow-md">
            {profile.avatar || '🦁'}
          </div>
        </div>
      </div>

      {/* 2. TOP STATS WIDGET PILLS BAR matching Screenshot 5 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* Games Won */}
        <div className="p-2.5 rounded-2xl bg-[#1c0d45] border border-purple-500/30 flex items-center gap-2.5 shadow-md">
          <div className="w-9 h-9 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center text-lg">
            🎖️
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Games Won</span>
            <span className="text-xs sm:text-sm font-black text-white font-mono">
              {profile.tournamentsWon ?? 0} (0%)
            </span>
          </div>
        </div>

        {/* Games Played */}
        <div className="p-2.5 rounded-2xl bg-[#1c0d45] border border-purple-500/30 flex items-center gap-2.5 shadow-md">
          <div className="w-9 h-9 rounded-xl bg-blue-600/30 text-blue-300 flex items-center justify-center text-lg">
            🎮
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Games Played</span>
            <span className="text-xs sm:text-sm font-black text-white font-mono">
              {(profile.tournamentsPlayed ?? 0) + (gameStarted ? 1 : 0)}
            </span>
          </div>
        </div>

        {/* Level */}
        <div className="p-2.5 rounded-2xl bg-[#1c0d45] border border-purple-500/30 flex items-center gap-2.5 shadow-md">
          <div className="w-9 h-9 rounded-xl bg-amber-600/30 text-amber-300 flex items-center justify-center text-lg">
            🏆
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Level</span>
            <span className="text-xs sm:text-sm font-black text-amber-300 font-mono">
              {profile.level || 1}
            </span>
          </div>
        </div>

        {/* Position Quantity */}
        <div className="p-2.5 rounded-2xl bg-[#1c0d45] border border-purple-500/30 flex items-center gap-2.5 shadow-md">
          <div className="w-9 h-9 rounded-xl bg-pink-600/30 text-pink-300 flex items-center justify-center text-lg">
            🤝
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Open Position</span>
            <span className="text-xs sm:text-sm font-black text-white font-mono">
              {positionQty} Shs
            </span>
          </div>
        </div>

        {/* Buying Power */}
        <div className="p-2.5 rounded-2xl bg-[#1c0d45] border border-purple-500/30 flex items-center gap-2.5 shadow-md">
          <div className="w-9 h-9 rounded-xl bg-cyan-600/30 text-cyan-300 flex items-center justify-center text-lg">
            👛
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Buying Power</span>
            <span className="text-xs sm:text-sm font-black text-cyan-300 font-mono">
              ${buyingPower.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Profit (Green/Red Dynamic) */}
        <div className="p-2.5 rounded-2xl bg-[#1c0d45] border border-purple-500/30 flex items-center gap-2.5 shadow-md">
          <div className={`w-9 h-9 rounded-xl ${totalPnL >= 0 ? 'bg-emerald-600/30 text-emerald-300' : 'bg-rose-600/30 text-rose-300'} flex items-center justify-center text-lg font-bold`}>
            $
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Profit</span>
            <span className={`text-xs sm:text-sm font-black font-mono ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. MAIN ARENA WORKSPACE: LEFT ORDER CONSOLE + RIGHT CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN (4 cols): Time & Sales Tape + Order Controls */}
        <div className="lg:col-span-4 space-y-3">
          {/* Tape Table: Time | Last | Change % | Size | Market */}
          <div className="bg-[#12082b] rounded-2xl border border-purple-500/30 p-3 space-y-2 shadow-lg">
            <div className="grid grid-cols-5 text-[10px] font-mono font-bold text-slate-400 border-b border-purple-500/20 pb-1.5 px-1">
              <span>Time</span>
              <span>Last</span>
              <span>Change%</span>
              <span>Size</span>
              <span>Market</span>
            </div>

            <div className="space-y-1 text-xs font-mono">
              {tapeTicks.map((tick, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-5 px-1 py-1 rounded bg-[#190c3d]/60 items-center text-[11px]"
                >
                  <span className="text-slate-400">{tick.time}</span>
                  <span className={tick.change >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {tick.last.toFixed(4)}
                  </span>
                  <span className={tick.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {tick.change >= 0 ? '+' : ''}{tick.change}%
                  </span>
                  <span className="text-slate-300">{tick.size}</span>
                  <span className="text-indigo-400 font-sans text-[10px]">{tick.market}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bid / Close / Ask Execution Row matching Screenshot 5 */}
          <div className="bg-[#12082b] rounded-2xl border border-purple-500/30 p-3.5 space-y-3 shadow-lg">
            <div className="grid grid-cols-3 gap-2">
              {/* BID BUTTON */}
              <button
                onClick={handleSell}
                disabled={positionQty <= 0}
                className="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-mono font-black text-xs flex items-center justify-between shadow-md transition-all cursor-pointer"
              >
                <span className="text-[10px] font-sans font-bold">BID</span>
                <span>{bidPrice.toFixed(2)}</span>
              </button>

              {/* CLOSE TRADE BUTTON */}
              <button
                onClick={handleCloseTrade}
                disabled={positionQty <= 0}
                className="py-2.5 px-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-black text-[10px] uppercase shadow-md transition-all cursor-pointer flex items-center justify-center text-center"
              >
                CLOSE TRADE
              </button>

              {/* ASK BUTTON */}
              <button
                onClick={handleBuy}
                className="py-2.5 px-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-black text-xs flex items-center justify-between shadow-md transition-all cursor-pointer"
              >
                <span className="text-[10px] font-sans font-bold">ASK</span>
                <span>{askPrice.toFixed(2)}</span>
              </button>
            </div>

            {/* Custom Angled BUY (Blue) & SELL (Purple) Action Triggers */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleBuy}
                className="py-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 border border-blue-400 text-white font-black text-sm tracking-widest shadow-lg shadow-blue-800/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                BUY
              </button>

              <button
                onClick={handleSell}
                disabled={positionQty <= 0}
                className="py-3 rounded-xl bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500 border border-purple-400 disabled:opacity-40 text-white font-black text-sm tracking-widest shadow-lg shadow-purple-800/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                SELL
              </button>
            </div>

            {/* Sizing & Controls Row: MKT / LMT, Qty Stepper, Presets (100, 250, 500) */}
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="flex items-center justify-between bg-slate-900 border border-slate-700 px-2 py-1.5 rounded-xl">
                <span className="text-[10px] text-slate-400">TYPE</span>
                <button
                  onClick={() => setOrderType(t => (t === 'MKT' ? 'LMT' : 'MKT'))}
                  className="font-bold text-white hover:text-cyan-300"
                >
                  {orderType}
                </button>
              </div>

              <div className="flex items-center justify-between bg-slate-900 border border-slate-700 px-2 py-1.5 rounded-xl">
                <span className="text-[10px] text-slate-400">QTY</span>
                <input
                  type="number"
                  min={10}
                  step={10}
                  value={orderQty}
                  onChange={e => setOrderQty(Math.max(1, Number(e.target.value)))}
                  className="w-12 bg-transparent text-right font-bold text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-900 border border-slate-700 px-2 py-1.5 rounded-xl">
                <span className="text-[10px] text-slate-400">SIZE</span>
                <span className="font-bold text-cyan-300">{orderQty}</span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center justify-between gap-1 text-[11px] font-mono">
              {[50, 100, 250, 500].map(size => (
                <button
                  key={size}
                  onClick={() => {
                    soundEffects.click();
                    setOrderQty(size);
                  }}
                  className={`flex-1 py-1 rounded-lg border text-center transition-all cursor-pointer ${
                    orderQty === size
                      ? 'bg-purple-600 text-white border-purple-400 font-bold'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
              <button
                onClick={() => {
                  soundEffects.click();
                  const maxAffordable = Math.floor(buyingPower / askPrice);
                  setOrderQty(Math.max(1, maxAffordable));
                }}
                className="flex-1 py-1 rounded-lg bg-amber-600/30 text-amber-300 border border-amber-500/40 hover:bg-amber-600/50 font-bold"
              >
                MAX
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (8 cols): Center Trading Chart Stage */}
        <div className="lg:col-span-8 bg-[#12082b] rounded-2xl border border-purple-500/30 p-4 space-y-3 shadow-lg flex flex-col justify-between">
          {/* Chart Header Tools Bar matching Screenshot 5 */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-2.5">
            <div className="flex items-center gap-3">
              <span className="font-black text-white text-base font-mono">{selectedStockSymbol}</span>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <span>O <strong className="text-white">{candles[0]?.open.toFixed(2) || '38.25'}</strong></span>
                <span>H <strong className="text-emerald-400">{maxChart.toFixed(2)}</strong></span>
                <span>L <strong className="text-rose-400">{minChart.toFixed(2)}</strong></span>
                <span>C <strong className="text-white">{currentPrice.toFixed(2)}</strong></span>
                <span className="text-amber-400 text-[10px] font-bold">SMA 9</span>
              </div>
            </div>

            {/* Quick Chart Style Toggles: Candle / Line / Area */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-purple-500/30 text-xs font-bold">
              <button
                onClick={() => setChartType('CANDLE')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  chartType === 'CANDLE' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Candles
              </button>
              <button
                onClick={() => setChartType('LINE')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  chartType === 'LINE' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType('AREA')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  chartType === 'AREA' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Area
              </button>
            </div>
          </div>

          {/* REAL TRADING CHART CANVAS (Scalable SVG with pure numeric coordinates) */}
          <div className="relative w-full h-[300px] bg-[#070314] rounded-xl overflow-hidden border border-purple-500/25 p-1">
            <svg
              viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
              className="w-full h-full block overflow-visible select-none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="arena-cyan-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#9333ea" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Reference Grid Lines */}
              <line
                x1={PADDING_LEFT}
                y1={getY(maxChart)}
                x2={VIEW_WIDTH - PADDING_RIGHT}
                y2={getY(maxChart)}
                stroke="#4c1d95"
                strokeWidth={1}
                strokeDasharray="4 4"
                opacity={0.4}
              />
              <line
                x1={PADDING_LEFT}
                y1={getY(midPrice)}
                x2={VIEW_WIDTH - PADDING_RIGHT}
                y2={getY(midPrice)}
                stroke="#4c1d95"
                strokeWidth={1}
                strokeDasharray="4 4"
                opacity={0.4}
              />
              <line
                x1={PADDING_LEFT}
                y1={getY(minChart)}
                x2={VIEW_WIDTH - PADDING_RIGHT}
                y2={getY(minChart)}
                stroke="#4c1d95"
                strokeWidth={1}
                strokeDasharray="4 4"
                opacity={0.4}
              />

              {/* Right Price Axis Numerical Labels */}
              <text
                x={VIEW_WIDTH - PADDING_RIGHT + 8}
                y={getY(maxChart) + 4}
                fill="#94a3b8"
                fontSize={11}
                fontFamily="monospace"
              >
                {maxChart.toFixed(2)}
              </text>
              <text
                x={VIEW_WIDTH - PADDING_RIGHT + 8}
                y={getY(midPrice) + 4}
                fill="#94a3b8"
                fontSize={11}
                fontFamily="monospace"
              >
                {midPrice.toFixed(2)}
              </text>
              <text
                x={VIEW_WIDTH - PADDING_RIGHT + 8}
                y={getY(minChart) + 4}
                fill="#94a3b8"
                fontSize={11}
                fontFamily="monospace"
              >
                {minChart.toFixed(2)}
              </text>

              {/* Volume Bars at Bottom */}
              {candles.map((c, i) => {
                const cx = getX(i);
                const isBull = c.close >= c.open;
                const volHeight = Math.max(3, (c.volume / maxVol) * 35);
                const volY = VIEW_HEIGHT - PADDING_BOTTOM - volHeight;
                return (
                  <rect
                    key={`vol-${i}`}
                    x={cx - candleBodyWidth / 2}
                    y={volY}
                    width={candleBodyWidth}
                    height={volHeight}
                    fill={isBull ? '#10b981' : '#ef4444'}
                    opacity={0.3}
                    rx={1}
                  />
                );
              })}

              {/* RENDER CANDLESTICKS */}
              {chartType === 'CANDLE' &&
                candles.map((c, i) => {
                  const cx = getX(i);
                  const isBull = c.close >= c.open;
                  const color = isBull ? '#10b981' : '#ef4444';
                  const wickTop = getY(c.high);
                  const wickBottom = getY(c.low);
                  const bodyTop = getY(Math.max(c.open, c.close));
                  const bodyBottom = getY(Math.min(c.open, c.close));
                  const bodyHeight = Math.max(2, bodyBottom - bodyTop);

                  return (
                    <g key={`candle-${i}`}>
                      {/* Upper & Lower Wick */}
                      <line
                        x1={cx}
                        y1={wickTop}
                        x2={cx}
                        y2={wickBottom}
                        stroke={color}
                        strokeWidth={1.5}
                      />
                      {/* Candle Body */}
                      <rect
                        x={cx - candleBodyWidth / 2}
                        y={bodyTop}
                        width={candleBodyWidth}
                        height={bodyHeight}
                        fill={color}
                        rx={1}
                      />
                    </g>
                  );
                })}

              {/* RENDER AREA */}
              {chartType === 'AREA' && (
                <path d={areaPath} fill="url(#arena-cyan-grad)" />
              )}

              {/* RENDER LINE / AREA PATH */}
              {(chartType === 'LINE' || chartType === 'AREA') && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth={2.5}
                />
              )}

              {/* SMA 9 Moving Average Overlay Line */}
              {smaPath && (
                <path
                  d={smaPath}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={1.8}
                  strokeDasharray="4 2"
                />
              )}

              {/* Current Price Horizontal Dashed Line to Right Axis */}
              <line
                x1={PADDING_LEFT}
                y1={currentY}
                x2={VIEW_WIDTH - PADDING_RIGHT}
                y2={currentY}
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />

              {/* Live Current Price Badge on Right Axis */}
              <rect
                x={VIEW_WIDTH - PADDING_RIGHT + 2}
                y={currentY - 10}
                width={72}
                height={20}
                rx={4}
                fill="#ef4444"
              />
              <text
                x={VIEW_WIDTH - PADDING_RIGHT + 8}
                y={currentY + 4}
                fill="#ffffff"
                fontSize={11}
                fontFamily="monospace"
                fontWeight="bold"
              >
                {currentPrice.toFixed(2)}
              </text>

              {/* Buy Average Line if holding position */}
              {positionQty > 0 && (
                <g>
                  <line
                    x1={PADDING_LEFT}
                    y1={getY(avgEntryPrice)}
                    x2={VIEW_WIDTH - PADDING_RIGHT}
                    y2={getY(avgEntryPrice)}
                    stroke="#10b981"
                    strokeWidth={1.5}
                    strokeDasharray="2 2"
                  />
                  <rect
                    x={PADDING_LEFT}
                    y={getY(avgEntryPrice) - 18}
                    width={160}
                    height={18}
                    rx={3}
                    fill="#065f46"
                  />
                  <text
                    x={PADDING_LEFT + 6}
                    y={getY(avgEntryPrice) - 5}
                    fill="#34d399"
                    fontSize={10}
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    POS AVG: ${avgEntryPrice.toFixed(2)} ({positionQty} Shs)
                  </text>
                </g>
              )}
            </svg>

            {/* PRE-GAME OVERLAY: If match not started, ask user to start! */}
            {!gameStarted && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center space-y-3 z-20">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-xl shadow-purple-600/30 flex items-center justify-center">
                  <div className="w-full h-full bg-[#0d0724] rounded-[14px] flex items-center justify-center text-2xl">
                    🚀
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Ready to Trade?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-sm">
                    5-Minute Compressed Market Replay &bull; $100k Virtual Balance &bull; Compete Live
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                  <button
                    onClick={handleStartMatch}
                    className="py-3 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>START MATCH (5:00)</span>
                  </button>

                  <button
                    onClick={() => setShowHowToPlay(true)}
                    className="py-2.5 px-4 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 hover:text-white font-bold text-xs border border-purple-500/30 cursor-pointer"
                  >
                    Review Rules First
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. BOTTOM WORKSPACE TABS matching Screenshot 5 */}
      <div className="bg-[#12082b] rounded-2xl border border-purple-500/30 p-4 space-y-3 shadow-lg">
        {/* Tab Headers */}
        <div className="flex items-center gap-2 border-b border-purple-500/20 pb-2">
          <button
            onClick={() => {
              soundEffects.click();
              setBottomTab('TRADES');
            }}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              bottomTab === 'TRADES'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            My Trades ({trades.length})
          </button>

          <button
            onClick={() => {
              soundEffects.click();
              setBottomTab('STATS');
            }}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              bottomTab === 'STATS'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            Game Stats
          </button>

          <button
            onClick={() => {
              soundEffects.click();
              setBottomTab('LEADERBOARD');
            }}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              bottomTab === 'LEADERBOARD'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Live Leaderboard</span>
          </button>
        </div>

        {/* TAB 1: My Trades Table matching Screenshot 5 */}
        {bottomTab === 'TRADES' && (
          <div className="overflow-x-auto">
            {trades.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-mono">
                No Data. Execute your first BUY to begin trading in this 5-minute round.
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-purple-500/20 text-slate-400 text-[10px] uppercase">
                    <th className="py-2 px-2">#</th>
                    <th className="py-2 px-2">Side</th>
                    <th className="py-2 px-2">Price</th>
                    <th className="py-2 px-2">Qty</th>
                    <th className="py-2 px-2">Pos</th>
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 px-2">Order</th>
                    <th className="py-2 px-2">Time</th>
                    <th className="py-2 px-2 text-right">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10">
                  {trades.map(trade => (
                    <tr key={trade.id} className="hover:bg-purple-950/40">
                      <td className="py-2 px-2 text-slate-400">{trade.id}</td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          trade.side === 'BUY' ? 'bg-blue-600/30 text-blue-400' : 'bg-purple-600/30 text-purple-400'
                        }`}>
                          {trade.side}
                        </span>
                      </td>
                      <td className="py-2 px-2 font-bold text-white">${trade.price.toFixed(2)}</td>
                      <td className="py-2 px-2 text-slate-300">{trade.qty}</td>
                      <td className="py-2 px-2 text-cyan-300">{trade.remainingPos}</td>
                      <td className="py-2 px-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                          {trade.status}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-slate-400">{trade.orderType}</td>
                      <td className="py-2 px-2 text-slate-400">{trade.time}</td>
                      <td className="py-2 px-2 text-right font-bold">
                        {trade.pnl !== undefined ? (
                          <span className={trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-500">&mdash;</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 2: Game Stats */}
        {bottomTab === 'STATS' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Trades</span>
              <span className="text-base font-black text-white font-mono">{trades.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Realized P&L</span>
              <span className={`text-base font-black font-mono ${realizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ${realizedPnL.toFixed(2)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Unrealized P&L</span>
              <span className={`text-base font-black font-mono ${unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ${unrealizedPnL.toFixed(2)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Tournament Rank</span>
              <span className="text-base font-black text-amber-300 font-mono">#{userRank} of {allCompetitorsWithUser.length}</span>
            </div>
          </div>
        )}

        {/* TAB 3: Live Tournament Leaderboard */}
        {bottomTab === 'LEADERBOARD' && (
          <div className="space-y-2">
            {allCompetitorsWithUser.map((comp, idx) => (
              <div
                key={comp.id}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-mono transition-all ${
                  comp.isUser
                    ? 'bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border border-cyan-400 shadow-md font-bold'
                    : 'bg-slate-900/80 border border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 font-black text-center ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-500'}`}>
                    #{idx + 1}
                  </span>
                  <span className="text-base">{comp.avatar}</span>
                  <span className="font-sans font-bold text-white flex items-center gap-2">
                    {comp.name}
                    {comp.isUser && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 uppercase">
                        YOU
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-slate-400 hidden sm:inline">{comp.tradesCount} trades</span>
                  <span className={`font-black ${comp.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {comp.profit >= 0 ? '+' : ''}${comp.profit.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. ROUND COMPLETION & REWARD MODAL */}
      {roundOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#12072b] rounded-3xl border border-purple-500/50 p-6 sm:p-8 space-y-6 text-center shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-4xl mx-auto shadow-xl shadow-amber-500/30">
              🏆
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Match Concluded!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                5-Minute Fast-Paced Trading Session Finished
              </p>
            </div>

            {/* Scorecard */}
            <div className="p-4 rounded-2xl bg-[#1b0d40] border border-purple-500/30 space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs border-b border-purple-500/20 pb-2">
                <span className="text-slate-400">Final Net P&L:</span>
                <span className={`text-base font-black ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-purple-500/20 pb-2">
                <span className="text-slate-400">Tournament Standing:</span>
                <span className="text-amber-300 font-bold">#{userRank} of {allCompetitorsWithUser.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Rewards Earned:</span>
                <span className="text-cyan-300 font-bold">
                  {totalPnL > 0 ? '+200 XP • +15 💎 Tokens' : '+50 XP'}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  soundEffects.click();
                  setTimeLeft(300);
                  setRoundOver(false);
                  setGameStarted(false);
                  setRealizedPnL(0);
                  setPositionQty(0);
                  setTrades([]);
                  setBuyingPower(initialBuyingPower);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/30 cursor-pointer"
              >
                Play Another Match
              </button>

              <button
                onClick={() => {
                  soundEffects.click();
                  setActiveGame(null);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs cursor-pointer"
              >
                Return to Game Arena
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How to Play Modal (Pops up automatically when entering game!) */}
      <TraderFiHowToPlayModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
        onStartExploring={() => {
          handleStartMatch();
        }}
      />
    </div>
  );
};
