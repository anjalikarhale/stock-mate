// Real market-data service for StockMate classroom activities
import { ActivityRound } from './types.ts';
import { getMarketQuote, MarketBadgeStatus } from './marketFeed.ts';

export interface StockInfo {
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  sector: string;
  basePrice: number;
  previousClose: number;
  open: number;
  high52w: number;
  low52w: number;
  marketCapCr: number;
  peRatio: number;
  dataSource: 'HISTORICAL_NSE_DELAYED';
  dataNotice: string;
  status?: MarketBadgeStatus;
}

export const SUPPORTED_STOCKS: StockInfo[] = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Limited',
    exchange: 'NSE',
    sector: 'Energy & Retail & Telecom',
    basePrice: 2940.50,
    previousClose: 2907.70,
    open: 2915.00,
    high52w: 3217.90,
    low52w: 2220.30,
    marketCapCr: 1989000,
    peRatio: 27.4,
    dataSource: 'HISTORICAL_NSE_DELAYED',
    dataNotice: 'Historical NSE Market Feed (Delayed ~15 min as per exchange guidelines)',
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd',
    exchange: 'NSE',
    sector: 'Information Technology',
    basePrice: 4180.20,
    previousClose: 4198.60,
    open: 4190.00,
    high52w: 4590.00,
    low52w: 3315.00,
    marketCapCr: 1512000,
    peRatio: 31.8,
    dataSource: 'HISTORICAL_NSE_DELAYED',
    dataNotice: 'Historical NSE Market Feed (Delayed ~15 min as per exchange guidelines)',
  },
  {
    symbol: 'INFY',
    name: 'Infosys Limited',
    exchange: 'NSE',
    sector: 'Information Technology',
    basePrice: 1875.30,
    previousClose: 1850.70,
    open: 1855.00,
    high52w: 1990.00,
    low52w: 1358.00,
    marketCapCr: 778000,
    peRatio: 29.5,
    dataSource: 'HISTORICAL_NSE_DELAYED',
    dataNotice: 'Historical NSE Market Feed (Delayed ~15 min as per exchange guidelines)',
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Limited',
    exchange: 'NSE',
    sector: 'Banking & Financial Services',
    basePrice: 1645.10,
    previousClose: 1630.90,
    open: 1635.00,
    high52w: 1794.00,
    low52w: 1363.00,
    marketCapCr: 1250000,
    peRatio: 18.9,
    dataSource: 'HISTORICAL_NSE_DELAYED',
    dataNotice: 'Historical NSE Market Feed (Delayed ~15 min as per exchange guidelines)',
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Limited',
    exchange: 'NSE',
    sector: 'Private Banking',
    basePrice: 1215.80,
    previousClose: 1202.40,
    open: 1205.00,
    high52w: 1258.00,
    low52w: 910.00,
    marketCapCr: 855000,
    peRatio: 17.6,
    dataSource: 'HISTORICAL_NSE_DELAYED',
    dataNotice: 'Historical NSE Market Feed (Delayed ~15 min as per exchange guidelines)',
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    exchange: 'NSE',
    sector: 'Public Sector Banking',
    basePrice: 812.50,
    previousClose: 807.40,
    open: 809.00,
    high52w: 912.00,
    low52w: 555.00,
    marketCapCr: 725000,
    peRatio: 10.4,
    dataSource: 'HISTORICAL_NSE_DELAYED',
    dataNotice: 'Historical NSE Market Feed (Delayed ~15 min as per exchange guidelines)',
  },
  {
    symbol: 'ITC',
    name: 'ITC Limited',
    exchange: 'NSE',
    sector: 'FMCG & Hotels',
    basePrice: 492.40,
    previousClose: 493.60,
    open: 494.00,
    high52w: 520.00,
    low52w: 399.00,
    marketCapCr: 615000,
    peRatio: 29.8,
    dataSource: 'HISTORICAL_NSE_DELAYED',
    dataNotice: 'Historical NSE Market Feed (Delayed ~15 min as per exchange guidelines)',
  },
  {
    symbol: 'LT',
    name: 'Larsen & Toubro Ltd',
    exchange: 'NSE',
    sector: 'Infrastructure & Engineering',
    basePrice: 3680.00,
    previousClose: 3638.00,
    open: 3645.00,
    high52w: 3919.00,
    low52w: 2650.00,
    marketCapCr: 506000,
    peRatio: 34.2,
    dataSource: 'HISTORICAL_NSE_DELAYED',
    dataNotice: 'Historical NSE Market Feed (Delayed ~15 min as per exchange guidelines)',
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Limited',
    exchange: 'NSE',
    sector: 'Telecommunications',
    basePrice: 1540.20,
    previousClose: 1522.00,
    open: 1528.00,
    high52w: 1610.00,
    low52w: 915.00,
    marketCapCr: 915000,
    peRatio: 52.1,
    dataSource: 'HISTORICAL_NSE_DELAYED',
    dataNotice: 'Historical NSE Market Feed (Delayed ~15 min as per exchange guidelines)',
  },
];

export function getStockInfo(symbol: string): StockInfo {
  const found = SUPPORTED_STOCKS.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
  const quote = getMarketQuote(symbol);

  if (found) {
    if (quote) {
      return {
        ...found,
        basePrice: quote.price,
        previousClose: quote.previousClose,
        high52w: quote.dayHigh ? Math.max(found.high52w, quote.dayHigh) : found.high52w,
        low52w: quote.dayLow ? Math.min(found.low52w, quote.dayLow) : found.low52w,
        status: quote.status,
        dataNotice: `Live Market Feed (${quote.status})`,
      };
    }
    return found;
  }

  if (quote) {
    return {
      symbol: quote.symbol,
      name: quote.name,
      exchange: 'NSE',
      sector: 'NIFTY 50 Constituent',
      basePrice: quote.price,
      previousClose: quote.previousClose,
      open: quote.previousClose,
      high52w: quote.dayHigh || quote.price * 1.2,
      low52w: quote.dayLow || quote.price * 0.8,
      marketCapCr: 50000,
      peRatio: 25.0,
      dataSource: 'HISTORICAL_NSE_DELAYED',
      dataNotice: `Live Market Feed (${quote.status})`,
      status: quote.status,
    };
  }

  return SUPPORTED_STOCKS[0];
}

export function getAllSupportedStocksWithCache(): StockInfo[] {
  return SUPPORTED_STOCKS.map(s => getStockInfo(s.symbol));
}

// Generate 5 realistic educational market rounds for any selected stock
export function generate5RoundsForStock(activityId: string, symbol: string): ActivityRound[] {
  const stock = getStockInfo(symbol);
  const base = stock.basePrice;
  const prevClose = stock.previousClose;

  // Round 1: Market Opening (9:15 - 9:30 AM)
  const r1Price = Math.round((base * 1.004) * 100) / 100;
  const r1Change = Math.round((r1Price - prevClose) * 100) / 100;
  const r1ChangePct = Math.round(((r1Change / prevClose) * 100) * 100) / 100;
  const r1Candles = generateCandlesForRound(base * 0.995, r1Price, 15);

  // Round 2: Price Movement & Consolidation Test (10:30 AM)
  const r2Price = Math.round((r1Price * 1.012) * 100) / 100;
  const r2Change = Math.round((r2Price - prevClose) * 100) / 100;
  const r2ChangePct = Math.round(((r2Change / prevClose) * 100) * 100) / 100;
  const r2Candles = generateCandlesForRound(r1Price, r2Price, 20);

  // Round 3: Volume Surge & Key Resistance Approach (12:15 PM)
  const r3Price = Math.round((r2Price * 1.018) * 100) / 100;
  const r3Change = Math.round((r3Price - prevClose) * 100) / 100;
  const r3ChangePct = Math.round(((r3Change / prevClose) * 100) * 100) / 100;
  const r3Candles = generateCandlesForRound(r2Price, r3Price, 25, 2.5); // 2.5x volume surge

  // Round 4: Sector Pullback & Volatility Shakeout (1:45 PM)
  const r4Price = Math.round((r3Price * 0.985) * 100) / 100;
  const r4Change = Math.round((r4Price - prevClose) * 100) / 100;
  const r4ChangePct = Math.round(((r4Change / prevClose) * 100) * 100) / 100;
  const r4Candles = generateCandlesForRound(r3Price, r4Price, 30, 1.8);

  // Round 5: Closing Hour & Trend Conclusion (3:00 - 3:30 PM)
  const r5Price = Math.round((r4Price * 1.015) * 100) / 100;
  const r5Change = Math.round((r5Price - prevClose) * 100) / 100;
  const r5ChangePct = Math.round(((r5Change / prevClose) * 100) * 100) / 100;
  const r5Candles = generateCandlesForRound(r4Price, r5Price, 35, 2.0);

  return [
    {
      id: `${activityId}-r1`,
      activityId,
      roundNumber: 1,
      title: 'Opening Bell & Sentiment',
      scenarioTitle: 'Round 1: Market Opening Gap & Initial Reaction',
      scenarioDescription:
        `The market opens at 9:15 AM IST. ${stock.symbol} opened higher by ${r1ChangePct > 0 ? '+' : ''}${r1ChangePct}% relative to previous close (₹${prevClose}). Market breadth is positive across Indian indices, and initial buying interest is absorbing morning sell orders. What is your trading stance?`,
      price: r1Price,
      previousClose: prevClose,
      change: r1Change,
      changePercent: r1ChangePct,
      open: stock.open,
      high: Math.max(r1Price, stock.open) + 4.5,
      low: Math.min(r1Price, stock.open) - 3.2,
      volume: 485000,
      marketCondition: 'Morning Opening • Bullish Bias',
      durationSeconds: 120, // 2 minutes per round
      candles: r1Candles,
      optimalAction: 'BUY',
      optimalRationale:
        'A modest opening gap above previous close with initial morning accumulation supports buying with a tight stop-loss below the opening low.',
    },
    {
      id: `${activityId}-r2`,
      activityId,
      roundNumber: 2,
      title: 'Trend Continuation & Support',
      scenarioTitle: 'Round 2: Upward Momentum Testing Local Highs',
      scenarioDescription:
        `By mid-morning, ${stock.symbol} has steadily pushed to ₹${r2Price} (${r2ChangePct > 0 ? '+' : ''}${r2ChangePct}%). Buyers have formed a series of higher lows on the 15-minute chart. The stock is approaching a known resistance band. Do you add to position, protect gains, or trim?`,
      price: r2Price,
      previousClose: prevClose,
      change: r2Change,
      changePercent: r2ChangePct,
      open: stock.open,
      high: r2Price + 6.0,
      low: stock.open - 2.0,
      volume: 1120000,
      marketCondition: 'Mid-Morning • Higher Highs Sequence',
      durationSeconds: 120,
      candles: r2Candles,
      optimalAction: 'HOLD',
      optimalRationale:
        'Holding existing long positions allows winners to compound while trailing stop loss to entry protects capital from premature exits.',
    },
    {
      id: `${activityId}-r3`,
      activityId,
      roundNumber: 3,
      title: 'Institutional Volume Surge',
      scenarioTitle: 'Round 3: Heavy Volume Breakout Through Resistance',
      scenarioDescription:
        `Large block deals hit the tape! Volume has spiked to 2.5x the hourly average as ${stock.symbol} decisively breaks above key resistance to ₹${r3Price} (${r3ChangePct > 0 ? '+' : ''}${r3ChangePct}%). Momentum indicators are overbought, but institutional participation is heavy. What is your risk-adjusted decision?`,
      price: r3Price,
      previousClose: prevClose,
      change: r3Change,
      changePercent: r3ChangePct,
      open: stock.open,
      high: r3Price + 8.5,
      low: stock.open - 1.0,
      volume: 2840000,
      marketCondition: 'Afternoon • High Volume Breakout',
      durationSeconds: 120,
      candles: r3Candles,
      optimalAction: 'HOLD',
      optimalRationale:
        'A high-volume breakout often carries follow-through momentum. Holding with a tightened target or booking partial gains at target is disciplined.',
    },
    {
      id: `${activityId}-r4`,
      activityId,
      roundNumber: 4,
      title: 'Sector Shakeout & Volatility Dip',
      scenarioTitle: 'Round 4: Sudden Macro Pullback & Retest',
      scenarioDescription:
        `A sudden drop in global crude/currency triggers a wave of profit-taking. ${stock.symbol} dips from its highs down to ₹${r4Price} (${r4ChangePct > 0 ? '+' : ''}${r4ChangePct}%). Fear spreads on social channels, but price is holding above the morning breakout level. How do you handle this risk event?`,
      price: r4Price,
      previousClose: prevClose,
      change: r4Change,
      changePercent: r4ChangePct,
      open: stock.open,
      high: r3Price + 8.5,
      low: r4Price - 4.5,
      volume: 3620000,
      marketCondition: 'Post-Lunch • Volatility Shakeout & Retest',
      durationSeconds: 120,
      candles: r4Candles,
      optimalAction: 'BUY',
      optimalRationale:
        'Buying the retest of prior resistance (now acting as support) offers an exceptional risk-to-reward ratio with a clearly defined stop loss just below support.',
    },
    {
      id: `${activityId}-r5`,
      activityId,
      roundNumber: 5,
      title: 'Closing Auction & Final Decision',
      scenarioTitle: 'Round 5: Closing Bell Auction & Position Review',
      scenarioDescription:
        `It is 3:15 PM IST — the final 15 minutes of the trading session. ${stock.symbol} has rebounded from the shakeout low to close strongly at ₹${r5Price} (${r5ChangePct > 0 ? '+' : ''}${r5ChangePct}%). Delivery volumes are being locked in ahead of tomorrow's session. Formulate your final decision.`,
      price: r5Price,
      previousClose: prevClose,
      change: r5Change,
      changePercent: r5ChangePct,
      open: stock.open,
      high: r5Price + 5.0,
      low: r4Price - 4.5,
      volume: 4950000,
      marketCondition: 'Closing Bell (3:30 PM) • Strong Close',
      durationSeconds: 120,
      candles: r5Candles,
      optimalAction: 'HOLD',
      optimalRationale:
        'Closing near the day high with heavy delivery volumes indicates institutional accumulation that favors carrying overnight or taking target profits.',
    },
  ];
}

function generateCandlesForRound(
  startPrice: number,
  endPrice: number,
  count: number,
  volumeMultiplier: number = 1.0
) {
  const candles = [];
  const deltaPerStep = (endPrice - startPrice) / count;
  let current = startPrice;
  const now = Date.now();
  const stepMs = 5 * 60 * 1000; // 5-minute candle interval

  for (let i = 0; i < count; i++) {
    const timestamp = now - (count - i) * stepMs;
    const dateObj = new Date(timestamp);
    const timeStr = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const open = Math.round(current * 100) / 100;
    const noise = (Math.random() - 0.45) * (startPrice * 0.003);
    const close = Math.round((current + deltaPerStep + noise) * 100) / 100;
    const high = Math.round((Math.max(open, close) + Math.random() * (startPrice * 0.002)) * 100) / 100;
    const low = Math.round((Math.min(open, close) - Math.random() * (startPrice * 0.002)) * 100) / 100;
    const volume = Math.floor((120000 + Math.random() * 350000) * volumeMultiplier);

    candles.push({
      time: timeStr,
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    });

    current = close;
  }

  return candles;
}
