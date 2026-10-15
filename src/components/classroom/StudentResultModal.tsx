import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Award, Target, Shield, CheckCircle2, ChevronDown, ChevronUp, ArrowLeft, Zap } from 'lucide-react';
import { useClassroom } from '../../context/ClassroomContext';

interface StudentResultModalProps {
  onBack: () => void;
}

export const StudentResultModal: React.FC<StudentResultModalProps> = ({ onBack }) => {
  const { activeActivity, leaderboard, currentUser, activitySubmissions } = useClassroom();
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState<boolean>(false);

  const myRankEntry = currentUser?.id ? leaderboard.find((e) => e.studentId === currentUser.id) : undefined;
  const totalStudents = leaderboard.length || 1;
  const score = myRankEntry?.totalScore || 0;
  const rank = myRankEntry?.rank || 1;
  const accuracy = myRankEntry?.accuracyPercent || 0;
  const riskPercent = myRankEntry?.riskPercent || 0;
  const roundsCompleted = myRankEntry?.roundsCompleted || activitySubmissions.length || 5;
  const xpEarned = myRankEntry?.xpEarned || 200;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Classroom Hub
        </button>

        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-mono font-bold flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          COMPETITION COMPLETE
        </span>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-9 h-9" />
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-wider mb-1">
          Activity Complete!
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto mb-8">
          Great trading discipline in {activeActivity?.name}. Your score and rank have been validated by the StockMate scoring engine.
        </p>

        {/* Score and Rank Highlight Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Your Score</span>
            <div className="font-mono text-3xl font-black text-amber-400">{score}</div>
            <span className="text-[10px] text-slate-400 font-mono">/ 100 max</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Classroom Rank</span>
            <div className="font-mono text-3xl font-black text-indigo-400">
              #{rank} <span className="text-xs text-slate-400 font-normal">/ {totalStudents}</span>
            </div>
            <span className="text-[10px] text-slate-400 block">All Students</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Accuracy</span>
            <div className="font-mono text-3xl font-black text-emerald-400">{accuracy}%</div>
            <span className="text-[10px] text-slate-400 block">Market Alignment</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Risk Discipline</span>
            <div className="font-mono text-3xl font-black text-sky-400">{riskPercent}%</div>
            <span className="text-[10px] text-slate-400 block">Stop-Loss Rating</span>
          </div>
        </div>

        {/* XP Earned Strip */}
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-5 py-2 rounded-full font-mono text-sm font-bold mb-8">
          <Zap className="w-4 h-4 text-indigo-400 fill-current" />
          <span>+{xpEarned} Practical Learning XP Awarded to Your Profile!</span>
        </div>

        {/* Toggle Detailed Breakdown */}
        <div>
          <button
            onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border border-slate-700 cursor-pointer"
          >
            <span>{showDetailedAnalysis ? 'Hide Detailed Analysis' : 'View Round-by-Round Analysis'}</span>
            {showDetailedAnalysis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Detailed Round-by-Round Breakdown */}
        <AnimatePresence>
          {showDetailedAnalysis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 text-left border-t border-slate-800/80 pt-6 space-y-4 max-w-2xl mx-auto overflow-hidden"
            >
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Your Individual Round Submissions & Mentor Advice
              </h4>

              {activitySubmissions.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No stored submissions for this activity.</p>
              ) : (
                activitySubmissions.map((sub) => (
                  <div
                    key={sub.id || sub.roundNumber}
                    className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="font-bold text-slate-200">
                        Round {sub.roundNumber}: Decision {sub.decision}
                      </span>
                      <span className="font-mono font-bold text-amber-400">Score: {sub.totalScore} / 100</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 pt-1">
                      <div>
                        <span>Position Size:</span>{' '}
                        <strong className="text-slate-200 font-mono">{sub.quantity} shares</strong>
                      </div>
                      <div>
                        <span>Stop Loss:</span>{' '}
                        <strong className="text-slate-200 font-mono">₹{sub.stopLoss}</strong>
                      </div>
                      <div>
                        <span>Target:</span>{' '}
                        <strong className="text-slate-200 font-mono">₹{sub.target}</strong>
                      </div>
                      <div>
                        <span>Risk Level:</span>{' '}
                        <strong className="text-slate-200 font-mono">{sub.riskLevel}</strong>
                      </div>
                    </div>

                    {sub.reasoning && (
                      <div className="pt-1 text-slate-300 italic">
                        <strong>Your Hypothesis:</strong> "{sub.reasoning}"
                      </div>
                    )}

                    <div className="p-2.5 bg-indigo-950/30 border border-indigo-500/20 rounded-lg text-slate-300">
                      <strong className="text-indigo-400 block text-[10px] uppercase">Mentor Evaluation:</strong>
                      {sub.feedback}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
