import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Swords,
  Search,
  Zap,
  Target,
  Gift,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Flame,
  BrainCircuit,
  Newspaper,
  Bot,
  GraduationCap
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { INDIAN_INDICES, MARKET_NEWS_FEED } from '../../data/marketData';
import { WorldMap } from '../layout/WorldMap';
import { GameId } from '../../types';
import { soundEffects } from '../../utils/audio';

export const HomeLobby: React.FC = () => {
  const {
    profile,
    dailyQuests,
    setActiveGame,
    completeDailyQuest,
    setAIMentorOpen,
    setAppMode,
    totalPortfolioValue,
    totalNetWorth
  } = useGame();

  const handleLaunchGame = (gameId: GameId) => {
    soundEffects.click();
    setActiveGame(gameId);
  };

  return (
    <div className="space-y-8">
      {/* Indian Indices Live Ticker Ribbon */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-3 shadow-lg">
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1 scrollbar-thin">
          <div className="flex items-center gap-4 shrink-0">
            {INDIAN_INDICES.map(idx => {
              const isUp = idx.change >= 0;
              return (
                <div
                  key={idx.symbol}
                  className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-850 shrink-0"
                >
                  <div>
                    <div className="text-[11px] font-bold text-slate-300 font-mono flex items-center gap-1.5">
                      <span>{idx.symbol}</span>
                      <span className="text-[9px] text-slate-400 font-normal">[HISTORICAL/SIM]</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold mt-0.5">
                      <span className="text-white">₹{idx.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      <span className={`flex items-center text-[11px] ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isUp ? '+' : ''}{idx.changePercent}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400 font-mono shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>NSE/BSE REGIME: <strong>BULL CONTINUATION</strong></span>
          </div>
        </div>
      </div>

      {/* Quick Launch Action Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Game 1: Candlestick Combat */}
        <button
          id="btn-quick-combat"
          onClick={() => handleLaunchGame('candlestick-combat')}
          className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 hover:border-purple-400 text-left transition-all hover:scale-[1.02] active:scale-[0.98] group shadow-xl shadow-purple-950/20 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 group-hover:rotate-6 transition-transform">
                <Swords className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                +120 XP
              </span>
            </div>
            <h3 className="font-extrabold text-white text-base group-hover:text-purple-300 transition-colors">
              Candlestick Combat
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Identify price action patterns & strike boss enemies before timer runs out.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-purple-400 group-hover:text-white transition-colors">
            <span>Enter Battle Arena</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Game 2: Chart Detective */}
        <button
          id="btn-quick-detective"
          onClick={() => handleLaunchGame('chart-detective')}
          className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-teal-950/80 border border-indigo-500/30 hover:border-indigo-400 text-left transition-all hover:scale-[1.02] active:scale-[0.98] group shadow-xl shadow-indigo-950/20 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 group-hover:rotate-6 transition-transform">
                <Search className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                +150 XP
              </span>
            </div>
            <h3 className="font-extrabold text-white text-base group-hover:text-indigo-300 transition-colors">
              Chart Detective
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Draw support/resistance and predict hidden historical market breakouts.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:text-white transition-colors">
            <span>Investigate Case</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Game 3: Market Crash Survival */}
        <button
          id="btn-quick-crash"
          onClick={() => handleLaunchGame('market-crash')}
          className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/80 via-slate-900 to-amber-950/80 border border-rose-500/30 hover:border-rose-400 text-left transition-all hover:scale-[1.02] active:scale-[0.98] group shadow-xl shadow-rose-950/20 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 group-hover:rotate-6 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono">
                +200 XP
              </span>
            </div>
            <h3 className="font-extrabold text-white text-base group-hover:text-rose-300 transition-colors">
              Market Crash Survival
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Survive a multi-wave flash crash with discipline & capital preservation.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-rose-400 group-hover:text-white transition-colors">
            <span>Survive Crisis</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Virtual Trading Floor */}
        <button
          id="btn-quick-terminal"
          onClick={() => handleLaunchGame('trading-terminal')}
          className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all hover:scale-[1.02] active:scale-[0.98] group shadow-xl shadow-emerald-950/20 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:rotate-6 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                ₹1,00,000 Sim
              </span>
            </div>
            <h3 className="font-extrabold text-white text-base group-hover:text-emerald-300 transition-colors">
              Virtual Trading Floor
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Execute live simulated orders, manage holdings, and log trading journal rationale.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:text-white transition-colors">
            <span>Open Order Book</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Real-time Classroom Arena Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-amber-950/40 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                CLASSROOM COMPETITION
              </span>
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                Live Classroom Battle Arena
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Join teacher-led market decision challenges with your class using a 6-character room code (e.g. <span className="font-mono text-amber-400 font-bold">SM2026</span>), compete on real NSE stock data, and climb the live classroom leaderboard.
            </p>
          </div>
        </div>

        <button
          onClick={() => setAppMode('CLASSROOM')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Enter Classroom Arena</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Grid: Daily Quests & News Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Quests Widget (2 Cols on lg) */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Daily Practice Quests</h3>
                <p className="text-xs text-slate-400">Complete challenges to earn XP and virtual money rewards</p>
              </div>
            </div>

            <span className="text-xs font-bold text-amber-400 font-mono">
              {dailyQuests.filter(q => q.completed).length} / {dailyQuests.length} Done
            </span>
          </div>

          <div className="space-y-3">
            {dailyQuests.map((quest) => (
              <div
                key={quest.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  quest.completed
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-300'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl mt-0.5 ${
                    quest.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {quest.completed ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className={`font-bold text-xs ${quest.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                      {quest.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{quest.description}</p>
                    <div className="flex items-center gap-3 text-[10px] font-mono mt-2">
                      <span className="text-emerald-400 font-bold">+{quest.xpReward} XP</span>
                      <span className="text-amber-400 font-bold">+₹{quest.cashReward.toLocaleString('en-IN')} Virtual</span>
                    </div>
                  </div>
                </div>

                {!quest.completed && (
                  <button
                    onClick={() => handleLaunchGame(quest.actionGameId)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 shadow-md transition-transform active:scale-95"
                  >
                    Start Quest
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Indian Market News & SEBI Investor Protection Feed */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3">
              <Newspaper className="w-5 h-5 text-indigo-400" />
              <h3 className="font-extrabold text-white text-base">Dalal Street Feed</h3>
            </div>

            <div className="space-y-3">
              {MARKET_NEWS_FEED.map(news => (
                <div
                  key={news.id}
                  className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span className="text-indigo-300 uppercase">{news.category.replace('_', ' ')}</span>
                    <span className="font-mono">{news.timeAgo}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-medium">
                    {news.headline}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Socratic Mentor Callout */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-950 to-violet-950 border border-indigo-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Bot className="w-6 h-6 text-indigo-400 animate-pulse shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-white">Stuck on a concept?</div>
                <div className="text-slate-300 text-[11px]">Arya is ready to guide you.</div>
              </div>
            </div>
            <button
              onClick={() => setAIMentorOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 shadow-md"
            >
              Ask AI
            </button>
          </div>
        </div>
      </div>

      {/* World Map Section */}
      <WorldMap />
    </div>
  );
};
