export interface CrashWaveChoice {
  id: string;
  label: string;
  description: string;
  portfolioAction: string;
  immediatePnLImpact: number;
  disciplineScoreChange: number;
  explanation: string;
}

export interface CrashWave {
  waveNumber: number;
  title: string;
  niftyShockPercent: number;
  triggerEvent: string;
  marketNews: string;
  choices: CrashWaveChoice[];
}

export interface CrashScenario {
  initialPortfolioValue: number;
  initialCash: number;
  debriefSummary: string;
  waves: CrashWave[];
}

export const CRASH_SCENARIO: CrashScenario = {
  initialPortfolioValue: 100000,
  initialCash: 25000,
  debriefSummary:
    'You navigated a multi-stage Black Swan market cascade! Notice how honoring stop losses on weak positions, avoiding leveraged averaging down, and rebalancing calmly preserved your compounding power.',
  waves: [
    {
      waveNumber: 1,
      title: 'Wave 1: Sudden Global Liquidity Shock',
      niftyShockPercent: -4.2,
      triggerEvent: 'Unexpected emergency central bank rate hike sparks global FII selloff at 9:15 AM IST.',
      marketNews: 'BREAKING: NIFTY gaps down 950 points at open; high-beta midcaps fall 7% in minutes.',
      choices: [
        {
          id: 'w1-c1',
          label: 'Audit Stops & Trim Speculative High-Beta Names',
          description: 'Honor pre-set stop losses on leveraged/speculative trades while holding debt-free core compounders.',
          portfolioAction: 'TRIM_HIGH_BETA',
          immediatePnLImpact: -3200,
          disciplineScoreChange: 15,
          explanation:
            'Cutting weak speculative positions early limits drawdown and raises cash before liquidity dries up.',
        },
        {
          id: 'w1-c2',
          label: 'Double Down on 3x Intraday Margin',
          description: 'Borrow broker margin to buy falling midcaps hoping for an instant V-shaped bounce.',
          portfolioAction: 'LEVERAGE_AVERAGE_DOWN',
          immediatePnLImpact: -14500,
          disciplineScoreChange: -25,
          explanation:
            'Catching a falling knife with borrowed leverage during Wave 1 magnifies losses when institutional selling continues.',
        },
        {
          id: 'w1-c3',
          label: 'Panic Liquidate 100% of Core Portfolio at Market Open',
          description: 'Dump every stock indiscriminately into the opening gap-down auction.',
          portfolioAction: 'PANIC_SELL_ALL',
          immediatePnLImpact: -7800,
          disciplineScoreChange: -15,
          explanation:
            'Selling into an emotional opening gap locks in terrible slippage and abandons quality businesses.',
        },
      ],
    },
    {
      waveNumber: 2,
      title: 'Wave 2: Margin Call Cascade',
      niftyShockPercent: -7.8,
      triggerEvent: 'Brokerages trigger automated forced liquidations on over-leveraged retail accounts.',
      marketNews: 'ALERT: India VIX surges +48%; social media channels flood with panic headlines.',
      choices: [
        {
          id: 'w2-c1',
          label: 'Hold Cash Buffer & Hedge with Gold/Liquid Bees',
          description: 'Stay calm, keep your cash reserve intact, and let forced margin sellers exhaust themselves.',
          portfolioAction: 'HOLD_HEDGED_BUFFER',
          immediatePnLImpact: -2400,
          disciplineScoreChange: 15,
          explanation:
            'Patience during forced liquidation waves protects both financial capital and mental clarity.',
        },
        {
          id: 'w2-c2',
          label: 'Revenge Trade F&O Weekly Options to Recover Losses',
          description: 'Buy out-of-the-money speculative options to win back Wave 1 losses in 30 minutes.',
          portfolioAction: 'LEVERAGE_AVERAGE_DOWN',
          immediatePnLImpact: -18000,
          disciplineScoreChange: -30,
          explanation:
            'When VIX spikes +48%, option premiums are wildly inflated; revenge trading accelerates account destruction.',
        },
        {
          id: 'w2-c3',
          label: 'Follow Rumor Group Tips into Penny Stocks',
          description: 'Rotate remaining cash into unverified "circuit-breaker" tips.',
          portfolioAction: 'FOMO_PENNY_TIPS',
          immediatePnLImpact: -11000,
          disciplineScoreChange: -20,
          explanation:
            'Illiquid penny stocks hit lower circuits during crises, trapping your capital with zero exit liquidity.',
        },
      ],
    },
    {
      waveNumber: 3,
      title: 'Wave 3: Capitulation Climax & Circuit Test',
      niftyShockPercent: -11.5,
      triggerEvent: 'Blue-chip Nifty leaders trade at 3-year valuation lows on record capitulation volume.',
      marketNews: 'DATA: Domestic Institutional Investors (DIIs) step in with ₹14,000 Cr net buying near 200-WMA.',
      choices: [
        {
          id: 'w3-c1',
          label: 'Deploy Staggered Tranche into Debt-Free Nifty Leaders',
          description: 'Invest 30% of idle cash systematically into high-ROE blue-chips with strict risk sizing.',
          portfolioAction: 'STAGGERED_QUALITY_BUY',
          immediatePnLImpact: 6800,
          disciplineScoreChange: 15,
          explanation:
            'Staggered accumulation of fortress balance sheets during institutional absorption builds generational returns.',
        },
        {
          id: 'w3-c2',
          label: 'Sell Remaining Holdings at the Exact Capitulation Bottom',
          description: 'Give up completely because headlines claim the market will never recover.',
          portfolioAction: 'CAPITULATE_BOTTOM',
          immediatePnLImpact: -9500,
          disciplineScoreChange: -20,
          explanation:
            'Capitulating after an 11.5% drop converts temporary mark-to-market volatility into permanent capital loss.',
        },
      ],
    },
    {
      waveNumber: 4,
      title: 'Wave 4: Stabilisation & Relief Rally',
      niftyShockPercent: 5.4,
      triggerEvent: 'Credit markets calm and NIFTY stages a broad institutional accumulation follow-through day.',
      marketNews: 'UPDATE: Breadth thrust 4:1 positive; banking and IT heavyweights reclaim 20-DMA.',
      choices: [
        {
          id: 'w4-c1',
          label: 'Rebalance Portfolio Weights & Trail Protective Stops',
          description: 'Lock in balanced sector weights and trail stop losses up to breakeven.',
          portfolioAction: 'DISCIPLINED_REBALANCE',
          immediatePnLImpact: 8400,
          disciplineScoreChange: 15,
          explanation:
            'Systematic rebalancing and trailing stops let winners compound while keeping risk tightly controlled.',
        },
        {
          id: 'w4-c2',
          label: 'FOMO All-In at Overbought Intraday Spike',
          description: 'Chase the +5.4% gap-up with 100% concentration in a single stock.',
          portfolioAction: 'FOMO_CHASE',
          immediatePnLImpact: -4200,
          disciplineScoreChange: -15,
          explanation:
            'Abandoning diversification right after a relief spike exposes you to normal post-rally pullbacks.',
        },
      ],
    },
  ],
};
