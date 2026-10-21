import React, { useState, useMemo } from 'react';
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
  Award,
  Sliders,
  DollarSign,
  PieChart,
  Search,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../context/GameContext';
import { ALL_WORLD_LEVELS, WorldLevel } from '../../data/gameWorldsData';
import { soundEffects } from '../../utils/audio';

export const MissionRunner: React.FC = () => {
  const {
    activeMissionId,
    setActiveMissionId,
    completeMission,
    executeTrade,
    profile,
  } = useGame();

  const mission: WorldLevel =
    ALL_WORLD_LEVELS.find((m) => m.id === activeMissionId) || ALL_WORLD_LEVELS[0];

  const isAlreadyCompleted = (profile.completedMissions || []).includes(mission.id);

  // General flow state
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // =========================================================================
  // MISSION 1: CAPITAL ALLOCATION (Spending vs Saving vs Equity Index)
  // =========================================================================
  const [m1Spend, setM1Spend] = useState<number>(200);
  const [m1Save, setM1Save] = useState<number>(200);
  const [m1Invest, setM1Invest] = useState<number>(600);
  const [m1Simulated, setM1Simulated] = useState<boolean>(false);

  // Normalize to 1000
  const handleM1Adjust = (type: 'spend' | 'save' | 'invest', val: number) => {
    setM1Simulated(false);
    setErrorMessage(null);
    if (type === 'invest') {
      const remaining = 1000 - val;
      setM1Invest(val);
      setM1Spend(Math.round(remaining / 2));
      setM1Save(remaining - Math.round(remaining / 2));
    } else if (type === 'save') {
      const remaining = 1000 - val;
      setM1Save(val);
      setM1Invest(Math.max(0, remaining - m1Spend));
    } else {
      const remaining = 1000 - val;
      setM1Spend(val);
      setM1Invest(Math.max(0, remaining - m1Save));
    }
  };

  const m1FutureEquity = Math.round(m1Invest * Math.pow(1.12, 5));
  const m1FutureSavePurchasingPower = Math.round(m1Save / Math.pow(1.06, 5));
  const m1NetTotal = m1FutureEquity + m1FutureSavePurchasingPower;
  const m1Passed = m1Invest >= 500 && m1NetTotal > 1000;

  // =========================================================================
  // MISSION 2: EQUITY OWNERSHIP (PIZZACO)
  // =========================================================================
  const [m2SharesBought, setM2SharesBought] = useState<number>(0);
  const [m2VoteChoice, setM2VoteChoice] = useState<'REINVEST' | 'DIVIDEND' | null>(null);

  // =========================================================================
  // MISSION 3: SUPPLY & DEMAND ORDER BOOK
  // =========================================================================
  const [m3Buyers, setM3Buyers] = useState<number>(50);
  const [m3Sellers, setM3Sellers] = useState<number>(50);
  const [m3Executed, setM3Executed] = useState<boolean>(false);
  const m3ClearingPrice = Math.round(100 + (m3Buyers - m3Sellers) * 0.8);

  // =========================================================================
  // MISSION 4: FIRST VIRTUAL TRADE (TCS ORDER FLOOR)
  // =========================================================================
  const [m4OrderType, setM4OrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [m4Qty, setM4Qty] = useState<number>(1);
  const [m4ExecutedTicket, setM4ExecutedTicket] = useState<{
    id: string;
    symbol: string;
    qty: number;
    price: number;
    total: number;
  } | null>(null);

  // =========================================================================
  // MISSION 5: CANDLESTICK FORGE (HAMMER CONSTRUCTION)
  // =========================================================================
  const [m5Open, setM5Open] = useState<number>(100);
  const [m5High, setM5High] = useState<number>(110);
  const [m5Low, setM5Low] = useState<number>(75);
  const [m5Close, setM5Close] = useState<number>(105);

  const m5BodyHeight = Math.abs(m5Close - m5Open);
  const m5LowerWick = Math.min(m5Open, m5Close) - m5Low;
  const m5UpperWick = m5High - Math.max(m5Open, m5Close);
  const m5IsHammer =
    m5LowerWick >= m5BodyHeight * 1.8 &&
    m5UpperWick <= m5BodyHeight * 0.6 &&
    m5Close >= m5Open;

  // =========================================================================
  // MISSION 6: TREND NAVIGATOR (PRICE PREDICTION)
  // =========================================================================
  const [m6SelectedTrend, setM6SelectedTrend] = useState<'UPTREND' | 'DOWNTREND' | 'SIDEWAYS' | null>(null);
  const [m6Prediction, setM6Prediction] = useState<'BREAKOUT_UP' | 'BREAKDOWN' | null>(null);
  const [m6Revealed, setM6Revealed] = useState<boolean>(false);

  // =========================================================================
  // MISSION 7: SUPPORT & RESISTANCE CITADEL
  // =========================================================================
  const [m7OrderPlacement, setM7OrderPlacement] = useState<'SUPPORT_BOUNCE' | 'CHASE_HIGH' | 'SHORT_SUPPORT' | null>(null);
  const [m7Tested, setM7Tested] = useState<boolean>(false);

  // =========================================================================
  // MISSION 8: RED SEA STORM (CRASH & STOP-LOSS)
  // =========================================================================
  const [m8Action, setM8Action] = useState<'PANIC_SELL' | 'DO_NOTHING' | 'DISCIPLINED_STOP' | null>(null);

  // =========================================================================
  // MISSION 9: MASTER PORTFOLIO ALLOCATION
  // =========================================================================
  const [m9Equity, setM9Equity] = useState<number>(40);
  const [m9Defensive, setM9Defensive] = useState<number>(30);
  const [m9Gold, setM9Gold] = useState<number>(20);
  const [m9Cash, setM9Cash] = useState<number>(10);
  const [m9StressTested, setM9StressTested] = useState<boolean>(false);

  const m9TotalAlloc = m9Equity + m9Defensive + m9Gold + m9Cash;
  const m9SimulatedDrawdown = Math.round(
    (m9Equity * 0.35 + m9Defensive * 0.08 + m9Gold * -0.05 + m9Cash * 0) / 100 * 100
  );

  // =========================================================================
  // MISSION 10: COMPANY FORENSICS
  // =========================================================================
  const [m10InspectedClues, setM10InspectedClues] = useState<string[]>([]);
  const [m10SelectedWinner, setM10SelectedWinner] = useState<'ALPHA' | 'BETA' | 'GAMMA' | null>(null);

  const toggleM10Clue = (clueId: string) => {
    soundEffects.click();
    if (!m10InspectedClues.includes(clueId)) {
      setM10InspectedClues([...m10InspectedClues, clueId]);
    }
  };

  // =========================================================================
  // VALIDATION & COMPLETION
  // =========================================================================
  const handleCompleteMission = () => {
    // Validate completion criteria per mission
    if (mission.id === 'mission-1' && !m1Passed) {
      soundEffects.wrong();
      setErrorMessage('Your investment did not beat inflation! Allocate at least ₹500 to productive equity to compound wealth.');
      return;
    }

    if (mission.id === 'mission-2' && (m2SharesBought === 0 || !m2VoteChoice)) {
      soundEffects.wrong();
      setErrorMessage('Please buy at least 1 share and cast your shareholder vote.');
      return;
    }

    if (mission.id === 'mission-3' && !m3Executed) {
      soundEffects.wrong();
      setErrorMessage('Please find the market equilibrium price and execute your order.');
      return;
    }

    if (mission.id === 'mission-4' && !m4ExecutedTicket) {
      soundEffects.wrong();
      setErrorMessage('Please execute your market order for TCS.');
      return;
    }

    if (mission.id === 'mission-5' && !m5IsHammer) {
      soundEffects.wrong();
      setErrorMessage('Candle does not match a Bullish Hammer! A hammer requires a long lower wick (at least 2x body) and close near the high.');
      return;
    }

    if (mission.id === 'mission-6' && (!m6Revealed || m6SelectedTrend !== 'UPTREND')) {
      soundEffects.wrong();
      setErrorMessage('Examine the consecutive Higher Highs and reveal the prediction outcome.');
      return;
    }

    if (mission.id === 'mission-7' && m7OrderPlacement !== 'SUPPORT_BOUNCE') {
      soundEffects.wrong();
      setErrorMessage('Incorrect entry! Buying near confirmed support with a tight stop loss provides the best risk-to-reward ratio.');
      return;
    }

    if (mission.id === 'mission-8' && m8Action !== 'DISCIPLINED_STOP') {
      soundEffects.wrong();
      setErrorMessage('Disciplined stop-loss execution preserves capital and prevents catastrophic account loss.');
      return;
    }

    if (mission.id === 'mission-9' && (m9TotalAlloc !== 100 || m9SimulatedDrawdown > 20)) {
      soundEffects.wrong();
      setErrorMessage('Your portfolio must sum to 100% and keep simulated stress drawdown under 20% through diversification.');
      return;
    }

    if (mission.id === 'mission-10' && m10SelectedWinner !== 'GAMMA') {
      soundEffects.wrong();
      setErrorMessage('Company Gamma is the true compounder with 22% ROE, zero net debt, and positive free cash flows!');
      return;
    }

    // Pass: Complete mission
    soundEffects.levelUp();
    try {
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.5 },
      });
    } catch {}

    setIsCompleted(true);
    completeMission(mission.id);
  };

  const handleNextMission = () => {
    const currentIndex = ALL_WORLD_LEVELS.findIndex((m) => m.id === mission.id);
    const next = ALL_WORLD_LEVELS[currentIndex + 1];
    if (next) {
      setActiveMissionId(next.id);
      setIsCompleted(false);
      setErrorMessage(null);
    } else {
      setActiveMissionId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fadeIn">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveMissionId(null)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to World Map</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">
            Level {mission.number} of {ALL_WORLD_LEVELS.length}
          </span>
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
            +{mission.xpReward} XP
          </span>
        </div>
      </div>

      {/* Main Mission Card */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Mission Title Strip */}
        <div className="flex items-start gap-4 border-b border-slate-800 pb-5">
          <div className="text-4xl p-3 bg-slate-950 rounded-2xl border border-slate-800 shrink-0">
            {mission.icon}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 font-mono">
                {mission.stageName || (mission.worldId === 'world-1' ? 'Genesis Archipelago' : mission.worldId === 'world-2' ? 'Candlestick Coast' : 'Fortitude Fortress')}
              </span>
              <span className="text-xs text-slate-400">⏱️ ~{mission.estimatedMinutes} mins</span>
              {isAlreadyCompleted && (
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed (Replay Mode)</span>
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {mission.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {mission.subtitle}
            </p>
          </div>
        </div>

        {/* Narrative Scenario / Story Goal */}
        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-3">
          <Bot className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-indigo-300 block">Mission Briefing:</strong>
            <p className="text-slate-200 leading-relaxed">{mission.storyGoal}</p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MISSION 1: CAPITAL ALLOCATION & INFLATION SIMULATOR                        */}
        {/* ========================================================================= */}
        {mission.id === 'mission-1' && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-bold text-white">Distribute your ₹1,000 Capital:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  Total: ₹{m1Spend + m1Save + m1Invest} / ₹1,000
                </span>
              </div>

              {/* Sliders */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-rose-400">🛍️ Immediate Spending: ₹{m1Spend}</span>
                    <span className="text-slate-500">{Math.round((m1Spend / 1000) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="50"
                    value={m1Spend}
                    onChange={(e) => handleM1Adjust('spend', parseInt(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-amber-400">🏦 Cash in Locker (0% interest): ₹{m1Save}</span>
                    <span className="text-slate-500">{Math.round((m1Save / 1000) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="50"
                    value={m1Save}
                    onChange={(e) => handleM1Adjust('save', parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-emerald-400">📈 Productive Equity Index (12% CAGR): ₹{m1Invest}</span>
                    <span className="text-slate-500">{Math.round((m1Invest / 1000) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="50"
                    value={m1Invest}
                    onChange={(e) => handleM1Adjust('invest', parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  soundEffects.click();
                  setM1Simulated(true);
                }}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Activity className="w-4 h-4" />
                <span>Simulate 5 Years of Inflation (6%) & Compounding (12%)</span>
              </button>

              {m1Simulated && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 animate-fadeIn text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-950 rounded-lg">
                      <span className="text-slate-400 text-[10px] uppercase block">Spent Capital</span>
                      <span className="text-rose-400 font-bold font-mono text-sm">₹0 Remaining</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Consumed immediately.</p>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-lg">
                      <span className="text-slate-400 text-[10px] uppercase block">Locker Cash (6% Inflation)</span>
                      <span className="text-amber-400 font-bold font-mono text-sm">₹{m1FutureSavePurchasingPower} Real Value</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Lost purchasing power.</p>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-lg">
                      <span className="text-slate-400 text-[10px] uppercase block">Equity Index (12% CAGR)</span>
                      <span className="text-emerald-400 font-bold font-mono text-sm">₹{m1FutureEquity} Compounded</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Beat inflation easily.</p>
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    m1Passed
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}>
                    <span>
                      {m1Passed
                        ? `Target met! Total future net purchasing power: ₹${m1NetTotal} (Beating ₹1,000 hurdle).`
                        : `Target failed. Future purchasing power is only ₹${m1NetTotal}. Allocate at least ₹500 to Equity!`}
                    </span>
                    {m1Passed && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MISSION 2: WHAT IS A STOCK (PIZZACO)                                      */}
        {/* ========================================================================= */}
        {mission.id === 'mission-2' && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🍕</span>
                  <div>
                    <h3 className="font-black text-white text-base">PIZZACO INDIA LTD</h3>
                    <p className="text-xs text-slate-400">Total Company Value: ₹1,00,000 · 1,000 Total Shares</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Share Price</span>
                  <span className="text-base font-mono font-bold text-emerald-400">₹100 / Share</span>
                </div>
              </div>

              {/* Step 1: Buy Shares */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Step 1: Choose shares to purchase with virtual cash
                </span>
                <div className="flex items-center gap-3">
                  {[1, 2, 5, 10].map((qty) => (
                    <button
                      key={qty}
                      onClick={() => {
                        soundEffects.cashTrade();
                        setM2SharesBought(qty);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        m2SharesBought === qty
                          ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                          : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      Buy {qty} {qty === 1 ? 'Share' : 'Shares'} (₹{qty * 100})
                    </button>
                  ))}
                </div>

                {m2SharesBought > 0 && (
                  <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/30 text-xs text-emerald-300 animate-fadeIn">
                    ✓ You own {m2SharesBought} shares ({((m2SharesBought / 1000) * 100).toFixed(1)}% of PizzaCo’s ovens, recipes, and cash flows)!
                  </div>
                )}
              </div>

              {/* Step 2: Shareholder Vote */}
              {m2SharesBought > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-800 animate-fadeIn">
                  <span className="text-xs font-bold text-slate-300 block">
                    Step 2: Shareholder Annual General Meeting (Vote on Profit Allocation)
                  </span>
                  <p className="text-xs text-slate-400">
                    PizzaCo earned ₹40,000 net profit. How should the board allocate earnings?
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        soundEffects.click();
                        setM2VoteChoice('REINVEST');
                      }}
                      className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                        m2VoteChoice === 'REINVEST'
                          ? 'bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/40 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs text-white">Reinvest in Growth (2 New Ovens)</div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Opens 2 new outlets. Share price expands from ₹100 to ₹138 (+38% capital gain).
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        soundEffects.click();
                        setM2VoteChoice('DIVIDEND');
                      }}
                      className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                        m2VoteChoice === 'DIVIDEND'
                          ? 'bg-amber-950/80 border-amber-500 ring-2 ring-amber-500/40 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs text-white">Payout Instant Cash Dividend</div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Pay ₹40/share direct cash dividend to owners; zero expansion this year.
                      </div>
                    </button>
                  </div>

                  {m2VoteChoice && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 animate-fadeIn">
                      {m2VoteChoice === 'REINVEST'
                        ? `🚀 Expansion successful! Your ${m2SharesBought} shares are now worth ₹${m2SharesBought * 138} (+38% capital gain).`
                        : `💰 Dividend received! You received ₹${m2SharesBought * 40} in direct cash payments.`}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MISSION 3: SUPPLY & DEMAND DYNAMICS                                       */}
        {/* ========================================================================= */}
        {mission.id === 'mission-3' && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Simulated Market Clearing Price
                </span>
                <span className={`text-3xl font-black font-mono ${
                  m3ClearingPrice > 100 ? 'text-emerald-400' : m3ClearingPrice < 100 ? 'text-rose-400' : 'text-slate-200'
                }`}>
                  ₹{m3ClearingPrice}
                </span>
                <span className="block text-xs text-slate-400 mt-1">
                  {m3Buyers > m3Sellers
                    ? `🟢 High Buyer Demand (+${m3Buyers - m3Sellers} Net Buyers driving price up)`
                    : m3Buyers < m3Sellers
                    ? `🔴 High Seller Supply (+${m3Sellers - m3Buyers} Net Sellers dumping inventory)`
                    : '⚖️ Neutral Equilibrium'}
                </span>
              </div>

              {/* Sliders */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-emerald-400">🟢 Buyers (Demand Pressure): {m3Buyers}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={m3Buyers}
                    onChange={(e) => {
                      setM3Buyers(parseInt(e.target.value));
                      setM3Executed(false);
                    }}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-rose-400">🔴 Sellers (Supply Pressure): {m3Sellers}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={m3Sellers}
                    onChange={(e) => {
                      setM3Sellers(parseInt(e.target.value));
                      setM3Executed(false);
                    }}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  soundEffects.cashTrade();
                  setM3Executed(true);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md"
              >
                Execute Trade at Current Clearing Price (₹{m3ClearingPrice})
              </button>

              {m3Executed && (
                <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/40 text-xs text-emerald-300 animate-fadeIn">
                  ✓ Order matched! Filled at ₹{m3ClearingPrice}. When buyer demand outstripped seller supply, sellers raised asking prices to clear the queue.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MISSION 4: FIRST VIRTUAL TRADE (TCS ORDER FLOOR)                         */}
        {/* ========================================================================= */}
        {mission.id === 'mission-4' && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="text-xs text-slate-400">NSE Blue-Chip Stock</div>
                  <div className="text-lg font-black text-white">TCS (Tata Consultancy Services)</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Current Market Price</div>
                  <div className="text-lg font-mono font-bold text-emerald-400">₹3,450.00</div>
                </div>
              </div>

              {/* Order Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Order Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setM4OrderType('MARKET')}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all ${
                        m4OrderType === 'MARKET'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      Market Order
                    </button>
                    <button
                      onClick={() => setM4OrderType('LIMIT')}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all ${
                        m4OrderType === 'LIMIT'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      Limit Order
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Quantity (Shares)</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].map((q) => (
                      <button
                        key={q}
                        onClick={() => setM4Qty(q)}
                        className={`py-2 px-4 rounded-xl font-mono font-bold transition-all ${
                          m4Qty === q
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Investment Value:</span>
                <span className="font-mono font-bold text-white text-sm">
                  ₹{(m4Qty * 3450).toLocaleString('en-IN')}
                </span>
              </div>

              <button
                onClick={() => {
                  executeTrade({
                    symbol: 'TCS',
                    name: 'Tata Consultancy Services',
                    action: 'BUY',
                    type: m4OrderType,
                    quantity: m4Qty,
                    price: 3450,
                    rationale: 'First beginner virtual trade mission',
                  });
                  setM4ExecutedTicket({
                    id: `ORD-NSE-${Date.now()}`,
                    symbol: 'TCS',
                    qty: m4Qty,
                    price: 3450,
                    total: m4Qty * 3450,
                  });
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-xs transition-transform active:scale-95 cursor-pointer shadow-lg"
              >
                Send Buy Order to NSE Matching Engine 🚀
              </button>

              {m4ExecutedTicket && (
                <div className="p-4 bg-emerald-950/40 rounded-2xl border border-emerald-500/40 text-xs space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Order Filled Successfully!</span>
                  </div>
                  <div className="text-slate-300 font-mono text-[11px] grid grid-cols-2 gap-2 pt-1 border-t border-emerald-500/20">
                    <div>Order ID: {m4ExecutedTicket.id}</div>
                    <div>Exchange: NSE Equity</div>
                    <div>Filled: {m4ExecutedTicket.qty} TCS @ ₹3,450</div>
                    <div>Total Cost: ₹{m4ExecutedTicket.total.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MISSION 5: CANDLESTICK FORGE                                              */}
        {/* ========================================================================= */}
        {mission.id === 'mission-5' && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Interactive Candlestick SVG Display */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-900 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Live Candlestick Render
                </span>

                <svg width="140" height="220" className="overflow-visible">
                  {/* High to Low Wick Line */}
                  <line
                    x1="70"
                    y1={200 - (m5High - 60) * 2}
                    x2="70"
                    y2={200 - (m5Low - 60) * 2}
                    stroke={m5Close >= m5Open ? '#10B981' : '#F43F5E'}
                    strokeWidth="3"
                  />

                  {/* Body Box */}
                  <rect
                    x="45"
                    y={200 - (Math.max(m5Open, m5Close) - 60) * 2}
                    width="50"
                    height={Math.max(4, m5BodyHeight * 2)}
                    fill={m5Close >= m5Open ? '#10B981' : '#F43F5E'}
                    stroke={m5Close >= m5Open ? '#34D399' : '#FB7185'}
                    strokeWidth="2"
                    rx="2"
                  />
                </svg>

                <div className="text-center mt-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    m5IsHammer
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {m5IsHammer ? '🔨 BULLISH HAMMER DETECTED' : 'Adjust sliders to forge a Hammer'}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-bold mb-1 text-slate-300">
                    <span>Open Price: ₹{m5Open}</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="120"
                    value={m5Open}
                    onChange={(e) => setM5Open(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1 text-emerald-400">
                    <span>High Price: ₹{m5High}</span>
                  </div>
                  <input
                    type="range"
                    min={Math.max(m5Open, m5Close)}
                    max="140"
                    value={m5High}
                    onChange={(e) => setM5High(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1 text-rose-400">
                    <span>Low Price: ₹{m5Low}</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max={Math.min(m5Open, m5Close)}
                    value={m5Low}
                    onChange={(e) => setM5Low(parseInt(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1 text-slate-300">
                    <span>Close Price: ₹{m5Close}</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="120"
                    value={m5Close}
                    onChange={(e) => setM5Close(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-slate-900 rounded-xl text-[11px] text-slate-400">
                  Tip: A Bullish Hammer has a small body near the high and a long lower wick at least twice the height of the body!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MISSION 6: TREND NAVIGATOR (PRICE PREDICTION)                             */}
        {/* ========================================================================= */}
        {mission.id === 'mission-6' && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
              {/* Mini Trendline Chart */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                  Historical Price Trend (15 Periods)
                </span>

                <svg viewBox="0 0 400 120" className="w-full h-32 overflow-visible">
                  <polyline
                    fill="none"
                    stroke="#0EA5E9"
                    strokeWidth="3"
                    points="20,100 45,85 70,92 95,70 120,78 145,55 170,62 195,45 220,50 245,35 270,42 295,25 320,32 345,18 370,12"
                  />
                  {/* Mystery Next Dot */}
                  <circle cx="390" cy="8" r="6" fill="#F59E0B" className="animate-pulse" />
                </svg>

                <div className="text-xs text-slate-400 mt-2">
                  Notice: Every successive peak is Higher than the previous peak, and every pullback trough is Higher than the previous trough!
                </div>
              </div>

              {/* Step 1: Diagnose Trend */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Step 1: Identify the Market Trend Structure
                </span>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  {(['UPTREND', 'DOWNTREND', 'SIDEWAYS'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        soundEffects.click();
                        setM6SelectedTrend(t);
                      }}
                      className={`p-3 rounded-xl font-bold border transition-all cursor-pointer ${
                        m6SelectedTrend === t
                          ? 'bg-indigo-600 border-indigo-400 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Predict Outcome */}
              {m6SelectedTrend && (
                <div className="space-y-3 pt-3 border-t border-slate-800 animate-fadeIn">
                  <span className="text-xs font-bold text-slate-300 block">
                    Step 2: Predict the Next Candle Direction
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <button
                      onClick={() => {
                        soundEffects.click();
                        setM6Prediction('BREAKOUT_UP');
                        setM6Revealed(true);
                      }}
                      className="p-3.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Bullish Breakout Upwards (Higher High)</span>
                    </button>

                    <button
                      onClick={() => {
                        soundEffects.wrong();
                        setM6Prediction('BREAKDOWN');
                        setM6Revealed(true);
                      }}
                      className="p-3.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-300 font-bold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <TrendingDown className="w-4 h-4" />
                      <span>Bearish Breakdown</span>
                    </button>
                  </div>

                  {m6Revealed && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1 animate-fadeIn">
                      <div className="font-bold text-emerald-400">
                        {m6SelectedTrend === 'UPTREND' && m6Prediction === 'BREAKOUT_UP'
                          ? '✓ Correct Analysis!'
                          : 'Re-evaluating trend:'}
                      </div>
                      <p>
                        The price formed consecutive Higher Highs (HH) and Higher Lows (HL). Following the prevailing trend gives statistical edge!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MISSION 7: SUPPORT & RESISTANCE CITADEL                                   */}
        {/* ========================================================================= */}
        {mission.id === 'mission-7' && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  HDFC Bank Tested Support at ₹2,400 Floor
                </span>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Price has touched ₹2,400 three times in two weeks, each time bouncing aggressively. Price is touching ₹2,402 right now.
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 block">
                  Select your trade execution plan:
                </span>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      soundEffects.click();
                      setM7OrderPlacement('SUPPORT_BOUNCE');
                      setM7Tested(true);
                    }}
                    className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      m7OrderPlacement === 'SUPPORT_BOUNCE'
                        ? 'bg-emerald-950/80 border-emerald-500 text-white ring-2 ring-emerald-500/40'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs text-emerald-400">
                      Option A: Buy at ₹2,405 with Stop-Loss at ₹2,390 (Target: ₹2,450)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Risk: ₹15/share · Reward: ₹45/share (1:3 Risk-to-Reward ratio near confirmed support).
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      soundEffects.wrong();
                      setM7OrderPlacement('CHASE_HIGH');
                      setM7Tested(true);
                    }}
                    className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      m7OrderPlacement === 'CHASE_HIGH'
                        ? 'bg-rose-950/80 border-rose-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs text-rose-400">
                      Option B: Wait until ₹2,450 ceiling and Buy without Stop-Loss
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Buying into overhead resistance ceiling with unlimited downside risk.
                    </div>
                  </button>
                </div>

                {m7Tested && m7OrderPlacement === 'SUPPORT_BOUNCE' && (
                  <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/40 text-xs text-emerald-300 animate-fadeIn">
                    ✓ Perfect execution! Support held, buyers stepped in, and price rallied to ₹2,448. Tight stop-loss protected downside.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MISSION 8: RED SEA STORM (CRASH & STOP LOSS)                              */}
        {/* ========================================================================= */}
        {mission.id === 'mission-8' && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="p-4 bg-rose-950/40 rounded-2xl border border-rose-500/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-400 block">Flash Crash Alert</span>
                  <span className="text-lg font-black text-white">NSE Nifty Index Drops -12%</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-rose-400 font-mono font-bold">-₹1,200 Unrealized Loss</span>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 block">
                  How do you respond to the market panic?
                </span>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      soundEffects.click();
                      setM8Action('DISCIPLINED_STOP');
                    }}
                    className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      m8Action === 'DISCIPLINED_STOP'
                        ? 'bg-emerald-950/80 border-emerald-500 text-white ring-2 ring-emerald-500/40'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs text-emerald-400">
                      Execute Pre-Planned Stop-Loss at -5%
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Cut the loss mechanically, preserve 95% of capital, and avoid emotional paralysis.
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      soundEffects.wrong();
                      setM8Action('PANIC_SELL');
                    }}
                    className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      m8Action === 'PANIC_SELL'
                        ? 'bg-rose-950/80 border-rose-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs text-rose-400">
                      Panic Sell Everything at the absolute bottom
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Lock in maximum emotional losses during peak panic.
                    </div>
                  </button>
                </div>

                {m8Action === 'DISCIPLINED_STOP' && (
                  <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/40 text-xs text-emerald-300 animate-fadeIn">
                    ✓ Disciplined risk management achieved! Small planned losses keep you alive in the market to compound another day.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MISSION 9: MASTER PORTFOLIO ALLOCATION                                    */}
        {/* ========================================================================= */}
        {mission.id === 'mission-9' && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-bold text-white">Allocate ₹1,00,000 Portfolio:</span>
                <span className={`font-mono font-bold ${m9TotalAlloc === 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  Sum: {m9TotalAlloc}% / 100%
                </span>
              </div>

              {/* Sliders */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1 text-indigo-400">
                    <span>Large-Cap Growth Equities: {m9Equity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={m9Equity}
                    onChange={(e) => {
                      setM9Equity(parseInt(e.target.value));
                      setM9StressTested(false);
                    }}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1 text-teal-400">
                    <span>Defensive FMCG (HUL, ITC): {m9Defensive}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={m9Defensive}
                    onChange={(e) => {
                      setM9Defensive(parseInt(e.target.value));
                      setM9StressTested(false);
                    }}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1 text-amber-400">
                    <span>Gold ETF (Safe Haven): {m9Gold}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={m9Gold}
                    onChange={(e) => {
                      setM9Gold(parseInt(e.target.value));
                      setM9StressTested(false);
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1 text-slate-300">
                    <span>Liquid Cash: {m9Cash}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={m9Cash}
                    onChange={(e) => {
                      setM9Cash(parseInt(e.target.value));
                      setM9StressTested(false);
                    }}
                    className="w-full accent-slate-400 cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  soundEffects.click();
                  setM9StressTested(true);
                }}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md"
              >
                Run Macroeconomic Stress Test (2008 & 2020 Shocks)
              </button>

              {m9StressTested && (
                <div className={`p-4 rounded-xl border text-xs space-y-1 animate-fadeIn ${
                  m9SimulatedDrawdown <= 20
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}>
                  <div className="font-bold">
                    Stress Test Drawdown: -{m9SimulatedDrawdown}%
                  </div>
                  <p>
                    {m9SimulatedDrawdown <= 20
                      ? '✓ Excellent diversification! Gold and Defensive FMCG cushioned the drawdown under 20%.'
                      : 'Portfolio was too concentrated in high-beta growth stocks and suffered excessive drawdown!'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MISSION 10: DALAL STREET DETECTIVE (COMPANY FORENSICS)                   */}
        {/* ========================================================================= */}
        {mission.id === 'mission-10' && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
              <span className="text-xs font-bold text-slate-300 block">
                Inspect the 3 Company Clue Dossiers to find the real compounder:
              </span>

              {/* Clues */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Company Alpha */}
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-white">Company Alpha</div>
                  <div className="text-[11px] text-slate-400">P/E Ratio: 95x · Debt-to-Equity: 0.1 · ROE: 8%</div>
                  <p className="text-[11px] text-amber-400">Analysis: Speculative hype, extreme valuation.</p>
                </div>

                {/* Company Beta */}
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-white">Company Beta</div>
                  <div className="text-[11px] text-slate-400">P/E Ratio: 6x · Debt-to-Equity: 3.4 · ROE: 4%</div>
                  <p className="text-[11px] text-rose-400">Analysis: Classic Value Trap loaded with dangerous debt.</p>
                </div>

                {/* Company Gamma */}
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-white">Company Gamma</div>
                  <div className="text-[11px] text-slate-400">P/E Ratio: 22x · Debt-to-Equity: 0.0 · ROE: 24%</div>
                  <p className="text-[11px] text-emerald-400">Analysis: High ROE compounder with zero debt!</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Select the high-quality compounder to back:
                </span>
                <div className="flex gap-3">
                  {(['ALPHA', 'BETA', 'GAMMA'] as const).map((comp) => (
                    <button
                      key={comp}
                      onClick={() => {
                        soundEffects.click();
                        setM10SelectedWinner(comp);
                      }}
                      className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        m10SelectedWinner === comp
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      Company {comp}
                    </button>
                  ))}
                </div>
              </div>

              {m10SelectedWinner === 'GAMMA' && (
                <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/40 text-xs text-emerald-300 animate-fadeIn">
                  ✓ Winner identified! Company Gamma generates 24% ROE without any debt leverage. True compounder!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Callout if requirements not met */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Key Takeaway */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300">
          💡 <strong className="text-indigo-300">Core Market Principle:</strong> {mission.keyTakeaway}
        </div>

        {/* Action Button */}
        <button
          onClick={handleCompleteMission}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-emerald-500/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
        >
          <Award className="w-4 h-4" />
          <span>
            {isAlreadyCompleted ? 'Submit Replay & Verify Challenge' : `Complete Mission ${mission.number} & Claim +${mission.xpReward} XP`}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VICTORY CELEBRATION MODAL                                                 */}
      {/* ========================================================================= */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 text-center shadow-2xl relative">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-4xl shadow-lg shadow-emerald-500/20 animate-bounce">
              {mission.icon}
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Mission Complete!
              </span>
              <h2 className="text-2xl font-black text-white">
                {mission.title}
              </h2>
              <p className="text-xs text-slate-300">
                You’ve mastered this practical market challenge!
              </p>
            </div>

            {/* Rewards */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">XP Earned</span>
                <span className="text-lg font-mono font-black text-amber-400">
                  +{mission.xpReward} XP
                </span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Badge Unlocked</span>
                <span className="text-xs font-bold text-emerald-400 truncate block mt-1">
                  {mission.unlocksBadge}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleNextMission}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-xs shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>PROCEED TO NEXT LEVEL</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveMissionId(null)}
                className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
              >
                Return to World Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
