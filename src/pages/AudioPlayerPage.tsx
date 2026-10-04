import React, { useState } from 'react';
import { Play, Pause, Download, Share2, Heart, ShoppingCart, Send, Music, Upload } from 'lucide-react';
import { useAudioStore } from '../store/useAudioStore';
import { useBeatCatalogStore } from '../store/useBeatCatalogStore';
import { Link } from 'react-router-dom';
import { LicensingModal } from '../components/beats/LicensingModal';
import { FreeDownloadModal } from '../components/beats/FreeDownloadModal';

export const AudioPlayerPage = () => {
  const { setBeat, currentBeat, isPlaying, togglePlay } = useAudioStore();
  const { beats } = useBeatCatalogStore();
  const [isLicensingOpen, setIsLicensingOpen] = useState(false);
  const [isFreeModalOpen, setIsFreeModalOpen] = useState(false);

  const activeBeat = currentBeat || (beats.length > 0 ? beats[0] : null);
  const isCurrent = activeBeat && currentBeat?.id === activeBeat.id && isPlaying;

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-4 md:px-8 max-w-[1400px] mx-auto">
      {activeBeat ? (
        <>
          {/* Top Header Section */}
          <div className="flex flex-col md:flex-row gap-8 mb-12">
            <div className="w-full md:w-[300px] aspect-square bg-neutral-900 border border-white/10 shrink-0 overflow-hidden">
              <img src={activeBeat.artworkUrl || '/src/assets/images/beat_artwork_abstract_1791053624368.jpg'} alt="Track Artwork" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex flex-col justify-end gap-6 flex-1">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => isCurrent ? togglePlay() : setBeat(activeBeat)}
                    className="w-16 h-16 bg-black border border-white/20 text-white rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-2xl active:scale-95 group"
                  >
                    {isCurrent ? (
                      <Pause size={24} fill="white" />
                    ) : (
                      <Play size={24} fill="white" className="ml-1 group-hover:scale-110 transition-transform" />
                    )}
                  </button>
                  <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">{activeBeat.title}</h1>
                </div>
                <p className="text-purple-400 font-bold uppercase tracking-widest text-xs">PRODUCED BY KRAEZELVbeatz</p>
                <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  <span>BPM: {activeBeat.bpm}</span>
                  <span>KEY: {activeBeat.key}</span>
                  <span>GENRE: {activeBeat.genre}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('1. BUY BEAT CLICKED');
                    console.log('2. Parent navigation prevented');
                    setIsLicensingOpen(true);
                  }}
                  className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-neutral-200 transition-all"
                >
                  <ShoppingCart size={14} /> ${activeBeat.licenses.basic.price.toFixed(2)}
                </button>
                {activeBeat.isFree && (
                  <button 
                    onClick={() => setIsFreeModalOpen(true)}
                    className="px-6 py-3 bg-black border border-white/20 text-white font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-white hover:text-black transition-all"
                  >
                    <Download size={14} /> Free Download
                  </button>
                )}
              </div>
            </div>
          </div>

          <LicensingModal 
            beat={activeBeat}
            isOpen={isLicensingOpen}
            onClose={() => setIsLicensingOpen(false)}
          />

          <FreeDownloadModal 
            beat={activeBeat}
            isOpen={isFreeModalOpen}
            onClose={() => setIsFreeModalOpen(false)}
          />

          {/* Catalog List */}
          <div className="space-y-6 pt-12 border-t border-white/10">
            <h3 className="text-2xl font-black uppercase tracking-tight">Complete Beat Catalog ({beats.length})</h3>
            <div className="border border-white/10 bg-neutral-950 divide-y divide-white/10">
              {beats.map((beat) => (
                <div key={beat.id} className="p-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setBeat(beat)} className="p-2 border border-white/20 rounded-full hover:bg-white hover:text-black transition-colors">
                      <Play size={14} />
                    </button>
                    <span className="font-black uppercase text-sm">{beat.title}</span>
                  </div>
                  <span className="text-xs text-white/40 font-mono">${beat.licenses.basic.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="p-20 bg-neutral-950 border border-white/10 text-center flex flex-col items-center justify-center gap-6 max-w-2xl mx-auto my-12">
          <Music size={48} className="text-white/20" />
          <div className="space-y-2">
            <h2 className="text-3xl font-black uppercase text-white tracking-tight">NO BEAT SELECTED</h2>
            <p className="text-white/40 uppercase tracking-widest text-xs leading-relaxed">
              The player studio is ready. Upload beats in the Producer Dashboard to populate the active audio player catalog.
            </p>
          </div>
          <Link to="/dashboard/upload" className="px-10 py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 hover:bg-neutral-200 transition-colors">
            <Upload size={14} /> Upload First Beat
          </Link>
        </div>
      )}
    </div>
  );
};
