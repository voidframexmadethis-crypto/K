import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Beat } from '../types';

interface BeatCatalogState {
  beats: Beat[];
  addBeat: (beat: Beat) => void;
  removeBeat: (id: string) => void;
  clearCatalog: () => void;
}

export const useBeatCatalogStore = create<BeatCatalogState>()(
  persist(
    (set) => ({
      beats: [], // Empty by default for KRAEZELVbeatz
      addBeat: (newBeat) =>
        set((state) => ({
          beats: [newBeat, ...state.beats.filter((b) => b.id !== newBeat.id)],
        })),
      removeBeat: (id) =>
        set((state) => ({
          beats: state.beats.filter((b) => b.id !== id),
        })),
      clearCatalog: () => set({ beats: [] }),
    }),
    {
      name: 'kraezelvbeatz-catalog-storage',
    }
  )
);
