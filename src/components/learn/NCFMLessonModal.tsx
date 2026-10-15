import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Sliders,
  Calculator,
  Shield,
  Layers,
  Award,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { NCFMLesson, QuizQuestion } from '../../data/ncfmCourseData';
import { useGame } from '../../context/GameContext';
import { soundEffects } from '../../utils/audio';

interface NCFMLessonModalProps {
  lesson: NCFMLesson;
  isCompleted: boolean;
  onClose: () => void;
  onComplete: (lessonId: string, earnedXp: number) => void;
}

export const NCFMLessonModal: React.FC<NCFMLessonModalProps> = ({
  lesson,
  isCompleted: initialCompleted,
  onClose,
  onComplete,
}) => {
  const { addXP, addVirtualCash } = useGame();
  const [activeTab, setActiveTab] = useState<'THEORY' | 'ACTIVITY' | 'TEST'>('THEORY');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [lessonFinished, setLessonFinished] = useState(initialCompleted);

  // Interactive activity states
  // 1. Top Down
  const [selectedIndex, setSelectedIndex] = useState<'BULL' | 'BEAR'>('BULL');
  const [selectedSector, setSelectedSector] = useState('BANKING');
  // 2. Candlestick
  const [candleOpen, setCandleOpen] = useState(100);
  const [candleClose, setCandleClose] = useState(120);
  const [candleHigh, setCandleHigh] = useState(130);
  const [candleLow, setCandleLow] = useState(90);
  // 3. Head & Shoulders Calc
  const [hsHead, setHsHead] = useState(1000);
  const [hsNeckline, setHsNeckline] = useState(850);
  // 4. MA Calc
  const [maPeriod, setMaPeriod] = useState(10);
  // 5. RSI Zone
  const [rsiMarketType, setRsiMarketType] = useState<'BULL' | 'BEAR'>('BULL');
  const [currentRsi, setCurrentRsi] = useState(42);
  // 6. Risk Reward
  const [entryPrice, setEntryPrice] = useState(500);
  const [stopLoss, setStopLoss] = useState(480);
  const [targetPrice, setTargetPrice] = useState(540);
  const [accountCapital, setAccountCapital] = useState(100000);
  const [riskPercent, setRiskPercent] = useState(2);

  const handleSelectAnswer = (qId: string, optIndex: number) => {
    if (testSubmitted) return;
    soundEffects.click();
    setSelectedAnswers(prev => ({ ...prev, [qId]: optIndex }));
  };

  const handleSubmitTest = () => {
    let correctCount = 0;
    lesson.modelQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        correctCount += 1;
      }
    });

    const pass = correctCount >= Math.ceil(lesson.modelQuestions.length * 0.6);
    setScore(correctCount);
    setTestSubmitted(true);

    if (pass) {
      soundEffects.levelUp();
      setLessonFinished(true);
      if (!initialCompleted) {
        addXP(lesson.xpReward, `Completed NCFM: ${lesson.title}`);
        addVirtualCash(2500);
        onComplete(lesson.id, lesson.xpReward);
      }
      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } catch {}
    } else {
      soundEffects.wrong();
    }
  };

  const handleResetTest = () => {
    soundEffects.click();
    setSelectedAnswers({});
    setTestSubmitted(false);
  };

  // Calculations for interactive sandboxes
  const hsTargetDown = hsNeckline - (hsHead - hsNeckline);
  const hsDistance = hsHead - hsNeckline;

  const emaMultiplier = Math.round((2 / (maPeriod + 1)) * 10000) / 100;

  const rrRisk = Math.max(0.1, entryPrice - stopLoss);
  const rrReward = Math.max(0, targetPrice - entryPrice);
  const rrRatio = Math.round((rrReward / rrRisk) * 100) / 100;
  const maxRiskRupees = (accountCapital * riskPercent) / 100;
  const recommendedShares = Math.floor(maxRiskRupees / rrRisk);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl font-black">
              Ch.{lesson.chapterNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                  NCFM SECTION {lesson.sectionNumber} • {lesson.chapterTitle}
                </span>
                {lessonFinished && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Completed
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">{lesson.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-3">
          <button
            onClick={() => setActiveTab('THEORY')}
            className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'THEORY'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Core Concepts & Formulas
          </button>
          <button
            onClick={() => setActiveTab('ACTIVITY')}
            className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ACTIVITY'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            2. Interactive Workbench
          </button>
          <button
            onClick={() => setActiveTab('TEST')}
            className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'TEST'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            3. NCFM Exam Questions ({lesson.modelQuestions.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: THEORY & FORMULAS */}
          {activeTab === 'THEORY' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-indigo-200 text-xs sm:text-sm leading-relaxed">
                <span className="font-bold text-indigo-400">Lesson Brief: </span>
                {lesson.overview}
              </div>

              {/* Key Concept Cards */}
              <div className="space-y-4">
                {lesson.keyConcepts.map((concept, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      {concept.heading}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                      {concept.content}
                    </p>

                    {concept.formula && (
                      <div className="p-3 mt-2 rounded-xl bg-slate-900 border border-indigo-500/30 font-mono text-xs text-indigo-300">
                        <span className="text-slate-400 font-sans text-[11px] block mb-1">Official Formula:</span>
                        {concept.formula}
                      </div>
                    )}

                    {concept.bulletPoints && (
                      <ul className="space-y-1.5 pt-2">
                        {concept.bulletPoints.map((pt, pIdx) => (
                          <li key={pIdx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* Vocabulary / New Terms */}
              {lesson.newTerms.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Official Terminology & Exam Definitions
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {lesson.newTerms.map((term, tIdx) => (
                      <div key={tIdx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="text-xs font-black text-amber-400">{term.term}</div>
                        <div className="text-[11px] text-slate-300 leading-snug">{term.definition}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setActiveTab('ACTIVITY')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Go to Interactive Workbench</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE WORKBENCH */}
          {activeTab === 'ACTIVITY' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Activity Sandbox based on interactiveActivityType */}
              {lesson.interactiveActivityType === 'TOP_DOWN_FILTER' && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    Top-Down Analysis Filter Simulator
                  </h3>
                  <p className="text-xs text-slate-400">
                    Follow Charles Dow's protocol: Filter broad market index, narrow into promising sectors, and pick the best 3-4 stocks.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="text-[11px] font-bold text-slate-400">1. Broad Market Index</div>
                      <select
                        value={selectedIndex}
                        onChange={(e) => setSelectedIndex(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded-lg text-xs"
                      >
                        <option value="BULL">NIFTY 50 (Bullish: Above 200 DMA)</option>
                        <option value="BEAR">NIFTY 50 (Bearish: Below 200 DMA)</option>
                      </select>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="text-[11px] font-bold text-slate-400">2. Leading Sector</div>
                      <select
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded-lg text-xs"
                      >
                        <option value="BANKING">NIFTY Bank (Outperforming)</option>
                        <option value="IT">NIFTY IT (Outperforming)</option>
                        <option value="AUTO">NIFTY Auto (Consolidating)</option>
                        <option value="ENERGY">NIFTY Energy (High Beta)</option>
                      </select>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="text-[11px] font-bold text-slate-400">3. Stock Selection</div>
                      <div className="text-xs font-bold text-emerald-400 pt-1">
                        {selectedIndex === 'BULL' ? '✓ Recommended Buy Candidates:' : '⚠️ Caution / Short Candidates:'}
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono">
                        {selectedSector === 'BANKING' && 'HDFCBANK, ICICIBANK, SBIN'}
                        {selectedSector === 'IT' && 'TCS, INFY, TECHM'}
                        {selectedSector === 'AUTO' && 'TATAMOTORS, M&M, MARUTI'}
                        {selectedSector === 'ENERGY' && 'RELIANCE, ONGC, NTPC'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Candlestick Anatomy Simulator */}
              {(lesson.interactiveActivityType === 'CANDLESTICK_ANATOMY' ||
                lesson.category === 'CANDLESTICKS') && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Interactive Candlestick Generator
                  </h3>
                  <p className="text-xs text-slate-400">
                    Adjust Open, High, Low, and Close to generate Hammer, Shooting Star, Bullish Engulfing, or Doji lines.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {/* Controls */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-slate-300">
                          <span>Open Price:</span>
                          <span className="font-mono font-bold">₹{candleOpen}</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={candleOpen}
                          onChange={(e) => setCandleOpen(Number(e.target.value))}
                          className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-300">
                          <span>Close Price:</span>
                          <span className="font-mono font-bold">₹{candleClose}</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={candleClose}
                          onChange={(e) => setCandleClose(Number(e.target.value))}
                          className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-300">
                          <span>High Price:</span>
                          <span className="font-mono font-bold">₹{candleHigh}</span>
                        </div>
                        <input
                          type="range"
                          min={Math.max(candleOpen, candleClose)}
                          max="180"
                          value={candleHigh}
                          onChange={(e) => setCandleHigh(Number(e.target.value))}
                          className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-300">
                          <span>Low Price:</span>
                          <span className="font-mono font-bold">₹{candleLow}</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max={Math.min(candleOpen, candleClose)}
                          value={candleLow}
                          onChange={(e) => setCandleLow(Number(e.target.value))}
                          className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Quick Presets */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={() => {
                            setCandleOpen(100);
                            setCandleClose(105);
                            setCandleHigh(107);
                            setCandleLow(80);
                          }}
                          className="px-2.5 py-1 rounded-md text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                          Preset: Hammer
                        </button>
                        <button
                          onClick={() => {
                            setCandleOpen(100);
                            setCandleClose(95);
                            setCandleHigh(125);
                            setCandleLow(94);
                          }}
                          className="px-2.5 py-1 rounded-md text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                          Preset: Shooting Star
                        </button>
                        <button
                          onClick={() => {
                            setCandleOpen(100);
                            setCandleClose(100);
                            setCandleHigh(120);
                            setCandleLow(80);
                          }}
                          className="px-2.5 py-1 rounded-md text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                          Preset: Doji
                        </button>
                      </div>
                    </div>

                    {/* SVG Render */}
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-900 rounded-2xl border border-slate-800">
                      <div className="text-[11px] font-bold text-slate-400 mb-2">Live Candlestick Formation</div>
                      <svg width="120" height="180" viewBox="0 0 120 180" className="overflow-visible">
                        {/* Upper wick */}
                        <line
                          x1="60"
                          y1={180 - (candleHigh - 20) * 1.0}
                          x2="60"
                          y2={180 - (Math.max(candleOpen, candleClose) - 20) * 1.0}
                          stroke="#cbd5e1"
                          strokeWidth="2.5"
                        />
                        {/* Real Body */}
                        <rect
                          x="35"
                          y={180 - (Math.max(candleOpen, candleClose) - 20) * 1.0}
                          width="50"
                          height={Math.max(3, Math.abs(candleClose - candleOpen) * 1.0)}
                          fill={candleClose >= candleOpen ? '#10b981' : '#ef4444'}
                          stroke={candleClose >= candleOpen ? '#059669' : '#dc2626'}
                          strokeWidth="2"
                          rx="2"
                        />
                        {/* Lower wick */}
                        <line
                          x1="60"
                          y1={180 - (Math.min(candleOpen, candleClose) - 20) * 1.0}
                          x2="60"
                          y2={180 - (candleLow - 20) * 1.0}
                          stroke="#cbd5e1"
                          strokeWidth="2.5"
                        />
                      </svg>
                      <div className="mt-2 text-center text-xs">
                        <span className={`font-black ${candleClose >= candleOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {candleClose >= candleOpen ? 'Bullish (White/Green)' : 'Bearish (Black/Red)'}
                        </span>
                        {Math.abs(candleClose - candleOpen) <= 2 && (
                          <div className="text-amber-400 font-bold text-[11px]">Doji / Indecision Detected!</div>
                        )}
                        {candleClose >= candleOpen &&
                          180 - (Math.min(candleOpen, candleClose) - 20) - (180 - (candleLow - 20)) >=
                            2 * Math.abs(candleClose - candleOpen) && (
                            <div className="text-emerald-300 font-bold text-[11px]">Hammer Pattern Verified!</div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Head and Shoulders / Pattern Target Calculator */}
              {(lesson.interactiveActivityType === 'HEAD_SHOULDERS_CALC' ||
                lesson.interactiveActivityType === 'DOUBLE_TOP_BOTTOM') && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-indigo-400" />
                    Measured Move Price Target Calculator
                  </h3>
                  <p className="text-xs text-slate-400">
                    Formula: Target = Neckline - (Head Peak - Neckline)
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Head Peak Price (₹):</label>
                        <input
                          type="number"
                          value={hsHead}
                          onChange={(e) => setHsHead(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Neckline Break Price (₹):</label>
                        <input
                          type="number"
                          value={hsNeckline}
                          onChange={(e) => setHsNeckline(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-center space-y-2 text-center sm:text-left">
                      <div className="text-[11px] font-bold text-slate-400">Measured Move Distance:</div>
                      <div className="text-base font-black text-white font-mono">₹{hsDistance}</div>
                      <div className="text-[11px] font-bold text-slate-400">Projected Downside Target:</div>
                      <div className="text-xl font-black text-rose-400 font-mono">₹{hsTargetDown}</div>
                      <div className="text-[10px] text-slate-400">
                        Stop Loss: Place just above right shoulder or broken neckline retest.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* EMA Multiplier Workbench */}
              {lesson.interactiveActivityType === 'MA_CALCULATOR' && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-indigo-400" />
                    Official EMA Multiplier Workbench (2 / (N + 1))
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="space-y-2">
                      <label className="text-xs text-slate-300 block">Select Moving Average Period (N):</label>
                      <input
                        type="range"
                        min="3"
                        max="200"
                        value={maPeriod}
                        onChange={(e) => setMaPeriod(Number(e.target.value))}
                        className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-xs font-mono text-slate-400">
                        <span>3-day</span>
                        <span className="font-bold text-white">{maPeriod}-period</span>
                        <span>200-day</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-center sm:text-left">
                      <div className="text-xs text-slate-400">Mathematical Multiplier:</div>
                      <div className="text-xl font-black text-indigo-300 font-mono">
                        {emaMultiplier}% weighting
                      </div>
                      <div className="text-[11px] text-slate-400">
                        2 / ({maPeriod} + 1) = {(2 / (maPeriod + 1)).toFixed(4)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk-Reward & Position Size Calculator */}
              {(lesson.interactiveActivityType === 'RISK_REWARD_CALC' ||
                lesson.category === 'RISK_PSYCHOLOGY') && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Position Sizing & 1.5:1 Minimum Reward-to-Risk Rule
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Entry Price (₹):</label>
                      <input
                        type="number"
                        value={entryPrice}
                        onChange={(e) => setEntryPrice(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Stop Loss Price (₹):</label>
                      <input
                        type="number"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Target Price (₹):</label>
                      <input
                        type="number"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-slate-400">Reward-to-Risk Ratio:</div>
                      <div
                        className={`text-xl font-black font-mono ${
                          rrRatio >= 1.5 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {rrRatio}:1
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {rrRatio >= 1.5
                          ? '✓ Meets NCFM Rule (>= 1.5 minimum)'
                          : '❌ Rejected: Below 1.5 minimum rule! Do not enter.'}
                      </div>
                    </div>

                    <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6">
                      <div className="text-xs text-slate-400">Allowed Max Risk (2% Capital):</div>
                      <div className="text-base font-black text-amber-400 font-mono">
                        ₹{maxRiskRupees.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-bold">
                        Recommended Max Qty: {recommendedShares} shares
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setActiveTab('TEST')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Proceed to NCFM Knowledge Check</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: NCFM MODEL QUESTIONS & CERTIFICATION CHECK */}
          {activeTab === 'TEST' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-black text-white">Official NCFM Examination Questions</h3>
                  <p className="text-xs text-slate-400">
                    Pass with at least 60% score to earn {lesson.xpReward} XP and unlock the next lesson.
                  </p>
                </div>
                {testSubmitted && (
                  <div
                    className={`px-3 py-1 rounded-xl font-black text-xs ${
                      score >= Math.ceil(lesson.modelQuestions.length * 0.6)
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    Score: {score} / {lesson.modelQuestions.length} ({Math.round((score / lesson.modelQuestions.length) * 100)}%)
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {lesson.modelQuestions.map((q, qIndex) => {
                  const userAnswer = selectedAnswers[q.id];
                  const isAnswered = userAnswer !== undefined;
                  const isCorrect = isAnswered && userAnswer === q.correctAnswerIndex;

                  return (
                    <div
                      key={q.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        testSubmitted
                          ? isCorrect
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : 'bg-rose-950/20 border-rose-500/40'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="text-xs font-black text-indigo-400 mb-1">
                        Question {qIndex + 1}:
                      </div>
                      <h4 className="text-sm font-bold text-white mb-4">{q.question}</h4>

                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userAnswer === optIdx;
                          const isOptionCorrect = q.correctAnswerIndex === optIdx;

                          let btnStyle = 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300';
                          if (isSelected && !testSubmitted) {
                            btnStyle = 'bg-indigo-600/30 border-indigo-500 text-white font-bold';
                          } else if (testSubmitted) {
                            if (isOptionCorrect) {
                              btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold';
                            } else if (isSelected && !isOptionCorrect) {
                              btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-200';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectAnswer(q.id, optIdx)}
                              className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {testSubmitted && isOptionCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              )}
                              {testSubmitted && isSelected && !isOptionCorrect && (
                                <AlertCircle className="w-4 h-4 text-rose-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {testSubmitted && (
                        <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                          <span className="font-bold text-indigo-400">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit / Reset Actions */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                {testSubmitted ? (
                  <button
                    onClick={handleResetTest}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Try Again
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">
                    Answer all {lesson.modelQuestions.length} questions before submitting.
                  </span>
                )}

                {!testSubmitted && (
                  <button
                    onClick={handleSubmitTest}
                    disabled={Object.keys(selectedAnswers).length < lesson.modelQuestions.length}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-lg transition-all cursor-pointer"
                  >
                    Submit Answers & Claim XP
                  </button>
                )}

                {testSubmitted && score >= Math.ceil(lesson.modelQuestions.length * 0.6) && (
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg transition-all cursor-pointer"
                  >
                    Done & Return to Map
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
