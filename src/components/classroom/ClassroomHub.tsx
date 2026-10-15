import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Users,
  Plus,
  Copy,
  Check,
  Play,
  Award,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Download,
  Flame,
  Shield,
  Clock,
  BookOpen,
  Share2,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react';
import { useClassroom } from '../../context/ClassroomContext';
import { WaitingRoom } from './WaitingRoom';
import { MarketBattleActivity } from './MarketBattleActivity';
import { TeacherLiveMonitor } from './TeacherLiveMonitor';
import { StudentResultModal } from './StudentResultModal';
import { TeacherResultsView } from './TeacherResultsView';
import { ClassroomActivity } from '../../types/classroom';
import { classroomApi } from '../../services/classroomApi';
import { StockMateAuthModal, AuthMode } from '../auth/StockMateAuthModal';

export const ClassroomHub: React.FC = () => {
  const {
    currentUser,
    availableUsers,
    onlineUserIds,
    switchUser,
    updateUserProfile,
    loginAsTeacher,
    loginAsStudent,
    myClassrooms,
    activeClassroom,
    selectClassroom,
    classroomMembers,
    classroomActivities,
    activeActivity,
    selectActivity,
    createClassroom,
    joinClassroomByCode,
    createActivity,
    activeView,
    setActiveView,
    startActivity,
  } = useClassroom();

  // Modals
  const [showCreateClassModal, setShowCreateClassModal] = useState<boolean>(false);
  const [showJoinCodeModal, setShowJoinCodeModal] = useState<boolean>(false);
  const [showCreateActivityModal, setShowCreateActivityModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('STUDENT_LOGIN');

  const openAuthModal = (mode: AuthMode) => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // Profile Form states
  const [profileName, setProfileName] = useState<string>(currentUser?.name || 'Student');
  const [profileEmail, setProfileEmail] = useState<string>(currentUser?.email || '');
  const [profileRole, setProfileRole] = useState<'TEACHER' | 'STUDENT'>(currentUser?.role || 'STUDENT');
  const [profileAvatar, setProfileAvatar] = useState<string>(currentUser?.avatar || '👨‍🎓');

  // Classroom Form states
  const [newClassName, setNewClassName] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>('2026');
  const [batch, setBatch] = useState<string>('Batch A');

  const [joinCode, setJoinCode] = useState<string>('');
  const [joinError, setJoinError] = useState<string>('');
  const [studentJoinName, setStudentJoinName] = useState<string>(
    currentUser?.name && currentUser.name !== 'Student Trader' ? currentUser.name : ''
  );
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // New Activity form state - Default to StockMate Market Challenge
  const [activityName, setActivityName] = useState<string>('StockMate Market Challenge');
  const [activityConcept, setActivityConcept] = useState<string>('Market Basics & Visual Chart Reading (2 Rounds)');
  const [activitySymbol, setActivitySymbol] = useState<string>('RELIANCE');
  const [activityDifficulty, setActivityDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [activityDuration, setActivityDuration] = useState<number>(10);
  const [isCreatingActivity, setIsCreatingActivity] = useState<boolean>(false);

  // Detect URL join parameters (e.g. ?join=CODE or ?code=CODE)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get('join') || params.get('code') || params.get('class');
      if (codeParam) {
        const cleanCode = codeParam.trim().toUpperCase();
        // Check if user is already in this classroom
        const existing = myClassrooms.find((c) => c.code === cleanCode);
        if (existing) {
          selectClassroom(existing);
        } else {
          setJoinCode(cleanCode);
          setShowJoinCodeModal(true);
        }
      }
    }
  }, [myClassrooms, selectClassroom]);

  const copyClassCode = () => {
    if (activeClassroom) {
      navigator.clipboard?.writeText(activeClassroom.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const copyJoinLink = () => {
    if (activeClassroom) {
      const url = `${window.location.origin}${window.location.pathname}?join=${activeClassroom.code}`;
      navigator.clipboard?.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    await createClassroom(
      newClassName.trim(),
      department.trim() || undefined,
      academicYear.trim() || undefined,
      batch.trim() || undefined
    );
    setNewClassName('');
    setDepartment('');
    setShowCreateClassModal(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    await updateUserProfile({
      name: profileName.trim(),
      email: profileEmail.trim(),
      role: profileRole,
      avatar: profileAvatar,
    });
    setShowProfileModal(false);
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    if (!joinCode.trim()) return;

    // If student provided their custom real name, update profile first
    if (studentJoinName.trim() && studentJoinName.trim() !== currentUser.name) {
      await updateUserProfile({
        name: studentJoinName.trim(),
        role: 'STUDENT',
      });
    }

    const res = await joinClassroomByCode(joinCode.trim().toUpperCase());
    if (res.success) {
      setJoinCode('');
      setShowJoinCodeModal(false);
    } else {
      setJoinError(res.message || 'Invalid classroom code. Check code with teacher.');
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingActivity(true);
    try {
      const act = await createActivity({
        name: activityName,
        concept: activityConcept,
        symbol: activitySymbol,
        difficulty: activityDifficulty,
        durationMinutes: activityDuration,
        xpReward: 200,
      });
      setShowCreateActivityModal(false);
      // Select newly created activity
      await selectActivity(act);
    } catch (err: any) {
      console.error('Failed to create activity:', err);
    } finally {
      setIsCreatingActivity(false);
    }
  };

  // Render Sub-Views
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4">
        <p className="text-sm text-slate-300">Please log in to access the classroom.</p>
      </div>
    );
  }

  if (activeView === 'WAITING_ROOM') {
    return <WaitingRoom onBack={() => setActiveView('LIST')} />;
  }

  if (activeView === 'ACTIVITY') {
    return <MarketBattleActivity />;
  }

  if (activeView === 'TEACHER_MONITOR') {
    return <TeacherLiveMonitor />;
  }

  if (activeView === 'RESULTS') {
    return currentUser?.role === 'TEACHER' ? (
      <TeacherResultsView onBack={() => setActiveView('LIST')} />
    ) : (
      <StudentResultModal onBack={() => setActiveView('LIST')} />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* User Identity Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-2xl border border-indigo-500/30">
            {currentUser.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm sm:text-base">{currentUser.name}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  currentUser.role === 'TEACHER'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {currentUser.role}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {currentUser.email} • {currentUser.role === 'TEACHER' ? 'Instructor Host & Evaluation Authority' : `${currentUser.xp} XP • Level ${currentUser.level}`}
            </p>
          </div>
        </div>

        {/* User profile action */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setProfileName(currentUser.name);
              setProfileEmail(currentUser.email);
              setProfileRole(currentUser.role);
              setProfileAvatar(currentUser.avatar || (currentUser.role === 'TEACHER' ? '👨‍🏫' : '👨‍🎓'));
              setShowProfileModal(true);
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Hero Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-3">
            <GraduationCap className="w-4 h-4" />
            <span>REAL-TIME CLASSROOM COMPETITION SYSTEM</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {currentUser.role === 'TEACHER' ? 'Teacher Classroom Command' : 'Classroom Trading Arena'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
            {currentUser.role === 'TEACHER'
              ? 'Synchronize market decision battles across all student devices. Set round times, inspect real-time participation, and benchmark risk management discipline.'
              : 'Join your class using your teacher’s code. Make live trading decisions on real NSE stock data, protect your stop loss, and climb the live classroom leaderboard.'}
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            {currentUser.role === 'TEACHER' ? (
              <>
                <button
                  onClick={() => setShowCreateActivityModal(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  CREATE REAL-TIME ACTIVITY
                </button>
                <button
                  onClick={() => setShowCreateClassModal(true)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase px-4 py-2.5 rounded-xl border border-slate-700 transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  NEW CLASSROOM
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowJoinCodeModal(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase px-5 py-3 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                JOIN CLASSROOM WITH CODE
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Classroom Switcher (if teacher has multiple classes) */}
      {myClassrooms.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Your Classrooms:
          </span>
          {myClassrooms.map((cls) => {
            const isSelected = activeClassroom?.id === cls.id;
            return (
              <button
                key={cls.id}
                onClick={() => selectClassroom(cls)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cls.name} <span className="font-mono text-[10px] opacity-75">({cls.code})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Classroom Context Strip (Code & Info) */}
      {activeClassroom && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Current Classroom</span>
              <h3 className="text-lg font-black text-white">{activeClassroom.name}</h3>
              <p className="text-xs text-slate-400">
                Instructor: {activeClassroom.teacherName} • {classroomMembers.length} Enrolled Members
                {(activeClassroom.department || activeClassroom.year || activeClassroom.batch) && (
                  <span>
                    {' • '}
                    {[activeClassroom.department, activeClassroom.year, activeClassroom.batch].filter(Boolean).join(' • ')}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Join Code Callout & Quick Share Actions */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Class Code</span>
                <span className="font-mono text-lg font-black text-amber-400 tracking-wider">
                  {activeClassroom.code}
                </span>
              </div>
              <button
                onClick={copyClassCode}
                title="Copy Classroom Code"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={copyJoinLink}
              title="Copy Direct Join Link"
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <LinkIcon className="w-4 h-4 text-indigo-400" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
            </button>

            {currentUser.role === 'TEACHER' && (
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>Share with Students</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area: Active Activities & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Activities List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Classroom Competitions & Challenges
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {classroomActivities.length} Activities Configured
            </span>
          </div>

          {classroomActivities.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="font-semibold text-sm">No classroom activities created yet.</p>
              {currentUser.role === 'TEACHER' && (
                <button
                  onClick={() => setShowCreateActivityModal(true)}
                  className="mt-3 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Create First Activity
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {classroomActivities.map((act) => {
                const isLive = act.status === 'LIVE';
                const isWaiting = act.status === 'WAITING' || act.status === 'DRAFT';
                const isCompleted = act.status === 'COMPLETED';

                return (
                  <div
                    key={act.id}
                    className={`bg-slate-900/80 border rounded-2xl p-5 transition-all shadow-md ${
                      isLive
                        ? 'border-emerald-500/50 bg-emerald-950/10'
                        : isWaiting
                        ? 'border-indigo-500/40'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isLive ? 'bg-emerald-400 animate-ping' : isWaiting ? 'bg-amber-400' : 'bg-slate-500'
                          }`}
                        />
                        <h4 className="font-bold text-base text-white">{act.name}</h4>
                        <span className="text-xs font-mono font-bold bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-slate-700">
                          {act.symbol}
                        </span>
                      </div>

                      <span
                        className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          isLive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isWaiting
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {act.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-4">{act.description}</p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
                      <div className="flex items-center gap-4 text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {act.totalRounds} Rounds ({act.durationMinutes} mins)
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-sky-400" />
                          {act.difficulty}
                        </span>
                        <span className="text-indigo-400 font-bold font-mono">+{act.xpReward} XP</span>
                      </div>

                      {/* Action buttons based on status & role */}
                      <div className="flex items-center gap-2">
                        {currentUser.role === 'TEACHER' ? (
                          <>
                            {isWaiting && (
                              <button
                                onClick={async () => {
                                  await selectActivity(act);
                                  await startActivity(act.id);
                                }}
                                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-xl transition-all shadow-md cursor-pointer"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                START ACTIVITY
                              </button>
                            )}
                            {(isLive || act.status === 'PAUSED') && (
                              <button
                                onClick={() => {
                                  selectActivity(act);
                                  setActiveView('TEACHER_MONITOR');
                                }}
                                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-xl transition-all shadow-md cursor-pointer"
                              >
                                OPEN LIVE MONITOR
                              </button>
                            )}
                            {isCompleted && (
                              <>
                                <button
                                  onClick={() => {
                                    selectActivity(act);
                                    setActiveView('RESULTS');
                                  }}
                                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase px-3 py-1.5 rounded-xl border border-slate-700 transition-all cursor-pointer"
                                >
                                  <Award className="w-3.5 h-3.5 text-amber-400" />
                                  VIEW RESULTS
                                </button>
                                <a
                                  href={classroomApi.getExportUrl(act.id)}
                                  download
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
                                  title="Export CSV"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              </>
                            )}
                          </>
                        ) : (
                          /* Student Actions */
                          <>
                            {isWaiting && (
                              <button
                                onClick={() => {
                                  selectActivity(act);
                                  setActiveView('WAITING_ROOM');
                                }}
                                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-xl transition-all shadow-md cursor-pointer"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                ENTER WAITING ROOM
                              </button>
                            )}
                            {isLive && (
                              <button
                                onClick={() => {
                                  selectActivity(act);
                                  setActiveView('ACTIVITY');
                                }}
                                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase px-4 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                JOIN LIVE CHALLENGE
                              </button>
                            )}
                            {isCompleted && (
                              <button
                                onClick={() => {
                                  selectActivity(act);
                                  setActiveView('RESULTS');
                                }}
                                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase px-3 py-1.5 rounded-xl border border-slate-700 transition-all cursor-pointer"
                              >
                                <Award className="w-3.5 h-3.5 text-amber-400" />
                                VIEW YOUR SCORE
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Enrolled Students & Class Details (1 col) */}
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Classroom Roster ({classroomMembers.length})
              </h4>
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {classroomMembers.filter((m) => onlineUserIds.includes(m.userId) || m.isOnline || m.userId === currentUser.id).length} Online
              </span>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {classroomMembers.length === 0 ? (
                <div className="p-4 text-center text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800 text-xs">
                  No students have joined yet. Share code <span className="font-mono text-amber-400 font-bold">{activeClassroom?.code}</span> with your students to connect!
                </div>
              ) : (
                classroomMembers.map((m) => {
                  const isOnline = onlineUserIds.includes(m.userId) || m.isOnline || m.userId === currentUser.id;
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <span className="text-lg">{m.userAvatar || '👨‍🎓'}</span>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-950 ${
                              isOnline
                                ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                                : 'bg-slate-600'
                            }`}
                            title={isOnline ? 'Online' : 'Offline'}
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-200 flex items-center gap-1">
                            <span>{m.userName}</span>
                            {m.role === 'TEACHER' && (
                              <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1 rounded font-bold">
                                TEACHER
                              </span>
                            )}
                            {m.userId === currentUser.id && (
                              <span className="text-[9px] bg-indigo-500 text-white px-1 rounded font-bold">YOU</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">{m.userEmail}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(m.joinedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Educational Scoring Philosophy Banner */}
          <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/90 border border-indigo-500/20 rounded-2xl p-5 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase text-[11px]">
              <Shield className="w-4 h-4" />
              Educational Scoring Matrix
            </div>
            <p className="text-[11px] text-slate-400">
              Scoring is weighted to reward risk discipline over gambling:
            </p>
            <div className="space-y-1 text-[11px] font-mono">
              <div className="flex justify-between">
                <span>Decision Alignment:</span>
                <span className="text-amber-400 font-bold">40%</span>
              </div>
              <div className="flex justify-between">
                <span>Risk Management (R:R & SL):</span>
                <span className="text-sky-400 font-bold">25%</span>
              </div>
              <div className="flex justify-between">
                <span>Rationale Analysis:</span>
                <span className="text-emerald-400 font-bold">20%</span>
              </div>
              <div className="flex justify-between">
                <span>Timing & Participation:</span>
                <span className="text-indigo-400 font-bold">15%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Join Classroom With Code */}
      <AnimatePresence>
        {showJoinCodeModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <h3 className="text-lg font-bold text-white">Join Classroom with Code</h3>
              <p className="text-xs text-slate-400">
                Ask your instructor for your 6-character classroom code (e.g. <span className="font-mono text-amber-400">SM2026</span>).
              </p>

              {joinError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-lg">
                  {joinError}
                </div>
              )}

              <form onSubmit={handleJoinClass} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Your Full Name (Student)
                  </label>
                  <input
                    type="text"
                    value={studentJoinName}
                    onChange={(e) => setStudentJoinName(e.target.value)}
                    placeholder="e.g. Ananya Sen or Rohan Gupta"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    This name will appear on the instructor’s live roster and the classroom leaderboard.
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Classroom Code
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SM2026"
                    maxLength={10}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 font-mono text-center text-lg font-black tracking-widest text-white outline-none"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowJoinCodeModal(false)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
                  >
                    Join Classroom
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Share Classroom with Real Students */}
      <AnimatePresence>
        {showShareModal && activeClassroom && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Share Classroom with Real Students</h3>
                    <p className="text-xs text-slate-400">{activeClassroom.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-slate-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Big Code Showcase */}
              <div className="bg-slate-950/80 border-2 border-amber-500/40 rounded-2xl p-6 text-center space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 block">
                  CLASSROOM JOIN CODE
                </span>
                <div className="text-4xl sm:text-5xl font-mono font-black text-white tracking-widest selection:bg-amber-500 selection:text-black">
                  {activeClassroom.code}
                </div>
                <p className="text-xs text-slate-400">
                  Project or write this code on the board for students joining from laptops or phones.
                </p>
                <div className="pt-2">
                  <button
                    onClick={copyClassCode}
                    className="inline-flex items-center gap-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode ? 'Code Copied to Clipboard!' : 'Copy 6-Character Code'}</span>
                  </button>
                </div>
              </div>

              {/* Direct Link Showcase */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <span className="text-[11px] font-bold uppercase text-slate-400 block">
                  Direct Student Join URL (1-Click Entry)
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''}?join=${activeClassroom.code}`}
                    className="flex-1 bg-slate-900 border border-slate-800 text-xs font-mono text-indigo-300 rounded-xl px-3 py-2 outline-none select-all"
                  />
                  <button
                    onClick={copyJoinLink}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors shrink-0 cursor-pointer shadow-md"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <LinkIcon className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Students on laptops, phones, or tablets can open this link to enter immediately.
                </p>
              </div>

              {/* Quick Flow Instructions */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-2 text-xs text-slate-300">
                <span className="font-bold text-slate-200 block">How Tomorrow's Session Works:</span>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                  <li>Share the code or join link with your students.</li>
                  <li>Watch students appear in real time on your <strong className="text-slate-200">Classroom Roster</strong>.</li>
                  <li>Click <strong className="text-slate-200">"START ACTIVITY"</strong> when everyone is ready.</li>
                  <li>All students receive the challenge simultaneously on their own devices.</li>
                </ol>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Create Classroom */}
      <AnimatePresence>
        {showCreateClassModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <h3 className="text-lg font-bold text-white">Create New Classroom</h3>
              <p className="text-xs text-slate-400">
                A unique classroom code will be automatically generated for your students to join.
              </p>

              <form onSubmit={handleCreateClass} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Classroom / Course Name *
                  </label>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="e.g. Financial Markets 101 - Section B"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-white outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-3 sm:col-span-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Finance / MBA"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Year
                    </label>
                    <input
                      type="text"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      placeholder="2026"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Batch
                    </label>
                    <input
                      type="text"
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      placeholder="Batch A"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateClassModal(false)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
                  >
                    Create Classroom
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Edit Profile / Identity */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <h3 className="text-lg font-bold text-white">Your Classroom Identity</h3>
              <p className="text-xs text-slate-400">
                Configure your display name and role. Real students and teachers use their actual identity.
              </p>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="e.g. Prof. Rajesh Kumar or Ananya Sen"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-white outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="e.g. rajesh@university.edu"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Role in Classroom
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileRole('TEACHER');
                        if (profileAvatar === '👨‍🎓' || profileAvatar === '👩‍🎓') {
                          setProfileAvatar('👨‍🏫');
                        }
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        profileRole === 'TEACHER'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="text-xl mb-1">👨‍🏫</div>
                      <div className="text-xs font-bold">Teacher / Host</div>
                      <div className="text-[10px] text-slate-400">Can launch & control activities</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileRole('STUDENT');
                        if (profileAvatar === '👨‍🏫' || profileAvatar === '👩‍🏫') {
                          setProfileAvatar('👨‍🎓');
                        }
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        profileRole === 'STUDENT'
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="text-xl mb-1">👨‍🎓</div>
                      <div className="text-xs font-bold">Student</div>
                      <div className="text-[10px] text-slate-400">Joins code, trades & submits</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Choose Avatar
                  </label>
                  <div className="flex gap-2">
                    {['👨‍🏫', '👩‍🏫', '👨‍🎓', '👩‍🎓', '🚀', '📈', '⚡', '🏆'].map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setProfileAvatar(av)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg border transition-all ${
                          profileAvatar === av
                            ? 'bg-indigo-600 border-indigo-400 scale-110'
                            : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
                  >
                    Save & Update
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Create Activity */}
      <AnimatePresence>
        {showCreateActivityModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-lg font-bold text-white">Create Real-Time Classroom Activity</h3>
              <p className="text-xs text-slate-400">
                Configure a synchronized Market Decision Challenge backed by real market data.
              </p>

              <form onSubmit={handleCreateActivity} className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Activity Title
                  </label>
                  <input
                    type="text"
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Learning Concept / Topic
                  </label>
                  <input
                    type="text"
                    value={activityConcept}
                    onChange={(e) => setActivityConcept(e.target.value)}
                    placeholder="e.g. Risk Management & Stop-Loss Placement"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                      NSE Stock Instrument
                    </label>
                    <select
                      value={activitySymbol}
                      onChange={(e) => setActivitySymbol(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                    >
                      {['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'ITC', 'LT', 'BHARTIARTL'].map(
                        (sym) => (
                          <option key={sym} value={sym}>
                            {sym}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={activityDifficulty}
                      onChange={(e) => setActivityDifficulty(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-400">
                  <span className="font-bold text-slate-300 block mb-0.5">Automated Structure:</span>
                  5 Synchronized Rounds • 2 Minutes per Round • 200 Practical XP Reward • Server-Authoritative Scoring
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateActivityModal(false)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingActivity}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
                  >
                    {isCreatingActivity ? 'Creating...' : 'Launch Activity'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* StockMate Auth Modal (Student Login / Sign Up, Teacher Login / Sign Up) */}
      <StockMateAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
};
