import React from 'react';
import { SectionHeader } from '../components/home/SectionHeader';

export const CollectionsPage = () => {
  const collections = [
    { title: 'Dark Trap', count: 42, image: '/src/assets/images/trap_collection_tile_1791054153805.jpg' },
    { title: 'Cinematic', count: 28, image: '/src/assets/images/hero_studio_cinematic_1791053615857.jpg' },
    { title: 'Melodic', count: 35, image: '/src/assets/images/beat_artwork_abstract_1791053624368.jpg' },
    { title: 'Drill', count: 19, image: '/src/assets/images/hero_valkyrie_massive_1791054144327.jpg' },
  ];

  return (
    <div className="pt-32 pb-40 px-6 md:px-12 max-w-[1800px] mx-auto min-h-screen">
      <SectionHeader 
        kicker="Curated Archives"
        title="Beat Collections"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {collections.map((col) => (
          <div key={col.title} className="group relative aspect-[3/4] bg-neutral-900 border border-white/5 overflow-hidden cursor-pointer">
            <img src={col.image} className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" alt={col.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-2">{col.count} Tracks</span>
              <h3 className="text-4xl font-black text-white uppercase tracking-tighter">{col.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
