import React, { useState, useEffect, useRef } from 'react';
import { X, Download, CheckCircle2, Mail, Lock, ArrowRight } from 'lucide-react';
import { Beat } from '../../types';
import { BEEHIIV_FORM_ID, BEEHIIV_CONFIG } from '../../config/beehiiv';

interface FreeDownloadModalProps {
  beat: Beat | null;
  isOpen: boolean;
  onClose: () => void;
  onDownloadSuccess?: () => void;
}

export const FreeDownloadModal: React.FC<FreeDownloadModalProps> = ({
  beat,
  isOpen,
  onClose,
  onDownloadSuccess
}) => {
  if (!isOpen || !beat) return null;

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const hiddenFormRef = useRef<HTMLFormElement | null>(null);

  const currentSiteOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentBeatShareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?beat=${beat.id}` : '';

  // Load official Beehiiv v3 script loader
  useEffect(() => {
    const scriptId = 'beehiiv-v3-loader-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = BEEHIIV_CONFIG.LOADER_SCRIPT_URL;
      script.async = true;
      script.setAttribute('data-beehiiv-form', BEEHIIV_FORM_ID);
      document.body.appendChild(script);
    }
  }, []);

  const handleDownloadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      // 1. Record lead subscriber in store analytics with current storefront context
      try {
        const { recordLeadSubscriber } = await import('../../services/analyticsService');
        await recordLeadSubscriber({
          email,
          beatId: beat.id,
          beatTitle: beat.title,
          storefrontUrl: currentSiteOrigin,
          beatUrl: currentBeatShareUrl,
          source: `Free Download Gate (${currentSiteOrigin} - Beehiiv Form: ${BEEHIIV_FORM_ID})`
        });
      } catch (err) {
        console.warn('Analytics lead recording note:', err);
      }

      // 2. Submit to official Beehiiv Subscribe Form ID 1568b345-dd13-4b23-92cb-19b4cde83232
      if (hiddenFormRef.current) {
        hiddenFormRef.current.submit();
      }

      // Fallback cross-origin post to Beehiiv form endpoint
      try {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('form_id', BEEHIIV_FORM_ID);
        formData.append('store_url', currentSiteOrigin);
        formData.append('redirect_url', currentBeatShareUrl);
        fetch(BEEHIIV_CONFIG.FORM_ACTION_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: formData
        }).catch(() => {});
      } catch (e) {}

      setIsSuccess(true);

      // 3. Trigger browser download of untagged/free audio file
      const downloadLink = document.createElement('a');
      downloadLink.href = beat.audioUrl || '#';
      downloadLink.download = `${beat.title}_Free_Download.mp3`;
      downloadLink.target = '_blank';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      if (onDownloadSuccess) {
        onDownloadSuccess();
      }

      setTimeout(() => {
        setIsSuccess(false);
        setIsSubmitting(false);
        setEmail('');
        onClose();
      }, 3500);

    } catch (err: any) {
      setErrorMessage('Download failed to initialize. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[350] flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-neutral-950 border border-white/10 p-6 md:p-8 shadow-[0_0_100px_rgba(0,0,0,0.9)] overflow-hidden rounded-sm text-white">
        
        {/* Hidden Form for Beehiiv Target Submission */}
        <form
          ref={hiddenFormRef}
          action={BEEHIIV_CONFIG.FORM_ACTION_URL}
          method="POST"
          target="beehiiv_hidden_frame"
          className="hidden"
        >
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="form_id" value={BEEHIIV_FORM_ID} />
          <input type="hidden" name="store_url" value={currentSiteOrigin} />
          <input type="hidden" name="redirect_url" value={currentBeatShareUrl} />
        </form>
        <iframe name="beehiiv_hidden_frame" id="beehiiv_hidden_frame" className="hidden" title="Beehiiv Target" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/40 hover:text-white border border-white/10 hover:border-white transition-all rounded-sm"
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-6">
          <img src={beat.artworkUrl} alt={beat.title} className="w-16 h-16 object-cover border border-white/10 grayscale shrink-0" />
          <div className="min-w-0">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400 block mb-1">
              Free Download Unlock
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-white truncate tracking-tight">{beat.title}</h3>
            <p className="text-[10px] text-white/50 uppercase font-mono mt-0.5">{beat.producerId} · {beat.bpm} BPM · {beat.key}</p>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-sm flex flex-col items-center justify-center text-center gap-3">
            <CheckCircle2 size={40} className="text-emerald-400 animate-bounce" />
            <h4 className="text-lg font-black uppercase tracking-wider text-white">Download Started!</h4>
            <p className="text-xs text-white/70 max-w-xs leading-relaxed">
              Your free copy of <strong className="text-white">{beat.title}</strong> is downloading now.
            </p>
            <span className="text-[9px] font-mono text-emerald-400 uppercase mt-2">Subscribed to Bucky's Newsletter</span>
          </div>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleDownloadSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-widest text-white/80 flex items-center gap-2">
                    <Mail size={14} className="text-emerald-400" /> Enter Email Address
                  </label>
                  <span className="text-[9px] font-mono text-white/40 uppercase">Beehiiv Gate Active</span>
                </div>

                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="producer@example.com"
                  className="w-full bg-white/5 border border-white/20 p-4 text-sm font-medium text-white outline-none focus:border-emerald-400 transition-colors rounded-sm"
                />
                {errorMessage && (
                  <p className="text-xs text-red-400 font-mono tracking-wide">{errorMessage}</p>
                )}
              </div>

              <div className="p-3 bg-white/5 border border-white/5 rounded-sm flex items-center gap-3 text-[10px] text-white/60 uppercase font-medium">
                <Lock size={14} className="text-emerald-400 shrink-0" />
                <span>Subscribe to Bucky's Newsletter & unlock immediate high-res MP3 download.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Download size={16} /> Get Free Download <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            {/* Official Beehiiv Embedded Container Placeholder */}
            <div data-beehiiv-form={BEEHIIV_FORM_ID} className="hidden" />

            {/* Beehiiv Integration Badge */}
            <div className="text-center text-[8px] font-mono uppercase tracking-widest text-white/30 pt-2 border-t border-white/5">
              Powered by Beehiiv Form ID: {BEEHIIV_FORM_ID}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
