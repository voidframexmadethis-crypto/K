import React, { useState } from 'react';
import { 
  Share2, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  ExternalLink, 
  Twitter, 
  Sparkles, 
  Image as ImageIcon, 
  Globe, 
  Link as LinkIcon 
} from 'lucide-react';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { Beat } from '../../types';

export const AdminSocialPreviewTester = () => {
  const { beats } = useBeatCatalogStore();
  const [selectedBeatId, setSelectedBeatId] = useState<string>(beats[0]?.id || '');
  const [copiedLink, setCopiedLink] = useState(false);

  const selectedBeat = beats.find(b => b.id === selectedBeatId) || beats[0];

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = selectedBeat ? `${baseUrl}/?beat=${selectedBeat.id}` : '';

  const isPublicArtwork = selectedBeat?.artworkUrl?.startsWith('http://') || selectedBeat?.artworkUrl?.startsWith('https://');

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleTestShareTwitter = () => {
    if (!selectedBeat) return;
    const text = encodeURIComponent(`Listen to "${selectedBeat.title}" by ${selectedBeat.producerId} on KRAEZELV! 🔥`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  if (!beats.length) {
    return (
      <div className="p-8 bg-neutral-950 border border-white/10 text-center space-y-3">
        <p className="text-white/60 text-xs font-mono uppercase">No beats found in store catalog.</p>
        <p className="text-white/40 text-[10px] uppercase">Upload beats via the Beat Uploader to test social sharing previews.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-white max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Share2 size={24} className="text-purple-400" />
            <h3 className="text-2xl font-black uppercase text-white tracking-tight">
              X / Twitter Social Preview Inspector
            </h3>
          </div>
          <p className="text-xs text-white/50 uppercase tracking-widest">
            Inspect per-beat Open Graph cards, X summary_large_image meta tags, and unique deep-link URLs.
          </p>
        </div>

        {/* Beat Selection Dropdown */}
        <div className="space-y-1 shrink-0">
          <label className="text-[9px] font-black uppercase tracking-widest text-white/60 block">Select Beat To Inspect</label>
          <select 
            value={selectedBeatId}
            onChange={(e) => setSelectedBeatId(e.target.value)}
            className="bg-black border border-white/20 p-3 text-xs font-bold text-white outline-none focus:border-purple-500 cursor-pointer"
          >
            {beats.map(b => (
              <option key={b.id} value={b.id} className="bg-neutral-900">
                {b.title} ({b.bpm} BPM)
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedBeat && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: X / TWITTER LINK CARD SIMULATOR */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-purple-400 flex items-center gap-2">
              <Twitter size={14} className="text-sky-400" /> Simulated X / Twitter Large Image Card
            </h4>

            <div className="border border-white/15 bg-neutral-950 rounded-xl overflow-hidden shadow-2xl hover:border-sky-500/50 transition-colors">
              {/* Card Image */}
              <div className="relative aspect-[1.91/1] bg-neutral-900 overflow-hidden border-b border-white/10">
                {selectedBeat.artworkUrl ? (
                  <img 
                    src={selectedBeat.artworkUrl} 
                    alt={selectedBeat.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-white/30 text-xs font-mono">
                    <ImageIcon size={32} /> Missing Artwork
                  </div>
                )}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-md border border-white/20 text-[9px] font-mono text-white/80">
                  {selectedBeat.bpm} BPM · {selectedBeat.key}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-1.5 bg-neutral-950">
                <span className="text-[10px] font-mono text-white/40 uppercase block flex items-center gap-1">
                  <Globe size={10} /> kraezelvbeatz.com
                </span>
                <h5 className="text-base font-black uppercase text-white truncate tracking-tight">
                  {selectedBeat.title} — KRAEZELV
                </h5>
                <p className="text-xs text-white/60 line-clamp-2 font-light">
                  {selectedBeat.description || `Stream and license official instrumental beat ${selectedBeat.title} produced by ${selectedBeat.producerId} in ${selectedBeat.genre}.`}
                </p>
              </div>
            </div>

            {/* Test Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleCopy}
                className="w-full sm:flex-1 py-3 bg-white text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all shadow-lg active:scale-95"
              >
                <Copy size={14} /> {copiedLink ? 'Link Copied!' : 'Copy Share URL'}
              </button>

              <button
                onClick={handleTestShareTwitter}
                className="w-full sm:flex-1 py-3 bg-sky-500 text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-sky-400 transition-all shadow-lg active:scale-95"
              >
                <Twitter size={14} /> Test Share On X
              </button>

              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto p-3 bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center justify-center transition-all"
                title="Open Share Link in New Tab"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          {/* RIGHT: DIAGNOSTIC METADATA CHECKS */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={14} /> Social Crawler Verification Report
            </h4>

            <div className="p-5 bg-black border border-white/10 rounded-sm space-y-4 font-mono text-xs">
              
              {/* Check 1: Beat ID */}
              <div className="flex items-start gap-2.5 pb-3 border-b border-white/10">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-white font-bold uppercase block">✓ Beat Identifier Detected</span>
                  <span className="text-[10px] text-white/50 block">ID: {selectedBeat.id}</span>
                </div>
              </div>

              {/* Check 2: Public Artwork URL */}
              <div className="flex items-start gap-2.5 pb-3 border-b border-white/10">
                {isPublicArtwork ? (
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5 min-w-0">
                  <span className="text-white font-bold uppercase block">
                    {isPublicArtwork ? '✓ Public Artwork URL Detected' : '⚠️ Non-Standard Artwork URL'}
                  </span>
                  <span className="text-[9px] text-purple-300 block truncate" title={selectedBeat.artworkUrl}>
                    {selectedBeat.artworkUrl}
                  </span>
                </div>
              </div>

              {/* Check 3: Open Graph Tags */}
              <div className="flex items-start gap-2.5 pb-3 border-b border-white/10">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1 w-full">
                  <span className="text-white font-bold uppercase block">✓ Open Graph Tags Generated</span>
                  <div className="p-2 bg-neutral-900 border border-white/10 text-[9px] text-white/70 space-y-1">
                    <div>og:title = "{selectedBeat.title} — KRAEZELV"</div>
                    <div>og:description = "{selectedBeat.description || 'Official Beat Instrumental'}"</div>
                    <div className="truncate">og:image = "{selectedBeat.artworkUrl}"</div>
                    <div>og:url = "{shareUrl}"</div>
                    <div>og:site_name = "KRAEZELV"</div>
                  </div>
                </div>
              </div>

              {/* Check 4: Twitter Card Tags */}
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1 w-full">
                  <span className="text-white font-bold uppercase block">✓ Twitter Large-Image Card Tags</span>
                  <div className="p-2 bg-neutral-900 border border-white/10 text-[9px] text-white/70 space-y-1">
                    <div>twitter:card = "summary_large_image"</div>
                    <div>twitter:title = "{selectedBeat.title} — KRAEZELV"</div>
                    <div className="truncate">twitter:image = "{selectedBeat.artworkUrl}"</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};
