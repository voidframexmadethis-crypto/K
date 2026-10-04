import React, { useState } from 'react';
import { SectionHeader } from '../components/home/SectionHeader';
import { useMerchStore } from '../store/useMerchStore';
import { 
  ShoppingBag, 
  ExternalLink, 
  Settings, 
  Globe, 
  RefreshCw, 
  Check, 
  Sparkles, 
  Maximize2 
} from 'lucide-react';

export const MerchPage = () => {
  const { merchStoreUrl, setMerchStoreUrl } = useMerchStore();
  const [inputUrl, setInputUrl] = useState(merchStoreUrl || '');
  const [isEditing, setIsEditing] = useState(!merchStoreUrl);
  const [iframeKey, setIframeKey] = useState(0);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    let formatted = inputUrl.trim();
    if (formatted && !formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = `https://${formatted}`;
    }
    setMerchStoreUrl(formatted);
    setIsEditing(false);
  };

  return (
    <div className="pt-28 pb-20 px-4 md:px-12 max-w-[1800px] mx-auto min-h-screen flex flex-col gap-8 text-white">
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <SectionHeader 
            kicker="Official Apparel & Physical Products"
            title="Merchandise Storefront"
          />
          <p className="text-white/50 text-xs font-mono mt-1">
            Embedded Merch Navigation: Automatically mirrors your official Shopify, Spring, or custom merch store.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {merchStoreUrl && (
            <>
              <a 
                href={merchStoreUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
              >
                <ExternalLink size={14} /> Open in New Tab
              </a>

              <button
                onClick={() => setIframeKey(k => k + 1)}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
                title="Refresh Store View"
              >
                <RefreshCw size={16} />
              </button>
            </>
          )}

          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2.5 bg-white text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-neutral-200 transition-all"
          >
            <Settings size={14} /> {isEditing ? 'Close Settings' : 'Configure Merch URL'}
          </button>
        </div>
      </div>

      {/* URL Config Drawer */}
      {isEditing && (
        <div className="p-6 bg-neutral-950 border border-purple-500/30 rounded-sm flex flex-col gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-purple-400 font-black text-xs uppercase tracking-wider">
            <Globe size={16} />
            Configure Embedded Merch Store Navigation Link
          </div>
          <p className="text-xs text-white/60">
            Paste the web URL of your official merchandise store (e.g. Shopify, Creator Spring, BigCartel, Printful, or custom domain). It will immediately embed into the Beat Store whenever visitors click the "Merch" navigation link!
          </p>

          <form onSubmit={handleSaveUrl} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              required
              placeholder="https://yourstore.creator-spring.com or https://shop.kraezelvbeatz.com"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 bg-black border border-white/20 p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400 font-mono"
            />
            <button 
              type="submit" 
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
            >
              <Check size={16} /> Save & Embed Store
            </button>
          </form>
        </div>
      )}

      {/* Embedded Merch Store Viewport */}
      {merchStoreUrl ? (
        <div className="w-full bg-black border border-white/10 rounded-sm overflow-hidden flex flex-col shadow-2xl relative">
          <div className="bg-neutral-900 border-b border-white/10 px-4 py-2 flex items-center justify-between text-[10px] text-white/50 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE EMBEDDED MERCH STORE:</span>
              <span className="text-white font-bold">{merchStoreUrl}</span>
            </div>
            <span>SANDBOXED IFRAME</span>
          </div>

          <iframe 
            key={iframeKey}
            src={merchStoreUrl}
            title="Embedded Merch Store"
            className="w-full h-[80vh] border-0 bg-white"
            allow="payment; autoplay; camera; microphone; geolocation"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-popups-to-escape-sandbox"
          />
        </div>
      ) : (
        <div className="p-20 bg-neutral-950 border border-white/10 text-center flex flex-col items-center justify-center gap-6 max-w-2xl mx-auto my-12">
          <ShoppingBag size={48} className="text-white/20" />
          <div className="space-y-2">
            <h3 className="text-2xl font-black uppercase text-white tracking-tight">EMBED YOUR OFFICIAL MERCH STORE</h3>
            <p className="text-white/40 uppercase tracking-widest text-xs leading-relaxed">
              Place your merchandise store URL above to automatically integrate your apparel, vinyl, and physical products inside the Beat Store!
            </p>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 hover:bg-neutral-200 transition-colors"
          >
            <Globe size={14} /> Enter Merch Store URL
          </button>
        </div>
      )}
    </div>
  );
};
