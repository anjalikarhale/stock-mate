import React, { useState } from 'react';
import {
  X,
  Trophy,
  Medal,
  ShieldCheck,
  TrendingUp,
  Search,
  Activity,
  Flame
} from 'lucide-react';
import { useGame } from '../../context/GameContext';

interface LeaderboardUser {
  rank: number;
  username: string;
  avatar: string;
  level: number;
  metricLabel: string;
  metricValue: string;
  badge: string;
  isCurrentPlayer?: boolean;
}

export const LeaderboardModal: React.FC = () => {
  const { isLeaderboardOpen, setLeaderboardOpen, profile } = useGame();
  const [category, setCategory] = useState<'RISK_ADJUSTED' | 'DRAWDOWN' | 'CHART_MASTERY'>('RISK_ADJUSTED');

  if (!isLeaderboardOpen) return null;

  const mockLeaderboards: Record<string, LeaderboardUser[]> = {
    RISK_ADJUSTED: [
      { rank: 1, username: 'ArjunQuant', avatar: '🦅', level: 10, metricLabel: 'Sharpe Ratio', metricValue: '3.42', badge: '🥇 Master' },
      { rank: 2, username: 'DeepakValue', avatar: '🐂', level: 9, metricLabel: 'Sharpe Ratio', metricValue: '2.95', badge: '🥈 Elite' },
      { rank: 3, username: 'PriyaTrades', avatar: '🦉', level: 8, metricLabel: 'Sharpe Ratio', metricValue: '2.68', badge: '🥉 Pro' },
      { rank: 4, username: profile.username, avatar: profile.avatar, level: profile.level, metricLabel: 'Sharpe Ratio', metricValue: '2.14', badge: '⭐ You', isCurrentPlayer: true },
      { rank: 5, username: 'RohanAlpha', avatar: '🐺', level: 6, metricLabel: 'Sharpe Ratio', metricValue: '1.89', badge: 'Apprentice' },
    ],
    DRAWDOWN: [
      { rank: 1, username: 'IronShieldRitu', avatar: '🦁', level: 10, metricLabel: 'Max Crash Drawdown', metricValue: '4.2%', badge: '🥇 Guardian' },
      { rank: 2, username: 'VikramHedge', avatar: '🦈', level: 9, metricLabel: 'Max Crash Drawdown', metricValue: '6.8%', badge: '🥈 Safe' },
      { rank: 3, username: profile.username, avatar: profile.avatar, level: profile.level, metricLabel: 'Max Crash Drawdown', metricValue: '8.5%', badge: '⭐ You', isCurrentPlayer: true },
      { rank: 4, username: 'NishaRisk', avatar: '🐲', level: 7, metricLabel: 'Max Crash Drawdown', metricValue: '11.2%', badge: 'Disciplined' },
    ],
    CHART_MASTERY: [
      { rank: 1, username: 'CandleOracleSam', avatar: '🐲', level: 11, metricLabel: 'Accuracy', metricValue: '96.4%', badge: '🥇 Legend' },
      { rank: 2, username: 'KavitaPriceAction', avatar: '🦅', level: 9, metricLabel: 'Accuracy', metricValue: '91.8%', badge: '🥈 Expert' },
      { rank: 3, username: profile.username, avatar: profile.avatar, level: profile.level, metricLabel: 'Accuracy', metricValue: '85.0%', badge: '⭐ You', isCurrentPlayer: true },
    ]
  };

  const list = mockLeaderboards[category];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 flex items-center justify-center shadow-lg shadow-amber-950/40">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Dalal Street Hall of Fame</h3>
              <p className="text-xs text-slate-400">Ranked by risk management & decision quality • Not raw reckless profit</p>
            </div>
          </div>

          <button
            onClick={() => setLeaderboardOpen(false)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Selector */}
        <div className="grid grid-cols-3 bg-slate-950 border-b border-slate-800 p-2 gap-1 text-xs font-bold">
          <button
            onClick={() => setCategory('RISK_ADJUSTED')}
            className={`py-2 rounded-xl transition-colors ${
              category === 'RISK_ADJUSTED' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Risk-Adjusted (Sharpe)
          </button>
          <button
            onClick={() => setCategory('DRAWDOWN')}
            className={`py-2 rounded-xl transition-colors ${
              category === 'DRAWDOWN' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Lowest Drawdown
          </button>
          <button
            onClick={() => setCategory('CHART_MASTERY')}
            className={`py-2 rounded-xl transition-colors ${
              category === 'CHART_MASTERY' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Chart Detective Accuracy
          </button>
        </div>

        {/* Rank List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5 scrollbar-thin">
          {list.map(user => (
            <div
              key={user.rank}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                user.isCurrentPlayer
                  ? 'bg-indigo-950/40 border-indigo-500/50 ring-1 ring-indigo-500/40'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                  user.rank === 1 ? 'bg-amber-500 text-slate-950' :
                  user.rank === 2 ? 'bg-slate-300 text-slate-950' :
                  user.rank === 3 ? 'bg-amber-700 text-white' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {user.rank}
                </span>
                <span className="text-2xl">{user.avatar}</span>
                <div>
                  <div className="font-bold text-xs text-white flex items-center gap-2">
                    <span>{user.username}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300 font-normal">
                      Lvl {user.level}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">{user.badge}</div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">{user.metricLabel}</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{user.metricValue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
