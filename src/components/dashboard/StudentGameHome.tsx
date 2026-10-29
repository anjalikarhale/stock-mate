import React, { useState, useMemo } from 'react';
import {
  Play,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Trophy,
  GraduationCap,
  TrendingUp,
  BarChart2,
  Gamepad2,
  Wallet,
  Layers,
  Award,
  Clock,
  BookOpen,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useClassroom } from '../../context/ClassroomContext';
import {
  COURSE_MODULES,
  getAllCourseTopics,
  CourseTopic,
  CourseModule
} from '../../data/courses';
import { AppMode } from '../../types';
import { soundEffects } from '../../utils/audio';

interface StudentGameHomeProps {
  onNavigateTab: (tab: AppMode) => void;
  onLaunchMission?: (missionId: string) => void;
}

export const StudentGameHome: React.FC<StudentGameHomeProps> = ({
  onNavigateTab,
}) => {
  const { profile, totalNetWorth, totalPortfolioValue } = useGame();
  const { currentUser, studentProfile, activeClassroom, joinClassroomByCode } = useClassroom();

  const [classCodeInput, setClassCodeInput] = useState('');
  const [joinStatus, setJoinStatus] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [showClassroomCodeInput, setShowClassroomCodeInput] = useState(false);

  // User stats & identity
  const studentName = currentUser?.name?.split(' ')[0] || profile.username || 'Trader';
  const userXp = studentProfile?.xp ?? currentUser?.xp ?? profile.xp ?? 0;
  const userLevel = profile.level || 1;

  // Level Progression Math
  const xpPerLevel = 300;
  const xpCurrentFloor = (userLevel - 1) * xpPerLevel;
  const xpInCurrentLevel = Math.max(0, userXp - xpCurrentFloor);
  const xpProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpPerLevel) * 100));

  // Course Progress & Topics
  const allTopics = useMemo(() => getAllCourseTopics(), []);
  const completedTopics = useMemo(() => profile.completedCourseTopics || [], [profile.completedCourseTopics]);

  // Next recommended topic to complete
  const nextTopic: CourseTopic = useMemo(() => {
    return allTopics.find((t) => !completedTopics.includes(t.id)) || allTopics[0];
  }, [allTopics, completedTopics]);

  // Module containing nextTopic
  const nextTopicModule = useMemo(() => {
    return COURSE_MODULES.find((m) => m.id === nextTopic.moduleId) || COURSE_MODULES[0];
  }, [nextTopic]);

  // Module completion counts
  const basicTopics = useMemo(() => COURSE_MODULES[0].units.flatMap((u) => u.topics), []);
  const intermediateTopics = useMemo(() => COURSE_MODULES[1].units.flatMap((u) => u.topics), []);
  const advancedTopics = useMemo(() => COURSE_MODULES[2].units.flatMap((u) => u.topics), []);

  const basicCompletedCount = useMemo(
    () => basicTopics.filter((t) => completedTopics.includes(t.id)).length,
    [basicTopics, completedTopics]
  );
  const intermediateCompletedCount = useMemo(
    () => intermediateTopics.filter((t) => completedTopics.includes(t.id)).length,
    [intermediateTopics, completedTopics]
  );
  const advancedCompletedCount = useMemo(
    () => advancedTopics.filter((t) => completedTopics.includes(t.id)).length,
    [advancedTopics, completedTopics]
  );

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCodeInput.trim()) return;
    setIsJoining(true);
    setJoinStatus(null);
    try {
      const res = await joinClassroomByCode(classCodeInput.trim().toUpperCase());
      if (res.success) {
        soundEffects.levelUp();
        onNavigateTab('CLASSROOM');
      } else {
        setJoinStatus(res.message || 'Invalid classroom code. Check with your teacher.');
      }
    } catch (err: any) {
      setJoinStatus(err.message || 'Unable to join classroom.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 text-slate-100">
      {/* ==================================================================== */}
      {/* 1. HERO GREETING & FINANCIAL STATS BANNER                             */}
      {/* ==================================================================== */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">
                {getGreeting()}, {studentName}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Stock Market Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Master stock trading and investment fundamentals through interactive practice.
              </p>
            </div>

            {/* Quick Stat Badges */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-400">Total Mastery</div>
                <div className="text-sm font-black text-amber-400 tabular-nums">
                  {userXp.toLocaleString()} XP • Level {userLevel}
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl text-amber-400 shadow-inner">
                🏆
              </div>
            </div>
          </div>

          {/* Level Progress & Financial Snapshot Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Level Mastery Card */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold">Level {userLevel} Progress</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {xpInCurrentLevel} / {xpPerLevel} XP
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(6, xpProgressPercent)}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Topics Mastered:</span>
                <strong className="text-emerald-400">
                  {completedTopics.length} of {allTopics.length}
                </strong>
              </div>
            </div>

            {/* Virtual Cash Card */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Available Paper Cash</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  ₹{profile.virtualCash.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-400">Simulated Trading Funds</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>

            {/* Net Worth Card */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Total Net Worth</div>
                <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                  ₹{(totalNetWorth || profile.virtualCash).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-400">Cash + Live Stock Holdings</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. PRIMARY ACTION HERO: RECOMMENDED NEXT TOPIC                       */}
      {/* ==================================================================== */}
      <section className="bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-4">
            <div className="flex items-center gap-2 text-xs text-indigo-300">
              <span className="font-bold text-amber-400">CONTINUE YOUR JOURNEY</span>
              <span>•</span>
              <span className="text-slate-300">{nextTopicModule.title.en}</span>
              <span>•</span>
              <span className="text-slate-400">Unit {nextTopic.number}</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>~{nextTopic.estimatedMinutes} mins</span>
              </span>
              <span>•</span>
              <span className="text-amber-400 font-bold tabular-nums">+{nextTopic.xpReward} XP</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-900/60 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-xl font-bold shrink-0">
                  <BookOpen className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {nextTopic.title.en}
                  </h2>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    {nextTopic.subtitle.en}
                  </p>
                </div>
              </div>

              {/* Learning methodology preview */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>4-Step Mastery Method:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px] pt-1">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                    1. Theory
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                    2. Visualizer
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                    3. Mini-Game
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                    4. Test
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="flex flex-col gap-3 justify-center items-center md:items-end">
              <button
                onClick={() => {
                  soundEffects.click();
                  onNavigateTab('LEARN');
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-base shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-3"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>CONTINUE LEARNING</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  soundEffects.click();
                  onNavigateTab('LEARN');
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>View All 3 Modules</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. THE 3 MODULES ROADMAP                                             */}
      {/* ==================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Sequential Mastery Curriculum
            </div>
            <h3 className="text-xl font-black text-white mt-0.5">
              3 Stages of Market Education
            </h3>
          </div>

          <button
            onClick={() => onNavigateTab('LEARN')}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <span>Open Course Hub</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COURSE_MODULES.map((mod, idx) => {
            const isStage1 = idx === 0;
            const isStage2 = idx === 1;
            const isStage3 = idx === 2;

            // Sequential unlock rules
            const isUnlocked =
              isStage1 ||
              (isStage2 && basicCompletedCount >= Math.min(8, basicTopics.length)) ||
              (isStage3 && intermediateCompletedCount >= Math.min(8, intermediateTopics.length));

            const modTopics = mod.units.flatMap((u) => u.topics);
            const count = modTopics.filter((t) => completedTopics.includes(t.id)).length;
            const isDone = count === modTopics.length && modTopics.length > 0;
            const pct = modTopics.length > 0 ? Math.round((count / modTopics.length) * 100) : 0;

            return (
              <div
                key={mod.id}
                onClick={() => {
                  if (isUnlocked) {
                    soundEffects.click();
                    onNavigateTab('LEARN');
                  }
                }}
                className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50 cursor-pointer shadow-lg hover:shadow-indigo-500/10'
                    : 'bg-slate-950/60 border-slate-850 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-indigo-400">
                      STAGE {idx + 1}
                    </span>
                    {isDone ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/60">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    ) : !isUnlocked ? (
                      <span className="flex items-center gap-1 text-xs text-slate-400 font-semibold bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </span>
                    ) : (
                      <span className="text-xs text-amber-400 font-bold bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-800/40">
                        {count > 0 ? 'In Progress' : 'Available'}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-white">{mod.title.en}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {mod.description.en}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-5 border-t border-slate-800/80 mt-4">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Progress</span>
                    <span className="font-semibold text-slate-200">
                      {count} / {modTopics.length} Topics ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 0)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. QUICK-ACTION ACTIVITIES HUB                                       */}
      {/* ==================================================================== */}
      <section className="space-y-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Practice & Real Market Execution
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Paper Trading */}
          <div
            onClick={() => {
              soundEffects.click();
              onNavigateTab('TRADE');
            }}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg space-y-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                Paper Trading
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Live interactive trading terminal with real Indian stocks.
              </p>
            </div>
          </div>

          {/* Game Arcade */}
          <div
            onClick={() => {
              soundEffects.click();
              onNavigateTab('PLAY');
            }}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer shadow-lg space-y-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                Game Arenas
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Candlestick combat, price prediction & crash game.
              </p>
            </div>
          </div>

          {/* Portfolio Tracker */}
          <div
            onClick={() => {
              soundEffects.click();
              onNavigateTab('PORTFOLIO');
            }}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer shadow-lg space-y-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                My Portfolio
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Track simulated holdings, profit/loss and asset mix.
              </p>
            </div>
          </div>

          {/* Classroom Arena */}
          <div
            onClick={() => {
              soundEffects.click();
              onNavigateTab('CLASSROOM');
            }}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-violet-500/50 transition-all cursor-pointer shadow-lg space-y-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                Classroom Hub
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Join teacher challenges and synchronized leaderboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. CLASSROOM CODE JOIN BAR                                           */}
      {/* ==================================================================== */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {activeClassroom ? `Enrolled in: ${activeClassroom.name}` : 'Join a Teacher’s Classroom'}
              </div>
              <div className="text-xs text-slate-400">
                {activeClassroom
                  ? `Teacher: ${activeClassroom.teacherName || 'Instructor'} · Code: ${activeClassroom.code}`
                  : 'Participate in synchronized trading competitions with fellow students.'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeClassroom ? (
              <button
                onClick={() => onNavigateTab('CLASSROOM')}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Go to Classroom
              </button>
            ) : (
              <button
                onClick={() => setShowClassroomCodeInput(!showClassroomCodeInput)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              >
                {showClassroomCodeInput ? 'Cancel' : 'Enter Class Code'}
              </button>
            )}
          </div>
        </div>

        {/* Expandable Class Code Join Form */}
        {showClassroomCodeInput && !activeClassroom && (
          <form
            onSubmit={handleJoinClass}
            className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-3"
          >
            <input
              type="text"
              value={classCodeInput}
              onChange={(e) => setClassCodeInput(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              maxLength={8}
              className="bg-slate-950 border border-slate-700 text-white font-mono uppercase px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-400 w-36"
            />
            <button
              type="submit"
              disabled={isJoining || !classCodeInput.trim()}
              className="py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              {isJoining ? 'Joining...' : 'Join Classroom'}
            </button>
            {joinStatus && (
              <span className="text-xs text-rose-400 font-medium">{joinStatus}</span>
            )}
          </form>
        )}
      </section>
    </div>
  );
};
