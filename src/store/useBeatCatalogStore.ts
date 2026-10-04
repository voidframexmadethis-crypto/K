import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Beat } from '../types';
import { INITIAL_DEFAULT_BEATS } from '../data/defaultCatalog';

interface BeatCatalogState {
  beats: Beat[];
  addBeat: (beat: Beat) => void;
  removeBeat: (id: string) => void;
  clearCatalog: () => void;
}

export const useBeatCatalogStore = create<BeatCatalogState>()(
  persist(
    (set) => ({
      beats: [], // Completely empty store by default
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
