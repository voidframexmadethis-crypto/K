import React from 'react';
import { Lock, Sparkles, Play, Pause, ShoppingBag } from 'lucide-react';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { useAudioStore } from '../../store/useAudioStore';
import { useCartStore } from '../../store/useCartStore';

export const KraezelvVault: React.FC = () => {
  const { beats } = useBeatCatalogStore();
  const { setBeat, currentBeat, isPlaying, togglePlay } = useAudioStore();
  const { addToCart } = useCartStore();

  // Vault beats: explicitly marked as isVault or featured/first 4 beats
  const vaultBeats = beats.filter(b => b.isVault).length > 0
    ? beats.filter(b => b.isVault)
    : beats.slice(0, 4);

  if (vaultBeats.length === 0) return null;

  return (
    <section className="bg-black py-20 border-b border-white/10 relative overflow-hidden">
      
      {/* GLOWING AMBIENT VAULT ACCENT */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10 space-y-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-400 flex items-center gap-2">
              <Lock size={12} /> EXCLUSIVE MASTER ARCHIVE
            </span>
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter">
              THE KRAEZELV VAULT
            </h2>
          </div>
          <p className="text-xs text-white/50 font-mono uppercase tracking-widest max-w-md">
            Hand-selected, high-value production reserves. Exclusive sonic arrangements preserved for premium artist releases.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {vaultBeats.map((beat) => (
            <div 
              key={beat.id}
              className="bg-neutral-950 border border-purple-500/30 p-6 backdrop-blur-2xl space-y-6 relative group hover:border-purple-400 transition-all shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-purple-600/20 border border-purple-500/40 text-purple-300 text-[8px] font-black uppercase tracking-widest">
                    VAULT SELECTION
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    ${beat.licenses?.basic?.price || 29.99}
                  </span>
                </div>

                <div className="relative aspect-square w-full bg-neutral-900 border border-white/10 overflow-hidden">
                  <img src={beat.artworkUrl} alt={beat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <button
                      onClick={() => {
                        if (currentBeat?.id === beat.id) togglePlay();
                        else setBeat(beat);
                      }}
                      className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
                    >
                      {currentBeat?.id === beat.id && isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-purple-300 transition-colors">
                    {beat.title}
                  </h3>
                  <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
                    {beat.bpm} BPM · {beat.key} · {beat.genre}
                  </p>
                </div>
              </div>

              <button
                onClick={() => addToCart(beat, 'basic', beat.licenses?.basic?.price || 29.99)}
                className="w-full py-3.5 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <ShoppingBag size={12} /> ADD TO CART
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
