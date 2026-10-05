import React, { useState } from 'react';
import { 
  Play, Pause, Heart, Download, ShoppingBag, Plus, Star, Share2, 
  DollarSign, Users, MessageSquare, TrendingUp, TrendingDown, Minus, 
  Flame, Award, Tag, Sparkles, Filter, Music, Check, X, Shield, Clock, Eye, Upload
} from 'lucide-react';
import { useAudioStore } from '../../store/useAudioStore';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { Beat } from '../../types';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

export const SoundClickDiscoverySuite: React.FC = () => {
  const { setBeat, currentBeat, isPlaying, togglePlay } = useAudioStore();
  const { beats } = useBeatCatalogStore();

  // Filter States
  const [instrumentalOnly, setInstrumentalOnly] = useState(false);
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'sale' | 'exclusives' | 'free' | 'typebeats'>('all');

  // Modals & Interactive States
  const [activeShareBeat, setActiveShareBeat] = useState<Beat | null>(null);
  const [activeTipBeat, setActiveTipBeat] = useState<Beat | null>(null);
  const [activeCommentBeat, setActiveCommentBeat] = useState<Beat | null>(null);
  const [bookmarkedArtists, setBookmarkedArtists] = useState<string[]>(['KRAEZELV']);
  const [commentText, setCommentText] = useState('');
  const [tipAmount, setTipAmount] = useState('5.00');

  // View Modes: 'simple' for luxury storefront, 'advanced' for full chart suite
  const [suiteViewMode, setSuiteViewMode] = useState<'simple' | 'advanced'>('simple');

  const toggleBookmark = (artist: string) => {
    if (bookmarkedArtists.includes(artist)) {
      setBookmarkedArtists(prev => prev.filter(a => a !== artist));
    } else {
      setBookmarkedArtists(prev => [...prev, artist]);
    }
  };

  // Derive charts directly from uploaded beats
  const chartTracks = beats.map((b, idx) => ({
    ...b,
    rank: idx + 1,
    delta: 0,
    peakRank: idx + 1,
    subgenre: b.genre || 'Hip Hop',
    artist: 'KRAEZELV',
    isExplicit: false,
    duration: '03:15',
    rating: 5.0,
    reviewsCount: 0,
    commentsCount: 0,
    isOnSale: false,
    salePrice: b.licenses.basic.price,
    isExclusiveOpen: b.licenses.exclusive?.enabled ?? true,
    typeBeatStyle: b.genre || 'Trap',
  }));

  const filteredTracks = chartTracks.filter(track => {
    if (instrumentalOnly && track.isExplicit) return false;
    if (selectedMoodFilter && !track.moods?.includes(selectedMoodFilter)) return false;
    if (activeTab === 'free' && !track.isFree) return false;
    return true;
  });

  return (
    <section className="bg-black border-y border-white/10 py-20 space-y-12">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 space-y-12">
        
        {/* Section Header with Storefront View Toggle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">DISCOVERY & STYLE MATCHING</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">FIND YOUR SOUND</h2>
          </div>

          <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 p-1">
            <button
              onClick={() => setSuiteViewMode('simple')}
              className={cn(
                "px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                suiteViewMode === 'simple' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              FIND YOUR SOUND
            </button>
            <button
              onClick={() => setSuiteViewMode('advanced')}
              className={cn(
                "px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                suiteViewMode === 'advanced' ? "bg-purple-600 text-white shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              CHARTS & ANALYTICS
            </button>
          </div>
        </div>

        {/* Clean Mood & Filter Matrix */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 bg-neutral-950 border border-white/10">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <Sparkles size={16} className="text-purple-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Catalog Filters</span>
            </div>

            <div className="flex items-center gap-3 border-l border-white/10 pl-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Instrumentals Only</span>
              <button 
                onClick={() => setInstrumentalOnly(!instrumentalOnly)}
                className={cn("w-10 h-5 rounded-full relative transition-all", instrumentalOnly ? "bg-purple-500" : "bg-white/10")}
              >
                <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all", instrumentalOnly ? "right-0.5" : "left-0.5")} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 shrink-0 mr-2">Moods:</span>
            {['Energetic', 'Dark', 'Aggressive', 'Chill', 'Melodic'].map((mood) => {
              const isSelected = selectedMoodFilter === mood;
              return (
                <button
                  key={mood}
                  onClick={() => setSelectedMoodFilter(isSelected ? null : mood)}
                  className={cn(
                    "px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all border shrink-0",
                    isSelected ? "bg-white text-black border-white font-black" : "bg-white/5 text-white/60 border-white/10 hover:text-white"
                  )}
                >
                  {mood}
                </button>
              );
            })}
          </div>
        </div>

        {beats.length > 0 ? (
          <>
            {/* Trending Hot-Shots Ticker */}
            <div className="p-4 bg-white/5 border border-white/10 flex items-center justify-between overflow-hidden gap-6">
              <div className="flex items-center gap-3 shrink-0">
                <Flame size={16} className="text-purple-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Trending Ticker:</span>
              </div>
              <div className="flex items-center gap-8 overflow-x-auto no-scrollbar text-[10px] font-black uppercase tracking-widest text-white/80">
                {beats.slice(0, 4).map((b, i) => (
                  <span key={b.id} className="flex items-center gap-2 shrink-0">
                    🔥 #{i + 1} {b.title} ({b.bpm} BPM)
                  </span>
                ))}
              </div>
            </div>

            {/* Real-time Charts Table */}
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Real-Time Leaderboard</span>
                  <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
                    Official Catalog Charts
                  </h2>
                </div>
              </div>

              <div className="border border-white/10 bg-black divide-y divide-white/10">
                {filteredTracks.map((track) => {
                  const isCurrent = currentBeat?.id === track.id;

                  return (
                    <div key={track.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-white/[0.02] transition-all group">
                      <div className="flex items-center gap-6 min-w-0 flex-1">
                        <span className="text-2xl font-black text-white tabular-nums">#{track.rank}</span>

                        <div className="relative w-16 h-16 bg-neutral-900 border border-white/10 overflow-hidden shrink-0">
                          <img src={track.artworkUrl || '/src/assets/images/beat_artwork_abstract_1791053624368.jpg'} alt={track.title} className="w-full h-full object-cover" />
                          <button 
                            onClick={() => isCurrent ? togglePlay() : setBeat(track)}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {isCurrent && isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-0.5" />}
                          </button>
                        </div>

                        <div className="flex flex-col min-w-0">
                          <h3 className="text-lg font-black uppercase text-white tracking-tight truncate">
                            {track.title}
                          </h3>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                            PRODUCER: KRAEZELV · {track.genre}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 shrink-0">
                        <span className="text-xs font-bold text-white uppercase">{track.bpm} BPM · {track.key}</span>
                        <button 
                          onClick={() => alert(`Licensing ${track.title}`)}
                          className="px-5 py-2.5 bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-neutral-200"
                        >
                          ${track.licenses.basic.price.toFixed(2)}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* Empty Chart & Discovery Suite State */
          <div className="p-12 bg-neutral-950 border border-white/10 text-center flex flex-col items-center justify-center gap-4">
            <Music size={32} className="text-white/20" />
            <div className="space-y-1 max-w-md">
              <h3 className="text-xl font-black uppercase text-white tracking-tight">NO CHART OR TRENDING DATA YET</h3>
              <p className="text-white/40 uppercase tracking-widest text-[10px]">
                Upload beats to activate real-time chart tracking, subgenre mini-charts, and style matching analytics.
              </p>
            </div>
            <Link to="/dashboard/upload" className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-200 transition-colors">
              <Upload size={14} /> Upload First Beat
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
