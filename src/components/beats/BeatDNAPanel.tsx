import React from 'react';
import { Activity, Disc, Zap, Music, Tag, Flame } from 'lucide-react';
import { Beat } from '../../types';

interface BeatDNAPanelProps {
  beat: Beat;
}

export const BeatDNAPanel: React.FC<BeatDNAPanelProps> = ({ beat }) => {
  return (
    <div className="bg-neutral-950 border border-purple-500/30 p-6 space-y-6 relative overflow-hidden backdrop-blur-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-400 flex items-center gap-2">
          <Activity size={12} /> ACOUSTIC PROFILE
        </span>
        <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
          VERIFIED KRAEZELV SOUND DNA
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-white/[0.02] border border-white/10 space-y-1">
          <span className="text-[8px] font-mono uppercase text-white/40 block">TEMPO / BPM</span>
          <span className="text-xl font-black text-white font-mono">{beat.bpm} <span className="text-xs text-purple-400">BPM</span></span>
        </div>

        <div className="p-4 bg-white/[0.02] border border-white/10 space-y-1">
          <span className="text-[8px] font-mono uppercase text-white/40 block">MUSICAL KEY</span>
          <span className="text-xl font-black text-white font-mono">{beat.key || 'C Minor'}</span>
        </div>

        <div className="p-4 bg-white/[0.02] border border-white/10 space-y-1">
          <span className="text-[8px] font-mono uppercase text-white/40 block">PRIMARY GENRE</span>
          <span className="text-sm font-black text-purple-300 uppercase truncate block">{beat.genre}</span>
        </div>

        <div className="p-4 bg-white/[0.02] border border-white/10 space-y-1">
          <span className="text-[8px] font-mono uppercase text-white/40 block">ENERGY PROFILE</span>
          <span className="text-sm font-black text-emerald-400 uppercase truncate block">{beat.energy || 'HIGH IMPACT'}</span>
        </div>

        <div className="p-4 bg-white/[0.02] border border-white/10 space-y-1 col-span-2">
          <span className="text-[8px] font-mono uppercase text-white/40 block">MOOD & VIBE</span>
          <span className="text-xs font-black text-white uppercase truncate block">
            {beat.moods && beat.moods.length > 0 ? beat.moods.join(' · ') : 'Dark · Atmospheric'}
          </span>
        </div>
      </div>

      {beat.tags && beat.tags.length > 0 && (
        <div className="pt-2 flex flex-wrap items-center gap-2">
          {beat.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 text-[9px] font-mono text-white/70 uppercase tracking-widest">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
