import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  Layers,
  History,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';

interface StudentPortfolioViewProps {
  onNavigateToTrade: () => void;
}

export const StudentPortfolioView: React.FC<StudentPortfolioViewProps> = ({
  onNavigateToTrade,
}) => {
  const {
    profile,
    stocks,
    totalPortfolioValue,
    totalOptionsUnrealizedPnL,
    totalOptionsMarginBlocked,
    totalNetWorth,
    cancelEquityOrder,
    placeOptionOrder,
    refreshPortfolioFromServer,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'EQUITIES' | 'OPTIONS' | 'ORDERS'>('EQUITIES');
  const [actionBanner, setActionBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const equityPositions = profile.positions || [];
  const optionPositions = profile.optionPositions || [];
  const equityOrders = profile.orders || [];
  const optionOrders = profile.optionOrders || [];

  const equityInvested = equityPositions.reduce(
    (sum, p) => sum + p.quantity * p.averageBuyPrice,
    0
  );
  const equityCurrent = equityPositions.reduce((sum, p) => {
    const live = stocks.find((s) => s.symbol === p.symbol);
    const px = live ? live.price : p.currentPrice;
    return sum + p.quantity * px;
  }, 0);
  const equityUnrealizedPnL = equityCurrent - equityInvested;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Account Summary */}
      <section className="rounded-3xl bg-slate-900/95 border border-slate-800 p-6 sm:p-7 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Server-Persisted Simulated Portfolio
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Paper Holdings & Derivatives Book
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refreshPortfolioFromServer()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Portfolio
            </button>
            <button
              type="button"
              onClick={onNavigateToTrade}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white cursor-pointer"
            >
              <span>Trade Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Available Cash
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
              ₹{Math.round(profile.virtualCash).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold">Equity Holdings Value</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
              ₹{Math.round(equityCurrent).toLocaleString('en-IN')}
            </div>
            <div
              className={`text-xs font-mono mt-0.5 ${
                equityUnrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {equityUnrealizedPnL >= 0 ? '+' : ''}₹{equityUnrealizedPnL.toFixed(0)} Unrealized
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold">Index Options Margin / P&amp;L</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-indigo-300 mt-1">
              ₹{Math.round(totalOptionsMarginBlocked).toLocaleString('en-IN')}
            </div>
            <div
              className={`text-xs font-mono mt-0.5 ${
                totalOptionsUnrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              Options MTM: {totalOptionsUnrealizedPnL >= 0 ? '+' : ''}₹
              {totalOptionsUnrealizedPnL.toFixed(0)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30">
            <div className="text-xs text-indigo-300 font-semibold">Total Paper Net Worth</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
              ₹{Math.round(totalNetWorth).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Portfolio Value: ₹{Math.round(totalPortfolioValue).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
          {[
            {
              id: 'EQUITIES' as const,
              label: `Cash Equity & ETF Holdings (${equityPositions.length})`,
              icon: TrendingUp,
            },
            {
              id: 'OPTIONS' as const,
              label: `Index Options Positions (${optionPositions.length})`,
              icon: Layers,
            },
            {
              id: 'ORDERS' as const,
              label: `Order & Execution History (${equityOrders.length + optionOrders.length})`,
              icon: History,
            },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                  activeTab === t.id
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {actionBanner && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
            actionBanner.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
          }`}
        >
          <span>{actionBanner.text}</span>
          <button
            type="button"
            onClick={() => setActionBanner(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: CASH EQUITIES & ETFs */}
      {activeTab === 'EQUITIES' && (
        <section className="rounded-2xl bg-slate-900/95 border border-slate-800 overflow-hidden shadow-xl">
          {equityPositions.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <p className="text-sm font-bold text-white">No cash equity or ETF holdings yet.</p>
              <p className="text-xs text-slate-400">
                Place a simulated Equity or Index ETF order in the Trade Terminal to track Demat delivery positions here.
              </p>
              <button
                type="button"
                onClick={onNavigateToTrade}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white cursor-pointer"
              >
                Open Equity Paper Trading
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Symbol</th>
                    <th className="py-3 px-4 text-right">Qty</th>
                    <th className="py-3 px-4 text-right">Avg Buy</th>
                    <th className="py-3 px-4 text-right">Ref Price</th>
                    <th className="py-3 px-4 text-right">Current Value</th>
                    <th className="py-3 px-4 text-right">Unrealized P&amp;L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {equityPositions.map((pos) => {
                    const live = stocks.find((s) => s.symbol === pos.symbol);
                    const curPx = live ? live.price : pos.currentPrice;
                    const curVal = pos.quantity * curPx;
                    const invVal = pos.quantity * pos.averageBuyPrice;
                    const pnl = curVal - invVal;
                    const pnlPct = invVal > 0 ? (pnl / invVal) * 100 : 0;

                    return (
                      <tr key={pos.symbol} className="hover:bg-slate-950/60">
                        <td className="py-3 px-4 font-sans">
                          <div className="font-mono font-bold text-white">{pos.symbol}</div>
                          <div className="text-[11px] text-slate-400">{pos.name}</div>
                        </td>
                        <td className="py-3 px-4 text-right text-white">{pos.quantity}</td>
                        <td className="py-3 px-4 text-right text-slate-300">
                          ₹{pos.averageBuyPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-white">₹{curPx.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-white font-bold">
                          ₹{Math.round(curVal).toLocaleString('en-IN')}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-bold ${
                            pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)} ({pnl >= 0 ? '+' : ''}
                          {pnlPct.toFixed(2)}%)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* TAB 2: INDEX OPTIONS POSITIONS */}
      {activeTab === 'OPTIONS' && (
        <section className="rounded-2xl bg-slate-900/95 border border-slate-800 overflow-hidden shadow-xl">
          {optionPositions.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <p className="text-sm font-bold text-white">No open index option contracts.</p>
              <p className="text-xs text-slate-400">
                Explore NIFTY, BANKNIFTY, or SENSEX option chains in Options Paper Trading to simulate lot-sized Calls and Puts.
              </p>
              <button
                type="button"
                onClick={onNavigateToTrade}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white cursor-pointer"
              >
                Open Options Paper Trading
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Contract</th>
                    <th className="py-3 px-4">Side</th>
                    <th className="py-3 px-4 text-right">Lots / Qty</th>
                    <th className="py-3 px-4 text-right">Avg Premium</th>
                    <th className="py-3 px-4 text-right">Ref Premium</th>
                    <th className="py-3 px-4 text-right">Margin Blocked</th>
                    <th className="py-3 px-4 text-right">MTM P&amp;L</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {optionPositions.map((opt) => (
                    <tr key={opt.contractKey} className="hover:bg-slate-950/60">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">
                          {opt.underlying} {opt.strike} {opt.optionType}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Expiry: {opt.expiry} • {opt.dataStatus || 'SIMULATED'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            opt.side === 'LONG'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {opt.side}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-white">
                        {opt.lots}L ({opt.quantity})
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        ₹{opt.averagePrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-white">
                        ₹{opt.currentPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        ₹{Math.round(opt.marginBlocked).toLocaleString('en-IN')}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          opt.unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {opt.unrealizedPnL >= 0 ? '+' : ''}₹{opt.unrealizedPnL.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={async () => {
                            const res = await placeOptionOrder({
                              underlying: opt.underlying,
                              expiry: opt.expiry,
                              strike: opt.strike,
                              optionType: opt.optionType,
                              action: opt.side === 'LONG' ? 'SELL' : 'BUY',
                              lots: opt.lots,
                              rationale: 'Square-off from Portfolio view',
                            });
                            if (res.success) {
                              setActionBanner({
                                type: 'success',
                                text: `Squared off ${opt.lots} lot(s) of ${opt.underlying} ${opt.strike} ${opt.optionType}.`,
                              });
                            } else {
                              setActionBanner({
                                type: 'error',
                                text: res.error || 'Failed to square off option position.',
                              });
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-sans font-bold text-white cursor-pointer"
                        >
                          Square Off
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* TAB 3: COMBINED EQUITY + OPTIONS ORDER LOG */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-6">
          <section className="rounded-2xl bg-slate-900/95 border border-slate-800 p-5 space-y-3">
            <h3 className="text-sm font-black text-white">Index Options Order Log</h3>
            {optionOrders.length === 0 ? (
              <p className="text-xs text-slate-400">No index option orders executed yet.</p>
            ) : (
              <div className="space-y-2">
                {optionOrders.slice(0, 20).map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono"
                  >
                    <div>
                      <span
                        className={`font-bold mr-2 ${
                          ord.action === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {ord.action}
                      </span>
                      <span className="text-white font-bold">{ord.tradingSymbol}</span>
                      <span className="text-slate-400 ml-2">
                        {ord.lots}L ({ord.quantity} qty) @ ₹{ord.executionPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Charges ₹{ord.estimatedCharges.toFixed(0)} •{' '}
                      {new Date(ord.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-slate-900/95 border border-slate-800 p-5 space-y-3">
            <h3 className="text-sm font-black text-white">Cash Equity &amp; ETF Order Log</h3>
            {equityOrders.length === 0 ? (
              <p className="text-xs text-slate-400">No cash equity orders placed yet.</p>
            ) : (
              <div className="space-y-2">
                {equityOrders.slice(0, 25).map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono"
                  >
                    <div>
                      <span
                        className={`font-bold mr-2 ${
                          ord.action === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {ord.action}
                      </span>
                      <span className="text-white font-bold">{ord.symbol}</span>
                      <span className="text-slate-400 ml-2">
                        {ord.quantity} sh @ ₹{Number(ord.executionPrice ?? ord.price ?? 0).toFixed(2)} ({ord.type})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <span>
                        {ord.status} • {new Date(ord.timestamp).toLocaleString()}
                      </span>
                      {ord.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={async () => {
                            const res = await cancelEquityOrder(ord.id);
                            if (res.success) {
                              setActionBanner({
                                type: 'success',
                                text: `Cancelled pending ${ord.symbol} order.`,
                              });
                            } else {
                              setActionBanner({
                                type: 'error',
                                text: res.error || 'Failed to cancel pending order.',
                              });
                            }
                          }}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-rose-600 text-[10px] font-sans font-bold text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
