import React, { useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { BeatCard } from '../components/beats/BeatCard';
import { Beat } from '../types';

export const BeatsPage = () => {
  const [search, setSearch] = useState('');
  const [activeGenre, setActiveGenre] = useState('All');

  const genres = ['All', 'Trap', 'Dark Trap', 'Melodic Trap', 'Drill', 'Boom Bap', 'R&B'];

  // This would be replaced by real Firestore data
  const beats: Beat[] = []; 

  return (
    <div className="pt-32 pb-40 px-4 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="max-w-2xl">
          <h2 className="text-6xl font-bold uppercase tracking-tighter text-white mb-6">Catalog</h2>
          <p className="text-white/40 text-sm uppercase tracking-widest leading-loose">
            Explore the complete KRAEZELVBEATZ archive. High-standard production for the modern digital landscape.
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
        
        <button className="ml-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
          BPM <ChevronDown size={14} />
        </button>
        <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
          Price <ChevronDown size={14} />
        </button>
      </div>

      {/* Grid */}
      {beats.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
          {beats.map(beat => (
            <BeatCard key={beat.id} beat={beat} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 border border-white/5 bg-white/[0.01]">
           <p className="text-white/20 uppercase tracking-[0.3em] text-[10px] mb-8">No matching beats found in our catalog</p>
           <button className="px-10 py-5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:bg-white hover:text-black transition-all">
             Reset All Filters
           </button>
        </div>
      )}
    </div>
  );
};
