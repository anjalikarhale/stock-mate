// NCFM Technical Analysis Module (National Stock Exchange of India Ltd.)
// Complete course data containing every chapter, section, concept, formula, model questions, and interactive activities.

export interface CourseTopicCoverage {
  chapterNumber: number;
  chapterTitle: string;
  weightagePercent: number;
  sections: {
    sectionId: string;
    sectionNumber: string;
    title: string;
    topics: string[];
    formulas?: string[];
    modelQuestionsCount: number;
  }[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface NCFMLesson {
  id: string;
  chapterNumber: number;
  chapterTitle: string;
  sectionNumber: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  xpReward: number;
  prerequisites: string[];
  category: 'FOUNDATION' | 'CANDLESTICKS' | 'PATTERNS' | 'INDICATORS' | 'STRATEGIES' | 'DOW_ELLIOTT' | 'RISK_PSYCHOLOGY';
  badgeReward: string;
  overview: string;
  keyConcepts: {
    heading: string;
    content: string;
    bulletPoints?: string[];
    formula?: string;
  }[];
  newTerms: {
    term: string;
    definition: string;
  }[];
  interactiveActivityType:
    | 'TOP_DOWN_FILTER'
    | 'CANDLESTICK_ANATOMY'
    | 'SUPPORT_RESISTANCE'
    | 'HEAD_SHOULDERS_CALC'
    | 'DOUBLE_TOP_BOTTOM'
    | 'GAP_CLASSIFIER'
    | 'MA_CALCULATOR'
    | 'RSI_ZONE_SHIFT'
    | 'MACD_IMPULSE'
    | 'STOCHASTIC_CALC'
    | 'BOLLINGER_SQUEEZE'
    | 'TOOLKIT_SELECTOR'
    | 'DAY_TRADING_SIM'
    | 'DOW_THEORY_TIMELINE'
    | 'ELLIOTT_WAVE_COUNT'
    | 'FIBONACCI_RETRACEMENT'
    | 'RISK_REWARD_CALC'
    | 'DISCIPLINE_RULES';
  modelQuestions: QuizQuestion[];
}

export const NCFM_COURSE_COVERAGE: CourseTopicCoverage[] = [
  {
    chapterNumber: 1,
    chapterTitle: 'Introduction to Technical Analysis',
    weightagePercent: 12,
    sections: [
      {
        sectionId: 'sec-1-1',
        sectionNumber: '1.1',
        title: 'What is Technical Analysis & The Basis of Technical Analysis',
        topics: [
          'Art and science of forecasting prices based on past movements',
          'Analyzing demand and supply of securities',
          'Price, volume, and open interest on charts',
          'Timeframes (1-minute, 5-min, 15-min, 30-min, hourly, daily, weekly, monthly)',
          'Fundamental vs Technical Analysis comparison',
          'The Basis: Charles Dow theories',
        ],
        modelQuestionsCount: 4,
      },
      {
        sectionId: 'sec-1-1-1',
        sectionNumber: '1.1.1',
        title: 'Price Discounts Everything',
        topics: [
          'Each price represents momentary consensus of value of all participants (Dr. Alexander Elder)',
          'Sum knowledge of traders, investors, portfolio managers, analysts',
          'Assuming future performance mirrors past behavior under similar circumstances',
        ],
        modelQuestionsCount: 2,
      },
      {
        sectionId: 'sec-1-1-2',
        sectionNumber: '1.1.2',
        title: 'Price Movements Are Not Totally Random & What vs Why',
        topics: [
          'Prices move in trends (trend-following system)',
          'Spotting short-term and long-term trends',
          'A technical analyst knows the price of everything but the value of nothing',
          'Two main concerns: Current price and History of price movement',
          'Forces of supply and demand',
          'Top-down technical analysis: Market Index -> Sector charts -> 3-5 industries -> 10-20 stock charts -> 3-4 best stocks',
        ],
        modelQuestionsCount: 2,
      },
      {
        sectionId: 'sec-1-1-3',
        sectionNumber: '1.1.3',
        title: 'The Basic Assumptions of Technical Analysis',
        topics: [
          '1. The market discounts everything (mass psychology, pulse of human emotions)',
          '2. Price moves in trends (trade with the trend logic)',
          '3. History tends to repeat itself (consistent reaction to market stimuli over time)',
        ],
        modelQuestionsCount: 2,
      },
      {
        sectionId: 'sec-1-1-4',
        sectionNumber: '1.1.4',
        title: 'Strengths and Weaknesses of Technical Analysis',
        topics: [
          '1.1.4.1 Importance: Not just for stocks (universal applicability to commodities, forex, bonds)',
          'Focus on price: Leads economy by 6 to 9 months; accumulation vs distribution phases',
          'Supply, demand, and price action (Open, High, Low, Close reflection)',
          'Support and resistance trading ranges',
          'Pictorial price history, volume bars, market volatility, relative strength vs index',
          'Assisting with entry points (pullbacks vs reversals)',
          '1.1.4.2 Weaknesses: Analyst bias (perpetual bull vs eternal bear)',
          'Open to interpretation (art form, cup half full vs half empty)',
          'Too late (trend identification lag, risk-to-reward ratio)',
          'Always another level & Trader remorse (50-day MA for Infosys vs 70-day MA for Reliance)',
          'Controlling risk: Asymmetry between zero and infinity (capital is scarce opportunity)',
          'Pareto Principle: Market is 80% psychological and 20% logical',
        ],
        modelQuestionsCount: 4,
      },
    ],
  },
  {
    chapterNumber: 2,
    chapterTitle: 'Candle Charts',
    weightagePercent: 13,
    sections: [
      {
        sectionId: 'sec-2-1',
        sectionNumber: '2.1',
        title: 'The Charts: Types of Price Charts',
        topics: [
          'What is a chart? (x-axis time, y-axis price, volume history)',
          'Line charts (connecting closing prices, visual trend)',
          'Bar charts (OHLC vertical bar, left tick open, right tick close, high/low range)',
          'Candlestick charts (Japanese origins, visual insight into market psychology)',
          'Candlestick formation: Real body, upper shadow/wick, lower shadow/tail',
          'Hollow/White/Green (Close > Open = buying pressure) vs Filled/Black/Red (Close < Open = selling pressure)',
        ],
        modelQuestionsCount: 3,
      },
      {
        sectionId: 'sec-2-2',
        sectionNumber: '2.2',
        title: 'Candlestick Analysis & Umbrella Lines (One-Candle Patterns)',
        topics: [
          'Market psychology: Fear, greed, and hope driving price',
          'Interaction between buyers and sellers',
          'Umbrella lines definition: Long lower shadows, small real bodies at top of session',
          'Hammer: Occurs in downtrend, hammers out bottom, lower shadow >= 2x body, bullish confirmation next day',
          'Hanging Man: Occurs in uptrend, potential top reversal, requires confirmation next day',
          'Inverted Hammer: Bottom of decline, upper shadow >= 2x body, bulls stepping in',
          'Stars definition: Small real body gapping away from preceding large real body',
          'Shooting Star: Single line top reversal, small body, upper shadow >= 2x body, gap open, bearish confirmation',
        ],
        modelQuestionsCount: 4,
      },
      {
        sectionId: 'sec-2-2-2',
        sectionNumber: '2.2.2',
        title: 'Two Candle Patterns',
        topics: [
          'Bullish Engulfing: Small black body engulfed by large white body in downtrend, opens lower closes higher',
          'Bearish Engulfing: Small white body eclipsed by large black body in uptrend, sellers overwhelm buyers',
          'Piercing Pattern: Counterpart to dark cloud cover, downtrend, black candle + gap down open + close >= 50% into prior body',
          'Bearish Harami: Large white candle followed by small body inside it ("pregnant" in Japanese), trend over',
          'Bullish Harami: Large black candle followed by small body inside it, bulls and bears call a truce',
          'Harami Cross: Harami with a Doji as second candle (indecision)',
        ],
        modelQuestionsCount: 3,
      },
      {
        sectionId: 'sec-2-2-3',
        sectionNumber: '2.2.3',
        title: 'Three Candle Patterns & The Doji',
        topics: [
          'Evening Star: Bearish top reversal (Venus / darkness sets), tall white + gap star + black candle closing >= 50% down',
          'Morning Star: Bullish bottom reversal (Mercury / sunrise), tall black + lower gap star + white candle closing >= 50% up',
          'The Doji: Open equals Close, distinct trend change warning, balance between buyers and sellers',
          'Near-Doji flexibility based on market juncture',
          'Doji at tops: Indecision after extended rally, scaffolding of buyers gives way',
          'Doji at bottoms: Balance of forces, needs confirmation next day',
          'Why intra-day charts < 30 minutes produce too many insignificant dojis',
        ],
        modelQuestionsCount: 4,
      },
    ],
  },
  {
    chapterNumber: 3,
    chapterTitle: 'Pattern Study',
    weightagePercent: 20,
    sections: [
      {
        sectionId: 'sec-3-1',
        sectionNumber: '3.1',
        title: 'Support and Resistance Lines & Zones',
        topics: [
          'Key junctures where supply and demand meet',
          'Support: Horizontal floor where demand halts downward movement',
          'Resistance: Horizontal ceiling where supply halts upward movement',
          'Why support and resistance occur: Market balance and consensus',
          'Support and Resistance ZONES (not absolute prices, price bands; time-frame impact)',
          'Change of support to resistance and vice versa (break of support turns into supply/resistance)',
          'Market memory: Investors remember price areas where heavy volume traded',
        ],
        modelQuestionsCount: 4,
      },
      {
        sectionId: 'sec-3-2',
        sectionNumber: '3.2',
        title: 'Head and Shoulders Patterns (Top Reversal & Inverted Bottom)',
        topics: [
          'Head and Shoulders Top Reversal: Prior uptrend, Left shoulder, Head (highest peak), Right shoulder, Neckline',
          'Volume role: Left shoulder heavy volume, head lower volume, right shoulder decline expanding volume',
          'Neckline break: Official completion with volume expansion; Support turned resistance retest',
          'Price Target calculation: Head-to-neckline distance subtracted from neckline break',
          'Inverted Head and Shoulders (H&S Bottom): Three troughs, deepest head, volume MUST expand on breakout',
          'Price Target calculation: Neckline plus head-to-neckline depth',
          'Symmetry considerations (heights and widths can vary)',
        ],
        modelQuestionsCount: 4,
      },
      {
        sectionId: 'sec-3-3',
        sectionNumber: '3.3',
        title: 'Double Top, Double Bottom & Rounded Patterns',
        topics: [
          'Double Top ("M" pattern): Prior uptrend, two peaks within 3% area, 1-3 months apart, 10-20% reaction low trough',
          'Double Top price target: Reaction low minus peak-to-trough height; Deceptive double tops & 3% / 3-day filters',
          'Double Bottom ("W" pattern): Prior downtrend, two troughs, volume surge on second advance and breakout',
          'Double Bottom price target: Reaction high plus depth',
          'Rounded Top and Rounded Bottom: Bowl-shaped gradual shifts, volume dries up at bottom and surges on breakout',
        ],
        modelQuestionsCount: 4,
      },
      {
        sectionId: 'sec-3-4',
        sectionNumber: '3.4',
        title: 'Gap Theory & Island Clusters',
        topics: [
          'What is a gap? (Area on chart with no trades between close and next open; earnings/news catalysts)',
          '1. Common gap (trading/area gap, nervous market, low volume, filled quickly)',
          '2. Breakaway gap (breakout from congestion range, high volume, becomes support/resistance, not filled soon)',
          '3. Runaway/Continuation gap (measuring gap, panic buying/selling acceleration)',
          '4. Exhaustion gap (end of major move, massive volume + huge gap, rapid reversal, easiest to profit from)',
          '5. Island cluster (exhaustion gap followed by breakaway gap in opposite direction, powerful reversal)',
          'The myth "all gaps get filled" and why holding for gap fill can devastate portfolios',
        ],
        modelQuestionsCount: 4,
      },
    ],
  },
  {
    chapterNumber: 4,
    chapterTitle: 'Major Indicators & Oscillators',
    weightagePercent: 20,
    sections: [
      {
        sectionId: 'sec-4-1',
        sectionNumber: '4.1',
        title: 'Technical Indicators, Moving Averages (SMA & EMA)',
        topics: [
          'What is a technical indicator? Mathematical formula applied to price, volume, or open interest',
          'Functions: to Alert, to Confirm, to Predict',
          'Tips: Filter price action, avoid > 5 indicators, use complementary (not redundant) indicators',
          'Leading indicators (momentum oscillators: RSI, Stochastic, Williams %R, CCI) vs Lagging indicators (trend-following: MAs, MACD)',
          'Simple Moving Average (SMA): Arithmetic mean over N periods, smoothing data',
          'Exponential Moving Average (EMA): Exponentially weighted toward recent prices',
          'EMA Multiplier Formula: Multiplier = 2 / (N + 1). (e.g., 10-period = 18.18%, 20-period = 9.52%)',
          'SMA vs EMA sensitivity and reliability trade-off',
        ],
        modelQuestionsCount: 4,
      },
      {
        sectionId: 'sec-4-2',
        sectionNumber: '4.2',
        title: 'Trend-Following Indicators & Moving Average Systems',
        topics: [
          'When to use: Trending markets only, ineffective in trading ranges',
          'Moving average settings: 21, 50, 89, 150, 200 days (10, 30, 40 weeks)',
          'Uses: Direction (rising/falling), Price Location (above/below MA), Crossovers',
          'Double crossover system (5 & 20-day, 20 & 100-day)',
          'Triple crossover system (4-9-18 day MA combination)',
          'Significance of the 200-day MA for NIFTY, Sensex, and individual equities',
        ],
        modelQuestionsCount: 3,
      },
      {
        sectionId: 'sec-4-3',
        sectionNumber: '4.3',
        title: 'Oscillators: RSI, Stochastic & Williams %R',
        topics: [
          'RSI: Momentum definition (speed of price change, car speedometer analogy), 0 to 100 range',
          'RSI Overbought (70) and Oversold (30) crossing back triggers',
          'RSI Divergences: Bullish divergence (price lower low, RSI higher low) & Bearish divergence (price higher high, RSI lower high)',
          'Stochastic Oscillator (George Lane): 14-period %K = (Close - Lowest Low)/(Highest High - Lowest Low) * 100, %D = 3-period MA',
          'Stochastic Overbought (80) & Oversold (20); %K crossing %D signals',
          'Williams %R (Larry Williams): 0 to -100 scale, Overbought (0 to -20), Oversold (-80 to -100)',
          'Real-life problems in RSI (staying in extreme zones during trends)',
          'Advanced Concepts: Bull Market Zone (70 & 40) vs Bear Market Zone (60 & 30); Zone Shifts and ADX > 30 strong trend confirmation',
        ],
        modelQuestionsCount: 5,
      },
      {
        sectionId: 'sec-4-3-2',
        sectionNumber: '4.3.2',
        title: 'MACD, Money Flow Index (MFI) & Bollinger Bands',
        topics: [
          'MACD (Gerald Appel, 1970s): Hybrid indicator measuring distance between two EMAs',
          'MACD Calculation: Fast line = 12 EMA - 26 EMA; Signal line = 9 EMA of fast line; MACD Histogram',
          'MACD Signals: Signal line crossover, Centerline zero crossover, Divergences',
          'Money Flow Index (MFI): "Smart money flow indicator", volume-weighted RSI',
          'MFI Calculation: Typical price = (H+L+C)/3; Money Flow = Typical Price * Volume; MFI = 100 - (100/(1+Money Ratio))',
          'Bollinger Bands (John Bollinger): 20 SMA +/- 2 Standard Deviations',
          'Bollinger Band Squeeze (volatility contraction preceding big moves), Band breakout, double bottoms/tops outside then inside bands',
        ],
        modelQuestionsCount: 4,
      },
      {
        sectionId: 'sec-4-4',
        sectionNumber: '4.4',
        title: 'Multiple Indicator Toolkits for Different Market Phases',
        topics: [
          'Price-sensitive vs Volume-sensitive vs Composite techniques',
          'Trading Market Toolkit: Fade breakouts, buy oversold oscillators, sell overbought',
          'Bull Market Toolkit: Buy upside MA crossovers, buy oversold RSI, ignore overbought, buy Stochastic upside crossovers',
          'Bear Market Toolkit: Sell downside MA crossovers, sell overbought RSI, ignore oversold, sell Stochastic downside crossovers',
          'Market transitions: Trading to Bull, Trading to Bear, Bull to Trading, Bear to Trading toolkits',
        ],
        modelQuestionsCount: 4,
      },
    ],
  },
  {
    chapterNumber: 5,
    chapterTitle: 'Trading Strategies',
    weightagePercent: 12,
    sections: [
      {
        sectionId: 'sec-5-1',
        sectionNumber: '5.1',
        title: 'Day Trading: Advantages & Risks',
        topics: [
          'Day trading definition: Positions closed before market close on the same day',
          'Advantages: Zero overnight risk (no overnight news gap shocks), Increased leverage, Profit in any market direction via short selling',
          'Risks: Possibility of large losses (letting losses run), Demands of time and attention, Stress, Overtrading, Borrowed money / margin risks',
          'Out-of-pocket expenses and technology risks (connectivity, power outages)',
        ],
        modelQuestionsCount: 3,
      },
      {
        sectionId: 'sec-5-2',
        sectionNumber: '5.2',
        title: 'Day Trading Strategies & Dr. Alexander Elder Impulse System',
        topics: [
          'Scalping: Taking profits on small price changes immediately, strict exit strategy',
          'Fading: Contrarian shorting of rapid upward moves (overbought fade, early profit taking)',
          'Daily Pivots: Buying near Low of Day (LOD), selling near High of Day (HOD)',
          'Momentum Trading: News releases, high volume moves, mental focus',
          'Dr. Alexander Elder Impulse System: EMA (inertia / trend) + MACD Histogram (momentum / power)',
          'Impulse System rules: Buy when both EMA & MACD Histogram rise; Exit when either turns down',
          'Times to trade: Avoid lunch hour (12-2pm, volume dries up, choppy); Focus on first and last hour (high volatility & volume)',
        ],
        modelQuestionsCount: 3,
      },
    ],
  },
  {
    chapterNumber: 6,
    chapterTitle: 'Dow Theory and Elliott Wave Theory',
    weightagePercent: 12,
    sections: [
      {
        sectionId: 'sec-6-1',
        sectionNumber: '6.1',
        title: 'Introduction to Dow Theory & The Six Core Principles',
        topics: [
          'Charles H Dow (1851-1902): Father of Technical Analysis, 255 WSJ editorials',
          'Contributors: Samuel A. Nelson (coined term Dow Theory), William P. Hamilton, Robert Rhea, George Schaefer, Richard Russell',
          'Principle 1: The stock market discounts all information (except natural calamities)',
          'Principle 2: Market has three trends: Primary (> 1 year, main trend), Secondary (corrections 3 weeks to 3 months), Minor (day-to-day noise 1 day to 3 weeks)',
          'Principle 3: Primary trend has three phases: Accumulation (smart money buys when news is worst), Participation (longest, public sentiment improves), Distribution (rampant optimism, smart money sells)',
          'Principle 4: Stock market indexes must confirm each other (Dow Industrial and Rail/Transportation)',
          'Principle 5: Volume must confirm the trend (volume increases in direction of primary trend)',
          'Principle 6: Trend remains intact until clear reversal signals occur',
          'Significance (higher top-higher bottom foundation) & Problems with Dow Theory (lagging signals, only 2 old economy indexes)',
        ],
        modelQuestionsCount: 8,
      },
      {
        sectionId: 'sec-6-5',
        sectionNumber: '6.5',
        title: 'Elliott Wave Theory & Fractal Nature of Markets',
        topics: [
          'Ralph Nelson Elliott (1871-1948): Swings between optimism and pessimism',
          'Fundamental Concept: Dominant Trend (5 waves: 1, 3, 5 impulse, 2, 4 corrective) + Corrective Trend (3 waves: A, B, C)',
          'Characteristics of Waves 1 to 5: Wave 1 (weak rally), Wave 2 (vicious sell-off, never exceeds start of Wave 1), Wave 3 (longest & strongest, breaks top of Wave 1), Wave 4 (clear correction on lesser volume), Wave 5 (new high on lesser volume)',
          'Corrective waves: Wave A (beginning of turn), Wave B (bear rally with lesser volume), Wave C (sharp decline with heavy volume)',
          'Fractal Nature: Impulse waves subdivide into 5 smaller waves, corrective waves subdivide into 3 smaller waves ("same from near as from far")',
          'Three Indispensable Rules: 1. Wave 2 cannot retrace > 100% of Wave 1; 2. Wave 3 is never the shortest; 3. Wave 4 can never overlap Wave 1 (cash market strict; 5-7% tolerance in derivatives)',
          'Three Guidelines: Wave 5 often equals Wave 1; Alternation of Wave 2 and Wave 4 (sharp vs flat); ABC correction ends before bottom/top of Wave 4',
        ],
        modelQuestionsCount: 5,
      },
      {
        sectionId: 'sec-6-5-3',
        sectionNumber: '6.5.3',
        title: 'Fibonacci Sequence, Golden Ratio & Practical Wave Trading',
        topics: [
          'Leonardo Pisano Bogollo (1170-1250): Sequence 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144... (X_n = X_n-1 + X_n-2)',
          'Golden Ratio: 1.618034 (ratio of successive Fibonacci numbers)',
          'Multiples (1, 1.618, 2.618, 4.23, 6.85) and Ratios (0.14, 0.25, 0.38, 0.5, 0.618)',
          'Fibonacci Retracement levels: 23.6%, 38.2%, 50%, 61.8%, 100%',
          'Fibonacci Wave Relationships: Wave 2 = 50% or 61.8% of Wave 1; Wave 3 = 1.618, 2.618, or 4.23 times Wave 1; Wave 4 = 23.6%, 38.2%, 50% of Wave 3; Wave 5 = Wave 1 length or 1.618 of Wave 1-3',
          'Practical Application: Trade the 70% simple patterns, do not trade corrective waves (Wave 2, 4, A); Buying at end of Wave 4 with stop below 61.8% retracement (Reward/Risk >= 1.5); Buying/selling when Wave 3 emerges after Wave 1 breakout',
        ],
        modelQuestionsCount: 4,
      },
    ],
  },
  {
    chapterNumber: 7,
    chapterTitle: 'Trading Psychology and Risk Management',
    weightagePercent: 11,
    sections: [
      {
        sectionId: 'sec-7-1',
        sectionNumber: '7.1',
        title: 'Risk Management Components & Capital Preservation',
        topics: [
          'Focus on potential losses, not just gains; Seed capital preservation',
          'Risk of ruin and equity bust: Abnormally high trade size leads to complete wipeout',
          'Drawdown: Expecting losing streaks of 5 in a row even with 60-65% win rate system',
          'Components: Stop loss (mandatory order), Reward-to-Risk ratio (minimum 1.5:1 required, avoid trade if < 1.5), Trailing stop loss, Booking profit (realized vs notional)',
          'Qualities of Successful Traders: 1. Always use stops; 2. Trade size based on equity and stop distance; 3. Never trade > 10% in any sector; 4. Never exceed 2% to 5% loss per trade; 5. Trade with risk capital only; 6. Never trade with borrowed money',
        ],
        modelQuestionsCount: 3,
      },
      {
        sectionId: 'sec-7-2',
        sectionNumber: '7.2',
        title: 'Golden Rules & 14 Do’s and Don’ts in Trading',
        topics: [
          'Trading vs Gambling: Detached execution based on numbers, time, volume',
          '1. Forget the news, remember the chart',
          '2. Buy at support, sell at resistance',
          '3. Don’t chase momentum if you can’t find the exit',
          '4. Trends test the point of last support/resistance',
          '5. Trade with the TICK not against it',
          '6. If you have to look, it isn’t there',
          '7. The trend is your friend in the last hour (3:00pm)',
          '8. Avoid the open (They see you coming)',
          '9. Bulls live above 200 day, bears live below',
          '10. Price has memory',
          '11. Big volume kills moves (climax blow-offs)',
          '12. Trends never turn on a dime (reversals build slowly)',
          '13. Bottoms take longer to form than tops',
          '14. Beat the crowd in and out the door',
        ],
        modelQuestionsCount: 3,
      },
      {
        sectionId: 'sec-7-3',
        sectionNumber: '7.3',
        title: '20 Rules to Stop Losing Money & Discipline',
        topics: [
          '20 Rules to Stop Losing Money (Don’t trust others opinions, don’t break rules, don’t try to get even, trading is not investment, no Holy Grail, don’t fall into complexity trap, trading should be boring)',
          'The Trend is your friend until the end when it bends',
          'Difference between Paper Trading and Real Trading (emotional impact of fear and greed)',
          '7.4 Choosing the Right Markets to Trade: Follow 6 to 8 stocks across diverse sectors',
          '7.4.1 Overtrading: 90% of new traders fail in year 1 due to overtrading',
          'Being Flat: The third valid position in the market (Long, Short, Flat)',
        ],
        modelQuestionsCount: 3,
      },
    ],
  },
];

export const NCFM_LESSONS: NCFMLesson[] = [
  // =========================================================================
  // CHAPTER 1: INTRODUCTION TO TECHNICAL ANALYSIS
  // =========================================================================
  {
    id: 'ncfm_ch1_what_is_ta',
    chapterNumber: 1,
    chapterTitle: 'Introduction to Technical Analysis',
    sectionNumber: '1.1',
    title: 'The Art & Science of Technical Analysis',
    subtitle: 'Understand how market prices, volume, and open interest reflect supply and demand across timeframes.',
    estimatedMinutes: 4,
    xpReward: 120,
    prerequisites: [],
    category: 'FOUNDATION',
    badgeReward: 'Market Observer',
    overview:
      'Technical Analysis is the art and science of forecasting future price movements based on past price action. Unlike fundamental analysis which examines financial statements, technical analysis focuses directly on price, volume, and open interest.',
    keyConcepts: [
      {
        heading: 'Supply, Demand & Price Action',
        content:
          'Prices are the final result of the ongoing battle between buyers (demand) and sellers (supply). Technical analysis can be applied to any tradable instrument (stocks, commodities, currencies, indices) across all timeframes from 1-minute intraday charts to multi-year monthly charts.',
      },
      {
        heading: 'Top-Down Technical Analysis',
        content:
          'Professional technicians use a top-down approach: first analyze the broad market index (NIFTY 50), then narrow down to 3-5 leading industry sectors, evaluate 10-20 stock charts in each sector, and finally select the 3-4 strongest individual stocks with high relative strength.',
        bulletPoints: [
          'Step 1: Check NIFTY 50 / Sensex trend',
          'Step 2: Compare sectoral indices (NIFTY Bank, NIFTY IT, NIFTY Auto)',
          'Step 3: Screen 10-20 charts in promising sectors',
          'Step 4: Execute on the top 3-4 stocks displaying high momentum and clear support',
        ],
      },
      {
        heading: 'The Three Cardinal Assumptions',
        content:
          'All of technical analysis rests on three foundational pillars established by Charles Dow:',
        bulletPoints: [
          '1. The Market Discounts Everything: Current prices instantly reflect all known material information, economic data, and crowd psychology.',
          '2. Price Moves in Trends: Once a trend is established (uptrend, downtrend, or trading range), future movement is more likely to continue in that direction than reverse.',
          '3. History Tends to Repeat Itself: Because human psychology (fear and greed) is consistent over generations, chart patterns repeat reliably.',
        ],
      },
    ],
    newTerms: [
      {
        term: 'Technical Analysis',
        definition:
          'A method of evaluating securities by analyzing statistics generated by market activity, such as past prices, volume, and open interest, rather than measuring intrinsic value.',
      },
      {
        term: 'Top-Down Analysis',
        definition:
          'A workflow starting with overall market indices, moving down to sector indices, and finally selecting the best individual stock charts.',
      },
      {
        term: 'Price Discounts Everything',
        definition:
          'The doctrine that all fundamental developments, earnings expectations, and collective sentiments are already priced into the current market price.',
      },
    ],
    interactiveActivityType: 'TOP_DOWN_FILTER',
    modelQuestions: [
      {
        id: 'q1_1',
        question: 'Technical analysis can help investors anticipate what is "likely" to happen to ________ over time.',
        options: ['prices', 'volumes', 'economy', 'fair value of stock'],
        correctAnswerIndex: 0,
        explanation: 'Technical analysis forecasts future price movements based on examination of past price action.',
      },
      {
        id: 'q1_2',
        question: 'The study of technical analysis is based on which of the following elements?',
        options: ['price', 'volume', 'open interest (in case of derivatives)', 'all of the above'],
        correctAnswerIndex: 3,
        explanation: 'Technical analysis incorporates price, volume, and open interest data points into charts and formulas.',
      },
      {
        id: 'q1_3',
        question: 'Which of the following statements is true about price according to technical analysis?',
        options: [
          'Price movements succeed fundamental developments',
          'Price movements are totally random',
          'Price discounts everything',
          'Price never moves in trend',
        ],
        correctAnswerIndex: 2,
        explanation: 'The market price discounts all information including fundamental factors, earnings news, and mass psychology.',
      },
    ],
  },
  {
    id: 'ncfm_ch1_strengths_weaknesses',
    chapterNumber: 1,
    chapterTitle: 'Introduction to Technical Analysis',
    sectionNumber: '1.1.4',
    title: 'Strengths, Weaknesses & The 80/20 Pareto Principle',
    subtitle: 'Learn why technical analysis leads the economy by 6-9 months and why capital preservation is your scarce opportunity.',
    estimatedMinutes: 4,
    xpReward: 130,
    prerequisites: ['ncfm_ch1_what_is_ta'],
    category: 'FOUNDATION',
    badgeReward: 'Risk Guardian',
    overview:
      'Technical analysis offers immense power in pinpointing entry/exit timings and reading accumulation versus distribution. However, analysts must manage personal bias and respect the vital asymmetry between zero and infinity.',
    keyConcepts: [
      {
        heading: 'Price Action as a Leading Indicator',
        content:
          'Fundamental developments are followed by price movements. The price pattern is considered a leading indicator that typically leads the macro economy by 6 to 9 months. By tracking accumulation (institutional buying) and distribution (institutional selling), technicians spot moves before news headlines hit.',
      },
      {
        heading: 'Subjectivity & Weaknesses',
        content:
          'Technical analysis is an art as well as a science. Key weaknesses include analyst bias (perpetual bulls see rallies, eternal bears see crashes) and lag in conservative systems like Dow Theory. Moreover, individual securities have idiosyncrasies—a 50-day moving average may fit Infosys, whereas a 70-day moving average fits Reliance.',
      },
      {
        heading: 'Asymmetry Between Zero and Infinity: Capital is Scarce',
        content:
          'Opportunities in the market are infinite—thousands of stocks trade daily. Your capital, however, is finite. If you lose an opportunity, thousands more appear tomorrow. But if you lose your capital, you lose all future opportunities! Therefore, it is far more important to control risk than to maximize profits.',
      },
      {
        heading: 'The Pareto Principle in Markets',
        content:
          'Technical analysis considers the stock market to be 80% psychological and 20% logical. Fundamental analysts consider the market to be 20% psychological and 80% logical.',
      },
    ],
    newTerms: [
      {
        term: 'Accumulation',
        definition: 'A period of institutional buying where shares are absorbed without allowing price to spike immediately.',
      },
      {
        term: 'Distribution',
        definition: 'A period of institutional selling where volume is high without any price appreciation, distributing stock to retail.',
      },
      {
        term: 'Pareto Principle (80/20)',
        definition: 'The principle that 80% of market price behavior is driven by mass psychology and emotion, while 20% is logical.',
      },
    ],
    interactiveActivityType: 'RISK_REWARD_CALC',
    modelQuestions: [
      {
        id: 'q1_4',
        question: 'A technician will refer to periods of accumulation as evidence of an upcoming:',
        options: ['rise in prices', 'fall in prices', 'range-bound prices', 'none of the above'],
        correctAnswerIndex: 0,
        explanation: 'Periods of accumulation indicate smart money buying in anticipation of an impending price advance.',
      },
      {
        id: 'q1_5',
        question: 'Technical analysis considers the stock market to be:',
        options: ['50% logical and 50% psychological', '80% psychological and 20% logical', '80% logical and 20% psychological', '100% mathematical'],
        correctAnswerIndex: 1,
        explanation: 'According to the NCFM curriculum, technical analysis views the market as 80% psychological and 20% logical.',
      },
    ],
  },

  // =========================================================================
  // CHAPTER 2: CANDLE CHARTS
  // =========================================================================
  {
    id: 'ncfm_ch2_chart_types_formation',
    chapterNumber: 2,
    chapterTitle: 'Candle Charts',
    sectionNumber: '2.1',
    title: 'Chart Types & Candlestick Anatomy',
    subtitle: 'Master Line, Bar (OHLC), and Candlestick charts with real body and shadow mechanics.',
    estimatedMinutes: 5,
    xpReward: 140,
    prerequisites: ['ncfm_ch1_strengths_weaknesses'],
    category: 'CANDLESTICKS',
    badgeReward: 'Candle Chartist',
    overview:
      'Charts are the fundamental workspace of technicians. While line charts connect closes and bar charts display OHLC ticks, Japanese candlesticks provide a vivid two-dimensional portrait of buyer versus seller emotion.',
    keyConcepts: [
      {
        heading: 'Three Types of Price Charts',
        content:
          '1. Line Chart: Connects closing prices over time. Excellent for filtering noise and seeing high-level trend.\n2. Bar Chart: Vertical line displaying High (top) and Low (bottom). Left horizontal tick marks Open; right tick marks Close.\n3. Candlestick Chart: Uses a rectangular "real body" between Open and Close, with thin "shadows" (wicks/tails) extending to the High and Low.',
      },
      {
        heading: 'Candlestick Anatomy & Color Psychology',
        content:
          'When Close > Open: Hollow/White/Green candle representing net buying pressure.\nWhen Close < Open: Filled/Black/Red candle representing net selling pressure.\nThe distance between High and upper body is the upper shadow. The distance between lower body and Low is the lower shadow.',
        bulletPoints: [
          'Real Body = Distance between Open and Close',
          'Upper Shadow = Distance from session High to the top of the body',
          'Lower Shadow = Distance from bottom of the body to session Low',
          'Long lower shadow = Rejection of lower prices by buyers',
          'Long upper shadow = Rejection of higher prices by sellers',
        ],
      },
    ],
    newTerms: [
      {
        term: 'Real Body',
        definition: 'The rectangular colored portion of a candlestick between the opening and closing prices.',
      },
      {
        term: 'Shadows (Wicks/Tails)',
        definition: 'The thin vertical lines projecting above and below the real body indicating session high and low prices.',
      },
    ],
    interactiveActivityType: 'CANDLESTICK_ANATOMY',
    modelQuestions: [
      {
        id: 'q2_1',
        question: 'Which of the following is not true about a chart?',
        options: [
          'It plots price movements of a stock over specific timeframes',
          'X-axis represents price and Y-axis represents time',
          'It gives pictorial representation of a stock trading history',
          'It can give a complete picture of price history over hours, days, weeks, or years',
        ],
        correctAnswerIndex: 1,
        explanation: 'On price charts, the X-axis represents TIME and the Y-axis represents PRICE.',
      },
      {
        id: 'q2_2',
        question: 'Which of the following best reveals the psychology of the market at a certain point in time?',
        options: ['Line Chart', 'Candlestick Chart', 'Bar Chart', 'None of the above'],
        correctAnswerIndex: 1,
        explanation: 'Candlestick charts provide visual insight into buyer and seller psychology through body colors and shadows.',
      },
    ],
  },
  {
    id: 'ncfm_ch2_one_candle_patterns',
    chapterNumber: 2,
    chapterTitle: 'Candle Charts',
    sectionNumber: '2.2.1',
    title: 'Umbrella Lines: Hammer, Hanging Man & Shooting Star',
    subtitle: 'Identify high-probability one-candle reversal signals at market extremes.',
    estimatedMinutes: 5,
    xpReward: 150,
    prerequisites: ['ncfm_ch2_chart_types_formation'],
    category: 'CANDLESTICKS',
    badgeReward: 'Umbrella Master',
    overview:
      'One-candle patterns known as "Umbrella Lines" have small real bodies at the top of the range and long lower shadows. They provide early warnings of trend exhaustion without needing multi-day setups.',
    keyConcepts: [
      {
        heading: 'The Hammer (Bullish Reversal)',
        content:
          'Occurs after a defined downtrend. The lower shadow is at least TWO TIMES the length of the body, with little or no upper shadow. The market traded sharply lower, but bulls stepped in and drove the price back up near the highs. A bullish confirmation candle is required the next day.',
        bulletPoints: [
          'Criterion 1: Lower shadow >= 2x real body length',
          'Criterion 2: Very small or zero upper shadow',
          'Criterion 3: Real body at the upper end of the session range',
          'Criterion 4: Strong bullish follow-through next day confirms the bottom',
        ],
      },
      {
        heading: 'The Hanging Man (Bearish Reversal)',
        content:
          'Identical in shape to a hammer, but appears after an extended UPTREND. It warns that bears were able to stage a serious intraday sell-off, signaling fragility. Requires a lower open/close the next day for confirmation.',
      },
      {
        heading: 'Shooting Star & Inverted Hammer',
        content:
          'Both feature small bodies at the bottom of the range and long upper shadows (>= 2x body):\n• Inverted Hammer: Found at bottom of a downtrend, showing early buying attempt.\n• Shooting Star: Found at top of an uptrend (like a star falling with trailing tail); bears pushed the rally back down.',
      },
    ],
    newTerms: [
      {
        term: 'Umbrella Line',
        definition: 'Japanese candlestick category featuring a small real body near the top of the range and a long lower shadow.',
      },
      {
        term: 'Shooting Star',
        definition: 'A single-candle bearish top reversal with a small body near the bottom and an upper shadow >= 2x the body length.',
      },
    ],
    interactiveActivityType: 'CANDLESTICK_ANATOMY',
    modelQuestions: [
      {
        id: 'q2_3',
        question: 'A higher open on the next trading day after a Hammer indicates that:',
        options: ['Bears are intact', 'Bulls have taken control', 'There is no possibility of trend reversal', 'None of the above'],
        correctAnswerIndex: 1,
        explanation: 'A strong positive open and close confirms the Hammer reversal signal and shows buyers have taken control.',
      },
      {
        id: 'q2_4',
        question: 'Which candlestick pattern looks like a star falling from the sky with a tail trailing it?',
        options: ['Morning star', 'Shooting star', 'Dark cloud cover', 'None of the above'],
        correctAnswerIndex: 1,
        explanation: 'The Shooting Star has a small body at the lower end and a long upper shadow like a falling star with a tail.',
      },
    ],
  },
  {
    id: 'ncfm_ch2_two_three_candle_patterns',
    chapterNumber: 2,
    chapterTitle: 'Candle Charts',
    sectionNumber: '2.2.2',
    title: 'Engulfing, Piercing, Harami & Morning/Evening Stars',
    subtitle: 'Learn multi-candle combinations and why the Doji is the ultimate warning of market indecision.',
    estimatedMinutes: 6,
    xpReward: 160,
    prerequisites: ['ncfm_ch2_one_candle_patterns'],
    category: 'CANDLESTICKS',
    badgeReward: 'Pattern Seeker',
    overview:
      'Two and three candle formations capture the shift in crowd conviction across multiple trading sessions. From Bullish Engulfing to Morning Stars and Dojis, these combinations form the backbone of candlestick mastery.',
    keyConcepts: [
      {
        heading: 'Bullish & Bearish Engulfing Patterns',
        content:
          '• Bullish Engulfing: Small black body in a downtrend followed by a large white body that completely eclipses the prior candle body. Buyers overwhelm sellers.\n• Bearish Engulfing: Small white candle in an uptrend engulfed by a large black candle. Sellers take charge.',
      },
      {
        heading: 'Piercing Pattern & Harami',
        content:
          '• Piercing Pattern: Counterpart to dark cloud cover. Downtrend candle followed by gap down, closing >= 50% up into the prior black candle body.\n• Harami (Pregnant): Small second candle completely contained inside the prior large body. Indicates trend conclusion and a truce between bulls and bears.',
      },
      {
        heading: 'Morning Star & Evening Star',
        content:
          '• Morning Star (Mercury / Sunrise): 3-candle bottom reversal. Tall black candle + lower gap star + white candle closing >= 50% into first body.\n• Evening Star (Venus / Darkness): 3-candle top reversal. Tall white candle + upper gap star + black candle closing >= 50% down.',
      },
      {
        heading: 'The Doji & Intraday Timeframe Caution',
        content:
          'A Doji forms when Open and Close are virtually identical, signaling total deadlock. At market tops after rallies, a Doji star warns that buying conviction is exhausted. CAUTION: Intraday charts below 30 minutes produce far too many noise dojis.',
      },
    ],
    newTerms: [
      {
        term: 'Piercing Pattern',
        definition: 'A 2-candle bullish reversal where a gap-down candle closes more than halfway into the prior dark body.',
      },
      {
        term: 'Doji',
        definition: 'A candlestick session where open and close prices are the same, indicating equilibrium and indecision.',
      },
    ],
    interactiveActivityType: 'CANDLESTICK_ANATOMY',
    modelQuestions: [
      {
        id: 'q2_5',
        question: 'In a Piercing Pattern, the second day candle must close at least:',
        options: ['Equal to the prior low', 'Halfway up the prior black candle', 'Above the 20-day MA', 'At a new high'],
        correctAnswerIndex: 1,
        explanation: 'A valid Piercing pattern requires the white candle to close at least halfway up the preceding black candle.',
      },
      {
        id: 'q2_6',
        question: 'Why should candlestick analysis generally avoid intraday charts of less than 30 minutes?',
        options: [
          'Prices do not move on intraday charts',
          'Less than 30 minutes, many candlestick lines become doji or near-doji noise',
          'Volume is zero on intraday charts',
          'Exchanges do not permit 5-minute analysis',
        ],
        correctAnswerIndex: 1,
        explanation: 'Under 30 minutes, tiny tick fluctuations produce endless insignificant near-dojis that dilute pattern validity.',
      },
    ],
  },

  // =========================================================================
  // CHAPTER 3: PATTERN STUDY
  // =========================================================================
  {
    id: 'ncfm_ch3_support_resistance',
    chapterNumber: 3,
    chapterTitle: 'Pattern Study',
    sectionNumber: '3.1',
    title: 'Support & Resistance Lines, Zones & Role Reversal',
    subtitle: 'Learn why support becomes resistance, why prices bounce in zones, and how market memory works.',
    estimatedMinutes: 5,
    xpReward: 160,
    prerequisites: ['ncfm_ch2_two_three_candle_patterns'],
    category: 'PATTERNS',
    badgeReward: 'Zone Chartist',
    overview:
      'Support and resistance represent key junctures where supply and demand collide. They act as thresholds that halt advances or declines. Understanding price zones and role reversal is essential for high-probability trade setups.',
    keyConcepts: [
      {
        heading: 'Support and Resistance Definition',
        content:
          '• Support: A horizontal floor where buying interest is strong enough to overcome selling pressure.\n• Resistance: A horizontal ceiling where selling pressure exceeds buying demand.',
      },
      {
        heading: 'Price Zones vs Exact Price Points',
        content:
          'Traders often err by expecting exact numbers (e.g. exactly ₹50.00). In reality, support and resistance operate as ZONES (e.g., ₹49.50 to ₹50.50). High momentum causes overshoot; slow momentum may reverse before touching the exact line.',
      },
      {
        heading: 'Role Reversal: Support Becomes Resistance & Vice Versa',
        content:
          'Once price penetrates below support, that level transforms into future resistance. Trapped buyers who bought at the old support look to sell at break-even when price bounces back. Conversely, broken resistance becomes future support.',
      },
      {
        heading: 'Market Memory',
        content:
          'The longer a price trades in a narrow range with high volume, the more participants anchor to that price. Previous highs and lows become future target or limit levels.',
      },
    ],
    newTerms: [
      {
        term: 'Support Zone',
        definition: 'A price band where concentrated buying interest historically halts downward price moves.',
      },
      {
        term: 'Role Reversal',
        definition: 'The principle that broken support turns into resistance, and broken resistance turns into support.',
      },
    ],
    interactiveActivityType: 'SUPPORT_RESISTANCE',
    modelQuestions: [
      {
        id: 'q3_1',
        question: 'What does a decline below a support level indicate?',
        options: [
          'There is a lack of sellers',
          'Buyers are pushing down the price',
          'There is a lack of buyers and sellers are willing to sell even at lower prices',
          'None of the above',
        ],
        correctAnswerIndex: 2,
        explanation: 'Breaking support proves demand has dried up and sellers are aggressive enough to accept even lower prices.',
      },
      {
        id: 'q3_2',
        question: 'Once price penetrates below support, the broken support level becomes:',
        options: ['A breakaway gap', 'Potential resistance', 'A double bottom', 'A leading oscillator'],
        correctAnswerIndex: 1,
        explanation: 'Under the principle of role reversal, broken support turns into future resistance.',
      },
    ],
  },
  {
    id: 'ncfm_ch3_head_and_shoulders',
    chapterNumber: 3,
    chapterTitle: 'Pattern Study',
    sectionNumber: '3.2',
    title: 'Head and Shoulders Reversal & Price Target Formulas',
    subtitle: 'Calculate downside and upside targets using neckline geometry and volume confirmation.',
    estimatedMinutes: 6,
    xpReward: 180,
    prerequisites: ['ncfm_ch3_support_resistance'],
    category: 'PATTERNS',
    badgeReward: 'Head & Shoulders Master',
    overview:
      'The Head and Shoulders Top and Inverted Head and Shoulders Bottom are among the most reliable reversal formations in technical analysis. Master volume behavior across the shoulders and exact price target projection.',
    keyConcepts: [
      {
        heading: 'Head and Shoulders Top Reversal',
        content:
          'Consists of three peaks: Left Shoulder (heavy volume), Head (highest peak on diminishing volume), and Right Shoulder (lower peak). A Neckline is drawn connecting the two reaction troughs.',
        formula: 'Downside Price Target = Neckline Price - (Head Peak Price - Neckline Price)',
      },
      {
        heading: 'Volume Confirmation Rule',
        content:
          'Volume on the Left Shoulder advance is usually high. Volume on the Head advance is notably lower (warning sign). Volume expands heavily during the right shoulder decline and breaks through the neckline.',
      },
      {
        heading: 'Inverted Head and Shoulders (Bottom)',
        content:
          'Inverse pattern after a downtrend with three troughs (middle trough deepest). VOLUME IS MANDATORY on the advance of the right shoulder and the neckline breakout. Without volume expansion, the bottom breakout is suspect.',
        formula: 'Upside Price Target = Neckline Price + (Neckline Price - Head Trough Low)',
      },
    ],
    newTerms: [
      {
        term: 'Neckline',
        definition: 'A trendline connecting the reaction lows in a Head & Shoulders Top, or reaction highs in an Inverted Head & Shoulders.',
      },
      {
        term: 'Measured Move Target',
        definition: 'The projected minimum target calculated by measuring the vertical distance from head to neckline and projecting it from the breakout point.',
      },
    ],
    interactiveActivityType: 'HEAD_SHOULDERS_CALC',
    modelQuestions: [
      {
        id: 'q3_3',
        question: 'In a top reversal Head and Shoulders pattern, the decline from the peak of ________ should break the neckline.',
        options: ['Left shoulder', 'Right shoulder', 'Head', 'Neckline'],
        correctAnswerIndex: 1,
        explanation: 'The pattern is confirmed when the decline from the peak of the Right Shoulder breaks the neckline support.',
      },
      {
        id: 'q3_4',
        question: 'For a Head and Shoulders Bottom (Inverted), volume expansion on the neckline breakout is:',
        options: ['Optional and unimportant', 'Absolutely required for a valid breakout', 'A sign of an exhaustion gap', 'Only needed on weekly charts'],
        correctAnswerIndex: 1,
        explanation: 'Unlike a top where price can fall from its own weight, a bottom breakout absolutely requires volume expansion.',
      },
    ],
  },
  {
    id: 'ncfm_ch3_double_top_bottom_gaps',
    chapterNumber: 3,
    chapterTitle: 'Pattern Study',
    sectionNumber: '3.3',
    title: 'Double Tops/Bottoms, Rounded Formations & Gap Theory',
    subtitle: 'Learn "M" and "W" patterns, common, breakaway, runaway, and exhaustion gaps.',
    estimatedMinutes: 6,
    xpReward: 180,
    prerequisites: ['ncfm_ch3_head_and_shoulders'],
    category: 'PATTERNS',
    badgeReward: 'Breakout Hunter',
    overview:
      'Double Tops ("M") and Double Bottoms ("W") signal major trend turning points. Combine them with Gap Theory to identify powerful momentum shifts and avoid false breakouts.',
    keyConcepts: [
      {
        heading: 'Double Top ("M") & Double Bottom ("W")',
        content:
          '• Double Top: Two peaks separated by 1-3 months (within 3% of each other) with a 10-20% reaction low between them. Breaks below trough with volume.\n• Double Bottom: Two troughs tested at support. Buy trigger is the break above the reaction high with volume.',
        formula: 'Double Bottom Target = Reaction High + (Reaction High - Trough Low)',
      },
      {
        heading: 'The Four Gap Categories',
        content:
          '1. Common Gap: Appears in trading ranges; low volume; filled quickly within days/weeks.\n2. Breakaway Gap: Breaks out of congestion range with heavy volume; becomes new support/resistance; not filled quickly.\n3. Runaway / Continuation Gap: Measuring gap mid-trend reflecting panic acceleration.\n4. Exhaustion Gap: Near the end of a move with huge volume and extreme gap; quickly filled as trend reverses.',
      },
      {
        heading: 'Island Cluster',
        content:
          'An exhaustion gap in the direction of the trend, followed a few days later by a breakaway gap in the opposite direction, leaving price isolated like an island. Extremely potent reversal signal!',
      },
    ],
    newTerms: [
      {
        term: 'Breakaway Gap',
        definition: 'A price gap that breaks out of a congestion trading range on high volume, signaling a new trend.',
      },
      {
        term: 'Exhaustion Gap',
        definition: 'A gap occurring near the climax of a trend with massive volume, rapidly filled as price reverses.',
      },
      {
        term: 'Island Cluster',
        definition: 'A price formation isolated by an exhaustion gap on one side and a breakaway gap on the other.',
      },
    ],
    interactiveActivityType: 'GAP_CLASSIFIER',
    modelQuestions: [
      {
        id: 'q3_5',
        question: 'Which gaps are also known as measuring gaps?',
        options: ['Common gaps', 'Breakaway gaps', 'Runaway gaps', 'Exhaustion gaps'],
        correctAnswerIndex: 2,
        explanation: 'Runaway or continuation gaps are called measuring gaps because they typically occur near the midpoint of a trend.',
      },
      {
        id: 'q3_6',
        question: 'An Island Cluster is identified by:',
        options: [
          'Two common gaps in a sideways market',
          'An exhaustion gap followed by a breakaway gap in the opposite direction',
          'A double top followed by a line chart',
          'A 200-day MA crossover',
        ],
        correctAnswerIndex: 1,
        explanation: 'An island cluster is created when an exhaustion gap is followed by a breakaway gap in the opposite direction.',
      },
    ],
  },

  // =========================================================================
  // CHAPTER 4: MAJOR INDICATORS & OSCILLATORS
  // =========================================================================
  {
    id: 'ncfm_ch4_moving_averages',
    chapterNumber: 4,
    chapterTitle: 'Major Indicators & Oscillators',
    sectionNumber: '4.1',
    title: 'Moving Averages: SMA vs EMA & Multiplier Formula',
    subtitle: 'Calculate Simple and Exponential Moving Averages using the official 2/(N+1) weighting formula.',
    estimatedMinutes: 6,
    xpReward: 170,
    prerequisites: ['ncfm_ch3_double_top_bottom_gaps'],
    category: 'INDICATORS',
    badgeReward: 'Moving Average Analyst',
    overview:
      'Moving averages smooth price fluctuations and reveal the underlying trend. Learn how SMAs apply equal weight while EMAs apply exponential weighting via the multiplier formula.',
    keyConcepts: [
      {
        heading: 'Simple Moving Average (SMA)',
        content:
          'Formed by computing the arithmetic mean closing price over N periods. As each new day is added, the oldest day is dropped.',
        formula: 'SMA = (Close_1 + Close_2 + ... + Close_N) / N',
      },
      {
        heading: 'Exponential Moving Average (EMA) & Multiplier',
        content:
          'Applies more weight to recent prices to reduce lag. Calculated using a smoothing multiplier based on periods N:',
        formula: 'Multiplier = 2 / (N + 1)\nEMA = (Price_current - EMA_prev) × Multiplier + EMA_prev',
        bulletPoints: [
          '10-period EMA Multiplier = 2 / (10 + 1) = 0.1818 (18.18% weight on today)',
          '20-period EMA Multiplier = 2 / (20 + 1) = 0.0952 (9.52% weight on today)',
          '50-period EMA Multiplier = 2 / (50 + 1) = 0.0392 (3.92% weight on today)',
        ],
      },
      {
        heading: 'Crossover Systems',
        content:
          '• Double Crossover: Shorter MA crosses longer MA (e.g. 5 & 20-day, 20 & 100-day).\n• Triple Crossover: Famous 4-9-18 day combination. Buy signal when 4-day crosses above 9-day and then 18-day.\n• The 200-day MA: The institutional benchmark separating bull markets (price above) from bear markets (price below).',
      },
    ],
    newTerms: [
      {
        term: 'Simple Moving Average (SMA)',
        definition: 'The unweighted arithmetic average of closing prices over a specific lookback period.',
      },
      {
        term: 'Exponential Moving Average (EMA)',
        definition: 'A moving average applying exponential weighting to recent prices via the formula 2/(N+1).',
      },
      {
        term: 'Lagging Indicator',
        definition: 'A trend-following indicator that follows price events rather than predicting future reversals.',
      },
    ],
    interactiveActivityType: 'MA_CALCULATOR',
    modelQuestions: [
      {
        id: 'q4_1',
        question: 'For a period-based EMA, the "Multiplier" formula is equal to:',
        options: ['1 / N', '2 / (N + 1)', 'N / (N - 1)', '2 / N'],
        correctAnswerIndex: 1,
        explanation: 'The mathematical multiplier for a period-based EMA is 2 / (N + 1).',
      },
      {
        id: 'q4_2',
        question: 'What is the Multiplier for a 10-period Exponential Moving Average?',
        options: ['10%', '18.18%', '25%', '9.52%'],
        correctAnswerIndex: 1,
        explanation: 'Multiplier = 2 / (10 + 1) = 2/11 = 0.1818 or 18.18%.',
      },
      {
        id: 'q4_3',
        question: 'Which of the following is considered a pivotal benchmark for long-term trends on NIFTY and individual stocks?',
        options: ['5-day MA', '200-day MA', '12-minute EMA', '3-day SMA'],
        correctAnswerIndex: 1,
        explanation: 'The 200-day moving average is watched globally as the pivotal line dividing bull and bear trends.',
      },
    ],
  },
  {
    id: 'ncfm_ch4_rsi_stochastic_oscillators',
    chapterNumber: 4,
    chapterTitle: 'Major Indicators & Oscillators',
    sectionNumber: '4.3',
    title: 'RSI, Zone Shifts, Stochastic %K/%D & Williams %R',
    subtitle: 'Master momentum velocity, overbought/oversold extremes, divergences, and the bull 70/40 vs bear 60/30 zones.',
    estimatedMinutes: 7,
    xpReward: 190,
    prerequisites: ['ncfm_ch4_moving_averages'],
    category: 'INDICATORS',
    badgeReward: 'Oscillator Wizard',
    overview:
      'Oscillators measure the velocity and momentum of price action. Discover why standard 70/30 RSI lines fail in strong trends and how Andrew Cardwell’s Bull/Bear Zone Shifts and Stochastic crossovers predict reversals.',
    keyConcepts: [
      {
        heading: 'Momentum & The Speedometer Analogy',
        content:
          'Momentum is the rate of change—the speed or slope of price movement. Like a car slowing down before making a U-turn, momentum decelerates before price changes direction.',
      },
      {
        heading: 'RSI Divergences & Zone Shifts',
        content:
          '• Bullish Divergence: Price forms a lower trough, but RSI forms a higher trough (downside exhaustion).\n• Bearish Divergence: Price forms a higher peak, but RSI forms a lower peak (buying power fading).\n• BULL MARKET RSI ZONE: RSI fluctuates between 70 and 40. Dips to 40 are buying opportunities; rallies to 70 are NOT short sales!\n• BEAR MARKET RSI ZONE: RSI fluctuates between 60 and 30. Rallies to 60 are selling opportunities; dips to 30 are NOT buys!',
      },
      {
        heading: 'Stochastic Oscillator (George Lane)',
        content:
          'Compares current close against the 14-period High-Low range:',
        formula: '%K = [(Close - Lowest Low_14) / (Highest High_14 - Lowest Low_14)] × 100\n%D = 3-period MA of %K',
        bulletPoints: [
          'Overbought above 80; Oversold below 20',
          'Buy Signal: %K crosses above %D in oversold zone (< 20)',
          'Sell Signal: %K crosses below %D in overbought zone (> 80)',
        ],
      },
      {
        heading: 'Williams %R (0 to -100)',
        content:
          'Developed by Larry Williams. Similar to Stochastic but uses a negative scale from 0 to -100. Overbought between 0 and -20; Oversold between -80 and -100.',
      },
    ],
    newTerms: [
      {
        term: 'Relative Strength Index (RSI)',
        definition: 'A momentum oscillator ranging from 0 to 100 that measures the speed and change of price movements.',
      },
      {
        term: 'Bull Market RSI Zone',
        definition: 'An advanced concept where RSI finds support at 40 and resistance at 70 during healthy bull trends.',
      },
      {
        term: 'Stochastic %K',
        definition: 'A formula comparing closing price to the high-low range over 14 periods, indicating where price closed relative to range.',
      },
    ],
    interactiveActivityType: 'RSI_ZONE_SHIFT',
    modelQuestions: [
      {
        id: 'q4_4',
        question: 'In a confirmed Bull Market, the typical extreme RSI support and resistance zones are:',
        options: ['80 and 20', '70 and 40', '60 and 30', '50 and 50'],
        correctAnswerIndex: 1,
        explanation: 'In healthy bull markets, RSI typically shifts zones, finding support at 40 and peaking at 70.',
      },
      {
        id: 'q4_5',
        question: 'What is the formula for the Stochastic %K indicator?',
        options: [
          'Close / 14-day MA',
          '(Today Close - Lowest Low) / (Highest High - Lowest Low) × 100',
          '12 EMA - 26 EMA',
          '(High - Low) / Volume',
        ],
        correctAnswerIndex: 1,
        explanation: '%K measures where the close finished relative to the 14-period range: (Close - Lowest Low)/(Highest High - Lowest Low) * 100.',
      },
    ],
  },
  {
    id: 'ncfm_ch4_macd_mfi_bollinger_toolkit',
    chapterNumber: 4,
    chapterTitle: 'Major Indicators & Oscillators',
    sectionNumber: '4.3.2',
    title: 'MACD, Money Flow Index (MFI) & Bollinger Bands',
    subtitle: 'Learn the 12/26/9 MACD lines, smart money volume MFI, and John Bollinger’s volatility squeeze.',
    estimatedMinutes: 6,
    xpReward: 180,
    prerequisites: ['ncfm_ch4_rsi_stochastic_oscillators'],
    category: 'INDICATORS',
    badgeReward: 'Composite Technician',
    overview:
      'Combine momentum and trend with MACD, incorporate volume with Money Flow Index (smart money flow), and analyze volatility expansions with Bollinger Bands.',
    keyConcepts: [
      {
        heading: 'MACD (Gerald Appel, 1970s)',
        content:
          'A hybrid trend-following and momentum indicator constructed from two exponential moving averages:',
        formula: 'Fast MACD Line = 12-period EMA - 26-period EMA\nSignal Line = 9-period EMA of Fast Line\nMACD Histogram = Fast Line - Signal Line',
        bulletPoints: [
          'Signal Crossover: Fast line crossing above Signal line = Buy; Fast line crossing below = Sell',
          'Centerline Crossover: MACD crossing above 0 = momentum turns positive / bullish confirmation',
          'Divergence: Higher price peaks with lower MACD peaks warn of impending tops',
        ],
      },
      {
        heading: 'Money Flow Index (MFI) — Smart Money Flow',
        content:
          'Takes volume into account alongside price:\nTypical Price = (High + Low + Close) / 3\nMoney Flow = Typical Price × Volume\nPositive Money Flow (when Typical Price > prior day) / Negative Money Flow = Money Ratio\nMFI = 100 - [100 / (1 + Money Ratio)]\nOverbought > 80, Oversold < 20.',
      },
      {
        heading: 'Bollinger Bands (John Bollinger)',
        content:
          'Consists of a 20-period SMA and upper/lower bands set 2 standard deviations away. Squeeze (narrow bands) precedes massive breakout moves.',
      },
      {
        heading: 'Multiple Indicator Toolkits for Market Phases',
        content:
          '• Trading / Sideways Market: Moving averages fade breakouts; sell overbought oscillators, buy oversold.\n• Bull Market: Buy MA upside crossovers; buy oversold RSI, IGNORE overbought signals!\n• Bear Market: Sell MA downside crossovers; sell overbought RSI, IGNORE oversold signals!',
      },
    ],
    newTerms: [
      {
        term: 'MACD Centerline Crossover',
        definition: 'When the fast MACD line crosses the zero line, confirming a structural shift in momentum.',
      },
      {
        term: 'Bollinger Band Squeeze',
        definition: 'A sharp contraction in Bollinger Band width signaling declining volatility before a major breakout.',
      },
      {
        term: 'Money Flow Index (MFI)',
        definition: 'A volume-weighted momentum oscillator measuring the inflow and outflow of money into a security.',
      },
    ],
    interactiveActivityType: 'BOLLINGER_SQUEEZE',
    modelQuestions: [
      {
        id: 'q4_6',
        question: 'When MACD is above zero, it mathematically means that:',
        options: [
          'The 26-day EMA is higher than the 12-day EMA',
          'The 12-day EMA is higher than the 26-day EMA',
          'Volume is zero',
          'RSI is above 70',
        ],
        correctAnswerIndex: 1,
        explanation: 'Because Fast Line = 12 EMA - 26 EMA, an MACD above zero means the 12 EMA is higher than the 26 EMA.',
      },
      {
        id: 'q4_7',
        question: 'In a confirmed Bull Market Toolkit, how should a trader treat overbought oscillator signals?',
        options: [
          'Immediately short sell the stock',
          'Ignore the overbought indicators and ride the trend',
          'Sell all holdings and buy puts',
          'Switch to a 1-minute chart',
        ],
        correctAnswerIndex: 1,
        explanation: 'In strong bull markets, oscillators remain overbought for long periods; selling overbought signals leads to severe losses.',
      },
    ],
  },

  // =========================================================================
  // CHAPTER 5: TRADING STRATEGIES
  // =========================================================================
  {
    id: 'ncfm_ch5_day_trading_momentum',
    chapterNumber: 5,
    chapterTitle: 'Trading Strategies',
    sectionNumber: '5.1 & 5.2',
    title: 'Day Trading, Scalping, Fading & Elder Impulse System',
    subtitle: 'Learn zero overnight risk, leverage, pivot points, and Dr. Alexander Elder’s dual EMA-MACD impulse system.',
    estimatedMinutes: 6,
    xpReward: 180,
    prerequisites: ['ncfm_ch4_macd_mfi_bollinger_toolkit'],
    category: 'STRATEGIES',
    badgeReward: 'Strategy Specialist',
    overview:
      'Day trading involves opening and closing positions within the same day to eliminate overnight gap risk. Explore scalping, fading, daily pivot points, and Dr. Alexander Elder’s Impulse System.',
    keyConcepts: [
      {
        heading: 'Day Trading Advantages & Realities',
        content:
          '1. Zero Overnight Risk: Positions closed prior to market close; overnight geopolitical or earnings shocks cannot harm open capital.\n2. Increased Leverage: Low intraday margin requirements amplify purchasing power.\n3. Direction Agnostic: Profit in both bull and bear markets through short selling.',
      },
      {
        heading: 'Four Popular Day Trading Styles',
        content:
          '• Scalping: Taking rapid profits on small price changes immediately upon fill; requires direct market access and ruthless exits.\n• Fading: Contrarian shorting of rapid overbought spikes expecting early profit-taking.\n• Daily Pivots: Buying near Low of Day (LOD) and selling near High of Day (HOD) around pivot levels.\n• Momentum Trading: Joining fast-moving stocks with explosive volume and news catalysts.',
      },
      {
        heading: 'Dr. Alexander Elder Impulse System',
        content:
          'Uses two indicators simultaneously to align market inertia and market momentum:\n1. 13-period EMA: Measures market inertia (rising = bulls control inertia).\n2. MACD Histogram: Measures market momentum (rising slope = bulls gaining power).',
        bulletPoints: [
          'Entry Signal: Issued ONLY when BOTH the EMA and MACD Histogram point in the same direction!',
          'Exit Signal: Issued the VERY MOMENT either indicator turns against the trade!',
          'Favorable Times to Trade: First hour (9:15-10:15 AM) and Last hour (2:30-3:30 PM) for peak liquidity.',
          'Unfavorable Times to Trade: Lunch session (12:00-2:00 PM) where volume dries up and moves are choppy.',
        ],
      },
    ],
    newTerms: [
      {
        term: 'Scalping',
        definition: 'A trading style focusing on harvesting small gains on quick price moves within seconds to minutes.',
      },
      {
        term: 'Fading',
        definition: 'A contrarian strategy of taking positions against an abrupt short-term move, anticipating a reversion to the mean.',
      },
      {
        term: 'Whipsaw',
        definition: 'A market condition where price moves sharply in one direction and quickly reverses, triggering false signals.',
      },
    ],
    interactiveActivityType: 'DAY_TRADING_SIM',
    modelQuestions: [
      {
        id: 'q5_1',
        question: 'Which of the following is one of the greatest advantages of day trading?',
        options: ['Zero overnight risk', 'Guaranteed 100% returns', 'No need for a trading plan', 'Unlimited broker margins'],
        correctAnswerIndex: 0,
        explanation: 'Because all positions are squared off before market close, overnight news and gap risk are erased.',
      },
      {
        id: 'q5_2',
        question: 'Under Dr. Alexander Elder’s Impulse System, an exit signal is triggered when:',
        options: [
          'The trading day ends',
          'Either the EMA or the MACD Histogram turns down / diverges',
          'RSI reaches 99',
          'A breakaway gap appears',
        ],
        correctAnswerIndex: 1,
        explanation: 'In Elder’s impulse system, traders exit immediately when either inertia (EMA) or momentum (MACD) weakens.',
      },
    ],
  },

  // =========================================================================
  // CHAPTER 6: DOW THEORY & ELLIOTT WAVE THEORY
  // =========================================================================
  {
    id: 'ncfm_ch6_dow_theory',
    chapterNumber: 6,
    chapterTitle: 'Dow Theory and Elliott Wave Theory',
    sectionNumber: '6.1 & 6.2',
    title: 'The Six Tenets of Dow Theory',
    subtitle: 'Learn the foundational principles created by Charles Dow: 3 trends, 3 phases, and index confirmation.',
    estimatedMinutes: 6,
    xpReward: 190,
    prerequisites: ['ncfm_ch5_day_trading_momentum'],
    category: 'DOW_ELLIOTT',
    badgeReward: 'Dow Theorist',
    overview:
      'Charles H. Dow (1851-1902) founded the Wall Street Journal and developed the principles that underpin all modern technical analysis. Discover the 3 market trends, the 3 phases of a bull market, and index confirmation.',
    keyConcepts: [
      {
        heading: 'Principle 1 & 2: The Three Trends',
        content:
          '1. Stock Market Discounts All Information: (Except acts of God/natural disasters).\n2. Three Trends:\n• Primary Trend: Lasts > 1 year; higher highs/higher lows (bull) or lower lows/lower highs (bear). "Trader’s best friend".\n• Secondary Trend: Corrections / pullbacks lasting 3 weeks to 3 months.\n• Minor Trend: Day-to-day noise lasting 1 day to 3 weeks (ignore to avoid loss).',
      },
      {
        heading: 'Principle 3: The Three Phases of Primary Trend',
        content:
          '1. Accumulation Phase: Astute investors buy when news is dismal, fear is rampant, and nobody believes a rally can occur.\n2. Participation Phase: Longest and largest phase; corporate earnings improve, public joins, ideal for technical traders.\n3. Distribution Phase: Rampant public euphoria; headlines scream new highs; smart money sells inventory to retail.',
      },
      {
        heading: 'Principles 4, 5 & 6: Confirmation & Volume',
        content:
          '4. Indexes Must Confirm Each Other: Dow created Industrial & Rail (Transportation) indexes; both must confirm highs.\n5. Volume Must Confirm Trend: Volume expands in the direction of the primary trend (rises with rallies in bull market, rises with declines in bear market).\n6. Trend Remains Intact Until Clear Reversal: Never anticipate reversals without conclusive evidence.',
      },
    ],
    newTerms: [
      {
        term: 'Primary Trend',
        definition: 'The dominant, long-term market direction lasting more than one year.',
      },
      {
        term: 'Accumulation Phase',
        definition: 'The initial phase of a bull market where informed investors buy depressed assets while public sentiment is pessimistic.',
      },
      {
        term: 'Secondary Trend',
        definition: 'An intermediate correction against the primary trend lasting between three weeks and three months.',
      },
    ],
    interactiveActivityType: 'DOW_THEORY_TIMELINE',
    modelQuestions: [
      {
        id: 'q6_1',
        question: 'Who is considered the father of Technical Analysis?',
        options: ['Ralph Nelson Elliott', 'Charles H. Dow', 'Gerald Appel', 'John Bollinger'],
        correctAnswerIndex: 1,
        explanation: 'Charles H. Dow (1851-1902) is regarded as the father of modern technical analysis.',
      },
      {
        id: 'q6_2',
        question: 'Which phase of the primary trend is the longest and most profitable for technical traders?',
        options: ['Accumulation Phase', 'Participation Phase', 'Distribution Phase', 'Minor Noise Phase'],
        correctAnswerIndex: 1,
        explanation: 'The Participation Phase is the longest phase of the primary trend where largest price advances occur.',
      },
      {
        id: 'q6_3',
        question: 'According to Dow Theory, volume should:',
        options: ['Always be zero', 'Increase in the direction of the primary trend', 'Only matter on monthly charts', 'Never be considered'],
        correctAnswerIndex: 1,
        explanation: 'Volume must confirm the trend: increasing during rallies in a bull market and during selloffs in a bear market.',
      },
    ],
  },
  {
    id: 'ncfm_ch6_elliott_wave_fibonacci',
    chapterNumber: 6,
    chapterTitle: 'Dow Theory and Elliott Wave Theory',
    sectionNumber: '6.5',
    title: 'Elliott Wave 5-3 Sequences & Fibonacci Relationships',
    subtitle: 'Master the 5 impulse and 3 corrective waves, the 3 indispensable rules, and Golden Ratio retracements.',
    estimatedMinutes: 7,
    xpReward: 200,
    prerequisites: ['ncfm_ch6_dow_theory'],
    category: 'DOW_ELLIOTT',
    badgeReward: 'Wave Master',
    overview:
      'Ralph Nelson Elliott discovered that crowd psychology swings between optimism and pessimism in fractal patterns: a 5-wave impulse sequence followed by a 3-wave (A-B-C) correction, governed by Fibonacci mathematics.',
    keyConcepts: [
      {
        heading: 'The 5-Wave Impulse & 3-Wave Correction',
        content:
          '• Dominant Trend (5 Waves): Waves 1, 3, 5 are impulse waves (advancing); Waves 2, 4 are corrective pullbacks.\n• Corrective Trend (3 Waves): Wave A (start of bear move), Wave B (counter-trend sucker rally on low volume), Wave C (devastating selloff on heavy volume).',
      },
      {
        heading: 'Three Indispensable Elliott Wave Rules',
        content:
          'These three rules MUST NEVER be violated in a valid wave count:',
        bulletPoints: [
          'Rule 1: Wave 2 can NEVER retrace more than 100% of Wave 1 (cannot break the starting bottom of Wave 1).',
          'Rule 2: Wave 3 is NEVER the shortest wave among Waves 1, 3, and 5 (it is usually the longest and most powerful).',
          'Rule 3: Wave 4 can NEVER overlap into the price territory of Wave 1 (Wave 4 low cannot fall below Wave 1 high in cash markets).',
        ],
      },
      {
        heading: 'Fibonacci Sequence & The Golden Ratio (1.618)',
        content:
          'Leonardo Fibonacci (1170-1250): Sequence 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144... (X_n = X_{n-1} + X_{n-2}). The ratio of any two successive numbers converges to 1.618 (The Golden Ratio).',
        formula: 'Key Fibonacci Ratios: 23.6%, 38.2%, 50%, 61.8%, 100%, 161.8%, 261.8%',
      },
      {
        heading: 'Practical Wave Trading: Buying Wave 4 & Wave 3',
        content:
          '• Buying at End of Wave 4: Ensure Wave 4 does not retrace > 61.8% of Wave 3. Place stop loss just below the 61.8% retracement level. Project Wave 5 target and only enter if Reward/Risk >= 1.5!\n• Buying Wave 3: Enter when price breaks above the peak of Wave 1 with stop below Wave 2 bottom. Wave 3 targets are 1.618 or 2.618 times Wave 1.',
      },
    ],
    newTerms: [
      {
        term: 'Impulse Wave',
        definition: 'A 5-wave sequence that moves in the primary direction of the main trend.',
      },
      {
        term: 'Fibonacci Retracement',
        definition: 'Horizontal support and resistance levels derived from Fibonacci ratios (23.6%, 38.2%, 50%, 61.8%) across a major price move.',
      },
      {
        term: 'Fractal',
        definition: 'A self-similar geometric structure where the smaller sub-waves exhibit the exact same 5-3 pattern as the larger degree wave.',
      },
    ],
    interactiveActivityType: 'ELLIOTT_WAVE_COUNT',
    modelQuestions: [
      {
        id: 'q6_4',
        question: 'Under Elliott Wave Theory, which wave is NEVER the shortest?',
        options: ['Wave 1', 'Wave 2', 'Wave 3', 'Wave 5'],
        correctAnswerIndex: 2,
        explanation: 'Rule 2 of Elliott Wave Theory strictly mandates that Wave 3 is never the shortest wave.',
      },
      {
        id: 'q6_5',
        question: 'Wave 4 can never overlap with the price peak of:',
        options: ['Wave 1', 'Wave 2', 'Wave 3', 'Wave 5'],
        correctAnswerIndex: 0,
        explanation: 'Rule 3 dictates that the corrective trough of Wave 4 cannot cross below the top of Wave 1 in cash markets.',
      },
      {
        id: 'q6_6',
        question: 'The Golden Ratio observed in the Fibonacci summation series is approximately:',
        options: ['1.414', '1.618', '2.718', '3.1415'],
        correctAnswerIndex: 1,
        explanation: 'The ratio between successive Fibonacci numbers approximates the Golden Ratio: 1.618034.',
      },
    ],
  },

  // =========================================================================
  // CHAPTER 7: TRADING PSYCHOLOGY & RISK MANAGEMENT
  // =========================================================================
  {
    id: 'ncfm_ch7_risk_management_discipline',
    chapterNumber: 7,
    chapterTitle: 'Trading Psychology and Risk Management',
    sectionNumber: '7.1 & 7.2',
    title: 'Risk Management, Drawdown & The 1.5 Reward-Risk Rule',
    subtitle: 'Learn position sizing, seed capital protection, the 2-5% loss limit, and how to survive 5 losses in a row.',
    estimatedMinutes: 6,
    xpReward: 200,
    prerequisites: ['ncfm_ch6_elliott_wave_fibonacci'],
    category: 'RISK_PSYCHOLOGY',
    badgeReward: 'Risk General',
    overview:
      'Reward is never risk-free. Even the best trading systems only win 60% to 65% of the time, meaning 4 out of 10 trades will be losers. Successful traders survive drawdowns by managing position size, placing mandatory stop-losses, and adhering to strict reward-to-risk ratios.',
    keyConcepts: [
      {
        heading: 'The Risk of Ruin & Drawdown Reality',
        content:
          'Novice traders focus exclusively on potential profit and ignore risk of ruin. With an abnormally large trade size, a string of 5 consecutive losses can wipe out an entire account. A professional trader accepts that losing streaks are statistically inevitable and sizes each trade to ensure account survival.',
      },
      {
        heading: 'The Minimum 1.5:1 Reward-to-Risk Rule',
        content:
          'Before executing any trade, calculate your potential reward and your stop-loss risk. On a conservative basis, if the reward-to-risk ratio is less than 1.5, DO NOT INITIATE THE TRADE!',
        formula: 'Reward-to-Risk Ratio = (Target Price - Entry Price) / (Entry Price - Stop Loss Price) >= 1.5',
      },
      {
        heading: 'Qualities of Successful Traders',
        content:
          '1. Always use stop-loss orders.\n2. Determine trade size from account equity and stop distance (never risk more than 2% to 5% of capital on any trade).\n3. Never allocate more than 10% of portfolio to any single sector.\n4. Always trade with risk capital you can afford to lose.\n5. Never trade with borrowed money or overextend margins.',
      },
      {
        heading: 'Trailing Stop Losses & Realized Profit',
        content:
          'Once a position moves into profit, trail the stop-loss to break-even or higher so capital is at zero risk. Remember: profit is not real until it is closed and realized.',
      },
    ],
    newTerms: [
      {
        term: 'Drawdown',
        definition: 'The peak-to-trough decline in account equity during a specific record trading period.',
      },
      {
        term: 'Reward-to-Risk Ratio',
        definition: 'The ratio comparing potential upside profit against potential downside loss defined by a stop-loss order.',
      },
      {
        term: 'Risk of Ruin',
        definition: 'The probability that a trader’s account will be reduced to zero due to poor position sizing and excessive risk.',
      },
    ],
    interactiveActivityType: 'RISK_REWARD_CALC',
    modelQuestions: [
      {
        id: 'q7_1',
        question: 'Before initiating a trade, what minimum Reward-to-Risk ratio is recommended by the NCFM curriculum?',
        options: ['0.5 to 1', '1.0 to 1', '1.5 to 1', '5.0 to 1'],
        correctAnswerIndex: 2,
        explanation: 'On a conservative basis, if the reward-to-risk ratio is less than 1.5, the trade should not be initiated.',
      },
      {
        id: 'q7_2',
        question: 'What is the maximum recommended risk of capital loss on any single trade?',
        options: ['2% to 5%', '25% to 50%', '50% to 75%', '100%'],
        correctAnswerIndex: 0,
        explanation: 'Successful traders never risk more than 2% to 5% of their total trading capital on any single trade.',
      },
      {
        id: 'q7_3',
        question: 'Why should a trader trail their stop-loss once a trade is in profit?',
        options: [
          'To increase broker commissions',
          'To ensure the trade is at zero capital risk even if market reverses',
          'To turn into a day trader',
          'To avoid taxes',
        ],
        correctAnswerIndex: 1,
        explanation: 'Trailing stops protect accrued gains and ensure the trade has zero capital risk if triggered.',
      },
    ],
  },
  {
    id: 'ncfm_ch7_dos_donts_and_20_rules',
    chapterNumber: 7,
    chapterTitle: 'Trading Psychology and Risk Management',
    sectionNumber: '7.3 & 7.4',
    title: 'The 14 Do’s & Don’ts, 20 Rules & Market Selection',
    subtitle: 'Learn the emotional pitfalls of overtrading, the power of "Being Flat", and why trading should be boring.',
    estimatedMinutes: 6,
    xpReward: 200,
    prerequisites: ['ncfm_ch7_risk_management_discipline'],
    category: 'RISK_PSYCHOLOGY',
    badgeReward: 'Dalal Street Veteran',
    overview:
      '"The Trend is your friend until the end when it bends." 90% of novice traders fail within their first year due to overtrading and lack of discipline. Discover the 14 Golden Do’s and Don’ts, the 20 rules to stop losing money, and why being flat is a powerful position.',
    keyConcepts: [
      {
        heading: 'The 14 Do’s and Don’ts in Trading',
        content:
          '1. Forget the news, remember the chart.\n2. Buy at support, sell at resistance.\n3. Don’t chase momentum if you can’t find the exit.\n4. Trends test the point of last support/resistance.\n5. Trade with the TICK not against it.\n6. If you have to look, it isn’t there.\n7. The trend is your friend in the last hour (3:00 PM).\n8. Avoid the open (they see you coming).\n9. Bulls live above the 200-day MA, bears live below.\n10. Price has memory.\n11. Big volume kills moves (climax blow-offs).\n12. Trends never turn on a dime (reversals build slowly).\n13. Bottoms take longer to form than tops.\n14. Beat the crowd in and out the door.',
      },
      {
        heading: 'Why Traders Overtrade & The Power of "Being Flat"',
        content:
          'Traders overtrade because they are hooked on adrenaline, fear missing out, or lack specific entry criteria. Remember: there are THREE positions in the market: LONG, SHORT, and FLAT. Being flat (holding cash) is a completely legitimate position that allows you to let the market set up without chasing.',
      },
      {
        heading: 'Choosing 6 to 8 Markets to Follow',
        content:
          'You do not need to follow hundreds of stocks. Track a focused basket of 6 to 8 stocks across diversified sectors (e.g. 1 banking, 1 IT, 1 energy, 1 auto, 1 pharma) to maximize high-probability setups without cognitive overload.',
      },
      {
        heading: '20 Rules to Stop Losing Money Highlights',
        content:
          '• Trading is not investment—remember charts, forget press releases.\n• There is no Holy Grail trading formula; only solid risk management.\n• Trading should be boring most of the time, just like a real job.\n• Overpriced software won’t help you trade like a pro; pretty lights make you a faster trader, not a better one.',
      },
    ],
    newTerms: [
      {
        term: 'Being Flat',
        definition: 'Holding 100% cash with zero market exposure, waiting patiently for ideal risk-reward opportunities.',
      },
      {
        term: 'Overtrading',
        definition: 'Executing too many trades or taking excessively large positions driven by adrenaline or FOMO rather than systematic criteria.',
      },
      {
        term: 'Holy Grail Fallacy',
        definition: 'The mistaken belief that a secret infallible indicator exists that can predict markets without risk management.',
      },
    ],
    interactiveActivityType: 'DISCIPLINE_RULES',
    modelQuestions: [
      {
        id: 'q7_4',
        question: 'Small ups and downs create temporary stress and can reduce swing traders to:',
        options: ['Day traders', 'Investors', 'Gamblers', 'Arbitrageurs'],
        correctAnswerIndex: 0,
        explanation: 'Watching minute-to-minute fluctuations induces stress and causes swing traders to prematurely scalp like day traders.',
      },
      {
        id: 'q7_5',
        question: 'Why do trends never turn on a dime?',
        options: [
          'Reversals build slowly',
          'The first sharp dip always finds buyers and the first sharp rise always finds sellers',
          'Both A and B above',
          'None of the above',
        ],
        correctAnswerIndex: 2,
        explanation: 'Trends build momentum; the first sharp counter-move finds buyers or sellers before a structural reversal can complete.',
      },
    ],
  },
];
