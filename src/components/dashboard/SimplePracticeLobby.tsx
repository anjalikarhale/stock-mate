import React from 'react';
import { GameId } from '../../types';
import { useGame } from '../../context/GameContext';
import {
  Flame,
  Search,
  TrendingDown,
  Terminal,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';

export const SimplePracticeLobby: React.FC = () => {
  const { setActiveGame } = useGame();

  const games: {
    id: GameId;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    badge: string;
  }[] = [
    {
      id: 'candlestick-combat',
      title: 'Candlestick Combat',
      description: 'Quick-reflex game to identify bullish green candles vs bearish red candles.',
      icon: <Flame className="w-6 h-6 text-emerald-400" />,
      color: 'border-emerald-500/30 hover:border-emerald-500/60',
      badge: 'Speed Quiz',
    },
    {
      id: 'chart-detective',
      title: 'Chart Detective',
      description: 'Spot uptrends, downtrends, support levels, and chart patterns.',
      icon: <Search className="w-6 h-6 text-sky-400" />,
      color: 'border-sky-500/30 hover:border-sky-500/60',
      badge: 'Visual Practice',
    },
    {
      id: 'market-crash',
      title: 'Market Crash Simulator',
      description: 'Practice risk control and stop-losses when a sudden market crash strikes.',
      icon: <TrendingDown className="w-6 h-6 text-rose-400" />,
      color: 'border-rose-500/30 hover:border-rose-500/60',
      badge: 'Risk Practice',
    },
    {
      id: 'trading-terminal',
      title: 'Virtual Trading Simulator',
      description: 'Place simulated buy & sell orders on real Indian stocks (NSE/BSE) with ₹1,00,000 cash.',
      icon: <Terminal className="w-6 h-6 text-amber-400" />,
      color: 'border-amber-500/30 hover:border-amber-500/60',
      badge: 'Free Simulator',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 px-2">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Practice Arena
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Sharpen your skills risk-free with short interactive practice games.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {games.map((g) => (
          <div
            key={g.id}
            className={`bg-slate-900 border ${g.color} rounded-2xl p-5 flex flex-col justify-between transition-all shadow-lg`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800">
                  {g.icon}
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                  {g.badge}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{g.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{g.description}</p>
            </div>

            <button
              onClick={() => setActiveGame(g.id)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Play Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
