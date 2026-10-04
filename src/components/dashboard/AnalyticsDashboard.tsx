import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { AnalyticsEventData } from '../../services/analyticsService';
import { 
  BarChart3, 
  Activity, 
  Play, 
  Eye, 
  ShoppingCart, 
  CheckCircle2, 
  Globe2, 
  Smartphone, 
  Zap,
  Glasses,
  Users,
  Download
} from 'lucide-react';

export const AnalyticsDashboard = () => {
  const [events, setEvents] = useState<AnalyticsEventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'analytics_events'), 
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: AnalyticsEventData[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AnalyticsEventData[];
      setEvents(fetched);
      setLoading(false);
    }, (err) => {
      console.warn('Analytics snapshot error:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Compute metrics from live Firestore events
  // Filter out admin activity (KRAEZELVbeatz admin assumed)
  const isOwnerActivity = (e: AnalyticsEventData) => e.device?.includes('Desktop'); // Simple heuristic based on current store usage
  const customerEvents = events.filter(e => !isOwnerActivity(e));
  
  const totalPlays = customerEvents.filter(e => e.eventType === 'play').length;
  const totalViews = customerEvents.filter(e => e.eventType === 'page_view').length;
  const totalFreeDownloads = customerEvents.filter(e => e.eventType === 'free_download').length;
  const totalCheckouts = customerEvents.filter(e => e.eventType === 'checkout_completed').length;
  const totalAdClicks = customerEvents.filter(e => e.eventType === 'ad_click').length;

  // Aggregate stats per beat
  const beatStats: Record<string, { views: number, downloads: number, purchases: number, adClicks: number }> = {};
  customerEvents.forEach(e => {
    if (!e.beatId) return;
    if (!beatStats[e.beatId]) beatStats[e.beatId] = { views: 0, downloads: 0, purchases: 0, adClicks: 0 };
    
    if (e.eventType === 'page_view') beatStats[e.beatId].views++;
    if (e.eventType === 'free_download') beatStats[e.beatId].downloads++;
    if (e.eventType === 'checkout_completed') beatStats[e.beatId].purchases++;
    if (e.eventType === 'ad_click') beatStats[e.beatId].adClicks++;
  });

  const topBeats = Object.entries(beatStats)
    .map(([id, stats]) => {
      const beat = events.find(e => e.beatId === id);
      return { id, title: beat?.beatTitle || 'Unknown Beat', ...stats };
    })
    .sort((a, b) => (b.views + b.downloads * 2 + b.purchases * 5 + b.adClicks) - (a.views + a.downloads * 2 + a.purchases * 5 + a.adClicks));

  return (
    <div className="flex flex-col gap-10 text-white p-4">
      {/* Date Range Selector Placeholder */}
      <div className="flex justify-end gap-2 text-xs">
        {['Today', '7 Days', '30 Days', 'All Time'].map(range => (
          <button key={range} className="px-3 py-1 bg-white/5 hover:bg-white/10 uppercase tracking-widest">{range}</button>
        ))}
      </div>

      {/* Live Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Visits', value: totalViews, icon: Eye, color: 'blue' },
          { label: 'Free Downloads', value: totalFreeDownloads, icon: Download, color: 'purple' },
          { label: 'Paid Purchases', value: totalCheckouts, icon: CheckCircle2, color: 'emerald' },
          { label: 'Ad Clicks', value: totalAdClicks, icon: Zap, color: 'amber' },
          { label: 'Subscribers', value: '0', icon: Users, color: 'rose' },
        ].map(m => (
          <div key={m.label} className="p-4 border border-white/10 bg-black/80 flex flex-col gap-1">
            <div className="flex justify-between text-white/40">
              <span className="text-[9px] font-bold uppercase tracking-widest">{m.label}</span>
              <m.icon size={12} className={`text-${m.color}-400`} />
            </div>
            <span className="text-2xl font-black">{m.value}</span>
            <span className="text-[8px] text-white/30 uppercase">↑ 0.0% vs prev</span>
          </div>
        ))}
      </div>

      {/* Top Performing Beats */}
      <div className="border border-white/10 bg-black/80 p-6">
        <h3 className="font-black text-sm uppercase tracking-wider mb-6">Top Performing Beats</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topBeats.slice(0, 4).map(b => (
            <div key={b.id} className="flex gap-4 p-4 bg-white/5 border border-white/5">
              <div className="w-16 h-16 bg-white/10" />
              <div className="flex-1">
                <h4 className="font-bold text-sm">{b.title}</h4>
                <div className="grid grid-cols-4 gap-2 text-[9px] mt-2 text-white/50">
                  <span>{b.views} Views</span>
                  <span>{b.downloads} DLs</span>
                  <span>{b.purchases} Sales</span>
                  <span>{b.adClicks} AdClicks</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
