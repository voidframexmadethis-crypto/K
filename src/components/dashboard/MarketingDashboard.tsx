import React, { useState } from 'react';
import { Share2, Sparkles, Ticket, Target } from 'lucide-react';
import { AdminSocialPreviewTester } from './AdminSocialPreviewTester';
import { MarketingSuite } from './MarketingSuite';

export const MarketingDashboard = () => {
  const [activeTab, setActiveTab] = useState<'marketing_suite' | 'social_preview'>('marketing_suite');

  return (
    <div className="flex flex-col gap-10 text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">Growth & Marketing Suite</h2>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Pixels, Newsletters, SEO Schema, Coupons, Affiliates & UTM Attributions</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 bg-white/5 border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('marketing_suite')}
            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'marketing_suite' ? 'bg-white text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            Marketing Suite
          </button>
          <button
            onClick={() => setActiveTab('social_preview')}
            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'social_preview' ? 'bg-white text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            Social Cards Preview
          </button>
        </div>
      </div>

      {activeTab === 'marketing_suite' ? (
        <MarketingSuite />
      ) : (
        <AdminSocialPreviewTester />
      )}
    </div>
  );
};
