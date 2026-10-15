import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  Gamepad2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Award,
  Calendar,
  CheckCircle2,
  X,
  Trophy,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useClassroom } from '../../context/ClassroomContext';
import { BEGINNER_MISSIONS } from '../../data/missionsData';
import { ActivityAttempt } from '../../types/classroom';

interface SimpleStudentHomeProps {
  onNavigate: (tab: 'LEARN' | 'PRACTICE' | 'CLASSROOM' | 'PROFILE') => void;
}

export const SimpleStudentHome: React.FC<SimpleStudentHomeProps> = ({ onNavigate }) => {
  const { profile, startMission } = useGame();
  const { activeClassroom, joinClassroomByCode, currentUser, studentProfile } = useClassroom();
  const [quickCode, setQuickCode] = useState('');
  const [joinMsg, setJoinMsg] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<ActivityAttempt | null>(null);

  // Student display name
  const studentName = currentUser?.name || profile.username || 'Student';

  // Dynamic values preferring persistent studentProfile
  const userXp = studentProfile?.xp ?? currentUser?.xp ?? profile.xp ?? 450;
  const userLevel = studentProfile?.level ?? currentUser?.level ?? profile.level ?? 3;
  const completedCount = studentProfile?.completedActivitiesCount ?? studentProfile?.attempts?.length ?? 0;
  const attempts = studentProfile?.attempts || [];

  // Find next mission to learn
  const nextMission = BEGINNER_MISSIONS.find((m) => !profile.completedMissions.includes(m.id)) || BEGINNER_MISSIONS[0];

  const handleQuickJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCode.trim()) return;
    setIsJoining(true);
    setJoinMsg('');
    try {
      const res = await joinClassroomByCode(quickCode.trim());
      if (res.success) {
        onNavigate('CLASSROOM');
      } else {
        setJoinMsg(res.message || 'Invalid classroom code');
      }
    } catch (err: any) {
      setJoinMsg(err.message || 'Error joining classroom');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4 px-2">
      {/* 1. Welcoming Header */}
      <div className="text-left space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Welcome back, {studentName}!
        </h1>
        <p className="text-sm text-slate-400">
          Learn the stock market through simple, interactive lessons and classroom challenges.
        </p>
      </div>

      {/* 2. Classroom Action Card */}
      <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 sm:p-6 transition-all shadow-lg">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" />
              Classroom Activity
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {activeClassroom ? `Enrolled: ${activeClassroom.name}` : 'Have a classroom code?'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              {activeClassroom
                ? `Teacher: ${activeClassroom.teacherName || 'Instructor'} • Code: ${activeClassroom.code}`
                : 'Enter your teacher’s 6-character code to join the live StockMate Market Challenge.'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        {activeClassroom ? (
          <button
            onClick={() => onNavigate('CLASSROOM')}
            className="mt-2 w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Enter Classroom Activity</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <form onSubmit={handleQuickJoin} className="mt-4 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={quickCode}
              onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
              placeholder="Enter Code (e.g. ABC123)"
              maxLength={8}
              className="bg-slate-950 border border-slate-800 text-white font-mono uppercase px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-400 flex-1"
            />
            <button
              type="submit"
              disabled={isJoining || !quickCode.trim()}
              className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isJoining ? 'Joining...' : 'Join Classroom'}
            </button>
          </form>
        )}
        {joinMsg && <p className="text-xs text-rose-400 mt-2">{joinMsg}</p>}
      </div>

      {/* 3. Your Progress Section (Clean & Non-Overwhelming) */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Your Progress
          </span>
          <button
            onClick={() => onNavigate('PROFILE')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            View Full Profile →
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">Level</span>
            <span className="text-xl font-black text-indigo-300">Level {userLevel}</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">XP</span>
            <span className="text-xl font-black text-amber-400 font-mono">{userXp} XP</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">Completed Activities</span>
            <span className="text-xl font-black text-emerald-400 font-mono">{completedCount}</span>
          </div>
        </div>
      </div>

      {/* 4. Recent Activities Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Recent Activities
          </span>
          {attempts.length > 0 && (
            <span className="text-xs text-slate-500">
              Click an activity to view details
            </span>
          )}
        </div>

        {attempts.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center text-xs text-slate-400">
            No classroom challenge completed yet. Join a classroom and complete Round 1 & Round 2 to see your persistent scores here!
          </div>
        ) : (
          <div className="space-y-2.5">
            {attempts.slice(0, 3).map((att) => (
              <button
                key={att.id}
                onClick={() => setSelectedAttempt(att)}
                className="w-full text-left p-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/40 transition-all flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                      {att.activityName || 'StockMate Market Challenge'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-bold border border-indigo-800/40">
                      Rank #{att.rank || 1}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Score: <span className="text-white font-mono font-bold">{att.finalScore}</span> / {att.totalQuestions * 100} • Accuracy: <span className="text-emerald-400 font-bold">{att.accuracyPercentage}%</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                    View Details →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 5. Main Action: Continue Learning */}
      <div className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 sm:p-6 transition-all shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Continue Learning
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {nextMission ? nextMission.title : 'Market Fundamentals'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md">
              {nextMission ? nextMission.subtitle : 'Start with shares, prices, and how stock markets work.'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <button
          onClick={() => {
            if (nextMission) {
              startMission(nextMission.id);
            } else {
              onNavigate('LEARN');
            }
          }}
          className="mt-5 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue Learning</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 6. Practice Card */}
      <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 sm:p-6 transition-all shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4" />
              Practice Simulator
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Practice Mini-Games & Simulator
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md">
              Test your intuition on candlestick patterns, chart trends, and market basics.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
            <Gamepad2 className="w-5 h-5" />
          </div>
        </div>

        <button
          onClick={() => onNavigate('PRACTICE')}
          className="mt-4 w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm px-6 py-2.5 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Practice Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* MODAL: Detailed Activity Attempt Breakdown */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                  Activity Details
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">
                  {selectedAttempt.activityName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAttempt(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {selectedAttempt.completionTime
                  ? new Date(selectedAttempt.completionTime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Completed Recently'}
              </span>
            </div>

            {/* Scores breakdown */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div>
                  <span className="text-xs font-bold text-slate-300 block">Round 1: Market Basics</span>
                  <span className="text-xs text-slate-500">{selectedAttempt.round1Correct} / {selectedAttempt.round1TotalQuestions} Correct</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-indigo-400">{selectedAttempt.round1Score} pts</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div>
                  <span className="text-xs font-bold text-slate-300 block">Round 2: Chart Basics</span>
                  <span className="text-xs text-slate-500">{selectedAttempt.round2Correct} / {selectedAttempt.round2TotalQuestions} Correct</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-teal-400">{selectedAttempt.round2Score} pts</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                <div>
                  <span className="text-xs font-bold text-white block">Final Challenge Result</span>
                  <span className="text-xs text-slate-400">{selectedAttempt.totalCorrect} / {selectedAttempt.totalQuestions} Questions</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-base text-amber-400">{selectedAttempt.finalScore} / 2000</span>
                  <span className="text-[10px] text-emerald-400 block font-bold">{selectedAttempt.accuracyPercentage}% Accuracy</span>
                </div>
              </div>
            </div>

            {/* XP & Achievements */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">XP Earned:</span>
                <span className="font-mono font-bold text-amber-400">+{selectedAttempt.xpEarned || Math.round(selectedAttempt.finalScore / 10)} XP</span>
              </div>

              {selectedAttempt.achievements && selectedAttempt.achievements.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                    Achievements Unlocked:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAttempt.achievements.map((ach) => (
                      <span
                        key={ach}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950 border border-indigo-500/30 text-indigo-300 text-xs font-semibold"
                      >
                        <Award className="w-3 h-3 text-amber-400" />
                        {ach}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedAttempt(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
