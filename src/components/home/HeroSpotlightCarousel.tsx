import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Volume2, VolumeX, ShoppingBag, ArrowRight, ShieldCheck, Sparkles, Music, Upload, LayoutDashboard } from 'lucide-react';
import { useAudioStore } from '../../store/useAudioStore';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { Beat } from '../../types';
import { cn } from '../../lib/utils';

export const HeroSpotlightCarousel: React.FC = () => {
  const { setBeat, currentBeat, isPlaying, togglePlay, progress, duration, setProgress, volume, setVolume } = useAudioStore();
  const { beats } = useBeatCatalogStore();
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.8);

  const flagshipBeat: Beat | null = beats.length > 0 ? beats[0] : null;

  const isCurrentPlaying = flagshipBeat && currentBeat?.id === flagshipBeat.id && isPlaying;

  const handlePlayClick = () => {
    if (!flagshipBeat) return;
    if (currentBeat?.id === flagshipBeat.id) {
      togglePlay();
    } else {
      setBeat(flagshipBeat);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60) || 0;
    const s = Math.floor(secs % 60) || 0;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <section className="relative w-full min-h-[85vh] flex flex-col justify-center items-center overflow-hidden bg-black pt-24 pb-16 border-b border-white/10">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-900/15 blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_85%)]" />
      </div>

      <div className="relative z-10 w-full max-w-[1700px] px-6 sm:px-10 md:px-12 mx-auto">
        {/* KRAEZELVbeatz Single Producer Kicker */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-[10px] font-black uppercase tracking-[0.35em] text-purple-400 bg-purple-950/40 border border-purple-500/30 px-3.5 py-1.5 flex items-center gap-2">
            <Sparkles size={12} className="text-purple-400" /> KRAEZELVbeatz · OFFICIAL STORE
          </span>
          <div className="h-px w-16 bg-white/15 hidden sm:block" />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 hidden md:inline">
            INDEPENDENT MUSIC CATALOG
          </span>
        </div>

        {flagshipBeat ? (
          /* Live Catalog Featured Beat View */
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 flex flex-col justify-center gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-white/50">
                  <span>FEATURED RELEASE</span>
                  <span className="text-white/20">·</span>
                  <span className="text-purple-300 font-black">CATALOG #01</span>
                </div>

                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase text-white tracking-tight leading-[0.95]">
                  {flagshipBeat.title}
                </h1>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-bold uppercase tracking-wider text-white/70 pt-1">
                  <span className="text-white font-black">PRODUCED BY KRAEZELVbeatz</span>
                  <span className="text-white/30">·</span>
                  <span className="text-purple-400 font-black">{flagshipBeat.bpm} BPM</span>
                  <span className="text-white/30">·</span>
                  <span>{flagshipBeat.key}</span>
                  <span className="text-white/30">·</span>
                  <span>{flagshipBeat.genre}</span>
                </div>

                <p className="text-sm md:text-base text-white/60 leading-relaxed max-w-xl pt-2">
                  Official high-quality master produced by KRAEZELVbeatz. Ready for instant WAV, MP3, and track-out stem licensing.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={handlePlayClick}
                  className="px-8 py-4 bg-white text-black font-black uppercase tracking-[0.3em] text-xs hover:bg-neutral-200 transition-all flex items-center gap-3 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                >
                  {isCurrentPlaying ? (
                    <>
                      <Pause size={16} fill="black" /> PAUSE TRACK
                    </>
                  ) : (
                    <>
                      <Play size={16} fill="black" /> PLAY / LISTEN
                    </>
                  )}
                </button>

                <a
                  href="#beats"
                  className="px-8 py-4 border border-white/20 text-white font-black uppercase tracking-[0.3em] text-xs hover:bg-white/10 hover:border-white transition-all flex items-center gap-2"
                >
                  BROWSE BEATS <ArrowRight size={14} />
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10 mt-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xl font-black text-white tracking-tight">{beats.length}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Beats Available</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xl font-black text-white tracking-tight">24-Bit</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Master WAV Quality</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xl font-black text-white tracking-tight">Instant</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Untagged Delivery</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xl font-black text-purple-400 tracking-tight">100%</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Commercial Rights</span>
                </div>
              </div>
            </div>

            {/* Featured Audio Player Card */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-xl bg-neutral-950/80 border border-white/15 p-6 sm:p-8 backdrop-blur-xl relative shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                    <Music size={14} className="text-purple-400" />
                    <span>FEATURED PLAYER</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest bg-purple-950/60 border border-purple-500/30 px-2.5 py-1">
                    ${flagshipBeat.licenses.basic.price.toFixed(2)} STARTING
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative group w-36 h-36 sm:w-44 sm:h-44 bg-neutral-900 border border-white/10 shrink-0 overflow-hidden shadow-lg">
                    <img
                      src={flagshipBeat.artworkUrl || '/src/assets/images/beat_artwork_abstract_1791053624368.jpg'}
                      alt={flagshipBeat.title}
                      className={cn(
                        "w-full h-full object-cover transition-all duration-700",
                        isCurrentPlaying ? "scale-105 brightness-110" : "grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100"
                      )}
                    />
                    <button
                      onClick={handlePlayClick}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity"
                    >
                      <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                        {isCurrentPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
                      </div>
                    </button>
                  </div>

                  <div className="flex flex-col justify-center gap-2 text-center sm:text-left flex-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-400">
                      KRAEZELVbeatz · EXCLUSIVE MASTER
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                      {flagshipBeat.title}
                    </h3>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-bold uppercase text-white/50">
                      <span>{flagshipBeat.bpm} BPM</span>
                      <span>·</span>
                      <span>{flagshipBeat.key}</span>
                      <span>·</span>
                      <span className="text-white/80">{flagshipBeat.genre}</span>
                    </div>

                    <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
                      <a
                        href="#beats"
                        className="px-5 py-2.5 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors flex items-center gap-1.5"
                      >
                        <ShoppingBag size={12} /> LICENSE BEAT (${flagshipBeat.licenses.basic.price.toFixed(2)})
                      </a>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white/40">
                    <span>{currentBeat?.id === flagshipBeat.id ? formatTime((progress / 100) * (duration || 204)) : '0:00'}</span>
                    <span>{formatTime(duration || 204)}</span>
                  </div>

                  <div
                    className="relative w-full h-3 bg-white/10 cursor-pointer overflow-hidden group/bar"
                    onClick={(e) => {
                      if (currentBeat?.id === flagshipBeat.id) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickPos = (e.clientX - rect.left) / rect.width;
                        setProgress(clickPos * 100);
                      } else {
                        handlePlayClick();
                      }
                    }}
                  >
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-white transition-all duration-150"
                      style={{ width: `${currentBeat?.id === flagshipBeat.id ? progress : 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs font-bold text-white/50 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-purple-400" />
                    <span className="text-[9px] uppercase tracking-widest">Untagged WAV Stems Ready</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={toggleMute} className="hover:text-white transition-colors">
                      {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(parseFloat(e.target.value));
                        if (isMuted) setIsMuted(false);
                      }}
                      className="w-16 h-1 bg-white/20 accent-purple-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Storefront State - Ready for User Uploads */
          <div className="p-12 md:p-20 bg-neutral-950/90 border border-white/10 text-center flex flex-col items-center justify-center gap-8 max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="w-20 h-20 bg-purple-600/20 border border-purple-500/40 rounded-full flex items-center justify-center text-purple-400">
              <Upload size={36} />
            </div>

            <div className="space-y-3 max-w-2xl">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">
                OFFICIAL CATALOG EMPTY & READY
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">
                STORE READY FOR YOUR BEATS
              </h2>
              <p className="text-sm md:text-base text-white/60 leading-relaxed">
                All demo beats and placeholder tracks have been removed. You are the exclusive producer for this storefront. Upload your tracks in the Producer Dashboard to publish them live.
              </p>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-4">
              <Link
                to="/dashboard/upload"
                className="px-10 py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-xs hover:bg-neutral-200 transition-all flex items-center gap-3 shadow-xl"
              >
                <Upload size={16} /> UPLOAD YOUR FIRST BEAT
              </Link>
              <Link
                to="/dashboard"
                className="px-10 py-5 border border-white/20 text-white font-black uppercase tracking-[0.3em] text-xs hover:bg-white/10 transition-all flex items-center gap-3"
              >
                <LayoutDashboard size={16} /> OPEN DASHBOARD
              </Link>
            </div>

            <div className="pt-6 border-t border-white/10 w-full flex justify-center gap-8 text-[10px] font-mono text-white/40 uppercase tracking-widest">
              <span>0 Demo Tracks Remaining</span>
              <span>·</span>
              <span>100% KRAEZELVbeatz Catalog</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
