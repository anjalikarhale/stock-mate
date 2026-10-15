import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Flame,
  Award,
  Zap,
  RotateCcw,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../context/GameContext';
import { soundEffects } from '../../utils/audio';

interface PredictionRound {
  id: string;
  ticker: string;
  companyName: string;
  difficulty: 'Rookie' | 'Trader' | 'Master';
  description: string;
  patternName: string;
  initialPrices: number[];
  revealedPrices: number[];
  correctOutcome: 'UP' | 'DOWN';
  percentageChange: number;
  explanation: string;
  technicalFactors: string[];
}

const PREDICTION_ROUNDS: PredictionRound[] = [
  {
    id: 'round-1',
    ticker: 'RELIANCE',
    companyName: 'Reliance Industries',
    difficulty: 'Rookie',
    description: 'Consolidating near key 20-DMA support after a 3-day retracement. Notice diminishing seller volume.',
    patternName: 'Bullish Hammer at Support',
    initialPrices: [2840, 2835, 2828, 2830, 2822, 2818, 2815, 2810, 2808, 2812, 2815, 2818],
    revealedPrices: [2826, 2838, 2855, 2862, 2875],
    correctOutcome: 'UP',
    percentageChange: 2.02,
    explanation: 'Buyers defended the psychological ₹2810 support zone with heavy intraday tail rejections (Hammer), leading to a sharp momentum bounce.',
    technicalFactors: ['Hammer rejection wick', 'RSI oversold bounce at 38', 'Higher volume on green candles'],
  },
  {
    id: 'round-2',
    ticker: 'TCS',
    companyName: 'Tata Consultancy Services',
    difficulty: 'Trader',
    description: 'Price tested previous all-time high resistance for the third time, printing a long upper wick (Shooting Star).',
    patternName: 'Shooting Star at Resistance',
    initialPrices: [3920, 3935, 3960, 3980, 4005, 4015, 4020, 4018, 4022, 4025, 4010, 3995],
    revealedPrices: [3980, 3962, 3945, 3930, 3915],
    correctOutcome: 'DOWN',
    percentageChange: -2.0,
    explanation: 'Institutional sellers unloaded inventory at the psychological ₹4020 resistance. The heavy upper rejection shadow signaled buyers exhausted their liquidity.',
    technicalFactors: ['Shooting star wick', 'Bearish divergence on RSI', 'Failed breakout trap'],
  },
  {
    id: 'round-3',
    ticker: 'HDFCBANK',
    companyName: 'HDFC Bank Ltd',
    difficulty: 'Trader',
    description: 'Tight range compression inside a descending triangle. RBI policy decision announced tomorrow.',
    patternName: 'Symmetrical Triangle Compression',
    initialPrices: [1620, 1635, 1625, 1640, 1630, 1642, 1636, 1645, 1638, 1648, 1642, 1650],
    revealedPrices: [1662, 1675, 1688, 1695, 1710],
    correctOutcome: 'UP',
    percentageChange: 3.63,
    explanation: 'Higher lows into horizontal resistance triggered a massive short squeeze. Squeeze breakout caused stop-losses to cascade into market buy orders.',
    technicalFactors: ['Ascending base of higher lows', 'Volume explosion on breakout', 'BankNifty tailwind'],
  },
  {
    id: 'round-4',
    ticker: 'TATAMOTORS',
    companyName: 'Tata Motors Passenger Vehicles',
    difficulty: 'Master',
    description: 'Stock rallied +18% in 4 days. Today it gaps up +4% at market open on heavy retail hype.',
    patternName: 'Blow-off Top / Exhaustion Gap',
    initialPrices: [820, 840, 865, 890, 915, 935, 960, 975, 985, 995, 1020, 1015],
    revealedPrices: [1005, 988, 970, 955, 940],
    correctOutcome: 'DOWN',
    percentageChange: -7.38,
    explanation: 'A classic "Exhaustion Gap" and profit booking trap. Smart money used retail FOMO into the ₹1000 milestone to dump positions, triggering a sharp pullback.',
    technicalFactors: ['Exhaustion gap fill', 'RSI overbought at 84', 'Huge volume on red reversal bar'],
  },
  {
    id: 'round-5',
    ticker: 'INFY',
    companyName: 'Infosys Limited',
    difficulty: 'Master',
    description: 'Double bottom confirmed on daily chart with bullish engulfing candle crossing above 50-EMA.',
    patternName: 'Double Bottom with Bullish Engulfing',
    initialPrices: [1420, 1400, 1380, 1395, 1410, 1390, 1382, 1385, 1405, 1418, 1425, 1440],
    revealedPrices: [1455, 1472, 1490, 1505, 1520],
    correctOutcome: 'UP',
    percentageChange: 5.55,
    explanation: 'The classic "W" double bottom formed a rock-solid floor at ₹1380. Neckline breach invited trend-following funds to enter with high conviction.',
    technicalFactors: ['Double bottom W pattern', 'Neckline breakout above ₹1420', 'Volume confirmation'],
  },
];

export const PricePredictionGame: React.FC = () => {
  const { addXP, addVirtualCash, recordMistake, setActiveGame } = useGame();

  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [prediction, setPrediction] = useState<'UP' | 'DOWN' | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isRevealed, setIsRevealed] = useState(false);
  const [streak, setStreak] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionWins, setSessionWins] = useState(0);
  const [revealedStep, setRevealedStep] = useState(0);

  const round = PREDICTION_ROUNDS[currentRoundIndex % PREDICTION_ROUNDS.length];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer countdown
  useEffect(() => {
    if (isRevealed) return;

    setTimeLeft(10);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentRoundIndex, isRevealed]);

  const handleTimeout = () => {
    // If user ran out of time, mark as missed
    if (prediction === null) {
      handleUserPrediction(null);
    }
  };

  const handleUserPrediction = (userChoice: 'UP' | 'DOWN' | null) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPrediction(userChoice);
    setIsRevealed(true);

    const isCorrect = userChoice === round.correctOutcome;

    // Animate revealed candles step by step
    setRevealedStep(0);
    const interval = setInterval(() => {
      setRevealedStep((step) => {
        if (step >= round.revealedPrices.length) {
          clearInterval(interval);
          return round.revealedPrices.length;
        }
        return step + 1;
      });
    }, 180);

    if (isCorrect) {
      soundEffects.correct();
      const newStreak = streak + 1;
      setStreak(newStreak);
      setSessionWins((w) => w + 1);

      const multiplier = newStreak >= 3 ? 2 : 1;
      const roundScore = 200 * multiplier;
      setSessionScore((s) => s + roundScore);

      const earnedXP = 120 + newStreak * 25;
      const profit = Math.round(5000 * (Math.abs(round.percentageChange) / 100) * 10);
      addXP(earnedXP, `Prediction Win (${round.ticker})`);
      addVirtualCash(profit);

      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}
    } else {
      soundEffects.wrong();
      setStreak(0);
      recordMistake(
        'CHASING_PEAK',
        `Predicted ${userChoice || 'TIMEOUT'} on ${round.ticker}, but price moved ${round.correctOutcome}.`,
        1500,
        round.explanation
      );
    }
  };

  const handleNextRound = () => {
    soundEffects.click();
    setIsRevealed(false);
    setPrediction(null);
    setRevealedStep(0);
    setCurrentRoundIndex((prev) => (prev + 1) % PREDICTION_ROUNDS.length);
  };

  const handleRestart = () => {
    soundEffects.click();
    setCurrentRoundIndex(0);
    setIsRevealed(false);
    setPrediction(null);
    setStreak(0);
    setSessionScore(0);
    setSessionWins(0);
    setRevealedStep(0);
  };

  // Build chart coordinates
  const allInitial = round.initialPrices;
  const revealedSlice = round.revealedPrices.slice(0, revealedStep);
  const displayPrices = isRevealed ? [...allInitial, ...revealedSlice] : allInitial;

  const minP = Math.min(...round.initialPrices, ...round.revealedPrices) * 0.99;
  const maxP = Math.max(...round.initialPrices, ...round.revealedPrices) * 1.01;
  const range = maxP - minP || 1;

  const chartWidth = 600;
  const chartHeight = 260;
  const totalSlots = allInitial.length + round.revealedPrices.length;
  const stepX = chartWidth / (totalSlots - 1);

  const initialPoints = allInitial.map((price, idx) => {
    const x = idx * stepX;
    const y = chartHeight - ((price - minP) / range) * (chartHeight - 40) - 20;
    return { x, y, price };
  });

  const revealedPoints = revealedSlice.map((price, idx) => {
    const x = (allInitial.length + idx) * stepX;
    const y = chartHeight - ((price - minP) / range) * (chartHeight - 40) - 20;
    return { x, y, price };
  });

  const isWin = prediction === round.correctOutcome;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveGame(null)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Return to Arcade"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-indigo-400 uppercase">
                SPEED PREDICTION ARENA
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                ROUND {currentRoundIndex + 1}/{PREDICTION_ROUNDS.length}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Price Direction Duel
            </h1>
          </div>
        </div>

        {/* Live Gamer Stats */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
          <div className="px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <div className="text-left">
              <div className="text-[10px] text-amber-300/80 font-bold uppercase">Streak</div>
              <div className="text-sm font-black text-amber-300">{streak}x Combo</div>
            </div>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400" />
            <div className="text-left">
              <div className="text-[10px] text-indigo-300/80 font-bold uppercase">Score</div>
              <div className="text-sm font-black text-indigo-300">{sessionScore} pts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Card */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Stock & Mission Info Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">{round.ticker}</h2>
              <span className="text-xs text-slate-400 font-medium">({round.companyName})</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  round.difficulty === 'Rookie'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : round.difficulty === 'Trader'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                {round.difficulty}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">{round.description}</p>
          </div>

          {/* Countdown Clock */}
          {!isRevealed ? (
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${
                timeLeft <= 3
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-amber-400'
              }`}
            >
              <Clock className="w-5 h-5 animate-spin" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Time Left</div>
                <div className="text-lg font-black">{timeLeft}s remaining</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Round Status</div>
                <div className="text-xs font-bold text-white">Movement Revealed</div>
              </div>
            </div>
          )}
        </div>

        {/* Chart Viewport */}
        <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-hidden">
          {/* Mystery Fog Overlay if not revealed */}
          {!isRevealed && (
            <div
              className="absolute top-0 right-0 bottom-0 bg-gradient-to-l from-indigo-950/80 via-slate-900/60 to-transparent pointer-events-none flex items-center justify-end pr-8"
              style={{ width: `${((round.revealedPrices.length) / totalSlots) * 100 + 10}%` }}
            >
              <div className="text-center p-3 rounded-2xl bg-slate-900/90 border border-indigo-500/40 backdrop-blur-md shadow-2xl">
                <HelpCircle className="w-7 h-7 text-indigo-400 mx-auto animate-bounce mb-1" />
                <div className="text-xs font-black text-indigo-200">FUTURE MOVEMENT HIDDEN</div>
                <div className="text-[10px] text-slate-400">Predict UP or DOWN to reveal</div>
              </div>
            </div>
          )}

          {/* SVG Price Line */}
          <div className="w-full h-64 relative">
            <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="knownGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="futureGradUp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="futureGradDown" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="0" y1="50" x2={chartWidth} y2="50" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="0" y1="130" x2={chartWidth} y2="130" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="0" y1="210" x2={chartWidth} y2="210" stroke="#1e293b" strokeDasharray="4 4" />

              {/* Known Path */}
              {initialPoints.length > 1 && (
                <path
                  d={initialPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '')}
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}

              {/* Known Dots */}
              {initialPoints.map((pt, i) => (
                <circle key={`init-${i}`} cx={pt.x} cy={pt.y} r="3" fill="#818cf8" />
              ))}

              {/* Revealed Future Path */}
              {isRevealed && revealedPoints.length > 0 && (
                <>
                  <path
                    d={`M ${initialPoints[initialPoints.length - 1].x} ${
                      initialPoints[initialPoints.length - 1].y
                    } ${revealedPoints.map((pt) => `L ${pt.x} ${pt.y}`).join(' ')}`}
                    fill="none"
                    stroke={round.correctOutcome === 'UP' ? '#10b981' : '#ef4444'}
                    strokeWidth="3.5"
                    strokeDasharray={isRevealed ? 'none' : '5 5'}
                    strokeLinecap="round"
                  />
                  {revealedPoints.map((pt, i) => (
                    <circle
                      key={`rev-${i}`}
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      fill={round.correctOutcome === 'UP' ? '#10b981' : '#ef4444'}
                    />
                  ))}
                </>
              )}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-900 font-mono">
            <span>Historical Ticks (Past 12 Days)</span>
            <span className="text-indigo-400 font-bold">Current Price: ₹{round.initialPrices[round.initialPrices.length - 1]}</span>
            <span>Upcoming 5 Days</span>
          </div>
        </div>

        {/* Action Panel: Prediction Buttons OR Revealed Result */}
        {!isRevealed ? (
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Make Your Prediction
              </span>
              <p className="text-base font-black text-white mt-0.5">
                Where will {round.ticker} move next?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleUserPrediction('UP')}
                className="group relative flex items-center justify-center gap-3 p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-lg shadow-xl shadow-emerald-950/50 hover:shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <TrendingUp className="w-7 h-7 transition-transform group-hover:-translate-y-1" />
                <div className="text-left">
                  <div className="text-xs font-semibold opacity-90 uppercase">Bullish Setup</div>
                  <div>PREDICT UP 🚀</div>
                </div>
              </button>

              <button
                onClick={() => handleUserPrediction('DOWN')}
                className="group relative flex items-center justify-center gap-3 p-5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-black text-lg shadow-xl shadow-rose-950/50 hover:shadow-rose-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <TrendingDown className="w-7 h-7 transition-transform group-hover:translate-y-1" />
                <div className="text-left">
                  <div className="text-xs font-semibold opacity-90 uppercase">Bearish Breakdown</div>
                  <div>PREDICT DOWN 📉</div>
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* Revealed Result & Breakdown */
          <div className="space-y-5 animate-fadeIn">
            {/* Outcome Banner */}
            <div
              className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                isWin
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black ${
                    isWin ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                  }`}
                >
                  {isWin ? '🎉' : '❌'}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest">
                    {isWin ? 'EXCELLENT CALL! PREDICTION CORRECT' : 'INCORRECT PREDICTION'}
                  </div>
                  <div className="text-xl font-black text-white">
                    Actual Movement: {round.correctOutcome === 'UP' ? '📈 Rallied UP' : '📉 Broke DOWN'} ({round.percentageChange > 0 ? '+' : ''}{round.percentageChange}%)
                  </div>
                  <div className="text-xs opacity-90">
                    Your choice: <span className="font-bold underline">{prediction || 'TIMEOUT'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Reward</div>
                  <div className="text-sm font-black text-emerald-400">
                    {isWin ? '+120 XP' : '+0 XP'}
                  </div>
                </div>
                <button
                  onClick={handleNextRound}
                  className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-105"
                >
                  <span>Next Challenge</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Explanation & Technical Anatomy */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Market Mechanics & Learning Insight</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {round.explanation}
              </p>

              <div className="pt-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Key Technical Factors:
                </div>
                <div className="flex flex-wrap gap-2">
                  {round.technicalFactors.map((factor, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-300 font-medium"
                    >
                      ✓ {factor}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
