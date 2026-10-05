import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, UserCheck, UserPlus, Sparkles, Check, Play, Music, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Beat, Producer } from '../../types';
import { useAudioStore } from '../../store/useAudioStore';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { cn } from '../../lib/utils';

export const DiscoveryCarousels: React.FC = () => {
  const { setBeat, currentBeat, isPlaying, togglePlay } = useAudioStore();
  const { beats } = useBeatCatalogStore();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const producers: Producer[] = [
    {
      id: 'p1',
      name: 'KRAEZELV',
      avatarUrl: '/src/assets/images/hero_studio_cinematic_1791053615857.jpg',
      subscribersCount: 250000,
      verified: true,
      isFollowing: true,
      genre: 'Cinematic Trap, Drill & R&B'
    }
  ];

  const recommendedBeats: Beat[] = beats;

  const moodClusters = [
    { name: 'Energetic', icon: '⚡' },
    { name: 'Dark', icon: '🌑' },
    { name: 'Sad', icon: '🌧️' },
    { name: 'Chill', icon: '☕' },
    { name: 'Aggressive', icon: '🔥' },
    { name: 'Uplifting', icon: '✨' }
  ];

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -400 : 400,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="max-w-[1800px] mx-auto px-6 md:px-12 py-24 space-y-24">
      {/* 1. Recommended For You Engine */}
      <div className="space-y-8">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Algorithmic Match</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tighter">
              Recommended For You
            </h2>
          </div>
          {recommendedBeats.length > 0 && (
            <div className="flex items-center gap-2">
              <button onClick={() => scroll('left')} className="p-3 border border-white/10 hover:border-white text-white transition-all">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => scroll('right')} className="p-3 border border-white/10 hover:border-white text-white transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {recommendedBeats.length > 0 ? (
          <div ref={scrollRef} className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4">
            {recommendedBeats.map(beat => {
              const isCurrent = currentBeat?.id === beat.id;
              return (
                <div key={beat.id} className="min-w-[280px] md:min-w-[320px] bg-white/[0.02] border border-white/10 p-6 flex flex-col gap-4 group">
                  <div className="relative aspect-square overflow-hidden bg-neutral-900 border border-white/5">
                    <img src={beat.artworkUrl || '/src/assets/images/beat_artwork_abstract_1791053624368.jpg'} alt={beat.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    <button 
                      onClick={() => isCurrent ? togglePlay() : setBeat(beat)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center">
                        <Play size={20} fill="black" className="ml-0.5" />
                      </div>
                    </button>
                  </div>

                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <h3 className="text-xl font-black uppercase text-white tracking-tight">{beat.title}</h3>
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{beat.genre} · {beat.bpm} BPM</span>
                    </div>
                    <span className="text-sm font-black text-white">${beat.licenses.basic.price.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 bg-neutral-950 border border-white/10 text-center flex flex-col items-center justify-center gap-4">
            <Music size={32} className="text-white/20" />
            <div className="space-y-1">
              <h3 className="text-xl font-black uppercase text-white tracking-tight">NO RECOMMENDED TRACKS YET</h3>
              <p className="text-white/40 uppercase tracking-widest text-[10px]">
                Upload beats to activate personalized algorithmic recommendations and genre clusters.
              </p>
            </div>
            <Link to="/dashboard/upload" className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-200 transition-colors">
              <Upload size={14} /> Upload First Beat
            </Link>
          </div>
        )}
      </div>

      {/* 2. Mood-Based Clusters Tile Grid */}
      <div className="space-y-8 border-t border-white/10 pt-16">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Emotional Discovery</span>
          <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tighter">
            Browse By Emotional Mood
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {moodClusters.map(mood => {
            const isSelected = selectedMood === mood.name;
            return (
              <button 
                key={mood.name}
                onClick={() => setSelectedMood(isSelected ? null : mood.name)}
                className={cn(
                  "p-6 border text-left flex flex-col justify-between aspect-square transition-all duration-300 group",
                  isSelected 
                    ? "bg-white text-black border-white shadow-2xl scale-[1.03]" 
                    : "bg-white/[0.02] border-white/10 hover:border-white/30 text-white"
                )}
              >
                <span className="text-3xl">{mood.icon}</span>
                <div className="space-y-1">
                  <h3 className="text-lg font-black uppercase tracking-tight">{mood.name}</h3>
                  <span className={cn("text-[9px] font-bold uppercase tracking-widest block", isSelected ? "text-black/60" : "text-white/40")}>
                    {beats.length} {beats.length === 1 ? 'Beat' : 'Beats'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
