import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { KraezelvCinemaHero } from '../components/home/KraezelvCinemaHero';
import { SoundDNASection } from '../components/home/SoundDNASection';
import { WhatAreYouMaking } from '../components/home/WhatAreYouMaking';
import { BeatDiscoveryRooms } from '../components/home/BeatDiscoveryRooms';
import { StoreSafetyCenter } from '../components/home/StoreSafetyCenter';
import { KraezelvVault } from '../components/home/KraezelvVault';
import { KraezelvRadio } from '../components/home/KraezelvRadio';
import { LastPlayedSection } from '../components/home/LastPlayedSection';
import { UserPlaylistBuilder } from '../components/home/UserPlaylistBuilder';
import { BeatBattleModule } from '../components/home/BeatBattleModule';
import { ArtistStarterGuide } from '../components/home/ArtistStarterGuide';
import { WorkWithKraezelv } from '../components/home/WorkWithKraezelv';
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
import { useBeatPackStore } from '../store/useBeatPackStore';
import { AdOverlay } from '../components/home/AdOverlay';
import { FreeDownloadModal } from '../components/beats/FreeDownloadModal';
import { PromotionalBanner } from '../components/home/PromotionalBanner';
import { TypeBeatSchema } from '../components/seo/TypeBeatSchema';

export const HomePage = () => {
  const { beats } = useBeatCatalogStore();
  const [deepLinkBeat, setDeepLinkBeat] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      setDeepLinkBeat(e.detail.beat);
    };
    window.addEventListener('open-free-download-modal', handler);
    return () => window.removeEventListener('open-free-download-modal', handler);
  }, []);

  const freeBeats = beats.filter(b => b.isFree);

  // When there are zero real published beats, the storefront content area must be completely empty.
  if (beats.length === 0) {
    return (
      <main className="bg-black min-h-[40vh]">
        {/* Clean, empty content area between navigation and footer */}
      </main>
    );
  }

  const { packs } = useBeatPackStore();

  return (
    <main className="bg-black overflow-hidden">
      <TypeBeatSchema beats={beats} />
      
      {/* 1. CINEMATIC HERO */}
      <KraezelvCinemaHero />

      {/* 2. KRAEZELV SOUND DNA */}
      <SoundDNASection />

      {/* 3. FIND YOUR BEAT (WHAT ARE YOU MAKING?) */}
      <WhatAreYouMaking />

      {/* 4. BEAT DISCOVERY ROOMS */}
      <BeatDiscoveryRooms />

      {/* 5. THE KRAEZELV VAULT */}
      <KraezelvVault />

      {/* 5. POPULAR / TRENDING BEATS */}
      <TopTracksScoreboard />

      {/* 6. KRAEZELV RADIO */}
      <KraezelvRadio />

      {/* 7. LAST PLAYED RECOVERY */}
      <LastPlayedSection />

      {/* 8. PLAYLIST BUILDER (MY NEXT PROJECT) */}
      <UserPlaylistBuilder />

      {/* 9. BEAT BATTLEGROUND */}
      <BeatBattleModule />

      {/* 10. CURATED COLLECTIONS */}
      <CollectionsGrid />

      {/* 11. MAIN DISCOVERY SUITE */}
      <SoundClickDiscoverySuite />

      {/* 12. ARTIST STARTER GUIDE */}
      <ArtistStarterGuide />

      {/* 13. STORE SAFETY CENTER */}
      <StoreSafetyCenter />

      {/* 13. BEAT PACKS SHOWCASE */}
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

            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {packs.map((pack) => {
                const downloadUrl = pack.storage?.durableUrl || pack.zipUrl || pack.downloadUrl;
                return (
                  <div key={pack.id} className="p-8 bg-black/60 border border-white/10 flex flex-col md:flex-row items-center gap-6 group hover:border-purple-500/40 transition-all">
                    <img src={pack.artworkUrl} alt={pack.title} className="w-24 h-24 object-cover bg-neutral-900 border border-white/10 shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2 text-center md:text-left">
                      <h3 className="text-xl font-black uppercase text-white tracking-tight truncate">{pack.title}</h3>
                      <p className="text-xs text-white/50 line-clamp-2">{pack.description}</p>
                      <div className="text-[10px] font-mono text-emerald-400 font-bold">${pack.price} · Internet Archive Pack File</div>
                    </div>
                    {downloadUrl ? (
                      <a 
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-white hover:bg-purple-600 text-black hover:text-white font-black uppercase tracking-widest text-[9px] transition-colors shrink-0 flex items-center gap-2 rounded-xs shadow-lg"
                      >
                        Open Pack
                      </a>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 14. WORK WITH KRAEZELV */}
      <WorkWithKraezelv />

      {/* 15. PRODUCER PROFILE FEATURE */}
      <ProducerFeature />

      <AdOverlay />
      <FreeDownloadModal 
        beat={deepLinkBeat}
        isOpen={!!deepLinkBeat}
        onClose={() => setDeepLinkBeat(null)}
      />

      {/* 16. FOOTER CTA */}
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
            <Link to="/press-kit" className="px-10 py-5 border border-white/20 text-white font-black uppercase tracking-[0.3em] text-xs hover:bg-white/10 transition-all">
              PRESS KIT
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};
