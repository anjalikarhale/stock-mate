import React, { useState, useMemo } from 'react';
import { Candle } from '../../types';
import {
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sliders,
  HelpCircle,
  Eye,
  BarChart2,
  Compass
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundEffects } from '../../utils/audio';

interface InteractiveChartProps {
  symbol: string;
  candles: Candle[];
  timeframe?: string;
  height?: number;
  showIndicators?: boolean;
  onAskMentor?: (symbol: string) => void;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  symbol,
  candles: initialCandles,
  timeframe: initialTimeframe = 'Daily',
  height = 360,
  showIndicators = true,
  onAskMentor,
}) => {
  const { openAIMentorWithPrompt } = useGame();

  const [chartType, setChartType] = useState<'CANDLE' | 'LINE' | 'AREA'>('CANDLE');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>(initialTimeframe);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Indicators toggle state
  const [indicators, setIndicators] = useState({
    sma20: true,
    ema50: false,
    bollingerBands: true,
    rsi: true,
    volume: true,
    fibonacci: false,
  });

  // Timeframe simulation mapping (adjusts candle density/interpolation for variety)
  const candles = useMemo(() => {
    if (!initialCandles || initialCandles.length === 0) return [];
    if (selectedTimeframe === 'Daily' || selectedTimeframe === '1D') return initialCandles;

    // Simulate different timeframe sampling/variations
    const factor = selectedTimeframe === '1m' ? 0.3 : selectedTimeframe === '5m' ? 0.5 : selectedTimeframe === '15m' ? 0.8 : selectedTimeframe === '1h' ? 0.9 : 1.2;
    return initialCandles.map((c, i) => {
      const noise = Math.sin(i * factor) * (c.close * 0.003);
      const close = Math.round((c.close + noise) * 100) / 100;
      const open = Math.round((c.open + noise * 0.5) * 100) / 100;
      const high = Math.max(open, close, c.high + noise);
      const low = Math.min(open, close, c.low + noise);
      return {
        ...c,
        open,
        high,
        low,
        close,
        volume: Math.round(c.volume * (0.8 + Math.abs(noise / (c.close * 0.003)))),
      };
    });
  }, [initialCandles, selectedTimeframe]);

  if (!candles || candles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-950 rounded-2xl border border-slate-800 text-slate-400 text-xs">
        No chart data available for {symbol}
      </div>
    );
  }

  // Calculate Highs & Lows for scaling
  const allHighs = candles.map(c => c.high);
  const allLows = candles.map(c => c.low);
  const minPrice = Math.min(...allLows) * 0.992;
  const maxPrice = Math.max(...allHighs) * 1.008;

  // Split vertical space if RSI is active
  const rsiPaneHeight = indicators.rsi ? 75 : 0;
  const mainChartHeight = height - rsiPaneHeight - 50;

  const getYCoord = (price: number) => {
    const range = maxPrice - minPrice || 1;
    return mainChartHeight - ((price - minPrice) / range) * (mainChartHeight - 35) - 20;
  };

  // Technical Indicator 1: SMA (Simple Moving Average 20)
  const sma20 = useMemo(() => {
    const period = 20;
    return candles.map((_, i, arr) => {
      if (i < period - 1) return null;
      const slice = arr.slice(i - period + 1, i + 1);
      const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
      return Math.round((sum / period) * 100) / 100;
    });
  }, [candles]);

  // Technical Indicator 2: EMA 50 (Exponential Moving Average 50)
  const ema50 = useMemo(() => {
    const period = Math.min(50, Math.max(10, Math.floor(candles.length / 2)));
    const k = 2 / (period + 1);
    let prevEma: number | null = null;
    return candles.map((c, i) => {
      if (i < period - 1) return null;
      if (prevEma === null) {
        const slice = candles.slice(0, period);
        prevEma = slice.reduce((acc, curr) => acc + curr.close, 0) / period;
        return Math.round(prevEma * 100) / 100;
      }
      prevEma = c.close * k + prevEma * (1 - k);
      return Math.round(prevEma * 100) / 100;
    });
  }, [candles]);

  // Technical Indicator 3: Bollinger Bands (20, 2)
  const bollingerBands = useMemo(() => {
    const period = 20;
    return candles.map((_, i, arr) => {
      if (i < period - 1) return null;
      const slice = arr.slice(i - period + 1, i + 1);
      const mean = slice.reduce((acc, curr) => acc + curr.close, 0) / period;
      const variance = slice.reduce((acc, curr) => acc + Math.pow(curr.close - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      return {
        upper: Math.round((mean + 2 * stdDev) * 100) / 100,
        middle: Math.round(mean * 100) / 100,
        lower: Math.round((mean - 2 * stdDev) * 100) / 100,
      };
    });
  }, [candles]);

  // Technical Indicator 4: RSI (Relative Strength Index 14)
  const rsiValues = useMemo(() => {
    const period = 14;
    const rsi: (number | null)[] = [];
    let avgGain = 0;
    let avgLoss = 0;

    for (let i = 0; i < candles.length; i++) {
      if (i === 0) {
        rsi.push(null);
        continue;
      }
      const change = candles[i].close - candles[i - 1].close;
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;

      if (i <= period) {
        avgGain += gain;
        avgLoss += loss;
        if (i === period) {
          avgGain /= period;
          avgLoss /= period;
          const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
          rsi.push(Math.round((100 - 100 / (1 + rs)) * 10) / 10);
        } else {
          rsi.push(null);
        }
      } else {
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsi.push(Math.round((100 - 100 / (1 + rs)) * 10) / 10);
      }
    }
    return rsi;
  }, [candles]);

  // Volume Maximum for volume bar scaling
  const maxVolume = Math.max(...candles.map(c => c.volume || 1000));

  // Fibonacci Retracement Levels
  const swingHigh = Math.max(...allHighs);
  const swingLow = Math.min(...allLows);
  const fibDiff = swingHigh - swingLow;
  const fibLevels = [
    { label: '100% (High)', price: swingHigh, color: '#f43f5e' },
    { label: '61.8% (Golden)', price: swingLow + fibDiff * 0.618, color: '#eab308' },
    { label: '50.0% (Equilibrium)', price: swingLow + fibDiff * 0.5, color: '#06b6d4' },
    { label: '38.2%', price: swingLow + fibDiff * 0.382, color: '#8b5cf6' },
    { label: '23.6%', price: swingLow + fibDiff * 0.236, color: '#10b981' },
    { label: '0% (Low)', price: swingLow, color: '#10b981' },
  ];

  // SVG Paths
  const stepX = candles.length > 1 ? 100 / (candles.length - 1) : 100;

  const generateLinePath = () => {
    return candles
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX}% ${getYCoord(c.close)}px`)
      .join(' ');
  };

  const generateAreaPath = () => {
    const line = generateLinePath();
    return `${line} L 100% ${mainChartHeight}px L 0% ${mainChartHeight}px Z`;
  };

  const generateIndicatorPath = (values: (number | null)[]) => {
    const valid = values.map((val, i) => ({ val, i })).filter(p => p.val !== null);
    if (valid.length === 0) return '';
    return valid
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.i * stepX}% ${getYCoord(p.val!)}px`)
      .join(' ');
  };

  const generateBollingerEnvelopePath = () => {
    const valid = bollingerBands.map((bb, i) => ({ bb, i })).filter(p => p.bb !== null);
    if (valid.length === 0) return '';
    const upperPoints = valid.map(p => `${p.i * stepX}% ${getYCoord(p.bb!.upper)}px`).join(' L ');
    const lowerPointsReversed = [...valid]
      .reverse()
      .map(p => `${p.i * stepX}% ${getYCoord(p.bb!.lower)}px`)
      .join(' L ');
    return `M ${upperPoints} L ${lowerPointsReversed} Z`;
  };

  // Hovered or Latest Candle info
  const activeIndex = hoveredIndex !== null ? hoveredIndex : candles.length - 1;
  const activeCandle = candles[activeIndex] || candles[candles.length - 1];
  const isUp = activeCandle.close >= activeCandle.open;
  const activeRsi = rsiValues[activeIndex];
  const activeBb = bollingerBands[activeIndex];
  const activeSma = sma20[activeIndex];

  // Handler for Socratic AI Chart Mentor
  const handleAskMentorChart = () => {
    soundEffects.click();
    const prompt = `Can you provide a socratic technical analysis of ${symbol}?
- Current Price: ₹${activeCandle.close.toFixed(2)}
- 24h Candle: Open ₹${activeCandle.open}, High ₹${activeCandle.high}, Low ₹${activeCandle.low}, Close ₹${activeCandle.close} (${isUp ? 'Bullish' : 'Bearish'})
- RSI (14): ${activeRsi !== null && activeRsi !== undefined ? activeRsi : 'Neutral'} (${(activeRsi || 50) > 70 ? 'Overbought territory' : (activeRsi || 50) < 30 ? 'Oversold territory' : 'Midrange'})
- 20 SMA: ₹${activeSma || 'N/A'}
- Bollinger Band Upper: ₹${activeBb?.upper || 'N/A'}, Lower: ₹${activeBb?.lower || 'N/A'}
What key patterns, momentum signals, and stop loss levels should a disciplined trader consider?`;

    if (onAskMentor) {
      onAskMentor(symbol);
    }
    openAIMentorWithPrompt(prompt);
  };

  return (
    <div className="bg-slate-950 rounded-3xl border border-slate-800 p-4 sm:p-5 space-y-4 shadow-2xl relative overflow-hidden">
      {/* Chart Top Header & HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        {/* Left: Symbol & Live Price */}
        <div className="flex items-center gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-lg font-mono tracking-wide">{symbol}</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                NSE Cash
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-white font-extrabold text-sm sm:text-base">
                ₹{activeCandle.close.toFixed(2)}
              </span>
              <span className={`font-bold flex items-center gap-0.5 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isUp ? '▲' : '▼'} {Math.abs(activeCandle.close - activeCandle.open).toFixed(2)} (
                {(((activeCandle.close - activeCandle.open) / activeCandle.open) * 100).toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Center: OHLC & Volume HUD */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <span>O: <strong className="text-slate-200">₹{activeCandle.open}</strong></span>
          <span>H: <strong className="text-emerald-400">₹{activeCandle.high}</strong></span>
          <span>L: <strong className="text-rose-400">₹{activeCandle.low}</strong></span>
          <span>C: <strong className="text-slate-200">₹{activeCandle.close}</strong></span>
          <span>Vol: <strong className="text-cyan-300">{(activeCandle.volume / 1000).toFixed(1)}k</strong></span>
          {activeRsi !== null && (
            <span className="border-l border-slate-700 pl-2">
              RSI: <strong className={activeRsi > 70 ? 'text-rose-400' : activeRsi < 30 ? 'text-emerald-400' : 'text-amber-300'}>
                {activeRsi}
              </strong>
            </span>
          )}
        </div>
      </div>

      {/* Sub-toolbar: Timeframes, Chart Style & Indicator Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {['1m', '5m', '15m', '1h', '1D', '1W'].map(tf => (
            <button
              key={tf}
              onClick={() => {
                soundEffects.click();
                setSelectedTimeframe(tf);
              }}
              className={`px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] transition-all cursor-pointer ${
                selectedTimeframe === tf
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Chart Style (Candle / Line / Area) */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              soundEffects.click();
              setChartType('CANDLE');
            }}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              chartType === 'CANDLE' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Candles
          </button>
          <button
            onClick={() => {
              soundEffects.click();
              setChartType('LINE');
            }}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              chartType === 'LINE' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Line
          </button>
          <button
            onClick={() => {
              soundEffects.click();
              setChartType('AREA');
            }}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              chartType === 'AREA' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Area
          </button>
        </div>

        {/* Indicators Toolbar */}
        {showIndicators && (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setIndicators(prev => ({ ...prev, sma20: !prev.sma20 }))}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] border transition-all cursor-pointer ${
                indicators.sma20
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              SMA 20
            </button>
            <button
              onClick={() => setIndicators(prev => ({ ...prev, ema50: !prev.ema50 }))}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] border transition-all cursor-pointer ${
                indicators.ema50
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              EMA 50
            </button>
            <button
              onClick={() => setIndicators(prev => ({ ...prev, bollingerBands: !prev.bollingerBands }))}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] border transition-all cursor-pointer ${
                indicators.bollingerBands
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              Bollinger Bands
            </button>
            <button
              onClick={() => setIndicators(prev => ({ ...prev, rsi: !prev.rsi }))}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] border transition-all cursor-pointer ${
                indicators.rsi
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              RSI (14)
            </button>
            <button
              onClick={() => setIndicators(prev => ({ ...prev, fibonacci: !prev.fibonacci }))}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] border transition-all cursor-pointer ${
                indicators.fibonacci
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              Fib Retracement
            </button>
          </div>
        )}
      </div>

      {/* Main Visual SVG & Candlestick Workspace */}
      <div
        className="relative w-full overflow-hidden select-none bg-slate-950/60 rounded-2xl border border-slate-800/80 p-2"
        style={{ height: `${mainChartHeight}px` }}
      >
        {/* Subtle Horizontal Price Grids */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 p-2">
          <div className="w-full border-b border-dashed border-slate-700" />
          <div className="w-full border-b border-dashed border-slate-700" />
          <div className="w-full border-b border-dashed border-slate-700" />
          <div className="w-full border-b border-dashed border-slate-700" />
        </div>

        {/* Fibonacci Retracement Overlay Lines */}
        {indicators.fibonacci && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {fibLevels.map((fib, idx) => {
              const y = getYCoord(fib.price);
              if (y < 0 || y > mainChartHeight) return null;
              return (
                <div
                  key={idx}
                  className="absolute w-full border-b flex items-center justify-end pr-2"
                  style={{ top: `${y}px`, borderColor: fib.color, borderStyle: 'dotted' }}
                >
                  <span
                    className="text-[9px] font-mono px-1 rounded bg-slate-950/90 font-bold"
                    style={{ color: fib.color }}
                  >
                    {fib.label} ₹{fib.price.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Volume Histogram (base 20% of main chart) */}
        {indicators.volume && (
          <div className="absolute inset-x-2 bottom-1 h-14 flex items-end justify-between gap-1 pointer-events-none opacity-40">
            {candles.map((candle, idx) => {
              const isBull = candle.close >= candle.open;
              const barHeight = Math.max(3, (candle.volume / maxVolume) * 50);
              return (
                <div
                  key={`vol-${idx}`}
                  className="flex-1 rounded-t-xs"
                  style={{
                    height: `${barHeight}px`,
                    backgroundColor: isBull ? '#10b981' : '#ef4444',
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Render Candlesticks or SVG Lines */}
        {chartType === 'CANDLE' ? (
          <div className="absolute inset-0 flex items-end justify-between gap-1 px-3 py-2">
            {candles.map((candle, idx) => {
              const isGreen = candle.close >= candle.open;
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
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-crosshair hover:opacity-80 transition-opacity"
                >
                  <div className="relative w-full h-full">
                    {/* Wick */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 w-[1.5px]"
                      style={{
                        top: `${highY}px`,
                        height: `${wickHeight}px`,
                        backgroundColor: isGreen ? '#10b981' : '#ef4444',
                      }}
                    />

                    {/* Body */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 w-[85%] max-w-[14px] min-w-[3px] rounded-xs shadow-sm"
                      style={{
                        top: `${bodyTop}px`,
                        height: `${bodyHeight}px`,
                        backgroundColor: isGreen ? '#10b981' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <svg className="w-full h-full overflow-visible">
            {chartType === 'AREA' && (
              <path
                d={generateAreaPath()}
                fill="url(#area-gradient-lab)"
                className="opacity-40"
              />
            )}
            <defs>
              <linearGradient id="area-gradient-lab" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={generateLinePath()}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
            />
          </svg>
        )}

        {/* Bollinger Bands Overlay (Envelope and Upper/Lower Lines) */}
        {indicators.bollingerBands && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path
              d={generateBollingerEnvelopePath()}
              fill="#a855f7"
              fillOpacity="0.08"
            />
            {/* Upper Band */}
            <path
              d={generateIndicatorPath(bollingerBands.map(bb => bb?.upper ?? null))}
              fill="none"
              stroke="#c084fc"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
            {/* Lower Band */}
            <path
              d={generateIndicatorPath(bollingerBands.map(bb => bb?.lower ?? null))}
              fill="none"
              stroke="#c084fc"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
          </svg>
        )}

        {/* SMA 20 Overlay Line */}
        {indicators.sma20 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path
              d={generateIndicatorPath(sma20)}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.8"
            />
          </svg>
        )}

        {/* EMA 50 Overlay Line */}
        {indicators.ema50 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path
              d={generateIndicatorPath(ema50)}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1.8"
            />
          </svg>
        )}
      </div>

      {/* RSI Oscillator Panel */}
      {indicators.rsi && (
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-2.5 space-y-1 relative">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">RSI (14)</span>
              <span>Latest: <strong className="text-white">{activeRsi ?? 'N/A'}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-rose-400">70 (Overbought)</span>
              <span className="text-slate-500">50 (Neutral)</span>
              <span className="text-emerald-400">30 (Oversold)</span>
            </div>
          </div>

          <div className="relative w-full h-12 bg-slate-900/60 rounded-xl overflow-hidden border border-slate-800/80">
            {/* Overbought 70 reference line */}
            <div className="absolute inset-x-0 top-[30%] border-b border-rose-500/40 border-dashed pointer-events-none" />
            {/* Neutral 50 reference line */}
            <div className="absolute inset-x-0 top-[50%] border-b border-slate-700/60 border-dashed pointer-events-none" />
            {/* Oversold 30 reference line */}
            <div className="absolute inset-x-0 top-[70%] border-b border-emerald-500/40 border-dashed pointer-events-none" />

            {/* RSI Curve SVG */}
            <svg className="w-full h-full overflow-visible">
              {(() => {
                const validRsi = rsiValues.map((v, i) => ({ v, i })).filter(p => p.v !== null);
                if (validRsi.length === 0) return null;
                const pathStr = validRsi
                  .map((p, idx) => {
                    const x = p.i * stepX;
                    const y = 48 - (p.v! / 100) * 44 - 2;
                    return `${idx === 0 ? 'M' : 'L'} ${x}% ${y}px`;
                  })
                  .join(' ');
                return (
                  <path
                    d={pathStr}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.8"
                  />
                );
              })()}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
