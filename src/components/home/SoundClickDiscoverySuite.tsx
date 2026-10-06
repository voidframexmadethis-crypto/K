import React, { useState } from 'react';
import { 
  Play, Pause, Heart, ShoppingBag, Music, SlidersHorizontal, Grid, List, 
  Clock, Flame, Award, HelpCircle, Star, Sparkles, X, ChevronDown, Check, Activity, Info
} from 'lucide-react';
import { useAudioStore } from '../../store/useAudioStore';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { useDiscoveryStore } from '../../store/useDiscoveryStore';
import { useCartStore } from '../../store/useCartStore';
import { Beat } from '../../types';
import { cn } from '../../lib/utils';
import { LicensingModal } from '../beats/LicensingModal';
import { QuickInfoModal } from '../beats/QuickInfoModal';

const TrackWaveform: React.FC<{ beatId: string; bars: number[] }> = ({ beatId, bars }) => {
  const isCurrent = useAudioStore(state => state.currentBeat?.id === beatId);
  const progress = useAudioStore(state => isCurrent ? state.progress : 0);
  const duration = useAudioStore(state => isCurrent ? state.duration : 0);

  const currentProgressPercent = isCurrent && duration ? (progress / duration) * 100 : 0;

  return (
    <div className="h-8 flex items-end gap-[1.5px] px-1 relative w-full overflow-hidden group/wave py-1 bg-white/[0.01] border border-white/5 rounded-xs">
      {bars.map((height, i) => {
        const barPercent = (i / bars.length) * 100;
        const isPlayed = isCurrent && (barPercent <= currentProgressPercent);
        return (
          <div 
            key={i}
            className={cn(
              "flex-1 rounded-sm transition-all duration-300",
              isPlayed 
                ? "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]" 
                : "bg-white/10 group-hover/wave:bg-white/20"
            )}
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
};

const TrackWaveformList: React.FC<{ beatId: string; bars: number[] }> = ({ beatId, bars }) => {
  const isCurrent = useAudioStore(state => state.currentBeat?.id === beatId);
  const progress = useAudioStore(state => isCurrent ? state.progress : 0);
  const duration = useAudioStore(state => isCurrent ? state.duration : 0);

  const currentProgressPercent = isCurrent && duration ? (progress / duration) * 100 : 0;

  return (
    <div className="hidden lg:flex items-end gap-[1.5px] w-48 h-6 relative overflow-hidden group/wave px-1 bg-white/[0.01] border border-white/5 rounded-xs">
      {bars.map((height, i) => {
        const barPercent = (i / bars.length) * 100;
        const isPlayed = isCurrent && (barPercent <= currentProgressPercent);
        return (
          <div 
            key={i}
            className={cn(
              "flex-1 rounded-sm transition-all duration-300",
              isPlayed ? "bg-purple-500" : "bg-white/10"
            )}
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
};

export const SoundClickDiscoverySuite: React.FC = () => {
  const { setBeat, currentBeat, isPlaying, togglePlay } = useAudioStore();
  const { beats } = useBeatCatalogStore();
  const { addToCart } = useCartStore();

  // Multi-Filter store
  const { 
    searchQuery, genre, bpm, key, mood, energy, style, tag, instrument, maxPrice, sortBy, viewMode,
    setSearchQuery, setGenre, setBpm, setKey, setMood, setEnergy, setStyle, setTag, setInstrument, setMaxPrice, setSortBy, setViewMode, resetFilters 
  } = useDiscoveryStore();

  // Selected licensing beat state
  const [licensingBeat, setLicensingBeat] = useState<Beat | null>(null);
  const [infoBeat, setInfoBeat] = useState<Beat | null>(null);

  // Toggle advanced filter panel
  const [showFiltersPanel, setShowFiltersPanel] = useState(true);

  // Sample static lists for keys, genres, instruments, tags derived from real options
  const genres = Array.from(new Set(beats.map(b => b.genre).filter(Boolean)));
  const keys = Array.from(new Set(beats.map(b => b.key).filter(Boolean)));
  const moods = ['Energetic', 'Dark', 'Aggressive', 'Chill', 'Melodic', 'Inspiring'];
  const bpms = [80, 90, 100, 110, 120, 130, 140, 150, 160];
  const instruments = Array.from(new Set(beats.flatMap(b => b.instruments || []).filter(Boolean)));
  const tags = Array.from(new Set(beats.flatMap(b => b.tags || []).filter(Boolean))).slice(0, 10);

  // Apply filters
  let filteredBeats = [...beats];

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredBeats = filteredBeats.filter(b => 
      b.title.toLowerCase().includes(q) ||
      b.genre.toLowerCase().includes(q) ||
      b.key.toLowerCase().includes(q) ||
      b.bpm.toString().includes(q) ||
      (b.moods && b.moods.some(m => m.toLowerCase().includes(q))) ||
      (b.instruments && b.instruments.some(ins => ins.toLowerCase().includes(q))) ||
      (b.description && b.description.toLowerCase().includes(q)) ||
      b.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (genre) {
    filteredBeats = filteredBeats.filter(b => b.genre.toLowerCase() === genre.toLowerCase());
  }

  if (bpm) {
    filteredBeats = filteredBeats.filter(b => Math.abs(b.bpm - bpm) <= 10);
  }

  if (key) {
    filteredBeats = filteredBeats.filter(b => b.key.toLowerCase() === key.toLowerCase());
  }

  if (mood) {
    filteredBeats = filteredBeats.filter(b => b.moods && b.moods.some(m => m.toLowerCase() === mood.toLowerCase()));
  }

  if (instrument) {
    filteredBeats = filteredBeats.filter(b => b.instruments && b.instruments.some(i => i.toLowerCase() === instrument.toLowerCase()));
  }

  if (tag) {
    filteredBeats = filteredBeats.filter(b => b.tags && b.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
  }

  if (maxPrice) {
    filteredBeats = filteredBeats.filter(b => (b.licenses?.basic?.price || 0) <= maxPrice);
  }

  // Sort logic
  if (sortBy === 'trending') {
    filteredBeats.sort((a, b) => (b.playsCount || 0) - (a.playsCount || 0));
  } else if (sortBy === 'new' || sortBy === 'recent') {
    filteredBeats.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } else if (sortBy === 'mostPlayed') {
    filteredBeats.sort((a, b) => (b.playsCount || 0) - (a.playsCount || 0));
  } else if ((sortBy as string) === 'price-asc') {
    filteredBeats.sort((a, b) => (a.licenses?.basic?.price || 0) - (b.licenses?.basic?.price || 0));
  } else if ((sortBy as string) === 'price-desc') {
    filteredBeats.sort((a, b) => (b.licenses?.basic?.price || 0) - (a.licenses?.basic?.price || 0));
  } else if ((sortBy as string) === 'bpm-asc') {
    filteredBeats.sort((a, b) => a.bpm - b.bpm);
  }

  // Dynamic KRAEZELV TOP 10
  const top10Beats = [...beats]
    .sort((a, b) => (b.playsCount || 0) - (a.playsCount || 0))
    .slice(0, 10);

  // SVG Waveform Bar heights generator
  const miniWaveformBars = [15, 25, 45, 60, 40, 30, 70, 80, 50, 40, 60, 75, 95, 80, 60, 45, 50, 70, 85, 95, 60, 40, 25, 40];

  return (
    <section id="discovery-catalog" className="bg-black py-20 scroll-mt-20">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 space-y-12">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">THE OFFICIAL ARCHIVE DISCOVERY</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tighter">FIND YOUR PERFECT BEAT</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/5 border border-white/10 p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn("p-2 transition-all cursor-pointer", viewMode === 'grid' ? "bg-white text-black" : "text-white/40 hover:text-white")}
                title="Grid View"
              >
                <Grid size={14} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn("p-2 transition-all cursor-pointer", viewMode === 'list' ? "bg-white text-black" : "text-white/40 hover:text-white")}
                title="List View"
              >
                <List size={14} />
              </button>
            </div>

            {/* Filter Toggle Button */}
            <button 
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={cn(
                "px-5 py-3 border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all",
                showFiltersPanel ? "bg-purple-600/20 border-purple-500 text-purple-300" : "bg-white/5 border-white/10 text-white"
              )}
            >
              <SlidersHorizontal size={12} /> FILTERS
            </button>
          </div>
        </div>

        {/* TOP 10 DYNAMIC LEADERBOARD */}
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* SIDEBAR: MULTI FILTER MATRIX */}
          {showFiltersPanel && (
            <div className="lg:col-span-3 bg-neutral-950 border border-white/10 p-6 sm:p-8 space-y-8 h-fit animate-in slide-in-from-left duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">FILTER CONSOLE</span>
                <button 
                  onClick={resetFilters}
                  className="text-[8px] font-black uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Reset All
                </button>
              </div>

              {/* Genre Filter */}
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 block">Genre</label>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setGenre(null)}
                    className={cn(
                      "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all",
                      genre === null ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                    )}
                  >
                    All
                  </button>
                  {genres.map(g => (
                    <button 
                      key={g}
                      onClick={() => setGenre(g)}
                      className={cn(
                        "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all",
                        genre === g ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* BPM Filter */}
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 block">BPM Range (±10 BPM)</label>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setBpm(null)}
                    className={cn(
                      "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all",
                      bpm === null ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                    )}
                  >
                    All
                  </button>
                  {bpms.map(b => (
                    <button 
                      key={b}
                      onClick={() => setBpm(b)}
                      className={cn(
                        "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all",
                        bpm === b ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                      )}
                    >
                      {b} BPM
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Filter */}
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 block">Musical Key</label>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setKey(null)}
                    className={cn(
                      "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all",
                      key === null ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                    )}
                  >
                    All
                  </button>
                  {keys.map(k => (
                    <button 
                      key={k}
                      onClick={() => setKey(k)}
                      className={cn(
                        "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all",
                        key === k ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                      )}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood Filter */}
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 block">Vibe / Mood</label>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setMood(null)}
                    className={cn(
                      "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all",
                      mood === null ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                    )}
                  >
                    All
                  </button>
                  {moods.map(m => (
                    <button 
                      key={m}
                      onClick={() => setMood(m)}
                      className={cn(
                        "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all",
                        mood === m ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Instruments Filter */}
              {instruments.length > 0 && (
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 block">Instruments</label>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setInstrument(null)}
                      className={cn(
                        "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all",
                        instrument === null ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                      )}
                    >
                      All
                    </button>
                    {instruments.map(ins => (
                      <button 
                        key={ins}
                        onClick={() => setInstrument(ins)}
                        className={cn(
                          "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all",
                          instrument === ins ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                        )}
                      >
                        {ins}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags Filter */}
              {tags.length > 0 && (
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 block">Style Tags</label>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setTag(null)}
                      className={cn(
                        "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all",
                        tag === null ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                      )}
                    >
                      All
                    </button>
                    {tags.map(t => (
                      <button 
                        key={t}
                        onClick={() => setTag(t)}
                        className={cn(
                          "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all",
                          tag === t ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                        )}
                      >
                        #{t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Cap Filter */}
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 block">Max Basic License Price</label>
                <div className="flex flex-wrap gap-2">
                  {[null, 30, 50, 100].map(p => (
                    <button
                      key={p ?? 'all'}
                      onClick={() => setMaxPrice(p)}
                      className={cn(
                        "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all",
                        maxPrice === p ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                      )}
                    >
                      {p === null ? 'Any Price' : `Under $${p}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy (Visual tag helper) */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 p-3 bg-purple-500/5 border border-purple-500/25 text-purple-300 text-[8px] font-black uppercase tracking-widest">
                  <Activity size={12} />
                  <span>Interactive Dynamic Syncing Active</span>
                </div>
              </div>
            </div>
          )}

          {/* MAIN CONTENT AREA */}
          <div className={cn("space-y-8 flex-1", showFiltersPanel ? "lg:col-span-9" : "lg:col-span-12")}>
            
            {/* SEARCH STATS & SORTING TABS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-neutral-950/60 p-4 border border-white/5">
              
              {/* Sort Tabs */}
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'featured', name: 'Featured' },
                  { id: 'trending', name: 'Trending' },
                  { id: 'new', name: 'New Releases' },
                  { id: 'mostPlayed', name: 'Most Played' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSortBy(tab.id as any)}
                    className={cn(
                      "px-6 py-2.5 text-[9px] font-black uppercase tracking-[0.25em] border transition-all cursor-pointer",
                      sortBy === tab.id 
                        ? "bg-purple-600 border-purple-500 text-white" 
                        : "bg-white/5 border-white/10 text-white/50 hover:text-white"
                    )}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>

              {/* Catalog stats */}
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">
                Found {filteredBeats.length} high-headroom beats matching filter terms
              </span>
            </div>

            {/* WAVEFORM GRID VIEW */}
            {filteredBeats.length > 0 ? (
              viewMode === 'grid' ? (
                /* GRID VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredBeats.map((beat) => {
                    const isCurrent = currentBeat?.id === beat.id;
                    const isCurrentPlaying = isCurrent && isPlaying;

                    return (
                      <div 
                        key={beat.id}
                        className="bg-neutral-950 border border-white/10 p-6 flex flex-col gap-5 hover:border-purple-500/40 transition-all group relative"
                      >
                        {/* Image banner */}
                        <div className="relative aspect-square w-full bg-neutral-900 overflow-hidden border border-white/5 shadow-md">
                          <img 
                            src={beat.artworkUrl} 
                            alt={beat.title}
                            loading="lazy"
                            width={400}
                            height={400}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                          />
                          <button 
                            onClick={() => isCurrent ? togglePlay() : setBeat(beat)}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform">
                              {isCurrentPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-1" />}
                            </div>
                          </button>

                          {/* Quick indicators */}
                          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                            <span className="text-[8px] font-black bg-black/80 backdrop-blur-sm border border-white/10 text-white px-2 py-0.5 tracking-wider">
                              {beat.bpm} BPM
                            </span>
                            <span className="text-[8px] font-black bg-black/80 backdrop-blur-sm border border-white/10 text-white px-2 py-0.5 tracking-wider">
                              {beat.key}
                            </span>
                          </div>
                        </div>

                        {/* Title Info */}
                        <div className="space-y-1">
                          <span className="text-[8px] font-bold text-purple-400 uppercase tracking-widest">{beat.genre}</span>
                          <h4 className="text-base font-black uppercase text-white tracking-tight leading-none truncate group-hover:text-purple-300 transition-colors">
                            {beat.title}
                          </h4>
                        </div>

                        {/* MINI INTERACTIVE SVG WAVEFORM */}
                        <TrackWaveform beatId={beat.id} bars={miniWaveformBars} />

                        {/* Actions bar */}
                        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                          <button 
                            onClick={() => isCurrent ? togglePlay() : setBeat(beat)}
                            className="p-3 bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black transition-all shrink-0 cursor-pointer"
                            title="Play/Pause Audition"
                          >
                            {isCurrentPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                          </button>
                          <button 
                            onClick={() => setInfoBeat(beat)}
                            className="p-3 bg-white/5 border border-white/10 text-white hover:bg-purple-600 hover:text-white transition-all shrink-0 cursor-pointer"
                            title="Quick Info"
                          >
                            <Info size={14} />
                          </button>
                          <button 
                            onClick={() => setLicensingBeat(beat)}
                            className="flex-1 py-3 bg-purple-600/10 hover:bg-purple-600 border border-purple-500/20 hover:border-purple-500 text-purple-300 hover:text-white font-black uppercase tracking-widest text-[9px] transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ShoppingBag size={12} /> BUY ${beat.licenses.basic.price.toFixed(2)}
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              ) : (
                /* LIST VIEW (CHARTS STYLE LIST) */
                <div className="border border-white/10 bg-neutral-950 divide-y divide-white/10">
                  {filteredBeats.map((beat) => {
                    const isCurrent = currentBeat?.id === beat.id;
                    const isCurrentPlaying = isCurrent && isPlaying;

                    return (
                      <div 
                        key={beat.id} 
                        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.01] transition-all group"
                      >
                        {/* Brand Section */}
                        <div className="flex items-center gap-5 flex-1 min-w-0">
                          
                          {/* Image */}
                          <div className="relative w-12 h-12 bg-neutral-900 border border-white/10 overflow-hidden shrink-0">
                            <img 
                              src={beat.artworkUrl} 
                              alt={beat.title}
                              loading="lazy"
                              width={48}
                              height={48}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                            />
                            <button 
                              onClick={() => isCurrent ? togglePlay() : setBeat(beat)}
                              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            >
                              {isCurrentPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" className="ml-0.5" />}
                            </button>
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-sm font-black uppercase text-white tracking-tight truncate group-hover:text-purple-400 transition-colors leading-none">
                              {beat.title}
                            </h4>
                            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-1">
                              {beat.genre} · {beat.key} · {beat.bpm} BPM
                            </p>
                          </div>
                        </div>

                        {/* MINI SVG WAVEFORM FOR LIST */}
                        <TrackWaveformList beatId={beat.id} bars={miniWaveformBars.slice(0, 18)} />

                        {/* Button and price actions */}
                        <div className="flex items-center justify-end gap-3 shrink-0">
                          <span className="text-xs font-mono font-bold text-white/50">{beat.bpm} BPM</span>
                          <button 
                            onClick={() => setInfoBeat(beat)}
                            className="p-2.5 bg-white/5 border border-white/10 text-white hover:bg-purple-600 hover:text-white transition-all cursor-pointer"
                            title="Quick Info"
                          >
                            <Info size={14} />
                          </button>
                          <button 
                            onClick={() => setLicensingBeat(beat)}
                            className="px-6 py-3 bg-white text-black font-black uppercase tracking-widest text-[9px] hover:bg-purple-600 hover:text-white transition-all cursor-pointer"
                          >
                            BUY ${beat.licenses.basic.price.toFixed(2)}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              /* No Beats Found */
              <div className="p-16 border border-white/10 bg-neutral-950 text-center flex flex-col items-center justify-center gap-3">
                <Music size={28} className="text-white/20" />
                <h4 className="text-sm font-black uppercase tracking-widest text-white">No beats match your filters</h4>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">Try widening your key, bpm range, or vibing moods.</p>
                <button 
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-neutral-200 mt-2"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* KRAEZELV TOP 10 LEADERBOARD CHARTS CARD */}
        {beats.length > 0 && (
          <div className="pt-12 border-t border-white/5 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">OFFICIAL STREAM CLASSIFICATIONS</span>
                <h2 className="text-2xl md:text-4xl font-black uppercase text-white tracking-tighter">KRAEZELV TOP 10 CHARTS</h2>
              </div>
            </div>

            <div className="border border-white/10 bg-neutral-950 divide-y divide-white/5">
              {top10Beats.map((beat, idx) => {
                const isCurrent = currentBeat?.id === beat.id;
                const isCurrentPlaying = isCurrent && isPlaying;

                return (
                  <div 
                    key={beat.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-white/[0.01] transition-all group"
                  >
                    <div className="flex items-center gap-6 min-w-0 flex-1">
                      {/* Rank number */}
                      <span className="text-xl font-black text-white tabular-nums w-8">#{idx + 1}</span>

                      {/* Artwork thumbnail */}
                      <div className="relative w-12 h-12 bg-neutral-900 border border-white/10 overflow-hidden shrink-0">
                        <img src={beat.artworkUrl} alt={beat.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        <button 
                          onClick={() => isCurrent ? togglePlay() : setBeat(beat)}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        >
                          {isCurrentPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" className="ml-0.5" />}
                        </button>
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-black uppercase text-white tracking-tight truncate group-hover:text-purple-400 transition-colors">
                          {beat.title}
                        </h4>
                        <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-1">
                          PRODUCER: KRAEZELV · {beat.genre} · {beat.key}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 justify-between sm:justify-end">
                      <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest">{beat.bpm} BPM</span>
                      <button 
                        onClick={() => setLicensingBeat(beat)}
                        className="px-5 py-2.5 bg-white text-black font-black uppercase tracking-widest text-[9px] hover:bg-purple-600 hover:text-white transition-all cursor-pointer"
                      >
                        BUY ${beat.licenses.basic.price.toFixed(2)}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* RENDER THE POPUP LICENSING MODAL IN-LINE */}
      {licensingBeat && (
        <LicensingModal 
          beat={licensingBeat}
          isOpen={!!licensingBeat}
          onClose={() => setLicensingBeat(null)}
        />
      )}

      {infoBeat && (
        <QuickInfoModal 
          beat={infoBeat}
          isOpen={!!infoBeat}
          onClose={() => setInfoBeat(null)}
          onPlayClick={() => {
            const isCurrent = currentBeat?.id === infoBeat.id;
            isCurrent ? togglePlay() : setBeat(infoBeat);
          }}
          isPlaying={currentBeat?.id === infoBeat.id && isPlaying}
        />
      )}
    </section>
  );
};
