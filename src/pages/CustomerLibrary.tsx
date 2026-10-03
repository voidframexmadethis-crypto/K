import React from 'react';
import { Download, Music, Clock, FileText } from 'lucide-react';

export const CustomerLibrary = () => {
  return (
    <div className="pt-32 pb-40 px-4 max-w-7xl mx-auto min-h-screen">
      <div className="mb-16">
        <h2 className="text-6xl font-bold uppercase tracking-tighter text-white mb-6">My Library</h2>
        <p className="text-white/40 text-sm uppercase tracking-widest leading-loose">
          Your collection of purchased licenses and free downloads.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Placeholder for empty library */}
        <div className="flex flex-col items-center justify-center py-40 border border-white/5 bg-white/[0.01] text-center">
           <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-8">
              <Music size={32} className="text-white/20" />
           </div>
           <p className="text-white/20 uppercase tracking-[0.3em] text-[10px] mb-8">Your library is currently empty</p>
           <button className="px-10 py-5 bg-white text-black font-bold uppercase tracking-widest text-[10px] hover:bg-neutral-200 transition-all">
             Discover Beats
           </button>
        </div>
      </div>

      {/* Example Table Header (hidden when empty) */}
      <div className="mt-20 hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/40">
           <div className="col-span-5">Track</div>
           <div className="col-span-2 text-center">Date</div>
           <div className="col-span-3 text-center">License</div>
           <div className="col-span-2 text-right">Action</div>
        </div>
        {/* Row Example */}
        <div className="grid grid-cols-12 gap-4 px-6 py-8 border-b border-white/5 items-center hover:bg-white/[0.02] transition-colors">
           <div className="col-span-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-neutral-900 border border-white/5" />
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-bold uppercase tracking-tighter">Sample Track Name</span>
                 <span className="text-[8px] text-white/40 uppercase tracking-widest">140 BPM · C Minor</span>
              </div>
           </div>
           <div className="col-span-2 text-center text-[10px] tabular-nums text-white/40">2026-10-03</div>
           <div className="col-span-3 text-center">
              <span className="text-[8px] font-bold uppercase tracking-widest border border-white/10 px-2 py-1">Basic Lease</span>
           </div>
           <div className="col-span-2 flex justify-end gap-4">
              <button className="text-white/40 hover:text-white transition-colors" title="Download License">
                 <FileText size={18} />
              </button>
              <button className="text-white hover:text-neutral-400 transition-colors" title="Download Files">
                 <Download size={18} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
