import React, { useState } from 'react';
import {
  X,
  Trophy,
  Users,
  Coins,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BarChart2,
  Gift,
  Plus,
  Lock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundEffects } from '../../utils/audio';

export interface TournamentTier {
  id: string;
  tier: 'BEGINNER' | 'EXPERIENCED' | 'EXPERT';
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  playersCount: number;
  entryFee: number;
  prizePool: number;
  trophyColor: string;
  bgGradient: string;
}

interface TraderFiTournamentLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTournament: (tier: TournamentTier) => void;
  onOpenHowToPlay?: () => void;
}

export const TOURNAMENT_TIERS: TournamentTier[] = [
  {
    id: 'tournament-beginner',
    tier: 'BEGINNER',
    title: 'Beginner',
    subtitle: 'Perfect for new traders. Compete, learn and win!',
    badge: 'New',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    playersCount: 17784,
    entryFee: 10,
    prizePool: 15,
    trophyColor: 'from-cyan-400 to-blue-500',
    bgGradient: 'from-blue-950/40 via-purple-950/20 to-slate-950/60',
  },
  {
    id: 'tournament-experienced',
    tier: 'EXPERIENCED',
    title: 'Experienced',
    subtitle: 'For active traders looking for bigger action.',
    badge: 'Experienced',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    playersCount: 2555,
    entryFee: 20,
    prizePool: 30,
    trophyColor: 'from-purple-400 to-pink-500',
    bgGradient: 'from-purple-950/40 via-indigo-950/20 to-slate-950/60',
  },
  {
    id: 'tournament-expert',
    tier: 'EXPERT',
    title: 'Expert',
    subtitle: 'High stakes. Real competition. Prove your edge.',
    badge: 'Expert',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    playersCount: 4205,
    entryFee: 30,
    prizePool: 45,
    trophyColor: 'from-amber-400 to-yellow-500',
    bgGradient: 'from-amber-950/30 via-purple-950/30 to-slate-950/60',
  },
];

export const TraderFiTournamentLobbyModal: React.FC<TraderFiTournamentLobbyModalProps> = ({
  isOpen,
  onClose,
  onSelectTournament,
  onOpenHowToPlay,
}) => {
  const { profile, spendTraderFiTokens, addTraderFiTokens } = useGame();
  const [activeTab, setActiveTab] = useState<'PUBLIC' | 'MY' | 'INVITED' | 'ARCHIVED'>('PUBLIC');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customFee, setCustomFee] = useState(10);
  const [customRoomCode, setCustomRoomCode] = useState('');
  const [myTournaments, setMyTournaments] = useState<TournamentTier[]>([]);
  const [tokenNotice, setTokenNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTokens = profile.traderFiTokens ?? 100;

  const handleJoin = (tier: TournamentTier) => {
    soundEffects.click();
    if (currentTokens < tier.entryFee) {
      setTokenNotice(`You need ${tier.entryFee} 💎 tokens to join this tournament. Claim daily bonus!`);
      soundEffects.wrong();
      return;
    }

    const success = spendTraderFiTokens(tier.entryFee);
    if (success) {
      onSelectTournament(tier);
      onClose();
    }
  };

  const handleClaimFreeTokens = () => {
    soundEffects.levelUp();
    addTraderFiTokens(50);
    setTokenNotice('Claimed 50 Free Daily Tokens! 💎');
    setTimeout(() => setTokenNotice(null), 3000);
  };

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    soundEffects.levelUp();
    const newTier: TournamentTier = {
      id: `custom-${Date.now()}`,
      tier: 'EXPERIENCED',
      title: customName,
      subtitle: `Private Tournament &bull; Code: ${customRoomCode || 'ROOM-777'}`,
      badge: 'Private',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      playersCount: 1,
      entryFee: customFee,
      prizePool: Math.round(customFee * 1.5),
      trophyColor: 'from-emerald-400 to-cyan-500',
      bgGradient: 'from-emerald-950/30 via-purple-950/20 to-slate-950/60',
    };

    setMyTournaments(prev => [newTier, ...prev]);
    setShowCreateModal(false);
    setCustomName('');
    setActiveTab('MY');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Outer Glow Container */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl p-1 bg-gradient-to-b from-purple-500/40 via-indigo-500/25 to-purple-900/40 border border-purple-500/50 shadow-[0_0_60px_rgba(147,51,234,0.45)] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => {
            soundEffects.click();
            onClose();
          }}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Modal Inner Container */}
        <div className="flex-1 flex flex-col p-5 sm:p-7 bg-[#0d0724] rounded-2xl overflow-y-auto space-y-6 scrollbar-thin">
          {/* Header Row: Trophy Title + Tokens Counter + Redeem */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shadow-lg">
                🏆
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  Tournaments
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Choose a tournament and put your trading skills to the test.
                </p>
              </div>
            </div>

            {/* Right: Tokens & Redeem */}
            <div className="flex items-center gap-3 self-start sm:self-center">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#160c35] border border-purple-500/40 text-xs font-mono">
                <span className="text-lg">💎</span>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Your Tokens</span>
                  <span className="font-black text-cyan-300 text-sm">{currentTokens}</span>
                </div>
              </div>

              <button
                onClick={handleClaimFreeTokens}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-purple-900/40 cursor-pointer border border-purple-400/30"
              >
                <Gift className="w-3.5 h-3.5 text-amber-300" />
                <span>+ Claim Tokens</span>
              </button>
            </div>
          </div>

          {/* Token notice banner if any */}
          {tokenNotice && (
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-between animate-fadeIn">
              <span>{tokenNotice}</span>
              <button
                onClick={() => setTokenNotice(null)}
                className="text-amber-400 hover:text-white"
              >
                &times;
              </button>
            </div>
          )}

          {/* Filter Tabs matching Screenshot 4 */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                soundEffects.click();
                setActiveTab('PUBLIC');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'PUBLIC'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'bg-indigo-950/40 text-slate-400 hover:text-white border border-indigo-500/20'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Public ({TOURNAMENT_TIERS.length})</span>
            </button>

            <button
              onClick={() => {
                soundEffects.click();
                setActiveTab('MY');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'MY'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'bg-indigo-950/40 text-slate-400 hover:text-white border border-indigo-500/20'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>My Tournaments ({myTournaments.length})</span>
            </button>

            <button
              onClick={() => {
                soundEffects.click();
                setActiveTab('INVITED');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'INVITED'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'bg-indigo-950/40 text-slate-400 hover:text-white border border-indigo-500/20'
              }`}
            >
              <span>Invited (0)</span>
            </button>

            <button
              onClick={() => {
                soundEffects.click();
                setActiveTab('ARCHIVED');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'ARCHIVED'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'bg-indigo-950/40 text-slate-400 hover:text-white border border-indigo-500/20'
              }`}
            >
              <span>Archived (0)</span>
            </button>
          </div>

          {/* Tournament Cards List */}
          <div className="space-y-4">
            {(activeTab === 'PUBLIC' ? TOURNAMENT_TIERS : myTournaments).map((tier) => (
              <div
                key={tier.id}
                className={`p-5 rounded-2xl bg-gradient-to-r ${tier.bgGradient} border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-purple-400/60 shadow-lg`}
              >
                {/* Left: Trophy Badge + Info */}
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${tier.trophyColor} p-0.5 flex items-center justify-center shadow-lg shrink-0`}>
                    <div className="w-full h-full bg-[#110729] rounded-[14px] flex items-center justify-center text-2xl">
                      🏆
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-black text-lg text-white">{tier.title}</h3>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${tier.badgeColor}`}>
                        {tier.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 max-w-md">{tier.subtitle}</p>
                    <div className="flex items-center gap-4 text-xs font-mono pt-1 text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{tier.playersCount.toLocaleString()} Players</span>
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 text-cyan-300 font-bold">
                        <span>Entry Fee:</span>
                        <span>💎 {tier.entryFee.toFixed(2)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Prize Pool Box + Play Now Button */}
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-purple-500/20">
                  <div className="bg-[#140b33] px-4 py-2.5 rounded-xl border border-purple-500/40 text-center min-w-[110px]">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Prize Pool</span>
                    <span className="text-base font-black text-white font-mono flex items-center justify-center gap-1">
                      <span>💎</span>
                      <span>{tier.prizePool.toFixed(2)}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleJoin(tier)}
                    className="py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span>Play Now</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            ))}

            {activeTab === 'MY' && myTournaments.length === 0 && (
              <div className="text-center py-12 space-y-3 bg-indigo-950/20 rounded-2xl border border-indigo-500/20">
                <div className="text-4xl">🎮</div>
                <h4 className="font-bold text-white text-base">No Custom Tournaments Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click the (+) button below to create a private room and invite your friends or classmates!
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Create Tournament Now
                </button>
              </div>
            )}
          </div>

          {/* Bottom Trust & Info Bar matching Screenshot 4 */}
          <div className="mt-auto pt-4 border-t border-purple-500/20 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <strong className="block text-white text-[11px]">Secure & Fair</strong>
                <span className="text-[10px] text-slate-400">Verified accounts only</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-300">
              <BarChart2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <strong className="block text-white text-[11px]">Real-Time Rankings</strong>
                <span className="text-[10px] text-slate-400">Compete live with traders worldwide</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-300">
              <Users className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <strong className="block text-white text-[11px]">Build Your Skills</strong>
                <span className="text-[10px] text-slate-400">Practice, compete and improve</span>
              </div>
            </div>

            <div className="flex items-center justify-start sm:justify-end">
              {onOpenHowToPlay && (
                <button
                  onClick={() => {
                    soundEffects.click();
                    onOpenHowToPlay();
                  }}
                  className="text-xs font-bold text-cyan-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <span>Need help? How to Play &bull;</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Floating (+) Action Button to Create Tournament */}
        <button
          onClick={() => {
            soundEffects.click();
            setShowCreateModal(true);
          }}
          title="Create Custom Tournament"
          className="absolute bottom-6 right-6 z-20 w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white flex items-center justify-center shadow-xl shadow-cyan-500/40 hover:scale-110 active:scale-95 transition-transform cursor-pointer border border-cyan-300/40"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      {/* Create Custom Tournament Dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#110729] rounded-3xl border border-purple-500/50 p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Create Private Tournament</h3>
              <p className="text-xs text-slate-300">Set rules and invite friends or students with a code.</p>
            </div>

            <form onSubmit={handleCreateTournament} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Tournament Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 10 Market Championship"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Entry Fee (💎 Tokens)</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={customFee}
                    onChange={e => setCustomFee(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Custom Room Code</label>
                  <input
                    type="text"
                    placeholder="e.g. QUEST-888"
                    value={customRoomCode}
                    onChange={e => setCustomRoomCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-[11px] text-slate-300 space-y-1">
                <span className="font-bold text-cyan-300 block">Tournament Parameters:</span>
                <p>&bull; 5-Minute real tick day replay simulation</p>
                <p>&bull; Starting capital: $100,000 virtual balance</p>
                <p>&bull; Winner takes: 💎 {Math.round(customFee * 1.5)} token prize pool</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
              >
                Create &amp; Open Lobby
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
