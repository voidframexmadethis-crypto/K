import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, Lock, Sparkles, ArrowRight, ShieldCheck, Ticket } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { cn } from '../../lib/utils';

export const MiniCart: React.FC = () => {
  const { items, isOpen, removeFromCart, clearCart, toggleCart } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const discount = isCouponApplied ? subtotal * 0.1 : 0; // 10% discount for demo/promos
  const total = subtotal - discount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      setIsCouponApplied(true);
    }
  };

  const handleCheckoutItem = async (item: typeof items[0]) => {
    setIsProcessingCheckout(true);
    try {
      const res = await fetch('/api/2pay/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beatId: item.beat.id,
          licenseType: item.licenseType,
          customPrice: item.price
        })
      });
      const data = await res.json();
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      console.warn('[CHECKOUT] 2Pay checkout error:', err);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[250] transition-opacity duration-500 animate-in fade-in"
          onClick={() => toggleCart(false)}
        />
      )}

      {/* Cart Drawer */}
      <div 
        className={cn(
          "fixed right-0 top-0 h-screen w-full sm:w-[480px] bg-black border-l border-white/10 z-[260] flex flex-col justify-between shadow-[0_0_100px_rgba(168,85,247,0.15)] transition-transform duration-700 ease-expo",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-purple-400" />
            <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white">YOUR CART</h3>
            <span className="text-[9px] font-bold bg-white/10 text-white/80 px-2 py-0.5 rounded-full">{items.length}</span>
          </div>
          <button 
            onClick={() => toggleCart(false)}
            className="p-3 text-white/40 hover:text-white border border-white/5 hover:border-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-6">
          {items.length > 0 ? (
            <>
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="p-4 bg-white/[0.02] border border-white/10 hover:border-purple-500/20 transition-all flex gap-4 relative group"
                >
                  <img 
                    src={item.beat.artworkUrl} 
                    alt={item.beat.title} 
                    className="w-16 h-16 object-cover bg-neutral-900 border border-white/5 shrink-0 grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase text-white tracking-wider truncate">{item.beat.title}</h4>
                      <p className="text-[8px] text-purple-400 font-bold uppercase tracking-[0.2em] mt-0.5">{item.licenseType} License</p>
                      <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest mt-1">
                        {item.beat.bpm} BPM · {item.beat.key}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                      <span className="text-xs font-black text-white tabular-nums">${item.price.toFixed(2)}</span>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-white/20 hover:text-red-400 p-1 transition-colors"
                        title="Remove Beat"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <button 
                  onClick={clearCart}
                  className="text-[8px] font-black uppercase tracking-[0.25em] text-white/40 hover:text-white transition-colors"
                >
                  Clear Shopping Cart
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-4">
              <ShoppingBag size={48} className="text-white/40" />
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">YOUR CART IS EMPTY</p>
                <p className="text-[8px] uppercase tracking-widest leading-relaxed">Add licensing options to checkout instant untagged beats.</p>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer / Checkout Summary */}
        <div className="p-8 border-t border-white/10 bg-neutral-950/80 space-y-6">
          {items.length > 0 && (
            <>
              {/* Promotional Ribbon inside footer */}
              <div className="flex items-center gap-2 p-3 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[8px] font-bold uppercase tracking-widest">
                <Sparkles size={12} className="shrink-0" />
                <span>Bulk Promo: buy 2 get 1 free automatically on checkout</span>
              </div>

              {/* Promo code form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Ticket size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input 
                    type="text" 
                    placeholder="ENTER COUPON CODE..."
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={isCouponApplied}
                    className="w-full bg-white/[0.03] border border-white/10 p-3 pl-10 text-[9px] font-bold uppercase tracking-widest text-white outline-none focus:border-white/30 disabled:opacity-50"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isCouponApplied || !couponCode.trim()}
                  className="px-4 bg-white text-black font-black uppercase tracking-widest text-[9px] hover:bg-neutral-200 transition-all disabled:opacity-50"
                >
                  Apply
                </button>
              </form>

              {/* Subtotal stack */}
              <div className="space-y-2 border-t border-white/5 pt-4 text-[10px] font-black uppercase tracking-widest">
                <div className="flex justify-between text-white/40">
                  <span>Subtotal</span>
                  <span className="tabular-nums text-white">${subtotal.toFixed(2)}</span>
                </div>
                {isCouponApplied && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount (10% OFF)</span>
                    <span className="tabular-nums">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                  <span className="text-white">Estimated Total</span>
                  <span className="tabular-nums text-white">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Strategy */}
              <div className="space-y-3 pt-2">
                <button 
                  onClick={() => items[0] && handleCheckoutItem(items[0])}
                  disabled={isProcessingCheckout}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_30px_rgba(147,51,234,0.3)] cursor-pointer disabled:opacity-50"
                >
                  <Lock size={12} /> {isProcessingCheckout ? 'PROCESSING 2PAY...' : 'SECURE 2PAY CHECKOUT'} <ArrowRight size={14} />
                </button>

                <div className="flex items-center justify-center gap-2 text-[8px] font-bold uppercase tracking-[0.2em] text-white/30 text-center pt-2">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span>256-Bit SSL Encrypted Checkout</span>
                </div>
              </div>
            </>
          )}

          <button 
            onClick={() => toggleCart(false)}
            className="w-full py-3 bg-white/5 border border-white/5 hover:border-white/20 text-white font-black text-[9px] uppercase tracking-widest transition-colors block text-center"
          >
            CONTINUE BROWSING CATALOG
          </button>
        </div>
      </div>
    </>
  );
};
