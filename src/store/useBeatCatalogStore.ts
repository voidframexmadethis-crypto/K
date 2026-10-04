import { create } from 'zustand';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Beat } from '../types';

interface BeatCatalogState {
  beats: Beat[];
  isLoading: boolean;
  isHydrated: boolean;
  addBeat: (beat: Beat) => Promise<Beat>;
  updateBeat: (id: string, partialBeat: Partial<Beat>) => Promise<void>;
  removeBeat: (id: string) => Promise<void>;
  clearCatalog: () => void;
  findBeatByIdempotencyKey: (key: string) => Beat | undefined;
}

/**
 * Sanitizes beat objects before Firestore writes:
 * - Prevents circular references with WeakSet
 * - Strips any undefined fields (Firestore throws on undefined)
 * - Prohibits and strips base64 data URLs from ever entering Firestore
 */
function sanitizeBeatForFirestore(input: any, seen = new WeakSet()): any {
  if (!input || typeof input !== 'object') return input;
  if (seen.has(input)) return undefined;
  seen.add(input);

  const clean: any = {};

  for (const [key, val] of Object.entries(input)) {
    if (val === undefined) continue;

    // Reject and strip base64 data URLs
    if (typeof val === 'string' && val.startsWith('data:')) {
      console.warn(`[SECURITY] Stripped base64 string from field '${key}' before Firestore write.`);
      continue;
    }

    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const nested = sanitizeBeatForFirestore(val, seen);
      if (nested !== undefined) {
        clean[key] = nested;
      }
    } else {
      clean[key] = val;
    }
  }

  return clean;
}

export const useBeatCatalogStore = create<BeatCatalogState>()((set, get) => ({
  beats: [],
  isLoading: true,
  isHydrated: false,

  findBeatByIdempotencyKey: (key: string) => {
    if (!key) return undefined;
    return get().beats.find((b) => b.idempotencyKey === key);
  },

  addBeat: async (newBeat: Beat) => {
    const state = get();
    // 1. Idempotency check against in-memory catalog
    const existing = state.beats.find(
      (b) =>
        b.id === newBeat.id ||
        (newBeat.idempotencyKey && b.idempotencyKey === newBeat.idempotencyKey)
    );

    if (existing) {
      return existing;
    }

    // 2. Optimistic local state update
    set({ beats: [newBeat, ...state.beats] });

    // 3. Write to Authoritative Firestore collection: beats/{beatId}
    const cleanDoc = sanitizeBeatForFirestore(newBeat);
    try {
      await setDoc(doc(db, 'beats', newBeat.id), cleanDoc);
      console.log(`[FIRESTORE_CATALOG] Beat persisted to Firestore: ${newBeat.id}`);
    } catch (err: any) {
      console.warn('[FIRESTORE_CATALOG] Firestore direct write error:', err?.message || err);
    }

    // 4. Also notify server-side publish endpoint for synchronization
    try {
      await fetch('/api/beats/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idempotencyKey: newBeat.idempotencyKey || `key_${newBeat.id}`,
          beatData: cleanDoc
        })
      });
    } catch (e) {
      // Non-blocking sync
    }

    return newBeat;
  },

  updateBeat: async (id: string, partialBeat: Partial<Beat>) => {
    // 1. Optimistic local update
    set((state) => ({
      beats: state.beats.map((b) =>
        b.id === id ? { ...b, ...partialBeat } : b
      ),
    }));

    // 2. Authoritative Firestore update
    const cleanPartial = sanitizeBeatForFirestore(partialBeat);
    try {
      await updateDoc(doc(db, 'beats', id), cleanPartial);
      console.log(`[FIRESTORE_CATALOG] Beat updated in Firestore: ${id}`);
    } catch (err: any) {
      console.warn('[FIRESTORE_CATALOG] Firestore updateDoc error:', err?.message || err);
    }
  },

  removeBeat: async (id: string) => {
    // 1. Optimistic local update
    set((state) => ({
      beats: state.beats.filter((b) => b.id !== id),
    }));

    // 2. Authoritative Firestore deletion
    try {
      await deleteDoc(doc(db, 'beats', id));
      console.log(`[FIRESTORE_CATALOG] Beat removed from Firestore: ${id}`);
    } catch (err: any) {
      console.warn('[FIRESTORE_CATALOG] Firestore deleteDoc error:', err?.message || err);
    }
  },

  clearCatalog: () => set({ beats: [] }),
}));

// Initialize authoritative real-time Firestore synchronization listener
if (typeof window !== 'undefined') {
  onSnapshot(
    collection(db, 'beats'),
    (snapshot) => {
      const liveBeats: Beat[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Beat;
        liveBeats.push({
          ...data,
          id: d.id,
        });
      });

      // Sort chronological descending
      liveBeats.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      useBeatCatalogStore.setState({
        beats: liveBeats,
        isLoading: false,
        isHydrated: true,
      });

      console.log(`[FIRESTORE_CATALOG] Synced ${liveBeats.length} beats from cloud database.`);
    },
    (err) => {
      console.warn('[FIRESTORE_CATALOG] onSnapshot subscription warning:', err?.message || err);
      useBeatCatalogStore.setState({ isLoading: false });
    }
  );
}
