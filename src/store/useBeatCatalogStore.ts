import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Beat } from '../types';

interface BeatCatalogState {
  beats: Beat[];
  addBeat: (beat: Beat) => Beat;
  updateBeat: (id: string, partialBeat: Partial<Beat>) => void;
  removeBeat: (id: string) => void;
  clearCatalog: () => void;
  findBeatByIdempotencyKey: (key: string) => Beat | undefined;
}

export const useBeatCatalogStore = create<BeatCatalogState>()(
  persist(
    (set, get) => ({
      beats: [], // Completely empty store by default
      
      findBeatByIdempotencyKey: (key: string) => {
        if (!key) return undefined;
        return get().beats.find((b) => b.idempotencyKey === key);
      },

      addBeat: (newBeat) => {
        const state = get();
        // Check if beat already exists by ID or idempotencyKey
        const existing = state.beats.find(
          (b) =>
            b.id === newBeat.id ||
            (newBeat.idempotencyKey && b.idempotencyKey === newBeat.idempotencyKey)
        );

        if (existing) {
          // Idempotent return - do NOT duplicate
          return existing;
        }

        set({
          beats: [newBeat, ...state.beats],
        });
        return newBeat;
      },

      updateBeat: (id, partialBeat) => {
        set((state) => ({
          beats: state.beats.map((b) =>
            b.id === id ? { ...b, ...partialBeat } : b
          ),
        }));
      },

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
