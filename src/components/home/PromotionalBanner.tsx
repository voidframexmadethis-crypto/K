import React from 'react';
import { Sparkles, Percent, Shield, AlertTriangle, ArrowRight } from 'lucide-react';

interface PromoOffer {
  id: string;
  tag: string;
  title: string;
  description: string;
  actionText: string;
}

export const PromotionalBanner: React.FC = () => {
  const promos: PromoOffer[] = [
    {
      id: 'bulk',
      tag: 'AUTOMATIC BULK DEAL',
      title: 'BUY 2 BEATS, GET 1 FREE',
      description: 'Add any 3 Basic or Premium licenses to your cart; the lowest price item is automatically discounted to $0.00 at checkout.',
      actionText: 'ACTIVATE OFFER'
    },
    {
      id: 'stems',
      tag: 'LIMITED TIME UPGRADE',
      title: 'FREE UNLIMITED STEMS ACCESS',
      description: 'Unlock full multi-track STEM sessions (WAV format) for all catalog additions purchased this week.',
      actionText: 'AUDITION CATALOG'
    }
  ];

  const handlePromoAction = () => {
    const el = document.getElementById('discovery-catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-black border-y border-white/10 py-16">
      <div className="max-w-[1700px] mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-2 gap-8">
          {promos.map((promo) => (
            <div 
              key={promo.id}
              className="p-8 bg-neutral-950 border border-white/5 hover:border-purple-500/20 transition-all flex flex-col justify-between gap-6 relative overflow-hidden group"
            >
              {/* Subtle design flare */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-xl pointer-events-none group-hover:bg-purple-500/10 transition-all" />

              <div className="space-y-4 relative z-10">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-purple-400 bg-purple-950/40 border border-purple-500/20 px-2.5 py-1 w-fit block">
                  {promo.tag}
                </span>
                <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                  {promo.title}
                </h3>
                <p className="text-xs text-white/55 leading-relaxed">
                  {promo.description}
                </p>
              </div>

              <button 
                onClick={handlePromoAction}
                className="text-[9px] font-black uppercase tracking-widest text-white hover:text-purple-300 transition-colors flex items-center gap-1.5 cursor-pointer w-fit"
              >
                {promo.actionText} <ArrowRight size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
