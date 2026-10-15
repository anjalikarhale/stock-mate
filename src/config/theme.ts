// Centralized Branding & Theme Configuration for MARKET QUEST
// Easy to customize product name, colors, and game world settings

export const APP_CONFIG = {
  name: 'MARKET QUEST',
  tagline: 'From Market Newbie to Market Master',
  subtitle: 'The Indian Stock Market (NSE/BSE) RPG & Simulator',
  version: '1.0.0-MVP',
  currency: '₹',
  initialVirtualCash: 100000, // ₹1,00,000 Starting Virtual Capital
  branding: {
    primaryColor: '#10b981', // Emerald green
    accentColor: '#6366f1', // Indigo/Violet
    warningColor: '#f59e0b', // Amber
    dangerColor: '#ef4444', // Red
    neutralBg: '#090d16', // Dark luxury financial slate
    surfaceBg: '#111827', // Card surface
    borderColor: '#1f2937', // Subtle border
  },
  disclaimer: {
    tag: 'SIMULATION ONLY',
    text: 'Virtual Money Only (₹1,00,000). For educational purposes. Not SEBI registered advisory.',
    dataNotice: 'Data shown is [DEMO / HISTORICAL NSE SIMULATION] for learning price action mechanics.'
  },
  exchanges: ['NSE', 'BSE'],
  defaultIndex: 'NIFTY 50',
};
