import React, { useState, useEffect } from 'react';
import { Award, Disc, ExternalLink, ShieldCheck, Sparkles, Plus, X, Trash2 } from 'lucide-react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export interface PlacementItem {
  id?: string;
  artistName: string;
  songTitle: string;
  albumTitle?: string;
  imageUrl?: string;
  streamUrl?: string;
  releaseYear?: string;
  certifiedStreams?: string;
  verified: boolean;
}

const defaultPlacements: PlacementItem[] = [];

export const PlacementShowcase: React.FC = () => {
  const [placements, setPlacements] = useState<PlacementItem[]>(defaultPlacements);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for owner to add placements
  const [artistName, setArtistName] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [albumTitle, setAlbumTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [releaseYear, setReleaseYear] = useState('2026');
  const [certifiedStreams, setCertifiedStreams] = useState('');

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
    });

    const unsubFirestore = onSnapshot(collection(db, 'placements'), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: PlacementItem[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as PlacementItem));
        setPlacements(loaded);
      }
    }, (err) => {
      console.warn('Firestore placements fallback to local defaults:', err);
    });

    return () => {
      unsubAuth();
      unsubFirestore();
    };
  }, []);

  const handleAddPlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistName || !songTitle) return;

    const newPlacement: PlacementItem = {
      artistName,
      songTitle,
      albumTitle: albumTitle || 'Single Release',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
      streamUrl: streamUrl || 'https://open.spotify.com',
      releaseYear: releaseYear || '2026',
      certifiedStreams: certifiedStreams || 'Documented Release',
      verified: true
    };

    try {
      await addDoc(collection(db, 'placements'), newPlacement);
      setShowAddModal(false);
      setArtistName('');
      setSongTitle('');
      setAlbumTitle('');
      setImageUrl('');
      setStreamUrl('');
      setCertifiedStreams('');
    } catch (err) {
      console.error('Failed to save placement credit to Firestore:', err);
      setPlacements(prev => [...prev, { ...newPlacement, id: Date.now().toString() }]);
      setShowAddModal(false);
    }
  };

  const handleDeletePlacement = async (id?: string) => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'placements', id));
    } catch (err) {
      console.error('Failed to delete placement:', err);
      setPlacements(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <section className="bg-black py-24 border-t border-white/10">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 space-y-12">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-400 text-[10px] font-black uppercase tracking-[0.4em]">
              <ShieldCheck size={14} /> Documented Industry Discography
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tighter">
              VERIFIED PLACEMENTS
            </h2>
            <p className="text-xs text-white/40 uppercase tracking-widest max-w-xl">
              Official major label & independent record placements produced by KRAEZELV.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <Plus size={14} /> Add Verified Placement
            </button>
          )}
        </div>

        {/* PLACEMENT CARDS GRID */}
        {placements.length === 0 ? (
          <div className="py-16 text-center text-white/30 text-xs font-mono uppercase tracking-widest border border-white/5 bg-white/[0.01]">
            No documented placements added yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {placements.map((item) => (
              <div 
                key={item.id}
                className="group relative bg-neutral-950 border border-white/10 hover:border-purple-500/50 p-6 flex flex-col gap-6 transition-all duration-500 overflow-hidden"
              >
                <div className="relative aspect-square w-full bg-neutral-900 border border-white/10 overflow-hidden">
                  <img 
                    src={item.imageUrl} 
                    alt={item.songTitle}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-white/20 px-2.5 py-1 text-[8px] font-black uppercase text-purple-400 tracking-widest flex items-center gap-1">
                    <ShieldCheck size={10} /> Verified Credit
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeletePlacement(item.id)}
                      className="absolute top-3 right-3 p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                      title="Delete Placement"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest block">
                    {item.releaseYear} · {item.certifiedStreams}
                  </span>
                  <h3 className="text-xl font-black uppercase text-white tracking-tight truncate group-hover:text-purple-300 transition-colors">
                    {item.songTitle}
                  </h3>
                  <p className="text-xs font-bold uppercase text-white/60 tracking-wider">
                    {item.artistName}
                  </p>
                  {item.albumTitle && (
                    <span className="text-[9px] text-white/30 font-mono uppercase tracking-widest block truncate">
                      Album: {item.albumTitle}
                    </span>
                  )}
                </div>

                {item.streamUrl && (
                  <a
                    href={item.streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-white/5 hover:bg-white text-white hover:text-black font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer"
                  >
                    <ExternalLink size={12} /> Stream Official Release
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* OWNER ADD MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
            <div className="bg-black border border-white/20 p-8 max-w-lg w-full space-y-6 relative shadow-2xl">
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-400">Owner Discography Portal</span>
                <h3 className="text-2xl font-black uppercase text-white tracking-tight">Add Verified Placement</h3>
              </div>

              <form onSubmit={handleAddPlacement} className="space-y-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">Artist Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="e.g. Major Artist"
                    className="w-full bg-neutral-900 border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">Song Title *</label>
                  <input 
                    type="text" 
                    required 
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    placeholder="e.g. Midnight Drive"
                    className="w-full bg-neutral-900 border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">Album / Project</label>
                    <input 
                      type="text" 
                      value={albumTitle}
                      onChange={(e) => setAlbumTitle(e.target.value)}
                      placeholder="e.g. Dark Nights LP"
                      className="w-full bg-neutral-900 border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">Release Year</label>
                    <input 
                      type="text" 
                      value={releaseYear}
                      onChange={(e) => setReleaseYear(e.target.value)}
                      placeholder="e.g. 2026"
                      className="w-full bg-neutral-900 border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">Artwork Image URL</label>
                  <input 
                    type="url" 
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-neutral-900 border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">Streaming Link</label>
                  <input 
                    type="url" 
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    placeholder="https://open.spotify.com/..."
                    className="w-full bg-neutral-900 border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">Streams / Certification Note</label>
                  <input 
                    type="text" 
                    value={certifiedStreams}
                    onChange={(e) => setCertifiedStreams(e.target.value)}
                    placeholder="e.g. 1.2M+ Spotify Streams"
                    className="w-full bg-neutral-900 border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  SAVE PLACEMENT CREDIT
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
