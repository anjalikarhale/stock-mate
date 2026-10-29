import React, { useState, useMemo } from 'react';
import {
  OptionChainPayload,
  OptionContractSide,
} from '../../services/marketApi';
import { Loader2, AlertCircle, Search, Filter } from 'lucide-react';

interface SelectedOptionTicket {
  strike: number;
  optionType: 'CE' | 'PE';
  contract: OptionContractSide;
}

interface OptionChainTableProps {
  chain: OptionChainPayload | null;
  loading: boolean;
  errorMessage: string | null;
  selectedContract: SelectedOptionTicket | null;
  onSelectContract: (ticket: SelectedOptionTicket) => void;
}

export const OptionChainTable: React.FC<OptionChainTableProps> = ({
  chain,
  loading,
  errorMessage,
  selectedContract,
  onSelectContract,
}) => {
  const [nearMoneyOnly, setNearMoneyOnly] = useState<boolean>(true);
  const [strikeFilter, setStrikeFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'STRIKE_ASC' | 'CE_OI_DESC' | 'PE_OI_DESC'>('STRIKE_ASC');

  const spotPrice = chain?.underlyingLtp || 0;

  const atmStrike = useMemo(() => {
    if (!chain || !chain.strikes.length || !spotPrice) return null;
    let closest = chain.strikes[0].strikePrice;
    let minDiff = Math.abs(closest - spotPrice);
    for (const row of chain.strikes) {
      const diff = Math.abs(row.strikePrice - spotPrice);
      if (diff < minDiff) {
        minDiff = diff;
        closest = row.strikePrice;
      }
    }
    return closest;
  }, [chain, spotPrice]);

  const displayedRows = useMemo(() => {
    if (!chain) return [];
    let rows = [...chain.strikes];

    if (strikeFilter.trim()) {
      rows = rows.filter((r) => String(r.strikePrice).includes(strikeFilter.trim()));
    } else if (nearMoneyOnly && atmStrike !== null) {
      const maxDist = (chain.strikeStep || 50) * 8;
      rows = rows.filter((r) => Math.abs(r.strikePrice - atmStrike) <= maxDist);
    }

    if (sortBy === 'CE_OI_DESC') {
      rows.sort((a, b) => (b.ce?.openInterest || 0) - (a.ce?.openInterest || 0));
    } else if (sortBy === 'PE_OI_DESC') {
      rows.sort((a, b) => (b.pe?.openInterest || 0) - (a.pe?.openInterest || 0));
    } else {
      rows.sort((a, b) => a.strikePrice - b.strikePrice);
    }

    return rows;
  }, [chain, strikeFilter, nearMoneyOnly, atmStrike, sortBy]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-10 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        <span className="text-xs font-semibold">Loading two-sided index option chain...</span>
      </div>
    );
  }

  if (errorMessage || !chain || chain.strikes.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-8 flex flex-col items-center justify-center gap-2 text-center">
        <AlertCircle className="w-6 h-6 text-rose-400" />
        <div className="text-sm font-bold text-white">Option Chain Unavailable</div>
        <p className="text-xs text-slate-400 max-w-md">
          {errorMessage || 'No active option strikes returned for this expiry.'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
      {/* Option Chain Controls & Summary Bar */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-black text-white font-mono">
            {chain.underlying} Spot:{' '}
            {spotPrice ? `₹${spotPrice.toLocaleString('en-IN')}` : '—'}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-slate-300">
            Lot: {chain.lotSize} qty
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-amber-300">
            DTE: {chain.daysToExpiry}d
          </span>
          {chain.pcrOi !== null && (
            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-indigo-300">
              PCR(OI): {chain.pcrOi.toFixed(2)}
            </span>
          )}
          <span
            className={`px-2 py-0.5 rounded border font-mono text-[10px] font-bold ${
              chain.meta.status === 'LIVE'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
            }`}
          >
            {chain.meta.status}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Strike..."
              value={strikeFilter}
              onChange={(e) => setStrikeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-xs font-mono text-white w-28"
            />
          </div>

          <button
            type="button"
            onClick={() => setNearMoneyOnly((v) => !v)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
              nearMoneyOnly
                ? 'bg-indigo-600/25 border-indigo-500/50 text-indigo-200'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <Filter className="w-3 h-3" />
            {nearMoneyOnly ? 'Near ATM (±8)' : 'All Strikes'}
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-200"
          >
            <option value="STRIKE_ASC">Sort: Strike ↑</option>
            <option value="CE_OI_DESC">Sort: Call OI ↓</option>
            <option value="PE_OI_DESC">Sort: Put OI ↓</option>
          </select>
        </div>
      </div>

      {/* Two-Sided Calls | Strike | Puts Table */}
      <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-900 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th colSpan={5} className="py-2 px-3 text-center text-emerald-400 border-r border-slate-800">
                CALLS (CE — Bullish Right to Buy)
              </th>
              <th className="py-2 px-3 text-center text-white bg-slate-950">STRIKE</th>
              <th colSpan={5} className="py-2 px-3 text-center text-rose-400 border-l border-slate-800">
                PUTS (PE — Bearish/Hedge Right to Sell)
              </th>
            </tr>
            <tr className="border-t border-slate-800 font-mono">
              <th className="py-2 px-2 text-right">OI</th>
              <th className="py-2 px-2 text-right">Vol</th>
              <th className="py-2 px-2 text-right">IV%</th>
              <th className="py-2 px-2 text-right">Δ</th>
              <th className="py-2 px-2.5 text-right border-r border-slate-800 text-white">CE LTP</th>
              <th className="py-2 px-3 text-center bg-slate-950 text-indigo-300">₹</th>
              <th className="py-2 px-2.5 text-left border-l border-slate-800 text-white">PE LTP</th>
              <th className="py-2 px-2 text-left">Δ</th>
              <th className="py-2 px-2 text-left">IV%</th>
              <th className="py-2 px-2 text-left">Vol</th>
              <th className="py-2 px-2 text-left">OI</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-900 font-mono text-[11px]">
            {displayedRows.map((row) => {
              const isAtm = row.strikePrice === atmStrike;
              const ceItm = spotPrice > 0 && row.strikePrice < spotPrice;
              const peItm = spotPrice > 0 && row.strikePrice > spotPrice;

              const ceSelected =
                selectedContract?.strike === row.strikePrice &&
                selectedContract?.optionType === 'CE';
              const peSelected =
                selectedContract?.strike === row.strikePrice &&
                selectedContract?.optionType === 'PE';

              return (
                <tr key={row.strikePrice} className="hover:bg-slate-900/50">
                  {/* CALL SIDE */}
                  <td className={`py-2 px-2 text-right text-slate-400 ${ceItm ? 'bg-emerald-950/15' : ''}`}>
                    {row.ce?.openInterest ? (row.ce.openInterest / 1000).toFixed(0) + 'k' : '—'}
                  </td>
                  <td className={`py-2 px-2 text-right text-slate-500 ${ceItm ? 'bg-emerald-950/15' : ''}`}>
                    {row.ce?.volume ? (row.ce.volume / 1000).toFixed(0) + 'k' : '—'}
                  </td>
                  <td className={`py-2 px-2 text-right text-slate-300 ${ceItm ? 'bg-emerald-950/15' : ''}`}>
                    {row.ce?.impliedVolatility != null ? row.ce.impliedVolatility.toFixed(1) : '—'}
                  </td>
                  <td className={`py-2 px-2 text-right text-emerald-400/90 ${ceItm ? 'bg-emerald-950/15' : ''}`}>
                    {row.ce?.greeks?.delta != null ? row.ce.greeks.delta.toFixed(2) : '—'}
                  </td>
                  <td
                    onClick={() =>
                      row.ce &&
                      onSelectContract({
                        strike: row.strikePrice,
                        optionType: 'CE',
                        contract: row.ce,
                      })
                    }
                    className={`py-2 px-2.5 text-right border-r border-slate-800 font-bold cursor-pointer transition-colors ${
                      ceSelected
                        ? 'bg-emerald-600 text-white'
                        : ceItm
                        ? 'bg-emerald-950/25 text-emerald-300 hover:bg-emerald-600/30'
                        : 'text-white hover:bg-indigo-600/25'
                    }`}
                  >
                    {row.ce?.ltp != null ? `₹${row.ce.ltp.toFixed(2)}` : '—'}
                  </td>

                  {/* CENTER STRIKE COLUMN */}
                  <td
                    className={`py-2 px-3 text-center font-black ${
                      isAtm
                        ? 'bg-indigo-600/30 text-indigo-200 border-y border-indigo-500/40'
                        : 'bg-slate-950 text-slate-200'
                    }`}
                  >
                    {row.strikePrice}
                    {isAtm && (
                      <span className="block text-[9px] text-indigo-300 font-sans">ATM</span>
                    )}
                  </td>

                  {/* PUT SIDE */}
                  <td
                    onClick={() =>
                      row.pe &&
                      onSelectContract({
                        strike: row.strikePrice,
                        optionType: 'PE',
                        contract: row.pe,
                      })
                    }
                    className={`py-2 px-2.5 text-left border-l border-slate-800 font-bold cursor-pointer transition-colors ${
                      peSelected
                        ? 'bg-rose-600 text-white'
                        : peItm
                        ? 'bg-rose-950/25 text-rose-300 hover:bg-rose-600/30'
                        : 'text-white hover:bg-indigo-600/25'
                    }`}
                  >
                    {row.pe?.ltp != null ? `₹${row.pe.ltp.toFixed(2)}` : '—'}
                  </td>
                  <td className={`py-2 px-2 text-left text-rose-400/90 ${peItm ? 'bg-rose-950/15' : ''}`}>
                    {row.pe?.greeks?.delta != null ? row.pe.greeks.delta.toFixed(2) : '—'}
                  </td>
                  <td className={`py-2 px-2 text-left text-slate-300 ${peItm ? 'bg-rose-950/15' : ''}`}>
                    {row.pe?.impliedVolatility != null ? row.pe.impliedVolatility.toFixed(1) : '—'}
                  </td>
                  <td className={`py-2 px-2 text-left text-slate-500 ${peItm ? 'bg-rose-950/15' : ''}`}>
                    {row.pe?.volume ? (row.pe.volume / 1000).toFixed(0) + 'k' : '—'}
                  </td>
                  <td className={`py-2 px-2 text-left text-slate-400 ${peItm ? 'bg-rose-950/15' : ''}`}>
                    {row.pe?.openInterest ? (row.pe.openInterest / 1000).toFixed(0) + 'k' : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Chain Source & Educational Caveat Footer */}
      <div className="px-4 py-2.5 bg-slate-900/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
        <span>Click any CE LTP or PE LTP cell to load that contract into the Options Order Ticket.</span>
        <span>
          Source: {chain.meta.source}
          {chain.meta.notice ? ` — ${chain.meta.notice}` : ''}
        </span>
      </div>
    </div>
  );
};
