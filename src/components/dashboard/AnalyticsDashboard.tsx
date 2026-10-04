import React from 'react';
import { BarChart3, Activity } from 'lucide-react';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';

export const AnalyticsDashboard = () => {
  const { beats } = useBeatCatalogStore();

  if (beats.length === 0) {
    return (
      <div className="p-24 border border-white/10 bg-white/[0.01] flex flex-col items-center justify-center text-center gap-6">
         <BarChart3 size={48} className="text-white/20" />
         <div className="space-y-2">
            <h3 className="text-2xl font-black uppercase tracking-tight text-white">No Analytics Available</h3>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Upload beats to start tracking streams and sales.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {/* ... Add real analytics rendering logic here ... */}
    </div>
  );
};
