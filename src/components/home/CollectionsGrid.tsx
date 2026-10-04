import React from 'react';
import { Link } from 'react-router-dom';
import { SectionHeader } from './SectionHeader';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { Layers, Upload } from 'lucide-react';

export const CollectionsGrid = () => {
  const { beats } = useBeatCatalogStore();

  // Dynamically group beats by genre into collections
  const collectionsMap = beats.reduce((acc, beat) => {
    const genre = beat.genre || 'Uncategorized';
    if (!acc[genre]) {
      acc[genre] = {
        title: genre,
        count: 0,
        thumb: beat.artworkUrl || '',
      };
    }
    acc[genre].count += 1;
    return acc;
  }, {} as Record<string, { title: string; count: number; thumb: string }>);

  const collections = Object.values(collectionsMap);

  if (collections.length === 0) return null;

  return (
    <section className="max-w-[1800px] mx-auto px-6 md:px-12 py-24">
      <SectionHeader 
        kicker="Curated Archives"
        title="Explore Collections"
        href="/collections"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {collections.map((col, idx) => (
          <Link key={idx} to="/collections" className="group relative aspect-[4/5] bg-neutral-900 border border-white/10 overflow-hidden cursor-pointer">
            <img src={col.thumb} className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" alt={col.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            
            <div className="absolute inset-0 p-8 flex flex-col justify-end gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">{col.count} Master {col.count === 1 ? 'Beat' : 'Beats'}</span>
                <h3 className="text-3xl font-black text-white uppercase tracking-tight leading-none">{col.title}</h3>
                <div className="w-0 group-hover:w-full h-0.5 bg-white transition-all duration-500 mt-2" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
