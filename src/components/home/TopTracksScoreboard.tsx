import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, ShoppingBag, TrendingUp, Music, Upload } from 'lucide-react';
import { Beat } from '../../types';
import { useAudioStore } from '../../store/useAudioStore';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { LicensingModal } from '../beats/LicensingModal';
import { cn } from '../../lib/utils';

export const TopTracksScoreboard: React.FC = () => {
  const { setBeat, currentBeat, isPlaying, togglePlay } = useAudioStore();
  const { beats } = useBeatCatalogStore();
  const [selectedBeatForLicense, setSelectedBeatForLicense] = useState<Beat | null>(null);

  const top10Beats: Beat[] = beats.slice(0, 10);

  const formatPlays = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return (count || 0).toString();
  };

  if (top10Beats.length === 0) return null;

  return (
    <section className="bg-white/[0.01] border-y border-white/10 py-24">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <TrendingUp size={16} className="text-purple-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">Official Catalog Trends</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black uppercase text-white tracking-tight">
              TRENDING BEATS
            </h2>
          </div>
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest">
            Top Streaming & Licensed Beats
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
                className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-5 hover:bg-white/[0.03] transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center gap-5 min-w-0 flex-1">
                  <span className="text-xl md:text-2xl font-black text-white/20 group-hover:text-purple-400 transition-colors tabular-nums w-8 text-center shrink-0">
                    {rank.toString().padStart(2, '0')}
                  </span>

                  <button 
                    onClick={() => isCurrent ? togglePlay() : setBeat(beat)}
                    className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shrink-0 hover:bg-white hover:text-black transition-all group-hover:scale-105"
                  >
                    {isCurrent && isPlaying ? (
                      <Pause size={16} fill="currentColor" />
                    ) : (
                      <Play size={16} fill="currentColor" className="ml-0.5" />
                    )}
                  </button>

                  <img src={beat.artworkUrl || ''} alt={beat.title} className="w-14 h-14 object-cover border border-white/10 grayscale group-hover:grayscale-0 transition-all shrink-0" />

                  <div className="flex flex-col min-w-0">
                    <h3 className="text-lg md:text-xl font-black uppercase text-white tracking-tight truncate">
                      {beat.title}
                    </h3>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      PRODUCER: KRAEZELV
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 md:gap-10 shrink-0 text-left md:text-center w-full md:w-auto justify-between md:justify-end">
                  <div className="flex flex-col items-start md:items-center">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/30">BPM / Key</span>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">{beat.bpm} BPM · {beat.key}</span>
                  </div>

                  <div className="flex flex-col items-start md:items-center">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Genre</span>
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                      {beat.subgenre || beat.genre}
                    </span>
                  </div>

                  <div className="flex flex-col items-start md:items-center">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Plays</span>
                    <span className="text-xs font-black text-white tabular-nums">{formatPlays(beat.playsCount || 0)}</span>
                  </div>

                  <button 
                    onClick={() => setSelectedBeatForLicense(beat)}
                    className="px-6 py-3 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] hover:bg-neutral-200 transition-all shadow-lg shrink-0 flex items-center gap-2"
                  >
                    <ShoppingBag size={12} /> ${beat.licenses.basic.price.toFixed(2)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedBeatForLicense && (
        <LicensingModal beat={selectedBeatForLicense} isOpen={!!selectedBeatForLicense} onClose={() => setSelectedBeatForLicense(null)} />
      )}
    </section>
  );
};
