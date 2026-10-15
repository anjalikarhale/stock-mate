import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Clock, Trophy, ChevronRight, ChevronLeft, ArrowLeft, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { useClassroom } from '../../context/ClassroomContext';
import { classroomApi } from '../../services/classroomApi';
import { ROUND_1_QUESTIONS, ROUND_2_QUESTIONS, ClientQuizQuestion } from '../../data/marketChallengeQuestions';
import { QuizQuestionVisual } from './QuizQuestionVisual';
import { LiveLeaderboard } from './LiveLeaderboard';

interface AnsweredState {
  [questionNumber: number]: {
    selectedOption: 'A' | 'B' | 'C' | 'D';
    isCorrect: boolean;
    score: number;
  };
}

export const MarketBattleActivity: React.FC = () => {
  const {
    activeActivity,
    currentUser,
    leaderboard,
    roundTimeRemaining,
    setActiveView,
  } = useClassroom();

  const currentRoundNumber = (activeActivity?.currentRoundNumber === 2 ? 2 : 1) as 1 | 2;
  const isActivityCompleted = activeActivity?.status === 'COMPLETED';

  // Questions for active round
  const currentQuestions = useMemo(() => {
    return currentRoundNumber === 2 ? ROUND_2_QUESTIONS : ROUND_1_QUESTIONS;
  }, [currentRoundNumber]);

  // Current question index (0 to 9)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<AnsweredState>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // Sync / fetch existing answers
  const loadStudentAnswers = useCallback(async () => {
    if (!activeActivity || !currentUser) return;
    try {
      const recorded = await classroomApi.getStudentQuizAnswers(activeActivity.id, currentUser.id);
      if (Array.isArray(recorded)) {
        const stateMap: AnsweredState = {};
        recorded
          .filter((a) => a.roundNumber === currentRoundNumber)
          .forEach((a) => {
            stateMap[a.questionNumber] = {
              selectedOption: a.selectedOption,
              isCorrect: a.isCorrect,
              score: a.score,
            };
          });
        setAnswers(stateMap);

        // Jump to first unanswered question if available
        const unansweredIdx = currentQuestions.findIndex((q) => !stateMap[q.questionNumber]);
        if (unansweredIdx !== -1) {
          setCurrentQuestionIndex(unansweredIdx);
        }
      }
    } catch (err) {
      console.error('Error loading answers:', err);
    }
  }, [activeActivity?.id, currentUser?.id, currentRoundNumber, currentQuestions]);

  useEffect(() => {
    loadStudentAnswers();
  }, [loadStudentAnswers]);

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setFeedback(null);
  }, [currentRoundNumber]);

  const activeQuestion: ClientQuizQuestion | undefined = currentQuestions[currentQuestionIndex];
  const activeAnswer = activeQuestion ? answers[activeQuestion.questionNumber] : undefined;
  const isQuestionAnswered = Boolean(activeAnswer);

  const studentEntry = useMemo(() => {
    if (!currentUser?.id) return undefined;
    return leaderboard.find((e) => e.studentId === currentUser.id);
  }, [leaderboard, currentUser?.id]);

  const answeredCount = Object.keys(answers).length;
  const isRoundComplete = answeredCount >= currentQuestions.length;

  // Format timer MM:SS
  const formatTimer = (secs: number) => {
    const m = Math.floor(Math.max(0, secs) / 60);
    const s = Math.max(0, secs) % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Submit Answer
  const handleSelectOption = async (optionKey: 'A' | 'B' | 'C' | 'D') => {
    if (!activeQuestion || !activeActivity || isQuestionAnswered || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await classroomApi.submitQuizAnswer(activeActivity.id, {
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentAvatar: currentUser.avatar,
        roundNumber: currentRoundNumber,
        questionNumber: activeQuestion.questionNumber,
        questionId: activeQuestion.id,
        selectedOption: optionKey,
      });

      setAnswers((prev) => ({
        ...prev,
        [activeQuestion.questionNumber]: {
          selectedOption: optionKey,
          isCorrect: response.isCorrect,
          score: response.score,
        },
      }));

      setFeedback({
        isCorrect: response.isCorrect,
        text: response.isCorrect ? '+100 points' : '0 points',
      });
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setFeedback(null);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setFeedback(null);
    }
  };

  // ==========================================================================
  // 13. FINAL RESULT SCREEN
  // ==========================================================================
  if (isActivityCompleted) {
    const totalScore = studentEntry?.totalScore ?? 0;
    const finalRank = studentEntry?.rank ?? 1;
    const accuracy = studentEntry?.accuracyPercent ?? Math.round((totalScore / 2000) * 100);
    const correctCount = Math.round(totalScore / 100);
    const xpEarned = Math.round(totalScore / 10);

    return (
      <div className="max-w-lg mx-auto py-8 px-4 text-center space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="w-16 h-16 bg-amber-500/15 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
            <Trophy className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            STOCKMATE CHALLENGE COMPLETE!
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Great effort! Here is your official performance summary:
          </p>

          <div className="grid grid-cols-2 gap-3.5 mt-6 text-left">
            <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Your Score</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                {totalScore} / 2000
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Correct Answers</span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono">
                {correctCount} / 20
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Accuracy</span>
              <span className="text-xl sm:text-2xl font-black text-indigo-400 font-mono">
                {accuracy}%
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Rank</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                #{finalRank}
              </span>
            </div>
          </div>

          <div className="mt-4 bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">XP Earned</span>
            <span className="text-sm font-black text-indigo-300 font-mono">+{xpEarned} XP</span>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowLeaderboard(true)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider py-3 rounded-xl border border-slate-700 transition-colors"
            >
              View Leaderboard
            </button>
            <button
              onClick={() => setActiveView('LIST')}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-md"
            >
              Back to Classroom
            </button>
          </div>
        </div>

        {/* Leaderboard Modal */}
        {showLeaderboard && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-white">Classroom Leaderboard</h3>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-slate-400 hover:text-white text-sm p-1 font-bold"
                >
                  ✕
                </button>
              </div>
              <LiveLeaderboard entries={leaderboard} currentUserId={currentUser?.id} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================================================
  // 11. AFTER ROUND 1 COMPLETE SCREEN
  // ==========================================================================
  if (isRoundComplete && currentRoundNumber === 1 && activeActivity?.status === 'LIVE') {
    const answeredValues = Object.values(answers) as Array<{
      selectedOption: 'A' | 'B' | 'C' | 'D';
      isCorrect: boolean;
      score: number;
    }>;
    const round1Score = answeredValues.reduce((sum, a) => sum + (a.score || 0), 0);
    const correctCount = answeredValues.filter((a) => a.isCorrect).length;

    return (
      <div className="max-w-md mx-auto py-10 px-4 text-center space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/15 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            ROUND 1 COMPLETE
          </h2>

          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 my-6 space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Correct Answers:</span>
              <span className="text-lg font-black text-white font-mono">{correctCount} / 10</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs font-bold uppercase text-slate-400">Score:</span>
              <span className="text-xl font-black text-emerald-400 font-mono">{round1Score} points</span>
            </div>
          </div>

          <button
            onClick={() => setShowLeaderboard(true)}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider py-3 rounded-xl border border-slate-700 transition-colors mb-4"
          >
            View Leaderboard
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium pt-2">
            <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>Waiting for teacher to start Round 2...</span>
          </div>
        </div>

        {/* Leaderboard Modal */}
        {showLeaderboard && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-white">Classroom Leaderboard</h3>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-slate-400 hover:text-white text-sm p-1 font-bold"
                >
                  ✕
                </button>
              </div>
              <LiveLeaderboard entries={leaderboard} currentUserId={currentUser?.id} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================================================
  // 8. QUIZ SCREEN (Kahoot-Style, Question Is Main Focus)
  // ==========================================================================
  return (
    <div className="max-w-xl mx-auto space-y-4 py-3 px-2">
      {/* Header Info */}
      <div className="text-center space-y-1">
        <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
          StockMate Market Challenge
        </h2>
        <div className="flex items-center justify-center gap-4 text-sm font-bold text-white">
          <span className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-black">
            ROUND {currentRoundNumber}
          </span>
          <span className="text-slate-300">
            Question {currentQuestionIndex + 1} / {currentQuestions.length}
          </span>
        </div>
      </div>

      {/* Round Synchronized Timer */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 font-mono text-sm font-bold text-slate-200">
          <Clock className={`w-4 h-4 ${roundTimeRemaining < 60 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
          <span className={roundTimeRemaining < 60 ? 'text-rose-400 font-black' : ''}>
            ⏱ {formatTimer(roundTimeRemaining)} remaining
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
        {/* Question Text */}
        <h3 className="text-lg sm:text-xl font-black text-white text-center leading-relaxed">
          {activeQuestion?.question}
        </h3>

        {/* Clean Visual if Chart / Pattern */}
        {activeQuestion?.visualType && activeQuestion.visualType !== 'none' && (
          <div className="py-1">
            <QuizQuestionVisual
              visualType={activeQuestion.visualType}
              visualData={activeQuestion.visualData}
            />
          </div>
        )}

        {/* 4 Clean Answer Buttons */}
        <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
          {activeQuestion?.options.map((opt) => {
            const isSelected = activeAnswer?.selectedOption === opt.key;
            let btnStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-800/80';

            if (isQuestionAnswered) {
              if (isSelected) {
                btnStyle = activeAnswer?.isCorrect
                  ? 'bg-emerald-950/80 border-emerald-500 text-white font-bold'
                  : 'bg-rose-950/80 border-rose-500 text-white font-bold';
              } else {
                btnStyle = 'bg-slate-950/50 border-slate-900 text-slate-500 opacity-60 cursor-not-allowed';
              }
            }

            return (
              <button
                key={opt.key}
                onClick={() => handleSelectOption(opt.key)}
                disabled={isQuestionAnswered || isSubmitting}
                className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all text-sm font-semibold flex items-center gap-3 cursor-pointer ${btnStyle}`}
              >
                <span className="w-7 h-7 rounded-xl bg-slate-800/80 text-white text-xs font-bold flex items-center justify-center shrink-0 border border-slate-700">
                  {opt.key}
                </span>
                <span className="flex-1">{opt.text}</span>
                {isSelected && activeAnswer && (
                  <span>
                    {activeAnswer.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback message if answered */}
        {feedback && (
          <div
            className={`text-center py-2 px-3 rounded-xl text-xs font-bold ${
              feedback.isCorrect ? 'bg-emerald-950/50 text-emerald-300' : 'bg-rose-950/50 text-rose-300'
            }`}
          >
            {feedback.isCorrect ? '✓ Correct! +100 points' : '✗ Incorrect (0 points)'}
          </div>
        )}

        {/* Navigation Controls */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 gap-3">
          <button
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-30 text-slate-300 text-xs font-bold border border-slate-800 transition-colors flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <button
            onClick={() => setShowLeaderboard(true)}
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Leaderboard
          </button>

          {currentQuestionIndex < currentQuestions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-xs text-slate-400 font-bold px-2">
              Question 10/10
            </span>
          )}
        </div>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-white">Classroom Leaderboard</h3>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="text-slate-400 hover:text-white text-sm p-1 font-bold"
              >
                ✕
              </button>
            </div>
            <LiveLeaderboard entries={leaderboard} currentUserId={currentUser?.id} />
          </div>
        </div>
      )}
    </div>
  );
};
