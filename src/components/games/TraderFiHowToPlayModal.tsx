import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Trophy,
  ShieldAlert,
  Sparkles,
  Gamepad2,
  Clock,
  Layers,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { soundEffects } from '../../utils/audio';

interface TraderFiHowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExploring?: () => void;
}

export const TraderFiHowToPlayModal: React.FC<TraderFiHowToPlayModalProps> = ({
  isOpen,
  onClose,
  onStartExploring,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const totalSteps = 6;

  const handleNext = () => {
    soundEffects.click();
    if (currentStep < totalSteps - 1) {
      setCurrentStep(s => s + 1);
    } else {
      onClose();
      if (onStartExploring) onStartExploring();
    }
  };

  const handleBack = () => {
    soundEffects.click();
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Outer Glow Container */}
      <div className="relative w-full max-w-xl rounded-3xl p-1 bg-gradient-to-b from-purple-500/30 via-indigo-500/20 to-purple-900/40 border border-purple-500/40 shadow-[0_0_50px_rgba(147,51,234,0.35)] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => {
            soundEffects.click();
            onClose();
          }}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Modal Header Bar */}
        <div className="w-full bg-[#1b4382] rounded-t-2xl py-2.5 text-center text-white font-black text-sm tracking-wide shadow-md">
          How to play?
        </div>

        {/* Inner Content Area with Cyberpunk Cosmic Backdrop */}
        <div className="p-6 sm:p-8 bg-[#0d0724] rounded-b-2xl text-center space-y-6 relative overflow-hidden">
          {/* Subtle Cyberpunk grid/perspective lines */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent pointer-events-none" />

          {/* STEP 0: Every Player Starts With */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-fadeIn relative z-10">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                  Every Player Starts With
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  <strong className="text-white">$100,000</strong> virtual trading balance &bull;{' '}
                  <strong className="text-cyan-300">100</strong> traderFi tokens
                </p>
                <p className="text-xs text-purple-300">
                  Use your balance to trade and compete in live fast-paced tournaments.
                </p>
              </div>

              {/* Start Assets Cards */}
              <div className="space-y-3 max-w-sm mx-auto text-left">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner">
                    💼
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      VIRTUAL BALANCE
                    </span>
                    <span className="text-xl font-black text-white font-mono">$100,000</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl shadow-inner">
                    💎
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      TRADERFI TOKENS
                    </span>
                    <span className="text-xl font-black text-cyan-300 font-mono">100 TOKENS</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Grow Your Virtual Balance & Order Terminal */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fadeIn relative z-10">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                  Grow Your Virtual Balance
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Start with <strong className="text-white">$100,000 in virtual capital</strong> and make smart{' '}
                  <strong className="text-cyan-400">BUY</strong> and <strong className="text-purple-400">SELL</strong> decisions.
                </p>
              </div>

              {/* Mini Order Terminal Preview Matching Screenshot 3 */}
              <div className="p-4 rounded-2xl bg-[#140b33] border border-purple-500/40 max-w-md mx-auto space-y-3 shadow-xl">
                {/* Bid / Close / Ask row */}
                <div className="grid grid-cols-3 gap-2 text-xs font-mono font-bold">
                  <div className="bg-emerald-600 text-white py-1.5 px-2 rounded-lg flex items-center justify-between">
                    <span>BID</span>
                    <span>165.19</span>
                  </div>
                  <div className="bg-amber-600/90 text-white py-1.5 px-2 rounded-lg text-center text-[10px] uppercase font-black flex items-center justify-center">
                    CLOSE TRADE
                  </div>
                  <div className="bg-rose-600 text-white py-1.5 px-2 rounded-lg flex items-center justify-between">
                    <span>ASK</span>
                    <span>165.20</span>
                  </div>
                </div>

                {/* Angled BUY & SELL buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 border border-blue-400 text-white font-black text-sm tracking-wider text-center shadow-md">
                    BUY
                  </div>
                  <div className="py-2.5 rounded-xl bg-gradient-to-r from-purple-800 to-purple-600 border border-purple-400 text-white font-black text-sm tracking-wider text-center shadow-md">
                    SELL
                  </div>
                </div>

                {/* Sizing dropdowns */}
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-slate-300 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                  <span>TYPE: <strong>MKT</strong></span>
                  <span>QTY: <strong>0</strong></span>
                  <span>SIZE: <strong>100</strong></span>
                </div>
              </div>

              {/* Profit Pill Display */}
              <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-indigo-950/80 border border-emerald-500/40 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-black text-sm">
                    $
                  </div>
                  <span className="text-xs font-bold text-slate-300 uppercase">PROFIT</span>
                </div>
                <span className="text-xl font-black text-emerald-400 font-mono">+$1,251.26</span>
              </div>
            </div>
          )}

          {/* STEP 2: 5-Minute Tournaments */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fadeIn relative z-10">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                  5-Minute Compressed Day Replay
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  A full real historical trading session is replayed in exactly{' '}
                  <strong className="text-amber-300">5 fast-paced minutes</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto text-left text-xs">
                <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 space-y-1">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <Clock className="w-4 h-4" />
                    <span>Real Price Action</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Every tick reflects genuine market volume and price history, not randomized RNG luck.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 space-y-1">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Zap className="w-4 h-4" />
                    <span>High-Speed Execution</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Enter breakouts, trail stops, scale into dips, and take profit before the closing bell!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Live Tournament Rankings & Prizes */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fadeIn relative z-10">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                  Compete for Token Prize Pools
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Finish the match with the highest net profit to climb the leaderboard and win token payouts.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#140b33] border border-purple-500/40 max-w-md mx-auto space-y-2 text-left text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  <span className="font-bold flex items-center gap-2">
                    <span>🥇 1st Place</span>
                    <span className="text-slate-300 font-sans">AlphaTrader</span>
                  </span>
                  <span className="font-bold text-emerald-400">+$3,420.00 &bull; +45 💎</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="font-bold flex items-center gap-2">
                    <span>🥈 2nd Place</span>
                    <span className="text-slate-300 font-sans">BullRunner</span>
                  </span>
                  <span className="font-bold text-emerald-400">+$1,890.50 &bull; +20 💎</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="font-bold flex items-center gap-2">
                    <span>🥉 3rd Place</span>
                    <span className="text-slate-300 font-sans">MomentumKing</span>
                  </span>
                  <span className="font-bold text-emerald-400">+$950.00 &bull; +10 💎</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Risk Rules & Discipline */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-fadeIn relative z-10">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                  Discipline Over Luck
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Avoid catastrophic losses. Smart position sizing and timely trade closes are your edge.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/60 border border-rose-500/30 max-w-md mx-auto space-y-2 text-left text-xs">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-slate-200">
                    <strong>Rule #1:</strong> Never hold a losing position hoping it bounces back in a 5-minute round. Cut losses early!
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-slate-200">
                    <strong>Rule #2:</strong> Use preset sizing (100, 250, 500) according to stock price volatility to avoid margin exhaustion.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Ready to Play */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fadeIn relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-3xl mx-auto shadow-xl shadow-purple-500/30">
                🚀
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  You Are Ready To Beat The Market!
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                  Jump into a Beginner Tournament, challenge friends in a private room, or hone your skills solo!
                </p>
              </div>
            </div>
          )}

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundEffects.click();
                  setCurrentStep(idx);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  currentStep === idx
                    ? 'w-6 bg-gradient-to-r from-amber-400 to-yellow-300 shadow-md shadow-amber-400/50'
                    : 'bg-purple-900/60 hover:bg-purple-700'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons (Back & Next) */}
          <div className="flex items-center justify-between gap-4 pt-2">
            {currentStep > 0 ? (
              <button
                onClick={handleBack}
                className="flex-1 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs sm:text-sm transition-all border border-slate-700 cursor-pointer"
              >
                Back
              </button>
            ) : (
              <div className="flex-1" />
            )}

            <button
              onClick={handleNext}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/40 hover:scale-105 active:scale-95 cursor-pointer"
            >
              {currentStep === totalSteps - 1 ? 'Start Playing' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
