import React from 'react';
import { History, Play, Clock, Sparkles } from 'lucide-react';
import { useUserPreferencesStore } from '../../store/useUserPreferencesStore';
import { useAudioStore } from '../../store/useAudioStore';

export const LastPlayedSection: React.FC = () => {
  const { recentBeats } = useUserPreferencesStore();
  const { setBeat, currentBeat, isPlaying, togglePlay } = useAudioStore();

  if (!recentBeats || recentBeats.length === 0) return null;

  return (
    <section className="bg-neutral-950 py-16 border-b border-white/10 relative">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 space-y-8">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-400 flex items-center gap-2">
              <History size={12} /> SESSION RECOVERY
            </span>
            <h2 className="text-3xl font-black uppercase text-white tracking-tighter">
              WELCOME BACK — CONTINUE LISTENING
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {recentBeats.slice(0, 6).map((beat) => (
            <div 
              key={beat.id}
              onClick={() => {
                if (currentBeat?.id === beat.id) {
                  togglePlay();
                } else {
                  setBeat(beat);
                }
              }}
              className="p-4 bg-white/[0.02] border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer group space-y-3"
            >
              <div className="relative aspect-square w-full bg-neutral-900 overflow-hidden border border-white/5">
                <img src={beat.artworkUrl} alt={beat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-xl">
                    <Play size={16} className="ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="space-y-1 min-w-0">
                <h4 className="text-xs font-black uppercase text-white truncate group-hover:text-purple-300 transition-colors">
                  {beat.title}
                </h4>
                <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest truncate">
                  {beat.bpm} BPM · {beat.key}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
