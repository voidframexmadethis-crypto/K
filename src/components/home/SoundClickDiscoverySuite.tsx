import React, { useState } from 'react';
import { 
  Play, Pause, Heart, Download, ShoppingBag, Plus, Star, Share2, 
  DollarSign, Users, MessageSquare, TrendingUp, TrendingDown, Minus, 
  Flame, Award, Tag, Sparkles, Filter, Music, Check, X, Shield, Clock, Eye
} from 'lucide-react';
import { useAudioStore } from '../../store/useAudioStore';
import { Beat } from '../../types';
import { cn } from '../../lib/utils';

export const SoundClickDiscoverySuite: React.FC = () => {
  const { setBeat, currentBeat, isPlaying, togglePlay } = useAudioStore();

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

  // Sample Audio Items with Full Metadata
  const chartTracks: (Beat & {
    rank: number;
    delta: number; // positive = up, negative = down, 0 = stable
    peakRank: number;
    subgenre: string;
    artist: string;
    isExplicit: boolean;
    duration: string;
    rating: number;
    reviewsCount: number;
    commentsCount: number;
    isOnSale: boolean;
    salePrice: number;
    isExclusiveOpen: boolean;
    typeBeatStyle: string;
  })[] = [
    {
      id: 'sc-1', title: 'VALKYRIE', producerId: 'KRAEZELV', artist: 'KRAEZELV', bpm: 144, key: 'C Minor', genre: 'Dark Trap', subgenre: 'UK Drill',
      artworkUrl: '/src/assets/images/hero_valkyrie_massive_1791054144327.jpg', audioUrl: '', isFree: false, tags: ['DRILL', 'DARK'], moods: ['Epic', 'Dark'], slug: 'valkyrie',
      isPrivate: false, isBootleg: false, instruments: ['808', 'Brass'], playsCount: 248500, rank: 1, delta: 2, peakRank: 1, isExplicit: true, duration: '03:24',
      rating: 4.9, reviewsCount: 142, commentsCount: 88, isOnSale: true, salePrice: 24.99, isExclusiveOpen: true, typeBeatStyle: 'Future x Drake',
      licenses: { basic: { price: 29.99, enabled: true }, premium: { price: 49.99, enabled: true }, unlimited: { price: 99.99, enabled: true }, exclusive: { price: 499.99, enabled: true } },
      createdAt: '', published: true
    },
    {
      id: 'sc-2', title: 'APOLLO', producerId: 'KRAEZELV', artist: 'KRAEZELV', bpm: 140, key: 'D Minor', genre: 'Trap', subgenre: 'Hyperpop',
      artworkUrl: '/src/assets/images/beat_artwork_abstract_1791053624368.jpg', audioUrl: '', isFree: false, tags: ['BOUNCY'], moods: ['Energetic', 'Happy'], slug: 'apollo',
      isPrivate: false, isBootleg: false, instruments: ['Synth'], playsCount: 194200, rank: 2, delta: 0, peakRank: 1, isExplicit: false, duration: '02:58',
      rating: 5.0, reviewsCount: 98, commentsCount: 64, isOnSale: false, salePrice: 29.99, isExclusiveOpen: true, typeBeatStyle: 'Travis Scott',
      licenses: { basic: { price: 29.99, enabled: true }, premium: { price: 49.99, enabled: true }, unlimited: { price: 99.99, enabled: true }, exclusive: { price: 499.99, enabled: true } },
      createdAt: '', published: true
    },
    {
      id: 'sc-3', title: 'PHANTOM', producerId: 'KRAEZELV', artist: 'KRAEZELV', bpm: 142, key: 'C# Minor', genre: 'Drill', subgenre: 'Cyber Drill',
      artworkUrl: '/src/assets/images/pack_artwork_geometric_1791053633249.jpg', audioUrl: '', isFree: false, tags: ['CYBER'], moods: ['Angry', 'Dark'], slug: 'phantom',
      isPrivate: false, isBootleg: false, instruments: ['Hi-Hat Rolls'], playsCount: 168400, rank: 3, delta: -1, peakRank: 2, isExplicit: true, duration: '03:12',
      rating: 4.8, reviewsCount: 76, commentsCount: 42, isOnSale: true, salePrice: 29.99, isExclusiveOpen: false, typeBeatStyle: 'Metro Boomin',
      licenses: { basic: { price: 34.99, enabled: true }, premium: { price: 54.99, enabled: true }, unlimited: { price: 109.99, enabled: true }, exclusive: { price: 599.99, enabled: true } },
      createdAt: '', published: true
    },
    {
      id: 'sc-4', title: 'NIGHTFALL', producerId: 'KRAEZELV', artist: 'KRAEZELV', bpm: 128, key: 'A Minor', genre: 'R&B', subgenre: 'Soul R&B',
      artworkUrl: '/src/assets/images/hero_studio_cinematic_1791053615857.jpg', audioUrl: '', isFree: true, tags: ['FREE', 'SMOOTH'], moods: ['Peaceful', 'Peaceful'], slug: 'nightfall',
      isPrivate: false, isBootleg: false, instruments: ['Piano', 'Pad'], playsCount: 142800, rank: 4, delta: 3, peakRank: 4, isExplicit: false, duration: '03:45',
      rating: 4.9, reviewsCount: 112, commentsCount: 95, isOnSale: false, salePrice: 0, isExclusiveOpen: true, typeBeatStyle: 'Bryson Tiller',
      licenses: { basic: { price: 0, enabled: true }, premium: { price: 49.99, enabled: true }, unlimited: { price: 99.99, enabled: true }, exclusive: { price: 499.99, enabled: true } },
      createdAt: '', published: true
    }
  ];

  const subgenreMiniCharts = [
    { name: 'Hip-Hop / Trap', topTrack: 'VALKYRIE', count: '1.2k Tracks' },
    { name: 'Rock / Alternative', topTrack: 'MIDNIGHT RAGE', count: '480 Tracks' },
    { name: 'Pop & Dance', topTrack: 'SOLARIS DANCE', count: '890 Tracks' },
    { name: 'Electronic / Synth', topTrack: 'CYBERSPACE 2099', count: '650 Tracks' },
    { name: 'Jazz & Soul', topTrack: 'ECLIPSE LOFI', count: '320 Tracks' },
    { name: 'Country Acoustic', topTrack: 'SUNSET ROAD', count: '210 Tracks' },
  ];

  const toggleBookmark = (artist: string) => {
    if (bookmarkedArtists.includes(artist)) {
      setBookmarkedArtists(prev => prev.filter(a => a !== artist));
    } else {
      setBookmarkedArtists(prev => [...prev, artist]);
    }
  };

  const filteredTracks = chartTracks.filter(track => {
    if (instrumentalOnly && track.isExplicit) return false;
    if (selectedMoodFilter && !track.moods.includes(selectedMoodFilter)) return false;
    if (activeTab === 'sale' && !track.isOnSale) return false;
    if (activeTab === 'exclusives' && !track.isExclusiveOpen) return false;
    if (activeTab === 'free' && !track.isFree) return false;
    return true;
  });

  return (
    <section className="bg-black border-y border-white/10 py-20 space-y-20">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 space-y-16">
        
        {/* ==========================================
            29. INSTRUMENTAL-ONLY & MOOD DISCOVERY DECK
           ========================================== */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 bg-white/[0.02] border border-white/10">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <Sparkles size={16} className="text-white" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">SoundClick Discovery Deck</span>
            </div>

            {/* 29. Instrumental-Only Toggle Switch */}
            <div className="flex items-center gap-3 border-l border-white/10 pl-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-white">29. Instrumental-Only Deck Filter</span>
              <button 
                onClick={() => setInstrumentalOnly(!instrumentalOnly)}
                className={cn("w-12 h-6 rounded-full relative transition-all", instrumentalOnly ? "bg-white" : "bg-white/10")}
              >
                <div className={cn("absolute top-1 w-4 h-4 bg-black rounded-full transition-all", instrumentalOnly ? "right-1" : "left-1")} />
              </button>
            </div>
          </div>

          {/* 26. Discover By Mood Visual Matrix */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40 shrink-0 mr-2">26. Moods:</span>
            {['Happy', 'Angry', 'Peaceful', 'Epic', 'Energetic', 'Dark'].map((mood) => {
              const isSelected = selectedMoodFilter === mood;
              return (
                <button
                  key={mood}
                  onClick={() => setSelectedMoodFilter(isSelected ? null : mood)}
                  className={cn(
                    "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all border shrink-0",
                    isSelected ? "bg-white text-black border-white" : "bg-white/5 text-white/60 border-white/10 hover:text-white"
                  )}
                >
                  {mood}
                </button>
              );
            })}
          </div>
        </div>

        {/* ==========================================
            16. TRENDING HOT-SHOTS TICKER (4-HOUR STREAM ACCELERATION)
           ========================================== */}
        <div className="p-4 bg-white/5 border border-white/10 flex items-center justify-between overflow-hidden gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <Flame size={16} className="text-white animate-bounce" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">16. Trending Hot-Shots Ticker (4h Stream Spike):</span>
          </div>
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar text-[10px] font-black uppercase tracking-widest text-white/80">
            <span className="flex items-center gap-2 shrink-0">🔥 #1 VALKYRIE (+480% Plays)</span>
            <span className="flex items-center gap-2 shrink-0">🔥 #2 APOLLO (+320% Plays)</span>
            <span className="flex items-center gap-2 shrink-0">🔥 #3 NIGHTFALL (+290% Plays)</span>
            <span className="flex items-center gap-2 shrink-0">🔥 #4 PHANTOM (+210% Plays)</span>
          </div>
        </div>

        {/* ==========================================
            11-15. SOUNDCLICK MULTI-TIERED MUSIC CHARTS
           ========================================== */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Real-Time Leaderboard</span>
              <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tighter">
                11. Main General Music Chart & 12. Daily Beats Panel
              </h2>
            </div>

            {/* Quick Filter Tabs (22, 23, 24, 25) */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1">
              {[
                { id: 'all', label: 'All Charts' },
                { id: 'sale', label: '22. Songs On Sale' },
                { id: 'exclusives', label: '23. Exclusives Only' },
                { id: 'free', label: '24. Free Downloads' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all",
                    activeTab === tab.id ? "bg-white text-black" : "text-white/40 hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Charts Table */}
          <div className="border border-white/10 bg-black divide-y divide-white/10">
            {filteredTracks.map((track) => {
              const isCurrent = currentBeat?.id === track.id;
              const isBookmarked = bookmarkedArtists.includes(track.artist);

              return (
                <div key={track.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-white/[0.02] transition-all group">
                  
                  {/* Left: Rank, Delta, Artwork, Title & Metadata (Items 14, 15, 30, 31, 32, 33, 34, 35, 38) */}
                  <div className="flex items-center gap-6 min-w-0 flex-1">
                    {/* 14. Chart Position Delta Indicator */}
                    <div className="flex flex-col items-center justify-center shrink-0 w-8">
                      <span className="text-2xl font-black text-white tabular-nums">#{track.rank}</span>
                      <div className="flex items-center text-[8px] font-black">
                        {track.delta > 0 && <span className="text-emerald-400 flex items-center"><TrendingUp size={10} /> +{track.delta}</span>}
                        {track.delta < 0 && <span className="text-rose-500 flex items-center"><TrendingDown size={10} /> {track.delta}</span>}
                        {track.delta === 0 && <span className="text-white/40 flex items-center"><Minus size={10} /> =</span>}
                      </div>
                    </div>

                    {/* 15. Historical Peak Chart Tracker Badge */}
                    <span className="px-2 py-1 bg-white/10 border border-white/10 text-[8px] font-black text-white uppercase tracking-widest shrink-0">
                      15. {track.peakRank === 1 ? '#1 Peak' : `#${track.peakRank} Peak`}
                    </span>

                    {/* 30. High-Res Cover Tile & 31. Hover Mini-Play Trigger */}
                    <div className="relative w-16 h-16 bg-neutral-900 border border-white/10 overflow-hidden shrink-0 group/cover">
                      <img src={track.artworkUrl} alt={track.title} className="w-full h-full object-cover grayscale group-hover/cover:grayscale-0 transition-all" />
                      <button 
                        onClick={() => isCurrent ? togglePlay() : setBeat(track)}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity"
                      >
                        {isCurrent && isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-0.5" />}
                      </button>
                    </div>

                    {/* 32. Title & 33. Artist Links */}
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black uppercase text-white tracking-tight truncate hover:underline cursor-pointer">
                          {track.title}
                        </h3>
                        {/* 38. Explicit Warning Badge */}
                        {track.isExplicit && (
                          <span className="px-1.5 py-0.5 bg-red-600 text-white text-[7px] font-black rounded shrink-0">
                            E
                          </span>
                        )}
                        {track.isOnSale && (
                          <span className="px-2 py-0.5 bg-emerald-500 text-black text-[8px] font-black uppercase tracking-widest shrink-0">
                            SALE
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/40 mt-0.5">
                        <span className="hover:text-white cursor-pointer">33. {track.artist}</span>
                        <span>·</span>
                        <span>34. {track.genre}</span>
                        <span>·</span>
                        <span className="text-white/60">35. {track.subgenre}</span>
                      </div>
                    </div>
                  </div>

                  {/* Center Technical Metadata (Items 36, 37, 39, 40) */}
                  <div className="flex items-center gap-8 shrink-0 text-left lg:text-center justify-between lg:justify-end border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/30">39. BPM / 40. Key</span>
                      <span className="text-xs font-bold text-white uppercase">{track.bpm} BPM · {track.key}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/30">36. Length</span>
                      <span className="text-xs font-mono font-bold text-white">{track.duration}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/30">37. Total Streams</span>
                      <span className="text-xs font-black text-white tabular-nums">{(((track.playsCount ?? 0)) / 1000).toFixed(1)}k</span>
                    </div>
                  </div>

                  {/* Right Commercial & Engagement Action Buttons (Items 41-50) */}
                  <div className="flex items-center gap-3 shrink-0 justify-end">
                    {/* 46. Bookmark Artist Star Trigger */}
                    <button 
                      onClick={() => toggleBookmark(track.artist || 'KRAEZELV')}
                      className={cn("p-2.5 border transition-all", isBookmarked ? "bg-white text-black border-white" : "bg-white/5 text-white/40 border-white/10 hover:text-white")}
                      title="46. Bookmark Artist"
                    >
                      <Star size={14} fill={isBookmarked ? "black" : "none"} />
                    </button>

                    {/* 42. Free MP3 Download Action Icon */}
                    {track.isFree && (
                      <button 
                        onClick={() => alert(`Downloading free tagged MP3 for ${track.title}!`)}
                        className="p-2.5 bg-white/10 border border-white/20 text-white hover:bg-white hover:text-black transition-all"
                        title="42. Free MP3 Download"
                      >
                        <Download size={14} />
                      </button>
                    )}

                    {/* 43. Single-Track Purchase Button */}
                    <button 
                      onClick={() => alert(`Purchasing ${track.title} for $${track.isOnSale ? track.salePrice : track.licenses.basic.price}`)}
                      className="px-5 py-2.5 bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center gap-1.5"
                    >
                      <ShoppingBag size={12} /> 43. ${track.isOnSale ? track.salePrice : track.licenses.basic.price}
                    </button>

                    {/* 48. Send Tip Monetization Node */}
                    <button 
                      onClick={() => setActiveTipBeat(track)}
                      className="p-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all flex items-center gap-1"
                      title="48. Send Tip"
                    >
                      <DollarSign size={14} /> Tip
                    </button>

                    {/* 47. Social Share Payload Modal Trigger */}
                    <button 
                      onClick={() => setActiveShareBeat(track)}
                      className="p-2.5 bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"
                      title="47. Social Share Modal"
                    >
                      <Share2 size={14} />
                    </button>

                    {/* 50. Inline Comment Submission Dialogue */}
                    <button 
                      onClick={() => setActiveCommentBeat(track)}
                      className="p-2.5 bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"
                      title="50. Inline Comments"
                    >
                      <MessageSquare size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==========================================
            13. SUB-GENRE MINI-CHARTS GRID
           ========================================== */}
        <div className="space-y-6 pt-8 border-t border-white/10">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Style Categorization</span>
            <h3 className="text-2xl font-black uppercase text-white tracking-tight">13. Sub-Genre Mini-Charts Grid</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subgenreMiniCharts.map((chart, idx) => (
              <div key={idx} className="p-6 bg-white/[0.02] border border-white/10 flex flex-col justify-between gap-4 group hover:border-white/30 transition-all">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{chart.count}</span>
                  <h4 className="text-xl font-black uppercase text-white">{chart.name}</h4>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[10px] font-bold uppercase text-white/60">
                  <span>Top Song: <strong className="text-white">{chart.topTrack}</strong></span>
                  <button className="text-white hover:underline font-black">View Chart →</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ==========================================
            25. "TYPE BEATS" CUSTOM ANCHOR GRID
           ========================================== */}
        <div className="space-y-6 pt-8 border-t border-white/10">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Style Matching</span>
            <h3 className="text-2xl font-black uppercase text-white tracking-tight">25. "Type Beats" Custom Anchor Grid</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {['Drake Type Beats', 'Future Type Beats', 'Travis Scott Style', 'Metro Boomin Vibe', 'Ye / Kanye Style', 'Lil Baby Bouncers'].map((artistStyle) => (
              <button 
                key={artistStyle}
                className="p-5 bg-black border border-white/10 hover:border-white text-center flex flex-col items-center justify-center gap-2 group transition-all"
              >
                <Music size={20} className="text-white/40 group-hover:text-white transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-wider text-white">{artistStyle}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 47. Social Share Modal */}
      {activeShareBeat && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
          <div className="bg-black border border-white/20 p-8 max-w-md w-full space-y-6 relative shadow-2xl">
            <button onClick={() => setActiveShareBeat(null)} className="absolute top-4 right-4 text-white/40 hover:text-white">
              <X size={20} />
            </button>
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">47. Social Share Payload</span>
              <h3 className="text-2xl font-black uppercase text-white">Share {activeShareBeat.title}</h3>
            </div>
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase text-white/40 block">Direct URL Link</label>
              <input type="text" readOnly value={`https://kraezelv.com/beat/${activeShareBeat.slug}`} className="w-full bg-white/5 border border-white/10 p-3 text-[10px] font-mono text-white outline-none" />
              <button onClick={() => { navigator.clipboard.writeText(`https://kraezelv.com/beat/${activeShareBeat.slug}`); alert('Copied share link!'); setActiveShareBeat(null); }} className="w-full py-3 bg-white text-black font-black uppercase text-[10px] tracking-widest">
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 48. Send Tip Modal */}
      {activeTipBeat && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
          <div className="bg-black border border-white/20 p-8 max-w-md w-full space-y-6 relative shadow-2xl">
            <button onClick={() => setActiveTipBeat(null)} className="absolute top-4 right-4 text-white/40 hover:text-white">
              <X size={20} />
            </button>
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">48. Direct Micro-Donation</span>
              <h3 className="text-2xl font-black uppercase text-white">Send Tip to {((activeTipBeat as any).artist || 'KRAEZELV')}</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {['2.00', '5.00', '10.00'].map((amt) => (
                  <button key={amt} onClick={() => setTipAmount(amt)} className={cn("py-2 text-[10px] font-black border uppercase", tipAmount === amt ? "bg-white text-black border-white" : "bg-white/5 text-white border-white/10")}>
                    ${amt}
                  </button>
                ))}
              </div>
              <button onClick={() => { alert(`Sent $${tipAmount} tip to {((activeTipBeat as any).artist || 'KRAEZELV')}! Thank you!`); setActiveTipBeat(null); }} className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-[0.3em] text-xs">
                Confirm ${tipAmount} Tip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 50. Inline Comment Submission Modal */}
      {activeCommentBeat && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
          <div className="bg-black border border-white/20 p-8 max-w-md w-full space-y-6 relative shadow-2xl">
            <button onClick={() => setActiveCommentBeat(null)} className="absolute top-4 right-4 text-white/40 hover:text-white">
              <X size={20} />
            </button>
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">50. Community Feedback</span>
              <h3 className="text-2xl font-black uppercase text-white">Comment on {activeCommentBeat.title}</h3>
            </div>
            <div className="space-y-4">
              <textarea 
                value={commentText} 
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="WRITE PUBLIC PRAISE..."
                className="w-full bg-white/5 border border-white/10 p-4 text-[10px] font-bold text-white outline-none h-24 resize-none"
              />
              <button onClick={() => { alert(`Submitted comment for ${activeCommentBeat.title}!`); setActiveCommentBeat(null); setCommentText(''); }} className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.3em] text-xs">
                Post Public Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
