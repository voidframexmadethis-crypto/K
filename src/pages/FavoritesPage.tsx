import React from 'react';
import { SectionHeader } from '../components/home/SectionHeader';
import { Heart, Music } from 'lucide-react';
import { useBeatCatalogStore } from '../store/useBeatCatalogStore';
import { useUserPreferencesStore } from '../store/useUserPreferencesStore';
import { BeatCard } from '../components/beats/BeatCard';
import { Link } from 'react-router-dom';

export const FavoritesPage = () => {
  const { beats } = useBeatCatalogStore();
  const { favorites } = useUserPreferencesStore();

  const favoriteBeats = beats.filter(b => favorites.includes(b.id));

  return (
    <div className="pt-32 pb-40 px-6 md:px-12 max-w-[1800px] mx-auto min-h-screen">
      <SectionHeader 
        kicker="SAVED SELECTIONS"
        title="YOUR FAVORITES"
      />
      
      {favoriteBeats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 border border-white/5 bg-white/[0.01] text-center space-y-6">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
            <Heart size={32} className="text-white/20" />
          </div>
          <p className="text-white/40 uppercase tracking-[0.3em] text-[10px]">No favorites saved yet</p>
          <Link to="/beats" className="px-10 py-5 bg-white text-black font-bold uppercase tracking-widest text-[10px] hover:bg-neutral-200 transition-all">
            Explore Beats Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-12">
          {favoriteBeats.map(beat => (
            <BeatCard key={beat.id} beat={beat} />
          ))}
        </div>
      )}
    </div>
  );
};
