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

  // Log on mount
  useEffect(() => {
    console.log('1. PayPalPayment mounted');
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Fetch hardcoded client ID and merchant email securely from backend proxy
  useEffect(() => {
    setLoadError(null);
    setIsLoaded(false);

    fetch('/api/config/paypal')
      .then(res => res.json())
      .then(data => {
        const rawId = data.clientId ? data.clientId.toString().trim() : 'AXgJmL0xze2IjoJUPwIV7Jsu3KeygR27EJ-P4wrACgmgRoWX2cTwPHSpH4jIXvZ9oAH1qOXusOJJT82I';
        const email = data.merchantEmail || 'kraezelvbeatz@gmail.com';
        
        setClientId(rawId);
        setMerchantEmail(email);
        console.log(`Backend PayPal credentials retrieved. Merchant Email: ${email}`);
      })
      .catch(err => {
        console.warn('Backend proxy fetch note, using hardcoded backend defaults:', err);
        setClientId('AXgJmL0xze2IjoJUPwIV7Jsu3KeygR27EJ-P4wrACgmgRoWX2cTwPHSpH4jIXvZ9oAH1qOXusOJJT82I');
        setMerchantEmail('kraezelvbeatz@gmail.com');
      });
  }, [retryKey]);

  // Handle PayPal SDK Loading and Button Rendering
  useEffect(() => {
    if (!clientId) return;

    const sanitizedClientId = clientId.trim().replace(/^['"]|['"]$/g, '');

    // 10-second safety timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!isLoaded) {
        console.warn('PayPal SDK loading timed out after 10 seconds.');
        setLoadError('PayPal secure gateway failed to initialize.');
      }
    }, 10000);

    const scriptId = 'paypal-js-sdk-unique';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (script && script.getAttribute('data-status') === 'failed') {
      script.remove();
      script = null as any;
    }

    const initializeButtons = () => {
      const paypal = (window as any).paypal;

      if (paypal && paypal.Buttons) {
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
              return actions.order.create({
                purchase_units: [{
                  description: description,
                  amount: {
                    currency_code: currency,
                    value: amount.toFixed(2).toString(),
                  },
                  payee: {
                    email_address: merchantEmail || 'kraezelvbeatz@gmail.com'
                  }
                }]
              });
            },
            onApprove: async (data: any, actions: any) => {
              try {
                const details = await actions.order.capture();
                onSuccess(details);
              } catch (err) {
                console.warn('Capture failed', err);
                onError(err);
              }
            },
            onError: (err: any) => {
              console.warn('PayPal Buttons experienced an error', err);
              onError(err);
            }
          }).render(buttonContainerRef.current).then(() => {
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
      }
    };

    const scriptUrl = `https://www.paypal.com/sdk/js?client-id=${sanitizedClientId}&currency=${currency}`;

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
        setLoadError('Failed to load PayPal payment network.');
      };
      document.body.appendChild(script);
    } else {
      const paypal = (window as any).paypal;
      if (paypal) {
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
  }, [amount, currency, description, clientId, merchantEmail, isLoaded, onSuccess, onError]);

  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-black tracking-wider text-amber-400 uppercase">SECURE PAYPAL BILLING PORTAL</h3>
        <span className="text-[10px] text-neutral-400 font-mono">Backend Verified</span>
      </div>
      
      <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/50 mb-4 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-xs text-white font-bold">{description}</span>
          <span className="text-[9px] text-emerald-400 font-mono">Payee: {merchantEmail}</span>
        </div>
        <span className="text-xl font-bold text-teal-400">${amount.toFixed(2)} {currency}</span>
      </div>

      {loadError ? (
        <div className="bg-red-950/40 border border-red-500/30 p-6 rounded-xl flex flex-col items-center gap-4 text-center">
          <p className="text-sm font-bold text-red-400 uppercase tracking-wider">PAYPAL CONNECTING</p>
          <p className="text-xs text-neutral-400 leading-relaxed uppercase">{loadError}</p>
          <button 
            onClick={handleRetry}
            className="mt-2 px-6 py-3 border border-red-500/50 hover:bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="relative min-h-[140px] flex flex-col justify-center">
          {!isLoaded && (
            <div className="flex flex-col items-center justify-center space-y-3 py-6">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-amber-400 font-mono tracking-widest uppercase animate-pulse">Connecting to PayPal Merchant ({merchantEmail})...</p>
            </div>
          )}
          <div ref={buttonContainerRef} id="paypal-button-container" className={`w-full z-10 ${isLoaded ? 'block' : 'hidden'}`} />
        </div>
      )}

      <div className="mt-4 text-center text-[9px] text-neutral-500 font-medium uppercase tracking-widest">
        Direct Merchant Payee: kraezelvbeatz@gmail.com • 256-Bit SSL Encrypted
      </div>
    </div>
  );
};

export default PayPalPayment;
