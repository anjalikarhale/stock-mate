import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  Plus,
  Copy,
  Check,
  Play,
  Share2,
  LogOut,
  Clock,
  Award,
  Download,
  AlertCircle,
} from 'lucide-react';
import { useClassroom } from '../../context/ClassroomContext';
import { TeacherLiveMonitor } from './TeacherLiveMonitor';
import { TeacherResultsView } from './TeacherResultsView';
import { classroomApi } from '../../services/classroomApi';

export const SimpleTeacherDashboard: React.FC = () => {
  const {
    currentUser,
    logout,
    myClassrooms,
    activeClassroom,
    selectClassroom,
    createClassroom,
    classroomMembers,
    classroomActivities,
    activeActivity,
    selectActivity,
    createActivity,
    startActivity,
    nextRound,
    endActivity,
    activeView,
    setActiveView,
    onlineUserIds,
    leaderboard,
  } = useClassroom();

  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newDept, setNewDept] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [isStartingActivity, setIsStartingActivity] = useState(false);

  const teacherName = currentUser?.name || 'Instructor';

  const copyCode = () => {
    if (!activeClassroom) return;
    navigator.clipboard?.writeText(activeClassroom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    try {
      setIsCreatingClass(true);
      await createClassroom(newClassName.trim(), newDept.trim() || undefined);
      setNewClassName('');
      setNewDept('');
      setShowCreateClassModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create classroom');
    } finally {
      setIsCreatingClass(false);
    }
  };

  // Launch StockMate Market Challenge
  const handleLaunchChallenge = async () => {
    if (!activeClassroom) return;
    try {
      setIsStartingActivity(true);
      // Check if existing challenge exists
      let act = classroomActivities.find((a) => a.name.includes('Market Challenge'));
      if (!act) {
        act = await createActivity({
          name: 'StockMate Market Challenge',
          description: '2-Round interactive stock market quiz (Market Basics & Visual Chart Reading)',
          concept: 'Market Basics & Chart Fundamentals',
          symbol: 'RELIANCE',
          durationMinutes: 10,
          totalRounds: 2,
        });
      }
      await selectActivity(act);
      setActiveView('TEACHER_MONITOR');
    } catch (err: any) {
      alert(err.message || 'Failed to launch challenge');
    } finally {
      setIsStartingActivity(false);
    }
  };

  const realStudents = classroomMembers.filter((m) => m.role === 'STUDENT');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Teacher Top Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-indigo-900/40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base text-white tracking-tight">STOCKMATE</span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-bold border border-indigo-700/40">
                TEACHER PORTAL
              </span>
            </div>
            <p className="text-xs text-slate-400">Welcome, {teacherName}!</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateClassModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Classroom</span>
          </button>

          <button
            onClick={() => logout()}
            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-800/60 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Teacher Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* View Switcher: Live Monitor vs Main Dashboard */}
        {activeView === 'TEACHER_MONITOR' && activeActivity ? (
          <TeacherLiveMonitor />
        ) : activeView === 'RESULTS' && activeActivity ? (
          <TeacherResultsView />
        ) : (
          <div className="space-y-6">
            {/* Top Classrooms Selector & Stats */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Current Classroom
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    {myClassrooms.length > 0 ? (
                      <select
                        value={activeClassroom?.id || ''}
                        onChange={(e) => {
                          const cls = myClassrooms.find((c) => c.id === e.target.value);
                          if (cls) selectClassroom(cls);
                        }}
                        className="bg-slate-950 border border-slate-800 text-white font-bold text-base sm:text-lg px-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500"
                      >
                        {myClassrooms.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-base text-slate-400">No classroom created yet</span>
                    )}
                  </div>
                </div>

                {activeClassroom && (
                  <div className="flex items-center gap-2">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block leading-tight">
                          Classroom Code
                        </span>
                        <span className="font-mono font-black text-xl text-amber-400 tracking-widest block leading-tight">
                          {activeClassroom.code}
                        </span>
                      </div>
                      <button
                        onClick={copyCode}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Copy Code"
                      >
                        {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Classroom Key Numbers */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 block font-medium">Students Joined</span>
                  <span className="text-2xl font-black text-white">{realStudents.length}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 block font-medium">Online Now</span>
                  <span className="text-2xl font-black text-emerald-400">
                    {onlineUserIds.length > 0 ? onlineUserIds.length : realStudents.length}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center col-span-2 sm:col-span-1">
                  <span className="text-xs text-slate-400 block font-medium">Current Activity</span>
                  <span className="text-sm font-bold text-indigo-300 block truncate mt-1">
                    {activeActivity ? activeActivity.name : 'StockMate Market Challenge'}
                  </span>
                </div>
              </div>

              {/* Action: Start Activity Button */}
              <div className="pt-2">
                <button
                  onClick={handleLaunchChallenge}
                  disabled={!activeClassroom || isStartingActivity}
                  className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-bold text-base shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>
                    {activeActivity?.status === 'LIVE'
                      ? 'Resume Live Challenge Monitor'
                      : 'Start StockMate Market Challenge'}
                  </span>
                </button>
                <p className="text-center text-xs text-slate-500 mt-2">
                  2 Rounds: Round 1 (Market Basics, 10 Questions) & Round 2 (Chart Reading, 10 Questions)
                </p>
              </div>
            </div>

            {/* Joined Students List */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-bold text-base text-white">Joined Students</h3>
                </div>
                <span className="text-xs text-slate-400">{realStudents.length} enrolled</span>
              </div>

              {realStudents.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300">No students joined yet</p>
                  <p>Share classroom code <span className="font-mono text-amber-400 font-bold">{activeClassroom?.code || '...'}</span> with your students to have them join!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80">
                  {realStudents.map((std) => (
                    <div key={std.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{std.userAvatar || '👨‍🎓'}</span>
                        <div>
                          <span className="font-bold text-sm text-white block">{std.userName}</span>
                          <span className="text-xs text-slate-500">{std.userEmail}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-semibold">
                          Enrolled
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal: Create Classroom */}
      {showCreateClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-black text-white">Create New Classroom</h3>
            <p className="text-xs text-slate-400">
              Set up a classroom code so your students can join live quizzes.
            </p>

            <form onSubmit={handleCreateClass} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Classroom Name
                </label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g. Stock Market 101 - Section A"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Department / Batch (Optional)
                </label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  placeholder="e.g. Finance & Economics"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateClassModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingClass || !newClassName.trim()}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition-all cursor-pointer shadow-md"
                >
                  {isCreatingClass ? 'Creating...' : 'Create Classroom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto px-4 py-4 text-center text-xs text-slate-600">
        StockMate Teacher Console • Role-verified session
      </footer>
    </div>
  );
};
