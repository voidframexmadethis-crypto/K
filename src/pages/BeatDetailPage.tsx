import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, ShoppingBag, Share2, Music, Check, Sparkles, ArrowLeft, Disc, FileText } from 'lucide-react';
import { useBeatCatalogStore } from '../store/useBeatCatalogStore';
import { useAudioStore } from '../store/useAudioStore';
import { useCartStore } from '../store/useCartStore';
import { BeatDNAPanel } from '../components/beats/BeatDNAPanel';
import { SoundsLikeSection } from '../components/beats/SoundsLikeSection';
import { VerifiedReviewsSection } from '../components/beats/VerifiedReviewsSection';
import { LicensingModal } from '../components/beats/LicensingModal';

export const BeatDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { beats } = useBeatCatalogStore();
  const { setBeat, currentBeat, isPlaying, togglePlay } = useAudioStore();
  const { addToCart } = useCartStore();
  
  const [selectedLicenseBeat, setSelectedLicenseBeat] = useState<any | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  const beat = beats.find(b => b.id === id || b.slug === id) || beats[0];

  if (!beat) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 text-center">
        <h2 className="text-3xl font-black uppercase">Beat Not Found</h2>
        <Link to="/beats" className="mt-4 inline-block px-6 py-3 bg-white text-black font-bold uppercase text-xs">
          Return to Beats Catalog
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-32">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 space-y-12">
        
        {/* TOP BACK LINK */}
        <Link to="/beats" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white transition-colors">
          <ArrowLeft size={14} /> Back to Catalog
        </Link>

        {/* HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-neutral-950 border border-white/10 p-8 sm:p-12">
          
          <div className="lg:col-span-5 relative aspect-square w-full bg-neutral-900 border border-white/10 overflow-hidden group shadow-2xl">
            <img src={beat.artworkUrl} alt={beat.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <button
                onClick={() => {
                  if (currentBeat?.id === beat.id) togglePlay();
                  else setBeat(beat);
                }}
                className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
              >
                {currentBeat?.id === beat.id && isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/40 text-purple-300 text-[9px] font-black uppercase tracking-[0.3em]">
                OFFICIAL KRAEZELV INSTRUMENTAL
              </span>
              <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-white">
                {beat.title}
              </h1>
              <p className="text-sm font-mono text-white/60 uppercase tracking-widest">
                PRODUCED BY KRAEZELV · {beat.bpm} BPM · KEY: {beat.key} · {beat.genre}
              </p>
            </div>

            {/* PRODUCER NOTES */}
            {beat.producerNotes && (
              <div className="p-4 bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs font-mono leading-relaxed uppercase tracking-wider">
                <span className="font-bold text-purple-400 block mb-1">PRODUCER NOTES:</span>
                "{beat.producerNotes}"
              </div>
            )}

            {/* PRICING & ACTIONS */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/10">
              <button
                onClick={() => setSelectedLicenseBeat(beat)}
                className="px-10 py-5 bg-white text-black font-black uppercase tracking-[0.25em] text-xs hover:bg-neutral-200 transition-all cursor-pointer shadow-2xl"
              >
                CHOOSE LICENSE (${beat.licenses?.basic?.price || 29.99}+)
              </button>

              <button
                onClick={handleShare}
                className="px-6 py-5 bg-white/5 border border-white/15 text-white hover:bg-white hover:text-black font-black uppercase tracking-[0.25em] text-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Share2 size={14} /> {copiedShare ? 'LINK COPIED!' : 'SHARE'}
              </button>
            </div>
          </div>

        </div>

        {/* BEAT DNA PANEL */}
        <BeatDNAPanel beat={beat} />

        {/* SOUNDS LIKE RELATED BEATS */}
        <SoundsLikeSection currentBeat={beat} />

        {/* REVIEWS */}
        <VerifiedReviewsSection beatId={beat.id} beatTitle={beat.title} />

      </div>

      {selectedLicenseBeat && (
        <LicensingModal 
          beat={selectedLicenseBeat} 
          isOpen={!!selectedLicenseBeat}
          onClose={() => setSelectedLicenseBeat(null)} 
        />
      )}
    </div>
  );
};
