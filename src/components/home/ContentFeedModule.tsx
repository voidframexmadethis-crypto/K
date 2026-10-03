import React, { useState } from 'react';
import { Play, Heart, MessageSquare, Share2, Video, FileText, Sparkles, Radio, Music } from 'lucide-react';
import { FeedItem, Beat } from '../../types';
import { useAudioStore } from '../../store/useAudioStore';
import { cn } from '../../lib/utils';

export const ContentFeedModule: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'upload' | 'article' | 'tutorial' | 'announcement'>('all');
  const { setBeat, currentBeat, isPlaying, togglePlay } = useAudioStore();

  const demoBeats: Record<string, Beat> = {
    b1: {
      id: 'b1', title: 'APOLLO', producerId: 'KRAEZELV', bpm: 140, key: 'D Minor', genre: 'Trap',
      artworkUrl: '/src/assets/images/beat_artwork_abstract_1791053624368.jpg', audioUrl: '', isFree: false,
      tags: ['TRAP', 'HARD'], moods: ['DARK'], slug: 'apollo', isPrivate: false, isBootleg: false, instruments: [],
      licenses: { basic: { price: 29.99, enabled: true }, premium: { price: 49.99, enabled: true }, unlimited: { price: 99.99, enabled: true }, exclusive: { price: 499.99, enabled: true } },
      createdAt: new Date().toISOString(), published: true
    },
    b2: {
      id: 'b2', title: 'NIGHTFALL', producerId: 'KRAEZELV', bpm: 128, key: 'A Minor', genre: 'Dark Trap',
      artworkUrl: '/src/assets/images/beat_artwork_abstract_1791053624368.jpg', audioUrl: '', isFree: true,
      tags: ['FREE', 'SMOOTH'], moods: ['CHILL'], slug: 'nightfall', isPrivate: false, isBootleg: false, instruments: [],
      licenses: { basic: { price: 29.99, enabled: true }, premium: { price: 49.99, enabled: true }, unlimited: { price: 99.99, enabled: true }, exclusive: { price: 499.99, enabled: true } },
      createdAt: new Date().toISOString(), published: true
    }
  };

  const feedItems: FeedItem[] = [
    {
      id: 'feed-1',
      type: 'upload',
      title: 'New Master Uploaded: "PHANTOM DRILL"',
      content: 'Just finished rendering the WAV trackout stems for PHANTOM. Features heavy sliding UK drill sub-bass, organic hi-hat rolls, and reverse bell textures.',
      author: 'KRAEZELV (Master Producer)',
      timestamp: '2 hours ago',
      imageUrl: '/src/assets/images/beat_artwork_abstract_1791053624368.jpg',
      beatId: 'b1',
      likes: 184,
      comments: 24
    },
    {
      id: 'feed-2',
      type: 'tutorial',
      title: 'Tutorial: Mixing Hard 808s Without Muddying Vocal Stems',
      content: 'In this breakdown tutorial, we explore sidechain compression curves, soft-clipping saturation, and stereo widening for 808 sub-frequencies.',
      author: 'KRAEZELV Sound Lab',
      timestamp: '5 hours ago',
      videoUrl: 'https://youtube.com',
      likes: 312,
      comments: 48
    },
    {
      id: 'feed-3',
      type: 'announcement',
      title: 'Summer Flash Promotion: Buy 2 Beats, Get 1 Free Auto-Applied',
      content: 'All basic, premium, and unlimited beat licenses are eligible for instant multi-buy discounting. Add any 3 beats to your basket today.',
      author: 'KRAEZELV Storefront',
      timestamp: '1 day ago',
      likes: 540,
      comments: 89
    },
    {
      id: 'feed-4',
      type: 'article',
      title: 'Producer Masterclass: How To Register Beats With BMI & ASCAP',
      content: 'Understanding split sheets, mechanical royalties, and publisher registration before leasing instrumentals to recording artists.',
      author: 'Legal & Publishing Dept',
      timestamp: '2 days ago',
      likes: 290,
      comments: 31
    }
  ];

  const filteredFeed = filter === 'all' ? feedItems : feedItems.filter(item => item.type === filter);

  return (
    <section className="max-w-[1800px] mx-auto px-6 md:px-12 py-24 border-t border-white/10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Radio size={14} className="text-white animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Real-Time Activity</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black uppercase text-white tracking-tighter">
            Community & Content Timeline
          </h2>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2 p-1 bg-white/5 border border-white/10">
          {[
            { id: 'all', label: 'All Activity' },
            { id: 'upload', label: 'Music Uploads' },
            { id: 'tutorial', label: 'Tutorials' },
            { id: 'article', label: 'Blog & Guides' },
            { id: 'announcement', label: 'Announcements' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={cn(
                "px-5 py-2 text-[9px] font-black uppercase tracking-widest transition-all",
                filter === tab.id ? "bg-white text-black" : "text-white/40 hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Infinite Timeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredFeed.map(item => {
          const beat = item.beatId ? demoBeats[item.beatId] : null;
          const isCurrent = beat && currentBeat?.id === beat.id;

          return (
            <div 
              key={item.id}
              className="p-8 bg-white/[0.02] border border-white/10 flex flex-col justify-between gap-6 hover:border-white/30 transition-all duration-300 group relative"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-white/10 text-white text-[8px] font-black uppercase tracking-[0.3em]">
                    {item.type}
                  </span>
                  <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{item.timestamp}</span>
                </div>

                {item.imageUrl && (
                  <div className="relative aspect-video overflow-hidden bg-neutral-900 border border-white/5">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    {beat && (
                      <button 
                        onClick={() => isCurrent ? togglePlay() : setBeat(beat)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center">
                          <Play size={20} fill="black" className="ml-0.5" />
                        </div>
                      </button>
                    )}
                  </div>
                )}

                <h3 className="text-lg font-black uppercase text-white tracking-tight leading-snug group-hover:text-white/90">
                  {item.title}
                </h3>

                <p className="text-xs text-white/60 leading-relaxed font-normal">
                  {item.content}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-white/40">
                <span>{item.author}</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><Heart size={12} /> {item.likes}</span>
                  <span className="flex items-center gap-1.5"><MessageSquare size={12} /> {item.comments}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
