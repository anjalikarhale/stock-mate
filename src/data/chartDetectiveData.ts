import { Candle } from '../types';

export interface ChartMysteryCase {
  id: string;
  ticker: string;
  timeframe: string;
  title: string;
  historicalContext: string;
  mysteryHint: string;
  initialCandles: Candle[];
  futureCandles: Candle[];
  expectedTrend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
  explanation: string;
  learningRule: string;
}

function makeCandles(
  ohlcvList: [string, number, number, number, number, number][]
): Candle[] {
  const baseTs = Date.now() - ohlcvList.length * 86400000;
  return ohlcvList.map(([time, open, high, low, close, volume], idx) => ({
    time,
    timestamp: baseTs + idx * 86400000,
    open,
    high,
    low,
    close,
    volume,
  }));
}

export const CHART_MYSTERY_CASES: ChartMysteryCase[] = [
  {
    id: 'case-1',
    ticker: 'RELIANCE',
    timeframe: 'Daily',
    title: 'The Ascending Triangle Compression',
    historicalContext:
      'Reliance Industries has tested the ₹2,920 horizontal ceiling three times over two weeks, while buyers keep stepping in at progressively higher lows.',
    mysteryHint:
      'Mark the flat resistance line at ₹2,920 and notice how each pullback low is higher than the previous one.',
    initialCandles: makeCandles([
      ['Day 1', 2840, 2885, 2835, 2878, 1800000],
      ['Day 2', 2880, 2920, 2872, 2912, 2400000],
      ['Day 3', 2910, 2918, 2855, 2862, 1500000],
      ['Day 4', 2865, 2898, 2860, 2892, 1750000],
      ['Day 5', 2894, 2922, 2888, 2916, 2300000],
      ['Day 6', 2915, 2919, 2878, 2884, 1400000],
      ['Day 7', 2886, 2914, 2882, 2910, 1950000],
      ['Day 8', 2910, 2924, 2902, 2921, 3100000],
    ]),
    futureCandles: makeCandles([
      ['Day 9', 2925, 2968, 2920, 2962, 4800000],
      ['Day 10', 2964, 2995, 2955, 2988, 4200000],
      ['Day 11', 2986, 3022, 2978, 3015, 3900000],
    ]),
    expectedTrend: 'BULLISH',
    explanation:
      'Reliance absorbed overhead supply at ₹2,920 across three tests while higher lows showed eager institutional accumulation, culminating in a high-volume bullish breakout.',
    learningRule:
      'Horizontal resistance tested repeatedly alongside rising swing lows (Ascending Triangle) favors an upside breakout when confirmed by expanding volume.',
  },
  {
    id: 'case-2',
    ticker: 'HDFCBANK',
    timeframe: 'Daily',
    title: 'Double Top Exhaustion at ₹1,720',
    historicalContext:
      'After a steep 4-week rally, HDFC Bank hit ₹1,720, pulled back to ₹1,670 neckline support, rallied a second time on weak volume, and broke below ₹1,670.',
    mysteryHint:
      'Look at the two twin peaks near ₹1,720 and the decisive red close slicing underneath the ₹1,670 support floor.',
    initialCandles: makeCandles([
      ['Day 1', 1665, 1705, 1660, 1698, 2600000],
      ['Day 2', 1700, 1722, 1695, 1716, 2900000],
      ['Day 3', 1715, 1718, 1672, 1676, 2400000],
      ['Day 4', 1675, 1695, 1670, 1690, 1800000],
      ['Day 5', 1692, 1720, 1688, 1712, 1550000],
      ['Day 6', 1710, 1714, 1678, 1682, 2200000],
      ['Day 7', 1680, 1685, 1658, 1662, 3800000],
    ]),
    futureCandles: makeCandles([
      ['Day 8', 1660, 1668, 1635, 1640, 4100000],
      ['Day 9', 1642, 1648, 1618, 1624, 3600000],
      ['Day 10', 1625, 1632, 1605, 1612, 3200000],
    ]),
    expectedTrend: 'BEARISH',
    explanation:
      'The second rally to ₹1,720 lacked buyer conviction, and the high-volume breakdown below the ₹1,670 neckline triggered a measured-move bearish decline.',
    learningRule:
      'A Double Top is confirmed only when price decisively closes below the intervening trough (neckline) on rising sell volume.',
  },
  {
    id: 'case-3',
    ticker: 'ITC',
    timeframe: 'Daily',
    title: 'Rectangle Range Equilibrium',
    historicalContext:
      'ITC is trading inside a tight ₹485–₹498 box ahead of quarterly FMCG results, printing alternating small-bodied candles and Dojis.',
    mysteryHint:
      'Notice how neither bulls above ₹498 nor bears below ₹485 have achieved a decisive close; volume is contracting.',
    initialCandles: makeCandles([
      ['Day 1', 488, 497, 486, 495, 1900000],
      ['Day 2', 495, 498, 489, 490, 1600000],
      ['Day 3', 490, 493, 485, 487, 1500000],
      ['Day 4', 487, 496, 486, 494, 1450000],
      ['Day 5', 494, 498, 490, 491, 1300000],
      ['Day 6', 491, 494, 485, 488, 1250000],
      ['Day 7', 488, 495, 487, 492, 1200000],
    ]),
    futureCandles: makeCandles([
      ['Day 8', 492, 497, 489, 494, 1280000],
      ['Day 9', 494, 496, 487, 489, 1310000],
      ['Day 10', 489, 495, 488, 492, 1190000],
    ]),
    expectedTrend: 'SIDEWAYS',
    explanation:
      'Supply at ₹498 and demand at ₹485 remain in balanced equilibrium, keeping ITC range-bound until a high-volume catalyst breaks the box.',
    learningRule:
      'When price oscillates inside horizontal support and resistance on shrinking volume, sitting on your hands (WAIT) avoids costly whipsaws.',
  },
  {
    id: 'case-4',
    ticker: 'TCS',
    timeframe: 'Daily',
    title: 'Hammer Spring at ₹4,050 Support',
    historicalContext:
      'TCS pulled back for four sessions into a major prior breakout zone at ₹4,050, where a textbook long-wick Hammer printed on heavy volume.',
    mysteryHint:
      'Inspect the final candle: sellers pushed below ₹4,050 intraday, yet buyers swept the order book to close green above ₹4,095.',
    initialCandles: makeCandles([
      ['Day 1', 4190, 4205, 4155, 4162, 1600000],
      ['Day 2', 4160, 4168, 4125, 4130, 1750000],
      ['Day 3', 4128, 4135, 4092, 4098, 1850000],
      ['Day 4', 4096, 4105, 4068, 4074, 2100000],
      ['Day 5', 4082, 4102, 4028, 4098, 3900000],
    ]),
    futureCandles: makeCandles([
      ['Day 6', 4102, 4158, 4095, 4152, 3400000],
      ['Day 7', 4155, 4205, 4148, 4198, 3100000],
      ['Day 8', 4200, 4242, 4190, 4235, 2950000],
    ]),
    expectedTrend: 'BULLISH',
    explanation:
      'The stop-hunt below ₹4,050 exhausted remaining sellers, and institutional limit orders propelled TCS straight back into its primary uptrend.',
    learningRule:
      'A high-volume Hammer rejecting a major prior resistance-turned-support zone offers a clean entry with tight invalidation below the wick.',
  },
];
