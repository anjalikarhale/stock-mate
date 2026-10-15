export interface ClientQuizQuestion {
  id: string;
  roundNumber: 1 | 2;
  questionNumber: number;
  question: string;
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  visualType?: 'none' | 'trend_up' | 'trend_down' | 'trend_sideways' | 'doji' | 'hammer' | 'higher_highs' | 'lower_lows';
  visualData?: any;
}

export interface StudentQuizAnswerRecord {
  questionId: string;
  roundNumber: number;
  questionNumber: number;
  selectedOption: 'A' | 'B' | 'C' | 'D';
  isCorrect?: boolean;
  score?: number;
  correctOption?: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
}

export const ROUND_1_QUESTIONS: ClientQuizQuestion[] = [
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
    visualType: 'none',
  },
];

export const ROUND_2_QUESTIONS: ClientQuizQuestion[] = [
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
    visualType: 'none',
  },
];

export function getQuizQuestionsForRound(roundNumber: 1 | 2): ClientQuizQuestion[] {
  return roundNumber === 1 ? ROUND_1_QUESTIONS : ROUND_2_QUESTIONS;
}
