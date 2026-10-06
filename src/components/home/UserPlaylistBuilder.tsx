import React, { useState } from 'react';
import { Layers, Plus, Play, Trash2, Clock, Music, FolderPlus, Check, X } from 'lucide-react';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { useAudioStore } from '../../store/useAudioStore';
import { useUserPreferencesStore } from '../../store/useUserPreferencesStore';
import { cn } from '../../lib/utils';

export const UserPlaylistBuilder: React.FC = () => {
  const { beats } = useBeatCatalogStore();
  const { setBeat, setQueue } = useAudioStore();
  const { playlists, createPlaylist, removeFromPlaylist, deletePlaylist } = useUserPreferencesStore();
  
  const [activePlaylistId, setActivePlaylistId] = useState<string>(playlists[0]?.id || 'my_next_project');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const activePlaylist = playlists.find(p => p.id === activePlaylistId) || playlists[0];
  const playlistBeats = beats.filter(b => activePlaylist?.beatIds.includes(b.id));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const created = createPlaylist(newPlaylistName);
    setActivePlaylistId(created.id);
    setNewPlaylistName('');
    setShowCreateModal(false);
  };

  const playEntirePlaylist = () => {
    if (playlistBeats.length === 0) return;
    setQueue(playlistBeats);
    setBeat(playlistBeats[0]);
  };

  return (
    <section className="bg-black py-20 border-b border-white/10 relative">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 space-y-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-400 flex items-center gap-2">
              <Layers size={12} /> PERSONAL PROJECT COMPOSER
            </span>
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter">
              PLAYLIST EXPERIENCE
            </h2>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-white/10 border border-white/20 text-white hover:bg-white hover:text-black font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <FolderPlus size={14} /> NEW PROJECT PLAYLIST
          </button>
        </div>

        {/* PLAYLIST TABS MATRIX */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar border-b border-white/10">
          {playlists.map(pl => {
            const isSelected = pl.id === activePlaylistId;
            const count = beats.filter(b => pl.beatIds.includes(b.id)).length;
            return (
              <button
                key={pl.id}
                onClick={() => setActivePlaylistId(pl.id)}
                className={cn(
                  "px-6 py-3.5 border text-xs font-black uppercase tracking-[0.25em] transition-all shrink-0 flex items-center gap-3 cursor-pointer",
                  isSelected 
                    ? "bg-white text-black border-white shadow-xl" 
                    : "bg-white/[0.02] border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <span>{pl.name}</span>
                <span className={cn(
                  "px-2 py-0.5 text-[9px] font-mono rounded-xs font-bold",
                  isSelected ? "bg-black text-white" : "bg-white/10 text-white/60"
                )}>
                  {count} BEATS
                </span>
              </button>
            );
          })}
        </div>

        {/* ACTIVE PLAYLIST HEADER & TRACK LIST */}
        {activePlaylist && (
          <div className="bg-neutral-950 border border-white/10 p-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-6">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                  {activePlaylist.name}
                </h3>
                <p className="text-xs text-white/50 font-mono uppercase tracking-widest mt-1">
                  {playlistBeats.length} TRACKS CURATED · NO ACCOUNT REQUIRED
                </p>
              </div>

              {playlistBeats.length > 0 && (
                <button
                  onClick={playEntirePlaylist}
                  className="px-8 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center gap-2 cursor-pointer shadow-xl shrink-0"
                >
                  <Play size={14} className="ml-0.5" /> PLAY PROJECT QUEUE
                </button>
              )}
            </div>

            {playlistBeats.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-white/10 bg-white/[0.01] space-y-3">
                <Music size={28} className="mx-auto text-white/20" />
                <p className="text-xs font-mono text-white/40 uppercase tracking-widest">
                  Your project playlist is empty. Browse the catalog and click "+ Add to Playlist" on any beat to build your lineup.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5 border border-white/10">
                {playlistBeats.map((beat, idx) => (
                  <div 
                    key={beat.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-xs font-mono text-white/30 font-bold w-6">{idx + 1}</span>
                      <img src={beat.artworkUrl} alt={beat.title} className="w-10 h-10 object-cover border border-white/10 shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-sm font-black uppercase tracking-tight text-white group-hover:text-purple-300 transition-colors truncate">
                          {beat.title}
                        </h4>
                        <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                          {beat.bpm} BPM · {beat.key} · {beat.genre}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => setBeat(beat)}
                        className="p-2.5 bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-all text-white cursor-pointer"
                        title="Play Track"
                      >
                        <Play size={12} />
                      </button>
                      <button
                        onClick={() => removeFromPlaylist(activePlaylist.id, beat.id)}
                        className="p-2.5 text-white/30 hover:text-red-400 transition-colors cursor-pointer"
                        title="Remove from playlist"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* CREATE PLAYLIST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
          <div className="bg-neutral-950 border border-white/20 p-8 max-w-md w-full space-y-6 relative shadow-2xl">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-400">PROJECT BUILDER</span>
              <h3 className="text-2xl font-black uppercase text-white tracking-tight">Create New Playlist</h3>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 block">
                  Playlist Title
                </label>
                <input 
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="e.g. 2026 EP DEMOS"
                  className="w-full bg-white/5 border border-white/15 px-4 py-3 text-xs font-mono text-white outline-none focus:border-purple-500 uppercase tracking-widest"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.25em] text-xs hover:bg-neutral-200 transition-all cursor-pointer"
              >
                Create Playlist
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
