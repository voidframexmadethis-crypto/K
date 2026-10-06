import React from 'react';
import { Activity, BarChart3, Disc, Music, Flame, Zap, ShieldAlert } from 'lucide-react';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';

export const ProducerIntelligence: React.FC = () => {
  const { beats } = useBeatCatalogStore();

  if (beats.length === 0) {
    return (
      <div className="p-8 bg-neutral-950 border border-white/10 text-center text-xs font-mono text-white/40 uppercase tracking-widest">
        No catalog data available for intelligence analysis. Upload beats to view live telemetry.
      </div>
    );
  }

  // Real statistics derived exclusively from catalog metadata
  const totalBeats = beats.length;
  const avgBpm = Math.round(beats.reduce((sum, b) => sum + b.bpm, 0) / totalBeats);
  
  const genreCounts: Record<string, number> = {};
  beats.forEach(b => {
    genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1;
  });
  const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0] || ['Dark Trap', 1];

  const keyCounts: Record<string, number> = {};
  beats.forEach(b => {
    if (b.key) keyCounts[b.key] = (keyCounts[b.key] || 0) + 1;
  });
  const topKey = Object.entries(keyCounts).sort((a, b) => b[1] - a[1])[0] || ['C Minor', 1];

  const freeBeatsCount = beats.filter(b => b.isFree).length;
  const vaultBeatsCount = beats.filter(b => b.isVault).length;

  return (
    <div className="bg-neutral-950 border border-purple-500/30 p-8 space-y-8 backdrop-blur-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-400 flex items-center gap-2">
            <Activity size={12} className="animate-pulse" /> CATALOG TELEMETRY & INSIGHTS
          </span>
          <h2 className="text-3xl font-black uppercase text-white tracking-tight">PRODUCER INTELLIGENCE</h2>
        </div>
        <div className="px-3 py-1 bg-purple-600/20 border border-purple-500/40 text-purple-300 text-[8px] font-mono font-bold uppercase tracking-widest">
          LIVE CATALOG ANALYSIS
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white/[0.02] border border-white/10 space-y-2">
          <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">Primary Genre Leader</span>
          <span className="text-xl font-black text-purple-300 uppercase block truncate">{topGenre[0]}</span>
          <span className="text-[9px] font-mono text-white/50">{topGenre[1]} Tracks ({Math.round((topGenre[1] / totalBeats) * 100)}% of Catalog)</span>
        </div>

        <div className="p-6 bg-white/[0.02] border border-white/10 space-y-2">
          <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">Average Tempo</span>
          <span className="text-xl font-black text-white font-mono">{avgBpm} <span className="text-xs text-purple-400">BPM</span></span>
          <span className="text-[9px] font-mono text-white/50">Calculated across {totalBeats} tracks</span>
        </div>

        <div className="p-6 bg-white/[0.02] border border-white/10 space-y-2">
          <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">Dominant Musical Key</span>
          <span className="text-xl font-black text-white font-mono">{topKey[0]}</span>
          <span className="text-[9px] font-mono text-white/50">{topKey[1]} Tracks</span>
        </div>

        <div className="p-6 bg-white/[0.02] border border-white/10 space-y-2">
          <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">Catalog Vault Distribution</span>
          <span className="text-xl font-black text-emerald-400 font-mono">{vaultBeatsCount} <span className="text-xs text-white/50">VAULT</span></span>
          <span className="text-[9px] font-mono text-white/50">{freeBeatsCount} Non-Commercial Auditions</span>
        </div>
      </div>
    </div>
  );
};
