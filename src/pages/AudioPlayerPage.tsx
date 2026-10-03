import React from 'react';
import { Play, Download, Share2, Heart, ShoppingCart, MessageSquare, Send } from 'lucide-react';
import { useAudioStore } from '../store/useAudioStore';
import { cn } from '../lib/utils';

const relatedTracks = [
  { id: '1', title: 'Moment Of Your Life | Rob49 Type Be...', time: '03:07', bpm: 161, tags: ['rob...', 'hard type ...'], price: '$14.99' },
  { id: '2', title: 'Maybe Tonight | Zeddy Will Jersey Cl...', time: '02:49', bpm: 136, tags: ['hard ...', 'jersey cl...'], price: '$14.99' },
  { id: '3', title: 'Notion | Nav Type Beat 2025', time: '03:41', bpm: 130, tags: ['hard type b...', 'n...'], price: '$14.99' },
  { id: '4', title: 'Wheezy x Southside Type Beat | Pusher', time: '03:09', bpm: 173, tags: ['wh...', 'wheezy x s...'], price: '$14.99' },
  { id: '5', title: 'Nardo Wick x Southside Type Beat | D...', time: '02:55', bpm: 78, tags: ['nar...', 'nardo wic...'], price: '$14.99' },
  { id: '6', title: 'Teflon | Doe Boy Type Beat 2025', time: '03:36', bpm: 81, tags: ['doe boy...', 'hard t...'], price: '$14.99' },
  { id: '7', title: 'Spazz It | Big Boogie Type Beat 2024', time: '02:33', bpm: 163, tags: ['hard typ...', 'big b...'], price: '$14.99' },
  { id: '8', title: 'Ghosts | Southside x G Herbo Type Be...', time: '03:34', bpm: 144, tags: ['g he...', 'hard type...'], price: '$14.99' },
  { id: '9', title: 'Southside x Pyrex Whippa x Nardo Wi...', time: '03:12', bpm: 140, tags: ['pyrex w...', 'nardo...'], price: '$14.99' },
  { id: '10', title: 'Hellcats | Southside x Nardo Wick Ty...', time: '04:03', bpm: 158, tags: ['so...', 'nardo wick...'], price: '$14.99' },
];

export const AudioPlayerPage = () => {
  const { setBeat, currentBeat, isPlaying, togglePlay } = useAudioStore();
  const artwork = '/src/assets/images/beat_artwork_abstract_1791053624368.jpg';

  const track = {
    id: 'stars-southside',
    title: 'Stars | Southside Type Beat 2025',
    producerId: 'MXBEATZ808',
    bpm: 82,
    key: 'Cm',
    genre: 'Trap',
    tags: ['hard type ...', 'southside t...', 'southside'],
    moods: ['DARK'],
    slug: 'stars',
    isPrivate: false,
    isBootleg: false,
    instruments: [],
    audioUrl: '',
    artworkUrl: artwork,
    isFree: false,
    licenses: { 
      basic: { price: 14.99, enabled: true }, 
      premium: { price: 29.99, enabled: true }, 
      unlimited: { price: 79.99, enabled: true }, 
      exclusive: { price: 499.99, enabled: true } 
    },
    createdAt: '2025-09-25',
    published: true
  };

  const isCurrent = currentBeat?.id === track.id;

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-4 md:px-8 max-w-[1400px] mx-auto">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-full md:w-[300px] aspect-square bg-neutral-900 border border-white/10 shrink-0 overflow-hidden">
          <img src={artwork} alt="Track Artwork" className="w-full h-full object-cover grayscale" />
        </div>
        
        <div className="flex flex-col justify-end gap-6 flex-1">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => isCurrent ? togglePlay() : setBeat(track)}
                className="w-16 h-16 bg-black border border-white/20 text-white rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-2xl active:scale-95 group"
              >
                {isCurrent && isPlaying ? (
                  <div className="flex gap-1.5 items-end h-6">
                    <div className="w-1 h-4 bg-white animate-pulse" />
                    <div className="w-1 h-6 bg-white animate-pulse delay-75" />
                    <div className="w-1 h-3 bg-white animate-pulse delay-150" />
                  </div>
                ) : (
                  <Play size={24} fill="white" className="ml-1 group-hover:scale-110 transition-transform" />
                )}
              </button>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">{track.title}</h1>
            </div>
            <p className="text-white/60 font-bold uppercase tracking-widest text-xs">MXBEATZ808</p>
            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              <span className="flex items-center gap-2"><div className="w-4 h-3 border border-white/20 text-[8px] flex items-center justify-center">BPM</div> 82</span>
              <span className="flex items-center gap-2"><div className="w-4 h-3 border border-white/20 text-[8px] flex items-center justify-center">♫</div> Cm</span>
              <span>September 25, 2025</span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-white/40">Stars | Southside Type Beat 2025</p>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <button className="px-6 py-3 bg-black border border-white/20 text-white font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-white hover:text-black transition-all">
              <ShoppingCart size={14} /> ${track.licenses.basic.price}
            </button>
            <button className="px-6 py-3 bg-black border border-white/20 text-white font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-white hover:text-black transition-all">
              <Download size={14} /> Download
            </button>
            <button className="px-6 py-3 bg-black border border-white/20 text-white font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-white hover:text-black transition-all">
              <Share2 size={14} /> Share
            </button>
            
            <div className="flex gap-2 ml-auto">
              {['hard type ...', 'southside t...', 'southside'].map(tag => (
                <span key={tag} className="px-4 py-1.5 bg-neutral-900 border border-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/40">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Waveform Section */}
      <div className="mb-12">
        <div className="h-32 w-full flex items-center gap-1">
          {Array.from({ length: 120 }).map((_, i) => (
            <div 
              key={i} 
              className="flex-1 bg-white/20"
              style={{ height: `${Math.random() * 80 + 10}%` }}
            />
          ))}
        </div>
      </div>

      {/* Interaction Section */}
      <div className="flex flex-col md:flex-row gap-12 mb-20">
        <div className="flex-1 flex flex-col gap-8">
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 bg-neutral-900 border border-white/10 rounded-full" />
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Write a comment..." 
                className="w-full bg-black border-b border-white/10 py-2 text-sm uppercase tracking-tight focus:border-white outline-none transition-colors"
              />
              <span className="absolute right-0 bottom-2 text-[8px] text-white/20">0/240</span>
            </div>
            <button className="px-6 py-2 bg-black border border-white/20 text-white font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-white hover:text-black transition-all">
              Send <Send size={12} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Collaborators:</h3>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-neutral-800 border border-white/10 grayscale overflow-hidden">
                <img src="/api/placeholder/40/40" alt="Collab" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-tighter">Anton Sazonov</span>
                <span className="text-[8px] text-white/40 uppercase tracking-[0.2em]">PRODUCER</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & List Section */}
      <div>
        <div className="flex gap-8 border-b border-white/10 mb-8 justify-center">
          <button className="pb-4 border-b-2 border-white text-[10px] font-bold uppercase tracking-[0.3em]">Related Tracks</button>
          <button className="pb-4 border-b-2 border-transparent text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors">Comments</button>
        </div>

        <div className="flex flex-col">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[8px] font-bold uppercase tracking-[0.4em] text-white/20 border-b border-white/5">
            <div className="col-span-1">TITLE</div>
            <div className="col-span-5 md:col-span-6"></div>
            <div className="col-span-1 text-center">TIME</div>
            <div className="col-span-1 text-center">BPM</div>
            <div className="col-span-2 text-center">TAGS</div>
            <div className="col-span-2 text-right"></div>
          </div>

          {/* Table Rows */}
          {relatedTracks.map((track) => (
            <div key={track.id} className="grid grid-cols-12 gap-4 px-4 py-4 items-center border-b border-white/5 hover:bg-white/[0.02] group transition-colors">
              <div className="col-span-1">
                <div className="w-10 h-10 bg-neutral-900 border border-white/5 overflow-hidden">
                  <img src={artwork} alt="Track" className="w-full h-full object-cover grayscale" />
                </div>
              </div>
              <div className="col-span-5 md:col-span-6">
                <h4 className="text-[10px] font-bold uppercase tracking-tighter truncate group-hover:text-white transition-colors">
                  {track.title}
                </h4>
              </div>
              <div className="col-span-1 text-center text-[10px] tabular-nums text-white/40">{track.time}</div>
              <div className="col-span-1 text-center text-[10px] tabular-nums text-white/40">{track.bpm}</div>
              <div className="col-span-2 flex justify-center gap-1">
                {track.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-neutral-900 border border-white/5 rounded-sm text-[8px] font-bold uppercase tracking-widest text-white/40">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="col-span-2 flex justify-end gap-3 items-center">
                <button className="text-white/40 hover:text-white transition-colors"><Share2 size={14} /></button>
                <button className="px-4 py-2 bg-black border border-white/20 text-white font-bold uppercase tracking-widest text-[8px] flex items-center gap-2 hover:bg-white hover:text-black transition-all">
                  <ShoppingCart size={12} /> {track.price}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
