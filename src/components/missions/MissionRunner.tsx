import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Coins,
  Activity,
  Bot,
  ArrowRight,
  RotateCcw,
  Zap,
  Play,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../context/GameContext';
import { BEGINNER_MISSIONS } from '../../data/missionsData';
import { soundEffects } from '../../utils/audio';

export const MissionRunner: React.FC = () => {
  const {
    activeMissionId,
    setActiveMissionId,
    completeMission,
    executeTrade,
    profile,
    stocks,
    setActiveGame
  } = useGame();

  const mission = BEGINNER_MISSIONS.find(m => m.id === activeMissionId) || BEGINNER_MISSIONS[0];

  // Mission specific state
  const [missionStep, setMissionStep] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Mission 1 State (Investing vs Saving vs Spending)
  const [m1Choice, setM1Choice] = useState<'SPEND' | 'SAVE' | 'INVEST' | null>(null);
  const [m1Years, setM1Years] = useState<number>(5);

  // Mission 2 State (What is a Stock / PIZZACO)
  const [m2BoughtShare, setM2BoughtShare] = useState<boolean>(false);

  // Mission 3 State (Demand & Supply)
  const [m3Buyers, setM3Buyers] = useState<number>(50);
  const [m3Sellers, setM3Sellers] = useState<number>(50);

  // Mission 4 State (First Trade TCS)
  const [m4SelectedStock, setM4SelectedStock] = useState<boolean>(false);
  const [m4Quantity, setM4Quantity] = useState<number>(1);
  const [m4Executed, setM4Executed] = useState<boolean>(false);

  // Mission 6 State (First Loss Decision)
  const [m6Decision, setM6Decision] = useState<'SELL' | 'HOLD' | 'BUY_MORE' | null>(null);

  // Mission 7 State (Volatility)
  const [m7SimulationRun, setM7SimulationRun] = useState<boolean>(false);

  // Mission 8 State (Trend identification)
  const [m8Answer, setM8Answer] = useState<'UP' | 'DOWN' | 'SIDEWAYS' | null>(null);

  // Mission 9 State (Candlestick Anatomy & Patterns)
  const [m9PatternGuess, setM9PatternGuess] = useState<'HAMMER' | 'SHOOTING_STAR' | 'DOJI' | null>(null);

  // Mission 10 State (Support & Resistance Breakout)
  const [m10Hypothesis, setM10Hypothesis] = useState<'BREAKOUT_UP' | 'BREAKDOWN' | null>(null);
  const [m10Revealed, setM10Revealed] = useState<boolean>(false);

  const handleFinishMission = () => {
    soundEffects.levelUp();
    setIsCompleted(true);
    completeMission(mission.id);
  };

  const handleNextMissionOrLobby = () => {
    const currentIndex = BEGINNER_MISSIONS.findIndex(m => m.id === mission.id);
    const nextMission = BEGINNER_MISSIONS[currentIndex + 1];
    if (nextMission) {
      setActiveMissionId(nextMission.id);
      setMissionStep(1);
      setIsCompleted(false);
      // Reset states
      setM1Choice(null);
      setM2BoughtShare(false);
      setM3Buyers(50);
      setM3Sellers(50);
      setM4SelectedStock(false);
      setM4Executed(false);
      setM6Decision(null);
      setM7SimulationRun(false);
      setM8Answer(null);
      setM9PatternGuess(null);
      setM10Hypothesis(null);
      setM10Revealed(false);
    } else {
      setActiveMissionId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveMissionId(null)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Journey Map</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
            Mission {mission.number} of {BEGINNER_MISSIONS.length}
          </span>
          <span className="text-xs font-bold text-amber-400 font-mono">
            +{mission.xpReward} XP
          </span>
        </div>
      </div>

      {/* Main Mission Card */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Mission Header */}
        <div className="flex items-start gap-4 border-b border-slate-800 pb-5">
          <div className="text-4xl p-3 bg-slate-950 rounded-2xl border border-slate-800 shrink-0">
            {mission.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 font-mono">
                {mission.stageName}
              </span>
              <span className="text-xs text-slate-400">⏱️ ~{mission.estimatedMinutes} mins</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">{mission.title}</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">{mission.subtitle}</p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MISSION 1: WHAT IS INVESTING? */}
        {/* ========================================================================= */}
        {mission.id === 'mission-1' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-3">
              <Bot className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-indigo-300 block mb-0.5">Arya's Scenario:</strong>
                "You have <span className="text-white font-bold font-mono">₹1,000</span>. What do you do with it?"
              </div>
            </div>

            {/* Three Choices */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  soundEffects.click();
                  setM1Choice('SPEND');
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  m1Choice === 'SPEND'
                    ? 'bg-rose-950/80 border-rose-500 text-white ring-2 ring-rose-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-2xl mb-1">🛍️</div>
                <div className="font-extrabold text-sm text-white">Spend It</div>
                <div className="text-xs text-slate-400 mt-1">Buy clothes & snacks immediately.</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEffects.click();
                  setM1Choice('SAVE');
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  m1Choice === 'SAVE'
                    ? 'bg-amber-950/80 border-amber-500 text-white ring-2 ring-amber-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-2xl mb-1">🏦</div>
                <div className="font-extrabold text-sm text-white">Save in Cash / Locker</div>
                <div className="text-xs text-slate-400 mt-1">Keep ₹1,000 untouched under the mattress.</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEffects.click();
                  setM1Choice('INVEST');
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  m1Choice === 'INVEST'
                    ? 'bg-emerald-950/80 border-emerald-500 text-white ring-2 ring-emerald-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-2xl mb-1">📈</div>
                <div className="font-extrabold text-sm text-white">Invest in Stocks / Index</div>
                <div className="text-xs text-slate-400 mt-1">Put money into productive growing businesses.</div>
              </button>
            </div>

            {/* Visual Outcome Simulator */}
            {m1Choice && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Timeline Projection:
                  </span>
                  <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                    {[1, 5, 10].map(y => (
                      <button
                        key={y}
                        onClick={() => {
                          soundEffects.click();
                          setM1Years(y);
                        }}
                        className={`px-3 py-1 rounded-lg font-bold ${
                          m1Years === y ? 'bg-indigo-600 text-white' : 'text-slate-400'
                        }`}
                      >
                        {y} {y === 1 ? 'Year' : 'Years'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                  {m1Choice === 'SPEND' && (
                    <div>
                      <div className="text-rose-400 font-extrabold text-sm">₹0 Remaining</div>
                      <p className="text-slate-300 mt-1">
                        Immediate enjoyment was achieved, but capital is gone forever. No financial compounding occurred.
                      </p>
                    </div>
                  )}

                  {m1Choice === 'SAVE' && (
                    <div>
                      <div className="text-amber-400 font-extrabold text-sm">
                        ₹1,000 Cash (Real purchasing power: ~₹{Math.round(1000 / Math.pow(1.06, m1Years))})
                      </div>
                      <p className="text-slate-300 mt-1">
                        Due to ~6% annual inflation in India, grocery and rent costs rise. Idle cash loses purchasing power every year!
                      </p>
                    </div>
                  )}

                  {m1Choice === 'INVEST' && (
                    <div>
                      <div className="text-emerald-400 font-extrabold text-sm font-mono">
                        ~₹{Math.round(1000 * Math.pow(1.12, m1Years)).toLocaleString('en-IN')} (At ~12% compounding)
                      </div>
                      <p className="text-slate-300 mt-1">
                        By investing in quality Indian companies, your capital beats inflation and compounds into wealth over time!
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/20 text-xs text-indigo-200">
                  💡 <strong className="text-indigo-300">Key Takeaway:</strong> {mission.keyTakeaway}
                </div>

                <button
                  id="btn-complete-m1"
                  onClick={handleFinishMission}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-transform active:scale-[0.99]"
                >
                  Complete Mission 1 & Claim +100 XP 🎉
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MISSION 2: WHAT IS A STOCK? (PIZZACO) */}
        {/* ========================================================================= */}
        {mission.id === 'mission-2' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-3">
              <Bot className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-indigo-300 block mb-0.5">Arya's Story:</strong>
                "Imagine a famous restaurant called <span className="text-amber-300 font-bold">PIZZACO</span>. They make delicious pizzas and want to open 2 new outlets in Mumbai. They need ₹1,00,000 to buy ovens, bikes, and cheese."
              </div>
            </div>

            {/* PizzaCo Visual Infographic */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🍕</span>
                  <div>
                    <h3 className="font-extrabold text-white text-sm">PIZZACO INDIA LTD</h3>
                    <p className="text-[11px] text-slate-400">Total Valuation: ₹1,00,000 • 1,000 Shares</p>
                  </div>
                </div>
                <span className="font-mono text-emerald-400 font-bold text-sm">₹100 / Share</span>
              </div>

              {!m2BoughtShare ? (
                <div className="text-center py-4 space-y-3">
                  <p className="text-xs text-slate-300">
                    PIZZACO divides its ownership into <strong>1,000 equal slices (shares)</strong>.
                    Each share costs <strong>₹100</strong>.
                  </p>
                  <button
                    onClick={() => {
                      soundEffects.cashTrade();
                      setM2BoughtShare(true);
                    }}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg animate-bounce"
                  >
                    🍕 Buy 1 Share of PIZZACO for ₹100
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Congratulations! You now own 1 share (0.1% of PIZZACO)</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      You are now a part-owner of their ovens, recipes, brand, and future customer profits!
                    </p>
                  </div>

                  {/* Business Result Story */}
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-2">
                    <div className="text-slate-400 font-bold uppercase text-[10px]">1 Year Later...</div>
                    <p className="text-slate-200">
                      PIZZACO sold <strong>60,000 pizzas</strong> and earned record profits. Because the business grew, other investors now want to buy shares, driving the share price up to <strong className="text-emerald-400 font-mono">₹135</strong>!
                    </p>
                    <div className="flex justify-between items-center pt-2 font-mono text-[11px] border-t border-slate-800">
                      <span className="text-slate-400">Your ₹100 Investment:</span>
                      <span className="text-emerald-400 font-bold">₹135 (+35% Gain) + ₹5 Dividend</span>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/20 text-xs text-indigo-200">
                    💡 <strong className="text-indigo-300">Core Principle:</strong> {mission.keyTakeaway}
                  </div>

                  <button
                    onClick={handleFinishMission}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg"
                  >
                    Complete Mission 2 & Claim +150 XP 🎉
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MISSION 3: WHY DO STOCK PRICES MOVE? */}
        {/* ========================================================================= */}
        {mission.id === 'mission-3' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-3">
              <Bot className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-indigo-300 block mb-0.5">Interactive Demand & Supply Scale:</strong>
                "Slide the buyers and sellers below to see how stock prices react in real time."
              </div>
            </div>

            {/* Sliders Area */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-5">
              {/* Dynamic Price Display */}
              {(() => {
                const simulatedPrice = Math.round(100 + (m3Buyers - m3Sellers) * 0.9);
                const isPriceUp = simulatedPrice >= 100;
                return (
                  <div className="text-center p-4 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Simulated Market Price</span>
                    <span className={`text-3xl font-black font-mono ${isPriceUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ₹{simulatedPrice}
                    </span>
                    <span className="block text-xs text-slate-400 mt-1">
                      {m3Buyers > m3Sellers ? '🚀 High Demand (Buyers competing)' : m3Buyers < m3Sellers ? '🔻 High Supply (Sellers dumping)' : '⚖️ Equilibrium'}
                    </span>
                  </div>
                );
              })()}

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-emerald-400">🟢 Buyers (Demand): {m3Buyers}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={m3Buyers}
                    onChange={e => setM3Buyers(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-rose-400">🔴 Sellers (Supply): {m3Sellers}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={m3Sellers}
                    onChange={e => setM3Sellers(parseInt(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/20 text-xs text-indigo-200">
                💡 <strong className="text-indigo-300">Key Rule:</strong> {mission.keyTakeaway}
              </div>

              <button
                onClick={handleFinishMission}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg"
              >
                Complete Mission 3 & Claim +200 XP 🎉
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MISSION 4: YOUR FIRST VIRTUAL TRADE */}
        {/* ========================================================================= */}
        {mission.id === 'mission-4' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-3">
              <Bot className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-indigo-300 block mb-0.5">Guided Live Trade:</strong>
                "Let's execute your first real simulated trade on Dalal Street. We will buy 1 share of <strong className="text-white">TCS (Tata Consultancy Services)</strong>."
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-5">
              {/* Step 1: Stock Card */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Step 1: Select Stock Card
                </div>
                <div
                  onClick={() => {
                    soundEffects.click();
                    setM4SelectedStock(true);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    m4SelectedStock
                      ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 animate-pulse'
                  }`}
                >
                  <div>
                    <div className="font-extrabold text-white text-sm font-mono">TCS (Tata Consultancy Services)</div>
                    <div className="text-xs text-slate-400">NSE Bluechip • IT Services</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-white text-sm">₹3,500.00</div>
                    <div className="text-xs text-emerald-400">+1.2%</div>
                  </div>
                </div>
              </div>

              {/* Step 2 & 3: Quantity and Order Execution */}
              {m4SelectedStock && !m4Executed && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Step 2: Enter Quantity
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={m4Quantity}
                        onChange={e => setM4Quantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-28 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                      />
                      <span className="text-xs text-slate-400">Share (₹{(m4Quantity * 3500).toLocaleString('en-IN')})</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Step 3: Place Market Order
                    </div>
                    <button
                      onClick={() => {
                        executeTrade({
                          symbol: 'TCS',
                          name: 'Tata Consultancy Services',
                          action: 'BUY',
                          type: 'MARKET',
                          quantity: m4Quantity,
                          price: 3500,
                          rationale: 'First beginner trade mission',
                          emotionalState: 'CALM',
                        });
                        setM4Executed(true);
                      }}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold text-xs shadow-lg animate-pulse"
                    >
                      🚀 BUY {m4Quantity} SHARE(S) OF TCS @ ₹3,500
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Success confirmation */}
              {m4Executed && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>TRADE EXECUTED ON NSE SIMULATOR!</span>
                  </div>
                  <p className="text-slate-300">
                    You have successfully placed a <strong>Market Order</strong>. 1 share of TCS has been credited to your virtual portfolio holdings.
                  </p>
                  <button
                    onClick={handleFinishMission}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 text-white font-bold text-xs shadow-lg"
                  >
                    Complete Mission 4 & Claim +250 XP 🎉
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MISSION 5: YOUR FIRST PORTFOLIO */}
        {/* ========================================================================= */}
        {mission.id === 'mission-5' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-3">
              <Bot className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-indigo-300 block mb-0.5">Your Real Portfolio:</strong>
                "Everything you own in the market—cash plus your shares—combines to form your <strong className="text-white">Portfolio</strong>."
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Virtual Cash</span>
                  <span className="text-emerald-400 font-bold text-sm">₹{profile.virtualCash.toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Stock Holdings</span>
                  <span className="text-indigo-300 font-bold text-sm">{profile.positions.length} Active Asset(s)</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 text-[10px] block">Total Net Worth</span>
                  <span className="text-white font-bold text-sm">₹{(profile.virtualCash + 3500).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/20 text-xs text-indigo-200">
                💡 <strong className="text-indigo-300">Key Concept:</strong> {mission.keyTakeaway}
              </div>

              <button
                onClick={handleFinishMission}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 text-white font-bold text-xs shadow-lg"
              >
                Complete Mission 5 & Claim +150 XP 🎉
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MISSION 6: FIRST LOSS & THE DECISION */}
        {/* ========================================================================= */}
        {mission.id === 'mission-6' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-3">
              <Bot className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-300 block mb-0.5">Market Event:</strong>
                "A sudden global IT sector correction occurred. TCS price drops from <strong className="text-white font-mono">₹3,500 → ₹3,350 (-4.3%)</strong>."
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="text-center p-4 bg-slate-900 rounded-xl border border-slate-800 font-mono">
                <span className="text-xs text-slate-400 block">Your Unrealized Position</span>
                <span className="text-xl font-bold text-rose-400">-₹150.00 (-4.3%)</span>
              </div>

              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Mentor's Question: What is your response?
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.click();
                    setM6Decision('SELL');
                  }}
                  className={`p-3.5 rounded-2xl border text-left text-xs transition-all ${
                    m6Decision === 'SELL'
                      ? 'bg-rose-950 border-rose-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-bold text-rose-400">🔴 SELL (Cut Loss)</div>
                  <p className="text-[11px] text-slate-400 mt-1">If your original thesis was wrong or stop-loss hit.</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEffects.click();
                    setM6Decision('HOLD');
                  }}
                  className={`p-3.5 rounded-2xl border text-left text-xs transition-all ${
                    m6Decision === 'HOLD'
                      ? 'bg-amber-950 border-amber-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-bold text-amber-400">🟡 HOLD (Patient)</div>
                  <p className="text-[11px] text-slate-400 mt-1">If company fundamentals remain strong and long-term.</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEffects.click();
                    setM6Decision('BUY_MORE');
                  }}
                  className={`p-3.5 rounded-2xl border text-left text-xs transition-all ${
                    m6Decision === 'BUY_MORE'
                      ? 'bg-emerald-950 border-emerald-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-bold text-emerald-400">🟢 BUY MORE (Discount)</div>
                  <p className="text-[11px] text-slate-400 mt-1">If you have spare cash and want a better average price.</p>
                </button>
              </div>

              {m6Decision && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2 animate-fadeIn">
                  <strong className="text-indigo-300 block">Socratic Insight:</strong>
                  <p className="text-slate-300 leading-relaxed">
                    None of these choices is automatically "bad". Disciplined investors decide based on <strong>facts and risk tolerance</strong>, never out of emotional panic.
                  </p>
                  <button
                    onClick={handleFinishMission}
                    className="w-full mt-3 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                  >
                    Complete Mission 6 & Claim +200 XP 🎉
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MISSION 7: MARKET VOLATILITY */}
        {/* ========================================================================= */}
        {mission.id === 'mission-7' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-3">
              <Bot className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-indigo-300 block mb-0.5">Volatility Simulator:</strong>
                "Markets never move in a straight line. Watch the price zigzag through volatility."
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="h-36 bg-slate-900 rounded-xl border border-slate-800 p-4 flex items-center justify-between font-mono text-xs text-slate-400 relative overflow-hidden">
                <svg className="w-full h-full">
                  <polyline
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3"
                    points="20,80 80,40 140,90 220,30 300,100 380,20 460,50 540,10 620,35"
                  />
                </svg>
              </div>

              <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/20 text-xs text-indigo-200">
                💡 <strong className="text-indigo-300">Key Rule:</strong> {mission.keyTakeaway}
              </div>

              <button
                onClick={handleFinishMission}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 text-white font-bold text-xs shadow-lg"
              >
                Complete Mission 7 & Unlock Chart Arena 🎉
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MISSION 8: FOLLOW THE TREND (LINE CHART) */}
        {/* ========================================================================= */}
        {mission.id === 'mission-8' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-3">
              <Bot className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-indigo-300 block mb-0.5">Line Chart Reading:</strong>
                "Look at the chart below. Is the overall market trend rising (Uptrend), falling (Downtrend), or going sideways?"
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="h-32 bg-slate-900 rounded-xl border border-slate-800 p-4 relative flex items-end">
                <svg className="w-full h-full">
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    points="10,90 100,70 180,75 260,50 340,55 420,30 500,35 600,10"
                  />
                </svg>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.correct();
                    setM8Answer('UP');
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    m8Answer === 'UP' ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-2' : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  🟢 Uptrend (Higher Highs)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.wrong();
                    setM8Answer('DOWN');
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    m8Answer === 'DOWN' ? 'bg-rose-950 border-rose-500 text-rose-300 ring-2' : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  🔴 Downtrend (Lower Lows)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.wrong();
                    setM8Answer('SIDEWAYS');
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    m8Answer === 'SIDEWAYS' ? 'bg-amber-950 border-amber-500 text-amber-300 ring-2' : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  🟡 Sideways Range
                </button>
              </div>

              {m8Answer === 'UP' && (
                <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-xs text-emerald-200 animate-fadeIn">
                  ✨ <strong>Spot on!</strong> Higher highs and higher lows define a healthy Bullish Uptrend.
                  <button
                    onClick={handleFinishMission}
                    className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 text-white font-bold text-xs"
                  >
                    Complete Mission 8 & Claim +250 XP 🎉
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MISSION 9: MEET THE CANDLESTICK */}
        {/* ========================================================================= */}
        {mission.id === 'mission-9' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-3">
              <Bot className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-indigo-300 block mb-0.5">Candlestick Anatomy:</strong>
                "Every candlestick packages 4 critical prices: Open, High, Low, and Close."
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              {/* Candlestick Diagram */}
              <div className="flex justify-center items-center py-4">
                <div className="relative flex flex-col items-center">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold mb-1">High (Upper Wick)</span>
                  <div className="w-0.5 h-6 bg-emerald-400" />
                  <div className="w-16 h-20 bg-emerald-500 rounded-xs flex items-center justify-center font-mono text-xs font-bold text-slate-950">
                    Real Body
                  </div>
                  <div className="w-0.5 h-6 bg-emerald-400" />
                  <span className="text-[10px] font-mono text-emerald-400 font-bold mt-1">Low (Lower Wick)</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/20 text-xs text-indigo-200">
                💡 <strong className="text-indigo-300">Takeaway:</strong> {mission.keyTakeaway}
              </div>

              <button
                onClick={handleFinishMission}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 text-white font-bold text-xs shadow-lg"
              >
                Complete Mission 9 & Unlock Candlestick Combat Arena 🎉
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MISSION 10: CHART DETECTIVE — SUPPORT & RESISTANCE */}
        {/* ========================================================================= */}
        {mission.id === 'mission-10' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-3">
              <Bot className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-indigo-300 block mb-0.5">Final Apprentice Trial:</strong>
                "Examine this historical chart. The price tested the resistance ceiling 3 times with rising volume. Predict the breakout!"
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="h-36 bg-slate-900 rounded-xl border border-slate-800 p-4 relative flex items-center justify-center font-mono text-xs">
                <span className="text-slate-400">📈 Historical Resistance Test at ₹1,200 Level</span>
              </div>

              {!m10Revealed ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      soundEffects.correct();
                      setM10Hypothesis('BREAKOUT_UP');
                      setM10Revealed(true);
                    }}
                    className="p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                  >
                    🚀 Predict Bullish Breakout Upwards
                  </button>
                  <button
                    onClick={() => {
                      soundEffects.wrong();
                      setM10Hypothesis('BREAKDOWN');
                      setM10Revealed(true);
                    }}
                    className="p-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md"
                  >
                    🔻 Predict Bearish Rejection Downwards
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-xs space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Trophy className="w-5 h-5" />
                    <span>CORRECT! HISTORICAL MASSIVE BREAKOUT (+18%)</span>
                  </div>
                  <p className="text-slate-300">
                    Buyers absorbed all supply at resistance and launched the price to all-time highs!
                  </p>

                  <button
                    onClick={handleFinishMission}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 text-white font-bold text-xs shadow-xl"
                  >
                    Claim 🏆 Chart Explorer & Unlock Full Free Mode 🎉
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Celebration / Mission Completion Screen */}
        {isCompleted && (
          <div className="text-center py-6 space-y-4 border-t border-slate-800 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white">MISSION {mission.number} COMPLETE!</h2>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              You earned <strong className="text-amber-400 font-mono">+{mission.xpReward} XP</strong> and{' '}
              <strong className="text-emerald-400 font-mono">+₹{mission.cashReward.toLocaleString('en-IN')} Virtual Capital</strong>.
            </p>

            <button
              onClick={handleNextMissionOrLobby}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-600 text-white font-bold text-xs shadow-xl transition-transform active:scale-95"
            >
              Continue to Next Destination →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
