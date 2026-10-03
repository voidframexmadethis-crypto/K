import React, { useState, useEffect } from 'react';
import { Play, Heart, Share2, Download, ChevronLeft, ChevronRight, Sparkles, Flame, Tag, Trophy, ShieldCheck, ShoppingCart } from 'lucide-react';
import { useAudioStore } from '../../store/useAudioStore';
import { Beat } from '../../types';
import { cn } from '../../lib/utils';

interface Slide {
  id: string;
  badge: string;
  badgeIcon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  statNumber: string;
  statLabel: string;
  heroImg: string;
  artwork: string;
  ctaText: string;
  price: string;
  featuredBeat: Beat;
}

export const HeroSpotlightCarousel: React.FC = () => {
  const { setBeat, currentBeat, isPlaying, togglePlay, progress, duration } = useAudioStore();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const artwork1 = '/src/assets/images/hero_valkyrie_massive_1791054144327.jpg';
  const artwork2 = '/src/assets/images/beat_artwork_abstract_1791053624368.jpg';
  const artwork3 = '/src/assets/images/pack_artwork_geometric_1791053633249.jpg';

  const slides: Slide[] = [
    {
      id: 'slide-valkyrie',
      badge: 'Flagship Production Release',
      badgeIcon: <Flame size={12} />,
      title: 'VALKYRIE',
      subtitle: 'PRODUCER: KRAEZELV · 144 BPM · C MINOR',
      description: 'Heavy 808s, haunting atmospheric strings, and aggressive brass hits crafted for chart-topping trap and drill projects.',
      statNumber: '5.2M+',
      statLabel: 'Beats Sold Platform-Wide',
      heroImg: artwork1,
      artwork: artwork1,
      ctaText: 'Stream Flagship Beat',
      price: '$29.99',
      featuredBeat: {
        id: 'valkyrie-massive',
        title: 'VALKYRIE',
        producerId: 'KRAEZELV',
        bpm: 144,
        key: 'C MINOR',
        genre: 'DARK TRAP',
        tags: ['AGGRESSIVE', 'CINEMATIC', 'HARD'],
        moods: ['DARK', 'ENERGETIC'],
        slug: 'valkyrie',
        isPrivate: false,
        isBootleg: false,
        instruments: ['808', 'BRASS', 'STRINGS'],
        audioUrl: '', 
        artworkUrl: artwork1,
        isFree: false,
        licenses: { 
          basic: { price: 29.99, enabled: true }, 
          premium: { price: 49.99, enabled: true }, 
          unlimited: { price: 99.99, enabled: true }, 
          exclusive: { price: 499.99, enabled: true } 
        },
        createdAt: new Date().toISOString(),
        published: true
      }
    },
    {
      id: 'slide-propage',
      badge: 'Featured "Pro Page" Producer',
      badgeIcon: <Trophy size={12} />,
      title: 'APOLLO',
      subtitle: 'PRODUCER: KRAEZELV · 140 BPM · D MINOR',
      description: 'Clean melodic synths over bouncy bounce drums. Ranked #1 Trending Instrumental of the week.',
      statNumber: '#1 TOP',
      statLabel: 'Selling Producer Of The Week',
      heroImg: artwork2,
      artwork: artwork2,
      ctaText: 'Stream Apollo',
      price: '$29.99',
      featuredBeat: {
        id: 'b1',
        title: 'APOLLO',
        producerId: 'KRAEZELV',
        bpm: 140,
        key: 'D MINOR',
        genre: 'TRAP',
        tags: ['MELODIC', 'BOUNCY', 'CHART'],
        moods: ['ENERGETIC'],
        slug: 'apollo',
        isPrivate: false,
        isBootleg: false,
        instruments: ['SYNTH', '808'],
        audioUrl: '',
        artworkUrl: artwork2,
        isFree: false,
        licenses: { 
          basic: { price: 29.99, enabled: true }, 
          premium: { price: 49.99, enabled: true }, 
          unlimited: { price: 99.99, enabled: true }, 
          exclusive: { price: 499.99, enabled: true } 
        },
        createdAt: new Date().toISOString(),
        published: true
      }
    },
    {
      id: 'slide-sale',
      badge: 'Summer Sitewide Flash Sale',
      badgeIcon: <Tag size={12} />,
      title: 'BUY 2 GET 1',
      subtitle: 'SPECIAL PROMO · ALL LICENSES INCLUDED',
      description: 'Stack your basket with any 3 beats and the 3rd beat license is automatically credited 100% FREE at checkout.',
      statNumber: '120K+',
      statLabel: 'Active Recording Artists',
      heroImg: artwork3,
      artwork: artwork3,
      ctaText: 'Explore Special Promo',
      price: 'FREE DEAL',
      featuredBeat: {
        id: 'b2',
        title: 'NIGHTFALL',
        producerId: 'KRAEZELV',
        bpm: 128,
        key: 'A MINOR',
        genre: 'DARK TRAP',
        tags: ['FREE', 'SMOOTH'],
        moods: ['CHILL'],
        slug: 'nightfall',
        isPrivate: false,
        isBootleg: false,
        instruments: ['PIANO', 'PAD'],
        audioUrl: '',
        artworkUrl: artwork2,
        isFree: true,
        licenses: { 
          basic: { price: 29.99, enabled: true }, 
          premium: { price: 49.99, enabled: true }, 
          unlimited: { price: 99.99, enabled: true }, 
          exclusive: { price: 499.99, enabled: true } 
        },
        createdAt: new Date().toISOString(),
        published: true
      }
    }
  ];

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [autoPlay, slides.length]);

  const currentSlide = slides[currentSlideIndex];
  const isPlayingCurrent = currentBeat?.id === currentSlide.featuredBeat.id && isPlaying;

  const nextSlide = () => {
    setAutoPlay(false);
    setCurrentSlideIndex((currentSlideIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setAutoPlay(false);
    setCurrentSlideIndex((currentSlideIndex - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col justify-center items-center overflow-hidden pt-20 bg-black">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={currentSlide.heroImg} 
          className="w-full h-full object-cover scale-110 blur-[2px] brightness-[0.25] transition-all duration-1000 ease-out" 
          alt="Banner Visual" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_90%)]" />
      </div>

      {/* Main Slide Content Grid */}
      <div className="relative z-10 w-full max-w-[1800px] px-6 md:px-12 grid lg:grid-cols-12 gap-12 items-center flex-1 py-12">
        {/* Left Copy & Actions */}
        <div className="lg:col-span-7 flex flex-col gap-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-white/10 border border-white/20 text-white flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em]">
                {currentSlide.badgeIcon} {currentSlide.badge}
              </span>
              <span className="h-px w-12 bg-white/20" />
            </div>

            <h1 className="text-[6rem] sm:text-[8rem] md:text-[11rem] font-black tracking-[-0.05em] text-white leading-[0.8] uppercase select-none">
              {currentSlide.title}
            </h1>

            <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-white/60">
              {currentSlide.subtitle}
            </p>

            <p className="text-sm md:text-base font-medium text-white/70 max-w-2xl leading-relaxed uppercase tracking-wide">
              {currentSlide.description}
            </p>
          </div>

          {/* Micro-Stats Overlays Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-white/10">
            <div className="p-4 bg-white/[0.03] border border-white/10 flex flex-col gap-1">
              <span className="text-2xl md:text-3xl font-black text-white tracking-tight">{currentSlide.statNumber}</span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">{currentSlide.statLabel}</span>
            </div>
            <div className="p-4 bg-white/[0.03] border border-white/10 flex flex-col gap-1">
              <span className="text-2xl md:text-3xl font-black text-white tracking-tight">100%</span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Royalty-Free Commercial Guarantee</span>
            </div>
            <div className="hidden sm:flex p-4 bg-white/[0.03] border border-white/10 flex-col gap-1">
              <span className="text-2xl md:text-3xl font-black text-white tracking-tight">Instant</span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Untagged WAV & Stems Delivery</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <button 
              onClick={() => {
                if (currentBeat?.id === currentSlide.featuredBeat.id) {
                  togglePlay();
                } else {
                  setBeat(currentSlide.featuredBeat);
                }
              }}
              className="px-12 py-6 bg-white text-black font-black uppercase tracking-[0.4em] text-xs hover:bg-neutral-200 transition-all active:scale-95 flex items-center gap-4 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
            >
              <Play size={18} fill="black" /> {isPlayingCurrent ? 'Pause Track' : currentSlide.ctaText}
            </button>

            <button className="px-10 py-6 border border-white/20 text-white font-black uppercase tracking-[0.4em] text-xs hover:bg-white hover:text-black transition-all">
              License Starting {currentSlide.price}
            </button>
          </div>
        </div>

        {/* Right Artwork Showcase with Instant Play Floating Overlay */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative group w-full aspect-square max-w-lg bg-neutral-950 border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.05)]">
            <img 
              src={currentSlide.artwork} 
              alt={currentSlide.title}
              className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
            />

            {/* Instant Play Call-To-Action Floating Button */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <button 
                onClick={() => {
                  if (currentBeat?.id === currentSlide.featuredBeat.id) {
                    togglePlay();
                  } else {
                    setBeat(currentSlide.featuredBeat);
                  }
                }}
                className="w-32 h-32 bg-black/50 backdrop-blur-2xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500 hover:scale-110 active:scale-95 group/play shadow-[0_0_80px_rgba(0,0,0,0.8)]"
              >
                {isPlayingCurrent ? (
                  <div className="flex gap-1.5 items-end h-10">
                    <div className="w-2 h-8 bg-white group-hover/play:bg-black animate-pulse" />
                    <div className="w-2 h-10 bg-white group-hover/play:bg-black animate-pulse delay-75" />
                    <div className="w-2 h-6 bg-white group-hover/play:bg-black animate-pulse delay-150" />
                  </div>
                ) : (
                  <Play size={44} fill="currentColor" className="ml-2 group-hover/play:scale-110 transition-transform" />
                )}
              </button>
            </div>

            {/* Floating Top Tag */}
            <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2 text-[9px] font-black uppercase tracking-[0.3em] text-white">
              Instant Stream Enabled
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Controls & Indicators */}
      <div className="relative z-10 w-full max-w-[1800px] px-6 md:px-12 py-6 flex items-center justify-between border-t border-white/10">
        <div className="flex items-center gap-3">
          {slides.map((s, idx) => (
            <button 
              key={s.id}
              onClick={() => {
                setAutoPlay(false);
                setCurrentSlideIndex(idx);
              }}
              className={cn(
                "h-1.5 transition-all duration-500",
                idx === currentSlideIndex ? "w-12 bg-white" : "w-4 bg-white/20 hover:bg-white/40"
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={prevSlide}
            className="p-3 border border-white/10 text-white/40 hover:text-white hover:border-white transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
            0{currentSlideIndex + 1} / 0{slides.length}
          </span>
          <button 
            onClick={nextSlide}
            className="p-3 border border-white/10 text-white/40 hover:text-white hover:border-white transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};
