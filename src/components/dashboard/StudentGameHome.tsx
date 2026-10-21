import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Map,
  Compass,
  Trophy,
  Award,
  ChevronRight,
  GraduationCap,
  Shield,
  Zap,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useClassroom } from '../../context/ClassroomContext';
import { GAME_WORLDS, ALL_WORLD_LEVELS, WorldLevel } from '../../data/gameWorldsData';
import { AppMode } from '../../types';
import { soundEffects } from '../../utils/audio';

interface StudentGameHomeProps {
  onNavigateTab: (tab: AppMode) => void;
  onLaunchMission: (missionId: string) => void;
}

export const StudentGameHome: React.FC<StudentGameHomeProps> = ({
  onNavigateTab,
  onLaunchMission,
}) => {
  const { profile } = useGame();
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
  const xpPerLevel = 250;
  const xpCurrentFloor = (userLevel - 1) * xpPerLevel;
  const xpNextCeiling = userLevel * xpPerLevel;
  const xpInCurrentLevel = Math.max(0, userXp - xpCurrentFloor);
  const xpProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpPerLevel) * 100));

  // Determine current active mission
  const completedMissions = profile.completedMissions || [];
  const nextMission: WorldLevel =
    ALL_WORLD_LEVELS.find((m) => !completedMissions.includes(m.id)) ||
    ALL_WORLD_LEVELS[ALL_WORLD_LEVELS.length - 1];

  const currentWorld =
    GAME_WORLDS.find((w) => w.id === nextMission.worldId) || GAME_WORLDS[0];

  const isAllCompleted = completedMissions.length >= ALL_WORLD_LEVELS.length;

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleStartMission = (missionId: string) => {
    soundEffects.click();
    onLaunchMission(missionId);
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
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* ==================================================================== */}
      {/* 1. CLEAN GREETING & PROGRESS OVERVIEW                                 */}
      {/* ==================================================================== */}
      <header className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Soft background ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                {getGreeting()}, {studentName}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                MarketQuest Learning Journey
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-400">Level {userLevel}</div>
                <div className="text-sm font-bold text-amber-400 tabular-nums">
                  {userXp} XP Total
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xl text-amber-400 shadow-inner">
                🏆
              </div>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="space-y-2 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold text-slate-300">
                Level {userLevel} Mastery Progress
              </span>
              <span className="text-slate-400 tabular-nums">
                {xpInCurrentLevel} / {xpPerLevel} XP to Level {userLevel + 1}
              </span>
            </div>

            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.max(8, xpProgressPercent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
              <span>{completedMissions.length} of {ALL_WORLD_LEVELS.length} missions completed</span>
              <span className="text-emerald-400 font-medium">{Math.round((completedMissions.length / ALL_WORLD_LEVELS.length) * 100)}% World Map Cleared</span>
            </div>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. PRIMARY ACTION: ONE RECOMMENDED MISSION HERO                      */}
      {/* ==================================================================== */}
      <section className="bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="space-y-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-4">
            <div className="flex items-center gap-2 text-xs text-indigo-300">
              <span className="font-bold text-amber-400">RECOMMENDED MISSION NOW</span>
              <span aria-hidden="true">·</span>
              <span>{currentWorld.title}</span>
              <span aria-hidden="true">·</span>
              <span>Level {nextMission.number}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>⏱️ ~{nextMission.estimatedMinutes} mins</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400 font-semibold tabular-nums">+{nextMission.xpReward} XP</span>
            </div>
          </div>

          {/* Mission Core Details: 5-Second Clarity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl p-2.5 rounded-2xl bg-indigo-900/40 border border-indigo-500/30">
                  {nextMission.icon}
                </span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {nextMission.title}
                  </h2>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    {nextMission.subtitle}
                  </p>
                </div>
              </div>

              {/* Story / Goal */}
              <p className="text-sm text-slate-300 leading-relaxed">
                {nextMission.storyGoal}
              </p>

              {/* How to play instruction */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>How to play:</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {nextMission.instruction}
                </p>
              </div>

              {/* Unlocks Next & Rewards Preview */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-medium">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Reward: {nextMission.unlocksBadge}</span>
                </div>
                <span aria-hidden="true">·</span>
                <div className="text-emerald-400 font-medium">
                  Unlocks: {nextMission.unlockedFeatureName || 'Next Level on Map'}
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="flex flex-col gap-3 justify-center items-center md:items-end">
              <button
                onClick={() => handleStartMission(nextMission.id)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-base shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-3"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>CONTINUE LEARNING</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateTab('LEARN')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Map className="w-3.5 h-3.5 text-indigo-400" />
                <span>View Full World Map</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. WORLD JOURNEY MAP ROADMAP (PROGRESS OVERVIEW)                     */}
      {/* ==================================================================== */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Game Worlds & Path
            </div>
            <h3 className="text-xl font-black text-white mt-0.5">
              Adventure World Progression
            </h3>
          </div>

          <button
            onClick={() => onNavigateTab('LEARN')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <span>Explore Map</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Worlds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {GAME_WORLDS.map((world) => {
            const worldMissions = world.levels;
            const completedCount = worldMissions.filter((m) =>
              completedMissions.includes(m.id)
            ).length;
            const isUnlocked = completedMissions.length >= world.unlockedMinMissions;
            const isCurrent = world.id === currentWorld.id && !isAllCompleted;

            return (
              <div
                key={world.id}
                onClick={() => {
                  soundEffects.click();
                  onNavigateTab('LEARN');
                }}
                className={`group cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900 border-indigo-500/50 shadow-xl shadow-indigo-500/10 hover:border-indigo-400'
                    : isUnlocked
                    ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      World {world.number}
                    </span>
                    {completedCount === worldMissions.length ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    ) : isCurrent ? (
                      <span className="text-[11px] font-bold text-amber-400">
                        Active World
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-[11px] text-slate-400">Available</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {world.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {world.subtitle}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {completedCount} / {worldMissions.length} Levels
                  </span>
                  <div className="flex items-center gap-1">
                    {worldMissions.map((m) => (
                      <span
                        key={m.id}
                        className={`w-2 h-2 rounded-full ${
                          completedMissions.includes(m.id)
                            ? 'bg-emerald-400'
                            : m.id === nextMission.id
                            ? 'bg-amber-400 ring-2 ring-amber-400/40'
                            : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. PROGRESSIVE DISCLOSURE: CLASSROOM & ADVANCED TOOLS                 */}
      {/* ==================================================================== */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {activeClassroom ? `Enrolled in: ${activeClassroom.name}` : 'Classroom Live Competitions'}
              </div>
              <div className="text-xs text-slate-400">
                {activeClassroom
                  ? `Teacher: ${activeClassroom.teacherName || 'Instructor'} · Code: ${activeClassroom.code}`
                  : 'Join teacher-synchronized trading challenges and classroom leaderboards.'}
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

            <button
              onClick={() => onNavigateTab('PLAY')}
              className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-bold border border-indigo-500/30 transition-colors cursor-pointer"
            >
              Arcade Arenas
            </button>
          </div>
        </div>

        {/* Expandable Class Code Join Form */}
        {showClassroomCodeInput && !activeClassroom && (
          <form
            onSubmit={handleJoinClass}
            className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-3 animate-fadeIn"
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
