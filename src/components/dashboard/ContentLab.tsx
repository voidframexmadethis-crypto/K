import React, { useState } from 'react';
import { Video, User, MessageSquare, Music, Layers, Sparkles, Plus, Play, Download, Link as LinkIcon, Languages, FileVideo, Archive, Settings } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Campaign, CreativeVariant } from '../../types';
import { generateVideo } from '../../services/videoGen';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ContentLab = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'library' | 'campaigns'>('create');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);

  const startNewCampaign = () => {
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: 'New Campaign',
      status: 'draft',
      variants: [],
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
                    <div key={v.id} className="p-4 border border-white/10 bg-white/[0.02]">
                        <span className="text-xs font-bold">{v.name}</span>
                        <span className={cn("block text-[10px] uppercase font-black", v.generationStatus === 'pending' ? "text-white/40" : v.generationStatus === 'success' ? "text-emerald-500" : "text-red-500")}>
                            {v.generationStatus}
                        </span>
                    </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-white/10">
             <button onClick={startNewCampaign} className="px-12 py-6 bg-white text-black font-black uppercase tracking-widest hover:bg-neutral-200">
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
