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
  category: 'BASICS' | 'CANDLESTICKS' | 'PATTERNS' | 'INDICATORS' | 'RISK_PSYCHOLOGY';
  xpReward: number;
  prerequisites: string[];
  overview: string;
  keyConcepts: {
    heading: string;
    content: string;
    formula?: string;
    bulletPoints?: string[];
  }[];
  newTerms: {
    term: string;
    definition: string;
  }[];
  interactiveActivityType:
    | 'TOP_DOWN_FILTER'
    | 'CANDLESTICK_ANATOMY'
    | 'HEAD_SHOULDERS_CALC'
    | 'DOUBLE_TOP_BOTTOM'
    | 'MA_CALCULATOR'
    | 'RISK_REWARD_CALC';
  modelQuestions: QuizQuestion[];
}

export interface NCFMChapterCoverage {
  chapterNumber: number;
  chapterTitle: string;
  weightagePercent: number;
  sections: {
    sectionId: string;
    sectionNumber: string;
    title: string;
    modelQuestionsCount: number;
    topics: string[];
  }[];
}

export const NCFM_LESSONS: NCFMLesson[] = [
  {
    id: 'ncfm-ch1',
    chapterNumber: 1,
    chapterTitle: 'Introduction to Technical Analysis & Dow Theory',
    sectionNumber: '1.1',
    title: 'Core Assumptions, Dow Theory & Top-Down Stock Selection',
    category: 'BASICS',
    xpReward: 150,
    prerequisites: [],
    overview:
      'Master the three foundational pillars of Technical Analysis, Charles Dow’s market trend hierarchy, and the institutional top-down sector filter.',
    keyConcepts: [
      {
        heading: 'Three Pillars of Technical Analysis',
        content:
          'Technical analysis studies supply and demand reflected in price and volume rather than intrinsic accounting value.',
        bulletPoints: [
          'Market action discounts everything (earnings, macro, sentiment).',
          'Prices move in identifiable Primary, Secondary, and Minor trends.',
          'History tends to repeat itself due to recurring human psychology (fear and greed).',
        ],
      },
      {
        heading: 'Dow Theory & Volume Confirmation',
        content:
          'Primary trends last from a year to several years, secondary reactions retrace 33% to 66% of the primary move, and volume must expand in the direction of the primary trend.',
      },
    ],
    newTerms: [
      {
        term: 'Primary Trend',
        definition: 'The dominant long-term market tide lasting 1+ years (Bull or Bear market).',
      },
      {
        term: 'Top-Down Approach',
        definition: 'Analyzing broad market index first, then outperforming sectors, and finally leading stocks.',
      },
    ],
    interactiveActivityType: 'TOP_DOWN_FILTER',
    modelQuestions: [
      {
        id: 'ncfm-q1-1',
        question: 'Which statement is a core assumption of Technical Analysis under the NCFM syllabus?',
        options: [
          'Market price discounts all known fundamental and psychological information',
          'Price moves completely randomly with zero trend persistence',
          'Volume is irrelevant during breakouts',
          'Only balance sheet ratios determine short-term support',
        ],
        correctAnswerIndex: 0,
        explanation: 'Technical analysis rests on the premise that market action discounts everything.',
      },
      {
        id: 'ncfm-q1-2',
        question: 'In Dow Theory, how should trading volume behave in a healthy bull trend?',
        options: [
          'Expand on rallies and contract during pullbacks',
          'Contract on rallies and spike only on declines',
          'Stay completely flat every day',
          'Drop to zero at new highs',
        ],
        correctAnswerIndex: 0,
        explanation: 'Volume confirms the trend by expanding in the direction of the primary trend.',
      },
      {
        id: 'ncfm-q1-3',
        question: 'What is the proper sequence in a Top-Down technical filter?',
        options: [
          'Broad Market Index → Sector Index → Individual Stock',
          'Penny Stock → Rumor Forum → Broad Index',
          'Dividend Yield → Tax Rate → Intraday Tick',
          'Individual Stock → Currency Swap → Repo Rate',
        ],
        correctAnswerIndex: 0,
        explanation: 'Traders align with the broad market tide first, pick leading sectors, and select top stocks.',
      },
    ],
  },
  {
    id: 'ncfm-ch2',
    chapterNumber: 2,
    chapterTitle: 'Candle Charts',
    sectionNumber: '2.1',
    title: 'Japanese Candlestick Anatomy, Hammer, Shooting Star & Engulfing Lines',
    category: 'CANDLESTICKS',
    xpReward: 175,
    prerequisites: ['ncfm-ch1'],
    overview:
      'Learn how Japanese candlesticks visually encode Open, High, Low, and Close battles, umbrella lines, Doji equilibrium, and multi-candle reversals.',
    keyConcepts: [
      {
        heading: 'Real Body & Shadows (Wicks)',
        content:
          'The rectangular area between Open and Close is the Real Body. Thin lines extending to session High and Low are Upper and Lower Shadows.',
        formula: 'Hammer Rule: Lower Shadow >= 2 × Real Body (at bottom of downtrend)',
        bulletPoints: [
          'Green/White body: Close > Open (buyers won the session).',
          'Red/Black body: Close < Open (sellers won the session).',
          'Doji: Open ≈ Close (market equilibrium / indecision).',
        ],
      },
    ],
    newTerms: [
      {
        term: 'Umbrella Line (Hammer / Hanging Man)',
        definition: 'Small real body near the top of the range with a lower shadow at least twice the body height.',
      },
      {
        term: 'Bullish Engulfing',
        definition: 'Two-candle bottom reversal where a green real body completely wraps around the prior red real body.',
      },
    ],
    interactiveActivityType: 'CANDLESTICK_ANATOMY',
    modelQuestions: [
      {
        id: 'ncfm-q2-1',
        question: 'For a valid Hammer candlestick, the lower shadow should ideally be at least:',
        options: [
          'Twice the height of the real body',
          'Zero length (no lower shadow)',
          'Half the upper shadow',
          'Equal to the 52-week high',
        ],
        correctAnswerIndex: 0,
        explanation: 'NCFM defines an umbrella/hammer line as having a lower shadow at least 2x the real body.',
      },
      {
        id: 'ncfm-q2-2',
        question: 'What does a Doji after an extended rally signify?',
        options: [
          'Indecision and exhaustion of one-sided buyer control',
          'Guaranteed 50% gain tomorrow',
          'Stock split announcement',
          'Delisting from NSE',
        ],
        correctAnswerIndex: 0,
        explanation: 'A Doji signals that buyers could no longer push the close above the open.',
      },
    ],
  },
  {
    id: 'ncfm-ch3',
    chapterNumber: 3,
    chapterTitle: 'Pattern Study',
    sectionNumber: '3.1',
    title: 'Support & Resistance, Head & Shoulders, Double Tops & Triangles',
    category: 'PATTERNS',
    xpReward: 200,
    prerequisites: ['ncfm-ch2'],
    overview:
      'Calculate classical chart pattern price targets, identify support-resistance role reversals, and distinguish continuation from reversal structures.',
    keyConcepts: [
      {
        heading: 'Support, Resistance & Role Reversal',
        content:
          'Support is a price zone where buying demand halts a decline. Resistance is a ceiling where supply halts an advance. Once decisively broken, support flips into resistance (and vice versa).',
      },
      {
        heading: 'Head & Shoulders Price Objective',
        content:
          'Measure the vertical distance from the Head peak down to the Neckline, then project that exact distance downward from the neckline breakout point.',
        formula: 'Downside Target = Neckline − (Head Peak − Neckline)',
      },
    ],
    newTerms: [
      {
        term: 'Neckline',
        definition: 'The support line connecting reaction lows beneath the Left Shoulder and Head.',
      },
      {
        term: 'Change of Polarity',
        definition: 'Prior broken resistance acting as future support upon retest.',
      },
    ],
    interactiveActivityType: 'HEAD_SHOULDERS_CALC',
    modelQuestions: [
      {
        id: 'ncfm-q3-1',
        question: 'If a Head & Shoulders top has a Head at ₹1,000 and a horizontal Neckline at ₹850, what is the minimum downside target?',
        options: ['₹700', '₹850', '₹925', '₹1,150'],
        correctAnswerIndex: 0,
        explanation: 'Height = 1000 − 850 = ₹150. Target = 850 − 150 = ₹700.',
      },
      {
        id: 'ncfm-q3-2',
        question: 'When a major resistance zone is decisively broken on high volume, it typically becomes:',
        options: ['Future support on pullbacks', 'Irrelevant forever', 'A circuit limit', 'Dividend record date'],
        correctAnswerIndex: 0,
        explanation: 'This is the classic Change of Polarity (Role Reversal) principle.',
      },
    ],
  },
  {
    id: 'ncfm-ch4',
    chapterNumber: 4,
    chapterTitle: 'Major Indicators & Oscillators',
    sectionNumber: '4.1',
    title: 'SMA, EMA Multiplier, MACD & RSI Bull/Bear Range Shifts',
    category: 'INDICATORS',
    xpReward: 200,
    prerequisites: ['ncfm-ch3'],
    overview:
      'Distinguish trend-following lagging indicators (SMA, EMA, MACD) from momentum oscillators (RSI, Stochastic) and compute EMA smoothing weights.',
    keyConcepts: [
      {
        heading: 'Exponential Moving Average (EMA) Multiplier',
        content:
          'Unlike a Simple Moving Average (SMA) which weights all N days equally, EMA assigns heavier weight to recent prices.',
        formula: 'EMA Multiplier = 2 / (N + 1)',
      },
      {
        heading: 'RSI Bull & Bear Market Zone Shifts',
        content:
          'Developed by J. Welles Wilder, RSI oscillates from 0 to 100. In strong bull trends RSI tends to range between 40 and 80 (40 acts as bull support), whereas in bear trends it ranges between 20 and 60.',
      },
    ],
    newTerms: [
      {
        term: 'Golden Cross',
        definition: 'Bullish crossover when a shorter moving average (50 DMA) crosses above a longer one (200 DMA).',
      },
      {
        term: 'Bearish Divergence',
        definition: 'Price makes a higher high while RSI/MACD prints a lower high, warning of waning momentum.',
      },
    ],
    interactiveActivityType: 'MA_CALCULATOR',
    modelQuestions: [
      {
        id: 'ncfm-q4-1',
        question: 'What is the smoothing multiplier for a 9-day Exponential Moving Average (EMA)?',
        options: ['20% (0.20)', '10% (0.10)', '50% (0.50)', '9% (0.09)'],
        correctAnswerIndex: 0,
        explanation: 'Multiplier = 2 / (9 + 1) = 2 / 10 = 0.20 (20%).',
      },
      {
        id: 'ncfm-q4-2',
        question: 'Moving averages work best in trending markets and tend to generate whipsaws in:',
        options: ['Sideways / range-bound markets', 'Strong bull trends', 'Sustained downtrends', 'IPO listings'],
        correctAnswerIndex: 0,
        explanation: 'Trend-following indicators whipsaw repeatedly during horizontal consolidation.',
      },
    ],
  },
  {
    id: 'ncfm-ch7',
    chapterNumber: 7,
    chapterTitle: 'Trading Strategies, Risk Management & Psychology',
    sectionNumber: '7.1',
    title: 'The 2% Capital Rule, 1.5:1 Reward-to-Risk & Overcoming Cognitive Biases',
    category: 'RISK_PSYCHOLOGY',
    xpReward: 225,
    prerequisites: ['ncfm-ch4'],
    overview:
      'Apply professional position sizing, enforce stop-loss invalidation points, and eliminate confirmation, anchoring, and loss-aversion biases.',
    keyConcepts: [
      {
        heading: 'Position Sizing & The 2% Capital Rule',
        content:
          'Never risk more than 1% to 2% of total trading capital on a single trade idea, and require a minimum Reward-to-Risk ratio of 1.5:1 or 2:1.',
        formula: 'Max Shares = (Total Capital × Risk %) / (Entry Price − Stop Loss)',
      },
      {
        heading: 'Trading Psychology Traps',
        content:
          'Loss aversion causes amateurs to cut winners prematurely while holding losers in hope. Pre-defining stop-loss orders before entry neutralizes emotional paralysis.',
      },
    ],
    newTerms: [
      {
        term: 'Risk-to-Reward Ratio',
        definition: 'Expected profit to target divided by potential loss to stop-loss level.',
      },
      {
        term: 'Trailing Stop',
        definition: 'Raising the stop-loss level as price advances to lock in unrealized profits.',
      },
    ],
    interactiveActivityType: 'RISK_REWARD_CALC',
    modelQuestions: [
      {
        id: 'ncfm-q7-1',
        question: 'With ₹1,00,000 capital and a 2% max risk rule, if Entry = ₹500 and Stop Loss = ₹480, what is the maximum position size?',
        options: ['100 shares', '200 shares', '500 shares', '20 shares'],
        correctAnswerIndex: 0,
        explanation: 'Max rupee risk = ₹2,000. Risk per share = ₹20. 2000 / 20 = 100 shares.',
      },
      {
        id: 'ncfm-q7-2',
        question: 'If Entry = ₹500, Stop Loss = ₹480, and Target = ₹515, should a disciplined NCFM trader take this trade?',
        options: [
          'No — Reward (₹15) to Risk (₹20) is 0.75:1, well below the 1.5:1 minimum rule',
          'Yes — any positive target is acceptable',
          'Yes — double position size to compensate',
          'Remove the stop loss to improve the ratio',
        ],
        correctAnswerIndex: 0,
        explanation: 'Asymmetric positive expectancy requires reward to exceed risk by at least 1.5x.',
      },
    ],
  },
];

export const NCFM_COURSE_COVERAGE: NCFMChapterCoverage[] = [
  {
    chapterNumber: 1,
    chapterTitle: 'Introduction to Technical Analysis',
    weightagePercent: 10,
    sections: [
      {
        sectionId: 'ncfm-ch1',
        sectionNumber: '1.1 – 1.5',
        title: 'Philosophy, Assumptions & Technical vs Fundamental Analysis',
        modelQuestionsCount: 10,
        topics: ['3 Core Assumptions', 'Price Discounts Everything', 'Timeframes', 'Strengths & Weaknesses'],
      },
    ],
  },
  {
    chapterNumber: 2,
    chapterTitle: 'Candle Charts',
    weightagePercent: 20,
    sections: [
      {
        sectionId: 'ncfm-ch2',
        sectionNumber: '2.1 – 2.6',
        title: 'Japanese Candlesticks: One, Two & Three Candle Patterns',
        modelQuestionsCount: 15,
        topics: ['Real Body & Shadows', 'Hammer & Shooting Star', 'Doji & Spinning Top', 'Engulfing, Harami, Morning/Evening Star'],
      },
    ],
  },
  {
    chapterNumber: 3,
    chapterTitle: 'Pattern Study',
    weightagePercent: 20,
    sections: [
      {
        sectionId: 'ncfm-ch3',
        sectionNumber: '3.1 – 3.7',
        title: 'Support/Resistance, Trendlines, Gaps, Head & Shoulders & Triangles',
        modelQuestionsCount: 15,
        topics: ['Change of Polarity', 'Breakaway/Runaway/Exhaustion Gaps', 'Head & Shoulders Target', 'Double Top/Bottom', 'Flags & Triangles'],
      },
    ],
  },
  {
    chapterNumber: 4,
    chapterTitle: 'Major Indicators & Oscillators',
    weightagePercent: 20,
    sections: [
      {
        sectionId: 'ncfm-ch4',
        sectionNumber: '4.1 – 4.8',
        title: 'Moving Averages, MACD, RSI, Stochastic & Bollinger Bands',
        modelQuestionsCount: 15,
        topics: ['SMA vs EMA Multiplier', 'MACD Signal Line & Histogram', 'RSI 70/30 & Bull/Bear Shifts', 'Bollinger Squeeze'],
      },
    ],
  },
  {
    chapterNumber: 5,
    chapterTitle: 'Trading Strategies & Market Theories',
    weightagePercent: 10,
    sections: [
      {
        sectionId: 'ncfm-ch1',
        sectionNumber: '5.1 – 5.4',
        title: 'Dow Theory, Elliott Wave Basics & Fibonacci Retracements',
        modelQuestionsCount: 10,
        topics: ['Accumulation/Markup/Distribution', 'Impulse 5-Wave & Corrective 3-Wave', '38.2% & 61.8% Retracements'],
      },
    ],
  },
  {
    chapterNumber: 6,
    chapterTitle: 'Trading Psychology & Risk Management',
    weightagePercent: 10,
    sections: [
      {
        sectionId: 'ncfm-ch7',
        sectionNumber: '6.1 – 6.4',
        title: 'Position Sizing, Stop Losses & Behavioral Biases',
        modelQuestionsCount: 10,
        topics: ['2% Capital Risk Rule', '1.5:1 Reward-to-Risk', 'Loss Aversion & Anchoring', 'Trading Journal'],
      },
    ],
  },
  {
    chapterNumber: 7,
    chapterTitle: 'Intermarket Analysis & Sector Rotation',
    weightagePercent: 10,
    sections: [
      {
        sectionId: 'ncfm-ch1',
        sectionNumber: '7.1 – 7.3',
        title: 'Bonds, Equities, Commodities, Currency & Top-Down Filtering',
        modelQuestionsCount: 10,
        topics: ['Bond Yields vs Equities', 'INR/USD Impact on IT & Pharma', 'Relative Strength Sector Filter'],
      },
    ],
  },
];
