export interface WorldLevel {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  worldId: 'world-1' | 'world-2' | 'world-3';
  stageName: string;
  estimatedMinutes: number;
  xpReward: number;
  cashReward: number;
  unlocksBadge?: string;
  icon: string;
  storyGoal: string;
  keyTakeaway: string;
}

export const ALL_WORLD_LEVELS: WorldLevel[] = [
  {
    id: 'mission-1',
    number: 1,
    title: 'Beat the Silent Thief (Inflation)',
    subtitle: 'Allocate ₹1,000 across Spending, Locker Cash, and Productive Equities',
    worldId: 'world-1',
    stageName: 'Genesis Archipelago',
    estimatedMinutes: 4,
    xpReward: 100,
    cashReward: 2500,
    unlocksBadge: 'Inflation Buster',
    icon: '🌱',
    storyGoal:
      'Inflation at 6% silently erodes cash sitting idle in a locker. Allocate at least ₹500 into the 12% CAGR Equity Index and simulate 5 years to grow your net purchasing power above ₹1,000.',
    keyTakeaway:
      'Saving preserves nominal cash, but investing in productive businesses is essential to beat inflation and compound real wealth.',
  },
  {
    id: 'mission-2',
    number: 2,
    title: 'Own a Slice of PizzaCo',
    subtitle: 'Acquire shares in a growing business and cast your shareholder vote',
    worldId: 'world-1',
    stageName: 'Genesis Archipelago',
    estimatedMinutes: 5,
    xpReward: 120,
    cashReward: 3000,
    unlocksBadge: 'Equity Shareholder',
    icon: '🍕',
    storyGoal:
      'PizzaCo is expanding across India with 1,000 total shares. Buy shares to become a part-owner and vote on how management should deploy annual profits.',
    keyTakeaway:
      'Every stock ticker represents real fractional ownership in a living company—its kitchens, patents, cash flows, and future growth.',
  },
  {
    id: 'mission-3',
    number: 3,
    title: 'The Order Book Tug-of-War',
    subtitle: 'Simulate buyer demand vs seller supply on the NSE matching engine',
    worldId: 'world-1',
    stageName: 'Genesis Archipelago',
    estimatedMinutes: 5,
    xpReward: 130,
    cashReward: 3000,
    unlocksBadge: 'Price Discoverer',
    icon: '⚖️',
    storyGoal:
      'Stock prices are not set by the government or company CEO—they move every second based on aggressive buyers vs sellers. Shift buyer demand above seller supply to discover the new clearing price.',
    keyTakeaway:
      'When buyer demand exceeds available seller supply at the current price, buyers bid higher and push the market price up.',
  },
  {
    id: 'mission-4',
    number: 4,
    title: 'First Live Order on Dalal Street',
    subtitle: 'Execute a virtual buy order for TCS on the NSE Order Floor',
    worldId: 'world-1',
    stageName: 'Genesis Archipelago',
    estimatedMinutes: 6,
    xpReward: 150,
    cashReward: 4000,
    unlocksBadge: 'Dalal Street Debut',
    icon: '🎯',
    storyGoal:
      'Step onto the virtual NSE trading floor! Choose your order type (Market or Limit), select share quantity for TCS, and execute your very first trade ticket.',
    keyTakeaway:
      'Always verify symbol, quantity, order type, and total capital required before transmitting an order to the exchange.',
  },
  {
    id: 'mission-5',
    number: 5,
    title: 'The Candlestick Forge',
    subtitle: 'Forge a textbook Bullish Hammer candlestick using OHLC sliders',
    worldId: 'world-2',
    stageName: 'Candlestick Coast',
    estimatedMinutes: 6,
    xpReward: 160,
    cashReward: 4000,
    unlocksBadge: 'Candle Forger',
    icon: '🕯️',
    storyGoal:
      'Bears drove the price sharply down during the session, but bulls stepped in aggressively! Set Open, High, Low, and Close to forge a Bullish Hammer with a long lower wick (at least 2x the body) and a close near the high.',
    keyTakeaway:
      'Long lower shadows at support reveal strong buyer demand absorbing seller panic.',
  },
  {
    id: 'mission-6',
    number: 6,
    title: 'Trend Navigator',
    subtitle: 'Decode Higher Highs and Higher Lows on an NSE price swing',
    worldId: 'world-2',
    stageName: 'Candlestick Coast',
    estimatedMinutes: 6,
    xpReward: 170,
    cashReward: 4500,
    unlocksBadge: 'Trend Rider',
    icon: '🧭',
    storyGoal:
      'Inspect the sequence of swing peaks and troughs on the chart. Identify the primary market structure and reveal whether momentum confirms an Uptrend.',
    keyTakeaway:
      'Charles Dow taught that an uptrend remains intact as long as each rally peaks higher (Higher High) and each pullback holds higher (Higher Low).',
  },
  {
    id: 'mission-7',
    number: 7,
    title: 'Support & Resistance Sniper',
    subtitle: 'Place a disciplined entry on HDFC Bank with optimal risk-reward',
    worldId: 'world-2',
    stageName: 'Candlestick Coast',
    estimatedMinutes: 7,
    xpReward: 180,
    cashReward: 5000,
    unlocksBadge: 'Zone Tactician',
    icon: '🛡️',
    storyGoal:
      'HDFC Bank has bounced twice from its confirmed support zone while sellers cap rallies at overhead resistance. Choose the entry zone that offers tight invalidation and favorable reward-to-risk.',
    keyTakeaway:
      'Chasing breakouts right into overhead resistance destroys risk-to-reward; patience near support protects your downside.',
  },
  {
    id: 'mission-8',
    number: 8,
    title: 'Red Sea Flash Crash',
    subtitle: 'Respond to a sudden -12% geopolitical shock without blowing up your account',
    worldId: 'world-3',
    stageName: 'Fortitude Fortress',
    estimatedMinutes: 7,
    xpReward: 200,
    cashReward: 5500,
    unlocksBadge: 'Risk Guardian',
    icon: '🌊',
    storyGoal:
      'Breaking news triggers a sudden intraday selloff! Emotions run hot across social media. Choose the disciplined professional risk action rather than averaging down on leverage or freezing in panic.',
    keyTakeaway:
      'Amateur traders hope and average down into losing trades; professionals honor pre-set stop losses so they live to trade tomorrow.',
  },
  {
    id: 'mission-9',
    number: 9,
    title: 'Master Portfolio Architect',
    subtitle: 'Design a ₹1,00,000 multi-asset portfolio that survives a macro storm',
    worldId: 'world-3',
    stageName: 'Fortitude Fortress',
    estimatedMinutes: 8,
    xpReward: 220,
    cashReward: 6000,
    unlocksBadge: 'Portfolio Architect',
    icon: '🏛️',
    storyGoal:
      'Allocate 100% of ₹1,00,000 across Equities, Debt/Bonds, and Gold so your portfolio captures growth while keeping worst-case crash drawdown at or below 20%.',
    keyTakeaway:
      'Diversification across negatively or weakly correlated assets is the only free lunch in finance.',
  },
  {
    id: 'mission-10',
    number: 10,
    title: 'Company Forensics Finale',
    subtitle: 'Audit three Indian companies and crown the true long-term compounder',
    worldId: 'world-3',
    stageName: 'Fortitude Fortress',
    estimatedMinutes: 8,
    xpReward: 250,
    cashReward: 7500,
    unlocksBadge: 'Dalal Street Master',
    icon: '🏆',
    storyGoal:
      'Compare Company Alpha (flashy hype, heavy debt), Company Beta (stagnant margins), and Company Gamma (22% ROE, zero net debt, strong cash flow) to select the true wealth creator.',
    keyTakeaway:
      'High Return on Equity backed by clean balance sheets and real cash flows separates enduring blue-chips from speculative traps.',
  },
];
