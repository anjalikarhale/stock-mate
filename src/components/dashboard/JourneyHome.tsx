import React from 'react';
import {
  Play,
  Target,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Bot,
  HelpCircle,
  Trophy,
  Zap,
  Flame,
  Gamepad2,
  Compass,
  Award,
  GraduationCap
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { BEGINNER_MISSIONS } from '../../data/missionsData';
import { soundEffects } from '../../utils/audio';

export const JourneyHome: React.FC = () => {
  const {
    profile,
    startMission,
    setAIMentorOpen,
    setAppMode,
    dailyQuests,
    setActiveGame
  } = useGame();

  const currentMissionIndex = BEGINNER_MISSIONS.findIndex(m => m.id === profile.currentMissionId);
  const currentMission = BEGINNER_MISSIONS[currentMissionIndex] || BEGINNER_MISSIONS[0];
  const completedCount = profile.completedMissions.length;
  const progressPercent = Math.round((completedCount / BEGINNER_MISSIONS.length) * 100);

  const handleContinueJourney = () => {
    soundEffects.click();
    startMission(currentMission.id);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Banner: Mode & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm">JOURNEY MODE</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Beginner Track
              </span>
            </div>
            <p className="text-xs text-slate-400">Step-by-step guided path from rookie to market practitioner</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setAppMode('CLASSROOM')}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>Classroom Mode</span>
          </button>
          <button
            onClick={() => setAppMode('FREE')}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Gamepad2 className="w-4 h-4 text-indigo-400" />
            <span>Switch to Free Mode</span>
          </button>
        </div>
      </div>

      {/* Hero: "CONTINUE JOURNEY" & "WHAT SHOULD I DO NEXT?" */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>RECOMMENDED NEXT MISSION</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Mission {currentMission.number}: {currentMission.title}
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              {currentMission.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300 pt-1">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                💰 +₹{currentMission.cashReward.toLocaleString('en-IN')} Virtual Capital
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                ⭐ +{currentMission.xpReward} XP
              </span>
              <span className="text-slate-400">
                ⏱️ ~{currentMission.estimatedMinutes} mins
              </span>
            </div>
          </div>

          <button
            id="btn-continue-journey"
            onClick={handleContinueJourney}
            className="px-8 py-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-indigo-600 to-violet-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base shadow-xl shadow-indigo-950/60 flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>▶ CONTINUE JOURNEY</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>Beginner Curriculum Progress</span>
            <span className="font-mono text-indigo-300">{completedCount} of {BEGINNER_MISSIONS.length} Missions ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid: 10 Missions Journey Map */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
              <span>🗺️ Your Guided Progression Map</span>
            </h3>
            <p className="text-xs text-slate-400">Unlock each milestone step by step without feeling overwhelmed</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            Stage 1 to 10
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {BEGINNER_MISSIONS.map((m, idx) => {
            const isCompleted = profile.completedMissions.includes(m.id);
            const isCurrent = m.id === profile.currentMissionId;
            const isLocked = !isCompleted && !isCurrent;

            return (
              <div
                key={m.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  isCurrent
                    ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg'
                    : isCompleted
                    ? 'bg-slate-950 border-emerald-500/30 text-slate-300'
                    : 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl text-xl ${
                    isCompleted ? 'bg-emerald-500/20 text-emerald-400' : isCurrent ? 'bg-indigo-500/30 text-white' : 'bg-slate-900 text-slate-600'
                  }`}>
                    {m.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400">
                        Mission {m.number}
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Done</span>
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-indigo-300 animate-pulse">
                          ← Active Mission
                        </span>
                      )}
                    </div>
                    <h4 className={`font-extrabold text-xs mt-1 ${isCurrent ? 'text-white' : isCompleted ? 'text-slate-200' : 'text-slate-400'}`}>
                      {m.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {m.subtitle}
                    </p>
                  </div>
                </div>

                <div>
                  {!isLocked ? (
                    <button
                      onClick={() => startMission(m.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition-transform active:scale-95 ${
                        isCurrent
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {isCompleted ? 'Replay' : 'Play'}
                    </button>
                  ) : (
                    <div className="p-2 rounded-xl bg-slate-900 text-slate-600">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Socratic Mentor Quick Card & Today's Quest */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mentor Card */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">Need help or advice?</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Arya is always available to answer your doubts and guide your decision-making.
              </p>
            </div>
          </div>

          <button
            onClick={() => setAIMentorOpen(true)}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            Chat with Arya (Socratic Mentor)
          </button>
        </div>

        {/* Practice Tip Card */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">100% Risk-Free Sandbox</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Your virtual capital of ₹{profile.virtualCash.toLocaleString('en-IN')} gives you freedom to experiment without fear of real losses.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Level {profile.level} • {profile.xp} Total XP Earned
          </div>
        </div>
      </div>
    </div>
  );
};
