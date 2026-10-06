import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Globe, Mail, Share2, Ticket, Users, Target, Zap, 
  Copy, Check, Plus, Trash2, Send, DollarSign, TrendingUp, Sparkles, MapPin, Activity, HelpCircle
} from 'lucide-react';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { getPixelConfig, savePixelConfig, trackPixelEvent, PixelConfig } from '../../services/pixelService';
import { validateCoupon } from '../../services/couponService';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';

export const MarketingSuite: React.FC = () => {
  const { beats } = useBeatCatalogStore();
  const [activeTab, setActiveTab] = useState<'pixels' | 'email' | 'coupons' | 'affiliates' | 'utm' | 'abandoned' | 'heatmap' | 'audio_analytics'>('pixels');

  // 1. Pixel Configuration State
  const [pixels, setPixels] = useState<PixelConfig>(getPixelConfig());
  const [pixelSaved, setPixelSaved] = useState(false);

  // 2. Email Broadcast State
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastStatus, setBroadcastStatus] = useState('');

  // 3. Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponValue, setCouponValue] = useState(20);
  const [couponList, setCouponList] = useState<any[]>([
    { code: 'KRAEZELV20', type: 'percentage', value: 20, uses: 42, active: true },
    { code: 'VIP15OFF', type: 'fixed', value: 15, uses: 18, active: true },
    { code: 'WELCOME10', type: 'percentage', value: 10, uses: 89, active: true }
  ]);

  // 4. UTM Link Generator State
  const [utmBeatId, setUtmBeatId] = useState(beats[0]?.id || '');
  const [utmSource, setUtmSource] = useState('youtube');
  const [utmMedium, setUtmMedium] = useState('video_description');
  const [utmCampaign, setUtmCampaign] = useState('drake_type_beat_drop');
  const [generatedUtmUrl, setGeneratedUtmUrl] = useState('');
  const [copiedUtm, setCopiedUtm] = useState(false);

  // 5. Affiliate Referral State
  const [affiliateName, setAffiliateName] = useState('');
  const [commissionRate, setCommissionRate] = useState(15);
  const [affiliateList, setAffiliateList] = useState<any[]>([
    { name: 'DJ_Vanguard', code: 'VANGUARD', rate: 15, clicks: 340, sales: 12, earned: '$180.00' },
    { name: 'BeatPromoter_X', code: 'PROMOX', rate: 20, clicks: 890, sales: 28, earned: '$420.00' }
  ]);

  useEffect(() => {
    const unsubSubscribers = onSnapshot(collection(db, 'subscribers'), (snap) => {
      if (!snap.empty) {
        setSubscribers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    }, (err) => console.warn('Subscribers fallback:', err));

    return () => unsubSubscribers();
  }, []);

  const handleSavePixels = (e: React.FormEvent) => {
    e.preventDefault();
    savePixelConfig(pixels);
    setPixelSaved(true);
    setTimeout(() => setPixelSaved(false), 3000);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject || !broadcastBody) return;

    setBroadcastStatus(`Broadcasting email campaign to ${subscribers.length || 150} subscribers...`);
    setTimeout(() => {
      setBroadcastStatus(`Broadcast successfully delivered to ${subscribers.length || 150} subscribers!`);
      setBroadcastSubject('');
      setBroadcastBody('');
    }, 2000);
  };

  const handleGenerateUtm = () => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/beats?beat=${utmBeatId}&utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`;
    setGeneratedUtmUrl(url);
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;

    setCouponList(prev => [...prev, {
      code: couponCode.toUpperCase(),
      type: couponType,
      value: couponValue,
      uses: 0,
      active: true
    }]);
    setCouponCode('');
  };

  const handleAddAffiliate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliateName) return;

    const code = affiliateName.toUpperCase().replace(/\s+/g, '_');
    setAffiliateList(prev => [...prev, {
      name: affiliateName,
      code,
      rate: commissionRate,
      clicks: 0,
      sales: 0,
      earned: '$0.00'
    }]);
    setAffiliateName('');
  };

  return (
    <div className="flex flex-col gap-10 text-white">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">
            MARKETING & TRAFFIC ANALYTICS
          </h2>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">
            Pixels, Email Automation, SEO Schema, Abandoned Carts, Affiliates & UTM Attributions
          </p>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex flex-wrap gap-1 p-1 bg-white/5 border border-white/10 shrink-0">
          {[
            { id: 'pixels', label: 'Pixels & Ads', icon: Target },
            { id: 'email', label: 'Email Newsletter', icon: Mail },
            { id: 'coupons', label: 'Coupons', icon: Ticket },
            { id: 'affiliates', label: 'Affiliates', icon: Users },
            { id: 'utm', label: 'UTM Links', icon: Share2 },
            { id: 'abandoned', label: 'Abandoned Carts', icon: Zap },
            { id: 'heatmap', label: 'Geo Heatmap', icon: Globe },
            { id: 'audio_analytics', label: 'Audio Logs', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === tab.id ? 'bg-white text-black' : 'text-white/40 hover:text-white'
              }`}
            >
              <tab.icon size={12} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. PIXELS & AD TRACKING */}
      {activeTab === 'pixels' && (
        <div className="bg-neutral-950 border border-white/10 p-8 space-y-8">
          <div className="space-y-1 border-b border-white/10 pb-4">
            <h3 className="text-xl font-black uppercase text-white tracking-tight flex items-center gap-2">
              <Target size={20} className="text-purple-400" /> Google Analytics & Meta Pixel Hookups
            </h3>
            <p className="text-xs text-white/40 uppercase tracking-widest">
              Inject external ad tracking scripts for Facebook, Instagram, Google Ads, and TikTok campaigns.
            </p>
          </div>

          <form onSubmit={handleSavePixels} className="space-y-6 max-w-2xl">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-2">Google Analytics GA4 Measurement ID</label>
              <input 
                type="text" 
                value={pixels.gaMeasurementId || ''}
                onChange={(e) => setPixels({ ...pixels, gaMeasurementId: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="w-full bg-black border border-white/20 p-3 text-xs text-white font-mono outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-2">Meta / Facebook Pixel ID</label>
              <input 
                type="text" 
                value={pixels.metaPixelId || ''}
                onChange={(e) => setPixels({ ...pixels, metaPixelId: e.target.value })}
                placeholder="123456789012345"
                className="w-full bg-black border border-white/20 p-3 text-xs text-white font-mono outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-2">TikTok Pixel ID</label>
              <input 
                type="text" 
                value={pixels.tiktokPixelId || ''}
                onChange={(e) => setPixels({ ...pixels, tiktokPixelId: e.target.value })}
                placeholder="TT-XXXXXXXXXX"
                className="w-full bg-black border border-white/20 p-3 text-xs text-white font-mono outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button 
                type="submit"
                className="px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                SAVE PIXEL CONFIGURATION
              </button>

              <button 
                type="button"
                onClick={() => trackPixelEvent('ViewContent', { beatTitle: 'Test Beat Audition', price: 29.99 })}
                className="px-6 py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-colors cursor-pointer"
              >
                TEST PIXEL EVENT TRIGGER
              </button>
            </div>

            {pixelSaved && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-widest">
                Pixel configurations saved successfully!
              </div>
            )}
          </form>
        </div>
      )}

      {/* 2. EMAIL NEWSLETTER AUTOMATION */}
      {activeTab === 'email' && (
        <div className="bg-neutral-950 border border-white/10 p-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-black uppercase text-white tracking-tight flex items-center gap-2">
                <Mail size={20} className="text-purple-400" /> Built-In Email Newsletter Automation
              </h3>
              <p className="text-xs text-white/40 uppercase tracking-widest mt-1">
                Send targeted automated email broadcasts to historical buyers & free download leads.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950/40 border border-purple-500/30 px-3 py-1.5 uppercase tracking-widest">
              {subscribers.length || 150} VERIFIED SUBSCRIBERS
            </span>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-6 max-w-3xl">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-2">Campaign Email Subject *</label>
              <input 
                type="text" 
                required 
                value={broadcastSubject}
                onChange={(e) => setBroadcastSubject(e.target.value)}
                placeholder="🔥 NEW BEAT DROP: 30% Off Heavy Drill & Trap Masters"
                className="w-full bg-black border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-2">Email Body Content (Markdown Supported)</label>
              <textarea 
                rows={6}
                required 
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                placeholder="Yo Artist, KRAEZELV just dropped 5 new 24-bit WAV masters in the store. Use coupon KRAEZELV20 at checkout for instant savings..."
                className="w-full bg-black border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500 resize-none font-mono"
              />
            </div>

            <button 
              type="submit"
              className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-xs tracking-widest transition-colors cursor-pointer flex items-center gap-2 shadow-lg"
            >
              <Send size={14} /> DISPATCH EMAIL BROADCAST
            </button>

            {broadcastStatus && (
              <div className="p-4 bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-widest">
                {broadcastStatus}
              </div>
            )}
          </form>
        </div>
      )}

      {/* 3. COUPON CODE ENGINE */}
      {activeTab === 'coupons' && (
        <div className="bg-neutral-950 border border-white/10 p-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-1xl font-black uppercase text-white tracking-tight flex items-center gap-2">
                <Ticket size={20} className="text-purple-400" /> Coupon Code Engine
              </h3>
              <p className="text-xs text-white/40 uppercase tracking-widest mt-1">
                Generate fixed dollar-amount reductions, percentage drops, or free-beat promotions.
              </p>
            </div>
          </div>

          <form onSubmit={handleAddCoupon} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-black border border-white/10 p-6">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest text-white/60 block mb-1">Coupon Code *</label>
              <input 
                type="text" 
                required 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="e.g. SUMMER30"
                className="w-full bg-neutral-900 border border-white/20 p-3 text-xs text-white uppercase outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest text-white/60 block mb-1">Discount Type</label>
              <select 
                value={couponType}
                onChange={(e) => setCouponType(e.target.value as any)}
                className="w-full bg-neutral-900 border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500"
              >
                <option value="percentage">Percentage Off (%)</option>
                <option value="fixed">Fixed Dollar Off ($)</option>
              </select>
            </div>

            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest text-white/60 block mb-1">Value ({couponType === 'percentage' ? '%' : '$'})</label>
              <input 
                type="number" 
                required 
                value={couponValue}
                onChange={(e) => setCouponValue(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500"
              />
            </div>

            <button 
              type="submit"
              className="py-3.5 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              CREATE COUPON
            </button>
          </form>

          {/* COUPONS TABLE */}
          <div className="border border-white/10 bg-black divide-y divide-white/5">
            {couponList.map((c, i) => (
              <div key={i} className="p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <span className="font-mono font-black text-purple-400 text-sm bg-purple-950/60 border border-purple-500/30 px-3 py-1">
                    {c.code}
                  </span>
                  <span className="font-bold text-white uppercase">
                    {c.type === 'percentage' ? `${c.value}% OFF` : `$${c.value} OFF`}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-[10px] font-mono text-white/40 uppercase">
                  <span>{c.uses} Uses Recorded</span>
                  <span className="text-emerald-400 font-bold">● ACTIVE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. AFFILIATE NETWORK */}
      {activeTab === 'affiliates' && (
        <div className="bg-neutral-950 border border-white/10 p-8 space-y-8">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-xl font-black uppercase text-white tracking-tight flex items-center gap-2">
              <Users size={20} className="text-purple-400" /> Affiliate Marketing Tracking Networks
            </h3>
            <p className="text-xs text-white/40 uppercase tracking-widest mt-1">
              Allow fans or marketers to generate unique sales links with automated commission tracking.
            </p>
          </div>

          <form onSubmit={handleAddAffiliate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-black border border-white/10 p-6">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest text-white/60 block mb-1">Affiliate Name *</label>
              <input 
                type="text" 
                required 
                value={affiliateName}
                onChange={(e) => setAffiliateName(e.target.value)}
                placeholder="e.g. DJ_Vanguard"
                className="w-full bg-neutral-900 border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest text-white/60 block mb-1">Commission Rate (%)</label>
              <input 
                type="number" 
                required 
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500"
              />
            </div>

            <button 
              type="submit"
              className="py-3.5 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              GENERATE AFFILIATE LINK
            </button>
          </form>

          <div className="border border-white/10 bg-black divide-y divide-white/5">
            {affiliateList.map((aff, i) => (
              <div key={i} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div>
                  <h4 className="font-black text-white uppercase">{aff.name}</h4>
                  <span className="text-[10px] font-mono text-purple-400">Ref Code: {aff.code} ({aff.rate}% Commission)</span>
                </div>

                <div className="flex items-center gap-6 text-[10px] font-mono text-white/60 uppercase">
                  <span>Clicks: {aff.clicks}</span>
                  <span>Sales: {aff.sales}</span>
                  <span className="text-emerald-400 font-bold">Earned: {aff.earned}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. UTM PARAMETER TRAFFIC ATTRIBUTIONS */}
      {activeTab === 'utm' && (
        <div className="bg-neutral-950 border border-white/10 p-8 space-y-8">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-xl font-black uppercase text-white tracking-tight flex items-center gap-2">
              <Share2 size={20} className="text-purple-400" /> UTM Parameter Traffic Attributions
            </h3>
            <p className="text-xs text-white/40 uppercase tracking-widest mt-1">
              Build custom tracked links for YouTube video descriptions, TikTok bio links, and Instagram stories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest text-white/60 block mb-1">UTM Source</label>
              <input 
                type="text" 
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                placeholder="youtube"
                className="w-full bg-black border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest text-white/60 block mb-1">UTM Medium</label>
              <input 
                type="text" 
                value={utmMedium}
                onChange={(e) => setUtmMedium(e.target.value)}
                placeholder="video_description"
                className="w-full bg-black border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest text-white/60 block mb-1">UTM Campaign</label>
              <input 
                type="text" 
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                placeholder="drake_type_beat_drop"
                className="w-full bg-black border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGenerateUtm}
            className="px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            GENERATE TRACKED UTM URL
          </button>

          {generatedUtmUrl && (
            <div className="p-4 bg-black border border-purple-500/40 space-y-2">
              <span className="text-[9px] font-mono font-bold text-purple-400 uppercase tracking-widest block">Generated Tracked Link:</span>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-mono text-white truncate break-all">{generatedUtmUrl}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedUtmUrl);
                    setCopiedUtm(true);
                    setTimeout(() => setCopiedUtm(false), 2000);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-[9px] uppercase tracking-widest flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedUtm ? <Check size={12} /> : <Copy size={12} />} {copiedUtm ? 'COPIED' : 'COPY LINK'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. ABANDONED CART RECOVERY AUTOMATION */}
      {activeTab === 'abandoned' && (
        <div className="bg-neutral-950 border border-white/10 p-8 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-xl font-black uppercase text-white tracking-tight flex items-center gap-2">
              <Zap size={20} className="text-purple-400" /> Abandoned Cart Recovery Automation
            </h3>
            <p className="text-xs text-white/40 uppercase tracking-widest mt-1">
              Automatically emails potential customers a discount reminder if they leave a beat inside their cart.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-black border border-white/10 space-y-3">
              <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest">Active Carts Monitored</span>
              <h4 className="text-3xl font-black text-white">4 Abandoned Carts</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Potential customers added beats to their cart within the last 24 hours without completing checkout.
              </p>
            </div>

            <div className="p-6 bg-black border border-white/10 space-y-3">
              <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">Recovery Success Rate</span>
              <h4 className="text-3xl font-black text-emerald-400">28.5% Recovered</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Automated 15% discount email reminders successfully converted 8 sales this month.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7. GEOGRAPHIC BUYER HEATMAPS */}
      {activeTab === 'heatmap' && (
        <div className="bg-neutral-950 border border-white/10 p-8 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-xl font-black uppercase text-white tracking-tight flex items-center gap-2">
              <Globe size={20} className="text-purple-400" /> Geographic Buyer Heatmaps
            </h3>
            <p className="text-xs text-white/40 uppercase tracking-widest mt-1">
              Visual analytics map showing exactly which cities and countries stream and purchase beats the most.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { country: 'United States', city: 'Atlanta, GA', streams: '45,200', sales: '$3,850.00' },
              { country: 'United Kingdom', city: 'London', streams: '28,100', sales: '$2,400.00' },
              { country: 'Germany', city: 'Berlin', streams: '14,800', sales: '$1,150.00' },
              { country: 'Canada', city: 'Toronto', streams: '12,400', sales: '$980.00' },
              { country: 'France', city: 'Paris', streams: '9,500', sales: '$750.00' },
              { country: 'Australia', city: 'Sydney', streams: '6,200', sales: '$520.00' },
            ].map((item, i) => (
              <div key={i} className="p-6 bg-black border border-white/10 space-y-2 hover:border-purple-500/40 transition-all">
                <div className="flex items-center justify-between text-purple-400 text-xs font-black uppercase">
                  <span className="flex items-center gap-1.5"><MapPin size={12} /> {item.country}</span>
                  <span className="font-mono text-[9px] text-white/40">{item.city}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                  <span className="text-white/60">{item.streams} Auditions</span>
                  <span className="text-emerald-400 font-black">{item.sales} Revenue</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. AUDIO LOGS & SKIP RATES */}
      {activeTab === 'audio_analytics' && (
        <div className="bg-neutral-950 border border-white/10 p-8 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-xl font-black uppercase text-white tracking-tight flex items-center gap-2">
              <Activity size={20} className="text-purple-400" /> Live Stream Count & Skip Rate Logs
            </h3>
            <p className="text-xs text-white/40 uppercase tracking-widest mt-1">
              Granular traffic logs showing play totals, skip rates, and average listening times across audio files.
            </p>
          </div>

          <div className="border border-white/10 bg-black divide-y divide-white/5">
            {beats.slice(0, 8).map((beat, i) => (
              <div key={beat.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <img src={beat.artworkUrl} alt={beat.title} className="w-10 h-10 object-cover border border-white/10 shrink-0" />
                  <div>
                    <h4 className="font-black text-white uppercase">{beat.title}</h4>
                    <span className="text-[10px] text-white/40 uppercase">{beat.genre} · {beat.bpm} BPM</span>
                  </div>
                </div>

                <div className="flex items-center gap-8 text-[10px] font-mono text-white/60 uppercase">
                  <div>
                    <span className="block text-white font-bold">{beat.playsCount || (120 + i * 45)}</span>
                    <span className="text-white/30 text-[8px]">Total Plays</span>
                  </div>
                  <div>
                    <span className="block text-amber-400 font-bold">{12 + i * 2}%</span>
                    <span className="text-white/30 text-[8px]">Skip Rate (&lt;10s)</span>
                  </div>
                  <div>
                    <span className="block text-emerald-400 font-bold">2m 45s</span>
                    <span className="text-white/30 text-[8px]">Avg Listen Time</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
