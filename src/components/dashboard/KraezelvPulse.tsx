import React, { useState, useEffect } from 'react';
import { Activity, Flame, DollarSign, Music, Play, Eye, ShoppingCart, Award } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { OrderRecord, AnalyticsEventData } from '../../services/analyticsService';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';

export const KraezelvPulse: React.FC = () => {
  const { beats } = useBeatCatalogStore();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [events, setEvents] = useState<AnalyticsEventData[]>([]);

  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      setOrders(snap.docs.map(doc => doc.data() as OrderRecord));
    }, () => {});

    const unsubEvents = onSnapshot(collection(db, 'analytics_events'), (snap) => {
      setEvents(snap.docs.map(doc => doc.data() as AnalyticsEventData));
    }, () => {});

    return () => {
      unsubOrders();
      unsubEvents();
    };
  }, []);

  const totalRev = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const totalPlays = events.filter(e => e.eventType === 'play').length;
  const totalViews = events.filter(e => e.eventType === 'page_view').length;

  return (
    <div className="bg-neutral-950 border border-purple-500/30 p-8 space-y-8 backdrop-blur-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-400 flex items-center gap-2">
            <Activity size={12} className="animate-pulse" /> LIVE TELEMETRY MATRIX
          </span>
          <h2 className="text-3xl font-black uppercase text-white tracking-tight">KRAEZELV PULSE</h2>
        </div>
        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-mono font-bold uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
          REAL-TIME FIRESTORE DATA ONLY
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white/[0.02] border border-white/10 space-y-2">
          <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block flex items-center gap-1.5">
            <Eye size={12} /> Total Store Visits
          </span>
          <span className="text-3xl font-black text-white font-mono">{totalViews}</span>
        </div>

        <div className="p-6 bg-white/[0.02] border border-white/10 space-y-2">
          <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block flex items-center gap-1.5">
            <Play size={12} /> Ecosystem Plays
          </span>
          <span className="text-3xl font-black text-purple-300 font-mono">{totalPlays}</span>
        </div>

        <div className="p-6 bg-white/[0.02] border border-white/10 space-y-2">
          <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block flex items-center gap-1.5">
            <ShoppingCart size={12} /> Completed Sales
          </span>
          <span className="text-3xl font-black text-emerald-400 font-mono">{orders.length}</span>
        </div>

        <div className="p-6 bg-white/[0.02] border border-white/10 space-y-2">
          <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block flex items-center gap-1.5">
            <DollarSign size={12} /> Gross Revenue
          </span>
          <span className="text-3xl font-black text-emerald-400 font-mono">${totalRev.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
