import React, { useState } from 'react';
import { Layers, Flame, Zap, Disc, Sparkles, ArrowRight, ShieldCheck, Music } from 'lucide-react';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { useDiscoveryStore } from '../../store/useDiscoveryStore';
import { cn } from '../../lib/utils';

export interface DiscoveryRoom {
  id: string;
  name: string;
  tagline: string;
  genreMatch: string;
  accentColor: string;
  bgGradient: string;
  description: string;
}

const ROOMS: DiscoveryRoom[] = [
  {
    id: 'dark-drill',
    name: 'DARK DRILL VAULT',
    tagline: 'HEAVY SLIDING 808s & MINOR PAD SOUNDSCAPES',
    genreMatch: 'UK Drill',
    accentColor: 'text-purple-400 border-purple-500/40',
    bgGradient: 'from-purple-950/40 via-neutral-950 to-black',
    description: 'Aggressive sliding basslines, rapid hi-hat trills, and dark minor-key string arrangements tailored for UK & NY Drill.'
  },
  {
    id: 'future-trap',
    name: 'FUTURE TRAP DIMENSION',
    tagline: 'BOOMING SUB-BASS & SYNTH-HEAVY BOUNCE',
    genreMatch: 'Dark Trap',
    accentColor: 'text-cyan-400 border-cyan-500/40',
    bgGradient: 'from-cyan-950/30 via-neutral-950 to-black',
    description: 'Crisp brass stabs, atmospheric pad layers, and heavy trap percussion designed for mainstream charting singles.'
  },
  {
    id: 'melodic-rnb',
    name: 'MELODIC R&B SUITE',
    tagline: 'EMOTIONAL CHORDS & LUSH VOCAL CHOPS',
    genreMatch: 'R&B',
    accentColor: 'text-pink-400 border-pink-500/40',
    bgGradient: 'from-pink-950/30 via-neutral-950 to-black',
    description: 'Smooth Rhodes pianos, ambient vocal chops, and warm analog bass for singers, vocalists, and melodic rappers.'
  },
  {
    id: 'cyberpunk',
    name: 'CYBERPUNK & HYPERPOP',
    tagline: 'FUTURISTIC SYNTHS & GLITCH SOUND DESIGN',
    genreMatch: 'Hyperpop',
    accentColor: 'text-emerald-400 border-emerald-500/40',
    bgGradient: 'from-emerald-950/30 via-neutral-950 to-black',
    description: 'High-energy electronic synths, bitcrushed textures, and experimental rhythms built for forward-thinking artists.'
  }
];

export const BeatDiscoveryRooms: React.FC = () => {
  const { beats } = useBeatCatalogStore();
  const { setGenre, setTag, resetFilters } = useDiscoveryStore();
  const [activeRoomId, setActiveRoomId] = useState<string>('dark-drill');

  const handleEnterRoom = (room: DiscoveryRoom) => {
    setActiveRoomId(room.id);
    resetFilters();
    setGenre(room.genreMatch);

    const catalogEl = document.getElementById('discovery-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-black py-20 border-b border-white/10 relative overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 space-y-12 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-400 flex items-center gap-2">
              <Layers size={12} /> SONIC IMMERSION ENVIRONMENTS
            </span>
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter">
              BEAT DISCOVERY ROOMS
            </h2>
          </div>
          <p className="text-xs text-white/50 font-mono uppercase tracking-widest max-w-md">
            Step directly into specialized acoustic rooms curated by style, tempo, and atmospheric mood.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ROOMS.map((room) => {
            const isSelected = activeRoomId === room.id;
            const matchingCount = beats.filter(b => 
              b.genre.toLowerCase().includes(room.genreMatch.toLowerCase()) ||
              (b.tags && b.tags.some(t => t.toLowerCase().includes(room.genreMatch.toLowerCase())))
            ).length;

            return (
              <div
                key={room.id}
                onClick={() => handleEnterRoom(room)}
                className={cn(
                  "p-8 border bg-gradient-to-b transition-all duration-500 flex flex-col justify-between gap-8 cursor-pointer group hover:scale-[1.02] shadow-2xl relative overflow-hidden",
                  room.bgGradient,
                  isSelected ? "border-purple-500 ring-1 ring-purple-500/50" : "border-white/10 hover:border-white/30"
                )}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={cn("px-2.5 py-1 bg-black/60 border text-[8px] font-black uppercase tracking-widest", room.accentColor)}>
                      {room.genreMatch} ROOM
                    </span>
                    <span className="text-[10px] font-mono text-white/40 font-bold">
                      {matchingCount} TRACKS
                    </span>
                  </div>

                  <h3 className="text-2xl font-black uppercase tracking-tight text-white group-hover:text-purple-300 transition-colors">
                    {room.name}
                  </h3>

                  <p className="text-[9px] font-mono uppercase text-purple-400 tracking-widest leading-relaxed">
                    {room.tagline}
                  </p>

                  <p className="text-xs text-white/60 font-light leading-relaxed uppercase tracking-wider">
                    {room.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white group-hover:text-purple-300 transition-colors">
                  <span>ENTER ROOM CATALOG</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
