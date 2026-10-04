import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, UserCheck, UserPlus, Sparkles, Check, Play, Music } from 'lucide-react';
import { Beat, Producer } from '../../types';
import { useAudioStore } from '../../store/useAudioStore';
import { cn } from '../../lib/utils';

export const DiscoveryCarousels: React.FC = () => {
  const { setBeat, currentBeat, isPlaying, togglePlay } = useAudioStore();
  const [selectedGenre, setSelectedGenre] = useState<string>('Trap');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const [producers, setProducers] = useState<Producer[]>([
    {
      id: 'p1',
      name: 'KRAEZELVbeatz',
      avatarUrl: '/src/assets/images/hero_studio_cinematic_1791053615857.jpg',
      subscribersCount: 250000,
      verified: true,
      isFollowing: true,
      genre: 'Cinematic Trap, Drill & R&B'
    }
  ]);

  const recommendedBeats: Beat[] = [
    {
      id: 'rec-1', title: 'APOLLO', producerId: 'KRAEZELV', bpm: 140, key: 'D Minor', genre: 'Trap',
      artworkUrl: '/src/assets/images/beat_artwork_abstract_1791053624368.jpg', audioUrl: '', isFree: false,
      tags: ['TRAP'], moods: ['ENERGETIC'], slug: 'apollo', isPrivate: false, isBootleg: false, instruments: [],
      licenses: { basic: { price: 29.99, enabled: true }, premium: { price: 49.99, enabled: true }, unlimited: { price: 99.99, enabled: true }, exclusive: { price: 499.99, enabled: true } },
      createdAt: '', published: true
    },
    {
      id: 'rec-2', title: 'VALKYRIE', producerId: 'KRAEZELV', bpm: 144, key: 'C Minor', genre: 'Trap',
      artworkUrl: '/src/assets/images/hero_valkyrie_massive_1791054144327.jpg', audioUrl: '', isFree: false,
      tags: ['DRILL'], moods: ['DARK'], slug: 'valkyrie', isPrivate: false, isBootleg: false, instruments: [],
      licenses: { basic: { price: 29.99, enabled: true }, premium: { price: 49.99, enabled: true }, unlimited: { price: 99.99, enabled: true }, exclusive: { price: 499.99, enabled: true } },
      createdAt: '', published: true
    },
    {
      id: 'rec-3', title: 'NIGHTFALL', producerId: 'KRAEZELV', bpm: 128, key: 'A Minor', genre: 'Trap',
      artworkUrl: '/src/assets/images/beat_artwork_abstract_1791053624368.jpg', audioUrl: '', isFree: true,
      tags: ['SMOOTH'], moods: ['CHILL'], slug: 'nightfall', isPrivate: false, isBootleg: false, instruments: [],
      licenses: { basic: { price: 29.99, enabled: true }, premium: { price: 49.99, enabled: true }, unlimited: { price: 99.99, enabled: true }, exclusive: { price: 499.99, enabled: true } },
      createdAt: '', published: true
    },
    {
      id: 'rec-4', title: 'PHANTOM', producerId: 'KRAEZELV', bpm: 142, key: 'C# Minor', genre: 'Drill',
      artworkUrl: '/src/assets/images/pack_artwork_geometric_1791053633249.jpg', audioUrl: '', isFree: false,
      tags: ['DRILL'], moods: ['AGGRESSIVE'], slug: 'phantom', isPrivate: false, isBootleg: false, instruments: [],
      licenses: { basic: { price: 34.99, enabled: true }, premium: { price: 54.99, enabled: true }, unlimited: { price: 109.99, enabled: true }, exclusive: { price: 599.99, enabled: true } },
      createdAt: '', published: true
    }
  ];

  const moodClusters = [
    { name: 'Energetic', icon: '⚡', count: '142 Beats' },
    { name: 'Dark', icon: '🌑', count: '210 Beats' },
    { name: 'Sad', icon: '🌧️', count: '89 Beats' },
    { name: 'Chill', icon: '☕', count: '165 Beats' },
    { name: 'Aggressive', icon: '🔥', count: '198 Beats' },
    { name: 'Uplifting', icon: '✨', count: '112 Beats' }
  ];

  const toggleFollow = (id: string) => {
    setProducers(prev => prev.map(p => p.id === id ? { ...p, isFollowing: !p.isFollowing } : p));
  };

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
          <div className="flex items-center gap-2">
            <button onClick={() => scroll('left')} className="p-3 border border-white/10 hover:border-white text-white transition-all">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scroll('right')} className="p-3 border border-white/10 hover:border-white text-white transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Shelf */}
        <div ref={scrollRef} className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4">
          {recommendedBeats.map(beat => {
            const isCurrent = currentBeat?.id === beat.id;
            return (
              <div key={beat.id} className="min-w-[280px] md:min-w-[320px] bg-white/[0.02] border border-white/10 p-6 flex flex-col gap-4 group">
                <div className="relative aspect-square overflow-hidden bg-neutral-900 border border-white/5">
                  <img src={beat.artworkUrl} alt={beat.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
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
                  <span className="text-sm font-black text-white">${beat.licenses.basic.price}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Trending Producer Spot */}
      <div className="space-y-8 border-t border-white/10 pt-16">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Verified Channel</span>
          <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tighter">
            Trending Producer
          </h2>
        </div>

        <div className="max-w-md">
          {producers.map(producer => (
            <div key={producer.id} className="p-8 bg-white/[0.02] border border-white/10 flex flex-col items-center text-center gap-6 group hover:border-white/30 transition-all">
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-white/20 p-1 group-hover:border-white transition-colors">
                <img src={producer.avatarUrl} alt={producer.name} className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all" />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-xl font-black uppercase text-white tracking-tight">{producer.name}</h3>
                  <Check size={16} className="p-0.5 bg-white text-black rounded-full" />
                </div>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{producer.genre}</span>
                <span className="text-[11px] font-black text-white/80 tabular-nums">{(producer.subscribersCount / 1000).toFixed(0)}k Subscribers</span>
              </div>

              <button 
                onClick={() => toggleFollow(producer.id)}
                className={cn(
                  "w-full py-3.5 text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2",
                  producer.isFollowing ? "bg-white/10 text-white border border-white/20" : "bg-white text-black hover:bg-neutral-200"
                )}
              >
                {producer.isFollowing ? <><UserCheck size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Mood-Based Clusters Tile Grid */}
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
                    {mood.count}
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
