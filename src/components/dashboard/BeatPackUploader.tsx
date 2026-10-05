import React, { useState } from 'react';
import { useBeatPackStore } from '../../store/useBeatPackStore';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { validateValleyFileUrl, createValleyFilePackStorageMetadata } from '../../lib/storageEngine';
import { BeatPack } from '../../types';
import { 
  Archive, CheckCircle, AlertTriangle, Layers, DollarSign, 
  Image as ImageIcon, Sparkles, Plus, Copy, Edit3, Trash2, Download
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const BeatPackUploader = () => {
  const { packs, addPack, removePack, updatePack } = useBeatPackStore();
  const { beats } = useBeatCatalogStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('99.99');
  const [artworkUrl, setArtworkUrl] = useState('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80');
  const [zipUrl, setZipUrl] = useState('');
  const [selectedBeatIds, setSelectedBeatIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Pack Modal State
  const [editingPack, setEditingPack] = useState<BeatPack | null>(null);
  const [editZipUrl, setEditZipUrl] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const zipValidation = validateValleyFileUrl(zipUrl, 'pack');

  const handleCreatePack = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!title.trim()) {
      setStatusMessage({ type: 'error', text: 'Please provide a title for the Beat Pack.' });
      return;
    }

    if (!zipUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter the ValleyFile ZIP File URL.' });
      return;
    }

    const check = validateValleyFileUrl(zipUrl, 'pack');
    if (!check.valid) {
      setStatusMessage({ type: 'error', text: check.error || 'Invalid ValleyFile ZIP URL.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanZip = zipUrl.trim();
      const newPack: BeatPack = {
        id: `pack_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price) || 99.99,
        artworkUrl: artworkUrl.trim(),
        beatIds: selectedBeatIds,
        downloadUrl: cleanZip,
        zipUrl: cleanZip,
        storage: {
          provider: 'valleyfile',
          durableUrl: cleanZip,
          fileType: 'zip',
          uploadedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
      };

      await addPack(newPack);
      setStatusMessage({ type: 'success', text: 'Beat Pack published successfully with ValleyFile ZIP attachment!' });
      setTitle('');
      setDescription('');
      setZipUrl('');
      setSelectedBeatIds([]);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to create Beat Pack.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePackUrl = async () => {
    if (!editingPack) return;
    const check = validateValleyFileUrl(editZipUrl, 'pack');
    if (!check.valid) {
      setEditError(check.error || 'Invalid ZIP URL');
      return;
    }

    try {
      const cleanUrl = editZipUrl.trim();
      await updatePack(editingPack.id, {
        downloadUrl: cleanUrl,
        zipUrl: cleanUrl,
        storage: {
          provider: 'valleyfile',
          durableUrl: cleanUrl,
          fileType: 'zip',
          uploadedAt: new Date().toISOString(),
        },
      });
      setEditingPack(null);
      setEditZipUrl('');
      setEditError(null);
    } catch (err: any) {
      setEditError(err?.message || 'Failed to update ZIP URL');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 md:px-8 text-white space-y-12">
      {/* Header */}
      <div className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 text-purple-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">
            <Sparkles size={14} /> Multi-Track Bundler
          </div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            Beat Pack Uploader
          </h2>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">
            Publish Complete Trackout Bundles & Sound Kits via ValleyFile
          </p>
        </div>
      </div>

      {/* Creation Form */}
      <form onSubmit={handleCreatePack} className="p-8 bg-neutral-950 border border-white/10 rounded-sm space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Archive size={18} className="text-purple-400" />
            <h3 className="text-2xl font-black uppercase text-white tracking-tight">Create New Beat Pack</h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">ValleyFile ZIP Attached</span>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-purple-300">
            <Sparkles size={14} /> ValleyFile ZIP Workflow
          </div>
          <p className="text-[11px] text-white/70 leading-relaxed font-medium">
            1. Create the multi-track ZIP pack on your device.<br />
            2. Upload the ZIP manually to <span className="text-white font-bold">ValleyFile</span>.<br />
            3. Copy the public/direct ValleyFile link.<br />
            4. Paste that link below into the <span className="text-white font-bold">VALLEYFILE ZIP FILE URL</span> field.<br />
            5. The store will permanently save the URL in Firestore and attach it to customer download deliveries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/60 block">Pack Title *</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. VALKYRIE DRILL VOL. 1 (5 TRACK BUNDLE)"
              className="w-full bg-white/5 border border-white/15 p-4 text-xs font-bold text-white outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/60 block">Bundle Price ($ USD) *</label>
            <input 
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="99.99"
              className="w-full bg-white/5 border border-white/15 p-4 text-xs font-bold text-white outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/60 block">Pack Description</label>
          <textarea 
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details on trackouts, BPMs, key signatures, and included sound kits..."
            className="w-full bg-white/5 border border-white/15 p-4 text-xs font-bold text-white outline-none focus:border-purple-500 transition-colors resize-none"
          />
        </div>

        {/* VALLEYFILE ZIP FILE URL CARD */}
        <div className="p-6 bg-white/[0.02] border border-white/10 rounded-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Durable Archive Attachment *</span>
              <h4 className="text-lg font-black text-white uppercase">VALLEYFILE ZIP FILE URL</h4>
            </div>
            <Archive size={24} className="text-white/40" />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/60 block">
                VALLEYFILE ZIP FILE URL *
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="url"
                  value={zipUrl}
                  onChange={(e) => setZipUrl(e.target.value)}
                  placeholder="[ Paste ValleyFile ZIP URL here ]"
                  className="flex-1 bg-white/5 border border-white/20 focus:border-purple-500 p-3 text-xs font-mono text-white outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!zipUrl) {
                      alert('Please enter a ValleyFile ZIP URL first.');
                      return;
                    }
                    const check = validateValleyFileUrl(zipUrl, 'pack');
                    if (check.valid) {
                      alert(`✓ ValleyFile ZIP URL saved\nFile type: ZIP\nStorage provider: ValleyFile`);
                    } else {
                      alert(`Validation Error: ${check.error}`);
                    }
                  }}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white text-[9px] font-black uppercase tracking-widest transition-colors rounded-sm shrink-0"
                >
                  Validate URL
                </button>
              </div>
            </div>

            {/* Validation State Display */}
            <div className="text-[10px] font-mono">
              {zipUrl ? (
                zipValidation.valid ? (
                  <div className="space-y-2 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-sm">
                    <div className="flex items-center justify-between text-emerald-400 font-bold uppercase">
                      <span className="flex items-center gap-1.5"><CheckCircle size={14} /> ✓ ValleyFile ZIP URL saved</span>
                      <span className="text-[9px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-xs">Verified</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[9px] text-white/70 border-t border-emerald-500/20 pt-2">
                      <div>File type: <span className="text-white font-bold">ZIP</span></div>
                      <div>Storage provider: <span className="text-white font-bold">ValleyFile</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-sm flex items-center gap-2 font-bold uppercase">
                    <AlertTriangle size={14} /> {zipValidation.error}
                  </div>
                )
              ) : (
                <span className="text-white/40 uppercase">
                  ○ Paste your ValleyFile .ZIP pack download URL above
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Artwork Image URL */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/60 block">Cover Artwork URL</label>
          <input 
            type="url"
            value={artworkUrl}
            onChange={(e) => setArtworkUrl(e.target.value)}
            placeholder="https://images.unsplash.com/... or ValleyFile image link"
            className="w-full bg-white/5 border border-white/15 p-4 text-xs font-mono text-white outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {statusMessage && (
          <div className={cn(
            "p-4 rounded-sm text-xs font-mono flex items-center gap-2",
            statusMessage.type === 'success' ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border border-red-500/30 text-red-400"
          )}>
            {statusMessage.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
            {statusMessage.text}
          </div>
        )}

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-[0.25em] text-xs transition-all active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? 'Publishing Beat Pack...' : 'Publish Beat Pack to Store'}
        </button>
      </form>

      {/* Existing Beat Packs List */}
      <div className="p-8 bg-neutral-950 border border-white/10 rounded-sm space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-2xl font-black uppercase text-white tracking-tight">Active Beat Packs</h3>
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{packs.length} Published</span>
        </div>

        {packs.length === 0 ? (
          <div className="p-12 text-center text-white/40 text-xs font-mono uppercase tracking-widest">
            No beat packs published yet. Use the form above to add your first pack.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packs.map((pack) => (
              <div key={pack.id} className="p-6 bg-white/[0.02] border border-white/10 rounded-sm space-y-4">
                <div className="flex items-center gap-4">
                  <img src={pack.artworkUrl} alt={pack.title} className="w-16 h-16 object-cover bg-neutral-900 border border-white/10 rounded-xs" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-black text-white uppercase truncate">{pack.title}</h4>
                    <span className="text-emerald-400 text-xs font-mono font-bold">${pack.price}</span>
                  </div>
                </div>

                {/* Stored ValleyFile URL Info */}
                <div className="p-3 bg-black/40 border border-white/5 rounded-xs space-y-2 text-[10px] font-mono">
                  <div className="flex items-center justify-between text-white/60">
                    <span>ValleyFile ZIP Link:</span>
                    <span className="text-emerald-400 font-bold">✓ Attached</span>
                  </div>
                  <div className="text-white/80 truncate text-[9px] bg-white/5 p-1.5 rounded-xs">
                    {pack.storage?.durableUrl || pack.zipUrl || pack.downloadUrl || 'No URL stored'}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <button 
                    onClick={() => {
                      const url = pack.storage?.durableUrl || pack.zipUrl || pack.downloadUrl || '';
                      if (url) {
                        navigator.clipboard.writeText(url);
                        alert('ValleyFile ZIP URL copied to clipboard');
                      }
                    }}
                    className="flex-1 py-2 bg-white/10 hover:bg-white text-white hover:text-black text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 rounded-xs"
                  >
                    <Copy size={12} /> Copy URL
                  </button>

                  <button 
                    onClick={() => {
                      setEditingPack(pack);
                      setEditZipUrl(pack.storage?.durableUrl || pack.zipUrl || pack.downloadUrl || '');
                      setEditError(null);
                    }}
                    className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 rounded-xs"
                  >
                    <Edit3 size={12} /> Replace URL
                  </button>

                  <button 
                    onClick={() => {
                      if (confirm(`Delete beat pack "${pack.title}"?`)) {
                        removePack(pack.id);
                      }
                    }}
                    className="p-2 text-white/30 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Replace Pack ZIP URL Modal */}
      {editingPack && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-neutral-950 border border-white/20 p-8 flex flex-col gap-6 shadow-2xl rounded-sm">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Pack Storage Control</span>
                <h4 className="text-xl font-black uppercase text-white mt-1">Replace ValleyFile ZIP URL</h4>
                <p className="text-xs text-white/50 font-bold uppercase truncate max-w-xs">{editingPack.title}</p>
              </div>
              <button onClick={() => setEditingPack(null)} className="text-white/40 hover:text-white p-1">✕</button>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/60 block">
                VALLEYFILE ZIP FILE URL
              </label>
              <input 
                type="url"
                value={editZipUrl}
                onChange={(e) => {
                  setEditZipUrl(e.target.value);
                  setEditError(null);
                }}
                placeholder="[ Paste ValleyFile ZIP URL here ]"
                className="w-full bg-white/5 border border-white/20 focus:border-purple-500 p-4 text-xs font-mono text-white outline-none transition-colors"
              />
            </div>

            {editError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-sm flex items-center gap-2">
                <AlertTriangle size={14} /> {editError}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleUpdatePackUrl}
                className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                Save & Update ZIP URL
              </button>
              <button
                onClick={() => setEditingPack(null)}
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
