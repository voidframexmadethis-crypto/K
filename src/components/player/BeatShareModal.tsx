import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Code, 
  Share2, 
  Globe, 
  Twitter, 
  Facebook, 
  Send, 
  Mail, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Beat } from '../../types';

interface BeatShareModalProps {
  beat: Beat | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BeatShareModal: React.FC<BeatShareModalProps> = ({
  beat,
  isOpen,
  onClose
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  if (!isOpen || !beat) return null;

  const shareUrl = `${window.location.origin}/?beat=${beat.id}`;
  const embedCode = `<iframe src="${window.location.origin}/?beat=${beat.id}" width="100%" height="166" frameborder="0" allow="autoplay; clipboard-write; encrypted-media"></iframe>`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${beat.title} — KRAEZELVbeatz`,
          text: `Listen to "${beat.title}" by ${beat.producerId} on KRAEZELVbeatz Beat Store! 🔥`,
          url: shareUrl,
        });
      } catch (e) {
        console.warn('Native share cancelled or failed', e);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 3000);
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Check out "${beat.title}" by ${beat.producerId} on KRAEZELVbeatz Beat Store! 🔥`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Listen to "${beat.title}" by ${beat.producerId}: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out "${beat.title}" on KRAEZELVbeatz`);
    const body = encodeURIComponent(`Hey! Listen to "${beat.title}" by ${beat.producerId} on KRAEZELVbeatz:\n\n${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[300] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-neutral-950 border border-white/15 max-w-xl w-full p-6 sm:p-8 rounded-sm shadow-[0_0_80px_rgba(168,85,247,0.15)] relative flex flex-col gap-6 text-white">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-white/40 hover:text-white hover:bg-white/10 transition-all rounded-sm"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Share2 size={20} className="text-purple-400" />
          <div>
            <h3 className="text-xl font-black uppercase text-white tracking-tight">
              Share Track & Embed Player
            </h3>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
              BeatStars Style Direct Link & HTML5 iFrame Code
            </p>
          </div>
        </div>

        {/* Track Artwork & Info Card */}
        <div className="p-4 bg-white/[0.03] border border-white/10 rounded-sm flex items-center gap-4">
          <img 
            src={beat.artworkUrl} 
            alt={beat.title}
            className="w-20 h-20 object-cover border border-white/10 rounded-sm shrink-0"
          />

          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-purple-600/30 border border-purple-500/40 text-purple-300 text-[8px] font-black uppercase">
                Official Beat
              </span>
              <span className="text-[9px] font-mono text-white/40">{beat.bpm} BPM · {beat.key}</span>
            </div>

            <h4 className="text-lg font-black uppercase text-white truncate tracking-tight">
              {beat.title}
            </h4>
            
            <p className="text-xs font-bold uppercase tracking-wider text-white/50 truncate">
              {beat.producerId} · {beat.genre}
            </p>
          </div>
        </div>

        {/* 1. Direct Share Link Section */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1.5">
            <Globe size={12} className="text-purple-400" /> Direct Track Link
          </label>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              readOnly 
              value={shareUrl}
              className="flex-1 bg-black border border-white/20 p-3 text-xs font-mono text-white outline-none selection:bg-purple-600"
            />
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0"
                title="Share via Native Device Share Sheet"
              >
                <Share2 size={14} /> Share
              </button>
            )}
            <button
              onClick={handleCopyLink}
              className={`px-5 py-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
                copiedLink 
                  ? 'bg-emerald-500 text-black' 
                  : 'bg-white text-black hover:bg-neutral-200'
              }`}
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              {copiedLink ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* 2. Embedded iFrame Player Code */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1.5">
            <Code size={12} className="text-purple-400" /> HTML5 Embed Code (For Websites & Blogs)
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <textarea 
              readOnly 
              rows={2}
              value={embedCode}
              className="flex-1 bg-black border border-white/20 p-2.5 text-[10px] font-mono text-white/80 outline-none resize-none selection:bg-purple-600"
            />
            <button
              onClick={handleCopyEmbed}
              className={`px-5 py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shrink-0 ${
                copiedEmbed 
                  ? 'bg-emerald-500 text-black' 
                  : 'bg-purple-600 text-white hover:bg-purple-500'
              }`}
            >
              {copiedEmbed ? <Check size={14} /> : <Code size={14} />}
              {copiedEmbed ? 'Copied!' : 'Copy Embed Code'}
            </button>
          </div>
        </div>

        {/* 3. Social Media Quick Buttons */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">
            Quick Share To Social Networks
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={shareOnTwitter}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <Twitter size={14} className="text-sky-400" /> X / Twitter
            </button>

            <button
              onClick={shareOnFacebook}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <Facebook size={14} className="text-blue-500" /> Facebook
            </button>

            <button
              onClick={shareOnWhatsApp}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <Send size={14} className="text-emerald-400" /> WhatsApp
            </button>

            <button
              onClick={shareViaEmail}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <Mail size={14} className="text-purple-400" /> Email
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
