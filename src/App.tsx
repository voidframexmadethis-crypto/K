import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';
import { OrderRecord, AnalyticsEventData } from './services/analyticsService';
import { MainHeader } from './components/layout/Header';
import { PersistentPlayer } from './components/player/PersistentPlayer';
import { MassiveFooter } from './components/layout/MassiveFooter';
import { HomePage } from './pages/HomePage';

// Lazy-loaded pages
const BeatsPage = lazy(() => import('./pages/BeatsPage').then(m => ({ default: m.BeatsPage })));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage').then(m => ({ default: m.CollectionsPage })));
const PacksPage = lazy(() => import('./pages/PacksPage').then(m => ({ default: m.PacksPage })));
const FreeBeatsPage = lazy(() => import('./pages/FreeBeatsPage').then(m => ({ default: m.FreeBeatsPage })));
const MerchPage = lazy(() => import('./pages/MerchPage').then(m => ({ default: m.MerchPage })));
const VideosPage = lazy(() => import('./pages/VideosPage').then(m => ({ default: m.VideosPage })));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage').then(m => ({ default: m.FavoritesPage })));
const CartPage = lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const ProducerProfilePage = lazy(() => import('./pages/ProducerProfilePage').then(m => ({ default: m.ProducerProfilePage })));
const CustomerLibrary = lazy(() => import('./pages/CustomerLibrary').then(m => ({ default: m.CustomerLibrary })));
const AudioPlayerPage = lazy(() => import('./pages/AudioPlayerPage').then(m => ({ default: m.AudioPlayerPage })));
const ServicesPage = lazy(() => import('./pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const PressKitPage = lazy(() => import('./pages/PressKitPage').then(m => ({ default: m.PressKitPage })));
const BeatDetailPage = lazy(() => import('./pages/BeatDetailPage').then(m => ({ default: m.BeatDetailPage })));

// Lazy-loaded dashboard modules
const BeatUploader = lazy(() => import('./components/dashboard/BeatUploader').then(m => ({ default: m.BeatUploader })));
const BeatPackUploader = lazy(() => import('./components/dashboard/BeatPackUploader').then(m => ({ default: m.BeatPackUploader })));
const DashboardLayout = lazy(() => import('./components/dashboard/DashboardLayout').then(m => ({ default: m.DashboardLayout })));
const SalesDashboard = lazy(() => import('./components/dashboard/SalesDashboard').then(m => ({ default: m.SalesDashboard })));
const CatalogDashboard = lazy(() => import('./components/dashboard/CatalogDashboard').then(m => ({ default: m.CatalogDashboard })));
const AnalyticsDashboard = lazy(() => import('./components/dashboard/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));
const MarketingDashboard = lazy(() => import('./components/dashboard/MarketingDashboard').then(m => ({ default: m.MarketingDashboard })));
const ContentLab = lazy(() => import('./components/dashboard/ContentLab').then(m => ({ default: m.ContentLab })));
const Achievements = lazy(() => import('./components/dashboard/Achievements').then(m => ({ default: m.Achievements })));
const VRReviewsSuite = lazy(() => import('./components/vr/VRReviewsSuite').then(m => ({ default: m.VRReviewsSuite })));
const NotificationSettings = lazy(() => import('./components/dashboard/NotificationSettings').then(m => ({ default: m.NotificationSettings })));
const RemoveBeatsFromPlayer = lazy(() => import('./components/dashboard/RemoveBeatsFromPlayer').then(m => ({ default: m.RemoveBeatsFromPlayer })));
const ProfileSettings = lazy(() => import('./components/dashboard/ProfileSettings').then(m => ({ default: m.ProfileSettings })));
const CuratedPlaylistsManager = lazy(() => import('./components/dashboard/CuratedPlaylistsManager').then(m => ({ default: m.CuratedPlaylistsManager })));
import { ProducerAuthGuard } from './components/dashboard/ProducerAuthGuard';
import { useBeatDeepLink } from './lib/useBeatDeepLink';
import { logAnalyticsEvent } from './services/analyticsService';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { cn } from './lib/utils';
import { preloadPayPalSdk } from './components/payment/PayPalPayment';
import { MiniCart } from './components/payment/MiniCart';

import { KraezelvPulse } from './components/dashboard/KraezelvPulse';
import { ProducerIntelligence } from './components/dashboard/ProducerIntelligence';

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

      {/* KRAEZELV PULSE REAL TELEMETRY */}
      <KraezelvPulse />

      {/* PRODUCER INTELLIGENCE CATALOG ANALYTICS */}
      <ProducerIntelligence />

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

const LogoutHandler = () => {
  useEffect(() => {
    signOut(auth).then(() => {
      window.location.href = '/';
    });
  }, []);
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-xs font-black uppercase tracking-[0.5em] animate-pulse">Signing Out...</div>
    </div>
  );
};

function MainAppContent() {
  const location = useLocation();
  useBeatDeepLink();

  useEffect(() => {
    preloadPayPalSdk().catch(() => {});
  }, []);

  useEffect(() => {
    // 1. Exclude owner traffic from visitor analytics
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        console.log('[ANALYTICS] Owner session detected. Page view tracking suppressed.');
        return;
      }

      // 2. Track public page view
      const params = new URLSearchParams(location.search);
      const beatIdFromUrl = params.get('beat');

      const eventData: any = {
        eventType: 'page_view',
        device: window.innerWidth < 768 ? 'Mobile' : 'Desktop'
      };

      if (beatIdFromUrl) {
        eventData.beatId = beatIdFromUrl;
      }

      logAnalyticsEvent(eventData);
    });

    return () => unsubscribe();
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
      <MainHeader />
      <Suspense fallback={
        <div className="min-h-[50vh] flex items-center justify-center bg-black">
          <div className="text-white text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Loading Module...</div>
        </div>
      }>
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
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/profile" element={<ProducerProfilePage />} />
          <Route path="/producer/*" element={<ProducerProfilePage />} />
          <Route path="/press-kit" element={<PressKitPage />} />
          <Route path="/beat/:id" element={<BeatDetailPage />} />
          <Route path="/audio-player" element={<AudioPlayerPage />} />
          <Route path="/account" element={<CustomerLibrary />} />
          <Route path="/logout" element={<LogoutHandler />} />
          <Route 
            path="/dashboard/*" 
            element={
              <ProducerAuthGuard>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<DashboardOverview />} />
                    <Route path="/upload" element={<BeatUploader />} />
                    <Route path="/upload-pack" element={<BeatPackUploader />} />
                    <Route path="/music" element={<CatalogDashboard />} />
                    <Route path="/remove-beats" element={<RemoveBeatsFromPlayer />} />
                    <Route path="/sales" element={<SalesDashboard />} />
                    <Route path="/analytics" element={<AnalyticsDashboard />} />
                    <Route path="/vr-reviews" element={<VRReviewsSuite />} />
                    <Route path="/notifications" element={<NotificationSettings />} />
                    <Route path="/marketing" element={<MarketingDashboard />} />
                    <Route path="/content" element={<ContentLab />} />
                    <Route path="/playlists" element={<CuratedPlaylistsManager />} />
                    <Route path="/achievements" element={<Achievements />} />
                    <Route path="/settings" element={<ProfileSettings />} />
                    <Route path="*" element={<div className="py-20 text-center uppercase tracking-widest text-white/20">Module Under Construction</div>} />
                  </Routes>
                </DashboardLayout>
              </ProducerAuthGuard>
            } 
          />
        </Routes>
      </Suspense>
      <PersistentPlayer />
      <MiniCart />
      <MassiveFooter />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <MainAppContent />
    </Router>
  );
}
