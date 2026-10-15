import React from 'react';
import {
  Landmark,
  Building2,
  CandlestickChart,
  Briefcase,
  BrainCircuit,
  PieChart,
  Flame,
  Cpu,
  Lock,
  Play,
  Swords,
  Search,
  Zap,
  TrendingUp,
  Brain,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { DISTRICTS, PROGRESSION_LEVELS } from '../../data/curriculum';
import { District, GameId } from '../../types';
import { useGame } from '../../context/GameContext';
import { soundEffects } from '../../utils/audio';

export const WorldMap: React.FC = () => {
  const { profile, setActiveGame, setSelectedDistrict } = useGame();

  const getDistrictIcon = (name: string) => {
    switch (name) {
      case 'Landmark':
        return Landmark;
      case 'Building2':
        return Building2;
      case 'CandlestickChart':
        return CandlestickChart;
      case 'Briefcase':
        return Briefcase;
      case 'BrainCircuit':
        return BrainCircuit;
      case 'PieChart':
        return PieChart;
      case 'Flame':
        return Flame;
      case 'Cpu':
        return Cpu;
      default:
        return Landmark;
    }
  };

  const handleLaunchGame = (gameId: GameId, district: District) => {
    soundEffects.click();
    setSelectedDistrict(district.id);
    setActiveGame(gameId);
  };

  return (
    <div className="space-y-6">
      {/* City Overview Header */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/70 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Financial City Map • Dalal Street RPG World
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Explore the <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">Districts of Dalal Street</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
            Progress from a Level 1 Market Newbie to a Level 11 Market Master. Master price action in the Chart Arena, survive high-volatility flash crashes in the Psychology Lab, and dissect balance sheets in the Corporate District.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Current Status: <strong>Level {profile.level} - {PROGRESSION_LEVELS.find(l => l.level === profile.level)?.title}</strong></span>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <span>Unlocked: <strong>{DISTRICTS.filter(d => profile.level >= d.requiredLevel).length} of {DISTRICTS.length} Districts</strong></span>
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Districts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {DISTRICTS.map((district) => {
          const isUnlocked = profile.level >= district.requiredLevel;
          const DistrictIcon = getDistrictIcon(district.icon);

          return (
            <div
              key={district.id}
              className={`relative rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                isUnlocked
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-950/20'
                  : 'bg-slate-950/60 border-slate-900 opacity-65'
              }`}
            >
              {/* Top Banner Stripe */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${isUnlocked ? district.accentGradient : 'from-slate-800 to-slate-900'}`} />

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* District Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md"
                        style={{
                          backgroundColor: isUnlocked ? district.color : '#334155',
                          opacity: isUnlocked ? 1 : 0.6,
                        }}
                      >
                        <DistrictIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base leading-tight">
                          {district.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {district.hindiTitle}
                        </p>
                      </div>
                    </div>

                    {!isUnlocked ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md bg-slate-800/80 text-amber-400 border border-amber-500/20">
                        <Lock className="w-3 h-3" />
                        <span>Lvl {district.requiredLevel}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-slate-300 text-xs leading-relaxed mb-4">
                    {district.description}
                  </p>

                  {/* Key Topics */}
                  <div className="mb-4">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Curriculum Topics:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {district.topics.slice(0, 3).map((topic, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* District Games & Activities */}
                <div className="space-y-2 pt-3 border-t border-slate-800/80">
                  {district.games.map((game) => (
                    <button
                      key={game.id}
                      disabled={!isUnlocked}
                      onClick={() => handleLaunchGame(game.id, district)}
                      className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-all group ${
                        isUnlocked
                          ? 'bg-slate-800/80 hover:bg-indigo-900/30 border-slate-700 hover:border-indigo-500/40 text-slate-200 cursor-pointer'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-950/80 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                            {game.title}
                          </div>
                          <div className="text-[10px] text-emerald-400 font-mono">
                            +{game.rewardXp} XP
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                    </button>
                  ))}

                  {/* Boss Encounter Preview */}
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5 text-amber-300/90 font-medium">
                      <Swords className="w-3.5 h-3.5 text-amber-400" />
                      <span>Boss: {district.boss.name}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isUnlocked ? 'Unlocked' : `Requires Lvl ${district.requiredLevel}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
