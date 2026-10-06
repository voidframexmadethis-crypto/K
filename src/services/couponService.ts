import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface CouponCode {
  id?: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_beat';
  value: number; // e.g. 20 for 20% or 15 for $15 off
  minPurchase?: number;
  active: boolean;
  usageCount: number;
  maxUses?: number;
  expiryDate?: string;
  createdAt?: string;
}

const DEFAULT_COUPONS: CouponCode[] = [
  { id: '1', code: 'KRAEZELV20', type: 'percentage', value: 20, active: true, usageCount: 42, maxUses: 100 },
  { id: '2', code: 'PRODUCER15', type: 'fixed', value: 15, active: true, usageCount: 18, minPurchase: 50 },
  { id: '3', code: 'FREEBEAT', type: 'free_beat', value: 100, active: true, usageCount: 95 }
];

export function validateCoupon(codeString: string, cartTotal: number): { valid: boolean; discountAmount: number; message: string; coupon?: CouponCode } {
  const code = codeString.trim().toUpperCase();
  if (!code) return { valid: false, discountAmount: 0, message: 'Please enter a coupon code.' };

  const match = DEFAULT_COUPONS.find(c => c.code.toUpperCase() === code && c.active);
  if (!match) {
    return { valid: false, discountAmount: 0, message: 'Invalid or expired coupon code.' };
  }

  if (match.minPurchase && cartTotal < match.minPurchase) {
    return { valid: false, discountAmount: 0, message: `Minimum cart total of $${match.minPurchase.toFixed(2)} required for this coupon.` };
  }

  let discount = 0;
  if (match.type === 'percentage') {
    discount = (cartTotal * match.value) / 100;
  } else if (match.type === 'fixed') {
    discount = Math.min(cartTotal, match.value);
  } else if (match.type === 'free_beat') {
    discount = cartTotal; // 100% off basic lease
  }

  return {
    valid: true,
    discountAmount: Math.round(discount * 100) / 100,
    message: `Coupon Applied! Saved $${discount.toFixed(2)} (${match.type === 'percentage' ? `${match.value}% OFF` : `$${match.value} OFF`})`,
    coupon: match
  };
}
