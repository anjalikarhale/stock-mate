import React, { useState, useEffect } from 'react';
import {
  Swords,
  Flame,
  Shield,
  RotateCcw,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Trophy,
  ArrowLeft,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CANDLESTICK_MONSTERS, CandlestickMonster } from '../../data/candlestickCombatData';
import { useGame } from '../../context/GameContext';
import { soundEffects } from '../../utils/audio';

export const CandlestickCombat: React.FC = () => {
  const { addXP, addVirtualCash, recordMistake, completeDailyQuest, setActiveGame } = useGame();
  
  const [currentMonsterIndex, setCurrentMonsterIndex] = useState(0);
  const [bossHp, setBossHp] = useState(100);
  const [maxBossHp] = useState(100);
  const [playerScore, setPlayerScore] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const currentMonster: CandlestickMonster = CANDLESTICK_MONSTERS[currentMonsterIndex % CANDLESTICK_MONSTERS.length];

  // Timer tick
  useEffect(() => {
    if (isAnswerRevealed || isGameOver || isVictory) return;
    const timer = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isAnswerRevealed, isGameOver, isVictory, currentMonsterIndex]);

  const handleTimeOut = () => {
    setIsAnswerRevealed(true);
    setIsCorrect(false);
    setComboStreak(0);
    soundEffects.wrong();
    recordMistake(
      'CHASING_PEAK',
      `Hesitation on ${currentMonster.name} candlestick pattern recognition under time pressure.`,
      500,
      'Practice quick visual recognition of upper vs lower shadows.'
    );
  };

  const handleSelectOption = (option: string) => {
    if (isAnswerRevealed || isGameOver || isVictory) return;
    setSelectedAnswer(option);
    setIsAnswerRevealed(true);

    const correct = option === currentMonster.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      soundEffects.combatHit();
      const streakBonus = comboStreak + 1;
      setComboStreak(streakBonus);
      setPlayerScore(prev => prev + 100 * streakBonus);
      
      const newBossHp = Math.max(0, bossHp - currentMonster.bossHpCost);
      setBossHp(newBossHp);

      addXP(40 + streakBonus * 10, `Identified ${currentMonster.name}`);

      if (newBossHp <= 0) {
        setIsVictory(true);
        soundEffects.levelUp();
        addXP(150, 'Defeated Candlestick Titan Boss');
        addVirtualCash(2500);
        completeDailyQuest('quest-1');
        try {
          confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
        } catch {}
      }
    } else {
      soundEffects.wrong();
      setComboStreak(0);
      recordMistake(
        'IGNORING_FUNDAMENTALS',
        `Misidentified ${currentMonster.correctAnswer} as ${option}.`,
        800,
        currentMonster.deepExplanation
      );
    }
  };

  const handleNextChallenge = () => {
    soundEffects.click();
    setSelectedAnswer(null);
    setIsAnswerRevealed(false);
    setIsCorrect(false);
    setTimerSeconds(25);
    setCurrentMonsterIndex(prev => prev + 1);
  };

  const handleRestart = () => {
    soundEffects.click();
    setBossHp(maxBossHp);
    setPlayerScore(0);
    setComboStreak(0);
    setSelectedAnswer(null);
    setIsAnswerRevealed(false);
    setIsCorrect(false);
    setIsGameOver(false);
    setIsVictory(false);
    setTimerSeconds(25);
    setCurrentMonsterIndex(0);
  };

  // Helper to render the candlestick visual SVG/Canvas
  const renderVisualCandle = (visual: CandlestickMonster['visual']) => {
    const totalHeight = 180;
    const candleWidth = 32;

    const renderSingleBar = (
      upper: number,
      body: number,
      lower: number,
      isGreen: boolean,
      bodyTop: number,
      offsetKey: string
    ) => {
      const upperHeight = upper * totalHeight;
      const bodyHeight = Math.max(4, body * totalHeight);
      const lowerHeight = lower * totalHeight;
      const topY = bodyTop * totalHeight;

      const fillColor = isGreen ? '#10b981' : '#ef4444';
      const glowColor = isGreen ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)';

      return (
        <div key={offsetKey} className="relative flex flex-col items-center h-[180px] w-[50px]">
          {/* Upper Shadow */}
          {upper > 0 && (
            <div
              className="w-1 bg-slate-300 rounded-t"
              style={{
                height: `${upperHeight}px`,
                backgroundColor: fillColor,
              }}
            />
          )}

          {/* Real Body */}
          <div
            className="w-8 rounded-sm transition-transform duration-300 hover:scale-105 shadow-md flex items-center justify-center text-[10px] font-mono font-bold text-white/90"
            style={{
              height: `${bodyHeight}px`,
              backgroundColor: fillColor,
              boxShadow: `0 0 16px ${glowColor}`,
            }}
          >
            {body > 0.3 && (isGreen ? '▲ BULL' : '▼ BEAR')}
          </div>

          {/* Lower Shadow */}
          {lower > 0 && (
            <div
              className="w-1 bg-slate-300 rounded-b"
              style={{
                height: `${lowerHeight}px`,
                backgroundColor: fillColor,
              }}
            />
          )}
        </div>
      );
    };

    return (
      <div className="flex items-center justify-center gap-4 bg-slate-950/80 p-6 rounded-2xl border border-slate-800 shadow-inner h-[220px]">
        {renderSingleBar(
          visual.upperWickRatio,
          visual.bodyRatio,
          visual.lowerWickRatio,
          visual.isGreen,
          visual.bodyTopOffset,
          'candle-primary'
        )}

        {visual.secondCandle && (
          renderSingleBar(
            visual.secondCandle.upperWickRatio,
            visual.secondCandle.bodyRatio,
            visual.secondCandle.lowerWickRatio,
            visual.secondCandle.isGreen,
            visual.secondCandle.bodyTopOffset,
            'candle-secondary'
          )
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveGame(null)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to World Map</span>
        </button>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Score: {playerScore}</span>
          </div>

          {comboStreak > 1 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md animate-pulse">
              <Flame className="w-4 h-4 fill-current" />
              <span>{comboStreak}x COMBO!</span>
            </div>
          )}
        </div>
      </div>

      {/* Arena Stage */}
      <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Boss HP Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
            <span className="flex items-center gap-2 text-rose-400">
              <Swords className="w-4 h-4" />
              <span>Boss: Shadow Wick Dragon</span>
            </span>
            <span className="font-mono text-slate-400">{bossHp} / {maxBossHp} HP</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-3 p-0.5 border border-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${(bossHp / maxBossHp) * 100}%` }}
            />
          </div>
        </div>

        {/* Victory Screen */}
        {isVictory ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950/40 animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-white">VICTORY ACHIEVED!</h2>
            <p className="text-slate-300 text-sm max-w-md mx-auto">
              You decimated the Shadow Wick Dragon by mastering candlestick pattern identification with surgical precision!
            </p>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 max-w-sm mx-auto flex items-center justify-around text-xs">
              <div>
                <div className="text-slate-400">XP Rewarded</div>
                <div className="text-base font-bold text-emerald-400">+150 XP</div>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div>
                <div className="text-slate-400">Virtual Bonus</div>
                <div className="text-base font-bold text-amber-400">+₹2,500</div>
              </div>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handleRestart}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition-transform active:scale-95"
              >
                Play Again
              </button>
              <button
                onClick={() => setActiveGame(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-colors"
              >
                Return to Lobby
              </button>
            </div>
          </div>
        ) : (
          /* Active Combat State */
          <div className="space-y-6">
            {/* Visual Candlestick Display & Timer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 rounded-2xl p-5 border border-slate-800">
              <div className="w-full sm:w-1/2 flex flex-col items-center">
                <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Inspect Price Action Geometry</span>
                </div>
                {renderVisualCandle(currentMonster.visual)}
              </div>

              {/* Timer & Objective */}
              <div className="w-full sm:w-1/2 flex flex-col justify-center space-y-4">
                <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                  <div className="text-xs font-semibold text-slate-300">
                    Target Strike Window:
                  </div>
                  <div className={`text-lg font-mono font-black ${timerSeconds <= 5 ? 'text-rose-400 animate-ping' : 'text-amber-400'}`}>
                    00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}s
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200">
                  <span className="font-bold text-indigo-300">⚔️ Combat Rule:</span> What candlestick pattern is formed by this price rejection? Strike before time runs out!
                </div>
              </div>
            </div>

            {/* Pattern Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentMonster.options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isTheCorrectOne = option === currentMonster.correctAnswer;

                let btnStyle = 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-white';
                if (isAnswerRevealed) {
                  if (isTheCorrectOne) {
                    btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-950/40';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-950 border-rose-500 text-rose-300';
                  } else {
                    btnStyle = 'bg-slate-950/60 border-slate-900 text-slate-400 opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerRevealed}
                    onClick={() => handleSelectOption(option)}
                    className={`p-4 rounded-xl border font-bold text-sm text-left transition-all flex items-center justify-between group active:scale-[0.98] ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswerRevealed && isTheCorrectOne && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                    {isAnswerRevealed && isSelected && !isTheCorrectOne && (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanatory Socratic Feedback */}
            {isAnswerRevealed && (
              <div className={`p-5 rounded-2xl border transition-all animate-fadeIn ${
                isCorrect
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-950 shrink-0">
                    {isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <HelpCircle className="w-6 h-6 text-rose-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-extrabold text-sm mb-1">
                      {isCorrect ? '🎯 Direct Hit! Critical Analysis' : `❌ Strike Deflected: This is a ${currentMonster.correctAnswer}`}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed mb-2">
                      <strong>Market Implication:</strong> {currentMonster.marketImplication}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong>Why this matters:</strong> {currentMonster.deepExplanation}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleNextChallenge}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    <span>Next Candlestick</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
