import React, { useState } from 'react';
import { X, Check, ShoppingBag, ShieldCheck, FileText, Music, Sparkles } from 'lucide-react';
import { Beat } from '../../types';
import { cn } from '../../lib/utils';
import { PayPalPayment } from '../payment/PayPalPayment';

interface LicensingModalProps {
  beat: Beat | null;
  isOpen: boolean;
  onClose: () => void;
}
export const LicensingModal: React.FC<LicensingModalProps> = ({ beat, isOpen, onClose }) => {
  const [selectedTier, setSelectedTier] = useState<'basic' | 'premium' | 'unlimited' | 'exclusive'>('basic');
  const [added, setAdded] = useState(false);

  if (!isOpen || !beat) return null;

  const tiers = [
    {
      id: 'basic' as const,
      name: 'Basic MP3 Lease',
      price: beat.licenses.basic.price || 29.99,
      format: '320kbps Audio MP3',
      features: [
        'Used for 1 Commercial Project',
        'Up to 100,000 Audio Streams',
        'Distribute up to 3,000 Copies',
        'Non-Exclusive Rights',
        'Instant Untagged Download'
      ],
      popular: false,
    },
    {
      id: 'premium' as const,
      name: 'Premium WAV Lease',
      price: beat.licenses.premium.price || 49.99,
      format: '24-Bit Uncompressed WAV + MP3',
      features: [
        'Used for 1 Commercial Project',
        'Up to 500,000 Audio Streams',
        'Distribute up to 10,000 Copies',
        'Radio Broadcasting Rights (2 Stations)',
        'Non-Exclusive Commercial Rights',
        'Instant High-Def Download'
      ],
      popular: true,
    },
    {
      id: 'unlimited' as const,
      name: 'Unlimited License',
      price: beat.licenses.unlimited.price || 99.99,
      format: 'WAV + MP3 + Trackout Stems',
      features: [
        'Unlimited Audio Streams & Views',
        'Unlimited Distribute Copies',
        'Unlimited Live Performances',
        'Full Trackout Stems Included',
        'Radio Airplay Rights (Unlimited)',
        'Monetized Music Videos Allowed'
      ],
      popular: false,
    },
    {
      id: 'exclusive' as const,
      name: 'Exclusive Rights',
      price: beat.licenses.exclusive.price || 499.99,
      format: 'Full Ownership & Master Session Stems',
      features: [
        '100% Full Ownership Transfer',
        'Beat Removed From Storefront',
        'Unlimited Commercial & Broadcast Rights',
        'Official Ownership Contract PDF',
        'All Individual WAV Track Stems & MIDI',
        'Negotiable Split Terms Available'
      ],
      popular: false,
    }
  ];

  const handleAddToCart = () => {
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  const activeOption = tiers.find(t => t.id === selectedTier) || tiers[0];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl bg-neutral-950 border border-white/10 shadow-[0_0_120px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-6">
            <img src={beat.artworkUrl} alt={beat.title} className="w-14 h-14 object-cover border border-white/10 grayscale" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Select Licensing Tier</span>
              <h3 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tighter">{beat.title}</h3>
              <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">{beat.producerId} · {beat.bpm} BPM · {beat.key}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 text-white/40 hover:text-white border border-white/10 hover:border-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto no-scrollbar grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Options Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tiers
              .filter(tier => beat.licenses[tier.id].enabled)
              .map(tier => {
                const isSelected = selectedTier === tier.id;
              return (
                <div 
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={cn(
                    "p-6 border cursor-pointer transition-all duration-300 flex flex-col justify-between relative group",
                    isSelected 
                      ? "bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.1)] scale-[1.02]" 
                      : "bg-white/[0.02] border-white/10 hover:border-white/30 text-white"
                  )}
                >
                  {tier.popular && (
                    <div className="absolute top-0 right-0 bg-white text-black text-[7px] font-black uppercase tracking-widest px-3 py-1 border-b border-l border-black">
                      Most Popular
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={cn("text-xs font-black uppercase tracking-widest", isSelected ? "text-black/60" : "text-white/40")}>
                        {tier.id}
                      </span>
                      <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center", isSelected ? "border-black bg-black" : "border-white/20")}>
                        {isSelected && <Check size={10} className="text-white" />}
                      </div>
                    </div>
                    <h4 className="text-lg font-black uppercase tracking-tight">{tier.name}</h4>
                    <p className={cn("text-[9px] font-bold uppercase tracking-wider", isSelected ? "text-black/70" : "text-white/50")}>
                      {tier.format}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-current/10 flex items-baseline justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Price</span>
                    <span className="text-2xl font-black tabular-nums">${tier.price.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Feature Summary Panel */}
          <div className="lg:col-span-5 bg-white/[0.02] border border-white/10 p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Included Rights</span>
                <span className="text-xl font-black text-white uppercase">{activeOption.name}</span>
              </div>

              <ul className="space-y-3">
                {activeOption.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs font-medium text-white/80">
                    <Check size={14} className="text-white shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="p-4 bg-white/5 border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/80">
                  <ShieldCheck size={14} /> Instant Untagged Delivery
                </div>
                <p className="text-[9px] text-white/40 leading-relaxed uppercase">
                  Contract agreement and high-speed cloud download link sent immediately after checkout.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <a 
                href={`${beat.payhipCheckoutUrl}?custom_metadata[beatId]=${beat.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-500 transition-all shadow-lg"
              >
                <ShoppingBag size={14} /> Checkout on Payhip
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
