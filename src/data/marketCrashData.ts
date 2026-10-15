export interface CrashWave {
  waveNumber: number;
  title: string;
  triggerEvent: string;
  niftyShockPercent: number; // e.g. -4.5%
  marketNews: string;
  panicLevel: 'ELEVATED' | 'HIGH' | 'EXTREME PANIC' | 'CAPITULATION';
  choices: {
    id: string;
    label: string;
    description: string;
    portfolioAction: 'PANIC_SELL_ALL' | 'HOLD_DISCIPLINE' | 'BUY_QUALITY_DIP' | 'REBALANCE_DEFENSIVE' | 'LEVERAGE_AVERAGE_DOWN';
    immediatePnLImpact: number; // in virtual rupees or %
    disciplineScoreChange: number;
    psychologyScoreChange: number;
    explanation: string;
  }[];
}

export const CRASH_SCENARIO: {
  scenarioTitle: string;
  initialPortfolioValue: number;
  initialCash: number;
  waves: CrashWave[];
  finalRecoveryPercent: number;
  debriefSummary: string;
} = {
  scenarioTitle: 'The Black Swan Flash Crash Simulation',
  initialPortfolioValue: 100000,
  initialCash: 25000,
  waves: [
    {
      waveNumber: 1,
      title: 'Wave 1: The Global Shock & Gap Down',
      triggerEvent: 'Global central banks unexpectedly hike rates by 75bps + crude oil surges 12%.',
      niftyShockPercent: -3.8,
      marketNews: 'BREAKING: NIFTY opens 850 points lower. High-beta and over-leveraged retail traders facing margin calls.',
      panicLevel: 'ELEVATED',
      choices: [
        {
          id: 'w1-c1',
          label: 'Panic Sell Everything at Market Open',
          description: 'Dump all equity holdings immediately at the bottom of the opening gap.',
          portfolioAction: 'PANIC_SELL_ALL',
          immediatePnLImpact: -8500,
          disciplineScoreChange: -20,
          psychologyScoreChange: -25,
          explanation: 'Panic selling into opening gaps locks in maximum losses at peak emotional terror. Never make impulsive decisions at 9:15 AM market opening bell.'
        },
        {
          id: 'w1-c2',
          label: 'Hold Quality Blue-Chips & Review Stop-Losses',
          description: 'Take a deep breath. Check predetermined trailing stop losses; hold fundamentally strong debt-free businesses.',
          portfolioAction: 'HOLD_DISCIPLINE',
          immediatePnLImpact: -3800,
          disciplineScoreChange: +15,
          psychologyScoreChange: +15,
          explanation: 'Excellent discipline! Market shocks cause temporary paper drawdowns, but quality balance sheets recover. You preserved your capital allocation.'
        },
        {
          id: 'w1-c3',
          label: 'Rebalance into Defensive FMCG & IT',
          description: 'Trim cyclical high-beta stocks and rotate into defensive dividend compounders.',
          portfolioAction: 'REBALANCE_DEFENSIVE',
          immediatePnLImpact: -2100,
          disciplineScoreChange: +20,
          psychologyScoreChange: +20,
          explanation: 'Smart tactical rotation. Defensive sectors with inelastic consumer demand cushion portfolio volatility during macroeconomic turbulence.'
        }
      ]
    },
    {
      waveNumber: 2,
      title: 'Wave 2: FII Outflow Avalanche & Rumor Mill',
      triggerEvent: 'Foreign Institutional Investors (FIIs) net sell ₹8,200 Cr in single day. Social media fills with catastrophic crash predictions.',
      niftyShockPercent: -6.2,
      marketNews: 'CRASH INTENSIFIES: TV analysts shouting "Cash is King! Nifty going to zero!". Retail sentiment hits rock bottom.',
      panicLevel: 'EXTREME PANIC',
      choices: [
        {
          id: 'w2-c1',
          label: 'Double Down with 5x Borrowed Leverage (Revenge Trade)',
          description: 'Borrow money to average down on crashing smallcaps to recover losses fast.',
          portfolioAction: 'LEVERAGE_AVERAGE_DOWN',
          immediatePnLImpact: -18000,
          disciplineScoreChange: -40,
          psychologyScoreChange: -35,
          explanation: 'Disastrous mistake! Catching a falling knife with leverage is the #1 cause of retail capital destruction. Never average down on losing trades with margin!'
        },
        {
          id: 'w2-c2',
          label: 'Staggered SIP Buy on High ROCE Compounders (Value Shopping)',
          description: 'Deploy 30% of your idle cash reserves into marquee companies (TCS, Reliance, HDFC) trading at 2-year valuation lows.',
          portfolioAction: 'BUY_QUALITY_DIP',
          immediatePnLImpact: +4500,
          disciplineScoreChange: +25,
          psychologyScoreChange: +30,
          explanation: 'Warren Buffett & Rakesh Jhunjhunwala rule: "Be greedy when others are fearful." Buying quality earnings at depressed valuations is how enduring wealth is built.'
        },
        {
          id: 'w2-c3',
          label: 'Hold Tight & Maintain Cash Buffers',
          description: 'Do not panic sell; keep 20% cash dry powder ready for the volatility trough.',
          portfolioAction: 'HOLD_DISCIPLINE',
          immediatePnLImpact: -4900,
          disciplineScoreChange: +15,
          psychologyScoreChange: +20,
          explanation: 'Steadfast emotional control. Drawdowns are the admission price for equity market returns. Emotional resilience beats frantic clicking.'
        }
      ]
    },
    {
      waveNumber: 3,
      title: 'Wave 3: The Capitulation & V-Shaped Reversal',
      triggerEvent: 'Weak hands have completely exited. Domestic Institutions (DIIs) step in with record ₹12,000 Cr buying; RBI announces liquidity measures.',
      niftyShockPercent: +7.8,
      marketNews: 'HISTORIC BOUNCE: Markets stage dramatic +1,200 point intraday recovery rally. Short sellers caught in violent squeeze.',
      panicLevel: 'CAPITULATION',
      choices: [
        {
          id: 'w3-c1',
          label: 'Ride the Quality Recovery Wave & Rebalance Portfolio',
          description: 'Let your disciplined positions compound back up; trim non-performers and hold winning leaders.',
          portfolioAction: 'REBALANCE_DEFENSIVE',
          immediatePnLImpact: +11200,
          disciplineScoreChange: +30,
          psychologyScoreChange: +30,
          explanation: 'Masterful execution! You survived the storm by avoiding panic selling and taking calculated risk when blood was on the streets.'
        },
        {
          id: 'w3-c2',
          label: 'FOMO Chase After +8% Rally with Market Orders',
          description: 'Jump back in after selling at the bottom because you fear missing out on the rally.',
          portfolioAction: 'PANIC_SELL_ALL',
          immediatePnLImpact: -4500,
          disciplineScoreChange: -25,
          psychologyScoreChange: -30,
          explanation: 'The classic retail trap: "Sell low in fear, Buy high in greed". True market masters have a plan before the candle moves.'
        }
      ]
    }
  ],
  finalRecoveryPercent: 12.4,
  debriefSummary: 'In the stock market, volatility is not risk — permanent loss of capital is. Survival requires emotional fortitude, asset allocation, and avoiding high leverage.'
};
