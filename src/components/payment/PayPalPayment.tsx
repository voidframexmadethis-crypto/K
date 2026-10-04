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
  const [retryKey, setRetryKey] = useState(0);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Log on mount
  useEffect(() => {
    console.log('1. PayPalPayment mounted');
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Fetch client ID from backend proxy
  useEffect(() => {
    setLoadError(null);
    setIsLoaded(false);
    setClientId(null);

    fetch('/api/config/paypal')
      .then(res => res.json())
      .then(data => {
        if (!data.clientId) {
          console.warn('PayPal Client ID missing from backend response');
          setLoadError('PayPal client-ID is missing or not configured. Please check your AI Studio Secrets panel.');
        } else {
          const rawId = data.clientId.toString().trim();
          // Detect placeholder keys
          if (rawId.includes('YOUR_LIVE_PAYPAL_CLIENT_ID') || rawId.includes('PLACEHOLDER') || rawId === 'sb' || rawId === '') {
            console.warn('Configured client-ID is a placeholder:', rawId);
            setLoadError(`PayPal client-ID is configured as a placeholder ('${rawId}'). Please set your real PayPal Merchant Client ID in the AI Studio secrets dashboard.`);
          } else if (rawId.startsWith('E') || rawId.startsWith('e')) {
            console.warn('PayPal Client Secret was configured as Client ID:', rawId.substring(0, 5) + '...');
            setLoadError("Accidental Client Secret Detected: The configured PayPal Client ID begins with 'E', which is the signature format of a PayPal Client Secret instead of a Client ID (PayPal Client IDs always start with 'A'). Please change your VITE_PAYPAL_CLIENT_ID inside the AI Studio secrets dashboard to your actual Client ID.");
          } else {
            setClientId(rawId);
            console.log('3. PayPal checkout handler called');
          }
        }
      })
      .catch(err => {
        console.warn('Failed to fetch config', err);
        setLoadError('Failed to fetch payment gateway configuration.');
      });
  }, [retryKey]);

  // Handle PayPal SDK Loading and Button Rendering
  useEffect(() => {
    if (!clientId) return;

    // Sanitize the client-ID to remove any unintended spaces or quotes
    const sanitizedClientId = clientId.trim().replace(/^['"]|['"]$/g, '');

    // Start 10-second safety timeout to avoid infinite loading states
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!isLoaded) {
        console.warn('PayPal SDK loading timed out after 10 seconds.');
        setLoadError('PayPal secure gateway failed to initialize. The script request might be blocked, or the client-ID is invalid.');
      }
    }, 10000);

    const scriptId = 'paypal-js-sdk-unique';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    // Clean up any failed scripts from previous cycles to allow clean re-loading
    if (script && script.getAttribute('data-status') === 'failed') {
      script.remove();
      script = null as any;
    }

    const initializeButtons = () => {
      const paypal = (window as any).paypal;
      console.log('6. window.paypal detected');

      if (paypal) {
        if (paypal.Buttons) {
          console.log('7. PayPal Buttons API detected');
          console.log('8. Buttons render requested');
          
          if (buttonContainerRef.current) {
            buttonContainerRef.current.innerHTML = '';
            
            paypal.Buttons({
              style: {
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'pay'
              },
              createOrder: (data: any, actions: any) => {
                console.log('5. Order creation started');
                const orderPromise = actions.order.create({
                  purchase_units: [{
                    description: description,
                    amount: {
                      currency_code: currency,
                      value: amount.toFixed(2).toString(),
                    }
                  }]
                });
                console.log('6. PayPal checkout opened');
                return orderPromise;
              },
              onApprove: async (data: any, actions: any) => {
                try {
                  const details = await actions.order.capture();
                  onSuccess(details);
                } catch (err) {
                  console.warn('Capture failed', err);
                }
              },
              onError: (err: any) => {
                console.warn('PayPal Buttons experienced an error', err);
              }
            }).render(buttonContainerRef.current).then(() => {
              console.log('9. Buttons render completed');
              setIsLoaded(true);
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
            }).catch((err: any) => {
              console.warn('PayPal rendering error:', err);
              setLoadError('Failed to render secure PayPal checkout interface.');
            });
          }
        } else {
          setLoadError('PayPal Buttons component not available in SDK.');
        }
      } else {
        setLoadError('PayPal secure script was loaded but window.paypal is missing.');
      }
    };

    console.log('2. PayPal SDK load requested');
    const scriptUrl = `https://www.paypal.com/sdk/js?client-id=${sanitizedClientId}&currency=${currency}`;

    if (!script) {
      console.log('3. SDK script URL generated:', scriptUrl);

      script = document.createElement('script');
      script.id = scriptId;
      script.src = scriptUrl;
      script.async = true;
      script.onload = () => {
        script.setAttribute('data-status', 'loaded');
        console.log('5. SDK script load event');
        console.log('4. PayPal initialization started');
        initializeButtons();
      };
      script.onerror = () => {
        script.setAttribute('data-status', 'failed');
        setLoadError(`Failed to load PayPal secure payment network from script URL: ${scriptUrl}`);
      };

      console.log('4. SDK script inserted/requested');
      document.body.appendChild(script);
    } else {
      const paypal = (window as any).paypal;
      if (paypal) {
        console.log('4. PayPal initialization started');
        initializeButtons();
      } else {
        const handleScriptLoad = () => {
          console.log('5. SDK script load event');
          console.log('4. PayPal initialization started');
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
  }, [amount, currency, description, clientId, isLoaded, onSuccess, onError]);

  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl text-white">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold tracking-wider text-amber-400">SECURE BILLING PORTAL</h3>
        <span className="text-xs text-neutral-500 font-mono">SSL Secure Connection</span>
      </div>
      
      <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/50 mb-6 flex justify-between items-center">
        <span className="text-sm text-neutral-400 font-medium">{description}</span>
        <span className="text-xl font-bold text-teal-400">${amount.toFixed(2)} {currency}</span>
      </div>

      {loadError ? (
        <div className="bg-red-950/40 border border-red-500/30 p-6 rounded-xl flex flex-col items-center gap-4 text-center">
          <p className="text-sm font-bold text-red-400 uppercase tracking-wider">PAYPAL COULDN’T LOAD</p>
          <div className="text-xs text-neutral-400 max-w-[280px] leading-relaxed uppercase break-all space-y-2">
            <p>{loadError}</p>
            <p className="text-[10px] text-neutral-500">
              Check if the Client ID is valid, or paste the URL in a browser tab to view details.
            </p>
          </div>
          <button 
            onClick={handleRetry}
            className="mt-2 px-6 py-3 border border-red-500/50 hover:bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="relative min-h-[150px] flex flex-col justify-center">
          {!isLoaded && (
            <div className="flex flex-col items-center justify-center space-y-3 py-6">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-amber-400 font-mono tracking-widest uppercase animate-pulse">Initializing payment gateway...</p>
            </div>
          )}
          <div ref={buttonContainerRef} id="paypal-button-container" className={`w-full z-10 ${isLoaded ? 'block' : 'hidden'}`}></div>
        </div>
      )}

      <div className="mt-6 text-center text-[10px] text-neutral-500 font-medium uppercase tracking-widest">
        Processed via PayPal Merchant Integration API • Safe & Encrypted
      </div>
    </div>
  );
};

export default PayPalPayment;
