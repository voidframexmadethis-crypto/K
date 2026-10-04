import React, { useEffect, useState, useRef } from 'react';

interface PayPalButtonProps {
  amount: number;
  currency?: string;
  description?: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
}

export const PayPalPayment: React.FC<PayPalButtonProps> = ({
  amount,
  currency = 'USD',
  description = 'Digital Purchase',
  onSuccess,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [merchantEmail, setMerchantEmail] = useState<string>('kraezelvbeatz@gmail.com');
  const [retryKey, setRetryKey] = useState(0);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const renderedClientIdRef = useRef<string | null>(null);

  // Fetch Live Client ID and merchant email securely from backend proxy
  useEffect(() => {
    setLoadError(null);
    setIsLoaded(false);

    fetch('/api/config/paypal')
      .then(res => res.json())
      .then(data => {
        const rawId = data.clientId ? data.clientId.toString().trim() : '';
        const email = data.merchantEmail || 'kraezelvbeatz@gmail.com';
        
        console.log(`[PAYPAL_DIAGNOSTIC] PAYPAL_CLIENT_ID_PRESENT=${!!rawId}`);
        console.log(`[PAYPAL_DIAGNOSTIC] PAYPAL_HAS_SERVER_SECRET=${!!data.hasServerSecret}`);
        setClientId(rawId || import.meta.env.VITE_PAYPAL_CLIENT_ID || '');
        setMerchantEmail(email);
      })
      .catch(err => {
        console.warn('[PAYPAL_DIAGNOSTIC] Backend config fetch note, using env fallback:', err);
        setClientId(import.meta.env.VITE_PAYPAL_CLIENT_ID || '');
        setMerchantEmail('kraezelvbeatz@gmail.com');
      });
  }, [retryKey]);

  // Handle PayPal SDK Loading and Button Rendering cleanly without re-render loop
  useEffect(() => {
    if (!clientId) return;

    console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_SDK_LOADING');

    const sanitizedClientId = clientId.trim().replace(/^['"]|['"]$/g, '');

    // Safety timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!isLoaded) {
        console.warn('[PAYPAL_DIAGNOSTIC] PAYPAL_RENDER_FAILED: PayPal SDK loading timed out after 12s');
        setLoadError('PayPal secure gateway failed to initialize in time.');
      }
    }, 12000);

    const scriptId = 'paypal-js-sdk-live-unique';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initializeButtons = () => {
      console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_SDK_LOADED');
      const paypal = (window as any).paypal;

      const buttonsAvailable = !!(paypal && paypal.Buttons);
      console.log(`[PAYPAL_DIAGNOSTIC] PAYPAL_BUTTONS_AVAILABLE=${buttonsAvailable}`);

      if (!buttonsAvailable) {
        console.error('[PAYPAL_DIAGNOSTIC] PAYPAL_RENDER_FAILED: paypal.Buttons is undefined');
        setLoadError('PayPal SDK loaded but Buttons component is unavailable.');
        return;
      }

      if (buttonContainerRef.current) {
        buttonContainerRef.current.innerHTML = '';
        
        try {
          console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_BUTTON_INITIALIZED');
          const buttons = paypal.Buttons({
            style: {
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'pay'
            },
            createOrder: async (data: any, actions: any) => {
              console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_ORDER_CREATE_STARTED');
              try {
                const res = await fetch('/api/paypal/create-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ amount, currency, description })
                });

                const orderRes = await res.json();
                
                if (!res.ok || orderRes.success === false) {
                  const errName = orderRes.error || 'CREATE_ORDER_FAILED';
                  const errMsg = orderRes.message || `Server returned HTTP ${res.status}`;
                  console.error(`[PAYPAL_DIAGNOSTIC] PAYPAL_ORDER_CREATE_FAILED: HTTP ${res.status} - ${errName}: ${errMsg}`);
                  setLoadError(`Order creation error (${errName}): ${errMsg}`);
                  throw new Error(`Order Creation Error: ${errMsg}`);
                }

                if (orderRes.id) {
                  console.log(`[PAYPAL_DIAGNOSTIC] PAYPAL_ORDER_CREATE_SUCCESS (Server Order ID: ${orderRes.id})`);
                  return orderRes.id;
                }

                // Single-Party SDK Creation Fallback (no unprocessable client payee override)
                console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_ORDER_CREATE_SUCCESS (Single-Party Client Order)');
                return actions.order.create({
                  purchase_units: [{
                    description: description,
                    amount: {
                      currency_code: currency,
                      value: amount.toFixed(2).toString(),
                    }
                  }]
                });
              } catch (err: any) {
                console.error('[PAYPAL_DIAGNOSTIC] PAYPAL_ORDER_CREATE_FAILED:', err?.message || err);
                throw err;
              }
            },
            onApprove: async (data: any, actions: any) => {
              console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_APPROVAL_STARTED');
              console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_CAPTURE_STARTED');

              try {
                let captureData = null;
                if (actions && actions.order) {
                  captureData = await actions.order.capture();
                }

                const orderID = data?.orderID || captureData?.id;

                const captureRes = await fetch('/api/paypal/capture-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ orderID, amount, currency, description })
                });

                const verifiedResult = await captureRes.json();

                if (!captureRes.ok || verifiedResult.success === false) {
                  const errName = verifiedResult.error || 'CAPTURE_FAILED';
                  const errMsg = verifiedResult.message || `Server returned HTTP ${captureRes.status}`;
                  console.error(`[PAYPAL_DIAGNOSTIC] PAYPAL_CAPTURE_FAILED: HTTP ${captureRes.status} - ${errName}: ${errMsg}`);
                  onError(new Error(`Capture Verification Error: ${errMsg}`));
                  return;
                }

                if (verifiedResult.success && (verifiedResult.status === 'COMPLETED' || captureData?.status === 'COMPLETED')) {
                  console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_CAPTURE_SUCCESS');
                  onSuccess(captureData || verifiedResult);
                } else {
                  console.error('[PAYPAL_DIAGNOSTIC] PAYPAL_CAPTURE_FAILED: Status incomplete');
                  onError(new Error('PayPal capture status incomplete.'));
                }
              } catch (err: any) {
                console.error('[PAYPAL_DIAGNOSTIC] PAYPAL_CAPTURE_FAILED:', err?.message || err);
                onError(err);
              }
            },
            onCancel: (data: any) => {
              console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_CHECKOUT_CANCELLED');
            },
            onError: (err: any) => {
              console.error('[PAYPAL_DIAGNOSTIC] PAYPAL_CHECKOUT_ERROR:', err?.message || err);
              onError(err);
            }
          });

          const isEligible = typeof buttons.isEligible === 'function' ? buttons.isEligible() : true;
          console.log(`[PAYPAL_DIAGNOSTIC] PAYPAL_BUTTONS_ELIGIBLE=${isEligible}`);

          if (!isEligible) {
            console.error('[PAYPAL_DIAGNOSTIC] PAYPAL_RENDER_FAILED: paypal.Buttons().isEligible() returned false');
            setLoadError('PayPal buttons are not eligible for this account/currency.');
            return;
          }

          console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_RENDER_STARTED');
          buttons.render(buttonContainerRef.current)
            .then(() => {
              console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_RENDER_SUCCESS');
              setIsLoaded(true);
              renderedClientIdRef.current = sanitizedClientId;
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
            })
            .catch((err: any) => {
              console.error(`[PAYPAL_DIAGNOSTIC] PAYPAL_RENDER_ERROR=${err?.message || err}`);
              console.error('[PAYPAL_DIAGNOSTIC] PAYPAL_RENDER_FAILED');
              setLoadError('Failed to render secure PayPal checkout interface.');
            });
        } catch (err: any) {
          console.error(`[PAYPAL_DIAGNOSTIC] PAYPAL_RENDER_ERROR=${err?.message || err}`);
          console.error('[PAYPAL_DIAGNOSTIC] PAYPAL_RENDER_FAILED');
          setLoadError('Failed to initialize PayPal checkout button.');
        }
      }
    };

    const scriptUrl = `https://www.paypal.com/sdk/js?client-id=${sanitizedClientId}&currency=${currency}&intent=capture`;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = scriptUrl;
      script.async = true;
      script.onload = () => {
        script.setAttribute('data-status', 'loaded');
        initializeButtons();
      };
      script.onerror = () => {
        script.setAttribute('data-status', 'failed');
        console.error('[PAYPAL_DIAGNOSTIC] PAYPAL_RENDER_FAILED: Failed to fetch PayPal Live SDK script.');
        setLoadError('Failed to load Live PayPal payment network.');
      };
      document.body.appendChild(script);
    } else {
      const paypal = (window as any).paypal;
      if (paypal && paypal.Buttons) {
        initializeButtons();
      } else {
        const handleScriptLoad = () => {
          initializeButtons();
        };
        script.addEventListener('load', handleScriptLoad);
        return () => {
          script.removeEventListener('load', handleScriptLoad);
        };
      }
    }

    return () => {
      if (buttonContainerRef.current) {
        buttonContainerRef.current.innerHTML = '';
      }
    };
  }, [clientId, currency, amount, description, merchantEmail]);

  const handleRetry = () => {
    renderedClientIdRef.current = null;
    setRetryKey(prev => prev + 1);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-black tracking-wider text-amber-400 uppercase">SECURE PAYPAL LIVE CHECKOUT</h3>
        <span className="text-[10px] text-emerald-400 font-mono font-bold">LIVE PRODUCTION</span>
      </div>
      
      <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/50 mb-4 flex justify-between items-center">
        <div className="flex flex-col min-w-0 pr-2">
          <span className="text-xs text-white font-bold truncate">{description}</span>
          <span className="text-[9px] text-emerald-400 font-mono truncate">Payee: {merchantEmail}</span>
        </div>
        <span className="text-xl font-bold text-teal-400 shrink-0">${amount.toFixed(2)} {currency}</span>
      </div>

      {loadError ? (
        <div className="bg-red-950/40 border border-red-500/30 p-6 rounded-xl flex flex-col items-center gap-4 text-center">
          <p className="text-sm font-bold text-red-400 uppercase tracking-wider">PAYPAL CONNECTING</p>
          <p className="text-xs text-neutral-400 leading-relaxed uppercase">{loadError}</p>
          <button 
            onClick={handleRetry}
            className="mt-2 px-6 py-3 border border-red-500/50 hover:bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="relative min-h-[140px] flex flex-col justify-center">
          {!isLoaded && (
            <div className="flex flex-col items-center justify-center space-y-3 py-6">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-amber-400 font-mono tracking-widest uppercase animate-pulse">Initializing Live PayPal Checkout ({merchantEmail})...</p>
            </div>
          )}
          {/* Use opacity and min-height so PayPal SDK can calculate element layout without display:none bugs */}
          <div 
            ref={buttonContainerRef} 
            id="paypal-button-container" 
            className={`w-full z-10 transition-opacity duration-300 min-h-[50px] ${isLoaded ? 'opacity-100 relative' : 'opacity-0 absolute top-0 left-0 pointer-events-none'}`} 
          />
        </div>
      )}

      <div className="mt-4 text-center text-[9px] text-neutral-500 font-medium uppercase tracking-widest">
        Direct Merchant Payee: {merchantEmail} • 256-Bit SSL Encrypted
      </div>
    </div>
  );
};

export default PayPalPayment;
