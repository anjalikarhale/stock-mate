import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Flame,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Users,
  Clock,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useClassroom } from '../../context/ClassroomContext';
import {
  CURRICULUM_16_MODULES,
  computeOverallCourseProgress,
} from '../../data/curriculum16Modules';
import { AppMode } from '../../types';

interface StudentGameHomeProps {
  onNavigateTab: (tab: AppMode) => void;
  onLaunchMission?: (missionId: string) => void;
}

export const StudentGameHome: React.FC<StudentGameHomeProps> = ({ onNavigateTab }) => {
  const { profile, setNavigateTargetModuleId } = useGame();
  const { currentUser, joinClassroomByCode } = useClassroom();

  const [showJoinClassroom, setShowJoinClassroom] = useState(false);
  const [classroomCode, setClassroomCode] = useState('');
  const [joinFeedback, setJoinFeedback] = useState<string | null>(null);

  const completedModules = profile.completedModules || [];
  const completedLessons = profile.completedLessons || [];

  const progress = useMemo(
    () => computeOverallCourseProgress(completedModules),
    [completedModules]
  );

  // Determine active / recommended module & next unread lesson
  const activeModule = useMemo(() => {
    if (profile.lastActiveModuleId) {
      const lastMod = CURRICULUM_16_MODULES.find((m) => m.id === profile.lastActiveModuleId);
      if (lastMod && !completedModules.includes(lastMod.id)) {
        return lastMod;
      }
    }
    return progress.nextRecommendedModule;
  }, [profile.lastActiveModuleId, completedModules, progress.nextRecommendedModule]);

  const nextLesson = useMemo(() => {
    return (
      activeModule.lessons.find((l) => !completedLessons.includes(l.id)) ||
      activeModule.lessons[0]
    );
  }, [activeModule, completedLessons]);

  const levelCounts = useMemo(() => {
    const countLevel = (lvl: 'Beginner' | 'Intermediate' | 'Advanced') => {
      const mods = CURRICULUM_16_MODULES.filter((m) => m.level === lvl);
      const done = mods.filter((m) => completedModules.includes(m.id)).length;
      return { done, total: mods.length };
    };
    return {
      beginner: countLevel('Beginner'),
      intermediate: countLevel('Intermediate'),
      advanced: countLevel('Advanced'),
    };
  }, [completedModules]);

  const handleContinueLearning = () => {
    setNavigateTargetModuleId(activeModule.id);
    onNavigateTab('LEARN');
  };

  const handleQuickJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classroomCode.trim()) return;
    const res = await joinClassroomByCode(classroomCode.trim().toUpperCase());
    setJoinFeedback(res.message);
    if (res.success) {
      setClassroomCode('');
      setTimeout(() => onNavigateTab('CLASSROOM'), 700);
    }
  };

  const studentName = currentUser?.name || profile.username || 'Learner';
  const streakDays = Math.max(1, profile.streakDays || 1);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Main Course Progress Dashboard Card */}
      <section className="rounded-3xl bg-slate-900/95 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <GraduationCap className="w-4 h-4" />
              <span>Indian Stock Market Learning Track</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {studentName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Track your real-time progress across the 16-module NSE/BSE curriculum.
            </p>
          </div>

          {/* Compact Study Streak */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 self-start sm:self-center">
            <Flame className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Study Streak
              </div>
              <div className="text-sm font-black font-mono text-white">
                {streakDays} {streakDays === 1 ? 'Day' : 'Days'}
              </div>
            </div>
          </div>
        </div>

        {/* Core Progress Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-xs font-semibold text-slate-400">Overall Completion</div>
            <div className="text-3xl font-black font-mono text-white">{progress.percent}%</div>
            <div className="text-[11px] text-slate-400">Calculated from persisted progress</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-xs font-semibold text-slate-400">Modules Completed</div>
            <div className="text-3xl font-black font-mono text-indigo-400">
              {progress.completedCount}{' '}
              <span className="text-lg text-slate-500">/ {progress.totalModules}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {completedLessons.length} lessons read
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-xs font-semibold text-slate-400">Current Learning Level</div>
            <div className="text-2xl font-black text-emerald-400 pt-1">
              {progress.currentLevel}
            </div>
            <div className="text-[11px] text-slate-400">
              {progress.currentLevel === 'Beginner'
                ? 'Level 1: Market Plumbing (M1–M5)'
                : progress.currentLevel === 'Intermediate'
                ? 'Level 2: Valuation & Charts (M6–M14)'
                : 'Level 3: Derivatives & Systems (M15–M16)'}
            </div>
          </div>
        </div>

        {/* Visual Overall Progress Bar + 3-Stage Summary */}
        <div className="space-y-3 bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-200">16-Module Mastery Progress</span>
            <span className="font-mono text-indigo-300">
              {progress.completedCount} of 16 Complete ({progress.percent}%)
            </span>
          </div>
          <div className="w-full h-3.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${Math.max(progress.percent, progress.completedCount > 0 ? 4 : 0)}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center justify-between bg-slate-900/70 px-3 py-1.5 rounded-lg">
              <span>Beginner</span>
              <span className="text-white font-bold">
                {levelCounts.beginner.done}/{levelCounts.beginner.total}
              </span>
            </div>
            <div className="flex items-center justify-between bg-slate-900/70 px-3 py-1.5 rounded-lg">
              <span>Intermediate</span>
              <span className="text-white font-bold">
                {levelCounts.intermediate.done}/{levelCounts.intermediate.total}
              </span>
            </div>
            <div className="flex items-center justify-between bg-slate-900/70 px-3 py-1.5 rounded-lg">
              <span>Advanced</span>
              <span className="text-white font-bold">
                {levelCounts.advanced.done}/{levelCounts.advanced.total}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Next Lesson / Continue Learning CTA Card */}
      <section className="rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 p-6 sm:p-7 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold">
              {progress.completedCount === 16 ? 'Course Completed • Review Mode' : 'Recommended Next Step'}
            </span>
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {nextLesson?.estimatedMinutes || 10} min lesson
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white">
            Module {activeModule.number}: {activeModule.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Next Lesson: <strong className="text-white">{nextLesson?.title}</strong>
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleContinueLearning}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-950/50 transition-colors shrink-0 cursor-pointer"
        >
          <span>{progress.completedCount === 0 ? 'Start Module 1' : 'Continue Learning'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Compact Classroom Quick-Join Bar (Preserves Existing Classroom Workflow Cleanly) */}
      <section className="rounded-2xl bg-slate-900/70 border border-slate-800/80 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs text-slate-300">
          <Users className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Have a live teacher classroom invite code?</span>
        </div>

        {!showJoinClassroom ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowJoinClassroom(true)}
              className="text-xs font-bold text-indigo-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer"
            >
              Enter Classroom Code
            </button>
            {progress.completedCount === 16 && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> All 16 Modules Complete
              </span>
            )}
          </div>
        ) : (
          <form onSubmit={handleQuickJoinClass} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="CODE (e.g. NSE101)"
              value={classroomCode}
              onChange={(e) => setClassroomCode(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white w-36"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white cursor-pointer"
            >
              Join
            </button>
          </form>
        )}
      </section>

      {joinFeedback && (
        <div className="text-xs text-center text-indigo-300 font-semibold">{joinFeedback}</div>
      )}
    </div>
  );
};
