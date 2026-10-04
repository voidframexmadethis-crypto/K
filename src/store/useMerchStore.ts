import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MerchStoreState {
  merchStoreUrl: string;
  setMerchStoreUrl: (url: string) => void;
  clearMerchStoreUrl: () => void;
}

export const useMerchStore = create<MerchStoreState>()(
  persist(
    (set) => ({
      merchStoreUrl: 'https://kraezelvbeatz.creator-spring.com', // Default or user configured store URL
      setMerchStoreUrl: (url: string) => set({ merchStoreUrl: url }),
      clearMerchStoreUrl: () => set({ merchStoreUrl: '' }),
    }),
    {
      name: 'kraezelvbeatz-merch-store-config',
    }
  )
);
