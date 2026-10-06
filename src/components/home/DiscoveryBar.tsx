import React from 'react';
import { Search, SlidersHorizontal, ChevronDown, Music, Activity, Disc, Target, Heart } from 'lucide-react';
import { useDiscoveryStore } from '../../store/useDiscoveryStore';
import { cn } from '../../lib/utils';

export const DiscoveryBar: React.FC = () => {
  const { searchQuery, setSearchQuery, genre, setGenre, resetFilters } = useDiscoveryStore();
  const [localSearch, setLocalSearch] = React.useState(searchQuery);

  // Sync local search when store searchQuery changes (like on reset)
  React.useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounce store update
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        setSearchQuery(localSearch);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery, searchQuery]);
  
  const filters = [
    { name: 'All', value: null, icon: Disc },
    { name: 'Trap', value: 'Trap', icon: Music },
    { name: 'Dark Trap', value: 'Dark Trap', icon: Activity },
    { name: 'Cinematic', value: 'Cinematic', icon: Target },
  ];

  const handleFilterClick = (value: string | null) => {
    setGenre(value);
    const catalogEl = document.getElementById('discovery-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-[80px] z-50 w-full bg-black/90 backdrop-blur-2xl border-y border-white/5 py-4">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-6">
        
        {/* Search Input Sync */}
        <div className="relative w-full lg:w-[400px] group">
          <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors pointer-events-none" />
          <input 
            type="text" 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="FILTER CATALOG IN REAL TIME..."
            className="w-full bg-white/[0.03] border border-white/10 p-4 pl-12 text-[9px] font-black uppercase tracking-[0.3em] text-white outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
          <div className="flex items-center gap-2 mr-4 shrink-0">
             <SlidersHorizontal size={12} className="text-purple-400" />
             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Curate</span>
          </div>
          
          {filters.map((f) => {
            const isActive = genre === f.value;
            return (
              <button
                key={f.name}
                onClick={() => handleFilterClick(f.value)}
                className={cn(
                  "px-6 py-2.5 rounded-xs text-[9px] font-black uppercase tracking-[0.25em] transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer border",
                  isActive 
                    ? "bg-white text-black border-white shadow-lg" 
                    : "text-white/40 hover:text-white border-white/5 bg-white/[0.02]"
                )}
              >
                <f.icon size={12} /> {f.name}
              </button>
            );
          })}
        </div>

        {/* Diagnostic Metadata Status */}
        <div className="hidden xl:flex items-center gap-6 shrink-0 text-[9px] font-black uppercase tracking-widest text-white/40 border-l border-white/10 pl-6">
          <span className="flex items-center gap-1.5"><Heart size={12} className="text-purple-400 animate-pulse" /> 100% ROYALTY-FREE CATALOG</span>
        </div>

      </div>
    </div>
  );
};
