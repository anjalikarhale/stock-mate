import React, { useState } from 'react';
import {
  TrendingUp,
  Home,
  BookOpen,
  Gamepad2,
  LineChart,
  PieChart,
  User,
  Volume2,
  VolumeX,
  LogOut,
  Flame,
  Zap,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useClassroom } from '../../context/ClassroomContext';
import { AppMode } from '../../types';

interface StudentNavbarProps {
  currentTab: AppMode;
  onSelectTab: (tab: AppMode) => void;
}

export const StudentNavbar: React.FC<StudentNavbarProps> = ({ currentTab, onSelectTab }) => {
  const { profile, soundOn, toggleSound } = useGame();
  const { currentUser, logout, studentProfile } = useClassroom();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // User stats (prioritize server persistent profile)
  const userXp = studentProfile?.xp ?? currentUser?.xp ?? profile.xp ?? 720;
  const userLevel = studentProfile?.level ?? currentUser?.level ?? profile.level ?? 7;
  const userStreak = 5; // Day streak
  const displayName = currentUser?.name || profile.username || 'Student Trader';
  const displayAvatar = currentUser?.avatar || profile.avatar || '⚡';

  const desktopNavItems: { id: AppMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'HOME', label: 'Home', icon: Home },
    { id: 'LEARN', label: 'Learn', icon: BookOpen },
    { id: 'PLAY', label: 'Play', icon: Gamepad2 },
    { id: 'TRADE', label: 'Trade', icon: LineChart },
    { id: 'PORTFOLIO', label: 'Portfolio', icon: PieChart },
    { id: 'PROFILE', label: 'Profile', icon: User },
  ];

  const mobileNavItems: { id: AppMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'HOME', label: 'Home', icon: Home },
    { id: 'LEARN', label: 'Learn', icon: BookOpen },
    { id: 'PLAY', label: 'Play', icon: Gamepad2 },
    { id: 'TRADE', label: 'Trade', icon: LineChart },
    { id: 'PROFILE', label: 'Profile', icon: User },
  ];

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }
  };

  return (
    <>
      {/* Top Desktop & Mobile Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: STOCKMATE Brand Logo */}
          <button
            onClick={() => onSelectTab('HOME')}
            className="flex items-center gap-2.5 group focus:outline-none cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="text-left">
              <span className="font-black text-lg tracking-wider bg-gradient-to-r from-emerald-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                STOCKMATE
              </span>
            </div>
          </button>

          {/* Desktop Navigation: Home | Learn | Play | Trade | Portfolio | Profile */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 bg-slate-900/60 p-1 rounded-2xl border border-slate-800/80">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentTab === item.id ||
                (item.id === 'LEARN' && (currentTab === 'JOURNEY' as any)) ||
                (item.id === 'PLAY' && (currentTab === 'PRACTICE' as any || currentTab === 'FREE' as any));

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs lg:text-sm flex items-center gap-2 transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Side: Level, XP, Streak, Avatar & User Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Level Badge */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-indigo-500/30 px-2.5 py-1 rounded-xl shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">LVL</span>
              <span className="text-xs sm:text-sm font-black text-white">{userLevel}</span>
            </div>

            {/* XP Pill */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-emerald-500/30 px-2.5 py-1 rounded-xl shadow-sm">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs sm:text-sm font-black text-emerald-300 font-mono">{userXp}</span>
              <span className="text-[10px] font-bold text-slate-400 hidden xs:inline">XP</span>
            </div>

            {/* Streak Pill */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 border border-amber-500/30 px-2.5 py-1 rounded-xl shadow-sm">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs sm:text-sm font-black text-amber-300 font-mono">{userStreak}</span>
              <span className="text-[10px] font-bold text-slate-400">D</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={soundOn ? 'Sound FX On' : 'Sound FX Muted'}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer hidden sm:block"
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* User Dropdown / Profile Avatar */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer focus:outline-none"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-900 to-slate-900 border border-indigo-500/40 flex items-center justify-center text-sm">
                  {displayAvatar}
                </div>
                <span className="text-xs font-bold text-slate-200 hidden md:inline max-w-[90px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                    <p className="text-xs font-black text-white truncate">{displayName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{currentUser?.email || 'student@stockmate.edu'}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Verified Student
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onSelectTab('PROFILE');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>View Profile & History</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onSelectTab('PORTFOLIO');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <PieChart className="w-3.5 h-3.5 text-emerald-400" />
                    <span>My Portfolio</span>
                  </button>

                  <div className="border-t border-slate-800/80 my-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar: Home | Learn | Play | Trade | Profile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/90 px-2 py-1.5 flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentTab === item.id ||
            (item.id === 'LEARN' && (currentTab === 'JOURNEY' as any)) ||
            (item.id === 'PLAY' && (currentTab === 'PRACTICE' as any || currentTab === 'FREE' as any));

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-indigo-400 font-black'
                  : 'text-slate-400 font-medium hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400 scale-110' : ''}`} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
