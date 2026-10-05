import { create } from 'zustand';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BeatPack } from '../types';

interface BeatPackState {
  packs: BeatPack[];
  isLoading: boolean;
  addPack: (pack: BeatPack) => Promise<BeatPack>;
  updatePack: (id: string, partialPack: Partial<BeatPack>) => Promise<void>;
  removePack: (id: string) => Promise<void>;
}

export const useBeatPackStore = create<BeatPackState>()((set, get) => ({
  packs: [],
  isLoading: true,

  addPack: async (newPack: BeatPack) => {
    set((state) => ({ packs: [newPack, ...state.packs] }));
    try {
      await setDoc(doc(db, 'beat_packs', newPack.id), newPack);
    } catch (err: any) {
      console.warn('[FIRESTORE_PACKS] Write error:', err?.message || err);
    }
    return newPack;
  },

  updatePack: async (id: string, partialPack: Partial<BeatPack>) => {
    set((state) => ({
      packs: state.packs.map((p) => (p.id === id ? { ...p, ...partialPack } : p)),
    }));
    try {
      await updateDoc(doc(db, 'beat_packs', id), partialPack);
    } catch (err: any) {
      console.warn('[FIRESTORE_PACKS] Update error:', err?.message || err);
    }
  },

  removePack: async (id: string) => {
    set((state) => ({
      packs: state.packs.filter((p) => p.id !== id),
    }));
    try {
      await deleteDoc(doc(db, 'beat_packs', id));
    } catch (err: any) {
      console.warn('[FIRESTORE_PACKS] Delete error:', err?.message || err);
    }
  },
}));

// Firestore Realtime Listener for Beat Packs
if (typeof window !== 'undefined') {
  onSnapshot(
    collection(db, 'beat_packs'),
    (snapshot) => {
      const livePacks: BeatPack[] = [];
      snapshot.forEach((d) => {
        livePacks.push({
          ...(d.data() as BeatPack),
          id: d.id,
        });
      });
      useBeatPackStore.setState({ packs: livePacks, isLoading: false });
    },
    (err) => {
      console.warn('[FIRESTORE_PACKS] Subscription error:', err?.message || err);
      useBeatPackStore.setState({ isLoading: false });
    }
  );
}
