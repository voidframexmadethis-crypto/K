import React, { useState } from 'react';
import { useBeatPackStore } from '../../store/useBeatPackStore';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { validateStorageUrl, createPackStorageMetadata } from '../../lib/storageEngine';
import { BeatPack, Beat } from '../../types';
import { 
  Archive, CheckCircle, AlertTriangle, Layers, DollarSign, 
  Image as ImageIcon, Sparkles, Plus, Copy, Edit3, Trash2, Download, ExternalLink, Globe
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const BeatPackUploader = () => {
  const { packs, addPack, removePack, updatePack } = useBeatPackStore();
  const { beats, addBeat, updateBeat: updateCatalogBeat, removeBeat: removeCatalogBeat } = useBeatCatalogStore();

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

  const handleCreatePack = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!title.trim()) {
      setStatusMessage({ type: 'error', text: 'Please provide a title for the Beat Pack.' });
      return;
    }

    if (!zipUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'Please paste the Internet Archive File URL.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanZip = zipUrl.trim();
      const packPrice = parseFloat(price) || 99.99;
      const cleanArtwork = artworkUrl.trim() || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80';

      const newPack: BeatPack = {
        id: `pack_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: title.trim(),
        description: description.trim(),
        price: packPrice,
        artworkUrl: cleanArtwork,
        beatIds: selectedBeatIds,
        downloadUrl: cleanZip,
        zipUrl: cleanZip,
        storage: {
          provider: 'custom',
          durableUrl: cleanZip,
          fileType: 'zip',
          uploadedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
      };

      // 1. Add to Beat Pack Store (synchronous local cache + Firestore beat_packs)
      await addPack(newPack);

      // 2. Add to Unified Catalog Store (so Admin Songs/Catalog & Storefront see the record)
      const packBeatRecord: Beat = {
        id: newPack.id,
        idempotencyKey: `pack_key_${newPack.id}`,
        title: `[BEAT PACK] ${newPack.title}`,
        producerId: 'KRAEZELV',
        bpm: 140,
        key: 'Multi-Key',
        genre: 'Beat Pack',
        subgenre: 'Sound Kit / Bundle',
        tags: ['BEAT PACK', 'BUNDLE', 'ZIP'],
        moods: ['Energetic'],
        description: newPack.description,
        slug: newPack.title.toLowerCase().replace(/\s+/g, '-'),
        isPrivate: false,
        isBootleg: false,
        instruments: [],
        audioUrl: cleanZip,
        stemsUrl: cleanZip,
        artworkUrl: cleanArtwork,
        isFree: false,
        freeDownloadEnabled: false,
        freeDownloadEmailRequired: false,
        freeDownloadType: 'none',
        beehiivFormUrl: '',
        playsCount: 0,
        licenses: {
          basic: { price: packPrice, enabled: true },
          premium: { price: packPrice, enabled: false },
          unlimited: { price: packPrice, enabled: false },
          exclusive: { price: packPrice, enabled: false },
        },
        storage: {
          provider: 'custom',
          durableUrl: cleanZip,
          fileUrl: cleanZip,
          audioUrl: cleanZip,
          artworkUrl: cleanArtwork,
          stemsUrl: cleanZip,
          uploadedAt: new Date().toISOString(),
        },
        createdAt: newPack.createdAt,
        published: true,
      };

      await addBeat(packBeatRecord);

      setStatusMessage({ type: 'success', text: 'Beat Pack published successfully to catalog with Internet Archive URL!' });
      setTitle('');
      setDescription('');
      setZipUrl('');
      setSelectedBeatIds([]);
    } catch (err: any) {
      console.error('[BEAT_PACK_UPLOAD_ERROR]', err);
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to create Beat Pack.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePackUrl = async () => {
    if (!editingPack) return;
    if (!editZipUrl.trim()) {
      setEditError('Please provide an Internet Archive File URL');
      return;
    }

    try {
      const cleanUrl = editZipUrl.trim();
      await updatePack(editingPack.id, {
        downloadUrl: cleanUrl,
        zipUrl: cleanUrl,
        storage: {
          provider: 'custom',
          durableUrl: cleanUrl,
          fileType: 'zip',
          uploadedAt: new Date().toISOString(),
        },
      });

      await updateCatalogBeat(editingPack.id, {
        audioUrl: cleanUrl,
        stemsUrl: cleanUrl,
        storage: {
          provider: 'custom',
          durableUrl: cleanUrl,
          fileUrl: cleanUrl,
          audioUrl: cleanUrl,
          artworkUrl: editingPack.artworkUrl,
          stemsUrl: cleanUrl,
          uploadedAt: new Date().toISOString(),
        }
      });

      setEditingPack(null);
      setEditZipUrl('');
      setEditError(null);
    } catch (err: any) {
      setEditError(err?.message || 'Failed to update URL');
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
            Publish Complete Trackout Bundles with Direct Audio Storage
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
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Direct File Upload</span>
        </div>

        {/* Automatic Persistent Storage Info */}
        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-sm flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-purple-300">
            <Sparkles size={14} /> Automatic Persistent Storage
          </div>
          <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">
            Files stream directly to persistent cloud storage
          </span>
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

        {/* FILE UPLOAD STEP */}
        <div className="p-6 bg-white/[0.02] border border-white/10 rounded-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Pack Archive (.ZIP) *</span>
              <h4 className="text-lg font-black text-white uppercase">Upload Pack Archive File</h4>
            </div>
            <Archive size={24} className="text-white/40" />
          </div>

          <div className="space-y-4">
            <label className="block w-full cursor-pointer">
              <div className="p-6 border-2 border-dashed border-white/20 hover:border-purple-500 bg-white/5 rounded-sm flex flex-col items-center justify-center gap-2 transition-all">
                <Archive size={24} className="text-purple-400" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Choose Beat Pack (.ZIP) File
                </span>
                {zipUrl && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold truncate max-w-xs">
                    File Attached & Saved
                  </span>
                )}
              </div>
              <input 
                type="file"
                accept=".zip,application/zip,application/x-zip-compressed"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const res = await fetch(`/api/storage/upload?category=stems&filename=${encodeURIComponent(file.name)}`, {
                      method: 'POST',
                      body: file
                    });
                    const data = await res.json();
                    if (data.url) {
                      setZipUrl(data.url);
                    }
                  } catch (err: any) {
                    alert('Upload failed: ' + (err?.message || err));
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* COVER ARTWORK */}
        <div className="p-6 bg-white/[0.02] border border-white/10 rounded-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Cover Artwork *</span>
              <h4 className="text-lg font-black text-white uppercase">Upload Cover Image</h4>
            </div>
            <ImageIcon size={24} className="text-white/40" />
          </div>

          <div className="space-y-2">
            <label className="block w-full cursor-pointer">
              <div className="p-4 border border-white/15 hover:border-purple-500 bg-white/5 rounded-sm flex items-center justify-center gap-2 transition-all">
                <ImageIcon size={16} className="text-purple-400" />
                <span className="text-[10px] font-black uppercase tracking-wider text-white">
                  Choose Cover Image File
                </span>
              </div>
              <input 
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const res = await fetch(`/api/storage/upload?category=artwork&filename=${encodeURIComponent(file.name)}`, {
                      method: 'POST',
                      body: file
                    });
                    const data = await res.json();
                    if (data.url) {
                      setArtworkUrl(data.url);
                    }
                  } catch (err: any) {
                    alert('Upload failed: ' + (err?.message || err));
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
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
          {isSubmitting ? 'Saving Pack...' : 'Save Pack'}
        </button>
      </form>

      {/* Active Beat Packs List */}
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
            {packs.map((pack) => {
              const packUrl = pack.storage?.durableUrl || pack.zipUrl || pack.downloadUrl || '';
              return (
                <div key={pack.id} className="p-6 bg-white/[0.02] border border-white/10 rounded-sm space-y-4">
                  <div className="flex items-center gap-4">
                    <img src={pack.artworkUrl} alt={pack.title} className="w-16 h-16 object-cover bg-neutral-900 border border-white/10 rounded-xs" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-black text-white uppercase truncate">{pack.title}</h4>
                      <span className="text-emerald-400 text-xs font-mono font-bold">${pack.price}</span>
                    </div>
                  </div>

                  {/* Internet Archive Pack File Display */}
                  <div className="p-3 bg-black/40 border border-white/5 rounded-xs space-y-2 text-[10px] font-mono">
                    <div className="flex items-center justify-between text-white/60">
                      <span className="font-bold text-white uppercase">Internet Archive Pack File</span>
                      <span className="text-emerald-400 font-bold">✓ Saved</span>
                    </div>
                    <div className="text-white/70 truncate text-[9px] bg-white/5 p-1.5 rounded-xs">
                      {packUrl || 'No URL stored'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    {packUrl ? (
                      <a 
                        href={packUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 bg-white text-black hover:bg-purple-600 hover:text-white text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 rounded-xs"
                      >
                        <ExternalLink size={12} /> Open Pack
                      </a>
                    ) : null}

                    <button 
                      onClick={() => {
                        setEditingPack(pack);
                        setEditZipUrl(packUrl);
                        setEditError(null);
                      }}
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 rounded-xs"
                    >
                      <Edit3 size={12} /> Edit URL
                    </button>

                    <button 
                      onClick={() => {
                        if (confirm(`Delete beat pack "${pack.title}"?`)) {
                          removePack(pack.id);
                          removeCatalogBeat(pack.id);
                        }
                      }}
                      className="p-2.5 text-white/30 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Pack URL Modal */}
      {editingPack && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-neutral-950 border border-white/20 p-8 flex flex-col gap-6 shadow-2xl rounded-sm">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Pack Storage Control</span>
                <h4 className="text-xl font-black uppercase text-white mt-1">Edit Internet Archive File URL</h4>
                <p className="text-xs text-white/50 font-bold uppercase truncate max-w-xs">{editingPack.title}</p>
              </div>
              <button onClick={() => setEditingPack(null)} className="text-white/40 hover:text-white p-1">✕</button>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/60 block">
                Paste Internet Archive File URL
              </label>
              <input 
                type="url"
                value={editZipUrl}
                onChange={(e) => {
                  setEditZipUrl(e.target.value);
                  setEditError(null);
                }}
                placeholder="https://archive.org/details/..."
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
                Save Pack
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
