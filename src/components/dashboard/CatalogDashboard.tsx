import React, { useState } from 'react';
import { Search, Filter, Plus, Edit3, Archive, Globe, Lock, CheckCircle2, AlertTriangle, ChevronDown, DollarSign, Tag, Music, Layers, Trash2, X, Play, Upload } from 'lucide-react';
import { Beat } from '../../types';
import { cn } from '../../lib/utils';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { validateValleyFileUrl } from '../../lib/storageEngine';
import { Link } from 'react-router-dom';

export const CatalogDashboard = () => {
  const { beats, removeBeat, updateBeat } = useBeatCatalogStore();
  const [search, setSearch] = useState('');
  const [selectedBeats, setSelectedBeats] = useState<string[]>([]);
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'Inventory' | 'Tools'>('Inventory');
  const [editingBeatUrl, setEditingBeatUrl] = useState<Beat | null>(null);
  const [newValleyUrl, setNewValleyUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);

  const handleSaveValleyUrl = async () => {
    if (!editingBeatUrl) return;
    const check = validateValleyFileUrl(newValleyUrl, 'audio');
    if (!check.valid) {
      setUrlError(check.error || 'Invalid ValleyFile URL');
      return;
    }

    setIsUpdatingUrl(true);
    setUrlError(null);
    try {
      await updateBeat(editingBeatUrl.id, {
        audioUrl: newValleyUrl.trim(),
        storage: {
          ...editingBeatUrl.storage,
          provider: 'valleyfile',
          durableUrl: newValleyUrl.trim(),
          fileUrl: newValleyUrl.trim(),
          audioUrl: newValleyUrl.trim(),
          uploadedAt: new Date().toISOString(),
        }
      });
      setEditingBeatUrl(null);
      setNewValleyUrl('');
    } catch (err: any) {
      setUrlError(err?.message || 'Failed to update ValleyFile URL in Firestore');
    } finally {
      setIsUpdatingUrl(false);
    }
  };

  const filteredBeats = beats.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.genre.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedBeats(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkArchive = () => {
    selectedBeats.forEach(id => removeBeat(id));
    setSelectedBeats([]);
  };

  const handleBulkPriceEdit = (price: number) => {
    setIsBulkEditing(false);
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-4">Catalog Control</h2>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Inventory, Batch Metadata & Asset Management</p>
        </div>
        <div className="flex gap-4">
           <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-sm mr-4">
              {['Inventory', 'Tools'].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={cn(
                     "px-6 py-2 text-[8px] font-black uppercase tracking-widest transition-all",
                     activeTab === tab ? "bg-white text-black" : "text-white/40 hover:text-white"
                   )}
                 >
                   {tab}
                 </button>
              ))}
           </div>
           <button onClick={() => alert('Bulk Uploader: Module initializing...')} className="px-8 py-4 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-black transition-all flex items-center gap-3">
              <Layers size={14} /> Bulk Uploader
           </button>
           <Link to="/dashboard/upload" className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-neutral-200 transition-all flex items-center gap-3">
              <Plus size={14} /> Add Single Beat
           </Link>
        </div>
      </div>

      {activeTab === 'Inventory' ? (
        <>
          {/* Catalog Search & Actions */}
          <div className="flex flex-col lg:flex-row gap-6 items-center">
             <div className="relative flex-1 group w-full">
                <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" />
                <input 
                  type="text" 
                  placeholder="SEARCH CATALOG BY TITLE, GENRE, OR BPM..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 p-6 pl-16 text-[10px] font-black uppercase tracking-[0.3em] text-white outline-none focus:border-white/40 transition-all"
                />
             </div>
             <div className="flex items-center gap-4 shrink-0">
                <button className="p-6 border border-white/10 text-white/40 hover:text-white transition-all"><Filter size={18} /></button>
                <div className="h-10 w-px bg-white/10 mx-2" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{selectedBeats.length} SELECTED</span>
                {selectedBeats.length > 0 && (
                  <div className="flex gap-2 animate-in fade-in slide-in-from-right-4">
                     <button onClick={() => setIsBulkEditing(true)} className="px-4 py-2 bg-white/5 border border-white/10 text-white text-[8px] font-black uppercase tracking-widest hover:bg-white hover:text-black">Edit Pricing</button>
                     <button onClick={handleBulkArchive} className="px-4 py-2 bg-white/5 border border-white/10 text-white text-[8px] font-black uppercase tracking-widest hover:bg-white hover:text-black">Archive</button>
                     <button onClick={() => setSelectedBeats([])} className="p-2 text-white/20 hover:text-white"><X size={14} /></button>
                  </div>
                )}
             </div>
          </div>

          {/* Catalog Table */}
          <div className="border border-white/10 bg-white/[0.01]">
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b border-white/5 text-[8px] font-black uppercase tracking-[0.4em] text-white/20">
                         <th className="p-6 w-12"><input type="checkbox" onChange={(e) => setSelectedBeats(e.target.checked ? beats.map(b => b.id) : [])} className="accent-white" /></th>
                         <th className="p-6">Production</th>
                         <th className="p-6 text-center">BPM / Key</th>
                         <th className="p-6 text-center">Asset Links</th>
                         <th className="p-6 text-center">Pricing</th>
                         <th className="p-6 text-center">Status</th>
                         <th className="p-6 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="text-[10px] font-bold uppercase tracking-widest">
                      {filteredBeats.map(beat => (
                        <tr key={beat.id} className={cn("border-b border-white/5 hover:bg-white/[0.02] transition-colors", selectedBeats.includes(beat.id) && "bg-white/[0.05]")}>
                           <td className="p-6"><input type="checkbox" checked={selectedBeats.includes(beat.id)} onChange={() => toggleSelect(beat.id)} className="accent-white" /></td>
                           <td className="p-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-neutral-900 border border-white/5 overflow-hidden">
                                    <img src={beat.artworkUrl} className="w-full h-full object-cover" alt="" />
                                 </div>
                                 <div className="flex flex-col gap-1">
                                    <span className="text-white">{beat.title}</span>
                                    <span className="text-[8px] text-white/20 tracking-widest">{beat.genre}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="p-6 text-center">
                              <div className="flex flex-col gap-1">
                                 <span className="text-white/60">{beat.bpm}</span>
                                 <span className="text-[8px] text-white/20">{beat.key}</span>
                              </div>
                           </td>
                           <td className="p-6">
                              <div className="flex items-center justify-center gap-2">
                                 <div title="Tagged MP3" className={cn("w-6 h-6 border flex items-center justify-center text-[8px]", beat.audioUrl ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" : "border-white/5 text-white/10")}>MP3</div>
                                 <div title="Untagged M4A" className={cn("w-6 h-6 border flex items-center justify-center text-[8px]", beat.audioUrl ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" : "border-white/5 text-white/10")}>M4A</div>
                                 <div title="Track Stems" className={cn("w-6 h-6 border flex items-center justify-center text-[8px]", beat.stemsUrl ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" : "border-white/5 text-white/10")}>ZIP</div>
                              </div>
                           </td>
                           <td className="p-6 text-center text-white/60">${beat.licenses.basic.price}</td>
                           <td className="p-6 text-center">
                              {beat.published ? (
                                <span className="flex items-center justify-center gap-2 text-emerald-500 text-[8px] font-black">
                                   <Globe size={10} /> PUBLIC
                                </span>
                              ) : (
                                <span className="flex items-center justify-center gap-2 text-white/20 text-[8px] font-black">
                                   <Archive size={10} /> ARCHIVED
                                </span>
                              )}
                           </td>
                           <td className="p-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                 <button onClick={() => { setEditingBeatUrl(beat); setNewValleyUrl(beat.audioUrl || beat.storage?.durableUrl || ''); setUrlError(null); }} title="Replace ValleyFile URL" className="p-3 text-white/40 hover:text-purple-400 transition-colors"><Edit3 size={14} /></button>
                                 <button onClick={() => { if(confirm(`Archive ${beat.title}?`)) removeBeat(beat.id); }} className="p-3 text-white/20 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
             {/* Tag Manager */}
             <div className="space-y-6">
                <h3 className="text-xl font-black uppercase tracking-tighter text-white">Batch Tag Manager</h3>
                <div className="p-8 border border-white/10 bg-white/[0.01] flex flex-col gap-6">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Select Target</label>
                      <select className="w-full bg-white/5 border border-white/10 p-4 text-[10px] font-black uppercase text-white outline-none">
                         <option className="bg-neutral-900">ALL TRACKS</option>
                         <option className="bg-neutral-900">TRAP GENRE</option>
                         <option className="bg-neutral-900">DRILL GENRE</option>
                      </select>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Operation</label>
                      <div className="grid grid-cols-2 gap-4">
                         <button className="p-4 border border-white/10 text-[8px] font-black uppercase text-white hover:bg-white hover:text-black">Add Tag</button>
                         <button className="p-4 border border-white/10 text-[8px] font-black uppercase text-white hover:bg-white hover:text-black">Change Key</button>
                      </div>
                   </div>
                </div>
             </div>

             {/* Asset Checker */}
             <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xl font-black uppercase tracking-tighter text-white">Asset Linker Checklist</h3>
                <div className="p-10 border border-white/10 bg-white/[0.01] grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="flex flex-col gap-6">
                      <div className="flex items-start gap-6">
                         <div className="w-12 h-12 bg-emerald-500 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={24} className="text-black" />
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase text-white">Tagged Masters Live</span>
                            <p className="text-[8px] text-white/40 uppercase tracking-widest leading-relaxed">All 12 storefront tracks have audio tags attached correctly.</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-6">
                         <div className="w-12 h-12 bg-amber-500 flex items-center justify-center shrink-0">
                            <AlertTriangle size={24} className="text-black" />
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase text-white">Missing Stems Detected</span>
                            <p className="text-[8px] text-white/40 uppercase tracking-widest leading-relaxed">3 productions are missing WAV trackouts. Premium tiers disabled.</p>
                         </div>
                      </div>
                   </div>
                   <div className="flex flex-col gap-4">
                      <button className="w-full py-4 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all">Download Audit Report</button>
                      <button className="w-full py-4 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">Fix Missing Assets</button>
                   </div>
                </div>
             </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in duration-500">
           {/* Content ID Whitelist */}
           <div className="lg:col-span-7 space-y-8">
              <div className="flex flex-col gap-4">
                 <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Profile SEO Settings</h3>
                 <p className="text-white/40 text-[10px] uppercase tracking-widest leading-relaxed">Optimize your public profile bio with search terms related to your production style.</p>
              </div>

              <div className="p-10 border border-white/10 bg-white/[0.02] space-y-8">
                 <div className="flex flex-col gap-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Profile Keywords (Comma-separated)</label>
                    <textarea 
                       className="w-full bg-white/5 border border-white/10 p-6 text-[10px] font-bold text-white outline-none focus:border-white/40 h-32"
                       placeholder="E.G. TRAP, HIP HOP, DARK CINEMATIC, BEAT MAKER..."
                    />
                 </div>
                 <button className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest">Save SEO Profile</button>
              </div>

              <div className="flex flex-col gap-4 mt-12">
                 <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Content ID Whitelist</h3>
                 <p className="text-white/40 text-[10px] uppercase tracking-widest leading-relaxed">Manage YouTube channels that are authorized to use your beats without receiving copyright strikes.</p>
              </div>

              <div className="p-10 border border-white/10 bg-white/[0.02] space-y-8">
                 <div className="flex flex-col gap-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Submit Channel URL</label>
                    <div className="flex gap-4">
                       <input 
                         type="text" 
                         placeholder="https://youtube.com/@channel..." 
                         className="flex-1 bg-white/5 border border-white/10 p-4 text-[10px] font-bold text-white outline-none focus:border-white/40"
                       />
                       <button className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest">Whitelist</button>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Authorized Channels</span>
                    {[
                      { name: 'KRAEZELV Main', url: 'youtube.com/kraezelv', date: '2026-01-12' },
                      { name: 'Artist Promotion 24/7', url: 'youtube.com/art-promo', date: '2026-05-22' },
                    ].map(channel => (
                       <div key={channel.url} className="p-4 border border-white/5 flex items-center justify-between">
                          <div className="flex flex-col">
                             <span className="text-[10px] font-bold text-white">{channel.name}</span>
                             <span className="text-[8px] text-white/20 uppercase tracking-widest">{channel.url}</span>
                          </div>
                          <button className="text-red-500/40 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Private Preview Generator */}
           <div className="lg:col-span-5 space-y-8">
              <h3 className="text-xl font-black uppercase tracking-tighter text-white">Private Previewer</h3>
              <div className="p-10 border border-white/10 bg-white/[0.01] flex flex-col gap-8">
                 <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">Generate a secure, temporary link to share unreleased tracks with specific artists or labels.</p>
                 
                 <div className="space-y-6">
                    <div className="flex flex-col gap-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Select Beat</label>
                       <select className="bg-white/5 border border-white/10 p-4 text-white text-[10px] font-black uppercase outline-none">
                          <option className="bg-neutral-900 font-sans">APOLLO (UNRELEASED)</option>
                          <option className="bg-neutral-900 font-sans">VALKYRIE (UNRELEASED)</option>
                       </select>
                    </div>

                    <div className="flex flex-col gap-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Link Expiry</label>
                       <div className="grid grid-cols-3 gap-2">
                          {['24H', '48H', '7D'].map(t => (
                             <button key={t} className="p-3 border border-white/10 text-[8px] font-black uppercase text-white hover:bg-white hover:text-black">{t}</button>
                          ))}
                       </div>
                    </div>
                 </div>

                 <button className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3">
                    <Globe size={14} /> Generate Secure Link
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Bulk Edit Modal Overlay */}
      {isBulkEditing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
           <div className="w-full max-w-md bg-neutral-900 border border-white/10 p-10 flex flex-col gap-8 shadow-2xl">
              <div className="flex justify-between items-center">
                 <h4 className="text-xl font-black uppercase tracking-tighter text-white">Bulk Pricing Editor</h4>
                 <button onClick={() => setIsBulkEditing(false)} className="text-white/20 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-white/40">New Basic Price</label>
                 <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">$</span>
                    <input type="number" className="w-full bg-white/5 border border-white/10 p-4 pl-10 text-white text-xl font-black outline-none focus:border-white/40" defaultValue="29.99" id="bulk-price-input" />
                 </div>
              </div>
              <button 
                onClick={() => {
                  const val = (document.getElementById('bulk-price-input') as HTMLInputElement).value;
                  handleBulkPriceEdit(parseFloat(val));
                }}
                className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-neutral-200 transition-all"
              >
                Apply To {selectedBeats.length} Items
              </button>
           </div>
        </div>
      )}

      {/* Replace ValleyFile URL Modal */}
      {editingBeatUrl && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
           <div className="w-full max-w-lg bg-neutral-950 border border-white/20 p-8 flex flex-col gap-6 shadow-2xl rounded-sm">
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                 <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Audio Storage Control</span>
                    <h4 className="text-xl font-black uppercase text-white mt-1">Replace ValleyFile URL</h4>
                    <p className="text-xs text-white/50 font-bold uppercase truncate max-w-xs">{editingBeatUrl.title}</p>
                 </div>
                 <button onClick={() => setEditingBeatUrl(null)} className="text-white/40 hover:text-white p-1"><X size={20} /></button>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-white/60 block">
                    ValleyFile Direct File URL (MP3 / M4A)
                 </label>
                 <input 
                   type="url"
                   value={newValleyUrl}
                   onChange={(e) => {
                     setNewValleyUrl(e.target.value);
                     setUrlError(null);
                   }}
                   placeholder="https://valleyfile.com/download/beat-master.mp3"
                   className="w-full bg-white/5 border border-white/20 focus:border-purple-500 p-4 text-xs font-mono text-white outline-none transition-colors"
                 />
                 <p className="text-[9px] text-white/40 uppercase font-medium">
                    Paste the direct public link to the audio master hosted on ValleyFile. WAV is strictly prohibited.
                 </p>
              </div>

              {urlError && (
                 <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-sm flex items-center gap-2">
                    <AlertTriangle size={14} /> {urlError}
                 </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                 <button
                   onClick={handleSaveValleyUrl}
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
