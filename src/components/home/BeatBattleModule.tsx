import React, { useState } from 'react';
import { Swords, Play, Pause, Vote, Award, Check } from 'lucide-react';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { useAudioStore } from '../../store/useAudioStore';
import { useUserPreferencesStore } from '../../store/useUserPreferencesStore';
import { cn } from '../../lib/utils';

export const BeatBattleModule: React.FC = () => {
  const { beats } = useBeatCatalogStore();
  const { setBeat, currentBeat, isPlaying, togglePlay } = useAudioStore();
  const { beatBattleVotes, voteBeatBattle } = useUserPreferencesStore();

  if (beats.length < 2) return null;

  const beatA = beats[0];
  const beatB = beats[1];
  const battleId = `battle_${beatA.id}_vs_${beatB.id}`;
  const currentVote = beatBattleVotes[battleId];

  return (
    <section className="bg-black py-20 border-b border-white/10 relative overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10 space-y-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-400 flex items-center gap-2">
              <Swords size={12} /> AUDITION BATTLEGROUND
            </span>
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter">
              BEAT BATTLE
            </h2>
          </div>
          <p className="text-xs text-white/50 font-mono uppercase tracking-widest max-w-md">
            Compare two tracks head-to-head. Listen to both arrangements and vote for your favorite instrumental.
          </p>
        </div>

        <div className="grid lg:grid-cols-11 gap-8 items-center">
          
          {/* BEAT A */}
          <div className="lg:col-span-5 bg-neutral-950 border border-white/15 p-8 space-y-6 relative group hover:border-purple-500/50 transition-all shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">BEAT A</span>
              <span className="text-[10px] font-mono text-white/60">{beatA.bpm} BPM · {beatA.key}</span>
            </div>

            <div className="relative aspect-video w-full bg-neutral-900 border border-white/10 overflow-hidden">
              <img src={beatA.artworkUrl} alt={beatA.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <button
                  onClick={() => {
                    if (currentBeat?.id === beatA.id) togglePlay();
                    else setBeat(beatA);
                  }}
                  className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
                >
                  {currentBeat?.id === beatA.id && isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight text-white">{beatA.title}</h3>
              <p className="text-xs text-purple-400 font-mono uppercase tracking-widest">{beatA.genre}</p>
            </div>

            <button
              onClick={() => voteBeatBattle(battleId, 'A')}
              className={cn(
                "w-full py-4 font-black uppercase text-xs tracking-[0.25em] transition-all flex items-center justify-center gap-2 cursor-pointer",
                currentVote === 'A' 
                  ? "bg-purple-600 text-white shadow-xl" 
                  : "bg-white/10 border border-white/20 text-white hover:bg-white hover:text-black"
              )}
            >
              {currentVote === 'A' ? <><Check size={14} /> VOTED FOR BEAT A</> : <><Vote size={14} /> VOTE BEAT A</>}
            </button>
          </div>

          {/* VS BADGE */}
          <div className="lg:col-span-1 flex items-center justify-center py-4">
            <div className="w-16 h-16 bg-purple-600 text-white font-black text-xl flex items-center justify-center rounded-full shadow-[0_0_30px_rgba(168,85,247,0.5)] border border-purple-400 font-mono">
              VS
            </div>
          </div>

          {/* BEAT B */}
          <div className="lg:col-span-5 bg-neutral-950 border border-white/15 p-8 space-y-6 relative group hover:border-purple-500/50 transition-all shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">BEAT B</span>
              <span className="text-[10px] font-mono text-white/60">{beatB.bpm} BPM · {beatB.key}</span>
            </div>

            <div className="relative aspect-video w-full bg-neutral-900 border border-white/10 overflow-hidden">
              <img src={beatB.artworkUrl} alt={beatB.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <button
                  onClick={() => {
                    if (currentBeat?.id === beatB.id) togglePlay();
                    else setBeat(beatB);
                  }}
                  className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
                >
                  {currentBeat?.id === beatB.id && isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight text-white">{beatB.title}</h3>
              <p className="text-xs text-purple-400 font-mono uppercase tracking-widest">{beatB.genre}</p>
            </div>

            <button
              onClick={() => voteBeatBattle(battleId, 'B')}
              className={cn(
                "w-full py-4 font-black uppercase text-xs tracking-[0.25em] transition-all flex items-center justify-center gap-2 cursor-pointer",
                currentVote === 'B' 
                  ? "bg-purple-600 text-white shadow-xl" 
                  : "bg-white/10 border border-white/20 text-white hover:bg-white hover:text-black"
              )}
            >
              {currentVote === 'B' ? <><Check size={14} /> VOTED FOR BEAT B</> : <><Vote size={14} /> VOTE BEAT B</>}
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
