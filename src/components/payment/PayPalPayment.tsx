import React, { useEffect, useState, useRef } from 'react';

interface PayPalButtonProps {
  amount: number;
  currency?: string;
  description?: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
}

interface PayPalConfig {
  clientId: string;
  merchantEmail: string;
  currency: string;
}

// Module-level singletons for instantaneous caching across modal opens
let cachedConfigPromise: Promise<PayPalConfig> | null = null;
let cachedConfig: PayPalConfig | null = null;
let cachedSdkPromise: Promise<any> | null = null;

export function fetchPayPalConfig(): Promise<PayPalConfig> {
  if (cachedConfig) return Promise.resolve(cachedConfig);
  if (cachedConfigPromise) return cachedConfigPromise;

  cachedConfigPromise = fetch('/api/config/paypal')
    .then(res => res.json())
    .then(data => {
      const rawId = data.clientId ? data.clientId.toString().trim() : '';
      const email = data.merchantEmail || 'kraezelvbeatz@gmail.com';
      const config: PayPalConfig = {
        clientId: rawId || (import.meta.env.VITE_PAYPAL_CLIENT_ID || ''),
        merchantEmail: email,
        currency: data.currency || 'USD'
      };
      cachedConfig = config;
      return config;
    })
    .catch(err => {
      console.warn('[PAYPAL_DIAGNOSTIC] Backend config fetch note, using fallback:', err);
      const config: PayPalConfig = {
        clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || '',
        merchantEmail: 'kraezelvbeatz@gmail.com',
        currency: 'USD'
      };
      cachedConfig = config;
      return config;
    });

  return cachedConfigPromise;
}

export function preloadPayPalSdk(currency: string = 'USD'): Promise<any> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  const win = window as any;
  if (win.paypal && win.paypal.Buttons) {
    return Promise.resolve(win.paypal);
  }
  if (cachedSdkPromise) {
    return cachedSdkPromise;
  }

  cachedSdkPromise = fetchPayPalConfig().then(config => {
    const sanitizedClientId = config.clientId.trim().replace(/^['"]|['"]$/g, '');
    if (!sanitizedClientId) {
      throw new Error('Missing PayPal Client ID');
    }

    if (win.paypal && win.paypal.Buttons) {
      return win.paypal;
    }

    const scriptId = 'paypal-js-sdk-live-unique';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    return new Promise((resolve, reject) => {
      const onScriptReady = () => {
        const paypal = (window as any).paypal;
        if (paypal && paypal.Buttons) {
          console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_SDK_LOADED');
          resolve(paypal);
        } else {
          console.error('[PAYPAL_DIAGNOSTIC] PAYPAL_RENDER_FAILED: paypal.Buttons is undefined');
          reject(new Error('PayPal SDK loaded but Buttons component is unavailable.'));
        }
      };

      if (!script) {
        console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_SDK_LOADING');
        script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://www.paypal.com/sdk/js?client-id=${sanitizedClientId}&currency=${currency}&intent=capture`;
        script.async = true;
        script.onload = () => {
          script.setAttribute('data-status', 'loaded');
          onScriptReady();
        };
        script.onerror = () => {
          script.setAttribute('data-status', 'failed');
          cachedSdkPromise = null;
          console.error('[PAYPAL_DIAGNOSTIC] PAYPAL_RENDER_FAILED: Failed to fetch PayPal Live SDK script.');
          reject(new Error('Failed to load Live PayPal payment network.'));
        };
        document.head.appendChild(script);
      } else {
        if (script.getAttribute('data-status') === 'loaded' && win.paypal?.Buttons) {
          onScriptReady();
        } else {
          script.addEventListener('load', onScriptReady, { once: true });
          script.addEventListener('error', () => {
            cachedSdkPromise = null;
            reject(new Error('Failed to load Live PayPal payment network.'));
          }, { once: true });
        }
      }
    });
  });

  return cachedSdkPromise;
}

// Background pre-warming on idle/startup without blocking execution
if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      preloadPayPalSdk().catch(() => {});
    });
  } else {
    setTimeout(() => {
      preloadPayPalSdk().catch(() => {});
    }, 500);
  }
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
  const [merchantEmail, setMerchantEmail] = useState<string>(cachedConfig?.merchantEmail || 'kraezelvbeatz@gmail.com');
  const [retryKey, setRetryKey] = useState(0);

  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep references to amount and description so createOrder & onApprove ALWAYS use the latest values
  // without needing to destroy and recreate the PayPal button iframe every time license tier changes!
  const amountRef = useRef(amount);
  const descriptionRef = useRef(description);
  const currencyRef = useRef(currency);

  useEffect(() => {
    amountRef.current = amount;
  }, [amount]);

  useEffect(() => {
    descriptionRef.current = description;
  }, [description]);

  useEffect(() => {
    currencyRef.current = currency;
  }, [currency]);

  // Handle PayPal SDK Loading and Button Rendering
  useEffect(() => {
    let isCancelled = false;
    setLoadError(null);
    setIsLoaded(false);

    // Safety timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!isLoaded && !isCancelled) {
        console.warn('[PAYPAL_DIAGNOSTIC] PAYPAL_RENDER_FAILED: PayPal SDK loading timed out after 12s');
        setLoadError('PayPal secure gateway failed to initialize in time.');
      }
    }, 12000);

    preloadPayPalSdk(currency)
      .then(paypal => {
        if (isCancelled || !buttonContainerRef.current) return;

        if (cachedConfig?.merchantEmail) {
          setMerchantEmail(cachedConfig.merchantEmail);
        }

        const buttonsAvailable = !!(paypal && paypal.Buttons);
        console.log(`[PAYPAL_DIAGNOSTIC] PAYPAL_BUTTONS_AVAILABLE=${buttonsAvailable}`);

        if (!buttonsAvailable) {
          console.error('[PAYPAL_DIAGNOSTIC] PAYPAL_RENDER_FAILED: paypal.Buttons is undefined');
          setLoadError('PayPal SDK loaded but Buttons component is unavailable.');
          return;
        }

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
                  body: JSON.stringify({ 
                    amount: amountRef.current, 
                    currency: currencyRef.current, 
                    description: descriptionRef.current 
                  })
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
                    description: descriptionRef.current,
                    amount: {
                      currency_code: currencyRef.current,
                      value: amountRef.current.toFixed(2).toString(),
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
                  body: JSON.stringify({ 
                    orderID, 
                    amount: amountRef.current, 
                    currency: currencyRef.current, 
                    description: descriptionRef.current 
                  })
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
              if (isCancelled) return;
              console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_RENDER_SUCCESS');
              setIsLoaded(true);
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
            })
            .catch((err: any) => {
              if (isCancelled) return;
              console.error(`[PAYPAL_DIAGNOSTIC] PAYPAL_RENDER_ERROR=${err?.message || err}`);
              console.error('[PAYPAL_DIAGNOSTIC] PAYPAL_RENDER_FAILED');
              setLoadError('Failed to render secure PayPal checkout interface.');
            });
        } catch (err: any) {
          if (isCancelled) return;
          console.error(`[PAYPAL_DIAGNOSTIC] PAYPAL_RENDER_ERROR=${err?.message || err}`);
          console.error('[PAYPAL_DIAGNOSTIC] PAYPAL_RENDER_FAILED');
          setLoadError('Failed to initialize PayPal checkout button.');
        }
      })
      .catch(err => {
        if (isCancelled) return;
        console.error('[PAYPAL_DIAGNOSTIC] PAYPAL_RENDER_FAILED:', err?.message || err);
        setLoadError(err?.message || 'Failed to load PayPal checkout.');
      });

    return () => {
      isCancelled = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (buttonContainerRef.current) {
        buttonContainerRef.current.innerHTML = '';
      }
    };
  }, [currency, retryKey]);

  const handleRetry = () => {
    cachedSdkPromise = null;
    cachedConfigPromise = null;
    cachedConfig = null;
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

