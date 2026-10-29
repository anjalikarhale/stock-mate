import React, { useState } from 'react';
import {
  User,
  Award,
  Trophy,
  Zap,
  Flame,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Shield,
  Activity,
  X,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useClassroom } from '../../context/ClassroomContext';
import { ActivityAttempt } from '../../types/classroom';

export const StudentProfileView: React.FC = () => {
  const { profile } = useGame();
  const { currentUser, studentProfile } = useClassroom();
  const [selectedAttempt, setSelectedAttempt] = useState<ActivityAttempt | null>(null);

  const displayName = currentUser?.name || profile.username || 'Student Trader';
  const displayEmail = currentUser?.email || 'student@stockmate.edu';
  const displayAvatar = currentUser?.avatar || profile.avatar || '⚡';
  const userXp = studentProfile?.xp ?? currentUser?.xp ?? profile.xp ?? 720;
  const userLevel = studentProfile?.level ?? currentUser?.level ?? profile.level ?? 7;
  const attempts = studentProfile?.attempts || [];

  const achievementsList = [
    { title: 'First Trade Executed', desc: 'Placed your first simulated order on NSE', icon: '🎯', unlocked: true },
    { title: 'Chartist Eye', desc: 'Identified bullish hammer and resistance lines', icon: '📊', unlocked: true },
    { title: 'Risk Guardian', desc: 'Protected capital by configuring a stop loss', icon: '🛡', unlocked: true },
    { title: 'Classroom Challenger', desc: 'Participated in a live StockMate classroom battle', icon: '🏆', unlocked: attempts.length > 0 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fadeIn">
      {/* Gamer Profile Card */}
      <section className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-slate-950 border-2 border-indigo-500/50 flex items-center justify-center text-4xl sm:text-5xl shadow-xl shadow-indigo-600/20">
            {displayAvatar}
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">{displayName}</h1>
                <p className="text-xs text-slate-300 font-mono">{displayEmail}</p>
              </div>
              <span className="self-center sm:self-start px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Verified Student
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
              <div className="bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5">
                <span className="text-[10px] font-black text-indigo-400">LEVEL</span>
                <span className="text-sm font-black text-white">{userLevel}</span>
              </div>
              <div className="bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span className="text-sm font-black text-emerald-300 font-mono">{userXp} XP</span>
              </div>
              <div className="bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-black text-amber-300 font-mono">
                  {Math.max(1, profile.streakDays || 1)} Day Streak
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Classroom Activity History */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Classroom Activity History
            </h2>
            <p className="text-xs text-slate-400">
              Persistent records of your participation in teacher-hosted market battles.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
            {attempts.length} Completed
          </span>
        </div>

        {attempts.length === 0 ? (
          <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
            <Trophy className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">
              No classroom activity records yet. When your teacher hosts a Market Challenge, your scores and ranks will be saved here automatically!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                onClick={() => setSelectedAttempt(attempt)}
                className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-white">{attempt.activityName}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(attempt.completedAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      Score: {attempt.finalScore} / {attempt.totalQuestions * 100}
                    </span>
                    <span>•</span>
                    <span className="font-bold text-slate-300">
                      Accuracy: {attempt.accuracyPercentage}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-400 block font-mono">
                      #{attempt.rank || 1} in Class
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      +{attempt.xpEarned} XP
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Badges & Achievements */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg sm:text-xl font-black text-white">
          Achievements & Badges
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievementsList.map((ach) => (
            <div
              key={ach.title}
              className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
                ach.unlocked
                  ? 'bg-slate-950 border-emerald-500/30'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl shrink-0">
                {ach.icon}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black text-white">{ach.title}</h4>
                  {ach.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">{ach.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Activity Breakdown Modal */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-lg text-white">Classroom Activity Breakdown</h3>
              <button
                onClick={() => setSelectedAttempt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Activity</span>
                <p className="text-sm font-black text-white">{selectedAttempt.activityName}</p>
                <p className="text-[11px] text-slate-400">
                  {new Date(selectedAttempt.completedAt).toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center font-mono">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-sans block">Score</span>
                  <span className="text-base font-black text-emerald-400">
                    {selectedAttempt.finalScore} / {selectedAttempt.totalQuestions * 100}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-sans block">Accuracy</span>
                  <span className="text-base font-black text-indigo-400">
                    {selectedAttempt.accuracyPercentage}%
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-sans block">Rank</span>
                  <span className="text-base font-black text-amber-400">
                    #{selectedAttempt.rank || 1}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-sans block">XP Earned</span>
                  <span className="text-base font-black text-emerald-400">
                    +{selectedAttempt.xpEarned}
                  </span>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-800 pt-3">
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950">
                  <span className="font-bold text-slate-300">Round 1 Performance:</span>
                  <span className="font-mono font-bold text-white">
                    {selectedAttempt.round1CorrectAnswers}/{selectedAttempt.round1TotalQuestions} ({selectedAttempt.round1Score} pts)
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950">
                  <span className="font-bold text-slate-300">Round 2 Performance:</span>
                  <span className="font-mono font-bold text-white">
                    {selectedAttempt.round2CorrectAnswers}/{selectedAttempt.round2TotalQuestions} ({selectedAttempt.round2Score} pts)
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedAttempt(null)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
