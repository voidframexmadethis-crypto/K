import React, { useState } from 'react';
import { Download, Youtube, Instagram, Disc, CheckCircle2, Lock, Sparkles, X } from 'lucide-react';
import { Beat } from '../../types';
import { recordLeadSubscriber } from '../../services/analyticsService';

interface SocialUnlockGatewayProps {
  beat: Beat;
  isOpen: boolean;
  onClose: () => void;
}

export const SocialUnlockGateway: React.FC<SocialUnlockGatewayProps> = ({ beat, isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [subscribedYoutube, setSubscribedYoutube] = useState(false);
  const [followedInstagram, setFollowedInstagram] = useState(false);
  const [followedSpotify, setFollowedSpotify] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleAction = (platform: 'youtube' | 'instagram' | 'spotify') => {
    if (platform === 'youtube') {
      window.open('https://youtube.com/@kraezelvbeatz?sub_confirmation=1', '_blank');
      setSubscribedYoutube(true);
    } else if (platform === 'instagram') {
      window.open('https://instagram.com/kraezelvbeatz', '_blank');
      setFollowedInstagram(true);
    } else if (platform === 'spotify') {
      window.open('https://open.spotify.com/artist/kraezelv', '_blank');
      setFollowedSpotify(true);
    }

    if (email) {
      setUnlocked(true);
    }
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setDownloading(true);

    try {
      await recordLeadSubscriber({
        email,
        beatId: beat.id,
        beatTitle: beat.title,
        source: 'Social-Unlock Gateway'
      });

      // Trigger MP3 audio file download
      const link = document.createElement('a');
      link.href = beat.audioUrl;
      link.download = `KRAEZELV_${beat.title.replace(/\s+/g, '_')}_TAGGED_PREVIEW.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloading(false);
      setUnlocked(true);
    } catch (err) {
      console.error('Failed to trigger social unlock download:', err);
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
      <div className="bg-black border border-white/20 p-8 max-w-md w-full space-y-6 relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="space-y-1">
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-400 flex items-center gap-1.5">
            <Lock size={12} /> Social-Unlock Free Download
          </span>
          <h3 className="text-2xl font-black uppercase text-white tracking-tight truncate">
            {beat.title}
          </h3>
          <p className="text-xs text-white/40 uppercase tracking-widest">
            Follow KRAEZELV social channels & enter email to unlock instant tagged MP3 download.
          </p>
        </div>

        {/* STEP 1: SOCIAL FOLLOW GATE */}
        <div className="space-y-3">
          <label className="text-[9px] font-bold uppercase tracking-widest text-white/60 block">Step 1: Follow Social Channels</label>
          
          <button 
            type="button"
            onClick={() => handleAction('youtube')}
            className={`w-full p-3.5 border text-xs font-black uppercase tracking-widest flex items-center justify-between transition-all cursor-pointer ${
              subscribedYoutube ? 'bg-red-950/40 border-red-500 text-red-300' : 'bg-white/5 border-white/10 hover:border-red-500/50 text-white'
            }`}
          >
            <span className="flex items-center gap-2"><Youtube size={16} className="text-red-500" /> Subscribe on YouTube</span>
            {subscribedYoutube ? <CheckCircle2 size={16} className="text-red-400" /> : <span className="text-[9px] font-mono opacity-50">+ Unlock</span>}
          </button>

          <button 
            type="button"
            onClick={() => handleAction('instagram')}
            className={`w-full p-3.5 border text-xs font-black uppercase tracking-widest flex items-center justify-between transition-all cursor-pointer ${
              followedInstagram ? 'bg-pink-950/40 border-pink-500 text-pink-300' : 'bg-white/5 border-white/10 hover:border-pink-500/50 text-white'
            }`}
          >
            <span className="flex items-center gap-2"><Instagram size={16} className="text-pink-500" /> Follow on Instagram</span>
            {followedInstagram ? <CheckCircle2 size={16} className="text-pink-400" /> : <span className="text-[9px] font-mono opacity-50">+ Unlock</span>}
          </button>

          <button 
            type="button"
            onClick={() => handleAction('spotify')}
            className={`w-full p-3.5 border text-xs font-black uppercase tracking-widest flex items-center justify-between transition-all cursor-pointer ${
              followedSpotify ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300' : 'bg-white/5 border-white/10 hover:border-emerald-500/50 text-white'
            }`}
          >
            <span className="flex items-center gap-2"><Disc size={16} className="text-emerald-500" /> Follow on Spotify</span>
            {followedSpotify ? <CheckCircle2 size={16} className="text-emerald-400" /> : <span className="text-[9px] font-mono opacity-50">+ Unlock</span>}
          </button>
        </div>

        {/* STEP 2: EMAIL DELIVERY FORM */}
        <form onSubmit={handleDownload} className="space-y-4 pt-2 border-t border-white/10">
          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-white/60 block mb-1">Step 2: Enter Artist Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="artist@email.com"
              className="w-full bg-neutral-900 border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500"
            />
          </div>

          <button 
            type="submit"
            disabled={downloading}
            className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-xs tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            <Download size={14} /> {downloading ? 'Preparing MP3 File...' : 'UNLOCK & DOWNLOAD TAGGED MP3'}
          </button>
        </form>
      </div>
    </div>
  );
};
