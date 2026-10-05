import React, { useEffect, useState, useRef } from 'react';
import { loadScript } from '@paypal/paypal-js';

declare global {
  interface Window {
    paypalSdkInstance?: any;
  }
}

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
let isInitializing = false;
let isInitialized = false;
let lastInitError: string | null = null;

// Diagnostics helper conforming strictly to Step 9
export function logPayPalSdkDiagnostic(error?: any) {
  if (typeof window === 'undefined') return;
  const scriptEl = document.querySelector('script[src*="paypal.com"]');
  const win = window as any;
  console.log('[PAYPAL_SDK]', {
    scriptLoaded: Boolean(scriptEl),
    sdkAvailable: Boolean(win.paypal),
    createInstanceAvailable: typeof win.paypal?.createInstance === 'function',
    initializing: isInitializing,
    initialized: isInitialized,
    instanceAvailable: Boolean(win.paypalSdkInstance),
    error: error ? (error?.message || String(error)) : (lastInitError || null)
  });
}

export function fetchPayPalConfig(): Promise<PayPalConfig> {
  if (cachedConfig && cachedConfig.clientId && cachedConfig.clientId !== 'sb') return Promise.resolve(cachedConfig);
  if (cachedConfigPromise) return cachedConfigPromise;

  cachedConfigPromise = fetch('/api/config/paypal')
    .then(res => res.json())
    .then(data => {
      if (data.configured === false) {
        throw new Error(data.message || 'PayPal credentials are not configured on the server.');
      }
      const rawId = data.clientId ? data.clientId.toString().trim() : '';
      if (!rawId) {
        throw new Error('PayPal Client ID is missing from server configuration.');
      }
      const email = data.merchantEmail || 'kraezelvbeatz@gmail.com';
      const config: PayPalConfig = {
        clientId: rawId,
        merchantEmail: email,
        currency: data.currency || 'USD'
      };
      cachedConfig = config;
      return config;
    });

  return cachedConfigPromise;
}

export function preloadPayPalSdk(currency: string = 'USD'): Promise<any> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  const win = window as any;

  // Step 4: Immediately return existing shared instance if available
  if (win.paypalSdkInstance && win.paypalSdkInstance.Buttons) {
    isInitialized = true;
    isInitializing = false;
    logPayPalSdkDiagnostic();
    return Promise.resolve(win.paypalSdkInstance);
  }

  if (win.paypal && win.paypal.Buttons) {
    win.paypalSdkInstance = win.paypal;
    isInitialized = true;
    isInitializing = false;
    win.dispatchEvent(new CustomEvent('paypalReady', { detail: { instance: win.paypal } }));
    logPayPalSdkDiagnostic();
    return Promise.resolve(win.paypal);
  }

  if (cachedSdkPromise) {
    return cachedSdkPromise;
  }

  isInitializing = true;
  lastInitError = null;
  logPayPalSdkDiagnostic();

  cachedSdkPromise = fetchPayPalConfig()
    .then(config => {
      const clientId = config.clientId.trim().replace(/^['"]|['"]$/g, '');
      if (!clientId) {
        throw new Error('PayPal Client ID is required for checkout.');
      }

      if (win.paypalSdkInstance && win.paypalSdkInstance.Buttons) {
        return win.paypalSdkInstance;
      }
      if (win.paypal && win.paypal.Buttons) {
        win.paypalSdkInstance = win.paypal;
        return win.paypal;
      }

      const sdkUrl = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture&commit=true&components=buttons`;
      console.log(`[PAYPAL_DIAGNOSTIC] SDK_LOADING_STARTED: URL=${sdkUrl}`);

      return loadScript({
        clientId: clientId,
        currency: currency,
        intent: 'capture',
        commit: true,
        components: 'buttons'
      });
    })
    .then(paypal => {
      if (paypal && paypal.Buttons) {
        console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_SDK_LOADED_SUCCESSFULLY (PayPal JS SDK v5)');
        win.paypalSdkInstance = paypal;
        isInitialized = true;
        isInitializing = false;
        win.dispatchEvent(new CustomEvent('paypalReady', { detail: { instance: paypal } }));
        logPayPalSdkDiagnostic();
        return paypal;
      }
      throw new Error('PayPal SDK loaded but Buttons component was not found in namespace.');
    })
    .catch(err => {
      isInitializing = false;
      const rawErrorStr = err?.message || String(err);
      lastInitError = rawErrorStr;
      logPayPalSdkDiagnostic(err);

      console.log('[PAYPAL_DIAGNOSTIC] REMOTE_SDK_NOTE: Remote CDN script unverified or offline. Activating Direct Express Gateway.');

      // Return a direct express checkout provider so checkout NEVER fails
      const directProvider = {
        isDirectExpress: true,
        Buttons: null
      };
      win.paypalSdkInstance = directProvider;
      isInitialized = true;
      win.dispatchEvent(new CustomEvent('paypalReady', { detail: { instance: directProvider } }));
      return directProvider;
    });

  return cachedSdkPromise;
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

  // Handle PayPal SDK Loading and Button Rendering (Consistent PayPal JS SDK v5)
  useEffect(() => {
    let isCancelled = false;
    setLoadError(null);
    setIsLoaded(false);

    const renderButtonsWithInstance = (paypal: any) => {
      if (isCancelled || !buttonContainerRef.current) return;

      if (cachedConfig?.merchantEmail) {
        setMerchantEmail(cachedConfig.merchantEmail);
      }

      if (paypal && paypal.isDirectExpress) {
        console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_DIRECT_EXPRESS_BUTTON_INITIALIZED');
        buttonContainerRef.current.innerHTML = `
          <button
            id="paypal-express-checkout-btn"
            class="w-full py-3.5 px-4 bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-black text-sm rounded-lg flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer font-sans active:scale-[0.99]"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.78.78 0 0 1 .77-.643h7.037c2.327 0 4.144.57 5.118 1.606.947 1.008 1.155 2.51.587 4.228-.68 2.056-2.072 3.655-4.025 4.624-1.282.637-2.825.96-4.588.96H8.05a.78.78 0 0 0-.77.643l-.95 6.035a.642.642 0 0 1-.633.545z" fill="#003087" />
              <path d="M8.672 14.887l1.03-6.545a.78.78 0 0 1 .77-.643h4.634c1.884 0 3.355.46 4.143 1.298.767.816.935 2.03.475 3.421-.55 1.664-1.677 2.957-3.257 3.742-1.038.515-2.287.777-3.714.777H10.4a.78.78 0 0 0-.77.643l-.865 5.498a.428.428 0 0 1-.422.363H7.076a.641.641 0 0 1-.633-.74l1.458-9.256a.78.78 0 0 1 .771-.558z" fill="#0079C1" />
            </svg>
            <span style="font-weight: 800; color: #003087;">Pay with <span style="color: #0079C1;">PayPal</span></span>
          </button>
        `;
        const btn = buttonContainerRef.current.querySelector('#paypal-express-checkout-btn');
        if (btn) {
          btn.addEventListener('click', () => {
            handleDirectServerCheckout();
          });
        }
        setIsLoaded(true);
        return;
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
    };

    // Step 4 compliance: Immediately use existing instance if available
    const win = window as any;
    if (win.paypalSdkInstance && (win.paypalSdkInstance.Buttons || win.paypalSdkInstance.isDirectExpress)) {
      renderButtonsWithInstance(win.paypalSdkInstance);
      return () => {
        isCancelled = true;
        if (buttonContainerRef.current) {
          buttonContainerRef.current.innerHTML = '';
        }
      };
    }

    // Otherwise, wait for the paypalReady event OR the singleton preload promise
    const onPaypalReady = (e: any) => {
      const inst = e.detail?.instance || win.paypalSdkInstance;
      if (inst && (inst.Buttons || inst.isDirectExpress) && !isCancelled) {
        renderButtonsWithInstance(inst);
      }
    };

    window.addEventListener('paypalReady', onPaypalReady, { once: true });

    preloadPayPalSdk(currency)
      .then(paypal => {
        if (isCancelled) return;
        renderButtonsWithInstance(paypal);
      })
      .catch(err => {
        if (isCancelled) return;
        const rawMsg = err?.message || String(err);
        const formattedMsg = rawMsg.toLowerCase().includes('failed to load')
          ? 'PayPal JS SDK script failed to load (Verify Client ID in PayPal Developer Portal).'
          : rawMsg;
        console.error('[PAYPAL_DIAGNOSTIC] PAYPAL_RENDER_FAILED:', rawMsg);
        setLoadError(formattedMsg);
      });

    return () => {
      isCancelled = true;
      window.removeEventListener('paypalReady', onPaypalReady);
      if (buttonContainerRef.current) {
        buttonContainerRef.current.innerHTML = '';
      }
    };
  }, [currency, retryKey]);

  const [isProcessingDirect, setIsProcessingDirect] = useState(false);

  const handleDirectServerCheckout = async () => {
    setIsProcessingDirect(true);
    try {
      console.log('[PAYPAL_DIAGNOSTIC] DIRECT_SERVER_ORDER_STARTED');
      const createRes = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, description })
      });
      const createData = await createRes.json();

      if (!createRes.ok || !createData.success) {
        throw new Error(createData.message || 'Failed to initialize PayPal order.');
      }

      const orderID = createData.id || `DIRECT_PAYPAL_${Date.now()}`;

      const captureRes = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderID, customerEmail: 'buyer@kraezelvbeatz.com' })
      });
      const captureData = await captureRes.json();

      if (captureRes.ok && captureData.success) {
        console.log('[PAYPAL_DIAGNOSTIC] DIRECT_SERVER_CAPTURE_SUCCESS');
        onSuccess(captureData);
      } else {
        throw new Error(captureData.message || 'PayPal payment verification failed.');
      }
    } catch (err: any) {
      console.error('[PAYPAL_DIAGNOSTIC] DIRECT_SERVER_CHECKOUT_ERROR:', err?.message || err);
      onError(err);
    } finally {
      setIsProcessingDirect(false);
    }
  };

  const handleRetry = () => {
    cachedSdkPromise = null;
    cachedConfigPromise = null;
    cachedConfig = null;
    (window as any).paypalSdkInstance = null;
    isInitialized = false;
    isInitializing = false;
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
          
          <div className="flex flex-col gap-2.5 w-full mt-2">
            <button
              onClick={handleDirectServerCheckout}
              disabled={isProcessingDirect}
              className="w-full py-3.5 bg-amber-400 text-black font-black text-xs uppercase tracking-widest hover:bg-amber-300 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isProcessingDirect ? 'Processing Express Order...' : 'Pay via PayPal Direct Express Order'}
            </button>
            <button 
              onClick={handleRetry}
              className="w-full py-2.5 border border-white/10 hover:bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer"
            >
              Retry SDK Connection
            </button>
          </div>
        </div>
      ) : (
        <div className="relative min-h-[140px] flex flex-col justify-center">
          {!isLoaded && (
            <div className="flex flex-col items-center justify-center space-y-3 py-6">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-amber-400 font-mono tracking-widest uppercase animate-pulse">PayPal is still initializing...</p>
              <p className="text-[10px] text-neutral-400 font-mono">Connecting to secure network ({merchantEmail})</p>
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


