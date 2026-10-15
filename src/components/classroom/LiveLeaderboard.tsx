import React from 'react';
import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';
import { LeaderboardEntry } from '../../types/classroom';

interface LiveLeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  maxRounds?: number;
  compact?: boolean;
}

export const LiveLeaderboard: React.FC<LiveLeaderboardProps> = ({
  entries,
  currentUserId,
}) => {
  if (!entries || entries.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
        <Trophy className="w-8 h-8 mx-auto mb-2 text-slate-600 animate-pulse" />
        <p className="text-sm font-medium">Waiting for student submissions...</p>
      </div>
    );
  }

  // Sort by totalScore desc
  const sortedEntries = [...entries].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
            Leaderboard
          </h3>
        </div>
        <span className="text-[11px] font-mono font-bold text-slate-400">
          {sortedEntries.length} Students
        </span>
      </div>

      <div className="w-full">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
              <th className="py-2.5 px-4 text-center w-12">#</th>
              <th className="py-2.5 px-4">Student</th>
              <th className="py-2.5 px-4 text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {sortedEntries.map((entry, idx) => {
              const rank = idx + 1;
              const isMe = entry.studentId === currentUserId;

              return (
                <motion.tr
                  key={entry.studentId}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`transition-colors ${
                    isMe
                      ? 'bg-indigo-950/40 border-l-4 border-indigo-500 font-bold text-white'
                      : 'hover:bg-slate-800/40 text-slate-200'
                  }`}
                >
                  {/* Rank */}
                  <td className="py-3 px-4 text-center text-xs font-mono font-bold">
                    {rank === 1 ? '🥇 1' : rank === 2 ? '🥈 2' : rank === 3 ? '🥉 3' : rank}
                  </td>

                  {/* Student */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{entry.studentAvatar || '👨‍🎓'}</span>
                      <span className="truncate max-w-[180px] sm:max-w-[260px]">
                        {entry.studentName}
                        {isMe && <span className="text-indigo-400 text-xs ml-1">(You)</span>}
                      </span>
                    </div>
                  </td>

                  {/* Score */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-amber-400 text-sm">
                    {entry.totalScore ?? 0}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
