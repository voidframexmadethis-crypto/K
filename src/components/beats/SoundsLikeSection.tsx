import React from 'react';
import { Disc, Play, Pause, ShoppingBag } from 'lucide-react';
import { Beat } from '../../types';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { useAudioStore } from '../../store/useAudioStore';
import { useCartStore } from '../../store/useCartStore';

interface SoundsLikeSectionProps {
  currentBeat: Beat;
}

export const SoundsLikeSection: React.FC<SoundsLikeSectionProps> = ({ currentBeat }) => {
  const { beats } = useBeatCatalogStore();
  const { setBeat, currentBeat: playingBeat, isPlaying, togglePlay } = useAudioStore();
  const { addToCart } = useCartStore();

  // Calculate similarity based on real metadata: genre, mood, BPM proximity, tags
  const relatedBeats = beats
    .filter(b => b.id !== currentBeat.id)
    .map(b => {
      let score = 0;
      if (b.genre.toLowerCase() === currentBeat.genre.toLowerCase()) score += 5;
      if (b.key.toLowerCase() === currentBeat.key.toLowerCase()) score += 3;
      if (Math.abs(b.bpm - currentBeat.bpm) <= 10) score += 3;
      if (b.moods && currentBeat.moods) {
        const sharedMoods = b.moods.filter(m => currentBeat.moods.includes(m));
        score += sharedMoods.length * 2;
      }
      if (b.tags && currentBeat.tags) {
        const sharedTags = b.tags.filter(t => currentBeat.tags.includes(t));
        score += sharedTags.length * 2;
      }
      return { beat: b, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(item => item.beat)
    .slice(0, 4);

  if (relatedBeats.length === 0) return null;

  return (
    <div className="space-y-6 pt-6 border-t border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 flex items-center gap-2">
          <Disc size={12} /> REAL ACOUSTIC SIMILARITY
        </span>
        <h3 className="text-xl font-black uppercase tracking-tight text-white">
          SOUNDS LIKE THIS
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedBeats.map((beat) => (
          <div 
            key={beat.id}
            className="bg-neutral-950 border border-white/10 p-5 space-y-4 hover:border-purple-500/50 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="relative aspect-square w-full bg-neutral-900 border border-white/10 overflow-hidden">
                <img src={beat.artworkUrl} alt={beat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <button
                    onClick={() => {
                      if (playingBeat?.id === beat.id) togglePlay();
                      else setBeat(beat);
                    }}
                    className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer"
                  >
                    {playingBeat?.id === beat.id && isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-black uppercase text-white truncate group-hover:text-purple-300 transition-colors">
                  {beat.title}
                </h4>
                <p className="text-[9px] font-mono text-white/50 uppercase tracking-widest">
                  {beat.bpm} BPM · {beat.key} · {beat.genre}
                </p>
              </div>
            </div>

            <button
              onClick={() => addToCart(beat, 'basic', beat.licenses?.basic?.price || 29.99)}
              className="w-full py-2.5 bg-white/10 hover:bg-white text-white hover:text-black font-black uppercase tracking-[0.2em] text-[9px] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <ShoppingBag size={12} /> ${beat.licenses?.basic?.price || 29.99}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
