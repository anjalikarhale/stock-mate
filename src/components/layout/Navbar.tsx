import React from 'react';
import {
  TrendingUp,
  Home,
  BookOpen,
  Gamepad2,
  GraduationCap,
  User,
  Volume2,
  VolumeX,
  LogOut,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useClassroom } from '../../context/ClassroomContext';

export const Navbar: React.FC = () => {
  const {
    profile,
    soundOn,
    toggleSound,
    setProfileModalOpen,
    setActiveGame,
    setActiveMissionId,
    setAppMode,
  } = useGame();

  const { currentUser, logout, studentProfile } = useClassroom();

  const currentTab = profile.appMode || 'HOME';

  const navigateTo = (tab: 'HOME' | 'LEARN' | 'PRACTICE' | 'CLASSROOM') => {
    setActiveGame(null);
    setActiveMissionId(null);
    setAppMode(tab);
    if (typeof window !== 'undefined') {
      const pathMap: Record<string, string> = {
        HOME: '/dashboard',
        LEARN: '/learn',
        PRACTICE: '/practice',
        CLASSROOM: '/classroom',
      };
      const newPath = pathMap[tab] || '/dashboard';
      if (window.location.pathname !== newPath) {
        window.history.pushState({ tab }, '', newPath);
      }
    }
  };

  const navItems = [
    { id: 'HOME', label: 'Home', icon: Home },
    { id: 'LEARN', label: 'Learn', icon: BookOpen },
    { id: 'PRACTICE', label: 'Practice', icon: Gamepad2 },
    { id: 'CLASSROOM', label: 'Classroom', icon: GraduationCap },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <button
          onClick={() => navigateTo('HOME')}
          className="flex items-center gap-2.5 group focus:outline-none cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="text-left">
            <span className="font-black text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
              STOCKMATE
            </span>
          </div>
        </button>

        {/* Center: Simplified 5-Item Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentTab === item.id ||
              (item.id === 'LEARN' && currentTab === 'JOURNEY') ||
              (item.id === 'PRACTICE' && currentTab === 'FREE');

            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id as any)}
                className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden xs:inline sm:inline">{item.label}</span>
              </button>
            );
          })}

          {/* Profile Item */}
          <button
            onClick={() => setProfileModalOpen(true)}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-900 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <User className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">Profile</span>
          </button>
        </nav>

        {/* Right side: User info, Sound toggle & Logout button */}
        <div className="flex items-center gap-2">
          <div
            onClick={() => setProfileModalOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1 cursor-pointer hover:border-slate-700 transition-colors"
          >
            <span className="text-base">{currentUser?.avatar || profile.avatar || '👨‍🎓'}</span>
            <div className="text-left">
              <span className="text-xs font-bold text-slate-200 block leading-tight max-w-[100px] truncate">
                {currentUser?.name || profile.username}
              </span>
              <span className="text-[10px] text-amber-400 font-mono font-bold leading-none block">
                {studentProfile?.xp ?? currentUser?.xp ?? profile.xp} XP
              </span>
            </div>
          </div>

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={soundOn ? 'Sound On' : 'Muted'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={() => logout()}
            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-800/60 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
