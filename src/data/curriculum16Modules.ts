import { EducationalGameId } from '../types';

export type CurriculumLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type ContextualVisualizerKind =
  | 'OWNERSHIP_VALUE_CALC'
  | 'SETTLEMENT_ECOSYSTEM_FLOW'
  | 'INDEX_BENCHMARK_EXPLORER'
  | 'ORDER_BOOK_SLIPPAGE'
  | 'INVESTING_VS_TRADING_HORIZON'
  | 'BALANCE_SHEET_CASHFLOW'
  | 'FINANCIAL_RATIOS_LAB'
  | 'DCF_DDM_VALUATION'
  | 'MACRO_SECTOR_SENSITIVITY'
  | 'CANDLESTICK_ANATOMY_COMPARE'
  | 'SUPPORT_RESISTANCE_ZONES'
  | 'INDICATOR_OVERLAY_LAB'
  | 'MARKET_STRUCTURE_BOS_CHOCH'
  | 'PRICE_OI_PARTICIPATION_MATRIX'
  | 'OPTIONS_PAYOFF_GREEKS'
  | 'POSITION_SIZING_EXPECTANCY';

export interface LessonFormula {
  label: string;
  expression: string;
  note: string;
}

export interface LessonTable {
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface ModuleLesson {
  id: string;
  title: string;
  estimatedMinutes: number;
  summary: string;
  paragraphs: string[];
  indianExample: string;
  keyPoints: string[];
  formulas?: LessonFormula[];
  table?: LessonTable;
  caveatNote?: string;
  supplementaryNote?: string;
  visualizer?: {
    kind: ContextualVisualizerKind;
    title: string;
    caption: string;
  };
}

export interface ModuleInteractiveExercise {
  id: string;
  title: string;
  scenario: string;
  prompt: string;
  options: {
    id: string;
    label: string;
    feedback: string;
    isCorrect: boolean;
  }[];
}

export interface ModuleQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CurriculumModule {
  id: string;
  number: number;
  level: CurriculumLevel;
  levelBadge: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  xpReward: number;
  learningObjectives: string[];
  lessons: ModuleLesson[];
  exercise: ModuleInteractiveExercise;
  practicalTask: {
    title: string;
    instructions: string;
    targetSymbol?: string;
    relatedGameId?: EducationalGameId;
    relatedGameTitle?: string;
  };
  quiz: ModuleQuizQuestion[];
}

export interface StudyWeekPlan {
  week: number;
  level: CurriculumLevel;
  focusModules: string[];
  goal: string;
  practiceTask: string;
}

export interface GlossaryEntry {
  term: string;
  category: 'Market Structure' | 'Fundamental' | 'Technical' | 'Derivatives' | 'Risk';
  definition: string;
}

export interface OfficialResourceLink {
  name: string;
  authority: string;
  purpose: string;
  url: string;
}

export const CURRICULUM_16_MODULES: CurriculumModule[] = [
  // =========================================================================
  // LEVEL 1: BEGINNER — HOW THE MARKET WORKS (MODULES 1–5)
  // =========================================================================
  {
    id: 'module-1',
    number: 1,
    level: 'Beginner',
    levelBadge: 'Level 1 • Beginner',
    title: 'What Is the Stock Market?',
    subtitle: 'Fractional business ownership, capital formation, primary vs secondary markets, and price vs value.',
    estimatedMinutes: 18,
    xpReward: 120,
    learningObjectives: [
      'Understand a share (equity) as legal fractional ownership in an operating business, not a lottery ticker.',
      'Distinguish between the Primary Market (IPOs/FPOs raising capital) and Secondary Market (investor-to-investor liquidity on NSE/BSE).',
      'Separate short-term market price driven by supply-demand orders from intrinsic business value driven by cash flows.',
    ],
    lessons: [
      {
        id: 'm1-lesson-1',
        title: '1.1 Shares as Fractional Ownership & Why Companies List',
        estimatedMinutes: 6,
        summary: 'A stock represents proportionate ownership in a company’s assets, earnings, and voting rights.',
        paragraphs: [
          'When an Indian business needs long-term capital to build factories, expand digital infrastructure, or retire debt without taking fixed-interest bank loans, it can issue equity shares to the public.',
          'If a company has 10 crore total shares outstanding and you own 1,000 shares, you own 0.001% of that enterprise. As a shareholder, you participate in residual profits via dividends and long-term earnings growth, while bearing business risk if profits decline.',
        ],
        indianExample: 'If TCS or Reliance Industries earns higher free cash flow over a decade, shareholders benefit through compounding business value and dividends declared in ₹ per share.',
        keyPoints: [
          'Equity = residual claim on assets and earnings after liabilities and creditors are paid.',
          'Companies raise capital in the Primary Market (IPO); investors trade existing shares in the Secondary Market.',
          'Shareholders enjoy limited liability: you cannot lose more than the capital invested in fully paid equity shares.',
        ],
        formulas: [
          {
            label: 'Ownership Stake (%)',
            expression: '(Shares Owned / Total Outstanding Shares) × 100',
            note: 'Market Capitalisation = Current Share Price × Total Outstanding Shares.',
          },
        ],
        visualizer: {
          kind: 'OWNERSHIP_VALUE_CALC',
          title: 'Interactive Share Ownership & Price-vs-Value Explorer',
          caption: 'Adjust share price, earnings per share, and shares held to see how market cap and ownership stake respond.',
        },
      },
      {
        id: 'm1-lesson-2',
        title: '1.2 Primary vs Secondary Market & Price vs Intrinsic Value',
        estimatedMinutes: 6,
        summary: 'Why prices move every second during market hours even when factory output has not changed.',
        paragraphs: [
          'In an Initial Public Offering (IPO), money flows from investors to the company (or selling promoters in an Offer for Sale). Once listed on NSE and BSE, daily trading occurs between buyers and sellers in the secondary market.',
          'Every second between 09:15 IST and 15:30 IST, share prices move because urgent buy orders meet resting sell orders in the electronic order book. Over weeks, sentiment, news, and liquidity move price; over years, earnings and cash generation anchor value.',
        ],
        indianExample: 'During a sudden global risk-off day, an Indian IT or banking leader may fall 4% in a morning even though its 5-year client contracts remain intact.',
        keyPoints: [
          'Primary Market = capital raising (IPO, FPO, Rights Issue).',
          'Secondary Market = continuous price discovery and exit liquidity on NSE/BSE.',
          'Price is what you pay in the order book today; value is what the business earns over time.',
        ],
      },
    ],
    exercise: {
      id: 'm1-ex-1',
      title: 'Primary vs Secondary Cash Flow Check',
      scenario: 'Ananya buys 25 shares of HDFC Bank at ₹1,690 on NSE through her broker app on a Tuesday morning.',
      prompt: 'Where does Ananya’s ₹42,250 payment go upon settlement?',
      options: [
        {
          id: 'a',
          label: 'Directly into HDFC Bank’s corporate treasury account to fund new branches',
          feedback: 'Not in a secondary-market trade. Companies receive capital during primary issuances (IPO/Rights/QIP), not routine NSE trades.',
          isCorrect: false,
        },
        {
          id: 'b',
          label: 'Through the clearing corporation to the counterparty seller who sold those 25 shares',
          feedback: 'Correct! Secondary-market trades transfer ownership between investors via clearing corporations.',
          isCorrect: true,
        },
        {
          id: 'c',
          label: 'To SEBI as a refundable security deposit',
          feedback: 'Incorrect. SEBI is the statutory market regulator, not the counterparty to equity trades.',
          isCorrect: false,
        },
      ],
    },
    practicalTask: {
      title: 'Inspect an Equity Quote vs Market Cap',
      instructions: 'Open the Trade Terminal in Equity mode, select RELIANCE or TCS, and compare its Last Price with its Market Cap (₹ Cr) and 52-week High/Low.',
      targetSymbol: 'RELIANCE',
      relatedGameId: 'fundamental-analysis-challenge',
      relatedGameTitle: 'Fundamental Analysis Challenge',
    },
    quiz: [
      {
        id: 'm1-q1',
        question: 'What does owning 100 equity shares of an NSE-listed company represent?',
        options: [
          'A guaranteed 12% annual fixed interest bond from the company',
          'Fractional ownership in the company with a claim on residual earnings and voting rights',
          'A risk-free deposit insured by RBI',
          'Ownership of the NSE exchange building',
        ],
        correctIndex: 1,
        explanation: 'Equity shares represent proportionate ownership in the company, carrying voting rights and participation in profits/losses without fixed return guarantees.',
      },
      {
        id: 'm1-q2',
        question: 'Which statement accurately distinguishes Market Price from Intrinsic Value?',
        options: [
          'Market price and intrinsic value are always identical every minute',
          'Market price reflects current order-book supply and demand, whereas intrinsic value depends on underlying cash flows and business quality',
          'Intrinsic value is set every morning at 09:00 IST by SEBI',
          'Market price only changes once per quarter after board meetings',
        ],
        correctIndex: 1,
        explanation: 'Order-book supply and demand set the real-time market price, which can swing above or below long-term intrinsic value.',
      },
    ],
  },

  {
    id: 'module-2',
    number: 2,
    level: 'Beginner',
    levelBadge: 'Level 1 • Beginner',
    title: "India's Stock Market Structure",
    subtitle: 'NSE, BSE, SEBI, CDSL/NSDL depositories, clearing corporations, brokers, and T+1 settlement.',
    estimatedMinutes: 20,
    xpReward: 120,
    learningObjectives: [
      'Map the four-account Indian investor setup: Bank Account, Trading Account, Demat Account, and Exchange/Clearing layer.',
      'Understand the distinct statutory roles of SEBI, NSE/BSE, Clearing Corporations (NCL/ICCL), and Depositories (NSDL/CDSL).',
      'Trace India’s T+1 rolling settlement cycle from order execution to Demat credit.',
    ],
    lessons: [
      {
        id: 'm2-lesson-1',
        title: '2.1 SEBI, NSE, BSE & Clearing Corporations',
        estimatedMinutes: 10,
        summary: 'Why Indian retail trades execute safely without knowing the person on the other side.',
        paragraphs: [
          'India’s securities ecosystem separates trading, custody, banking, and regulation so no single intermediary can misuse investor assets. SEBI (Securities and Exchange Board of India) regulates exchanges, brokers, mutual funds, and listed disclosures.',
          'NSE (National Stock Exchange) and BSE (Bombay Stock Exchange) operate nationwide electronic limit-order books. Once a trade matches, Clearing Corporations (NSE Clearing Ltd / ICCL) step in through novation—becoming the legal buyer to every seller and seller to every buyer to eliminate counterparty default risk.',
        ],
        indianExample: 'Even if a seller’s broker faces financial trouble after your trade matches on NSE, NSE Clearing guarantees settlement of your shares or funds under T+1 rules.',
        keyPoints: [
          'SEBI: Investor protection, margin/pledge rules, insider-trading enforcement, disclosure norms.',
          'NSE & BSE: Anonymous electronic order-matching engines.',
          'Clearing Corporations: Novation, margin collection, and guaranteed T+1 settlement.',
        ],
        visualizer: {
          kind: 'SETTLEMENT_ECOSYSTEM_FLOW',
          title: 'Interactive Indian Market Plumbing & T+1 Settlement Tracer',
          caption: 'Click each stage from Order Placement (T Day) to Demat Credit (T+1) to see how Bank, Broker, Exchange, Clearing Corp, and CDSL/NSDL interact.',
        },
      },
      {
        id: 'm2-lesson-2',
        title: '2.2 Trading vs Demat Accounts (NSDL/CDSL) & T+1 Settlement',
        estimatedMinutes: 10,
        summary: 'Your broker facilitates orders, while NSDL or CDSL holds your electronic share certificates.',
        paragraphs: [
          'A Trading Account (with a SEBI-registered stockbroker) places orders on NSE/BSE. A Demat Account (maintained at NSDL or CDSL via a Depository Participant) holds your shares in electronic book-entry form.',
          'Under India’s T+1 rolling settlement cycle, if you buy delivery shares on Monday (Trade Day = T), cash is settled and shares are credited to your Demat account on Tuesday (T+1 working day). Shares cannot be lent or pledged by a broker without explicit OTP-authenticated pledge consent.',
        ],
        indianExample: 'If you close your broker app tomorrow, your delivery shares remain safely recorded under your PAN and BO ID/Client ID at CDSL or NSDL.',
        keyPoints: [
          'Bank Account holds ₹ cash; Trading Account routes orders; Demat Account (CDSL/NSDL) stores securities.',
          'T+1 Settlement: Trade on T, final securities & funds obligation completed on T+1.',
          'Market Hours (Cash & F&O): Pre-open 09:00–09:15 IST; Continuous trading 09:15–15:30 IST (Mon–Fri, excluding exchange holidays).',
        ],
      },
    ],
    exercise: {
      id: 'm2-ex-1',
      title: 'Custody & T+1 Settlement Verification',
      scenario: 'Rohan buys 10 delivery shares of Infosys on Wednesday at 11:20 IST on NSE (Thursday is a normal working day).',
      prompt: 'Where are Rohan’s shares stored and when does final settlement occur?',
      options: [
        {
          id: 'a',
          label: 'Stored inside the broker’s private database on T+5',
          feedback: 'Incorrect. Brokers do not hold custody of delivery shares, and India moved to T+1 settlement.',
          isCorrect: false,
        },
        {
          id: 'b',
          label: 'Credited to Rohan’s NSDL or CDSL Demat account on Thursday (T+1)',
          feedback: 'Correct! Depositories (NSDL/CDSL) hold electronic shares and India settles equity delivery on T+1.',
          isCorrect: true,
        },
        {
          id: 'c',
          label: 'Paper certificates mailed by RBI within 30 days',
          feedback: 'Incorrect. Listed Indian equities trade in dematerialised electronic form.',
          isCorrect: false,
        },
      ],
    },
    practicalTask: {
      title: 'Check Market Session Status',
      instructions: 'Visit the Trade Terminal header to observe whether NSE/BSE regular market hours (09:15–15:30 IST) are currently open or closed, and note the data source status badge.',
      targetSymbol: 'INFY',
    },
    quiz: [
      {
        id: 'm2-q1',
        question: 'Which two institutions serve as central securities depositories in India?',
        options: [
          'NSE and BSE',
          'NSDL and CDSL',
          'RBI and IRDAI',
          'AMFI and NPCI',
        ],
        correctIndex: 1,
        explanation: 'National Securities Depository Limited (NSDL) and Central Depository Services Limited (CDSL) hold dematerialised securities in India.',
      },
      {
        id: 'm2-q2',
        question: 'What is the role of the Clearing Corporation after a buy and sell order match on NSE?',
        options: [
          'It recommends which stocks retail investors should buy next',
          'It acts as central counterparty via novation and guarantees T+1 settlement of funds and shares',
          'It sets corporate dividend payouts',
          'It audits company factory inventory',
        ],
        correctIndex: 1,
        explanation: 'Clearing corporations eliminate bilateral counterparty risk by guaranteeing settlement between clearing members.',
      },
    ],
  },

  {
    id: 'module-3',
    number: 3,
    level: 'Beginner',
    levelBadge: 'Level 1 • Beginner',
    title: 'Important Indian Market Indices',
    subtitle: 'NIFTY 50, SENSEX, NIFTY Bank, sectoral & mid/small-cap indices, and free-float market capitalisation.',
    estimatedMinutes: 18,
    xpReward: 120,
    learningObjectives: [
      'Explain how NIFTY 50 and BSE SENSEX are constructed using free-float market capitalisation.',
      'Understand why an index cannot be bought directly like a single share, and how Index Funds/ETFs or Index Derivatives reference it.',
      'Use broad and sectoral indices (NIFTY Bank, NIFTY IT, Midcap) as market benchmarks.',
    ],
    lessons: [
      {
        id: 'm3-lesson-1',
        title: '3.1 NIFTY 50, SENSEX & Free-Float Weighting',
        estimatedMinutes: 9,
        summary: 'Why promoter-locked shares are excluded when calculating index weights.',
        paragraphs: [
          'A market index tracks a rules-based basket of stocks to measure overall market or sector performance. BSE SENSEX tracks 30 large, liquid companies on BSE, while NIFTY 50 tracks 50 large, liquid companies across key sectors on NSE.',
          'Indian headline indices use Free-Float Market Capitalisation: only shares readily available for public trading (excluding promoter holdings, government lock-ins, and strategic cross-holdings) count toward an index constituent’s weight.',
        ],
        indianExample: 'If Company A has ₹5,00,000 Cr total market cap with 75% promoter holding, its free-float market cap is ₹1,25,000 Cr. A bank with ₹4,00,000 Cr market cap and 100% public float has ₹4,00,000 Cr free-float weight—more than 3× Company A’s index weight!',
        keyPoints: [
          'Free-Float Market Cap = Price × (Total Shares − Locked/Promoter Shares).',
          'NIFTY 50 (NSE, 50 stocks) and SENSEX (BSE, 30 stocks) represent India’s large-cap core.',
          'Sectoral indices (NIFTY Bank, NIFTY IT, NIFTY Pharma, NIFTY Auto) isolate industry trends.',
        ],
        formulas: [
          {
            label: 'Free-Float Market Cap',
            expression: 'Share Price × Total Shares × Free-Float Factor (IWF)',
            note: 'Investable Weight Factor (IWF) ranges from 0 to 1 based on non-promoter public shareholding.',
          },
        ],
        visualizer: {
          kind: 'INDEX_BENCHMARK_EXPLORER',
          title: 'Free-Float Index Weight Simulator',
          caption: 'Compare Total Market Cap vs Free-Float Index Weight when promoter holding changes.',
        },
      },
      {
        id: 'm3-lesson-2',
        title: '3.2 Benchmarking & How Investors Access Indices',
        estimatedMinutes: 9,
        summary: 'Indices are mathematical benchmarks—investors access them via Index Funds/ETFs or F&O contracts.',
        paragraphs: [
          'You cannot place a cash equity delivery order to buy “1 share of NIFTY 50” because an index is a calculated number, not a company security.',
          'Long-term investors gain index exposure through low-cost Index Mutual Funds or Exchange-Traded Funds (ETFs) such as NIFTYBEES or BANKBEES, which hold the underlying basket in exact index weights. Experienced derivatives participants use exchange-traded Index Futures and Index Options (covered in Module 15) for hedging or directional views.',
        ],
        indianExample: 'If your stock portfolio returned +11% in a year while NIFTY 50 Total Return Index (TRI) returned +15%, your active stock selection underperformed the passive benchmark by 4 percentage points.',
        keyPoints: [
          'Always compare portfolio performance against an appropriate benchmark (e.g., NIFTY 50 TRI for large-caps).',
          'Cash market access to an index = Index ETFs (e.g., NIFTYBEES) or Index Mutual Funds.',
          'Derivatives access = NIFTY / BANKNIFTY / SENSEX Futures & Options in fixed lot sizes.',
        ],
      },
    ],
    exercise: {
      id: 'm3-ex-1',
      title: 'Free-Float Weighting Puzzle',
      scenario: 'Firm Alpha has a ₹2,00,000 Cr market cap with 70% promoter ownership. Firm Beta has a ₹1,20,000 Cr market cap with 0% promoter holding (100% public float).',
      prompt: 'Which firm carries a larger weight in a free-float weighted index like NIFTY 50?',
      options: [
        {
          id: 'a',
          label: 'Firm Alpha (₹60,000 Cr free float)',
          feedback: 'Check the math: 30% public float of ₹2,00,000 Cr is ₹60,000 Cr, which is smaller than Firm Beta’s ₹1,20,000 Cr public float.',
          isCorrect: false,
        },
        {
          id: 'b',
          label: 'Firm Beta (₹1,20,000 Cr free float)',
          feedback: 'Correct! Firm Beta’s free-float market cap is ₹1,20,000 Cr vs Firm Alpha’s ₹60,000 Cr, giving Beta twice the index weight.',
          isCorrect: true,
        },
        {
          id: 'c',
          label: 'Both carry equal weight because NIFTY 50 is price-weighted',
          feedback: 'Incorrect. NIFTY 50 and SENSEX are free-float market-cap weighted, not price-weighted.',
          isCorrect: false,
        },
      ],
    },
    practicalTask: {
      title: 'Compare NIFTY 50 & NIFTY Bank in Index Mode',
      instructions: 'Open Trade Terminal → switch to Index Paper Trading mode → inspect NIFTY 50, NIFTY Bank, and SENSEX charts, and see how ETFs vs Index Options work.',
      targetSymbol: 'NIFTY',
    },
    quiz: [
      {
        id: 'm3-q1',
        question: 'Why can you not buy “NIFTY 50” directly as an ordinary equity share in your Demat account?',
        options: [
          'Because SEBI banned retail investors from tracking indices',
          'Because an index is a mathematical benchmark; investors use Index ETFs/Index Funds for cash exposure or F&O contracts for derivatives',
          'Because NIFTY 50 only trades on Sundays',
          'Because only foreign institutions can view NIFTY 50',
        ],
        correctIndex: 1,
        explanation: 'An index is a statistical benchmark, not an issued share. Cash investors buy Index ETFs (like NIFTYBEES) or Index Funds.',
      },
      {
        id: 'm3-q2',
        question: 'Free-float market capitalisation excludes which of the following?',
        options: [
          'Retail public shareholdings',
          'Mutual fund shareholdings',
          'Locked-in promoter and strategic government holdings not available for routine public trading',
          'Shares traded on NSE',
        ],
        correctIndex: 2,
        explanation: 'Free-float methodology counts only publicly tradable shares, excluding promoter and locked-in strategic holdings.',
      },
    ],
  },

  {
    id: 'module-4',
    number: 4,
    level: 'Beginner',
    levelBadge: 'Level 1 • Beginner',
    title: 'How a Stock Trade Works',
    subtitle: 'Bid, ask, bid-ask spread, order book depth, market vs limit vs stop-loss orders, slippage, and statutory charges.',
    estimatedMinutes: 22,
    xpReward: 130,
    learningObjectives: [
      'Read a 5-level Bid/Ask order book and compute the Bid-Ask Spread.',
      'Choose appropriately between Market, Limit, Stop-Loss (SL), and Stop-Loss Market/Limit orders.',
      'Account for slippage, liquidity impact, and Indian statutory transaction costs (STT, exchange fees, SEBI charges, stamp duty, GST).',
    ],
    lessons: [
      {
        id: 'm4-lesson-1',
        title: '4.1 Bid, Ask, Spread & Electronic Order Matching',
        estimatedMinutes: 11,
        summary: 'Price-time priority and why illiquid stocks carry hidden execution costs.',
        paragraphs: [
          'In NSE/BSE’s continuous order book, the Bid is the highest price a buyer is currently willing to pay, and the Ask (Offer) is the lowest price a seller is willing to accept. The difference (Ask − Bid) is the Bid-Ask Spread.',
          'Exchanges match orders by Price-Time Priority: the best price executes first, and among orders at the exact same price, the order that arrived earliest executes first. In liquid NIFTY 50 stocks, spreads are often ₹0.05–₹0.10; in illiquid small-caps or far-OTM options, wide spreads cause heavy slippage.',
        ],
        indianExample: 'If a mid-cap stock has Best Bid ₹498.00 (qty 50) and Best Ask ₹500.00 (qty 40), a Market Buy for 200 shares sweeps ₹500.00 and higher ask levels—pushing your average fill above ₹500.',
        keyPoints: [
          'Bid = highest resting buy price; Ask/Offer = lowest resting sell price.',
          'Spread = Ask − Bid (tight spread = high liquidity; wide spread = high friction).',
          'Slippage = difference between expected screen price and actual average execution price across order book levels.',
        ],
        visualizer: {
          kind: 'ORDER_BOOK_SLIPPAGE',
          title: 'Order Book Depth & Market vs Limit Slippage Simulator',
          caption: 'Test how order size sweeps multiple Ask levels in a 5-level Indian order book and compare Market vs Limit execution.',
        },
      },
      {
        id: 'm4-lesson-2',
        title: '4.2 Order Types & Indian Statutory Transaction Costs',
        estimatedMinutes: 11,
        summary: 'Controlling execution price with Limit orders and factoring in STT, Stamp Duty, and Brokerage.',
        paragraphs: [
          'A Market Order prioritises immediate execution at whatever prices are available in the book. A Limit Order sets the maximum price you will pay (for a Buy) or minimum price you will accept (for a Sell)—guaranteeing price or better, though fill is not guaranteed if the market moves away.',
          'A Stop-Loss (SL / SL-L) order stays dormant until price hits a Trigger Price, helping cap downside losses. Every real trade in India also incurs statutory levies: Securities Transaction Tax (STT), Exchange Transaction Charges, SEBI Turnover Fees, State Stamp Duty, DP charges (on delivery sell), brokerage, and 18% GST on brokerage/exchange/SEBI fees.',
        ],
        indianExample: 'Frequent intraday scalping for tiny 0.15% moves often loses money net of STT, brokerage, GST, and bid-ask slippage even when gross trades look breakeven.',
        keyPoints: [
          'Market Order: Certainty of execution, uncertainty of exact fill price.',
          'Limit Order: Certainty of worst-case price, uncertainty of fill.',
          'Always evaluate Net Expectancy after STT, stamp duty, brokerage, GST, and slippage.',
        ],
      },
    ],
    exercise: {
      id: 'm4-ex-1',
      title: 'Choosing the Right Order Type',
      scenario: 'A thinly traded stock shows Last Traded Price ₹320, Best Bid ₹316, and Best Ask ₹325 (only 15 shares offered at ₹325, next Ask at ₹334). You want 100 shares but refuse to pay more than ₹322.',
      prompt: 'Which order should you submit?',
      options: [
        {
          id: 'a',
          label: 'Market Buy Order for 100 shares',
          feedback: 'Dangerous! A Market Buy will sweep ₹325, ₹334, and potentially higher levels—violating your ₹322 max price.',
          isCorrect: false,
        },
        {
          id: 'b',
          label: 'Limit Buy Order at ₹322.00 for 100 shares',
          feedback: 'Correct! A Limit Buy at ₹322 guarantees you will never pay above ₹322 per share, protecting you from wide-spread slippage.',
          isCorrect: true,
        },
        {
          id: 'c',
          label: 'Stop-Loss Sell Order at ₹310',
          feedback: 'Incorrect. You do not own the shares yet; a Limit Buy is needed for controlled entry.',
          isCorrect: false,
        },
      ],
    },
    practicalTask: {
      title: 'Practice Order Types in Paper Trading',
      instructions: 'Play the Trade Decision Simulator in Play, or place a simulated Limit Order with a defined rationale in the Trade Terminal.',
      targetSymbol: 'HDFCBANK',
      relatedGameId: 'trade-decision-simulator',
      relatedGameTitle: 'Trade Decision Simulator',
    },
    quiz: [
      {
        id: 'm4-q1',
        question: 'If Best Bid is ₹1,249.50 and Best Ask is ₹1,250.00, what happens on an immediate Market Buy order (assuming sufficient ask quantity)?',
        options: [
          'It fills at ₹1,249.50',
          'It fills at ₹1,250.00 (the lowest available Ask)',
          'It waits until market close at 15:30 IST',
          'It cancels automatically',
        ],
        correctIndex: 1,
        explanation: 'An incoming Market Buy crosses the spread and matches against the lowest resting Ask price (₹1,250.00).',
      },
      {
        id: 'm4-q2',
        question: 'What is execution slippage?',
        options: [
          'Annual dividend paid to shareholders',
          'The difference between the expected price at decision time and the actual average fill price',
          'The interest earned in a savings bank account',
          'A bonus share issue ratio',
        ],
        correctIndex: 1,
        explanation: 'Slippage occurs when fast price movement or thin order-book depth fills an order at a worse average price than expected.',
      },
    ],
  },

  {
    id: 'module-5',
    number: 5,
    level: 'Beginner',
    levelBadge: 'Level 1 • Beginner',
    title: 'Investing Versus Trading',
    subtitle: 'Time horizons, compounding, asset allocation, diversification, inflation, LTCG/STCG awareness, and emergency funds.',
    estimatedMinutes: 20,
    xpReward: 130,
    learningObjectives: [
      'Differentiate long-term fundamental investing from short-term technical/price-action trading.',
      'Build financial readiness first: emergency fund, health/term insurance, and avoiding high-interest debt or borrowed capital.',
      'Understand compounding, asset allocation across equity/debt/gold, and Indian tax Holding-Period distinction (STCG vs LTCG).',
    ],
    lessons: [
      {
        id: 'm5-lesson-1',
        title: '5.1 Time Horizons, Process Differences & Financial Prerequisites',
        estimatedMinutes: 10,
        summary: 'Why confusing a 2-day trade with a 5-year investment is one of the costliest market mistakes.',
        paragraphs: [
          'Investing focuses on multi-year business compounding—buying productive enterprises or broad index funds and letting earnings growth work over 5–15+ years. Trading focuses on shorter-term price swings (intraday, swing, positional) governed by strict stop-losses, position sizing, and expectancy.',
          'Before risking ₹1 in equities, build a 6-month Emergency Fund in liquid/FD instruments, secure adequate health/term insurance, and pay off high-cost consumer debt. Never trade or invest with borrowed money or funds needed for near-term tuition, rent, or family expenses.',
        ],
        indianExample: 'Turning a losing intraday trade into a “long-term investment” just to avoid booking a planned ₹1,500 stop-loss breaks risk rules and often locks capital in deteriorating stocks.',
        keyPoints: [
          'Never mix timeframes: define whether capital is long-term investment or rule-bound swing trade before entry.',
          'Prerequisites: 6-month liquid emergency reserve + zero high-interest personal loans.',
          'Inflation erodes idle cash purchasing power, which is why disciplined long-term asset allocation matters.',
        ],
        visualizer: {
          kind: 'INVESTING_VS_TRADING_HORIZON',
          title: 'Compounding vs Inflation Purchasing-Power Explorer',
          caption: 'Compare nominal ₹ value vs inflation-adjusted real purchasing power across horizons and asset mixes.',
        },
      },
      {
        id: 'm5-lesson-2',
        title: '5.2 Diversification, Rebalancing & Tax Holding Awareness',
        estimatedMinutes: 10,
        summary: 'Reducing unsystematic single-company blowup risk without diluting discipline.',
        paragraphs: [
          'Diversification spreads capital across uncorrelated sectors (e.g., Banking, IT, Pharma, Consumer, Industrials) and asset classes (Equity, Debt/G-Secs, Gold) so a single company governance shock or sector downturn cannot cripple your net worth.',
          'In India, equity taxation also depends on holding period and transaction type: intraday equity gains are treated as speculative business income, F&O as non-speculative business income, delivery equity held ≤ 12 months attracts Short-Term Capital Gains (STCG), and delivery held > 12 months qualifies as Long-Term Capital Gains (LTCG) subject to prevailing Finance Act thresholds and rates.',
        ],
        indianExample: 'Holding 4 IT stocks (TCS, Infosys, Wipro, HCL Tech) is four tickers in one sector—not genuine diversification if global tech spending slows simultaneously.',
        keyPoints: [
          'Sector concentration ≠ diversification; diversify across distinct economic drivers.',
          'Rebalance periodically when one asset class drifts far above your target risk allocation.',
          'Always verify current Finance Act STCG/LTCG rates and STT rules before calculating post-tax returns.',
        ],
      },
    ],
    exercise: {
      id: 'm5-ex-1',
      title: 'Capital Readiness & Horizon Check',
      scenario: 'Karan has ₹80,000 saved for his semester college fees due in 45 days and zero emergency savings. He wants to put all ₹80,000 into volatile mid-cap stocks.',
      prompt: 'What is the sound financial decision?',
      options: [
        {
          id: 'a',
          label: 'Put all ₹80,000 into mid-caps since 45 days is plenty of time for equities',
          feedback: 'Dangerous! Equities can easily draw down 15–25% over 45 days, jeopardising mandatory fee payments.',
          isCorrect: false,
        },
        {
          id: 'b',
          label: 'Keep mandatory 45-day tuition funds in safe liquid/bank instruments; only allocate long-horizon surplus capital to equities',
          feedback: 'Correct! Near-term liabilities and emergency funds should never be exposed to equity volatility.',
          isCorrect: true,
        },
        {
          id: 'c',
          label: 'Buy weekly out-of-the-money index options to double the fee money quickly',
          feedback: 'Extremely high risk of losing 100% of the tuition money.',
          isCorrect: false,
        },
      ],
    },
    practicalTask: {
      title: 'Construct a Balanced Multi-Asset Allocation',
      instructions: 'Launch the Portfolio Builder game in the Play section to test multi-sector and asset-class diversification across market regimes.',
      relatedGameId: 'portfolio-builder',
      relatedGameTitle: 'Portfolio Builder',
    },
    quiz: [
      {
        id: 'm5-q1',
        question: 'Why does holding 5 different mid-cap chemical stocks fail to protect against sector risk?',
        options: [
          'Because NSE allows a maximum of 3 stocks per Demat account',
          'Because all 5 firms share common raw-material, pricing, and regulatory cycle risks (high correlation)',
          'Because chemical stocks do not settle on T+1',
          'Because dividends are illegal in the chemical sector',
        ],
        correctIndex: 1,
        explanation: 'True diversification requires low correlation across sectors and asset classes so one industry headwind does not hit the entire portfolio.',
      },
      {
        id: 'm5-q2',
        question: 'Before investing surplus savings in equities, which foundation should be in place first?',
        options: [
          'A paid Telegram stock-tip subscription',
          'An emergency fund for essential expenses, insurance protection, and no high-interest debt',
          'Margin funding at 18% annual interest',
          'At least 10 intraday trades per day',
        ],
        correctIndex: 1,
        explanation: 'Emergency liquidity and protection prevent forced selling of investments during personal or market emergencies.',
      },
    ],
  },

  // =========================================================================
  // LEVEL 2: INTERMEDIATE — FUNDAMENTAL & TECHNICAL ANALYSIS (MODULES 6–14)
  // =========================================================================
  {
    id: 'module-6',
    number: 6,
    level: 'Intermediate',
    levelBadge: 'Level 2 • Intermediate',
    title: 'The Three Financial Statements',
    subtitle: 'Income Statement (P&L), Balance Sheet (Assets = Liabilities + Equity), Cash Flow Statement, and Profit vs Cash.',
    estimatedMinutes: 25,
    xpReward: 150,
    learningObjectives: [
      'Read Consolidated Indian financial statements (in ₹ Crore) across Revenue, Operating Profit (EBITDA/EBIT), and Net Profit (PAT).',
      'Verify the fundamental accounting identity: Assets = Liabilities + Shareholders’ Equity.',
      'Cross-check Accounting Profit (PAT) against Cash Flow from Operations (CFO) to detect receivables or inventory traps.',
    ],
    lessons: [
      {
        id: 'm6-lesson-1',
        title: '6.1 Income Statement (P&L) & Balance Sheet Identity',
        estimatedMinutes: 12,
        summary: 'Measuring performance over a period (P&L) versus financial position at a point in time (Balance Sheet).',
        paragraphs: [
          'The Statement of Profit and Loss (Income Statement) shows accrual performance over a quarter or fiscal year (April 1 to March 31 in India): Revenue from Operations minus Operating Expenses yields Operating Profit (EBITDA), and after Depreciation, Interest (Finance Costs), and Taxes, arrives at Profit After Tax (PAT).',
          'The Balance Sheet is a snapshot on a specific date governed by the exact identity: Assets = Liabilities + Shareholders’ Equity. Assets represent what the business owns (plants, cash, inventory, receivables); Liabilities represent what it owes (borrowings, trade payables); Equity is net worth belonging to shareholders.',
        ],
        indianExample: 'Always inspect Consolidated statements (which include subsidiaries and joint ventures) rather than Standalone alone when analysing Indian conglomerates.',
        keyPoints: [
          'Indian FY runs 1 April – 31 March (Q1: Apr–Jun, Q2: Jul–Sep, Q3: Oct–Dec, Q4: Jan–Mar).',
          'Assets = Liabilities + Equity must always balance.',
          'Separate core Revenue from Operations from one-off “Other Income” (like asset sales or treasury gains).',
        ],
        formulas: [
          {
            label: 'Balance Sheet Identity',
            expression: 'Assets = Liabilities + Shareholders’ Equity',
            note: 'Equivalently, Net Worth (Equity) = Total Assets − Total Liabilities.',
          },
        ],
        visualizer: {
          kind: 'BALANCE_SHEET_CASHFLOW',
          title: 'Balance Sheet Scale & Accrual Profit vs Cash Flow Inspector',
          caption: 'Adjust Receivables, Borrowings, and CapEx to see how Assets = Liabilities + Equity stays balanced and why PAT can diverge from Operating Cash Flow.',
        },
      },
      {
        id: 'm6-lesson-2',
        title: '6.2 Cash Flow Statement: CFO, CFI, CFF & Profit vs Cash',
        estimatedMinutes: 13,
        summary: 'Accrual accounting records sales when invoiced—Cash Flow from Operations reveals whether real ₹ actually arrived.',
        paragraphs: [
          'The Cash Flow Statement tracks actual cash movement across three buckets: Cash Flow from Operating Activities (CFO — core business cash), Investing Activities (CFI — factory CapEx, acquisitions, investments), and Financing Activities (CFF — debt raised/repaid, dividends paid, equity issued).',
          'A company can report rising accounting PAT by booking aggressive credit sales to dealers while cash stays stuck in unpaid Trade Receivables. Persistently low or negative cumulative CFO compared to cumulative PAT over 3–5 years is a classic fundamental warning sign.',
        ],
        indianExample: 'If a company reports ₹500 Cr PAT over 3 years cumulative, yet cumulative CFO is −₹80 Cr because receivables ballooned, growth is consuming cash rather than generating it.',
        keyPoints: [
          'CFO > 0 and tracking PAT over a multi-year cycle confirms earnings quality.',
          'Negative CFI from productive CapEx can be healthy if funded prudently and earning high ROCE.',
          'Compare cumulative 3–5 year CFO / EBITDA or CFO / PAT ratios.',
        ],
      },
    ],
    exercise: {
      id: 'm6-ex-1',
      title: 'Spotting the Profit-vs-Cash Divergence',
      scenario: 'Company X reports ₹220 Cr Net Profit (PAT) this year, up 40% YoY. However, Trade Receivables jumped by ₹310 Cr and Cash Flow from Operations (CFO) is −₹45 Cr for the third straight year.',
      prompt: 'How should an analyst interpret these statements?',
      options: [
        {
          id: 'a',
          label: 'Ignore the cash flow statement because PAT grew 40%',
          feedback: 'Risky! Accrual profit without cash collection can indicate channel stuffing or credit risk.',
          isCorrect: false,
        },
        {
          id: 'b',
          label: 'Investigate working-capital quality: reported profits are tied up in uncollected receivables rather than converting into operating cash',
          feedback: 'Correct! Comparing CFO against PAT exposes low cash conversion and working-capital stress early.',
          isCorrect: true,
        },
        {
          id: 'c',
          label: 'Assume Assets no longer equal Liabilities + Equity',
          feedback: 'Incorrect. Receivables are recorded as Current Assets, so the Balance Sheet still balances mathematically even as cash shrinks.',
          isCorrect: false,
        },
      ],
    },
    practicalTask: {
      title: 'Test Statement Forensics',
      instructions: 'Open the Fundamental Analysis Challenge in Play to evaluate company balance sheets and cash conversion quality.',
      relatedGameId: 'fundamental-analysis-challenge',
      relatedGameTitle: 'Fundamental Analysis Challenge',
    },
    quiz: [
      {
        id: 'm6-q1',
        question: 'If Total Assets are ₹4,800 Cr and Total Liabilities are ₹1,900 Cr, what is Shareholders’ Equity?',
        options: [
          '₹6,700 Cr',
          '₹2,900 Cr',
          '₹1,900 Cr',
          '₹950 Cr',
        ],
        correctIndex: 1,
        explanation: 'From Assets = Liabilities + Equity, Equity = ₹4,800 Cr − ₹1,900 Cr = ₹2,900 Cr.',
      },
      {
        id: 'm6-q2',
        question: 'Which section of the Cash Flow Statement records cash spent on building a new manufacturing plant (CapEx)?',
        options: [
          'Cash Flow from Operating Activities (CFO)',
          'Cash Flow from Investing Activities (CFI)',
          'Cash Flow from Financing Activities (CFF)',
          'Other Comprehensive Income',
        ],
        correctIndex: 1,
        explanation: 'Capital expenditure on property, plant, and equipment is recorded as an outflow under Investing Activities (CFI).',
      },
    ],
  },

  {
    id: 'module-7',
    number: 7,
    level: 'Intermediate',
    levelBadge: 'Level 2 • Intermediate',
    title: 'Financial Ratios and Formulas',
    subtitle: 'EPS, P/E, P/B, ROE, ROCE, Debt/Equity, Current Ratio, Margins, Dividend Yield, FCF, and valuation traps.',
    estimatedMinutes: 26,
    xpReward: 150,
    learningObjectives: [
      'Compute all 11 core financial ratios accurately from financial statement figures.',
      'Know when to use P/B instead of P/E (such as Banks/NBFCs) and ROE vs ROCE (leveraged vs unleveraged capital efficiency).',
      'Avoid low-P/E cyclical value traps and debt-inflated ROE illusions.',
    ],
    lessons: [
      {
        id: 'm7-lesson-1',
        title: '7.1 Valuation & Return Ratios: EPS, P/E, P/B, ROE & ROCE',
        estimatedMinutes: 13,
        summary: 'Exact formulas and sector-appropriate usage for Indian equities.',
        paragraphs: [
          'Ratios standardise raw ₹ Crore numbers so you can compare companies of different sizes within the same industry. Valuation multiples (P/E, P/B) compare market price against earnings or net worth, while capital efficiency ratios (ROE, ROCE) measure how productively management deploys capital.',
          'Crucial trap: High debt shrinks Equity relative to Assets, which can artificially inflate ROE even when core operating returns are mediocre. Always check ROCE alongside ROE for non-financial firms, and use P/B + Asset Quality (GNPA/NNPA, NIM, ROA) when analysing Banks and NBFCs because debt is a bank’s raw material.',
        ],
        indianExample: 'Comparing IT leader TCS (asset-light, high ROE, higher P/E) against a regulated power utility or PSU bank on raw P/E alone is invalid—always compare within peer groups.',
        keyPoints: [
          'P/E = Share Price / EPS (meaningless or distorted when EPS ≤ 0 or spiked by one-time gains).',
          'ROE measures return to equity holders; ROCE measures operating return on total capital employed (Debt + Equity).',
          'Cyclical commodity stocks often look cheapest on P/E at peak cycle earnings right before margins mean-revert!',
        ],
        formulas: [
          { label: 'EPS', expression: '(Net Profit − Preference Dividends) / Weighted Avg Shares', note: 'Earnings Per Share in ₹.' },
          { label: 'P/E Ratio', expression: 'Market Price per Share / EPS', note: 'Compare against sector peers, growth stability, and historical range.' },
          { label: 'P/B Ratio', expression: 'Market Price per Share / Book Value per Share', note: 'Primary multiple for Banks, NBFCs, and asset-heavy lenders.' },
          { label: 'ROE (%)', expression: '(Net Profit / Average Shareholders’ Equity) × 100', note: 'Can be boosted by high financial leverage—verify Debt/Equity.' },
          { label: 'ROCE (%)', expression: '(EBIT / Capital Employed) × 100', note: 'Capital Employed = Total Assets − Current Liabilities (or Equity + Total Debt).' },
        ],
        visualizer: {
          kind: 'FINANCIAL_RATIOS_LAB',
          title: 'Interactive Ratio & Free Cash Flow Calculator',
          caption: 'Enter Share Price, EPS, Book Value, EBIT, Equity, Debt, CFO, and CapEx to compute P/E, P/B, ROE, ROCE, D/E, and FCF with live trap warnings.',
        },
      },
      {
        id: 'm7-lesson-2',
        title: '7.2 Solvency, Liquidity, Margins, Dividend Yield & Free Cash Flow',
        estimatedMinutes: 13,
        summary: 'Measuring balance-sheet survival, pricing power, and distributable cash.',
        paragraphs: [
          'Solvency and liquidity ratios test whether a business can survive high interest rates or revenue shocks. Debt-to-Equity (Total Debt / Shareholders’ Equity) gauges leverage, while Current Ratio (Current Assets / Current Liabilities) gauges 12-month liquidity.',
          'Operating Margin (EBIT or Operating Profit / Revenue) reflects core pricing power before financing and tax structure, while Net Profit Margin (PAT / Revenue) captures bottom-line conversion. Finally, Free Cash Flow (FCF = Cash Flow from Operations − Capital Expenditure) measures true excess cash available to repay debt, pay dividends, or compound internally.',
        ],
        indianExample: 'A high Dividend Yield (Annual Dividend per Share / Price) of 8% is only sustainable if supported by healthy Free Cash Flow rather than one-off asset sales.',
        keyPoints: [
          'Free Cash Flow (FCF) = CFO − CapEx.',
          'Debt-to-Equity > 1.5x in cyclical non-financial industries warrants close interest-coverage scrutiny.',
          'Never judge a ratio in isolation: combine Growth + ROCE + Balance Sheet + Cash Conversion.',
        ],
        formulas: [
          { label: 'Debt-to-Equity', expression: 'Total Borrowings / Shareholders’ Equity', note: 'Exclude or treat separately for Banks/NBFCs.' },
          { label: 'Current Ratio', expression: 'Current Assets / Current Liabilities', note: 'Measures short-term working-capital cushion.' },
          { label: 'Operating & Net Margin', expression: 'Operating Profit / Revenue  |  Net Profit / Revenue', note: 'Track multi-year margin stability vs raw-material swings.' },
          { label: 'Dividend Yield (%)', expression: '(Annual Dividend per Share / Current Share Price) × 100', note: 'Check payout ratio sustainability.' },
          { label: 'Free Cash Flow (FCF)', expression: 'Cash Flow from Operations (CFO) − Capital Expenditure (CapEx)', note: 'Foundation of intrinsic DCF valuation.' },
        ],
      },
    ],
    exercise: {
      id: 'm7-ex-1',
      title: 'ROE vs ROCE Leverage Trap',
      scenario: 'Firm M and Firm N both earn ₹100 Cr EBIT. Firm M has ₹500 Cr Equity and ₹0 Debt. Firm N has ₹100 Cr Equity and ₹400 Cr high-cost Debt (paying ₹48 Cr interest). Assume 25% tax.',
      prompt: 'Why is looking only at Firm N’s high ROE misleading?',
      options: [
        {
          id: 'a',
          label: 'Because Firm N’s ROE (39%) is driven by 4:1 debt leverage while both firms have the exact same 20% pre-tax ROCE—leaving Firm N vulnerable in a downturn',
          feedback: 'Spot on! Both deploy ₹500 Cr Capital Employed for ₹100 Cr EBIT (20% ROCE), but Firm N carries heavy debt risk.',
          isCorrect: true,
        },
        {
          id: 'b',
          label: 'Because debt always reduces ROE to zero',
          feedback: 'Incorrect. Leverage magnifies ROE in good years and magnifies losses in bad years.',
          isCorrect: false,
        },
        {
          id: 'c',
          label: 'Because ROCE ignores operating profit',
          feedback: 'Incorrect. ROCE specifically uses EBIT over total Capital Employed.',
          isCorrect: false,
        },
      ],
    },
    practicalTask: {
      title: 'Compare Banking P/B vs IT P/E & ROE',
      instructions: 'In Trade Terminal, switch between TCS (IT) and HDFCBANK (Banking) and compare their P/E, P/B, ROE, and Debt/Equity profiles.',
      targetSymbol: 'TCS',
    },
    quiz: [
      {
        id: 'm7-q1',
        question: 'A stock trades at ₹720 and its trailing 12-month EPS is ₹30. What is its P/E ratio?',
        options: ['18x', '24x', '30x', '21.6x'],
        correctIndex: 1,
        explanation: 'P/E = Market Price / EPS = 720 / 30 = 24x.',
      },
      {
        id: 'm7-q2',
        question: 'If Cash Flow from Operations (CFO) is ₹640 Cr and Capital Expenditure (CapEx) is ₹190 Cr, what is Free Cash Flow (FCF)?',
        options: ['₹830 Cr', '₹450 Cr', '₹190 Cr', '₹3.37 Cr'],
        correctIndex: 1,
        explanation: 'FCF = CFO − CapEx = ₹640 Cr − ₹190 Cr = ₹450 Cr.',
      },
    ],
  },

  {
    id: 'module-8',
    number: 8,
    level: 'Intermediate',
    levelBadge: 'Level 2 • Intermediate',
    title: 'Company Research and Valuation',
    subtitle: '9-Item Company Analysis Checklist, Competitive Moats, Relative Valuation, DCF, DDM (r > g), and Bear/Base/Bull cases.',
    estimatedMinutes: 28,
    xpReward: 160,
    learningObjectives: [
      'Apply the structured 9-Item Company Analysis Checklist including Indian promoter shareholding & pledge checks.',
      'Understand Discounted Cash Flow (DCF) and Dividend Discount Model (DDM, strictly requiring r > g).',
      'Frame valuation as a Bear / Base / Bull range with a Margin of Safety rather than false single-rupee precision.',
    ],
    lessons: [
      {
        id: 'm8-lesson-1',
        title: '8.1 The 9-Item Company Analysis Checklist & Governance Red Flags',
        estimatedMinutes: 14,
        summary: 'Qualitative business moat + Indian promoter governance checks before running any valuation model.',
        paragraphs: [
          'Great valuation spreadsheets cannot rescue poor governance or a structurally broken business. Start every company study with nine systematic questions: (1) Business model clarity, (2) 5–10 year revenue & volume drivers, (3) Margin & ROCE durability, (4) Balance-sheet leverage, (5) CFO vs PAT cash conversion, (6) Capital allocation & promoter governance, (7) Competitive moat, (8) Valuation vs peers/history, and (9) Explicit thesis invalidation risks.',
          'In India, pay special attention to Promoter Shareholding trends, Promoter Share Pledging (heavy pledging creates forced-selling crash risk if share prices drop), Related-Party Transactions (RPTs), frequent auditor resignations, and contingent liabilities in Annual Report footnotes.',
        ],
        indianExample: 'Several historical mid-cap blowups on NSE showed optically cheap P/E ratios while >60% of promoter shares were pledged and related-party loans drained cash.',
        keyPoints: [
          'Check Annual Report footnotes, BSE/NSE corporate filings, and shareholding disclosures.',
          'High promoter share pledging is a major governance and liquidity red flag.',
          'Complete the interactive 9-Item Company Research Worksheet in the Learn Hub.',
        ],
      },
      {
        id: 'm8-lesson-2',
        title: '8.2 Intrinsic & Relative Valuation: DCF, DDM & Bear/Base/Bull Scenarios',
        estimatedMinutes: 14,
        summary: 'Valuing cash flows with conservative assumptions and respecting mathematical model constraints.',
        paragraphs: [
          'Relative Valuation compares P/E, EV/EBITDA, or P/B against comparable peers adjusted for growth and ROCE. Intrinsic Valuation estimates the present value of future cash flows discounted at an appropriate required rate of return (r / WACC).',
          'In Discounted Cash Flow (DCF), Enterprise Value equals the sum of discounted projected Free Cash Flows plus discounted Terminal Value. For mature, stable dividend-paying firms, the Gordon Growth Dividend Discount Model values equity as P₀ = D₁ / (r − g), which is mathematically valid ONLY when the discount rate r strictly exceeds perpetual growth g (r > g), and g cannot exceed long-run nominal GDP growth forever.',
        ],
        indianExample: 'Because a 1% change in WACC or terminal growth alters DCF output by 20–35%, disciplined analysts model Bear, Base, and Bull scenarios and demand a Margin of Safety.',
        keyPoints: [
          'DCF: EV = Σ [FCF_t / (1 + r)^t] + [TV_n / (1 + r)^n]; Equity Value = EV − Net Debt.',
          'DDM: P₀ = D₁ / (r − g), valid strictly when r > g and dividends are stable/predictable.',
          'Always build Bear, Base, and Bull cases instead of relying on a single point target.',
        ],
        formulas: [
          {
            label: 'Discounted Cash Flow (DCF)',
            expression: 'EV = Σ_{t=1..n} FCF_t / (1 + r)^t + TV_n / (1 + r)^n',
            note: 'Terminal Value TV_n = FCF_n × (1 + g) / (r − g), requiring r > g.',
          },
          {
            label: 'Dividend Discount Model (DDM)',
            expression: 'P₀ = D₁ / (r − g)   [Strictly requires r > g]',
            note: 'D₁ = expected next-year dividend per share; r = cost of equity; g = sustainable dividend growth rate.',
          },
        ],
        caveatNote: 'Small changes in discount rate (r) or terminal growth (g) dramatically shift DCF/DDM outputs. Never set perpetual growth g ≥ r or above long-run economy growth.',
        visualizer: {
          kind: 'DCF_DDM_VALUATION',
          title: 'DCF & DDM Bear / Base / Bull Scenario Valuator',
          caption: 'Explore sensitivity to FCF growth, discount rate (r), and terminal growth (g) with automatic r > g validation.',
        },
      },
    ],
    exercise: {
      id: 'm8-ex-1',
      title: 'DDM Constraint & Valuation Sanity Check',
      scenario: 'A student plugs D₁ = ₹20, Cost of Equity r = 11%, and perpetual dividend growth g = 13% into P₀ = D₁ / (r − g) and gets −₹1,000.',
      prompt: 'What went wrong in this valuation?',
      options: [
        {
          id: 'a',
          label: 'Constant-growth DDM is invalid when g ≥ r; no company can grow faster than its discount rate or the economy in perpetuity—a multi-stage model with realistic terminal g < r is required',
          feedback: 'Correct! Constant-growth DDM strictly requires r > g, with perpetual g anchored to conservative long-term economic reality.',
          isCorrect: true,
        },
        {
          id: 'b',
          label: 'Simply ignore the minus sign and treat ₹1,000 as the fair target price',
          feedback: 'Never! Removing a negative sign from an invalid denominator produces complete nonsense.',
          isCorrect: false,
        },
        {
          id: 'c',
          label: 'Multiply D₁ by 100 instead',
          feedback: 'Incorrect. The error is violating the economic and mathematical condition r > g.',
          isCorrect: false,
        },
      ],
    },
    practicalTask: {
      title: 'Complete a Company Research Worksheet',
      instructions: 'Open the Worksheet tab inside Learn Hub, fill out the 9-Item Checklist for an NSE company (such as TCS or ITC), and click Save to Account.',
      targetSymbol: 'ITC',
      relatedGameId: 'fundamental-analysis-challenge',
      relatedGameTitle: 'Fundamental Analysis Challenge',
    },
    quiz: [
      {
        id: 'm8-q1',
        question: 'Using P₀ = D₁ / (r − g), if expected next-year dividend D₁ = ₹15, cost of equity r = 12% (0.12), and sustainable growth g = 7% (0.07), what is P₀?',
        options: ['₹125', '₹214', '₹300', '₹78'],
        correctIndex: 2,
        explanation: 'P₀ = 15 / (0.12 − 0.07) = 15 / 0.05 = ₹300.',
      },
      {
        id: 'm8-q2',
        question: 'Which corporate governance disclosure in India signals elevated forced-selling risk if a stock’s price falls sharply?',
        options: [
          'Zero debt on the balance sheet',
          'A high percentage of promoter shares pledged as collateral with lenders',
          'Regular quarterly investor conference calls',
          'Unqualified clean statutory audit opinion',
        ],
        correctIndex: 1,
        explanation: 'When pledged promoter shares fall in value, lenders demand top-up collateral or liquidate shares in the open market, creating cascading sell pressure.',
      },
    ],
  },

  {
    id: 'module-9',
    number: 9,
    level: 'Intermediate',
    levelBadge: 'Level 2 • Intermediate',
    title: 'Economic and Sector Analysis',
    subtitle: 'GDP, CPI inflation, RBI Repo Rate, bond yields, INR/USD, crude oil, FII/DII flows, and Indian sector sensitivity.',
    estimatedMinutes: 22,
    xpReward: 140,
    learningObjectives: [
      'Connect RBI Monetary Policy Committee (MPC) Repo Rate and CPI inflation trends to equity discount rates and credit demand.',
      'Understand how INR depreciation and Brent crude oil swings impact Indian exporters (IT/Pharma) vs oil-input consumers (Paints/Aviation/Tyres).',
      'Interpret FII and DII institutional flow data with proper structural caveats.',
    ],
    lessons: [
      {
        id: 'm9-lesson-1',
        title: '9.1 Macro Drivers: GDP, CPI Inflation, RBI Repo Rate, INR & Crude Oil',
        estimatedMinutes: 12,
        summary: 'How top-down Indian macroeconomic variables flow into sector revenues and margins.',
        paragraphs: [
          'Corporate revenues do not grow in a vacuum. Real GDP growth expands domestic demand across credit, autos, cement, and consumer goods. When CPI inflation rises above RBI’s tolerance band, the RBI Monetary Policy Committee (MPC) may hike the Repo Rate—raising borrowing costs across the economy and increasing the discount rate (r) applied to equity valuations.',
          'Because India imports over 80% of its crude oil needs, sharp spikes in crude oil widen the current account deficit, pressure the Indian Rupee (INR), and squeeze input margins for paints, aviation, logistics, and chemicals—whereas USD-earning exporters like IT Services and export Pharma often see rupee revenue tailwinds from a weaker INR (subject to global client demand and currency hedges).',
        ],
        indianExample: 'A 50 bps RBI repo rate cut lowers home and auto EMI rates over time, often supporting rate-sensitive sectors like Banking/NBFCs, Real Estate, and Automobiles.',
        keyPoints: [
          'Higher RBI Repo Rate & 10Y G-Sec yield → tighter liquidity and higher equity discount rates.',
          'Rising Crude Oil → input cost headwind for Paints, Aviation, Tyres, and OMCs.',
          'INR Depreciation vs USD → tailwind for net USD exporters (IT/Pharma), headwind for unhedged USD borrowers/importers.',
        ],
        table: {
          caption: 'Indian Sector Macro Sensitivity Reference Matrix',
          headers: ['Sector', 'Key Tailwinds', 'Key Headwinds'],
          rows: [
            ['Banking & NBFCs', 'Strong credit growth, stable asset quality, benign liquidity', 'Spiking yields, rising slippages/NPAs, tight liquidity'],
            ['IT Services', 'Global enterprise tech spend, INR depreciation vs USD', 'US/Europe recession, client budget cuts'],
            ['Automobiles', 'Falling EMI rates, rural/monsoon recovery, stable steel/fuel', 'Rate hikes, fuel spikes, commodity inflation'],
            ['Paints / Aviation / Tyres', 'Falling Brent crude & derivatives prices, strong urban demand', 'Sharp crude oil spikes, weaker INR raising import costs'],
            ['FMCG / Staples', 'Normal monsoon, moderating agri-input inflation, rural wage growth', 'Agri/palm-oil input spikes, weak rural demand'],
          ],
        },
        visualizer: {
          kind: 'MACRO_SECTOR_SENSITIVITY',
          title: 'Indian Macro Shock → Sector Impact Simulator',
          caption: 'Toggle RBI Repo Rate, Crude Oil, and USD/INR regimes to inspect typical first-order sector impacts and caveats.',
        },
      },
      {
        id: 'm9-lesson-2',
        title: '9.2 Reading FII & DII Flows Without Mechanical Blindness',
        estimatedMinutes: 10,
        summary: 'Institutional liquidity shapes medium-term market breadth, but daily provisional numbers have nuances.',
        paragraphs: [
          'Foreign Institutional Investors (FIIs / FPIs) and Domestic Institutional Investors (DIIs — Mutual Funds via SIP inflows, Insurance companies, EPFO/PFs) account for a large share of institutional ownership in India.',
          'Over recent years, steady domestic SIP inflows into mutual funds have often absorbed FII selling triggered by rising US Treasury yields. However, treat daily provisional cash-market FII/DII figures carefully: they mix block deals, primary/QIP adjustments, index rebalancing, and arbitrage—so never trade blindly off a single day’s FII number.',
        ],
        indianExample: 'A ₹6,000 Cr single-day FII buy print on NSE might reflect an MSCI index rebalance or promoter block deal rather than broad discretionary buying.',
        keyPoints: [
          'Track multi-week FII/DII trends alongside US 10Y yields and domestic SIP trends.',
          'Caveat: Daily provisional FII/DII numbers include block deals and passive index rebalances.',
          'Combine top-down sector tailwinds with bottom-up company balance-sheet strength.',
        ],
        caveatNote: 'Macro relationships are multi-factor: for example, INR weakness helps IT margins, but a severe US recession can hurt IT order books simultaneously.',
      },
    ],
    exercise: {
      id: 'm9-ex-1',
      title: 'Tracing a Crude Oil & Rate Shock',
      scenario: 'Brent crude jumps from $72 to $96 per barrel while domestic CPI inflation spikes, prompting RBI to signal tighter liquidity.',
      prompt: 'Which sector pair faces the most direct input-cost and rate headwind?',
      options: [
        {
          id: 'a',
          label: 'Aviation & Decorative Paints (crude-linked fuel/monomer inputs) plus leveraged rate-sensitive borrowers',
          feedback: 'Correct! ATF fuel and petrochemical derivatives directly raise costs for aviation and paints, while tighter rates pressure leveraged borrowers.',
          isCorrect: true,
        },
        {
          id: 'b',
          label: 'Zero-debt net cash IT exporters have crude oil as 70% of their operating expense',
          feedback: 'Incorrect. Employee salaries—not crude oil—are the primary cost for IT services firms.',
          isCorrect: false,
        },
        {
          id: 'c',
          label: 'No Indian sector is affected by crude oil or interest rates',
          feedback: 'Incorrect. Energy costs and interest rates affect margins, demand, and discount rates.',
          isCorrect: false,
        },
      ],
    },
    practicalTask: {
      title: 'Stress-Test Sector Resilience',
      instructions: 'Play Market Crash Survival in the Play tab to experience how defensive vs high-beta leveraged sectors behave during macro shocks.',
      relatedGameId: 'market-crash-survival',
      relatedGameTitle: 'Market Crash Survival',
    },
    quiz: [
      {
        id: 'm9-q1',
        question: 'When RBI raises the Repo Rate to combat persistent inflation, what is the typical first-order transmission effect?',
        options: [
          'Borrowing costs rise across banks/corporates and discount rates used in equity valuation increase',
          'All corporate loans become interest-free',
          'Demat settlement changes from T+1 to T+10',
          'Crude oil imports drop to zero overnight',
        ],
        correctIndex: 0,
        explanation: 'Repo rate hikes raise the cost of funds in the banking system, tightening credit conditions and increasing required discount rates.',
      },
      {
        id: 'm9-q2',
        question: 'Why should daily provisional FII/DII cash figures not be used as a standalone mechanical trading signal?',
        options: [
          'Because FIIs are not allowed to trade NIFTY 50 companies',
          'Because single-day figures can be skewed by one-off block deals, passive index rebalancing, or cash-futures arbitrage',
          'Because DIIs only buy gold',
          'Because exchanges publish them only once every five years',
        ],
        correctIndex: 1,
        explanation: 'Block deals, QIPs, and MSCI/FTSE rebalances often distort single-day institutional flow prints.',
      },
    ],
  },

  {
    id: 'module-10',
    number: 10,
    level: 'Intermediate',
    levelBadge: 'Level 2 • Intermediate',
    title: 'Candlestick Charts',
    subtitle: 'OHLC anatomy, body vs wicks/shadows, Hammer, Shooting Star, Doji, Bullish/Bearish Engulfing, and location context.',
    estimatedMinutes: 24,
    xpReward: 150,
    learningObjectives: [
      'Read Open, High, Low, Close (OHLC), Real Body, and Upper/Lower Shadows on any timeframe.',
      'Identify Hammer, Shooting Star, Doji, and Bullish/Bearish Engulfing patterns from price auction psychology.',
      'Apply the golden rule of candlesticks: a candle pattern means little without trend, support/resistance location, and volume confirmation.',
    ],
    lessons: [
      {
        id: 'm10-lesson-1',
        title: '10.1 OHLC Anatomy: Real Body, Upper Wick & Lower Wick',
        estimatedMinutes: 12,
        summary: 'Every candlestick summarises an entire tug-of-war auction over one selected time interval.',
        paragraphs: [
          'A single candlestick compresses four prices for its chosen timeframe (e.g., 5-minute, 1-hour, or 1-day): Open (first trade), High (highest trade), Low (lowest trade), and Close (final settlement/last trade of the bar).',
          'When Close > Open, the candle is Bullish (green): buyers won the period. When Close < Open, the candle is Bearish (red): sellers closed price lower. The rectangular Real Body spans between Open and Close, while thin Upper and Lower Wicks (Shadows) reveal rejected price extremes.',
        ],
        indianExample: 'On a Daily NSE chart, one candle summarises the entire 09:15–15:30 IST session. A long lower wick from ₹2,410 back up to a ₹2,465 close shows buyers aggressively absorbed intraday selling.',
        keyPoints: [
          'Bullish Body: Open at bottom of body, Close at top of body.',
          'Bearish Body: Open at top of body, Close at bottom of body.',
          'Long Upper Wick = supply rejection at highs; Long Lower Wick = demand rejection at lows.',
        ],
        visualizer: {
          kind: 'CANDLESTICK_ANATOMY_COMPARE',
          title: 'Interactive Candlestick Anatomy & Bullish vs Bearish Pattern Lab',
          caption: 'Hover over Open, High, Low, Close, Real Body, and Shadows, and compare Hammer, Shooting Star, Doji, and Engulfing structures.',
        },
      },
      {
        id: 'm10-lesson-2',
        title: '10.2 Core Patterns in Context: Hammer, Shooting Star, Doji & Engulfing',
        estimatedMinutes: 12,
        summary: 'Why a Hammer in the middle of a choppy range is noise, whereas at key support it signals rejection.',
        paragraphs: [
          'Key single- and two-candle structures reflect shifts in auction control: (1) Hammer — small upper body with a lower wick ≥ 2× body length after a decline into support, showing seller exhaustion; (2) Shooting Star — small lower body with a long upper wick after a rally into resistance; (3) Doji — Open ≈ Close, showing temporary equilibrium/indecision; (4) Bullish/Bearish Engulfing — second candle’s real body completely engulfs the prior candle’s real body.',
          'Never memorise candles as guaranteed magic triggers! Always verify: Where did it form (major support/resistance or random mid-range)? What is the higher-timeframe trend? Did volume expand on the reversal candle?',
        ],
        indianExample: 'A Doji after a 12% vertical rally into a multi-month resistance zone warns of momentum pause, whereas a Doji during quiet lunch-hour intraday trading is routine low-volume noise.',
        keyPoints: [
          'Hammer requires a preceding pullback/downtrend into a demand zone.',
          'Shooting Star requires a preceding rally into a supply/resistance zone.',
          'Wait for candle close—an incomplete candle at 14:10 IST can look completely different by 15:30 IST!',
        ],
        caveatNote: 'Candlestick patterns express probability and auction rejection—never certainty. Always pair with invalidation (stop-loss beyond the wick extreme).',
      },
    ],
    exercise: {
      id: 'm10-ex-1',
      title: 'Reading Auction Rejection from OHLC',
      scenario: 'On a daily chart pulling back into a tested ₹1,500 support zone, a stock opens at ₹1,518, drops intraday to ₹1,482, and rallies to close at ₹1,524 (High ₹1,526).',
      prompt: 'Which structure formed and what does the ₹1,482 → ₹1,524 recovery signify?',
      options: [
        {
          id: 'a',
          label: 'Shooting Star showing aggressive overhead supply',
          feedback: 'Check the wicks: High is ₹1,526 (tiny ₹2 upper wick) while Low is ₹1,482 (₹36 lower wick). That is a long lower shadow, not an upper shadow.',
          isCorrect: false,
        },
        {
          id: 'b',
          label: 'Bullish Hammer at support: sellers pushed price to ₹1,482, but buyers absorbed supply and closed near the session high',
          feedback: 'Correct! Body = ₹6 (₹1,518 to ₹1,524), Lower Wick = ₹36 (6× body) rejecting breakdown below the ₹1,500 support zone.',
          isCorrect: true,
        },
        {
          id: 'c',
          label: 'Guaranteed risk-free profit with no stop-loss needed',
          feedback: 'Never! Even textbook hammers fail if ₹1,482 breaks on follow-through selling.',
          isCorrect: false,
        },
      ],
    },
    practicalTask: {
      title: 'Switch Chart to Candlestick View & Play Candlestick Detective',
      instructions: 'Open Trade Terminal → toggle Candlestick chart mode and hover candles to inspect OHLC values, then test your skill in Candlestick Detective.',
      targetSymbol: 'SBIN',
      relatedGameId: 'candlestick-detective',
      relatedGameTitle: 'Candlestick Detective',
    },
    quiz: [
      {
        id: 'm10-q1',
        question: 'On a bearish (red) candlestick, where are the Open and Close located?',
        options: [
          'Open is at the top of the real body; Close is at the bottom of the real body',
          'Open is at the bottom of the lower wick; Close is at the top of the upper wick',
          'Open is at the bottom of the real body; Close is at the top of the real body',
          'Open and Close are always equal',
        ],
        correctIndex: 0,
        explanation: 'A bearish candle closes lower than it opened, placing the Open at the top edge of the real body and Close at the bottom edge.',
      },
      {
        id: 'm10-q2',
        question: 'Why must you wait for a candlestick bar to close before acting on its pattern?',
        options: [
          'Because NSE charges higher brokerage before candle close',
          'Because intra-bar price action can reverse before the period ends, turning an apparent breakout candle into a long-wick rejection',
          'Because volume is hidden until T+1',
          'Because Limit orders only work at 15:29 IST',
        ],
        correctIndex: 1,
        explanation: 'Until the bar closes, its Close price and wick geometry are not finalised.',
      },
    ],
  },

  {
    id: 'module-11',
    number: 11,
    level: 'Intermediate',
    levelBadge: 'Level 2 • Intermediate',
    title: 'Trends, Support and Resistance',
    subtitle: 'Uptrend/Downtrend/Range structure, S/R as zones, role reversal (polarity), and classical chart patterns.',
    estimatedMinutes: 24,
    xpReward: 150,
    learningObjectives: [
      'Classify market regimes objectively using swing Highs and Lows (HH+HL uptrend, LH+LL downtrend, sideways range).',
      'Treat Support and Resistance as price zones rather than exact single-paise lines, and recognise Polarity (Role Reversal).',
      'Understand classical patterns: Double Top/Bottom, Head & Shoulders, Inverse H&S, Triangles, and Flags/Pennants—including false breakouts.',
    ],
    lessons: [
      {
        id: 'm11-lesson-1',
        title: '11.1 Market Trends, Support/Resistance Zones & Polarity',
        estimatedMinutes: 12,
        summary: 'Why institutional orders cluster in price zones and why broken resistance often flips into support.',
        paragraphs: [
          'Markets spend time in three primary regimes: Uptrend (a sequence of Higher Highs [HH] and Higher Lows [HL]), Downtrend (Lower Highs [LH] and Lower Lows [LL]), or Consolidation Range (horizontal oscillation between demand and supply boundaries).',
          'Support is a demand zone where buying interest historically halts declines; Resistance is a supply zone where selling interest halts advances. Always draw S/R as zones (capturing bodies and wicks) rather than razor-thin lines. Under Role Reversal (Polarity), once a major Resistance zone is decisively broken with volume, trapped shorts and breakout buyers often turn that former ceiling into a new Support floor on retest.',
        ],
        indianExample: 'When an NSE stock breaks decisively above a 6-month ₹980–₹1,000 resistance band on 2.5× average volume, pullbacks toward ₹990–₹1,005 frequently act as first retest support.',
        keyPoints: [
          'Uptrend = Higher Highs + Higher Lows; intact until key Higher Low breaks.',
          'Support & Resistance are zones, not exact single-rupee lines.',
          'Role Reversal (Polarity): Broken Resistance → Potential Support; Broken Support → Potential Resistance.',
        ],
        visualizer: {
          kind: 'SUPPORT_RESISTANCE_ZONES',
          title: 'Interactive Trend Structure & Support/Resistance Role-Reversal Map',
          caption: 'Toggle Swing Labels (HH/HL/LH/LL), Support/Resistance Zones, and Breakout Retest Role Reversal on an interactive price series.',
        },
      },
      {
        id: 'm11-lesson-2',
        title: '11.2 Classical Chart Patterns & Avoiding Bull/Bear Traps',
        estimatedMinutes: 12,
        summary: 'Reversal vs continuation structures and how volume separates genuine breakouts from traps.',
        paragraphs: [
          'Classical chart structures visualise multi-week supply-demand compression: Reversal patterns include Double Top (M-shape failing twice at resistance, confirmed only on neckline break), Double Bottom (W-shape), Head & Shoulders, and Inverse Head & Shoulders. Continuation patterns include Flags/Pennants (tight orderly pause after a sharp impulse pole) and Ascending/Descending/Symmetrical Triangles.',
          'Beware of anticipating patterns before neckline/boundary confirmation! Many breakouts fail (Bull Traps / Bear Traps) when price pokes briefly beyond a level on weak volume and snaps back inside the range.',
        ],
        indianExample: 'Buying the right shoulder of an incomplete Inverse Head & Shoulders before the neckline breaks leaves you trapped in a sideways or falling range if sellers defend the neckline.',
        keyPoints: [
          'Reversal patterns require a prior trend to reverse and a decisive neckline close.',
          'Breakouts accompanied by strong relative volume carry higher follow-through probability than low-volume pokes.',
          'Place logical invalidation where the pattern thesis is disproven, not at arbitrary rupee distances.',
        ],
      },
    ],
    exercise: {
      id: 'm11-ex-1',
      title: 'Identifying Polarity & Trend State',
      scenario: 'A stock forms swing lows at ₹410, ₹435, and ₹462, and swing highs at ₹445, ₹475, and ₹510. After closing at ₹510 (breaking the ₹472–₹478 resistance zone), it pulls back calmly on light volume to ₹476.',
      prompt: 'How is this chart structure best classified?',
      options: [
        {
          id: 'a',
          label: 'Confirmed downtrend because price pulled back from ₹510 to ₹476',
          feedback: 'A normal pullback within HH + HL structure does not create a downtrend unless key Higher Lows break.',
          isCorrect: false,
        },
        {
          id: 'b',
          label: 'Uptrend (HH + HL) retesting former ₹472–₹478 resistance as a potential polarity support zone',
          feedback: 'Correct! Swing highs and lows are rising, and the broken ₹472–₹478 ceiling is being retested as potential support.',
          isCorrect: true,
        },
        {
          id: 'c',
          label: 'Confirmed Head & Shoulders breakdown',
          feedback: 'Incorrect. There is no left shoulder, head, right shoulder, or broken neckline here.',
          isCorrect: false,
        },
      ],
    },
    practicalTask: {
      title: 'Classify Regimes in Bull vs Bear Market',
      instructions: 'Play Bull vs Bear Market in the Play section to practice classifying Uptrends, Downtrends, Ranges, and Role-Reversal setups.',
      relatedGameId: 'bull-vs-bear-market',
      relatedGameTitle: 'Bull vs Bear Market',
    },
    quiz: [
      {
        id: 'm11-q1',
        question: 'What defines an intact technical Uptrend?',
        options: [
          'Every single daily candle must be green',
          'A structural sequence of Higher Highs (HH) and Higher Lows (HL)',
          'Lower Highs (LH) and Lower Lows (LL)',
          'RSI staying above 90 forever',
        ],
        correctIndex: 1,
        explanation: 'Uptrends include normal red pullback candles, provided pullbacks form Higher Lows and rallies achieve Higher Highs.',
      },
      {
        id: 'm11-q2',
        question: 'Why do experienced chartists treat Support and Resistance as zones rather than exact single prices?',
        options: [
          'Because exchange tick sizes change randomly every minute',
          'Because diverse participants place orders across nearby price bands and intraday volatility produces minor undershoots/overshoots',
          'Because line charts cannot display rupees',
          'Because SEBI prohibits horizontal lines',
        ],
        correctIndex: 1,
        explanation: 'Institutional accumulation/distribution and retail stops cluster across price bands, making zones far more realistic than single-paise lines.',
      },
    ],
  },

  {
    id: 'module-12',
    number: 12,
    level: 'Intermediate',
    levelBadge: 'Level 2 • Intermediate',
    title: 'Technical Indicators',
    subtitle: 'Core indicators (SMA, EMA, RSI, MACD, Bollinger Bands, VWAP, ATR) + supplementary toolkit & avoiding indicator clutter.',
    estimatedMinutes: 26,
    xpReward: 150,
    learningObjectives: [
      'Understand mathematical formulas and lag properties of Core Indicators: SMA, EMA, RSI, MACD, Bollinger Bands, VWAP, and ATR.',
      'Avoid the “RSI > 70 = automatic short” trap during strong momentum trends.',
      'Avoid multicollinearity (stacking 5 oscillators measuring the same price derivative) and understand supplementary tools.',
    ],
    lessons: [
      {
        id: 'm12-lesson-1',
        title: '12.1 Core Trend, Momentum & Volatility Indicators (SMA, EMA, RSI, MACD)',
        estimatedMinutes: 13,
        summary: 'Indicators are mathematical transformations of Price and Volume—they summarize history rather than predict the future.',
        paragraphs: [
          'Trend-following moving averages smooth noise: Simple Moving Average (SMA) weights the last N closes equally, whereas Exponential Moving Average (EMA) applies greater weight k = 2/(N+1) to recent prices, reacting faster to turns at the cost of more whipsaws in sideways ranges.',
          'Momentum oscillators measure velocity: Relative Strength Index (RSI, default 14) scales average gains vs losses between 0 and 100. Crucial nuance: in a powerful bull trend, RSI can remain above 70 for weeks—treating RSI > 70 as an automatic sell signal causes traders to fight strong trends! MACD (12 EMA − 26 EMA, with 9 EMA Signal line) blends trend direction and momentum inflection.',
        ],
        indianExample: 'During strong NIFTY sector rallies, leading stocks routinely hold RSI between 60 and 80 while riding above a rising 20 EMA.',
        keyPoints: [
          'SMA & EMA excel in trending regimes and whip-saw in flat sideways chop.',
          'RSI > 70 = strong upward momentum (not an automatic reversal without price structure breakdown).',
          'MACD Histogram = MACD Line − Signal Line, visualising momentum acceleration/deceleration.',
        ],
        formulas: [
          { label: 'SMA(N)', expression: '(Close₁ + Close₂ + ... + Close_N) / N', note: 'Equal weight to all N periods.' },
          { label: 'EMA_t', expression: 'Close_t × k + EMA_{t−1} × (1 − k),  where k = 2 / (N + 1)', note: 'Faster response to recent price changes.' },
          { label: 'RSI(14)', expression: '100 − [100 / (1 + RS)],  where RS = Avg Gain / Avg Loss', note: 'Wilder’s 14-period smoothed average.' },
          { label: 'MACD(12,26,9)', expression: 'MACD = EMA(12) − EMA(26);  Signal = EMA(9 of MACD)', note: 'Trend + momentum hybrid.' },
        ],
        visualizer: {
          kind: 'INDICATOR_OVERLAY_LAB',
          title: 'Interactive SMA / EMA / Bollinger & RSI Explorer',
          caption: 'Toggle SMA(20), EMA(50), Bollinger Bands(20, 2σ), and RSI(14) across Trending vs Sideways regimes to see where indicators shine vs whipsaw.',
        },
      },
      {
        id: 'm12-lesson-2',
        title: '12.2 Bollinger Bands, VWAP, ATR & Supplementary Toolkit',
        estimatedMinutes: 13,
        summary: 'Measuring volatility expansion (Bollinger/ATR), institutional benchmark execution (VWAP), and keeping charts clean.',
        paragraphs: [
          'Bollinger Bands plot a 20-period SMA flanked by ±2 standard deviations (σ). When bands narrow (“Squeeze”), realised volatility has compressed, often preceding a directional expansion. VWAP (Volume-Weighted Average Price = Σ(Typical Price × Volume) / Σ Volume) resets at the start of an intraday session and serves as an institutional execution benchmark.',
          'Average True Range (ATR) measures volatility in ₹ points (never direction!), making it ideal for volatility-adjusted stop-losses (e.g., 1.5× or 2× ATR) so stops are not clipped by normal daily noise. Keep charts clean: pick at most one trend filter + one volatility/momentum check rather than stacking redundant indicators.',
        ],
        indianExample: 'If Stock A has ₹45 daily ATR and Stock B has ₹8 daily ATR, setting a fixed ₹10 stop-loss on Stock A will stop you out on random morning noise.',
        keyPoints: [
          'Bollinger Squeeze = low volatility compression, not a directional signal until price breaks out.',
          'VWAP is primarily an intraday benchmark anchored to session volume.',
          'ATR measures volatility magnitude in ₹, helping size stops and positions.',
        ],
        supplementaryNote: 'Supplementary curriculum toolkit for reference: On-Balance Volume (OBV — cumulative volume flow), Stochastic Oscillator (close location within high-low range), Fibonacci Retracements (38.2%, 50%, 61.8% pullback zones), Floor Pivot Points, ADX (trend strength > 25 regardless of bull/bear direction), and Ichimoku Cloud.',
      },
    ],
    exercise: {
      id: 'm12-ex-1',
      title: 'Avoiding Indicator Misuse',
      scenario: 'A stock breaks out of a 4-month base on 3× volume into an uptrend, and 14-day RSI reaches 73. A beginner immediately shorts the stock solely because “RSI > 70 means overbought”.',
      prompt: 'Why is this a classic technical mistake?',
      options: [
        {
          id: 'a',
          label: 'Because RSI > 70 in a fresh breakout reflects strong bullish momentum and can stay elevated while price rallies much higher',
          feedback: 'Correct! Overbought readings during trend breakouts confirm momentum strength rather than guaranteeing an immediate top.',
          isCorrect: true,
        },
        {
          id: 'b',
          label: 'Because RSI only works on 1-second charts',
          feedback: 'Incorrect. RSI works across timeframes when interpreted within trend structure.',
          isCorrect: false,
        },
        {
          id: 'c',
          label: 'Because ATR should be used to predict whether tomorrow is green or red',
          feedback: 'Incorrect. ATR measures volatility range, not direction.',
          isCorrect: false,
        },
      ],
    },
    practicalTask: {
      title: 'Toggle SMA, EMA, Bollinger & RSI on Live/Historical Charts',
      instructions: 'Open Trade Terminal → enable SMA 20, EMA 50, Bollinger Bands, and RSI (14) on RELIANCE and TCS across 3M and 1Y timeframes.',
      targetSymbol: 'RELIANCE',
    },
    quiz: [
      {
        id: 'm12-q1',
        question: 'What does Average True Range (ATR) measure?',
        options: [
          'Corporate revenue growth rate',
          'Average price volatility range in ₹ over N periods (non-directional)',
          'Whether promoters are buying shares',
          'Exact future target price',
        ],
        correctIndex: 1,
        explanation: 'ATR captures true high-low/gap range volatility in currency units without indicating bullish or bearish direction.',
      },
      {
        id: 'm12-q2',
        question: 'Why does stacking RSI, Stochastic, CCI, and Williams %R on the same chart add little analytical value?',
        options: [
          'They all measure similar momentum oscillations from the same recent OHLC data (indicator multicollinearity)',
          'Charts crash if more than two colours are used',
          'Moving averages become illegal when RSI is active',
          'Volume disappears when oscillators are plotted',
        ],
        correctIndex: 0,
        explanation: 'Four momentum oscillators saying the same thing is a single signal counted four times, creating false confidence.',
      },
    ],
  },

  {
    id: 'module-13',
    number: 13,
    level: 'Intermediate',
    levelBadge: 'Level 2 • Intermediate',
    title: 'Price Action and Market Structure',
    subtitle: 'Break of Structure (BOS), Change of Character (CHoCH), Liquidity Sweeps, Order Blocks, Fair Value Gaps (FVG), and volume context.',
    estimatedMinutes: 25,
    xpReward: 150,
    learningObjectives: [
      'Distinguish trend-continuing Break of Structure (BOS) from potential trend-shifting Change of Character (CHoCH).',
      'Understand Liquidity Pools (resting stop clusters), Order Blocks (displacement origin zones), and 3-candle Fair Value Gaps (FVG).',
      'Respect methodological caveats: definitions vary across price-action schools (body close vs wick break) and require objective testing.',
    ],
    lessons: [
      {
        id: 'm13-lesson-1',
        title: '13.1 Market Structure: BOS, CHoCH & Stop-Cluster Liquidity',
        estimatedMinutes: 13,
        summary: 'Reading swing continuity vs structural shift without hindsight bias.',
        paragraphs: [
          'Price-action market structure formalises swing progression: in an established Uptrend (HH + HL), when price rallies and closes decisively above the prior Swing High, traders call that a bullish Break of Structure (BOS)—confirming trend continuation. Conversely, if price turns down and breaks decisively below the most recent protected Higher Low that created the high, it signals a Change of Character (CHoCH)—the earliest structural warning that trend control may be shifting.',
          'Liquidity refers to resting clusters of stop-loss and breakout orders sitting just above obvious Equal Highs or just below Equal Lows. Large participants require opposing liquidity to fill institutional-sized orders, which is why price sometimes sweeps slightly past an obvious swing level before reversing if no follow-through volume appears.',
        ],
        indianExample: 'When NIFTY forms three equal intraday lows at 24,200, retail sell-stops cluster at 24,195; a brief wick to 24,185 followed by a strong body close back above 24,210 is a classic liquidity sweep.',
        keyPoints: [
          'BOS (Break of Structure) = break in the direction of the prevailing trend (continuation).',
          'CHoCH (Change of Character) = first break of the opposing protected swing (potential shift).',
          'Define clearly whether your rulebook requires a full candle body close (recommended to filter wick sweeps) vs a wick pierce.',
        ],
        caveatNote: 'Methodological Caveat: Terms like BOS, CHoCH, Order Block, and FVG are modern discretionary price-action conventions—not exchange-standardized metrics. Different practitioners define swing validity and body-vs-wick breaks differently; choose one consistent rule definition and test it.',
        visualizer: {
          kind: 'MARKET_STRUCTURE_BOS_CHOCH',
          title: 'BOS vs CHoCH & Fair Value Gap Structure Explorer',
          caption: 'Step through a Bullish BOS continuation, a Bearish CHoCH structural break, and a 3-candle Fair Value Gap imbalance zone.',
        },
      },
      {
        id: 'm13-lesson-2',
        title: '13.2 Order Blocks, Fair Value Gaps (FVG) & Volume Confirmation',
        estimatedMinutes: 12,
        summary: 'Identifying strong displacement footprints and why not every gap or block holds.',
        paragraphs: [
          'An Order Block (in price-action terminology) refers to the final opposing consolidation candle/zone right before a sharp, high-momentum impulse move (displacement) that breaks market structure. A Fair Value Gap (FVG) is a 3-candle price imbalance where Candle 2 expands so rapidly that Candle 1’s High and Candle 3’s Low do not overlap (in a bullish impulse), leaving a visible price range with thin two-way trade.',
          'Crucial reality check: Markets are not obligated to fill every FVG or bounce from every Order Block! High-impact news, earnings surprises, or macro trends slice straight through minor zones. Volume expansion during the initial displacement and higher-timeframe alignment separate meaningful zones from random noise.',
        ],
        indianExample: 'After a surprise RBI policy announcement or quarterly result, a 3% gap-and-go impulse often leaves an FVG backed by 4× average volume.',
        keyPoints: [
          'Bullish FVG = gap between Candle 1 High and Candle 3 Low across a strong Candle 2 impulse.',
          'Zones without structural break (BOS) or volume displacement have low reliability.',
          'Always use hard invalidation stops; never assume an Order Block must hold.',
        ],
      },
    ],
    exercise: {
      id: 'm13-ex-1',
      title: 'Distinguishing BOS from CHoCH',
      scenario: 'An NSE stock is in a clear Uptrend printing Higher Highs (₹600 → ₹640 → ₹685) and Higher Lows (₹575 → ₹612 → ₹650). Today, heavy selling drives a decisive daily close at ₹638 (below the ₹650 Higher Low).',
      prompt: 'How is this ₹638 breakdown classified in market-structure terms?',
      options: [
        {
          id: 'a',
          label: 'Bullish Break of Structure (BOS) confirming immediate new highs',
          feedback: 'Incorrect. Breaking below the protected Higher Low opposes the prior uptrend.',
          isCorrect: false,
        },
        {
          id: 'b',
          label: 'Bearish Change of Character (CHoCH): the sequence of Higher Lows was broken, warning of consolidation or trend reversal',
          feedback: 'Correct! Breaking the ₹650 Higher Low that led to the ₹685 peak marks a structural Change of Character.',
          isCorrect: true,
        },
        {
          id: 'c',
          label: 'Dividend adjustment',
          feedback: 'Incorrect. This is an open-market swing breakdown.',
          isCorrect: false,
        },
      ],
    },
    practicalTask: {
      title: 'Spot Swing Breaks on 3M & 6M Charts',
      instructions: 'Inspect TATAMOTORS or ICICIBANK on a 6M Candlestick chart in the Trade Terminal and trace where Higher Lows held vs where structure shifted.',
      targetSymbol: 'ICICIBANK',
      relatedGameId: 'bull-vs-bear-market',
      relatedGameTitle: 'Bull vs Bear Market',
    },
    quiz: [
      {
        id: 'm13-q1',
        question: 'In a 3-candle sequence during a sharp upward impulse, when does a Bullish Fair Value Gap (FVG) exist?',
        options: [
          'When all three candles are Dojis with identical highs and lows',
          'When Candle 1’s High is lower than Candle 3’s Low, leaving an un-overlapped section on Candle 2’s body',
          'Only when trading volume is zero',
          'Only on the last Friday of March',
        ],
        correctIndex: 1,
        explanation: 'When Candle 3’s Low stays above Candle 1’s High during a strong upward Candle 2 expansion, a 3-bar bullish imbalance (FVG) is formed.',
      },
      {
        id: 'm13-q2',
        question: 'Why is an explicit methodological caveat important when studying Order Blocks, BOS, and CHoCH?',
        options: [
          'Because SEBI publishes official Order Block levels at 09:00 IST',
          'Because definitions (wick vs body close, minor vs major swing) vary across practitioners, so rules must be standardized before backtesting',
          'Because price action only applies to commodities',
          'Because candlesticks do not have highs or lows',
        ],
        correctIndex: 1,
        explanation: 'Without consistent swing and close definitions, traders fall prey to hindsight bias—labelling whichever zone worked after the fact.',
      },
    ],
  },

  {
    id: 'module-14',
    number: 14,
    level: 'Intermediate',
    levelBadge: 'Level 2 • Intermediate',
    title: 'Volume, Open Interest and Market Participation',
    subtitle: 'Cash Volume vs F&O Open Interest (OI), the 4-case Price + OI matrix, Put-Call Ratio (PCR), Market Breadth, and convention caveats.',
    estimatedMinutes: 25,
    xpReward: 150,
    learningObjectives: [
      'Differentiate traded Volume (activity flow per session) from Open Interest (total outstanding unsettled derivative contracts).',
      'Interpret the 4-regime Price + Open Interest participation matrix and understand why futures vs options OI require distinct reading.',
      'Calculate Put-Call Ratio (PCR by OI and by Volume) and Advance-Decline Market Breadth with proper caveats.',
    ],
    lessons: [
      {
        id: 'm14-lesson-1',
        title: '14.1 Volume vs Open Interest & The 4-Regime Price + OI Matrix',
        estimatedMinutes: 13,
        summary: 'Tracking whether price moves are driven by fresh aggressive positions or existing traders exiting.',
        paragraphs: [
          'Volume counts total shares or contracts traded during a session—it resets to zero every morning at 09:15 IST. Open Interest (OI) applies to Futures and Options and measures the total number of active, unsettled contracts open at a given moment (1 buyer + 1 seller of a new contract = +1 contract of OI, not +2).',
          'When both buyer and seller initiate new positions, OI rises; when both close existing positions, OI falls; when one new trader replaces an exiting trader, OI stays unchanged. Combining Futures Price change with OI change yields four classic market-participation interpretations (see table below).',
        ],
        indianExample: 'If NIFTY Futures rally +1.2% while Futures OI drops −8%, much of the rally may be driven by Short Covering (trapped bears buying back shorts) rather than fresh institutional longs.',
        keyPoints: [
          'Volume = session turnover (flow); Open Interest = open unsettled derivative contracts (stock).',
          'Price ↑ + OI ↑ = Long Buildup; Price ↓ + OI ↑ = Short Buildup.',
          'Price ↑ + OI ↓ = Short Covering; Price ↓ + OI ↓ = Long Unwinding.',
        ],
        table: {
          caption: 'Conventional Futures Price + Open Interest (OI) Matrix',
          headers: ['Price Change', 'Open Interest (OI)', 'Conventional Label', 'Market Interpretation'],
          rows: [
            ['Price Rising (↑)', 'OI Rising (↑)', 'Long Buildup', 'Fresh bullish contracts being opened aggressively'],
            ['Price Falling (↓)', 'OI Rising (↑)', 'Short Buildup', 'Fresh bearish short positions being initiated'],
            ['Price Rising (↑)', 'OI Falling (↓)', 'Short Covering', 'Existing shorts buying back to exit, pushing price up'],
            ['Price Falling (↓)', 'OI Falling (↓)', 'Long Unwinding', 'Existing longs selling to close positions, pressuring price'],
          ],
        },
        caveatNote: 'Important Convention Caveat: Every derivative contract has both 1 long and 1 short! The 4-case labels infer which side was the more urgent aggressor from price direction. In Options chains, heavy strike OI is often interpreted from the Option Seller’s (writer’s) perspective because option writing requires large margin—always cross-check price structure rather than treating OI walls as unbreakable!',
        visualizer: {
          kind: 'PRICE_OI_PARTICIPATION_MATRIX',
          title: 'Interactive Price + Open Interest & PCR Interpreter',
          caption: 'Explore the 4 Price + OI regimes and compute Put-Call Ratio (PCR) from total Put and Call Open Interest.',
        },
      },
      {
        id: 'm14-lesson-2',
        title: '14.2 Put-Call Ratio (PCR) & Advance-Decline Market Breadth',
        estimatedMinutes: 12,
        summary: 'Checking whether a headline index move is supported by broad stock participation.',
        paragraphs: [
          'Put-Call Ratio (PCR) divides Total Put Open Interest by Total Call Open Interest across an expiry (PCR-OI = Total Put OI / Total Call OI; PCR-Volume = Put Volume / Call Volume). In Indian index options convention, because institutional/professional option writers sell Puts at perceived support, a moderately elevated PCR (e.g., 1.0–1.3) often reflects heavy put writing, whereas extreme readings can signal crowded positioning susceptible to sharp squeezes.',
          'Market Breadth (Advance-Decline Ratio) compares how many NSE stocks closed up versus down. If NIFTY 50 hits a new high carried by just 4 heavyweight stocks while 1,600 broader NSE stocks decline, narrow breadth warns of fragile underlying participation.',
        ],
        indianExample: 'During weekly index expiry days (0 DTE), intraday OI and PCR swing wildly due to hedging spreads and gamma scalping—avoid over-reading expiry-afternoon PCR!',
        keyPoints: [
          'PCR (OI) = Total Put OI / Total Call OI.',
          'Advance-Decline Breadth confirms whether rallies have broad participation or narrow divergence.',
          'Expiry-day options OI is heavily influenced by multi-leg spreads (straddles, iron condors), not naked directional bets alone.',
        ],
      },
    ],
    exercise: {
      id: 'm14-ex-1',
      title: 'Interpreting Price + OI Action',
      scenario: 'BANKNIFTY Futures drop 1.6% during the session while Futures Open Interest surges by +14% on heavy volume.',
      prompt: 'Under standard market participation conventions, what does Price ↓ + OI ↑ indicate?',
      options: [
        {
          id: 'a',
          label: 'Short Covering',
          feedback: 'Short covering occurs when Price rises while OI falls.',
          isCorrect: false,
        },
        {
          id: 'b',
          label: 'Short Buildup (fresh short positions being opened aggressively as price falls)',
          feedback: 'Correct! Falling price accompanied by rising Open Interest indicates net fresh short initiation.',
          isCorrect: true,
        },
        {
          id: 'c',
          label: 'Long Buildup',
          feedback: 'Long buildup corresponds to rising price + rising OI.',
          isCorrect: false,
        },
      ],
    },
    practicalTask: {
      title: 'Inspect Live/Simulated Strike OI & PCR in Options Chain',
      instructions: 'Open Trade Terminal → Options Paper Trading (or play Option Chain Explorer) to examine Call OI vs Put OI across strikes and the live computed PCR.',
      targetSymbol: 'NIFTY',
      relatedGameId: 'option-chain-explorer',
      relatedGameTitle: 'Option Chain Explorer',
    },
    quiz: [
      {
        id: 'm14-q1',
        question: 'Trader A (with no prior position) buys 1 lot of NIFTY Futures from Trader B (who also had no prior position and initiates a new short). How does Open Interest change?',
        options: [
          'Open Interest increases by 2 lots',
          'Open Interest increases by 1 lot',
          'Open Interest decreases by 1 lot',
          'Open Interest stays zero',
        ],
        correctIndex: 1,
        explanation: 'One active derivative contract pairs one buyer and one seller, increasing total Open Interest by 1 contract (1 lot).',
      },
      {
        id: 'm14-q2',
        question: 'If Total Put OI across NIFTY strikes is 1,32,00,000 and Total Call OI is 1,10,00,000, what is PCR (OI)?',
        options: ['0.83', '1.20', '2.42', '1.00'],
        correctIndex: 1,
        explanation: 'PCR (OI) = Total Put OI / Total Call OI = 1,32,00,000 / 1,10,00,000 = 1.20.',
      },
    ],
  },

  // =========================================================================
  // LEVEL 3: ADVANCED — DERIVATIVES, RISK & TRADING SYSTEMS (MODULES 15–16)
  // =========================================================================
  {
    id: 'module-15',
    number: 15,
    level: 'Advanced',
    levelBadge: 'Level 3 • Advanced',
    title: 'Futures and Options (Derivatives)',
    subtitle: 'Futures mark-to-market, Calls & Puts, ITM/ATM/OTM, Intrinsic & Time Value, IV, Option Greeks, expiry risks, and SEBI’s 93% loss study.',
    estimatedMinutes: 32,
    xpReward: 180,
    learningObjectives: [
      'Understand Futures leverage & daily MTM vs Call (CE) and Put (PE) asymmetric payoffs for buyers vs writers.',
      'Decompose Option Premium = Intrinsic Value + Extrinsic (Time) Value across ITM, ATM, and OTM strikes.',
      'Interpret Implied Volatility (IV) and Option Greeks (Delta, Gamma, Theta, Vega, Rho) as local sensitivity estimates, alongside SEBI’s empirical retail F&O loss findings.',
    ],
    lessons: [
      {
        id: 'm15-lesson-1',
        title: '15.1 Futures, Calls (CE), Puts (PE), Moneyness & Intrinsic vs Time Value',
        estimatedMinutes: 16,
        summary: 'How derivative contracts derive value from an underlying asset and why buyers vs sellers face opposite risk profiles.',
        paragraphs: [
          'A Derivative is an exchange-traded contract whose value derives from an underlying asset (such as NIFTY 50, NIFTY Bank, SENSEX, or an approved F&O stock) traded in fixed Lot Sizes. A Futures contract obligates both buyer and seller to transact at expiry, with daily Mark-to-Market (MTM) settlement of gains/losses against SPAN + Exposure margin—meaning leverage magnifies losses rupee-for-rupee in both directions.',
          'An Option grants the Buyer the right, but not the obligation, in exchange for paying an upfront Premium; the Option Seller (Writer) collects that premium and takes on the obligation (requiring heavy margin and facing potentially large or uncapped losses). In India, index options are European-style (cash-settled at expiry): Call Option (CE) profits at expiry if Spot > Strike + Premium paid; Put Option (PE) profits at expiry if Spot < Strike − Premium paid.',
        ],
        indianExample: 'If NIFTY Spot is 24,520 and you buy a 24,500 CE trading at ₹180 (lot size 75): Intrinsic Value = max(0, 24,520 − 24,500) = ₹20; Time (Extrinsic) Value = ₹180 − ₹20 = ₹160. Your max loss as buyer is ₹180 × 75 = ₹13,500 (plus charges) if NIFTY expires ≤ 24,500.',
        keyPoints: [
          'Call Intrinsic = max(0, Spot − Strike); Put Intrinsic = max(0, Strike − Spot).',
          'Option Premium = Intrinsic Value + Extrinsic (Time & Volatility) Value.',
          'Moneyness: ITM (Intrinsic > 0), ATM (Strike ≈ Spot), OTM (Intrinsic = 0, 100% decaying Time Value).',
        ],
        formulas: [
          { label: 'Long Call Expiry Payoff', expression: 'max(0, Spot_Expiry − Strike) − Premium Paid', note: 'Breakeven at expiry = Strike + Premium Paid.' },
          { label: 'Long Put Expiry Payoff', expression: 'max(0, Strike − Spot_Expiry) − Premium Paid', note: 'Breakeven at expiry = Strike − Premium Paid.' },
          { label: 'Option Premium', expression: 'Intrinsic Value + Extrinsic (Time) Value', note: 'At expiry, Extrinsic Value decays to ₹0.' },
        ],
        visualizer: {
          kind: 'OPTIONS_PAYOFF_GREEKS',
          title: 'Interactive Options Payoff & Local Greeks Sensitivity Lab',
          caption: 'Switch between Buy Call, Sell Call, Buy Put, and Sell Put across strikes, days to expiry, and IV to inspect Breakeven, Max Risk, and Delta/Gamma/Theta/Vega.',
        },
      },
      {
        id: 'm15-lesson-2',
        title: '15.2 Implied Volatility, Option Greeks, Expiry Risks & SEBI’s 93% Study',
        estimatedMinutes: 16,
        summary: 'Why buying cheap OTM options before events often loses money even when you guess direction right!',
        paragraphs: [
          'Implied Volatility (IV) reflects the market’s priced expectation of future volatility embedded in option premiums. Before major events (Union Budget, RBI MPC, corporate results), IV expands—making options expensive. Immediately after the event is announced, IV collapses (“IV Crush”), often causing both Call and Put buyers to lose money simultaneously if the underlying move is smaller than priced.',
          'Option Greeks estimate local partial-derivative sensitivities (holding other inputs constant—they shift dynamically as price and time move!): Delta (Δ: premium change per ₹1 underlying move), Gamma (Γ: rate of change of Delta, highest for ATM near expiry), Theta (Θ: daily time-decay erosion, accelerating sharply near expiry), Vega (ν: sensitivity to 1% change in IV), and Rho (ρ: interest-rate sensitivity).',
          'Empirical Reality Check: SEBI’s official study of individual traders in the equity F&O segment across FY2022–FY2024 found that approximately 93% of individual F&O traders incurred net losses, with transaction costs significantly widening losses for frequent over-traders. Treat derivatives strictly as advanced risk-transfer instruments, never shortcuts to quick wealth.',
        ],
        indianExample: 'On expiry afternoon, an ATM option’s Gamma becomes extreme: a 60-point NIFTY flick can swing option premiums by 50–80% in minutes while Theta melts OTM strikes to ₹0.05.',
        keyPoints: [
          'Delta (direction), Gamma (convexity/acceleration), Theta (time decay), Vega (IV sensitivity), Rho (rates) are local estimates—not static constants.',
          'Stock options in India settle physically at expiry if ITM—requiring full contract delivery margin/shares if not squared off!',
          'SEBI Study (FY22–FY24): ~93% of individual F&O traders lost money net of transaction costs.',
        ],
        caveatNote: 'Regulatory & Risk Warning: Greeks are local model sensitivities that change continuously during fast moves and gaps. Never sell naked options without understanding tail-risk gaps, margin calls, illiquid strike spreads, and physical-settlement rules on stock options.',
      },
    ],
    exercise: {
      id: 'm15-ex-1',
      title: 'IV Crush & Theta Decay Diagnosis',
      scenario: 'Ahead of a major policy announcement, NIFTY is at 24,400 and Implied Volatility (IV) is elevated at 24%. A trader buys a 2-days-to-expiry 24,700 OTM Call for ₹95. After the announcement, NIFTY rises +90 points to 24,490, while IV drops from 24% to 13%.',
      prompt: 'What most likely happens to the ₹95 OTM Call premium?',
      options: [
        {
          id: 'a',
          label: 'It guaranteed doubles to ₹190 because NIFTY went up 90 points',
          feedback: 'Incorrect! OTM options have low Delta and high Vega/Theta exposure.',
          isCorrect: false,
        },
        {
          id: 'b',
          label: 'It likely drops sharply in price: negative Vega (11-point IV crush) and negative Theta outweigh the modest positive Delta gain on an still-OTM 24,700 strike',
          feedback: 'Correct! Buying expensive high-IV OTM options right before known events routinely loses to IV crush + Theta decay despite getting direction right.',
          isCorrect: true,
        },
        {
          id: 'c',
          label: 'Intrinsic value becomes ₹210',
          feedback: 'At Spot 24,490, a 24,700 Call is still 210 points Out-of-the-Money—its Intrinsic Value is ₹0.',
          isCorrect: false,
        },
      ],
    },
    practicalTask: {
      title: 'Explore Two-Sided Index Option Chains & Paper Trade Lots',
      instructions: 'Open Trade Terminal → Options Paper Trading → select NIFTY or BANKNIFTY, inspect ITM/ATM/OTM strikes, DTE, and Greeks, or play Option Chain Explorer.',
      targetSymbol: 'NIFTY',
      relatedGameId: 'option-chain-explorer',
      relatedGameTitle: 'Option Chain Explorer',
    },
    quiz: [
      {
        id: 'm15-q1',
        question: 'NIFTY Spot is 24,600. A 24,450 Put Option (PE) is trading at ₹58. What are its Intrinsic Value and Time Value?',
        options: [
          'Intrinsic Value = ₹150; Time Value = ₹0',
          'Intrinsic Value = ₹0 (it is Out-of-the-Money); Time Value = ₹58',
          'Intrinsic Value = ₹58; Time Value = ₹150',
          'Intrinsic Value = ₹29; Time Value = ₹29',
        ],
        correctIndex: 1,
        explanation: 'Put Intrinsic Value = max(0, Strike − Spot) = max(0, 24,450 − 24,600) = ₹0. All ₹58 of the OTM Put’s premium is decaying Time (Extrinsic) Value.',
      },
      {
        id: 'm15-q2',
        question: 'What did SEBI’s multi-year empirical study (FY2022–FY2024) reveal about individual retail participants in equity F&O?',
        options: [
          '95% of retail option buyers beat NIFTY 50 every month',
          'Approximately 93% of individual F&O traders incurred net losses, exacerbated by transaction costs and overtrading',
          'Option sellers can never lose money in gap openings',
          'Theta decay increases option buyer profits when the market stays flat',
        ],
        correctIndex: 1,
        explanation: 'SEBI’s study documented that roughly 9 out of 10 (~93%) individual F&O traders lost money, underscoring the critical need for education, risk limits, and paper simulation.',
      },
    ],
  },

  {
    id: 'module-16',
    number: 16,
    level: 'Advanced',
    levelBadge: 'Level 3 • Advanced',
    title: 'Trading Systems and Advanced Analysis',
    subtitle: 'Position sizing formula (Entry > Stop validated), 8-Step Competence Sequence, 8-Rule Trend-Pullback System, Expectancy, Drawdown, and Backtesting Checklist.',
    estimatedMinutes: 30,
    xpReward: 200,
    learningObjectives: [
      'Calculate exact Position Size = Max Planned ₹ Loss / |Entry − Stop| so every trade risks a fixed, survivable fraction (e.g., 1%) of capital.',
      'Master Expectancy, Asymmetric Drawdown Recovery math, Portfolio Correlation, and the 8-Rule Trend-Pullback System.',
      'Audit any trading idea against the Backtesting Checklist (look-ahead bias, survivorship bias, slippage/STT costs, out-of-sample testing) and follow the 8-Step Competence Sequence.',
    ],
    lessons: [
      {
        id: 'm16-lesson-1',
        title: '16.1 Position Sizing, Asymmetric Drawdown Math & Expectancy',
        estimatedMinutes: 15,
        summary: 'Why win rate alone is meaningless without Reward-to-Risk and survival position sizing.',
        paragraphs: [
          'Professional risk management starts with survival math: losses compound asymmetrically! A −10% drawdown requires an +11.1% gain to recover; a −25% drawdown requires +33.3%; a −50% drawdown requires a +100% gain just to get back to breakeven. By capping risk per trade at 0.5%–1.0% of total capital, even a string of 6 consecutive losing trades leaves >94% of your capital and composure intact.',
          'Never pick share quantity arbitrarily (like “buy 100 shares of everything”). Instead, set your technical invalidation Stop-Loss first, validate that Entry > Stop for a Long trade (or Stop > Entry for a Short), and compute exact share quantity using Position Size = Max Planned ₹ Loss / (Entry − Stop). Evaluate system edge via Mathematical Expectancy: E = (Win% × Avg Win) − (Loss% × Avg Loss) net of all costs.',
        ],
        indianExample: 'On ₹1,00,000 capital risking 1% (₹1,000 max loss): buying a stock at ₹540 with technical stop at ₹515 risks ₹25/share → Position Size = 1,000 / 25 = 40 shares (₹21,600 capital deployed, ₹1,000 defined risk).',
        keyPoints: [
          'Long Trade Position Size = Max Planned Loss (₹) / (Entry Price − Stop Price), strictly requiring Entry > Stop.',
          'A 45% win-rate system with 2.5R average winners has positive expectancy: (0.45 × 2.5R) − (0.55 × 1R) = +0.575R per trade!',
          'Watch Portfolio Heat: risking 1% each on 5 highly correlated PSU bank stocks simultaneously equals a 5% single-theme bet.',
        ],
        formulas: [
          {
            label: 'Long Position Size (Shares)',
            expression: 'floor( Max Planned ₹ Loss / (Entry Price − Stop Price) )   [Requires Entry > Stop]',
            note: 'Also cap total position value by available cash / maximum single-position allocation limit.',
          },
          {
            label: 'System Expectancy (per trade)',
            expression: '(Win Rate × Average Win) − (Loss Rate × Average Loss) − Avg Costs',
            note: 'Must be strictly > 0 across a statistically meaningful sample after STT, brokerage, and slippage.',
          },
          {
            label: 'Drawdown Recovery Required (%)',
            expression: '[ 1 / (1 − Drawdown_Fraction) ] − 1',
            note: '50% loss requires 1 / 0.50 − 1 = +100% gain to recover.',
          },
        ],
        visualizer: {
          kind: 'POSITION_SIZING_EXPECTANCY',
          title: 'Position-Sizing, R-Multiple & Drawdown Survival Calculator',
          caption: 'Compute exact share quantity with Entry > Stop validation, capital cap check, Reward:Risk ratio, and Expectancy.',
        },
      },
      {
        id: 'm16-lesson-2',
        title: '16.2 The 8-Rule Trend-Pullback System, Backtesting Traps & 8-Step Competence Sequence',
        estimatedMinutes: 15,
        summary: 'Turning market concepts into an objective, auditable process free from FOMO and hindsight bias.',
        paragraphs: [
          'A complete trading system specifies every rule before market open—leaving zero room for impulsive guesswork. Reference Educational System (8-Rule Trend-Pullback Framework): (1) Universe Filter: Liquid NIFTY 200 equities to minimise spread/manipulation; (2) Regime Filter: Index & stock above rising 50-day and 200-day SMA; (3) Setup: Orderly multi-day pullback into 20 EMA / prior broken resistance support zone on contracting volume; (4) Trigger: Bullish rejection/reversal close confirming demand; (5) Invalidation Stop: Below pullback swing low or 1.5× ATR buffer; (6) Position Sizing: Fixed ≤1% capital risk via formula; (7) Exit & Trail: Partial/trail rule or ≥2R structured exit; (8) Post-Trade Journal Review.',
          'Before trusting any strategy, audit it with the Backtesting Checklist: eliminate Look-Ahead Bias (using future candle highs/lows before bar close), Survivorship Bias (testing only today’s winners while ignoring delisted/demoted stocks), Overfitting (curve-fitting 12 parameters to past noise), and Friction Omission (ignoring STT, stamp duty, brokerage, and gap slippage). Progress patiently through the 8-Step Competence Sequence: Market Plumbing → Statement Literacy → Valuation → Chart & S/R → Risk Sizing → Paper Simulation (30–50 logged trades) → Post-Trade Audit → Tiny Unleveraged Capital only after proven discipline.',
        ],
        indianExample: 'Even a well-placed ₹515 stop-loss can fill at ₹498 if a stock gaps down −4% at 09:15 IST on overnight news—which is why avoiding excessive leverage and single-stock concentration is essential.',
        keyPoints: [
          'Backtest Checklist: Check for Look-Ahead Bias, Survivorship Bias, Curve-Fitting, Transaction Costs, and Out-of-Sample stability.',
          'Overnight Gap Risk means actual loss can occasionally exceed planned stop distance.',
          'Log every paper trade’s entry reason, stop, emotion, and post-exit lesson.',
        ],
        table: {
          caption: 'The 8-Step Market Competence Sequence',
          headers: ['Step', 'Stage', 'Milestone Requirement'],
          rows: [
            ['1', 'Financial Foundation', 'Emergency fund, health/term cover, zero high-cost debt'],
            ['2', 'Market Plumbing', 'Master NSE/BSE, SEBI, Demat, T+1, order types & statutory charges'],
            ['3', 'Statement & Ratio Literacy', 'Read P&L, Balance Sheet, CFO vs PAT, ROE/ROCE, and red flags'],
            ['4', 'Valuation & Macro Context', 'Apply 9-item checklist, Bear/Base/Bull valuation, sector drivers'],
            ['5', 'Structure & Price Action', 'Read OHLC, S/R zones, volume/OI participation, clean indicators'],
            ['6', 'Risk & Position Sizing', 'Enforce ≤1% risk per trade, Entry > Stop validation, correlation caps'],
            ['7', 'Structured Paper Trading', 'Execute & journal 30–50 rule-based simulated trades across regimes'],
            ['8', 'Continuous Review', 'Audit expectancy, mistakes, and emotional discipline before scaling'],
          ],
        },
      },
    ],
    exercise: {
      id: 'm16-ex-1',
      title: 'Exact Position-Sizing Calculation',
      scenario: 'Your paper trading account has ₹1,00,000. Your rule caps maximum risk per trade at 1% (₹1,000). You plan a Long entry in Larsen & Toubro at ₹3,620 with technical invalidation stop-loss at ₹3,540.',
      prompt: 'What is the maximum number of shares your risk formula permits?',
      options: [
        {
          id: 'a',
          label: '27 shares (spending all ₹1,00,000 cash)',
          feedback: '27 shares × ₹80 stop distance = ₹2,160 loss (2.16% risk), violating your 1% risk cap!',
          isCorrect: false,
        },
        {
          id: 'b',
          label: '12 shares: floor( ₹1,000 / (₹3,620 − ₹3,540) ) = floor(1,000 / 80) = 12 shares (₹960 defined risk)',
          feedback: 'Exact! Risk per share is ₹80, so 12 shares risk ₹960 (≤ ₹1,000 limit) and deploy ₹43,440 of capital.',
          isCorrect: true,
        },
        {
          id: 'c',
          label: '100 shares on intraday leverage',
          feedback: '100 shares × ₹80 risk = ₹8,000 loss (8% of account on a single trade!).',
          isCorrect: false,
        },
      ],
    },
    practicalTask: {
      title: 'Complete the Risk Manager Challenge',
      instructions: 'Launch the Risk Manager Challenge in the Play tab to practice position sizing, R-multiples, and portfolio heat limits.',
      targetSymbol: 'LT',
      relatedGameId: 'risk-manager-challenge',
      relatedGameTitle: 'Risk Manager Challenge',
    },
    quiz: [
      {
        id: 'm16-q1',
        question: 'If a trader suffers a 50% account drawdown (₹1,00,000 drops to ₹50,000), what percentage return on the remaining ₹50,000 is required just to return to ₹1,00,000?',
        options: ['+50%', '+75%', '+100%', '+25%'],
        correctIndex: 2,
        explanation: 'Turning ₹50,000 back into ₹1,00,000 requires a ₹50,000 profit on a ₹50,000 base = +100% return.',
      },
      {
        id: 'm16-q2',
        question: 'Testing a strategy only on the 50 companies currently inside NIFTY 50 today while ignoring companies that underperformed and were removed over the past decade is an example of:',
        options: [
          'Survivorship Bias',
          'Value Investing',
          'Free-Float Weighting',
          'T+1 Settlement',
        ],
        correctIndex: 0,
        explanation: 'Survivorship bias inflates historical backtest returns by testing only surviving winners and excluding dropped or failed constituents.',
      },
    ],
  },
];

// ===========================================================================
// OPTIONAL 12-WEEK STRUCTURED STUDY SCHEDULE (NON-BLOCKING)
// ===========================================================================
export const STUDY_SCHEDULE_12_WEEKS: StudyWeekPlan[] = [
  {
    week: 1,
    level: 'Beginner',
    focusModules: ['module-1', 'module-2'],
    goal: 'Master equity ownership, Primary vs Secondary markets, SEBI/NSE/BSE/CDSL/NSDL roles, and T+1 settlement.',
    practiceTask: 'Inspect 5 NSE quotes and trace T+1 settlement flow.',
  },
  {
    week: 2,
    level: 'Beginner',
    focusModules: ['module-3', 'module-4'],
    goal: 'Understand free-float indices (NIFTY 50, SENSEX, NIFTY Bank), bid-ask spreads, slippage, and Limit vs Market orders.',
    practiceTask: 'Play Trade Decision Simulator (Beginner) and place 2 paper Limit orders.',
  },
  {
    week: 3,
    level: 'Beginner',
    focusModules: ['module-5'],
    goal: 'Establish emergency-fund readiness, compounding vs inflation math, multi-sector diversification, and tax holding awareness.',
    practiceTask: 'Complete Portfolio Builder game across equity, debt, and gold.',
  },
  {
    week: 4,
    level: 'Intermediate',
    focusModules: ['module-6'],
    goal: 'Read Consolidated P&L, Balance Sheet (Assets = Liabilities + Equity), and cross-check CFO against PAT.',
    practiceTask: 'Use the Balance Sheet & Cash Flow visualizer to test receivable spikes.',
  },
  {
    week: 5,
    level: 'Intermediate',
    focusModules: ['module-7'],
    goal: 'Calculate EPS, P/E, P/B, ROE, ROCE, D/E, Margins, and Free Cash Flow while spotting leverage/value traps.',
    practiceTask: 'Compare TCS (IT) vs HDFCBANK (Banking) ratios in the Ratio Lab.',
  },
  {
    week: 6,
    level: 'Intermediate',
    focusModules: ['module-8'],
    goal: 'Apply the 9-Item Company Analysis Checklist, promoter pledge checks, and DCF / DDM (r > g) Bear/Base/Bull valuation.',
    practiceTask: 'Complete and save a Company Research Worksheet for an NSE company.',
  },
  {
    week: 7,
    level: 'Intermediate',
    focusModules: ['module-9'],
    goal: 'Connect RBI Repo Rate, CPI inflation, INR/USD, crude oil, and FII/DII flows to Indian sector performance.',
    practiceTask: 'Play Market Crash Survival and test sector rotation sensitivity.',
  },
  {
    week: 8,
    level: 'Intermediate',
    focusModules: ['module-10', 'module-11'],
    goal: 'Read OHLC candlesticks in context, identify HH/HL vs LH/LL regimes, draw S/R zones, and spot polarity retests.',
    practiceTask: 'Complete Candlestick Detective & Bull vs Bear Market games.',
  },
  {
    week: 9,
    level: 'Intermediate',
    focusModules: ['module-12'],
    goal: 'Use SMA, EMA, RSI, MACD, Bollinger Bands, VWAP, and ATR cleanly without indicator clutter.',
    practiceTask: 'Overlay SMA 20 + EMA 50 + RSI 14 on 3 NSE stocks across 3M and 1Y charts.',
  },
  {
    week: 10,
    level: 'Intermediate',
    focusModules: ['module-13', 'module-14'],
    goal: 'Analyse BOS vs CHoCH, FVGs, Volume vs Open Interest 4-case matrix, PCR, and Advance-Decline breadth.',
    practiceTask: 'Compare Futures Price+OI scenarios and inspect NIFTY PCR.',
  },
  {
    week: 11,
    level: 'Advanced',
    focusModules: ['module-15'],
    goal: 'Understand Futures MTM, Call/Put moneyness, Intrinsic vs Time Value, IV crush, Greeks, and SEBI’s 93% F&O loss findings.',
    practiceTask: 'Complete Option Chain Explorer and inspect NIFTY/BANKNIFTY paper option lots.',
  },
  {
    week: 12,
    level: 'Advanced',
    focusModules: ['module-16'],
    goal: 'Enforce Position Size = Max Loss / (Entry − Stop), audit backtest biases, and journal structured paper trades.',
    practiceTask: 'Complete Risk Manager Challenge and pass the 6-Question Master Reference Check.',
  },
];

// ===========================================================================
// 6-QUESTION MASTER REFERENCE FINAL CHECK (FROM REFERENCE DOCUMENT)
// ===========================================================================
export const MASTER_REFERENCE_QUIZ: ModuleQuizQuestion[] = [
  {
    id: 'master-q1',
    question: '1. When you purchase 50 shares of Reliance Industries on NSE during regular trading hours, who receives your cash upon T+1 settlement?',
    options: [
      'Reliance Industries corporate bank account',
      'The investor who sold those 50 shares, settled through the Clearing Corporation',
      'SEBI Investor Protection Fund',
      'CDSL directly keeps the purchase value',
    ],
    correctIndex: 1,
    explanation: 'Routine NSE/BSE transactions occur in the Secondary Market between investors, guaranteed and settled via the Clearing Corporation on T+1.',
  },
  {
    id: 'master-q2',
    question: '2. A company reports growing Net Profit (PAT) for four consecutive years, yet cumulative Cash Flow from Operations (CFO) is negative. What does this signal?',
    options: [
      'Guaranteed multibagger dividend payout next quarter',
      'Accounting profits are not converting into cash (often stuck in receivables/inventory), requiring forensic working-capital scrutiny',
      'The Balance Sheet equation Assets = Liabilities + Equity no longer holds',
      'The stock has zero beta',
    ],
    correctIndex: 1,
    explanation: 'Persistent divergence where PAT > 0 while cumulative CFO ≤ 0 warns of poor earnings quality or aggressive revenue recognition.',
  },
  {
    id: 'master-q3',
    question: '3. Why does the constant-growth Dividend Discount Model P₀ = D₁ / (r − g) fail if someone inputs g = 14% and r = 11%?',
    options: [
      'Because dividends in India are paid in USD',
      'Because the infinite geometric series converges only when r > g, and no firm can outgrow its discount rate and economy forever',
      'Because DDM only works on loss-making startups with ₹0 dividends',
      'Because r must always be 0%',
    ],
    correctIndex: 1,
    explanation: 'Mathematically and economically, perpetual constant-growth DDM strictly requires r > g.',
  },
  {
    id: 'master-q4',
    question: '4. On a chart in a strong uptrend, price closes decisively above a multi-month ₹800–₹810 resistance zone on 3× volume and later pulls back calmly to ₹805. Under Polarity (Role Reversal), how is ₹800–₹810 viewed?',
    options: [
      'As a potential new Support zone to watch for demand confirmation and defined invalidation',
      'As proof that price can never fall below ₹800 under any circumstance',
      'As a Shooting Star pattern',
      'As Long Unwinding in options',
    ],
    correctIndex: 0,
    explanation: 'Broken resistance frequently flips into potential support on retest, though a stop-loss below invalidation is still mandatory.',
  },
  {
    id: 'master-q5',
    question: '5. Ahead of a major event, an Out-of-the-Money Call option has high Implied Volatility (IV). Even if the underlying index rises modestly after the event, why can the Call buyer still lose money?',
    options: [
      'Because Call buyers have unlimited margin calls',
      'Because post-event IV Crush (negative Vega impact) plus Theta time decay can exceed the small positive Delta gain on an OTM strike',
      'Because lot sizes shrink after 12:00 IST',
      'Because SEBI cancels OTM options after announcements',
    ],
    correctIndex: 1,
    explanation: 'Option prices depend on Spot, Time, and Implied Volatility—sharp IV compression plus Theta decay erodes extrinsic premium rapidly.',
  },
  {
    id: 'master-q6',
    question: '6. With ₹2,00,000 capital and a 1% max risk rule (₹2,000 max loss), you plan a Long trade at ₹1,050 with a technical stop-loss at ₹1,010. What is your position size?',
    options: [
      '190 shares',
      '50 shares (₹2,000 max loss ÷ ₹40 per-share stop distance)',
      '200 shares',
      '10 shares',
    ],
    correctIndex: 1,
    explanation: 'Position Size = Max Planned Loss / (Entry − Stop) = ₹2,000 / (1,050 − 1,010) = 2,000 / 40 = 50 shares.',
  },
];

// ===========================================================================
// GLOSSARY OF ESSENTIAL INDIAN MARKET TERMS
// ===========================================================================
export const CURRICULUM_GLOSSARY: GlossaryEntry[] = [
  {
    term: 'Demat Account (NSDL / CDSL)',
    category: 'Market Structure',
    definition: 'Electronic custody account holding your shares and ETFs in dematerialised form under India’s two central depositories.',
  },
  {
    term: 'T+1 Rolling Settlement',
    category: 'Market Structure',
    definition: 'Settlement cycle where securities and funds obligations are finalised one working day after Trade Day (T).',
  },
  {
    term: 'Free-Float Market Cap',
    category: 'Market Structure',
    definition: 'Market value of publicly tradable shares (excluding locked-in promoter and strategic government holdings), used to weight NIFTY 50 and SENSEX.',
  },
  {
    term: 'Bid-Ask Spread & Slippage',
    category: 'Market Structure',
    definition: 'Spread is Best Ask minus Best Bid; Slippage is the cost difference between expected price and actual average fill across order-book depth.',
  },
  {
    term: 'Free Cash Flow (FCF)',
    category: 'Fundamental',
    definition: 'Cash Flow from Operations (CFO) minus Capital Expenditure (CapEx)—cash available for debt reduction, dividends, or reinvestment.',
  },
  {
    term: 'ROCE vs ROE',
    category: 'Fundamental',
    definition: 'ROCE = EBIT / Capital Employed (pre-leverage operating efficiency); ROE = Net Profit / Shareholders’ Equity (sensitive to debt leverage).',
  },
  {
    term: 'Promoter Share Pledge',
    category: 'Fundamental',
    definition: 'Shares pledged by company promoters as loan collateral; heavy pledging creates forced-liquidation risk during price drops.',
  },
  {
    term: 'Polarity (Role Reversal)',
    category: 'Technical',
    definition: 'Tendency of a decisively broken Resistance zone to act as potential Support on subsequent retests (and vice versa).',
  },
  {
    term: 'BOS & CHoCH',
    category: 'Technical',
    definition: 'Break of Structure (swing break continuing current trend) vs Change of Character (first break of protected opposing swing warning of shift).',
  },
  {
    term: 'Open Interest (OI) & PCR',
    category: 'Derivatives',
    definition: 'OI counts active unsettled derivative contracts; Put-Call Ratio (PCR) = Total Put OI / Total Call OI.',
  },
  {
    term: 'Intrinsic & Extrinsic (Time) Value',
    category: 'Derivatives',
    definition: 'Intrinsic Value is immediate in-the-money exercise value; Extrinsic Value is time + implied volatility premium that decays to ₹0 at expiry.',
  },
  {
    term: 'Option Greeks (Δ, Γ, Θ, ν, ρ)',
    category: 'Derivatives',
    definition: 'Local partial sensitivities of option premium to underlying price (Delta), Delta acceleration (Gamma), time decay (Theta), IV (Vega), and rates (Rho).',
  },
  {
    term: 'Position Sizing & R-Multiple',
    category: 'Risk',
    definition: 'Sizing shares via Max Loss / (Entry − Stop) so initial risk = 1R (e.g., 1% of capital), measuring outcomes in multiples of initial risk.',
  },
  {
    term: 'Survivorship & Look-Ahead Bias',
    category: 'Risk',
    definition: 'Backtesting errors caused by testing only surviving winners or accidentally using information not yet available at candle decision time.',
  },
];

// ===========================================================================
// RELIABLE OFFICIAL INDIAN MARKET RESOURCES
// ===========================================================================
export const OFFICIAL_RESOURCES: OfficialResourceLink[] = [
  {
    name: 'SEBI Investor Portal (Saarthi)',
    authority: 'Securities and Exchange Board of India',
    purpose: 'Official investor charters, margin/pledge circulars, F&O risk studies, and SCORES grievance redressal.',
    url: 'https://investor.sebi.gov.in/',
  },
  {
    name: 'NSE India — Market Data & Indices',
    authority: 'National Stock Exchange of India',
    purpose: 'Official NIFTY index methodologies, corporate announcements, shareholding patterns, and option chain specifications.',
    url: 'https://www.nseindia.com/',
  },
  {
    name: 'BSE India — Corporate Filings',
    authority: 'BSE Limited',
    purpose: 'Quarterly financial results, annual reports, board outcomes, and SENSEX index data.',
    url: 'https://www.bseindia.com/',
  },
  {
    name: 'NISM Financial Education Workbooks',
    authority: 'National Institute of Securities Markets (SEBI Capacity-Building Initiative)',
    purpose: 'Structured regulatory and securities market study primers for Indian students and practitioners.',
    url: 'https://www.nism.ac.in/',
  },
  {
    name: 'RBI Database on Indian Economy (DBIE)',
    authority: 'Reserve Bank of India',
    purpose: 'Official Monetary Policy Committee statements, Repo Rate history, CPI inflation, and banking credit data.',
    url: 'https://rbi.org.in/',
  },
];

export function getModuleById(moduleId: string): CurriculumModule | undefined {
  return CURRICULUM_16_MODULES.find((m) => m.id === moduleId);
}

export function computeOverallCourseProgress(completedModules: string[] = []): {
  completedCount: number;
  totalModules: number;
  percent: number;
  currentLevel: CurriculumLevel;
  nextRecommendedModule: CurriculumModule;
} {
  const validIds = new Set(CURRICULUM_16_MODULES.map((m) => m.id));
  const uniqueCompleted = Array.from(new Set(completedModules.filter((id) => validIds.has(id))));
  const completedCount = uniqueCompleted.length;
  const totalModules = CURRICULUM_16_MODULES.length; // 16
  const percent = Math.round((completedCount / totalModules) * 100);

  // Determine current learning level based on modules completed:
  // Beginner: Modules 1–5 | Intermediate: Modules 6–14 | Advanced: Modules 15–16
  const beginnerDone = CURRICULUM_16_MODULES.filter(
    (m) => m.level === 'Beginner' && uniqueCompleted.includes(m.id)
  ).length;
  const intermediateDone = CURRICULUM_16_MODULES.filter(
    (m) => m.level === 'Intermediate' && uniqueCompleted.includes(m.id)
  ).length;

  let currentLevel: CurriculumLevel = 'Beginner';
  if (beginnerDone >= 5 && intermediateDone >= 9) {
    currentLevel = 'Advanced';
  } else if (beginnerDone >= 5 || completedCount >= 5) {
    currentLevel = 'Intermediate';
  }

  const nextRecommendedModule =
    CURRICULUM_16_MODULES.find((m) => !uniqueCompleted.includes(m.id)) ||
    CURRICULUM_16_MODULES[CURRICULUM_16_MODULES.length - 1];

  return {
    completedCount,
    totalModules,
    percent,
    currentLevel,
    nextRecommendedModule,
  };
}
