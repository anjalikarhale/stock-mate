import { District, LevelInfo, Achievement, DailyQuest } from '../types';

export const PROGRESSION_LEVELS: LevelInfo[] = [
  {
    level: 1,
    title: 'Market Newbie',
    rankBadge: '🌱 Level 1',
    minXp: 0,
    maxXp: 200,
    unlockedDistricts: ['bank-district'],
    unlockedFeatures: ['Basic Money & Compounding', 'Candlestick Basics', 'Virtual Wallet ₹1,00,000'],
  },
  {
    level: 2,
    title: 'Stock Explorer',
    rankBadge: '🧭 Level 2',
    minXp: 200,
    maxXp: 500,
    unlockedDistricts: ['bank-district', 'stock-exchange'],
    unlockedFeatures: ['NSE/BSE Order Types', 'Market & Limit Orders', 'Candlestick Combat Game'],
  },
  {
    level: 3,
    title: 'Market Apprentice',
    rankBadge: '⚔️ Level 3',
    minXp: 500,
    maxXp: 900,
    unlockedDistricts: ['bank-district', 'stock-exchange', 'chart-arena'],
    unlockedFeatures: ['Chart Detective Game', 'Support & Resistance Drawing', 'Trading Journal'],
  },
  {
    level: 4,
    title: 'Investor',
    rankBadge: '💼 Level 4',
    minXp: 900,
    maxXp: 1400,
    unlockedDistricts: ['bank-district', 'stock-exchange', 'chart-arena', 'corporate-district'],
    unlockedFeatures: ['Company Detective', 'P/E and ROE Forensics', 'Balance Sheet Analysis'],
  },
  {
    level: 5,
    title: 'Trader',
    rankBadge: '⚡ Level 5',
    minXp: 1400,
    maxXp: 2000,
    unlockedDistricts: ['bank-district', 'stock-exchange', 'chart-arena', 'corporate-district', 'psychology-lab'],
    unlockedFeatures: ['FOMO Trap Arena', 'Market Crash Survival', 'Stop-Loss Discipline Tracker'],
  },
  {
    level: 6,
    title: 'Chart Analyst',
    rankBadge: '📊 Level 6',
    minXp: 2000,
    maxXp: 2800,
    unlockedDistricts: ['bank-district', 'stock-exchange', 'chart-arena', 'corporate-district', 'psychology-lab', 'portfolio-tower'],
    unlockedFeatures: ['Portfolio Construction Lab', 'Multi-timeframe Analysis', 'MACD & RSI Indicators'],
  },
  {
    level: 7,
    title: 'Fundamental Analyst',
    rankBadge: '🔬 Level 7',
    minXp: 2800,
    maxXp: 3800,
    unlockedDistricts: ['bank-district', 'stock-exchange', 'chart-arena', 'corporate-district', 'psychology-lab', 'portfolio-tower'],
    unlockedFeatures: ['IPO Forensics', 'Valuation Modeling', 'Cash Flow Analysis'],
  },
  {
    level: 8,
    title: 'Portfolio Manager',
    rankBadge: '🏛️ Level 8',
    minXp: 3800,
    maxXp: 5000,
    unlockedDistricts: ['bank-district', 'stock-exchange', 'chart-arena', 'corporate-district', 'psychology-lab', 'portfolio-tower', 'quant-lab'],
    unlockedFeatures: ['Strategy Builder & Backtester', 'Asset Allocation Optimizer', 'Drawdown Control'],
  },
  {
    level: 9,
    title: 'Market Strategist',
    rankBadge: '🎯 Level 9',
    minXp: 5000,
    maxXp: 6500,
    unlockedDistricts: ['bank-district', 'stock-exchange', 'chart-arena', 'corporate-district', 'psychology-lab', 'portfolio-tower', 'quant-lab', 'derivatives-arena'],
    unlockedFeatures: ['Derivatives Arena (Futures & Options)', 'Greeks Simulator', 'Hedging Strategies'],
  },
  {
    level: 10,
    title: 'Quant Master',
    rankBadge: '🤖 Level 10',
    minXp: 6500,
    maxXp: 8500,
    unlockedDistricts: ['bank-district', 'stock-exchange', 'chart-arena', 'corporate-district', 'psychology-lab', 'portfolio-tower', 'quant-lab', 'derivatives-arena'],
    unlockedFeatures: ['Algorithmic Logic Builder', 'Sharpe Ratio Optimization', 'Market Escape Room Master'],
  },
  {
    level: 11,
    title: 'Market Master',
    rankBadge: '👑 Level 11 - LEGEND',
    minXp: 8500,
    maxXp: 12000,
    unlockedDistricts: ['bank-district', 'stock-exchange', 'corporate-district', 'chart-arena', 'portfolio-tower', 'psychology-lab', 'derivatives-arena', 'quant-lab'],
    unlockedFeatures: ['Final Boss: 1-Year Market Simulation', 'Mastery Hall of Fame', 'Legend Avatar'],
  }
];

export const DISTRICTS: District[] = [
  {
    id: 'bank-district',
    name: 'Bank District',
    hindiTitle: 'मुद्रा एवं चक्र वृद्धि केंद्र',
    icon: 'Landmark',
    color: '#3b82f6',
    accentGradient: 'from-blue-600 to-cyan-500',
    requiredLevel: 1,
    description: 'Learn the foundational rules of money, inflation erosion, compounding velocity, and risk-return trade-offs.',
    topics: ['Money Basics', 'Inflation Math', 'Compounding Multipliers', 'Risk vs Return Matrix', 'Opportunity Cost'],
    games: [
      {
        id: 'candlestick-memory',
        title: 'Candlestick Memory Matrix',
        description: 'Match financial patterns and test your immediate applied comprehension.',
        rewardXp: 75,
        badgeIcon: 'Brain',
      },
    ],
    boss: {
      name: 'Inflation Gargoyle',
      title: 'The Silent Wealth Destroyer',
      description: 'Defeat the 7% annual inflation monster by compounding your capital effectively.',
      unlocked: true,
      rewardBadge: 'Compounding Shield',
    }
  },
  {
    id: 'stock-exchange',
    name: 'Stock Exchange',
    hindiTitle: 'दलाल स्ट्रीट (NSE / BSE)',
    icon: 'Building2',
    color: '#10b981',
    accentGradient: 'from-emerald-600 to-teal-500',
    requiredLevel: 2,
    description: 'The beating heart of Indian financial markets. Master NSE/BSE mechanics, order types, bid-ask spreads, and liquidity.',
    topics: ['NSE & BSE Architecture', 'Market & Limit Orders', 'Stop-Loss Orders', 'Bid-Ask Spread', 'SEBI Investor Rights'],
    games: [
      {
        id: 'trading-terminal',
        title: 'Virtual Trading Floor',
        description: 'Execute simulated live market and limit orders with ₹1,00,000 virtual capital.',
        rewardXp: 100,
        badgeIcon: 'TrendingUp',
      }
    ],
    boss: {
      name: 'The Order Book Titan',
      title: 'Master of Bid-Ask Spread',
      description: 'Execute high-precision limit and stop-loss orders in a fast-moving volatile auction.',
      unlocked: false,
      rewardBadge: 'Execution Master',
    }
  },
  {
    id: 'chart-arena',
    name: 'Chart Arena',
    hindiTitle: 'चार्ट युद्धभूमि',
    icon: 'CandlestickChart',
    color: '#8b5cf6',
    accentGradient: 'from-purple-600 to-indigo-600',
    requiredLevel: 3,
    description: 'Step onto the technical battlefield. Battle candlestick monsters, draw key support/resistance lines, and decode price action.',
    topics: ['Candlestick Anatomy', 'Support & Resistance', 'Trendline Geometry', 'Breakouts vs Fakeouts', 'RSI & Moving Averages'],
    games: [
      {
        id: 'candlestick-combat',
        title: 'Candlestick Combat',
        description: 'Identify candlestick patterns in fast-paced RPG battles to strike boss enemies.',
        rewardXp: 120,
        badgeIcon: 'Swords',
      },
      {
        id: 'chart-detective',
        title: 'Chart Detective',
        description: 'Uncover hidden future market trends using historical price action clues and drawing tools.',
        rewardXp: 150,
        badgeIcon: 'Search',
      }
    ],
    boss: {
      name: 'The Shadow Wick Dragon',
      title: 'Guardian of Price Action',
      description: 'Identify complex multi-candlestick reversal patterns before time runs out.',
      unlocked: false,
      rewardBadge: 'Chart Master Blade',
    }
  },
  {
    id: 'corporate-district',
    name: 'Corporate District',
    hindiTitle: 'कॉर्पोरेट विश्लेषक नगर',
    icon: 'Briefcase',
    color: '#f59e0b',
    accentGradient: 'from-amber-600 to-orange-500',
    requiredLevel: 4,
    description: 'Investigate company balance sheets, revenue growth, ROCE, P/E ratios, and uncover value traps vs quality compounders.',
    topics: ['Financial Statements', 'P/E and P/B Valuation', 'ROE & ROCE Quality', 'Debt-to-Equity Danger', 'Moats & Margins'],
    games: [
      {
        id: 'company-forensics',
        title: 'Company & IPO Forensics',
        description: 'Dissect corporate balance sheets to uncover hidden red flags and pick winning stocks.',
        rewardXp: 160,
        badgeIcon: 'FileSpreadsheet',
      }
    ],
    boss: {
      name: 'The Value Trap Golem',
      title: 'Deceiver of Cheap P/E Ratios',
      description: 'Spot the high-debt company with declining operating cash flow masked by accounting tricks.',
      unlocked: false,
      rewardBadge: 'Forensic Lens',
    }
  },
  {
    id: 'psychology-lab',
    name: 'Psychology Lab',
    hindiTitle: 'व्यापार मनोविज्ञान प्रयोगशाला',
    icon: 'BrainCircuit',
    color: '#ec4899',
    accentGradient: 'from-pink-600 to-rose-500',
    requiredLevel: 5,
    description: 'Conquer your mind. Overcome FOMO, loss aversion, revenge trading, and emotional impulse in live market simulations.',
    topics: ['FOMO Neutralization', 'Loss Aversion Paradox', 'Revenge Trading Pitfalls', 'Trading Journal Discipline', 'Risk-to-Reward Consistency'],
    games: [
      {
        id: 'fomo-trap',
        title: 'FOMO Trap Simulator',
        description: 'Resist tempting social media hype and parabolic price spikes to safeguard your capital.',
        rewardXp: 140,
        badgeIcon: 'ShieldAlert',
      },
      {
        id: 'market-crash',
        title: 'Market Crash Survival',
        description: 'Survive a catastrophic multi-wave market crash without panic selling your core portfolio.',
        rewardXp: 200,
        badgeIcon: 'Zap',
      }
    ],
    boss: {
      name: 'The Greed & Panic Chimera',
      title: 'Lord of Market Hype & Fear',
      description: 'Maintain strict stop-loss rules and emotional discipline during extreme market chaos.',
      unlocked: false,
      rewardBadge: 'Diamond Mind Ring',
    }
  },
  {
    id: 'portfolio-tower',
    name: 'Portfolio Tower',
    hindiTitle: 'पोर्टफोलियो शिखर',
    icon: 'PieChart',
    color: '#06b6d4',
    accentGradient: 'from-cyan-600 to-blue-600',
    requiredLevel: 6,
    description: 'Construct resilient, all-weather portfolios. Master asset allocation, correlation matrices, and risk-adjusted returns (Sharpe ratio).',
    topics: ['Asset Allocation Rules', 'Sector Diversification', 'Rebalancing Tactics', 'CAGR & Drawdown Math', 'Beta & Correlation'],
    games: [
      {
        id: 'portfolio-tetris',
        title: 'Portfolio Tetris & Construction',
        description: 'Assemble optimal asset weightings across Large, Mid, Small Cap and Gold to maximize Sharpe Ratio.',
        rewardXp: 180,
        badgeIcon: 'Boxes',
      }
    ],
    boss: {
      name: 'The Drawdown Hydra',
      title: 'Corruptor of Concentrated Bets',
      description: 'Survive sector shocks with a balanced portfolio without exceeding 10% maximum drawdown.',
      unlocked: false,
      rewardBadge: 'All-Weather Crown',
    }
  },
  {
    id: 'derivatives-arena',
    name: 'Derivatives Arena',
    hindiTitle: 'डेरिवेटिव्स अखाड़ा',
    icon: 'Flame',
    color: '#ef4444',
    accentGradient: 'from-red-600 to-rose-700',
    requiredLevel: 9,
    description: 'High-leverage zone. Master Futures, Calls, Puts, Option Greeks (Delta, Theta, Gamma, Vega), and hedging strategies.',
    topics: ['Futures Leverage & Margins', 'Call & Put Options', 'Strike Prices & Moneyness', 'Option Greeks (Theta Decay)', 'Spreads & Iron Condors'],
    games: [
      {
        id: 'escape-room',
        title: 'Market Escape Room',
        description: 'Solve multi-layered financial and derivative puzzles to escape before time expires.',
        rewardXp: 220,
        badgeIcon: 'KeyRound',
      }
    ],
    boss: {
      name: 'Theta the Time Reaper',
      title: 'Devourer of Option Buyers',
      description: 'Deploy defensive option spread strategies before Friday 3:30 PM expiry decay eliminates your premium.',
      unlocked: false,
      rewardBadge: 'Greek Master Scepter',
    }
  },
  {
    id: 'quant-lab',
    name: 'Quant Lab',
    hindiTitle: 'मात्रात्मक रणनीति अनुसंधान',
    icon: 'Cpu',
    color: '#14b8a6',
    accentGradient: 'from-teal-600 to-emerald-600',
    requiredLevel: 8,
    description: 'Build algorithmic trading strategies with custom rules, and backtest against historical Indian market cycles.',
    topics: ['Algorithmic Logic (IF/THEN)', 'Backtesting Validation', 'Win Rate vs Profit Factor', 'Overfitting Prevention', 'Quantitative Metrics'],
    games: [
      {
        id: 'strategy-backtest',
        title: 'Visual Strategy Builder & Backtest',
        description: 'Combine RSI, EMA crossovers, and volume triggers to simulate 5-year historical returns.',
        rewardXp: 250,
        badgeIcon: 'Code2',
      }
    ],
    boss: {
      name: 'The Overfitting Phantom',
      title: 'Siren of Curve-Fitted Strategies',
      description: 'Build a robust strategy that performs consistently across both bull and bear market regimes.',
      unlocked: false,
      rewardBadge: 'Algorithmic Core',
    }
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-trade',
    title: 'First Step on Dalal Street',
    description: 'Execute your first simulated stock order with virtual money.',
    icon: 'Zap',
    category: 'BEGINNER',
    xpReward: 50,
    unlockedAt: new Date().toISOString(),
  },
  {
    id: 'candlestick-slayer',
    title: 'Candlestick Slayer',
    description: 'Achieve a 5-streak in Candlestick Combat without missing.',
    icon: 'Swords',
    category: 'TECHNICAL',
    xpReward: 100,
  },
  {
    id: 'trend-oracle',
    title: 'Trend Oracle',
    description: 'Successfully predict 3 historical chart breakout directions in Chart Detective.',
    icon: 'Eye',
    category: 'TECHNICAL',
    xpReward: 120,
  },
  {
    id: 'crash-survivor',
    title: 'Iron Shield Survivor',
    description: 'Survive the full Market Crash simulation with capital drawdown under 15%.',
    icon: 'ShieldCheck',
    category: 'RISK',
    xpReward: 180,
  },
  {
    id: 'fomo-slayer',
    title: 'Zen Mind (FOMO Proof)',
    description: 'Decline 3 deceptive viral pump tips in the FOMO Simulator.',
    icon: 'Brain',
    category: 'PSYCHOLOGY',
    xpReward: 110,
  },
  {
    id: 'balance-detective',
    title: 'Forensic Auditor',
    description: 'Identify a company with hidden debt and negative operating cash flow.',
    icon: 'SearchCheck',
    category: 'FUNDAMENTAL',
    xpReward: 140,
  }
];

export const INITIAL_DAILY_QUESTS: DailyQuest[] = [
  {
    id: 'quest-1',
    title: 'Candlestick Reflex Warmup',
    description: 'Defeat 3 candlestick pattern challenges in Candlestick Combat.',
    category: 'CHART',
    target: 3,
    current: 0,
    completed: false,
    xpReward: 60,
    cashReward: 1500,
    actionGameId: 'candlestick-combat',
  },
  {
    id: 'quest-2',
    title: 'Historical Chart Forensics',
    description: 'Analyze and solve at least 1 mystery case in Chart Detective.',
    category: 'ANALYSIS',
    target: 1,
    current: 0,
    completed: false,
    xpReward: 80,
    cashReward: 2000,
    actionGameId: 'chart-detective',
  },
  {
    id: 'quest-3',
    title: 'Crash Volatility Test',
    description: 'Complete 1 round of Market Crash Survival.',
    category: 'RISK',
    target: 1,
    current: 0,
    completed: false,
    xpReward: 100,
    cashReward: 2500,
    actionGameId: 'market-crash',
  }
];
