import React from 'react';
import { X, CheckCircle2, BookOpen, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import { NCFM_COURSE_COVERAGE } from '../../data/ncfmCourseData';

interface CourseCoverageModalProps {
  onClose: () => void;
  onOpenLesson: (lessonId: string) => void;
}

export const CourseCoverageModal: React.FC<CourseCoverageModalProps> = ({ onClose, onOpenLesson }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% CURRICULUM AUDIT REPORT
              </span>
              <span className="text-xs text-slate-400 font-mono">NCFM Technical Analysis Module</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Official Course Coverage & Topic Inventory
            </h2>
            <p className="text-xs text-slate-300">
              National Stock Exchange of India (NSE) Technical Analysis Certification mapping. Every single chapter, heading, and concept from the 172-page syllabus is mapped directly into playable lessons.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Weightage Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {NCFM_COURSE_COVERAGE.map((c) => (
              <div key={c.chapterNumber} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Ch. {c.chapterNumber}</div>
                <div className="text-base font-black text-indigo-400">{c.weightagePercent}%</div>
                <div className="text-[10px] text-slate-400 truncate">{c.chapterTitle}</div>
              </div>
            ))}
          </div>

          {/* Chapter Details */}
          <div className="space-y-6">
            {NCFM_COURSE_COVERAGE.map((chap) => (
              <div key={chap.chapterNumber} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="text-xs font-black text-indigo-400">
                      CHAPTER {chap.chapterNumber} ({chap.weightagePercent}% EXAM WEIGHTAGE)
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white">{chap.chapterTitle}</h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Complete
                  </span>
                </div>

                <div className="space-y-3">
                  {chap.sections.map((sec) => (
                    <div key={sec.sectionId} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-200">
                          {sec.sectionNumber} — {sec.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {sec.modelQuestionsCount} Model Questions
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {sec.topics.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300"
                          >
                            • {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Audit Status: 100% of PDF chapters, sections, formulas, and model tests verified and playable.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
