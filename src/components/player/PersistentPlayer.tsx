import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Download, Share2, Heart, Shuffle, Repeat, ListMusic, X, Check, ShoppingBag } from 'lucide-react';
import { useAudioStore } from '../../store/useAudioStore';
import { LicensingModal } from '../beats/LicensingModal';
import { cn } from '../../lib/utils';

export const PersistentPlayer = () => {
  const { 
    currentBeat, isPlaying, volume, progress, duration, 
    togglePlay, setPlaying, setProgress, setDuration, next, previous, setVolume,
    isShuffle, toggleShuffle, repeatMode, setRepeatMode, isQueueOpen, toggleQueue,
    queue, removeFromQueue
  } = useAudioStore();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLicenseOpen, setIsLicenseOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentBeat, setPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShare = () => {
    const url = `${window.location.origin}/beat/${currentBeat?.slug || 'track'}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSeek = (percentage: number) => {
    const newTime = (percentage / 100) * (duration || 100);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  if (!currentBeat) return null;

  const currentProgressPercent = duration ? (progress / duration) * 100 : 0;

  // Digital Waveform Bars pattern
  const waveformBarHeights = [
    30, 45, 60, 80, 50, 40, 90, 100, 70, 55, 85, 40, 60, 75, 95, 80, 60, 40, 70, 85,
    90, 60, 40, 75, 95, 100, 80, 50, 30, 60, 70, 85, 90, 60, 45, 75, 80, 95, 60, 40,
    50, 70, 85, 95, 80, 60, 40, 75, 90, 60, 45, 80, 100, 70, 50, 30, 60, 75, 85, 40
  ];

  return (
    <>
      {/* Queue Drawer */}
      <div 
        className={cn(
          "fixed right-0 bottom-[104px] w-full md:w-96 bg-black/95 backdrop-blur-3xl border-l border-t border-white/10 z-[190] transition-all duration-700 ease-expo overflow-hidden shadow-[0_-20px_100px_rgba(0,0,0,0.5)]",
          isQueueOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        )}
        style={{ height: 'calc(100vh - 184px)' }}
      >
        <div className="p-8 flex flex-col h-full gap-8">
           <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white">Up Next</h3>
              <button onClick={toggleQueue} className="text-white/40 hover:text-white transition-colors">
                 <X size={20} />
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-4">
              {queue.length > 0 ? queue.map((beat, i) => (
                <div key={beat.id + i} className="group flex items-center gap-4 p-3 bg-white/5 border border-white/5 hover:border-white/20 transition-all">
                   <img src={beat.artworkUrl} className="w-12 h-12 object-cover grayscale" alt="Artwork" />
                   <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-white truncate uppercase">{beat.title}</p>
                      <p className="text-[8px] text-white/40 uppercase tracking-widest">{beat.producerId}</p>
                   </div>
                   <button 
                     onClick={() => removeFromQueue(beat.id)}
                     className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-white transition-all"
                   >
                     <X size={14} />
                   </button>
                </div>
              )) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
                   <ListMusic size={40} className="mb-4" />
                   <p className="text-[10px] uppercase tracking-widest">Queue is empty</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Sticky Bottom Player Canvas */}
      <div className="fixed bottom-0 left-0 w-full bg-black/95 backdrop-blur-2xl border-t border-white/10 z-[200] py-4 shadow-[0_-20px_80px_rgba(0,0,0,0.9)]">
        <audio
          ref={audioRef}
          src={currentBeat.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={next}
        />
        
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 grid grid-cols-12 gap-8 items-center">
          {/* Track Info */}
          <div className="col-span-3 flex items-center gap-6 min-w-0">
            <div className="relative group overflow-hidden shrink-0">
              <img 
                src={currentBeat.artworkUrl} 
                alt={currentBeat.title}
                className="w-14 h-14 md:w-16 md:h-16 object-cover bg-neutral-900 border border-white/10 grayscale"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <Maximize2 size={16} className="text-white" />
              </div>
            </div>
            <div className="min-w-0 flex flex-col gap-1">
              <h4 className="text-base md:text-lg font-black text-white truncate uppercase tracking-tighter leading-tight">
                {currentBeat.title}
              </h4>
              <div className="flex items-center gap-2 text-[8px] md:text-[9px] text-white/40 font-bold uppercase tracking-[0.2em] truncate">
                <span>{currentBeat.producerId}</span>
                <span className="w-px h-2 bg-white/10" />
                <span>{currentBeat.bpm} BPM</span>
                <span className="w-px h-2 bg-white/10" />
                <span>{currentBeat.key}</span>
              </div>
            </div>
          </div>

          {/* Central Waveform Tracker & Controls */}
          <div className="col-span-6 flex flex-col items-center gap-3">
            <div className="flex items-center gap-8">
              <button 
                onClick={toggleShuffle}
                className={cn("transition-colors hidden sm:block", isShuffle ? "text-white" : "text-white/20 hover:text-white")}
              >
                <Shuffle size={16} />
              </button>
              
              <button onClick={previous} className="text-white/40 hover:text-white transition-colors">
                <SkipBack size={20} />
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95"
              >
                {isPlaying ? (
                  <div className="flex gap-1 items-end h-4">
                     <div className="w-1 h-3 bg-black animate-pulse" />
                     <div className="w-1 h-4 bg-black animate-pulse delay-75" />
                     <div className="w-1 h-2 bg-black animate-pulse delay-150" />
                  </div>
                ) : (
                  <Play size={20} fill="black" className="ml-0.5" />
                )}
              </button>
              
              <button onClick={next} className="text-white/40 hover:text-white transition-colors">
                <SkipForward size={20} />
              </button>

              <button 
                onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
                className={cn("transition-colors hidden sm:block", repeatMode !== 'none' ? "text-white" : "text-white/20 hover:text-white")}
              >
                <Repeat size={16} className={cn(repeatMode === 'one' && "stroke-[3]")} />
              </button>
            </div>
            
            {/* Digital Waveform Progress Tracker */}
            <div className="w-full flex items-center gap-4">
              <span className="text-[9px] font-black tabular-nums text-white/40 min-w-[36px] text-right">
                {formatTime(progress)}
              </span>

              {/* Scrubbable Waveform Display */}
              <div 
                className="flex-1 h-8 flex items-center gap-[2px] relative cursor-pointer group px-1"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const percent = (clickX / rect.width) * 100;
                  handleSeek(percent);
                }}
              >
                {waveformBarHeights.map((height, i) => {
                  const barPercent = (i / waveformBarHeights.length) * 100;
                  const isPlayed = barPercent <= currentProgressPercent;

                  return (
                    <div 
                      key={i}
                      className={cn(
                        "flex-1 transition-all duration-150 rounded-full",
                        isPlayed ? "bg-white" : "bg-white/10 group-hover:bg-white/20"
                      )}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>

              <span className="text-[9px] font-black tabular-nums text-white/40 min-w-[36px]">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Secondary Utilities & Quick Licensing Shortcut */}
          <div className="col-span-3 flex items-center justify-end gap-4 md:gap-6">
            {/* Volume Control */}
            <div className="hidden xl:flex items-center gap-3 group">
              <Volume2 size={16} className="text-white/40 group-hover:text-white transition-colors" />
              <div className="w-20 h-1 bg-white/10 relative cursor-pointer">
                <div 
                  className="absolute top-0 left-0 h-full bg-white" 
                  style={{ width: `${volume * 100}%` }}
                />
                <input 
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <button 
              onClick={handleShare}
              title="Share Track"
              className="p-2 text-white/40 hover:text-white transition-colors relative"
            >
              {copiedLink ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
            </button>

            <button 
              onClick={() => setIsLiked(!isLiked)}
              title="Favorite"
              className={cn("p-2 transition-colors", isLiked ? "text-white" : "text-white/40 hover:text-white")}
            >
              <Heart size={16} fill={isLiked ? "white" : "none"} />
            </button>

            <button 
              onClick={toggleQueue}
              className={cn("p-2 transition-colors", isQueueOpen ? "text-white" : "text-white/40 hover:text-white")}
            >
              <ListMusic size={16} />
            </button>

            {/* Constant Licensing Shortcut Button */}
            <button 
              onClick={() => setIsLicenseOpen(true)}
              className="px-6 md:px-8 py-3 bg-white text-black text-[9px] font-black uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all active:scale-95 shadow-2xl flex items-center gap-2 shrink-0"
            >
              <ShoppingBag size={12} /> License
            </button>
          </div>
        </div>
      </div>

      {/* Constant Licensing Modal */}
      <LicensingModal 
        beat={currentBeat}
        isOpen={isLicenseOpen}
        onClose={() => setIsLicenseOpen(false)}
      />
    </>
  );
};

