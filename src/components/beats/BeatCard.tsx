import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, ShoppingCart, Heart, Share2, Download } from 'lucide-react';
import { Beat } from '../../types';
import { useAudioStore } from '../../store/useAudioStore';
import { useUserPreferencesStore } from '../../store/useUserPreferencesStore';
import { LicensingModal } from './LicensingModal';
import { BeatShareModal } from '../player/BeatShareModal';
import { FreeDownloadModal } from './FreeDownloadModal';

export const BeatCard = ({ beat }: { beat: Beat }) => {
  const { setBeat, currentBeat, isPlaying, togglePlay } = useAudioStore();
  const { favorites, toggleFavorite } = useUserPreferencesStore();
  const isCurrent = currentBeat?.id === beat.id;
  const isFavorite = favorites.includes(beat.id);
  const [isLicensingOpen, setIsLicensingOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isFreeModalOpen, setIsFreeModalOpen] = useState(false);

  const isFree = beat.isFree || beat.freeDownloadEnabled;
  const isEmailRequired = beat.freeDownloadEmailRequired || beat.freeDownloadType === 'email';

  const handleFreeDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isEmailRequired) {
      setIsFreeModalOpen(true);
    } else {
      // Direct instant download without email
      import('../../services/analyticsService').then(({ logAnalyticsEvent }) => {
        logAnalyticsEvent({
          eventType: 'free_download',
          beatId: beat.id,
          beatTitle: beat.title
        });
      }).catch(() => {});

      const downloadLink = document.createElement('a');
      downloadLink.href = beat.audioUrl || '#';
      downloadLink.download = `${beat.title}_Free.mp3`;
      downloadLink.target = '_blank';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

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
           <button 
             onClick={(e) => {
               e.preventDefault();
               e.stopPropagation();
               toggleFavorite(beat.id);
             }}
             className={`w-10 h-10 bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center transition-colors cursor-pointer ${
               isFavorite ? 'text-purple-400 border-purple-500' : 'text-white hover:bg-white hover:text-black'
             }`}
             title={isFavorite ? "Remove from Favorites" : "Save to Favorites"}
           >
              <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
           </button>
           <button 
             onClick={(e) => {
               e.preventDefault();
               e.stopPropagation();
               setIsShareOpen(true);
             }}
             className="w-10 h-10 bg-black/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors"
           >
              <Share2 size={18} />
           </button>
        </div>

        {/* Bottom Tag */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
           <span className="text-[8px] font-bold uppercase tracking-widest bg-white text-black px-2 py-1">
              {beat.bpm} BPM
           </span>
           {isFree && (
             <span className="text-[8px] font-bold uppercase tracking-widest bg-emerald-500 text-black px-2 py-1">
                FREE MP3
             </span>
           )}
        </div>
      </div>

      {/* Info Container & Dual Buttons (Free + Paid) */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="min-w-0">
            <Link to={`/beat/${beat.id}`}>
              <h3 className="text-lg font-bold text-white uppercase tracking-tighter truncate group-hover:text-white/80 transition-colors">
                {beat.title}
              </h3>
            </Link>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1">
              {beat.genre} · {beat.key}
            </p>
          </div>
        </div>

        {/* Actions Bar: Simultaneous Free Download & Paid License Button */}
        <div className="flex items-center gap-2">
          {isFree && (
            <button
              onClick={handleFreeDownloadClick}
              className="flex-1 px-3 py-2 bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-black uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/30 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download size={12} /> Free MP3
            </button>
          )}

          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLicensingOpen(true);
            }}
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingCart size={12} /> Buy ${beat.licenses?.basic?.price || '29.99'}
          </button>
        </div>
      </div>

      <LicensingModal 
        beat={beat}
        isOpen={isLicensingOpen}
        onClose={() => setIsLicensingOpen(false)}
      />

      <BeatShareModal 
        beat={beat}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      <FreeDownloadModal
        beat={beat}
        isOpen={isFreeModalOpen}
        onClose={() => setIsFreeModalOpen(false)}
      />
    </div>
  );
};
