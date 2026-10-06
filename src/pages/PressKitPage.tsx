import React from 'react';
import { Download, FileText, Globe, Youtube, Instagram, Twitter, Disc, ExternalLink, Mail, CheckCircle2 } from 'lucide-react';
import { useBeatCatalogStore } from '../store/useBeatCatalogStore';

export const PressKitPage: React.FC = () => {
  const { beats } = useBeatCatalogStore();
  const spotlightBeats = beats.slice(0, 4);

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-32">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 space-y-16">
        
        {/* HEADER */}
        <div className="border-b border-white/10 pb-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600/20 border border-purple-500/40 text-purple-300 text-[9px] font-black uppercase tracking-[0.3em]">
            OFFICIAL MEDIA RESOURCE
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white">
            KRAEZELV PRESS KIT
          </h1>
          <p className="text-sm md:text-base text-white/60 font-mono uppercase tracking-widest max-w-2xl leading-relaxed">
            Official biography, high-resolution logos, brand assets, placement catalog, and contact information for journalists, media outlets, and industry partners.
          </p>
        </div>

        {/* BIOGRAPHY & BRAND STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-white/10 pb-12">
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-2xl font-black uppercase text-purple-400 tracking-tight">PRODUCER BIOGRAPHY</h2>
            <div className="space-y-4 text-white/80 font-light leading-relaxed text-sm sm:text-base tracking-wide">
              <p>
                KRAEZELV is an international record producer and sound designer renowned for pioneering dark, cinematic, and atmospheric trap & drill soundscapes. Based between Atlanta, GA and global studio hubs, KRAEZELV has produced chart-topping instrumentals and high-impact sync arrangements.
              </p>
              <p>
                With a signature sound characterized by heavy 808 sub-bass, minor-key orchestral pads, and intricate percussion arrangements, KRAEZELV provides recording artists, singers, and filmmakers with industry-ready production.
              </p>
            </div>
          </div>

          <div className="lg:col-span-4 bg-neutral-950 border border-white/10 p-8 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-purple-400">QUICK FACT SHEET</h3>
            
            <div className="space-y-4 text-xs font-mono uppercase">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">Primary Location</span>
                <span className="text-white font-bold">Atlanta / Global</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">Genres</span>
                <span className="text-white font-bold">Dark Trap, UK Drill, R&B</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">Store Catalog</span>
                <span className="text-white font-bold">{beats.length} Instrumentals</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">Licensing</span>
                <span className="text-emerald-400 font-bold">100% Direct Untagged</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Press Contact</span>
                <span className="text-purple-300 font-bold">kraezelv@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* LOGOS & ASSETS */}
        <div className="space-y-8 border-b border-white/10 pb-12">
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase text-white tracking-tight">BRAND ASSETS & LOGOS</h2>
            <p className="text-xs text-white/50 font-mono uppercase tracking-widest">Download official high-resolution KRAEZELV logo vector assets and profile artwork.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-8 bg-neutral-950 border border-white/10 space-y-4 text-center">
              <div className="w-20 h-20 bg-purple-600/20 border border-purple-500/40 mx-auto flex items-center justify-center font-black text-2xl text-purple-300 font-mono">
                KZ
              </div>
              <h3 className="text-sm font-black uppercase text-white">Monogram Logo (PNG/SVG)</h3>
              <a 
                href="/favicon.ico" 
                download="KRAEZELV_Monogram.ico"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-neutral-200 transition-all cursor-pointer"
              >
                <Download size={12} /> Download Asset
              </a>
            </div>

            <div className="p-8 bg-neutral-950 border border-white/10 space-y-4 text-center">
              <div className="w-20 h-20 bg-white/5 border border-white/10 mx-auto flex items-center justify-center font-black text-xl text-white tracking-widest">
                KRAEZELV
              </div>
              <h3 className="text-sm font-black uppercase text-white">Full Brand Wordmark</h3>
              <a 
                href="/favicon.ico" 
                download="KRAEZELV_Wordmark.ico"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-neutral-200 transition-all cursor-pointer"
              >
                <Download size={12} /> Download Asset
              </a>
            </div>
          </div>
        </div>

        {/* PRODUCER INQUIRY FOOTER */}
        <div className="p-10 bg-purple-600/10 border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black uppercase text-white tracking-tight">MEDIA & INTERVIEW INQUIRIES</h3>
            <p className="text-xs text-white/60 font-mono uppercase tracking-widest">For press coverage, podcast appearances, and feature inquiries.</p>
          </div>
          <a 
            href="mailto:kraezelv@gmail.com?subject=KRAEZELV%20Press%20Inquiry" 
            className="px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-[0.2em] hover:bg-neutral-200 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Mail size={14} /> Contact Press Office
          </a>
        </div>

      </div>
    </div>
  );
};
