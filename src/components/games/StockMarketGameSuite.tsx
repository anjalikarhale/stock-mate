import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Award,
  RotateCcw,
  CheckCircle2,
  XCircle,
  BookOpen,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import { EducationalGameId, AppMode } from '../../types';
import { useGame } from '../../context/GameContext';
import { marketApi, OptionChainPayload } from '../../services/marketApi';
import { soundEffects } from '../../utils/audio';

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

interface ChallengeQuestion {
  id: string;
  difficulty: Difficulty;
  title: string;
  contextBadge: string;
  visualData?: {
    type: 'CANDLES' | 'TREND_LINE' | 'METRICS';
    candles?: { o: number; h: number; l: number; c: number; label?: string }[];
    points?: number[];
    metrics?: { label: string; value: string }[];
  };
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  caveat: string;
}

export interface EducationalGameMeta {
  id: EducationalGameId;
  code: string;
  title: string;
  moduleId: string;
  moduleRefLabel: string;
  summary: string;
  instructions: string;
  dataLabel: string;
  xpReward: number;
}

export const STOCK_MARKET_8_GAMES: EducationalGameMeta[] = [
  {
    id: 'candlestick-detective',
    code: 'Game A',
    title: 'Candlestick Detective',
    moduleId: 'module-10',
    moduleRefLabel: 'Module 10 • Candlestick Charts',
    summary: 'Inspect OHLC wicks, real bodies, and S/R location context to separate genuine auction rejections from mid-range noise.',
    instructions: 'Examine the candlestick OHLC geometry and where it formed relative to support/resistance. Choose the most disciplined interpretation.',
    dataLabel: 'EDUCATIONAL_SCENARIO',
    xpReward: 90,
  },
  {
    id: 'bull-vs-bear-market',
    code: 'Game B',
    title: 'Bull vs Bear Market',
    moduleId: 'module-11',
    moduleRefLabel: 'Module 11 • Trends, Support & Resistance',
    summary: 'Classify HH/HL uptrends, LH/LL downtrends, sideways ranges, polarity role reversals, and false breakout traps.',
    instructions: 'Study the swing progression and volume notes, then classify the structural market regime and invalidation zone.',
    dataLabel: 'EDUCATIONAL_SCENARIO',
    xpReward: 90,
  },
  {
    id: 'trade-decision-simulator',
    code: 'Game C',
    title: 'Trade Decision Simulator',
    moduleId: 'module-4',
    moduleRefLabel: 'Modules 4 & 16 • Order Execution & System Rules',
    summary: 'Choose Market vs Limit vs Stop-Loss orders across tight and wide NSE order books while factoring in STT and slippage.',
    instructions: 'Evaluate bid-ask depth, urgency, and invalidation rules to select the optimal order execution decision.',
    dataLabel: 'EDUCATIONAL_SCENARIO',
    xpReward: 100,
  },
  {
    id: 'portfolio-builder',
    code: 'Game D',
    title: 'Portfolio Builder',
    moduleId: 'module-5',
    moduleRefLabel: 'Modules 5 & 16 • Asset Allocation & Correlation',
    summary: 'Construct resilient Indian portfolios across Equity sectors, Debt/Liquid funds, and Gold matched to real financial horizons.',
    instructions: 'Match capital allocation and sector diversification to investor goals, emergency reserves, and correlation limits.',
    dataLabel: 'EDUCATIONAL_SCENARIO',
    xpReward: 100,
  },
  {
    id: 'risk-manager-challenge',
    code: 'Game E',
    title: 'Risk Manager Challenge',
    moduleId: 'module-16',
    moduleRefLabel: 'Module 16 • Position Sizing & Expectancy',
    summary: 'Compute exact share quantity using Max Loss ÷ (Entry − Stop), validate Entry > Stop, and enforce portfolio heat caps.',
    instructions: 'Calculate position size, R-multiples, drawdown recovery math, and expectancy before any capital is risked.',
    dataLabel: 'EDUCATIONAL_SCENARIO',
    xpReward: 110,
  },
  {
    id: 'option-chain-explorer',
    code: 'Game F',
    title: 'Option Chain Explorer',
    moduleId: 'module-15',
    moduleRefLabel: 'Module 15 • Futures & Options',
    summary: 'Read NIFTY/BANKNIFTY Calls & Puts, ITM/ATM/OTM moneyness, Intrinsic vs Time Value, IV crush, Theta decay, and PCR.',
    instructions: 'Inspect the live/simulated NIFTY Option Chain snapshot above the question and solve real derivatives mechanics problems.',
    dataLabel: 'LIVE_OR_SIMULATED_CHAIN',
    xpReward: 120,
  },
  {
    id: 'market-crash-survival',
    code: 'Game G',
    title: 'Market Crash Survival',
    moduleId: 'module-9',
    moduleRefLabel: 'Modules 5, 9 & 16 • Macro Shocks & Drawdown Control',
    summary: 'Navigate sudden macro shocks, circuit limits, gap openings, and panic drawdowns without revenge trading or leverage.',
    instructions: 'Make disciplined capital-preservation choices during multi-stage market turmoil.',
    dataLabel: 'HISTORICAL_REGIME_SIMULATION',
    xpReward: 110,
  },
  {
    id: 'fundamental-analysis-challenge',
    code: 'Game H',
    title: 'Fundamental Analysis Challenge',
    moduleId: 'module-7',
    moduleRefLabel: 'Modules 6, 7 & 8 • Statements, Ratios & Valuation',
    summary: 'Audit CFO vs PAT cash conversion, ROE vs ROCE debt traps, promoter share pledging, and DCF/DDM (r > g) scenarios.',
    instructions: 'Inspect the financial statement metrics and identify true business quality versus accounting or valuation traps.',
    dataLabel: 'FUNDAMENTAL_CASE_STUDY',
    xpReward: 120,
  },
];

const GAME_QUESTIONS_BANK: Record<EducationalGameId, ChallengeQuestion[]> = {
  'candlestick-detective': [
    {
      id: 'cd-1',
      difficulty: 'Beginner',
      title: 'Pullback into Tested ₹1,400 Demand Zone',
      contextBadge: 'NSE Daily Chart • At 6-Month Support Zone',
      visualData: {
        type: 'CANDLES',
        candles: [
          { o: 1465, h: 1470, l: 1435, c: 1440, label: 'T-2' },
          { o: 1438, h: 1442, l: 1408, c: 1412, label: 'T-1' },
          { o: 1410, h: 1422, l: 1372, c: 1419, label: 'Today' },
        ],
      },
      prompt: 'Today’s bar opened at ₹1,410, sold off intraday to ₹1,372, and closed near highs at ₹1,419 on 2× volume at a major ₹1,400 support zone. What does this signify?',
      options: [
        'Bearish Shooting Star signalling overhead supply',
        'Bullish Hammer rejection at support: sellers pushed below ₹1,400 intraday, but buyers absorbed supply and closed strong',
        'Guaranteed profit with zero risk of falling below ₹1,372',
        'Low-volatility Doji with zero range',
      ],
      correctIndex: 1,
      explanation: 'Real body is ₹9 (1410→1419) while lower wick is ₹38 (>4× body) right at multi-month demand—classic Hammer rejection.',
      caveat: 'Even strong Hammers fail if follow-through selling breaks ₹1,372; always place invalidation below the wick low.',
    },
    {
      id: 'cd-2',
      difficulty: 'Intermediate',
      title: 'Vertical Rally into ₹920 Resistance Band',
      contextBadge: 'NSE Daily Chart • Extended Rally into Supply',
      visualData: {
        type: 'CANDLES',
        candles: [
          { o: 855, h: 882, l: 852, c: 880, label: 'T-2' },
          { o: 882, h: 912, l: 880, c: 909, label: 'T-1' },
          { o: 912, h: 954, l: 904, c: 906, label: 'Today' },
        ],
      },
      prompt: 'After a sharp 3-week surge into ₹920 resistance, Today’s candle hits ₹954 intraday before sellers slam the close down to ₹906. How should a trader read this?',
      options: [
        'Bullish breakout confirmation to buy on leverage',
        'Shooting Star upper-wick supply rejection at resistance—warn against chasing longs into overhead supply',
        'Bullish Engulfing continuation',
        'Proof that company EPS doubled today',
      ],
      correctIndex: 1,
      explanation: 'A ₹42 upper shadow closing red back below the ₹920 ceiling shows aggressive profit-taking and supply rejection.',
      caveat: 'Wait for structural confirmation before initiating counter-trend shorts against a strong primary uptrend.',
    },
    {
      id: 'cd-3',
      difficulty: 'Advanced',
      title: 'Mid-Range Hammer Without Location Context',
      contextBadge: '15-Min Intraday • Choppy Mid-Range Lunch Session',
      visualData: {
        type: 'CANDLES',
        candles: [
          { o: 502, h: 505, l: 498, c: 500, label: '12:15' },
          { o: 500, h: 504, l: 499, c: 503, label: '12:30' },
          { o: 503, h: 504, l: 496, c: 503.5, label: '12:45' },
        ],
      },
      prompt: 'A stock is stuck sideways between ₹480 support and ₹525 resistance on 0.4× volume. At ₹503 (dead center of the range), a small hammer-shaped bar prints. Best action?',
      options: [
        'Go all-in Market Buy because every Hammer has an 85% win rate anywhere',
        'Stand aside: a candlestick shape in the middle of a low-volume range lacks S/R location edge and offers poor Reward:Risk',
        'Buy weekly OTM Calls expiring today',
        'Double position size to compensate for narrow range',
      ],
      correctIndex: 1,
      explanation: 'Module 10 core principle: Candlestick geometry without trend, key S/R zone location, and volume confirmation is random auction noise.',
      caveat: 'Patience to skip low-edge mid-range setups preserves both capital and brokerage.',
    },
  ],

  'bull-vs-bear-market': [
    {
      id: 'bb-1',
      difficulty: 'Beginner',
      title: 'Swing High & Swing Low Sequence',
      contextBadge: 'Daily Swing Structure',
      visualData: {
        type: 'TREND_LINE',
        points: [410, 455, 430, 485, 458, 520, 492, 548],
      },
      prompt: 'Swing Lows print at ₹410 → ₹430 → ₹458 → ₹492, and Swing Highs print at ₹455 → ₹485 → ₹520 → ₹548. What market regime is active?',
      options: [
        'Primary Downtrend (LH + LL)',
        'Intact Uptrend (Higher Highs + Higher Lows)',
        'Horizontal Range Compression',
        'Confirmed Head & Shoulders Top',
      ],
      correctIndex: 1,
      explanation: 'Rising peaks (HH) paired with rising troughs (HL) objectively define an intact Uptrend.',
      caveat: 'Red pullback days from ₹520 to ₹492 are normal healthy pullbacks—not trend reversals—until the protected Higher Low breaks.',
    },
    {
      id: 'bb-2',
      difficulty: 'Intermediate',
      title: 'Breakout & Polarity Retest',
      contextBadge: '6-Month Resistance Band ₹795–₹805',
      visualData: {
        type: 'TREND_LINE',
        points: [740, 801, 755, 803, 772, 848, 802, 835],
      },
      prompt: 'Price failed twice at ₹795–₹805, then broke out to ₹848 on 3× average volume, pulled back calmly to ₹802, and printed bullish rejection. What concept is at work?',
      options: [
        'Polarity (Role Reversal): former ₹795–₹805 Resistance ceiling acting as potential new Support zone',
        'Long Unwinding crash',
        'Bearish Descending Triangle breakdown',
        'Delisting notice',
      ],
      correctIndex: 0,
      explanation: 'Decisively broken resistance zones frequently flip into demand zones on first low-volume retest.',
      caveat: 'If price closes decisively back below ₹790 on heavy volume, treat the breakout as a failed Bull Trap and honour your stop.',
    },
    {
      id: 'bb-3',
      difficulty: 'Advanced',
      title: 'Low-Volume Poke Above Equal Highs (Bull Trap)',
      contextBadge: 'Range Ceiling ₹1,200 • Relative Volume 0.5×',
      visualData: {
        type: 'TREND_LINE',
        points: [1120, 1198, 1140, 1200, 1150, 1212, 1168, 1145],
      },
      prompt: 'Price pokes intraday to ₹1,212 above ₹1,200 resistance on weak 0.5× volume, then reverses sharply to close at ₹1,168 back inside the range. How do you classify this?',
      options: [
        'Confirmed multi-year breakout—average down aggressively',
        'Failed breakout / Liquidity Sweep (Bull Trap): lack of volume follow-through and weak close back inside range invalidate breakout longs',
        'Bullish Flag continuation',
        'Guaranteed 50% rally tomorrow',
      ],
      correctIndex: 1,
      explanation: 'A brief wick above resistance without volume expansion that closes back inside the range traps impulsive breakout buyers.',
      caveat: 'Requiring a strong candle close + volume expansion filters many intraday bull traps.',
    },
  ],

  'trade-decision-simulator': [
    {
      id: 'td-1',
      difficulty: 'Beginner',
      title: 'Wide Spread Mid-Cap Entry Control',
      contextBadge: 'Best Bid ₹642.00 | Best Ask ₹649.50 (Thin Depth)',
      visualData: {
        type: 'METRICS',
        metrics: [
          { label: 'LTP', value: '₹644.00' },
          { label: 'Best Bid', value: '₹642.00 (30 sh)' },
          { label: 'Best Ask', value: '₹649.50 (20 sh)' },
          { label: 'Next Ask', value: '₹656.00 (40 sh)' },
        ],
      },
      prompt: 'You want to buy 80 shares for a swing setup, and your Reward:Risk math breaks if your entry exceeds ₹645.00. Which order do you place?',
      options: [
        'Market Buy Order for 80 shares immediately',
        'Limit Buy Order at ₹645.00 for 80 shares',
        'Market Sell Order for 80 shares',
        'No stop-loss Market Buy at 09:15:01 IST',
      ],
      correctIndex: 1,
      explanation: 'A Market Buy for 80 shares would sweep ₹649.50, ₹656.00, and higher levels—creating massive slippage. A Limit Buy at ₹645 caps your worst-case fill price.',
      caveat: 'With a Limit Order, price is guaranteed (≤ ₹645), though fill is not guaranteed if sellers never come down to ₹645.',
    },
    {
      id: 'td-2',
      difficulty: 'Intermediate',
      title: 'Overtrading Micro-Scalps vs Statutory Friction',
      contextBadge: 'Intraday Churn • 25 Round-Trips/Day',
      visualData: {
        type: 'METRICS',
        metrics: [
          { label: 'Avg Gross Gain/Trade', value: '₹42' },
          { label: 'Brokerage + GST + STT + Stamp', value: '₹58 / round-trip' },
          { label: 'Avg Bid-Ask Slippage', value: '₹18 / round-trip' },
          { label: 'Net Expectancy / Trade', value: '−₹34' },
        ],
      },
      prompt: 'A student boasts a 58% gross win rate scalping tiny ₹0.20 moves 25 times a day, yet their Demat ledger shrinks every week. Why?',
      options: [
        'NSE miscalculated T+1 settlement',
        'Negative Net Expectancy: ₹76 per-trade friction (statutory STT, stamp duty, brokerage, GST + slippage) exceeds the ₹42 gross edge',
        'Because RSI period was 14 instead of 13',
        'Because delivery DP charges apply to intraday trades',
      ],
      correctIndex: 1,
      explanation: 'Every trade must have positive expectancy NET of Indian statutory charges (STT, exchange fees, SEBI fee, stamp duty, GST, brokerage) and slippage.',
      caveat: 'Fewer, higher-timeframe setups with larger R-multiples dramatically reduce transaction-cost drag.',
    },
    {
      id: 'td-3',
      difficulty: 'Advanced',
      title: 'Handling a Losing Intraday Trade Hitting Stop-Loss',
      contextBadge: 'Planned Entry ₹1,100 | Planned Stop ₹1,080 | Current ₹1,079',
      visualData: {
        type: 'METRICS',
        metrics: [
          { label: 'Trade Type', value: 'Intraday Momentum' },
          { label: 'Invalidation Stop', value: '₹1,080 (Triggered)' },
          { label: 'Planned Risk (1R)', value: '₹1,000' },
          { label: 'Temptation', value: 'Convert to Delivery & Remove Stop' },
        ],
      },
      prompt: 'Your intraday trade hits its ₹1,080 technical invalidation level. You feel tempted to cancel the stop and “convert to long-term delivery investment” so you don’t book a ₹1,000 loss. What is the disciplined decision?',
      options: [
        'Convert to delivery and double quantity at ₹1,060 without checking fundamentals',
        'Execute the planned ₹1,080 Stop-Loss exit immediately (limiting loss to 1R) and log the trade in your journal',
        'Buy NIFTY weekly Puts to revenge-recover ₹1,000 before 15:30 IST',
        'Delete the trading app until next quarter',
      ],
      correctIndex: 1,
      explanation: 'Never violate your timeframe or turn broken intraday trades into unplanned “investments” to soothe ego.',
      caveat: 'Small planned 1R losses are a routine operating cost of any rule-based trading system.',
    },
  ],

  'portfolio-builder': [
    {
      id: 'pb-1',
      difficulty: 'Beginner',
      title: 'Building the Pre-Investment Safety Foundation',
      contextBadge: 'Monthly Expenses ₹30,000 • Savings ₹1,80,000 • Emergency Fund ₹0',
      visualData: {
        type: 'METRICS',
        metrics: [
          { label: 'Essential Monthly Spend', value: '₹30,000' },
          { label: '6-Month Emergency Target', value: '₹1,80,000' },
          { label: 'Credit Card Debt', value: '₹0' },
          { label: 'Current Liquid Reserve', value: '₹0' },
        ],
      },
      prompt: 'Meera has ₹1,80,000 total savings and zero emergency reserve. How should she allocate this first ₹1,80,000?',
      options: [
        '100% into small-cap momentum stocks',
        'Prioritise building her 6-month Emergency Fund in safe liquid/FD instruments first; begin systematic equity SIPs from subsequent monthly surpluses',
        '50% BANKNIFTY options, 50% crypto',
        '100% into a single IPO stock',
      ],
      correctIndex: 1,
      explanation: 'Module 5 rule: Emergency liquidity comes first so you are never forced to liquidate equities at the bottom of a market crash.',
      caveat: 'Ensure health and term insurance are also in place before taking aggressive equity risk.',
    },
    {
      id: 'pb-2',
      difficulty: 'Intermediate',
      title: 'Spotting False Diversification (Sector Concentration)',
      contextBadge: '4-Stock Equity Portfolio • ₹4,00,000 Capital',
      visualData: {
        type: 'METRICS',
        metrics: [
          { label: 'Holding 1 (25%)', value: 'TCS (IT)' },
          { label: 'Holding 2 (25%)', value: 'Infosys (IT)' },
          { label: 'Holding 3 (25%)', value: 'Wipro (IT)' },
          { label: 'Holding 4 (25%)', value: 'HCL Tech (IT)' },
        ],
      },
      prompt: 'Why is this 4-stock portfolio poorly diversified despite owning four reputable NIFTY 50 companies?',
      options: [
        'Because four stocks is too many to track',
        '100% sector concentration in IT Services: a single global enterprise tech slowdown hits all four holdings simultaneously',
        'Because IT companies have high Debt/Equity',
        'Because NSE forbids owning more than two IT stocks',
      ],
      correctIndex: 1,
      explanation: 'Genuine diversification spreads capital across distinct economic drivers (e.g., Financials, IT, Consumer/Pharma, Industrials, plus Debt/Gold).',
      caveat: 'During severe liquidity panics, correlations across all equities rise toward 1.0—making multi-asset allocation (Debt + Gold) valuable.',
    },
    {
      id: 'pb-3',
      difficulty: 'Advanced',
      title: 'Disciplined Annual Portfolio Rebalancing',
      contextBadge: 'Target Mix: 65% Equity / 25% Debt / 10% Gold',
      visualData: {
        type: 'METRICS',
        metrics: [
          { label: 'Target Allocation', value: '65% Eq / 25% Debt / 10% Gold' },
          { label: 'After Strong Bull Run', value: '81% Eq / 13% Debt / 6% Gold' },
          { label: 'Investor Risk Tolerance', value: 'Moderate' },
          { label: 'Goal Horizon', value: '7 Years' },
        ],
      },
      prompt: 'After a 2-year bull rally, Equity weight drifted from 65% up to 81%. What does disciplined rebalancing prescribe?',
      options: [
        'Raise target equity to 100% because stocks only go up',
        'Trim excess equity gains or direct fresh inflows into Debt & Gold to restore the 65% / 25% / 10% risk budget (accounting for tax/exit loads)',
        'Sell all Equity to 0% and try to time the exact market top',
        'Borrow margin against equity holdings',
      ],
      correctIndex: 1,
      explanation: 'Rebalancing systematically trims stretched asset classes and adds to under-weight stabilizers, keeping portfolio volatility aligned with your risk profile.',
      caveat: 'Factor in STCG/LTCG tax thresholds and use fresh SIP inflows where possible to minimise tax friction.',
    },
  ],

  'risk-manager-challenge': [
    {
      id: 'rm-1',
      difficulty: 'Beginner',
      title: '1% Rule Position-Sizing Formula',
      contextBadge: 'Account ₹1,00,000 • Max Risk 1% (₹1,000)',
      visualData: {
        type: 'METRICS',
        metrics: [
          { label: 'Total Capital', value: '₹1,00,000' },
          { label: 'Max Planned Loss (1%)', value: '₹1,000' },
          { label: 'Planned Long Entry', value: '₹850' },
          { label: 'Technical Stop-Loss', value: '₹825' },
        ],
      },
      prompt: 'Using Position Size = Max Planned Loss ÷ (Entry − Stop), what is the exact share quantity allowed?',
      options: [
        '117 shares (spending all ₹1,00,000)',
        '40 shares: ₹1,000 ÷ (₹850 − ₹825) = ₹1,000 ÷ ₹25 = 40 shares (₹34,000 deployed)',
        '100 shares',
        '10 shares',
      ],
      correctIndex: 1,
      explanation: 'Risk per share = ₹850 − ₹825 = ₹25. Dividing ₹1,000 max allowed loss by ₹25 gives 40 shares.',
      caveat: 'Always verify both the risk limit (40 shares) AND available unleveraged cash (40 × ₹850 = ₹34,000 ≤ ₹1,00,000).',
    },
    {
      id: 'rm-2',
      difficulty: 'Intermediate',
      title: 'Evaluating System Expectancy vs Win Rate',
      contextBadge: '50 Logged Paper Trades • Net of Costs',
      visualData: {
        type: 'METRICS',
        metrics: [
          { label: 'Win Rate', value: '42%' },
          { label: 'Average Winner', value: '+2.8R (+₹2,800)' },
          { label: 'Loss Rate', value: '58%' },
          { label: 'Average Loser', value: '−1.0R (−₹1,000)' },
        ],
      },
      prompt: 'What is this trend-following system’s mathematical Expectancy per trade?',
      options: [
        'Negative expectancy because Win Rate is below 50%',
        '+0.596R (+₹596 per trade): (0.42 × 2.8R) − (0.58 × 1.0R) = 1.176R − 0.58R = +0.596R positive expectancy!',
        '0.00R breakeven',
        '−1.60R loss',
      ],
      correctIndex: 1,
      explanation: 'A system does NOT need a >50% win rate to be profitable when winners are meaningfully larger than controlled 1R losers.',
      caveat: 'With a 42% win rate, 5–7 consecutive losses are statistically normal—which is why 1% risk sizing is essential to stay emotionally calm.',
    },
    {
      id: 'rm-3',
      difficulty: 'Advanced',
      title: 'Correlated Portfolio Heat & Drawdown Math',
      contextBadge: '5 Open Swing Trades • All 5 in Mid-Cap PSU Banks',
      visualData: {
        type: 'METRICS',
        metrics: [
          { label: 'Risk per Trade', value: '1.5% each' },
          { label: 'Open Positions', value: '5 PSU Bank Stocks' },
          { label: 'Sector Correlation', value: '0.88 (Very High)' },
          { label: 'Overnight Gap-Down Risk', value: 'Active' },
        ],
      },
      prompt: 'A trader says “I am safe because each trade risks only 1.5%”, while holding 5 correlated PSU bank stocks simultaneously. What is the hidden danger?',
      options: [
        'None—correlation reduces risk to zero',
        'Concentrated Portfolio Heat: one RBI banking circular can gap all 5 stops down together for a >7.5%–12% single-morning hit',
        'PSU banks do not trade on NSE',
        'Stop-losses guarantee exact fill price during overnight gaps',
      ],
      correctIndex: 1,
      explanation: 'Five highly correlated positions in one industry act like a single oversized 7.5%+ risk bet, especially across overnight gap openings.',
      caveat: 'Cap both per-trade risk (≤1%) and total correlated sector risk (≤2–3% total heat).',
    },
  ],

  'option-chain-explorer': [
    {
      id: 'oc-1',
      difficulty: 'Beginner',
      title: 'Decomposing Intrinsic vs Time Value',
      contextBadge: 'NIFTY Spot = 24,540 • Lot Size = 75',
      visualData: {
        type: 'METRICS',
        metrics: [
          { label: 'NIFTY Spot', value: '24,540' },
          { label: 'Contract', value: '24,500 CE (Call)' },
          { label: 'Option LTP', value: '₹165.00' },
          { label: 'Days to Expiry', value: '5 Days' },
        ],
      },
      prompt: 'With NIFTY Spot at 24,540 and the 24,500 Call trading at ₹165, what are its Intrinsic Value and Extrinsic (Time) Value?',
      options: [
        'Intrinsic = ₹165; Time Value = ₹0',
        'Intrinsic = ₹40 (24,540 − 24,500); Extrinsic Time Value = ₹125 (₹165 − ₹40)',
        'Intrinsic = ₹0; Time Value = ₹165',
        'Intrinsic = ₹205; Time Value = −₹40',
      ],
      correctIndex: 1,
      explanation: 'Call Intrinsic = max(0, Spot − Strike) = 24,540 − 24,500 = ₹40. The remaining ₹125 is Extrinsic Time + Volatility value, which decays to ₹0 by expiry.',
      caveat: 'At expiry, NIFTY must finish above 24,665 (Strike 24,500 + ₹165 premium) for a Call buyer to break even before charges.',
    },
    {
      id: 'oc-2',
      difficulty: 'Intermediate',
      title: 'Post-Event IV Crush on Out-of-the-Money Options',
      contextBadge: 'Event Volatility Collapse • Vega & Theta Risk',
      visualData: {
        type: 'METRICS',
        metrics: [
          { label: 'Pre-Event Spot / IV', value: '24,400 / IV 25%' },
          { label: 'Bought Contract', value: '24,800 OTM CE @ ₹88' },
          { label: 'Post-Event Spot / IV', value: '24,480 (+80 pts) / IV 13%' },
          { label: 'Post-Event CE Price', value: '₹39 (−55% Loss!)' },
        ],
      },
      prompt: 'NIFTY rose +80 points as predicted, yet the 24,800 Call buyer lost 55% of their premium! Which mechanism explains this?',
      options: [
        'Exchange computer glitch',
        'IV Crush (negative Vega shock as IV fell 25% → 13%) plus Theta time decay overwhelmed the small Delta gain on a far-OTM strike',
        'Because Call options profit when NIFTY falls',
        'Because lot size changed mid-day',
      ],
      correctIndex: 1,
      explanation: 'Options price three dimensions: Direction (Delta), Time (Theta), and Implied Volatility (Vega). Post-event IV collapse crushes bloated extrinsic premiums.',
      caveat: 'Always check Implied Volatility percentile and breakeven distance—direction alone is not enough in options.',
    },
    {
      id: 'oc-3',
      difficulty: 'Advanced',
      title: 'Naked Option Writing Tail Risk & SEBI’s Empirical Study',
      contextBadge: 'Short Option Obligation • Margin & Gap Risk',
      visualData: {
        type: 'METRICS',
        metrics: [
          { label: 'Position', value: 'Short 2 Lots 24,500 PE @ ₹70' },
          { label: 'Max Possible Gain', value: 'Capped at ₹70 × 150 = ₹10,500' },
          { label: 'Overnight Global Shock', value: 'NIFTY Gaps Down −750 pts to 23,750' },
          { label: 'Opening Put Value', value: '~₹760+ (Loss > ₹1,03,500!)' },
        ],
      },
      prompt: 'Why is selling naked options to collect “easy Theta decay” perilous during unexpected gap shocks?',
      options: [
        'Option sellers have capped maximum loss at ₹70',
        'Asymmetric tail risk: max gain is capped at premium collected, while an overnight gap blows past intraday stop-losses and triggers massive margin losses',
        'Theta protects sellers from 800-point spot gaps',
        'SEBI reimburses option seller gap losses',
      ],
      correctIndex: 1,
      explanation: 'Intraday stop-losses cannot execute between 15:30 IST and 09:15 IST; a single 3% index gap wipes out months of small premium wins.',
      caveat: 'SEBI’s FY22–FY24 study found ~93% of retail F&O traders lost money net of costs.',
    },
  ],

  'market-crash-survival': [
    {
      id: 'mc-1',
      difficulty: 'Beginner',
      title: 'Shock Headline: Global Pandemic / Geopolitical Panic (−7% Gap)',
      contextBadge: 'Day 1 of Crash • NIFTY Opens −7% • India VIX Spikes +45%',
      visualData: {
        type: 'TREND_LINE',
        points: [100, 99, 101, 93, 89, 86],
      },
      prompt: 'Markets open sharply lower on panic headlines. You hold unleveraged quality companies + 6 months emergency cash + 25% debt allocation. What is the worst mistake right now?',
      options: [
        'Reviewing balance sheets calmly without panic',
        'Taking a personal loan or 4× broker margin to “catch the falling knife” on day 1 of a volatility spike',
        'Keeping your emergency fund untouched in bank deposits',
        'Checking whether company cash flows remain solvent',
      ],
      correctIndex: 1,
      explanation: 'Adding borrowed leverage during a VIX spike invites forced margin liquidation if the market drops another 15–20%.',
      caveat: 'Surviving a crash unleveraged preserves both financial and psychological capital.',
    },
    {
      id: 'mc-2',
      difficulty: 'Intermediate',
      title: 'Distinguishing Price Drawdown from Permanent Business Impairment',
      contextBadge: 'Broad Bear Market • NIFTY −24%',
      visualData: {
        type: 'METRICS',
        metrics: [
          { label: 'Company A', value: 'Zero Debt, Positive FCF, Stock −22%' },
          { label: 'Company B', value: 'Debt/Eq 3.4x, 82% Promoter Pledge, −55%' },
          { label: 'Liquidity Environment', value: 'Credit Tightening' },
          { label: 'Decision', value: 'Where is permanent ruin risk?' },
        ],
      },
      prompt: 'Both stocks fell during the market sell-off. Why is blindly “averaging down” on Company B (−55%) a classic bear-market trap?',
      options: [
        'Because −55% means a stock cannot fall any further',
        'Company B faces solvency & forced pledge-liquidation risk (a −55% stock can still fall another −80% from there!), whereas Company A has net cash survival power',
        'High promoter pledging guarantees a buyback',
        'Debt/Equity above 3x improves cash flow in a credit crunch',
      ],
      correctIndex: 1,
      explanation: 'A stock down 50% from ₹200 to ₹100 that then falls to ₹20 loses another 80% for anyone buying at ₹100! Always check balance-sheet survival.',
      caveat: 'Never anchor to a stock’s past 52-week high when debt or governance has deteriorated.',
    },
    {
      id: 'mc-3',
      difficulty: 'Advanced',
      title: 'Circuit Filters & Trading System Regime Defense',
      contextBadge: 'High-Volatility Bear Regime • Index Below Falling 200-DMA',
      visualData: {
        type: 'METRICS',
        metrics: [
          { label: 'Index vs 200-DMA', value: 'Below Falling 200-DMA' },
          { label: 'Breakout Success Rate', value: '18% (High Failure)' },
          { label: 'Daily ATR', value: '2.6× Normal' },
          { label: 'Cash Reserve', value: '75% Cash / Liquid' },
        ],
      },
      prompt: 'In your 8-Rule Trend-Pullback System, when the broader market is below a falling 200-DMA and ATR volatility has doubled, how do risk rules adapt?',
      options: [
        'Triple position sizes to recover drawdowns in one trade',
        'Respect the Regime Filter: stay mostly in cash/defensive posture, and if taking any trade, widen ATR stops while proportionally REDUCING share quantity so ₹ risk stays ≤ 0.5%–1%',
        'Remove all stop-losses during bear markets',
        'Switch to illiquid penny stocks hitting lower circuits',
      ],
      correctIndex: 1,
      explanation: 'When ATR doubles, stop distance widens—so Position Size = Max ₹ Risk ÷ Stop Distance automatically reduces share exposure to keep rupee risk constant!',
      caveat: 'Cash is an active, risk-free position during hostile market regimes.',
    },
  ],

  'fundamental-analysis-challenge': [
    {
      id: 'fa-1',
      difficulty: 'Beginner',
      title: 'Cash Flow Forensics: CFO vs Accounting PAT',
      contextBadge: '3-Year Cumulative Figures (₹ Crore)',
      visualData: {
        type: 'METRICS',
        metrics: [
          { label: '3Y Cumulative Revenue', value: '₹4,200 Cr' },
          { label: '3Y Cumulative PAT', value: '₹610 Cr' },
          { label: '3Y Cumulative CFO', value: '−₹95 Cr' },
          { label: 'Trade Receivables', value: 'Up +240% vs Sales +45%' },
        ],
      },
      prompt: 'Company Z headlines “Record ₹610 Cr 3-Year Profits!” and trades at 14x P/E. What red flag do the three financial statements expose?',
      options: [
        'None—PAT is positive so cash must be overflowing',
        'Severe earnings-quality divergence: cumulative Operating Cash Flow is negative (−₹95 Cr) as receivables ballooned 5× faster than revenue',
        'CapEx is too low',
        'ROE is guaranteed to double',
      ],
      correctIndex: 1,
      explanation: 'Healthy operating businesses convert accounting profit into Cash Flow from Operations over a 3–5 year cycle.',
      caveat: 'Always inspect Receivable Days, Inventory Days, and Contingent Liabilities in the Annual Report.',
    },
    {
      id: 'fa-2',
      difficulty: 'Intermediate',
      title: 'Analysing a Bank vs an IT Services Company',
      contextBadge: 'Sector-Appropriate Ratio Selection',
      visualData: {
        type: 'METRICS',
        metrics: [
          { label: 'Entity 1: Private Bank', value: 'P/B 2.3x | ROE 16.5% | NNPA 0.35%' },
          { label: 'Entity 2: IT Exporter', value: 'P/E 26x | ROCE 42% | Debt/Eq 0.04' },
          { label: 'Common Mistake', value: 'Using Debt/Equity on a Bank' },
          { label: 'Accounting Basis', value: 'Consolidated' },
        ],
      },
      prompt: 'Why do analysts evaluate Indian Banks primarily on P/B, ROA/ROE, NIM, and GNPA/NNPA rather than standard non-financial Debt/Equity or EV/EBITDA?',
      options: [
        'Because banks do not file quarterly statements',
        'Because customer deposits and borrowings ARE a bank’s operating raw material to lend out, making P/B + Asset Quality (NNPA) + ROA the meaningful metrics',
        'Because banks never pay tax',
        'Because IT companies have higher physical inventory than banks',
      ],
      correctIndex: 1,
      explanation: 'Financials earn Net Interest Income on financial assets; book value integrity (after NPA provisioning) anchors bank valuation.',
      caveat: 'A low-P/B bank with rapidly rising slippages/GNPA can destroy book value quickly—always check asset quality!',
    },
    {
      id: 'fa-3',
      difficulty: 'Advanced',
      title: 'Cyclical Peak-Earnings P/E Trap & Valuation Discipline',
      contextBadge: 'Commodity Steel/Chemical Cycle Peak',
      visualData: {
        type: 'METRICS',
        metrics: [
          { label: 'Mid-Cycle Normal EPS', value: '₹18 / share' },
          { label: 'Current Boom Peak EPS', value: '₹90 / share (5× spike)' },
          { label: 'Current Stock Price', value: '₹630 (Optical P/E = 7.0x)' },
          { label: 'Price / Normalised EPS', value: '35.0x!' },
        ],
      },
      prompt: 'At the peak of a global commodity shortage, a cyclical producer earns ₹90 EPS (vs ₹18 mid-cycle average), making trailing P/E look “cheap” at 7x. What is the valuation trap?',
      options: [
        '7x P/E on peak cyclical earnings is a guaranteed value bargain',
        'Peak-Earnings Cyclical Trap: when commodity spreads mean-revert toward ₹18 EPS, ₹630 is actually 35x normalised earnings—often causing sharp drawdowns',
        'Set perpetual growth g = 18% > r = 12% in DDM',
        'Ignore CapEx when computing Free Cash Flow',
      ],
      correctIndex: 1,
      explanation: 'Deeply cyclical businesses often look optically lowest on P/E at cycle tops (peak margins) and highest on P/E at cycle troughs.',
      caveat: 'Value cyclicals on normalised mid-cycle cash flows, replacement cost, and Bear/Base/Bull scenarios.',
    },
  ],
};

interface StockMarketGameRunnerProps {
  gameId: EducationalGameId;
  onExit: () => void;
  onNavigateTab?: (tab: AppMode) => void;
}

export const StockMarketGameRunner: React.FC<StockMarketGameRunnerProps> = ({
  gameId,
  onExit,
  onNavigateTab,
}) => {
  const { recordGameScore, setNavigateTargetModuleId } = useGame();

  const meta =
    STOCK_MARKET_8_GAMES.find((g) => g.id === gameId) || STOCK_MARKET_8_GAMES[0];
  const allQuestions = GAME_QUESTIONS_BANK[meta.id] || [];

  const [difficulty, setDifficulty] = useState<Difficulty | 'ALL'>('ALL');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);

  // Live/Simulated Option Chain for Game F (Option Chain Explorer)
  const [liveChain, setLiveChain] = useState<OptionChainPayload | null>(null);

  useEffect(() => {
    if (meta.id !== 'option-chain-explorer') return;
    const ctrl = new AbortController();
    marketApi
      .getOptionChain('NIFTY', undefined, ctrl.signal)
      .then((res) => setLiveChain(res))
      .catch(() => {});
    return () => ctrl.abort();
  }, [meta.id]);

  const activeDeck =
    difficulty === 'ALL'
      ? allQuestions
      : allQuestions.filter((q) => q.difficulty === difficulty);

  const currentQuestion = activeDeck[currentIdx] || activeDeck[0];

  const handleRestart = (nextDiff: Difficulty | 'ALL' = difficulty) => {
    setDifficulty(nextDiff);
    setCurrentIdx(0);
    setSelectedOpt(null);
    setAnswered(false);
    setScore(0);
    setCompleted(false);
  };

  const handleSelectAnswer = (idx: number) => {
    if (answered || !currentQuestion) return;
    setSelectedOpt(idx);
    setAnswered(true);

    const correct = idx === currentQuestion.correctIndex;
    if (correct) {
      soundEffects.correct();
      setScore((prev) => prev + 100);
    } else {
      soundEffects.wrong();
    }
  };

  const handleNext = async () => {
    if (currentIdx + 1 < activeDeck.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOpt(null);
      setAnswered(false);
    } else {
      setCompleted(true);
      const maxScore = activeDeck.length * 100;
      const recordedDiff: Difficulty =
        difficulty === 'ALL' ? 'Intermediate' : difficulty;
      await recordGameScore({
        gameId: meta.id,
        gameTitle: meta.title,
        moduleId: meta.moduleId,
        score,
        maxPossibleScore: maxScore,
        difficulty: recordedDiff,
        completed: true,
        xpReward: meta.xpReward,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/95 border border-slate-800 rounded-2xl p-4">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to 8 Market Games</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-indigo-300">
            {meta.moduleRefLabel}
          </span>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
            {meta.id === 'option-chain-explorer' && liveChain
              ? `CHAIN: ${liveChain.meta.status}`
              : meta.dataLabel}
          </span>
        </div>
      </div>

      {/* Game Header + Difficulty Filter */}
      <section className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              {meta.code} • Stock-Market Skill Simulator
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">{meta.title}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{meta.instructions}</p>
          </div>

          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-right shrink-0">
            <div className="text-[10px] text-slate-400 font-semibold">Current Score</div>
            <div className="text-lg font-black font-mono text-emerald-400">
              {score} / {activeDeck.length * 100}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 mr-1 font-semibold">Difficulty:</span>
            {(['ALL', 'Beginner', 'Intermediate', 'Advanced'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleRestart(d)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                  difficulty === d
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {d === 'ALL' ? 'Progressive (All 3)' : d}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setNavigateTargetModuleId(meta.moduleId);
              onExit();
              onNavigateTab?.('LEARN');
            }}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-300 hover:text-white cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Review {meta.moduleRefLabel.split('•')[0].trim()}</span>
          </button>
        </div>
      </section>

      {/* Live/Simulated Option Chain Reference Strip for Game F */}
      {meta.id === 'option-chain-explorer' && liveChain && !completed && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-white font-mono">
              Live/Simulated Reference Chain: {liveChain.underlying} Spot ₹
              {liveChain.underlyingLtp?.toLocaleString('en-IN')} • Expiry {liveChain.expiryDate} • PCR(OI){' '}
              {liveChain.pcrOi?.toFixed(2) ?? '—'}
            </span>
            <span className="text-[10px] font-mono text-amber-300">
              Status: {liveChain.meta.status} ({liveChain.meta.source})
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 font-mono text-[11px]">
            {liveChain.strikes.slice(Math.max(0, Math.floor(liveChain.strikes.length / 2) - 2), Math.floor(liveChain.strikes.length / 2) + 3).map((st) => (
              <div key={st.strikePrice} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <div className="text-indigo-300 font-bold">{st.strikePrice}</div>
                <div className="text-emerald-400">CE ₹{st.ce?.ltp?.toFixed(1) ?? '—'}</div>
                <div className="text-rose-400">PE ₹{st.pe?.ltp?.toFixed(1) ?? '—'}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active Question or Completion Summary */}
      {!completed && currentQuestion ? (
        <section className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[11px] font-bold">
                Round {currentIdx + 1} of {activeDeck.length} • {currentQuestion.difficulty}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {currentQuestion.contextBadge}
              </span>
            </div>
          </div>

          <h2 className="text-lg font-bold text-white">{currentQuestion.title}</h2>

          {/* Scenario Visual Data */}
          {currentQuestion.visualData?.type === 'METRICS' &&
            currentQuestion.visualData.metrics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {currentQuestion.visualData.metrics.map((m, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5"
                  >
                    <span className="text-[10px] text-slate-400 block">{m.label}</span>
                    <span className="text-xs font-mono font-bold text-white">{m.value}</span>
                  </div>
                ))}
              </div>
            )}

          {currentQuestion.visualData?.type === 'CANDLES' &&
            currentQuestion.visualData.candles && (() => {
              const cs = currentQuestion.visualData.candles!;
              const lo = Math.min(...cs.map((c) => c.l)) - 8;
              const hi = Math.max(...cs.map((c) => c.h)) + 8;
              const yOf = (v: number) => 130 - ((v - lo) / (hi - lo)) * 110;
              return (
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                  <svg viewBox="0 0 420 150" className="w-full h-36">
                    {cs.map((bar, idx) => {
                      const x = 90 + idx * 120;
                      const bull = bar.c >= bar.o;
                      const col = bull ? '#10b981' : '#f43f5e';
                      const top = Math.min(yOf(bar.o), yOf(bar.c));
                      const bh = Math.max(4, Math.abs(yOf(bar.c) - yOf(bar.o)));
                      return (
                        <g key={idx}>
                          <line x1={x} y1={yOf(bar.h)} x2={x} y2={yOf(bar.l)} stroke={col} strokeWidth="3" />
                          <rect x={x - 18} y={top} width={36} height={bh} fill={col} rx="2" />
                          <text x={x} y={145} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                            {bar.label} (O:{bar.o} C:{bar.c})
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              );
            })()}

          {currentQuestion.visualData?.type === 'TREND_LINE' &&
            currentQuestion.visualData.points && (() => {
              const pts = currentQuestion.visualData.points!;
              const lo = Math.min(...pts) - 5;
              const hi = Math.max(...pts) + 5;
              const poly = pts
                .map((v, i) => {
                  const x = 30 + (i / (pts.length - 1)) * 500;
                  const y = 125 - ((v - lo) / (hi - lo)) * 105;
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(' ');
              return (
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                  <svg viewBox="0 0 560 140" className="w-full h-32">
                    <polyline fill="none" stroke="#38bdf8" strokeWidth="3" points={poly} />
                  </svg>
                </div>
              );
            })()}

          <p className="text-sm font-semibold text-slate-100 leading-relaxed">
            {currentQuestion.prompt}
          </p>

          <div className="space-y-2.5">
            {currentQuestion.options.map((opt, idx) => {
              const isPicked = selectedOpt === idx;
              const isRight = idx === currentQuestion.correctIndex;
              let style =
                'bg-slate-950 border-slate-800 text-slate-200 hover:border-indigo-500/50';
              if (answered) {
                if (isRight) {
                  style = 'bg-emerald-950/60 border-emerald-500 text-emerald-100';
                } else if (isPicked) {
                  style = 'bg-rose-950/60 border-rose-500 text-rose-100';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={answered}
                  onClick={() => handleSelectAnswer(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-between gap-3 cursor-pointer ${style}`}
                >
                  <span>{opt}</span>
                  {answered && isRight && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  {answered && isPicked && !isRight && (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {answered && (
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="font-bold text-indigo-300">Analytical Explanation</div>
                <p className="text-slate-200 leading-relaxed">{currentQuestion.explanation}</p>
                <div className="pt-1.5 text-amber-300 flex items-start gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    <strong>Real-Market Caveat:</strong> {currentQuestion.caveat}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs sm:text-sm font-bold text-white cursor-pointer"
              >
                {currentIdx + 1 < activeDeck.length
                  ? 'Next Market Scenario →'
                  : 'Finish & Save Score'}
              </button>
            </div>
          )}
        </section>
      ) : (
        /* Completion State */
        <section className="bg-slate-900/95 border border-emerald-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <Award className="w-12 h-12 text-emerald-400 mx-auto" />
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Challenge Complete • Saved to Student Account
            </div>
            <h2 className="text-2xl font-black text-white">{meta.title}</h2>
            <p className="text-sm font-mono text-slate-300">
              Final Score: <strong className="text-emerald-400">{score}</strong> /{' '}
              {activeDeck.length * 100} (+{meta.xpReward} XP)
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleRestart(difficulty)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Game
            </button>
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              All 8 Market Games
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
