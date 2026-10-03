import React from 'react';
import { SectionHeader } from '../components/home/SectionHeader';

export const PacksPage = () => {
  const packs = [
    { title: 'Genesis Bundle', price: '$99', image: '/src/assets/images/pack_artwork_geometric_1791053633249.jpg' },
    { title: 'Dark Horizons', price: '$79', image: '/src/assets/images/trap_collection_tile_1791054153805.jpg' },
  ];

  return (
    <div className="pt-32 pb-40 px-6 md:px-12 max-w-[1800px] mx-auto min-h-screen">
      <SectionHeader 
        kicker="Premium Kits"
        title="Beat Packs"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {packs.map((pack) => (
          <div key={pack.title} className="group flex flex-col gap-8 cursor-pointer">
            <div className="relative aspect-video bg-neutral-900 border border-white/5 overflow-hidden">
              <img src={pack.image} className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 transition-all duration-1000" alt={pack.title} />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="px-10 py-5 bg-white text-black font-black uppercase tracking-[0.4em] text-[10px]">Preview Bundle</button>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-2">
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter">{pack.title}</h3>
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Multi-Track WAV + MIDI</span>
              </div>
              <span className="text-4xl font-black text-white/60">{pack.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
