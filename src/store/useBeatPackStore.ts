import { create } from 'zustand';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BeatPack } from '../types';

interface BeatPackState {
  packs: BeatPack[];
  isLoading: boolean;
  isHydrated: boolean;
  addPack: (pack: BeatPack) => Promise<BeatPack>;
  updatePack: (id: string, partialPack: Partial<BeatPack>) => Promise<void>;
  removePack: (id: string) => Promise<void>;
}

const STORAGE_KEY = 'kraezelv_persistent_packs_v2';

function loadInitialPacks(): BeatPack[] {
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
    console.warn('[PACK_STORAGE] Failed to load packs from localStorage:', e);
  }
  return [];
}

function persistPacks(packs: BeatPack[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
  } catch (e) {
    console.warn('[PACK_STORAGE] Failed to save packs to localStorage:', e);
  }
}

/**
 * Sanitizes pack objects before Firestore writes:
 * - Strips undefined fields
 * - Strips base64 data URLs
 */
function sanitizePackForFirestore(input: any, seen = new WeakSet()): any {
  if (!input || typeof input !== 'object') return input;
  if (seen.has(input)) return undefined;
  seen.add(input);

  const clean: any = {};

  for (const [key, val] of Object.entries(input)) {
    if (val === undefined) continue;

    if (typeof val === 'string' && val.startsWith('data:')) {
      console.warn(`[SECURITY] Stripped base64 string from field '${key}' before Firestore write.`);
      continue;
    }

    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const nested = sanitizePackForFirestore(val, seen);
      if (nested !== undefined) {
        clean[key] = nested;
      }
    } else {
      clean[key] = val;
    }
  }

  return clean;
}

const initialPacks = loadInitialPacks();

export const useBeatPackStore = create<BeatPackState>()((set, get) => ({
  packs: initialPacks,
  isLoading: false,
  isHydrated: true,

  addPack: async (newPack: BeatPack) => {
    const state = get();
    // Idempotency check
    const existingIndex = state.packs.findIndex((p) => p.id === newPack.id);
    let updatedPacks: BeatPack[];
    if (existingIndex >= 0) {
      updatedPacks = state.packs.map((p) => (p.id === newPack.id ? { ...p, ...newPack } : p));
    } else {
      updatedPacks = [newPack, ...state.packs];
    }

    // Immediate persistent local update
    set({ packs: updatedPacks });
    persistPacks(updatedPacks);
    console.log(`[PACK_PERSISTENCE] Beat Pack added & persisted locally: ${newPack.id} (${newPack.title})`);

    // Asynchronous Firestore write (beat_packs/{packId})
    const cleanDoc = sanitizePackForFirestore(newPack);
    try {
      await setDoc(doc(db, 'beat_packs', newPack.id), cleanDoc);
      console.log(`[FIRESTORE_PACKS] Beat Pack persisted to Firestore: ${newPack.id}`);
    } catch (err: any) {
      console.warn('[FIRESTORE_PACKS] Firestore write warning (persisted locally):', err?.message || err);
    }

    return newPack;
  },

  updatePack: async (id: string, partialPack: Partial<BeatPack>) => {
    const state = get();
    const updatedPacks = state.packs.map((p) => (p.id === id ? { ...p, ...partialPack } : p));
    set({ packs: updatedPacks });
    persistPacks(updatedPacks);
    console.log(`[PACK_PERSISTENCE] Beat Pack updated locally: ${id}`);

    const cleanPartial = sanitizePackForFirestore(partialPack);
    try {
      await updateDoc(doc(db, 'beat_packs', id), cleanPartial);
      console.log(`[FIRESTORE_PACKS] Beat Pack updated in Firestore: ${id}`);
    } catch (err: any) {
      console.warn('[FIRESTORE_PACKS] Firestore update warning:', err?.message || err);
    }
  },

  removePack: async (id: string) => {
    const state = get();
    const updatedPacks = state.packs.filter((p) => p.id !== id);
    set({ packs: updatedPacks });
    persistPacks(updatedPacks);
    console.log(`[PACK_PERSISTENCE] Beat Pack removed locally: ${id}`);

    try {
      await deleteDoc(doc(db, 'beat_packs', id));
      console.log(`[FIRESTORE_PACKS] Beat Pack deleted from Firestore: ${id}`);
    } catch (err: any) {
      console.warn('[FIRESTORE_PACKS] Firestore delete warning:', err?.message || err);
    }
  },
}));

// Initialize real-time Firestore listener for Beat Packs
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

      if (livePacks.length > 0) {
        // Sort chronological descending
        livePacks.sort((a, b) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });

        // Merge with local state to ensure no local unsynced packs are lost
        const currentPacks = useBeatPackStore.getState().packs;
        const mergedMap = new Map<string, BeatPack>();

        for (const lp of livePacks) {
          mergedMap.set(lp.id, lp);
        }
        for (const cp of currentPacks) {
          if (!mergedMap.has(cp.id)) {
            mergedMap.set(cp.id, cp);
          }
        }

        const mergedPacks = Array.from(mergedMap.values());
        mergedPacks.sort((a, b) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });

        useBeatPackStore.setState({ packs: mergedPacks, isLoading: false, isHydrated: true });
        persistPacks(mergedPacks);
        console.log(`[FIRESTORE_PACKS] Synced ${livePacks.length} packs from cloud database (${mergedPacks.length} total).`);
      }
    },
    (err) => {
      // Graceful fallback to local persistence if offline
      useBeatPackStore.setState({ isLoading: false });
    }
  );
}
