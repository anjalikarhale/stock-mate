import React, { useState } from 'react';
import {
  ShieldAlert,
  Zap,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
  Activity,
  HeartCrack,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CRASH_SCENARIO, CrashWave } from '../../data/marketCrashData';
import { useGame } from '../../context/GameContext';
import { soundEffects } from '../../utils/audio';

export const MarketCrashGame: React.FC = () => {
  const { addXP, addVirtualCash, recordMistake, completeDailyQuest, setActiveGame, updateStats } = useGame();

  const [currentWaveIndex, setCurrentWaveIndex] = useState(0);
  const [portfolioValue, setPortfolioValue] = useState(CRASH_SCENARIO.initialPortfolioValue);
  const [cashBalance, setCashBalance] = useState(CRASH_SCENARIO.initialCash);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [decisionHistory, setDecisionHistory] = useState<any[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [disciplineScore, setDisciplineScore] = useState(60);

  const currentWave: CrashWave | undefined = CRASH_SCENARIO.waves[currentWaveIndex];
  const maxDrawdown = Math.round(((CRASH_SCENARIO.initialPortfolioValue - portfolioValue) / CRASH_SCENARIO.initialPortfolioValue) * 100);

  const handleMakeDecision = (choice: CrashWave['choices'][0]) => {
    if (selectedChoiceId !== null) return;
    setSelectedChoiceId(choice.id);

    const newPortfolioVal = Math.max(10000, portfolioValue + choice.immediatePnLImpact);
    setPortfolioValue(newPortfolioVal);

    const newDiscipline = Math.min(100, Math.max(0, disciplineScore + choice.disciplineScoreChange));
    setDisciplineScore(newDiscipline);

    const isGoodDecision = choice.disciplineScoreChange > 0;
    if (isGoodDecision) {
      soundEffects.correct();
      addXP(50, 'Disciplined Crisis Management');
    } else {
      soundEffects.wrong();
      recordMistake(
        choice.portfolioAction === 'LEVERAGE_AVERAGE_DOWN' ? 'OVERTRADING' : 'FOMO',
        `Panic response during ${currentWave?.title}: ${choice.label}`,
        Math.abs(choice.immediatePnLImpact),
        choice.explanation
      );
    }

    setDecisionHistory(prev => [
      ...prev,
      {
        waveNumber: currentWave?.waveNumber,
        waveTitle: currentWave?.title,
        choice,
        resultingPortfolio: newPortfolioVal,
      }
    ]);
  };

  const handleNextWave = () => {
    soundEffects.click();
    setSelectedChoiceId(null);
    if (currentWaveIndex + 1 < CRASH_SCENARIO.waves.length) {
      setCurrentWaveIndex(prev => prev + 1);
    } else {
      // Completed all waves
      setIsCompleted(true);
      soundEffects.levelUp();
      addXP(150, 'Survived Flash Crash Simulation');
      addVirtualCash(3000);
      completeDailyQuest('quest-3');
      updateStats({
        riskManagementScore: Math.min(100, disciplineScore),
        psychologyScore: Math.min(100, disciplineScore + 10)
      });
      try {
        confetti({ particleCount: 140, spread: 80, origin: { y: 0.5 } });
      } catch {}
    }
  };

  const handleRestart = () => {
    soundEffects.click();
    setCurrentWaveIndex(0);
    setPortfolioValue(CRASH_SCENARIO.initialPortfolioValue);
    setCashBalance(CRASH_SCENARIO.initialCash);
    setSelectedChoiceId(null);
    setDecisionHistory([]);
    setIsCompleted(false);
    setDisciplineScore(60);
  };

  const currentSelectedChoice = currentWave?.choices.find(c => c.id === selectedChoiceId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveGame(null)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to World Map</span>
        </button>

        <div className="flex items-center gap-3 text-xs font-bold">
          <div className="px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 flex items-center gap-1.5 animate-pulse">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Black Swan Crisis Mode</span>
          </div>
        </div>
      </div>

      {/* Main Crisis Arena */}
      <div className="rounded-3xl border border-rose-950/60 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Live Crisis HUD */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Portfolio Value
            </div>
            <div className="text-sm sm:text-base font-extrabold font-mono text-white">
              ₹{portfolioValue.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Drawdown
            </div>
            <div className={`text-sm sm:text-base font-extrabold font-mono ${maxDrawdown > 15 ? 'text-rose-400' : 'text-amber-400'}`}>
              {maxDrawdown > 0 ? `-${maxDrawdown}%` : '0%'}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Discipline Meter
            </div>
            <div className="text-sm sm:text-base font-extrabold font-mono text-indigo-400">
              {disciplineScore} / 100
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Crisis Wave
            </div>
            <div className="text-sm sm:text-base font-extrabold font-mono text-amber-300">
              {isCompleted ? 'COMPLETE' : `${currentWaveIndex + 1} of ${CRASH_SCENARIO.waves.length}`}
            </div>
          </div>
        </div>

        {isCompleted ? (
          /* Crash Survival Debrief Screen */
          <div className="text-center py-8 space-y-5">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950/40">
              <Trophy className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-white">CRISIS SURVIVED!</h2>
            <p className="text-slate-300 text-sm max-w-lg mx-auto">
              {CRASH_SCENARIO.debriefSummary}
            </p>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 max-w-md mx-auto text-left space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Forensic Survival Audit:
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Final Portfolio Capital:</span>
                <span className="font-mono font-bold text-emerald-400">₹{portfolioValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Psychology & Discipline Score:</span>
                <span className="font-mono font-bold text-indigo-400">{disciplineScore} / 100</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>XP Rewarded:</span>
                <span className="font-mono font-bold text-amber-400">+150 XP</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={handleRestart}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition-transform active:scale-95"
              >
                Replay Crisis
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
          /* Active Wave Scenario */
          currentWave && (
            <div className="space-y-6">
              {/* Wave Header & Macro Event */}
              <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    <span>{currentWave.title}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold">
                    NIFTY {currentWave.niftyShockPercent > 0 ? `+${currentWave.niftyShockPercent}%` : `${currentWave.niftyShockPercent}%`}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white">
                  {currentWave.triggerEvent}
                </h3>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{currentWave.marketNews}</span>
                </div>
              </div>

              {/* Action Decision Choices */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Select Your Risk & Asset Allocation Response:
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {currentWave.choices.map((choice) => {
                    const isSelected = selectedChoiceId === choice.id;
                    const isPositive = choice.disciplineScoreChange > 0;

                    let cardStyle = 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-white';
                    if (selectedChoiceId !== null) {
                      if (isSelected) {
                        cardStyle = isPositive
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30'
                          : 'bg-rose-950 border-rose-500 text-rose-200 ring-2 ring-rose-500/30';
                      } else {
                        cardStyle = 'bg-slate-950/50 border-slate-900 text-slate-400 opacity-50';
                      }
                    }

                    return (
                      <button
                        key={choice.id}
                        disabled={selectedChoiceId !== null}
                        onClick={() => handleMakeDecision(choice)}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group active:scale-[0.99] ${cardStyle}`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <span className="font-extrabold text-sm text-white group-hover:text-indigo-300 transition-colors">
                            {choice.label}
                          </span>
                          {selectedChoiceId !== null && isSelected && (
                            <span>
                              {isPositive ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              ) : (
                                <XCircle className="w-5 h-5 text-rose-400" />
                              )}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {choice.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Explanatory Feedback */}
              {currentSelectedChoice && (
                <div className={`p-5 rounded-2xl border transition-all animate-fadeIn ${
                  currentSelectedChoice.disciplineScoreChange > 0
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-950 shrink-0">
                      {currentSelectedChoice.disciplineScoreChange > 0 ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <HelpCircle className="w-6 h-6 text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-extrabold text-sm mb-1">
                        {currentSelectedChoice.disciplineScoreChange > 0 ? 'Disciplined Risk Execution' : 'Psychological Bias Triggered'}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {currentSelectedChoice.explanation}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleNextWave}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                    >
                      {currentWaveIndex + 1 < CRASH_SCENARIO.waves.length ? 'Next Crash Wave →' : 'Complete Debrief →'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};
