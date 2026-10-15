import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Users, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useClassroom } from '../../context/ClassroomContext';

interface WaitingRoomProps {
  onBack: () => void;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({ onBack }) => {
  const {
    activeActivity,
    activeClassroom,
    classroomMembers,
    leaderboard,
  } = useClassroom();

  const [countdown, setCountdown] = useState<number | null>(null);

  // When activity switches to LIVE, trigger short 3-2-1 transition
  useEffect(() => {
    if (activeActivity?.status === 'LIVE') {
      setCountdown(3);
      const timer1 = setTimeout(() => setCountdown(2), 1000);
      const timer2 = setTimeout(() => setCountdown(1), 2000);
      const timer3 = setTimeout(() => setCountdown(0), 3000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [activeActivity?.status]);

  if (countdown !== null) {
    return (
      <div className="fixed inset-0 z-50 bg-[#070b14]/95 backdrop-blur-md flex flex-col items-center justify-center text-white">
        <motion.div
          key={countdown}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          exit={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {countdown > 0 ? (
            <div className="font-mono font-black text-8xl text-amber-400">
              {countdown}
            </div>
          ) : (
            <div className="font-black text-7xl text-emerald-400">
              GO!
            </div>
          )}
          <p className="mt-4 text-slate-300 font-semibold uppercase tracking-widest text-sm">
            Starting StockMate Challenge...
          </p>
        </motion.div>
      </div>
    );
  }

  const teacherName = activeClassroom?.teacherName || 'Teacher Name';
  const classroomTitle = activeClassroom?.name || 'Stock Market Basics';
  const totalStudents = classroomMembers.filter((m) => m.role === 'STUDENT').length;
  const studentsCount = Math.max(totalStudents, leaderboard.length, 1);

  return (
    <div className="max-w-md mx-auto py-8 px-4 text-center space-y-6">
      <div className="text-left">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Classroom
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="w-16 h-16 bg-emerald-500/15 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 block mb-1">
            Confirmed
          </span>
          <h2 className="text-3xl font-black text-white">
            You&apos;re in!
          </h2>
        </div>

        {/* Classroom Info Block */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 text-left space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Classroom</span>
            <span className="text-base font-black text-white block">{classroomTitle}</span>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Teacher</span>
              <span className="text-sm font-bold text-slate-200">{teacherName}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Students</span>
              <span className="text-sm font-bold text-amber-400 font-mono">{studentsCount} joined</span>
            </div>
          </div>
        </div>

        {/* Waiting indicator */}
        <div className="flex items-center justify-center gap-2.5 text-xs sm:text-sm text-slate-300 font-medium py-2">
          <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
          <span>Waiting for the teacher to start...</span>
        </div>
      </div>
    </div>
  );
};
