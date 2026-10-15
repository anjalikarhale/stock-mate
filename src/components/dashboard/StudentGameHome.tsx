import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  CheckCircle2,
  Lock,
  ArrowRight,
  GraduationCap,
  Flame,
  Award,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Target,
  Compass,
  Gamepad2,
  Clock,
  Coins,
  Briefcase,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useClassroom } from '../../context/ClassroomContext';
import { BEGINNER_MISSIONS } from '../../data/missionsData';
import { AppMode } from '../../types';
import { soundEffects } from '../../utils/audio';

interface StudentGameHomeProps {
  onNavigateTab: (tab: AppMode) => void;
  onLaunchMission: (missionId: string) => void;
}

interface JourneyNode {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: string;
  missionId: string;
  category: string;
  xpReward: number;
}

const JOURNEY_NODES: JourneyNode[] = [
  {
    id: 'node_basics',
    number: 1,
    title: 'Market Basics',
    subtitle: 'Saving vs Investing & Capital Growth',
    icon: '🌱',
    missionId: 'm1_financial_foundations',
    category: 'INVESTING_BASICS',
    xpReward: 100,
  },
  {
    id: 'node_stocks',
    number: 2,
    title: 'Stocks & Ownership',
    subtitle: 'What is a share & Market Supply/Demand',
    icon: '📈',
    missionId: 'm2_what_is_a_stock',
    category: 'STOCKS',
    xpReward: 120,
  },
  {
    id: 'node_charts',
    number: 3,
    title: 'Charts & Candlesticks',
    subtitle: 'Green vs Red bodies, wicks, & price trends',
    icon: '📊',
    missionId: 'm9_candlestick_anatomy',
    category: 'CANDLESTICKS',
    xpReward: 150,
  },
  {
    id: 'node_technical',
    number: 4,
    title: 'Technical Analysis',
    subtitle: 'Support, Resistance & Breakout zones',
    icon: '🎯',
    missionId: 'm10_support_resistance',
    category: 'SUPPORT_RESISTANCE',
    xpReward: 180,
  },
  {
    id: 'node_fundamental',
    number: 5,
    title: 'Fundamental Analysis',
    subtitle: 'P/E ratio, Earnings & Balance sheets',
    icon: '🔎',
    missionId: 'm5_market_cap_sectors',
    category: 'INVESTING_BASICS',
    xpReward: 150,
  },
  {
    id: 'node_risk',
    number: 6,
    title: 'Risk Management',
    subtitle: 'Stop-Loss rules & Capital preservation',
    icon: '🛡',
    missionId: 'm6_first_loss_risk_mgmt',
    category: 'RISK',
    xpReward: 200,
  },
  {
    id: 'node_portfolio',
    number: 7,
    title: 'Portfolio Building',
    subtitle: 'Diversification & Asset allocation',
    icon: '💼',
    missionId: 'm7_volatility_ride',
    category: 'PORTFOLIO',
    xpReward: 200,
  },
  {
    id: 'node_advanced',
    number: 8,
    title: 'Advanced Trading',
    subtitle: 'Trading psychology, FOMO & Execution',
    icon: '⚡',
    missionId: 'm4_first_trade',
    category: 'TRADING',
    xpReward: 250,
  },
];

export const StudentGameHome: React.FC<StudentGameHomeProps> = ({
  onNavigateTab,
  onLaunchMission,
}) => {
  const { profile, startMission, setActiveGame } = useGame();
  const { currentUser, studentProfile, activeClassroom, joinClassroomByCode } = useClassroom();

  const [classCodeInput, setClassCodeInput] = useState('');
  const [joinStatus, setJoinStatus] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Dynamic user data
  const studentName = currentUser?.name?.split(' ')[0] || profile.username || 'Trader';
  const userXp = studentProfile?.xp ?? currentUser?.xp ?? profile.xp ?? 720;
  const userLevel = studentProfile?.level ?? currentUser?.level ?? profile.level ?? 7;

  // Next level threshold calculation
  const xpForCurrentLevel = (userLevel - 1) * 300;
  const xpForNextLevel = userLevel * 300 + 100;
  const xpInLevel = Math.max(0, userXp - xpForCurrentLevel);
  const xpNeeded = Math.max(100, xpForNextLevel - xpForCurrentLevel);
  const xpProgressPercent = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));

  // Determine current active mission
  const completedMissionIds = profile.completedMissions || [];
  const currentMissionIndex = BEGINNER_MISSIONS.findIndex(
    (m) => !completedMissionIds.includes(m.id)
  );
  const activeMission =
    currentMissionIndex !== -1
      ? BEGINNER_MISSIONS[currentMissionIndex]
      : BEGINNER_MISSIONS[BEGINNER_MISSIONS.length - 1];

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 17) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  const handleContinueJourney = () => {
    soundEffects.click();
    if (activeMission) {
      onLaunchMission(activeMission.id);
    }
  };

  const handleQuickJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCodeInput.trim()) return;
    setIsJoining(true);
    setJoinStatus(null);
    try {
      const res = await joinClassroomByCode(classCodeInput.trim().toUpperCase());
      if (res.success) {
        soundEffects.levelUp();
        onNavigateTab('CLASSROOM');
      } else {
        setJoinStatus(res.message || 'Invalid classroom code. Check with your teacher.');
      }
    } catch (err: any) {
      setJoinStatus(err.message || 'Unable to join classroom.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fadeIn">
      {/* ==================================================================== */}
      {/* 1. VISUALLY STRONG HERO SECTION                                      */}
      {/* ==================================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        {/* Glow backdrop effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs sm:text-sm font-black tracking-widest text-indigo-400 uppercase">
                {getGreeting()}, {studentName.toUpperCase()} 👋
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-0.5">
                Your Market Journey
              </h1>
            </div>

            <div className="inline-flex items-center gap-2 self-start sm:self-center px-3.5 py-1.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black tracking-wider">LEVEL {userLevel}</span>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="space-y-2 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Level {userLevel} Progress
              </span>
              <span className="font-mono font-black text-emerald-400">
                {userXp} / {xpForNextLevel} XP
              </span>
            </div>

            {/* Custom Bar with Glow */}
            <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-700 shadow-md shadow-emerald-500/30"
                style={{ width: `${Math.max(12, xpProgressPercent)}%` }}
              />
            </div>

            <p className="text-xs text-slate-400 italic pt-1">
              "You're getting closer to becoming a Market Explorer."
            </p>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleContinueJourney}
              className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>CONTINUE JOURNEY</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateTab('LEARN')}
              className="py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-sm border border-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Explore Skill Tree</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. CURRENT MISSION CARD                                              */}
      {/* ==================================================================== */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                CURRENT MISSION
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Mission {activeMission ? activeMission.number : 1}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white">
              "{activeMission ? activeMission.title : 'Understand Support & Resistance'}"
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {activeMission
                ? activeMission.subtitle
                : 'Identify key price floor and ceiling levels to predict breakout momentum.'}
            </p>

            {/* Visual Progress Dots: ●●●○○ */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-bold text-slate-400">Progress:</span>
              <div className="flex items-center gap-1.5 text-base">
                <span className="text-emerald-400 font-bold">●</span>
                <span className="text-emerald-400 font-bold">●</span>
                <span className="text-emerald-400 font-bold">●</span>
                <span className="text-slate-600 font-bold">○</span>
                <span className="text-slate-600 font-bold">○</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold ml-1">
                +{activeMission ? activeMission.xpReward : 150} XP
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center">
            <button
              onClick={() => {
                soundEffects.click();
                if (activeMission) onLaunchMission(activeMission.id);
              }}
              className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>CONTINUE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. CLASSROOM ACTIVITY QUICK ACCESS BANNER                           */}
      {/* ==================================================================== */}
      <section className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                CLASSROOM LIVE ARENA
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-black text-white">
              {activeClassroom ? `Enrolled in: ${activeClassroom.name}` : 'StockMate Market Challenge'}
            </h4>
            <p className="text-xs text-slate-300">
              {activeClassroom
                ? `Teacher: ${activeClassroom.teacherName || 'Instructor'} • Code: ${activeClassroom.code}`
                : 'Enter your teacher’s 6-character code to join live synchronized class battles.'}
            </p>
          </div>

          {activeClassroom ? (
            <button
              onClick={() => onNavigateTab('CLASSROOM')}
              className="py-2.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter Classroom Activity</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <form onSubmit={handleQuickJoinClass} className="flex items-center gap-2">
              <input
                type="text"
                value={classCodeInput}
                onChange={(e) => setClassCodeInput(e.target.value.toUpperCase())}
                placeholder="Code (e.g. ABC123)"
                maxLength={8}
                className="bg-slate-950 border border-slate-700 text-white font-mono uppercase px-3.5 py-2 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-400 w-36 sm:w-40"
              />
              <button
                type="submit"
                disabled={isJoining || !classCodeInput.trim()}
                className="py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                {isJoining ? 'Joining...' : 'Join'}
              </button>
            </form>
          )}
        </div>
        {joinStatus && (
          <p className="text-xs text-rose-400 mt-2 font-medium">{joinStatus}</p>
        )}
      </section>

      {/* ==================================================================== */}
      {/* 4. FEATURED REAL-TIME MARKET SIMULATORS & GAMES                     */}
      {/* ==================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                PLAYABLE SIMULATIONS
              </span>
            </div>
            <h3 className="text-xl font-black text-white mt-1">Interactive Trading & Game Arenas</h3>
          </div>
          <button
            onClick={() => onNavigateTab('PLAY')}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <span>View All Arenas</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Price Direction Duel */}
          <div
            onClick={() => {
              soundEffects.click();
              setActiveGame('price-prediction');
            }}
            className="group cursor-pointer p-5 rounded-2xl bg-gradient-to-b from-amber-950/40 to-slate-900 border border-amber-500/30 hover:border-amber-400 shadow-xl transition-all hover:scale-[1.02] flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">⏱️</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  10s DUEL
                </span>
              </div>
              <h4 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                Price Direction Duel
              </h4>
              <p className="text-xs text-slate-300 line-clamp-2">
                Predict whether stocks explode UP or crash DOWN under a 10s timer before market movement reveals!
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-bold text-amber-400">
              <span>Play Speed Round</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 2: Live Paper Trading Terminal */}
          <div
            onClick={() => {
              soundEffects.click();
              onNavigateTab('TRADE');
            }}
            className="group cursor-pointer p-5 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-slate-900 border border-emerald-500/30 hover:border-emerald-400 shadow-xl transition-all hover:scale-[1.02] flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">📊</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  LIVE NSE PAPER
                </span>
              </div>
              <h4 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors">
                Paper Trading Terminal
              </h4>
              <p className="text-xs text-slate-300 line-clamp-2">
                Trade real simulated NSE stocks with ₹1,00,000 cash, candlestick charts, and stop-loss orders.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Open Terminal</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 3: Portfolio Tycoon */}
          <div
            onClick={() => {
              soundEffects.click();
              setActiveGame('portfolio-tycoon');
            }}
            className="group cursor-pointer p-5 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-500/30 hover:border-indigo-400 shadow-xl transition-all hover:scale-[1.02] flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">💼</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  TYCOON SIM
                </span>
              </div>
              <h4 className="text-base font-black text-white group-hover:text-indigo-300 transition-colors">
                Portfolio Tycoon
              </h4>
              <p className="text-xs text-slate-300 line-clamp-2">
                Manage a ₹5,00,000 portfolio across sectors, navigate macro shocks, and beat NIFTY 50!
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-bold text-indigo-400">
              <span>Allocate Capital</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 4: Candlestick Combat */}
          <div
            onClick={() => {
              soundEffects.click();
              setActiveGame('candlestick-combat');
            }}
            className="group cursor-pointer p-5 rounded-2xl bg-gradient-to-b from-rose-950/40 to-slate-900 border border-rose-500/30 hover:border-rose-400 shadow-xl transition-all hover:scale-[1.02] flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">⚔️</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                  BATTLE ARENA
                </span>
              </div>
              <h4 className="text-base font-black text-white group-hover:text-rose-300 transition-colors">
                Candlestick Combat
              </h4>
              <p className="text-xs text-slate-300 line-clamp-2">
                Defeat boss algorithms by identifying hammer, doji, and engulfing candlestick setups under fire.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-bold text-rose-400">
              <span>Enter Combat</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. "YOUR MARKET JOURNEY" VISUAL PROGRESSION SAGA MAP                */}
      {/* ==================================================================== */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
            <Target className="w-3.5 h-3.5" />
            <span>PROGRESSION MAP</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            YOUR MARKET JOURNEY
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Ascend through the 8 stages of market literacy. Master each level to unlock advanced trading capabilities.
          </p>
        </div>

        {/* Visual Map Timeline */}
        <div className="relative max-w-xl mx-auto py-4">
          {/* Connecting vertical path line */}
          <div className="absolute left-7 sm:left-10 top-8 bottom-8 w-1 bg-gradient-to-b from-emerald-500 via-indigo-500 to-slate-800 rounded-full pointer-events-none" />

          <div className="space-y-6 relative">
            {JOURNEY_NODES.map((node, index) => {
              // Node state logic: completed if index < completedCount, current if index === completedCount, locked if index > completedCount
              const isCompleted = index < completedMissionIds.length;
              const isCurrent = index === completedMissionIds.length;
              const isLocked = index > completedMissionIds.length;

              return (
                <div
                  key={node.id}
                  className={`relative flex items-start gap-4 sm:gap-6 p-4 sm:p-5 rounded-3xl border transition-all duration-300 ${
                    isCurrent
                      ? 'bg-gradient-to-r from-indigo-950/80 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10 scale-[1.02]'
                      : isCompleted
                      ? 'bg-slate-900/80 border-emerald-500/30 hover:border-emerald-500/60'
                      : 'bg-slate-950/60 border-slate-800/80 opacity-70'
                  }`}
                >
                  {/* Node Avatar Orb */}
                  <div className="relative shrink-0">
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-lg transition-transform ${
                        isCurrent
                          ? 'bg-gradient-to-tr from-indigo-600 to-cyan-500 ring-4 ring-indigo-500/30 text-white animate-pulse'
                          : isCompleted
                          ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 ring-2 ring-emerald-500/40 text-white'
                          : 'bg-slate-900 border border-slate-800 text-slate-500'
                      }`}
                    >
                      {node.icon}
                    </div>

                    {/* Status Badge in corner */}
                    <div className="absolute -bottom-1 -right-1">
                      {isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow">
                          <CheckCircle2 className="w-3.5 h-3.5 font-black stroke-[3]" />
                        </div>
                      ) : isCurrent ? (
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow animate-bounce">
                          <Play className="w-2.5 h-2.5 fill-slate-950" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-700">
                          <Lock className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Node Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        STAGE {node.number}
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Completed • +{node.xpReward} XP
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse">
                          Active Quest
                        </span>
                      )}
                      {isLocked && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          Locked
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-white truncate">
                      {node.title}
                    </h3>

                    <p className="text-xs text-slate-300 line-clamp-2">
                      {node.subtitle}
                    </p>

                    {/* Action button */}
                    <div className="pt-2">
                      {isCurrent ? (
                        <button
                          onClick={() => {
                            soundEffects.click();
                            onLaunchMission(node.missionId);
                          }}
                          className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Start Stage</span>
                        </button>
                      ) : isCompleted ? (
                        <button
                          onClick={() => {
                            soundEffects.click();
                            onLaunchMission(node.missionId);
                          }}
                          className="px-3.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Review Stage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>Complete Stage {node.number - 1} to unlock</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
