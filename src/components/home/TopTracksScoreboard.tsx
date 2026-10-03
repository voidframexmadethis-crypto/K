import React, { useState } from 'react';
import { Play, Heart, ShoppingBag, TrendingUp, Music, Sparkles } from 'lucide-react';
import { Beat } from '../../types';
import { useAudioStore } from '../../store/useAudioStore';
import { LicensingModal } from '../beats/LicensingModal';
import { cn } from '../../lib/utils';

export const TopTracksScoreboard: React.FC = () => {
  const { setBeat, currentBeat, isPlaying, togglePlay } = useAudioStore();
  const [selectedBeatForLicense, setSelectedBeatForLicense] = useState<Beat | null>(null);

  const featuredArtwork = '/src/assets/images/beat_artwork_abstract_1791053624368.jpg';

  const top10Beats: Beat[] = [
    {
      id: 'top-1', title: 'VALKYRIE', producerId: 'KRAEZELV', bpm: 144, key: 'C Minor', genre: 'Dark Trap',
      subgenre: 'Drill', artworkUrl: '/src/assets/images/hero_valkyrie_massive_1791054144327.jpg', audioUrl: '',
      isFree: false, tags: ['DRILL', 'DARK'], moods: ['AGGRESSIVE'], slug: 'valkyrie', isPrivate: false, isBootleg: false,
      instruments: [], playsCount: 248500,
      licenses: { basic: { price: 29.99, enabled: true }, premium: { price: 49.99, enabled: true }, unlimited: { price: 99.99, enabled: true }, exclusive: { price: 499.99, enabled: true } },
      createdAt: '', published: true
    },
    {
      id: 'top-2', title: 'APOLLO', producerId: 'KRAEZELV', bpm: 140, key: 'D Minor', genre: 'Trap',
      subgenre: 'Hyperpop', artworkUrl: featuredArtwork, audioUrl: '',
      isFree: false, tags: ['TRAP', 'BOUNCY'], moods: ['ENERGETIC'], slug: 'apollo', isPrivate: false, isBootleg: false,
      instruments: [], playsCount: 194200,
      licenses: { basic: { price: 29.99, enabled: true }, premium: { price: 49.99, enabled: true }, unlimited: { price: 99.99, enabled: true }, exclusive: { price: 499.99, enabled: true } },
      createdAt: '', published: true
    },
    {
      id: 'top-3', title: 'PHANTOM', producerId: 'KRAEZELV', bpm: 142, key: 'C# Minor', genre: 'Drill',
      subgenre: 'UK Drill', artworkUrl: featuredArtwork, audioUrl: '',
      isFree: false, tags: ['DRILL'], moods: ['DARK'], slug: 'phantom', isPrivate: false, isBootleg: false,
      instruments: [], playsCount: 168400,
      licenses: { basic: { price: 34.99, enabled: true }, premium: { price: 54.99, enabled: true }, unlimited: { price: 109.99, enabled: true }, exclusive: { price: 599.99, enabled: true } },
      createdAt: '', published: true
    },
    {
      id: 'top-4', title: 'NIGHTFALL', producerId: 'KRAEZELV', bpm: 128, key: 'A Minor', genre: 'Dark Trap',
      subgenre: 'Ambient', artworkUrl: featuredArtwork, audioUrl: '',
      isFree: true, tags: ['FREE', 'DARK'], moods: ['CHILL'], slug: 'nightfall', isPrivate: false, isBootleg: false,
      instruments: [], playsCount: 142800,
      licenses: { basic: { price: 29.99, enabled: true }, premium: { price: 49.99, enabled: true }, unlimited: { price: 99.99, enabled: true }, exclusive: { price: 499.99, enabled: true } },
      createdAt: '', published: true
    },
    {
      id: 'top-5', title: 'CYBERSPACE', producerId: 'KRAEZELV', bpm: 150, key: 'F Minor', genre: 'Electronic',
      subgenre: 'Synthwave', artworkUrl: featuredArtwork, audioUrl: '',
      isFree: false, tags: ['SYNTH'], moods: ['HYPNOTIC'], slug: 'cyberspace', isPrivate: false, isBootleg: false,
      instruments: [], playsCount: 121000,
      licenses: { basic: { price: 29.99, enabled: true }, premium: { price: 49.99, enabled: true }, unlimited: { price: 99.99, enabled: true }, exclusive: { price: 499.99, enabled: true } },
      createdAt: '', published: true
    },
    {
      id: 'top-6', title: 'ECLIPSE', producerId: 'KRAEZELV', bpm: 132, key: 'E Minor', genre: 'R&B',
      subgenre: 'Soul', artworkUrl: featuredArtwork, audioUrl: '',
      isFree: false, tags: ['SMOOTH'], moods: ['CHILL'], slug: 'eclipse', isPrivate: false, isBootleg: false,
      instruments: [], playsCount: 98400,
      licenses: { basic: { price: 29.99, enabled: true }, premium: { price: 49.99, enabled: true }, unlimited: { price: 99.99, enabled: true }, exclusive: { price: 499.99, enabled: true } },
      createdAt: '', published: true
    },
    {
      id: 'top-7', title: 'SOLARIS', producerId: 'KRAEZELV', bpm: 138, key: 'G Minor', genre: 'Pop',
      subgenre: 'Dance Pop', artworkUrl: featuredArtwork, audioUrl: '',
      isFree: false, tags: ['BOUNCY'], moods: ['UPLIFTING'], slug: 'solaris', isPrivate: false, isBootleg: false,
      instruments: [], playsCount: 89100,
      licenses: { basic: { price: 29.99, enabled: true }, premium: { price: 49.99, enabled: true }, unlimited: { price: 99.99, enabled: true }, exclusive: { price: 499.99, enabled: true } },
      createdAt: '', published: true
    },
    {
      id: 'top-8', title: 'HYPERION', producerId: 'KRAEZELV', bpm: 145, key: 'B Minor', genre: 'Trap',
      subgenre: 'Boom Bap', artworkUrl: featuredArtwork, audioUrl: '',
      isFree: false, tags: ['RAW'], moods: ['AGGRESSIVE'], slug: 'hyperion', isPrivate: false, isBootleg: false,
      instruments: [], playsCount: 76500,
      licenses: { basic: { price: 29.99, enabled: true }, premium: { price: 49.99, enabled: true }, unlimited: { price: 99.99, enabled: true }, exclusive: { price: 499.99, enabled: true } },
      createdAt: '', published: true
    },
    {
      id: 'top-9', title: 'CHRONOS', producerId: 'KRAEZELV', bpm: 120, key: 'D Major', genre: 'Cinematic Ambient',
      subgenre: 'Film Score', artworkUrl: featuredArtwork, audioUrl: '',
      isFree: false, tags: ['ATMOSPHERIC'], moods: ['SAD'], slug: 'chronos', isPrivate: false, isBootleg: false,
      instruments: [], playsCount: 65200,
      licenses: { basic: { price: 39.99, enabled: true }, premium: { price: 69.99, enabled: true }, unlimited: { price: 129.99, enabled: true }, exclusive: { price: 699.99, enabled: true } },
      createdAt: '', published: true
    },
    {
      id: 'top-10', title: 'VORTEX', producerId: 'KRAEZELV', bpm: 148, key: 'A# Minor', genre: 'Drill',
      subgenre: 'Cyber Drill', artworkUrl: featuredArtwork, audioUrl: '',
      isFree: false, tags: ['CYBER'], moods: ['DARK'], slug: 'vortex', isPrivate: false, isBootleg: false,
      instruments: [], playsCount: 54100,
      licenses: { basic: { price: 29.99, enabled: true }, premium: { price: 49.99, enabled: true }, unlimited: { price: 99.99, enabled: true }, exclusive: { price: 499.99, enabled: true } },
      createdAt: '', published: true
    }
  ];

  const formatPlays = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k Plays`;
    return `${num} Plays`;
  };

  return (
    <section className="bg-white/[0.01] border-y border-white/10 py-24">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <TrendingUp size={16} className="text-white" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Real-Time Scoreboard</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black uppercase text-white tracking-tighter">
              Top 10 Trending Instrumentals
            </h2>
          </div>
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            Updated Hourly Based On Streams & Leases
          </span>
        </div>

        {/* Top 10 Chart Table */}
        <div className="flex flex-col border border-white/10 bg-black/60 divide-y divide-white/5">
          {top10Beats.map((beat, idx) => {
            const rank = idx + 1;
            const isCurrent = currentBeat?.id === beat.id;

            return (
              <div 
                key={beat.id}
                className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 hover:bg-white/[0.03] transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Left Rank & Title Info */}
                <div className="flex items-center gap-6 min-w-0 flex-1">
                  <span className="text-2xl md:text-3xl font-black text-white/20 group-hover:text-white transition-colors tabular-nums w-8 text-center shrink-0">
                    {rank.toString().padStart(2, '0')}
                  </span>

                  <button 
                    onClick={() => isCurrent ? togglePlay() : setBeat(beat)}
                    className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shrink-0 hover:bg-white hover:text-black transition-all group-hover:scale-105"
                  >
                    {isCurrent && isPlaying ? (
                      <div className="flex gap-1 items-end h-4">
                        <div className="w-1 h-3 bg-current animate-pulse" />
                        <div className="w-1 h-4 bg-current animate-pulse delay-75" />
                        <div className="w-1 h-2 bg-current animate-pulse delay-150" />
                      </div>
                    ) : (
                      <Play size={16} fill="currentColor" className="ml-0.5" />
                    )}
                  </button>

                  <img src={beat.artworkUrl} alt={beat.title} className="w-14 h-14 object-cover border border-white/10 grayscale group-hover:grayscale-0 transition-all shrink-0" />

                  <div className="flex flex-col min-w-0">
                    <h3 className="text-lg md:text-2xl font-black uppercase text-white tracking-tight truncate">
                      {beat.title}
                    </h3>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      PRODUCER: {beat.producerId}
                    </span>
                  </div>
                </div>

                {/* Technical Meta Columns */}
                <div className="flex items-center gap-6 md:gap-10 shrink-0 text-left md:text-center w-full md:w-auto justify-between md:justify-end">
                  {/* BPM & Key Labels */}
                  <div className="flex flex-col items-start md:items-center">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/30">BPM / Key</span>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">{beat.bpm} BPM / {beat.key}</span>
                  </div>

                  {/* Genre Badge */}
                  <div className="flex flex-col items-start md:items-center">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Genre</span>
                    <span className="px-3 py-1 bg-white/10 border border-white/10 text-[9px] font-black text-white uppercase tracking-widest">
                      {beat.subgenre || beat.genre}
                    </span>
                  </div>

                  {/* Play Count Ticker */}
                  <div className="flex flex-col items-start md:items-center">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Streams</span>
                    <span className="text-xs font-black text-white tabular-nums">{formatPlays(beat.playsCount || 100000)}</span>
                  </div>

                  {/* Quick-Buy Action Button */}
                  <button 
                    onClick={() => setSelectedBeatForLicense(beat)}
                    className="px-6 py-3 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] hover:bg-neutral-200 transition-all shadow-lg shrink-0 flex items-center gap-2"
                  >
                    <ShoppingBag size={12} /> +${beat.licenses.basic.price.toFixed(2)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide-Out Tiered Licensing Modal */}
      <LicensingModal 
        beat={selectedBeatForLicense}
        isOpen={!!selectedBeatForLicense}
        onClose={() => setSelectedBeatForLicense(null)}
      />
    </section>
  );
};
