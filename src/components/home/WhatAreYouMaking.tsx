import React, { useState } from 'react';
import { Target, Compass, Sparkles, Check, ArrowRight } from 'lucide-react';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { useDiscoveryStore } from '../../store/useDiscoveryStore';
import { cn } from '../../lib/utils';

export interface ProjectGoal {
  id: string;
  title: string;
  description: string;
  keywords: string[];
}

const PROJECT_GOALS: ProjectGoal[] = [
  { id: 'freestyle', title: 'Freestyle', description: 'Fast-paced, heavy 808s and raw bounce for off-the-dome sessions.', keywords: ['trap', 'drill', 'energetic', 'hard', '808'] },
  { id: 'single', title: 'Single', description: 'Polished radio-ready hooks and commercial arrangements.', keywords: ['melodic', 'commercial', 'pop', 'hook', 'mainstream'] },
  { id: 'mixtape', title: 'Mixtape', description: 'Versatile underground bangers and cohesive tape tracks.', keywords: ['dark', 'street', 'raw', 'underground'] },
  { id: 'album', title: 'Album', description: 'Cinematic, rich production with layered arrangements.', keywords: ['cinematic', 'atmospheric', 'album', 'epic'] },
  { id: 'club', title: 'Club Record', description: 'High-BPM energy made for booming system playback.', keywords: ['club', 'bounce', 'dance', 'high-bpm', 'party'] },
  { id: 'melodic', title: 'Melodic Record', description: 'Emotional chord progressions, vocal chops, and deep vibe.', keywords: ['melodic', 'chill', 'inspiring', 'r&b', 'soul'] },
  { id: 'dark', title: 'Dark Record', description: 'Ominous synth pads, heavy minor keys, and aggressive brass.', keywords: ['dark', 'aggressive', 'scary', 'drill', 'ominous'] },
  { id: 'storytelling', title: 'Storytelling', description: 'Spacious instrumentals built for lyricists and deep storytelling.', keywords: ['storytelling', 'mellow', 'smooth', 'boop-bap', 'lyrical'] },
  { id: 'competition', title: 'Competition / Diss', description: 'Hard-hitting aggressive beats for battles and lyrical warfare.', keywords: ['aggressive', 'hard', 'battle', 'diss', 'heavy'] },
  { id: 'experimental', title: 'Experimental', description: 'Futuristic sound design, unusual time signatures, and rare synth patches.', keywords: ['experimental', 'future', 'hyperpop', 'synthwave', 'unique'] }
];

export const WhatAreYouMaking: React.FC = () => {
  const { beats } = useBeatCatalogStore();
  const { setSearchQuery, resetFilters } = useDiscoveryStore();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const handleSelectGoal = (goal: ProjectGoal) => {
    setSelectedGoal(goal.id);
    resetFilters();
    // Search using the first primary keyword
    setSearchQuery(goal.keywords[0]);

    const catalogEl = document.getElementById('discovery-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-neutral-950 py-20 border-b border-white/10 relative">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 space-y-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-400 flex items-center gap-2">
              <Compass size={12} /> INTELLIGENT DISCOVERY ENGINE
            </span>
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter">
              WHAT ARE YOU MAKING?
            </h2>
          </div>
          <p className="text-xs text-white/50 font-mono uppercase tracking-widest max-w-md">
            Select your target project type. We map your project intent directly to matching BPMs, moods, and styles in the KRAEZELV archive.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {PROJECT_GOALS.map((goal) => {
            const isSelected = selectedGoal === goal.id;
            return (
              <button
                key={goal.id}
                onClick={() => handleSelectGoal(goal)}
                className={cn(
                  "p-6 border text-left transition-all duration-300 flex flex-col justify-between gap-4 cursor-pointer group hover:scale-[1.02]",
                  isSelected 
                    ? "bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]" 
                    : "bg-white/[0.02] border-white/10 hover:border-white/30 hover:bg-white/5 text-white"
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-[9px] font-mono font-black uppercase tracking-widest",
                      isSelected ? "text-purple-600" : "text-purple-400"
                    )}>
                      PROJECT GOAL
                    </span>
                    {isSelected && <Check size={14} className="text-purple-600" />}
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight">
                    {goal.title}
                  </h3>
                  <p className={cn(
                    "text-[10px] leading-relaxed font-light line-clamp-3 uppercase tracking-wider",
                    isSelected ? "text-black/70 font-normal" : "text-white/50"
                  )}>
                    {goal.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-current/10 text-[9px] font-mono font-bold uppercase tracking-widest">
                  <span>Match Beats</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
