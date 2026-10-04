import React from 'react';
import { Link } from 'react-router-dom';
import { HeroSpotlightCarousel } from '../components/home/HeroSpotlightCarousel';
import { DiscoveryBar } from '../components/home/DiscoveryBar';
import { SoundClickDiscoverySuite } from '../components/home/SoundClickDiscoverySuite';
import { TopTracksScoreboard } from '../components/home/TopTracksScoreboard';
import { ContentFeedModule } from '../components/home/ContentFeedModule';
import { DiscoveryCarousels } from '../components/home/DiscoveryCarousels';
import { MarketplaceMonetization } from '../components/home/MarketplaceMonetization';
import { CollectionsGrid } from '../components/home/CollectionsGrid';
import { VideoHub } from '../components/VideoHub';
import { MerchSection } from '../components/home/MerchSection';
import { ProducerFeature } from '../components/ProducerFeature';

export const HomePage = () => {
  const packArtwork = '/src/assets/images/pack_artwork_geometric_1791053633249.jpg';

  return (
    <main className="bg-black overflow-hidden">
      {/* 2. Hero Spotlight Carousel */}
      <HeroSpotlightCarousel />

      {/* 3. Discovery & Filter Bar */}
      <DiscoveryBar />

      {/* SoundClick Discovery & Music Charts Suite */}
      <SoundClickDiscoverySuite />

      {/* 4. Top Tracks Trending Scoreboard (1 to 10 Chart with Quick-Buy Licensing Modal) */}
      <TopTracksScoreboard />

      {/* 5. Infinite Content Feed Module */}
      <ContentFeedModule />

      {/* 6. Curated Discovery Carousels (Recommended, Trending Producers, Mood Clusters) */}
      <DiscoveryCarousels />

      {/* 7. Marketplace Engagement & Monetization (Bulk Deals, Services Node, Sound Kits) */}
      <MarketplaceMonetization />

      {/* 8. Curated Collections Grid */}
      <CollectionsGrid />

      {/* 9. Beat Packs Showcase */}
      <section className="bg-white/[0.02] border-y border-white/5 py-36 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/[0.02] to-transparent" />
         <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
               <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-4">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-px bg-white/20" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Bundled Assets</span>
                     </div>
                     <h2 className="text-7xl md:text-[9rem] font-black text-white uppercase tracking-tighter leading-[0.8]">
                       Beat<br />Packs
                     </h2>
                  </div>
                  <p className="text-xl text-white/40 uppercase tracking-tight leading-relaxed max-w-xl">
                    Professional-grade beat bundles including high-quality WAV stems, MIDI files, and full commercial usage rights.
                  </p>
                  <Link to="/packs" className="w-fit px-12 py-6 border border-white/20 text-white font-black uppercase tracking-[0.4em] text-xs hover:bg-white hover:text-black transition-all">
                    Browse All Packs
                  </Link>
               </div>

               <div className="relative group">
                  <div className="absolute -inset-10 bg-white/5 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
                  <div className="relative aspect-[16/9] bg-neutral-900 border border-white/5 overflow-hidden shadow-2xl">
                     <img src={packArtwork} className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 transition-all duration-1000" alt="Pack" />
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to="/packs" className="px-10 py-5 bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl">Preview Bundle</Link>
                     </div>
                  </div>
                  <div className="mt-8 flex justify-between items-end">
                     <div className="flex flex-col gap-1">
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">GENESIS BUNDLE</h3>
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">12 Premium Beats · All Stems Included</span>
                     </div>
                     <span className="text-3xl font-black text-white/60">$99.00</span>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 10. Producer Feature */}
      <ProducerFeature />

      {/* 11. Video Hub */}
      <VideoHub />

      {/* 12. Merch Department */}
      <MerchSection />

      {/* 13. Final CTA Section */}
      <section className="py-48 flex flex-col items-center text-center px-6 border-t border-white/10">
         <div className="flex flex-col gap-8 items-center max-w-5xl">
            <span className="text-[10px] font-black uppercase tracking-[1em] text-white/20">The Destination</span>
            <h2 className="text-6xl md:text-[10rem] font-black uppercase tracking-tighter text-white leading-[0.8] select-none">
              Start Your Next Project
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-6">
               <Link to="/dashboard" className="px-16 py-8 bg-white text-black font-black uppercase tracking-[0.5em] text-xs hover:bg-neutral-200 transition-all shadow-[0_0_100px_rgba(255,255,255,0.1)]">
                 Join Platform
               </Link>
               <button className="px-16 py-8 border border-white/10 text-white font-black uppercase tracking-[0.5em] text-xs hover:bg-white hover:text-black transition-all">
                 Contact Sales
               </button>
            </div>
         </div>
      </section>
    </main>
  );
};

