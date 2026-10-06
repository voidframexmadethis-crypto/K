import React, { useState } from 'react';
import { Play, Pause, Sparkles, Search, Disc, Volume2, ShieldCheck, ArrowRight, Radio, Sliders } from 'lucide-react';
import { useAudioStore } from '../../store/useAudioStore';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { useDiscoveryStore } from '../../store/useDiscoveryStore';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

export const KraezelvCinemaHero: React.FC = () => {
  const { beats } = useBeatCatalogStore();
  const { currentBeat, isPlaying, togglePlay, setBeat, setQueue, setRadioMode } = useAudioStore();
  const { setSearchQuery, setTag, setGenre } = useDiscoveryStore();
  const [heroSearch, setHeroSearch] = useState('');

  // Featured Hero Track: First vault beat or newest beat
  const spotlightBeat = beats.find(b => b.isVault) || beats[0];

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSearch.trim()) return;
    setSearchQuery(heroSearch);
    const catalogEl = document.getElementById('discovery-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const startKraezelvRadio = () => {
    if (beats.length === 0) return;
    setQueue(beats);
    setRadioMode(true);
    setBeat(beats[0]);
  };

  return (
    <section className="relative min-h-[92vh] bg-black text-white flex flex-col justify-between overflow-hidden border-b border-white/10 pt-24 pb-12">
      
      {/* CINEMATIC BACKDROP LAYER */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {spotlightBeat?.artworkUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-15 scale-105 filter blur-2xl transition-all duration-1000"
            style={{ backgroundImage: `url(${spotlightBeat.artworkUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black/90 to-black" />
        
        {/* Subtle glowing lines */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[200px] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      {/* TOP BRAND HEADER BADGE */}
      <div className="max-w-[1800px] mx-auto w-full px-6 md:px-12 relative z-10 pt-6">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/10 backdrop-blur-xl text-[9px] font-black uppercase tracking-[0.35em] text-purple-300">
          <Sparkles size={12} className="text-purple-400 animate-pulse" />
          <span>KRAEZELV CINEMATIC SOUND LAB</span>
          <span className="h-2 w-px bg-white/20" />
          <span className="text-white/50">{beats.length} AUTHENTIC INSTRUMENTALS</span>
        </div>
      </div>

      {/* CENTER CINEMATIC STAGE */}
      <div className="max-w-[1800px] mx-auto w-full px-6 md:px-12 relative z-10 py-12 grid lg:grid-cols-12 gap-12 items-center">
        
        {/* LEFT COLUMN: BRAND MANIFESTO & SEARCH */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-7xl xl:text-8xl font-black uppercase tracking-tighter text-white leading-[0.9]">
              KRAEZELV
            </h1>
            <p className="text-2xl sm:text-3xl font-light uppercase tracking-[0.3em] text-purple-400 font-mono">
              ENTER THE SOUND.
            </p>
            <p className="text-xs sm:text-sm text-white/60 max-w-xl font-light leading-relaxed uppercase tracking-widest">
              Premium dark cinematic production, future trap, and heavy 808s crafted for recording artists, singers, and songwriters worldwide.
            </p>
          </div>

          {/* SEARCH BAR & QUICK FILTERS */}
          <form onSubmit={handleHeroSearch} className="relative max-w-2xl bg-white/[0.03] border border-white/15 p-2 backdrop-blur-2xl flex items-center shadow-2xl focus-within:border-purple-500 transition-colors">
            <Search size={18} className="text-white/40 ml-3 mr-3 shrink-0" />
            <input 
              type="text"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              placeholder="SEARCH BY ARTIST TYPE, GENRE, BPM, KEY, MOOD..."
              className="w-full bg-transparent text-xs font-mono text-white outline-none placeholder:text-white/30 uppercase tracking-widest"
            />
            <button 
              type="submit"
              className="px-6 py-3 bg-white text-black font-black uppercase text-[10px] tracking-[0.25em] hover:bg-neutral-200 transition-all shrink-0 cursor-pointer"
            >
              SEARCH
            </button>
          </form>

          {/* QUICK CTA ACTION ROW */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a 
              href="#discovery-catalog"
              className="px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-[0.25em] hover:bg-neutral-200 transition-all flex items-center gap-3 shadow-2xl cursor-pointer"
            >
              EXPLORE CATALOG <ArrowRight size={14} />
            </a>

            <button 
              onClick={startKraezelvRadio}
              className="px-8 py-4 bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white font-black uppercase text-xs tracking-[0.25em] transition-all flex items-center gap-3 cursor-pointer"
            >
              <Radio size={14} /> LAUNCH KRAEZELV RADIO
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: SPOTLIGHT BEAT DISPLAY CARD */}
        {spotlightBeat && (
          <div className="lg:col-span-5 bg-neutral-950/80 border border-white/10 p-8 backdrop-blur-2xl space-y-6 relative group hover:border-purple-500/50 transition-all shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-400 flex items-center gap-2">
                <Sparkles size={12} /> SPOTLIGHT RELEASE
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold border border-emerald-500/30 px-2 py-0.5 bg-emerald-500/10">
                ${spotlightBeat.licenses?.basic?.price || 29.99}
              </span>
            </div>

            <div className="relative aspect-square w-full bg-neutral-900 border border-white/10 overflow-hidden group">
              <img 
                src={spotlightBeat.artworkUrl} 
                alt={spotlightBeat.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <button 
                  onClick={() => {
                    if (currentBeat?.id === spotlightBeat.id) {
                      togglePlay();
                    } else {
                      setBeat(spotlightBeat);
                    }
                  }}
                  className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
                >
                  {currentBeat?.id === spotlightBeat.id && isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight text-white group-hover:text-purple-300 transition-colors">
                {spotlightBeat.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-white/60 uppercase tracking-widest">
                <span>{spotlightBeat.bpm} BPM</span>
                <span>•</span>
                <span>KEY: {spotlightBeat.key}</span>
                <span>•</span>
                <span className="text-purple-400">{spotlightBeat.genre}</span>
              </div>
            </div>
          </div>
        )}

      </div>

    </section>
  );
};
