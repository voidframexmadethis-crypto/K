import React, { useState } from 'react';
import { X, Check, ShoppingBag, ShieldCheck, FileText, Music, Sparkles, CreditCard, Lock } from 'lucide-react';
import { Beat } from '../../types';
import { cn } from '../../lib/utils';
import { useCartStore } from '../../store/useCartStore';

interface LicensingModalProps {
  beat: Beat | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LicensingModal: React.FC<LicensingModalProps> = ({ beat, isOpen, onClose }) => {
  const [selectedTier, setSelectedTier] = useState<'basic' | 'premium' | 'unlimited' | 'exclusive'>('basic');
  const [added, setAdded] = useState(false);
  const { addToCart } = useCartStore();

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

  const activeOption = tiers.find(t => t.id === selectedTier) || tiers[0];

  const handleAddToCartClick = () => {
    addToCart(beat, activeOption.id, activeOption.price);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1000);
  };

  const handleInstantCheckout = () => {
    fetch('/api/purchases/create-pending', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        beatId: beat.id,
        expectedAmount: activeOption.price,
        currency: 'USD'
      })
    })
    .then(() => {
      addToCart(beat, activeOption.id, activeOption.price);
      onClose();
    })
    .catch(() => {
      addToCart(beat, activeOption.id, activeOption.price);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl bg-black border border-white/10 shadow-[0_0_120px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-6">
            <img src={beat.artworkUrl} alt={beat.title} className="w-16 h-16 object-cover border border-white/10 grayscale" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">SELECT LICENSING TIER</span>
              <h3 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tighter">{beat.title}</h3>
              <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase mt-0.5">
                KRAEZELV EXCLUSIVE · {beat.bpm} BPM · {beat.key} · {beat.genre}
              </span>
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
          
          {/* Left Column: Grid Comparison Tiers */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tiers
              .filter(tier => beat.licenses[tier.id]?.enabled ?? true)
              .map(tier => {
                const isSelected = selectedTier === tier.id;
                return (
                  <div 
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={cn(
                      "p-6 border cursor-pointer transition-all duration-300 flex flex-col justify-between relative group",
                      isSelected 
                        ? "bg-purple-950/20 text-white border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.15)] scale-[1.02]" 
                        : "bg-white/[0.02] border-white/10 hover:border-white/30 text-white/60 hover:text-white"
                    )}
                  >
                    {tier.popular && (
                      <div className="absolute top-0 right-0 bg-purple-500 text-white text-[7px] font-black uppercase tracking-widest px-3 py-1">
                        Best Choice
                      </div>
                    )}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={cn("text-[9px] font-black uppercase tracking-widest", isSelected ? "text-purple-300" : "text-white/30")}>
                          {tier.id.toUpperCase()} CONTRACT
                        </span>
                        <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center", isSelected ? "border-purple-400 bg-purple-500" : "border-white/20")}>
                          {isSelected && <Check size={10} className="text-white" />}
                        </div>
                      </div>
                      <h4 className="text-lg font-black uppercase tracking-tight text-white">{tier.name}</h4>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">
                        {tier.format}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-baseline justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">Price</span>
                      <span className="text-2xl font-black text-white tabular-nums">${tier.price.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Right Column: Dynamic Tier Feature Inspector & CART ADDITION */}
          <div className="lg:col-span-5 bg-white/[0.02] border border-white/10 p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">INCLUDED RIGHTS</span>
                <span className="text-lg font-black text-white uppercase">{activeOption.name}</span>
              </div>

              <ul className="space-y-3">
                {activeOption.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs font-semibold text-white/70">
                    <Check size={14} className="text-purple-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="p-4 bg-purple-500/5 border border-purple-500/20 space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-purple-300">
                  <ShieldCheck size={14} /> INSTANT DIGITAL DELIVERY
                </div>
                <p className="text-[9px] text-white/40 leading-relaxed uppercase">
                  Untagged master audio files and legal contracts are generated and delivered instantly after transaction verification.
                </p>
              </div>
            </div>

            {/* DUAL CHECKOUT CTAs */}
            <div className="mt-8 space-y-3">
              <button 
                onClick={handleAddToCartClick}
                className={cn(
                  "w-full py-4 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg",
                  added 
                    ? "bg-emerald-500 text-white" 
                    : "bg-white text-black hover:bg-neutral-200"
                )}
              >
                {added ? (
                  <>
                    <Check size={14} /> ADDED TO CART
                  </>
                ) : (
                  <>
                    <ShoppingBag size={14} /> ADD TO SHOPPING CART
                  </>
                )}
              </button>

              <button 
                onClick={handleInstantCheckout}
                className="w-full py-4 border border-white/20 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/[0.05] transition-all"
              >
                <Lock size={12} /> INSTANT CHECKOUT
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
