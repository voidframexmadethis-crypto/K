import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Heart, ShoppingCart, TrendingUp } from 'lucide-react';
import { Beat } from '../../types';
import { useAudioStore } from '../../store/useAudioStore';
import { cn } from '../../lib/utils';
import { LicensingModal } from './LicensingModal';

export const TrendingRow = ({ beat, rank }: { beat: Beat, rank: number }) => {
  const { setBeat, currentBeat, isPlaying, togglePlay } = useAudioStore();
  const isCurrent = currentBeat?.id === beat.id;
  const [isLicensingOpen, setIsLicensingOpen] = useState(false);

  return (
    <div className="group flex items-center gap-8 py-8 border-b border-white/5 hover:bg-white/[0.01] transition-colors px-4 -mx-4 relative overflow-hidden">
      <div className="absolute left-0 top-0 w-1 h-full bg-white scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />
      
      {/* Rank */}
      <div className="w-12 shrink-0 flex items-center justify-center">
         <span className="text-4xl font-black text-white/10 group-hover:text-white transition-colors duration-500 tabular-nums">
           {rank.toString().padStart(2, '0')}
         </span>
      </div>

      {/* Play Button */}
      <button 
        onClick={() => isCurrent ? togglePlay() : setBeat(beat)}
        className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all group-hover:scale-110 active:scale-95"
      >
        {isCurrent && isPlaying ? (
          <div className="flex gap-1 items-end h-4"><div className="w-1 h-2 bg-current animate-pulse" /><div className="w-1 h-4 bg-current animate-pulse" /><div className="w-1 h-1.5 bg-current animate-pulse" /></div>
        ) : (
          <Play size={16} fill="currentColor" className="ml-0.5" />
        )}
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0 flex items-center gap-6">
        <div className="w-16 h-16 bg-neutral-900 border border-white/5 overflow-hidden shrink-0">
           <img src={beat.artworkUrl} className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700" alt={beat.title} />
        </div>
        <div className="flex flex-col gap-1 min-w-0">
           <Link to="/audio-player">
             <h4 className="text-xl font-black text-white uppercase tracking-tighter truncate leading-none hover:text-white/80 transition-colors">{beat.title}</h4>
           </Link>
           <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              <span>{beat.producerId}</span>
              <span className="w-px h-2 bg-white/10" />
              <span>{beat.genre}</span>
           </div>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden lg:flex items-center gap-12 shrink-0">
         <div className="flex flex-col items-center gap-1">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">BPM</span>
            <span className="text-xs font-bold text-white/60 tabular-nums">{beat.bpm}</span>
         </div>
         <div className="flex flex-col items-center gap-1">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Key</span>
            <span className="text-xs font-bold text-white/60">{beat.key}</span>
         </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 shrink-0">
         <button className="p-3 text-white/20 hover:text-white transition-colors"><Heart size={18} /></button>
         <button 
           onClick={(e) => {
             e.preventDefault();
             e.stopPropagation();
             console.log('1. BUY BEAT CLICKED');
             console.log('2. Parent navigation prevented');
             setIsLicensingOpen(true);
           }}
           className="px-6 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all"
         >
           Buy ${beat.licenses.basic.price}
         </button>
      </div>

      {/* Chart Sparkline Simulation */}
      <div className="hidden xl:block w-32 h-8 px-4 opacity-20 group-hover:opacity-100 transition-opacity">
         <div className="h-full flex items-end gap-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex-1 bg-white" style={{ height: `${Math.random() * 100}%` }} />
            ))}
         </div>
      </div>

      <LicensingModal 
        beat={beat}
        isOpen={isLicensingOpen}
        onClose={() => setIsLicensingOpen(false)}
      />
    </div>
  );
};
