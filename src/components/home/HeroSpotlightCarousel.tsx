import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Search, Sparkles, Flame, Star, Trophy, Users, ShieldCheck, Mic, MicOff } from 'lucide-react';
import { useAudioStore } from '../../store/useAudioStore';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { useDiscoveryStore } from '../../store/useDiscoveryStore';
import { Beat } from '../../types';
import { cn } from '../../lib/utils';

export const HeroSpotlightCarousel: React.FC = () => {
  const { setBeat, currentBeat, isPlaying, togglePlay } = useAudioStore();
  const { beats } = useBeatCatalogStore();
  const { searchQuery, setSearchQuery } = useDiscoveryStore();
  const [activeTab, setActiveTab] = useState<'featured' | 'signature'>('featured');
  const [isListening, setIsListening] = useState(false);

  const scrollToCatalog = () => {
    const catalogEl = document.getElementById('discovery-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is supported on Google Chrome, Microsoft Edge, and other modern browsers.");
      return;
    }
    
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onerror = (event: any) => {
        console.error("Voice recognition error", event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchQuery(transcript);
          scrollToCatalog();
        }
      };
      
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Luxury Moving Particles Background on Canvas (Performance Friendly & Cinematic)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || 600);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = canvas.offsetHeight || 600;
      }
    };
    window.addEventListener('resize', handleResize);

    const particles: { x: number; y: number; r: number; dx: number; dy: number; color: string }[] = [];
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        color: Math.random() > 0.6 ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.08)',
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Slow movement
        p.x += p.dx;
        p.y += p.dy;

        // Boundaries check
        if (p.x < 0 || p.x > width) p.dx *= -1;
        if (p.y < 0 || p.y > height) p.dy *= -1;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const flagshipBeat: Beat | null = beats.length > 0 ? beats[0] : null;
  const isCurrentPlaying = flagshipBeat && currentBeat?.id === flagshipBeat.id && isPlaying;

  const handlePlayClick = () => {
    if (!flagshipBeat) return;
    if (currentBeat?.id === flagshipBeat.id) {
      togglePlay();
    } else {
      setBeat(flagshipBeat);
    }
  };

  return (
    <section className="relative w-full min-h-[92vh] flex flex-col justify-center items-center overflow-hidden bg-black pt-28 pb-12 border-b border-white/10">
      {/* Background Canvas Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80" />

      {/* Atmospheric Radial Shading */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-purple-900/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.95)_90%)]" />
      </div>

      <div className="relative z-10 w-full max-w-[1700px] px-6 sm:px-10 md:px-12 mx-auto flex flex-col gap-12 flex-1 justify-center">
        {/* TOP METADATA BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-8">
          {/* Brand & Signature Identity Tag */}
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-400 bg-purple-950/40 border border-purple-500/30 px-3.5 py-1.5 flex items-center gap-2">
              <Sparkles size={11} className="animate-spin duration-3000" /> KRAEZELV DESIGN IDENTITY
            </span>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-[10px] font-bold font-mono tracking-widest text-white/40 italic">
              "K-K-Kraezelv, drop that beat!"
            </span>
          </div>

          {/* Real-time catalog counter */}
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-white/40">
            <span className="flex items-center gap-1.5"><Flame size={12} className="text-purple-400" /> {beats.length} MASTER BEATS LIVE</span>
            <span className="h-1.5 w-1.5 bg-purple-500 rounded-full animate-ping" />
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center flex-1">
          {/* LEFT: DRAMATIC TYPOGRAPHY & INTEGRATED LARGE SEARCH BAR */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">
                ULTRA-PREMIUM COMMERCIAL INSTRUMENTALS
              </span>
              <h1 className="text-5xl sm:text-7xl xl:text-8xl font-black uppercase text-white tracking-tighter leading-[0.85] text-balance">
                SOUND <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-purple-500">AWARDS</span> DESIGNED
              </h1>
              <p className="text-sm md:text-base text-white/50 leading-relaxed max-w-xl">
                Elevate your discography with industry-standard, high-headroom 24-bit WAV masters. Instant licensing agreements processed directly via your Personal PayPal.
              </p>
            </div>

            {/* INTEGRATED CENTERING SEARCH BAR */}
            <div className="relative w-full max-w-2xl bg-white/[0.02] border border-white/10 p-2 focus-within:border-purple-500/40 focus-within:shadow-[0_0_30px_rgba(168,85,247,0.1)] transition-all">
              <div className="relative flex items-center">
                <Search size={18} className="absolute left-4 text-white/20 pointer-events-none" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    scrollToCatalog();
                  }}
                  placeholder="SEARCH BEAT, GENRE, BPM, KEY, OR TAG..."
                  className="w-full bg-transparent border-none outline-none p-4 pl-12 pr-12 text-[11px] font-black uppercase tracking-[0.25em] text-white placeholder:text-white/20 placeholder:tracking-widest"
                />

                {/* Voice search mic trigger */}
                <button 
                  onClick={startVoiceSearch}
                  className={cn(
                    "p-2.5 mr-2 rounded-full transition-all duration-300 relative group/mic cursor-pointer",
                    isListening 
                      ? "bg-purple-600 text-white animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.6)]" 
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                  title={isListening ? "Listening..." : "Voice Search"}
                >
                  <Mic size={14} className={cn(isListening && "animate-bounce")} />
                  {isListening && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                  )}
                </button>

                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-2 text-white/40 hover:text-white text-[9px] font-black uppercase tracking-widest mr-2 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <button 
                  onClick={scrollToCatalog}
                  className="px-6 py-4 bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors shrink-0 cursor-pointer"
                >
                  FIND BEATS
                </button>
              </div>
            </div>

            {/* SOCIAL PROOF & TRUST STACK */}
            <div className="pt-4 flex flex-wrap items-center gap-8 text-[10px] font-black uppercase tracking-widest text-white/40">
              <span className="flex items-center gap-2"><Trophy size={14} className="text-purple-400" /> #1 INDEPENDENT BEATMAKER</span>
              <span className="flex items-center gap-2"><Users size={14} className="text-purple-400" /> TRUSTED BY 10,000+ ARTISTS</span>
              <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-purple-400" /> 100% SECURE LICENSES</span>
            </div>
          </div>

          {/* RIGHT: FEATURED FLAGSHIP RELEASE (DARK LUXURY BOX) */}
          <div className="lg:col-span-5 flex justify-center">
            {flagshipBeat ? (
              <div className="w-full max-w-md bg-neutral-950/80 border border-white/10 p-8 backdrop-blur-2xl relative shadow-2xl space-y-6 group hover:border-purple-500/30 transition-all duration-500">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                    <Star size={12} fill="currentColor" /> FEATURED DROP
                  </span>
                  <span className="text-[9px] font-mono font-bold text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 uppercase tracking-widest">
                    {flagshipBeat.genre}
                  </span>
                </div>

                <div className="relative aspect-square w-full bg-neutral-900 border border-white/5 overflow-hidden shadow-lg">
                  <img 
                    src={flagshipBeat.artworkUrl} 
                    alt={flagshipBeat.title}
                    className="w-full h-full object-cover transition-all duration-1000 grayscale group-hover:grayscale-0 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={handlePlayClick}
                      className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform"
                    >
                      {isCurrentPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter truncate">{flagshipBeat.title}</h3>
                  <div className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
                    <span>{flagshipBeat.bpm} BPM</span>
                    <span>·</span>
                    <span>{flagshipBeat.key}</span>
                    <span>·</span>
                    <span className="text-purple-400 font-black">STARTING ${flagshipBeat.licenses.basic.price.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={handlePlayClick}
                  className="w-full py-4 bg-white text-black hover:bg-neutral-200 transition-colors font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                >
                  {isCurrentPlaying ? "PAUSE AUDITION" : "LISTEN TO MASTER"}
                </button>
              </div>
            ) : (
              <div className="w-full max-w-md p-10 bg-neutral-950/60 border border-white/5 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Sparkles size={20} />
                </div>
                <h4 className="text-sm font-black uppercase text-white tracking-widest">Awaiting Your Audio Drops</h4>
                <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                  Connect your Personal PayPal via Payhip and upload beats to publish your first hit release here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
