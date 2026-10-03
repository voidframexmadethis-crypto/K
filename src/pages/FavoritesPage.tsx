import React from 'react';
import { SectionHeader } from '../components/home/SectionHeader';
import { Heart } from 'lucide-react';

export const FavoritesPage = () => {
  return (
    <div className="pt-32 pb-40 px-6 md:px-12 max-w-[1800px] mx-auto min-h-screen">
      <SectionHeader 
        kicker="Curated"
        title="Your Favorites"
      />
      
      <div className="flex flex-col items-center justify-center py-40 border border-white/5 bg-white/[0.01] text-center">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-8">
          <Heart size={32} className="text-white/20" />
        </div>
        <p className="text-white/20 uppercase tracking-[0.3em] text-[10px] mb-8">No favorites saved yet</p>
        <button className="px-10 py-5 bg-white text-black font-bold uppercase tracking-widest text-[10px] hover:bg-neutral-200 transition-all">
          Explore Catalog
        </button>
      </div>
    </div>
  );
};
