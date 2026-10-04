import React from 'react';
import { Link } from 'react-router-dom';
import { SectionHeader } from './home/SectionHeader';
import { ArrowRight, Instagram, Youtube, Twitter, Disc } from 'lucide-react';

export const ProducerFeature = () => {
  return (
    <section className="relative w-full overflow-hidden bg-black py-80">
      {/* Background oversized logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vw] font-black text-purple-500/[0.02] select-none pointer-events-none uppercase tracking-[-0.1em]">
        CK
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10 grid lg:grid-cols-12 gap-24 items-center">
        <div className="lg:col-span-6 flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
               <div className="w-16 h-px bg-purple-500/40" />
               <span className="text-xs font-black uppercase tracking-[0.5em] text-purple-400">Architect of Sound</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-black text-white leading-[0.85]">
              KRAEZELV<br /><span className="text-purple-400">beatz</span>
            </h2>
          </div>

          <p className="text-xl md:text-2xl text-white/50 uppercase tracking-tight leading-relaxed max-w-2xl font-medium">
            Defining the next generation of dark cinematic production. Industry-standard textures meet uncompromising modern rhythm. The official standalone beat catalog for the world's most ambitious recording artists.
          </p>

          <div className="flex flex-col gap-16">
             <div className="grid grid-cols-3 gap-12 border-y border-white/5 py-16">
                <div className="flex flex-col gap-3">
                   <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Active Years</span>
                   <span className="text-5xl font-black text-white tabular-nums">08+</span>
                </div>
                <div className="flex flex-col gap-3">
                   <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Verified Hits</span>
                   <span className="text-5xl font-black text-white tabular-nums">240+</span>
                </div>
                <div className="flex flex-col gap-3">
                   <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Platinums</span>
                   <span className="text-5xl font-black text-white tabular-nums">12</span>
                </div>
             </div>

             <div className="flex flex-wrap gap-12">
                <Link to="/dashboard" className="px-20 py-10 bg-white text-black font-black uppercase tracking-[0.5em] text-sm hover:bg-neutral-200 transition-all flex items-center gap-6 group shadow-[0_0_80px_rgba(255,255,255,0.1)]">
                  Explore Profile <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform" />
                </Link>
                <div className="flex items-center gap-10">
                   {[Instagram, Youtube, Twitter].map((Icon, i) => (
                     <Icon key={i} className="text-white/30 hover:text-white transition-all cursor-pointer hover:-translate-y-1" size={32} />
                   ))}
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-6 relative h-full">
           <div className="aspect-[4/5] bg-neutral-900 border border-white/5 relative overflow-hidden group shadow-2xl">
              <img src="/src/assets/images/hero_studio_cinematic_1791053615857.jpg" className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-[3000ms] ease-out" alt="Producer" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,transparent_20%,black_120%)] opacity-80" />
              
              <div className="absolute bottom-16 right-16 flex flex-col items-end gap-4 text-right">
                 <div className="w-20 h-20 border border-white/10 rounded-full flex items-center justify-center animate-spin-slow">
                    <Disc size={48} className="text-white/20" />
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white">Mastering Session</span>
                    <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-white/20">KV-STUDIO.SYS // 2026</span>
                 </div>
              </div>

              {/* Decorative technical elements */}
              <div className="absolute top-16 left-16 flex flex-col gap-4 opacity-20">
                 <div className="w-12 h-0.5 bg-white" />
                 <div className="w-8 h-0.5 bg-white" />
                 <div className="w-4 h-0.5 bg-white" />
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};

