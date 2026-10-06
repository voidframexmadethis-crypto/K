import { create } from 'zustand';
import { Beat } from '../types';

export interface CartItem {
  id: string; // beatId + licenseType
  beat: Beat;
  licenseType: 'basic' | 'premium' | 'unlimited' | 'exclusive';
  price: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addToCart: (beat: Beat, licenseType: 'basic' | 'premium' | 'unlimited' | 'exclusive', price: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  toggleCart: (open?: boolean) => void;
}

const STORAGE_KEY = 'kraezelv_persistent_cart';

function loadInitialCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[CART] Failed to load cart from localStorage:', e);
  }
  return [];
}

function persistCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('[CART] Failed to save cart to localStorage:', e);
  }
}

export const useCartStore = create<CartState>((set) => ({
  items: loadInitialCart(),
  isOpen: false,

  addToCart: (beat, licenseType, price) => set((state) => {
    const itemUniqueId = `${beat.id}_${licenseType}`;
    // Deduplicate same beat + license type
    if (state.items.some(item => item.id === itemUniqueId)) {
      return { isOpen: true }; // Open anyway
    }
    const newItem: CartItem = {
      id: itemUniqueId,
      beat,
      licenseType,
      price
    };
    const updatedItems = [...state.items, newItem];
    persistCart(updatedItems);
    return {
      items: updatedItems,
      isOpen: true // Automatically slide out mini-cart on item addition!
    };
  }),

  removeFromCart: (itemId) => set((state) => {
    const updatedItems = state.items.filter(item => item.id !== itemId);
    persistCart(updatedItems);
    return { items: updatedItems };
  }),

  clearCart: () => set(() => {
    persistCart([]);
    return { items: [] };
  }),

  toggleCart: (open) => set((state) => ({
    isOpen: open !== undefined ? open : !state.isOpen
  })),
}));
