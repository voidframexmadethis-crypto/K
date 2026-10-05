import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, ExternalLink, Play, ShoppingCart, Download } from 'lucide-react';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { logAnalyticsEvent } from '../../services/analyticsService';
import { motion, AnimatePresence } from 'motion/react';

export const AdOverlay = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { beats } = useBeatCatalogStore();
  const [isOpen, setIsOpen] = useState(false);

  const adVideo = searchParams.get('ad_video');
  const beatId = searchParams.get('beat');
  const isFreeAd = searchParams.get('download') === 'free';

  const beat = beats.find(b => b.id === beatId);

  useEffect(() => {
    if (adVideo) {
      setIsOpen(true);
    }
  }, [adVideo]);

  const handleClose = () => {
    setIsOpen(false);
    // Remove ad params from URL without refreshing
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('ad_video');
    setSearchParams(newParams);
  };

  const handleCtaClick = () => {
    if (beat) {
      logAnalyticsEvent({
        eventType: 'ad_click',
        beatId: beat.id,
        beatTitle: beat.title,
      });
    }
    handleClose();
    
    // If it's a free ad, ensure the page shows the free download modal (this is handled by useBeatDeepLink usually)
  };

  if (!adVideo || !isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
      >
        <div className="relative w-full max-w-4xl bg-neutral-900 border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Video Section */}
          <div className="flex-1 bg-black flex items-center justify-center relative aspect-video md:aspect-auto">
            <video 
              src={adVideo} 
              className="w-full h-full object-contain"
              autoPlay 
              controls 
              loop
              playsInline
            />
          </div>

          {/* Info Section */}
          <div className="w-full md:w-80 p-8 flex flex-col justify-between gap-8 bg-neutral-900">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">Featured Advertisement</span>
                {beat && (
                  <div className="flex gap-4 items-center">
                    <img src={beat.artworkUrl} alt={beat.title} className="w-16 h-16 object-cover border border-white/10" />
                    <div>
                      <h3 className="text-xl font-black uppercase text-white tracking-tighter">{beat.title}</h3>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{beat.genre} • {beat.bpm} BPM</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-xs text-white/60 leading-relaxed">
                  {beat?.description || "Check out this exclusive production from KRAEZELV. High-quality licenses and untagged masters available now."}
                </p>
              </div>
            </div>

            <button 
              onClick={handleCtaClick}
              className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-neutral-200 transition-all shadow-xl active:scale-95"
            >
              {isFreeAd ? (
                <><Download size={16} /> Get Free Download</>
              ) : (
                <><ShoppingCart size={16} /> Purchase License</>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
