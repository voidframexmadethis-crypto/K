import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, ShoppingCart, Heart, Share2 } from 'lucide-react';
import { Beat } from '../../types';
import { useAudioStore } from '../../store/useAudioStore';
import { LicensingModal } from './LicensingModal';

export const BeatCard = ({ beat }: { beat: Beat }) => {
  const { setBeat, currentBeat, isPlaying, togglePlay } = useAudioStore();
  const isCurrent = currentBeat?.id === beat.id;
  const [isLicensingOpen, setIsLicensingOpen] = useState(false);

  return (
    <div className="group flex flex-col gap-5">
      {/* Artwork Container */}
      <div className="relative aspect-square overflow-hidden bg-neutral-900 border border-white/5">
        <img 
          src={beat.artworkUrl} 
          alt={beat.title}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
           <button 
             onClick={() => isCurrent ? togglePlay() : setBeat(beat)}
             className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
           >
             {isCurrent && isPlaying ? <div className="flex gap-1 items-end h-6"><div className="w-1 h-4 bg-black animate-pulse" /><div className="w-1 h-6 bg-black animate-pulse" /><div className="w-1 h-3 bg-black animate-pulse" /></div> : <Play size={24} fill="currentColor" className="ml-1" />}
           </button>
        </div>

        {/* Top Right Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
           <button className="w-10 h-10 bg-black/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors">
              <Heart size={18} />
           </button>
           <button className="w-10 h-10 bg-black/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors">
              <Share2 size={18} />
           </button>
        </div>

        {/* Bottom Tag */}
        <div className="absolute bottom-4 left-4">
           <span className="text-[8px] font-bold uppercase tracking-widest bg-white text-black px-2 py-1">
              {beat.bpm} BPM
           </span>
        </div>
      </div>

      {/* Info Container */}
      <div className="flex justify-between items-start">
        <div className="min-w-0">
          <Link to="/audio-player">
            <h3 className="text-lg font-bold text-white uppercase tracking-tighter truncate group-hover:text-white/80 transition-colors">
              {beat.title}
            </h3>
          </Link>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1">
            {beat.genre} · {beat.key}
          </p>
        </div>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('1. BUY BEAT CLICKED');
            console.log('2. Parent navigation prevented');
            setIsLicensingOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all"
        >
           <ShoppingCart size={14} /> ${beat.licenses.basic.price}
        </button>
      </div>

      <LicensingModal 
        beat={beat}
        isOpen={isLicensingOpen}
        onClose={() => setIsLicensingOpen(false)}
      />
    </div>
  );
};
