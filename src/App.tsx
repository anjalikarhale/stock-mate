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
import {
  StockMarketGameRunner,
  STOCK_MARKET_8_GAMES,
} from './components/games/StockMarketGameSuite';
import { PricePredictionGame } from './components/games/PricePredictionGame';
import { PortfolioTycoonGame } from './components/games/PortfolioTycoonGame';
import { CandlestickCombat } from './components/games/CandlestickCombat';
import { ChartDetective } from './components/games/ChartDetective';
import { MarketCrashGame } from './components/games/MarketCrashGame';
import { TradingTerminal } from './components/trading/TradingTerminal';
import { ClassroomHub } from './components/classroom/ClassroomHub';
import { SimpleTeacherDashboard } from './components/classroom/SimpleTeacherDashboard';
import { StockMateAuth } from './components/auth/StockMateAuth';
import { LeaderboardModal } from './components/leaderboard/LeaderboardModal';
import { AIMentorModal } from './components/mentor/AIMentorModal';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminPortal } from './components/admin/AdminPortal';
import { Shield, AlertTriangle, RotateCcw } from 'lucide-react';
import { AppMode, EducationalGameId } from './types';

const EDUCATIONAL_GAME_IDS = new Set<string>(STOCK_MARKET_8_GAMES.map((g) => g.id));

const ReactComponent = React.Component as unknown as {
  new (props: { resetKey: string; children: React.ReactNode }): {
    props: { resetKey: string; children: React.ReactNode };
    state: { error: Error | null };
    setState(s: { error: Error | null }): void;
    componentDidUpdate?(prevProps: { resetKey: string }): void;
    render(): React.ReactNode;
  };
};

class ScreenErrorBoundary extends ReactComponent {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidUpdate(prevProps: { resetKey: string }) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-2xl bg-slate-900 border border-rose-500/40 p-8 text-center space-y-4 max-w-xl mx-auto my-8">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
          <h2 className="text-base font-black text-white">This view encountered an unexpected error</h2>
          <p className="text-xs text-slate-400 font-mono">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reload View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const {
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
  const searchParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const joinParam =
    searchParams?.get('join') || searchParams?.get('code') || searchParams?.get('class');

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
  }, [
    isAuthenticated,
    currentUser,
    getTabFromPath,
    setActiveGame,
    setActiveMissionId,
    setAppMode,
  ]);

  // Synchronize browser URL based on user role and current route
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isAuthenticated || !currentUser) return;

    const path = window.location.pathname.toLowerCase();

    if (currentUser.role === 'TEACHER') {
      if (!path.startsWith('/teacher')) {
        window.history.replaceState({}, '', '/teacher/dashboard');
      }
      return;
    }

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

  // 0. ADMIN PORTAL ROUTE
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

  // 1. PUBLIC LANDING PAGE
  if (!isAuthenticated || !currentUser) {
    return (
      <StockMateAuth
        pendingClassroomCode={joinParam || undefined}
        onNavigateToAdmin={handleNavigateToAdmin}
      />
    );
  }

  // 2. TEACHER DASHBOARD
  if (currentUser.role === 'TEACHER') {
    return <SimpleTeacherDashboard />;
  }

  // 3. STUDENT PORTAL
  const renderActiveScreen = () => {
    if (activeMissionId) {
      return <MissionRunner />;
    }

    // 8 Curriculum Stock-Market Educational Games
    if (activeGame && EDUCATIONAL_GAME_IDS.has(activeGame)) {
      return (
        <StockMarketGameRunner
          gameId={activeGame as EducationalGameId}
          onExit={() => setActiveGame(null)}
          onNavigateTab={handleSelectTab}
        />
      );
    }

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
      case 'trading-terminal':
        return <TradingTerminal />;
      default:
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
                onNavigateTab={handleSelectTab}
              />
            );
          case 'PLAY':
            return (
              <StudentPlayArcade
                onSelectGame={(gId) => setActiveGame(gId)}
                onNavigateTab={handleSelectTab}
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
        <ScreenErrorBoundary resetKey={`${currentTab}-${activeGame || ''}-${activeMissionId || ''}`}>
          {renderActiveScreen()}
        </ScreenErrorBoundary>
      </main>

      {/* Non-Blocking Compact Floating AI Mentor + Leaderboard Modal */}
      <AIMentorModal />
      <LeaderboardModal />

      {/* Footer */}
      <footer className="border-t border-slate-900/80 bg-slate-950/90 py-5 text-center text-xs text-slate-400 mb-14 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-bold text-slate-300 tracking-wide">
            STOCKMATE — Indian Stock Market (NSE/BSE) Learning, Paper Trading &amp; Classroom System
          </p>
          <p className="text-[11px] text-slate-400">
            Educational simulator only. No investment advice or stock recommendations. All cash, equities, and F&amp;O positions are simulated.
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
    <ClassroomProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </ClassroomProvider>
  );
}
