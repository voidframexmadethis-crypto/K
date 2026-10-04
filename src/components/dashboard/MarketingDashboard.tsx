import React, { useState } from 'react';
import { Share2, Sparkles, Ticket } from 'lucide-react';
import { AdminSocialPreviewTester } from './AdminSocialPreviewTester';

export const MarketingDashboard = () => {
  const [activeTab, setActiveTab] = useState<'social_preview' | 'campaigns'>('social_preview');

  return (
    <div className="flex flex-col gap-10 text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">Growth & Marketing Suite</h2>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Social Sharing Cards, OpenGraph Inspection & Viral Marketing</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 bg-white/5 border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('social_preview')}
            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'social_preview' ? 'bg-white text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            Social Preview
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'campaigns' ? 'bg-white text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            Campaigns
          </button>
        </div>
      </div>

      {activeTab === 'social_preview' ? (
        <AdminSocialPreviewTester />
      ) : (
        <div className="p-24 border border-white/10 bg-white/[0.01] flex flex-col items-center justify-center text-center gap-6">
          <Ticket size={48} className="text-white/20" />
          <div className="space-y-2">
            <h3 className="text-2xl font-black uppercase tracking-tight text-white">No Active Campaigns</h3>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Create campaigns and promotional content to start seeing growth metrics.</p>
          </div>
        </div>
      )}
    </div>
  );
};
