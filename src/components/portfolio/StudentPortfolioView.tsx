import React, { useState } from 'react';
import {
  PieChart,
  Wallet,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertCircle,
  Coins,
  ArrowRight,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  FileText,
  Activity,
  Layers,
  HelpCircle,
  BarChart2,
  Trash2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useClassroom } from '../../context/ClassroomContext';
import { StockQuote, Position, Order } from '../../types';
import { soundEffects } from '../../utils/audio';

interface StudentPortfolioViewProps {
  onNavigateToTrade: () => void;
  onNavigateToChart?: (symbol: string) => void;
}

type PortfolioTab =
  | 'OVERVIEW'
  | 'HOLDINGS'
  | 'OPEN_ORDERS'
  | 'ORDER_HISTORY'
  | 'TRANSACTIONS'
  | 'PERFORMANCE'
  | 'ALLOCATION'
  | 'WATCHLIST'
  | 'JOURNAL';

export const StudentPortfolioView: React.FC<StudentPortfolioViewProps> = ({
  onNavigateToTrade,
  onNavigateToChart,
}) => {
  const {
    profile,
    stocks,
    executeTrade,
    toggleWatchlist,
    totalPortfolioValue,
    totalNetWorth,
  } = useGame();
  const { currentUser } = useClassroom();

  const [activeTab, setActiveTab] = useState<PortfolioTab>('OVERVIEW');
  const [selectedStockDetail, setSelectedStockDetail] = useState<StockQuote | null>(null);
  const [tradeActionModal, setTradeActionModal] = useState<{
    open: boolean;
    stock: StockQuote;
    action: 'BUY' | 'SELL';
  } | null>(null);
  const [tradeQuantity, setTradeQuantity] = useState<number>(5);
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP_LOSS'>('MARKET');
  const [limitPrice, setLimitPrice] = useState<number>(0);
  const [tradeRationale, setTradeRationale] = useState<string>('Technical breakout setup');
  const [tradeEmotion, setTradeEmotion] = useState<'CALM' | 'FOMO' | 'FEARFUL' | 'GREEDY' | 'REVENGE'>('CALM');
  const [orderFeedback, setOrderFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active holdings calculations
  const totalInvested = profile.positions.reduce((sum, p) => sum + (p.investedValue || 0), 0);
  const totalUnrealizedPnL = totalPortfolioValue - totalInvested;
  const totalUnrealizedPnLPercent =
    totalInvested > 0 ? Math.round((totalUnrealizedPnL / totalInvested) * 10000) / 100 : 0;

  // Realized P&L from closed positions in journal
  const totalRealizedPnL = profile.journal.reduce((sum, j) => sum + (j.pnl || 0), 0);
  const totalPnLCombined = totalUnrealizedPnL + totalRealizedPnL;
  const initialBaseCapital = 100000;
  const overallReturnPercent =
    initialBaseCapital > 0 ? Math.round(((totalNetWorth - initialBaseCapital) / initialBaseCapital) * 10000) / 100 : 0;

  // Today's change weighted by active holdings
  const todayHoldingsChangeRupees = profile.positions.reduce((acc, pos) => {
    const live = stocks.find((s) => s.symbol === pos.symbol);
    const dayChange = live ? live.change : 0;
    return acc + dayChange * pos.quantity;
  }, 0);
  const todayHoldingsChangePercent =
    totalPortfolioValue > 0 ? Math.round((todayHoldingsChangeRupees / totalPortfolioValue) * 10000) / 100 : 0;

  // Sector Allocation Map
  const sectorWeights: Record<string, number> = {};
  profile.positions.forEach((pos) => {
    const stockInfo = stocks.find((s) => s.symbol === pos.symbol);
    const sector = stockInfo?.sector || 'General';
    const val = pos.quantity * (stockInfo?.price || pos.currentPrice);
    sectorWeights[sector] = (sectorWeights[sector] || 0) + val;
  });

  // Watchlist items
  const userWatchlistSymbols = profile.watchlist || ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'];
  const watchlistStocks = stocks.filter((s) => userWatchlistSymbols.includes(s.symbol));

  // Orders separation: Open (Pending) vs History
  const openOrders = profile.orders.filter((o) => o.status === 'PENDING');
  const closedOrders = profile.orders.filter((o) => o.status !== 'PENDING');

  // Trade Execution Workflow
  const handleOpenTradeModal = (stock: StockQuote, action: 'BUY' | 'SELL') => {
    soundEffects.click();
    setTradeActionModal({ open: true, stock, action });
    setTradeQuantity(5);
    setLimitPrice(stock.price);
    setOrderType('MARKET');
    setOrderFeedback(null);
  };

  const handleConfirmTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeActionModal) return;

    const { stock, action } = tradeActionModal;
    const execPrice = orderType === 'MARKET' ? stock.price : limitPrice;
    const estCost = tradeQuantity * execPrice;
    const simulatedFee = Math.round(estCost * 0.0005 * 100) / 100;
    const totalRequired = estCost + simulatedFee;

    if (action === 'BUY' && totalRequired > profile.virtualCash) {
      setOrderFeedback({
        type: 'error',
        text: `Insufficient virtual cash. Required: ₹${totalRequired.toLocaleString('en-IN')}, Available: ₹${profile.virtualCash.toLocaleString('en-IN')}`,
      });
      return;
    }

    const currentHoldings = profile.positions.find((p) => p.symbol === stock.symbol);
    if (action === 'SELL' && (!currentHoldings || currentHoldings.quantity < tradeQuantity)) {
      setOrderFeedback({
        type: 'error',
        text: `Insufficient shares. You only own ${currentHoldings?.quantity || 0} shares of ${stock.symbol}.`,
      });
      return;
    }

    const success = executeTrade({
      symbol: stock.symbol,
      name: stock.name,
      action,
      type: orderType,
      quantity: tradeQuantity,
      price: execPrice,
      rationale: tradeRationale,
      emotionalState: tradeEmotion,
    });

    if (success) {
      setOrderFeedback({
        type: 'success',
        text: `Successfully executed ${action} for ${tradeQuantity} shares of ${stock.symbol} at ₹${execPrice}.`,
      });
      setTimeout(() => {
        setTradeActionModal(null);
        setOrderFeedback(null);
      }, 1200);
    } else {
      setOrderFeedback({
        type: 'error',
        text: 'Order execution failed. Please verify cash or position availability.',
      });
    }
  };

  const navTabs: { id: PortfolioTab; label: string; count?: number }[] = [
    { id: 'OVERVIEW', label: '1. Overview' },
    { id: 'HOLDINGS', label: '2. Holdings', count: profile.positions.length },
    { id: 'OPEN_ORDERS', label: '3. Open Orders', count: openOrders.length },
    { id: 'ORDER_HISTORY', label: '4. Order History', count: closedOrders.length },
    { id: 'TRANSACTIONS', label: '5. Transactions', count: profile.orders.length },
    { id: 'PERFORMANCE', label: '6. Performance' },
    { id: 'ALLOCATION', label: '7. Allocation' },
    { id: 'WATCHLIST', label: '8. Watchlist', count: watchlistStocks.length },
    { id: 'JOURNAL', label: '9. Trading Journal', count: profile.journal.length },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Wallet className="w-4 h-4" />
            <span>AUTHORITATIVE PAPER TRADING PORTFOLIO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Portfolio Management Station
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time tracking of cash balances, holdings, realized/unrealized returns, and disciplined trade journals on NSE simulated equities.
          </p>
        </div>

        <button
          onClick={onNavigateToTrade}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 cursor-pointer self-start sm:self-auto"
        >
          <span>Open Trading Terminal</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Net Worth */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-1 shadow">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Total Net Worth</span>
            <HelpCircle className="w-3.5 h-3.5 opacity-60" title="Cash Reserve + Current Market Value of all active holdings" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-white">
            ₹{Math.round(totalNetWorth).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400">
            Initial Capital: ₹{initialBaseCapital.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Available Virtual Cash */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-1 shadow">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Available Cash</span>
            <span className="text-[10px] text-emerald-400 font-bold">Unencumbered</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
            ₹{Math.round(profile.virtualCash).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400">
            Liquid Buying Power
          </div>
        </div>

        {/* Total Unrealized P&L */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-1 shadow">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Unrealized P&L</span>
            <span className={`text-[10px] font-bold ${totalUnrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalUnrealizedPnLPercent >= 0 ? '+' : ''}{totalUnrealizedPnLPercent}%
            </span>
          </div>
          <div
            className={`text-xl sm:text-2xl font-black font-mono flex items-center gap-1 ${
              totalUnrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalUnrealizedPnL >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            <span>
              {totalUnrealizedPnL >= 0 ? '+' : ''}₹{Math.abs(Math.round(totalUnrealizedPnL)).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            Invested Value: ₹{Math.round(totalInvested).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Realized P&L */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-1 shadow">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Realized P&L</span>
            <span className="text-[10px] text-indigo-400 font-bold">Booked Gains</span>
          </div>
          <div
            className={`text-xl sm:text-2xl font-black font-mono ${
              totalRealizedPnL >= 0 ? 'text-indigo-400' : 'text-rose-400'
            }`}
          >
            {totalRealizedPnL >= 0 ? '+' : ''}₹{Math.round(totalRealizedPnL).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400">
            Net Closed Trades Profit
          </div>
        </div>
      </div>

      {/* 9-Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-950 p-1.5 rounded-2xl border border-slate-800 scrollbar-none">
        {navTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              soundEffects.click();
              setActiveTab(t.id);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === t.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span>{t.label}</span>
            {t.count !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === t.id ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: OVERVIEW                                                      */}
      {/* ==================================================================== */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Quick Metrics & Market Status */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold">Market Data Feed Status:</span>
              <span className="text-slate-400 font-mono">Historical NSE Market Feed (Delayed ~15m simulated)</span>
            </div>
            <div className="text-slate-400">
              Overall Return: <strong className="text-emerald-400">{overallReturnPercent}%</strong> • Today: <strong className={todayHoldingsChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{todayHoldingsChangePercent >= 0 ? '+' : ''}{todayHoldingsChangePercent}%</strong>
            </div>
          </div>

          {/* Holdings Snapshot and Sector Allocation Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Holdings Mini Table */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Active Positions Summary</h3>
                  <p className="text-xs text-slate-400">{profile.positions.length} holdings currently open</p>
                </div>
                <button
                  onClick={() => setActiveTab('HOLDINGS')}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>View All Holdings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {profile.positions.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="text-3xl">💼</div>
                  <div className="text-sm font-bold text-slate-300">No active stock holdings yet</div>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Search and buy shares using your ₹{profile.virtualCash.toLocaleString('en-IN')} virtual cash.
                  </p>
                  <button
                    onClick={onNavigateToTrade}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                  >
                    Place First Order
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {profile.positions.slice(0, 5).map((pos) => {
                    const live = stocks.find((s) => s.symbol === pos.symbol);
                    const currentP = live ? live.price : pos.currentPrice;
                    const curVal = pos.quantity * currentP;
                    const pnl = curVal - pos.investedValue;
                    const pnlPct = pos.investedValue > 0 ? Math.round((pnl / pos.investedValue) * 10000) / 100 : 0;

                    return (
                      <div
                        key={pos.symbol}
                        className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center font-black text-xs text-indigo-300">
                            {pos.symbol.slice(0, 3)}
                          </div>
                          <div>
                            <div className="text-xs font-black text-white">{pos.symbol}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {pos.quantity} shares @ ₹{pos.averageBuyPrice}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-white">
                            ₹{Math.round(curVal).toLocaleString('en-IN')}
                          </div>
                          <div
                            className={`text-[10px] font-mono font-black ${
                              pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {pnl >= 0 ? '+' : ''}₹{Math.round(pnl).toLocaleString('en-IN')} ({pnlPct}%)
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sector Diversification Snapshot */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black text-white">Sector Allocation</h3>
                <p className="text-xs text-slate-400">NCFM Rule: Max 10% risk per sector</p>

                <div className="space-y-3 mt-4">
                  {Object.keys(sectorWeights).length === 0 ? (
                    <div className="text-xs text-slate-400 py-6 text-center">
                      100% Cash Reserve (₹{profile.virtualCash.toLocaleString('en-IN')})
                    </div>
                  ) : (
                    Object.entries(sectorWeights).map(([sector, amount]) => {
                      const pct = totalPortfolioValue > 0 ? Math.round((amount / totalPortfolioValue) * 100) : 0;
                      return (
                        <div key={sector} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-300 font-medium">{sector}</span>
                            <span className="text-white font-mono font-bold">{pct}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Balanced allocation prevents catastrophic drawdowns during sector rotations.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: HOLDINGS TABLE & COMPANY DETAIL MODAL                         */}
      {/* ==================================================================== */}
      {activeTab === 'HOLDINGS' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-white">Your Stock Holdings</h3>
                <p className="text-xs text-slate-400">
                  Click on any holding to view company details, technical metrics, or place buy/sell orders.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400 font-mono">
                {profile.positions.length} Total Open Positions
              </span>
            </div>

            {profile.positions.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="text-3xl">📉</div>
                <div className="text-sm font-bold text-white">No Holdings Found</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  You do not have any open stock positions. Head to the Trading Terminal to search and buy NSE shares.
                </p>
                <button
                  onClick={onNavigateToTrade}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Explore Stocks & Trade
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-2">Instrument</th>
                    <th className="py-3 px-2 text-right">Qty</th>
                    <th className="py-3 px-2 text-right">Avg Price</th>
                    <th className="py-3 px-2 text-right">LTP</th>
                    <th className="py-3 px-2 text-right">Invested</th>
                    <th className="py-3 px-2 text-right">Current Value</th>
                    <th className="py-3 px-2 text-right">Unrealized P&L</th>
                    <th className="py-3 px-2 text-right">Weight</th>
                    <th className="py-3 px-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {profile.positions.map((pos) => {
                    const live = stocks.find((s) => s.symbol === pos.symbol);
                    const currentPrice = live ? live.price : pos.currentPrice;
                    const curVal = pos.quantity * currentPrice;
                    const pnl = curVal - pos.investedValue;
                    const pnlPct =
                      pos.investedValue > 0 ? Math.round((pnl / pos.investedValue) * 10000) / 100 : 0;
                    const weightPct =
                      totalPortfolioValue > 0 ? Math.round((curVal / totalPortfolioValue) * 1000) / 10 : 0;

                    return (
                      <tr key={pos.symbol} className="hover:bg-slate-950/50 transition-colors">
                        <td className="py-3.5 px-2 font-sans">
                          <button
                            onClick={() => {
                              if (live) setSelectedStockDetail(live);
                            }}
                            className="text-left font-black text-indigo-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <div className="text-sm font-bold">{pos.symbol}</div>
                            <div className="text-[10px] text-slate-400 font-normal truncate max-w-[140px]">
                              {pos.name}
                            </div>
                          </button>
                        </td>
                        <td className="py-3.5 px-2 text-right text-white font-bold">{pos.quantity}</td>
                        <td className="py-3.5 px-2 text-right text-slate-300">₹{pos.averageBuyPrice}</td>
                        <td className="py-3.5 px-2 text-right text-white font-bold">₹{currentPrice}</td>
                        <td className="py-3.5 px-2 text-right text-slate-300">
                          ₹{Math.round(pos.investedValue).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-2 text-right text-white font-bold">
                          ₹{Math.round(curVal).toLocaleString('en-IN')}
                        </td>
                        <td
                          className={`py-3.5 px-2 text-right font-black ${
                            pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          <div>
                            {pnl >= 0 ? '+' : ''}₹{Math.round(pnl).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px]">
                            ({pnlPct >= 0 ? '+' : ''}{pnlPct}%)
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-right text-slate-300 font-bold">{weightPct}%</td>
                        <td className="py-3.5 px-2 text-center font-sans">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                if (live) handleOpenTradeModal(live, 'BUY');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                            >
                              Buy
                            </button>
                            <button
                              onClick={() => {
                                if (live) handleOpenTradeModal(live, 'SELL');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                            >
                              Sell
                            </button>
                            {onNavigateToChart && (
                              <button
                                onClick={() => onNavigateToChart(pos.symbol)}
                                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                title="Open in Chart Lab"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: OPEN ORDERS                                                   */}
      {/* ==================================================================== */}
      {activeTab === 'OPEN_ORDERS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white">Pending Limit & Stop Loss Orders</h3>
              <p className="text-xs text-slate-400">
                Orders waiting for simulated trigger price execution on the order book.
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 font-bold">
              {openOrders.length} Pending
            </span>
          </div>

          {openOrders.length === 0 ? (
            <div className="text-center py-14 space-y-2 text-slate-400">
              <Clock className="w-8 h-8 mx-auto opacity-50" />
              <div className="text-xs font-bold text-slate-300">No Open Orders</div>
              <p className="text-[11px] max-w-xs mx-auto">
                All limit and market orders have been filled or executed.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {openOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">{order.symbol}</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          order.action === 'BUY'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {order.action} {order.type}
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono">STATUS: PENDING</span>
                    </div>
                    <div className="text-xs text-slate-300 font-mono">
                      Qty: {order.quantity} • Target Limit: ₹{order.price}
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-xs font-mono text-slate-400">
                      {new Date(order.timestamp).toLocaleTimeString()}
                    </div>
                    <button
                      onClick={() => {
                        // simulated cancellation
                        soundEffects.click();
                      }}
                      className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: ORDER HISTORY                                                 */}
      {/* ==================================================================== */}
      {activeTab === 'ORDER_HISTORY' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 animate-fadeIn overflow-x-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-black text-white">Completed Order History</h3>
              <p className="text-xs text-slate-400">Chronological history of all executed market and limit orders.</p>
            </div>
            <span className="text-xs font-mono text-slate-400 font-bold">{closedOrders.length} Orders</span>
          </div>

          {closedOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">No executed orders recorded yet.</div>
          ) : (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-sans font-bold">
                  <th className="py-2.5 px-2">Time</th>
                  <th className="py-2.5 px-2">Instrument</th>
                  <th className="py-2.5 px-2">Type</th>
                  <th className="py-2.5 px-2 text-right">Qty</th>
                  <th className="py-2.5 px-2 text-right">Price</th>
                  <th className="py-2.5 px-2 text-right">Total</th>
                  <th className="py-2.5 px-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {closedOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-950/40">
                    <td className="py-3 px-2 text-slate-400 text-[11px]">
                      {new Date(ord.timestamp).toLocaleDateString()} {new Date(ord.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-2 font-bold font-sans text-white">{ord.symbol}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          ord.action === 'BUY'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {ord.action}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-white font-bold">{ord.quantity}</td>
                    <td className="py-3 px-2 text-right text-slate-300">₹{ord.price}</td>
                    <td className="py-3 px-2 text-right text-white font-bold">
                      ₹{Math.round(ord.quantity * ord.price).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-sans">
                        EXECUTED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: TRANSACTION HISTORY LEDGER                                    */}
      {/* ==================================================================== */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 animate-fadeIn overflow-x-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white">Authoritative Transaction Ledger</h3>
              <p className="text-xs text-slate-400">
                Detailed debits, credits, simulated STT/brokerage fees, and realized P&L per transaction.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono font-bold">
              {profile.orders.length} Ledger Records
            </span>
          </div>

          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-sans font-bold">
                <th className="py-2.5 px-2">Transaction ID</th>
                <th className="py-2.5 px-2">Timestamp</th>
                <th className="py-2.5 px-2">Side</th>
                <th className="py-2.5 px-2">Instrument</th>
                <th className="py-2.5 px-2 text-right">Shares</th>
                <th className="py-2.5 px-2 text-right">Price</th>
                <th className="py-2.5 px-2 text-right">Simulated Fee</th>
                <th className="py-2.5 px-2 text-right">Net Flow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {profile.orders.map((ord) => {
                const total = ord.quantity * ord.price;
                const fee = Math.round(total * 0.0005 * 100) / 100;
                return (
                  <tr key={ord.id} className="hover:bg-slate-950/40">
                    <td className="py-3 px-2 text-slate-400 text-[10px]">{ord.id}</td>
                    <td className="py-3 px-2 text-slate-300 text-[11px]">
                      {new Date(ord.timestamp).toLocaleDateString()} {new Date(ord.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md font-sans ${
                          ord.action === 'BUY'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {ord.action}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-bold font-sans text-white">{ord.symbol}</td>
                    <td className="py-3 px-2 text-right text-white">{ord.quantity}</td>
                    <td className="py-3 px-2 text-right text-slate-300">₹{ord.price}</td>
                    <td className="py-3 px-2 text-right text-slate-400">₹{fee}</td>
                    <td
                      className={`py-3 px-2 text-right font-black ${
                        ord.action === 'BUY' ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {ord.action === 'BUY' ? '-' : '+'}₹{Math.round(total).toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 6: PERFORMANCE BENCHMARK TRACKER                                 */}
      {/* ==================================================================== */}
      {activeTab === 'PERFORMANCE' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <h3 className="text-xl font-black text-white">Portfolio Performance Analytics</h3>
              <p className="text-xs text-slate-400">
                Evaluate risk-adjusted returns, win rate, and benchmark performance against NIFTY 50.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <div className="text-xs text-slate-400 uppercase font-bold">Overall Net Return</div>
                <div
                  className={`text-2xl font-black font-mono ${
                    overallReturnPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {overallReturnPercent >= 0 ? '+' : ''}{overallReturnPercent}%
                </div>
                <div className="text-[10px] text-slate-400">Based on ₹1,00,000 Starting Seed</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <div className="text-xs text-slate-400 uppercase font-bold">NIFTY 50 Benchmark</div>
                <div className="text-2xl font-black font-mono text-slate-200">+3.45%</div>
                <div className="text-[10px] text-emerald-400 font-bold">
                  {overallReturnPercent > 3.45 ? '🚀 Generating Alpha!' : 'Tracking Benchmark'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <div className="text-xs text-slate-400 uppercase font-bold">Total Closed Trades P&L</div>
                <div
                  className={`text-2xl font-black font-mono ${
                    totalRealizedPnL >= 0 ? 'text-indigo-400' : 'text-rose-400'
                  }`}
                >
                  {totalRealizedPnL >= 0 ? '+' : ''}₹{Math.round(totalRealizedPnL).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">{profile.journal.length} Journal Entries</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">NCFM Chapter 7 Benchmark Rule:</strong>
                Professional trading is evaluated on risk-adjusted returns and drawdown control rather than raw windfall bets. Keeping position risk below 2-5% guarantees surviving market drawdowns.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 7: ALLOCATION MATRIX                                             */}
      {/* ==================================================================== */}
      {activeTab === 'ALLOCATION' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-xl font-black text-white">Asset & Sector Allocation Matrix</h3>
            <p className="text-xs text-slate-400">
              Analyze capital distribution across cash vs equity and inspect single-stock concentration risk.
            </p>
          </div>

          {/* Asset Class Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Asset Class Split</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Liquid Virtual Cash</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {Math.round((profile.virtualCash / totalNetWorth) * 100)}% (₹{Math.round(profile.virtualCash).toLocaleString('en-IN')})
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Equity Stock Holdings</span>
                  <span className="font-mono text-indigo-400 font-bold">
                    {Math.round((totalPortfolioValue / totalNetWorth) * 100)}% (₹{Math.round(totalPortfolioValue).toLocaleString('en-IN')})
                  </span>
                </div>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex">
                <div
                  className="bg-emerald-500"
                  style={{ width: `${(profile.virtualCash / totalNetWorth) * 100}%` }}
                />
                <div
                  className="bg-indigo-500"
                  style={{ width: `${(totalPortfolioValue / totalNetWorth) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Concentration Warning Check</h4>
              {profile.positions.some(
                (p) => (p.quantity * p.currentPrice) / totalNetWorth > 0.25
              ) ? (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Single-stock holding exceeds 25% of net worth. Consider rebalancing!</span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Excellent diversification! No individual holding dominates capital.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 8: WATCHLIST                                                     */}
      {/* ==================================================================== */}
      {activeTab === 'WATCHLIST' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white">Your Stock Watchlist</h3>
              <p className="text-xs text-slate-400">
                Track favorite NSE stocks, monitor price action, and execute rapid paper trades.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">{watchlistStocks.length} Watching</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stocks.map((stock) => {
              const isWatched = userWatchlistSymbols.includes(stock.symbol);
              return (
                <div
                  key={stock.symbol}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isWatched
                      ? 'bg-slate-950 border-indigo-500/40 shadow-lg'
                      : 'bg-slate-950/50 border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white">{stock.symbol}</span>
                      <button
                        onClick={() => toggleWatchlist(stock.symbol)}
                        className={`text-sm cursor-pointer ${
                          isWatched ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                        }`}
                        title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      >
                        ★
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{stock.name}</div>
                    <div className="text-base font-black font-mono text-white">
                      ₹{stock.price}
                    </div>
                    <div
                      className={`text-xs font-mono font-bold flex items-center gap-1 ${
                        stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {stock.change >= 0 ? '+' : ''}₹{stock.change} ({stock.changePercent}%)
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenTradeModal(stock, 'BUY')}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Buy
                    </button>
                    {onNavigateToChart && (
                      <button
                        onClick={() => onNavigateToChart(stock.symbol)}
                        className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Chart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 9: TRADING JOURNAL                                               */}
      {/* ==================================================================== */}
      {activeTab === 'JOURNAL' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white">Student Trading Journal</h3>
              <p className="text-xs text-slate-400">
                Log emotional state, strategy rationale, and key lessons learned from every trade.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">{profile.journal.length} Entries</span>
          </div>

          {profile.journal.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No journal entries yet. When you execute trades with rationales and emotions, they will appear here!
            </div>
          ) : (
            <div className="space-y-3">
              {profile.journal.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">{entry.symbol}</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          entry.action === 'BUY'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {entry.action} • {entry.quantity} shares @ ₹{entry.price}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                        Emotion: {entry.emotionalState}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300">
                    <strong className="text-indigo-400">Strategy Rationale: </strong>
                    {entry.strategy || entry.reason}
                  </div>

                  {entry.lessonLearned && (
                    <div className="p-2.5 rounded-xl bg-slate-900 text-[11px] text-slate-300 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{entry.lessonLearned}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Buy / Sell Quick Modal */}
      {tradeActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-400">ORDER EXECUTION</span>
                <h3 className="text-lg font-black text-white">
                  {tradeActionModal.action} {tradeActionModal.stock.symbol}
                </h3>
              </div>
              <button
                onClick={() => setTradeActionModal(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmTrade} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Order Type:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['MARKET', 'LIMIT', 'STOP_LOSS'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setOrderType(t)}
                      className={`py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        orderType === t
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={tradeQuantity}
                    onChange={(e) => setTradeQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Execution Price (₹):</label>
                  <input
                    type="number"
                    value={orderType === 'MARKET' ? tradeActionModal.stock.price : limitPrice}
                    disabled={orderType === 'MARKET'}
                    onChange={(e) => setLimitPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl text-xs font-mono font-bold disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Trade Rationale:</label>
                <input
                  type="text"
                  value={tradeRationale}
                  onChange={(e) => setTradeRationale(e.target.value)}
                  placeholder="e.g. Hammer rejection bounce at support"
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Emotional State (Journaling):</label>
                <select
                  value={tradeEmotion}
                  onChange={(e) => setTradeEmotion(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl text-xs"
                >
                  <option value="CALM">🧘 Calm & Disciplined</option>
                  <option value="FOMO">🏃 Fear of Missing Out (FOMO)</option>
                  <option value="FEARFUL">😨 Fearful of Loss</option>
                  <option value="GREEDY">🤑 Greedy for Windfall</option>
                  <option value="REVENGE">⚔️ Revenge Trading</option>
                </select>
              </div>

              {/* Cost calculation breakdown */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Gross Value:</span>
                  <span>₹{(tradeQuantity * (orderType === 'MARKET' ? tradeActionModal.stock.price : limitPrice)).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Simulated STT & Fees (0.05%):</span>
                  <span>₹{Math.round(tradeQuantity * (orderType === 'MARKET' ? tradeActionModal.stock.price : limitPrice) * 0.0005 * 100) / 100}</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-800">
                  <span>Total Order Amount:</span>
                  <span className="text-emerald-400">
                    ₹{Math.round(tradeQuantity * (orderType === 'MARKET' ? tradeActionModal.stock.price : limitPrice) * 1.0005).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {orderFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    orderFeedback.type === 'success'
                      ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                  }`}
                >
                  {orderFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{orderFeedback.text}</span>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg transition-all cursor-pointer ${
                  tradeActionModal.action === 'BUY'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                Confirm {tradeActionModal.action} Order
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Stock Detail Modal */}
      {selectedStockDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-400">
                  {selectedStockDetail.exchange} • {selectedStockDetail.sector}
                </span>
                <h3 className="text-xl font-black text-white">{selectedStockDetail.name}</h3>
              </div>
              <button
                onClick={() => setSelectedStockDetail(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">Current LTP</div>
                <div className="text-sm font-black text-white font-mono">₹{selectedStockDetail.price}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">52W High</div>
                <div className="text-sm font-black text-emerald-400 font-mono">₹{selectedStockDetail.high52w}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">52W Low</div>
                <div className="text-sm font-black text-rose-400 font-mono">₹{selectedStockDetail.low52w}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">P/E Ratio</div>
                <div className="text-sm font-black text-indigo-300 font-mono">{selectedStockDetail.peRatio}</div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  const s = selectedStockDetail;
                  setSelectedStockDetail(null);
                  handleOpenTradeModal(s, 'BUY');
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Buy {selectedStockDetail.symbol}
              </button>
              <button
                onClick={() => {
                  const s = selectedStockDetail;
                  setSelectedStockDetail(null);
                  handleOpenTradeModal(s, 'SELL');
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Sell {selectedStockDetail.symbol}
              </button>
              {onNavigateToChart && (
                <button
                  onClick={() => {
                    const sym = selectedStockDetail.symbol;
                    setSelectedStockDetail(null);
                    onNavigateToChart(sym);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Chart Lab
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
