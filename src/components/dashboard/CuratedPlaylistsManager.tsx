import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Edit3, Star, Check, Sparkles, X, MoveUp, MoveDown } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';

export interface CuratedCollectionItem {
  id?: string;
  title: string;
  description?: string;
  coverUrl?: string;
  beatIds: string[];
  featured: boolean;
  displayOrder: number;
  createdAt: string;
}

export const CuratedPlaylistsManager: React.FC = () => {
  const { beats } = useBeatCatalogStore();
  const [collectionsList, setCollectionsList] = useState<CuratedCollectionItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [selectedBeatIds, setSelectedBeatIds] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'curated_collections'), (snapshot) => {
      if (!snapshot.empty) {
        const items: CuratedCollectionItem[] = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        } as CuratedCollectionItem));
        items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        setCollectionsList(items);
      }
    }, (err) => {
      console.warn('Curated collections fallback:', err);
    });

    return () => unsub();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setCoverUrl('');
    setSelectedBeatIds([]);
    setFeatured(false);
    setShowModal(true);
  };

  const openEditModal = (col: CuratedCollectionItem) => {
    setEditingId(col.id || null);
    setTitle(col.title);
    setDescription(col.description || '');
    setCoverUrl(col.coverUrl || '');
    setSelectedBeatIds(col.beatIds || []);
    setFeatured(col.featured || false);
    setShowModal(true);
  };

  const handleToggleBeat = (beatId: string) => {
    setSelectedBeatIds(prev => 
      prev.includes(beatId) ? prev.filter(id => id !== beatId) : [...prev, beatId]
    );
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const payload: CuratedCollectionItem = {
      title,
      description,
      coverUrl: coverUrl || (beats[0]?.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80'),
      beatIds: selectedBeatIds,
      featured,
      displayOrder: editingId ? (collectionsList.find(c => c.id === editingId)?.displayOrder || 0) : collectionsList.length,
      createdAt: new Date().toISOString()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'curated_collections', editingId), payload as any);
      } else {
        await addDoc(collection(db, 'curated_collections'), payload);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error saving curated collection:', err);
      if (!editingId) {
        setCollectionsList(prev => [...prev, { ...payload, id: Date.now().toString() }]);
      }
      setShowModal(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'curated_collections', id));
    } catch (err) {
      console.error('Error deleting collection:', err);
      setCollectionsList(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="flex flex-col gap-8 bg-neutral-950 p-8 border border-white/10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <h3 className="text-2xl font-black uppercase text-white tracking-tight flex items-center gap-3">
            <Layers size={22} className="text-purple-400" />
            Curated Playlists & Collections Manager
          </h3>
          <p className="text-xs text-white/40 uppercase tracking-widest mt-1">
            Create, edit, reorder, and feature custom beat playlists for public storefront discovery.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-6 py-3.5 bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <Plus size={14} /> New Playlist Collection
        </button>
      </div>

      {/* COLLECTIONS LIST */}
      {collectionsList.length === 0 ? (
        <div className="py-12 text-center text-white/30 text-xs font-mono uppercase tracking-widest border border-white/5 bg-black/40">
          No curated playlists created. Click "New Playlist Collection" to publish your first playlist.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collectionsList.map((col) => (
            <div 
              key={col.id}
              className="p-6 bg-black border border-white/10 hover:border-purple-500/40 flex flex-col justify-between gap-6 relative group transition-all"
            >
              <div className="flex items-start gap-4">
                <img 
                  src={col.coverUrl} 
                  alt={col.title}
                  className="w-20 h-20 object-cover border border-white/10 shrink-0 grayscale group-hover:grayscale-0 transition-all"
                />
                <div className="space-y-1 min-w-0 flex-1">
                  {col.featured && (
                    <span className="text-[8px] font-black uppercase tracking-widest text-purple-400 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 inline-flex items-center gap-1">
                      <Star size={8} fill="currentColor" /> Featured
                    </span>
                  )}
                  <h4 className="text-lg font-black uppercase text-white tracking-tight truncate">
                    {col.title}
                  </h4>
                  <p className="text-[10px] text-white/40 line-clamp-2">
                    {col.description || 'No description provided.'}
                  </p>
                  <span className="text-[9px] font-mono text-purple-300 uppercase tracking-widest block pt-1">
                    {col.beatIds?.length || 0} Beats Selected
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <button
                  onClick={() => openEditModal(col)}
                  className="px-4 py-2 bg-white/5 hover:bg-white text-white hover:text-black font-black text-[9px] uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer border border-white/10"
                >
                  <Edit3 size={12} /> Edit Playlist
                </button>

                <button
                  onClick={() => handleDelete(col.id)}
                  className="p-2 text-white/30 hover:text-red-400 transition-colors cursor-pointer"
                  title="Delete Collection"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
          <div className="bg-black border border-white/20 p-8 max-w-2xl w-full space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-400">Curator Workspace</span>
              <h3 className="text-2xl font-black uppercase text-white tracking-tight">
                {editingId ? 'Edit Playlist Collection' : 'New Playlist Collection'}
              </h3>
            </div>

            <form onSubmit={handleSaveCollection} className="space-y-4">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">Playlist Title *</label>
                <input 
                  type="text" 
                  required 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dark UK Drill Bangers"
                  className="w-full bg-neutral-900 border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">Description</label>
                <textarea 
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Curated selection of aggressive, heavy 808 instrumentals..."
                  className="w-full bg-neutral-900 border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">Cover Artwork URL</label>
                <input 
                  type="url" 
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-neutral-900 border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox"
                  id="featured-check"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 accent-purple-500 cursor-pointer"
                />
                <label htmlFor="featured-check" className="text-xs font-bold uppercase tracking-widest text-white cursor-pointer">
                  Feature prominently on Home Discovery
                </label>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <label className="text-[9px] font-bold uppercase tracking-widest text-purple-400 block">
                  Select Beats for Playlist ({selectedBeatIds.length} Selected)
                </label>
                <div className="max-h-48 overflow-y-auto border border-white/10 bg-neutral-900 p-2 divide-y divide-white/5">
                  {beats.map(beat => {
                    const isSelected = selectedBeatIds.includes(beat.id);
                    return (
                      <div 
                        key={beat.id}
                        onClick={() => handleToggleBeat(beat.id)}
                        className={`p-3 flex items-center justify-between text-xs cursor-pointer hover:bg-white/5 transition-colors ${
                          isSelected ? 'bg-purple-950/40 text-purple-300' : 'text-white/70'
                        }`}
                      >
                        <span className="font-bold uppercase tracking-wider truncate max-w-sm">{beat.title} ({beat.genre} · {beat.bpm} BPM)</span>
                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-purple-600 border-purple-400 text-white' : 'border-white/20'}`}>
                          {isSelected && <Check size={12} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                SAVE PLAYLIST COLLECTION
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
