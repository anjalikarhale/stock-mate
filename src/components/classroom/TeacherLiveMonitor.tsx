import React, { useState } from 'react';
import {
  Play,
  SkipForward,
  Square,
  ArrowLeft,
  Trophy,
  Download,
  Clock,
  Users,
} from 'lucide-react';
import { useClassroom } from '../../context/ClassroomContext';
import { LiveLeaderboard } from './LiveLeaderboard';
import { classroomApi } from '../../services/classroomApi';

export const TeacherLiveMonitor: React.FC = () => {
  const {
    activeActivity,
    activeClassroom,
    classroomMembers,
    leaderboard,
    roundTimeRemaining,
    onlineUserIds,
    startActivity,
    nextRound,
    endActivity,
    setActiveView,
  } = useClassroom();

  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(true);
  const [confirmEndModal, setConfirmEndModal] = useState<boolean>(false);

  if (!activeActivity) {
    return (
      <div className="text-center p-8 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
        No active activity selected.
      </div>
    );
  }

  // Calculate clean metrics
  const students = classroomMembers.filter((m) => m.role === 'STUDENT');
  const studentsJoinedCount = Math.max(students.length, leaderboard.length);
  const onlineCount = onlineUserIds.length > 0 ? onlineUserIds.length : Math.max(1, studentsJoinedCount);
  const currentRound = activeActivity.currentRoundNumber || 1;
  const totalQuestions = 10;
  const answersReceived = leaderboard.filter(
    (e) => e.status === 'SUBMITTED' || e.roundsCompleted >= currentRound
  ).length;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.max(0, seconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLive = activeActivity.status === 'LIVE';
  const isWaiting = activeActivity.status === 'WAITING' || activeActivity.status === 'DRAFT';
  const isCompleted = activeActivity.status === 'COMPLETED';

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 px-2">
      {/* Top back navigation & export */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveView('LIST')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Classroom
        </button>

        <a
          href={classroomApi.getExportUrl(activeActivity.id)}
          download
          className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </a>
      </div>

      {/* Main Teacher Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
        {/* Header: Classroom Name & Status */}
        <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block">
              Teacher Live Monitor
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {activeClassroom?.name || 'Classroom'}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Class Code: <span className="text-amber-400 font-bold">{activeClassroom?.code}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${
                isLive
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : isWaiting
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {activeActivity.status}
            </span>
            {isLive && (
              <span className="bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {formatTimer(roundTimeRemaining)}
              </span>
            )}
          </div>
        </div>

        {/* 14. Simplified Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Students Joined</span>
            <span className="text-xl font-black text-white font-mono mt-0.5 block">{studentsJoinedCount}</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Online</span>
            <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block">{onlineCount}</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Round</span>
            <span className="text-xl font-black text-indigo-400 font-mono mt-0.5 block">{currentRound} / 2</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Questions</span>
            <span className="text-xl font-black text-white font-mono mt-0.5 block">{totalQuestions}</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Answers Received</span>
            <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block">
              {answersReceived} / {studentsJoinedCount}
            </span>
          </div>
        </div>

        {/* 14. Simple Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {isWaiting && (
            <button
              onClick={() => startActivity(activeActivity.id)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              START ROUND 1
            </button>
          )}

          {isLive && (
            <>
              {currentRound < 2 ? (
                <button
                  onClick={() => nextRound(activeActivity.id)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <SkipForward className="w-4 h-4" />
                  END ROUND (START ROUND 2)
                </button>
              ) : (
                <button
                  onClick={() => setConfirmEndModal(true)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-current" />
                  END ROUND 2
                </button>
              )}
            </>
          )}

          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            {showLeaderboard ? 'HIDE LEADERBOARD' : 'SHOW LEADERBOARD'}
          </button>

          {!isCompleted && (
            <button
              onClick={() => setConfirmEndModal(true)}
              className="bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-colors cursor-pointer"
            >
              END ACTIVITY
            </button>
          )}
        </div>
      </div>

      {/* Leaderboard Section */}
      {showLeaderboard && (
        <div className="space-y-2">
          <LiveLeaderboard entries={leaderboard} />
        </div>
      )}

      {/* Confirm End Modal */}
      {confirmEndModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4">
            <h3 className="text-lg font-bold text-white">End Activity?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to end this challenge? Final rankings will be saved for all students.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmEndModal(false)}
                className="flex-1 bg-slate-800 text-slate-300 font-bold text-xs py-2.5 rounded-xl border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await endActivity(activeActivity.id);
                  setConfirmEndModal(false);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2.5 rounded-xl"
              >
                Yes, End Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
