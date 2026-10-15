import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  PenTool,
  TrendingUp,
  TrendingDown,
  Activity,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowLeft,
  ChevronRight,
  Eye,
  Eraser
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CHART_MYSTERY_CASES, ChartMysteryCase } from '../../data/chartDetectiveData';
import { useGame } from '../../context/GameContext';
import { soundEffects } from '../../utils/audio';
import { Candle } from '../../types';

export const ChartDetective: React.FC = () => {
  const { addXP, addVirtualCash, recordMistake, completeDailyQuest, setActiveGame } = useGame();

  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [selectedPrediction, setSelectedPrediction] = useState<'BULLISH' | 'BEARISH' | 'SIDEWAYS' | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [drawnLines, setDrawnLines] = useState<{ y: number; label: string; color: string }[]>([]);
  const [drawingMode, setDrawingMode] = useState<'NONE' | 'SUPPORT' | 'RESISTANCE'>('NONE');

  const activeCase: ChartMysteryCase = CHART_MYSTERY_CASES[currentCaseIndex % CHART_MYSTERY_CASES.length];
  const allDisplayCandles: Candle[] = isRevealed
    ? [...activeCase.initialCandles, ...activeCase.futureCandles]
    : activeCase.initialCandles;

  const handlePredict = (prediction: 'BULLISH' | 'BEARISH' | 'SIDEWAYS') => {
    if (isRevealed) return;
    setSelectedPrediction(prediction);
    setIsRevealed(true);

    const isCorrect = prediction === activeCase.expectedTrend;
    if (isCorrect) {
      soundEffects.correct();
      addXP(75, 'Chart Detective Case Solved');
      addVirtualCash(2000);
      completeDailyQuest('quest-2');
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch {}
    } else {
      soundEffects.wrong();
      recordMistake(
        'CHASING_PEAK',
        `Misread chart setup on ${activeCase.ticker}. Predicted ${prediction}, but pattern resolved as ${activeCase.expectedTrend}.`,
        1200,
        activeCase.learningRule
      );
    }
  };

  const handleNextCase = () => {
    soundEffects.click();
    setSelectedPrediction(null);
    setIsRevealed(false);
    setDrawnLines([]);
    setDrawingMode('NONE');
    setCurrentCaseIndex(prev => prev + 1);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drawingMode === 'NONE') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;

    const label = drawingMode === 'SUPPORT' ? 'Support Level' : 'Resistance Level';
    const color = drawingMode === 'SUPPORT' ? '#10b981' : '#ef4444';

    soundEffects.click();
    setDrawnLines(prev => [...prev, { y: clickY, label, color }]);
    setDrawingMode('NONE');
  };

  const clearLines = () => {
    soundEffects.click();
    setDrawnLines([]);
  };

  // Min and Max for Chart Scaling
  const allPrices = allDisplayCandles.flatMap(c => [c.high, c.low]);
  const minPrice = Math.min(...allPrices) * 0.995;
  const maxPrice = Math.max(...allPrices) * 1.005;
  const chartHeight = 240;

  const getYCoord = (price: number) => {
    return chartHeight - ((price - minPrice) / (maxPrice - minPrice)) * (chartHeight - 40) - 20;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveGame(null)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to World Map</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-indigo-300 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-indigo-400" />
            <span>Mystery Case #{currentCaseIndex + 1}</span>
          </span>
        </div>
      </div>

      {/* Main Investigation Panel */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Case Info Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>{activeCase.ticker} • {activeCase.timeframe} Chart</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {activeCase.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {activeCase.historicalContext}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200 max-w-sm">
            <strong className="text-indigo-300 block mb-1">💡 Detective Clue:</strong>
            {activeCase.mysteryHint}
          </div>
        </div>

        {/* Drawing Tools Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-2 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
              Forensic Tools:
            </span>
            <button
              onClick={() => setDrawingMode(drawingMode === 'SUPPORT' ? 'NONE' : 'SUPPORT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                drawingMode === 'SUPPORT'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>+ Mark Support Line</span>
            </button>

            <button
              onClick={() => setDrawingMode(drawingMode === 'RESISTANCE' ? 'NONE' : 'RESISTANCE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                drawingMode === 'RESISTANCE'
                  ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/30'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>+ Mark Resistance Line</span>
            </button>

            {drawnLines.length > 0 && (
              <button
                onClick={clearLines}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                title="Clear drawn lines"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            {isRevealed ? '🔮 Historical Future Revealed' : '🔒 Future Hidden — Form Your Hypothesis'}
          </div>
        </div>

        {/* Interactive Chart Canvas Area */}
        <div
          onClick={handleCanvasClick}
          className="relative bg-slate-950 rounded-2xl border border-slate-800 p-4 overflow-x-auto select-none cursor-crosshair h-[280px]"
        >
          {/* Subtle Price Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
            <div className="w-full border-b border-slate-700" />
            <div className="w-full border-b border-slate-700" />
            <div className="w-full border-b border-slate-700" />
          </div>

          {/* User Drawn Forensic Lines */}
          {drawnLines.map((line, idx) => (
            <div
              key={idx}
              className="absolute left-0 right-0 pointer-events-none flex items-center justify-between px-4 z-20"
              style={{ top: `${line.y}px` }}
            >
              <div
                className="w-full h-0.5 border-b border-dashed"
                style={{ borderColor: line.color }}
              />
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded ml-2 shrink-0 shadow-sm"
                style={{ backgroundColor: line.color, color: '#090d16' }}
              >
                {line.label}
              </span>
            </div>
          ))}

          {/* Candlestick Rendering */}
          <div className="relative z-10 flex items-end justify-start gap-4 h-[240px] pt-4 min-w-[550px]">
            {allDisplayCandles.map((candle, idx) => {
              const isGreen = candle.close >= candle.open;
              const isFutureCandle = idx >= activeCase.initialCandles.length;

              const openY = getYCoord(candle.open);
              const closeY = getYCoord(candle.close);
              const highY = getYCoord(candle.high);
              const lowY = getYCoord(candle.low);

              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.max(3, Math.abs(openY - closeY));
              const wickHeight = Math.max(1, lowY - highY);

              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-end h-full w-10 relative group transition-all ${
                    isFutureCandle ? 'animate-fadeIn' : ''
                  }`}
                >
                  {/* Candlestick Bar */}
                  <div className="relative w-full h-[200px]">
                    {/* Wick Line */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 w-0.5"
                      style={{
                        top: `${highY}px`,
                        height: `${wickHeight}px`,
                        backgroundColor: isGreen ? '#10b981' : '#ef4444',
                      }}
                    />

                    {/* Body */}
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 w-6 rounded-xs transition-all shadow-sm ${
                        isFutureCandle ? 'border-2 border-indigo-400 ring-2 ring-indigo-500/40' : ''
                      }`}
                      style={{
                        top: `${bodyTop}px`,
                        height: `${bodyHeight}px`,
                        backgroundColor: isGreen ? '#10b981' : '#ef4444',
                      }}
                    />
                  </div>

                  {/* Date label */}
                  <span className="text-[9px] font-mono text-slate-400 mt-1 whitespace-nowrap">
                    {candle.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Decision Section */}
        {!isRevealed ? (
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-3">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Hypothesis Formulation: What happens next?</span>
            </h3>
            <p className="text-xs text-slate-300">
              Based on the candle price action, volume, and support/resistance structure:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                id="btn-predict-bullish"
                onClick={() => handlePredict('BULLISH')}
                className="p-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg shadow-emerald-950/30"
              >
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>Bullish Breakout (▲ BUY)</span>
              </button>

              <button
                id="btn-predict-bearish"
                onClick={() => handlePredict('BEARISH')}
                className="p-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 hover:border-rose-400 text-rose-300 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg shadow-rose-950/30"
              >
                <TrendingDown className="w-5 h-5 text-rose-400" />
                <span>Bearish Breakdown (▼ SHORT/SELL)</span>
              </button>

              <button
                id="btn-predict-sideways"
                onClick={() => handlePredict('SIDEWAYS')}
                className="p-4 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/40 hover:border-blue-400 text-blue-300 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg shadow-blue-950/30"
              >
                <Activity className="w-5 h-5 text-blue-400" />
                <span>Sideways Consolidation (■ WAIT)</span>
              </button>
            </div>
          </div>
        ) : (
          /* Post-Reveal Feedback & Learning Debrief */
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4 animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-slate-950 shrink-0 border border-slate-800">
                {selectedPrediction === activeCase.expectedTrend ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-400" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-black uppercase ${
                    selectedPrediction === activeCase.expectedTrend ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {selectedPrediction === activeCase.expectedTrend ? 'Correct Hypothesis!' : 'Prediction Failed'}
                  </span>
                  <span className="text-xs text-slate-400">• Expected: {activeCase.expectedTrend}</span>
                </div>
                <h4 className="text-base font-bold text-white mt-1">
                  {activeCase.explanation}
                </h4>
                <p className="text-xs text-slate-300 mt-2 bg-slate-950 p-3 rounded-xl border border-slate-850">
                  <strong className="text-amber-400">Master Rule:</strong> {activeCase.learningRule}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={handleNextCase}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95"
              >
                <span>Next Forensic Mystery</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
