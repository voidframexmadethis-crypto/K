import React from 'react';
import { X, Play, Pause, ShoppingBag, Sliders, Check } from 'lucide-react';
import { Beat } from '../../types';
import { useAudioStore } from '../../store/useAudioStore';
import { useCartStore } from '../../store/useCartStore';

interface BeatComparisonModalProps {
  beatsToCompare: Beat[];
  onClose: () => void;
}

export const BeatComparisonModal: React.FC<BeatComparisonModalProps> = ({ beatsToCompare, onClose }) => {
  const { setBeat, currentBeat, isPlaying, togglePlay } = useAudioStore();
  const { addToCart } = useCartStore();

  if (!beatsToCompare || beatsToCompare.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[200] flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-black border border-white/20 max-w-6xl w-full p-8 space-y-8 relative shadow-2xl my-auto">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-400">BEAT COMPARISON MATRIX</span>
            <h2 className="text-3xl font-black uppercase text-white tracking-tight">COMPARE INSTRUMENTALS</h2>
          </div>

          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors cursor-pointer">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40">
                <th className="p-4 w-40">Attribute</th>
                {beatsToCompare.map(b => (
                  <th key={b.id} className="p-4 min-w-[200px]">
                    <div className="space-y-3">
                      <img src={b.artworkUrl} alt={b.title} className="w-16 h-16 object-cover border border-white/10" />
                      <div>
                        <h4 className="text-sm font-black text-white uppercase">{b.title}</h4>
                        <span className="text-[9px] font-mono text-purple-400 font-bold">${b.licenses?.basic?.price || 29.99}</span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-xs font-mono uppercase">
              <tr>
                <td className="p-4 font-bold text-white/50">TEMPO (BPM)</td>
                {beatsToCompare.map(b => (
                  <td key={b.id} className="p-4 text-white font-bold">{b.bpm} BPM</td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-white/50">MUSICAL KEY</td>
                {beatsToCompare.map(b => (
                  <td key={b.id} className="p-4 text-white font-bold">{b.key}</td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-white/50">GENRE</td>
                {beatsToCompare.map(b => (
                  <td key={b.id} className="p-4 text-purple-300 font-bold">{b.genre}</td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-white/50">MOOD & VIBE</td>
                {beatsToCompare.map(b => (
                  <td key={b.id} className="p-4 text-white/80">
                    {b.moods && b.moods.length > 0 ? b.moods.join(', ') : 'N/A'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-white/50">STYLE TAGS</td>
                {beatsToCompare.map(b => (
                  <td key={b.id} className="p-4 text-white/80">
                    {b.tags && b.tags.length > 0 ? b.tags.map(t => `#${t}`).join(' ') : 'N/A'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-white/50">ACTIONS</td>
                {beatsToCompare.map(b => (
                  <td key={b.id} className="p-4">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          if (currentBeat?.id === b.id) togglePlay();
                          else setBeat(b);
                        }}
                        className="py-2.5 px-4 bg-white/10 hover:bg-white text-white hover:text-black font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        {currentBeat?.id === b.id && isPlaying ? <Pause size={12} /> : <Play size={12} />}
                        {currentBeat?.id === b.id && isPlaying ? 'Pause' : 'Play Preview'}
                      </button>

                      <button
                        onClick={() => addToCart(b, 'basic', b.licenses?.basic?.price || 29.99)}
                        className="py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <ShoppingBag size={12} /> Add To Cart
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
