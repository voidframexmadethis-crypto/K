import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, 
  Download, Share2, Heart, Shuffle, Repeat, ListMusic, X, Check, 
  ShoppingBag, Sparkles, Cpu, Sliders, Radio
} from 'lucide-react';
import { useAudioStore } from '../../store/useAudioStore';
import { LicensingModal } from '../beats/LicensingModal';
import { BeatShareModal } from './BeatShareModal';
import { SpotifyMasteringStudioModal } from './SpotifyMasteringStudioModal';
import { hiFiAudioEngine, MASTER_PRESETS, MasterPresetId } from '../../lib/hiFiAudioEngine';
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
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMasteringStudioOpen, setIsMasteringStudioOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [activeDspPreset, setActiveDspPreset] = useState<MasterPresetId>('spotify_master_14lufs');
  const [showDspMenu, setShowDspMenu] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      // Initialize 32-bit DSP Engine
      hiFiAudioEngine.initialize(audioRef.current);

      if (isPlaying) {
        hiFiAudioEngine.resume();
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

  const handlePresetChange = (presetId: MasterPresetId) => {
    setActiveDspPreset(presetId);
    hiFiAudioEngine.applyPreset(presetId);
    setShowDspMenu(false);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShare = () => {
    setIsShareOpen(true);
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
  const currentDspObject = MASTER_PRESETS.find(p => p.id === activeDspPreset) || MASTER_PRESETS[0];

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
      <div className="fixed bottom-0 left-0 w-full bg-black/95 backdrop-blur-2xl border-t border-white/10 z-[200] py-3 shadow-[0_-20px_80px_rgba(0,0,0,0.9)]">
        <audio
          ref={audioRef}
          src={currentBeat.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={next}
          crossOrigin="anonymous"
        />
        
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 grid grid-cols-12 gap-6 items-center">
          {/* Track Info & DSP Engine Selector */}
          <div className="col-span-3 flex items-center gap-5 min-w-0">
            <div className="relative group overflow-hidden shrink-0">
              <img 
                src={currentBeat.artworkUrl} 
                alt={currentBeat.title}
                className="w-14 h-14 md:w-16 md:h-16 object-cover bg-neutral-900 border border-white/10 grayscale"
              />
            </div>

            <div className="min-w-0 flex flex-col gap-1">
              <h4 className="text-base md:text-lg font-black text-white truncate uppercase tracking-tighter leading-tight">
                {currentBeat.title}
              </h4>

              <div className="flex items-center gap-2 text-[8px] md:text-[9px] text-white/40 font-bold uppercase tracking-[0.15em] truncate">
                <span>{currentBeat.producerId}</span>
                <span className="w-px h-2 bg-white/10" />
                <span>{currentBeat.bpm} BPM</span>
              </div>

              {/* Master Audio DSP Badge */}
              <div className="relative flex items-center gap-1.5">
                <button
                  onClick={() => setShowDspMenu(!showDspMenu)}
                  className="px-2 py-0.5 bg-gradient-to-r from-purple-500/20 to-emerald-500/20 border border-purple-500/30 text-purple-300 text-[8px] font-black uppercase tracking-widest flex items-center gap-1 hover:border-purple-400 transition-all rounded-sm mt-0.5"
                >
                  <Sparkles size={10} className="text-purple-400" />
                  {currentDspObject.badge}
                </button>

                <button
                  onClick={() => setIsMasteringStudioOpen(true)}
                  className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[8px] font-black uppercase tracking-widest flex items-center gap-1 hover:bg-emerald-500/30 transition-all rounded-sm mt-0.5"
                  title="Open Spotify -14 LUFS Mastering Studio"
                >
                  <Sliders size={10} className="text-emerald-400" />
                  Spotify Studio
                </button>

                {/* DSP Presets Selector Menu */}
                {showDspMenu && (
                  <div className="absolute left-0 bottom-full mb-2 w-72 bg-neutral-950 border border-white/20 p-3 shadow-2xl z-[220] flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-purple-400 border-b border-white/10 pb-2">
                      <span>Hi-Fi Audio DSP Processing Engine</span>
                      <button 
                        onClick={() => { setShowDspMenu(false); setIsMasteringStudioOpen(true); }}
                        className="text-[8px] text-emerald-400 hover:underline"
                      >
                        Open Studio ⚙️
                      </button>
                    </div>
                    {MASTER_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handlePresetChange(p.id)}
                        className={`p-2 border text-left text-[10px] font-bold transition-all flex flex-col gap-0.5 ${
                          activeDspPreset === p.id 
                            ? 'bg-purple-600 text-white border-purple-400' 
                            : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{p.name}</span>
                          <span className="text-[8px] font-mono opacity-80">{p.badge}</span>
                        </div>
                        <span className="text-[8px] opacity-60 font-normal">{p.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Central Waveform Tracker & Controls */}
          <div className="col-span-6 flex flex-col items-center gap-2">
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
                className="flex-1 h-7 flex items-center gap-[2px] relative cursor-pointer group px-1"
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

          {/* Secondary Utilities, Free Download & Paid Licensing */}
          <div className="col-span-3 flex items-center justify-end gap-3 md:gap-4">
            {/* Volume Control */}
            <div className="hidden xl:flex items-center gap-2 group">
              <Volume2 size={16} className="text-white/40 group-hover:text-white transition-colors" />
              <div className="w-16 h-1 bg-white/10 relative cursor-pointer">
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
              onClick={() => setIsShareOpen(true)}
              title="Share Track"
              className="p-2 text-white/40 hover:text-white transition-colors relative"
            >
              <Share2 size={16} />
            </button>

            <button 
              onClick={toggleQueue}
              className={cn("p-2 transition-colors", isQueueOpen ? "text-white" : "text-white/40 hover:text-white")}
            >
              <ListMusic size={16} />
            </button>

            {/* If track has Free Download enabled, show Free Download Button */}
            {currentBeat.isFree && (
              <a
                href={currentBeat.audioUrl || '#'}
                download={`${currentBeat.title}_Free.mp3`}
                className="px-3.5 py-2.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-black uppercase tracking-wider hover:bg-emerald-500/30 transition-all flex items-center gap-1.5 shrink-0"
              >
                <Download size={12} /> Free MP3
              </a>
            )}

            {/* Paid Licensing Button */}
            <button 
              onClick={() => setIsLicenseOpen(true)}
              className="px-5 py-2.5 bg-white text-black text-[9px] font-black uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all active:scale-95 shadow-2xl flex items-center gap-1.5 shrink-0"
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

      {/* BeatStars-style Track Share & Embed Modal */}
      <BeatShareModal 
        beat={currentBeat}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      {/* Spotify -14 LUFS Mastering Studio Suite Modal */}
      <SpotifyMasteringStudioModal 
        beat={currentBeat}
        isOpen={isMasteringStudioOpen}
        onClose={() => setIsMasteringStudioOpen(false)}
      />
    </>
  );
};
