import React, { useState } from 'react';
import { Ticket } from 'lucide-react';

export const MarketingDashboard = () => {
  const [activeTab] = useState('Promos');

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-4">Growth Terminal</h2>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Promotions, Campaigns & Audience Acquisition</p>
        </div>
      </div>

      <div className="p-24 border border-white/10 bg-white/[0.01] flex flex-col items-center justify-center text-center gap-6">
         <Ticket size={48} className="text-white/20" />
         <div className="space-y-2">
            <h3 className="text-2xl font-black uppercase tracking-tight text-white">No Marketing Data</h3>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Create campaigns and promotional content to start seeing growth metrics.</p>
         </div>
      </div>
    </div>
  );
};
