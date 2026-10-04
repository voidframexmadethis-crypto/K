import React, { useState } from 'react';
import { useAudioStore } from '../../store/useAudioStore';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { 
  Trash2, 
  Disc, 
  ListX, 
  VolumeX, 
  CheckCircle2, 
  AlertCircle, 
  Music, 
  Search, 
  Radio, 
  EyeOff, 
  Eye,
  RefreshCw
} from 'lucide-react';

export const RemoveBeatsFromPlayer = () => {
  const { 
    currentBeat, 
    queue, 
    removeFromQueue, 
    clearQueue, 
    setPlaying 
  } = useAudioStore();

  const { beats, removeBeat } = useBeatCatalogStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [removedAlert, setSubmittedAlert] = useState<string | null>(null);

  // Filter beats
  const filteredBeats = beats.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.producerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Remove active beat from player
  const handleRemoveActiveBeat = () => {
    if (!currentBeat) return;
    const title = currentBeat.title;
    useAudioStore.setState({ currentBeat: null, isPlaying: false, progress: 0 });
    setSubmittedAlert(`Removed "${title}" from current player playback.`);
    setTimeout(() => setSubmittedAlert(null), 4000);
  };

  // Clear queue
  const handleClearQueue = () => {
    clearQueue();
    setSubmittedAlert('Cleared all queued tracks from the audio player.');
    setTimeout(() => setSubmittedAlert(null), 4000);
  };

  // Remove beat from catalog & player
  const handleRemoveBeatFromCatalog = (beatId: string, title: string) => {
    if (confirm(`Are you sure you want to remove "${title}" from the player and catalog?`)) {
      // If currently playing, remove from player
      if (currentBeat?.id === beatId) {
        useAudioStore.setState({ currentBeat: null, isPlaying: false, progress: 0 });
      }
      // Remove from queue
      removeFromQueue(beatId);
      // Remove from store catalog
      removeBeat(beatId);

      setSubmittedAlert(`Successfully removed "${title}" from the player and storefront catalog.`);
      setTimeout(() => setSubmittedAlert(null), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-10 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <VolumeX className="text-red-400" size={28} />
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
              Remove Beats From Player
            </h2>
            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full">
              Playback & Catalog Control
            </span>
          </div>
          <p className="text-white/50 text-xs">
            Manage live player playback, clear active stream queues, and remove or hide tracks from player rotation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClearQueue}
            disabled={queue.length === 0}
            className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-40"
          >
            <ListX size={15} /> Clear Player Queue ({queue.length})
          </button>
        </div>
      </div>

      {removedAlert && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-3">
          <CheckCircle2 size={18} />
          {removedAlert}
        </div>
      )}

      {/* Currently Playing Beat in Active Player */}
      <div className="p-6 border border-white/10 bg-black/80 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 bg-neutral-900 border border-white/10 overflow-hidden flex-shrink-0">
            {currentBeat ? (
              <img src={currentBeat.artworkUrl} alt={currentBeat.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20">
                <Disc size={24} />
              </div>
            )}
          </div>

          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-red-400 block mb-1">
              Currently Loaded in Persistent Player
            </span>
            <h3 className="text-xl font-black uppercase text-white">
              {currentBeat ? currentBeat.title : 'No Beat Loaded in Player'}
            </h3>
            {currentBeat && (
              <p className="text-xs text-white/50">
                {currentBeat.producerId} · {currentBeat.bpm} BPM · {currentBeat.key}
              </p>
            )}
          </div>
        </div>

        {currentBeat && (
          <button
            onClick={handleRemoveActiveBeat}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg active:scale-95"
          >
            <VolumeX size={16} /> Stop & Remove From Player
          </button>
        )}
      </div>

      {/* Active Audio Player Queue List */}
      <div className="border border-white/10 bg-black/80 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2 text-white">
            <Radio size={16} className="text-amber-400" />
            Active Player Queue ({queue.length} Tracks)
          </h3>
          {queue.length > 0 && (
            <button 
              onClick={handleClearQueue} 
              className="text-[10px] font-bold uppercase text-red-400 hover:underline"
            >
              Clear All Queued Tracks
            </button>
          )}
        </div>

        {queue.length === 0 ? (
          <div className="p-8 text-center text-white/30 text-xs uppercase tracking-widest">
            The active player queue is currently empty.
          </div>
        ) : (
          <div className="divide-y divide-white/5 max-h-64 overflow-y-auto pr-2 font-mono text-xs">
            {queue.map((beat, idx) => (
              <div key={`${beat.id}-${idx}`} className="py-3 flex items-center justify-between hover:bg-white/[0.02] px-2 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-white/30 font-bold w-6">{idx + 1}.</span>
                  <img src={beat.artworkUrl} alt={beat.title} className="w-8 h-8 object-cover border border-white/10" />
                  <div>
                    <span className="font-bold text-white uppercase">{beat.title}</span>
                    <span className="text-white/40 text-[10px] ml-2">({beat.bpm} BPM)</span>
                  </div>
                </div>

                <button
                  onClick={() => removeFromQueue(beat.id)}
                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  title="Remove track from queue"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Storefront Catalog Beats & Player Removal Matrix */}
      <div className="border border-white/10 bg-black/80 p-6 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-black text-lg uppercase tracking-tight text-white flex items-center gap-2">
              <Music size={20} className="text-red-400" />
              Manage Store Catalog Player Visibility
            </h3>
            <p className="text-white/40 text-xs">Select tracks to permanently or temporarily remove from the player catalog.</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text"
              placeholder="Search beats to remove..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border border-white/20 pl-8 pr-4 py-2 text-xs text-white focus:outline-none focus:border-red-400 placeholder:text-white/30"
            />
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {filteredBeats.length === 0 ? (
            <div className="p-12 text-center text-white/30 text-xs uppercase tracking-widest">
              No matching beats found in store catalog.
            </div>
          ) : (
            filteredBeats.map((beat) => {
              const isCurrentlyPlaying = currentBeat?.id === beat.id;
              const isInQueue = queue.some(q => q.id === beat.id);

              return (
                <div key={beat.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.02] px-3 transition-colors">
                  <div className="flex items-center gap-4">
                    <img src={beat.artworkUrl} alt={beat.title} className="w-12 h-12 object-cover border border-white/10" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white uppercase text-sm">{beat.title}</h4>
                        {isCurrentlyPlaying && (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase">
                            Now Playing
                          </span>
                        )}
                        {isInQueue && (
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-black uppercase">
                            In Queue
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/50">
                        {beat.genre} · {beat.bpm} BPM · {beat.key}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleRemoveBeatFromCatalog(beat.id, beat.title)}
                      className="px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold uppercase tracking-wider hover:bg-red-500/30 transition-all flex items-center gap-1.5"
                    >
                      <Trash2 size={14} /> Remove From Player
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
