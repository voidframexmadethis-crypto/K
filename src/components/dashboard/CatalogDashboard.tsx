import React, { useState } from 'react';
import { Search, Filter, Plus, Edit3, Archive, Globe, Lock, CheckCircle2, AlertTriangle, ChevronDown, DollarSign, Tag, Music, Layers, Trash2, X, Play, Upload } from 'lucide-react';
import { Beat } from '../../types';
import { cn } from '../../lib/utils';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { validateStorageUrl } from '../../lib/storageEngine';
import { Link } from 'react-router-dom';

export const CatalogDashboard = () => {
  const { beats, removeBeat, updateBeat } = useBeatCatalogStore();
  const [search, setSearch] = useState('');
  const [selectedBeats, setSelectedBeats] = useState<string[]>([]);
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'Inventory' | 'Tools'>('Inventory');
  const [editingBeatUrl, setEditingBeatUrl] = useState<Beat | null>(null);
  const [newDirectUrl, setNewDirectUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);

  const handleSaveAudioUrl = async () => {
    if (!editingBeatUrl) return;
    const check = validateStorageUrl(newDirectUrl, 'audio');
    if (!check.valid) {
      setUrlError(check.error || 'Invalid Direct URL');
      return;
    }

    setIsUpdatingUrl(true);
    setUrlError(null);
    try {
      await updateBeat(editingBeatUrl.id, {
        audioUrl: newDirectUrl.trim(),
        storage: {
          ...editingBeatUrl.storage,
          provider: 'custom',
          durableUrl: newDirectUrl.trim(),
          fileUrl: newDirectUrl.trim(),
          audioUrl: newDirectUrl.trim(),
          uploadedAt: new Date().toISOString(),
        }
      });
      setEditingBeatUrl(null);
      setNewDirectUrl('');
    } catch (err: any) {
      setUrlError(err?.message || 'Failed to update Audio URL in Firestore');
    } finally {
      setIsUpdatingUrl(false);
    }
  };

  const filteredBeats = beats.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.genre?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1700px] mx-auto py-10 px-6 md:px-12 text-white space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
         <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">Database & Inventory</span>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">Music Catalog</h1>
            <p className="text-xs text-white/40 uppercase tracking-widest">Manage published instrumentals, pricing tiers, and master links</p>
         </div>

         <div className="flex items-center gap-4">
            <Link 
              to="/dashboard/upload"
              className="px-8 py-4 bg-white text-black font-black uppercase tracking-[0.25em] text-[10px] hover:bg-neutral-200 transition-all flex items-center gap-2"
            >
              <Plus size={14} /> Upload New Beat
            </Link>
         </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-4">
         <button
           onClick={() => setActiveTab('Inventory')}
           className={cn(
             "px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all",
             activeTab === 'Inventory' ? "bg-white text-black" : "bg-white/5 text-white/60 hover:text-white"
           )}
         >
           Catalog Inventory ({beats.length})
         </button>
         <button
           onClick={() => setActiveTab('Tools')}
           className={cn(
             "px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all",
             activeTab === 'Tools' ? "bg-white text-black" : "bg-white/5 text-white/60 hover:text-white"
           )}
         >
           Catalog Tools & Sync
         </button>
      </div>

      {activeTab === 'Inventory' ? (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-neutral-950 p-4 border border-white/10 rounded-sm">
             <div className="relative w-full md:w-96">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input 
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search beats by title or genre..."
                  className="w-full bg-white/5 border border-white/15 pl-11 pr-4 py-3 text-xs font-mono text-white outline-none focus:border-purple-500 transition-colors"
                />
             </div>

             <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                {selectedBeats.length > 0 && (
                  <button
                    onClick={() => setIsBulkEditing(true)}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-[10px] tracking-widest transition-colors flex items-center gap-2"
                  >
                    <Edit3 size={14} /> Edit Selected ({selectedBeats.length})
                  </button>
                )}
             </div>
          </div>

          {/* Beats Table / Grid */}
          {filteredBeats.length === 0 ? (
            <div className="p-20 bg-neutral-950 border border-white/10 text-center flex flex-col items-center justify-center gap-6">
               <Music size={40} className="text-white/20" />
               <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase text-white tracking-tight">No Beats Found in Catalog</h3>
                  <p className="text-white/40 uppercase tracking-widest text-xs">Upload your first master instrumental using the Producer Portal.</p>
               </div>
               <Link to="/dashboard/upload" className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-200 transition-colors">
                  <Plus size={14} /> Upload Beat
               </Link>
            </div>
          ) : (
            <div className="bg-neutral-950 border border-white/10 overflow-hidden rounded-sm">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="border-b border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 bg-white/[0.02]">
                           <th className="p-4 w-12 text-center">
                              <input 
                                type="checkbox"
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedBeats(filteredBeats.map(b => b.id));
                                  } else {
                                    setSelectedBeats([]);
                                  }
                                }}
                                checked={selectedBeats.length === filteredBeats.length && filteredBeats.length > 0}
                                className="cursor-pointer"
                              />
                           </th>
                           <th className="p-4">Track Title</th>
                           <th className="p-4">Genre / BPM</th>
                           <th className="p-4">Price</th>
                           <th className="p-4">Audio Stream Link</th>
                           <th className="p-4">Status</th>
                           <th className="p-4 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5 text-xs font-mono">
                        {filteredBeats.map((beat) => {
                          const isSelected = selectedBeats.includes(beat.id);
                          return (
                            <tr key={beat.id} className={cn("hover:bg-white/[0.02] transition-colors", isSelected && "bg-purple-950/20")}>
                               <td className="p-4 text-center">
                                  <input 
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedBeats([...selectedBeats, beat.id]);
                                      } else {
                                        setSelectedBeats(selectedBeats.filter(id => id !== beat.id));
                                      }
                                    }}
                                    className="cursor-pointer"
                                  />
                               </td>
                               <td className="p-4 flex items-center gap-3">
                                  <img src={beat.artworkUrl} alt={beat.title} className="w-10 h-10 object-cover bg-neutral-900 border border-white/10 shrink-0" />
                                  <div className="min-w-0">
                                     <div className="font-bold text-white uppercase truncate">{beat.title}</div>
                                     <div className="text-[9px] text-white/40 uppercase">{beat.producerId || 'KRAEZELV'}</div>
                                  </div>
                               </td>
                               <td className="p-4 text-white/70 uppercase">
                                  {beat.genre || 'Hip Hop'} · {beat.bpm || 140} BPM
                               </td>
                               <td className="p-4 text-emerald-400 font-bold">
                                  ${(beat.licenses?.basic?.price || 29.99).toFixed(2)}
                               </td>
                               <td className="p-4 max-w-xs truncate text-white/60 text-[10px]">
                                  {beat.audioUrl || beat.storage?.durableUrl || 'No URL attached'}
                               </td>
                               <td className="p-4">
                                  <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-xs">
                                     Live
                                  </span>
                               </td>
                               <td className="p-4 text-right space-x-2">
                                  <button 
                                    onClick={() => {
                                      setEditingBeatUrl(beat);
                                      setNewDirectUrl(beat.audioUrl || beat.storage?.durableUrl || '');
                                      setUrlError(null);
                                    }} 
                                    title="Replace Audio URL" 
                                    className="p-3 text-white/40 hover:text-purple-400 transition-colors inline-block"
                                  >
                                     <Edit3 size={14} />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (confirm(`Remove beat "${beat.title}" from catalog?`)) {
                                        removeBeat(beat.id);
                                      }
                                    }} 
                                    title="Delete Beat" 
                                    className="p-3 text-white/30 hover:text-red-400 transition-colors inline-block"
                                  >
                                     <Trash2 size={14} />
                                  </button>
                               </td>
                            </tr>
                          );
                        })}
                     </tbody>
                  </table>
               </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 bg-neutral-950 border border-white/10 rounded-sm space-y-6 max-w-2xl">
           <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase text-white tracking-tight">Database Synchronization</h3>
              <p className="text-xs text-white/50 uppercase tracking-widest">
                All records are authoritative and synchronized real-time with Firestore database collections (`beats` & `beat_packs`).
              </p>
           </div>
           <div className="p-4 bg-white/5 border border-white/10 font-mono text-xs space-y-2 text-white/70">
              <div>Total Published Beats: <span className="text-white font-bold">{beats.length}</span></div>
              <div>Database Engine: <span className="text-emerald-400 font-bold">Firestore Cloud Database</span></div>
              <div>Storage Mode: <span className="text-purple-400 font-bold">Direct URL & Storage Infrastructure</span></div>
           </div>
        </div>
      )}

      {/* Replace Audio URL Modal */}
      {editingBeatUrl && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
           <div className="w-full max-w-lg bg-neutral-950 border border-white/20 p-8 flex flex-col gap-6 shadow-2xl rounded-sm">
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                 <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Audio Storage Control</span>
                    <h4 className="text-xl font-black uppercase text-white mt-1">Replace Audio URL</h4>
                    <p className="text-xs text-white/50 font-bold uppercase truncate max-w-xs">{editingBeatUrl.title}</p>
                 </div>
                 <button onClick={() => setEditingBeatUrl(null)} className="text-white/40 hover:text-white p-1"><X size={20} /></button>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-white/60 block">
                    Direct Audio File URL (MP3 / M4A)
                 </label>
                 <input 
                   type="url"
                   value={newDirectUrl}
                   onChange={(e) => {
                     setNewDirectUrl(e.target.value);
                     setUrlError(null);
                   }}
                   placeholder="https://example.com/audio/master.mp3"
                   className="w-full bg-white/5 border border-white/20 focus:border-purple-500 p-4 text-xs font-mono text-white outline-none transition-colors"
                 />
                 <p className="text-[9px] text-white/40 uppercase font-medium">
                    Paste the direct public link to the audio master. WAV is strictly prohibited.
                 </p>
              </div>

              {urlError && (
                 <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-sm flex items-center gap-2">
                    <AlertTriangle size={14} /> {urlError}
                 </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                 <button
                   onClick={handleSaveAudioUrl}
                   disabled={isUpdatingUrl}
                   className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                 >
                   {isUpdatingUrl ? 'Updating in Firestore...' : 'Save & Update Audio URL'}
                 </button>
                 <button
                   onClick={() => setEditingBeatUrl(null)}
                   className="px-6 py-4 border border-white/20 text-white/70 hover:text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                 >
                   Cancel
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
