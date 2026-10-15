import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Download,
  Users,
  Target,
  Shield,
  Clock,
  ArrowLeft,
  ChevronRight,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { useClassroom } from '../../context/ClassroomContext';
import { ActivitySubmission, ActivityParticipant } from '../../types/classroom';
import { classroomApi } from '../../services/classroomApi';

interface TeacherResultsViewProps {
  onBack: () => void;
}

export const TeacherResultsView: React.FC<TeacherResultsViewProps> = ({ onBack }) => {
  const { results, activeActivity, setActiveView } = useClassroom();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  if (!results || !activeActivity) {
    return (
      <div className="text-center p-8 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
        Loading classroom results...
      </div>
    );
  }

  const { stats, leaderboard, participants, submissions } = results;

  const selectedStudent = participants.find((p) => p.studentId === selectedStudentId);
  const selectedStudentSubmissions = submissions.filter((s) => s.studentId === selectedStudentId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation & Export Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Classroom Hub
        </button>

        <a
          href={classroomApi.getExportUrl(activeActivity.id)}
          download
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase px-4 py-2 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all"
        >
          <Download className="w-4 h-4" />
          EXPORT RESULTS (CSV)
        </a>
      </div>

      {/* Main Results Title Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase text-amber-400">Official Class Report</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
              {activeActivity.name} — Final Results
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Stock: <strong className="text-slate-200">{activeActivity.symbol}</strong> •{' '}
              {stats.totalParticipants} Participants • Completed on{' '}
              {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Classroom Analytics Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Average Score</span>
            <span className="font-mono text-2xl font-black text-amber-400">{stats.averageScore}</span>
            <span className="text-[10px] text-slate-400 block">/ 100</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Highest Score</span>
            <span className="font-mono text-2xl font-black text-emerald-400">{stats.highestScore}</span>
            <span className="text-[10px] text-slate-400 block">Class Peak</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Lowest Score</span>
            <span className="font-mono text-2xl font-black text-rose-400">{stats.lowestScore}</span>
            <span className="text-[10px] text-slate-400 block">Class Baseline</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Completion Rate</span>
            <span className="font-mono text-2xl font-black text-indigo-400">{stats.completionRate}%</span>
            <span className="text-[10px] text-slate-400 block">{stats.completedCount} students finished</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Avg Accuracy</span>
            <span className="font-mono text-2xl font-black text-sky-400">{stats.averageAccuracy}%</span>
            <span className="text-[10px] text-slate-400 block">Market Trend Match</span>
          </div>
        </div>
      </div>

      {/* Student Leaderboard & Detailed Inspection Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">
            All Student Performances (Click student for submission details)
          </h3>
          <span className="text-xs text-slate-400">{leaderboard.length} Students Evaluated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4 text-center w-14">Rank</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4 text-center">Final Score</th>
                <th className="py-3 px-4 text-center">Accuracy</th>
                <th className="py-3 px-4 text-center">Risk Mgmt</th>
                <th className="py-3 px-4 text-center">Rounds</th>
                <th className="py-3 px-4 text-right">XP Earned</th>
                <th className="py-3 px-4 text-center w-12">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {leaderboard.map((entry) => (
                <tr
                  key={entry.studentId}
                  onClick={() => setSelectedStudentId(entry.studentId)}
                  className={`cursor-pointer transition-colors ${
                    selectedStudentId === entry.studentId
                      ? 'bg-indigo-950/60 hover:bg-indigo-900/60 border-l-4 border-indigo-500'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-3.5 px-4 text-center font-mono font-bold">
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{entry.studentAvatar || '👨‍🎓'}</span>
                      <div>
                        <span className="text-slate-100 font-bold block">{entry.studentName}</span>
                        <span className="text-[10px] text-slate-400">{entry.studentEmail || 'Student'}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono text-base font-bold text-amber-400">{entry.totalScore}</span>
                    <span className="text-[10px] text-slate-400 block">/ 100</span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">
                    {entry.accuracyPercent}%
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono font-bold text-sky-400">
                    {entry.riskPercent}%
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                    {entry.roundsCompleted} / {activeActivity.totalRounds}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-indigo-400">
                    +{entry.xpEarned} XP
                  </td>

                  <td className="py-3.5 px-4 text-center text-slate-400">
                    <ChevronRight className="w-4 h-4 inline-block" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Student Submissions Inspector Modal */}
      <AnimatePresence>
        {selectedStudentId && selectedStudent && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedStudent.studentAvatar || '👨‍🎓'}</span>
                  <div>
                    <h3 className="font-bold text-base text-white">{selectedStudent.studentName}</h3>
                    <p className="text-xs text-slate-400">
                      Overall Score: <strong className="text-amber-400 font-mono">{selectedStudent.totalScore}/100</strong> • Accuracy: {selectedStudent.accuracyPercent}% • Risk: {selectedStudent.riskPercent}%
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudentId(null)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                <h4 className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  Individual Round Decisions & Teacher Review
                </h4>

                {selectedStudentSubmissions.length === 0 ? (
                  <p className="text-slate-400 italic">No submissions recorded for this student.</p>
                ) : (
                  selectedStudentSubmissions.map((sub) => (
                    <div
                      key={sub.id || sub.roundNumber}
                      className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <span className="font-bold text-white text-sm">
                          Round {sub.roundNumber}: {sub.decision} ({sub.quantity} shares)
                        </span>
                        <span className="font-mono font-bold text-amber-400">Round Score: {sub.totalScore}/100</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400">
                        <div>
                          <span>Stop Loss:</span> <strong className="text-slate-200 font-mono">₹{sub.stopLoss}</strong>
                        </div>
                        <div>
                          <span>Target:</span> <strong className="text-slate-200 font-mono">₹{sub.target}</strong>
                        </div>
                        <div>
                          <span>Risk Level:</span> <strong className="text-slate-200 font-mono">{sub.riskLevel}</strong>
                        </div>
                        <div>
                          <span>Decision Score:</span> <strong className="text-emerald-400 font-mono">{sub.decisionScore}/40</strong>
                        </div>
                      </div>

                      {sub.reasoning && (
                        <div className="pt-1 text-slate-300">
                          <strong className="text-slate-400">Student Rationale:</strong> "{sub.reasoning}"
                        </div>
                      )}

                      <div className="p-2 bg-indigo-950/30 border border-indigo-500/20 rounded text-slate-300">
                        <strong className="text-indigo-400 block text-[10px] uppercase">Scoring Breakdown:</strong>
                        Decision: {sub.decisionScore}/40 • Risk: {sub.riskScore}/25 • Analysis: {sub.analysisScore}/20 • Timing: {sub.timingScore}/10 • Participation: {sub.participationScore}/5
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
