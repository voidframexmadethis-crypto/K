import React from 'react';
import { Radio, Play, Pause, SkipForward, Volume2, Sparkles, ShieldCheck } from 'lucide-react';
import { useAudioStore } from '../../store/useAudioStore';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { cn } from '../../lib/utils';

export const KraezelvRadio: React.FC = () => {
  const { beats } = useBeatCatalogStore();
  const { currentBeat, isPlaying, togglePlay, setBeat, setQueue, isRadioMode, setRadioMode, next } = useAudioStore();

  const handleToggleRadio = () => {
    if (beats.length === 0) return;

    if (isRadioMode && isPlaying) {
      togglePlay();
    } else {
      setQueue(beats);
      setRadioMode(true);
      if (!currentBeat) {
        setBeat(beats[0]);
      } else if (!isPlaying) {
        togglePlay();
      }
    }
  };

  return (
    <section className="bg-black py-20 border-b border-white/10 relative overflow-hidden">
      
      {/* BACKGROUND GRAPHIC ACCENTS */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        <div className="bg-neutral-950 border border-white/15 p-8 md:p-12 backdrop-blur-2xl flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl">
          
          <div className="space-y-4 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600/20 border border-purple-500/40 text-purple-300 text-[9px] font-black uppercase tracking-[0.3em]">
              <Radio size={12} className="animate-pulse" /> CONTINUOUS STREAMING ENGINE
            </div>
            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-white">
              KRAEZELV RADIO
            </h2>
            <p className="text-xl sm:text-2xl font-light uppercase tracking-[0.3em] text-purple-400 font-mono">
              NO SEARCHING. JUST PRESS PLAY.
            </p>
            <p className="text-xs text-white/50 font-mono uppercase tracking-widest leading-relaxed">
              Experience non-stop back-to-back instrumentals from the official catalog. Zero interruptions, full untagged previews, continuous playback powered by the KRAEZELV audio DSP engine.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 shrink-0 w-full sm:w-auto">
            <button
              onClick={handleToggleRadio}
              className={cn(
                "px-10 py-6 border text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all duration-300 cursor-pointer shadow-2xl w-full sm:w-auto",
                isRadioMode && isPlaying
                  ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_40px_rgba(168,85,247,0.5)]"
                  : "bg-white text-black border-white hover:bg-neutral-200"
              )}
            >
              {isRadioMode && isPlaying ? (
                <>
                  <Pause size={18} /> PAUSE RADIO
                </>
              ) : (
                <>
                  <Play size={18} className="ml-1" /> START RADIO MODE
                </>
              )}
            </button>

            {isRadioMode && (
              <button
                onClick={next}
                className="px-6 py-6 bg-white/5 border border-white/10 hover:border-white/30 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer w-full sm:w-auto"
                title="Skip to next track"
              >
                <SkipForward size={18} /> NEXT TRACK
              </button>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
