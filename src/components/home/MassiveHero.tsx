import React from 'react';
import { Play, Heart, Share2, Download, ShoppingCart, Volume2, SkipBack, SkipForward, Maximize2, MoreHorizontal } from 'lucide-react';
import { useAudioStore } from '../../store/useAudioStore';
import { cn } from '../../lib/utils';

export const MassiveHero = () => {
  const artwork = '/src/assets/images/hero_valkyrie_massive_1791054144327.jpg';

  const featuredBeat = {
    id: 'valkyrie-massive',
    title: 'VALKYRIE',
    producerId: 'KRAEZELV',
    bpm: 144,
    key: 'C MINOR',
    genre: 'DARK TRAP',
    tags: ['AGGRESSIVE', 'CINEMATIC', 'HARD'],
    moods: ['DARK'],
    slug: 'valkyrie',
    isPrivate: false,
    isBootleg: false,
    instruments: [],
    audioUrl: '', 
    artworkUrl: artwork,
    isFree: false,
    licenses: { 
      basic: { price: 29.99, enabled: true }, 
      premium: { price: 49.99, enabled: true }, 
      unlimited: { price: 99.99, enabled: true }, 
      exclusive: { price: 499.99, enabled: true } 
    },
    createdAt: new Date().toISOString(),
    published: true
  };

  const { setBeat, currentBeat, isPlaying, togglePlay, progress, duration, setProgress, volume, setVolume } = useAudioStore();
  const isCurrent = currentBeat?.id === featuredBeat.id;

  const heroImg = '/src/assets/images/hero_valkyrie_massive_1791054144327.jpg';

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="relative w-full min-h-[100vh] flex flex-col justify-center items-center overflow-hidden pt-20">
      {/* Background Layering */}
      <div className="absolute inset-0 z-0">
        <img src={heroImg} className="w-full h-full object-cover scale-110 blur-[1px] brightness-[0.3]" alt="Background" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-[1800px] px-6 md:px-12 grid lg:grid-cols-12 gap-16 items-center flex-1">
        {/* Left: Info */}
        <div className="lg:col-span-6 flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="h-px w-12 bg-white/20" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60">Flagship Release</span>
            </div>
            <h1 className="text-[10rem] md:text-[14rem] font-black tracking-[-0.05em] text-white leading-[0.8] uppercase select-none">
              {featuredBeat.title}
            </h1>
            <div className="flex flex-wrap items-center gap-8 mt-4">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Producer</span>
                <span className="text-xs font-bold text-white uppercase tracking-[0.2em]">{featuredBeat.producerId}</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">BPM / Key</span>
                <span className="text-xs font-bold text-white uppercase tracking-[0.2em]">{featuredBeat.bpm} / {featuredBeat.key}</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Genre</span>
                <span className="text-xs font-bold text-white uppercase tracking-[0.2em]">{featuredBeat.genre}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-12">
            <div className="flex flex-wrap gap-6">
              <button 
                onClick={() => setBeat(featuredBeat)}
                className="px-16 py-8 bg-white text-black font-black uppercase tracking-[0.4em] text-xs hover:bg-neutral-200 transition-all active:scale-95 flex items-center gap-4 group"
              >
                <Play size={20} fill="black" className="group-hover:scale-110 transition-transform" /> Start Experience
              </button>
              <button className="px-12 py-8 border border-white/20 text-white font-black uppercase tracking-[0.4em] text-xs hover:bg-white hover:text-black transition-all active:scale-95">
                License — $29.99
              </button>
            </div>

            <div className="flex items-center gap-10">
              <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                <Heart size={16} /> 2.4k Favorites
              </button>
              <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                <Share2 size={16} /> Share Experience
              </button>
              <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                <Download size={16} /> Free Download
              </button>
            </div>
          </div>
        </div>

        {/* Right: Integrated Massive Player */}
        <div className="lg:col-span-6 flex flex-col gap-8 h-full justify-center">
          <div className="relative group aspect-square lg:aspect-auto lg:h-[600px] w-full bg-black border border-white/5 overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.02)]">
            <img src={artwork} className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 transition-opacity duration-1000" alt="Artwork" />
            
            {/* Visualizer Simulation */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent flex items-end px-12 pb-12 gap-1">
               {Array.from({ length: 60 }).map((_, i) => (
                 <div 
                   key={i} 
                   className={cn(
                     "flex-1 bg-white/20 transition-all duration-300",
                     isPlaying ? "animate-pulse" : "h-1"
                   )}
                   style={{ height: isPlaying ? `${Math.random() * 60 + 5}%` : '4px' }}
                 />
               ))}
            </div>

            {/* Central Controls */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-12 z-10">
               <button 
                 onClick={() => isCurrent ? togglePlay() : setBeat(featuredBeat)}
                 className="w-40 h-40 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500 hover:scale-105 active:scale-95 group/btn"
               >
                 {isCurrent && isPlaying ? (
                   <div className="flex gap-2 items-end h-12">
                     <div className="w-2 h-8 bg-white group-hover:bg-black animate-pulse" />
                     <div className="w-2 h-12 bg-white group-hover:bg-black animate-pulse delay-75" />
                     <div className="w-2 h-6 bg-white group-hover:bg-black animate-pulse delay-150" />
                   </div>
                 ) : (
                   <Play size={48} fill="currentColor" className="ml-2 group-hover/btn:scale-110 transition-transform" />
                 )}
               </button>

               <div className="flex items-center gap-12">
                 <button className="text-white/40 hover:text-white transition-colors"><SkipBack size={32} /></button>
                 <button className="text-white/40 hover:text-white transition-colors"><SkipForward size={32} /></button>
               </div>
            </div>

            {/* Metadata Overlay */}
            <div className="absolute top-12 right-12 flex flex-col items-end gap-2 text-right">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Next in Queue</span>
               <span className="text-xs text-white/40 uppercase tracking-[0.2em]">Stars | Southside Type...</span>
            </div>
          </div>

          {/* Player Progress Sub-Bar */}
          <div className="flex flex-col gap-4 px-2">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
               <span className="tabular-nums">{formatTime(progress)}</span>
               <span className="tabular-nums">{formatTime(duration)}</span>
            </div>
            <div className="relative w-full h-1 bg-white/5 group cursor-pointer">
              <div 
                className="absolute top-0 left-0 h-full bg-white transition-all duration-100" 
                style={{ width: `${(progress / duration) * 100}%` }}
              />
              <input 
                type="range"
                min={0}
                max={duration || 100}
                value={progress}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  // Logic to seek would be here
                }}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Bottom Anchor */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-bounce">
         <div className="w-px h-12 bg-gradient-to-b from-transparent to-white/40" />
         <span className="text-[8px] font-bold uppercase tracking-[0.6em] text-white/20">Explore Ecosystem</span>
      </div>
    </section>
  );
};
