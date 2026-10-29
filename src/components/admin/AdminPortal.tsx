import React, { useEffect, useState, useMemo } from 'react';
import {
  Shield,
  Search,
  RefreshCw,
  Download,
  Users,
  GraduationCap,
  TrendingUp,
  BarChart3,
  Award,
  Wallet,
  CheckCircle2,
  Clock,
  ExternalLink,
  LogOut,
  ChevronRight,
  X,
  BookOpen,
  Filter,
  DollarSign,
  AlertCircle,
  HelpCircle,
  ArrowUpRight,
  Building,
} from 'lucide-react';
import { UserDetailedProgress } from '../../types/admin';

interface AdminPortalProps {
  adminUser: any;
  token: string;
  onLogout: () => void;
  onSwitchToStudentView: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  adminUser,
  token,
  onLogout,
  onSwitchToStudentView,
}) => {
  const [users, setUsers] = useState<UserDetailedProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'TEACHER'>('ALL');
  const [sortBy, setSortBy] = useState<
    'progress_desc' | 'progress_asc' | 'name_asc' | 'level_desc' | 'networth_desc' | 'trades_desc'
  >('progress_desc');
  const [selectedUser, setSelectedUser] = useState<UserDetailedProgress | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchUsersProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/admin/users-progress', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Administrator session expired or unauthorized. Please re-authenticate.');
        }
        throw new Error('Failed to load user progress records.');
      }

      const data = await res.json();
      setUsers(data.users || []);
      setLastRefreshed(new Date());
    } catch (err: any) {
      setError(err.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersProgress();
  }, [token]);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'progress_desc':
            return b.courseProgressPercent - a.courseProgressPercent;
          case 'progress_asc':
            return a.courseProgressPercent - b.courseProgressPercent;
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'level_desc':
            return b.level - a.level;
          case 'networth_desc':
            return b.netWorth - a.netWorth;
          case 'trades_desc':
            return b.totalTrades - a.totalTrades;
          default:
            return 0;
        }
      });
  }, [users, roleFilter, searchQuery, sortBy]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const studentCount = users.filter((u) => u.role === 'STUDENT').length;
    const teacherCount = users.filter((u) => u.role === 'TEACHER').length;
    const avgProgress =
      totalUsers > 0
        ? Math.round(users.reduce((acc, u) => acc + u.courseProgressPercent, 0) / totalUsers)
        : 0;
    const totalTrades = users.reduce((acc, u) => acc + (u.totalTrades || 0), 0);
    const totalSimulatedCapital = users.reduce((acc, u) => acc + (u.netWorth || 0), 0);

    return {
      totalUsers,
      studentCount,
      teacherCount,
      avgProgress,
      totalTrades,
      totalSimulatedCapital,
    };
  }, [users]);

  // CSV Export
  const handleExportCSV = () => {
    if (users.length === 0) return;

    const headers = [
      'ID',
      'Name',
      'Email',
      'Role',
      'Level',
      'XP',
      'Completed Topics (Total)',
      'Total Topics',
      'Progress (%)',
      'Module 1 Basic (Done/12)',
      'Module 2 Intermediate (Done/14)',
      'Module 3 Advance (Done/16)',
      'Virtual Cash (INR)',
      'Holdings Value (INR)',
      'Net Worth (INR)',
      'Total Trades',
      'Realized PnL (INR)',
      'Win Rate (%)',
      'Classrooms Enrolled',
      'Last Active',
    ];

    const rows = users.map((u) => [
      `"${u.id}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      u.level,
      u.xp,
      u.completedTopicsCount,
      u.totalTopicsCount,
      u.courseProgressPercent,
      u.module1Progress?.completed || 0,
      u.module2Progress?.completed || 0,
      u.module3Progress?.completed || 0,
      u.virtualCash,
      u.totalHoldingsValue,
      u.netWorth,
      u.totalTrades,
      u.realizedPnL,
      `${u.winRate}%`,
      `"${(u.classrooms || []).map((c) => c.name).join('; ')}"`,
      `"${u.lastActive}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `stockmate_user_progress_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col font-sans">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-amber-500 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                StockMate Administrator Portal
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                Live Data
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Master User Progress Directory & Learning Analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchUsersProgress}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh user data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm shadow-indigo-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            type="button"
            onClick={onSwitchToStudentView}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Student View
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-300 transition-colors cursor-pointer"
            title="Sign out of Admin Portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Total Users</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{metrics.totalUsers}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {metrics.studentCount} students • {metrics.teacherCount} teachers
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Progress</span>
              <BarChart3 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">
              {metrics.avgProgress}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Across all 3 modules</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Total Trades</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-cyan-300">{metrics.totalTrades}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Simulated orders</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Sim Capital</span>
              <Wallet className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300">
              ₹{(metrics.totalSimulatedCapital / 100000).toFixed(1)}L
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Total net worth</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Total Topics</span>
              <BookOpen className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-purple-300">42</div>
            <div className="text-[11px] text-slate-400 mt-0.5">12 B • 14 I • 16 A</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Security</span>
              <Shield className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">Active</div>
            <div className="text-[11px] text-emerald-400 mt-0.5 font-mono">1 Master Key</div>
          </div>
        </div>

        {/* Toolbar: Search, Filters & Sorting */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by learner name, email, or ID..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Role Filter */}
            <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setRoleFilter('ALL')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  roleFilter === 'ALL'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({users.length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('STUDENT')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  roleFilter === 'STUDENT'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Students ({users.filter((u) => u.role === 'STUDENT').length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('TEACHER')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  roleFilter === 'TEACHER'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Teachers ({users.filter((u) => u.role === 'TEACHER').length})
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="progress_desc">Highest Progress %</option>
                <option value="progress_asc">Lowest Progress %</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="level_desc">Level & XP</option>
                <option value="networth_desc">Net Worth (₹)</option>
                <option value="trades_desc">Most Trades</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchUsersProgress}
              className="text-xs font-bold underline hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* User Progress Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Individual User Learning & Trading Progress ({filteredUsers.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any row or "Inspect" to view module-by-module breakdown and quiz marks.
              </p>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Updated {lastRefreshed.toLocaleTimeString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Learner</th>
                  <th className="px-4 py-3">Level / XP</th>
                  <th className="px-4 py-3">Overall Progress</th>
                  <th className="px-4 py-3">3 Modules Breakdown</th>
                  <th className="px-4 py-3">Net Worth & Trades</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                        <span className="text-sm">Fetching user records & progress status...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <HelpCircle className="w-8 h-8 text-slate-400" />
                        <span className="text-base font-bold text-slate-300">No users found</span>
                        <p className="text-xs text-slate-400 max-w-sm">
                          {searchQuery
                            ? `No users matched "${searchQuery}". Try clearing filters.`
                            : 'No learners or teachers have registered in the database yet.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Learner Info */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                            {user.avatar || '👨‍🎓'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                                {user.name}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                                  user.role === 'TEACHER'
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                }`}
                              >
                                {user.role}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Level & XP */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-amber-300 text-xs sm:text-sm">
                            Level {user.level}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {user.xp.toLocaleString()} XP
                          </span>
                        </div>
                      </td>

                      {/* Overall Progress */}
                      <td className="px-4 py-3.5 min-w-[160px]">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-slate-300">
                              {user.courseProgressPercent}% Complete
                            </span>
                            <span className="text-slate-400 font-mono text-[11px]">
                              {user.completedTopicsCount}/{user.totalTopicsCount} topics
                            </span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                            <div
                              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${user.courseProgressPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 3 Modules Breakdown */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="text-[10px] font-mono px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300"
                            title="Module 1: Basic Stock Market (12 units)"
                          >
                            <span className="text-indigo-400 font-bold">M1:</span>{' '}
                            {user.module1Progress?.completed || 0}/12
                          </span>
                          <span
                            className="text-[10px] font-mono px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300"
                            title="Module 2: Intermediate Stock Market (14 units)"
                          >
                            <span className="text-amber-400 font-bold">M2:</span>{' '}
                            {user.module2Progress?.completed || 0}/14
                          </span>
                          <span
                            className="text-[10px] font-mono px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300"
                            title="Module 3: Advance Stock Market (16 units)"
                          >
                            <span className="text-emerald-400 font-bold">M3:</span>{' '}
                            {user.module3Progress?.completed || 0}/16
                          </span>
                        </div>
                      </td>

                      {/* Net Worth & Trades */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-white font-mono text-xs sm:text-sm">
                            ₹{user.netWorth.toLocaleString()}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span>{user.totalTrades} trades</span>
                            <span>•</span>
                            <span
                              className={
                                user.realizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                              }
                            >
                              {user.realizedPnL >= 0 ? '+' : ''}₹{user.realizedPnL}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold transition-all border border-slate-700 hover:border-indigo-500 cursor-pointer"
                        >
                          Inspect
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* User Drill-down Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl">
                  {selectedUser.avatar || '👨‍🎓'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">{selectedUser.name}</h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {selectedUser.role}
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Level {selectedUser.level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {selectedUser.email} • ID: {selectedUser.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* High Level Stats Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">
                    Course Progress
                  </span>
                  <div className="text-xl font-black text-indigo-400 mt-0.5">
                    {selectedUser.courseProgressPercent}%
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {selectedUser.completedTopicsCount} of {selectedUser.totalTopicsCount} Topics
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">
                    Net Worth
                  </span>
                  <div className="text-xl font-black text-emerald-400 mt-0.5">
                    ₹{selectedUser.netWorth.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Cash: ₹{selectedUser.virtualCash.toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">
                    Simulated Trades
                  </span>
                  <div className="text-xl font-black text-cyan-300 mt-0.5">
                    {selectedUser.totalTrades}
                  </div>
                  <div className="text-[11px] text-slate-400">Win Rate: {selectedUser.winRate}%</div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">
                    Total XP
                  </span>
                  <div className="text-xl font-black text-amber-400 mt-0.5">
                    {selectedUser.xp.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Last active: {new Date(selectedUser.lastActive).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* 3 Modules Detailed Progression */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  3-Module Syllabus Completion Breakdown
                </h4>

                <div className="space-y-3">
                  {/* Module 1 */}
                  <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center justify-center">
                          1
                        </span>
                        <span className="font-bold text-white text-sm">
                          Module 1: Basic Stock Market
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-400">
                        {selectedUser.module1Progress?.completed || 0} / 12 Units (
                        {selectedUser.module1Progress?.percent || 0}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all"
                        style={{ width: `${selectedUser.module1Progress?.percent || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Module 2 */}
                  <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-center">
                          2
                        </span>
                        <span className="font-bold text-white text-sm">
                          Module 2: Intermediate Stock Market
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {selectedUser.module2Progress?.completed || 0} / 14 Units (
                        {selectedUser.module2Progress?.percent || 0}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${selectedUser.module2Progress?.percent || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Module 3 */}
                  <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center justify-center">
                          3
                        </span>
                        <span className="font-bold text-white text-sm">
                          Module 3: Advance Stock Market
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {selectedUser.module3Progress?.completed || 0} / 16 Units (
                        {selectedUser.module3Progress?.percent || 0}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${selectedUser.module3Progress?.percent || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Classrooms & Activities */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-400" />
                  Enrolled Classrooms ({selectedUser.classrooms?.length || 0})
                </h4>

                {selectedUser.classrooms && selectedUser.classrooms.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedUser.classrooms.map((cls) => (
                      <div
                        key={cls.id}
                        className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{cls.name}</p>
                          <p className="text-[11px] font-mono text-slate-400">Code: {cls.code}</p>
                        </div>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                          Member
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-950/40 border border-slate-800/60 rounded-lg p-3 text-center text-xs text-slate-400">
                    Not currently enrolled in any teacher cohort or classroom.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                Learner record active in database
              </span>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close Inspect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
