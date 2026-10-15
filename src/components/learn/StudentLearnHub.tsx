import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Play,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Activity,
  Sliders,
  HelpCircle,
  Zap,
  FileCheck,
  Award,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { NCFM_LESSONS, NCFMLesson } from '../../data/ncfmCourseData';
import { NCFMLessonModal } from './NCFMLessonModal';
import { CourseCoverageModal } from './CourseCoverageModal';
import { soundEffects } from '../../utils/audio';

interface StudentLearnHubProps {
  onLaunchMission?: (missionId: string) => void;
}

export const StudentLearnHub: React.FC<StudentLearnHubProps> = () => {
  const { profile, completeNcfmLesson, isNcfmLessonUnlocked } = useGame();
  const [activeInteractiveTool, setActiveInteractiveTool] = useState<'CANDLE_LAB' | 'SUPPLY_DEMAND'>('CANDLE_LAB');
  const [selectedLesson, setSelectedLesson] = useState<NCFMLesson | null>(null);
  const [showCoverageModal, setShowCoverageModal] = useState<boolean>(false);
  const [selectedChapterFilter, setSelectedChapterFilter] = useState<number | 'ALL'>('ALL');

  // Interactive Candlestick Laboratory state
  const [openPrice, setOpenPrice] = useState(100);
  const [closePrice, setClosePrice] = useState(130);
  const [highPrice, setHighPrice] = useState(145);
  const [lowPrice, setLowPrice] = useState(85);

  // Interactive Supply & Demand state
  const [buyerCount, setBuyerCount] = useState(70);
  const [sellerCount, setSellerCount] = useState(30);

  // Candlestick calculation
  const isBullish = closePrice >= openPrice;
  const bodyTop = Math.max(openPrice, closePrice);
  const bodyBottom = Math.min(openPrice, closePrice);
  const bodyHeight = bodyTop - bodyBottom;
  const upperWick = highPrice - bodyTop;
  const lowerWick = bodyBottom - lowPrice;

  // Pattern detection
  let detectedPattern = 'Standard Trend Candle';
  if (lowerWick > bodyHeight * 2 && upperWick < 5) {
    detectedPattern = '🔨 Bullish Hammer';
  } else if (upperWick > bodyHeight * 2 && lowerWick < 5) {
    detectedPattern = '🌠 Bearish Shooting Star';
  } else if (bodyHeight <= 4) {
    detectedPattern = '⚖️ Doji (Indecision)';
  } else if (bodyHeight > 35 && upperWick < 5 && lowerWick < 5) {
    detectedPattern = '🚀 Marubozu (Extreme Momentum)';
  }

  // Supply / demand equilibrium
  const equilibriumPrice = Math.round(100 + (buyerCount - sellerCount) * 1.5);
  const demandSentiment =
    buyerCount > sellerCount + 20
      ? 'Intense Buying Pressure (Price Bullish Surge)'
      : sellerCount > buyerCount + 20
      ? 'Heavy Selling Panic (Price Bearish Drop)'
      : 'Market Equilibrium (Consolidation)';

  const completedList = profile.completedNcfmLessons || [];
  const completedCount = completedList.length;
  const totalCount = NCFM_LESSONS.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const filteredLessons =
    selectedChapterFilter === 'ALL'
      ? NCFM_LESSONS
      : NCFM_LESSONS.filter((l) => l.chapterNumber === selectedChapterFilter);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
            <BookOpen className="w-4 h-4" />
            <span>NSE NCFM TECHNICAL ANALYSIS CURRICULUM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Technical Analysis Certification Course
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Complete official course coverage from the 172-page National Stock Exchange module. Master chart mechanics, patterns, oscillators, strategies, Dow & Elliott wave theories, and risk management through interactive workbenches and official model exam questions.
          </p>
        </div>

        <button
          onClick={() => {
            soundEffects.click();
            setShowCoverageModal(true);
          }}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center gap-2 transition-all self-start sm:self-center cursor-pointer shadow-lg hover:scale-105"
        >
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span>View 100% Course Coverage Report</span>
        </button>
      </div>

      {/* Progress & Certification Status Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl font-black">
            🎓
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Course Completion Progress
            </div>
            <div className="text-lg font-black text-white">
              {completedCount} of {totalCount} Modules Completed ({progressPercent}%)
            </div>
          </div>
        </div>

        <div className="w-full sm:w-64 space-y-1.5">
          <div className="flex justify-between text-xs font-mono font-bold text-slate-300">
            <span>Certification Track</span>
            <span className="text-emerald-400">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TACTILE INTERACTIVE MECHANICS SANDBOXES                              */}
      {/* ==================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              TACTILE LABS
            </span>
            <h3 className="text-lg font-black text-white">Visual Market Simulators</h3>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                soundEffects.click();
                setActiveInteractiveTool('CANDLE_LAB');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeInteractiveTool === 'CANDLE_LAB'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Candle Morph Lab
            </button>
            <button
              onClick={() => {
                soundEffects.click();
                setActiveInteractiveTool('SUPPLY_DEMAND');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeInteractiveTool === 'SUPPLY_DEMAND'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Supply & Demand Equilibrium
            </button>
          </div>
        </div>

        {activeInteractiveTool === 'CANDLE_LAB' ? (
          <section className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-white">Interactive Candlestick Morph Sandbox</h2>
                <p className="text-xs text-slate-300">
                  Adjust Open, Close, High, and Low prices to discover how real candlestick patterns form in market battles.
                </p>
              </div>
              <div className="px-3.5 py-1.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-black text-xs self-start">
                {detectedPattern}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="bg-slate-950 rounded-3xl border border-slate-800 p-8 flex flex-col items-center justify-center min-h-[280px]">
                <div className="w-full flex justify-between text-[11px] font-mono text-slate-400 border-b border-slate-900 pb-2 mb-6">
                  <span>High: ₹{highPrice}</span>
                  <span>Open: ₹{openPrice}</span>
                  <span>Close: ₹{closePrice}</span>
                  <span>Low: ₹{lowPrice}</span>
                </div>

                <div className="relative flex flex-col items-center w-24 h-48 justify-center">
                  <div
                    className={`w-1 transition-all ${isBullish ? 'bg-emerald-400' : 'bg-rose-400'}`}
                    style={{ height: `${Math.max(4, upperWick * 1.5)}px` }}
                  />
                  <div
                    className={`w-16 rounded-md transition-all shadow-lg flex items-center justify-center text-[10px] font-mono font-black text-white ${
                      isBullish
                        ? 'bg-emerald-500 border-2 border-emerald-400 shadow-emerald-500/30'
                        : 'bg-rose-500 border-2 border-rose-400 shadow-rose-500/30'
                    }`}
                    style={{ height: `${Math.max(8, bodyHeight * 1.8)}px` }}
                  >
                    {isBullish ? '+₹' + (closePrice - openPrice) : '-₹' + (openPrice - closePrice)}
                  </div>
                  <div
                    className={`w-1 transition-all ${isBullish ? 'bg-emerald-400' : 'bg-rose-400'}`}
                    style={{ height: `${Math.max(4, lowerWick * 1.5)}px` }}
                  />
                </div>
              </div>

              <div className="space-y-4 bg-slate-950/60 p-6 rounded-3xl border border-slate-800/80">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Close Price (₹):</span>
                    <span className="font-mono text-white font-bold">{closePrice}</span>
                  </div>
                  <input
                    type="range"
                    min={lowPrice}
                    max={highPrice}
                    value={closePrice}
                    onChange={(e) => setClosePrice(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Open Price (₹):</span>
                    <span className="font-mono text-white font-bold">{openPrice}</span>
                  </div>
                  <input
                    type="range"
                    min={lowPrice}
                    max={highPrice}
                    value={openPrice}
                    onChange={(e) => setOpenPrice(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => {
                      setOpenPrice(100);
                      setClosePrice(105);
                      setHighPrice(107);
                      setLowPrice(75);
                    }}
                    className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                  >
                    Preset: Hammer
                  </button>
                  <button
                    onClick={() => {
                      setOpenPrice(100);
                      setClosePrice(94);
                      setHighPrice(130);
                      setLowPrice(93);
                    }}
                    className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                  >
                    Preset: Shooting Star
                  </button>
                  <button
                    onClick={() => {
                      setOpenPrice(100);
                      setClosePrice(100);
                      setHighPrice(125);
                      setLowPrice(75);
                    }}
                    className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                  >
                    Preset: Doji
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-black text-white">Supply & Demand Market Clearing Mechanism</h2>
              <p className="text-xs text-slate-300">
                Prices move based on the relative aggression of buyers and sellers at every moment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 flex flex-col items-center justify-between min-h-[260px]">
                <div className="w-full flex justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold">Buyers: {buyerCount}k</span>
                  <span className="text-rose-400 font-bold">Sellers: {sellerCount}k</span>
                </div>

                <div className="text-center my-6 space-y-1">
                  <span className="text-[10px] font-black tracking-wider uppercase text-slate-400">
                    MARKET CLEARING PRICE
                  </span>
                  <div className="text-4xl font-black font-mono text-white flex items-center justify-center gap-2">
                    <span>₹{equilibriumPrice}</span>
                    {equilibriumPrice > 100 ? (
                      <TrendingUp className="w-7 h-7 text-emerald-400" />
                    ) : equilibriumPrice < 100 ? (
                      <TrendingDown className="w-7 h-7 text-rose-400" />
                    ) : (
                      <Activity className="w-7 h-7 text-amber-400" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-indigo-300 max-w-xs mx-auto">
                    {demandSentiment}
                  </div>
                </div>

                <div className="w-full space-y-1">
                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 transition-all duration-300"
                      style={{ width: `${(buyerCount / (buyerCount + sellerCount)) * 100}%` }}
                    />
                    <div
                      className="bg-rose-500 transition-all duration-300"
                      style={{ width: `${(sellerCount / (buyerCount + sellerCount)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-slate-950/60 p-6 rounded-3xl border border-slate-800/80">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-emerald-400">Bidding Demand (Buyers):</span>
                    <span className="text-white font-mono">{buyerCount} orders</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={buyerCount}
                    onChange={(e) => setBuyerCount(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-rose-400">Offering Supply (Sellers):</span>
                    <span className="text-white font-mono">{sellerCount} orders</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={sellerCount}
                    onChange={(e) => setSellerCount(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ==================================================================== */}
      {/* CHAPTER FILTER TABS                                                  */}
      {/* ==================================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black text-white">Course Progression Map</h3>
            <p className="text-xs text-slate-400">
              Select a chapter to explore interactive modules, formulas, and certified NCFM model test evaluations.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setSelectedChapterFilter('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedChapterFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Chapters
            </button>
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <button
                key={num}
                onClick={() => setSelectedChapterFilter(num)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedChapterFilter === num
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Ch.{num}
              </button>
            ))}
          </div>
        </div>

        {/* Lessons List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLessons.map((lesson, idx) => {
            const isUnlocked = isNcfmLessonUnlocked(lesson.id);
            const isCompleted = completedList.includes(lesson.id);

            return (
              <div
                key={lesson.id}
                onClick={() => {
                  if (isUnlocked) {
                    soundEffects.click();
                    setSelectedLesson(lesson);
                  } else {
                    soundEffects.wrong();
                  }
                }}
                className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                  !isUnlocked
                    ? 'bg-slate-950/40 border-slate-900 opacity-60 cursor-not-allowed'
                    : isCompleted
                    ? 'bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 border-emerald-500/30 hover:border-emerald-500 cursor-pointer hover:scale-[1.02] shadow-xl'
                    : 'bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-950 border-indigo-500/30 hover:border-indigo-500 cursor-pointer hover:scale-[1.02] shadow-xl'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400">
                        Ch.{lesson.chapterNumber} • {lesson.sectionNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ~{lesson.estimatedMinutes} mins
                      </span>
                    </div>

                    {isCompleted ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    ) : isUnlocked ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Ready to Start
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Locked
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-base font-black text-white group-hover:text-indigo-300 transition-colors">
                      {lesson.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                      {lesson.subtitle}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                    <Award className="w-4 h-4" />
                    <span>+{lesson.xpReward} XP</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-indigo-400">
                    <span>{isCompleted ? 'Review Lesson' : 'Open Workbench'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lesson Modal */}
      {selectedLesson && (
        <NCFMLessonModal
          lesson={selectedLesson}
          isCompleted={completedList.includes(selectedLesson.id)}
          onClose={() => setSelectedLesson(null)}
          onComplete={(lId, earnedXp) => {
            completeNcfmLesson(lId, earnedXp);
          }}
        />
      )}

      {/* Course Coverage Report Modal */}
      {showCoverageModal && (
        <CourseCoverageModal
          onClose={() => setShowCoverageModal(false)}
          onOpenLesson={(lessonId) => {
            setShowCoverageModal(false);
            const found = NCFM_LESSONS.find((l) => l.id === lessonId);
            if (found) setSelectedLesson(found);
          }}
        />
      )}
    </div>
  );
};
