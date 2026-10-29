import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  Sliders,
  DollarSign,
  BarChart2,
  Clock,
  Layers,
  ShieldCheck,
  Percent,
  Activity,
  Zap,
  Info
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { StockQuote, OrderAction, OrderType } from '../../types';
import { InteractiveChart } from '../charts/InteractiveChart';
import { soundEffects } from '../../utils/audio';

export const TradingTerminal: React.FC = () => {
  const {
    stocks,
    profile,
    executeTrade,
    setActiveGame,
    totalPortfolioValue,
    totalNetWorth
  } = useGame();

  // Selected Stock
  const [selectedStock, setSelectedStock] = useState<StockQuote>(stocks[0] || {} as StockQuote);
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');

  // Real Market Data state fetched from API
  const [liveStocks, setLiveStocks] = useState<StockQuote[]>(stocks);
  const [isFetchingApi, setIsFetchingApi] = useState(false);
  const [apiNotice, setApiNotice] = useState<string>('Live NSE Market API Connected (Simulated Feed)');

  // Fetch real market data from API on mount & periodically
  useEffect(() => {
    let isMounted = true;

    const fetchMarketData = async () => {
      try {
        setIsFetchingApi(true);
        const res = await fetch('/api/market/stocks');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            // Merge with local stocks
            setLiveStocks((prev) =>
              prev.map((s) => {
                const apiStock = data.find((d: any) => d.symbol === s.symbol);
                if (apiStock) {
                  return {
                    ...s,
                    price: apiStock.basePrice || s.price,
                    high52w: apiStock.high52w || s.high52w,
                    low52w: apiStock.low52w || s.low52w,
                    peRatio: apiStock.peRatio || s.peRatio,
                  };
                }
                return s;
              })
            );
            setApiNotice('Real-Time NSE Market Feed • Live Ticks Active');
          }
        }
      } catch (err) {
        // Fallback to real simulation
      } finally {
        if (isMounted) setIsFetchingApi(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Live price tick simulator to ensure market movements are vibrant & realistic
  useEffect(() => {
    const tickTimer = setInterval(() => {
      setLiveStocks((prev) =>
        prev.map((stock) => {
          const deltaPct = (Math.random() - 0.49) * 0.004; // 0.4% realistic tick
          const newPrice = Math.round((stock.price * (1 + deltaPct)) * 100) / 100;
          const change = Math.round((newPrice - (stock.price - stock.change)) * 100) / 100;
          const changePercent = Math.round(((change / (newPrice - change)) * 100) * 100) / 100;

          return {
            ...stock,
            price: newPrice,
            change,
            changePercent,
          };
        })
      );
    }, 2500);

    return () => clearInterval(tickTimer);
  }, []);

  // Sync selectedStock with liveStocks
  useEffect(() => {
    const live = liveStocks.find((s) => s.symbol === selectedStock.symbol);
    if (live && live.price !== selectedStock.price) {
      setSelectedStock(live);
    }
  }, [liveStocks, selectedStock.symbol]);

  // Order Ticket State
  const [action, setAction] = useState<OrderAction>('BUY');
  const [productType, setProductType] = useState<'CNC' | 'MIS'>('CNC'); // CNC = Delivery, MIS = Intraday (5x leverage)
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [quantity, setQuantity] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number>(selectedStock.price || 100);
  const [triggerPrice, setTriggerPrice] = useState<number>(Math.round((selectedStock.price * 0.96) * 100) / 100);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Terminal Bottom Tab
  const [activeConsoleTab, setActiveConsoleTab] = useState<'POSITIONS' | 'HOLDINGS' | 'ORDERS' | 'DEPTH'>('DEPTH');

  const executionPrice = orderType === 'MARKET' ? selectedStock.price : limitPrice;
  const leverageMultiplier = productType === 'MIS' ? 0.2 : 1.0; // 5x leverage for MIS intraday
  const totalOrderValue = quantity * executionPrice;
  const marginRequired = totalOrderValue * leverageMultiplier;

  // Brokerage & Taxes: ₹20 flat or 0.03%, STT 0.1%
  const brokerage = Math.min(20, Math.round(totalOrderValue * 0.0003 * 100) / 100);
  const stt = Math.round(totalOrderValue * 0.001 * 100) / 100;
  const gst = Math.round(brokerage * 0.18 * 100) / 100;
  const totalCharges = brokerage + stt + gst;

  const existingPosition = profile.positions.find((p) => p.symbol === selectedStock.symbol);

  const handleStockSelect = (stock: StockQuote) => {
    soundEffects.click();
    setSelectedStock(stock);
    setLimitPrice(stock.price);
    setTriggerPrice(Math.round((stock.price * 0.96) * 100) / 100);
    setFeedbackMsg(null);
  };

  const handleQuickQty = (percent: number) => {
    soundEffects.click();
    if (action === 'BUY') {
      const availableFunds = profile.virtualCash / leverageMultiplier;
      const maxAffordable = Math.floor((availableFunds * percent) / executionPrice);
      setQuantity(Math.max(1, maxAffordable));
    } else {
      if (existingPosition) {
        const qty = Math.max(1, Math.floor(existingPosition.quantity * percent));
        setQuantity(qty);
      }
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setFeedbackMsg({ type: 'error', text: 'Please enter a valid positive quantity.' });
      return;
    }

    if (action === 'BUY' && marginRequired > profile.virtualCash) {
      setFeedbackMsg({
        type: 'error',
        text: `Insufficient margin. Required: ₹${marginRequired.toLocaleString('en-IN')}, Available Cash: ₹${profile.virtualCash.toLocaleString('en-IN')}`
      });
      return;
    }

    if (action === 'SELL' && productType === 'CNC' && (!existingPosition || existingPosition.quantity < quantity)) {
      setFeedbackMsg({
        type: 'error',
        text: `You only hold ${existingPosition?.quantity || 0} delivery shares of ${selectedStock.symbol}. Cannot sell ${quantity}.`
      });
      return;
    }

    const success = executeTrade({
      symbol: selectedStock.symbol,
      name: selectedStock.name,
      action,
      type: orderType,
      quantity,
      price: executionPrice,
      stopLossPrice: orderType === 'STOP_LOSS' ? triggerPrice : undefined,
      rationale: `${productType} ${orderType} ${action} via Real-Time Trading Terminal`,
      emotionalState: 'CALM',
    });

    if (success) {
      soundEffects.cashTrade();
      setFeedbackMsg({
        type: 'success',
        text: `Order Executed: ${action} ${quantity} ${selectedStock.symbol} @ ₹${executionPrice.toFixed(2)} (${productType})`
      });
    }
  };

  // Filtered Watchlist
  const filteredStocks = useMemo(() => {
    return liveStocks.filter((s) => {
      const matchSearch =
        s.symbol.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(stockSearchQuery.toLowerCase());
      const matchSector = sectorFilter === 'ALL' || s.sector.toUpperCase().includes(sectorFilter.toUpperCase());
      return matchSearch && matchSector;
    });
  }, [liveStocks, stockSearchQuery, sectorFilter]);

  // Simulated Level 2 Market Depth (DOM) for selectedStock
  const marketDepth = useMemo(() => {
    const p = selectedStock.price || 1000;
    const bids = [
      { orders: 12, qty: 350, price: Math.round((p - 0.25) * 100) / 100 },
      { orders: 8, qty: 820, price: Math.round((p - 0.50) * 100) / 100 },
      { orders: 15, qty: 1400, price: Math.round((p - 0.85) * 100) / 100 },
      { orders: 22, qty: 2100, price: Math.round((p - 1.20) * 100) / 100 },
      { orders: 34, qty: 3800, price: Math.round((p - 1.75) * 100) / 100 },
    ];
    const asks = [
      { price: Math.round((p + 0.25) * 100) / 100, qty: 420, orders: 9 },
      { price: Math.round((p + 0.60) * 100) / 100, qty: 950, orders: 14 },
      { price: Math.round((p + 0.95) * 100) / 100, qty: 1650, orders: 19 },
      { price: Math.round((p + 1.40) * 100) / 100, qty: 2400, orders: 28 },
      { price: Math.round((p + 2.10) * 100) / 100, qty: 4100, orders: 41 },
    ];
    const totalBidQty = bids.reduce((acc, b) => acc + b.qty, 0);
    const totalAskQty = asks.reduce((acc, a) => acc + a.qty, 0);
    return { bids, asks, totalBidQty, totalAskQty };
  }, [selectedStock.price]);

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-20 text-slate-100 select-none">
      {/* ==================================================================== */}
      {/* 1. TOP MARKET INDICES TAPE                                           */}
      {/* ==================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-mono">
        <div className="flex items-center gap-4 overflow-x-auto py-0.5">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-slate-400">NIFTY 50</span>
            <span className="text-white">24,852.40</span>
            <span className="text-emerald-400 font-bold">+112.50 (+0.45%)</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-slate-400">SENSEX</span>
            <span className="text-white">81,418.15</span>
            <span className="text-emerald-400 font-bold">+340.20 (+0.42%)</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-slate-400">BANK NIFTY</span>
            <span className="text-white">51,240.80</span>
            <span className="text-rose-400 font-bold">-85.40 (-0.17%)</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">INDIA VIX</span>
            <span className="text-amber-300">12.85 (-3.2%)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
            NSE Live Feed
          </span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. MAIN 3-PANEL TRADING TERMINAL WORKBENCH                           */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ------------------------------------------------------------------ */}
        {/* LEFT COLUMN (3 COLS): SEARCHABLE MARKET WATCHLIST                   */}
        {/* ------------------------------------------------------------------ */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Watchlist ({filteredStocks.length})
              </span>
            </div>
            {isFetchingApi && <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={stockSearchQuery}
              onChange={(e) => setStockSearchQuery(e.target.value)}
              placeholder="Search RELIANCE, TCS, INFY..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Watchlist Table */}
          <div className="space-y-1 max-h-[560px] overflow-y-auto pr-1">
            {filteredStocks.map((stock) => {
              const isSelected = selectedStock.symbol === stock.symbol;
              const isUp = stock.change >= 0;

              return (
                <div
                  key={stock.symbol}
                  onClick={() => handleStockSelect(stock)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500/80 shadow-md'
                      : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold font-mono text-white">{stock.symbol}</span>
                      <span className="text-[10px] text-slate-500 uppercase">{stock.exchange}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5 max-w-[130px]">
                      {stock.name}
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-white">
                      ₹{stock.price.toFixed(2)}
                    </div>
                    <div
                      className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${
                        isUp ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                      <span>{isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* CENTER COLUMN (6 COLS): CHART + LEVEL 2 DEPTH (DOM)                 */}
        {/* ------------------------------------------------------------------ */}
        <div className="lg:col-span-6 space-y-4">
          {/* Active Stock Quote Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white font-mono">
                    {selectedStock.symbol}
                  </h2>
                  <span className="text-xs text-slate-400">({selectedStock.exchange}: NSE)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {selectedStock.sector}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">{selectedStock.name}</div>
              </div>

              <div className="text-left sm:text-right font-mono">
                <div className="text-2xl font-black text-white">
                  ₹{selectedStock.price.toFixed(2)}
                </div>
                <div
                  className={`text-xs font-bold ${
                    selectedStock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {selectedStock.change >= 0 ? '+' : ''}₹{selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)
                </div>
              </div>
            </div>

            {/* Micro Fundamentals Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">P/E RATIO</span>
                <span className="text-white font-bold">{selectedStock.peRatio}x</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ROE</span>
                <span className="text-emerald-400 font-bold">{selectedStock.roe}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">52W HIGH</span>
                <span className="text-slate-300 font-bold">₹{selectedStock.high52w}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">52W LOW</span>
                <span className="text-slate-300 font-bold">₹{selectedStock.low52w}</span>
              </div>
            </div>
          </div>

          {/* Interactive Candlestick Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
            <InteractiveChart
              symbol={selectedStock.symbol}
              candles={selectedStock.historicalCandles}
              height={320}
            />
          </div>

          {/* Bottom Tabs: Level 2 Depth (DOM) vs Open Positions */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveConsoleTab('DEPTH')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeConsoleTab === 'DEPTH'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Level 2 Market Depth (DOM)
                </button>
                <button
                  onClick={() => setActiveConsoleTab('POSITIONS')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeConsoleTab === 'POSITIONS'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Open Positions</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-emerald-400">
                    {profile.positions.length}
                  </span>
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-mono">
                VWAP: ₹{(selectedStock.price * 0.998).toFixed(2)}
              </span>
            </div>

            {/* LEVEL 2 MARKET DEPTH (DOM) TABLE */}
            {activeConsoleTab === 'DEPTH' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="grid grid-cols-2 gap-4">
                  {/* BID SIDE (GREEN) */}
                  <div className="space-y-1">
                    <div className="grid grid-cols-3 text-[10px] text-slate-400 pb-1 border-b border-slate-800">
                      <span>Orders</span>
                      <span>Qty</span>
                      <span className="text-right text-emerald-400">Bid Price</span>
                    </div>
                    {marketDepth.bids.map((b, i) => (
                      <div key={i} className="grid grid-cols-3 text-[11px] py-0.5 items-center">
                        <span className="text-slate-400">{b.orders}</span>
                        <span className="text-slate-300">{b.qty}</span>
                        <span className="text-right text-emerald-400 font-bold">₹{b.price.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="pt-1 border-t border-slate-800 flex justify-between text-[11px] text-emerald-300 font-bold">
                      <span>Total Bid Qty:</span>
                      <span>{marketDepth.totalBidQty.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* ASK SIDE (RED) */}
                  <div className="space-y-1">
                    <div className="grid grid-cols-3 text-[10px] text-slate-400 pb-1 border-b border-slate-800">
                      <span className="text-rose-400">Ask Price</span>
                      <span>Qty</span>
                      <span className="text-right">Orders</span>
                    </div>
                    {marketDepth.asks.map((a, i) => (
                      <div key={i} className="grid grid-cols-3 text-[11px] py-0.5 items-center">
                        <span className="text-rose-400 font-bold">₹{a.price.toFixed(2)}</span>
                        <span className="text-slate-300">{a.qty}</span>
                        <span className="text-right text-slate-400">{a.orders}</span>
                      </div>
                    ))}
                    <div className="pt-1 border-t border-slate-800 flex justify-between text-[11px] text-rose-300 font-bold">
                      <span>Total Ask Qty:</span>
                      <span>{marketDepth.totalAskQty.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OPEN POSITIONS TABLE */}
            {activeConsoleTab === 'POSITIONS' && (
              <div className="space-y-2">
                {profile.positions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No active open positions. Place an order to start trading!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profile.positions.map((pos) => {
                      const live = liveStocks.find((s) => s.symbol === pos.symbol);
                      const currentP = live ? live.price : pos.currentPrice;
                      const pnl = Math.round((currentP - pos.averageBuyPrice) * pos.quantity * 100) / 100;
                      const pnlPct = Math.round(((currentP - pos.averageBuyPrice) / pos.averageBuyPrice) * 10000) / 100;

                      return (
                        <div
                          key={pos.symbol}
                          className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono"
                        >
                          <div>
                            <div className="font-bold text-white">{pos.symbol}</div>
                            <div className="text-[11px] text-slate-400">
                              {pos.quantity} Qty • Avg ₹{pos.averageBuyPrice.toFixed(2)}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className={`font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)} ({pnlPct}%)
                            </div>
                            <div className="text-[10px] text-slate-400">LTP: ₹{currentP.toFixed(2)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* RIGHT COLUMN (3 COLS): PROFESSIONAL ORDER TICKET CONSOLE            */}
        {/* ------------------------------------------------------------------ */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-black text-white text-base font-mono">Order Ticket</h3>
              <p className="text-[10px] text-slate-400">Direct Exchange Execution</p>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 block uppercase">Paper Margin</span>
              <span className="text-xs font-bold text-emerald-400">
                ₹{profile.virtualCash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-4">
            {/* Buy / Sell Toggle */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setAction('BUY')}
                className={`py-2 rounded-xl font-black text-xs transition-all ${
                  action === 'BUY'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setAction('SELL')}
                className={`py-2 rounded-xl font-black text-xs transition-all ${
                  action === 'SELL'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                SELL
              </button>
            </div>

            {/* Product Type: Delivery (CNC) vs Intraday (MIS) */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Product Type
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setProductType('CNC')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    productType === 'CNC'
                      ? 'bg-indigo-950 border-indigo-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div>Delivery (CNC)</div>
                  <div className="text-[10px] opacity-70">1x Capital</div>
                </button>

                <button
                  type="button"
                  onClick={() => setProductType('MIS')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    productType === 'MIS'
                      ? 'bg-indigo-950 border-indigo-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div>Intraday (MIS)</div>
                  <div className="text-[10px] text-amber-300 font-bold">5x Leverage</div>
                </button>
              </div>
            </div>

            {/* Order Type: Market vs Limit vs SL */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Order Type
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {(['MARKET', 'LIMIT', 'STOP_LOSS'] as OrderType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setOrderType(t)}
                    className={`py-1.5 rounded-xl border text-center text-[11px] font-bold transition-all ${
                      orderType === t
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {t === 'STOP_LOSS' ? 'SL' : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Quantity (Shares)</span>
                <span className="font-mono font-bold text-indigo-400">{quantity}</span>
              </div>
              <input
                type="number"
                min={1}
                step={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />

              {/* Quick Qty Percent Buttons */}
              <div className="flex gap-1 pt-1 text-[10px] font-mono">
                {[0.25, 0.50, 0.75, 1.0].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleQuickQty(pct)}
                    className="flex-1 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300"
                  >
                    {pct === 1.0 ? 'MAX' : `${pct * 100}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Inputs if Limit or SL */}
            {orderType === 'LIMIT' && (
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block">Limit Price (₹)</label>
                <input
                  type="number"
                  step={0.05}
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>
            )}

            {orderType === 'STOP_LOSS' && (
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block">Trigger Price (₹)</label>
                <input
                  type="number"
                  step={0.05}
                  value={triggerPrice}
                  onChange={(e) => setTriggerPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>
            )}

            {/* Margin Calculation & Breakdown */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Order Value:</span>
                <span className="text-white font-bold">₹{totalOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Margin Needed:</span>
                <span className="text-amber-300 font-bold">₹{marginRequired.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[10px] pt-1 border-t border-slate-800/80">
                <span>Brokerage + STT:</span>
                <span>₹{totalCharges.toFixed(2)}</span>
              </div>
            </div>

            {/* Order Execution CTA */}
            <button
              type="submit"
              className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all shadow-xl cursor-pointer ${
                action === 'BUY'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              }`}
            >
              {action} {quantity} {selectedStock.symbol} @ ₹{executionPrice.toFixed(2)}
            </button>
          </form>

          {feedbackMsg && (
            <div
              className={`p-3 rounded-xl border text-xs leading-relaxed text-center font-medium ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-600 text-rose-300'
              }`}
            >
              {feedbackMsg.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
