import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { auth } from '../../lib/firebase';

export const PayPalConnectionArea = () => {
  const [status, setStatus] = React.useState<'NOT_CONNECTED' | 'PENDING' | 'CONNECTED'>('NOT_CONNECTED');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/producers/status')
      .then(res => res.json())
      .then(data => {
        setStatus(data.status || 'NOT_CONNECTED');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleConnect = async () => {
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const response = await fetch('/api/paypal/onboarding/create', { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      const data = await response.json();
      if (data.actionUrl) {
        window.location.href = data.actionUrl;
      }
    } catch (error) {
      console.error('Failed to initiate PayPal onboarding:', error);
    }
  };

  if (loading) return null;

  const buttonText = status === 'CONNECTED' ? 'Manage PayPal Connection' : (status === 'PENDING' ? 'Finish PayPal Setup' : 'Connect PayPal');
  const statusText = status === 'CONNECTED' ? '● CONNECTED' : (status === 'PENDING' ? '● PENDING' : '● NOT CONNECTED');

  return (
    <div className="p-8 bg-neutral-950 border border-white/10 rounded-sm space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <ShieldCheck size={18} className="text-blue-400" />
          <h3 className="text-2xl font-black uppercase text-white tracking-tight">
            5. PayPal Marketplace Integration
          </h3>
        </div>
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
            {statusText}
        </span>
      </div>

      <button
        type="button"
        onClick={handleConnect}
        className="px-8 py-4 bg-blue-600 text-white font-black uppercase tracking-[0.25em] text-xs hover:bg-blue-500 transition-all active:scale-95 shadow-lg"
      >
        {buttonText}
      </button>
    </div>
  );
};
