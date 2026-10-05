import React from 'react';
import { SectionHeader } from '../components/home/SectionHeader';
import { Layers, Upload, Download, Archive, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBeatPackStore } from '../store/useBeatPackStore';

export const PacksPage = () => {
  const { packs } = useBeatPackStore();

  return (
    <div className="pt-32 pb-40 px-6 md:px-12 max-w-[1800px] mx-auto min-h-screen">
      <SectionHeader 
        kicker="Multi-Track Bundles"
        title="Beat Packs & Sound Kits"
      />
      
      {packs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packs.map((pack) => {
            const downloadUrl = pack.storage?.durableUrl || pack.zipUrl || pack.downloadUrl;
            return (
              <div key={pack.id} className="p-8 bg-neutral-950 border border-white/10 flex flex-col justify-between gap-6 group hover:border-purple-500/40 transition-all">
                <div className="space-y-4">
                  <div className="w-full aspect-square bg-neutral-900 border border-white/10 overflow-hidden relative">
                    <img src={pack.artworkUrl} alt={pack.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/80 backdrop-blur-md border border-white/10 text-emerald-400 font-mono text-xs font-bold">
                      ${pack.price}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase text-white tracking-tight">{pack.title}</h3>
                    <p className="text-xs text-white/50 leading-relaxed line-clamp-2">{pack.description}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                  <div className="text-[9px] font-mono text-white/40 uppercase flex items-center gap-1">
                    <CheckCircle size={12} className="text-emerald-400" /> ValleyFile ZIP Attached
                  </div>

                  {downloadUrl ? (
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-white hover:bg-purple-600 text-black hover:text-white font-black uppercase tracking-widest text-[9px] transition-colors flex items-center gap-2 rounded-xs"
                    >
                      <Download size={14} /> Download ZIP
                    </a>
                  ) : (
                    <button
                      disabled
                      className="px-6 py-3 bg-white/10 text-white/40 font-black uppercase tracking-widest text-[9px] rounded-xs cursor-not-allowed"
                    >
                      Unavailable
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 bg-neutral-950 border border-white/10 text-center flex flex-col items-center justify-center gap-6 max-w-2xl mx-auto">
          <Layers size={40} className="text-white/20" />
          <div className="space-y-2">
            <h3 className="text-2xl font-black uppercase text-white tracking-tight">NO BEAT PACKS CREATED YET</h3>
            <p className="text-white/40 uppercase tracking-widest text-xs leading-relaxed">
              You are the exclusive producer for KRAEZELV. Create beat packs and stem bundles in the Producer Dashboard to publish them here.
            </p>
          </div>
          <Link to="/dashboard/upload-pack" className="px-10 py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 hover:bg-neutral-200 transition-colors">
            <Upload size={14} /> Create Beat Pack
          </Link>
        </div>
      )}
    </div>
  );
};
