export interface CandlestickBarVisual {
  upperWickRatio: number;
  bodyRatio: number;
  lowerWickRatio: number;
  isGreen: boolean;
  bodyTopOffset: number;
}

export interface CandlestickMonster {
  id: string;
  name: string;
  correctAnswer: string;
  options: string[];
  bossHpCost: number;
  marketImplication: string;
  deepExplanation: string;
  visual: CandlestickBarVisual & {
    secondCandle?: CandlestickBarVisual;
  };
}

export const CANDLESTICK_MONSTERS: CandlestickMonster[] = [
  {
    id: 'monster-hammer',
    name: 'Hammer Sentinel',
    correctAnswer: 'Bullish Hammer',
    options: ['Bullish Hammer', 'Shooting Star', 'Bearish Marubozu', 'Gravestone Doji'],
    bossHpCost: 25,
    marketImplication: 'Potential bullish trend reversal when formed at a key support zone after a decline.',
    deepExplanation:
      'Sellers drove the price sharply lower intraday (long lower shadow >= 2x real body), but aggressive buyers stepped in and pushed the close back near the session high.',
    visual: {
      upperWickRatio: 0.05,
      bodyRatio: 0.2,
      lowerWickRatio: 0.55,
      isGreen: true,
      bodyTopOffset: 0.1,
    },
  },
  {
    id: 'monster-shooting-star',
    name: 'Shooting Star Wraith',
    correctAnswer: 'Shooting Star',
    options: ['Bullish Hammer', 'Shooting Star', 'Bullish Engulfing', 'Dragonfly Doji'],
    bossHpCost: 25,
    marketImplication: 'Bearish exhaustion warning when formed near overhead resistance after a strong rally.',
    deepExplanation:
      'Buyers attempted a breakout intraday, creating a long upper shadow, but heavy supply overwhelmed demand and forced the close back near the session low.',
    visual: {
      upperWickRatio: 0.55,
      bodyRatio: 0.2,
      lowerWickRatio: 0.05,
      isGreen: false,
      bodyTopOffset: 0.55,
    },
  },
  {
    id: 'monster-doji',
    name: 'Crossblade Doji',
    correctAnswer: 'Standard Doji',
    options: ['Standard Doji', 'Bullish Marubozu', 'Bearish Engulfing', 'Three White Soldiers'],
    bossHpCost: 25,
    marketImplication: 'Market equilibrium and indecision between bulls and bears; watch the next candle for confirmation.',
    deepExplanation:
      'The opening and closing prices are virtually identical despite volatile upper and lower excursions, signaling a temporary stalemate in order flow.',
    visual: {
      upperWickRatio: 0.38,
      bodyRatio: 0.03,
      lowerWickRatio: 0.38,
      isGreen: true,
      bodyTopOffset: 0.38,
    },
  },
  {
    id: 'monster-bullish-engulfing',
    name: 'Twin Flame Engulfer',
    correctAnswer: 'Bullish Engulfing',
    options: ['Bullish Engulfing', 'Bearish Harami', 'Evening Star', 'Hanging Man'],
    bossHpCost: 25,
    marketImplication: 'Strong two-candle bullish reversal demonstrating decisive buyer takeover.',
    deepExplanation:
      'After a small red candle in a pullback, the second green candle opens lower or flat and surges to completely engulf the prior real body on strong volume.',
    visual: {
      upperWickRatio: 0.08,
      bodyRatio: 0.28,
      lowerWickRatio: 0.08,
      isGreen: false,
      bodyTopOffset: 0.3,
      secondCandle: {
        upperWickRatio: 0.08,
        bodyRatio: 0.62,
        lowerWickRatio: 0.08,
        isGreen: true,
        bodyTopOffset: 0.12,
      },
    },
  },
  {
    id: 'monster-bearish-engulfing',
    name: 'Crimson Eclipse',
    correctAnswer: 'Bearish Engulfing',
    options: ['Bearish Engulfing', 'Morning Star', 'Bullish Hammer', 'Piercing Line'],
    bossHpCost: 25,
    marketImplication: 'High-conviction bearish reversal signaling institutional distribution at highs.',
    deepExplanation:
      'A modest bullish green body is immediately swallowed by a wide-range red candle closing near its lows, trapping late breakout buyers.',
    visual: {
      upperWickRatio: 0.08,
      bodyRatio: 0.26,
      lowerWickRatio: 0.08,
      isGreen: true,
      bodyTopOffset: 0.3,
      secondCandle: {
        upperWickRatio: 0.07,
        bodyRatio: 0.64,
        lowerWickRatio: 0.08,
        isGreen: false,
        bodyTopOffset: 0.1,
      },
    },
  },
  {
    id: 'monster-marubozu',
    name: 'Titan Marubozu',
    correctAnswer: 'Bullish Marubozu',
    options: ['Bullish Marubozu', 'Spinning Top', 'Shooting Star', 'Inverted Hammer'],
    bossHpCost: 25,
    marketImplication: 'Sustained one-sided buyer dominance from the opening bell right into the closing auction.',
    deepExplanation:
      'With virtually no upper or lower shadows, buyers controlled every single tick from Open (session low) to Close (session high).',
    visual: {
      upperWickRatio: 0.02,
      bodyRatio: 0.78,
      lowerWickRatio: 0.02,
      isGreen: true,
      bodyTopOffset: 0.1,
    },
  },
];
