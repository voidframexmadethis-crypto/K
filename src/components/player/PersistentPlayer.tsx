import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, 
  Download, Share2, Heart, Shuffle, Repeat, ListMusic, X, Check, 
  ShoppingBag, Sparkles, Cpu, Sliders, Radio
} from 'lucide-react';
import { useAudioStore } from '../../store/useAudioStore';
import { LicensingModal } from '../beats/LicensingModal';
import { FreeDownloadModal } from '../beats/FreeDownloadModal';
import { BeatShareModal } from './BeatShareModal';
import { SpotifyMasteringStudioModal } from './SpotifyMasteringStudioModal';
import { hiFiAudioEngine, MASTER_PRESETS, MasterPresetId } from '../../lib/hiFiAudioEngine';
import { cn } from '../../lib/utils';

function getPlayableAudioUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // Rewrite Internet Archive details page links to direct download/stream links
  if (trimmed.includes('archive.org/details/')) {
    return trimmed.replace('archive.org/details/', 'archive.org/download/');
  }

  return trimmed;
}

export const PersistentPlayer = () => {
  const { 
    currentBeat, isPlaying, volume, progress, duration, 
    togglePlay, setPlaying, setProgress, setDuration, next, previous, setVolume,
    isShuffle, toggleShuffle, repeatMode, setRepeatMode, isQueueOpen, toggleQueue,
    queue, removeFromQueue
  } = useAudioStore();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrlRef = useRef<string>('');
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const [isLicenseOpen, setIsLicenseOpen] = useState(false);
  const [isFreeModalOpen, setIsFreeModalOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMasteringStudioOpen, setIsMasteringStudioOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [activeDspPreset, setActiveDspPreset] = useState<MasterPresetId>('streaming');
  const [showDspMenu, setShowDspMenu] = useState(false);

  // Runtime Audio Diagnostic Reporter conforming strictly to Step 8
  const logAudioDiagnostic = (label: string, extra?: { requestStatus?: string; cspBlocked?: boolean; error?: any }) => {
    const audio = audioRef.current;
    console.log('[ AUDIO_DIAGNOSTIC ]', {
      event: label,
      src: audio?.src || '',
      currentSrc: audio?.currentSrc || '',
      readyState: audio?.readyState ?? 0,
      networkState: audio?.networkState ?? 0,
      paused: audio?.paused ?? true,
      muted: audio?.muted ?? false,
      volume: audio?.volume ?? 1,
      error: audio?.error ? { code: audio.error.code, message: audio.error.message } : (extra?.error || null),
      requestStatus: extra?.requestStatus || (audio?.readyState && audio.readyState >= 2 ? 'OK' : (audio?.src ? 'LOADING' : 'IDLE')),
      cspBlocked: extra?.cspBlocked ?? false
    });
  };

  // Monitor CSP security policy violations on media/connect requests
  useEffect(() => {
    const handleCspViolation = (e: SecurityPolicyViolationEvent) => {
      const uri = e.blockedURI || '';
      if (
        e.effectiveDirective === 'media-src' ||
        e.effectiveDirective === 'connect-src' ||
        uri.includes('.mp3') ||
        uri.includes('.m4a') ||
        uri.includes('archive.org') ||
        uri.includes('/api/audio/proxy')
      ) {
        console.error('[ AUDIO_DIAGNOSTIC ] CSP_BLOCKED_MEDIA:', {
          blockedURI: uri,
          directive: e.effectiveDirective,
          policy: e.originalPolicy
        });
        logAudioDiagnostic('CSP_VIOLATION', { cspBlocked: true });
      }
    };
    window.addEventListener('securitypolicyviolation', handleCspViolation);
    return () => window.removeEventListener('securitypolicyviolation', handleCspViolation);
  }, []);

  useEffect(() => {
    const handleOpenFreeDownload = (event: any) => {
      if (event.detail.beat.id === currentBeat?.id) {
        setIsFreeModalOpen(true);
      }
    };
    window.addEventListener('open-free-download-modal', handleOpenFreeDownload);
    return () => {
      window.removeEventListener('open-free-download-modal', handleOpenFreeDownload);
    };
  }, [currentBeat]);

  // Handle Beat Selection, Audio Loading, and Play/Pause Lifecycle Safely
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentBeat) return;

    const rawUrl = currentBeat.audioUrl || currentBeat.storage?.durableUrl || '';
    const playableUrl = getPlayableAudioUrl(rawUrl);

    if (!playableUrl) {
      console.warn('[AUDIO_PLAYER] Missing audio URL for beat:', currentBeat.id, currentBeat.title);
      setPlaybackError('No master audio URL attached');
      setPlaying(false);
      return;
    }

    // Track change detection
    if (currentAudioUrlRef.current !== playableUrl) {
      console.log(`[AUDIO_PLAYER] Loading master audio track [${currentBeat.title}]:`, playableUrl);
      currentAudioUrlRef.current = playableUrl;
      setPlaybackError(null);

      // 1. Stop current playback safely
      audio.pause();

      // 2. Assign new playable source URL
      audio.src = playableUrl;

      // 3. Reset progress state
      setProgress(0);
      setDuration(0);

      // 4. Trigger explicit load
      audio.load();

      // 5. Initialize Web Audio DSP Engine
      try {
        hiFiAudioEngine.initialize(audio);
      } catch (e) {
        console.warn('[AUDIO_PLAYER] DSP Engine Init note:', e);
      }

      // 6. Safe play when ready
      const playWhenReady = () => {
        if (useAudioStore.getState().isPlaying) {
          hiFiAudioEngine.resume();
          audio.play().catch((err: any) => {
            console.warn('[AUDIO_PLAYER] Deferred play error:', err?.message || err);
            setPlaying(false);
          });
        }
      };

      if (audio.readyState >= 2) {
        playWhenReady();
      } else {
        const handleCanPlay = () => {
          audio.removeEventListener('canplay', handleCanPlay);
          audio.removeEventListener('loadeddata', handleCanPlay);
          playWhenReady();
        };
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('loadeddata', handleCanPlay);
      }
    } else {
      // Toggle play/pause on current track
      if (isPlaying) {
        hiFiAudioEngine.resume();
        if (audio.readyState < 2) {
          const handleCanPlay = () => {
            audio.removeEventListener('canplay', handleCanPlay);
            if (useAudioStore.getState().isPlaying) {
              audio.play().catch((err) => {
                console.warn('[AUDIO_PLAYER] Play error:', err?.message || err);
                setPlaying(false);
              });
            }
          };
          audio.addEventListener('canplay', handleCanPlay);
        } else {
          audio.play().catch((err) => {
            console.warn('[AUDIO_PLAYER] Play error:', err?.message || err);
            setPlaying(false);
          });
        }
      } else {
        audio.pause();
      }
    }
  }, [currentBeat?.id, currentBeat?.audioUrl, isPlaying]);

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

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const audio = e.currentTarget;
    const err = audio.error;
    const currentSrc = audio.src;

    console.error('[AUDIO_PLAYER_ERROR] Media element error:', {
      code: err?.code,
      message: err?.message,
      currentSrc,
      beatTitle: currentBeat?.title
    });

    // Attempt server audio proxy fallback if direct stream fails due to CORS or range headers
    if (currentBeat?.audioUrl && !currentSrc.includes('/api/audio/proxy')) {
      const directUrl = getPlayableAudioUrl(currentBeat.audioUrl);
      const proxyUrl = `/api/audio/proxy?url=${encodeURIComponent(directUrl)}`;
      console.log('[AUDIO_PLAYER] Attempting server proxy fallback:', proxyUrl);
      audio.src = proxyUrl;
      audio.load();
      if (isPlaying) {
        audio.play().catch(() => setPlaying(false));
      }
      return;
    }

    setPlaybackError('Audio playback error (format or media host issue)');
    setPlaying(false);
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
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            handleLoadedMetadata();
            logAudioDiagnostic('LOADED_METADATA');
          }}
          onCanPlay={() => logAudioDiagnostic('CAN_PLAY')}
          onPlay={() => logAudioDiagnostic('PLAY')}
          onPlaying={() => logAudioDiagnostic('PLAYING')}
          onPause={() => logAudioDiagnostic('PAUSE')}
          onError={(e) => {
            handleAudioError(e);
            logAudioDiagnostic('AUDIO_ERROR', { error: audioRef.current?.error });
          }}
          onEnded={next}
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

              {/* Master Audio DSP Mode Indicator Badge & Playback Error Indicator */}
              <div className="relative flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setIsMasteringStudioOpen(true)}
                  className={`px-2 py-0.5 border text-[8px] font-black uppercase tracking-widest flex items-center gap-1 transition-all rounded-sm mt-0.5 ${
                    hiFiAudioEngine.getSettings().isBypassed || hiFiAudioEngine.getSettings().mode === 'RAW'
                      ? 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
                      : hiFiAudioEngine.getSettings().mode === 'KNOCK'
                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30'
                      : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                  }`}
                  title="Open DSP Mastering Studio"
                >
                  <Sliders size={10} className="shrink-0" />
                  <span>DSP: {hiFiAudioEngine.getSettings().isBypassed ? 'RAW' : hiFiAudioEngine.getSettings().mode}</span>
                </button>

                {playbackError && (
                  <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/40 text-red-400 text-[8px] font-mono font-bold uppercase tracking-widest rounded-sm mt-0.5">
                    {playbackError}
                  </span>
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
            {(currentBeat.isFree || currentBeat.freeDownloadEnabled) && (
              <button
                onClick={() => {
                  if (currentBeat.freeDownloadEmailRequired || currentBeat.freeDownloadType === 'email') {
                    setIsFreeModalOpen(true);
                  } else {
                    const downloadLink = document.createElement('a');
                    downloadLink.href = currentBeat.audioUrl || '#';
                    downloadLink.download = `${currentBeat.title}_Free.mp3`;
                    downloadLink.target = '_blank';
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                  }
                }}
                className="px-3.5 py-2.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-black uppercase tracking-wider hover:bg-emerald-500/30 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Download size={12} /> Free MP3
              </button>
            )}

            {/* Paid Licensing Button */}
            <button 
              onClick={() => setIsLicenseOpen(true)}
              className="px-5 py-2.5 bg-white text-black text-[9px] font-black uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all active:scale-95 shadow-2xl flex items-center gap-1.5 shrink-0 cursor-pointer"
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

      {/* Free Download Email Gate Modal */}
      <FreeDownloadModal
        beat={currentBeat}
        isOpen={isFreeModalOpen}
        onClose={() => setIsFreeModalOpen(false)}
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
