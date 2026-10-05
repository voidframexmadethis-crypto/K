import React, { useState } from 'react';
import { Tag, Copy, Check, Sliders, Palette, Mic, Disc, Download, ShoppingBag, Sparkles, Volume2, Play, Upload } from 'lucide-react';
import { ServiceItem, SoundKit } from '../../types';
import { ServicesModal } from './ServicesModal';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { useBeatPackStore } from '../../store/useBeatPackStore';

export const MarketplaceMonetization: React.FC = () => {
  const { packs } = useBeatPackStore();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const services: ServiceItem[] = [
    {
      id: 'srv-1',
      title: 'Full Track Mixing & Mastering',
      category: 'Mixing & Mastering',
      description: 'Analog-modeled stem mixing, vocal tuning, drum punch enhancement, and LUFS loudness mastering ready for Spotify/Apple Music.',
      price: 149.00,
      turnaroundDays: 3,
      rating: 4.9,
      reviewsCount: 124
    },
    {
      id: 'srv-2',
      title: '3D Album Cover & Artwork',
      category: 'Custom Artwork',
      description: 'High-resolution digital cover design, 3D typography, and animated motion graphics for Instagram/TikTok promo stories.',
      price: 75.00,
      turnaroundDays: 2,
      rating: 5.0,
      reviewsCount: 88
    },
    {
      id: 'srv-3',
      title: 'Studio Feature Verse & Chorus Vocals',
      category: 'Feature Verse',
      description: 'Recorded in a professional studio booth on Neumann U87 microphone. Includes dry stems & processed vocal tracks.',
      price: 300.00,
      turnaroundDays: 5,
      rating: 4.8,
      reviewsCount: 42
    },
    {
      id: 'srv-4',
      title: 'Custom Beat Production (1-on-1)',
      category: 'Custom Production',
      description: 'Direct production collaboration based on your reference tracks. Includes exclusive rights, session stems, and unlimited revisions.',
      price: 450.00,
      turnaroundDays: 4,
      rating: 5.0,
      reviewsCount: 65
    }
  ];

  // Empty array by default for KRAEZELV
  const soundKits: SoundKit[] = [];

  return (
    <section className="max-w-[1800px] mx-auto px-6 md:px-12 py-24 space-y-24 border-t border-white/10">
      {/* 1. "Buy X, Get Y Free" Bulk Deal Banners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-10 bg-white/5 border border-white/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative overflow-hidden group">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-white text-black text-[8px] font-black uppercase tracking-[0.3em]">
              Automatic Checkout Promo
            </span>
            <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">
              BUY 2 BEATS, GET 1 FREE
            </h3>
            <p className="text-xs text-white/60 uppercase tracking-wider font-medium">
              Applies automatically to any Basic or Premium WAV lease tier.
            </p>
          </div>

          <button 
            onClick={() => copyCode('AUTO-B2G1')}
            className="px-8 py-4 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] hover:bg-neutral-200 transition-all shrink-0 flex items-center gap-2"
          >
            {copiedCode === 'AUTO-B2G1' ? <><Check size={14} /> Applied!</> : <><Copy size={14} /> Claim Bulk Deal</>}
          </button>
        </div>

        <div className="p-10 bg-white/5 border border-white/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative overflow-hidden group">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-white text-black text-[8px] font-black uppercase tracking-[0.3em]">
              Promo Code: STACK5
            </span>
            <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">
              BUY 3 BEATS, GET 2 FREE
            </h3>
            <p className="text-xs text-white/60 uppercase tracking-wider font-medium">
              Stack your basket with 5 instrumentals and pay for only 3 at checkout.
            </p>
          </div>

          <button 
            onClick={() => copyCode('STACK5')}
            className="px-8 py-4 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] hover:bg-neutral-200 transition-all shrink-0 flex items-center gap-2"
          >
            {copiedCode === 'STACK5' ? <><Check size={14} /> Code Copied!</> : <><Copy size={14} /> Copy Promo Code</>}
          </button>
        </div>
      </div>

      {/* 2. Services Marketplace Node */}
      <div className="space-y-8 border-t border-white/10 pt-16">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Studio Add-Ons</span>
          <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tighter">
            Services Marketplace
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map(service => (
            <div 
              key={service.id}
              className="p-8 bg-white/[0.02] border border-white/10 flex flex-col justify-between gap-6 hover:border-white/30 transition-all group"
            >
              <div className="space-y-4">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">{service.category}</span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{service.title}</h3>
                <p className="text-xs text-white/60 font-medium leading-relaxed uppercase">{service.description}</p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-black uppercase text-white/30 block">Starting From</span>
                  <span className="text-xl font-black text-white">${service.price.toFixed(2)}</span>
                </div>

                <button 
                  onClick={() => setSelectedService(service)}
                  className="px-6 py-3 bg-white text-black font-black uppercase text-[9px] tracking-[0.2em] hover:bg-neutral-200 transition-all"
                >
                  Book Service
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Active Sound Kits & Sample Packs Shelf */}
      <div className="space-y-8 border-t border-white/10 pt-16">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Producer Tools</span>
          <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tighter">
            Sound Kits & Sample Packs
          </h2>
        </div>

        {packs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packs.map(pack => {
              const downloadUrl = pack.storage?.durableUrl || pack.zipUrl || pack.downloadUrl;
              return (
                <div key={pack.id} className="p-8 bg-white/[0.02] border border-white/10 flex flex-col justify-between gap-6 group hover:border-white/30 transition-all">
                  <div className="space-y-4">
                    <div className="relative aspect-video overflow-hidden bg-neutral-900 border border-white/5">
                      <img src={pack.artworkUrl} alt={pack.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      <div className="absolute top-4 left-4 px-3 py-1 bg-black/80 border border-white/10 text-[8px] font-black uppercase text-white tracking-widest">
                        BEAT PACK
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black uppercase text-white tracking-tight">{pack.title}</h3>
                    </div>

                    <p className="text-xs text-white/60 uppercase font-medium leading-relaxed line-clamp-2">{pack.description}</p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase text-emerald-400">Internet Archive Pack File</span>
                      <span className="text-2xl font-black text-white">${pack.price.toFixed(2)}</span>
                    </div>

                    {downloadUrl ? (
                      <a 
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-white text-black hover:bg-purple-600 hover:text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center gap-2 rounded-xs shadow-lg"
                      >
                        Open Pack
                      </a>
                    ) : (
                      <button disabled className="px-6 py-3 bg-white/10 text-white/40 font-black uppercase text-[10px] tracking-[0.2em] rounded-xs cursor-not-allowed">
                        Unavailable
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 bg-neutral-950 border border-white/10 text-center flex flex-col items-center justify-center gap-4">
            <Disc size={32} className="text-white/20" />
            <div className="space-y-1">
              <h3 className="text-xl font-black uppercase text-white tracking-tight">NO SOUND KITS OR SAMPLE PACKS CREATED YET</h3>
              <p className="text-white/40 uppercase tracking-widest text-[10px]">
                Preset banks, drum kits, and MIDI packs will appear here once published.
              </p>
            </div>
            <Link to="/dashboard/upload-pack" className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-200 transition-colors">
              <Upload size={14} /> Create Beat Pack
            </Link>
          </div>
        )}
      </div>

      {/* Services Modal */}
      <ServicesModal 
        service={selectedService}
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
      />
    </section>
  );
};
