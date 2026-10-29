import React, { useState } from 'react';
import {
  Play,
  HelpCircle,
  Coins,
  Gift,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Layers
} from 'lucide-react';
import { GameId } from '../../types';
import { useGame } from '../../context/GameContext';
import { soundEffects } from '../../utils/audio';
import { TraderFiWelcomeModal } from '../games/TraderFiWelcomeModal';
import { TraderFiHowToPlayModal } from '../games/TraderFiHowToPlayModal';
import { TraderFiMiniGamesModal, MiniGameId } from './TraderFiMiniGamesModal';

interface StudentPlayArcadeProps {
  onSelectGame: (gameId: GameId) => void;
}

interface TraderFiGameCard {
  id: string;
  miniGameType?: MiniGameId;
  title: string;
  description: string;
  isNew?: boolean;
  renderIllustration: () => React.ReactNode;
}

export const StudentPlayArcade: React.FC<StudentPlayArcadeProps> = ({ onSelectGame }) => {
  const { profile, addTraderFiTokens } = useGame();

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);
  const [activeMiniGame, setActiveMiniGame] = useState<MiniGameId | null>(null);
  const [tokenNotice, setTokenNotice] = useState<string | null>(null);

  const currentTokens = profile.traderFiTokens ?? 100;

  const handleClaimTokens = () => {
    soundEffects.levelUp();
    addTraderFiTokens(50);
    setTokenNotice('Claimed 50 Free Daily Tokens! 💎');
    setTimeout(() => setTokenNotice(null), 3000);
  };

  const handlePlayGame = (game: TraderFiGameCard) => {
    soundEffects.click();
    if (game.id === 'trading-game') {
      onSelectGame('traderfi-arena');
    } else if (game.miniGameType) {
      setActiveMiniGame(game.miniGameType);
    }
  };

  // 8 Games exactly as shown in the screenshot
  const games: TraderFiGameCard[] = [
    {
      id: 'trading-game',
      title: 'Trading Game',
      description: 'Combine market making and market taking in a single round. Quote spreads, then trade against the book.',
      renderIllustration: () => (
        <div className="w-full h-full flex items-center justify-center px-4">
          <svg viewBox="0 0 240 80" className="w-full h-20 select-none overflow-visible">
            {/* Candlesticks sequence */}
            {[
              { x: 10, open: 45, close: 55, high: 60, low: 40, isBull: false },
              { x: 30, open: 55, close: 48, high: 58, low: 44, isBull: false },
              { x: 50, open: 48, close: 40, high: 50, low: 36, isBull: true },
              { x: 70, open: 40, close: 34, high: 42, low: 30, isBull: true },
              { x: 90, open: 34, close: 38, high: 40, low: 32, isBull: true },
              { x: 110, open: 38, close: 32, high: 40, low: 28, isBull: true },
              { x: 130, open: 32, close: 30, high: 36, low: 26, isBull: true },
              { x: 150, open: 30, close: 26, high: 34, low: 22, isBull: false },
              { x: 170, open: 26, close: 35, high: 38, low: 24, isBull: false },
              { x: 190, open: 35, close: 22, high: 40, low: 18, isBull: true },
              { x: 210, open: 22, close: 18, high: 28, low: 14, isBull: true },
              { x: 230, open: 18, close: 25, high: 32, low: 16, isBull: true },
            ].map((c, i) => {
              const color = c.isBull ? '#065f46' : '#991b1b';
              const topWick = Math.min(c.high, c.low);
              const botWick = Math.max(c.high, c.low);
              const bodyTop = Math.min(c.open, c.close);
              const bodyHeight = Math.max(3, Math.abs(c.close - c.open));

              return (
                <g key={i}>
                  <line x1={c.x} y1={topWick} x2={c.x} y2={botWick} stroke={color} strokeWidth={2} />
                  <rect
                    x={c.x - 3.5}
                    y={bodyTop}
                    width={7}
                    height={bodyHeight}
                    fill={color}
                    rx={1}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      ),
    },
    {
      id: 'etf-arbitrage',
      miniGameType: 'etf-arbitrage',
      title: 'ETF Arbitrage Game',
      description: 'Spot mispricings between an ETF and its underlying stocks. Trade against 3 AI market makers for P&L.',
      renderIllustration: () => (
        <div className="w-full h-full flex flex-col justify-center px-4 font-mono text-[11px] leading-relaxed">
          <div className="flex items-center justify-between text-rose-700 font-bold">
            <span>$30.72 MSFT ▼</span>
            <span>$25.73 AMZN ▼</span>
            <span>$79.45</span>
          </div>
          <div className="flex items-center justify-between text-emerald-700 font-bold mt-1">
            <span>33 INTC ▼</span>
            <span>$86.74 ORCL ▲</span>
            <span>$80.10 IB</span>
          </div>
          <div className="flex items-center justify-between text-rose-700 font-bold mt-1">
            <span>59.38 GS ▲</span>
            <span>$66.17 WMT ▼</span>
            <span>$59.74</span>
          </div>
        </div>
      ),
    },
    {
      id: 'card-game',
      miniGameType: 'card-game',
      title: 'Card Game',
      description: 'Classic card-based market taking exercise. Read quotes, identify edge, and take the best price.',
      renderIllustration: () => (
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Fan of 4 subtle cards */}
          <div className="relative w-36 h-24 flex items-center justify-center">
            <div className="absolute w-12 h-18 bg-white/95 rounded-lg border border-amber-300 shadow-md transform -rotate-15 -translate-x-6 flex items-center justify-center text-rose-600 font-bold text-xs">
              <span className="opacity-40">♦</span>
            </div>
            <div className="absolute w-12 h-18 bg-white/95 rounded-lg border border-amber-300 shadow-md transform -rotate-6 -translate-x-2 flex items-center justify-center text-slate-800 font-bold text-xs">
              <span className="opacity-40">♠</span>
            </div>
            <div className="absolute w-12 h-18 bg-white/95 rounded-lg border border-amber-300 shadow-md transform rotate-6 translate-x-2 flex items-center justify-center text-rose-600 font-bold text-xs">
              <span className="opacity-40">♥</span>
            </div>
            <div className="absolute w-12 h-18 bg-white/95 rounded-lg border border-amber-300 shadow-md transform rotate-15 translate-x-6 flex items-center justify-center text-slate-800 font-bold text-xs">
              <span className="opacity-40">♣</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'dice-game',
      miniGameType: 'dice-market',
      title: 'Market Making Dice Game',
      description: 'Quote tight two-way prices on dice rolls. Manage spread, inventory, and event risk.',
      renderIllustration: () => (
        <div className="w-full h-full flex items-center justify-center gap-6">
          <div className="w-10 h-10 bg-white/95 rounded-xl border border-slate-300 shadow-lg transform -rotate-12 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
          </div>
          <div className="w-10 h-10 bg-white/95 rounded-xl border border-slate-300 shadow-lg transform rotate-12 flex flex-col justify-between p-2">
            <div className="flex justify-between">
              <div className="w-2 h-2 rounded-full bg-slate-900" />
              <div className="w-2 h-2 rounded-full bg-slate-900" />
            </div>
            <div className="flex justify-between">
              <div className="w-2 h-2 rounded-full bg-slate-900" />
              <div className="w-2 h-2 rounded-full bg-slate-900" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'fermi-estimation',
      miniGameType: 'fermi-estimation',
      title: 'Fermi Estimation Game',
      description: 'Estimate unknown quantities with confidence intervals. Score for accuracy, precision and calibration.',
      renderIllustration: () => (
        <div className="w-full h-full flex items-center justify-center px-8">
          <div className="w-full flex items-center justify-center">
            {/* Horizontal interval bar with endpoints |--------| */}
            <div className="w-4 h-12 bg-rose-800 rounded-sm" />
            <div className="flex-1 h-3.5 bg-rose-800" />
            <div className="w-4 h-12 bg-rose-800 rounded-sm" />
          </div>
        </div>
      ),
    },
    {
      id: 'event-contracts',
      miniGameType: 'event-contracts',
      title: 'Event Contracts Game',
      description: 'Quote two-sided markets on binary events against noise and informed flow. Score on P&L and risk.',
      renderIllustration: () => (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2.5 font-bold font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-800 text-[11px] font-sans">YES</span>
            <div className="w-12 h-5 bg-emerald-800 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-800 text-[11px] font-sans">NO</span>
            <div className="w-12 h-5 bg-rose-800 rounded-md" />
          </div>
        </div>
      ),
    },
    {
      id: 'higher-lower',
      miniGameType: 'higher-lower',
      title: 'Higher or Lower Game',
      isNew: true,
      description: 'Call each card higher or lower and size every bet to your edge. Grow the bankroll without going bust.',
      renderIllustration: () => (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          {/* Green Up Arrow */}
          <div className="w-6 h-6 flex items-center justify-center text-emerald-800">
            <ArrowUp className="w-7 h-7 stroke-[3]" />
          </div>
          {/* Red Down Arrow */}
          <div className="w-6 h-6 flex items-center justify-center text-rose-800">
            <ArrowDown className="w-7 h-7 stroke-[3]" />
          </div>
        </div>
      ),
    },
    {
      id: 'betting-board',
      miniGameType: 'betting-board',
      title: 'Betting Board Game',
      isNew: true,
      description: 'Find the arbitrage in a board of odds. Work out the fair price of each bet and stake the lines that beat the vig.',
      renderIllustration: () => (
        <div className="w-full h-full flex items-center justify-center">
          {/* Casino Poker Chip with 10 */}
          <div className="w-16 h-16 rounded-full bg-slate-900 border-4 border-dashed border-rose-600 flex items-center justify-center shadow-lg relative">
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-slate-900 font-black text-sm font-mono shadow-inner">
              10
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 select-none animate-fadeIn text-slate-100">
      {/* 1. TOP TICKER RIBBON matching TraderFi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="font-extrabold text-white">
            3,198 <span className="text-slate-400 font-sans text-[11px]">PLAYERS COMPETING NOW</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>8 LIVE FINANCIAL ARENAS</span>
          </span>
        </div>

        {/* Tokens & Controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <span className="text-base">💎</span>
            <span className="font-black text-cyan-300">{currentTokens} Tokens</span>
          </div>

          <button
            onClick={handleClaimTokens}
            className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Gift className="w-3.5 h-3.5 text-amber-300" />
            <span>+ Claim 50</span>
          </button>

          <button
            onClick={() => {
              soundEffects.click();
              setShowHowToPlayModal(true);
            }}
            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How to Play?</span>
          </button>
        </div>
      </div>

      {tokenNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <span>{tokenNotice}</span>
          <button onClick={() => setTokenNotice(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 2. THE 8 TRADERFI MINI-GAMES GRID MATCHING USER SCREENSHOT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {games.map((game) => (
          <div
            key={game.id}
            className="bg-[#fbf9f5] rounded-3xl overflow-hidden border border-amber-200/50 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
          >
            <div>
              {/* Header Illustration Container matching Screenshot Warm Tone */}
              <div className="bg-[#f3ede3] h-36 w-full relative overflow-hidden flex items-center justify-center p-3">
                {game.renderIllustration()}

                {/* Optional Red 'NEW' Badge at bottom-left */}
                {game.isNew && (
                  <span className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded-full bg-[#E84118] text-white text-[10px] font-black tracking-wider uppercase shadow-sm">
                    NEW
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-2">
                <h3 className="font-serif text-lg font-bold text-slate-900 tracking-tight group-hover:text-[#E84118] transition-colors">
                  {game.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed min-h-[56px]">
                  {game.description}
                </p>
              </div>
            </div>

            {/* Bottom Play Action Button (Right Aligned Orange-Red Button) */}
            <div className="p-5 pt-0 flex justify-end">
              <button
                onClick={() => handlePlayGame(game)}
                className="px-6 py-2 rounded-full bg-[#E84118] hover:bg-[#d03710] active:scale-95 text-white font-bold text-xs shadow-md shadow-[#E84118]/25 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Play</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Playable Mini Game Modal */}
      {activeMiniGame && (
        <TraderFiMiniGamesModal
          gameId={activeMiniGame}
          onClose={() => setActiveMiniGame(null)}
        />
      )}

      {/* How To Play Modal */}
      <TraderFiHowToPlayModal
        isOpen={showHowToPlayModal}
        onClose={() => setShowHowToPlayModal(false)}
        onStartExploring={() => setShowHowToPlayModal(false)}
      />

      {/* Overview Modal */}
      <TraderFiWelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onSelectMode={(mode) => {
          setShowWelcomeModal(false);
          onSelectGame('traderfi-arena');
        }}
        onOpenHowToPlay={() => {
          setShowWelcomeModal(false);
          setShowHowToPlayModal(true);
        }}
      />
    </div>
  );
};
