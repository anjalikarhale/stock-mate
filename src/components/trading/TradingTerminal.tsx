import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Coins,
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  BookOpen,
  HelpCircle,
  Sparkles,
  History,
  CheckCircle2,
  AlertCircle
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

  const [selectedStock, setSelectedStock] = useState<StockQuote>(stocks[0] || {} as StockQuote);
  const [action, setAction] = useState<OrderAction>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [quantity, setQuantity] = useState<number>(5);
  const [limitPrice, setLimitPrice] = useState<number>(selectedStock.price || 100);
  const [stopLossPrice, setStopLossPrice] = useState<number>(Math.round((selectedStock.price * 0.95) * 100) / 100);
  const [rationale, setRationale] = useState<string>('Breakout above 20-day moving average with high volume.');
  const [emotionalState, setEmotionalState] = useState<'CALM' | 'FOMO' | 'FEARFUL' | 'GREEDY' | 'REVENGE'>('CALM');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'TERMINAL' | 'POSITIONS' | 'JOURNAL'>('TERMINAL');

  const executionPrice = orderType === 'MARKET' ? selectedStock.price : limitPrice;
  const totalOrderCost = quantity * executionPrice;
  const existingPosition = profile.positions.find(p => p.symbol === selectedStock.symbol);

  const handleStockSelect = (stock: StockQuote) => {
    soundEffects.click();
    setSelectedStock(stock);
    setLimitPrice(stock.price);
    setStopLossPrice(Math.round((stock.price * 0.95) * 100) / 100);
    setFeedbackMsg(null);
  };

  const handleQuickQty = (percent: number) => {
    soundEffects.click();
    if (action === 'BUY') {
      const maxAffordable = Math.floor((profile.virtualCash * percent) / selectedStock.price);
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

    if (action === 'BUY' && totalOrderCost > profile.virtualCash) {
      setFeedbackMsg({
        type: 'error',
        text: `Insufficient virtual cash. Required: ₹${totalOrderCost.toLocaleString('en-IN')}, Available: ₹${profile.virtualCash.toLocaleString('en-IN')}`
      });
      return;
    }

    if (action === 'SELL' && (!existingPosition || existingPosition.quantity < quantity)) {
      setFeedbackMsg({
        type: 'error',
        text: `You only own ${existingPosition?.quantity || 0} shares of ${selectedStock.symbol}. Cannot sell ${quantity}.`
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
      stopLossPrice: stopLossPrice || undefined,
      rationale,
      emotionalState,
    });

    if (success) {
      setFeedbackMsg({
        type: 'success',
        text: `Order Executed: ${action} ${quantity} ${selectedStock.symbol} @ ₹${executionPrice.toFixed(2)}`
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Quick Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => setActiveGame(null)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to World Map</span>
        </button>

        {/* View Tabs */}
        <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('TERMINAL')}
            className={`px-4 py-1.5 rounded-lg transition-colors ${
              activeTab === 'TERMINAL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Trading Floor
          </button>
          <button
            onClick={() => setActiveTab('POSITIONS')}
            className={`px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'POSITIONS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Holdings & Positions</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-emerald-400">
              {profile.positions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('JOURNAL')}
            className={`px-4 py-1.5 rounded-lg transition-colors ${
              activeTab === 'JOURNAL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Trading Journal
          </button>
        </div>
      </div>

      {activeTab === 'TERMINAL' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Stock Picker & Interactive Chart */}
          <div className="lg:col-span-2 space-y-4">
            {/* Stock Scroller Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {stocks.map(stock => {
                const isSelected = selectedStock.symbol === stock.symbol;
                const isUp = stock.change >= 0;
                return (
                  <button
                    key={stock.symbol}
                    onClick={() => handleStockSelect(stock)}
                    className={`px-3 py-2 rounded-xl border text-left shrink-0 transition-all ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono">{stock.symbol}</div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono mt-0.5">
                      <span>₹{stock.price.toFixed(1)}</span>
                      <span className={isUp ? 'text-emerald-400' : 'text-rose-400'}>
                        {isUp ? '+' : ''}{stock.changePercent.toFixed(1)}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Live Interactive Chart */}
            <InteractiveChart
              symbol={selectedStock.symbol}
              candles={selectedStock.historicalCandles}
              height={340}
            />

            {/* Financial Fundamentals Summary Card */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">P/E Ratio</span>
                <span className="font-mono font-bold text-white">{selectedStock.peRatio}x</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">ROE (Return on Equity)</span>
                <span className="font-mono font-bold text-emerald-400">{selectedStock.roe}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Debt / Equity</span>
                <span className="font-mono font-bold text-slate-200">{selectedStock.debtToEquity}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">52W High / Low</span>
                <span className="font-mono font-bold text-slate-200">₹{selectedStock.high52w} / ₹{selectedStock.low52w}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Simulated Order Execution Form */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-base">Virtual Order Pad</h3>
                <p className="text-[11px] text-slate-400">₹1,00,000 Virtual Capital Simulator</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Cash Balance</span>
                <span className="font-mono font-bold text-emerald-400 text-xs">
                  ₹{profile.virtualCash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {/* Buy / Sell Action Segment */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAction('BUY')}
                  className={`py-2 rounded-lg font-extrabold text-xs transition-all ${
                    action === 'BUY'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  BUY (LONG)
                </button>
                <button
                  type="button"
                  onClick={() => setAction('SELL')}
                  className={`py-2 rounded-lg font-extrabold text-xs transition-all ${
                    action === 'SELL'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SELL (EXIT)
                </button>
              </div>

              {/* Order Type Selector */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">Order Type:</span>
                <div className="flex gap-1.5">
                  {(['MARKET', 'LIMIT'] as OrderType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setOrderType(t)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
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

              {/* Quantity Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="text-slate-300 font-bold">Quantity (Shares):</label>
                  {existingPosition && (
                    <span className="text-slate-400 text-[11px]">Owned: {existingPosition.quantity}</span>
                  )}
                </div>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm font-bold focus:outline-none focus:border-indigo-500"
                />

                {/* Quick % buttons */}
                <div className="flex gap-1 pt-1">
                  {[0.25, 0.5, 0.75, 1.0].map((pct, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleQuickQty(pct)}
                      className="flex-1 py-1 rounded bg-slate-950 hover:bg-slate-800 text-[10px] font-bold text-slate-400 border border-slate-800"
                    >
                      {pct * 100}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Limit Price (if LIMIT order) */}
              {orderType === 'LIMIT' && (
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold text-xs">Limit Price (₹):</label>
                  <input
                    type="number"
                    step="0.05"
                    value={limitPrice}
                    onChange={e => setLimitPrice(parseFloat(e.target.value) || selectedStock.price)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Stop Loss Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Stop-Loss Trigger (₹):</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono">Disciplined Risk</span>
                </div>
                <input
                  type="number"
                  step="0.05"
                  value={stopLossPrice}
                  onChange={e => setStopLossPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Emotional State Logging */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold text-xs">
                  Trading Journal Emotion Check:
                </label>
                <select
                  value={emotionalState}
                  onChange={e => setEmotionalState(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 text-xs font-bold focus:outline-none focus:border-indigo-500"
                >
                  <option value="CALM">😌 Calm & Systematic</option>
                  <option value="FOMO">🚀 FOMO / Chasing Rapid Move</option>
                  <option value="FEARFUL">😨 Fearful / Anxious</option>
                  <option value="GREEDY">🤑 Greedy / Overleveraged</option>
                  <option value="REVENGE">🔥 Revenge / Trying to Recover Fast</option>
                </select>
              </div>

              {/* Total Order Summary */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Total:</span>
                  <span className="font-mono font-bold text-white">₹{totalOrderCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Brokerage & Charges:</span>
                  <span className="font-mono text-emerald-400">₹0 (Free Sim)</span>
                </div>
              </div>

              {/* Feedback Alert */}
              {feedbackMsg && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  feedbackMsg.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                }`}>
                  {feedbackMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{feedbackMsg.text}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-extrabold text-xs shadow-lg transition-all active:scale-[0.98] ${
                  action === 'BUY'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/40'
                    : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-950/40'
                }`}
              >
                Execute {action} Order ({quantity} Shares)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Holdings & Positions Tab */}
      {activeTab === 'POSITIONS' && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-extrabold text-white text-lg">Portfolio Holdings</h3>
              <p className="text-xs text-slate-400">Track current invested equity positions and live unrealized P&L</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Portfolio Value</span>
              <span className="text-lg font-mono font-black text-emerald-400">
                ₹{totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {profile.positions.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-sm">No active holdings in your portfolio.</p>
              <button
                onClick={() => setActiveTab('TERMINAL')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Go to Trading Floor
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold">
                    <th className="pb-3">Stock</th>
                    <th className="pb-3">Qty</th>
                    <th className="pb-3">Avg Buy Price</th>
                    <th className="pb-3">Current Price</th>
                    <th className="pb-3">Invested Value</th>
                    <th className="pb-3">Current Value</th>
                    <th className="pb-3 text-right">Unrealized P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {profile.positions.map((pos) => {
                    const liveStock = stocks.find(s => s.symbol === pos.symbol);
                    const currentPrice = liveStock ? liveStock.price : pos.currentPrice;
                    const currentValue = pos.quantity * currentPrice;
                    const pnl = currentValue - pos.investedValue;
                    const pnlPercent = (pnl / pos.investedValue) * 100;
                    const isProfit = pnl >= 0;

                    return (
                      <tr key={pos.symbol} className="hover:bg-slate-850/40 transition-colors">
                        <td className="py-3.5 font-bold text-white font-sans">
                          {pos.symbol}
                          <span className="block text-[10px] text-slate-400 font-mono">{pos.name}</span>
                        </td>
                        <td className="py-3.5 text-slate-200">{pos.quantity}</td>
                        <td className="py-3.5 text-slate-300">₹{pos.averageBuyPrice.toFixed(2)}</td>
                        <td className="py-3.5 text-slate-200">₹{currentPrice.toFixed(2)}</td>
                        <td className="py-3.5 text-slate-300">₹{pos.investedValue.toFixed(2)}</td>
                        <td className="py-3.5 font-bold text-white">₹{currentValue.toFixed(2)}</td>
                        <td className={`py-3.5 text-right font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isProfit ? '+' : ''}₹{pnl.toFixed(2)} ({isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Trading Journal Tab */}
      {activeTab === 'JOURNAL' && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-6 shadow-2xl">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>Trader's Psychological Journal</span>
            </h3>
            <p className="text-xs text-slate-400">
              Reviewing emotional state and setup rationale after each simulated trade creates self-awareness and eliminates reckless FOMO.
            </p>
          </div>

          {profile.journal.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No journal logs yet. Execute simulated trades to record your emotional discipline.
            </div>
          ) : (
            <div className="space-y-3">
              {profile.journal.map(entry => (
                <div
                  key={entry.id}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        entry.action === 'BUY' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {entry.action} {entry.quantity} {entry.symbol}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">@ ₹{entry.price}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(entry.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-slate-300">
                    <strong className="text-indigo-300">Rationale:</strong> {entry.reason}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                    <span><strong>Emotional State:</strong> {entry.emotionalState}</span>
                    {entry.lessonLearned && (
                      <span className="text-amber-300/90 font-medium">
                        💡 {entry.lessonLearned}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
