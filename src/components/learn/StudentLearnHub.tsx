import React, { useState } from 'react';
import {
  Map,
  Sparkles,
  Play,
  CheckCircle2,
  Lock,
  ArrowRight,
  Award,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Info,
  Shield,
  Eye,
  FileCheck,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { GAME_WORLDS, GameWorld, WorldLevel, ALL_WORLD_LEVELS } from '../../data/gameWorldsData';
import { CourseCoverageModal } from './CourseCoverageModal';
import { soundEffects } from '../../utils/audio';

interface StudentLearnHubProps {
  onLaunchMission?: (missionId: string) => void;
}

export const StudentLearnHub: React.FC<StudentLearnHubProps> = ({ onLaunchMission }) => {
  const { profile, startMission } = useGame();

  const completedMissions = profile.completedMissions || [];

  // Determine current active mission
  const nextMission: WorldLevel =
    ALL_WORLD_LEVELS.find((m) => !completedMissions.includes(m.id)) ||
    ALL_WORLD_LEVELS[ALL_WORLD_LEVELS.length - 1];

  // Active world selection: defaults to world containing the next mission
  const defaultWorld =
    GAME_WORLDS.find((w) => w.id === nextMission.worldId) || GAME_WORLDS[0];

  const [selectedWorldId, setSelectedWorldId] = useState<string>(defaultWorld.id);
  const [selectedLevelModal, setSelectedLevelModal] = useState<WorldLevel | null>(null);
  const [showCoverageReport, setShowCoverageReport] = useState<boolean>(false);

  const selectedWorld =
    GAME_WORLDS.find((w) => w.id === selectedWorldId) || GAME_WORLDS[0];

  // Check if a level is unlocked
  const isLevelUnlocked = (level: WorldLevel): boolean => {
    if (level.number === 1) return true;
    const prevLevel = ALL_WORLD_LEVELS.find((l) => l.number === level.number - 1);
    if (!prevLevel) return true;
    return completedMissions.includes(prevLevel.id);
  };

  const isLevelCompleted = (level: WorldLevel): boolean => {
    return completedMissions.includes(level.id);
  };

  const isLevelCurrent = (level: WorldLevel): boolean => {
    return level.id === nextMission.id && !isLevelCompleted(level);
  };

  const handleLevelClick = (level: WorldLevel) => {
    soundEffects.click();
    if (isLevelUnlocked(level)) {
      setSelectedLevelModal(level);
    }
  };

  const handleLaunchLevel = (levelId: string) => {
    soundEffects.click();
    setSelectedLevelModal(null);
    if (onLaunchMission) {
      onLaunchMission(levelId);
    } else {
      startMission(levelId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* ==================================================================== */}
      {/* 1. WORLD SELECTION BAR                                               */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
            <Map className="w-4 h-4" />
            <span>MARKETQUEST ADVENTURE MAP</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {selectedWorld.title}
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            {selectedWorld.tagline}
          </p>
        </div>

        {/* World Selection Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-center overflow-x-auto max-w-full">
          {GAME_WORLDS.map((world) => {
            const worldMissions = world.levels;
            const completedInWorld = worldMissions.filter((m) =>
              completedMissions.includes(m.id)
            ).length;
            const isWorldUnlocked =
              completedMissions.length >= world.unlockedMinMissions;
            const isSelected = world.id === selectedWorldId;

            return (
              <button
                key={world.id}
                onClick={() => {
                  soundEffects.click();
                  setSelectedWorldId(world.id);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md'
                    : isWorldUnlocked
                    ? 'text-slate-300 hover:text-white hover:bg-slate-900'
                    : 'text-slate-500 opacity-60 hover:opacity-80'
                }`}
              >
                {!isWorldUnlocked && <Lock className="w-3 h-3" />}
                <span>World {world.number}</span>
                <span className="text-[10px] font-mono opacity-80">
                  ({completedInWorld}/{worldMissions.length})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. NEXT RECOMMENDED LEVEL QUICK STRIP                                */}
      {/* ==================================================================== */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="text-2xl p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 shrink-0">
            {nextMission.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-amber-400">
              <span>CURRENT GOAL</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400">Level {nextMission.number} of {ALL_WORLD_LEVELS.length}</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              {nextMission.title}
            </h3>
            <p className="text-xs text-slate-300">
              {nextMission.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => handleLaunchLevel(nextMission.id)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg transition-transform active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>PLAY CURRENT MISSION</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* 3. ILLUSTRATED WORLD MAP WITH VISIBLE CONNECTED PATH                */}
      {/* ==================================================================== */}
      <div className="relative rounded-3xl border-2 border-slate-800 overflow-hidden shadow-2xl bg-slate-950 min-h-[520px] sm:min-h-[580px] flex flex-col justify-between">
        {/* World Illustrated Background Art */}
        <div className="absolute inset-0 z-0">
          <img
            src={selectedWorld.bgImage}
            alt={selectedWorld.title}
            className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-[1.1] scale-105 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/70" />
        </div>

        {/* Top Floating World Header Over Map */}
        <div className="relative z-10 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="bg-slate-950/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800/80 inline-block shadow-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
              World {selectedWorld.number} Map
            </span>
            <span className="text-base font-black text-white">
              {selectedWorld.title}
            </span>
            <span className="text-xs text-slate-400 ml-2">
              — {selectedWorld.subtitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEffects.click();
                setShowCoverageReport(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold backdrop-blur-md transition-colors flex items-center gap-2 cursor-pointer shadow-md"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>NCFM Syllabus</span>
            </button>
          </div>
        </div>

        {/* SVG Dynamic Connecting Winding Path between World Levels */}
        <div className="relative z-10 flex-1 px-4 sm:px-12 py-8 flex flex-col justify-center">
          {/* SVG Canvas for Path Line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>

            {/* Connecting curve paths between sequential levels in this world */}
            {selectedWorld.levels.map((level, idx) => {
              if (idx === selectedWorld.levels.length - 1) return null;
              const nextLvl = selectedWorld.levels[idx + 1];
              return (
                <line
                  key={`line-${level.id}`}
                  x1={`${level.coordinates.xPercent}%`}
                  y1={`${level.coordinates.yPercent}%`}
                  x2={`${nextLvl.coordinates.xPercent}%`}
                  y2={`${nextLvl.coordinates.yPercent}%`}
                  stroke="url(#pathGradient)"
                  strokeWidth="4"
                  strokeDasharray="8 6"
                  strokeLinecap="round"
                  className="opacity-70 animate-pulse"
                />
              );
            })}
          </svg>

          {/* Interactive Level Nodes Positioned on the World Map */}
          <div className="relative w-full h-[360px] sm:h-[400px]">
            {selectedWorld.levels.map((level) => {
              const completed = isLevelCompleted(level);
              const unlocked = isLevelUnlocked(level);
              const current = isLevelCurrent(level);

              return (
                <div
                  key={level.id}
                  style={{
                    left: `${level.coordinates.xPercent}%`,
                    top: `${level.coordinates.yPercent}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="absolute z-20"
                >
                  {/* Current Level Bouncing Target Pin */}
                  {current && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none animate-bounce">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase shadow-lg tracking-wider whitespace-nowrap">
                        PLAY NOW
                      </span>
                      <div className="w-2 h-2 bg-amber-400 rotate-45 -mt-1" />
                    </div>
                  )}

                  {/* Level Node Button */}
                  <button
                    onClick={() => handleLevelClick(level)}
                    disabled={!unlocked}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex flex-col items-center justify-center p-2 transition-all transform hover:scale-110 active:scale-95 cursor-pointer shadow-2xl ${
                      completed
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-800 border-2 border-emerald-400 ring-4 ring-emerald-500/20 text-white'
                        : current
                        ? 'bg-gradient-to-br from-amber-500 via-indigo-600 to-purple-700 border-2 border-amber-300 ring-8 ring-amber-400/30 text-white animate-pulse'
                        : unlocked
                        ? 'bg-slate-900 border-2 border-indigo-500/80 text-white hover:border-indigo-400 ring-2 ring-indigo-500/20'
                        : 'bg-slate-950/90 border-2 border-slate-800 text-slate-600 opacity-70 cursor-not-allowed'
                    }`}
                    title={level.title}
                  >
                    <span className="text-2xl sm:text-3xl">{level.icon}</span>

                    {/* Level Number Marker */}
                    <span className="absolute -bottom-2 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-700 text-[10px] font-black font-mono text-slate-200 shadow">
                      Lvl {level.number}
                    </span>

                    {/* Status Badge Icon */}
                    {completed && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-md border-2 border-slate-950">
                        <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[3]" />
                      </span>
                    )}

                    {!unlocked && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center shadow-md border-2 border-slate-950">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>

                  {/* Floating Level Label Pill */}
                  <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-36 sm:w-44 text-center pointer-events-none">
                    <div className="bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 shadow-lg space-y-0.5">
                      <div className="text-[11px] font-bold text-white truncate">
                        {level.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        +{level.xpReward} XP · {level.estimatedMinutes}m
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom World Completion Status Footer */}
        <div className="relative z-10 p-5 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <span className="font-bold text-white">World Completion Reward: </span>
              <span className="text-amber-300">{selectedWorld.badgeReward}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Completed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Current</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <span>Locked</span>
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. LEVEL DETAILS & LAUNCH MODAL                                      */}
      {/* ==================================================================== */}
      {selectedLevelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  {selectedLevelModal.icon}
                </span>
                <div>
                  <div className="text-xs font-bold text-indigo-400 uppercase">
                    Level {selectedLevelModal.number} · {selectedWorld.title}
                  </div>
                  <h2 className="text-xl font-black text-white mt-0.5">
                    {selectedLevelModal.title}
                  </h2>
                  <p className="text-xs text-slate-300">
                    {selectedLevelModal.subtitle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLevelModal(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Story & Instruction */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <strong className="text-white block mb-1">Mission Scenario:</strong>
                {selectedLevelModal.storyGoal}
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200">
                <strong className="text-indigo-300 block mb-0.5">Your Objective:</strong>
                {selectedLevelModal.instruction}
              </div>
            </div>

            {/* Rewards Strip */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Reward XP</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  +{selectedLevelModal.xpReward} XP
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Unlocks Badge</span>
                <span className="font-bold text-emerald-400 text-xs truncate block">
                  {selectedLevelModal.unlocksBadge}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedLevelModal(null)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                Back to Map
              </button>

              <button
                onClick={() => handleLaunchLevel(selectedLevelModal.id)}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>
                  {isLevelCompleted(selectedLevelModal) ? 'REPLAY MISSION' : 'START MISSION'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coverage Modal (100% NSE Technical Syllabus) */}
      {showCoverageReport && (
        <CourseCoverageModal onClose={() => setShowCoverageReport(false)} />
      )}
    </div>
  );
};
