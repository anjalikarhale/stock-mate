// Real-time & Cached Indian Market Feed using yahoo-finance2
import YahooFinance from 'yahoo-finance2';
import { Server as SocketIOServer } from 'socket.io';

export type MarketBadgeStatus = 'DELAYED ~15 MIN' | 'CLOSED' | 'STALE';

export interface MarketQuote {
  symbol: string;         // Clean symbol (e.g. RELIANCE, NIFTY50)
  rawSymbol: string;      // Yahoo symbol (e.g. RELIANCE.NS, ^NSEI)
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  dayHigh?: number;
  dayLow?: number;
  timestamp: number;      // Epoch ms when quote was recorded/updated
  status: MarketBadgeStatus;
  lastUpdated: string;    // ISO string
}

// Constituent list: NIFTY 50 (.NS) plus ^NSEI (NIFTY 50 Index) and ^BSESN (SENSEX)
export const NIFTY_50_SYMBOLS = [
  'ADANIENT.NS', 'ADANIPORTS.NS', 'APOLLOHOSP.NS', 'ASIANPAINT.NS', 'AXISBANK.NS',
  'BAJAJ-AUTO.NS', 'BAJFINANCE.NS', 'BAJAJFINSV.NS', 'BEL.NS', 'BPCL.NS',
  'BHARTIARTL.NS', 'BRITANNIA.NS', 'CIPLA.NS', 'COALINDIA.NS', 'DRREDDY.NS',
  'EICHERMOT.NS', 'GRASIM.NS', 'HCLTECH.NS', 'HDFCBANK.NS', 'HDFCLIFE.NS',
  'HEROMOTOCO.NS', 'HINDALCO.NS', 'HINDUNILVR.NS', 'ICICIBANK.NS', 'ITC.NS',
  'INDUSINDBK.NS', 'INFY.NS', 'JSWSTEEL.NS', 'KOTAKBANK.NS', 'LT.NS',
  'LTIM.NS', 'M&M.NS', 'MARUTI.NS', 'NESTLEIND.NS', 'NTPC.NS',
  'ONGC.NS', 'POWERGRID.NS', 'RELIANCE.NS', 'SBILIFE.NS', 'SHRIRAMFIN.NS',
  'SBIN.NS', 'SUNPHARMA.NS', 'TATACONSUM.NS', 'TATAMOTORS.NS', 'TATASTEEL.NS',
  'TCS.NS', 'TECHM.NS', 'TITAN.NS', 'TRENT.NS', 'ULTRACEMCO.NS', 'WIPRO.NS',
  '^NSEI', '^BSESN',
];

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

// In-memory quote cache: Map<symbol, MarketQuote>
const quoteCache = new Map<string, MarketQuote>();
let outsideHoursFetched = false;
let ioInstance: SocketIOServer | null = null;
let isFetching = false;

/**
 * Checks whether the Indian stock market (NSE/BSE) is currently in regular trading hours.
 * Regular hours: Weekdays (Mon-Fri) between 9:15 AM and 3:30 PM IST (Asia/Kolkata).
 */
export function isIndianMarketOpen(): boolean {
  try {
    const now = new Date();
    const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const istDate = new Date(istString);
    const day = istDate.getDay(); // 0: Sun, 6: Sat
    if (day === 0 || day === 6) return false;

    const minutes = istDate.getHours() * 60 + istDate.getMinutes();
    const openMinutes = 9 * 60 + 15;   // 9:15 AM
    const closeMinutes = 15 * 60 + 30; // 3:30 PM (15:30)

    return minutes >= openMinutes && minutes <= closeMinutes;
  } catch (err) {
    console.error('[MarketFeed] Error calculating IST market hours:', err);
    return false;
  }
}

/**
 * Normalizes Yahoo ticker to clean symbol for uniform application lookups.
 * E.g. RELIANCE.NS -> RELIANCE, ^NSEI -> NIFTY50, ^BSESN -> SENSEX
 */
export function normalizeSymbol(rawSymbol: string): string {
  const upper = rawSymbol.toUpperCase();
  if (upper === '^NSEI') return 'NIFTY50';
  if (upper === '^BSESN') return 'SENSEX';
  return upper.replace(/\.NS$/, '').replace(/\.BO$/, '');
}

/**
 * Retrieves a cached quote by either clean symbol (RELIANCE) or Yahoo symbol (RELIANCE.NS).
 */
export function getMarketQuote(symbol: string): MarketQuote | undefined {
  if (!symbol) return undefined;
  const upper = symbol.toUpperCase().trim();
  return quoteCache.get(upper) ||
         quoteCache.get(normalizeSymbol(upper)) ||
         quoteCache.get(`${normalizeSymbol(upper)}.NS`);
}

/**
 * Returns all unique quotes from the cache.
 */
export function getAllQuotes(): MarketQuote[] {
  const uniqueMap = new Map<string, MarketQuote>();
  for (const quote of quoteCache.values()) {
    if (!uniqueMap.has(quote.symbol)) {
      uniqueMap.set(quote.symbol, quote);
    }
  }
  return Array.from(uniqueMap.values());
}

/**
 * Returns quotes mapped by symbol.
 */
export function getQuotesMap(): Record<string, MarketQuote> {
  const map: Record<string, MarketQuote> = {};
  for (const quote of quoteCache.values()) {
    map[quote.symbol] = quote;
    map[quote.rawSymbol] = quote;
  }
  return map;
}

/**
 * Performs a batched quote fetch across NIFTY 50 and key indices.
 */
export async function fetchMarketQuotes(): Promise<void> {
  if (isFetching) return;
  isFetching = true;

  const isOpen = isIndianMarketOpen();
  const targetStatus: MarketBadgeStatus = isOpen ? 'DELAYED ~15 MIN' : 'CLOSED';

  try {
    const rawResults = await yf.quote(NIFTY_50_SYMBOLS);
    const now = Date.now();
    const isoString = new Date(now).toISOString();

    for (const item of rawResults) {
      if (!item || !item.symbol) continue;
      const rawSymbol = item.symbol.toUpperCase();
      const cleanSymbol = normalizeSymbol(rawSymbol);

      const price = Number(item.regularMarketPrice ?? item.regularMarketPreviousClose ?? 0);
      const prevClose = Number(item.regularMarketPreviousClose ?? price);
      const change = Number(item.regularMarketChange ?? (price - prevClose));
      const changePercent = Number(
        item.regularMarketChangePercent ?? (prevClose > 0 ? ((change / prevClose) * 100) : 0)
      );
      const volume = Number(item.regularMarketVolume ?? 0);

      const quote: MarketQuote = {
        symbol: cleanSymbol,
        rawSymbol,
        name: item.shortName || item.longName || cleanSymbol,
        price: Math.round(price * 100) / 100,
        previousClose: Math.round(prevClose * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        volume,
        dayHigh: item.regularMarketDayHigh ? Math.round(item.regularMarketDayHigh * 100) / 100 : undefined,
        dayLow: item.regularMarketDayLow ? Math.round(item.regularMarketDayLow * 100) / 100 : undefined,
        timestamp: now,
        status: targetStatus,
        lastUpdated: isoString,
      };

      // Store in cache indexed by clean symbol, raw symbol, and standard aliases
      quoteCache.set(cleanSymbol, quote);
      quoteCache.set(rawSymbol, quote);

      if (cleanSymbol === 'NIFTY50') {
        quoteCache.set('NIFTY', quote);
        quoteCache.set('^NSEI', quote);
      } else if (cleanSymbol === 'SENSEX') {
        quoteCache.set('^BSESN', quote);
      }
    }

    outsideHoursFetched = !isOpen;

    // Emit update event to Socket.IO room "market"
    if (ioInstance) {
      const payload = {
        status: targetStatus,
        isMarketOpen: isOpen,
        timestamp: now,
        quotes: getAllQuotes(),
        symbolMap: getQuotesMap(),
      };
      ioInstance.to('market').emit('market:tick', payload);
      ioInstance.emit('market:tick', payload);
    }
  } catch (err: any) {
    console.error('[MarketFeed] Failed to fetch market quotes via yahoo-finance2:', err?.message || err);

    // Keep cached quotes but mark them STALE
    const now = Date.now();
    for (const [key, quote] of quoteCache.entries()) {
      quoteCache.set(key, {
        ...quote,
        status: 'STALE',
      });
    }

    if (ioInstance) {
      const stalePayload = {
        status: 'STALE',
        isMarketOpen: isOpen,
        timestamp: now,
        quotes: getAllQuotes(),
        symbolMap: getQuotesMap(),
      };
      ioInstance.to('market').emit('market:tick', stalePayload);
      ioInstance.emit('market:tick', stalePayload);
    }
  } finally {
    isFetching = false;
  }
}

/**
 * Initializes and starts the background market feed loop.
 * - Weekdays 9:15 - 15:30 IST: Fetches every 10 seconds.
 * - Outside market hours: Fetches once and keeps the last close with status "CLOSED".
 */
export function startMarketFeed(io: SocketIOServer): void {
  ioInstance = io;

  // On client connection, attach to "market" room
  io.on('connection', (socket) => {
    socket.join('market');
    // Send immediate snapshot of cached market quotes to new connections
    const currentQuotes = getAllQuotes();
    if (currentQuotes.length > 0) {
      socket.emit('market:tick', {
        status: isIndianMarketOpen() ? 'DELAYED ~15 MIN' : 'CLOSED',
        isMarketOpen: isIndianMarketOpen(),
        timestamp: Date.now(),
        quotes: currentQuotes,
        symbolMap: getQuotesMap(),
      });
    }
  });

  // Fetch immediately on startup
  fetchMarketQuotes().catch((err) => {
    console.error('[MarketFeed] Startup quote fetch error:', err);
  });

  // 10-second ticker loop
  setInterval(() => {
    const isOpen = isIndianMarketOpen();
    if (isOpen) {
      // Market is open: fetch every 10 seconds
      outsideHoursFetched = false;
      fetchMarketQuotes().catch((err) => {
        console.error('[MarketFeed] Market hours quote fetch error:', err);
      });
    } else {
      // Market is closed: ensure fetched at least once, then keep status CLOSED
      if (!outsideHoursFetched || quoteCache.size === 0) {
        fetchMarketQuotes().catch((err) => {
          console.error('[MarketFeed] Closed hours initial quote fetch error:', err);
        });
      } else {
        // Broadcast closed status heartbeat every 30s
        for (const [key, quote] of quoteCache.entries()) {
          if (quote.status !== 'CLOSED' && quote.status !== 'STALE') {
            quoteCache.set(key, { ...quote, status: 'CLOSED' });
          }
        }
      }
    }
  }, 10000);
}
