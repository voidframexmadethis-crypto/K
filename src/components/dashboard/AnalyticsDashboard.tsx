import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Globe2, MousePointer2, Smartphone, Monitor, Search, ShoppingCart, UserCheck, TrendingDown, ArrowUp, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

export const AnalyticsDashboard = () => {
  const [plays, setPlays] = useState(12842);
  
  // Simulate real-time plays
  useEffect(() => {
    const interval = setInterval(() => {
      setPlays(prev => prev + Math.floor(Math.random() * 3));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const dropOffData = [
    { label: '0s', count: 100 },
    { label: '15s', count: 85 },
    { label: '30s', count: 42 },
    { label: '60s', count: 28 },
    { label: 'Full', count: 15 },
  ];

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-4">Intelligence Lab</h2>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Audience Insights, Real-Time Streams & Conversion Metrics</p>
        </div>
        <div className="flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-full">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Live Engine Tracking</span>
        </div>
      </div>

      {/* Real-time Counter */}
      <div className="p-12 border border-white/10 bg-white/[0.02] flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden">
         <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
            <Activity size={400} strokeWidth={0.5} />
         </div>
         <span className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20">Total Ecosystem Streams</span>
         <h3 className="text-8xl md:text-[10rem] font-black text-white tracking-tighter tabular-nums leading-none">
            {plays.toLocaleString()}
         </h3>
         <div className="flex items-center gap-6 mt-4">
            <div className="flex flex-col gap-1">
               <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Growth</span>
               <span className="text-xl font-black text-emerald-500">+42.8%</span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex flex-col gap-1">
               <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Avg Listen Time</span>
               <span className="text-xl font-black text-white">00:48s</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Conv. Rate', value: '3.2%', sub: '+0.5% Target', icon: MousePointer2 },
           { label: 'Cust. LTV', value: '$84.50', sub: 'Repeat Buyers', icon: UserCheck },
           { label: 'Abandoned', value: '18', sub: 'Past 24 Hours', icon: ShoppingCart },
           { label: 'New Fans', value: '412', sub: 'Social Traffic', icon: Users },
         ].map(stat => (
            <div key={stat.label} className="p-8 border border-white/10 bg-white/[0.01] flex flex-col gap-4">
               <div className="flex justify-between items-center text-white/20">
                  <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                  <stat.icon size={16} />
               </div>
               <span className="text-4xl font-black text-white tracking-tighter">{stat.value}</span>
               <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">{stat.sub}</span>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         {/* Demographics Map Simulation */}
         <div className="lg:col-span-8 space-y-6">
            <h3 className="text-xl font-black uppercase tracking-tighter text-white">Geographic Reach</h3>
            <div className="aspect-video bg-neutral-900 border border-white/10 relative overflow-hidden flex items-center justify-center">
               <Globe2 size={120} className="text-white/5 animate-spin-slow" />
               <div className="absolute inset-0 p-12 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-12">
                     <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black uppercase text-white">United States</span>
                        <div className="h-1 bg-white w-[60%]" />
                     </div>
                     <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black uppercase text-white">United Kingdom</span>
                        <div className="h-1 bg-white/40 w-[15%]" />
                     </div>
                  </div>
                  <div className="flex justify-end gap-12">
                     <div className="flex flex-col gap-1 text-right">
                        <span className="text-4xl font-black text-white">124</span>
                        <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Active Cities</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Device Breakdown */}
         <div className="lg:col-span-4 space-y-6">
            <h3 className="text-xl font-black uppercase tracking-tighter text-white">Device Architecture</h3>
            <div className="p-10 border border-white/10 bg-white/[0.01] flex flex-col gap-8 h-full justify-center">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <Monitor size={24} className="text-white/20" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-white">Desktop</span>
                  </div>
                  <span className="text-xl font-black text-white">65%</span>
               </div>
               <div className="h-2 bg-white/5 w-full">
                  <div className="h-full bg-white w-[65%]" />
               </div>
               <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4">
                     <Smartphone size={24} className="text-white/20" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-white">Mobile</span>
                  </div>
                  <span className="text-xl font-black text-white">35%</span>
               </div>
               <div className="h-2 bg-white/5 w-full">
                  <div className="h-full bg-white/40 w-[35%]" />
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         {/* Drop-off Point Analysis */}
         <div className="space-y-6">
            <h3 className="text-xl font-black uppercase tracking-tighter text-white">Stream Retention (Drop-off)</h3>
            <div className="p-10 border border-white/10 bg-white/[0.01] flex items-end justify-between h-64 gap-4">
               {dropOffData.map(d => (
                  <div key={d.label} className="flex-1 flex flex-col items-center gap-4">
                     <div className="w-full bg-white/10 relative group">
                        <div className="w-full bg-white transition-all duration-1000 origin-bottom" style={{ height: `${d.count}%` }} />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="text-[10px] font-black text-black bg-white px-2 py-1">{d.count}%</span>
                        </div>
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{d.label}</span>
                  </div>
               ))}
            </div>
         </div>

         {/* Search Query Log */}
         <div className="space-y-6">
            <h3 className="text-xl font-black uppercase tracking-tighter text-white">Marketplace Intent (Search Log)</h3>
            <div className="border border-white/10 bg-white/[0.01] overflow-hidden">
               <div className="flex flex-col">
                  {[
                    { q: 'Drake type beat', count: 142 },
                    { q: 'Dark cinematic trap', count: 85 },
                    { q: 'Travis Scott piano', count: 64 },
                    { q: 'Hard drill 140bpm', count: 32 },
                  ].map((query, i) => (
                    <div key={i} className="flex justify-between items-center p-6 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                       <div className="flex items-center gap-4">
                          <Search size={14} className="text-white/20" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white">{query.q}</span>
                       </div>
                       <span className="text-[10px] font-black text-white/40">{query.count} HITS</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
