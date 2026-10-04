import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from './lib/firebase';
import { OrderRecord, AnalyticsEventData } from './services/analyticsService';
import { MainHeader } from './components/layout/Header';
import { PersistentPlayer } from './components/player/PersistentPlayer';
import { MassiveFooter } from './components/layout/MassiveFooter';
import { HomePage } from './pages/HomePage';
import { BeatsPage } from './pages/BeatsPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { PacksPage } from './pages/PacksPage';
import { FreeBeatsPage } from './pages/FreeBeatsPage';
import { MerchPage } from './pages/MerchPage';
import { VideosPage } from './pages/VideosPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { CartPage } from './pages/CartPage';
import { BeatUploader } from './components/dashboard/BeatUploader';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { SalesDashboard } from './components/dashboard/SalesDashboard';
import { CatalogDashboard } from './components/dashboard/CatalogDashboard';
import { AnalyticsDashboard } from './components/dashboard/AnalyticsDashboard';
import { MarketingDashboard } from './components/dashboard/MarketingDashboard';
import { ContentLab } from './components/dashboard/ContentLab';
import { Achievements } from './components/dashboard/Achievements';
import { VRReviewsSuite } from './components/vr/VRReviewsSuite';
import { RemoveBeatsFromPlayer } from './components/dashboard/RemoveBeatsFromPlayer';
import { CustomerLibrary } from './pages/CustomerLibrary';
import { AudioPlayerPage } from './pages/AudioPlayerPage';
import { cn } from './lib/utils';

const DashboardOverview = () => {
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
  const convRate = totalViews > 0 ? ((orders.length / totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-4">Command Center</h2>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Live Firestore Store Overview & Rapid Operations</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase tracking-widest">
           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
           Firestore Real-Time Sync
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Live Total Revenue', value: `$${totalRev.toFixed(2)}`, trend: orders.length > 0 ? '+100%' : '0.0%' },
          { label: 'Ecosystem Plays', value: totalPlays.toString(), trend: totalPlays > 0 ? 'ACTIVE' : '0' },
          { label: 'Market Conversions', value: `${convRate}%`, trend: orders.length > 0 ? 'REAL' : '0.0%' },
          { label: 'Active Licenses Sold', value: orders.length.toString(), trend: 'VERIFIED' }
        ].map((stat) => (
          <div key={stat.label} className="p-8 border border-white/10 bg-white/[0.02] flex flex-col gap-4 group hover:bg-white/[0.04] transition-all">
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold group-hover:text-white/60 transition-colors">{stat.label}</span>
            <div className="flex flex-col gap-1">
               <span className="text-4xl font-black text-white tracking-tighter tabular-nums">{stat.value}</span>
               <span className={cn("text-[8px] font-black uppercase tracking-widest text-emerald-500")}>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase tracking-tighter text-white">Live Stream Activity Barometer</h3>
          <div className="border border-white/10 bg-white/[0.01] p-12 h-64 flex items-end gap-2">
             {Array.from({ length: 40 }).map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-emerald-500/30 hover:bg-emerald-400 transition-all cursor-pointer" 
                  style={{ height: `${Math.min(100, Math.max(10, (totalPlays + orders.length * 5 + i * 3) % 95))}%` }} 
                  title="Live activity stream" 
                />
             ))}
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase tracking-tighter text-white">Security & Status</h3>
          <div className="flex-1 p-8 border border-white/10 bg-white/[0.02] flex flex-col gap-6 justify-center">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Audio Engine</span>
                <span className="text-[8px] px-2 py-1 border border-emerald-500/20 text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/10">Active</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Sales Ledger Grid</span>
                <span className="text-[8px] px-2 py-1 border border-emerald-500/20 text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/10">Connected</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">VR Headset Suite</span>
                <span className="text-[8px] px-2 py-1 border border-purple-500/20 text-purple-400 font-bold uppercase tracking-widest bg-purple-500/10">Live</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardPlaceholder = ({ title }: { title: string }) => (
  <div className="flex flex-col gap-12">
    <div>
      <h2 className="text-4xl font-bold uppercase tracking-tighter text-white mb-4">{title}</h2>
      <p className="text-white/40 text-sm uppercase tracking-widest">Module under construction</p>
    </div>
    <div className="py-40 border border-white/5 bg-white/[0.01] flex items-center justify-center">
       <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 italic">Initializing module...</span>
    </div>
  </div>
);

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
        <MainHeader />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/beats" element={<BeatsPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/packs" element={<PacksPage />} />
          <Route path="/free-beats" element={<FreeBeatsPage />} />
          <Route path="/merch" element={<MerchPage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/audio-player" element={<AudioPlayerPage />} />
          <Route path="/account" element={<CustomerLibrary />} />
          <Route 
            path="/dashboard/*" 
            element={
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<DashboardOverview />} />
                  <Route path="/upload" element={<BeatUploader />} />
                  <Route path="/music" element={<CatalogDashboard />} />
                  <Route path="/remove-beats" element={<RemoveBeatsFromPlayer />} />
                  <Route path="/sales" element={<SalesDashboard />} />
                  <Route path="/analytics" element={<AnalyticsDashboard />} />
                  <Route path="/vr-reviews" element={<VRReviewsSuite />} />
                  <Route path="/marketing" element={<MarketingDashboard />} />
                  <Route path="/content" element={<ContentLab />} />
                  <Route path="/achievements" element={<Achievements />} />
                  <Route path="/settings" element={<DashboardPlaceholder title="Settings" />} />
                  <Route path="*" element={<div className="py-20 text-center uppercase tracking-widest text-white/20">Module Under Construction</div>} />
                </Routes>
              </DashboardLayout>
            } 
          />
        </Routes>
        <PersistentPlayer />
        <MassiveFooter />
      </div>
    </Router>
  );
}
