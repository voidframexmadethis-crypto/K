import React from 'react';
import { Award, Star, Zap, Disc, Trophy } from 'lucide-react';

const milestones = [
  { count: '100', name: 'Starting Spark', icon: Zap },
  { count: '400', name: 'Rising Force', icon: Star },
  { count: '700', name: 'Consistent Heat', icon: Disc },
  { count: '1,000', name: 'First Milestone', icon: Trophy },
  { count: '10,000', name: 'Industry Impact', icon: Award },
  { count: '45,000', name: 'Elite Status', icon: Award },
  { count: '85,000', name: 'Producer Legend', icon: Award },
  { count: '140,000', name: 'Vanguard', icon: Award },
  { count: '1,000,000', name: 'Diamond Plaque', icon: Award, special: 'Diamond' },
  { count: '2,000,000', name: 'Ultra Platinum Diamond', icon: Award, special: 'Ultra' },
  { count: '3,000,000', name: 'Grammy Horn', icon: Award, special: 'Grammy' },
];

export const Achievements = () => {
  return (
    <div className="flex flex-col gap-12">
      <div>
        <h2 className="text-4xl font-bold uppercase tracking-tighter text-white mb-4">Record Plaque Hall</h2>
        <p className="text-white/40 text-sm uppercase tracking-widest">KRAEZELVBEATZ Verified Milestones & Achievements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {milestones.map((m) => (
          <div 
            key={m.count} 
            className={`p-10 border border-white/10 flex flex-col items-center text-center gap-6 group transition-all duration-500 hover:bg-white/5 ${
              m.special ? 'bg-white/[0.03] border-white/20' : 'bg-white/[0.01]'
            }`}
          >
             <div className={`w-20 h-20 flex items-center justify-center rounded-full border border-white/10 group-hover:scale-110 transition-transform ${
               m.special === 'Diamond' ? 'bg-gradient-to-br from-white/20 to-transparent' : ''
             }`}>
                <m.icon size={32} className="text-white/40 group-hover:text-white transition-colors" />
             </div>
             
             <div>
                <h3 className="text-xl font-bold uppercase tracking-tighter text-white mb-2">{m.name}</h3>
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">{m.count} Total Streams</span>
             </div>

             <div className="w-full h-px bg-white/5" />
             
             <p className="text-[8px] uppercase tracking-widest text-white/20">Verified achievement locked</p>
          </div>
        ))}
      </div>
    </div>
  );
};
