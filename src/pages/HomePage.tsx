import React from 'react';
import { Link } from 'react-router-dom';
import { HeroSpotlightCarousel } from '../components/home/HeroSpotlightCarousel';
import { DiscoveryBar } from '../components/home/DiscoveryBar';
import { TopTracksScoreboard } from '../components/home/TopTracksScoreboard';
import { CollectionsGrid } from '../components/home/CollectionsGrid';
import { SoundClickDiscoverySuite } from '../components/home/SoundClickDiscoverySuite';
import { DiscoveryCarousels } from '../components/home/DiscoveryCarousels';
import { MarketplaceMonetization } from '../components/home/MarketplaceMonetization';
import { VideoHub } from '../components/VideoHub';
import { MerchSection } from '../components/home/MerchSection';
import { ProducerFeature } from '../components/ProducerFeature';
import { Music, ArrowRight, Download, Sparkles, Layers, Upload } from 'lucide-react';
import { useBeatCatalogStore } from '../store/useBeatCatalogStore';
import { AdOverlay } from '../components/home/AdOverlay';

export const HomePage = () => {
  const { beats } = useBeatCatalogStore();
  const freeBeats = beats.filter(b => b.isFree);

  // When there are zero real published beats, the storefront content area must be completely empty.
  if (beats.length === 0) {
    return (
      <main className="bg-black min-h-[40vh]">
        {/* Clean, empty content area between navigation and footer */}
      </main>
    );
  }

  // Empty packs by default for clean store
  const packs: any[] = [];

  return (
    <main className="bg-black overflow-hidden">
      {/* 1. FEATURED BEAT HERO VIEWPORT */}
      <HeroSpotlightCarousel />

      {/* 2. LATEST BEATS CATALOG & FILTERS */}
      <DiscoveryBar />

      {/* 3. POPULAR / TRENDING BEATS */}
      <TopTracksScoreboard />

      {/* 4. CURATED COLLECTIONS */}
      <CollectionsGrid />

      {/* 5. BEAT PACKS SHOWCASE */}
      {packs.length > 0 && (
        <section className="bg-neutral-950/80 border-y border-white/10 py-24 relative overflow-hidden">
          <div className="max-w-[1700px] mx-auto px-6 md:px-12 relative z-10">
            <div className="flex flex-col gap-6 mb-12">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400 bg-purple-950/40 border border-purple-500/30 px-3 py-1 w-fit">
                BUNDLED SOUND KITS
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight">
                BEAT PACKS & STEMS
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Render packs when available */}
            </div>
          </div>
        </section>
      )}

      {/* 6. FREE BEATS SECTION */}
      {freeBeats.length > 0 && (
        <section className="bg-black border-b border-white/10 py-20">
          <div className="max-w-[1700px] mx-auto px-6 md:px-12 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">NON-COMMERCIAL AUDITIONS</span>
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">FREE BEATS DOWNLOADS</h2>
              </div>
              <Link to="/free-beats" className="text-xs font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                VIEW ALL FREE DOWNLOADS →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {freeBeats.map((beat) => (
                <div key={beat.id} className="p-6 bg-neutral-950 border border-white/10 flex items-center justify-between gap-4 group hover:border-purple-500/40 transition-all">
                  <div className="flex items-center gap-4">
                    <img src={beat.artworkUrl || ''} alt={beat.title} className="w-14 h-14 object-cover border border-white/10 grayscale group-hover:grayscale-0 transition-all" />
                    <div className="flex flex-col">
                      <h4 className="text-lg font-black text-white uppercase tracking-tight">{beat.title}</h4>
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{beat.bpm} BPM · {beat.key} · {beat.genre}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => alert(`Downloading free tagged MP3 for ${beat.title}!`)}
                    className="p-3 bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black transition-all shrink-0"
                    title="Free Download"
                  >
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. AUDIO PLAYER & DISCOVERY SUITE */}
      <SoundClickDiscoverySuite />

      {/* 8. RECOMMENDED CAROUSELS & CURATED MOOD CLUSTERS */}
      <DiscoveryCarousels />

      {/* 9. MARKETPLACE SERVICES & BULK DEALS */}
      <MarketplaceMonetization />

      {/* 10. MERCH DEPARTMENT */}
      <MerchSection />

      {/* 11. VIDEO HUB */}
      <VideoHub />

      {/* 12. PRODUCER PROFILE & BIO */}
      <ProducerFeature />
      <AdOverlay />

      {/* 13. FOOTER CTA */}
      <section className="py-32 flex flex-col items-center text-center px-6 border-t border-white/10 bg-neutral-950">
        <div className="flex flex-col gap-6 items-center max-w-4xl">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-purple-400">THE OFFICIAL CATALOG</span>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white leading-[0.9]">
            START YOUR NEXT PROJECT
          </h2>
          <p className="text-base text-white/50 max-w-xl">
            Browse high-quality 24-bit WAV masters, untagged stems, and instant commercial licensing agreements.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link to="/beats" className="px-10 py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-xs hover:bg-neutral-200 transition-all">
              BROWSE CATALOG
            </Link>
            <Link to="/dashboard" className="px-10 py-5 border border-white/20 text-white font-black uppercase tracking-[0.3em] text-xs hover:bg-white/10 transition-all">
              PRODUCER DASHBOARD
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};
