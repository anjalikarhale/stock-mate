import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileSpreadsheet,
  Award,
  Sparkles,
  ExternalLink,
  Copy,
  Save,
  RotateCcw,
  AlertTriangle,
  Gamepad2,
  LineChart,
  Calendar,
  Library,
  Check,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import {
  CURRICULUM_16_MODULES,
  CurriculumLevel,
  CurriculumModule,
  STUDY_SCHEDULE_12_WEEKS,
  MASTER_REFERENCE_QUIZ,
  CURRICULUM_GLOSSARY,
  OFFICIAL_RESOURCES,
  computeOverallCourseProgress,
} from '../../data/curriculum16Modules';
import { ContextualVisualizer } from './ContextualVisualizer';
import { AppMode, CompanyWorksheetDraft } from '../../types';
import { soundEffects } from '../../utils/audio';

interface StudentLearnHubProps {
  onLaunchMission?: (missionId: string) => void;
  onNavigateTab?: (tab: AppMode) => void;
}

type LearnViewTab = 'CURRICULUM' | 'STUDY_PLAN' | 'WORKSHEET' | 'MASTER_CHECK' | 'GLOSSARY';

const EMPTY_WORKSHEET: CompanyWorksheetDraft = {
  companyName: '',
  ticker: '',
  businessModel: '',
  revenueGrowth5Y: '',
  profitabilityRoeRoce: '',
  balanceSheetDebt: '',
  cashFlowOcfVsPat: '',
  governancePromoter: '',
  competitiveMoat: '',
  valuationVsPeers: '',
  keyRisksInvalidation: '',
  updatedAt: '',
};

export const StudentLearnHub: React.FC<StudentLearnHubProps> = ({ onNavigateTab }) => {
  const {
    profile,
    recordLessonProgress,
    recordExerciseCompletion,
    recordModuleAssessment,
    setLastActiveCourseLocation,
    saveCompanyWorksheet,
    setActiveGame,
    navigateTargetModuleId,
    setNavigateTargetModuleId,
    setNavigateTargetTradeSymbol,
    updateMentorContext,
    openAIMentorWithPrompt,
  } = useGame();

  const [viewTab, setViewTab] = useState<LearnViewTab>('CURRICULUM');
  const [levelFilter, setLevelFilter] = useState<'ALL' | CurriculumLevel>('ALL');

  const completedModules = profile.completedModules || [];
  const completedLessons = profile.completedLessons || [];
  const completedExercises = profile.completedExercises || [];
  const moduleQuizScores = profile.moduleQuizScores || {};

  const progressSummary = useMemo(
    () => computeOverallCourseProgress(completedModules),
    [completedModules]
  );

  const [selectedModuleId, setSelectedModuleId] = useState<string>(
    () =>
      navigateTargetModuleId ||
      profile.lastActiveModuleId ||
      progressSummary.nextRecommendedModule.id
  );

  // Sync when navigated from Home Page "Continue Learning"
  useEffect(() => {
    if (navigateTargetModuleId) {
      setSelectedModuleId(navigateTargetModuleId);
      setViewTab('CURRICULUM');
      setNavigateTargetModuleId(null);
    }
  }, [navigateTargetModuleId, setNavigateTargetModuleId]);

  const activeModule: CurriculumModule = useMemo(
    () =>
      CURRICULUM_16_MODULES.find((m) => m.id === selectedModuleId) ||
      CURRICULUM_16_MODULES[0],
    [selectedModuleId]
  );

  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);

  useEffect(() => {
    setActiveLessonIndex(0);
    setSelectedExerciseOpt(null);
    setQuizSelections({});
    setQuizSubmitted(false);
    setLastActiveCourseLocation(activeModule.id, activeModule.lessons[0]?.id);
    updateMentorContext({
      currentTab: 'LEARN',
      activeModuleId: activeModule.id,
      activeModuleTitle: `Module ${activeModule.number}: ${activeModule.title}`,
      activeLessonId: activeModule.lessons[0]?.id,
      activeLessonTitle: activeModule.lessons[0]?.title,
    });
  }, [activeModule.id]);

  // Interactive Exercise state
  const [selectedExerciseOpt, setSelectedExerciseOpt] = useState<string | null>(null);

  // Per-Module Quiz state
  const [quizSelections, setQuizSelections] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // 6-Question Master Quiz state
  const [masterSelections, setMasterSelections] = useState<Record<string, number>>({});
  const [masterSubmitted, setMasterSubmitted] = useState<boolean>(false);

  // Glossary filter
  const [glossarySearch, setGlossarySearch] = useState<string>('');

  // Company Research Worksheet state
  const [worksheet, setWorksheet] = useState<CompanyWorksheetDraft>(() => ({
    ...EMPTY_WORKSHEET,
    ...(profile.worksheetDraft || {}),
  }));
  const [worksheetSavedBanner, setWorksheetSavedBanner] = useState<string | null>(null);
  const [copiedBanner, setCopiedBanner] = useState<boolean>(false);

  useEffect(() => {
    if (profile.worksheetDraft) {
      setWorksheet((prev) => ({
        ...prev,
        ...profile.worksheetDraft,
      }));
    }
  }, [profile.worksheetDraft]);

  const filteredModules = useMemo(() => {
    if (levelFilter === 'ALL') return CURRICULUM_16_MODULES;
    return CURRICULUM_16_MODULES.filter((m) => m.level === levelFilter);
  }, [levelFilter]);

  const currentLesson = activeModule.lessons[activeLessonIndex] || activeModule.lessons[0];

  const handleMarkLessonRead = async (lessonId: string) => {
    await recordLessonProgress({
      moduleId: activeModule.id,
      lessonId,
      earnedXp: 25,
    });
  };

  const handleExerciseChoice = async (optionId: string, isCorrect: boolean) => {
    soundEffects.click();
    setSelectedExerciseOpt(optionId);
    if (isCorrect) {
      await recordExerciseCompletion({
        moduleId: activeModule.id,
        exerciseId: activeModule.exercise.id,
        earnedXp: 35,
      });
    }
  };

  const handleSubmitModuleQuiz = async () => {
    const total = activeModule.quiz.length;
    if (Object.keys(quizSelections).length < total) return;

    let correct = 0;
    for (const q of activeModule.quiz) {
      if (quizSelections[q.id] === q.correctIndex) {
        correct++;
      }
    }
    const scorePercent = Math.round((correct / total) * 100);
    setQuizSubmitted(true);

    // Ensure lessons are also marked read when student passes assessment
    if (scorePercent >= 50) {
      for (const l of activeModule.lessons) {
        if (!completedLessons.includes(l.id)) {
          await recordLessonProgress({
            moduleId: activeModule.id,
            lessonId: l.id,
            earnedXp: 15,
          });
        }
      }
    }

    await recordModuleAssessment({
      moduleId: activeModule.id,
      scorePercent,
      passed: scorePercent >= 50,
      earnedXp: activeModule.xpReward,
    });
  };

  const handleSaveWorksheet = async () => {
    const updated: CompanyWorksheetDraft = {
      ...worksheet,
      updatedAt: new Date().toISOString(),
    };
    const ok = await saveCompanyWorksheet(updated);
    setWorksheetSavedBanner(
      ok ? 'Saved to your student account!' : 'Saved locally (log in to sync).'
    );
    setTimeout(() => setWorksheetSavedBanner(null), 3500);
  };

  const handleCopyWorksheet = async () => {
    const formatted = [
      `STOCKMATE 9-ITEM COMPANY RESEARCH WORKSHEET`,
      `Company: ${worksheet.companyName || 'N/A'} (${worksheet.ticker || 'NSE'})`,
      `1. Business Model & Revenue Drivers: ${worksheet.businessModel}`,
      `2. 5–10 Yr Growth Track Record: ${worksheet.revenueGrowth5Y}`,
      `3. Margins, ROE & ROCE Quality: ${worksheet.profitabilityRoeRoce}`,
      `4. Balance Sheet & Leverage (D/E): ${worksheet.balanceSheetDebt}`,
      `5. Cash Conversion (CFO vs PAT & FCF): ${worksheet.cashFlowOcfVsPat}`,
      `6. Governance & Promoter Share Pledging: ${worksheet.governancePromoter}`,
      `7. Competitive Moat: ${worksheet.competitiveMoat}`,
      `8. Bear / Base / Bull Valuation vs Peers: ${worksheet.valuationVsPeers}`,
      `9. Key Thesis Invalidation Risks: ${worksheet.keyRisksInvalidation}`,
    ].join('\n\n');

    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedBanner(true);
      setTimeout(() => setCopiedBanner(false), 2500);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Course Header & Sub-Navigation */}
      <section className="rounded-2xl bg-slate-900/95 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Indian Stock Market Complete Learning Reference • 16 Modules</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Structured Market Curriculum
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
              Master NSE/BSE plumbing, financial statements, valuation, price action, open interest, derivatives risk, and position sizing across 3 progressive levels.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 shrink-0">
            <div>
              <div className="text-[11px] text-slate-400 font-semibold">Course Completion</div>
              <div className="text-lg font-black text-white font-mono">
                {progressSummary.completedCount} / {progressSummary.totalModules} Modules ({progressSummary.percent}%)
              </div>
            </div>
            <div className="h-9 w-px bg-slate-800" />
            <div>
              <div className="text-[11px] text-slate-400 font-semibold">Current Level</div>
              <div className="text-sm font-black text-emerald-400">{progressSummary.currentLevel}</div>
            </div>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-800">
          {[
            { id: 'CURRICULUM' as const, label: '16 Modules & Lessons', icon: BookOpen },
            { id: 'STUDY_PLAN' as const, label: '12-Week Study Plan (Optional)', icon: Calendar },
            { id: 'WORKSHEET' as const, label: '9-Item Company Worksheet', icon: FileSpreadsheet },
            { id: 'MASTER_CHECK' as const, label: '6-Question Master Check', icon: Award },
            { id: 'GLOSSARY' as const, label: 'Glossary & Official Resources', icon: Library },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = viewTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setViewTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  active
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-950/40'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          TAB 1: 16 MODULES & INTERACTIVE LESSONS
         ===================================================================== */}
      {viewTab === 'CURRICULUM' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Module Navigator */}
          <aside className="lg:col-span-4 bg-slate-900/95 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {(['ALL', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                    levelFilter === lvl
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {lvl === 'ALL'
                    ? 'All (16)'
                    : lvl === 'Beginner'
                    ? 'L1 Beginner (1–5)'
                    : lvl === 'Intermediate'
                    ? 'L2 Interm. (6–14)'
                    : 'L3 Adv. (15–16)'}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
              {filteredModules.map((mod) => {
                const isDone = completedModules.includes(mod.id);
                const isSelected = mod.id === activeModule.id;
                const bestScore = moduleQuizScores[mod.id];

                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => setSelectedModuleId(mod.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 shadow-md'
                        : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase text-indigo-400">
                            Module {mod.number} • {mod.level}
                          </span>
                          {typeof bestScore === 'number' && (
                            <span className="text-[10px] font-mono text-emerald-400">
                              Quiz: {bestScore}%
                            </span>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-white leading-snug">
                          {mod.title}
                        </div>
                      </div>
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Active Module Reader */}
          <div className="lg:col-span-8 space-y-6">
            {/* Module Overview Card */}
            <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                    {activeModule.levelBadge}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {activeModule.estimatedMinutes} min
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {completedModules.includes(activeModule.id) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Module Completed
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      openAIMentorWithPrompt(
                        `Help me understand Module ${activeModule.number}: "${activeModule.title}" with an Indian NSE/BSE example and test my understanding.`
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-indigo-950/60 border border-slate-700 hover:border-indigo-500/40 text-xs font-bold text-indigo-300 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Ask Arya About Module
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Module {activeModule.number}: {activeModule.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">{activeModule.subtitle}</p>
              </div>

              {/* Learning Objectives */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Learning Objectives
                </div>
                <ul className="space-y-1.5">
                  {activeModule.learningObjectives.map((obj, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lesson Selector Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {activeModule.lessons.map((lesson, idx) => {
                  const lessonRead = completedLessons.includes(lesson.id);
                  const active = idx === activeLessonIndex;
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => {
                        setActiveLessonIndex(idx);
                        setLastActiveCourseLocation(activeModule.id, lesson.id);
                        updateMentorContext({
                          activeLessonId: lesson.id,
                          activeLessonTitle: lesson.title,
                        });
                      }}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                        active
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {lessonRead && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
                      <span>{lesson.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Lesson Content */}
            {currentLesson && (
              <article className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">{currentLesson.title}</h3>
                    <p className="text-xs text-indigo-300 mt-0.5">{currentLesson.summary}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleMarkLessonRead(currentLesson.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      completedLessons.includes(currentLesson.id)
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {completedLessons.includes(currentLesson.id)
                      ? 'Lesson Completed'
                      : 'Mark Lesson Complete (+25 XP)'}
                  </button>
                </div>

                {/* Main Paragraphs */}
                <div className="space-y-3 text-sm text-slate-200 leading-relaxed">
                  {currentLesson.paragraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {/* Indian Market Example */}
                <div className="p-4 rounded-xl bg-indigo-950/35 border border-indigo-500/30 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                    Indian Market (NSE / BSE) Context Example
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {currentLesson.indianExample}
                  </p>
                </div>

                {/* Exact Formulas */}
                {currentLesson.formulas && currentLesson.formulas.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Core Formulas & Definitions
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentLesson.formulas.map((f, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1"
                        >
                          <div className="text-xs font-bold text-indigo-300">{f.label}</div>
                          <div className="font-mono text-xs sm:text-sm font-bold text-white bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">
                            {f.expression}
                          </div>
                          <p className="text-[11px] text-slate-400">{f.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Structured Reference Table */}
                {currentLesson.table && (
                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                    <div className="px-4 py-2.5 border-b border-slate-800 text-xs font-bold text-slate-200">
                      {currentLesson.table.caption}
                    </div>
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/90 text-slate-300">
                        <tr>
                          {currentLesson.table.headers.map((h, i) => (
                            <th key={i} className="px-3.5 py-2.5 font-bold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 text-slate-200">
                        {currentLesson.table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-900/40">
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className={`px-3.5 py-2.5 ${cIdx === 0 ? 'font-bold text-white' : ''}`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Purposeful Contextual Visualizer (ONLY where genuinely helpful) */}
                {currentLesson.visualizer && (
                  <ContextualVisualizer
                    kind={currentLesson.visualizer.kind}
                    title={currentLesson.visualizer.title}
                    caption={currentLesson.visualizer.caption}
                  />
                )}

                {/* Key Takeaways */}
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Key Takeaways
                  </div>
                  <ul className="space-y-1.5">
                    {currentLesson.keyPoints.map((kp, i) => (
                      <li key={i} className="text-xs text-slate-200 flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Methodological / Regulatory Caveats */}
                {currentLesson.caveatNote && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>{currentLesson.caveatNote}</div>
                  </div>
                )}

                {/* Supplementary Toolkit Note */}
                {currentLesson.supplementaryNote && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    <strong className="text-indigo-300">Supplementary Reference Note: </strong>
                    {currentLesson.supplementaryNote}
                  </div>
                )}
              </article>
            )}

            {/* Interactive Scenario Exercise */}
            <section className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Interactive Decision Exercise
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {activeModule.exercise.title}
                  </h3>
                </div>
                {completedExercises.includes(activeModule.exercise.id) && (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Solved (+35 XP)
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                {activeModule.exercise.scenario}
              </p>
              <p className="text-xs sm:text-sm font-bold text-white">
                {activeModule.exercise.prompt}
              </p>

              <div className="space-y-2">
                {activeModule.exercise.options.map((opt) => {
                  const chosen = selectedExerciseOpt === opt.id;
                  return (
                    <div key={opt.id} className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => handleExerciseChoice(opt.id, opt.isCorrect)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                          chosen
                            ? opt.isCorrect
                              ? 'bg-emerald-950/50 border-emerald-500 text-emerald-100'
                              : 'bg-rose-950/50 border-rose-500 text-rose-100'
                            : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                      {chosen && (
                        <div
                          className={`px-3.5 py-2 rounded-lg text-xs ${
                            opt.isCorrect
                              ? 'bg-emerald-500/10 text-emerald-300'
                              : 'bg-rose-500/10 text-rose-300'
                          }`}
                        >
                          {opt.feedback}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Practical Market Task & Related Game / Terminal Link */}
            <section className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  Practical Market Application
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  {activeModule.practicalTask.title}
                </h4>
                <p className="text-xs text-slate-300">{activeModule.practicalTask.instructions}</p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                {activeModule.practicalTask.targetSymbol && (
                  <button
                    type="button"
                    onClick={() => {
                      setNavigateTargetTradeSymbol(activeModule.practicalTask.targetSymbol!);
                      onNavigateTab?.('TRADE');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white cursor-pointer"
                  >
                    <LineChart className="w-3.5 h-3.5 text-emerald-400" />
                    Inspect {activeModule.practicalTask.targetSymbol}
                  </button>
                )}
                {activeModule.practicalTask.relatedGameId && (
                  <button
                    type="button"
                    onClick={() => setActiveGame(activeModule.practicalTask.relatedGameId!)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white cursor-pointer"
                  >
                    <Gamepad2 className="w-3.5 h-3.5" />
                    Play {activeModule.practicalTask.relatedGameTitle}
                  </button>
                )}
              </div>
            </section>

            {/* Module Final Assessment Quiz */}
            <section className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Module {activeModule.number} Mastery Check
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Complete Quiz to Mark Module {activeModule.number} Complete (+{activeModule.xpReward} XP)
                  </h3>
                </div>
                {quizSubmitted && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuizSelections({});
                      setQuizSubmitted(false);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retry Quiz
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {activeModule.quiz.map((q, qIdx) => {
                  const userPick = quizSelections[q.id];
                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                    >
                      <div className="text-xs sm:text-sm font-bold text-white">
                        Q{qIdx + 1}. {q.question}
                      </div>
                      <div className="space-y-2">
                        {q.options.map((optText, oIdx) => {
                          const isPicked = userPick === oIdx;
                          const isRight = q.correctIndex === oIdx;
                          let style =
                            'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700';
                          if (quizSubmitted) {
                            if (isRight) {
                              style = 'bg-emerald-950/60 border-emerald-500 text-emerald-100';
                            } else if (isPicked && !isRight) {
                              style = 'bg-rose-950/60 border-rose-500 text-rose-100';
                            }
                          } else if (isPicked) {
                            style = 'bg-indigo-950/70 border-indigo-500 text-white';
                          }

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              disabled={quizSubmitted}
                              onClick={() =>
                                setQuizSelections((prev) => ({ ...prev, [q.id]: oIdx }))
                              }
                              className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${style}`}
                            >
                              {optText}
                            </button>
                          );
                        })}
                      </div>
                      {quizSubmitted && (
                        <div className="text-xs text-slate-300 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                          <strong className="text-indigo-300">Explanation: </strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!quizSubmitted ? (
                <button
                  type="button"
                  disabled={Object.keys(quizSelections).length < activeModule.quiz.length}
                  onClick={handleSubmitModuleQuiz}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm cursor-pointer"
                >
                  Submit Module {activeModule.number} Assessment
                </button>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                  <div className="text-xs sm:text-sm text-emerald-200 font-bold">
                    Assessment recorded! Score: {moduleQuizScores[activeModule.id] ?? 0}%.
                  </div>
                  {activeModule.number < 16 && (
                    <button
                      type="button"
                      onClick={() => setSelectedModuleId(`module-${activeModule.number + 1}`)}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                    >
                      Proceed to Module {activeModule.number + 1} →
                    </button>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: OPTIONAL 12-WEEK STUDY SCHEDULE
         ===================================================================== */}
      {viewTab === 'STUDY_PLAN' && (
        <section className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Self-Paced Non-Blocking Guide
            </span>
            <h2 className="text-xl font-black text-white">12-Week Structured Study Plan</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              All 16 modules are unlocked so you can study at your own pace. Follow this 12-week roadmap if you want a disciplined semester cadence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STUDY_SCHEDULE_12_WEEKS.map((wk) => {
              const allDone = wk.focusModules.every((mId) => completedModules.includes(mId));
              return (
                <div
                  key={wk.week}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-indigo-400">
                        WEEK {wk.week} • {wk.level}
                      </span>
                      {allDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{wk.goal}</p>
                    <p className="text-[11px] text-slate-400">
                      <strong className="text-slate-300">Practice:</strong> {wk.practiceTask}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
                    {wk.focusModules.map((mId) => {
                      const mod = CURRICULUM_16_MODULES.find((m) => m.id === mId);
                      return (
                        <button
                          key={mId}
                          type="button"
                          onClick={() => {
                            setSelectedModuleId(mId);
                            setViewTab('CURRICULUM');
                          }}
                          className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-indigo-600 text-[11px] font-bold text-indigo-300 hover:text-white border border-slate-800 cursor-pointer"
                        >
                          Open Module {mod?.number}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =====================================================================
          TAB 3: 9-ITEM INTERACTIVE COMPANY RESEARCH WORKSHEET
         ===================================================================== */}
      {viewTab === 'WORKSHEET' && (
        <section className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Module 8 Practical Tool
              </span>
              <h2 className="text-xl font-black text-white">
                9-Item Company Analysis & Valuation Worksheet
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Document your fundamental thesis before committing capital. Saved directly to your StockMate student account.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyWorksheet}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedBanner ? 'Copied!' : 'Copy Notes'}
              </button>
              <button
                type="button"
                onClick={handleSaveWorksheet}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save to Account
              </button>
            </div>
          </div>

          {worksheetSavedBanner && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300">
              {worksheetSavedBanner}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Company Name</label>
              <input
                type="text"
                placeholder="e.g., Tata Consultancy Services Ltd"
                value={worksheet.companyName}
                onChange={(e) => setWorksheet({ ...worksheet, companyName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">NSE / BSE Ticker</label>
              <input
                type="text"
                placeholder="e.g., TCS"
                value={worksheet.ticker}
                onChange={(e) => setWorksheet({ ...worksheet, ticker: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                key: 'businessModel' as const,
                label: '1. Business Model & Core Revenue Drivers',
                placeholder: 'How does the company make money? Volume vs pricing mix?',
              },
              {
                key: 'revenueGrowth5Y' as const,
                label: '2. 5–10 Year Revenue & Earnings Track Record',
                placeholder: 'Consistent compounding or deep cyclical swings?',
              },
              {
                key: 'profitabilityRoeRoce' as const,
                label: '3. Operating Margin, ROE & ROCE Quality',
                placeholder: 'Is ROCE > 15% across the cycle without excessive leverage?',
              },
              {
                key: 'balanceSheetDebt' as const,
                label: '4. Balance Sheet Strength & Debt/Equity',
                placeholder: 'Borrowings, interest coverage, working-capital days?',
              },
              {
                key: 'cashFlowOcfVsPat' as const,
                label: '5. Cash Conversion (Cumulative CFO vs PAT & FCF)',
                placeholder: 'Does reported profit convert into real operating cash flow?',
              },
              {
                key: 'governancePromoter' as const,
                label: '6. Corporate Governance & Promoter Pledging',
                placeholder: 'Promoter holding %, pledged shares %, RPTs, audit cleanliness?',
              },
              {
                key: 'competitiveMoat' as const,
                label: '7. Competitive Moat (Switching Cost / Brand / Cost Advantage)',
                placeholder: 'What stops competitors from eroding margins?',
              },
              {
                key: 'valuationVsPeers' as const,
                label: '8. Valuation vs Peers & Bear / Base / Bull Scenarios',
                placeholder: 'Current P/E, P/B, DCF/DDM range & Margin of Safety?',
              },
              {
                key: 'keyRisksInvalidation' as const,
                label: '9. Key Risks & Explicit Thesis Invalidation Triggers',
                placeholder: 'What specific fundamental deterioration would prove you wrong?',
              },
            ].map((field) => (
              <div
                key={field.key}
                className={field.key === 'keyRisksInvalidation' ? 'md:col-span-2' : ''}
              >
                <label className="block text-xs font-bold text-slate-200 mb-1">{field.label}</label>
                <textarea
                  rows={2}
                  placeholder={field.placeholder}
                  value={worksheet[field.key]}
                  onChange={(e) => setWorksheet({ ...worksheet, [field.key]: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =====================================================================
          TAB 4: 6-QUESTION MASTER REFERENCE CHECK
         ===================================================================== */}
      {viewTab === 'MASTER_CHECK' && (
        <section className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Comprehensive Reference Synthesis
              </span>
              <h2 className="text-xl font-black text-white">6-Question Master Reference Check</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tests end-to-end synthesis across market structure, cash flow forensics, valuation constraints, polarity, IV crush, and position sizing.
              </p>
            </div>
            {masterSubmitted && (
              <button
                type="button"
                onClick={() => {
                  setMasterSelections({});
                  setMasterSubmitted(false);
                }}
                className="text-xs text-indigo-300 hover:text-white font-bold cursor-pointer"
              >
                Reset Check
              </button>
            )}
          </div>

          <div className="space-y-4">
            {MASTER_REFERENCE_QUIZ.map((q) => {
              const pick = masterSelections[q.id];
              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                >
                  <div className="text-xs sm:text-sm font-bold text-white">{q.question}</div>
                  <div className="space-y-2">
                    {q.options.map((opt, idx) => {
                      const isPicked = pick === idx;
                      const isRight = q.correctIndex === idx;
                      let cls = 'bg-slate-900 border-slate-800 text-slate-200';
                      if (masterSubmitted) {
                        if (isRight) cls = 'bg-emerald-950/60 border-emerald-500 text-emerald-100';
                        else if (isPicked) cls = 'bg-rose-950/60 border-rose-500 text-rose-100';
                      } else if (isPicked) {
                        cls = 'bg-indigo-950/70 border-indigo-500 text-white';
                      }
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={masterSubmitted}
                          onClick={() =>
                            setMasterSelections((prev) => ({ ...prev, [q.id]: idx }))
                          }
                          className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs cursor-pointer ${cls}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {masterSubmitted && (
                    <div className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <strong className="text-emerald-400">Explanation: </strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!masterSubmitted ? (
            <button
              type="button"
              disabled={Object.keys(masterSelections).length < MASTER_REFERENCE_QUIZ.length}
              onClick={() => setMasterSubmitted(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm cursor-pointer"
            >
              Grade Master Check
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-sm font-bold text-white">
              Score:{' '}
              {
                MASTER_REFERENCE_QUIZ.filter((q) => masterSelections[q.id] === q.correctIndex)
                  .length
              }{' '}
              / {MASTER_REFERENCE_QUIZ.length} correct!
            </div>
          )}
        </section>
      )}

      {/* =====================================================================
          TAB 5: GLOSSARY & OFFICIAL RELIABLE RESOURCES
         ===================================================================== */}
      {viewTab === 'GLOSSARY' && (
        <div className="space-y-6">
          <section className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">Indian Market Glossary</h2>
                <p className="text-xs text-slate-400">
                  Quick definitions across market plumbing, fundamentals, technicals, derivatives, and risk.
                </p>
              </div>
              <input
                type="text"
                placeholder="Filter glossary terms..."
                value={glossarySearch}
                onChange={(e) => setGlossarySearch(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white w-full sm:w-64"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CURRICULUM_GLOSSARY.filter(
                (g) =>
                  !glossarySearch.trim() ||
                  g.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
                  g.definition.toLowerCase().includes(glossarySearch.toLowerCase())
              ).map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white">{item.term}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-indigo-300 border border-slate-800">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.definition}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-black text-white">
                Primary Official Sources (SEBI, NSE, BSE, NISM & RBI)
              </h2>
              <p className="text-xs text-slate-400">
                Always verify company filings, circulars, and rules directly from primary Indian statutory portals rather than unverified social tips.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {OFFICIAL_RESOURCES.map((res, idx) => (
                <a
                  key={idx}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white">{res.name}</div>
                    <div className="text-[11px] font-semibold text-indigo-300">{res.authority}</div>
                    <p className="text-xs text-slate-400">{res.purpose}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                </a>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
