import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Search,
  Star,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  Info,
  RefreshCw,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { InteractiveChart } from '../charts/InteractiveChart';
import { OptionChainTable } from './OptionChainTable';
import {
  marketApi,
  RegisteredInstrumentItem,
  NormalizedMarketQuote,
  HistoricalChartPayload,
  OptionChainPayload,
  OptionContractSide,
  SupportedChartTimeframe,
} from '../../services/marketApi';
import { Candle } from '../../types';

type TerminalMode = 'EQUITY' | 'INDEX' | 'OPTIONS';

export const TradingTerminal: React.FC = () => {
  const {
    profile,
    stocks,
    placeEquityOrder,
    cancelEquityOrder,
    placeOptionOrder,
    toggleWatchlist,
    navigateTargetTradeSymbol,
    setNavigateTargetTradeSymbol,
    updateMentorContext,
  } = useGame();

  const [mode, setMode] = useState<TerminalMode>('EQUITY');
  const [instruments, setInstruments] = useState<RegisteredInstrumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Equity & Index selected symbol
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [timeframe, setTimeframe] = useState<SupportedChartTimeframe>('3M');

  // Quote & Historical Chart state (per-symbol, race-protected)
  const [quote, setQuote] = useState<NormalizedMarketQuote | null>(null);
  const [chartData, setChartData] = useState<HistoricalChartPayload | null>(null);
  const [chartLoading, setChartLoading] = useState<boolean>(true);
  const [chartError, setChartError] = useState<string | null>(null);

  // Equity Order Ticket State
  const [eqAction, setEqAction] = useState<'BUY' | 'SELL'>('BUY');
  const [eqOrderType, setEqOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP_LOSS'>('MARKET');
  const [eqQty, setEqQty] = useState<number>(5);
  const [eqPriceInput, setEqPriceInput] = useState<string>('');
  const [eqStopInput, setEqStopInput] = useState<string>('');
  const [eqRationale, setEqRationale] = useState<string>('');
  const [eqSubmitting, setEqSubmitting] = useState<boolean>(false);
  const [orderBanner, setOrderBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Options Paper Trading State
  const [optUnderlying, setOptUnderlying] = useState<'NIFTY' | 'BANKNIFTY' | 'SENSEX'>('NIFTY');
  const [optExpiry, setOptExpiry] = useState<string>('');
  const [optionChain, setOptionChain] = useState<OptionChainPayload | null>(null);
  const [chainLoading, setChainLoading] = useState<boolean>(false);
  const [chainError, setChainError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<{
    strike: number;
    optionType: 'CE' | 'PE';
    contract: OptionContractSide;
  } | null>(null);
  const [optAction, setOptAction] = useState<'BUY' | 'SELL'>('BUY');
  const [optLots, setOptLots] = useState<number>(1);
  const [optRationale, setOptRationale] = useState<string>('');
  const [optSubmitting, setOptSubmitting] = useState<boolean>(false);

  // Load registered instruments once
  useEffect(() => {
    const controller = new AbortController();
    marketApi
      .getInstruments(undefined, controller.signal)
      .then((res) => {
        setInstruments(res.instruments || []);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  // Handle cross-tab navigation symbol target (e.g. from Learn Hub practical task)
  useEffect(() => {
    if (navigateTargetTradeSymbol) {
      const target = navigateTargetTradeSymbol.toUpperCase();
      if (target === 'NIFTY' || target === 'BANKNIFTY' || target === 'SENSEX') {
        setMode('INDEX');
        setSelectedSymbol(target);
        setOptUnderlying(target);
      } else {
        setMode('EQUITY');
        setSelectedSymbol(target);
      }
      setNavigateTargetTradeSymbol(null);
    }
  }, [navigateTargetTradeSymbol, setNavigateTargetTradeSymbol]);

  // Keep Mentor context updated with active symbol & mode
  useEffect(() => {
    const activeSym = mode === 'OPTIONS' ? optUnderlying : selectedSymbol;
    updateMentorContext({
      currentTab: 'TRADE',
      selectedSymbol: activeSym,
      selectedTimeframe: timeframe,
      tradingMode: mode,
    });
  }, [mode, selectedSymbol, optUnderlying, timeframe, updateMentorContext]);

  // Fetch per-symbol Quote + Historical Candles with AbortController (prevents race conditions!)
  const activeChartSymbol = mode === 'OPTIONS' ? optUnderlying : selectedSymbol;

  const loadSymbolData = (sym: string, tf: SupportedChartTimeframe, signal?: AbortSignal) => {
    setChartLoading(true);
    setChartError(null);

    Promise.all([
      marketApi.getQuote(sym, signal).catch(() => null),
      marketApi.getHistory(sym, tf, signal),
    ])
      .then(([qData, hData]) => {
        if (signal?.aborted) return;
        if (qData) {
          setQuote(qData);
          if (qData.lastPrice) {
            setEqPriceInput(String(qData.lastPrice));
          }
        }
        if (hData.meta.status === 'UNAVAILABLE' || !hData.candles || hData.candles.length === 0) {
          setChartData(hData);
          setChartError(
            hData.meta.notice || `Historical candles unavailable for ${sym} (${tf}).`
          );
        } else {
          setChartData(hData);
          if (!qData?.lastPrice && hData.latestPrice) {
            setEqPriceInput(String(hData.latestPrice));
          }
        }
      })
      .catch((err) => {
        if (signal?.aborted) return;
        setChartError(err.message || `Failed to load chart data for ${sym}`);
      })
      .finally(() => {
        if (!signal?.aborted) {
          setChartLoading(false);
        }
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    loadSymbolData(activeChartSymbol, timeframe, controller.signal);
    return () => controller.abort();
  }, [activeChartSymbol, timeframe]);

  // Load Index Option Chain when in OPTIONS mode
  useEffect(() => {
    if (mode !== 'OPTIONS') return;
    const controller = new AbortController();
    setChainLoading(true);
    setChainError(null);

    marketApi
      .getOptionChain(optUnderlying, optExpiry || undefined, controller.signal)
      .then((chain) => {
        if (controller.signal.aborted) return;
        setOptionChain(chain);
        if (!optExpiry || !chain.availableExpiries.includes(optExpiry)) {
          setOptExpiry(chain.expiryDate);
        }
        // Preselect ATM CE if none selected or underlying changed
        if (chain.strikes.length > 0) {
          const spot = chain.underlyingLtp || chain.strikes[Math.floor(chain.strikes.length / 2)].strikePrice;
          const atmRow = chain.strikes.reduce((best, cur) =>
            Math.abs(cur.strikePrice - spot) < Math.abs(best.strikePrice - spot) ? cur : best
          );
          if (atmRow.ce) {
            setSelectedOption({
              strike: atmRow.strikePrice,
              optionType: 'CE',
              contract: atmRow.ce,
            });
          }
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setChainError(err.message || 'Option chain unavailable');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setChainLoading(false);
        }
      });

    return () => controller.abort();
  }, [mode, optUnderlying, optExpiry]);

  const equityAndEtfList = useMemo(() => {
    return instruments.filter(
      (inst) =>
        (inst.instrumentType === 'EQUITY' || inst.instrumentType === 'ETF') &&
        (!searchQuery.trim() ||
          inst.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inst.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [instruments, searchQuery]);

  const indexList = useMemo(() => {
    return instruments.filter((inst) => inst.instrumentType === 'INDEX');
  }, [instruments]);

  const mappedCandles: Candle[] = useMemo(() => {
    if (!chartData?.candles) return [];
    return chartData.candles.map((c) => ({
      time: c.time,
      timestamp: c.timestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume ?? 0,
    }));
  }, [chartData]);

  const currentSpotPrice =
    quote?.lastPrice ??
    chartData?.latestPrice ??
    instruments.find((i) => i.symbol === activeChartSymbol)?.referencePrice ??
    0;

  const equityPositions = profile.positions || [];
  const equityOrders = profile.orders || [];
  const currentHolding = equityPositions.find((p) => p.symbol === selectedSymbol);
  const watchlist = profile.watchlist || [];

  const handleSelectEquitySymbol = (sym: string) => {
    setSelectedSymbol(sym);
    setEqStopInput('');
    setOrderBanner(null);
  };

  // Submit Equity / ETF Order
  const handleEquitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderBanner(null);

    const execPrice =
      eqOrderType === 'MARKET'
        ? currentSpotPrice
        : Number(eqPriceInput) || currentSpotPrice;

    if (eqQty <= 0 || execPrice <= 0) {
      setOrderBanner({ type: 'error', text: 'Enter a valid positive share quantity and price.' });
      return;
    }

    setEqSubmitting(true);
    try {
      const res = await placeEquityOrder({
        symbol: selectedSymbol,
        name: quote?.name || selectedSymbol,
        action: eqAction,
        type: eqOrderType,
        quantity: eqQty,
        price: execPrice,
        stopLossPrice: eqStopInput ? Number(eqStopInput) : undefined,
        rationale: eqRationale.trim() || `${eqOrderType} ${eqAction} on ${selectedSymbol}`,
      });

      if (res.success) {
        if (res.order?.status === 'PENDING') {
          setOrderBanner({
            type: 'success',
            text: `LIMIT ${eqAction} for ${eqQty} sh of ${selectedSymbol} @ ₹${Number(res.order.price || execPrice).toFixed(2)} placed as PENDING (resting below market ₹${currentSpotPrice.toFixed(2)}).`,
          });
        } else {
          const filledPx = Number(res.order?.executionPrice ?? res.order?.price ?? execPrice);
          setOrderBanner({
            type: 'success',
            text: `${eqAction} ${eqQty} sh of ${selectedSymbol} @ ₹${filledPx.toFixed(2)} executed! Cash & Holdings updated.`,
          });
        }
        setEqRationale('');
      } else {
        setOrderBanner({
          type: 'error',
          text: res.error || 'Order rejected.',
        });
      }
    } finally {
      setEqSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId: string, sym: string) => {
    const res = await cancelEquityOrder(orderId);
    if (res.success) {
      setOrderBanner({
        type: 'success',
        text: `Pending order for ${sym} cancelled.`,
      });
    } else {
      setOrderBanner({
        type: 'error',
        text: res.error || 'Could not cancel order.',
      });
    }
  };

  // Submit Index Option Order
  const handleOptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderBanner(null);

    if (!selectedOption || !optionChain) {
      setOrderBanner({ type: 'error', text: 'Select a Call (CE) or Put (PE) strike from the Option Chain first.' });
      return;
    }

    setOptSubmitting(true);
    try {
      const res = await placeOptionOrder({
        underlying: optUnderlying,
        expiry: optionChain.expiryDate,
        strike: selectedOption.strike,
        optionType: selectedOption.optionType,
        action: optAction,
        lots: optLots,
        rationale:
          optRationale.trim() ||
          `${optAction} ${optLots} lot(s) ${optUnderlying} ${selectedOption.strike} ${selectedOption.optionType}`,
      });

      if (res.success && res.order) {
        const filledOptPx = Number(res.order.executionPrice || 0);
        setOrderBanner({
          type: 'success',
          text: `${res.order.action} ${res.order.lots} lot(s) (${res.order.quantity} qty) ${res.order.tradingSymbol} @ ₹${filledOptPx.toFixed(2)} executed!`,
        });
        setOptRationale('');
      } else if (res.success) {
        setOrderBanner({
          type: 'success',
          text: `${optAction} ${optLots} lot(s) ${optUnderlying} ${selectedOption.strike} ${selectedOption.optionType} executed!`,
        });
        setOptRationale('');
      } else {
        setOrderBanner({
          type: 'error',
          text: res.error || 'Option order rejected.',
        });
      }
    } finally {
      setOptSubmitting(false);
    }
  };

  const handleSquareOffOption = async (pos: {
    underlying: string;
    expiry: string;
    strike: number;
    optionType: 'CE' | 'PE';
    side: 'LONG' | 'SHORT';
    lots: number;
  }) => {
    setOrderBanner(null);
    const res = await placeOptionOrder({
      underlying: pos.underlying,
      expiry: pos.expiry,
      strike: pos.strike,
      optionType: pos.optionType,
      action: pos.side === 'LONG' ? 'SELL' : 'BUY',
      lots: pos.lots,
      rationale: 'Square-off open option position',
    });
    if (res.success) {
      const pnlText =
        res.order?.realizedPnL !== undefined
          ? ` (Realized P&L: ${res.order.realizedPnL >= 0 ? '+' : ''}₹${Number(res.order.realizedPnL).toFixed(2)})`
          : '';
      setOrderBanner({
        type: 'success',
        text: `Squared off ${pos.lots} lot(s) of ${pos.underlying} ${pos.strike} ${pos.optionType}${pnlText}!`,
      });
    } else {
      setOrderBanner({
        type: 'error',
        text: res.error || 'Failed to square off option position.',
      });
    }
  };

  const handleModeSwitch = (nextMode: TerminalMode) => {
    setOrderBanner(null);
    setMode(nextMode);
    if (nextMode === 'INDEX') {
      if (!['NIFTY', 'BANKNIFTY', 'SENSEX'].includes(selectedSymbol)) {
        setSelectedSymbol('NIFTY');
      }
    } else if (nextMode === 'EQUITY') {
      if (['NIFTY', 'BANKNIFTY', 'SENSEX'].includes(selectedSymbol)) {
        setSelectedSymbol('RELIANCE');
      }
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Mode Bar & Virtual Capital Header */}
      <section className="rounded-2xl bg-slate-900/95 border border-slate-800 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
            NSE / BSE Paper Trading Simulator • Simulated Funds Only
          </div>
          <div className="inline-flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            {[
              { id: 'EQUITY' as const, label: 'Equity Paper Trading' },
              { id: 'INDEX' as const, label: 'Index Paper Trading' },
              { id: 'OPTIONS' as const, label: 'Options Paper Trading' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleModeSwitch(m.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  mode === m.id
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-semibold">Available Paper Cash</div>
              <div className="text-sm sm:text-base font-black font-mono text-white">
                ₹{Math.round(profile.virtualCash).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadSymbolData(activeChartSymbol, timeframe)}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Data
          </button>
        </div>
      </section>

      {orderBanner && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-2 text-xs font-bold ${
            orderBanner.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
          }`}
        >
          <span className="flex items-center gap-2">
            {orderBanner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            {orderBanner.text}
          </span>
          <button
            type="button"
            onClick={() => setOrderBanner(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* =====================================================================
          MODE 1 & 2: EQUITY PAPER TRADING & INDEX PAPER TRADING
         ===================================================================== */}
      {(mode === 'EQUITY' || mode === 'INDEX') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Instrument Selector */}
          <aside className="lg:col-span-3 bg-slate-900/95 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              {mode === 'EQUITY' ? 'NSE Cash Equities & ETFs' : 'Indian Benchmark Indices'}
            </div>

            {mode === 'EQUITY' && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search symbol or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white"
                />
              </div>
            )}

            <div className="space-y-1.5 max-h-[540px] overflow-y-auto pr-1">
              {(mode === 'EQUITY' ? equityAndEtfList : indexList).map((inst) => {
                const active = inst.symbol === selectedSymbol;
                const starred = watchlist.includes(inst.symbol);
                return (
                  <div
                    key={inst.symbol}
                    onClick={() => handleSelectEquitySymbol(inst.symbol)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      active
                        ? 'bg-indigo-950/65 border-indigo-500 text-white'
                        : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs">{inst.symbol}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {inst.exchange}
                        </span>
                        {inst.instrumentType === 'ETF' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                            ETF
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{inst.name}</div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(inst.symbol);
                      }}
                      className="p-1 text-slate-500 hover:text-amber-400 cursor-pointer"
                      title="Toggle Watchlist"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          starred ? 'text-amber-400 fill-amber-400' : ''
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Center Chart & Quote Fundamentals */}
          <div className="lg:col-span-6 space-y-4">
            <InteractiveChart
              symbol={selectedSymbol}
              companyName={quote?.name || chartData?.name}
              candles={mappedCandles}
              timeframe={timeframe}
              onTimeframeChange={(tf) => setTimeframe(tf)}
              meta={chartData?.meta || quote?.meta}
              loading={chartLoading}
              errorMessage={chartError}
              latestPrice={quote?.lastPrice ?? chartData?.latestPrice}
              dayChange={quote?.dayChange ?? chartData?.change}
              dayChangePercent={quote?.dayChangePerc ?? chartData?.changePercent}
              height={400}
            />

            {/* Fundamentals & Session OHLC Snapshot Strip */}
            {quote && (
              <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">
                    {quote.name} ({quote.exchange}) — Key Snapshot
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Quote Status: {quote.meta.status} ({quote.meta.source})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Session OHLC</span>
                    <span className="font-mono text-[11px] text-white">
                      {quote.ohlc.open ?? '—'} / {quote.ohlc.high ?? '—'} / {quote.ohlc.low ?? '—'} /{' '}
                      {quote.ohlc.close ?? '—'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">52W Low – High</span>
                    <span className="font-mono text-[11px] text-white">
                      ₹{quote.week52Low ?? '—'} – ₹{quote.week52High ?? '—'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">P/E • P/B</span>
                    <span className="font-mono text-[11px] text-indigo-300 font-bold">
                      {quote.fundamentals.peRatio ?? '—'}x • {quote.fundamentals.pbRatio ?? '—'}x
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">ROE • Debt/Eq</span>
                    <span className="font-mono text-[11px] text-emerald-300 font-bold">
                      {quote.fundamentals.roe ? `${quote.fundamentals.roe}%` : '—'} •{' '}
                      {quote.fundamentals.debtToEquity ?? '—'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Order Execution Ticket (Equity vs Index Educational Gateway) */}
          <div className="lg:col-span-3">
            {mode === 'EQUITY' ? (
              <form
                onSubmit={handleEquitySubmit}
                className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white font-mono">
                    {selectedSymbol} Ticket
                  </span>
                  {currentHolding && (
                    <span className="text-[11px] font-mono text-emerald-400">
                      Held: {currentHolding.quantity} sh
                    </span>
                  )}
                </div>

                {/* BUY / SELL Toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEqAction('BUY')}
                    className={`py-2 rounded-xl text-xs font-black cursor-pointer ${
                      eqAction === 'BUY'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    onClick={() => setEqAction('SELL')}
                    className={`py-2 rounded-xl text-xs font-black cursor-pointer ${
                      eqAction === 'SELL'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    SELL
                  </button>
                </div>

                {/* Order Type */}
                <div className="grid grid-cols-3 gap-1.5">
                  {(['MARKET', 'LIMIT', 'STOP_LOSS'] as const).map((ot) => (
                    <button
                      key={ot}
                      type="button"
                      onClick={() => {
                        setEqOrderType(ot);
                        if (ot !== 'MARKET' && currentSpotPrice > 0) {
                          setEqPriceInput(String(currentSpotPrice));
                        }
                      }}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border cursor-pointer ${
                        eqOrderType === ot
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {ot.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Quantity (Shares)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={eqQty}
                    onChange={(e) => setEqQty(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white"
                  />
                </div>

                {eqOrderType !== 'MARKET' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      {eqOrderType === 'LIMIT' ? 'Limit Price (₹)' : 'Trigger / Execution Price (₹)'}
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={eqPriceInput}
                      onChange={(e) => setEqPriceInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Planned Stop-Loss (₹ — Recommended)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    placeholder="e.g. technical invalidation"
                    value={eqStopInput}
                    onChange={(e) => setEqStopInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Trade Rationale (Journal)
                  </label>
                  <input
                    type="text"
                    placeholder="Setup, S/R zone, or valuation thesis..."
                    value={eqRationale}
                    onChange={(e) => setEqRationale(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Est. Price:</span>
                    <span className="font-mono text-white">
                      ₹{(eqOrderType === 'MARKET' ? currentSpotPrice : Number(eqPriceInput) || currentSpotPrice).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-300">Order Value:</span>
                    <span className="font-mono text-indigo-300">
                      ₹
                      {Math.round(
                        eqQty *
                          (eqOrderType === 'MARKET'
                            ? currentSpotPrice
                            : Number(eqPriceInput) || currentSpotPrice)
                      ).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={eqSubmitting || currentSpotPrice <= 0}
                  className={`w-full py-3 rounded-xl font-black text-xs text-white shadow-lg cursor-pointer disabled:opacity-40 ${
                    eqAction === 'BUY'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {eqSubmitting
                    ? 'Submitting...'
                    : `Place Paper ${eqAction} (${selectedSymbol})`}
                </button>
              </form>
            ) : (
              /* INDEX PAPER TRADING EXPLANATION & GATEWAY CARD */
              <div className="bg-slate-900/95 border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Module 3 & 15 Rule: Indices Are Benchmarks</span>
                </div>

                <h3 className="text-base font-black text-white">
                  How to Paper Trade {selectedSymbol}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>{selectedSymbol}</strong> is a free-float weighted mathematical benchmark—not an issued company share. On NSE and BSE, you cannot buy “1 share of {selectedSymbol}” directly in a Demat cash order.
                </p>

                <div className="space-y-2.5 pt-1">
                  {quote?.fundamentals.relatedEtfSymbol && (
                    <button
                      type="button"
                      onClick={() => {
                        const etf = quote.fundamentals.relatedEtfSymbol!;
                        setMode('EQUITY');
                        setSelectedSymbol(etf);
                      }}
                      className="w-full p-3.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-left space-y-1 cursor-pointer"
                    >
                      <div className="text-xs font-black text-emerald-300 flex items-center justify-between">
                        <span>1. Trade Cash Index ETF ({quote.fundamentals.relatedEtfSymbol})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Unleveraged Demat delivery unit tracking {selectedSymbol} in the cash segment.
                      </p>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        selectedSymbol === 'NIFTY' ||
                        selectedSymbol === 'BANKNIFTY' ||
                        selectedSymbol === 'SENSEX'
                      ) {
                        setOptUnderlying(selectedSymbol);
                      }
                      setMode('OPTIONS');
                    }}
                    className="w-full p-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-left space-y-1 cursor-pointer"
                  >
                    <div className="text-xs font-black text-white flex items-center justify-between">
                      <span>2. Open {selectedSymbol} Options Chain</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[11px] text-indigo-100">
                      Paper-trade lot-sized Call (CE) & Put (PE) contracts across active expiries.
                    </p>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Open Cash Holdings & Recent Orders Strip directly inside Equity Mode */}
      {mode === 'EQUITY' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Open Cash Equity &amp; ETF Holdings ({equityPositions.length})
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Click Sell to load exit ticket
              </span>
            </div>

            {equityPositions.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">
                No cash holdings yet. Select any NSE stock or ETF on the left and place a Paper BUY order.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {equityPositions.map((pos) => {
                  const live = stocks.find((s) => s.symbol === pos.symbol);
                  const refPx = Number(
                    pos.symbol === selectedSymbol && currentSpotPrice > 0
                      ? currentSpotPrice
                      : live?.price ?? pos.currentPrice ?? pos.averageBuyPrice
                  );
                  const pnl = (refPx - Number(pos.averageBuyPrice || 0)) * pos.quantity;
                  return (
                    <div
                      key={pos.symbol}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold text-white flex items-center gap-2">
                          <span>{pos.symbol}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                            {pos.quantity} sh
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          Avg ₹{Number(pos.averageBuyPrice || 0).toFixed(2)} • Ref ₹{refPx.toFixed(2)} •{' '}
                          <span className={pnl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSymbol(pos.symbol);
                          setEqAction('SELL');
                          setEqOrderType('MARKET');
                          setEqQty(pos.quantity);
                          setOrderBanner(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-[11px] font-bold text-rose-200 hover:text-white transition-colors cursor-pointer"
                      >
                        Sell
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Recent &amp; Pending Equity Orders ({equityOrders.length})
              </h3>
            </div>

            {equityOrders.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">
                Your simulated equity order book is empty. Executed and resting limit orders appear here immediately.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {equityOrders.slice(0, 8).map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs font-mono"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold ${
                            ord.action === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {ord.action}
                        </span>
                        <span className="font-bold text-white">{ord.symbol}</span>
                        <span className="text-slate-400">
                          {ord.quantity} sh @ ₹{Number(ord.executionPrice ?? ord.price ?? 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {ord.type} • {ord.status}
                      </div>
                    </div>

                    {ord.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => handleCancelOrder(ord.id, ord.symbol)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-600 text-[10px] font-sans font-bold text-slate-200 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* =====================================================================
          MODE 3: INDEX OPTIONS PAPER TRADING
         ===================================================================== */}
      {mode === 'OPTIONS' && (
        <div className="space-y-6">
          {/* Underlying Index & Expiry Selector */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Underlying Index
                </label>
                <div className="inline-flex gap-1.5">
                  {(['NIFTY', 'BANKNIFTY', 'SENSEX'] as const).map((idxSym) => (
                    <button
                      key={idxSym}
                      type="button"
                      onClick={() => {
                        setOptUnderlying(idxSym);
                        setOptExpiry('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border cursor-pointer ${
                        optUnderlying === idxSym
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-950 text-slate-300 border-slate-800'
                      }`}
                    >
                      {idxSym}
                    </button>
                  ))}
                </div>
              </div>

              {optionChain && optionChain.availableExpiries.length > 0 && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Contract Expiry Date
                  </label>
                  <select
                    value={optExpiry || optionChain.expiryDate}
                    onChange={(e) => setOptExpiry(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white"
                  >
                    {optionChain.availableExpiries.map((exp) => (
                      <option key={exp} value={exp}>
                        {exp}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-[11px] text-amber-200 max-w-xl">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Educational Risk Reminder (SEBI Study): ~93% of retail F&O traders incur net losses. Observe Theta decay, IV, and lot-size leverage carefully in paper trading.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: Option Chain + Underlying Chart */}
            <div className="lg:col-span-8 space-y-6">
              <OptionChainTable
                chain={optionChain}
                loading={chainLoading}
                errorMessage={chainError}
                selectedContract={selectedOption}
                onSelectContract={(ticket) => setSelectedOption(ticket)}
              />

              <InteractiveChart
                symbol={optUnderlying}
                companyName={`${optUnderlying} Underlying Spot Reference`}
                candles={mappedCandles}
                timeframe={timeframe}
                onTimeframeChange={(tf) => setTimeframe(tf)}
                meta={chartData?.meta}
                loading={chartLoading}
                errorMessage={chartError}
                latestPrice={optionChain?.underlyingLtp ?? chartData?.latestPrice}
                height={320}
              />
            </div>

            {/* Right 4 Cols: Selected Option Contract Order Ticket + Open Option Positions */}
            <div className="lg:col-span-4 space-y-5">
              <form
                onSubmit={handleOptionSubmit}
                className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-indigo-400">
                      Index Options Paper Ticket
                    </div>
                    <div className="text-sm font-black font-mono text-white">
                      {selectedOption
                        ? `${optUnderlying} ${optionChain?.expiryDate} ${selectedOption.strike} ${selectedOption.optionType}`
                        : 'Select a Strike from Chain'}
                    </div>
                  </div>
                  {selectedOption && (
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                        selectedOption.optionType === 'CE'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {selectedOption.optionType}
                    </span>
                  )}
                </div>

                {/* BUY (Long Premium) vs SELL (Short Margin) */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOptAction('BUY')}
                    className={`py-2 rounded-xl text-xs font-black cursor-pointer ${
                      optAction === 'BUY'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    BUY (Long Option)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOptAction('SELL')}
                    className={`py-2 rounded-xl text-xs font-black cursor-pointer ${
                      optAction === 'SELL'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    SELL (Write Option)
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Number of Lots (1 Lot = {optionChain?.lotSize || 75} qty)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={optLots}
                    onChange={(e) => setOptLots(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white"
                  />
                </div>

                {selectedOption && optionChain && (() => {
                  const ltp = Number(selectedOption.contract.ltp || 0);
                  const qty = optLots * optionChain.lotSize;
                  const premiumValue = ltp * qty;
                  const spotRef = optionChain.underlyingLtp || selectedOption.strike;
                  const estSpanMargin = Math.round(Math.max(25000 * optLots, spotRef * qty * 0.025));
                  const estCharges = Math.round(
                    20 +
                      (optAction === 'SELL' ? premiumValue * 0.000625 : 0) +
                      20 * 0.18 +
                      premiumValue * 0.0005
                  );

                  return (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Contract Premium (LTP):</span>
                        <span className="font-mono font-bold text-white">₹{ltp.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Quantity ({optLots} lots):</span>
                        <span className="font-mono text-white">{qty} units</span>
                      </div>
                      {optAction === 'BUY' ? (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Upfront Premium Debit:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            ₹{Math.round(premiumValue).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Est. SPAN+Exposure Margin Block:</span>
                          <span className="font-mono font-bold text-amber-300">
                            ₹{estSpanMargin.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Est. Statutory & Brokerage Charges:</span>
                        <span className="font-mono text-slate-300">₹{estCharges}</span>
                      </div>

                      {selectedOption.contract.greeksAvailable && selectedOption.contract.greeks && (
                        <div className="pt-2 mt-2 border-t border-slate-800 grid grid-cols-4 gap-1 text-[10px] font-mono text-center">
                          <div>
                            <span className="text-slate-500 block">Δ Delta</span>
                            <span className="text-slate-200">{selectedOption.contract.greeks.delta ?? '—'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Θ Theta</span>
                            <span className="text-rose-300">{selectedOption.contract.greeks.theta ?? '—'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">ν Vega</span>
                            <span className="text-amber-300">{selectedOption.contract.greeks.vega ?? '—'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">IV%</span>
                            <span className="text-indigo-300">{selectedOption.contract.impliedVolatility ?? '—'}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Strategy / Hedge Rationale
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bullish breakout / protective put hedge..."
                    value={optRationale}
                    onChange={(e) => setOptRationale(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedOption || optSubmitting}
                  className={`w-full py-3 rounded-xl font-black text-xs text-white shadow-lg cursor-pointer disabled:opacity-40 ${
                    optAction === 'BUY'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {optSubmitting
                    ? 'Executing...'
                    : `Execute Paper ${optAction} (${optLots} ${optLots === 1 ? 'Lot' : 'Lots'})`}
                </button>
              </form>

              {/* Quick Open Options Positions Box */}
              <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Open Option Positions ({(profile.optionPositions || []).length})
                  </span>
                </div>

                {(profile.optionPositions || []).length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No open index option contracts yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {(profile.optionPositions || []).map((pos) => (
                      <div
                        key={pos.contractKey}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-mono font-bold text-white">
                            {pos.underlying} {pos.strike} {pos.optionType}{' '}
                            <span
                              className={
                                pos.side === 'LONG' ? 'text-emerald-400' : 'text-amber-300'
                              }
                            >
                              ({pos.side} {pos.lots}L)
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            Avg ₹{Number(pos.averagePrice || 0).toFixed(2)} • Qty {pos.quantity} • Exp {pos.expiry}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSquareOffOption(pos)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-white cursor-pointer"
                        >
                          Square Off
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
