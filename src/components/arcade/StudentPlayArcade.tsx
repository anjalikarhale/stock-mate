import React from 'react';
import {
  Gamepad2,
  CheckCircle2,
  Award,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { GameId, AppMode } from '../../types';
import { useGame } from '../../context/GameContext';
import { STOCK_MARKET_8_GAMES } from '../games/StockMarketGameSuite';

interface StudentPlayArcadeProps {
  onSelectGame: (gameId: GameId) => void;
  onNavigateTab?: (tab: AppMode) => void;
}

export const StudentPlayArcade: React.FC<StudentPlayArcadeProps> = ({
  onSelectGame,
  onNavigateTab,
}) => {
  const { profile, setNavigateTargetModuleId } = useGame();
  const gameScores = profile.gameScores || {};

  const completedGamesCount = STOCK_MARKET_8_GAMES.filter(
    (g) => gameScores[g.id]?.completed
  ).length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <section className="rounded-3xl bg-slate-900/95 border border-slate-800 p-6 sm:p-7 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <Gamepad2 className="w-4 h-4" />
            <span>Indian Stock-Market Practice Arena • 8 Curriculum Games</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Decision &amp; Risk Skill Challenges
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Every game directly reinforces NSE/BSE concepts from the 16-module reference course—candlesticks, trend polarity, order-book slippage, asset allocation, position sizing, option chains, crash survival, and financial statements.
          </p>
        </div>

        <div className="px-5 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
          <div className="text-[11px] text-slate-400 font-semibold">Games Completed</div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {completedGamesCount} <span className="text-sm text-slate-500">/ 8</span>
          </div>
        </div>
      </section>

      {/* 8 Stock-Market Games Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {STOCK_MARKET_8_GAMES.map((game) => {
          const record = gameScores[game.id];
          return (
            <div
              key={game.id}
              className="rounded-2xl bg-slate-900/95 border border-slate-800 hover:border-indigo-500/40 p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-lg transition-colors"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-indigo-400">
                    {game.code} • {game.moduleRefLabel}
                  </span>
                  {record?.completed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Best: {record.bestScore}/{record.maxPossibleScore}
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-400">
                      +{game.xpReward} XP
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-black text-white">{game.title}</h2>
                <p className="text-xs text-slate-300 leading-relaxed">{game.summary}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setNavigateTargetModuleId(game.moduleId);
                    onNavigateTab?.('LEARN');
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-indigo-300 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Study Module</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectGame(game.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{record?.completed ? 'Play Again' : 'Launch Challenge'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};
