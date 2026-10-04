import React, { useState } from 'react';
import { Video, User, MessageSquare, Music, Layers, Sparkles, Plus, Play, Download, Link as LinkIcon, Languages, FileVideo, Archive, Settings, Share2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Campaign, CreativeVariant } from '../../types';
import { generateVideo } from '../../services/videoGen';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { logAnalyticsEvent } from '../../services/analyticsService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ContentLab = () => {
  const { beats } = useBeatCatalogStore();
  const [activeTab, setActiveTab] = useState<'create' | 'library' | 'campaigns'>('create');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
  const [selectedBeatId, setSelectedBeatId] = useState('');
  const [isFreeDownloadAd, setIsFreeDownloadAd] = useState(false);

  const startNewCampaign = () => {
    const beat = beats.find(b => b.id === selectedBeatId);
    const productLink = beat ? `${window.location.origin}/?beat=${beat.id}${isFreeDownloadAd ? '&download=free' : ''}` : '';
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: beat ? `Ad for ${beat.title}` : 'New Campaign',
      productId: selectedBeatId,
      productLink,
      status: 'draft',
      variants: [
        {
          id: `var-${Date.now()}`,
          name: 'Main Video',
          script: `Check out my new beat ${beat?.title || ''}!`,
          templateId: 'default',
          aspectRatio: '9:16',
          generationStatus: 'idle'
        }
      ],
      createdAt: new Date().toISOString(),
    };
    setCampaigns([newCampaign, ...campaigns]);
    setCurrentCampaign(newCampaign);
    setActiveTab('create');
  };

  const handleGenerate = async (variantId: string) => {
    if (!currentCampaign) return;

    // Update variant status to pending
    setCampaigns(prev => prev.map(c => c.id === currentCampaign.id ? {
      ...c,
      variants: c.variants.map(v => v.id === variantId ? {...v, generationStatus: 'pending'} : v)
    } : c));

    const variant = currentCampaign.variants.find(v => v.id === variantId)!;
    const result = await generateVideo(variant.script, variant.templateId, variant.aspectRatio);

    if (result.status === 'success') {
      const beat = beats.find(b => b.id === currentCampaign.productId);
      logAnalyticsEvent({
        eventType: 'ad_created',
        beatId: currentCampaign.productId,
        beatTitle: beat?.title,
      });
    }

    setCampaigns(prev => prev.map(c => c.id === currentCampaign.id ? {
      ...c,
      variants: c.variants.map(v => v.id === variantId ? {
        ...v,
        generationStatus: result.status,
        generatedVideoUrl: result.videoUrl,
        errorMessage: result.error
      } : v)
    } : c));
  };

  const handleShare = async (variant: CreativeVariant) => {
    if (!variant.generatedVideoUrl || !currentCampaign) return;

    const queryParams = currentCampaign.productLink?.split('?')[1] || `beat=${currentCampaign.productId || ''}`;
    const shareUrl = `${window.location.origin}/?ad_video=${encodeURIComponent(variant.generatedVideoUrl)}&${queryParams}`;
    
    const shareData = {
      title: `Advertisement for ${currentCampaign.name}`,
      text: `Check out this advertisement for my new beat!`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Advertisement share link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleDownload = async (variant: CreativeVariant) => {
    if (!variant.generatedVideoUrl) return;

    try {
      const link = document.createElement('a');
      link.href = variant.generatedVideoUrl;
      link.download = `KRAEZELVbeatz__ad_${variant.id}.mp4`.replace(/[^a-z0-9.]/gi, '_');
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      window.open(variant.generatedVideoUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-col gap-12 text-white">
      <div className="flex items-end justify-between border-b border-white/10 pb-8">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Content Lab</h2>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Advertising-Production Workspace</p>
        </div>
        
        <div className="flex gap-1 p-1 bg-white/5 border border-white/10">
          {['create', 'campaigns', 'library'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab ? "bg-white text-black" : "text-white/40 hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'create' ? (
        currentCampaign ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-8">
                {/* Campaign Configuration (Simplified for brevity) */}
                <div className="p-10 border border-white/10 bg-white/[0.02]">
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-8">Campaign: {currentCampaign.name}</h3>
                    <button onClick={() => handleGenerate(currentCampaign.variants[0]?.id)} className="bg-white text-black px-8 py-4 text-[10px] font-black uppercase tracking-widest">
                        <Sparkles size={14} className="inline mr-2"/> Generate Native Ad
                    </button>
                </div>
             </div>
             <div className="bg-neutral-900 border border-white/10 p-6 flex flex-col gap-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Canvas Status</h4>
                {currentCampaign.variants.map(v => (
                    <div key={v.id} className="p-4 border border-white/10 bg-white/[0.02] space-y-3">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-bold">{v.name}</span>
                            <span className={cn("text-[10px] uppercase font-black", v.generationStatus === 'pending' ? "text-white/40" : v.generationStatus === 'success' ? "text-emerald-500" : "text-red-500")}>
                                {v.generationStatus}
                            </span>
                        </div>
                        
                        {v.generationStatus === 'success' && (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleShare(v)}
                                    className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                                >
                                    <Share2 size={12} /> Share Video Link
                                </button>
                                <button 
                                    onClick={() => handleDownload(v)}
                                    className="flex-1 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors border border-emerald-500/20"
                                >
                                    <Download size={12} /> Download Video
                                </button>
                            </div>
                        )}
                    </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/10 gap-8">
             <div className="w-full max-w-md space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Select Beat for Advertisement</label>
                   <select 
                      value={selectedBeatId}
                      onChange={(e) => setSelectedBeatId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold text-white outline-none focus:border-white/40"
                   >
                      <option value="" className="bg-neutral-900">Choose a beat...</option>
                      {beats.map(b => (
                         <option key={b.id} value={b.id} className="bg-neutral-900">{b.title.toUpperCase()}</option>
                      ))}
                   </select>
                </div>

                <div className="flex items-center gap-3">
                   <input 
                      type="checkbox" 
                      id="free-ad"
                      checked={isFreeDownloadAd}
                      onChange={(e) => setIsFreeDownloadAd(e.target.checked)}
                      className="w-4 h-4 accent-purple-500"
                   />
                   <label htmlFor="free-ad" className="text-[10px] font-black uppercase tracking-widest text-white/60 cursor-pointer">Target Free Download Link</label>
                </div>
             </div>

             <button 
                onClick={() => startNewCampaign()} 
                disabled={!selectedBeatId}
                className="px-12 py-6 bg-white text-black font-black uppercase tracking-widest hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
             >
                + Start New Campaign
             </button>
          </div>
        )
      ) : activeTab === 'campaigns' ? (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {campaigns.map(c => (
                 <div key={c.id} className="p-8 border border-white/10 bg-white/[0.02]">
                     <h4 className="text-xl font-black uppercase tracking-tighter">{c.name}</h4>
                     <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{c.status}</span>
                 </div>
             ))}
         </div>
      ) : (
        <div className="py-40 text-center text-white/20 uppercase tracking-[0.3em]">Library Empty</div>
      )}
    </div>
  );
};
