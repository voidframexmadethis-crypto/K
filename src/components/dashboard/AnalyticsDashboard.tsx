import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { AnalyticsEventData, logAnalyticsEvent } from '../../services/analyticsService';
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
  Glasses
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
  const totalPlays = events.filter(e => e.eventType === 'play').length;
  const totalViews = events.filter(e => e.eventType === 'page_view').length;
  const totalCartAdds = events.filter(e => e.eventType === 'cart_add').length;
  const totalCheckouts = events.filter(e => e.eventType === 'checkout_completed').length;
  const totalVRViews = events.filter(e => e.eventType === 'vr_view').length;

  // Geo breakdown
  const geoCounts: Record<string, number> = {};
  events.forEach(e => {
    if (e.country) {
      geoCounts[e.country] = (geoCounts[e.country] || 0) + 1;
    }
  });

  // Device breakdown
  const deviceCounts: Record<string, number> = {};
  events.forEach(e => {
    if (e.device) {
      deviceCounts[e.device] = (deviceCounts[e.device] || 0) + 1;
    }
  });

  // Simulated trigger to test real-time event logging
  const simulateLiveEvent = (type: AnalyticsEventData['eventType']) => {
    logAnalyticsEvent({
      eventType: type,
      beatTitle: 'Kraezelv Heavy Trap',
      amount: type === 'checkout_completed' ? 79.99 : undefined
    });
  };

  return (
    <div className="flex flex-col gap-10 text-white">
      {/* Header & Simulated Live Event Trigger Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="text-emerald-400" size={28} />
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
              Real-Time Store Analytics Engine
            </h2>
            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Firestore Stream
            </span>
          </div>
          <p className="text-white/50 text-xs">
            Live interaction telemetry, audio stream events, device distribution, and buyer conversion funnels.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-2 border border-white/10">
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 px-2">Test Telemetry:</span>
          <button 
            onClick={() => simulateLiveEvent('play')} 
            className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase hover:bg-emerald-500/30 border border-emerald-500/40"
          >
            + Play
          </button>
          <button 
            onClick={() => simulateLiveEvent('cart_add')} 
            className="px-2.5 py-1 bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase hover:bg-purple-500/30 border border-purple-500/40"
          >
            + Cart
          </button>
          <button 
            onClick={() => simulateLiveEvent('checkout_completed')} 
            className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase hover:bg-amber-500/30 border border-amber-500/40"
          >
            + Sale
          </button>
        </div>
      </div>

      {/* Live Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 border border-white/10 bg-black/80 flex flex-col gap-2">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-[10px] font-bold uppercase tracking-widest">Audio Plays</span>
            <Play size={16} className="text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-white tabular-nums">{totalPlays}</span>
          <span className="text-[9px] text-emerald-400 font-bold uppercase">Real Stream Hits</span>
        </div>

        <div className="p-5 border border-white/10 bg-black/80 flex flex-col gap-2">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-[10px] font-bold uppercase tracking-widest">Page Impressions</span>
            <Eye size={16} className="text-blue-400" />
          </div>
          <span className="text-3xl font-black text-white tabular-nums">{totalViews}</span>
          <span className="text-[9px] text-blue-400 font-bold uppercase">Storefront Views</span>
        </div>

        <div className="p-5 border border-white/10 bg-black/80 flex flex-col gap-2">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-[10px] font-bold uppercase tracking-widest">Cart Additions</span>
            <ShoppingCart size={16} className="text-purple-400" />
          </div>
          <span className="text-3xl font-black text-white tabular-nums">{totalCartAdds}</span>
          <span className="text-[9px] text-purple-400 font-bold uppercase">Intent Signals</span>
        </div>

        <div className="p-5 border border-white/10 bg-black/80 flex flex-col gap-2">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-[10px] font-bold uppercase tracking-widest">Completed Sales</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-emerald-400 tabular-nums">{totalCheckouts}</span>
          <span className="text-[9px] text-emerald-400 font-bold uppercase">Conversions</span>
        </div>

        <div className="p-5 border border-white/10 bg-black/80 flex flex-col gap-2">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-[10px] font-bold uppercase tracking-widest">VR Studio Sessions</span>
            <Glasses size={16} className="text-amber-400" />
          </div>
          <span className="text-3xl font-black text-white tabular-nums">{totalVRViews}</span>
          <span className="text-[9px] text-amber-400 font-bold uppercase">Headset Sessions</span>
        </div>
      </div>

      {/* Main Grid: Live Event Log Feed & Distribution Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Real-time Activity Log */}
        <div className="lg:col-span-7 border border-white/10 bg-black/80 p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2 text-white">
              <Activity size={16} className="text-emerald-400" />
              Live Telemetry Event Log
            </h3>
            <span className="text-[9px] text-white/40 font-mono">Top {events.length} Recent Events</span>
          </div>

          <div className="divide-y divide-white/5 max-h-96 overflow-y-auto pr-2">
            {loading ? (
              <div className="p-8 text-center text-white/30 text-xs uppercase">Loading Firestore events...</div>
            ) : events.length === 0 ? (
              <div className="p-8 text-center text-white/30 text-xs uppercase">
                No telemetry events logged yet. Play audio tracks or click the test buttons above to see events stream live!
              </div>
            ) : (
              events.map((evt) => (
                <div key={evt.id} className="py-3 flex items-center justify-between text-xs hover:bg-white/[0.02] px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${
                      evt.eventType === 'checkout_completed' ? 'bg-emerald-400' :
                      evt.eventType === 'play' ? 'bg-blue-400' :
                      evt.eventType === 'cart_add' ? 'bg-purple-400' : 'bg-white/40'
                    }`} />
                    <div>
                      <span className="font-bold uppercase text-[10px] tracking-wider text-white">
                        {evt.eventType.replace('_', ' ')}
                      </span>
                      {evt.beatTitle && (
                        <span className="text-white/60 ml-2 text-[11px]">— {evt.beatTitle}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] text-white/40 font-mono">
                    <span>{evt.device}</span>
                    <span>{evt.country}</span>
                    {evt.amount && (
                      <span className="font-black text-emerald-400">${evt.amount}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Breakdown: Geo & Devices */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Geo Distribution */}
          <div className="border border-white/10 bg-black/80 p-6 flex flex-col gap-4">
            <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2 text-white border-b border-white/10 pb-3">
              <Globe2 size={16} className="text-blue-400" />
              Listener Geographic Distribution
            </h3>

            <div className="flex flex-col gap-3">
              {Object.keys(geoCounts).length === 0 ? (
                <span className="text-xs text-white/30 italic">No geographic data logged yet.</span>
              ) : (
                Object.entries(geoCounts).slice(0, 5).map(([country, count]) => {
                  const pct = Math.round((count / events.length) * 100) || 0;
                  return (
                    <div key={country} className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/80 font-medium">{country}</span>
                        <span className="text-emerald-400 font-bold">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Device Distribution */}
          <div className="border border-white/10 bg-black/80 p-6 flex flex-col gap-4">
            <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2 text-white border-b border-white/10 pb-3">
              <Smartphone size={16} className="text-purple-400" />
              Hardware & Headset Breakdown
            </h3>

            <div className="flex flex-col gap-3">
              {Object.keys(deviceCounts).length === 0 ? (
                <span className="text-xs text-white/30 italic">No device telemetry recorded yet.</span>
              ) : (
                Object.entries(deviceCounts).slice(0, 5).map(([dev, count]) => {
                  const pct = Math.round((count / events.length) * 100) || 0;
                  return (
                    <div key={dev} className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/80 font-medium">{dev}</span>
                        <span className="text-purple-400 font-bold">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
