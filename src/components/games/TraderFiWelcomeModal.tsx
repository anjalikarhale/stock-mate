import React, { useState } from 'react';
import {
  X,
  Gamepad2,
  Users,
  Edit3,
  Trophy,
  ShieldCheck,
  Coins,
  Sparkles,
  ArrowRight,
  Flame,
  Zap,
} from 'lucide-react';
import { soundEffects } from '../../utils/audio';

interface TraderFiWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: 'TOURNAMENT' | 'FRIENDS' | 'SOLO') => void;
  onOpenHowToPlay?: () => void;
}

export const TraderFiWelcomeModal: React.FC<TraderFiWelcomeModalProps> = ({
  isOpen,
  onClose,
  onSelectMode,
  onOpenHowToPlay,
}) => {
  const [selectedCard, setSelectedCard] = useState<'TOURNAMENT' | 'FRIENDS' | 'SOLO'>('TOURNAMENT');

  if (!isOpen) return null;

  const handleStartExploring = () => {
    soundEffects.levelUp();
    onSelectMode(selectedCard);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Outer Glow Container with Cyberpunk Purple Space Backdrop */}
      <div className="relative w-full max-w-2xl rounded-3xl p-1 bg-gradient-to-b from-purple-500/40 via-indigo-500/25 to-purple-900/50 border border-purple-500/50 shadow-[0_0_60px_rgba(147,51,234,0.45)] overflow-hidden">
        {/* Glowing Pink Close Button */}
        <button
          onClick={() => {
            soundEffects.click();
            onClose();
          }}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Modal Inner Window */}
        <div className="p-6 sm:p-10 bg-[#0d0724] rounded-2xl text-center space-y-6 relative overflow-hidden">
          {/* Cyberpunk space tunnel gradient perspective */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-800/25 via-indigo-950/40 to-[#070314] pointer-events-none" />

          {/* Top Pill: Players Competing & Live Tournaments */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#1b103e]/90 border border-purple-500/40 text-xs font-mono shadow-md relative z-10">
            <span className="font-extrabold text-white tracking-wide">
              3,198 <span className="text-slate-400 font-sans text-[11px]">PLAYERS COMPETING NOW</span>
            </span>
            <span className="text-purple-400">&bull;</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>24 LIVE TOURNAMENTS</span>
            </span>
          </div>

          {/* Rocket Icon & Hero Title */}
          <div className="space-y-1 relative z-10">
            <div className="text-4xl animate-bounce">🚀</div>
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent tracking-tight">
              Welcome to traderFi Arena
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium">
              Can you beat the market?
            </p>
          </div>

          {/* 3 Interactive Mode Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-lg mx-auto relative z-10">
            {/* Card 1: Join a Tournament */}
            <button
              onClick={() => {
                soundEffects.click();
                setSelectedCard('TOURNAMENT');
              }}
              className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer border ${
                selectedCard === 'TOURNAMENT'
                  ? 'bg-gradient-to-b from-indigo-900/80 to-purple-950/90 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.35)] scale-105'
                  : 'bg-indigo-950/40 border-indigo-500/20 hover:border-indigo-400/50 hover:bg-indigo-950/60'
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-500/20 flex items-center justify-center text-cyan-400">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-white text-center leading-tight">
                Join a<br />Tournament
              </span>
            </button>

            {/* Card 2: Invite Friends & Compete */}
            <button
              onClick={() => {
                soundEffects.click();
                setSelectedCard('FRIENDS');
              }}
              className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer border ${
                selectedCard === 'FRIENDS'
                  ? 'bg-gradient-to-b from-indigo-900/80 to-purple-950/90 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.35)] scale-105'
                  : 'bg-indigo-950/40 border-indigo-500/20 hover:border-indigo-400/50 hover:bg-indigo-950/60'
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-white text-center leading-tight">
                Invite Friends<br />& Compete
              </span>
            </button>

            {/* Card 3: Play Solo */}
            <button
              onClick={() => {
                soundEffects.click();
                setSelectedCard('SOLO');
              }}
              className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer border ${
                selectedCard === 'SOLO'
                  ? 'bg-gradient-to-b from-indigo-900/80 to-purple-950/90 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.35)] scale-105'
                  : 'bg-indigo-950/40 border-indigo-500/20 hover:border-indigo-400/50 hover:bg-indigo-950/60'
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300">
                <Edit3 className="w-6 h-6" />
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-white text-center leading-tight">
                Play<br />Solo
              </span>
            </button>
          </div>

          {/* Features Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-300 relative z-10">
            <span className="flex items-center gap-1.5">
              <span>💰</span>
              <span>$100k Virtual Balance</span>
            </span>
            <span className="text-purple-500">&bull;</span>
            <span className="flex items-center gap-1.5">
              <span>🛡️</span>
              <span>5-Min Tournaments</span>
            </span>
            <span className="text-purple-500">&bull;</span>
            <span className="flex items-center gap-1.5">
              <span>🏆</span>
              <span>Real Rankings</span>
            </span>
          </div>

          {/* Main Action Buttons */}
          <div className="space-y-3 max-w-sm mx-auto relative z-10 pt-2">
            <button
              onClick={handleStartExploring}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base shadow-xl shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-blue-400/30"
            >
              Start Exploring
            </button>

            {onOpenHowToPlay && (
              <button
                onClick={() => {
                  soundEffects.click();
                  onOpenHowToPlay();
                }}
                className="text-xs text-purple-300 hover:text-white font-bold underline transition-colors cursor-pointer block mx-auto"
              >
                New here? Read How to Play & Rules
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
