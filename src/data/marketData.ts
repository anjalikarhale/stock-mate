import { StockQuote, Candle } from '../types';

// Deterministic historical candle generator for realistic Indian stock charts
export function generateRealisticCandles(
  basePrice: number,
  days: number = 60,
  volatility: number = 0.018,
  trend: number = 0.0008
): Candle[] {
  const candles: Candle[] = [];
  let currentPrice = basePrice;
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  for (let i = days; i >= 0; i--) {
    const timestamp = now - i * oneDay;
    const dateObj = new Date(timestamp);
    const dateStr = dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

    // Seeded-style pseudo-random step
    const randomFactor = Math.sin(i * 1.7) * 0.012 + Math.cos(i * 0.8) * 0.015;
    const dailyChange = (Math.random() - 0.48) * volatility * 2 + trend + randomFactor;
    
    const open = Math.round(currentPrice * 100) / 100;
    const close = Math.round((open * (1 + dailyChange)) * 100) / 100;
    const high = Math.round((Math.max(open, close) + Math.abs(open - close) * (0.3 + Math.random() * 0.7) + open * Math.random() * volatility * 0.6) * 100) / 100;
    const low = Math.round((Math.min(open, close) - Math.abs(open - close) * (0.3 + Math.random() * 0.7) - open * Math.random() * volatility * 0.6) * 100) / 100;
    const volume = Math.floor(250000 + Math.random() * 1500000 + (Math.abs(close - open) / open) * 2000000);

    candles.push({
      time: dateStr,
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    });

    currentPrice = close;
  }

  return candles;
}

export const INDIAN_INDICES = [
  {
    symbol: 'NIFTY 50',
    name: 'NIFTY 50 (NSE Benchmark)',
    exchange: 'NSE' as const,
    price: 24835.40,
    change: +142.30,
    changePercent: +0.58,
    marketStatus: 'MARKET OPEN (9:15 AM - 3:30 PM IST)',
    historicalCandles: generateRealisticCandles(23500, 75, 0.012, 0.0006),
    dataSource: 'HISTORICAL_NSE' as const,
  },
  {
    symbol: 'SENSEX',
    name: 'BSE SENSEX 30',
    exchange: 'BSE' as const,
    price: 81382.10,
    change: +415.80,
    changePercent: +0.51,
    marketStatus: 'MARKET OPEN',
    historicalCandles: generateRealisticCandles(77000, 75, 0.011, 0.0005),
    dataSource: 'HISTORICAL_NSE' as const,
  },
  {
    symbol: 'BANK NIFTY',
    name: 'NIFTY BANK',
    exchange: 'NSE' as const,
    price: 52140.75,
    change: -88.20,
    changePercent: -0.17,
    marketStatus: 'MARKET OPEN',
    historicalCandles: generateRealisticCandles(49500, 75, 0.016, 0.0004),
    dataSource: 'HISTORICAL_NSE' as const,
  },
];

export const INITIAL_STOCKS: StockQuote[] = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    exchange: 'NSE',
    sector: 'Oil & Telecom & Retail',
    price: 2940.50,
    change: +32.80,
    changePercent: +1.13,
    high52w: 3217.90,
    low52w: 2220.30,
    peRatio: 27.4,
    pbRatio: 2.3,
    roe: 9.8,
    roce: 10.4,
    debtToEquity: 0.38,
    marketCapCr: 1989000,
    eps: 107.3,
    dividendYield: 0.34,
    historicalCandles: generateRealisticCandles(2750, 60, 0.015, 0.001),
    dataSource: 'HISTORICAL_NSE',
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    exchange: 'NSE',
    sector: 'Information Technology',
    price: 4180.20,
    change: -18.40,
    changePercent: -0.44,
    high52w: 4590.00,
    low52w: 3315.00,
    peRatio: 31.8,
    pbRatio: 14.2,
    roe: 48.6,
    roce: 59.2,
    debtToEquity: 0.00,
    marketCapCr: 1512000,
    eps: 131.4,
    dividendYield: 1.35,
    historicalCandles: generateRealisticCandles(3900, 60, 0.013, 0.0006),
    dataSource: 'HISTORICAL_NSE',
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Limited',
    exchange: 'NSE',
    sector: 'Banking & Financial Services',
    price: 1645.10,
    change: +14.20,
    changePercent: +0.87,
    high52w: 1794.00,
    low52w: 1363.00,
    peRatio: 18.9,
    pbRatio: 2.7,
    roe: 16.4,
    roce: 17.8,
    debtToEquity: 6.2,
    marketCapCr: 1250000,
    eps: 87.0,
    dividendYield: 1.18,
    historicalCandles: generateRealisticCandles(1520, 60, 0.014, 0.0005),
    dataSource: 'HISTORICAL_NSE',
  },
  {
    symbol: 'INFY',
    name: 'Infosys Limited',
    exchange: 'NSE',
    sector: 'Information Technology',
    price: 1875.30,
    change: +24.60,
    changePercent: +1.33,
    high52w: 1990.00,
    low52w: 1358.00,
    peRatio: 29.5,
    pbRatio: 9.1,
    roe: 31.8,
    roce: 39.5,
    debtToEquity: 0.08,
    marketCapCr: 778000,
    eps: 63.5,
    dividendYield: 2.10,
    historicalCandles: generateRealisticCandles(1680, 60, 0.016, 0.0012),
    dataSource: 'HISTORICAL_NSE',
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Limited',
    exchange: 'NSE',
    sector: 'Automobile & EV',
    price: 1045.80,
    change: +18.90,
    changePercent: +1.84,
    high52w: 1179.00,
    low52w: 593.00,
    peRatio: 11.2,
    pbRatio: 4.1,
    roe: 36.5,
    roce: 21.4,
    debtToEquity: 0.62,
    marketCapCr: 385000,
    eps: 93.3,
    dividendYield: 0.57,
    historicalCandles: generateRealisticCandles(880, 60, 0.024, 0.002),
    dataSource: 'HISTORICAL_NSE',
  },
  {
    symbol: 'ITC',
    name: 'ITC Limited',
    exchange: 'NSE',
    sector: 'FMCG & Hotels',
    price: 492.40,
    change: -1.20,
    changePercent: -0.24,
    high52w: 520.00,
    low52w: 399.00,
    peRatio: 29.8,
    pbRatio: 8.4,
    roe: 28.3,
    roce: 37.1,
    debtToEquity: 0.00,
    marketCapCr: 615000,
    eps: 16.5,
    dividendYield: 2.80,
    historicalCandles: generateRealisticCandles(430, 60, 0.010, 0.0004),
    dataSource: 'HISTORICAL_NSE',
  },
  {
    symbol: 'LT',
    name: 'Larsen & Toubro Ltd',
    exchange: 'NSE',
    sector: 'Infrastructure & Engineering',
    price: 3680.00,
    change: +42.00,
    changePercent: +1.15,
    high52w: 3919.00,
    low52w: 2650.00,
    peRatio: 34.2,
    pbRatio: 4.8,
    roe: 15.2,
    roce: 14.1,
    debtToEquity: 1.10,
    marketCapCr: 506000,
    eps: 107.6,
    dividendYield: 0.92,
    historicalCandles: generateRealisticCandles(3350, 60, 0.017, 0.0009),
    dataSource: 'HISTORICAL_NSE',
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    exchange: 'NSE',
    sector: 'Public Sector Banking',
    price: 812.50,
    change: +5.10,
    changePercent: +0.63,
    high52w: 912.00,
    low52w: 555.00,
    peRatio: 10.4,
    pbRatio: 1.7,
    roe: 17.2,
    roce: 16.8,
    debtToEquity: 11.5,
    marketCapCr: 725000,
    eps: 78.1,
    dividendYield: 1.69,
    historicalCandles: generateRealisticCandles(720, 60, 0.019, 0.0008),
    dataSource: 'HISTORICAL_NSE',
  }
];

export const MARKET_NEWS_FEED = [
  {
    id: 'news-1',
    headline: 'RBI Monetary Policy Committee maintains Repo Rate at 6.50%; highlights robust GDP growth.',
    category: 'MACRO_ECONOMY',
    impact: 'BULLISH',
    timeAgo: '12m ago',
    verifiedSEBI: true,
  },
  {
    id: 'news-2',
    headline: 'FIIs pump ₹2,450 Cr into Indian equities in today\'s morning session; IT and Auto lead.',
    category: 'INSTITUTIONAL_FLOWS',
    impact: 'BULLISH',
    timeAgo: '35m ago',
    verifiedSEBI: true,
  },
  {
    id: 'news-3',
    headline: '⚠️ WhatsApp Rumor Alert: Unregistered "Guaranteed 25% Monthly Return" tip group flagged by SEBI.',
    category: 'SCAM_ALERT',
    impact: 'NEUTRAL',
    timeAgo: '1h ago',
    verifiedSEBI: true,
  },
  {
    id: 'news-4',
    headline: 'Tata Motors announces 18% YoY growth in Passenger EV dispatches for July quarter.',
    category: 'EARNINGS_RESULT',
    impact: 'BULLISH',
    timeAgo: '2h ago',
    verifiedSEBI: true,
  },
];
