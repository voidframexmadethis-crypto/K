import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, ShoppingCart, Heart, Share2, Download } from 'lucide-react';
import { Beat } from '../../types';
import { useAudioStore } from '../../store/useAudioStore';
import { cn } from '../../lib/utils';
import { LicensingModal } from './LicensingModal';
import { FreeDownloadModal } from './FreeDownloadModal';

export const PremiumBeatCard = ({ beat, variant = 'default' }: { beat: Beat, variant?: 'default' | 'large' }) => {
  const { setBeat, currentBeat, isPlaying, togglePlay } = useAudioStore();
  const isCurrent = currentBeat?.id === beat.id;
  const [isLicensingOpen, setIsLicensingOpen] = useState(false);
  const [isFreeModalOpen, setIsFreeModalOpen] = useState(false);

  const isFree = beat.isFree || beat.freeDownloadEnabled;
  const isEmailRequired = beat.freeDownloadEmailRequired || beat.freeDownloadType === 'email';

  const handleFreeDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isEmailRequired) {
      setIsFreeModalOpen(true);
    } else {
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
    <div className={cn(
      "group flex flex-col gap-8 transition-all duration-700",
      variant === 'large' ? "md:col-span-2 lg:col-span-1" : ""
    )}>
      {/* Artwork Section */}
      <div className="relative aspect-square overflow-hidden bg-neutral-900 border border-white/5 shadow-2xl">
        <img 
          src={beat.artworkUrl} 
          alt={beat.title}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110 ease-expo"
        />
        
        {/* Interaction Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
           <button 
             onClick={() => isCurrent ? togglePlay() : setBeat(beat)}
             className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-[0_0_50px_rgba(255,255,255,0.2)] active:scale-95"
           >
             {isCurrent && isPlaying ? (
               <div className="flex gap-1.5 items-end h-8">
                 <div className="w-1.5 h-6 bg-black animate-pulse" />
                 <div className="w-1.5 h-8 bg-black animate-pulse delay-75" />
                 <div className="w-1.5 h-4 bg-black animate-pulse delay-150" />
               </div>
             ) : (
               <Play size={32} fill="currentColor" className="ml-1.5" />
             )}
           </button>
        </div>

        {/* Floating Metadata */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
           <span className="px-3 py-1 bg-black/80 backdrop-blur-md border border-white/10 text-[8px] font-black uppercase tracking-[0.3em] text-white">
             {beat.bpm} BPM
           </span>
           <div className="flex flex-col gap-2">
              <button className="w-10 h-10 bg-black/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                <Heart size={18} />
              </button>
              <button className="w-10 h-10 bg-black/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                <Share2 size={18} />
              </button>
           </div>
        </div>

        {/* Free Tag */}
        {isFree && (
          <div className="absolute bottom-6 left-6">
            <span className="px-4 py-2 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-[0.4em]">Free Download</span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-2 min-w-0">
            <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter truncate leading-tight">
              {beat.title}
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
              <span>{beat.genre}</span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span>{beat.key}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">From</span>
             <span className="text-xl font-black text-white">${beat.licenses?.basic?.price || '29.99'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           {isFree && (
             <button 
               onClick={handleFreeDownloadClick}
               className="py-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
             >
               <Download size={14} /> Free MP3
             </button>
           )}
           <button 
             onClick={(e) => {
               e.preventDefault();
               e.stopPropagation();
               setIsLicensingOpen(true);
             }}
             className="py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
           >
             <ShoppingCart size={14} /> License ${beat.licenses?.basic?.price || '29.99'}
           </button>
        </div>
      </div>

      <LicensingModal 
        beat={beat}
        isOpen={isLicensingOpen}
        onClose={() => setIsLicensingOpen(false)}
      />

      <FreeDownloadModal
        beat={beat}
        isOpen={isFreeModalOpen}
        onClose={() => setIsFreeModalOpen(false)}
      />
    </div>
  );
};
