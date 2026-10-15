import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  Trophy,
  AlertTriangle,
  Award,
  Zap,
  TrendingUp,
  Brain,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { PROGRESSION_LEVELS } from '../../data/curriculum';
import { CareerPath } from '../../types';
import { soundEffects } from '../../utils/audio';

const AVATARS = ['🦁', '🦅', '🐺', '🐲', '🦉', '🦈', '🐂', '⚡'];

export const PlayerProfileModal: React.FC = () => {
  const {
    isProfileModalOpen,
    setProfileModalOpen,
    profile,
    resetProgress,
    totalNetWorth,
    totalPortfolioValue
  } = useGame();

  const [activeTab, setActiveTab] = useState<'SHEET' | 'MISTAKES' | 'ACHIEVEMENTS'>('SHEET');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isProfileModalOpen) return null;

  const currentLevelDef = PROGRESSION_LEVELS.find(l => l.level === profile.level) || PROGRESSION_LEVELS[0];

  const skillBars = [
    { label: 'Technical Analysis', score: profile.stats.technicalAnalysisScore, color: 'bg-purple-500' },
    { label: 'Fundamental Analysis', score: profile.stats.fundamentalAnalysisScore, color: 'bg-amber-500' },
    { label: 'Risk Management', score: profile.stats.riskManagementScore, color: 'bg-emerald-500' },
    { label: 'Trading Discipline', score: profile.stats.tradingDisciplineScore, color: 'bg-blue-500' },
    { label: 'Psychology & FOMO Resistance', score: profile.stats.psychologyScore, color: 'bg-pink-500' },
    { label: 'Portfolio Construction', score: profile.stats.portfolioScore, color: 'bg-cyan-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="text-3xl p-2 rounded-2xl bg-slate-900 border border-slate-800">
              {profile.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-lg">{profile.username}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {currentLevelDef.rankBadge}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Net Worth: ₹{totalNetWorth.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          <button
            onClick={() => setProfileModalOpen(false)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-950 border-b border-slate-800 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('SHEET')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'SHEET'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Character Sheet & Skills
          </button>
          <button
            onClick={() => setActiveTab('MISTAKES')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'MISTAKES'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Mistake Profile Bank</span>
            {profile.mistakes.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px] border border-rose-500/30">
                {profile.mistakes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('ACHIEVEMENTS')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'ACHIEVEMENTS'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Achievements ({profile.achievements.filter(a => a.unlockedAt).length}/{profile.achievements.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
          {activeTab === 'SHEET' && (
            <div className="space-y-6">
              {/* Financial Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Virtual Cash</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    ₹{profile.virtualCash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Holdings Value</span>
                  <span className="font-mono font-bold text-indigo-400 text-sm">
                    ₹{totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total XP</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">{profile.xp} XP</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Career Path</span>
                  <span className="font-bold text-white text-sm">{profile.careerPath}</span>
                </div>
              </div>

              {/* Skill Scores */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span>Market Mastery Skill Radar</span>
                </h4>
                <div className="space-y-3">
                  {skillBars.map(skill => (
                    <div key={skill.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">{skill.label}</span>
                        <span className="text-slate-400 font-mono">{skill.score}/100</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${skill.color}`}
                          style={{ width: `${skill.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset Progress Section */}
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Want to start clean with initial ₹1,00,000?</span>
                {showResetConfirm ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        resetProgress();
                        setShowResetConfirm(false);
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs"
                    >
                      Confirm Reset
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 border border-slate-700 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset RPG Progress</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'MISTAKES' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200">
                <strong className="text-indigo-300 block mb-1">🧠 Personal Mistake Bank:</strong>
                Tracking behavioral errors (FOMO, lack of stop-losses, impulsive trades) is how market professionals turn psychological blind spots into profitable discipline.
              </div>

              {profile.mistakes.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No recorded mistakes yet! Keep practicing in simulations to build self-awareness.
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.mistakes.map(m => (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{m.category.replace(/_/g, ' ')} (x{m.count})</span>
                        </span>
                        <span className="text-slate-400 font-mono">
                          Simulated Impact: ₹{m.financialImpactVirtual.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-slate-300">{m.description}</p>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850 text-slate-400">
                        <strong className="text-emerald-400">Remedy Discipline:</strong> {m.remedyTip}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ACHIEVEMENTS' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.achievements.map(ach => {
                const isUnlocked = Boolean(ach.unlockedAt);
                return (
                  <div
                    key={ach.id}
                    className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
                      isUnlocked
                        ? 'bg-slate-950 border-emerald-500/40 text-white'
                        : 'bg-slate-950/40 border-slate-900 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl text-lg ${
                      isUnlocked ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-900 text-slate-600'
                    }`}>
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <span>{ach.title}</span>
                        {isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{ach.description}</p>
                      <div className="text-[10px] text-amber-400 font-mono mt-1 font-bold">
                        +{ach.xpReward} XP
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
