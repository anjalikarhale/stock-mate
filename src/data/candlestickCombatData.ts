export interface CandlestickMonster {
  id: string;
  name: string;
  patternType: 'Bullish' | 'Bearish' | 'Neutral / Indecision';
  visual: {
    upperWickRatio: number; // 0 to 1 relative to candle height
    bodyRatio: number;      // 0 to 1 relative to candle height
    lowerWickRatio: number; // 0 to 1 relative to candle height
    isGreen: boolean;
    bodyTopOffset: number;  // % from top (0 = top, 1 = bottom)
    secondCandle?: {
      upperWickRatio: number;
      bodyRatio: number;
      lowerWickRatio: number;
      isGreen: boolean;
      bodyTopOffset: number;
    };
  };
  options: string[];
  correctAnswer: string;
  marketImplication: string;
  deepExplanation: string;
  bossHpCost: number;
}

export const CANDLESTICK_MONSTERS: CandlestickMonster[] = [
  {
    id: 'hammer-1',
    name: 'Hammer',
    patternType: 'Bullish',
    visual: {
      upperWickRatio: 0.05,
      bodyRatio: 0.25,
      lowerWickRatio: 0.70,
      isGreen: true,
      bodyTopOffset: 0.05,
    },
    options: ['Hammer', 'Shooting Star', 'Doji', 'Marubozu'],
    correctAnswer: 'Hammer',
    marketImplication: 'Bullish Reversal signal after a downtrend.',
    deepExplanation: 'Sellers pushed price sharply down during the session, but strong buying emerged to drive price back near the high. The long lower shadow (>2x body) proves strong seller rejection by aggressive bulls.',
    bossHpCost: 25,
  },
  {
    id: 'shooting-star-1',
    name: 'Shooting Star',
    patternType: 'Bearish',
    visual: {
      upperWickRatio: 0.70,
      bodyRatio: 0.25,
      lowerWickRatio: 0.05,
      isGreen: false,
      bodyTopOffset: 0.70,
    },
    options: ['Inverted Hammer', 'Shooting Star', 'Hanging Man', 'Spinning Top'],
    correctAnswer: 'Shooting Star',
    marketImplication: 'Bearish Reversal signal after an uptrend.',
    deepExplanation: 'Buyers attempted to push the stock to new highs, but supply overwhelmed them and bears forced price all the way down near the open. The long upper shadow warns of exhaustion at resistance.',
    bossHpCost: 25,
  },
  {
    id: 'doji-1',
    name: 'Doji',
    patternType: 'Neutral / Indecision',
    visual: {
      upperWickRatio: 0.48,
      bodyRatio: 0.04,
      lowerWickRatio: 0.48,
      isGreen: true,
      bodyTopOffset: 0.48,
    },
    options: ['Bullish Marubozu', 'Doji', 'Hammer', 'Harami'],
    correctAnswer: 'Doji',
    marketImplication: 'Equilibrium & Indecision between buyers and sellers.',
    deepExplanation: 'The open and close prices are virtually identical. Neither bulls nor bears could gain control. It often signals a potential turning point or consolidation pause.',
    bossHpCost: 20,
  },
  {
    id: 'bullish-engulfing-1',
    name: 'Bullish Engulfing',
    patternType: 'Bullish',
    visual: {
      upperWickRatio: 0.1,
      bodyRatio: 0.4,
      lowerWickRatio: 0.1,
      isGreen: false,
      bodyTopOffset: 0.3,
      secondCandle: {
        upperWickRatio: 0.05,
        bodyRatio: 0.85,
        lowerWickRatio: 0.1,
        isGreen: true,
        bodyTopOffset: 0.05,
      }
    },
    options: ['Bearish Engulfing', 'Bullish Engulfing', 'Tweezer Top', 'Harami Cross'],
    correctAnswer: 'Bullish Engulfing',
    marketImplication: 'Strong Bullish Reversal pattern (2 candles).',
    deepExplanation: 'A small red candle is completely swallowed (engulfed) by a large green candle on rising volume. Buyers seized total control over the prior day\'s bearish momentum.',
    bossHpCost: 35,
  },
  {
    id: 'marubozu-1',
    name: 'Bullish Marubozu',
    patternType: 'Bullish',
    visual: {
      upperWickRatio: 0.0,
      bodyRatio: 1.0,
      lowerWickRatio: 0.0,
      isGreen: true,
      bodyTopOffset: 0.0,
    },
    options: ['Spinning Top', 'Bullish Marubozu', 'Doji Star', 'Hanging Man'],
    correctAnswer: 'Bullish Marubozu',
    marketImplication: 'Total Bullish Dominance with zero wicks/shadows.',
    deepExplanation: 'A candle with no upper or lower shadows: Open = Low, and Close = High. Buyers were in complete control from the opening bell to the market close.',
    bossHpCost: 30,
  },
  {
    id: 'hanging-man-1',
    name: 'Hanging Man',
    patternType: 'Bearish',
    visual: {
      upperWickRatio: 0.05,
      bodyRatio: 0.25,
      lowerWickRatio: 0.70,
      isGreen: false,
      bodyTopOffset: 0.05,
    },
    options: ['Hammer', 'Hanging Man', 'Inverted Hammer', 'Evening Star'],
    correctAnswer: 'Hanging Man',
    marketImplication: 'Bearish Reversal warning at the top of an uptrend.',
    deepExplanation: 'Though it looks identical to a Hammer, when it appears at the peak of an uptrend, the deep intra-day drop shows that bears are starting to break key support levels.',
    bossHpCost: 30,
  },
  {
    id: 'spinning-top-1',
    name: 'Spinning Top',
    patternType: 'Neutral / Indecision',
    visual: {
      upperWickRatio: 0.35,
      bodyRatio: 0.30,
      lowerWickRatio: 0.35,
      isGreen: false,
      bodyTopOffset: 0.35,
    },
    options: ['Spinning Top', 'Marubozu', 'Morning Star', 'Shooting Star'],
    correctAnswer: 'Spinning Top',
    marketImplication: 'Market indecision with active volatility on both sides.',
    deepExplanation: 'Small real body flanked by symmetric upper and lower shadows. Both buyers and sellers pushed prices hard, but ended up settling with minimal change.',
    bossHpCost: 20,
  },
  {
    id: 'morning-star-1',
    name: 'Morning Star',
    patternType: 'Bullish',
    visual: {
      upperWickRatio: 0.1,
      bodyRatio: 0.7,
      lowerWickRatio: 0.1,
      isGreen: false,
      bodyTopOffset: 0.1,
      secondCandle: {
        upperWickRatio: 0.05,
        bodyRatio: 0.8,
        lowerWickRatio: 0.05,
        isGreen: true,
        bodyTopOffset: 0.05,
      }
    },
    options: ['Evening Star', 'Morning Star', 'Three Black Crows', 'Dark Cloud Cover'],
    correctAnswer: 'Morning Star',
    marketImplication: 'Powerful 3-candle Bullish bottom reversal.',
    deepExplanation: 'First candle is a long red bar, second is a star/doji showing indecision at lows, and the third is a strong green bar closing deep into the first candle\'s body.',
    bossHpCost: 40,
  }
];
