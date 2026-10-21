import { Mission } from '../types';
import { ALL_WORLD_LEVELS } from './gameWorldsData';

export const BEGINNER_MISSIONS: Mission[] = ALL_WORLD_LEVELS.map((lvl) => ({
  id: lvl.id,
  number: lvl.number,
  title: lvl.title,
  subtitle: lvl.subtitle,
  stage: lvl.number,
  stageName: lvl.worldId === 'world-1' ? 'Genesis Archipelago' : lvl.worldId === 'world-2' ? 'Candlestick Coast' : 'Fortitude Fortress',
  category: lvl.category as any,
  estimatedMinutes: lvl.estimatedMinutes,
  xpReward: lvl.xpReward,
  cashReward: lvl.cashReward,
  unlocksBadge: lvl.unlocksBadge,
  unlockedFeatureName: lvl.unlockedFeatureName,
  icon: lvl.icon,
  keyTakeaway: lvl.keyTakeaway,
}));

export const DIAGNOSTIC_QUESTIONS = [
  {
    id: 'diag-1',
    question: 'What does buying 1 share of a company mean?',
    options: [
      { text: 'You are lending money to the government', correct: false },
      { text: 'You own a fractional piece of that business and its assets', correct: true },
      { text: 'You are guaranteed fixed monthly interest', correct: false },
      { text: 'You can work at that company as an employee', correct: false },
    ],
    explanation: 'A share represents fractional equity ownership in the company.',
  },
  {
    id: 'diag-2',
    question: 'If demand for a stock increases and sellers are limited, what happens to its price?',
    options: [
      { text: 'Price stays exactly the same', correct: false },
      { text: 'Price tends to rise as buyers compete', correct: true },
      { text: 'The stock exchange automatically pauses all trading for 1 month', correct: false },
      { text: 'Price immediately falls to ₹0', correct: false },
    ],
    explanation: 'Higher buyer demand with constrained supply drives market prices upwards.',
  },
  {
    id: 'diag-3',
    question: 'On a daily Japanese Candlestick, what do the upper and lower thin lines (wicks/shadows) represent?',
    options: [
      { text: 'The highest and lowest price reached during the day', correct: true },
      { text: 'The dividend paid to shareholders', correct: false },
      { text: 'The company debt ratio', correct: false },
      { text: 'The number of trades executed', correct: false },
    ],
    explanation: 'The upper and lower wicks represent the extreme High and Low prices reached during the trading session.',
  },
  {
    id: 'diag-4',
    question: 'What is the purpose of a Stop-Loss order in disciplined risk management?',
    options: [
      { text: 'To double your profit when a trade wins', correct: false },
      { text: 'To automatically exit a losing trade at a predetermined price and protect capital', correct: true },
      { text: 'To prevent you from ever paying taxes', correct: false },
      { text: 'To trade without any internet connection', correct: false },
    ],
    explanation: 'A stop-loss prevents catastrophic capital loss by closing a position if the market moves against your thesis.',
  }
];
