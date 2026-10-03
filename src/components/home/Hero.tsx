import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Heart, Share2, ArrowRight } from 'lucide-react';
import { useAudioStore } from '../../store/useAudioStore';

export const Hero = () => {
  const { setBeat } = useAudioStore();

  // Reference generated image path
  const heroImg = '/src/assets/images/hero_studio_cinematic_1791053615857.jpg';
  const featuredArtwork = '/src/assets/images/beat_artwork_abstract_1791053624368.jpg';

  // Mock featured beat for visibility (normally fetched)
  const featuredBeat = {
    id: 'featured-1',
    title: 'VALKYRIE',
    producerId: 'kraezelvbeatz',
    bpm: 144,
    key: 'C minor',
    genre: 'Trap',
    tags: ['Aggressive', 'Dark', 'Hard'],
    moods: ['DARK'],
    slug: 'valkyrie-v1',
    isPrivate: false,
    isBootleg: false,
    instruments: [],
    audioUrl: '', // Will be real in production
    artworkUrl: featuredArtwork,
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

  return (
    <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden">
      {/* Background with Scrim */}
      <div className="absolute inset-0">
        <img 
          src={heroImg} 
          alt="Studio" 
          className="w-full h-full object-cover filter grayscale brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 w-full grid lg:grid-cols-2 gap-12 items-center py-20">
        <div className="flex flex-col items-start gap-6">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40 py-1 px-3 border border-white/10">
              Featured Release
            </span>
          </div>
          
          <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-white uppercase leading-none">
            {featuredBeat.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm uppercase tracking-widest text-white/60">
            <span>{featuredBeat.genre}</span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span>{featuredBeat.bpm} BPM</span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span>{featuredBeat.key}</span>
          </div>

          <p className="text-lg text-white/40 max-w-lg uppercase tracking-tight leading-relaxed">
            Premium industry-standard production. Elevate your sound with the signature KRAEZELVBEATZ aesthetic.
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-4">
            <button 
              onClick={() => setBeat(featuredBeat)}
              className="px-10 py-5 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-neutral-200 transition-all flex items-center gap-3"
            >
              <Play size={18} fill="currentColor" /> Play Now
            </button>
            <button className="px-10 py-5 border border-white/20 text-white font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all">
              License — $29.99
            </button>
          </div>
        </div>

        <div className="hidden lg:block relative group">
          <div className="absolute -inset-4 bg-white/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <img 
            src={featuredArtwork} 
            alt="Artwork" 
            className="relative w-full aspect-square object-cover border border-white/10 shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000"
          />
          
          {/* Quick Info Overlay */}
          <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-4">
              <button className="w-12 h-12 bg-black/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                <Heart size={20} />
              </button>
              <button className="w-12 h-12 bg-black/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                <Share2 size={20} />
              </button>
            </div>
            <Link to="/beats" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white hover:gap-4 transition-all">
              View All <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
