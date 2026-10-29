import React, { useEffect, useState, useCallback } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { ClassroomProvider, useClassroom } from './context/ClassroomContext';
import { StudentNavbar } from './components/layout/StudentNavbar';
import { StudentGameHome } from './components/dashboard/StudentGameHome';
import { StudentLearnHub } from './components/learn/StudentLearnHub';
import { StudentPlayArcade } from './components/arcade/StudentPlayArcade';
import { StudentPortfolioView } from './components/portfolio/StudentPortfolioView';
import { StudentProfileView } from './components/profile/StudentProfileView';
import { MissionRunner } from './components/missions/MissionRunner';
import { PricePredictionGame } from './components/games/PricePredictionGame';
import { PortfolioTycoonGame } from './components/games/PortfolioTycoonGame';
import { CandlestickCombat } from './components/games/CandlestickCombat';
import { ChartDetective } from './components/games/ChartDetective';
import { MarketCrashGame } from './components/games/MarketCrashGame';
import { TraderFiArenaGame } from './components/games/TraderFiArenaGame';
import { TradingTerminal } from './components/trading/TradingTerminal';
import { ClassroomHub } from './components/classroom/ClassroomHub';
import { SimpleTeacherDashboard } from './components/classroom/SimpleTeacherDashboard';
import { StockMateAuth } from './components/auth/StockMateAuth';
import { LeaderboardModal } from './components/leaderboard/LeaderboardModal';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminPortal } from './components/admin/AdminPortal';
import { Sparkles, Bot, Shield } from 'lucide-react';
import { soundEffects } from './utils/audio';
import { AppMode } from './types';

const AppContent: React.FC = () => {
  const {
    profile,
    activeGame,
    activeMissionId,
    setAppMode,
    setActiveGame,
    setActiveMissionId,
    startMission,
  } = useGame();

  const { currentUser, isAuthenticated } = useClassroom();

  // Admin Portal State
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.toLowerCase().startsWith('/admin');
    }
    return false;
  });

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('stockmate_admin_token');
    }
    return null;
  });

  const [adminUser, setAdminUser] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('stockmate_admin_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const handleAdminSuccess = (user: any, token: string) => {
    setAdminUser(user);
    setAdminToken(token);
    setIsAdminRoute(true);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/admin');
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('stockmate_admin_token');
    localStorage.removeItem('stockmate_admin_user');
    setAdminUser(null);
    setAdminToken(null);
  };

  const handleNavigateToAdmin = () => {
    setIsAdminRoute(true);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/admin');
    }
  };

  const handleBackFromAdmin = () => {
    setIsAdminRoute(false);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }
  };

  // Parse direct classroom join query params
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const joinParam = searchParams?.get('join') || searchParams?.get('code') || searchParams?.get('class');

  // Detect path for tab mapping
  const getTabFromPath = useCallback((pathname: string): AppMode => {
    const lower = pathname.toLowerCase();
    if (lower.includes('/learn')) return 'LEARN';
    if (lower.includes('/play') || lower.includes('/practice')) return 'PLAY';
    if (lower.includes('/trade')) return 'TRADE';
    if (lower.includes('/portfolio')) return 'PORTFOLIO';
    if (lower.includes('/profile')) return 'PROFILE';
    if (lower.includes('/classroom')) return 'CLASSROOM';
    return 'HOME';
  }, []);

  // Handle active student tab
  const [currentTab, setCurrentTab] = useState<AppMode>(() => {
    if (typeof window !== 'undefined') {
      return getTabFromPath(window.location.pathname);
    }
    return 'HOME';
  });

  // Switch student tab and sync browser URL history
  const handleSelectTab = useCallback(
    (tab: AppMode) => {
      // Clear active mini-games/missions when switching tabs
      setActiveGame(null);
      setActiveMissionId(null);
      setCurrentTab(tab);
      setAppMode(tab);

      if (typeof window !== 'undefined') {
        const pathMap: Record<string, string> = {
          HOME: '/student/dashboard',
          LEARN: '/student/learn',
          PLAY: '/student/play',
          TRADE: '/student/trade',
          PORTFOLIO: '/student/portfolio',
          PROFILE: '/student/profile',
          CLASSROOM: '/student/classroom',
        };
        const targetPath = pathMap[tab] || '/student/dashboard';
        if (window.location.pathname !== targetPath) {
          window.history.pushState({ tab }, '', targetPath);
        }
      }
    },
    [setActiveGame, setActiveMissionId, setAppMode]
  );

  // Handle browser back / forward buttons (popstate)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/admin')) {
        setIsAdminRoute(true);
        return;
      } else {
        setIsAdminRoute(false);
      }

      if (!isAuthenticated || !currentUser) return;

      if (currentUser.role === 'TEACHER') {
        if (!path.startsWith('/teacher')) {
          window.history.replaceState({}, '', '/teacher/dashboard');
        }
      } else if (currentUser.role === 'STUDENT') {
        if (path.startsWith('/teacher')) {
          // Block teacher path and redirect to student dashboard
          window.history.replaceState({}, '', '/student/dashboard');
          setCurrentTab('HOME');
          setAppMode('HOME');
        } else {
          const tab = getTabFromPath(path);
          setCurrentTab(tab);
          setAppMode(tab);
          setActiveGame(null);
          setActiveMissionId(null);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated, currentUser, getTabFromPath, setActiveGame, setActiveMissionId, setAppMode]);

  // Synchronize browser URL based on user role and current route
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isAuthenticated || !currentUser) return;

    const path = window.location.pathname.toLowerCase();

    // 1. TEACHER: Enforce /teacher/dashboard
    if (currentUser.role === 'TEACHER') {
      if (!path.startsWith('/teacher')) {
        window.history.replaceState({}, '', '/teacher/dashboard');
      }
      return;
    }

    // 2. STUDENT: Block any teacher URLs and redirect to /student/dashboard
    if (currentUser.role === 'STUDENT') {
      if (path.startsWith('/teacher')) {
        window.history.replaceState({}, '', '/student/dashboard');
        setCurrentTab('HOME');
        setAppMode('HOME');
      } else if (
        path === '/' ||
        path === '/login' ||
        path === '/signup' ||
        path === '/student' ||
        path === '/dashboard'
      ) {
        window.history.replaceState({}, '', '/student/dashboard');
      }
    }
  }, [isAuthenticated, currentUser, setAppMode]);

  // Handle direct classroom join parameter
  useEffect(() => {
    if (joinParam && isAuthenticated && currentUser?.role === 'STUDENT') {
      handleSelectTab('CLASSROOM');
    }
  }, [joinParam, isAuthenticated, currentUser, handleSelectTab]);

  // =========================================================================
  // 0. ADMIN PORTAL ROUTE: Dedicated Administrator Control Hub (NO SIGN UP)
  // =========================================================================
  if (isAdminRoute) {
    if (adminUser && adminToken) {
      return (
        <AdminPortal
          adminUser={adminUser}
          token={adminToken}
          onLogout={handleAdminLogout}
          onSwitchToStudentView={handleBackFromAdmin}
        />
      );
    }
    return (
      <AdminLogin
        onSuccess={handleAdminSuccess}
        onBackToApp={handleBackFromAdmin}
      />
    );
  }

  // =========================================================================
  // 1. PUBLIC LANDING PAGE: Anyone opening URL sees StockMate Welcome Portal
  // =========================================================================
  if (!isAuthenticated || !currentUser) {
    return (
      <StockMateAuth
        pendingClassroomCode={joinParam || undefined}
        onNavigateToAdmin={handleNavigateToAdmin}
      />
    );
  }

  // =========================================================================
  // 2. TEACHER DASHBOARD: Dedicated teacher view with strict role enforcement
  // =========================================================================
  if (currentUser.role === 'TEACHER') {
    return <SimpleTeacherDashboard />;
  }

  // =========================================================================
  // 3. STUDENT PORTAL: Redesigned gamified student learning & trading game
  // =========================================================================
  const renderActiveScreen = () => {
    // If an interactive mission is in progress
    if (activeMissionId) {
      return <MissionRunner />;
    }

    // If an arcade mini-game is in progress
    switch (activeGame) {
      case 'price-prediction':
      case 'market-replay':
        return <PricePredictionGame />;
      case 'portfolio-tycoon':
      case 'portfolio-tetris':
        return <PortfolioTycoonGame />;
      case 'candlestick-combat':
        return <CandlestickCombat />;
      case 'chart-detective':
        return <ChartDetective />;
      case 'market-crash':
        return <MarketCrashGame />;
      case 'traderfi-arena':
      case 'tournament-lobby':
        return <TraderFiArenaGame />;
      case 'trading-terminal':
        return <TradingTerminal />;
      default:
        // Render current student tab
        switch (currentTab) {
          case 'HOME':
            return (
              <StudentGameHome
                onNavigateTab={handleSelectTab}
                onLaunchMission={(mId) => startMission(mId)}
              />
            );
          case 'LEARN':
            return (
              <StudentLearnHub
                onLaunchMission={(mId) => startMission(mId)}
              />
            );
          case 'PLAY':
            return (
              <StudentPlayArcade
                onSelectGame={(gId) => setActiveGame(gId)}
              />
            );
          case 'TRADE':
            return <TradingTerminal />;
          case 'PORTFOLIO':
            return (
              <StudentPortfolioView
                onNavigateToTrade={() => handleSelectTab('TRADE')}
              />
            );
          case 'PROFILE':
            return <StudentProfileView />;
          case 'CLASSROOM':
            return <ClassroomHub />;
          default:
            return (
              <StudentGameHome
                onNavigateTab={handleSelectTab}
                onLaunchMission={(mId) => startMission(mId)}
              />
            );
        }
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans">
      <StudentNavbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderActiveScreen()}
      </main>

      {/* Global Modals */}
      <LeaderboardModal />

      {/* Footer */}
      <footer className="border-t border-slate-900/80 bg-slate-950/90 py-5 text-center text-xs text-slate-400 mb-14 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-bold text-slate-300 tracking-wide">
            STOCKMATE — Gamified Financial Market Learning & Trading Arena
          </p>
          <p className="text-[11px] text-slate-400">
            Interactive candlestick mechanics, paper trading terminal, and classroom market challenges. All funds are simulated.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleNavigateToAdmin}
              className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-amber-300 font-medium transition-colors cursor-pointer"
            >
              <Shield className="w-3 h-3 text-amber-400/80" />
              Administrator Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <ClassroomProvider>
        <AppContent />
      </ClassroomProvider>
    </GameProvider>
  );
}
