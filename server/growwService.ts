import YahooFinance from 'yahoo-finance2';
import {
  INSTRUMENT_REGISTRY,
  RegisteredInstrument,
  getRegisteredInstrument,
  isValidExchangeSymbolFormat,
} from './instrumentRegistry.ts';

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey', 'ripHistorical'] });

const GROWW_BASE_URL = 'https://api.groww.in/v1';
const GROWW_TIMEOUT_MS = 8000;

export type MarketDataStatus =
  | 'LIVE'
  | 'CACHED'
  | 'DELAYED'
  | 'HISTORICAL'
  | 'SIMULATED'
  | 'UNAVAILABLE';

export interface MarketMeta {
  status: MarketDataStatus;
  source: string;
  lastUpdated: string;
  marketOpen: boolean;
  growwConfigured: boolean;
  notice?: string;
}

export interface NormalizedQuote {
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  segment: 'CASH' | 'FNO';
  instrumentType: 'EQUITY' | 'INDEX' | 'ETF';
  lastPrice: number | null;
  dayChange: number | null;
  dayChangePerc: number | null;
  ohlc: {
    open: number | null;
    high: number | null;
    low: number | null;
    close: number | null;
  };
  averagePrice: number | null;
  volume: number | null;
  lastTradeQuantity: number | null;
  lastTradeTime: string | null;
  bidPrice: number | null;
  bidQuantity: number | null;
  offerPrice: number | null;
  offerQuantity: number | null;
  totalBuyQuantity: number | null;
  totalSellQuantity: number | null;
  upperCircuitLimit: number | null;
  lowerCircuitLimit: number | null;
  highTradeRange: number | null;
  lowTradeRange: number | null;
  week52High: number | null;
  week52Low: number | null;
  openInterest: number | null;
  oiDayChange: number | null;
  oiDayChangePerc: number | null;
  impliedVolatility: number | null;
  depth: {
    buy: { price: number; quantity: number; orders?: number }[];
    sell: { price: number; quantity: number; orders?: number }[];
  } | null;
  fundamentals: {
    peRatio: number | null;
    pbRatio: number | null;
    roe: number | null;
    roce: number | null;
    debtToEquity: number | null;
    eps: number | null;
    dividendYield: number | null;
    marketCapCr: number | null;
    sector: string;
    lotSize: number;
    relatedEtfSymbol?: string;
  };
  meta: MarketMeta;
}

export interface HistoricalCandleBar {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
}

export type SupportedTimeframe = '1M' | '3M' | '6M' | '1Y' | '5D';

export interface HistoricalChartResponse {
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  instrumentType: 'EQUITY' | 'INDEX' | 'ETF';
  timeframe: SupportedTimeframe;
  interval: string;
  candles: HistoricalCandleBar[];
  latestPrice: number | null;
  previousClose: number | null;
  change: number | null;
  changePercent: number | null;
  meta: MarketMeta;
}

export interface OptionGreeksData {
  delta: number | null;
  gamma: number | null;
  theta: number | null;
  vega: number | null;
  rho: number | null;
  iv: number | null;
}

export interface OptionContractSide {
  tradingSymbol: string;
  ltp: number | null;
  dayChange: number | null;
  dayChangePerc: number | null;
  openInterest: number | null;
  oiChange: number | null;
  volume: number | null;
  bidPrice: number | null;
  askPrice: number | null;
  impliedVolatility: number | null;
  greeks: OptionGreeksData | null;
  greeksAvailable: boolean;
}

export interface OptionChainStrikeRow {
  strikePrice: number;
  ce: OptionContractSide | null;
  pe: OptionContractSide | null;
}

export interface OptionChainResponse {
  underlying: string;
  underlyingName: string;
  exchange: 'NSE' | 'BSE';
  underlyingLtp: number | null;
  lotSize: number;
  strikeStep: number;
  expiryDate: string;
  availableExpiries: string[];
  daysToExpiry: number;
  strikes: OptionChainStrikeRow[];
  pcrOi: number | null;
  pcrVolume: number | null;
  meta: MarketMeta;
}

// ---------------------------------------------------------------------------
// Indian Market Hours Helper (NSE/BSE Cash & F&O: Mon–Fri 09:15–15:30 IST)
// ---------------------------------------------------------------------------
export function isIndianMarketOpenNow(): boolean {
  const now = new Date();
  const istMillis = now.getTime() + 5.5 * 60 * 60 * 1000;
  const ist = new Date(istMillis);
  const day = ist.getUTCDay(); // 0 = Sun, 6 = Sat
  if (day === 0 || day === 6) return false;
  const minutes = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  return minutes >= 9 * 60 + 15 && minutes <= 15 * 60 + 30;
}

export function isGrowwConfigured(): boolean {
  const token = process.env.GROWW_ACCESS_TOKEN;
  return Boolean(token && token.trim().length > 10);
}

function getGrowwHeaders(): Record<string, string> | null {
  const token = process.env.GROWW_ACCESS_TOKEN?.trim();
  if (!token) return null;
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'X-API-VERSION': '1.0',
  };
}

function toNumOrNull(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

// ---------------------------------------------------------------------------
// Short-lived per-key caches (strictly keyed by symbol + parameters)
// ---------------------------------------------------------------------------
interface CacheRecord<T> {
  value: T;
  storedAt: number;
  expiresAt: number;
}

const quoteCache = new Map<string, CacheRecord<NormalizedQuote>>();
const historyCache = new Map<string, CacheRecord<HistoricalChartResponse>>();
const optionChainCache = new Map<string, CacheRecord<OptionChainResponse>>();

const QUOTE_TTL_MS = 12_000; // 12s short-lived quote cache
const HISTORY_TTL_MS = 5 * 60 * 1000; // 5m per-symbol+timeframe historical candle cache
const OPTION_CHAIN_TTL_MS = 15_000; // 15s option chain cache

// ---------------------------------------------------------------------------
// Core Server-Side Groww HTTP Request Helper (Never exposes token!)
// ---------------------------------------------------------------------------
async function fetchGrowwJson(
  endpointPath: string,
  queryParams?: Record<string, string>
): Promise<{ ok: boolean; status: number; payload?: any; error?: string }> {
  const headers = getGrowwHeaders();
  if (!headers) {
    return {
      ok: false,
      status: 401,
      error: 'GROWW_ACCESS_TOKEN is not configured on the server.',
    };
  }

  const url = new URL(`${GROWW_BASE_URL}${endpointPath}`);
  if (queryParams) {
    for (const [k, v] of Object.entries(queryParams)) {
      if (v !== undefined && v !== '') {
        url.searchParams.set(k, v);
      }
    }
  }

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(GROWW_TIMEOUT_MS),
    });

    if (res.status === 401 || res.status === 403) {
      return {
        ok: false,
        status: res.status,
        error: 'Groww API authentication/subscription rejected (check GROWW_ACCESS_TOKEN validity or Market Data API subscription).',
      };
    }

    if (res.status === 429) {
      return {
        ok: false,
        status: 429,
        error: 'Groww API rate limit reached. Showing cached or fallback market data.',
      };
    }

    const json = await res.json().catch(() => null);
    if (!res.ok || !json) {
      return {
        ok: false,
        status: res.status,
        error: `Groww API returned HTTP ${res.status}.`,
      };
    }

    // Groww wraps responses in { status: "SUCCESS", payload: ... } or direct object
    if (json.status === 'FAILURE' || json.error) {
      return {
        ok: false,
        status: 400,
        error: json.error?.message || json.message || 'Groww API returned an error response.',
      };
    }

    return {
      ok: true,
      status: 200,
      payload: json.payload !== undefined ? json.payload : json,
    };
  } catch (err: any) {
    const isTimeout = err?.name === 'TimeoutError' || err?.name === 'AbortError';
    return {
      ok: false,
      status: isTimeout ? 504 : 502,
      error: isTimeout ? 'Groww API request timed out.' : 'Unable to reach Groww API.',
    };
  }
}

// ---------------------------------------------------------------------------
// Deterministic Historical Series Generator (ONLY used when external network
// is unreachable, explicitly marked status: 'SIMULATED' — NEVER 'LIVE'!)
// ---------------------------------------------------------------------------
function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function buildDeterministicSimulatedHistory(
  inst: RegisteredInstrument,
  timeframe: SupportedTimeframe
): HistoricalCandleBar[] {
  const barCounts: Record<SupportedTimeframe, number> = {
    '5D': 40,
    '1M': 22,
    '3M': 64,
    '6M': 126,
    '1Y': 248,
  };
  const count = barCounts[timeframe] || 64;
  let state = hashSeed(`${inst.symbol}:${inst.exchange}:v2`);

  const nextRand = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };

  // Distinct drift & cycle signature per symbol so RELIANCE, TCS, HDFCBANK, NIFTY, etc. have distinct structures
  const drift = ((hashSeed(inst.symbol) % 15) - 6) * 0.00025;
  const vol = inst.volatilityDaily || 0.012;
  const stepMs = timeframe === '5D' ? 45 * 60 * 1000 : 24 * 60 * 60 * 1000;

  // Work backwards from referencePrice so final close aligns naturally with referencePrice
  const returns: number[] = [];
  for (let i = 0; i < count; i++) {
    const u1 = Math.max(0.0001, nextRand());
    const u2 = nextRand();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const wave = Math.sin((i + (state % 17)) / 7.5) * vol * 0.35;
    returns.push(drift + z * vol * (timeframe === '5D' ? 0.35 : 0.85) + wave);
  }

  const closes: number[] = new Array(count);
  closes[count - 1] = inst.referencePrice;
  for (let i = count - 2; i >= 0; i--) {
    closes[i] = Math.max(5, closes[i + 1] / (1 + returns[i + 1]));
  }

  const now = Date.now();
  const candles: HistoricalCandleBar[] = [];
  let cursorTime = now - count * stepMs;

  for (let i = 0; i < count; i++) {
    if (timeframe !== '5D') {
      const d = new Date(cursorTime);
      while (d.getDay() === 0 || d.getDay() === 6) {
        cursorTime += 24 * 60 * 60 * 1000;
        d.setTime(cursorTime);
      }
    }
    const prevClose = i === 0 ? closes[0] * (1 - drift) : closes[i - 1];
    const gap = (nextRand() - 0.5) * vol * 0.3;
    const open = Math.round(prevClose * (1 + gap) * 100) / 100;
    const close = Math.round(closes[i] * 100) / 100;
    const wickUp = Math.abs(nextRand() * vol * 0.75) * Math.max(open, close);
    const wickDown = Math.abs(nextRand() * vol * 0.75) * Math.min(open, close);
    const high = Math.round((Math.max(open, close) + wickUp) * 100) / 100;
    const low = Math.round(Math.max(1, Math.min(open, close) - wickDown) * 100) / 100;
    const baseVolume = inst.instrumentType === 'INDEX' ? null : Math.round((800_000 + nextRand() * 4_200_000));

    const dt = new Date(cursorTime);
    const label =
      timeframe === '5D'
        ? `${dt.toISOString().slice(5, 10)} ${String(9 + (i % 6)).padStart(2, '0')}:15`
        : dt.toISOString().slice(0, 10);

    candles.push({
      time: label,
      timestamp: cursorTime,
      open,
      high,
      low,
      close,
      volume: baseVolume,
    });
    cursorTime += stepMs;
  }

  return candles;
}

// ---------------------------------------------------------------------------
// Historical Candles Service (Authorized Yahoo Finance chart() + per-symbol cache)
// ---------------------------------------------------------------------------
export async function getHistoricalCandles(
  rawSymbol: string,
  timeframe: SupportedTimeframe = '3M'
): Promise<HistoricalChartResponse> {
  const inst = getRegisteredInstrument(rawSymbol);
  if (!inst) {
    return {
      symbol: rawSymbol.toUpperCase(),
      name: rawSymbol.toUpperCase(),
      exchange: 'NSE',
      instrumentType: 'EQUITY',
      timeframe,
      interval: '1d',
      candles: [],
      latestPrice: null,
      previousClose: null,
      change: null,
      changePercent: null,
      meta: {
        status: 'UNAVAILABLE',
        source: 'Instrument Registry',
        lastUpdated: new Date().toISOString(),
        marketOpen: isIndianMarketOpenNow(),
        growwConfigured: isGrowwConfigured(),
        notice: `Instrument "${rawSymbol}" is not in the supported NSE/BSE instrument registry.`,
      },
    };
  }

  const cacheKey = `${inst.symbol}:${timeframe}`;
  const cached = historyCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return {
      ...cached.value,
      meta: {
        ...cached.value.meta,
        status: cached.value.meta.status === 'SIMULATED' ? 'SIMULATED' : 'CACHED',
      },
    };
  }

  const daysBackMap: Record<SupportedTimeframe, { days: number; interval: '15m' | '1d' | '1wk' }> = {
    '5D': { days: 7, interval: '15m' },
    '1M': { days: 34, interval: '1d' },
    '3M': { days: 96, interval: '1d' },
    '6M': { days: 186, interval: '1d' },
    '1Y': { days: 370, interval: '1d' },
  };
  const cfg = daysBackMap[timeframe] || daysBackMap['3M'];

  try {
    const period1 = new Date(Date.now() - cfg.days * 24 * 60 * 60 * 1000);
    const chartRes: any = await Promise.race([
      yf.chart(inst.yahooSymbol, {
        period1,
        period2: new Date(),
        interval: cfg.interval,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Historical chart timeout')), 7500)),
    ]);

    const quotes: any[] = Array.isArray(chartRes?.quotes) ? chartRes.quotes : [];
    const validBars: HistoricalCandleBar[] = quotes
      .filter(
        (q) =>
          q &&
          q.date &&
          Number.isFinite(q.open) &&
          Number.isFinite(q.high) &&
          Number.isFinite(q.low) &&
          Number.isFinite(q.close)
      )
      .map((q) => {
        const dt = new Date(q.date);
        const timeStr =
          timeframe === '5D'
            ? `${dt.toISOString().slice(5, 10)} ${dt.toISOString().slice(11, 16)}`
            : dt.toISOString().slice(0, 10);
        return {
          time: timeStr,
          timestamp: dt.getTime(),
          open: Math.round(Number(q.open) * 100) / 100,
          high: Math.round(Number(q.high) * 100) / 100,
          low: Math.round(Number(q.low) * 100) / 100,
          close: Math.round(Number(q.close) * 100) / 100,
          volume: Number.isFinite(q.volume) && Number(q.volume) > 0 ? Math.round(Number(q.volume)) : null,
        };
      });

    if (validBars.length >= 5) {
      const last = validBars[validBars.length - 1];
      const prev = validBars[validBars.length - 2] || last;
      const latestPrice = toNumOrNull(chartRes?.meta?.regularMarketPrice) ?? last.close;
      const previousClose = toNumOrNull(chartRes?.meta?.chartPreviousClose) ?? prev.close;
      const change = Math.round((latestPrice - previousClose) * 100) / 100;
      const changePercent =
        previousClose > 0 ? Math.round(((change / previousClose) * 100) * 100) / 100 : 0;

      const response: HistoricalChartResponse = {
        symbol: inst.symbol,
        name: inst.name,
        exchange: inst.exchange,
        instrumentType: inst.instrumentType,
        timeframe,
        interval: cfg.interval,
        candles: validBars,
        latestPrice,
        previousClose,
        change,
        changePercent,
        meta: {
          status: isIndianMarketOpenNow() ? 'DELAYED' : 'HISTORICAL',
          source: `Historical Market Series (${inst.yahooSymbol})`,
          lastUpdated: new Date().toISOString(),
          marketOpen: isIndianMarketOpenNow(),
          growwConfigured: isGrowwConfigured(),
          notice: isIndianMarketOpenNow()
            ? 'Historical interval candles (delayed ~15 mins).'
            : 'Market closed — showing last completed historical session candles.',
        },
      };

      historyCache.set(cacheKey, {
        value: response,
        storedAt: Date.now(),
        expiresAt: Date.now() + HISTORY_TTL_MS,
      });

      return response;
    }
  } catch (_err) {
    // Fall through to honest simulated fallback if Yahoo Finance is unreachable
  }

  const simulatedBars = buildDeterministicSimulatedHistory(inst, timeframe);
  const last = simulatedBars[simulatedBars.length - 1];
  const prev = simulatedBars[simulatedBars.length - 2] || last;
  const change = Math.round((last.close - prev.close) * 100) / 100;
  const changePercent = prev.close > 0 ? Math.round(((change / prev.close) * 100) * 100) / 100 : 0;

  const fallbackResponse: HistoricalChartResponse = {
    symbol: inst.symbol,
    name: inst.name,
    exchange: inst.exchange,
    instrumentType: inst.instrumentType,
    timeframe,
    interval: cfg.interval,
    candles: simulatedBars,
    latestPrice: last.close,
    previousClose: prev.close,
    change,
    changePercent,
    meta: {
      status: 'SIMULATED',
      source: 'Offline Symbol-Specific Reference Series (Simulation)',
      lastUpdated: new Date().toISOString(),
      marketOpen: isIndianMarketOpenNow(),
      growwConfigured: isGrowwConfigured(),
      notice: 'External historical feed unreachable — displaying clearly labelled symbol-specific simulated OHLC candles.',
    },
  };

  historyCache.set(cacheKey, {
    value: fallbackResponse,
    storedAt: Date.now(),
    expiresAt: Date.now() + 60_000,
  });

  return fallbackResponse;
}

// ---------------------------------------------------------------------------
// A. Groww Live Quote Endpoint: GET /v1/live-data/quote
// ---------------------------------------------------------------------------
export async function getInstrumentQuote(rawSymbol: string): Promise<NormalizedQuote | null> {
  const inst = getRegisteredInstrument(rawSymbol);
  if (!inst) return null;

  const cacheKey = `${inst.exchange}:${inst.segment}:${inst.symbol}`;
  const cached = quoteCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return {
      ...cached.value,
      meta: {
        ...cached.value.meta,
        status: cached.value.meta.status === 'LIVE' ? 'CACHED' : cached.value.meta.status,
      },
    };
  }

  // 1. Try Groww Official Live Quote API when GROWW_ACCESS_TOKEN is configured
  if (isGrowwConfigured()) {
    const growwRes = await fetchGrowwJson('/live-data/quote', {
      exchange: inst.exchange,
      segment: inst.segment,
      trading_symbol: inst.growwTradingSymbol,
    });

    if (growwRes.ok && growwRes.payload) {
      const p = growwRes.payload;
      const ohlcObj = p.ohlc || {};
      const lastPrice = toNumOrNull(p.last_price);
      const dayChange = toNumOrNull(p.day_change);
      const dayChangePerc = toNumOrNull(p.day_change_perc);

      const rawDepth = p.depth || p.market_depth;
      const parsedDepth =
        rawDepth && (Array.isArray(rawDepth.buy) || Array.isArray(rawDepth.sell))
          ? {
              buy: (rawDepth.buy || [])
                .filter((b: any) => toNumOrNull(b?.price) !== null && toNumOrNull(b?.quantity) !== null)
                .map((b: any) => ({
                  price: Number(b.price),
                  quantity: Number(b.quantity),
                  orders: toNumOrNull(b.orders) ?? undefined,
                })),
              sell: (rawDepth.sell || [])
                .filter((s: any) => toNumOrNull(s?.price) !== null && toNumOrNull(s?.quantity) !== null)
                .map((s: any) => ({
                  price: Number(s.price),
                  quantity: Number(s.quantity),
                  orders: toNumOrNull(s.orders) ?? undefined,
                })),
            }
          : null;

      const normalized: NormalizedQuote = {
        symbol: inst.symbol,
        name: inst.name,
        exchange: inst.exchange,
        segment: inst.segment,
        instrumentType: inst.instrumentType,
        lastPrice,
        dayChange,
        dayChangePerc,
        ohlc: {
          open: toNumOrNull(ohlcObj.open),
          high: toNumOrNull(ohlcObj.high),
          low: toNumOrNull(ohlcObj.low),
          close: toNumOrNull(ohlcObj.close),
        },
        averagePrice: toNumOrNull(p.average_price),
        volume: toNumOrNull(p.volume),
        lastTradeQuantity: toNumOrNull(p.last_trade_quantity),
        lastTradeTime: p.last_trade_time ? String(p.last_trade_time) : null,
        bidPrice: toNumOrNull(p.bid_price),
        bidQuantity: toNumOrNull(p.bid_quantity),
        offerPrice: toNumOrNull(p.offer_price),
        offerQuantity: toNumOrNull(p.offer_quantity),
        totalBuyQuantity: toNumOrNull(p.total_buy_quantity),
        totalSellQuantity: toNumOrNull(p.total_sell_quantity),
        upperCircuitLimit: toNumOrNull(p.upper_circuit_limit),
        lowerCircuitLimit: toNumOrNull(p.lower_circuit_limit),
        highTradeRange: toNumOrNull(p.high_trade_range),
        lowTradeRange: toNumOrNull(p.low_trade_range),
        week52High: toNumOrNull(p.week_52_high) ?? inst.high52w,
        week52Low: toNumOrNull(p.week_52_low) ?? inst.low52w,
        openInterest: toNumOrNull(p.open_interest),
        oiDayChange: toNumOrNull(p.oi_day_change),
        oiDayChangePerc: toNumOrNull(p.oi_day_change_percentage ?? p.oi_day_change_perc),
        impliedVolatility: toNumOrNull(p.implied_volatility),
        depth: parsedDepth,
        fundamentals: {
          peRatio: inst.peRatio,
          pbRatio: inst.pbRatio,
          roe: inst.roe,
          roce: inst.roce,
          debtToEquity: inst.debtToEquity,
          eps: inst.eps,
          dividendYield: inst.dividendYield,
          marketCapCr: inst.marketCapCr,
          sector: inst.sector,
          lotSize: inst.lotSize,
          relatedEtfSymbol: inst.relatedEtfSymbol,
        },
        meta: {
          status: isIndianMarketOpenNow() ? 'LIVE' : 'HISTORICAL',
          source: 'Groww Live Data API (v1)',
          lastUpdated: new Date().toISOString(),
          marketOpen: isIndianMarketOpenNow(),
          growwConfigured: true,
          notice: isIndianMarketOpenNow()
            ? 'Authenticated Groww live market quote.'
            : 'Market closed — displaying last settled Groww quote.',
        },
      };

      quoteCache.set(cacheKey, {
        value: normalized,
        storedAt: Date.now(),
        expiresAt: Date.now() + QUOTE_TTL_MS,
      });

      return normalized;
    }
  }

  // 2. Fallback: Use latest bar from Historical Candles (Yahoo Finance delayed/historical or honest simulated)
  const hist = await getHistoricalCandles(inst.symbol, '1M');
  const lastCandle = hist.candles[hist.candles.length - 1];
  const prevCandle = hist.candles[hist.candles.length - 2] || lastCandle;
  const lastPrice = hist.latestPrice ?? lastCandle?.close ?? inst.referencePrice;
  const prevClose = hist.previousClose ?? prevCandle?.close ?? lastPrice;
  const dayChange = Math.round((lastPrice - prevClose) * 100) / 100;
  const dayChangePerc = prevClose > 0 ? Math.round(((dayChange / prevClose) * 100) * 100) / 100 : 0;

  const fallbackQuote: NormalizedQuote = {
    symbol: inst.symbol,
    name: inst.name,
    exchange: inst.exchange,
    segment: inst.segment,
    instrumentType: inst.instrumentType,
    lastPrice,
    dayChange,
    dayChangePerc,
    ohlc: {
      open: lastCandle?.open ?? null,
      high: lastCandle?.high ?? null,
      low: lastCandle?.low ?? null,
      close: prevClose,
    },
    averagePrice: lastCandle
      ? Math.round(((lastCandle.high + lastCandle.low + lastCandle.close) / 3) * 100) / 100
      : null,
    volume: lastCandle?.volume ?? null,
    lastTradeQuantity: null,
    lastTradeTime: lastCandle?.time ?? null,
    bidPrice: null,
    bidQuantity: null,
    offerPrice: null,
    offerQuantity: null,
    totalBuyQuantity: null,
    totalSellQuantity: null,
    upperCircuitLimit: null,
    lowerCircuitLimit: null,
    highTradeRange: null,
    lowTradeRange: null,
    week52High: inst.high52w,
    week52Low: inst.low52w,
    openInterest: null,
    oiDayChange: null,
    oiDayChangePerc: null,
    impliedVolatility: null,
    depth: null,
    fundamentals: {
      peRatio: inst.peRatio,
      pbRatio: inst.pbRatio,
      roe: inst.roe,
      roce: inst.roce,
      debtToEquity: inst.debtToEquity,
      eps: inst.eps,
      dividendYield: inst.dividendYield,
      marketCapCr: inst.marketCapCr,
      sector: inst.sector,
      lotSize: inst.lotSize,
      relatedEtfSymbol: inst.relatedEtfSymbol,
    },
    meta: {
      status: hist.meta.status === 'SIMULATED' ? 'SIMULATED' : isIndianMarketOpenNow() ? 'DELAYED' : 'HISTORICAL',
      source: isGrowwConfigured()
        ? `Fallback Historical Feed (${inst.yahooSymbol}) — Groww quote unavailable`
        : `${hist.meta.source} (Set GROWW_ACCESS_TOKEN for live Groww quotes)`,
      lastUpdated: hist.meta.lastUpdated,
      marketOpen: isIndianMarketOpenNow(),
      growwConfigured: isGrowwConfigured(),
      notice: isGrowwConfigured()
        ? 'Groww quote unavailable for this request; showing clearly labelled delayed/historical quote.'
        : 'GROWW_ACCESS_TOKEN not configured — showing delayed/historical quote (never labelled live).',
    },
  };

  quoteCache.set(cacheKey, {
    value: fallbackQuote,
    storedAt: Date.now(),
    expiresAt: Date.now() + QUOTE_TTL_MS,
  });

  return fallbackQuote;
}

// ---------------------------------------------------------------------------
// B. Groww Batch Live LTP Endpoint: GET /v1/live-data/ltp (Max 50 validation)
// ---------------------------------------------------------------------------
export async function getBatchLtp(
  segment: 'CASH' | 'FNO',
  exchangeSymbols: string[]
): Promise<{
  success: boolean;
  error?: string;
  data?: Record<string, number | null>;
  ltpMap: Record<string, number | null>;
  symbolMap: Record<string, { price: number | null; change: number | null; changePercent: number | null }>;
  meta: MarketMeta;
}> {
  const cleaned = Array.from(new Set(exchangeSymbols.map((s) => s.trim().toUpperCase()).filter(Boolean)));
  if (cleaned.length === 0) {
    return {
      success: false,
      error: 'At least one exchange_symbol (e.g., NSE_RELIANCE) is required.',
      data: {},
      ltpMap: {},
      symbolMap: {},
      meta: {
        status: 'UNAVAILABLE',
        source: 'Validation',
        lastUpdated: new Date().toISOString(),
        marketOpen: isIndianMarketOpenNow(),
        growwConfigured: isGrowwConfigured(),
      },
    };
  }

  if (cleaned.length > 50) {
    return {
      success: false,
      error: 'Groww LTP endpoint supports a maximum of 50 exchange_symbols per request.',
      data: {},
      ltpMap: {},
      symbolMap: {},
      meta: {
        status: 'UNAVAILABLE',
        source: 'Validation',
        lastUpdated: new Date().toISOString(),
        marketOpen: isIndianMarketOpenNow(),
        growwConfigured: isGrowwConfigured(),
      },
    };
  }

  for (const sym of cleaned) {
    if (!isValidExchangeSymbolFormat(sym)) {
      return {
        success: false,
        error: `Invalid exchange_symbol format "${sym}". Expected EXCHANGE_SYMBOL (e.g., NSE_RELIANCE, BSE_SENSEX).`,
        data: {},
        ltpMap: {},
        symbolMap: {},
        meta: {
          status: 'UNAVAILABLE',
          source: 'Validation',
          lastUpdated: new Date().toISOString(),
          marketOpen: isIndianMarketOpenNow(),
          growwConfigured: isGrowwConfigured(),
        },
      };
    }
  }

  if (isGrowwConfigured()) {
    const growwRes = await fetchGrowwJson('/live-data/ltp', {
      segment,
      exchange_symbols: cleaned.join(','),
    });

    if (growwRes.ok && growwRes.payload && typeof growwRes.payload === 'object') {
      const ltpMap: Record<string, number | null> = {};
      const symbolMap: Record<string, { price: number | null; change: number | null; changePercent: number | null }> = {};

      for (const exSym of cleaned) {
        const val = toNumOrNull(growwRes.payload[exSym]);
        ltpMap[exSym] = val;
        const plainSym = exSym.replace(/^(NSE|BSE)_/, '');
        symbolMap[plainSym] = { price: val, change: null, changePercent: null };
      }

      return {
        success: true,
        data: ltpMap,
        ltpMap,
        symbolMap,
        meta: {
          status: isIndianMarketOpenNow() ? 'LIVE' : 'HISTORICAL',
          source: 'Groww Live LTP API (v1)',
          lastUpdated: new Date().toISOString(),
          marketOpen: isIndianMarketOpenNow(),
          growwConfigured: true,
        },
      };
    }
  }

  // Fallback to per-instrument historical/delayed quote
  const ltpMap: Record<string, number | null> = {};
  const symbolMap: Record<string, { price: number | null; change: number | null; changePercent: number | null }> = {};
  let anySimulated = false;

  await Promise.all(
    cleaned.map(async (exSym) => {
      const plainSym = exSym.replace(/^(NSE|BSE)_/, '');
      const q = await getInstrumentQuote(plainSym);
      if (q?.meta.status === 'SIMULATED') anySimulated = true;
      ltpMap[exSym] = q?.lastPrice ?? null;
      symbolMap[plainSym] = {
        price: q?.lastPrice ?? null,
        change: q?.dayChange ?? null,
        changePercent: q?.dayChangePerc ?? null,
      };
    })
  );

  return {
    success: true,
    data: ltpMap,
    ltpMap,
    symbolMap,
    meta: {
      status: anySimulated ? 'SIMULATED' : isIndianMarketOpenNow() ? 'DELAYED' : 'HISTORICAL',
      source: isGrowwConfigured() ? 'Fallback Historical Series' : 'Delayed/Historical Feed (GROWW_ACCESS_TOKEN unset)',
      lastUpdated: new Date().toISOString(),
      marketOpen: isIndianMarketOpenNow(),
      growwConfigured: isGrowwConfigured(),
    },
  };
}

// ---------------------------------------------------------------------------
// C. Groww Live OHLC Snapshot Endpoint: GET /v1/live-data/ohlc
// (Current session OHLC snapshot ONLY — never used to fabricate historical candles)
// ---------------------------------------------------------------------------
export async function getBatchOhlcSnapshot(
  segment: 'CASH' | 'FNO',
  exchangeSymbols: string[]
): Promise<{
  success: boolean;
  error?: string;
  ohlcMap: Record<string, { open: number | null; high: number | null; low: number | null; close: number | null }>;
  meta: MarketMeta;
}> {
  const cleaned = Array.from(new Set(exchangeSymbols.map((s) => s.trim().toUpperCase()).filter(Boolean)));
  if (cleaned.length === 0 || cleaned.length > 50) {
    return {
      success: false,
      error: 'Provide between 1 and 50 valid EXCHANGE_SYMBOL identifiers.',
      ohlcMap: {},
      meta: {
        status: 'UNAVAILABLE',
        source: 'Validation',
        lastUpdated: new Date().toISOString(),
        marketOpen: isIndianMarketOpenNow(),
        growwConfigured: isGrowwConfigured(),
      },
    };
  }

  for (const sym of cleaned) {
    if (!isValidExchangeSymbolFormat(sym)) {
      return {
        success: false,
        error: `Invalid exchange_symbol format "${sym}".`,
        ohlcMap: {},
        meta: {
          status: 'UNAVAILABLE',
          source: 'Validation',
          lastUpdated: new Date().toISOString(),
          marketOpen: isIndianMarketOpenNow(),
          growwConfigured: isGrowwConfigured(),
        },
      };
    }
  }

  if (isGrowwConfigured()) {
    const growwRes = await fetchGrowwJson('/live-data/ohlc', {
      segment,
      exchange_symbols: cleaned.join(','),
    });

    if (growwRes.ok && growwRes.payload && typeof growwRes.payload === 'object') {
      const ohlcMap: Record<string, { open: number | null; high: number | null; low: number | null; close: number | null }> = {};
      for (const exSym of cleaned) {
        const raw = growwRes.payload[exSym];
        const parsed = typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch { return {}; } })() : (raw || {});
        ohlcMap[exSym] = {
          open: toNumOrNull(parsed.open),
          high: toNumOrNull(parsed.high),
          low: toNumOrNull(parsed.low),
          close: toNumOrNull(parsed.close),
        };
      }
      return {
        success: true,
        ohlcMap,
        meta: {
          status: isIndianMarketOpenNow() ? 'LIVE' : 'HISTORICAL',
          source: 'Groww Live OHLC Snapshot API (v1)',
          lastUpdated: new Date().toISOString(),
          marketOpen: isIndianMarketOpenNow(),
          growwConfigured: true,
          notice: 'Current session OHLC snapshot only (not interval historical candles).',
        },
      };
    }
  }

  const ohlcMap: Record<string, { open: number | null; high: number | null; low: number | null; close: number | null }> = {};
  let anySimulated = false;
  await Promise.all(
    cleaned.map(async (exSym) => {
      const plainSym = exSym.replace(/^(NSE|BSE)_/, '');
      const q = await getInstrumentQuote(plainSym);
      if (q?.meta.status === 'SIMULATED') anySimulated = true;
      ohlcMap[exSym] = q?.ohlc ?? { open: null, high: null, low: null, close: null };
    })
  );

  return {
    success: true,
    ohlcMap,
    meta: {
      status: anySimulated ? 'SIMULATED' : isIndianMarketOpenNow() ? 'DELAYED' : 'HISTORICAL',
      source: 'Session OHLC Snapshot Fallback',
      lastUpdated: new Date().toISOString(),
      marketOpen: isIndianMarketOpenNow(),
      growwConfigured: isGrowwConfigured(),
      notice: 'Current session OHLC snapshot only.',
    },
  };
}

// ---------------------------------------------------------------------------
// Valid Weekly/Monthly Index Expiry Generator (Standard NSE/BSE Expiry Calendar)
// ---------------------------------------------------------------------------
export function getUpcomingValidExpiries(exchange: 'NSE' | 'BSE', count = 4): string[] {
  // NSE NIFTY weekly expiry: Thursday (day 4); BSE SENSEX weekly expiry: Tuesday (day 2)
  const targetWeekday = exchange === 'BSE' ? 2 : 4;
  const results: string[] = [];
  const cursor = new Date();
  cursor.setUTCHours(10, 0, 0, 0);

  for (let d = 0; d < 45 && results.length < count; d++) {
    const candidate = new Date(cursor.getTime() + d * 24 * 60 * 60 * 1000);
    if (candidate.getUTCDay() === targetWeekday) {
      const iso = candidate.toISOString().slice(0, 10);
      // If today is expiry day and past 15:30 IST (10:00 UTC), skip today
      if (d === 0 && new Date().getUTCHours() >= 10) continue;
      results.push(iso);
    }
  }
  return results;
}

function computeDaysToExpiry(expiryDate: string): number {
  const exp = new Date(`${expiryDate}T10:00:00Z`).getTime();
  const diffDays = (exp - Date.now()) / (24 * 60 * 60 * 1000);
  return Math.max(0, Math.ceil(diffDays));
}

// Black-Scholes helper ONLY for clearly-labelled SIMULATED educational option chain
// when GROWW_ACCESS_TOKEN is not configured or unavailable.
function erfApprox(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-ax * ax));
  return sign * y;
}

function normalCdf(x: number): number {
  return 0.5 * (1 + erfApprox(x / Math.SQRT2));
}

function normalPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function buildSimulatedOptionChain(
  inst: RegisteredInstrument,
  spotPrice: number,
  expiryDate: string,
  availableExpiries: string[],
  reasonNotice: string
): OptionChainResponse {
  const step = inst.strikeStep || 50;
  const atmStrike = Math.round(spotPrice / step) * step;
  const dte = Math.max(1, computeDaysToExpiry(expiryDate));
  const T = Math.max(1 / 365, dte / 365);
  const r = 0.067; // 6.7% RBI repo-aligned risk-free assumption for educational model

  const strikes: OptionChainStrikeRow[] = [];
  let totalCallOi = 0;
  let totalPutOi = 0;
  let totalCallVol = 0;
  let totalPutVol = 0;

  for (let offset = -10; offset <= 10; offset++) {
    const K = atmStrike + offset * step;
    const moneyness = (K - spotPrice) / spotPrice;
    // Realistic volatility smile/skew (puts slightly higher IV than equidistant calls)
    const baseIv = inst.symbol === 'BANKNIFTY' ? 0.155 : 0.132;
    const skewIv = Math.max(0.09, Math.min(0.38, baseIv + Math.abs(moneyness) * 0.85 - moneyness * 0.25));

    const sqrtT = Math.sqrt(T);
    const d1 = (Math.log(spotPrice / K) + (r + 0.5 * skewIv * skewIv) * T) / (skewIv * sqrtT);
    const d2 = d1 - skewIv * sqrtT;

    const callTheo = Math.max(0.5, spotPrice * normalCdf(d1) - K * Math.exp(-r * T) * normalCdf(d2));
    const putTheo = Math.max(0.5, K * Math.exp(-r * T) * normalCdf(-d2) - spotPrice * normalCdf(-d1));

    const callLtp = Math.round(callTheo * 20) / 20;
    const putLtp = Math.round(putTheo * 20) / 20;

    const gamma = Number((normalPdf(d1) / (spotPrice * skewIv * sqrtT)).toFixed(5));
    const vega = Number(((spotPrice * normalPdf(d1) * sqrtT) / 100).toFixed(2));
    const callDelta = Number(normalCdf(d1).toFixed(3));
    const putDelta = Number((callDelta - 1).toFixed(3));
    const callTheta = Number(
      (
        (-(spotPrice * normalPdf(d1) * skewIv) / (2 * sqrtT) - r * K * Math.exp(-r * T) * normalCdf(d2)) /
        365
      ).toFixed(2)
    );
    const putTheta = Number(
      (
        (-(spotPrice * normalPdf(d1) * skewIv) / (2 * sqrtT) + r * K * Math.exp(-r * T) * normalCdf(-d2)) /
        365
      ).toFixed(2)
    );
    const callRho = Number(((K * T * Math.exp(-r * T) * normalCdf(d2)) / 100).toFixed(3));
    const putRho = Number(((-K * T * Math.exp(-r * T) * normalCdf(-d2)) / 100).toFixed(3));

    const distFactor = Math.exp(-Math.pow(offset / 5, 2));
    const seed = hashSeed(`${inst.symbol}:${expiryDate}:${K}`);
    const callOi = Math.round((45_000 + (seed % 90_000)) * distFactor * (offset >= 0 ? 1.35 : 0.7));
    const putOi = Math.round((48_000 + ((seed >> 3) % 92_000)) * distFactor * (offset <= 0 ? 1.35 : 0.7));
    const callVol = Math.round(callOi * 1.6);
    const putVol = Math.round(putOi * 1.55);

    totalCallOi += callOi;
    totalPutOi += putOi;
    totalCallVol += callVol;
    totalPutVol += putVol;

    const expCompact = expiryDate.replace(/-/g, '');
    const ceSym = `${inst.symbol}${expCompact}${K}CE`;
    const peSym = `${inst.symbol}${expCompact}${K}PE`;

    strikes.push({
      strikePrice: K,
      ce: {
        tradingSymbol: ceSym,
        ltp: callLtp,
        dayChange: Math.round((callLtp * 0.04 * (offset <= 0 ? 1 : -1)) * 100) / 100,
        dayChangePerc: Number((offset <= 0 ? 4.2 : -3.8).toFixed(2)),
        openInterest: callOi,
        oiChange: Math.round(callOi * 0.06),
        volume: callVol,
        bidPrice: Math.max(0.05, Math.round((callLtp - 0.15) * 20) / 20),
        askPrice: Math.round((callLtp + 0.15) * 20) / 20,
        impliedVolatility: Number((skewIv * 100).toFixed(2)),
        // Marked simulated model sensitivities, NOT official live exchange Greeks
        greeks: {
          delta: callDelta,
          gamma,
          theta: callTheta,
          vega,
          rho: callRho,
          iv: Number((skewIv * 100).toFixed(2)),
        },
        greeksAvailable: true,
      },
      pe: {
        tradingSymbol: peSym,
        ltp: putLtp,
        dayChange: Math.round((putLtp * 0.04 * (offset >= 0 ? 1 : -1)) * 100) / 100,
        dayChangePerc: Number((offset >= 0 ? 3.9 : -4.1).toFixed(2)),
        openInterest: putOi,
        oiChange: Math.round(putOi * 0.05),
        volume: putVol,
        bidPrice: Math.max(0.05, Math.round((putLtp - 0.15) * 20) / 20),
        askPrice: Math.round((putLtp + 0.15) * 20) / 20,
        impliedVolatility: Number(((skewIv + 0.008) * 100).toFixed(2)),
        greeks: {
          delta: putDelta,
          gamma,
          theta: putTheta,
          vega,
          rho: putRho,
          iv: Number(((skewIv + 0.008) * 100).toFixed(2)),
        },
        greeksAvailable: true,
      },
    });
  }

  return {
    underlying: inst.symbol,
    underlyingName: inst.name,
    exchange: inst.exchange,
    underlyingLtp: spotPrice,
    lotSize: inst.lotSize,
    strikeStep: step,
    expiryDate,
    availableExpiries,
    daysToExpiry: dte,
    strikes,
    pcrOi: totalCallOi > 0 ? Number((totalPutOi / totalCallOi).toFixed(2)) : null,
    pcrVolume: totalCallVol > 0 ? Number((totalPutVol / totalCallVol).toFixed(2)) : null,
    meta: {
      status: 'SIMULATED',
      source: 'Educational Black-Scholes Simulation (Spot anchored)',
      lastUpdated: new Date().toISOString(),
      marketOpen: isIndianMarketOpenNow(),
      growwConfigured: isGrowwConfigured(),
      notice: reasonNotice,
    },
  };
}

// ---------------------------------------------------------------------------
// D. Groww Option Chain Endpoint:
// GET /v1/option-chain/exchange/{exchange}/underlying/{underlying}?expiry_date={expiry_date}
// ---------------------------------------------------------------------------
export async function getIndexOptionChain(
  rawUnderlying: string,
  requestedExpiry?: string,
  allowSimulationFallback = true
): Promise<OptionChainResponse | null> {
  const inst = getRegisteredInstrument(rawUnderlying);
  if (!inst || !inst.supportsOptions) {
    return null;
  }

  const availableExpiries = getUpcomingValidExpiries(inst.exchange, 4);
  const expiryDate =
    requestedExpiry && /^\d{4}-\d{2}-\d{2}$/.test(requestedExpiry)
      ? requestedExpiry
      : availableExpiries[0];

  const cacheKey = `${inst.exchange}:${inst.symbol}:${expiryDate}`;
  const cached = optionChainCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return {
      ...cached.value,
      meta: {
        ...cached.value.meta,
        status: cached.value.meta.status === 'LIVE' ? 'CACHED' : cached.value.meta.status,
      },
    };
  }

  // 1. Try Official Groww Option Chain API when GROWW_ACCESS_TOKEN is configured
  if (isGrowwConfigured()) {
    const path = `/option-chain/exchange/${encodeURIComponent(inst.exchange)}/underlying/${encodeURIComponent(inst.growwTradingSymbol)}`;
    const growwRes = await fetchGrowwJson(path, { expiry_date: expiryDate });

    if (growwRes.ok && growwRes.payload) {
      const p = growwRes.payload;
      const underlyingLtp = toNumOrNull(p.underlying_ltp);
      const rawStrikesObj = p.strikes || {};
      const strikeRows: OptionChainStrikeRow[] = [];

      let totalCallOi = 0;
      let totalPutOi = 0;
      let totalCallVol = 0;
      let totalPutVol = 0;

      const parseSide = (sideRaw: any): OptionContractSide | null => {
        if (!sideRaw || typeof sideRaw !== 'object') return null;
        const g = sideRaw.greeks;
        const hasGreeks = Boolean(
          g &&
            (toNumOrNull(g.delta) !== null ||
              toNumOrNull(g.gamma) !== null ||
              toNumOrNull(g.theta) !== null ||
              toNumOrNull(g.vega) !== null)
        );
        return {
          tradingSymbol: String(sideRaw.trading_symbol || ''),
          ltp: toNumOrNull(sideRaw.ltp),
          dayChange: toNumOrNull(sideRaw.day_change),
          dayChangePerc: toNumOrNull(sideRaw.day_change_perc),
          openInterest: toNumOrNull(sideRaw.open_interest),
          oiChange: toNumOrNull(sideRaw.oi_day_change ?? sideRaw.prev_open_interest),
          volume: toNumOrNull(sideRaw.volume),
          bidPrice: toNumOrNull(sideRaw.bid_price),
          askPrice: toNumOrNull(sideRaw.offer_price ?? sideRaw.ask_price),
          impliedVolatility: toNumOrNull(g?.iv ?? sideRaw.implied_volatility),
          // Never estimate missing Greeks on official live chain!
          greeks: hasGreeks
            ? {
                delta: toNumOrNull(g.delta),
                gamma: toNumOrNull(g.gamma),
                theta: toNumOrNull(g.theta),
                vega: toNumOrNull(g.vega),
                rho: toNumOrNull(g.rho),
                iv: toNumOrNull(g.iv),
              }
            : null,
          greeksAvailable: hasGreeks,
        };
      };

      const sortedStrikeKeys = Object.keys(rawStrikesObj)
        .map((k) => ({ key: k, num: Number(k) }))
        .filter((x) => Number.isFinite(x.num))
        .sort((a, b) => a.num - b.num);

      for (const { key, num } of sortedStrikeKeys) {
        const entry = rawStrikesObj[key];
        const ce = parseSide(entry?.CE || entry?.ce);
        const pe = parseSide(entry?.PE || entry?.pe);
        if (ce?.openInterest) totalCallOi += ce.openInterest;
        if (pe?.openInterest) totalPutOi += pe.openInterest;
        if (ce?.volume) totalCallVol += ce.volume;
        if (pe?.volume) totalPutVol += pe.volume;

        strikeRows.push({
          strikePrice: num,
          ce,
          pe,
        });
      }

      if (strikeRows.length > 0) {
        const liveChain: OptionChainResponse = {
          underlying: inst.symbol,
          underlyingName: inst.name,
          exchange: inst.exchange,
          underlyingLtp,
          lotSize: inst.lotSize,
          strikeStep: inst.strikeStep || 50,
          expiryDate,
          availableExpiries: Array.isArray(p.expiry_dates) && p.expiry_dates.length > 0 ? p.expiry_dates : availableExpiries,
          daysToExpiry: computeDaysToExpiry(expiryDate),
          strikes: strikeRows,
          pcrOi: totalCallOi > 0 ? Number((totalPutOi / totalCallOi).toFixed(2)) : null,
          pcrVolume: totalCallVol > 0 ? Number((totalPutVol / totalCallVol).toFixed(2)) : null,
          meta: {
            status: isIndianMarketOpenNow() ? 'LIVE' : 'HISTORICAL',
            source: 'Groww Option Chain API (v1)',
            lastUpdated: new Date().toISOString(),
            marketOpen: isIndianMarketOpenNow(),
            growwConfigured: true,
            notice: isIndianMarketOpenNow()
              ? 'Official Groww live option chain.'
              : 'Market closed — showing last available Groww option chain snapshot.',
          },
        };

        optionChainCache.set(cacheKey, {
          value: liveChain,
          storedAt: Date.now(),
          expiresAt: Date.now() + OPTION_CHAIN_TTL_MS,
        });

        return liveChain;
      }
    }
  }

  if (!allowSimulationFallback) {
    return {
      underlying: inst.symbol,
      underlyingName: inst.name,
      exchange: inst.exchange,
      underlyingLtp: null,
      lotSize: inst.lotSize,
      strikeStep: inst.strikeStep || 50,
      expiryDate,
      availableExpiries,
      daysToExpiry: computeDaysToExpiry(expiryDate),
      strikes: [],
      pcrOi: null,
      pcrVolume: null,
      meta: {
        status: 'UNAVAILABLE',
        source: 'Groww Option Chain API',
        lastUpdated: new Date().toISOString(),
        marketOpen: isIndianMarketOpenNow(),
        growwConfigured: isGrowwConfigured(),
        notice: isGrowwConfigured()
          ? 'Option chain unavailable for the selected expiry or market subscription.'
          : 'GROWW_ACCESS_TOKEN is not configured.',
      },
    };
  }

  // Honest, explicitly-labelled Educational Simulation Mode anchored to latest Index spot
  const spotQuote = await getInstrumentQuote(inst.symbol);
  const spot = spotQuote?.lastPrice ?? inst.referencePrice;
  const notice = isGrowwConfigured()
    ? 'Groww Option Chain unavailable for this expiry/subscription — showing clearly labelled Educational Black-Scholes Simulation.'
    : 'GROWW_ACCESS_TOKEN not configured — showing Educational Black-Scholes Simulation Mode (not live exchange quotes).';

  const simChain = buildSimulatedOptionChain(inst, spot, expiryDate, availableExpiries, notice);
  optionChainCache.set(cacheKey, {
    value: simChain,
    storedAt: Date.now(),
    expiresAt: Date.now() + OPTION_CHAIN_TTL_MS,
  });

  return simChain;
}

// ---------------------------------------------------------------------------
// E. Groww Greeks Endpoint:
// GET /v1/live-data/greeks/exchange/{exchange}/underlying/{underlying}/trading_symbol/{trading_symbol}/expiry/{expiry}
// ---------------------------------------------------------------------------
export async function getOptionContractGreeks(params: {
  exchange: 'NSE' | 'BSE';
  underlying: string;
  tradingSymbol: string;
  expiry: string;
}): Promise<{
  success: boolean;
  greeks: OptionGreeksData | null;
  meta: MarketMeta;
  error?: string;
}> {
  const { exchange, underlying, tradingSymbol, expiry } = params;
  const inst = getRegisteredInstrument(underlying);
  if (!inst || !inst.supportsOptions) {
    return {
      success: false,
      greeks: null,
      error: `Unsupported option underlying "${underlying}".`,
      meta: {
        status: 'UNAVAILABLE',
        source: 'Validation',
        lastUpdated: new Date().toISOString(),
        marketOpen: isIndianMarketOpenNow(),
        growwConfigured: isGrowwConfigured(),
      },
    };
  }

  if (isGrowwConfigured()) {
    const path = `/live-data/greeks/exchange/${encodeURIComponent(exchange)}/underlying/${encodeURIComponent(
      inst.growwTradingSymbol
    )}/trading_symbol/${encodeURIComponent(tradingSymbol)}/expiry/${encodeURIComponent(expiry)}`;
    const growwRes = await fetchGrowwJson(path);

    if (growwRes.ok && growwRes.payload) {
      const p = growwRes.payload;
      return {
        success: true,
        greeks: {
          delta: toNumOrNull(p.delta),
          gamma: toNumOrNull(p.gamma),
          theta: toNumOrNull(p.theta),
          vega: toNumOrNull(p.vega),
          rho: toNumOrNull(p.rho),
          iv: toNumOrNull(p.iv ?? p.implied_volatility),
        },
        meta: {
          status: isIndianMarketOpenNow() ? 'LIVE' : 'HISTORICAL',
          source: 'Groww Live Greeks API (v1)',
          lastUpdated: new Date().toISOString(),
          marketOpen: isIndianMarketOpenNow(),
          growwConfigured: true,
        },
      };
    }

    // Never estimate missing Greeks and claim they are official live Groww values!
    return {
      success: false,
      greeks: null,
      error: growwRes.error || 'Live Greeks unavailable from Groww API for this contract.',
      meta: {
        status: 'UNAVAILABLE',
        source: 'Groww Live Greeks API (v1)',
        lastUpdated: new Date().toISOString(),
        marketOpen: isIndianMarketOpenNow(),
        growwConfigured: true,
        notice: 'Official Greeks not returned for this contract.',
      },
    };
  }

  // If Groww is not configured, check simulated chain so educational mode stays transparent
  const chain = await getIndexOptionChain(inst.symbol, expiry, true);
  if (chain && chain.meta.status === 'SIMULATED') {
    for (const row of chain.strikes) {
      if (row.ce?.tradingSymbol === tradingSymbol) {
        return {
          success: true,
          greeks: row.ce.greeks,
          meta: {
            status: 'SIMULATED',
            source: 'Educational Black-Scholes Model Sensitivity (Simulation)',
            lastUpdated: chain.meta.lastUpdated,
            marketOpen: isIndianMarketOpenNow(),
            growwConfigured: false,
            notice: 'Theoretical Black-Scholes sensitivities (GROWW_ACCESS_TOKEN not configured).',
          },
        };
      }
      if (row.pe?.tradingSymbol === tradingSymbol) {
        return {
          success: true,
          greeks: row.pe.greeks,
          meta: {
            status: 'SIMULATED',
            source: 'Educational Black-Scholes Model Sensitivity (Simulation)',
            lastUpdated: chain.meta.lastUpdated,
            marketOpen: isIndianMarketOpenNow(),
            growwConfigured: false,
            notice: 'Theoretical Black-Scholes sensitivities (GROWW_ACCESS_TOKEN not configured).',
          },
        };
      }
    }
  }

  return {
    success: false,
    greeks: null,
    error: 'Contract Greeks unavailable.',
    meta: {
      status: 'UNAVAILABLE',
      source: 'Market Data Service',
      lastUpdated: new Date().toISOString(),
      marketOpen: isIndianMarketOpenNow(),
      growwConfigured: false,
    },
  };
}

// Helper used by server/db.ts to look up verified server-side option contract premium
export async function resolveServerOptionContractQuote(params: {
  underlying: string;
  expiry: string;
  strike: number;
  optionType: 'CE' | 'PE';
}): Promise<{
  found: boolean;
  contractSymbol?: string;
  exchange?: 'NSE' | 'BSE';
  lotSize?: number;
  underlyingLtp?: number | null;
  premium?: number;
  marketDataTimestamp?: string;
  dataSource?: string;
  error?: string;
}> {
  const inst = getRegisteredInstrument(params.underlying);
  if (!inst || !inst.supportsOptions) {
    return { found: false, error: `Unsupported index option underlying: ${params.underlying}` };
  }

  const chain = await getIndexOptionChain(inst.symbol, params.expiry, true);
  if (!chain || chain.strikes.length === 0) {
    return { found: false, error: `Option chain unavailable for ${inst.symbol} (${params.expiry}).` };
  }

  const row = chain.strikes.find((r) => Math.abs(r.strikePrice - params.strike) < 0.01);
  if (!row) {
    return { found: false, error: `Strike ${params.strike} not found in ${inst.symbol} ${params.expiry} option chain.` };
  }

  const side = params.optionType === 'CE' ? row.ce : row.pe;
  if (!side || side.ltp === null || side.ltp <= 0) {
    return { found: false, error: `Valid premium unavailable for ${inst.symbol} ${params.strike} ${params.optionType}.` };
  }

  return {
    found: true,
    contractSymbol: side.tradingSymbol || `${inst.symbol}_${params.expiry}_${params.strike}_${params.optionType}`,
    exchange: inst.exchange,
    lotSize: inst.lotSize,
    underlyingLtp: chain.underlyingLtp,
    premium: side.ltp,
    marketDataTimestamp: chain.meta.lastUpdated,
    dataSource: `${chain.meta.status}: ${chain.meta.source}`,
  };
}
