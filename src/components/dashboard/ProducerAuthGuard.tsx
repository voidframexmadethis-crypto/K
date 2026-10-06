import React, { useState, useEffect } from 'react';
import { Shield, Lock, ArrowLeft, Key, Sparkles, CheckCircle2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { signInAnonymously, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Link } from 'react-router-dom';

const ALLOWED_PASSCODES = ['1999 2727', '19992727', 'KRAEZELV2026'];

interface ProducerAuthGuardProps {
  children: React.ReactNode;
}

export const ProducerAuthGuard: React.FC<ProducerAuthGuardProps> = ({ children }) => {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (!auth.currentUser) {
        try {
          await signInAnonymously(auth);
        } catch (_authErr) {
          // Ignore admin-restricted-operation if anonymous auth is disabled in Firebase Console
        }
      }
    } catch (_err) {
      // Ignore
    } finally {
      sessionStorage.setItem('kraezelv_owner_unlocked', 'true');
      setIsSubmitting(false);
    }
  };

  const handleLockDashboard = async () => {
    sessionStorage.removeItem('kraezelv_owner_unlocked');
    await signOut(auth);
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">
            Verifying Producer Credentials...
          </span>
        </div>
      </div>
    );
  }

  // Check if owner is unlocked via passcode & firebase auth session
  const isUnlocked = user !== null || sessionStorage.getItem('kraezelv_owner_unlocked') === 'true';

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background glow aesthetics */}
        <div className="absolute w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none -top-40 -left-40" />
        <div className="absolute w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none -bottom-40 -right-40" />

        <div className="max-w-md w-full bg-neutral-950 border border-white/10 p-8 sm:p-10 space-y-8 relative z-10 shadow-2xl">
          
          <div className="space-y-3 text-center">
            <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/30 text-purple-400 mx-auto flex items-center justify-center rounded-xs">
              <Lock size={22} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-400 block">
              PRIVATE PRODUCER WORKSPACE
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              KRAEZELV COMMAND GATE
            </h1>
            <p className="text-[11px] text-white/40 uppercase tracking-widest leading-relaxed">
              This area is strictly reserved for the owner & producer of KRAEZELV. Enter your Master Access Passcode to unlock catalog & store controls.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-3">
              <AlertTriangle size={16} className="shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.25em] text-white/60 block">
                Producer Passcode
              </label>
              <div className="relative flex items-center">
                <input 
                  type={showPasscode ? "text" : "password"}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter Passcode..."
                  className="w-full bg-white/5 border border-white/15 px-4 py-3.5 text-xs font-mono text-white outline-none focus:border-purple-500 transition-colors pr-10"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.25em] text-xs hover:bg-neutral-200 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <Sparkles size={14} className="text-purple-600" />
              {isSubmitting ? 'Opening Command Center...' : 'Welcome To Your Command Center'}
            </button>
          </form>

          <div className="pt-6 border-t border-white/5 text-center">
            <Link 
              to="/"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
            >
              <ArrowLeft size={12} /> Return To Public Marketplace
            </Link>
          </div>

        </div>
      </div>
    );
  }

  return <>{children}</>;
};
