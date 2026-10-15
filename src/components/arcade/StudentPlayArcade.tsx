import React from 'react';
import {
  Flame,
  Search,
  TrendingDown,
  LineChart,
  ArrowRight,
  Sparkles,
  Trophy,
  Zap,
  Play,
  Gamepad2,
} from 'lucide-react';
import { GameId } from '../../types';
import { useGame } from '../../context/GameContext';
import { soundEffects } from '../../utils/audio';

interface StudentPlayArcadeProps {
  onSelectGame: (gameId: GameId) => void;
}

export const StudentPlayArcade: React.FC<StudentPlayArcadeProps> = ({ onSelectGame }) => {
  const games: {
    id: GameId;
    title: string;
    subtitle: string;
    description: string;
    badge: string;
    xpMultiplier: string;
    icon: string;
    themeColor: string;
    accentBorder: string;
  }[] = [
    {
      id: 'price-prediction',
      title: 'Price Direction Duel',
      subtitle: '10s Time-Pressure Chart Prediction',
      description: 'Can you predict whether the stock explodes UP or crashes DOWN? 10 seconds on the clock before the real market movement reveals itself!',
      badge: 'SPEED PREDICTION',
      xpMultiplier: 'Up to 250 XP',
      icon: '⏱️',
      themeColor: 'from-amber-950/60 to-slate-900',
      accentBorder: 'border-amber-500/40 hover:border-amber-500',
    },
    {
      id: 'portfolio-tycoon',
      title: 'Portfolio Tycoon',
      subtitle: 'Dalal Street Asset Allocator',
      description: 'Manage a ₹5,00,000 budget across 6 sectors. Rebalance across 4 quarters and survive macro rate hikes and oil shocks to beat NIFTY 50!',
      badge: 'TYCOON SIM',
      xpMultiplier: '350 XP + Rank',
      icon: '💼',
      themeColor: 'from-indigo-950/60 to-slate-900',
      accentBorder: 'border-indigo-500/40 hover:border-indigo-500',
    },
    {
      id: 'candlestick-combat',
      title: 'Candlestick Combat',
      subtitle: 'Reflex & Wick Momentum Duel',
      description: 'Test your reaction time! Real candles form tick-by-tick — anticipate whether bulls or bears take the close.',
      badge: 'ARCADE ACTION',
      xpMultiplier: '150 XP per Win',
      icon: '⚔️',
      themeColor: 'from-emerald-950/60 to-slate-900',
      accentBorder: 'border-emerald-500/40 hover:border-emerald-500',
    },
    {
      id: 'chart-detective',
      title: 'Chart Detective',
      subtitle: 'Pattern & Breakout Recon',
      description: 'Analyze real historical NSE market charts. Uncover hidden double bottoms, head & shoulders, and breakout lines.',
      badge: 'VISUAL PUZZLE',
      xpMultiplier: '200 XP per Case',
      icon: '🔍',
      themeColor: 'from-cyan-950/60 to-slate-900',
      accentBorder: 'border-cyan-500/40 hover:border-cyan-500',
    },
    {
      id: 'market-crash',
      title: 'Market Crash Survival',
      subtitle: 'Greed vs Discipline Multiplier',
      description: 'Watch the market bubble soar! Lock in your virtual profit before the sudden crash wipes out unprotected gains.',
      badge: 'RISK SURVIVAL',
      xpMultiplier: 'Up to 300 XP',
      icon: '🚀',
      themeColor: 'from-rose-950/60 to-slate-900',
      accentBorder: 'border-rose-500/40 hover:border-rose-500',
    },
  ];

  const handleLaunch = (gameId: GameId) => {
    soundEffects.click();
    onSelectGame(gameId);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
          <Gamepad2 className="w-4 h-4" />
          <span>MARKET GAME ARENA</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white">
          Gamified Market Arcade
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Sharpen trading reflexes, pattern recognition, and emotional discipline through high-speed simulated market games. Earn XP and level up your trader status.
        </p>
      </div>

      {/* Arcade Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {games.map((game) => (
          <div
            key={game.id}
            className={`rounded-3xl border bg-gradient-to-b ${game.themeColor} ${game.accentBorder} p-6 shadow-xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02]`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300 uppercase">
                  {game.badge}
                </span>
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {game.xpMultiplier}
                </span>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-center text-3xl shadow-inner">
                {game.icon}
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {game.title}
                </h3>
                <span className="text-xs font-bold text-indigo-300 block mb-2">
                  {game.subtitle}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {game.description}
                </p>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => handleLaunch(game.id)}
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>PLAY NOW</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
