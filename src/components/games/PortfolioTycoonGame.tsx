import React, { useState } from 'react';
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Coins,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Award,
  Zap,
  RotateCcw,
  AlertTriangle,
  Layers,
  Sliders,
  DollarSign,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../context/GameContext';
import { soundEffects } from '../../utils/audio';

interface AssetCategory {
  id: string;
  name: string;
  sector: string;
  color: string;
  badge: string;
  expectedRisk: 'Low' | 'Medium' | 'High';
  description: string;
}

const ASSET_BUCKETS: AssetCategory[] = [
  {
    id: 'it',
    name: 'Information Tech (TCS, INFY)',
    sector: 'Technology',
    color: '#38bdf8',
    badge: 'Growth',
    expectedRisk: 'Medium',
    description: 'Export-oriented software giants. Thrives on tech spending and currency tailwinds.',
  },
  {
    id: 'banking',
    name: 'Banking & NBFCs (HDFCBANK, ICICI)',
    sector: 'Financials',
    color: '#818cf8',
    badge: 'Heavyweight',
    expectedRisk: 'Medium',
    description: 'The engine of the economy. Sensitive to interest rate hikes and credit expansion.',
  },
  {
    id: 'energy',
    name: 'Energy & Commodities (RELIANCE, TATASTEEL)',
    sector: 'Energy & Infra',
    color: '#f59e0b',
    badge: 'High Beta',
    expectedRisk: 'High',
    description: 'Refineries & metals. Gains from crude oil volatility and industrial infrastructure cycles.',
  },
  {
    id: 'pharma',
    name: 'Healthcare & Pharma (SUNPHARMA, CIPLA)',
    sector: 'Defensive',
    color: '#10b981',
    badge: 'Safe Haven',
    expectedRisk: 'Low',
    description: 'Inelastic demand. Excellent hedge when market corrections strike cyclical stocks.',
  },
  {
    id: 'auto',
    name: 'Auto & Consumer (TATAMOTORS, M&M)',
    sector: 'Consumer Discretionary',
    color: '#ec4899',
    badge: 'Cyclical',
    expectedRisk: 'High',
    description: 'EV & vehicle demand. Tied to consumer sentiment, festive seasons, and rural monsoon.',
  },
  {
    id: 'gold',
    name: 'Sovereign Gold & Liquid Bonds',
    sector: 'Safe Assets',
    color: '#eab308',
    badge: 'Shield',
    expectedRisk: 'Low',
    description: 'Ultra-low risk store of value. Protects capital against sudden inflation & geopolitical shocks.',
  },
];

interface MacroEvent {
  quarter: string;
  headline: string;
  description: string;
  sectorImpacts: Record<string, number>; // sector id -> percentage return
  niftyReturn: number;
}

const MACRO_EVENTS: MacroEvent[] = [
  {
    quarter: 'Quarter 1: Monetary Tightening',
    headline: 'RBI Hikes Repo Rate by 50 bps to Combat Inflation',
    description: 'Bond yields climb. Banking spreads expand favorably, but high borrowing costs pressure Auto and high-multiple Tech stocks.',
    sectorImpacts: {
      it: -4.5,
      banking: +7.2,
      energy: +1.5,
      pharma: +3.0,
      auto: -6.0,
      gold: +2.5,
    },
    niftyReturn: +1.8,
  },
  {
    quarter: 'Quarter 2: Global AI & Tech Capex Wave',
    headline: 'Global Enterprises Surge Cloud & AI Tech Contracts',
    description: 'Indian IT services ink multi-billion dollar AI modernization deals. Foreign funds heavily rotate into tech blue-chips.',
    sectorImpacts: {
      it: +16.8,
      banking: +3.1,
      energy: -2.0,
      pharma: +1.0,
      auto: +4.2,
      gold: -1.5,
    },
    niftyReturn: +4.9,
  },
  {
    quarter: 'Quarter 3: Geopolitical Supply Shock',
    headline: 'OPEC Slashes Oil Output — Brent Crud Surges Past $92',
    description: 'Oil refining gross margins jump, boosting Energy. High fuel import bills trigger inflation fears, hurting Consumer Auto.',
    sectorImpacts: {
      it: -2.5,
      banking: -3.5,
      energy: +14.2,
      pharma: +5.0,
      auto: -8.5,
      gold: +6.8,
    },
    niftyReturn: -2.4,
  },
  {
    quarter: 'Quarter 4: Monsoon & Festive Supercycle',
    headline: 'Above-Normal Monsoon Drives Rural Consumption Boom',
    description: 'Bumper crop harvests lead to record tractor and SUV sales. Indian domestic economy outpaces global peers.',
    sectorImpacts: {
      it: +3.5,
      banking: +6.0,
      energy: +2.8,
      pharma: +2.0,
      auto: +15.5,
      gold: +1.0,
    },
    niftyReturn: +5.6,
  },
];

const INITIAL_BUDGET = 500000;

export const PortfolioTycoonGame: React.FC = () => {
  const { addXP, addVirtualCash, setActiveGame } = useGame();

  const [currentQuarterIndex, setCurrentQuarterIndex] = useState(0);
  const [allocations, setAllocations] = useState<Record<string, number>>({
    it: 20,
    banking: 25,
    energy: 15,
    pharma: 15,
    auto: 10,
    gold: 15,
  });

  const [portfolioValue, setPortfolioValue] = useState(INITIAL_BUDGET);
  const [niftyValue, setNiftyValue] = useState(INITIAL_BUDGET);
  const [quarterHistory, setQuarterHistory] = useState<
    {
      quarter: string;
      portfolioReturn: number;
      niftyReturn: number;
      portfolioEnd: number;
      niftyEnd: number;
    }[]
  >([]);

  const [gamePhase, setGamePhase] = useState<'ALLOCATE' | 'EVENT_REVEAL' | 'COMPLETED'>('ALLOCATE');
  const [lastEvent, setLastEvent] = useState<MacroEvent | null>(null);

  const totalAllocatedPercent = Object.values(allocations).reduce<number>((acc, v) => acc + Number(v || 0), 0);

  const handleSliderChange = (bucketId: string, val: number) => {
    soundEffects.click();
    setAllocations((prev) => ({
      ...prev,
      [bucketId]: val,
    }));
  };

  const handleSimulateQuarter = () => {
    if (totalAllocatedPercent !== 100) {
      alert(`Total portfolio allocation must equal 100%. Currently: ${totalAllocatedPercent}%`);
      return;
    }

    soundEffects.click();
    const event = MACRO_EVENTS[currentQuarterIndex];
    setLastEvent(event);

    // Calculate quarterly portfolio return based on allocations
    let quarterlyReturnPercent = 0;
    ASSET_BUCKETS.forEach((bucket) => {
      const weight = (allocations[bucket.id] || 0) / 100;
      const sectorReturn = event.sectorImpacts[bucket.id] || 0;
      quarterlyReturnPercent += weight * sectorReturn;
    });

    const newPortfolioVal = Math.round(portfolioValue * (1 + quarterlyReturnPercent / 100));
    const newNiftyVal = Math.round(niftyValue * (1 + event.niftyReturn / 100));

    setPortfolioValue(newPortfolioVal);
    setNiftyValue(newNiftyVal);

    setQuarterHistory((prev) => [
      ...prev,
      {
        quarter: event.quarter,
        portfolioReturn: quarterlyReturnPercent,
        niftyReturn: event.niftyReturn,
        portfolioEnd: newPortfolioVal,
        niftyEnd: newNiftyVal,
      },
    ]);

    if (quarterlyReturnPercent > event.niftyReturn) {
      soundEffects.correct();
    }

    setGamePhase('EVENT_REVEAL');
  };

  const handleNextQuarter = () => {
    soundEffects.click();
    if (currentQuarterIndex + 1 < MACRO_EVENTS.length) {
      setCurrentQuarterIndex((prev) => prev + 1);
      setGamePhase('ALLOCATE');
    } else {
      // Completed all 4 Quarters!
      setGamePhase('COMPLETED');
      const totalPortfolioGain = ((portfolioValue - INITIAL_BUDGET) / INITIAL_BUDGET) * 100;
      const totalNiftyGain = ((niftyValue - INITIAL_BUDGET) / INITIAL_BUDGET) * 100;
      const alpha = totalPortfolioGain - totalNiftyGain;

      const earnedXP = alpha > 0 ? 350 : 180;
      addXP(earnedXP, 'Portfolio Tycoon Finished');
      addVirtualCash(Math.max(1000, Math.round((portfolioValue - INITIAL_BUDGET) * 0.1)));

      if (alpha > 0) {
        try {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        } catch {}
      }
    }
  };

  const handleRestart = () => {
    soundEffects.click();
    setCurrentQuarterIndex(0);
    setPortfolioValue(INITIAL_BUDGET);
    setNiftyValue(INITIAL_BUDGET);
    setQuarterHistory([]);
    setGamePhase('ALLOCATE');
    setLastEvent(null);
  };

  const totalGainPercent = ((portfolioValue - INITIAL_BUDGET) / INITIAL_BUDGET) * 100;
  const totalNiftyPercent = ((niftyValue - INITIAL_BUDGET) / INITIAL_BUDGET) * 100;
  const currentAlpha = totalGainPercent - totalNiftyPercent;

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
              <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">
                PORTFOLIO TYCOON SIMULATION
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                BUDGET ₹5,00,000
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Dalal Street Asset Allocator
            </h1>
          </div>
        </div>

        {/* Live Portfolio Worth */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
          <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-right">
            <div className="text-[10px] text-emerald-300/80 font-bold uppercase">Your Valuation</div>
            <div className="text-base font-black text-emerald-300">
              ₹{portfolioValue.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-slate-800 border border-slate-700 text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase">NIFTY 50 Benchmark</div>
            <div className="text-base font-black text-slate-200">
              ₹{niftyValue.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Quarter Progress Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-2 overflow-x-auto">
        {MACRO_EVENTS.map((evt, idx) => (
          <div
            key={idx}
            className={`flex-1 min-w-[120px] text-center p-2 rounded-xl border transition-all ${
              idx === currentQuarterIndex
                ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                : idx < currentQuarterIndex
                ? 'bg-slate-800/60 border-slate-700 text-emerald-400'
                : 'bg-slate-950/40 border-slate-800/60 text-slate-400'
            }`}
          >
            <div className="text-[10px] uppercase font-mono">Q{idx + 1}</div>
            <div className="text-xs truncate">{evt.quarter.split(':')[1]?.trim() || evt.quarter}</div>
          </div>
        ))}
      </div>

      {/* PHASE 1: ALLOCATION CONTROLS */}
      {gamePhase === 'ALLOCATE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-white">
                Rebalance Portfolio for {MACRO_EVENTS[currentQuarterIndex].quarter}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Allocate your ₹{portfolioValue.toLocaleString('en-IN')} capital across sectors. Strive for diversification to withstand macro volatility.
              </p>
            </div>

            <div
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-black ${
                totalAllocatedPercent === 100
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
              }`}
            >
              Total Allocated: {totalAllocatedPercent}% / 100%
            </div>
          </div>

          {/* Allocation Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ASSET_BUCKETS.map((bucket) => {
              const currentPercent = allocations[bucket.id] || 0;
              const rupeeAmount = Math.round((portfolioValue * currentPercent) / 100);

              return (
                <div
                  key={bucket.id}
                  className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bucket.color }} />
                        <span className="text-xs font-bold text-white">{bucket.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{bucket.description}</span>
                    </div>
                    <span className="text-xs font-black text-indigo-300 font-mono">
                      {currentPercent}%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="5"
                      value={currentPercent}
                      onChange={(e) => handleSliderChange(bucket.id, parseInt(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>0%</span>
                      <span className="text-emerald-400">₹{rupeeAmount.toLocaleString('en-IN')}</span>
                      <span>Max 60%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              Goal: Beat the <strong className="text-slate-200">NIFTY 50 benchmark</strong> and grow capital over 4 quarters.
            </div>

            <button
              onClick={handleSimulateQuarter}
              disabled={totalAllocatedPercent !== 100}
              className={`px-6 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl transition-all ${
                totalAllocatedPercent === 100
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white cursor-pointer hover:scale-105'
                  : 'bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              <span>Simulate Quarter Macro Event</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: MACRO EVENT REVEAL */}
      {gamePhase === 'EVENT_REVEAL' && lastEvent && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 animate-fadeIn">
          {/* Breaking News Banner */}
          <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/40 p-5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-widest">
              <AlertTriangle className="w-4 h-4" />
              <span>MARKET BREAKING NEWS // {lastEvent.quarter}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">{lastEvent.headline}</h3>
            <p className="text-xs sm:text-sm text-slate-300">{lastEvent.description}</p>
          </div>

          {/* Sector Returns Matrix */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Sector Performance Breakdown This Quarter
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ASSET_BUCKETS.map((bucket) => {
                const ret = lastEvent.sectorImpacts[bucket.id] || 0;
                const allocated = allocations[bucket.id] || 0;

                return (
                  <div
                    key={bucket.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white truncate max-w-[120px]">
                        {bucket.sector}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">Weight: {allocated}%</div>
                    </div>
                    <div
                      className={`text-xs font-black font-mono ${
                        ret >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {ret >= 0 ? '+' : ''}
                      {ret}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quarter Result vs Benchmark */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400">Quarterly Portfolio Return</div>
              <div
                className={`text-xl font-black ${
                  quarterHistory[quarterHistory.length - 1]?.portfolioReturn >= 0
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {quarterHistory[quarterHistory.length - 1]?.portfolioReturn >= 0 ? '+' : ''}
                {quarterHistory[quarterHistory.length - 1]?.portfolioReturn.toFixed(2)}%
              </div>
            </div>

            <div className="text-center sm:text-left">
              <div className="text-xs text-slate-400">NIFTY 50 Benchmark Return</div>
              <div className="text-base font-black text-slate-200">
                {lastEvent.niftyReturn >= 0 ? '+' : ''}
                {lastEvent.niftyReturn}%
              </div>
            </div>

            <button
              onClick={handleNextQuarter}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg transition-all hover:scale-105"
            >
              <span>
                {currentQuarterIndex + 1 < MACRO_EVENTS.length ? 'Next Quarter' : 'View Final Results'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* PHASE 3: GAME COMPLETED SUMMARY */}
      {gamePhase === 'COMPLETED' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl mx-auto shadow-xl">
              🏆
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Annual Portfolio Tycoon Report
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
              You navigated all 4 macro quarterly cycles on Dalal Street. Here is how your portfolio performed against the institutional benchmark.
            </p>
          </div>

          {/* Performance Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 font-bold uppercase">Final Valuation</div>
              <div className="text-xl font-black text-emerald-400 mt-1">
                ₹{portfolioValue.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {totalGainPercent >= 0 ? '+' : ''}
                {totalGainPercent.toFixed(2)}% Total Return
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 font-bold uppercase">NIFTY 50 Benchmark</div>
              <div className="text-xl font-black text-slate-200 mt-1">
                ₹{niftyValue.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {totalNiftyPercent >= 0 ? '+' : ''}
                {totalNiftyPercent.toFixed(2)}% Benchmark Return
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 font-bold uppercase">Alpha Generated</div>
              <div
                className={`text-xl font-black mt-1 ${
                  currentAlpha >= 0 ? 'text-indigo-400' : 'text-rose-400'
                }`}
              >
                {currentAlpha >= 0 ? '+' : ''}
                {currentAlpha.toFixed(2)}%
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {currentAlpha >= 0 ? 'BEAT THE BENCHMARK! 🚀' : 'LAGGED THE BENCHMARK'}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleRestart}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again with New Strategy</span>
            </button>
            <button
              onClick={() => setActiveGame(null)}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-sm"
            >
              Back to Arcade
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
