import React from 'react';
import { Activity, Flame, Disc, Sliders, ArrowUpRight } from 'lucide-react';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { useDiscoveryStore } from '../../store/useDiscoveryStore';
import { cn } from '../../lib/utils';

export const SoundDNASection: React.FC = () => {
  const { beats } = useBeatCatalogStore();
  const { tag, setTag, setGenre, setMood, resetFilters } = useDiscoveryStore();

  // Extract unique genres, moods, and tags from REAL catalog metadata
  const allGenres = Array.from(new Set(beats.map(b => b.genre).filter(Boolean)));
  const allMoods = Array.from(new Set(beats.flatMap(b => b.moods || []).filter(Boolean)));
  const allTags = Array.from(new Set(beats.flatMap(b => b.tags || []).filter(Boolean)));

  // Combine into Sound DNA categories with real count
  const dnaCategories = [
    ...allGenres.map(g => ({ label: g.toUpperCase(), type: 'genre', value: g, count: beats.filter(b => b.genre.toLowerCase() === g.toLowerCase()).length })),
    ...allMoods.map(m => ({ label: m.toUpperCase(), type: 'mood', value: m, count: beats.filter(b => b.moods && b.moods.some(x => x.toLowerCase() === m.toLowerCase())).length })),
    ...allTags.map(t => ({ label: `#${t.toUpperCase()}`, type: 'tag', value: t, count: beats.filter(b => b.tags && b.tags.some(x => x.toLowerCase() === t.toLowerCase())).length }))
  ].slice(0, 16);

  const handleSelectDna = (item: { type: string; value: string }) => {
    resetFilters();
    if (item.type === 'genre') {
      setGenre(item.value);
    } else if (item.type === 'mood') {
      setMood(item.value);
    } else {
      setTag(item.value);
    }

    const catalogEl = document.getElementById('discovery-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (dnaCategories.length === 0) return null;

  return (
    <section className="bg-black py-16 border-b border-white/10 relative">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-400 flex items-center gap-2">
              <Activity size={12} /> CATALOG SOUND MATRIX
            </span>
            <h2 className="text-3xl md:text-4xl font-black uppercase text-white tracking-tighter">
              KRAEZELV SOUND DNA
            </h2>
          </div>
          <p className="text-xs text-white/50 font-mono uppercase tracking-widest max-w-md">
            Click any acoustic profile below to filter the live catalog based on genuine metadata attributes.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {dnaCategories.map((dna) => (
            <button
              key={`${dna.type}_${dna.value}`}
              onClick={() => handleSelectDna(dna)}
              className={cn(
                "px-5 py-3 border text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 cursor-pointer group hover:scale-105",
                tag === dna.value 
                  ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]" 
                  : "bg-white/[0.02] border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/30"
              )}
            >
              <span>{dna.label}</span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-white/10 text-white/60 group-hover:bg-white group-hover:text-black transition-colors">
                {dna.count}
              </span>
              <ArrowUpRight size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
