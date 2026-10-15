import { Candle } from '../types';

export interface ChartMysteryCase {
  id: string;
  title: string;
  ticker: string;
  timeframe: string;
  historicalContext: string;
  mysteryHint: string;
  basePrice: number;
  initialCandles: Candle[];
  futureCandles: Candle[];
  expectedTrend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
  keySupportLevel: number;
  keyResistanceLevel: number;
  explanation: string;
  learningRule: string;
}

export const CHART_MYSTERY_CASES: ChartMysteryCase[] = [
  {
    id: 'case-1',
    title: 'The Dalal Street Double Bottom',
    ticker: 'NIFTY 50 [HISTORICAL SETUP]',
    timeframe: 'Daily',
    historicalContext: 'Index suffered a 12% correction over 3 weeks and hit a major institutional demand zone. Notice the price action forming two equal lows with bullish divergence.',
    mysteryHint: 'Look closely at the horizontal support near ₹19,250 and how the second test produced smaller red bodies followed by a strong green expansion.',
    basePrice: 19250,
    expectedTrend: 'BULLISH',
    keySupportLevel: 19200,
    keyResistanceLevel: 19850,
    initialCandles: [
      { time: 'Day 1', timestamp: 1, open: 20100, high: 20150, low: 19900, close: 19920, volume: 450000 },
      { time: 'Day 2', timestamp: 2, open: 19920, high: 19950, low: 19600, close: 19650, volume: 580000 },
      { time: 'Day 3', timestamp: 3, open: 19650, high: 19700, low: 19300, close: 19350, volume: 620000 },
      { time: 'Day 4 (Low 1)', timestamp: 4, open: 19350, high: 19450, low: 19220, close: 19280, volume: 710000 },
      { time: 'Day 5 (Bounce)', timestamp: 5, open: 19280, high: 19580, low: 19250, close: 19520, volume: 490000 },
      { time: 'Day 6 (Pullback)', timestamp: 6, open: 19520, high: 19540, low: 19300, close: 19320, volume: 380000 },
      { time: 'Day 7 (Low 2)', timestamp: 7, open: 19320, high: 19400, low: 19230, close: 19380, volume: 510000 },
      { time: 'Day 8 (Breakout Attempt)', timestamp: 8, open: 19380, high: 19680, low: 19350, close: 19650, volume: 830000 },
    ],
    futureCandles: [
      { time: 'Day 9 (Reveal)', timestamp: 9, open: 19650, high: 19900, low: 19620, close: 19880, volume: 920000 },
      { time: 'Day 10 (Reveal)', timestamp: 10, open: 19880, high: 20120, low: 19850, close: 20080, volume: 1100000 },
      { time: 'Day 11 (Reveal)', timestamp: 11, open: 20080, high: 20300, low: 20050, close: 20280, volume: 980000 },
      { time: 'Day 12 (Reveal)', timestamp: 12, open: 20280, high: 20450, low: 20220, close: 20400, volume: 850000 },
    ],
    explanation: 'A classic "W" or Double Bottom pattern completed when price broke above the neckline with expanding volume. Institutional buyers defended the ₹19,220 support zone vigorously.',
    learningRule: 'Double bottoms require confirmation above the intermediate neckline high. Volume expansion on the right leg confirms accumulation.'
  },
  {
    id: 'case-2',
    title: 'The Parabolic Exhaustion & Distribution',
    ticker: 'TATAMOTORS [HISTORICAL SETUP]',
    timeframe: 'Daily',
    historicalContext: 'Stock surged +45% in 6 weeks without significant pullbacks. It created 4 large green candles consecutively, followed by a massive shooting star at multi-year highs.',
    mysteryHint: 'Look at the extreme volume spike on the shooting star day. Who is selling when retail is experiencing peak euphoric FOMO?',
    basePrice: 980,
    expectedTrend: 'BEARISH',
    keySupportLevel: 880,
    keyResistanceLevel: 1040,
    initialCandles: [
      { time: 'Day 1', timestamp: 1, open: 820, high: 860, low: 815, close: 855, volume: 1200000 },
      { time: 'Day 2', timestamp: 2, open: 855, high: 900, low: 850, close: 895, volume: 1400000 },
      { time: 'Day 3', timestamp: 3, open: 895, high: 960, low: 890, close: 950, volume: 1900000 },
      { time: 'Day 4', timestamp: 4, open: 950, high: 1010, low: 945, close: 1000, volume: 2400000 },
      { time: 'Day 5', timestamp: 5, open: 1000, high: 1050, low: 990, close: 1040, volume: 3100000 },
      { time: 'Day 6 (Shooting Star)', timestamp: 6, open: 1040, high: 1085, low: 1015, close: 1020, volume: 5800000 },
      { time: 'Day 7 (Confirmation)', timestamp: 7, open: 1020, high: 1030, low: 980, close: 985, volume: 4200000 },
    ],
    futureCandles: [
      { time: 'Day 8 (Reveal)', timestamp: 8, open: 985, high: 990, low: 930, close: 935, volume: 3800000 },
      { time: 'Day 9 (Reveal)', timestamp: 9, open: 935, high: 950, low: 890, close: 895, volume: 3100000 },
      { time: 'Day 10 (Reveal)', timestamp: 10, open: 895, high: 910, low: 860, close: 870, volume: 2900000 },
      { time: 'Day 11 (Reveal)', timestamp: 11, open: 870, high: 885, low: 850, close: 860, volume: 2200000 },
    ],
    explanation: 'Classic Climax Top / Distribution. Smart money dumped large holdings into the FOMO retail buying wave. The high upper wick showed buyers got exhausted, leading to a mean-reversion drop.',
    learningRule: 'Never buy vertically extended stocks without a base. Parabolic runs almost always correct 50% of the impulse wave.'
  },
  {
    id: 'case-3',
    title: 'The Coiled Spring Range Contraction',
    ticker: 'RELIANCE [HISTORICAL SETUP]',
    timeframe: 'Daily',
    historicalContext: 'Stock traded in an ultra-tight ₹40 range for 18 sessions with declining volatility and declining volume (Bollinger Band Squeeze).',
    mysteryHint: 'When daily range compresses to extreme lows, explosive energy builds up. Which side did the heavy volume breakout candle break on Day 8?',
    basePrice: 2800,
    expectedTrend: 'BULLISH',
    keySupportLevel: 2780,
    keyResistanceLevel: 2860,
    initialCandles: [
      { time: 'Day 1', timestamp: 1, open: 2820, high: 2840, low: 2810, close: 2830, volume: 800000 },
      { time: 'Day 2', timestamp: 2, open: 2830, high: 2845, low: 2820, close: 2825, volume: 650000 },
      { time: 'Day 3', timestamp: 3, open: 2825, high: 2835, low: 2815, close: 2830, volume: 510000 },
      { time: 'Day 4', timestamp: 4, open: 2830, high: 2840, low: 2825, close: 2835, volume: 430000 },
      { time: 'Day 5', timestamp: 5, open: 2835, high: 2842, low: 2828, close: 2832, volume: 390000 },
      { time: 'Day 6', timestamp: 6, open: 2832, high: 2855, low: 2830, close: 2850, volume: 720000 },
      { time: 'Day 7 (Range Break)', timestamp: 7, open: 2850, high: 2890, low: 2845, close: 2885, volume: 1850000 },
    ],
    futureCandles: [
      { time: 'Day 8 (Reveal)', timestamp: 8, open: 2885, high: 2940, low: 2880, close: 2930, volume: 2200000 },
      { time: 'Day 9 (Reveal)', timestamp: 9, open: 2930, high: 2985, low: 2920, close: 2975, volume: 2400000 },
      { time: 'Day 10 (Reveal)', timestamp: 10, open: 2975, high: 3020, low: 2960, close: 3010, volume: 1950000 },
    ],
    explanation: 'Volatility Squeeze Breakout: Periods of low volatility are inevitably followed by periods of high volatility. The surge on 3x average volume confirmed institutional buying expansion.',
    learningRule: 'Contraction leads to expansion. Trade in the direction of the range breakout accompanied by above-average volume.'
  }
];
