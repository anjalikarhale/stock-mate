import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  User,
  ArrowRight,
  ShieldCheck,
  Award,
  Zap,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Coins,
  ChevronRight,
  Flame,
  Gamepad2
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { DIAGNOSTIC_QUESTIONS } from '../../data/missionsData';
import { soundEffects } from '../../utils/audio';

const AVATARS = [
  { emoji: '🦁', name: 'Lion', desc: 'Brave & Disciplined' },
  { emoji: '🦅', name: 'Falcon', desc: 'Sharp Pattern Spotter' },
  { emoji: '🐺', name: 'Wolf', desc: 'Strategic & Patient' },
  { emoji: '🐲', name: 'Dragon', desc: 'Resilient in Crashes' },
  { emoji: '🦉', name: 'Owl', desc: 'Wise & Fundamental' },
  { emoji: '🐂', name: 'Bull', desc: 'Growth Compounder' },
  { emoji: '⚡', name: 'Titan', desc: 'Fast Technical Trader' },
];

export const OnboardingFlow: React.FC = () => {
  const { completeOnboarding, skipTutorialWithDiagnostic } = useGame();

  const [step, setStep] = useState<'WELCOME' | 'MENTOR_INTRO' | 'CHARACTER' | 'DIAGNOSTIC'>('WELCOME');
  const [username, setUsername] = useState('MarketExplorer');
  const [nickname, setNickname] = useState('Rookie Trader');
  const [selectedAvatar, setSelectedAvatar] = useState('🦁');

  // Diagnostic state
  const [diagIndex, setDiagIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [diagScore, setDiagScore] = useState<number | null>(null);

  const handleStartJourney = () => {
    soundEffects.click();
    setStep('MENTOR_INTRO');
  };

  const handleMentorComplete = () => {
    soundEffects.click();
    setStep('CHARACTER');
  };

  const handleCharacterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.levelUp();
    completeOnboarding({
      username: username.trim() || 'MarketExplorer',
      avatar: selectedAvatar,
      nickname: nickname.trim() || 'Rookie Trader',
    });
  };

  const handleDiagSelect = (optIndex: number) => {
    soundEffects.click();
    setSelectedOptions(prev => ({ ...prev, [diagIndex]: optIndex }));
  };

  const handleNextDiag = () => {
    soundEffects.click();
    if (diagIndex + 1 < DIAGNOSTIC_QUESTIONS.length) {
      setDiagIndex(prev => prev + 1);
    } else {
      // Calculate score
      let correctCount = 0;
      DIAGNOSTIC_QUESTIONS.forEach((q, idx) => {
        const selected = selectedOptions[idx];
        if (selected !== undefined && q.options[selected]?.correct) {
          correctCount++;
        }
      });
      const scorePct = Math.round((correctCount / DIAGNOSTIC_QUESTIONS.length) * 100);
      setDiagScore(scorePct);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      {/* Background radial glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-600/10 blur-[130px] rounded-full" />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-600/10 blur-[130px] rounded-full" />
      </div>

      <div className="relative w-full max-w-xl bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 sm:p-10 shadow-2xl shadow-black/80 space-y-8 animate-fadeIn">
        {/* STEP 1: WELCOME SCREEN */}
        {step === 'WELCOME' && (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>The Indian Stock Market (NSE/BSE) RPG</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                WELCOME TO <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
                  MARKET QUEST
                </span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                Your journey from complete beginner to <strong className="text-white">Market Master</strong> starts here. Learn by playing, making decisions, and surviving Dalal Street.
              </p>
            </div>

            {/* Starting Guarantee Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Risk-Free Simulation</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                You begin with <strong className="text-white font-mono">₹1,00,000 Virtual Capital</strong>. No real money involved. All stocks reflect real NSE/BSE mechanics without financial risk.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                id="btn-start-journey"
                onClick={handleStartJourney}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-black text-sm sm:text-base shadow-xl shadow-indigo-950/50 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>START MY JOURNEY</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setStep('DIAGNOSTIC')}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                I already know the basics (Skip & Test Placement) →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: MEET YOUR MARKET MENTOR */}
        {step === 'MENTOR_INTRO' && (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-0.5 mx-auto shadow-xl shadow-indigo-950/60 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                  <Bot className="w-10 h-10 text-indigo-400 animate-pulse" />
                </div>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">MEET YOUR MARKET MENTOR</h2>
                <p className="text-xs text-indigo-300 font-semibold mt-0.5">Arya — Socratic Market Guide</p>
              </div>
            </div>

            {/* Mentor Dialogue Bubbles */}
            <div className="space-y-3 bg-slate-950/90 rounded-2xl border border-slate-800 p-5 text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                💬 <strong className="text-indigo-300">"Don't know anything about stocks?"</strong>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                ✨ <strong className="text-emerald-400">"Perfect. You don't need any prior experience."</strong>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-300">
                "I will teach you everything step by step. We'll start with how money works, what a stock really is, and how to place your first trade."
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-300">
                "You'll learn by <span className="text-amber-300 font-bold">playing mini-games</span>, making real choices, and experiencing bull runs and crashes without fear."
              </div>
            </div>

            <button
              onClick={handleMentorComplete}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
            >
              <span>LET'S GO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 3: CHARACTER CREATION */}
        {step === 'CHARACTER' && (
          <form onSubmit={handleCharacterSubmit} className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-white">CREATE YOUR CHARACTER</h2>
              <p className="text-xs text-slate-400">Choose your avatar and market identity</p>
            </div>

            {/* Avatar Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Select Your Avatar
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {AVATARS.map(av => (
                  <button
                    key={av.emoji}
                    type="button"
                    onClick={() => {
                      soundEffects.click();
                      setSelectedAvatar(av.emoji);
                    }}
                    className={`p-3 rounded-2xl text-2xl flex flex-col items-center justify-center border transition-all ${
                      selectedAvatar === av.emoji
                        ? 'bg-indigo-600/30 border-indigo-500 ring-2 ring-indigo-500/40 scale-105'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>{av.emoji}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Username Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Trader Name
              </label>
              <input
                type="text"
                required
                maxLength={24}
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. Arjun, Priya, AlphaWolf"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
              />
            </div>

            {/* Starting Stats Snapshot Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Starting Character Profile
              </div>
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="flex justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Level:</span>
                  <span className="text-white font-bold">1 (Newbie)</span>
                </div>
                <div className="flex justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Virtual Cash:</span>
                  <span className="text-emerald-400 font-bold">₹1,00,000</span>
                </div>
                <div className="flex justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Knowledge:</span>
                  <span className="text-indigo-300 font-bold">0 / 100</span>
                </div>
                <div className="flex justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Experience:</span>
                  <span className="text-indigo-300 font-bold">0 / 100</span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-amber-300 font-semibold">
                <span>🛡️</span>
                <span>THIS IS VIRTUAL MONEY • 100% Educational</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-emerald-950/40 flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
            >
              <span>ENTER DALAL STREET</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        )}

        {/* STEP 4: DIAGNOSTIC ASSESSMENT */}
        {step === 'DIAGNOSTIC' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-base">Diagnostic Placement Test</h3>
                <p className="text-xs text-slate-400">Answer 4 quick questions to place your skill level</p>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-400">
                {diagIndex + 1} / {DIAGNOSTIC_QUESTIONS.length}
              </span>
            </div>

            {diagScore === null ? (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm font-bold text-white leading-relaxed">
                  {DIAGNOSTIC_QUESTIONS[diagIndex].question}
                </div>

                <div className="space-y-2.5">
                  {DIAGNOSTIC_QUESTIONS[diagIndex].options.map((opt, optIdx) => {
                    const isSelected = selectedOptions[diagIndex] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleDiagSelect(optIdx)}
                        className={`w-full p-3.5 rounded-2xl border text-left text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-indigo-950 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                            : 'bg-slate-950 border-slate-850 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setStep('WELCOME')}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ← Back to Welcome
                  </button>
                  <button
                    disabled={selectedOptions[diagIndex] === undefined}
                    onClick={handleNextDiag}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-md transition-transform active:scale-95"
                  >
                    {diagIndex + 1 < DIAGNOSTIC_QUESTIONS.length ? 'Next Question →' : 'Calculate Placement'}
                  </button>
                </div>
              </div>
            ) : (
              /* Diagnostic Result */
              <div className="text-center space-y-5 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-2xl font-black font-mono">
                  {diagScore}%
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">
                    {diagScore >= 75 ? 'Expert Placement Verified!' : diagScore >= 50 ? 'Intermediate Trader Placement' : 'Beginner Explorer Placement'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                    {diagScore >= 75
                      ? 'You have strong fundamentals. All 10 missions and Free Mode have been unlocked for you!'
                      : diagScore >= 50
                      ? 'You understand core concepts! Early missions completed and Chart Arena unlocked.'
                      : 'We recommend completing the guided Journey Mode from Mission 1.'}
                  </p>
                </div>

                <button
                  onClick={() => skipTutorialWithDiagnostic(diagScore)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-indigo-600 text-white font-bold text-xs shadow-xl"
                >
                  Enter Market Quest with Unlocks →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
