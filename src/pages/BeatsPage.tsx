import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronDown, Upload, Music } from 'lucide-react';
import { BeatCard } from '../components/beats/BeatCard';
import { useBeatCatalogStore } from '../store/useBeatCatalogStore';

export const BeatsPage = () => {
  const [search, setSearch] = useState('');
  const [activeGenre, setActiveGenre] = useState('All');
  const { beats } = useBeatCatalogStore();

  const genres = ['All', 'Trap', 'Dark Trap', 'Melodic Trap', 'Drill', 'Boom Bap', 'R&B'];

  const filteredBeats = beats.filter(beat => {
    const matchesSearch = beat.title.toLowerCase().includes(search.toLowerCase()) ||
      beat.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
      beat.bpm.toString().includes(search);
    const matchesGenre = activeGenre === 'All' || beat.genre.toLowerCase() === activeGenre.toLowerCase();
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="pt-32 pb-40 px-4 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="max-w-2xl">
          <h2 className="text-6xl font-bold uppercase tracking-tighter text-white mb-6">Catalog</h2>
          <p className="text-white/40 text-sm uppercase tracking-widest leading-loose">
            Explore the complete KRAEZELV archive. High-standard production for the modern digital landscape.
          </p>
        </div>
        
        <div className="flex flex-col gap-4 w-full md:w-auto">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
            <input 
              type="text" 
              placeholder="SEARCH BY TITLE, TAG, BPM..."
              className="w-full md:w-[400px] bg-white/[0.03] border border-white/10 p-4 pl-12 text-[10px] font-bold uppercase tracking-widest text-white outline-none focus:border-white transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-12 border-b border-white/5 pb-8">
        <div className="flex items-center gap-2 mr-6">
           <SlidersHorizontal size={14} className="text-white/40" />
           <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Filters</span>
        </div>
        
        {genres.map(genre => (
          <button 
            key={genre}
            onClick={() => setActiveGenre(genre)}
            className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeGenre === genre 
                ? 'bg-white text-black' 
                : 'text-white/40 hover:text-white border border-white/5'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Grid or Empty State */}
      {filteredBeats.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
          {filteredBeats.map(beat => (
            <BeatCard key={beat.id} beat={beat} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 border border-white/10 bg-neutral-950 p-8 text-center space-y-6">
           <div className="w-16 h-16 bg-purple-600/20 border border-purple-500/30 rounded-full flex items-center justify-center text-purple-400">
             <Music size={28} />
           </div>
           <div className="space-y-2 max-w-md">
             <h3 className="text-2xl font-black uppercase text-white tracking-tight">CATALOG EMPTY</h3>
             <p className="text-white/40 uppercase tracking-widest text-[10px] leading-relaxed">
               {beats.length === 0 
                 ? 'No beats uploaded yet. You are the exclusive producer for this storefront.' 
                 : 'No beats match your search criteria.'}
             </p>
           </div>
           {beats.length === 0 ? (
             <Link to="/dashboard/upload" className="px-10 py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all flex items-center gap-2">
               <Upload size={14} /> Upload Your First Beat
             </Link>
           ) : (
             <button onClick={() => { setSearch(''); setActiveGenre('All'); }} className="px-10 py-4 border border-white/20 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all">
               Reset All Filters
             </button>
           )}
        </div>
      )}
    </div>
  );
};
