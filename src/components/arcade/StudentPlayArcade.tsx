import React, { useState } from 'react';
import {
  Flame,
  Search,
  TrendingDown,
  TrendingUp,
  LineChart,
  ArrowRight,
  Sparkles,
  Trophy,
  Zap,
  Play,
  Gamepad2,
  Clock,
  Coins,
  ShieldCheck,
  Gift,
  HelpCircle,
  Users,
  Compass,
  Award,
} from 'lucide-react';
import { GameId } from '../../types';
import { useGame } from '../../context/GameContext';
import { soundEffects } from '../../utils/audio';
import { TraderFiWelcomeModal } from '../games/TraderFiWelcomeModal';
import { TraderFiHowToPlayModal } from '../games/TraderFiHowToPlayModal';
import { TraderFiTournamentLobbyModal, TOURNAMENT_TIERS, TournamentTier } from '../games/TraderFiTournamentLobbyModal';

interface StudentPlayArcadeProps {
  onSelectGame: (gameId: GameId) => void;
}

export const StudentPlayArcade: React.FC<StudentPlayArcadeProps> = ({ onSelectGame }) => {
  const { profile, addTraderFiTokens } = useGame();

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);
  const [showTournamentLobby, setShowTournamentLobby] = useState(false);
  const [tokenNotice, setTokenNotice] = useState<string | null>(null);

  const currentTokens = profile.traderFiTokens ?? 100;

  const handleLaunch = (gameId: GameId) => {
    soundEffects.click();
    onSelectGame(gameId);
  };

  const handleTournamentSelect = (_tier: TournamentTier) => {
    soundEffects.levelUp();
    onSelectGame('traderfi-arena');
  };

  const handleClaimTokens = () => {
    soundEffects.levelUp();
    addTraderFiTokens(50);
    setTokenNotice('Claimed 50 Free Daily Tokens! 💎');
    setTimeout(() => setTokenNotice(null), 3000);
  };

  const games: {
    id: GameId;
    title: string;
    subtitle: string;
    description: string;
    badge: string;
    xpMultiplier: string;
    icon: string;
    themeColor: string;
    accentBorder: string;
    buttonColor: string;
  }[] = [
    {
      id: 'traderfi-arena',
      title: 'TraderFi 5-Min Arena',
      subtitle: 'Compressed Day Replay & Order Tape',
      description: 'The real TraderFi experience! Trade a full market session in 5 minutes with live Level 2 tape, Bid/Ask buttons, and real-time tournament leaderboard.',
      badge: 'FLAGSHIP TOURNAMENT',
      xpMultiplier: '200 XP + 💎 Prizes',
      icon: '🚀',
      themeColor: 'from-purple-950/80 via-indigo-950/60 to-[#0d0724]',
      accentBorder: 'border-purple-500/60 hover:border-cyan-400 shadow-[0_0_25px_rgba(168,85,247,0.25)]',
      buttonColor: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950',
    },
    {
      id: 'price-prediction',
      title: 'Price Direction Duel',
      subtitle: '10s Time-Pressure Chart Prediction',
      description: 'Can you predict whether the stock explodes UP or crashes DOWN? 10 seconds on the clock before the real market movement reveals itself!',
      badge: 'SPEED PREDICTION',
      xpMultiplier: 'Up to 250 XP',
      icon: '⏱️',
      themeColor: 'from-amber-950/60 via-slate-900 to-[#0d0724]',
      accentBorder: 'border-amber-500/40 hover:border-amber-400',
      buttonColor: 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950',
    },
    {
      id: 'portfolio-tycoon',
      title: 'Portfolio Tycoon',
      subtitle: 'Dalal Street Asset Allocator',
      description: 'Manage a $100,000 budget across 6 sectors. Rebalance across 4 quarters and survive macro rate hikes and oil shocks to beat the market benchmark!',
      badge: 'TYCOON SIM',
      xpMultiplier: '350 XP + Rank',
      icon: '💼',
      themeColor: 'from-indigo-950/60 via-slate-900 to-[#0d0724]',
      accentBorder: 'border-indigo-500/40 hover:border-indigo-400',
      buttonColor: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white',
    },
    {
      id: 'candlestick-combat',
      title: 'Candlestick Combat',
      subtitle: 'Reflex & Wick Momentum Duel',
      description: 'Test your reaction time! Real candles form tick-by-tick — anticipate whether bulls or bears take the close before the wick snaps back.',
      badge: 'ARCADE ACTION',
      xpMultiplier: '150 XP per Win',
      icon: '⚔️',
      themeColor: 'from-emerald-950/60 via-slate-900 to-[#0d0724]',
      accentBorder: 'border-emerald-500/40 hover:border-emerald-400',
      buttonColor: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white',
    },
    {
      id: 'chart-detective',
      title: 'Chart Detective',
      subtitle: 'Pattern & Breakout Recon',
      description: 'Analyze real historical market charts. Uncover hidden double bottoms, head & shoulders, and breakout lines under time pressure.',
      badge: 'VISUAL PUZZLE',
      xpMultiplier: '200 XP per Case',
      icon: '🔍',
      themeColor: 'from-cyan-950/60 via-slate-900 to-[#0d0724]',
      accentBorder: 'border-cyan-500/40 hover:border-cyan-400',
      buttonColor: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white',
    },
    {
      id: 'market-crash',
      title: 'Market Crash Survival',
      subtitle: 'Greed vs Discipline Multiplier',
      description: 'Watch the market bubble soar! Lock in your virtual profit before the sudden crash wipes out unprotected gains.',
      badge: 'RISK SURVIVAL',
      xpMultiplier: 'Up to 300 XP',
      icon: '🚀',
      themeColor: 'from-rose-950/60 via-slate-900 to-[#0d0724]',
      accentBorder: 'border-rose-500/40 hover:border-rose-400',
      buttonColor: 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-fadeIn text-slate-100 select-none">
      {/* 1. TOP TICKER matching Screenshot 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#110729] border border-purple-500/30 px-5 py-3 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="font-extrabold text-white">
            3,198 <span className="text-slate-400 font-sans text-[11px]">PLAYERS COMPETING NOW</span>
          </span>
          <span className="text-purple-500">&bull;</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>24 LIVE TOURNAMENTS</span>
          </span>
        </div>

        {/* Right Tokens & Quick Help Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-950/60 border border-purple-500/40 text-xs font-mono">
            <span className="text-base">💎</span>
            <span className="font-black text-cyan-300">{currentTokens} Tokens</span>
          </div>

          <button
            onClick={handleClaimTokens}
            className="px-3 py-1 rounded-xl bg-indigo-600/80 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Gift className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">+ Claim</span>
          </button>

          <button
            onClick={() => {
              soundEffects.click();
              setShowHowToPlayModal(true);
            }}
            className="px-3 py-1 rounded-xl bg-blue-600/80 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How to Play?</span>
          </button>

          <button
            onClick={() => {
              soundEffects.click();
              setShowWelcomeModal(true);
            }}
            className="px-3 py-1 rounded-xl bg-purple-600/80 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Overview</span>
          </button>
        </div>
      </div>

      {tokenNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <span>{tokenNotice}</span>
          <button onClick={() => setTokenNotice(null)} className="text-emerald-400 hover:text-white">&times;</button>
        </div>
      )}

      {/* 2. HERO FEATURED TOURNAMENT BANNER matching Screenshot 1 & 4 */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-900/60 via-indigo-950/80 to-[#0e0724] border border-purple-500/50 shadow-2xl overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/40 text-cyan-300 text-xs font-mono font-bold">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>LIVE TOURNAMENT ARENA &bull; 5-MIN MATCHES</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-white via-purple-100 to-cyan-300 bg-clip-text text-transparent">
              TraderFi Tournament Arena
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Step into the high-intensity 5-minute trading battlefield. Replay real historical sessions tick-by-tick, execute with lightning-fast Bid/Ask orders, and out-trade live competitors to climb the rankings and win token prize pools!
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1 text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="text-base">💰</span>
                <span className="font-bold text-white">$100,000 Virtual Balance</span>
              </span>
              <span className="text-purple-500">&bull;</span>
              <span className="flex items-center gap-1.5">
                <span className="text-base">🛡️</span>
                <span className="font-bold text-amber-300">5-Min Fast Sessions</span>
              </span>
              <span className="text-purple-500">&bull;</span>
              <span className="flex items-center gap-1.5">
                <span className="text-base">🏆</span>
                <span className="font-bold text-cyan-300">Real-Time Rankings</span>
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[220px]">
            <button
              onClick={() => handleLaunch('traderfi-arena')}
              className="py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>ENTER 5-MIN ARENA</span>
            </button>

            <button
              onClick={() => {
                soundEffects.click();
                setShowTournamentLobby(true);
              }}
              className="py-3 px-5 rounded-2xl bg-[#190c3d] hover:bg-[#251356] border border-purple-500/40 text-purple-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Browse All Tournaments</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. MULTIPLE GAMES ARENA GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white">All Game Arenas</h2>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            {games.length} Interactive Game Modes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div
              key={game.id}
              className={`rounded-3xl border bg-gradient-to-b ${game.themeColor} ${game.accentBorder} p-6 shadow-xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300 uppercase">
                    {game.badge}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {game.xpMultiplier}
                  </span>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-[#110729] border border-purple-500/30 flex items-center justify-center text-3xl shadow-inner">
                  {game.icon}
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {game.title}
                  </h3>
                  <span className="text-xs font-bold text-cyan-300 block mb-2">
                    {game.subtitle}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {game.description}
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleLaunch(game.id)}
                  className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${game.buttonColor}`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>PLAY NOW</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals for Welcome, How to Play, and Tournament Lobby */}
      <TraderFiWelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onSelectMode={(mode) => {
          if (mode === 'TOURNAMENT') {
            setShowTournamentLobby(true);
          } else {
            handleLaunch('traderfi-arena');
          }
        }}
        onOpenHowToPlay={() => {
          setShowWelcomeModal(false);
          setShowHowToPlayModal(true);
        }}
      />

      <TraderFiHowToPlayModal
        isOpen={showHowToPlayModal}
        onClose={() => setShowHowToPlayModal(false)}
        onStartExploring={() => setShowTournamentLobby(true)}
      />

      <TraderFiTournamentLobbyModal
        isOpen={showTournamentLobby}
        onClose={() => setShowTournamentLobby(false)}
        onSelectTournament={handleTournamentSelect}
        onOpenHowToPlay={() => {
          setShowTournamentLobby(false);
          setShowHowToPlayModal(true);
        }}
      />
    </div>
  );
};
