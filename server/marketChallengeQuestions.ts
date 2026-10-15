export interface QuizQuestionDef {
  id: string;
  roundNumber: 1 | 2;
  questionNumber: number; // 1 to 10
  question: string;
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  visualType?: 'none' | 'trend_up' | 'trend_down' | 'trend_sideways' | 'doji' | 'hammer' | 'higher_highs' | 'lower_lows';
  visualData?: any;
}

export const MARKET_CHALLENGE_QUESTIONS: QuizQuestionDef[] = [
  // --------------------------------------------------------------------------
  // ROUND 1: MARKET BASICS (10 Questions)
  // --------------------------------------------------------------------------
  {
    id: 'r1_q1',
    roundNumber: 1,
    questionNumber: 1,
    question: 'What is a share?',
    options: [
      { key: 'A', text: 'Part ownership of a company' },
      { key: 'B', text: 'A bank loan' },
      { key: 'C', text: 'A tax' },
      { key: 'D', text: 'A currency' },
    ],
    correctOption: 'A',
    explanation: 'A share represents fractional ownership of a company.',
    visualType: 'none',
  },
  {
    id: 'r1_q2',
    roundNumber: 1,
    questionNumber: 2,
    question: 'What happens when you buy a stock at ₹100 and sell it at ₹120?',
    options: [
      { key: 'A', text: '₹20 profit' },
      { key: 'B', text: '₹20 loss' },
      { key: 'C', text: '₹100 profit' },
      { key: 'D', text: 'No change' },
    ],
    correctOption: 'A',
    explanation: 'Selling at ₹120 after buying at ₹100 gives a profit of ₹20 per share.',
    visualType: 'none',
  },
  {
    id: 'r1_q3',
    roundNumber: 1,
    questionNumber: 3,
    question: 'You buy 10 shares at ₹100 and sell them at ₹110. What is your profit?',
    options: [
      { key: 'A', text: '₹50' },
      { key: 'B', text: '₹100' },
      { key: 'C', text: '₹110' },
      { key: 'D', text: '₹200' },
    ],
    correctOption: 'B',
    explanation: 'Profit per share = ₹10. For 10 shares: 10 × ₹10 = ₹100.',
    visualType: 'none',
  },
  {
    id: 'r1_q4',
    roundNumber: 1,
    questionNumber: 4,
    question: 'What does a green candlestick generally show?',
    options: [
      { key: 'A', text: 'Price increased' },
      { key: 'B', text: 'Price decreased' },
      { key: 'C', text: 'Market closed' },
      { key: 'D', text: 'No trading' },
    ],
    correctOption: 'A',
    explanation: 'A green candlestick indicates that the price closed higher than it opened.',
    visualType: 'none',
  },
  {
    id: 'r1_q5',
    roundNumber: 1,
    questionNumber: 5,
    question: 'What does a red candlestick generally show?',
    options: [
      { key: 'A', text: 'Price increased' },
      { key: 'B', text: 'Price decreased' },
      { key: 'C', text: 'Company closed' },
      { key: 'D', text: 'No trading' },
    ],
    correctOption: 'B',
    explanation: 'A red candlestick indicates that the price closed lower than it opened.',
    visualType: 'none',
  },
  {
    id: 'r1_q6',
    roundNumber: 1,
    questionNumber: 6,
    question: 'What is a stock exchange (such as NSE or BSE)?',
    options: [
      { key: 'A', text: 'A marketplace where shares are bought and sold' },
      { key: 'B', text: 'A bank branch for loans' },
      { key: 'C', text: 'A tax office' },
      { key: 'D', text: 'A lottery shop' },
    ],
    correctOption: 'A',
    explanation: 'A stock exchange is an organized marketplace to buy and sell securities.',
    visualType: 'none',
  },
  {
    id: 'r1_q7',
    roundNumber: 1,
    questionNumber: 7,
    question: 'You buy a share for ₹200 and sell it for ₹180. What happened?',
    options: [
      { key: 'A', text: '₹20 profit' },
      { key: 'B', text: '₹20 loss' },
      { key: 'C', text: '₹30 profit' },
      { key: 'D', text: 'No change' },
    ],
    correctOption: 'B',
    explanation: 'Selling for ₹180 after buying for ₹200 resulted in a ₹20 loss.',
    visualType: 'none',
  },
  {
    id: 'r1_q8',
    roundNumber: 1,
    questionNumber: 8,
    question: 'What does diversification generally mean?',
    options: [
      { key: 'A', text: 'Putting all money into one stock' },
      { key: 'B', text: 'Spreading investments across different assets' },
      { key: 'C', text: 'Buying only expensive stocks' },
      { key: 'D', text: 'Selling everything immediately' },
    ],
    correctOption: 'B',
    explanation: 'Diversification spreads investments to reduce overall risk.',
    visualType: 'none',
  },
  {
    id: 'r1_q9',
    roundNumber: 1,
    questionNumber: 9,
    question: "If a company's business performs poorly, what could happen to its stock price?",
    options: [
      { key: 'A', text: 'It may fall' },
      { key: 'B', text: 'It must rise' },
      { key: 'C', text: 'It cannot change' },
      { key: 'D', text: 'The market closes' },
    ],
    correctOption: 'A',
    explanation: 'Poor earnings or lower growth expectations usually push share prices down.',
    visualType: 'none',
  },
  {
    id: 'r1_q10',
    roundNumber: 1,
    questionNumber: 10,
    question: 'What is virtual money in StockMate used for?',
    options: [
      { key: 'A', text: 'Practising trading without using real money' },
      { key: 'B', text: 'Paying real bills' },
      { key: 'C', text: 'Buying real shares' },
      { key: 'D', text: 'Paying taxes' },
    ],
    correctOption: 'A',
    explanation: 'StockMate provides virtual capital so students can practice without financial risk.',
    visualType: 'none',
  },

  // --------------------------------------------------------------------------
  // ROUND 2: CHART BASICS (10 Questions)
  // --------------------------------------------------------------------------
  {
    id: 'r2_q1',
    roundNumber: 2,
    questionNumber: 1,
    question: 'What is an uptrend?',
    options: [
      { key: 'A', text: 'Prices generally move upward' },
      { key: 'B', text: 'Prices generally move downward' },
      { key: 'C', text: 'Prices never change' },
      { key: 'D', text: 'Market is closed' },
    ],
    correctOption: 'A',
    explanation: 'An uptrend describes a market where prices are steadily rising over time.',
    visualType: 'trend_up',
    visualData: { steps: [100, 105, 110, 115] },
  },
  {
    id: 'r2_q2',
    roundNumber: 2,
    questionNumber: 2,
    question: 'What is a downtrend?',
    options: [
      { key: 'A', text: 'Prices generally move upward' },
      { key: 'B', text: 'Prices generally move downward' },
      { key: 'C', text: 'Prices stay exactly the same' },
      { key: 'D', text: 'No trading' },
    ],
    correctOption: 'B',
    explanation: 'A downtrend occurs when prices are consistently making lower lows and lower highs.',
    visualType: 'trend_down',
    visualData: { steps: [115, 110, 105, 100] },
  },
  {
    id: 'r2_q3',
    roundNumber: 2,
    questionNumber: 3,
    question: 'What is a sideways (consolidation) market?',
    options: [
      { key: 'A', text: 'Prices move horizontally within a range' },
      { key: 'B', text: 'Prices double every hour' },
      { key: 'C', text: 'Prices drop to zero instantly' },
      { key: 'D', text: 'Trading is stopped forever' },
    ],
    correctOption: 'A',
    explanation: 'In a sideways market, prices fluctuate within horizontal support and resistance levels.',
    visualType: 'trend_sideways',
    visualData: { steps: [100, 102, 99.5, 101.5, 99.8, 100.8] },
  },
  {
    id: 'r2_q4',
    roundNumber: 2,
    questionNumber: 4,
    question: 'What does a candlestick chart show for each time period?',
    options: [
      { key: 'A', text: 'Open, High, Low, and Close prices' },
      { key: 'B', text: 'Only the company CEO name' },
      { key: 'C', text: 'Bank account balances' },
      { key: 'D', text: 'List of all stock brokers' },
    ],
    correctOption: 'A',
    explanation: 'A candlestick displays the opening, highest, lowest, and closing prices.',
    visualType: 'none',
  },
  {
    id: 'r2_q5',
    roundNumber: 2,
    questionNumber: 5,
    question: 'What is a Hammer candlestick?',
    options: [
      { key: 'A', text: 'A small body with a long lower shadow' },
      { key: 'B', text: 'A physical carpentry tool' },
      { key: 'C', text: 'A broken computer screen' },
      { key: 'D', text: 'A chart with no prices' },
    ],
    correctOption: 'A',
    explanation: 'A Hammer has a small body near the top and a long lower shadow showing buyer rejection of lows.',
    visualType: 'hammer',
  },
  {
    id: 'r2_q6',
    roundNumber: 2,
    questionNumber: 6,
    question: 'What is a Doji candlestick?',
    options: [
      { key: 'A', text: 'Open and close prices are virtually identical' },
      { key: 'B', text: 'A stock that has gone bankrupt' },
      { key: 'C', text: 'A guaranteed win signal' },
      { key: 'D', text: 'An error in internet connection' },
    ],
    correctOption: 'A',
    explanation: 'A Doji forms when opening and closing prices are nearly equal, forming a plus or cross shape.',
    visualType: 'doji',
  },
  {
    id: 'r2_q7',
    roundNumber: 2,
    questionNumber: 7,
    question: 'What does a pattern of Higher Highs and Higher Lows show?',
    options: [
      { key: 'A', text: 'A healthy uptrend' },
      { key: 'B', text: 'A severe downtrend' },
      { key: 'C', text: 'A closed stock exchange' },
      { key: 'D', text: 'Zero trading' },
    ],
    correctOption: 'A',
    explanation: 'Higher Highs and Higher Lows define an uptrend structure.',
    visualType: 'higher_highs',
  },
  {
    id: 'r2_q8',
    roundNumber: 2,
    questionNumber: 8,
    question: 'You have ₹10,000 virtual cash. A stock costs ₹100 per share. How many shares can you buy?',
    options: [
      { key: 'A', text: '10 shares' },
      { key: 'B', text: '50 shares' },
      { key: 'C', text: '100 shares' },
      { key: 'D', text: '200 shares' },
    ],
    correctOption: 'C',
    explanation: '₹10,000 divided by ₹100 per share = 100 shares.',
    visualType: 'none',
  },
  {
    id: 'r2_q9',
    roundNumber: 2,
    questionNumber: 9,
    question: 'You buy 20 shares at ₹50. You sell them at ₹60. What is your total profit?',
    options: [
      { key: 'A', text: '₹100' },
      { key: 'B', text: '₹150' },
      { key: 'C', text: '₹200' },
      { key: 'D', text: '₹250' },
    ],
    correctOption: 'C',
    explanation: 'Profit per share = ₹10. Total profit = 20 × ₹10 = ₹200.',
    visualType: 'none',
  },
  {
    id: 'r2_q10',
    roundNumber: 2,
    questionNumber: 10,
    question: 'A stock is falling and the company announces weak results. What is the most disciplined action?',
    options: [
      { key: 'A', text: 'Pause and assess risk before making a decision' },
      { key: 'B', text: 'Panic and borrow maximum money' },
      { key: 'C', text: 'Blindly buy without checking data' },
      { key: 'D', text: 'Assume the price must double immediately' },
    ],
    correctOption: 'A',
    explanation: 'Disciplined investors pause and manage risk rather than reacting emotionally.',
    visualType: 'none',
  },
];

export function getQuestionsForRound(roundNumber: 1 | 2): QuizQuestionDef[] {
  return MARKET_CHALLENGE_QUESTIONS.filter(q => q.roundNumber === roundNumber);
}

export function getClientQuestionsForRound(roundNumber: 1 | 2) {
  return getQuestionsForRound(roundNumber).map(q => ({
    id: q.id,
    roundNumber: q.roundNumber,
    questionNumber: q.questionNumber,
    question: q.question,
    options: q.options,
    visualType: q.visualType,
    visualData: q.visualData,
  }));
}
