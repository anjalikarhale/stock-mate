import React, { useState, useMemo } from 'react';
import { ContextualVisualizerKind } from '../../data/curriculum16Modules';
import { AlertTriangle, CheckCircle2, Info, ArrowRight } from 'lucide-react';

interface ContextualVisualizerProps {
  kind: ContextualVisualizerKind;
  title: string;
  caption: string;
}

export const ContextualVisualizer: React.FC<ContextualVisualizerProps> = ({
  kind,
  title,
  caption,
}) => {
  // 1. OWNERSHIP & PRICE VS VALUE (Module 1)
  const [m1Price, setM1Price] = useState(1450);
  const [m1Eps, setM1Eps] = useState(65);
  const [m1SharesCr, setM1SharesCr] = useState(676);
  const [m1UserShares, setM1UserShares] = useState(50);

  // 2. SETTLEMENT FLOW (Module 2)
  const [m2Step, setM2Step] = useState(0);

  // 3. FREE FLOAT WEIGHT (Module 3)
  const [m3PromoterPct, setM3PromoterPct] = useState(68);
  const [m3TotalMcap, setM3TotalMcap] = useState(250000);

  // 4. ORDER BOOK SLIPPAGE (Module 4)
  const [m4Qty, setM4Qty] = useState(120);
  const [m4LimitPrice, setM4LimitPrice] = useState(501.0);

  // 5. COMPOUNDING VS INFLATION (Module 5)
  const [m5Years, setM5Years] = useState(12);
  const [m5ReturnPct, setM5ReturnPct] = useState(12);
  const [m5InflationPct, setM5InflationPct] = useState(6);

  // 6. BALANCE SHEET & PROFIT VS CASH (Module 6)
  const [m6Pat, setM6Pat] = useState(320);
  const [m6ReceivableJump, setM6ReceivableJump] = useState(180);
  const [m6Debt, setM6Debt] = useState(600);
  const [m6Equity, setM6Equity] = useState(1400);

  // 7. FINANCIAL RATIOS LAB (Module 7)
  const [m7Price, setM7Price] = useState(1200);
  const [m7Eps, setM7Eps] = useState(50);
  const [m7Bvps, setM7Bvps] = useState(300);
  const [m7Ebit, setM7Ebit] = useState(420);
  const [m7NetProfit, setM7NetProfit] = useState(280);
  const [m7EqCr, setM7EqCr] = useState(1400);
  const [m7DebtCr, setM7DebtCr] = useState(700);
  const [m7Cfo, setM7Cfo] = useState(350);
  const [m7Capex, setM7Capex] = useState(130);

  // 8. DCF & DDM VALUATION (Module 8)
  const [m8Fcf0, setM8Fcf0] = useState(500);
  const [m8Growth5Y, setM8Growth5Y] = useState(14);
  const [m8DiscountR, setM8DiscountR] = useState(12);
  const [m8TerminalG, setM8TerminalG] = useState(5);
  const [m8Div1, setM8Div1] = useState(24);

  // 9. MACRO SHOCK SIMULATOR (Module 9)
  const [m9Regime, setM9Regime] = useState<'RATE_CUT' | 'CRUDE_SPIKE' | 'INR_WEAK'>('CRUDE_SPIKE');

  // 10. CANDLESTICK ANATOMY & PATTERN COMPARE (Module 10)
  const [m10Pattern, setM10Pattern] = useState<'HAMMER' | 'SHOOTING_STAR' | 'BULL_ENGULF' | 'DOJI'>('HAMMER');
  const [m10HoveredPart, setM10HoveredPart] = useState<string>('Hover any part of the candlestick SVG to inspect OHLC auction meaning.');

  // 11. SUPPORT/RESISTANCE & POLARITY (Module 11)
  const [m11ShowZones, setM11ShowZones] = useState(true);
  const [m11ShowPolarity, setM11ShowPolarity] = useState(true);

  // 12. INDICATOR REGIME DEMO (Module 12)
  const [m12Regime, setM12Regime] = useState<'TREND' | 'CHOP'>('TREND');

  // 13. BOS / CHOCH / FVG (Module 13)
  const [m13Mode, setM13Mode] = useState<'BOS' | 'CHOCH' | 'FVG'>('BOS');

  // 14. PRICE + OI MATRIX (Module 14)
  const [m14PriceDir, setM14PriceDir] = useState<'UP' | 'DOWN'>('UP');
  const [m14OiDir, setM14OiDir] = useState<'UP' | 'DOWN'>('UP');
  const [m14PutOiLakh, setM14PutOiLakh] = useState(128);
  const [m14CallOiLakh, setM14CallOiLakh] = useState(105);

  // 15. OPTIONS PAYOFF & GREEKS (Module 15)
  const [m15Action, setM15Action] = useState<'BUY' | 'SELL'>('BUY');
  const [m15Type, setM15Type] = useState<'CE' | 'PE'>('CE');
  const [m15Spot, setM15Spot] = useState(24500);
  const [m15Strike, setM15Strike] = useState(24500);
  const [m15Dte, setM15Dte] = useState(7);
  const [m15Iv, setM15Iv] = useState(15);

  // 16. POSITION SIZING & EXPECTANCY (Module 16)
  const [m16Capital, setM16Capital] = useState(100000);
  const [m16RiskPct, setM16RiskPct] = useState(1.0);
  const [m16Entry, setM16Entry] = useState(1540);
  const [m16Stop, setM16Stop] = useState(1490);
  const [m16Target, setM16Target] = useState(1665);

  // Precomputed Options Black-Scholes educational sensitivity for Module 15
  const m15Data = useMemo(() => {
    const S = m15Spot;
    const K = m15Strike;
    const T = Math.max(1 / 365, m15Dte / 365);
    const sigma = m15Iv / 100;
    const r = 0.068;

    const erf = (x: number) => {
      const sign = x >= 0 ? 1 : -1;
      const ax = Math.abs(x);
      const t = 1 / (1 + 0.3275911 * ax);
      const y =
        1 -
        ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
          0.254829592) *
          t *
          Math.exp(-ax * ax);
      return sign * y;
    };
    const normCdf = (z: number) => 0.5 * (1 + erf(z / Math.SQRT2));
    const normPdf = (z: number) => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);

    const sqrtT = Math.sqrt(T);
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
    const d2 = d1 - sigma * sqrtT;
    const disc = Math.exp(-r * T);

    const callPrice = Math.max(0.5, S * normCdf(d1) - K * disc * normCdf(d2));
    const putPrice = Math.max(0.5, K * disc * normCdf(-d2) - S * normCdf(-d1));
    const premium = m15Type === 'CE' ? callPrice : putPrice;
    const intrinsic = m15Type === 'CE' ? Math.max(0, S - K) : Math.max(0, K - S);
    const timeVal = Math.max(0, premium - intrinsic);

    const rawDelta = m15Type === 'CE' ? normCdf(d1) : normCdf(d1) - 1;
    const rawGamma = normPdf(d1) / (S * sigma * sqrtT);
    const rawThetaAnnual =
      m15Type === 'CE'
        ? -(S * normPdf(d1) * sigma) / (2 * sqrtT) - r * K * disc * normCdf(d2)
        : -(S * normPdf(d1) * sigma) / (2 * sqrtT) + r * K * disc * normCdf(-d2);
    const rawVega = (S * normPdf(d1) * sqrtT) / 100;

    const signMult = m15Action === 'BUY' ? 1 : -1;
    const lotSize = 75; // NIFTY lot

    const expiryPoints: { spot: number; pnlPerLot: number }[] = [];
    for (let s = K - 800; s <= K + 800; s += 80) {
      const expIntrinsic = m15Type === 'CE' ? Math.max(0, s - K) : Math.max(0, K - s);
      const perUnit = m15Action === 'BUY' ? expIntrinsic - premium : premium - expIntrinsic;
      expiryPoints.push({ spot: s, pnlPerLot: Math.round(perUnit * lotSize) });
    }

    return {
      premium: Math.round(premium * 100) / 100,
      intrinsic: Math.round(intrinsic * 100) / 100,
      timeVal: Math.round(timeVal * 100) / 100,
      delta: Math.round(rawDelta * signMult * 1000) / 1000,
      gamma: Math.round(rawGamma * signMult * 100000) / 100000,
      theta: Math.round((rawThetaAnnual / 365) * signMult * 100) / 100,
      vega: Math.round(rawVega * signMult * 100) / 100,
      breakeven: Math.round((m15Type === 'CE' ? K + premium : K - premium) * 10) / 10,
      lotSize,
      expiryPoints,
    };
  }, [m15Action, m15Type, m15Spot, m15Strike, m15Dte, m15Iv]);

  return (
    <div className="my-5 rounded-2xl border border-indigo-500/30 bg-slate-950/90 p-4 sm:p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
            Interactive Concept Lab
          </span>
          <h4 className="text-sm sm:text-base font-bold text-white">{title}</h4>
        </div>
        <span className="text-[11px] text-slate-400">{caption}</span>
      </div>

      {/* 1. OWNERSHIP & PRICE VS VALUE */}
      {kind === 'OWNERSHIP_VALUE_CALC' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="block text-xs text-slate-300">
              Market Share Price: <strong className="text-white font-mono">₹{m1Price}</strong>
              <input
                type="range"
                min={400}
                max={3200}
                step={25}
                value={m1Price}
                onChange={(e) => setM1Price(Number(e.target.value))}
                className="w-full accent-indigo-500 mt-1"
              />
            </label>
            <label className="block text-xs text-slate-300">
              Underlying Earnings Per Share (EPS): <strong className="text-emerald-400 font-mono">₹{m1Eps}</strong>
              <input
                type="range"
                min={20}
                max={140}
                step={5}
                value={m1Eps}
                onChange={(e) => setM1Eps(Number(e.target.value))}
                className="w-full accent-emerald-500 mt-1"
              />
            </label>
            <label className="block text-xs text-slate-300">
              Shares You Own: <strong className="text-amber-300 font-mono">{m1UserShares} shares</strong>
              <input
                type="range"
                min={10}
                max={500}
                step={10}
                value={m1UserShares}
                onChange={(e) => setM1UserShares(Number(e.target.value))}
                className="w-full accent-amber-500 mt-1"
              />
            </label>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Shares Outstanding:</span>
              <span className="font-mono text-white">{m1SharesCr} Crore</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Market Cap:</span>
              <span className="font-mono font-bold text-indigo-300">
                ₹{(m1Price * m1SharesCr).toLocaleString('en-IN')} Cr
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Your Holding Value:</span>
              <span className="font-mono font-bold text-white">
                ₹{(m1Price * m1UserShares).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Your Proportionate Annual Earnings Claim:</span>
              <span className="font-mono font-bold text-emerald-400">
                ₹{(m1Eps * m1UserShares).toLocaleString('en-IN')} / yr
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300">
              Implied P/E Multiple: <strong className="text-amber-300 font-mono">{(m1Price / m1Eps).toFixed(1)}x</strong>. Notice how changing Market Price changes Market Cap immediately without changing the ₹{(m1Eps * m1UserShares).toLocaleString('en-IN')} business earnings claim!
            </div>
          </div>
        </div>
      )}

      {/* 2. SETTLEMENT ECOSYSTEM FLOW */}
      {kind === 'SETTLEMENT_ECOSYSTEM_FLOW' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { step: '1. Order Placed (T Day)', actor: 'Bank + Trading Account' },
              { step: '2. Order Matched', actor: 'NSE / BSE Engine' },
              { step: '3. Novation & Margin', actor: 'Clearing Corp (NCL/ICCL)' },
              { step: '4. Demat Credit (T+1)', actor: 'CDSL / NSDL Depository' },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setM2Step(idx)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  m2Step === idx
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold">{item.step}</div>
                <div className="text-[11px] text-indigo-300 mt-0.5">{item.actor}</div>
              </button>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed">
            {m2Step === 0 &&
              'T Day (09:15–15:30 IST): Your SEBI-registered broker verifies upfront margin/funds linked to your bank account and routes your stamped order to NSE or BSE.'}
            {m2Step === 1 &&
              'T Day Milliseconds Later: NSE/BSE electronic limit-order book matches your Buy against the best resting Sell order using strict Price-Time Priority.'}
            {m2Step === 2 &&
              'T Day Post-Trade: NSE Clearing / ICCL steps in via Novation as central counterparty—guaranteeing settlement even if the anonymous counterparty’s broker defaults.'}
            {m2Step === 3 &&
              'T+1 Working Day: Funds settle across clearing banks and electronic shares are credited directly into your CDSL/NSDL Demat account under your PAN.'}
          </div>
        </div>
      )}

      {/* 3. INDEX FREE-FLOAT WEIGHT */}
      {kind === 'INDEX_BENCHMARK_EXPLORER' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="block text-xs text-slate-300">
              Total Company Market Cap: <strong className="font-mono text-white">₹{m3TotalMcap.toLocaleString('en-IN')} Cr</strong>
              <input
                type="range"
                min={50000}
                max={1000000}
                step={25000}
                value={m3TotalMcap}
                onChange={(e) => setM3TotalMcap(Number(e.target.value))}
                className="w-full accent-indigo-500 mt-1"
              />
            </label>
            <label className="block text-xs text-slate-300">
              Promoter / Locked-in Holding: <strong className="font-mono text-amber-300">{m3PromoterPct}%</strong>
              <input
                type="range"
                min={0}
                max={75}
                step={1}
                value={m3PromoterPct}
                onChange={(e) => setM3PromoterPct(Number(e.target.value))}
                className="w-full accent-amber-500 mt-1"
              />
            </label>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Public Free-Float Factor (IWF):</span>
              <span className="font-mono font-bold text-emerald-400">{100 - m3PromoterPct}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Free-Float Market Cap (Index Weight Basis):</span>
              <span className="font-mono font-bold text-white">
                ₹{Math.round((m3TotalMcap * (100 - m3PromoterPct)) / 100).toLocaleString('en-IN')} Cr
              </span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex mt-2">
              <div
                className="bg-amber-500/70 h-full"
                style={{ width: `${m3PromoterPct}%` }}
                title="Locked Promoter Holding"
              />
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${100 - m3PromoterPct}%` }}
                title="Free Float Counted in NIFTY/SENSEX"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Amber: Promoter Excluded ({m3PromoterPct}%)</span>
              <span>Green: Index Free-Float ({100 - m3PromoterPct}%)</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. ORDER BOOK SLIPPAGE */}
      {kind === 'ORDER_BOOK_SLIPPAGE' && (() => {
        const asks = [
          { price: 500.0, qty: 40 },
          { price: 500.5, qty: 50 },
          { price: 501.5, qty: 60 },
          { price: 503.0, qty: 80 },
          { price: 505.0, qty: 120 },
        ];
        let rem = m4Qty;
        let cost = 0;
        let filledMarket = 0;
        let filledLimit = 0;
        let costLimit = 0;

        for (const lvl of asks) {
          const take = Math.min(rem, lvl.qty);
          if (take > 0) {
            cost += take * lvl.price;
            filledMarket += take;
            rem -= take;
          }
        }
        let remLim = m4Qty;
        for (const lvl of asks) {
          if (lvl.price <= m4LimitPrice) {
            const take = Math.min(remLim, lvl.qty);
            costLimit += take * lvl.price;
            filledLimit += take;
            remLim -= take;
          }
        }
        const avgMkt = filledMarket > 0 ? cost / filledMarket : 500;
        const slippagePerShare = avgMkt - 500.0;

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 text-xs">
              <div className="font-bold text-slate-300 mb-2 flex justify-between">
                <span>Best Bid: ₹499.50 (Spread ₹0.50)</span>
                <span className="text-rose-400">5-Level Ask Book</span>
              </div>
              <div className="space-y-1 font-mono text-[11px]">
                {asks.map((a, i) => (
                  <div key={i} className="flex justify-between px-2 py-1 rounded bg-slate-950">
                    <span className="text-rose-300">Ask #{i + 1}: ₹{a.price.toFixed(2)}</span>
                    <span className="text-slate-300">{a.qty} sh</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3 text-xs">
              <label className="block text-slate-300">
                Buy Order Quantity: <strong className="text-white font-mono">{m4Qty} shares</strong>
                <input
                  type="range"
                  min={20}
                  max={250}
                  step={10}
                  value={m4Qty}
                  onChange={(e) => setM4Qty(Number(e.target.value))}
                  className="w-full accent-indigo-500 mt-1"
                />
              </label>
              <label className="block text-slate-300">
                Limit Buy Cap Price: <strong className="text-emerald-400 font-mono">₹{m4LimitPrice.toFixed(2)}</strong>
                <input
                  type="range"
                  min={500}
                  max={505}
                  step={0.5}
                  value={m4LimitPrice}
                  onChange={(e) => setM4LimitPrice(Number(e.target.value))}
                  className="w-full accent-emerald-500 mt-1"
                />
              </label>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div>
                  Market Order Avg Fill: <strong className="font-mono text-amber-300">₹{avgMkt.toFixed(2)}</strong>{' '}
                  (Slippage: ₹{(slippagePerShare * filledMarket).toFixed(0)} total)
                </div>
                <div>
                  Limit Order (@ ₹{m4LimitPrice.toFixed(2)}): Fills{' '}
                  <strong className="font-mono text-emerald-400">{filledLimit}/{m4Qty} shares</strong> at avg{' '}
                  <strong className="font-mono text-white">
                    ₹{filledLimit > 0 ? (costLimit / filledLimit).toFixed(2) : '0.00'}
                  </strong>{' '}
                  (resting {m4Qty - filledLimit} sh in book).
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 5. INVESTING VS TRADING / INFLATION */}
      {kind === 'INVESTING_VS_TRADING_HORIZON' && (() => {
        const base = 100000;
        const nominal = base * Math.pow(1 + m5ReturnPct / 100, m5Years);
        const real = base * Math.pow((1 + m5ReturnPct / 100) / (1 + m5InflationPct / 100), m5Years);
        const idleCashReal = base / Math.pow(1 + m5InflationPct / 100, m5Years);
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3">
              <label className="block text-slate-300">
                Horizon: <strong className="text-white font-mono">{m5Years} Years</strong>
                <input
                  type="range"
                  min={1}
                  max={25}
                  value={m5Years}
                  onChange={(e) => setM5Years(Number(e.target.value))}
                  className="w-full accent-indigo-500 mt-1"
                />
              </label>
              <label className="block text-slate-300">
                Portfolio Annual CAGR: <strong className="text-emerald-400 font-mono">{m5ReturnPct}%</strong>
                <input
                  type="range"
                  min={4}
                  max={18}
                  value={m5ReturnPct}
                  onChange={(e) => setM5ReturnPct(Number(e.target.value))}
                  className="w-full accent-emerald-500 mt-1"
                />
              </label>
              <label className="block text-slate-300">
                Annual CPI Inflation: <strong className="text-rose-400 font-mono">{m5InflationPct}%</strong>
                <input
                  type="range"
                  min={3}
                  max={10}
                  value={m5InflationPct}
                  onChange={(e) => setM5InflationPct(Number(e.target.value))}
                  className="w-full accent-rose-500 mt-1"
                />
              </label>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Starting ₹1,00,000 Nominal Corpus:</span>
                <span className="font-mono font-bold text-emerald-400">
                  ₹{Math.round(nominal).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Inflation-Adjusted Real Purchasing Power:</span>
                <span className="font-mono font-bold text-indigo-300">
                  ₹{Math.round(real).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Uninvested Idle Cash Real Value:</span>
                <span className="font-mono font-bold text-rose-400">
                  ₹{Math.round(idleCashReal).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 6. BALANCE SHEET & PROFIT VS CASH */}
      {kind === 'BALANCE_SHEET_CASHFLOW' && (() => {
        const totalAssets = m6Debt + m6Equity;
        const cfo = m6Pat + 45 - m6ReceivableJump;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3">
              <label className="block text-slate-300">
                Reported Net Profit (PAT): <strong className="text-white font-mono">₹{m6Pat} Cr</strong>
                <input
                  type="range"
                  min={50}
                  max={600}
                  step={10}
                  value={m6Pat}
                  onChange={(e) => setM6Pat(Number(e.target.value))}
                  className="w-full accent-indigo-500 mt-1"
                />
              </label>
              <label className="block text-slate-300">
                Uncollected Receivables Increase: <strong className="text-amber-300 font-mono">₹{m6ReceivableJump} Cr</strong>
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={20}
                  value={m6ReceivableJump}
                  onChange={(e) => setM6ReceivableJump(Number(e.target.value))}
                  className="w-full accent-amber-500 mt-1"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-slate-300">
                  Liabilities: ₹{m6Debt} Cr
                  <input
                    type="range"
                    min={100}
                    max={2000}
                    step={50}
                    value={m6Debt}
                    onChange={(e) => setM6Debt(Number(e.target.value))}
                    className="w-full accent-rose-500 mt-1"
                  />
                </label>
                <label className="block text-slate-300">
                  Equity: ₹{m6Equity} Cr
                  <input
                    type="range"
                    min={300}
                    max={2500}
                    step={50}
                    value={m6Equity}
                    onChange={(e) => setM6Equity(Number(e.target.value))}
                    className="w-full accent-emerald-500 mt-1"
                  />
                </label>
              </div>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-2">
              <div className="font-mono text-indigo-300 font-bold">
                Assets (₹{totalAssets} Cr) = Liabilities (₹{m6Debt} Cr) + Equity (₹{m6Equity} Cr)
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-400">Accounting PAT:</span>
                <span className="font-mono font-bold text-white">₹{m6Pat} Cr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Operating Cash Flow (CFO):</span>
                <span className={`font-mono font-bold ${cfo >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ₹{cfo} Cr
                </span>
              </div>
              {cfo < m6Pat * 0.5 && (
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                  <span>Warning: Cash conversion (CFO/PAT) is weak because sales are sitting in unpaid receivables!</span>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* 7. FINANCIAL RATIOS LAB */}
      {kind === 'FINANCIAL_RATIOS_LAB' && (() => {
        const pe = m7Eps > 0 ? m7Price / m7Eps : null;
        const pb = m7Bvps > 0 ? m7Price / m7Bvps : null;
        const roe = (m7NetProfit / m7EqCr) * 100;
        const roce = (m7Ebit / (m7EqCr + m7DebtCr)) * 100;
        const de = m7DebtCr / m7EqCr;
        const fcf = m7Cfo - m7Capex;
        return (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Share Price (₹)', val: m7Price, set: setM7Price },
                { label: 'EPS (₹)', val: m7Eps, set: setM7Eps },
                { label: 'Book Value/Sh (₹)', val: m7Bvps, set: setM7Bvps },
                { label: 'EBIT (₹ Cr)', val: m7Ebit, set: setM7Ebit },
                { label: 'Net Profit (₹ Cr)', val: m7NetProfit, set: setM7NetProfit },
                { label: 'Equity (₹ Cr)', val: m7EqCr, set: setM7EqCr },
                { label: 'Total Debt (₹ Cr)', val: m7DebtCr, set: setM7DebtCr },
                { label: 'CFO / CapEx (₹ Cr)', val: m7Cfo, set: setM7Cfo },
              ].map((inp, idx) => (
                <div key={idx} className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{inp.label}</span>
                  <input
                    type="number"
                    value={inp.val}
                    onChange={(e) => inp.set(Math.max(1, Number(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs mt-1"
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block">P/E Ratio</span>
                <span className="font-mono font-bold text-white">{pe ? `${pe.toFixed(1)}x` : 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">P/B Ratio</span>
                <span className="font-mono font-bold text-white">{pb ? `${pb.toFixed(2)}x` : 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">ROE</span>
                <span className="font-mono font-bold text-emerald-400">{roe.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">ROCE</span>
                <span className="font-mono font-bold text-indigo-300">{roce.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Debt / Equity</span>
                <span className={`font-mono font-bold ${de > 1.5 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {de.toFixed(2)}x
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">FCF (CFO−₹{m7Capex})</span>
                <span className={`font-mono font-bold ${fcf >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ₹{fcf} Cr
                </span>
              </div>
            </div>
            {de > 1.5 && roe > roce && (
              <div className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                Leverage Alert: Debt/Equity is {de.toFixed(2)}x, making ROE ({roe.toFixed(1)}%) look higher than pre-leverage ROCE ({roce.toFixed(1)}%).
              </div>
            )}
          </div>
        );
      })()}

      {/* 8. DCF & DDM VALUATOR */}
      {kind === 'DCF_DDM_VALUATION' && (() => {
        const validRgtG = m8DiscountR > m8TerminalG;
        const calcDcfEv = (growthPct: number, rPct: number, gTermPct: number) => {
          if (rPct <= gTermPct) return null;
          const r = rPct / 100;
          const g = growthPct / 100;
          const gt = gTermPct / 100;
          let pv = 0;
          let fcf = m8Fcf0;
          for (let t = 1; t <= 5; t++) {
            fcf = fcf * (1 + g);
            pv += fcf / Math.pow(1 + r, t);
          }
          const tv = (fcf * (1 + gt)) / (r - gt);
          pv += tv / Math.pow(1 + r, 5);
          return Math.round(pv);
        };
        const bearEv = calcDcfEv(Math.max(4, m8Growth5Y - 5), m8DiscountR + 1.5, Math.min(4, m8TerminalG));
        const baseEv = calcDcfEv(m8Growth5Y, m8DiscountR, m8TerminalG);
        const bullEv = calcDcfEv(m8Growth5Y + 4, Math.max(m8TerminalG + 2, m8DiscountR - 1), m8TerminalG);
        const ddmValue = validRgtG ? m8Div1 / ((m8DiscountR - m8TerminalG) / 100) : null;

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2.5">
              <label className="block text-slate-300">
                Base Free Cash Flow (FCF₀): <strong className="font-mono text-white">₹{m8Fcf0} Cr</strong>
                <input
                  type="range"
                  min={100}
                  max={2000}
                  step={50}
                  value={m8Fcf0}
                  onChange={(e) => setM8Fcf0(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </label>
              <label className="block text-slate-300">
                Years 1–5 FCF Growth: <strong className="font-mono text-emerald-400">{m8Growth5Y}%</strong>
                <input
                  type="range"
                  min={4}
                  max={25}
                  value={m8Growth5Y}
                  onChange={(e) => setM8Growth5Y(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </label>
              <label className="block text-slate-300">
                Discount Rate (r / WACC): <strong className="font-mono text-amber-300">{m8DiscountR}%</strong>
                <input
                  type="range"
                  min={8}
                  max={18}
                  step={0.5}
                  value={m8DiscountR}
                  onChange={(e) => setM8DiscountR(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </label>
              <label className="block text-slate-300">
                Terminal / Perpetual Growth (g): <strong className="font-mono text-indigo-300">{m8TerminalG}%</strong>
                <input
                  type="range"
                  min={2}
                  max={14}
                  step={0.5}
                  value={m8TerminalG}
                  onChange={(e) => setM8TerminalG(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </label>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-3">
              {!validRgtG ? (
                <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-200">
                  <strong>Invalid Model Condition (g ≥ r):</strong> Terminal growth ({m8TerminalG}%) must be strictly less than Discount Rate ({m8DiscountR}%). Lower g or raise r!
                </div>
              ) : (
                <>
                  <div className="text-[11px] font-bold text-slate-300">5-Year DCF Enterprise Value Range</div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-rose-400 block">Bear Case</span>
                      <span className="font-mono font-bold text-white">₹{bearEv?.toLocaleString('en-IN')} Cr</span>
                    </div>
                    <div className="p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/40">
                      <span className="text-[10px] text-indigo-300 block">Base Case</span>
                      <span className="font-mono font-bold text-white">₹{baseEv?.toLocaleString('en-IN')} Cr</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-emerald-400 block">Bull Case</span>
                      <span className="font-mono font-bold text-white">₹{bullEv?.toLocaleString('en-IN')} Cr</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">
                      DDM Fair Value (D₁ = ₹{m8Div1}/sh, r−g = {(m8DiscountR - m8TerminalG).toFixed(1)}%):
                    </span>
                    <span className="font-mono font-bold text-emerald-400">₹{ddmValue?.toFixed(0)} / sh</span>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* 9. MACRO SECTOR SENSITIVITY */}
      {kind === 'MACRO_SECTOR_SENSITIVITY' && (
        <div className="space-y-3 text-xs">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'CRUDE_SPIKE' as const, label: 'Brent Crude Spikes +$20' },
              { id: 'RATE_CUT' as const, label: 'RBI Cuts Repo Rate −50 bps' },
              { id: 'INR_WEAK' as const, label: 'INR Weakens vs USD' },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setM9Regime(b.id)}
                className={`px-3 py-1.5 rounded-lg border font-bold cursor-pointer ${
                  m9Regime === b.id
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-900 text-slate-300 border-slate-800'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-slate-200">
            {m9Regime === 'CRUDE_SPIKE' && (
              <>
                <p><strong className="text-rose-400">Direct Input Headwind:</strong> Aviation (ATF fuel), Decorative Paints (monomers/solvents), Tyres, and Logistics face gross-margin compression.</p>
                <p><strong className="text-amber-300">Macro Spillover:</strong> Higher imported inflation widens India’s trade deficit and can delay RBI rate cuts.</p>
              </>
            )}
            {m9Regime === 'RATE_CUT' && (
              <>
                <p><strong className="text-emerald-400">Rate-Sensitive Tailwinds:</strong> NBFCs, Real Estate, and Auto EMI affordability improve as funding costs ease.</p>
                <p><strong className="text-amber-300">Bank NIM Nuance:</strong> Floating-rate loans often reprice faster than term deposits, briefly compressing bank Net Interest Margins before credit volume picks up.</p>
              </>
            )}
            {m9Regime === 'INR_WEAK' && (
              <>
                <p><strong className="text-emerald-400">Exporter Tailwind:</strong> Indian IT Services and USD-billing Pharma earn more ₹ per US dollar billed (subject to hedges and US demand).</p>
                <p><strong className="text-rose-400">Importer Headwind:</strong> Firms importing crude, electronics, or carrying unhedged foreign-currency debt face higher ₹ costs.</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* 10. CANDLESTICK ANATOMY & PATTERN COMPARE */}
      {kind === 'CANDLESTICK_ANATOMY_COMPARE' && (() => {
        const presets = {
          HAMMER: {
            label: 'Bullish Hammer (at Support)',
            open: 1505,
            high: 1514,
            low: 1465,
            close: 1512,
            bullish: true,
            desc: 'Long lower shadow (≥2× real body) shows aggressive seller push to ₹1,465 was absorbed by buyers who closed price near the session high.',
          },
          SHOOTING_STAR: {
            label: 'Shooting Star (at Resistance)',
            open: 1512,
            high: 1558,
            low: 1502,
            close: 1505,
            bullish: false,
            desc: 'Long upper shadow rejects ₹1,558 overhead supply, closing back near session lows.',
          },
          BULL_ENGULF: {
            label: 'Bullish Engulfing (2-Bar Reversal)',
            open: 1485,
            high: 1532,
            low: 1480,
            close: 1528,
            bullish: true,
            desc: 'Green real body completely engulfs the prior red candle’s real body, signalling strong buyer takeover.',
          },
          DOJI: {
            label: 'Long-Legged Doji (Indecision)',
            open: 1510,
            high: 1542,
            low: 1478,
            close: 1511,
            bullish: true,
            desc: 'Open ≈ Close after wide two-way excursion—neither bulls nor bears achieved decisive control.',
          },
        };
        const p = presets[m10Pattern];
        const minP = 1460;
        const maxP = 1565;
        const toY = (val: number) => 170 - ((val - minP) / (maxP - minP)) * 150;
        const yHigh = toY(p.high);
        const yLow = toY(p.low);
        const yOpen = toY(p.open);
        const yClose = toY(p.close);
        const bodyTop = Math.min(yOpen, yClose);
        const bodyHeight = Math.max(4, Math.abs(yClose - yOpen));

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(presets) as Array<keyof typeof presets>).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setM10Pattern(k)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                      m10Pattern === k
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    {k.replace('_', ' ')}
                  </button>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                <div className="font-bold text-white">{p.label}</div>
                <p className="text-slate-300">{p.desc}</p>
                <div className="font-mono text-[11px] text-indigo-300 pt-1">
                  O: ₹{p.open} • H: ₹{p.high} • L: ₹{p.low} • C: ₹{p.close}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-200">
                {m10HoveredPart}
              </div>
            </div>
            <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 flex justify-center">
              <svg viewBox="0 0 260 190" className="w-full max-w-[260px] h-44">
                {/* Optional prior red bar for Engulfing */}
                {m10Pattern === 'BULL_ENGULF' && (
                  <g opacity="0.85">
                    <line x1="75" y1={toY(1518)} x2="75" y2={toY(1488)} stroke="#f43f5e" strokeWidth="2" />
                    <rect
                      x="63"
                      y={toY(1512)}
                      width="24"
                      height={Math.abs(toY(1492) - toY(1512))}
                      fill="#f43f5e"
                      rx="2"
                    />
                    <text x="75" y="184" textAnchor="middle" fill="#94a3b8" fontSize="9">
                      Prior Bar
                    </text>
                  </g>
                )}
                {/* Upper Wick */}
                <line
                  x1="145"
                  y1={yHigh}
                  x2="145"
                  y2={bodyTop}
                  stroke={p.bullish ? '#10b981' : '#f43f5e'}
                  strokeWidth="4"
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setM10HoveredPart(`Upper Shadow (High ₹${p.high}): Price traded up here intraday before sellers pushed it back down.`)
                  }
                />
                {/* Lower Wick */}
                <line
                  x1="145"
                  y1={bodyTop + bodyHeight}
                  x2="145"
                  y2={yLow}
                  stroke={p.bullish ? '#10b981' : '#f43f5e'}
                  strokeWidth="4"
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setM10HoveredPart(`Lower Shadow (Low ₹${p.low}): Sellers tested this low before buyers stepped in to lift price.`)
                  }
                />
                {/* Real Body */}
                <rect
                  x="125"
                  y={bodyTop}
                  width="40"
                  height={bodyHeight}
                  fill={p.bullish ? '#10b981' : '#f43f5e'}
                  rx="3"
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setM10HoveredPart(
                      `Real Body (Open ₹${p.open} → Close ₹${p.close}): Net ${
                        p.bullish ? 'bullish gain' : 'bearish drop'
                      } over the session.`
                    )
                  }
                />
                <text x="175" y={yHigh + 4} fill="#cbd5e1" fontSize="10" fontFamily="monospace">
                  High ₹{p.high}
                </text>
                <text x="175" y={yClose + 3} fill="#34d399" fontSize="10" fontFamily="monospace">
                  Close ₹{p.close}
                </text>
                <text x="175" y={yLow + 4} fill="#cbd5e1" fontSize="10" fontFamily="monospace">
                  Low ₹{p.low}
                </text>
              </svg>
            </div>
          </div>
        );
      })()}

      {/* 11. SUPPORT/RESISTANCE ZONES & POLARITY */}
      {kind === 'SUPPORT_RESISTANCE_ZONES' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setM11ShowZones((v) => !v)}
              className={`px-3 py-1 rounded-lg border font-bold cursor-pointer ${
                m11ShowZones ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-300 border-slate-800'
              }`}
            >
              {m11ShowZones ? 'Hide S/R Zones' : 'Show S/R Zones'}
            </button>
            <button
              type="button"
              onClick={() => setM11ShowPolarity((v) => !v)}
              className={`px-3 py-1 rounded-lg border font-bold cursor-pointer ${
                m11ShowPolarity ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-slate-300 border-slate-800'
              }`}
            >
              {m11ShowPolarity ? 'Role Reversal Annotated' : 'Annotate Polarity Flip'}
            </button>
          </div>
          <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
            <svg viewBox="0 0 600 180" className="w-full h-44">
              {m11ShowZones && (
                <>
                  <rect x="20" y="72" width="560" height="16" fill="#6366f1" fillOpacity="0.18" />
                  <line x1="20" y1="80" x2="580" y2="80" stroke="#818cf8" strokeDasharray="5 4" />
                  <rect x="20" y="136" width="280" height="14" fill="#10b981" fillOpacity="0.16" />
                </>
              )}
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3"
                points="30,142 95,82 155,138 225,79 280,118 355,42 425,78 510,28 565,40"
              />
              {m11ShowPolarity && (
                <>
                  <text x="95" y="68" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="bold">
                    Resistance #1
                  </text>
                  <text x="225" y="68" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="bold">
                    Resistance #2
                  </text>
                  <circle cx="425" cy="78" r="6" fill="#10b981" />
                  <text x="435" y="102" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="bold">
                    Polarity Flip → Support!
                  </text>
                </>
              )}
            </svg>
          </div>
        </div>
      )}

      {/* 12. INDICATOR OVERLAY LAB */}
      {kind === 'INDICATOR_OVERLAY_LAB' && (
        <div className="space-y-3 text-xs">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setM12Regime('TREND')}
              className={`px-3 py-1.5 rounded-lg border font-bold cursor-pointer ${
                m12Regime === 'TREND' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-slate-300 border-slate-800'
              }`}
            >
              Trending Market (EMA Shines)
            </button>
            <button
              type="button"
              onClick={() => setM12Regime('CHOP')}
              className={`px-3 py-1.5 rounded-lg border font-bold cursor-pointer ${
                m12Regime === 'CHOP' ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-900 text-slate-300 border-slate-800'
              }`}
            >
              Sideways Chop (MA Whipsaws)
            </button>
          </div>
          <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
            <svg viewBox="0 0 600 150" className="w-full h-36">
              {m12Regime === 'TREND' ? (
                <>
                  <polyline
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="2.5"
                    points="20,130 90,112 140,118 220,88 270,96 360,58 420,66 520,28 580,22"
                  />
                  <polyline
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    points="20,135 140,120 270,99 420,70 580,34"
                  />
                  <text x="440" y="95" fill="#a5b4fc" fontSize="11">
                    20 EMA acts as dynamic trend filter; RSI stays 60–78 without reversing!
                  </text>
                </>
              ) : (
                <>
                  <polyline
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="2.5"
                    points="20,75 80,45 140,105 200,48 260,102 320,46 380,104 440,50 500,100 570,68"
                  />
                  <line x1="20" y1="75" x2="570" y2="75" stroke="#818cf8" strokeWidth="2" strokeDasharray="4 3" />
                  <text x="300" y="135" textAnchor="middle" fill="#fde68a" fontSize="11">
                    In flat sideways ranges, moving-average crossovers whip-saw repeatedly—respect range S/R boundaries!
                  </text>
                </>
              )}
            </svg>
          </div>
        </div>
      )}

      {/* 13. BOS / CHOCH / FVG */}
      {kind === 'MARKET_STRUCTURE_BOS_CHOCH' && (
        <div className="space-y-3 text-xs">
          <div className="flex flex-wrap gap-2">
            {(['BOS', 'CHOCH', 'FVG'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setM13Mode(m)}
                className={`px-3 py-1.5 rounded-lg border font-bold cursor-pointer ${
                  m13Mode === m ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-300 border-slate-800'
                }`}
              >
                {m === 'BOS' ? 'Bullish BOS (Continuation)' : m === 'CHOCH' ? 'Bearish CHoCH (Shift)' : '3-Candle Bullish FVG'}
              </button>
            ))}
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-slate-200">
            {m13Mode === 'BOS' &&
              'Uptrend HH + HL sequence: Price closes decisively above the prior Swing High → Break of Structure (BOS) confirms trend continuation.'}
            {m13Mode === 'CHOCH' &&
              'After making a High, aggressive selling closes decisively below the most recent protected Higher Low → Change of Character (CHoCH) warns the uptrend leg has broken.'}
            {m13Mode === 'FVG' &&
              '3-Candle Displacement: Candle 2 surges so strongly that Candle 3’s Low remains strictly above Candle 1’s High—marking an un-overlapped Fair Value Gap zone.'}
          </div>
        </div>
      )}

      {/* 14. PRICE + OI MATRIX & PCR */}
      {kind === 'PRICE_OI_PARTICIPATION_MATRIX' && (() => {
        const regime =
          m14PriceDir === 'UP' && m14OiDir === 'UP'
            ? { title: 'Long Buildup', color: 'text-emerald-400', desc: 'Rising price + rising OI: fresh long contracts initiated aggressively.' }
            : m14PriceDir === 'DOWN' && m14OiDir === 'UP'
            ? { title: 'Short Buildup', color: 'text-rose-400', desc: 'Falling price + rising OI: fresh bearish short contracts opened.' }
            : m14PriceDir === 'UP' && m14OiDir === 'DOWN'
            ? { title: 'Short Covering', color: 'text-amber-300', desc: 'Rising price + falling OI: existing short sellers buying back contracts to exit.' }
            : { title: 'Long Unwinding', color: 'text-orange-300', desc: 'Falling price + falling OI: existing longs liquidating positions.' };

        const pcr = m14CallOiLakh > 0 ? m14PutOiLakh / m14CallOiLakh : 0;

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setM14PriceDir(m14PriceDir === 'UP' ? 'DOWN' : 'UP')}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 font-bold text-white cursor-pointer"
                >
                  Futures Price: {m14PriceDir === 'UP' ? '↑ Rising' : '↓ Falling'}
                </button>
                <button
                  type="button"
                  onClick={() => setM14OiDir(m14OiDir === 'UP' ? 'DOWN' : 'UP')}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 font-bold text-white cursor-pointer"
                >
                  Open Interest: {m14OiDir === 'UP' ? '↑ Rising' : '↓ Falling'}
                </button>
              </div>
              <div>
                <div className={`text-base font-black ${regime.color}`}>{regime.title}</div>
                <p className="text-slate-300 mt-1">{regime.desc}</p>
              </div>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white">Put-Call Ratio (PCR-OI) Calculator</div>
              <label className="block text-slate-300">
                Total Put OI: <strong className="font-mono text-white">{m14PutOiLakh} Lakh</strong>
                <input
                  type="range"
                  min={50}
                  max={220}
                  value={m14PutOiLakh}
                  onChange={(e) => setM14PutOiLakh(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </label>
              <label className="block text-slate-300">
                Total Call OI: <strong className="font-mono text-white">{m14CallOiLakh} Lakh</strong>
                <input
                  type="range"
                  min={50}
                  max={220}
                  value={m14CallOiLakh}
                  onChange={(e) => setM14CallOiLakh(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </label>
              <div className="pt-1 font-mono text-indigo-300 font-bold">
                PCR (OI) = {m14PutOiLakh} / {m14CallOiLakh} = {pcr.toFixed(2)}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 15. OPTIONS PAYOFF & GREEKS */}
      {kind === 'OPTIONS_PAYOFF_GREEKS' && (() => {
        const pts = m15Data.expiryPoints;
        const maxAbs = Math.max(15000, ...pts.map((p) => Math.abs(p.pnlPerLot)));
        const svgPath = pts
          .map((pt, idx) => {
            const x = 30 + (idx / (pts.length - 1)) * 540;
            const y = 85 - (pt.pnlPerLot / maxAbs) * 65;
            return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
          })
          .join(' ');

        return (
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap gap-2">
              {(['BUY', 'SELL'] as const).map((act) => (
                <button
                  key={act}
                  type="button"
                  onClick={() => setM15Action(act)}
                  className={`px-3 py-1.5 rounded-lg font-bold border cursor-pointer ${
                    m15Action === act ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-300 border-slate-800'
                  }`}
                >
                  {act} Option
                </button>
              ))}
              {(['CE', 'PE'] as const).map((tp) => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setM15Type(tp)}
                  className={`px-3 py-1.5 rounded-lg font-bold border cursor-pointer ${
                    m15Type === tp ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-slate-300 border-slate-800'
                  }`}
                >
                  {tp === 'CE' ? 'Call (CE)' : 'Put (PE)'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="text-slate-300">
                Spot: <strong className="font-mono text-white">{m15Spot}</strong>
                <input
                  type="range"
                  min={23800}
                  max={25200}
                  step={50}
                  value={m15Spot}
                  onChange={(e) => setM15Spot(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </label>
              <label className="text-slate-300">
                Strike: <strong className="font-mono text-white">{m15Strike}</strong>
                <input
                  type="range"
                  min={23800}
                  max={25200}
                  step={50}
                  value={m15Strike}
                  onChange={(e) => setM15Strike(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </label>
              <label className="text-slate-300">
                Days to Expiry: <strong className="font-mono text-amber-300">{m15Dte}d</strong>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={m15Dte}
                  onChange={(e) => setM15Dte(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </label>
              <label className="text-slate-300">
                Implied Vol (IV): <strong className="font-mono text-emerald-400">{m15Iv}%</strong>
                <input
                  type="range"
                  min={9}
                  max={38}
                  value={m15Iv}
                  onChange={(e) => setM15Iv(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block">Est. Premium</span>
                <span className="font-mono font-bold text-white">₹{m15Data.premium}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Intrinsic / Time</span>
                <span className="font-mono text-slate-200">
                  ₹{m15Data.intrinsic} / ₹{m15Data.timeVal}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Expiry Breakeven</span>
                <span className="font-mono font-bold text-indigo-300">{m15Data.breakeven}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Delta (Δ)</span>
                <span className="font-mono font-bold text-emerald-400">{m15Data.delta}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Theta (Θ/day)</span>
                <span className={`font-mono font-bold ${m15Data.theta < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {m15Data.theta}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Vega (ν/1% IV)</span>
                <span className="font-mono font-bold text-amber-300">{m15Data.vega}</span>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Expiry Payoff Diagram (1 NIFTY Lot = 75 qty)</span>
                <span className="font-mono">Educational Black-Scholes Sensitivity Model</span>
              </div>
              <svg viewBox="0 0 600 170" className="w-full h-36">
                <line x1="30" y1="85" x2="570" y2="85" stroke="#475569" strokeDasharray="4 4" />
                <path d={svgPath} fill="none" stroke="#818cf8" strokeWidth="3" />
                <text x="35" y="78" fill="#94a3b8" fontSize="10">
                  ₹0 Breakeven Line
                </text>
                <text x="30" y="162" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                  {m15Strike - 800}
                </text>
                <text x="300" y="162" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontFamily="monospace">
                  Strike {m15Strike}
                </text>
                <text x="570" y="162" textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                  {m15Strike + 800}
                </text>
              </svg>
            </div>
          </div>
        );
      })()}

      {/* 16. POSITION SIZING & R:R */}
      {kind === 'POSITION_SIZING_EXPECTANCY' && (() => {
        const validLong = m16Entry > m16Stop && m16Target > m16Entry;
        const maxRupeeLoss = (m16Capital * m16RiskPct) / 100;
        const stopDist = m16Entry - m16Stop;
        const rewardDist = m16Target - m16Entry;
        const riskBasedShares = validLong ? Math.floor(maxRupeeLoss / stopDist) : 0;
        const cashCappedShares = validLong ? Math.min(riskBasedShares, Math.floor(m16Capital / m16Entry)) : 0;
        const rr = validLong && stopDist > 0 ? rewardDist / stopDist : 0;

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Account Capital (₹)</span>
                <input
                  type="number"
                  value={m16Capital}
                  onChange={(e) => setM16Capital(Math.max(10000, Number(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono mt-1"
                />
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Max Risk % / Trade</span>
                <input
                  type="number"
                  step="0.25"
                  value={m16RiskPct}
                  onChange={(e) => setM16RiskPct(Math.max(0.25, Math.min(5, Number(e.target.value) || 1)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono mt-1"
                />
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Planned Long Entry (₹)</span>
                <input
                  type="number"
                  value={m16Entry}
                  onChange={(e) => setM16Entry(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono mt-1"
                />
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Invalidation Stop (₹)</span>
                <input
                  type="number"
                  value={m16Stop}
                  onChange={(e) => setM16Stop(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono mt-1"
                />
              </div>
              <div className="col-span-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Planned Target (₹)</span>
                <input
                  type="number"
                  value={m16Target}
                  onChange={(e) => setM16Target(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono mt-1"
                />
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-2">
              {!validLong ? (
                <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-200">
                  <strong>Validation Error:</strong> For a Long trade, Entry Price (₹{m16Entry}) must be strictly greater than Stop-Loss (₹{m16Stop}), and Target (₹{m16Target}) must exceed Entry!
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Allowed Loss ({m16RiskPct}%):</span>
                    <span className="font-mono font-bold text-rose-300">₹{maxRupeeLoss.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Risk per Share (Entry − Stop):</span>
                    <span className="font-mono font-bold text-white">₹{stopDist.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Formula Position Size:</span>
                    <span className="font-mono font-black text-emerald-400 text-sm">
                      {cashCappedShares} Shares
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Capital Deployed:</span>
                    <span className="font-mono text-slate-200">
                      ₹{(cashCappedShares * m16Entry).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Reward-to-Risk Ratio:</span>
                    <span className={`font-mono font-bold ${rr >= 2 ? 'text-emerald-400' : 'text-amber-300'}`}>
                      1 : {rr.toFixed(2)} ({rr.toFixed(2)}R)
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
