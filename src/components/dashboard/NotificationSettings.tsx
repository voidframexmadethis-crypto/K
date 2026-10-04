import React, { useState } from 'react';
import { Bell, Shield, Smartphone } from 'lucide-react';
import { cn } from '../../lib/utils';
import { auth } from '../../lib/firebase';

export const NotificationSettings = () => {
  const [enabled, setEnabled] = useState(false);

  const [settings, setSettings] = useState({
    newSale: true,
    freeDownload: true,
    newSubscriber: true,
    newCustomer: true,
    paymentFailure: true,
    systemError: true,
  });

  const requestPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setEnabled(true);
      registerServiceWorker();
    }
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const configRes = await fetch('/api/notifications/config');
        const { vapidPublicKey } = await configRes.json();

        if (!vapidPublicKey) {
          console.warn('[NOTIFICATIONS] VAPID Public Key missing from server config.');
          return;
        }

        const registration = await navigator.serviceWorker.register('/sw.js');
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidPublicKey
        });

        const subscriptionPayload = subscription && typeof subscription.toJSON === 'function'
          ? subscription.toJSON()
          : subscription;

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (auth.currentUser) {
          try {
            const idToken = await auth.currentUser.getIdToken();
            if (idToken) headers['Authorization'] = `Bearer ${idToken}`;
          } catch {
            // Non-blocking
          }
        }

        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers,
          body: JSON.stringify({ subscription: subscriptionPayload })
        });
      } catch (err) {
        console.error('[NOTIFICATIONS] Subscription failed:', err);
      }
    }
  };

  const sendTestNotification = async () => {
    await fetch('/api/notifications/test', { method: 'POST' });
  };

  return (
    <div className="space-y-8 text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Owner Notifications</h2>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Configure push notifications for store activity</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn("text-[10px] font-black uppercase tracking-widest", enabled ? "text-emerald-500" : "text-white/40")}>
            Push Notifications: {enabled ? 'ON' : 'OFF'}
          </span>
          {!enabled && (
            <button onClick={requestPermission} className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center gap-2">
              <Smartphone size={14} /> Enable Push
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(settings).map(([key, value]) => (
          <label key={key} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all cursor-pointer">
            <span className="text-xs font-bold uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</span>
            <input 
              type="checkbox" 
              checked={value}
              onChange={() => setSettings(prev => ({ ...prev, [key]: !prev[key] }))}
              className="w-5 h-5 accent-emerald-500"
            />
          </label>
        ))}
      </div>

      <div className="p-6 bg-neutral-900 border border-white/5 space-y-2">
         <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Producer Identity Session</label>
            <Shield size={12} className="text-emerald-400" />
         </div>
         <p className="text-xs font-mono text-white/70">
           {auth.currentUser ? `Signed In: ${auth.currentUser.email || auth.currentUser.uid}` : 'Producer Session: Active'}
         </p>
      </div>

      <button onClick={sendTestNotification} className="w-full py-6 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2">
        <Bell size={16} /> Send Test Notification
      </button>
    </div>
  );
};
