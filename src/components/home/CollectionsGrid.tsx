import React from 'react';
import { Link } from 'react-router-dom';
import { SectionHeader } from './SectionHeader';

const collections = [
  { id: '1', title: 'Dark Trap', beats: 42, thumb: '/src/assets/images/trap_collection_tile_1791054153805.jpg' },
  { id: '2', title: 'Aggressive', beats: 28, thumb: '/src/assets/images/hero_studio_cinematic_1791053615857.jpg' },
  { id: '3', title: 'Melodic Trap', beats: 35, thumb: '/src/assets/images/beat_artwork_abstract_1791053624368.jpg' },
  { id: '4', title: 'Drill Essentials', beats: 19, thumb: '/src/assets/images/hero_valkyrie_massive_1791054144327.jpg' },
];

export const CollectionsGrid = () => {
  return (
    <section className="max-w-[1800px] mx-auto px-6 md:px-12 py-40">
      <SectionHeader 
        kicker="Curated"
        title="Explore Collections"
        href="/collections"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {collections.map((col) => (
          <Link key={col.id} to="/collections" className="group relative aspect-[4/5] bg-neutral-900 border border-white/5 overflow-hidden cursor-pointer">
            <img src={col.thumb} className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-expo" alt={col.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            
            <div className="absolute inset-0 p-10 flex flex-col justify-end gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">{col.beats} Master Beats</span>
               <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">{col.title}</h3>
               <div className="w-0 group-hover:w-full h-1 bg-white transition-all duration-700 mt-4" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
