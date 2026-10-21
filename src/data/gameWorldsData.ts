export interface WorldLevel {
  id: string; // e.g. 'mission-1'
  worldId: string;
  number: number;
  worldIndex: number;
  stageName?: string;
  title: string;
  subtitle: string;
  storyGoal: string;
  instruction: string;
  mechanicType:
    | 'CAPITAL_ALLOCATION'
    | 'EQUITY_OWNERSHIP'
    | 'ORDER_BOOK_DYNAMICS'
    | 'ORDER_EXECUTION'
    | 'CANDLESTICK_CONSTRUCTION'
    | 'TREND_PREDICTION'
    | 'SUPPORT_RESISTANCE'
    | 'CRASH_PSYCHOLOGY'
    | 'PORTFOLIO_ALLOCATION'
    | 'COMPANY_FORENSICS';
  category: string;
  estimatedMinutes: number;
  xpReward: number;
  cashReward: number;
  unlocksBadge: string;
  unlockedFeatureName?: string;
  icon: string;
  keyTakeaway: string;
  coordinates: { xPercent: number; yPercent: number }; // For SVG visual world path
}

export interface GameWorld {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  tagline: string;
  themeColor: string;
  accentColor: string;
  bgImage: string;
  unlockedMinMissions: number;
  description: string;
  badgeReward: string;
  levels: WorldLevel[];
}

export const GAME_WORLDS: GameWorld[] = [
  {
    id: 'world-1',
    number: 1,
    title: 'Genesis Archipelago',
    subtitle: 'Foundations of Capital & Markets',
    tagline: 'Start here: Master the difference between saving and investing, shares, supply & demand, and your first trade.',
    themeColor: 'from-emerald-950 via-teal-900 to-slate-950',
    accentColor: '#10B981',
    bgImage: '/src/assets/images/world_genesis_archipelago_1792485120647.jpg',
    unlockedMinMissions: 0,
    badgeReward: 'Archipelago Pioneer',
    description: 'A vibrant island chain where sea merchants exchange goods, build the first co-operative businesses, and lay the foundations of modern capital markets.',
    levels: [
      {
        id: 'mission-1',
        worldId: 'world-1',
        number: 1,
        worldIndex: 1,
        title: 'The Seed of Capital',
        subtitle: 'Spending vs Saving vs Compounding',
        storyGoal: 'You arrive at the port with ₹1,000 in your pocket. Will you consume it immediately, lock it in a chest where inflation quietly eats it away, or plant it in productive businesses to compound?',
        instruction: 'Allocate your ₹1,000 across Spending, Locker Cash, and Productive Equity, then simulate 5 years to beat 6% annual inflation.',
        mechanicType: 'CAPITAL_ALLOCATION',
        category: 'INVESTING_BASICS',
        estimatedMinutes: 2,
        xpReward: 100,
        cashReward: 1000,
        unlocksBadge: 'Seed Sower',
        unlockedFeatureName: 'Stock Basics & PizzaCo',
        icon: '🌱',
        keyTakeaway: 'Investing puts capital to work to beat inflation; cash idle in a locker loses ~6% purchasing power every year.',
        coordinates: { xPercent: 18, yPercent: 78 },
      },
      {
        id: 'mission-2',
        worldId: 'world-1',
        number: 2,
        worldIndex: 2,
        title: 'The Pizza Co-Op',
        subtitle: 'What is a Stock & Fractional Equity?',
        storyGoal: 'PIZZACO makes popular wood-fired pizzas in Mumbai and wants to expand. To buy two new ovens and delivery bikes, they need ₹1,00,000 and divide ownership into 1,000 equal shares.',
        instruction: 'Buy 1 share of PIZZACO for ₹100, calculate your ownership stake, and vote on whether to reinvest profits or pay dividends.',
        mechanicType: 'EQUITY_OWNERSHIP',
        category: 'STOCKS',
        estimatedMinutes: 3,
        xpReward: 150,
        cashReward: 1000,
        unlocksBadge: 'Fractional Owner',
        unlockedFeatureName: 'Order Book Bazaar',
        icon: '🍕',
        keyTakeaway: 'A share is legal fractional ownership of a company, its equipment, brand, and future cash earnings.',
        coordinates: { xPercent: 38, yPercent: 62 },
      },
      {
        id: 'mission-3',
        worldId: 'world-1',
        number: 3,
        worldIndex: 3,
        title: 'The Market Bazaar',
        subtitle: 'Supply & Demand Order Book Dynamics',
        storyGoal: 'At the island trading port, crowds of buyers and sellers shout prices. When eager buyers outnumber sellers, prices climb; when panic sellers dump inventory, prices tumble.',
        instruction: 'Control the crowd balance slider to find the market-clearing equilibrium price and execute an order when supply meets demand.',
        mechanicType: 'ORDER_BOOK_DYNAMICS',
        category: 'DEMAND_SUPPLY',
        estimatedMinutes: 3,
        xpReward: 200,
        cashReward: 1500,
        unlocksBadge: 'Market Mover',
        unlockedFeatureName: 'Live Order Floor',
        icon: '⚖️',
        keyTakeaway: 'Stock prices are not arbitrary; they reflect the continuous equilibrium between eager buyers and motivated sellers.',
        coordinates: { xPercent: 60, yPercent: 48 },
      },
      {
        id: 'mission-4',
        worldId: 'world-1',
        number: 4,
        worldIndex: 4,
        title: 'Dalal Street Bell',
        subtitle: 'Place Your First Virtual Market Order',
        storyGoal: 'The morning bell rings at the National Stock Exchange. Step onto Dalal Street to buy your first real blue-chip company (TCS) with live simulated execution and slip management.',
        instruction: 'Select TCS, choose a Market Order, set your quantity, verify your virtual cash balance, and click Execute to fill your ticket.',
        mechanicType: 'ORDER_EXECUTION',
        category: 'TRADING',
        estimatedMinutes: 3,
        xpReward: 250,
        cashReward: 2000,
        unlocksBadge: 'First Order Filled',
        unlockedFeatureName: 'Candlestick Coast & Portfolio Tracker',
        icon: '🔔',
        keyTakeaway: 'A Market Order fills immediately at the best available Ask price, debiting your cash and adding shares to your portfolio.',
        coordinates: { xPercent: 82, yPercent: 32 },
      },
    ],
  },
  {
    id: 'world-2',
    number: 2,
    title: 'Candlestick Coast',
    subtitle: 'Reading Price Action & Market Trends',
    tagline: 'Unlock the visual language of Dalal Street: Japanese candlesticks, trends, and support/resistance walls.',
    themeColor: 'from-cyan-950 via-sky-900 to-slate-950',
    accentColor: '#0EA5E9',
    bgImage: '/src/assets/images/world_candlestick_coast_1792485121207.jpg',
    unlockedMinMissions: 4,
    badgeReward: 'Coast Navigator',
    description: 'Rugged ocean bluffs where historic lighthouses guide market navigators. Master reading candlestick bodies, wicks, and chart horizons.',
    levels: [
      {
        id: 'mission-5',
        worldId: 'world-2',
        number: 5,
        worldIndex: 1,
        title: 'The Candlestick Forge',
        subtitle: 'Interactive Anatomy & Pattern Construction',
        storyGoal: 'A fierce battle occurred between Bulls and Bears today. Bears pushed price down early in the session, but Bulls fiercely defended the floor and pushed the close to the highs!',
        instruction: 'Assemble the 4 prices (Open, High, Low, Close) to forge the candle. Construct a Bullish Hammer and see why the long lower shadow matters.',
        mechanicType: 'CANDLESTICK_CONSTRUCTION',
        category: 'CANDLESTICKS',
        estimatedMinutes: 3,
        xpReward: 250,
        cashReward: 2000,
        unlocksBadge: 'Candle Apprentice',
        unlockedFeatureName: 'Trend Navigator',
        icon: '🕯️',
        keyTakeaway: 'A candlestick reveals the intraday psychology: body shows Open-to-Close, while shadows (wicks) show rejected price extremes.',
        coordinates: { xPercent: 22, yPercent: 72 },
      },
      {
        id: 'mission-6',
        worldId: 'world-2',
        number: 6,
        worldIndex: 2,
        title: 'The Trend Navigator',
        subtitle: 'Price Prediction & Higher Highs / Lows',
        storyGoal: 'The lighthouse beacon illuminates the historical price trajectory of Reliance Industries over 15 periods. Is the market in an Uptrend, Downtrend, or Sideways chop?',
        instruction: 'Inspect the sequence of peaks and troughs, identify whether Higher Highs are forming, and predict the next period breakout direction.',
        mechanicType: 'TREND_PREDICTION',
        category: 'CHARTS',
        estimatedMinutes: 3,
        xpReward: 300,
        cashReward: 2500,
        unlocksBadge: 'Trend Spotter',
        unlockedFeatureName: 'Support & Resistance Citadel',
        icon: '📊',
        keyTakeaway: 'The trend is your friend: an Uptrend is defined by consecutive Higher Highs and Higher Lows.',
        coordinates: { xPercent: 52, yPercent: 50 },
      },
      {
        id: 'mission-7',
        worldId: 'world-2',
        number: 7,
        worldIndex: 3,
        title: 'Support & Resistance Citadel',
        subtitle: 'Floor Bounces vs Ceiling Breakouts',
        storyGoal: 'Heavy institutional buyers have repeatedly defended the ₹2,400 floor level on HDFC Bank. Price is approaching this support boundary once again.',
        instruction: 'Observe price testing the boundary wall. Place a simulated limit order near support with a tight stop-loss just underneath it.',
        mechanicType: 'SUPPORT_RESISTANCE',
        category: 'SUPPORT_RESISTANCE',
        estimatedMinutes: 4,
        xpReward: 350,
        cashReward: 3000,
        unlocksBadge: 'Citadel Defender',
        unlockedFeatureName: 'Fortitude Mountain Fortress',
        icon: '🏰',
        keyTakeaway: 'Support acts as an invisible floor where buyers step in; Resistance is a ceiling where supply halts price advances.',
        coordinates: { xPercent: 80, yPercent: 30 },
      },
    ],
  },
  {
    id: 'world-3',
    number: 3,
    title: 'Fortitude Mountain Fortress',
    subtitle: 'Risk Management, Allocation & Forensics',
    tagline: 'Survive market crashes, build balanced portfolios, and analyze companies through fundamental clues.',
    themeColor: 'from-purple-950 via-slate-900 to-slate-950',
    accentColor: '#A855F7',
    bgImage: '/src/assets/images/world_fortitude_realm_1792485122073.jpg',
    unlockedMinMissions: 7,
    badgeReward: 'Master of Dalal Street',
    description: 'The high alpine fortress where capital is defended with steel discipline. Learn to survive drawdowns, diversify across assets, and audit company health.',
    levels: [
      {
        id: 'mission-8',
        worldId: 'world-3',
        number: 8,
        worldIndex: 1,
        title: 'The Red Sea Storm',
        subtitle: 'Market Crash & Stop-Loss Discipline',
        storyGoal: 'Breaking global news triggers an unexpected flash-crash! Your open stock position drops -12% within minutes. Fear grips Dalal Street.',
        instruction: 'Do not panic sell at the absolute bottom or ignore risk. Execute a planned stop-loss discipline to preserve your main capital.',
        mechanicType: 'CRASH_PSYCHOLOGY',
        category: 'RISK',
        estimatedMinutes: 3,
        xpReward: 350,
        cashReward: 3500,
        unlocksBadge: 'Cool Head Under Fire',
        unlockedFeatureName: 'Portfolio Allocator',
        icon: '🛡️',
        keyTakeaway: 'Every successful trader takes small calculated losses. A stop-loss prevents single mistakes from destroying your total account.',
        coordinates: { xPercent: 25, yPercent: 75 },
      },
      {
        id: 'mission-9',
        worldId: 'world-3',
        number: 9,
        worldIndex: 2,
        title: 'The Master Portfolio',
        subtitle: 'Diversification & Asset Allocation Challenge',
        storyGoal: 'You are handed ₹1,00,000 in virtual capital. If you put 100% into speculative tech and an interest rate shock hits, you lose 40% of everything.',
        instruction: 'Allocate across Tech Equities, Defensive FMCG, Gold ETF, and Liquid Cash. Survive 3 economic shock simulations with positive net worth.',
        mechanicType: 'PORTFOLIO_ALLOCATION',
        category: 'PORTFOLIO',
        estimatedMinutes: 4,
        xpReward: 400,
        cashReward: 4000,
        unlocksBadge: 'Asset Allocator',
        unlockedFeatureName: 'Company Detective',
        icon: '💼',
        keyTakeaway: 'Diversification is the only free lunch in finance: uncorrelated assets protect your net worth during market downturns.',
        coordinates: { xPercent: 55, yPercent: 48 },
      },
      {
        id: 'mission-10',
        worldId: 'world-3',
        number: 10,
        worldIndex: 3,
        title: 'Dalal Street Detective',
        subtitle: 'Company Financial Clues & Compounders',
        storyGoal: 'Three mystery companies seek your investment: Company Alpha, Beta, and Gamma. One is a high-ROE compounder, one is a debt trap, and one is overvalued.',
        instruction: 'Inspect four financial clue folders (P/E Ratio, Debt-to-Equity, Operating Cash Flow, and ROE) and identify the genuine compounder.',
        mechanicType: 'COMPANY_FORENSICS',
        category: 'INVESTING_BASICS',
        estimatedMinutes: 4,
        xpReward: 500,
        cashReward: 5000,
        unlocksBadge: 'Dalal Street Detective',
        unlockedFeatureName: 'Mastery Arena & Free Market Mode',
        icon: '🔍',
        keyTakeaway: 'Long-term stock prices mirror underlying business earnings growth, high Return on Equity (ROE), and manageable debt.',
        coordinates: { xPercent: 78, yPercent: 24 },
      },
    ],
  },
];

export const ALL_WORLD_LEVELS: WorldLevel[] = GAME_WORLDS.flatMap((w) => w.levels);
