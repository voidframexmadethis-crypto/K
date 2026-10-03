import React, { useState } from 'react';
import { Ticket, Mail, Share2, Link as LinkIcon, Image as ImageIcon, Users, User, Music, MessageSquare, MousePointer2, Target, Plus, Trash2, Send, ChevronRight, Globe, Instagram, Youtube, Twitter, Play } from 'lucide-react';
import { Coupon } from '../../types';
import { cn } from '../../lib/utils';

export const MarketingDashboard = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([
    { id: '1', code: 'LAUNCH20', type: 'percentage', value: 20, usageCount: 42, expiryDate: '2026-12-31' },
    { id: '2', code: 'KRAEZELV10', type: 'fixed', value: 10, usageCount: 15 },
  ]);

  const [activeTab, setActiveTab] = useState('Promos');

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-4">Growth Terminal</h2>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Promotions, Campaigns & Audience Acquisition</p>
        </div>
        <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-sm overflow-x-auto no-scrollbar">
           {['Promos', 'Promote', 'Feed', 'Email', 'Pixel', 'Social', 'Smart Links'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2 text-[8px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                  activeTab === tab ? "bg-white text-black" : "text-white/40 hover:text-white"
                )}
              >
                {tab}
              </button>
           ))}
        </div>
      </div>

      {activeTab === 'Promos' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
           {/* Coupon Manager */}
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-xl font-black uppercase tracking-tighter text-white">Discount Codes</h3>
                 <button className="p-2 bg-white text-black hover:bg-neutral-200 transition-all"><Plus size={14} /></button>
              </div>
              <div className="space-y-4">
                 {coupons.map(coupon => (
                    <div key={coupon.id} className="p-8 border border-white/10 bg-white/[0.02] flex items-center justify-between group">
                       <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center">
                             <Ticket size={20} className="text-white/20 group-hover:text-white transition-colors" />
                          </div>
                          <div className="flex flex-col gap-1">
                             <span className="text-xl font-black text-white tracking-widest">{coupon.code}</span>
                             <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">
                                {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `$${coupon.value} OFF`} · {coupon.usageCount} REDEMPTIONS
                             </span>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <button className="p-2 text-white/20 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Bulk Deal Engine */}
           <div className="space-y-6">
              <h3 className="text-xl font-black uppercase tracking-tighter text-white">"Buy X, Get Y" Deals</h3>
              <div className="p-10 border border-white/10 bg-white/[0.01] flex flex-col gap-8">
                 <div className="flex flex-col gap-8">
                    {[
                      { name: 'Standard Buy 2 Get 1', desc: 'Applies to Basic & Premium licenses.', active: true },
                      { name: 'Summer Unlimited 3 for 2', desc: 'Buy 2 Unlimited, Get 1 Free.', active: false },
                      { name: 'Flash 5 for 3', desc: 'Buy 3 of any type, Get 2 Free.', active: false },
                    ].map(deal => (
                       <div key={deal.name} className="flex items-center justify-between pb-6 border-b border-white/5 last:border-0 last:pb-0">
                          <div className="flex flex-col gap-1">
                             <span className="text-[10px] font-black uppercase text-white">{deal.name}</span>
                             <p className="text-[8px] text-white/40 uppercase tracking-widest">{deal.desc}</p>
                          </div>
                          <button className={cn("w-10 h-5 rounded-full relative transition-all", deal.active ? "bg-white" : "bg-white/10")}>
                             <div className={cn("absolute top-1 w-3 h-3 bg-black rounded-full transition-all", deal.active ? "right-1" : "left-1")} />
                          </button>
                       </div>
                    ))}
                 </div>
                 <div className="pt-8 border-t border-white/5">
                    <button className="w-full py-4 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all">+ CREATE CUSTOM DEAL</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'Promote' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in duration-500">
           <div className="lg:col-span-8 space-y-12">
              <div className="flex flex-col gap-4">
                 <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Marketplace Promotion</h3>
                 <p className="text-white/40 text-[10px] uppercase tracking-widest leading-relaxed">Boost your tracks and profile to the top of the KRAEZELVBEATZ marketplace search and recommendation feeds.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="p-10 border border-white/10 bg-white/[0.02] flex flex-col gap-6 group hover:border-white/40 transition-all">
                    <div className="w-12 h-12 bg-white flex items-center justify-center">
                       <Music size={24} className="text-black" />
                    </div>
                    <div className="flex flex-col gap-2">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Promoted Tracks</h4>
                       <p className="text-[8px] text-white/40 uppercase tracking-widest leading-relaxed">Push specific beats into the "Trending" section and user feeds.</p>
                    </div>
                    <button className="mt-4 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200">Start Campaign</button>
                 </div>

                 <div className="p-10 border border-white/10 bg-white/[0.02] flex flex-col gap-6 group hover:border-white/40 transition-all">
                    <div className="w-12 h-12 bg-white flex items-center justify-center">
                       <User size={24} className="text-black" />
                    </div>
                    <div className="flex flex-col gap-2">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Promoted Creator</h4>
                       <p className="text-[8px] text-white/40 uppercase tracking-widest leading-relaxed">Drive traffic directly to your producer profile and full catalog.</p>
                    </div>
                    <button className="mt-4 py-4 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black">Boost Profile</button>
                 </div>
              </div>

              <div className="p-12 bg-white/5 border border-white/10 flex flex-col gap-8">
                 <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Current Ad Budget</h4>
                    <span className="text-xl font-black text-white">$124.00</span>
                 </div>
                 <div className="h-1 bg-white/10 w-full relative">
                    <div className="h-full bg-white w-1/3" />
                 </div>
                 <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-white/20">
                    <span>$0 SPENT</span>
                    <span>$500 LIMIT</span>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-4 space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Campaign Insights</h4>
              <div className="flex flex-col gap-6">
                 {[
                   { label: 'Ad Impressions', value: '14.2k', change: '+12%' },
                   { label: 'Ad Clicks', value: '842', change: '+5.4%' },
                   { label: 'CTR', value: '5.9%', change: '+1.2%' },
                 ].map(stat => (
                    <div key={stat.label} className="p-8 border border-white/10 bg-white/[0.01] flex flex-col gap-2">
                       <span className="text-[8px] font-black uppercase tracking-widest text-white/20">{stat.label}</span>
                       <div className="flex items-end justify-between">
                          <span className="text-2xl font-black text-white">{stat.value}</span>
                          <span className="text-[8px] font-black text-emerald-500">{stat.change}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'Feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in duration-500">
           <div className="lg:col-span-7 space-y-8">
              <div className="p-8 border border-white/10 bg-white/[0.02] flex flex-col gap-6">
                 <textarea 
                   placeholder="Share a status update, production tip, or gear breakdown..."
                   className="w-full bg-transparent text-white text-xs font-medium placeholder:text-white/20 outline-none resize-none border-0 p-0"
                   rows={3}
                 />
                 <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-4 text-white/40">
                       <button className="hover:text-white transition-colors"><ImageIcon size={18} /></button>
                       <button className="hover:text-white transition-colors"><Play size={18} /></button>
                       <button className="hover:text-white transition-colors"><Music size={18} /></button>
                    </div>
                    <button className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest">Post to Feed</button>
                 </div>
              </div>

              <div className="space-y-6">
                 {[
                   { user: 'KRAEZELV', time: '2h ago', text: 'Just finished the mixing session for the APOLLO pack. These 808s are hitting different.', likes: 42, comments: 8 },
                   { user: 'KRAEZELV', time: '1d ago', text: 'Flash sale starting tomorrow. 50% off all exclusive licenses for 24 hours only. Stay tuned.', likes: 124, comments: 24 },
                 ].map((post, i) => (
                    <div key={i} className="p-8 border border-white/10 bg-white/[0.01] flex flex-col gap-6 group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/10 border border-white/10 flex items-center justify-center">
                             <User size={20} className="text-white/40" />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black text-white uppercase tracking-widest">{post.user}</span>
                             <span className="text-[8px] text-white/20 uppercase tracking-widest">{post.time}</span>
                          </div>
                       </div>
                       <p className="text-xs text-white/80 leading-relaxed">{post.text}</p>
                       <div className="flex items-center gap-8 pt-6 border-t border-white/5">
                          <button className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/20 hover:text-white">
                             <Share2 size={12} /> {post.likes} LIKES
                          </button>
                          <button className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/20 hover:text-white">
                             <MessageSquare size={12} /> {post.comments} COMMENTS
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="lg:col-span-5 space-y-12">
              <div className="space-y-6">
                 <h4 className="text-xl font-black uppercase tracking-tighter text-white">Direct Messages</h4>
                 <div className="space-y-4">
                    {[
                      { user: 'prodby_alpha', msg: 'Yo, I saw the new pack. Can we talk about a custom exclusive?', time: '12m ago', unread: true },
                      { user: 'jordan_vocalist', msg: 'Just bought the basic license. Do you have the stems?', time: '1h ago', unread: false },
                      { user: 'studio_rat', msg: 'Love the sound design on VALKYRIE.', time: '4h ago', unread: false },
                    ].map((dm, i) => (
                       <div key={i} className="p-6 border border-white/10 bg-white/[0.02] flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all">
                          <div className="flex items-center gap-4 min-w-0">
                             <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                <User size={18} className="text-white/20 group-hover:text-white" />
                             </div>
                             <div className="flex flex-col min-w-0">
                                <span className={cn("text-[10px] font-black uppercase tracking-widest", dm.unread ? "text-white" : "text-white/40")}>{dm.user}</span>
                                <p className="text-[8px] text-white/20 truncate uppercase tracking-widest">{dm.msg}</p>
                             </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                             <span className="text-[8px] font-bold text-white/10">{dm.time}</span>
                             {dm.unread && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                       </div>
                    ))}
                 </div>
                 <button className="w-full py-4 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">Open Inbox</button>
              </div>

              <div className="p-10 bg-white/5 border border-white/10 flex flex-col gap-6">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Engagement Score</h4>
                 <div className="flex items-end justify-between">
                    <span className="text-4xl font-black text-white">98</span>
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">+4.2%</span>
                 </div>
                 <p className="text-[8px] text-white/40 uppercase tracking-widest leading-relaxed">Your response time is within the top 5% of creators this week.</p>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'Email' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in duration-500">
           {/* Newsletter Builder */}
           <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-black uppercase tracking-tighter text-white">Newsletter Builder</h3>
              <div className="bg-neutral-900 border border-white/10 overflow-hidden">
                 <div className="p-6 border-b border-white/5 flex gap-4">
                    <button className="p-2 border border-white/10 text-white/40"><Plus size={14} /></button>
                    <button className="p-2 border border-white/10 text-white/40"><ImageIcon size={14} /></button>
                    <button className="p-2 border border-white/10 text-white/40"><Ticket size={14} /></button>
                 </div>
                 <div className="p-20 flex flex-col items-center justify-center text-center gap-6 bg-white/[0.01]">
                    <div className="w-24 h-24 border-2 border-dashed border-white/10 flex items-center justify-center">
                       <ImageIcon size={32} className="text-white/5" />
                    </div>
                    <h4 className="text-4xl font-black text-white uppercase tracking-tighter">NEW BEAT DROP</h4>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest max-w-sm">"Hey artist, I just uploaded a new dark cinematic production called APOLLO. Check it out now."</p>
                    <button className="px-12 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest">Listen Now</button>
                 </div>
                 <div className="p-6 border-t border-white/5 bg-black flex justify-end gap-6">
                    <button className="text-[10px] font-black uppercase tracking-widest text-white/40">Save Draft</button>
                    <button className="flex items-center gap-3 px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest">Send Broadcast <Send size={12} /></button>
                 </div>
              </div>
           </div>

           {/* Segments */}
           <div className="space-y-6">
              <h3 className="text-xl font-black uppercase tracking-tighter text-white">Mailing List Segments</h3>
              <div className="space-y-4">
                 {[
                   { name: 'Active Buyers', count: 142, icon: Target },
                   { name: 'Cart Abandoners', count: 58, icon: MousePointer2 },
                   { name: 'Free Downloaders', count: 894, icon: Users },
                 ].map(seg => (
                    <div key={seg.name} className="p-6 border border-white/10 bg-white/[0.02] flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all">
                       <div className="flex items-center gap-4">
                          <seg.icon size={16} className="text-white/20 group-hover:text-white" />
                          <span className="text-[10px] font-black uppercase text-white">{seg.name}</span>
                       </div>
                       <span className="text-[10px] font-black text-white/40">{seg.count}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'Pixel' && (
        <div className="max-w-3xl mx-auto w-full space-y-12 animate-in fade-in duration-500">
           <div className="flex flex-col gap-4 text-center">
              <h3 className="text-4xl font-black uppercase tracking-tighter text-white">Pixel Integration Hub</h3>
              <p className="text-white/40 text-xs uppercase tracking-widest leading-relaxed">Connect your storefront to Meta, Google, and TikTok for advanced ad retargeting and attribution.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {['Meta Pixel (Facebook/IG)', 'Google Ads Tag', 'TikTok Pixel', 'Pinterest Tag'].map(p => (
                 <div key={p} className="p-8 border border-white/10 bg-white/[0.01] flex flex-col gap-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{p}</label>
                    <input 
                      type="text" 
                      placeholder="ENTER PIXEL ID..." 
                      className="bg-white/5 border border-white/10 p-4 text-[10px] font-bold text-white outline-none focus:border-white/40" 
                    />
                    <button className="w-full py-3 bg-white/5 border border-white/10 text-[8px] font-black uppercase text-white/60 hover:text-white hover:bg-white/10 transition-all">Verify Connection</button>
                 </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'Social' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
           <div className="space-y-6">
              <h3 className="text-xl font-black uppercase tracking-tighter text-white">Auto-Poster Settings</h3>
              <div className="p-10 border border-white/10 bg-white/[0.01] space-y-8">
                 {[
                   { name: 'Instagram', icon: Instagram, enabled: true },
                   { name: 'YouTube Shorts', icon: Youtube, enabled: true },
                   { name: 'Twitter (X)', icon: Twitter, enabled: false },
                 ].map(s => (
                    <div key={s.name} className="flex items-center justify-between">
                       <div className="flex items-center gap-4 text-white">
                          <s.icon size={20} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{s.name}</span>
                       </div>
                       <button className={cn("w-12 h-6 rounded-full relative transition-all", s.enabled ? "bg-white" : "bg-white/10")}>
                          <div className={cn("absolute top-1 w-4 h-4 bg-black rounded-full transition-all", s.enabled ? "right-1" : "left-1")} />
                       </button>
                    </div>
                 ))}
              </div>
           </div>
           <div className="p-10 bg-neutral-900 border border-white/10 flex flex-col gap-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Preview Content</span>
              <div className="aspect-square bg-black border border-white/5 p-8 flex flex-col gap-4">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10" />
                    <span className="text-[10px] font-black text-white uppercase">KRAEZELVBEATZ</span>
                 </div>
                 <div className="aspect-video bg-neutral-900 border border-white/5 flex items-center justify-center">
                    <Play size={32} className="text-white/20" />
                 </div>
                 <p className="text-[10px] text-white/60">🚀 Just published "APOLLO" on the catalog! Link in bio. #Kraezelv #Trap #Drill</p>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'Smart Links' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-tighter text-white">Marketing Smart URLs</h3>
              <button className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest">+ NEW LINK</button>
           </div>
           <div className="border border-white/10 bg-white/[0.01]">
              <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-white/5 text-[8px] font-black uppercase tracking-[0.4em] text-white/20">
                 <div className="col-span-5">CAMPAIGN / SOURCE</div>
                 <div className="col-span-3 text-center">CLICKS</div>
                 <div className="col-span-4 text-right">SHORT URL</div>
              </div>
              {[
                { name: 'APOLLO - IG Bio', clicks: 1242, url: 'kraezelv.com/l/apollo-ig' },
                { name: 'NIGHTFALL - YT Desc', clicks: 842, url: 'kraezelv.com/l/nightfall-yt' },
                { name: 'Flash Sale - Twitter', clicks: 215, url: 'kraezelv.com/l/sale-oct' },
              ].map(link => (
                 <div key={link.url} className="grid grid-cols-12 gap-4 px-8 py-6 border-b border-white/5 hover:bg-white/[0.02] transition-colors items-center">
                    <div className="col-span-5 flex flex-col gap-1">
                       <span className="text-[10px] font-bold uppercase text-white">{link.name}</span>
                       <Globe size={10} className="text-white/20" />
                    </div>
                    <div className="col-span-3 text-center text-xl font-black text-white tabular-nums">{link.clicks.toLocaleString()}</div>
                    <div className="col-span-4 flex items-center justify-end gap-3 text-white/40">
                       <span className="text-[10px] font-black uppercase tracking-widest">{link.url}</span>
                       <button className="p-2 hover:text-white transition-colors"><LinkIcon size={14} /></button>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};
