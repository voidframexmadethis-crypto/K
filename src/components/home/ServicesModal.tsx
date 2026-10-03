import React, { useState } from 'react';
import { X, Check, Sliders, Palette, Mic, Disc } from 'lucide-react';
import { ServiceItem } from '../../types';
import { cn } from '../../lib/utils';

interface ServicesModalProps {
  service: ServiceItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ServicesModal: React.FC<ServicesModalProps> = ({ service, isOpen, onClose }) => {
  const [submitted, setAdded] = useState(false);
  const [notes, setNotes] = useState('');

  if (!isOpen || !service) return null;

  const handleBook = () => {
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1500);
  };

  const getIcon = () => {
    switch (service.category) {
      case 'Mixing & Mastering': return <Sliders size={24} />;
      case 'Custom Artwork': return <Palette size={24} />;
      case 'Feature Verse': return <Mic size={24} />;
      default: return <Disc size={24} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-white/10 shadow-[0_0_120px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 border border-white/10 flex items-center justify-center text-white">
              {getIcon()}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">{service.category}</span>
              <h3 className="text-2xl font-black uppercase text-white tracking-tighter">{service.title}</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 text-white/40 hover:text-white border border-white/10 hover:border-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <p className="text-sm text-white/80 leading-relaxed uppercase tracking-wider font-medium">
            {service.description}
          </p>

          <div className="grid grid-cols-2 gap-4 p-4 bg-white/[0.02] border border-white/10 text-xs font-black uppercase tracking-widest">
            <div>
              <span className="text-white/40 block text-[8px]">Turnaround Time</span>
              <span className="text-white">{service.turnaroundDays} Business Days</span>
            </div>
            <div>
              <span className="text-white/40 block text-[8px]">Client Rating</span>
              <span className="text-white">★ {service.rating.toFixed(1)} ({service.reviewsCount} Reviews)</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">
              Project Notes / Reference Links
            </label>
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Paste Spotify links, stem download links, or design style preferences..."
              className="w-full bg-white/5 border border-white/10 p-4 text-xs font-medium text-white placeholder:text-white/20 outline-none focus:border-white transition-all h-28 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Fixed Rate</span>
              <span className="text-3xl font-black text-white">${service.price.toFixed(2)}</span>
            </div>

            <button 
              onClick={handleBook}
              className={cn(
                "px-10 py-5 font-black uppercase tracking-[0.4em] text-xs transition-all duration-300 flex items-center gap-3",
                submitted ? "bg-emerald-500 text-black" : "bg-white text-black hover:bg-neutral-200"
              )}
            >
              {submitted ? (
                <>
                  <Check size={16} /> Booking Confirmed!
                </>
              ) : (
                `Order Service — $${service.price.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
