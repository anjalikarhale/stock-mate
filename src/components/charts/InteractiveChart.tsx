import React, { useState, useMemo } from 'react';
import { Candle } from '../../types';
import {
  MarketMeta,
  SupportedChartTimeframe,
} from '../../services/marketApi';
import {
  Sparkles,
  BarChart2,
  AlertCircle,
  Loader2,
  Clock,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundEffects } from '../../utils/audio';

interface InteractiveChartProps {
  symbol: string;
  companyName?: string;
  candles: Candle[];
  timeframe?: SupportedChartTimeframe | string;
  onTimeframeChange?: (tf: SupportedChartTimeframe) => void;
  meta?: MarketMeta | null;
  loading?: boolean;
  errorMessage?: string | null;
  latestPrice?: number | null;
  dayChange?: number | null;
  dayChangePercent?: number | null;
  height?: number;
  showIndicators?: boolean;
  onAskMentor?: (symbol: string) => void;
}

const SUPPORTED_TIMEFRAMES: SupportedChartTimeframe[] = ['5D', '1M', '3M', '6M', '1Y'];
const VIEWBOX_WIDTH = 860;

function getStatusBadgeStyle(status?: string): string {
  switch (status) {
    case 'LIVE':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
    case 'CACHED':
      return 'bg-sky-500/15 text-sky-300 border-sky-500/40';
    case 'DELAYED':
    case 'HISTORICAL':
      return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40';
    case 'SIMULATED':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
    default:
      return 'bg-rose-500/15 text-rose-300 border-rose-500/40';
  }
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  symbol,
  companyName,
  candles,
  timeframe = '3M',
  onTimeframeChange,
  meta,
  loading = false,
  errorMessage = null,
  latestPrice,
  dayChange,
  dayChangePercent,
  height = 380,
  showIndicators = true,
  onAskMentor,
}) => {
  const { openAIMentorWithPrompt } = useGame();

  const [chartType, setChartType] = useState<'CANDLE' | 'LINE' | 'AREA'>('CANDLE');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const [indicators, setIndicators] = useState({
    sma20: true,
    ema50: false,
    bollingerBands: false,
    rsi: true,
    volume: true,
    fibonacci: false,
  });

  // Compute SMA 20
  const sma20 = useMemo(() => {
    if (!candles || candles.length === 0) return [];
    const period = Math.min(20, Math.max(5, Math.floor(candles.length / 3)));
    return candles.map((_, i, arr) => {
      if (i < period - 1) return null;
      const slice = arr.slice(i - period + 1, i + 1);
      const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
      return Math.round((sum / period) * 100) / 100;
    });
  }, [candles]);

  // Compute EMA 50
  const ema50 = useMemo(() => {
    if (!candles || candles.length === 0) return [];
    const period = Math.min(50, Math.max(10, Math.floor(candles.length / 2)));
    const k = 2 / (period + 1);
    let prevEma: number | null = null;
    return candles.map((c, i) => {
      if (i < period - 1) return null;
      if (prevEma === null) {
        const slice = candles.slice(0, period);
        prevEma = slice.reduce((acc, curr) => acc + curr.close, 0) / period;
      } else {
        prevEma = c.close * k + prevEma * (1 - k);
      }
      return Math.round(prevEma * 100) / 100;
    });
  }, [candles]);

  // Compute Bollinger Bands (20, 2σ)
  const bollinger = useMemo(() => {
    if (!candles || candles.length === 0) return [];
    const period = Math.min(20, Math.max(5, Math.floor(candles.length / 3)));
    return candles.map((_, i, arr) => {
      if (i < period - 1) return null;
      const slice = arr.slice(i - period + 1, i + 1);
      const mean = slice.reduce((a, b) => a + b.close, 0) / period;
      const variance = slice.reduce((a, b) => a + Math.pow(b.close - mean, 2), 0) / period;
      const sd = Math.sqrt(variance);
      return {
        upper: Math.round((mean + 2 * sd) * 100) / 100,
        middle: Math.round(mean * 100) / 100,
        lower: Math.round((mean - 2 * sd) * 100) / 100,
      };
    });
  }, [candles]);

  // Compute Wilder/Simple 14-Period RSI
  const rsi14 = useMemo(() => {
    if (!candles || candles.length === 0) return [];
    const period = 14;
    return candles.map((_, i, arr) => {
      if (i < period) return null;
      let gains = 0;
      let losses = 0;
      for (let j = i - period + 1; j <= i; j++) {
        const diff = arr[j].close - arr[j - 1].close;
        if (diff >= 0) gains += diff;
        else losses -= diff;
      }
      const avgGain = gains / period;
      const avgLoss = losses / period;
      if (avgLoss === 0) return 100;
      const rs = avgGain / avgLoss;
      return Math.round((100 - 100 / (1 + rs)) * 10) / 10;
    });
  }, [candles]);

  // Loading Skeleton State (all React hooks have already executed above)
  if (loading) {
    return (
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 min-h-[360px] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        <div className="text-xs font-semibold">
          Loading historical OHLC candles for <span className="font-mono text-white">{symbol}</span> ({timeframe})...
        </div>
      </div>
    );
  }

  // Unavailable / Empty State
  if (errorMessage || !candles || candles.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 min-h-[360px] flex flex-col items-center justify-center gap-2 text-center">
        <AlertCircle className="w-6 h-6 text-rose-400" />
        <div className="text-sm font-bold text-white">
          Chart Data Unavailable for {symbol}
        </div>
        <p className="text-xs text-slate-400 max-w-md">
          {errorMessage ||
            meta?.notice ||
            'Historical OHLC series could not be retrieved for this instrument right now.'}
        </p>
      </div>
    );
  }

  const safeGradId = `areaGrad-${symbol.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const padLeft = 14;
  const padRight = 64;
  const plotWidth = VIEWBOX_WIDTH - padLeft - padRight;
  const rsiPaneHeight = showIndicators && indicators.rsi ? 78 : 0;
  const mainChartHeight = Math.max(210, height - rsiPaneHeight - 40);

  const allHighs = candles.map((c) => Number(c.high) || 0);
  const allLows = candles.map((c) => Number(c.low) || 0);
  const rawMin = Math.min(...allLows);
  const rawMax = Math.max(...allHighs);
  const padPrice = Math.max((rawMax - rawMin) * 0.06, rawMin * 0.004, 1);
  const minPrice = rawMin - padPrice;
  const maxPrice = rawMax + padPrice;
  const maxVol = Math.max(1, ...candles.map((c) => Number(c.volume) || 0));

  const getX = (idx: number) => {
    if (candles.length <= 1) return padLeft + plotWidth / 2;
    const step = plotWidth / candles.length;
    return padLeft + idx * step + step / 2;
  };

  const getY = (price: number) => {
    const range = maxPrice - minPrice || 1;
    const usable = mainChartHeight - 34;
    return mainChartHeight - 18 - ((price - minPrice) / range) * usable;
  };

  const buildNumericPath = (values: (number | null)[]) => {
    let d = '';
    values.forEach((v, i) => {
      if (v === null || !Number.isFinite(v)) return;
      const x = getX(i).toFixed(1);
      const y = getY(v).toFixed(1);
      d += d === '' ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    return d;
  };

  const closeLinePath = buildNumericPath(candles.map((c) => c.close));
  const firstX = getX(0).toFixed(1);
  const lastX = getX(candles.length - 1).toFixed(1);
  const bottomY = (mainChartHeight - 16).toFixed(1);
  const areaPath = closeLinePath
    ? `${closeLinePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`
    : '';

  const smaPath = indicators.sma20 ? buildNumericPath(sma20) : '';
  const emaPath = indicators.ema50 ? buildNumericPath(ema50) : '';
  const bbUpperPath = indicators.bollingerBands
    ? buildNumericPath(bollinger.map((b) => (b ? b.upper : null)))
    : '';
  const bbLowerPath = indicators.bollingerBands
    ? buildNumericPath(bollinger.map((b) => (b ? b.lower : null)))
    : '';

  const activeIdx =
    hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < candles.length
      ? hoveredIndex
      : candles.length - 1;
  const activeCandle = candles[activeIdx];
  const prevCandle = activeIdx > 0 ? candles[activeIdx - 1] : candles[0];
  const barChange = (Number(activeCandle?.close) || 0) - (Number(prevCandle?.close) || 0);
  const barChangePct =
    (Number(prevCandle?.close) || 0) > 0 ? (barChange / Number(prevCandle.close)) * 100 : 0;

  const displayLast = Number(latestPrice ?? candles[candles.length - 1]?.close ?? 0);
  const displayChange = Number(
    dayChange ??
      (candles.length > 1
        ? candles[candles.length - 1].close - candles[candles.length - 2].close
        : 0)
  );
  const displayChangePct = Number(
    dayChangePercent ??
      (candles.length > 1 && candles[candles.length - 2].close > 0
        ? (displayChange / candles[candles.length - 2].close) * 100
        : 0)
  );

  const candleStep = plotWidth / candles.length;
  const bodyWidth = Math.max(2.5, Math.min(14, candleStep * 0.66));

  // Price grid levels
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((frac) => {
    const val = minPrice + frac * (maxPrice - minPrice);
    return { val, y: getY(val) };
  });

  // RSI numeric path (computed synchronously without conditional hooks)
  let rsiPath = '';
  if (rsiPaneHeight > 0) {
    rsi14.forEach((val, idx) => {
      if (val === null || !Number.isFinite(val)) return;
      const x = getX(idx).toFixed(1);
      const y = (rsiPaneHeight - 10 - (val / 100) * (rsiPaneHeight - 20)).toFixed(1);
      rsiPath += rsiPath === '' ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
  }

  return (
    <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
      {/* Top Toolbar: Symbol, Data Status Badge, Timeframes, Chart Type */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black text-white font-mono">
                {symbol}
              </span>
              {companyName && (
                <span className="text-xs text-slate-400 hidden sm:inline truncate max-w-[200px]">
                  {companyName}
                </span>
              )}
              {meta && (
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getStatusBadgeStyle(
                    meta.status
                  )}`}
                  title={meta.notice || meta.source}
                >
                  {meta.status}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono mt-0.5">
              <span className="text-white font-bold">
                ₹{displayLast.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
              <span className={displayChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {displayChange >= 0 ? '+' : ''}
                {displayChange.toFixed(2)} ({displayChange >= 0 ? '+' : ''}
                {displayChangePct.toFixed(2)}%)
              </span>
              {meta?.lastUpdated && (
                <span className="text-slate-500 inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(meta.lastUpdated).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Timeframe & Chart Mode Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {onTimeframeChange && (
            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              {SUPPORTED_TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => {
                    soundEffects.click();
                    onTimeframeChange(tf);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                    timeframe === tf
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}

          <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            {(['CANDLE', 'LINE', 'AREA'] as const).map((tp) => (
              <button
                key={tp}
                type="button"
                onClick={() => setChartType(tp)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  chartType === tp
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tp === 'CANDLE' ? 'Candles' : tp === 'LINE' ? 'Line' : 'Area'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              if (onAskMentor) {
                onAskMentor(symbol);
              } else {
                openAIMentorWithPrompt(
                  `Help me read the ${timeframe} price structure, key support/resistance zones, and indicator behaviour on ${symbol} (Last: ₹${displayLast.toFixed(2)}).`
                );
              }
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-[11px] font-bold text-indigo-300 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chart Tutor</span>
          </button>
        </div>
      </div>

      {/* Indicator Pills + Active Crosshair OHLCV Bar */}
      <div className="px-4 py-2 bg-slate-950 border-b border-slate-900 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex flex-wrap items-center gap-3 font-mono">
          <span className="text-slate-400">{activeCandle?.time || ''}</span>
          <span>
            O: <strong className="text-slate-200">{Number(activeCandle?.open || 0).toFixed(2)}</strong>
          </span>
          <span>
            H: <strong className="text-emerald-400">{Number(activeCandle?.high || 0).toFixed(2)}</strong>
          </span>
          <span>
            L: <strong className="text-rose-400">{Number(activeCandle?.low || 0).toFixed(2)}</strong>
          </span>
          <span>
            C: <strong className="text-white">{Number(activeCandle?.close || 0).toFixed(2)}</strong>
          </span>
          <span className={barChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
            ({barChange >= 0 ? '+' : ''}
            {barChangePct.toFixed(2)}%)
          </span>
          {Number(activeCandle?.volume || 0) > 0 && (
            <span className="text-slate-400">
              Vol: <strong className="text-slate-200">{Number(activeCandle.volume).toLocaleString('en-IN')}</strong>
            </span>
          )}
        </div>

        {showIndicators && (
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: 'sma20' as const, label: 'SMA 20', color: 'text-amber-300' },
              { key: 'ema50' as const, label: 'EMA 50', color: 'text-sky-300' },
              { key: 'bollingerBands' as const, label: 'BB(20,2)', color: 'text-violet-300' },
              { key: 'volume' as const, label: 'Vol', color: 'text-slate-300' },
              { key: 'rsi' as const, label: 'RSI 14', color: 'text-indigo-300' },
              { key: 'fibonacci' as const, label: 'Fib', color: 'text-teal-300' },
            ].map((ind) => (
              <button
                key={ind.key}
                type="button"
                onClick={() =>
                  setIndicators((prev) => ({ ...prev, [ind.key]: !prev[ind.key] }))
                }
                className={`px-2 py-0.5 rounded border text-[10px] font-bold cursor-pointer ${
                  indicators[ind.key]
                    ? `bg-slate-900 border-slate-700 ${ind.color}`
                    : 'bg-slate-950 border-slate-900 text-slate-600'
                }`}
              >
                {ind.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Numeric-ViewBox SVG Price & Volume Canvas */}
      <div className="relative select-none" onMouseLeave={() => setHoveredIndex(null)}>
        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${mainChartHeight}`}
          height={mainChartHeight}
          className="w-full block"
        >
          <defs>
            <linearGradient id={safeGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Horizontal Price Grid + Right Y-Axis Labels */}
          {yTicks.map((t, idx) => (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={t.y}
                x2={VIEWBOX_WIDTH - padRight}
                y2={t.y}
                stroke="#1e293b"
                strokeWidth="1"
              />
              <text
                x={VIEWBOX_WIDTH - padRight + 6}
                y={t.y + 3.5}
                fill="#64748b"
                fontSize="10"
                fontFamily="monospace"
              >
                {t.val.toFixed(t.val >= 1000 ? 0 : 1)}
              </text>
            </g>
          ))}

          {/* Fibonacci Retracement Levels */}
          {indicators.fibonacci &&
            [0.236, 0.382, 0.5, 0.618].map((fib) => {
              const priceLvl = rawMax - (rawMax - rawMin) * fib;
              const y = getY(priceLvl);
              return (
                <g key={fib}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={VIEWBOX_WIDTH - padRight}
                    y2={y}
                    stroke="#14b8a6"
                    strokeOpacity="0.45"
                    strokeDasharray="4 4"
                  />
                  <text x={padLeft + 4} y={y - 3} fill="#2dd4bf" fontSize="9" fontFamily="monospace">
                    Fib {(fib * 100).toFixed(1)}% ({priceLvl.toFixed(1)})
                  </text>
                </g>
              );
            })}

          {/* Volume Histogram Bars along Bottom */}
          {indicators.volume &&
            candles.map((c, idx) => {
              const volH = ((c.volume || 0) / maxVol) * (mainChartHeight * 0.2);
              const x = getX(idx);
              const bullish = c.close >= c.open;
              return (
                <rect
                  key={`vol-${idx}`}
                  x={x - bodyWidth / 2}
                  y={mainChartHeight - 16 - volH}
                  width={bodyWidth}
                  height={Math.max(1, volH)}
                  fill={bullish ? '#10b981' : '#f43f5e'}
                  fillOpacity="0.18"
                />
              );
            })}

          {/* Area / Line Modes */}
          {chartType === 'AREA' && areaPath && (
            <>
              <path d={areaPath} fill={`url(#${safeGradId})`} />
              <path d={closeLinePath} fill="none" stroke="#818cf8" strokeWidth="2.2" />
            </>
          )}

          {chartType === 'LINE' && closeLinePath && (
            <path d={closeLinePath} fill="none" stroke="#38bdf8" strokeWidth="2.2" />
          )}

          {/* Candlestick Mode */}
          {chartType === 'CANDLE' &&
            candles.map((c, idx) => {
              const x = getX(idx);
              const yOpen = getY(c.open);
              const yClose = getY(c.close);
              const yHigh = getY(c.high);
              const yLow = getY(c.low);
              const bullish = c.close >= c.open;
              const color = bullish ? '#10b981' : '#f43f5e';
              const top = Math.min(yOpen, yClose);
              const bHeight = Math.max(1.8, Math.abs(yClose - yOpen));

              return (
                <g key={`c-${idx}`}>
                  <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1.3" />
                  <rect
                    x={x - bodyWidth / 2}
                    y={top}
                    width={bodyWidth}
                    height={bHeight}
                    fill={color}
                    rx="1"
                  />
                </g>
              );
            })}

          {/* Bollinger Bands */}
          {indicators.bollingerBands && bbUpperPath && bbLowerPath && (
            <>
              <path
                d={bbUpperPath}
                fill="none"
                stroke="#a78bfa"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
              <path
                d={bbLowerPath}
                fill="none"
                stroke="#a78bfa"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
            </>
          )}

          {/* SMA 20 & EMA 50 */}
          {indicators.sma20 && smaPath && (
            <path d={smaPath} fill="none" stroke="#fbbf24" strokeWidth="1.6" />
          )}
          {indicators.ema50 && emaPath && (
            <path d={emaPath} fill="none" stroke="#38bdf8" strokeWidth="1.6" />
          )}

          {/* Hover Crosshair Guide */}
          {hoveredIndex !== null && activeCandle && (
            <g>
              <line
                x1={getX(activeIdx)}
                y1={8}
                x2={getX(activeIdx)}
                y2={mainChartHeight - 16}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <line
                x1={padLeft}
                y1={getY(activeCandle.close)}
                x2={VIEWBOX_WIDTH - padRight}
                y2={getY(activeCandle.close)}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={getX(activeIdx)}
                cy={getY(activeCandle.close)}
                r="4"
                fill="#ffffff"
                stroke="#6366f1"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Date X-Axis Ticks */}
          {[0, Math.floor(candles.length / 2), candles.length - 1]
            .filter((v, i, a) => a.indexOf(v) === i && candles[v])
            .map((idx) => (
              <text
                key={`dt-${idx}`}
                x={getX(idx)}
                y={mainChartHeight - 3}
                textAnchor={idx === 0 ? 'start' : idx === candles.length - 1 ? 'end' : 'middle'}
                fill="#64748b"
                fontSize="10"
                fontFamily="monospace"
              >
                {candles[idx].time}
              </text>
            ))}

          {/* Invisible Interactive Hover Columns */}
          {candles.map((_, idx) => {
            const x = getX(idx);
            return (
              <rect
                key={`hit-${idx}`}
                x={x - candleStep / 2}
                y={0}
                width={Math.max(4, candleStep)}
                height={mainChartHeight}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoveredIndex(idx)}
              />
            );
          })}
        </svg>

        {/* RSI (14) Lower Sub-Pane */}
        {rsiPaneHeight > 0 && (
          <div className="border-t border-slate-800 bg-slate-950/90">
            <div className="px-4 pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>RSI (14): {rsi14[activeIdx] ?? '—'}</span>
              <span>70 / 30 Reference Bands</span>
            </div>
            <svg
              viewBox={`0 0 ${VIEWBOX_WIDTH} ${rsiPaneHeight}`}
              height={Math.max(40, rsiPaneHeight - 16)}
              className="w-full block"
            >
              <line
                x1={padLeft}
                y1={rsiPaneHeight - 10 - 0.7 * (rsiPaneHeight - 20)}
                x2={VIEWBOX_WIDTH - padRight}
                y2={rsiPaneHeight - 10 - 0.7 * (rsiPaneHeight - 20)}
                stroke="#f43f5e"
                strokeOpacity="0.35"
                strokeDasharray="3 3"
              />
              <line
                x1={padLeft}
                y1={rsiPaneHeight - 10 - 0.3 * (rsiPaneHeight - 20)}
                x2={VIEWBOX_WIDTH - padRight}
                y2={rsiPaneHeight - 10 - 0.3 * (rsiPaneHeight - 20)}
                stroke="#10b981"
                strokeOpacity="0.35"
                strokeDasharray="3 3"
              />
              {rsiPath && (
                <path d={rsiPath} fill="none" stroke="#818cf8" strokeWidth="1.8" />
              )}
            </svg>
          </div>
        )}
      </div>

      {/* Honest Data Source & Status Footer */}
      {meta && (
        <div className="px-4 py-2 bg-slate-900/70 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <BarChart2 className="w-3 h-3 text-indigo-400" />
            <span>Source: {meta.source}</span>
          </span>
          {meta.notice && <span className="text-slate-400">{meta.notice}</span>}
        </div>
      )}
    </div>
  );
};
