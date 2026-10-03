import React, { useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown, Music, Activity, Disc, Target } from 'lucide-react';
import { cn } from '../../lib/utils';

export const DiscoveryBar = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  
  const filters = [
    { name: 'All', icon: Disc },
    { name: 'Trap', icon: Music },
    { name: 'Dark', icon: Activity },
    { name: 'Cinematic', icon: Target },
  ];

  return (
    <div className="sticky top-[80px] z-50 w-full bg-black/80 backdrop-blur-2xl border-y border-white/5 py-6">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-12">
        
        {/* Search Engine */}
        <div className="relative w-full lg:w-[500px] group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" />
          <input 
            type="text" 
            placeholder="SEARCH THE KRAEZELV CATALOG..."
            className="w-full bg-white/[0.03] border border-white/10 p-6 pl-16 text-[10px] font-black uppercase tracking-[0.3em] text-white outline-none focus:border-white/40 focus:bg-white/[0.05] transition-all"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-4 flex-1 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
          <div className="flex items-center gap-2 mr-6 shrink-0">
             <SlidersHorizontal size={14} className="text-white/40" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Curate</span>
          </div>
          
          {filters.map((f) => (
            <button
              key={f.name}
              onClick={() => setActiveFilter(f.name)}
              className={cn(
                "px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-3 whitespace-nowrap",
                activeFilter === f.name 
                  ? "bg-white text-black" 
                  : "text-white/40 hover:text-white border border-white/10"
              )}
            >
              <f.icon size={14} /> {f.name}
            </button>
          ))}
        </div>

        {/* Advanced Toggles */}
        <div className="flex items-center gap-8 shrink-0">
          {['BPM', 'KEY', 'MOOD', 'PRICE'].map(label => (
            <button key={label} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-white transition-colors">
              {label} <ChevronDown size={14} strokeWidth={3} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
