import React from 'react';
import { X, Calendar, Activity, Info, Star, Music, Award, Shield, FileText } from 'lucide-react';
import { Beat } from '../../types';
import { cn } from '../../lib/utils';

interface QuickInfoModalProps {
  beat: Beat;
  isOpen: boolean;
  onClose: () => void;
  onPlayClick?: () => void;
  isPlaying?: boolean;
}

export const QuickInfoModal: React.FC<QuickInfoModalProps> = ({
  beat,
  isOpen,
  onClose,
  onPlayClick,
  isPlaying = false,
}) => {
  if (!isOpen) return null;

  const releaseDateFormatted = beat.releaseDate 
    ? new Date(beat.releaseDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date(beat.createdAt || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-white/10 p-8 md:p-10 shadow-[0_0_80px_rgba(168,85,247,0.15)] z-10 overflow-y-auto max-h-[90vh] no-scrollbar">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Header Block */}
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 pb-8 border-b border-white/5">
          <div className="relative w-32 h-32 md:w-36 md:h-36 bg-neutral-900 border border-white/5 overflow-hidden shadow-lg shrink-0">
            <img 
              src={beat.artworkUrl} 
              alt={beat.title}
              className="w-full h-full object-cover grayscale"
            />
            {onPlayClick && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
                <button 
                  onClick={onPlayClick}
                  className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform"
                >
                  {isPlaying ? (
                    <div className="flex gap-0.5 items-end h-4">
                      <div className="w-1 bg-black h-3 animate-pulse" />
                      <div className="w-1 bg-black h-4 animate-pulse delay-75" />
                      <div className="w-1 bg-black h-2 animate-pulse delay-150" />
                    </div>
                  ) : (
                    <span className="text-xs font-black uppercase tracking-wider pl-0.5">PLAY</span>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="text-center md:text-left min-w-0 space-y-3">
            <div className="flex flex-wrap justify-center md:justify-start gap-2 items-center text-[10px] font-black uppercase tracking-widest text-purple-400">
              <span className="flex items-center gap-1"><Award size={12} /> KRAEZELV MASTER PIECE</span>
              <span>·</span>
              <span>{beat.genre}</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-none truncate">
              {beat.title}
            </h3>
            <p className="text-xs text-white/50 leading-relaxed font-medium">
              {beat.description || "A pristine premium-grade digital composition tailored for high-headroom vocal tracking and industry distribution."}
            </p>
          </div>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-b border-white/5">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block">BPM</span>
            <span className="text-lg font-black text-white tabular-nums">{beat.bpm} BPM</span>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block">Musical Key</span>
            <span className="text-lg font-black text-white">{beat.key || "N/A"}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block">Release Date</span>
            <span className="text-xs font-black text-white/80">{releaseDateFormatted}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block">Format</span>
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">24-bit WAV / stems</span>
          </div>
        </div>

        {/* Advanced Characteristics */}
        <div className="py-8 space-y-6">
          <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
            <Activity size={14} className="text-purple-400" /> PRODUCTION CHARACTERISTICS
          </h4>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Tags / Keywords */}
            <div className="space-y-3">
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block">Style & Vibes Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {beat.tags && beat.tags.length > 0 ? (
                  beat.tags.map((t, i) => (
                    <span key={i} className="text-[9px] font-bold text-white/70 bg-white/5 border border-white/5 px-2.5 py-1 uppercase tracking-widest">
                      #{t}
                    </span>
                  ))
                ) : (
                  <span className="text-[9px] text-white/30 uppercase tracking-widest">No tags specified</span>
                )}
              </div>
            </div>

            {/* Instrument list */}
            <div className="space-y-3">
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block">Instrumentation</span>
              <div className="flex flex-wrap gap-1.5">
                {beat.instruments && beat.instruments.length > 0 ? (
                  beat.instruments.map((ins, i) => (
                    <span key={i} className="text-[9px] font-bold text-purple-300/80 bg-purple-500/5 border border-purple-500/10 px-2.5 py-1 uppercase tracking-widest">
                      {ins}
                    </span>
                  ))
                ) : (
                  ['808 Sub-bass', 'Saturated Snares', 'Sleek Hi-hats', 'Ambient Synths', 'Melodic Keys'].map((ins, i) => (
                    <span key={i} className="text-[9px] font-bold text-white/40 bg-white/5 border border-white/5 px-2.5 py-1 uppercase tracking-widest">
                      {ins}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* License Permissions overview */}
        <div className="p-6 bg-white/[0.02] border border-white/5 space-y-4">
          <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
            <Shield size={12} /> SECURE COMMERCIAL RIGHTS INCLUDED
          </span>
          <div className="grid sm:grid-cols-3 gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest block">Basic MP3</span>
              <span className="text-xs font-black text-white">100,000 Streams</span>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest block">Premium WAV</span>
              <span className="text-xs font-black text-white">500,000 Streams</span>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest block">Unlimited Stem</span>
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest font-mono">UNLIMITED USE</span>
            </div>
          </div>
        </div>

        {/* Quick Footer Action */}
        <div className="pt-8 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-3.5 border border-white/10 hover:border-white/20 text-[9px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all cursor-pointer"
          >
            DISMISS
          </button>
          {onPlayClick && (
            <button 
              onClick={() => {
                onPlayClick();
                onClose();
              }}
              className="px-8 py-3.5 bg-white text-black hover:bg-neutral-200 text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              {isPlaying ? "PAUSE AUDITION" : "LISTEN MASTER"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
