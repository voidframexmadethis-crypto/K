import React from 'react';
import { SectionHeader } from '../components/home/SectionHeader';
import { useBeatCatalogStore } from '../store/useBeatCatalogStore';
import { Layers, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CollectionsPage = () => {
  const { beats } = useBeatCatalogStore();

  const collectionsMap = beats.reduce((acc, beat) => {
    const genre = beat.genre || 'Uncategorized';
    if (!acc[genre]) {
      acc[genre] = {
        title: genre,
        count: 0,
        image: beat.artworkUrl || '/src/assets/images/beat_artwork_abstract_1791053624368.jpg',
      };
    }
    acc[genre].count += 1;
    return acc;
  }, {} as Record<string, { title: string; count: number; image: string }>);

  const collections = Object.values(collectionsMap);

  return (
    <div className="pt-32 pb-40 px-6 md:px-12 max-w-[1800px] mx-auto min-h-screen">
      <SectionHeader 
        kicker="Curated Archives"
        title="Beat Collections"
      />
      
      {collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {collections.map((col) => (
            <div key={col.title} className="group relative aspect-[3/4] bg-neutral-900 border border-white/10 overflow-hidden cursor-pointer">
              <img src={col.image} className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" alt={col.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400 mb-2">{col.count} {col.count === 1 ? 'Track' : 'Tracks'}</span>
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter">{col.title}</h3>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 bg-neutral-950 border border-white/10 text-center flex flex-col items-center justify-center gap-6 max-w-2xl mx-auto">
          <Layers size={40} className="text-white/20" />
          <div className="space-y-2">
            <h3 className="text-2xl font-black uppercase text-white tracking-tight">NO COLLECTIONS PUBLISHED YET</h3>
            <p className="text-white/40 uppercase tracking-widest text-xs leading-relaxed">
              Curated collections will be automatically generated based on the beats you upload into the catalog.
            </p>
          </div>
          <Link to="/dashboard/upload" className="px-10 py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 hover:bg-neutral-200 transition-colors">
            <Upload size={14} /> Upload First Beat
          </Link>
        </div>
      )}
    </div>
  );
};
