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
  bulkUpdateBeats: (ids: string[], partialBeat: Partial<Beat>) => Promise<void>;
  bulkDeleteBeats: (ids: string[]) => Promise<void>;
  removeBeat: (id: string) => Promise<void>;
  clearCatalog: () => void;
  findBeatByIdempotencyKey: (key: string) => Beat | undefined;
}

const STORAGE_KEY = 'kraezelv_persistent_beats_v2';

function loadInitialBeats(): Beat[] {
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
    console.warn('[STORAGE] Failed to load beats from localStorage:', e);
  }
  return [];
}

function persistBeats(beats: Beat[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(beats));
  } catch (e) {
    console.warn('[STORAGE] Failed to save beats to localStorage:', e);
  }
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

const initialBeats = loadInitialBeats();

export const useBeatCatalogStore = create<BeatCatalogState>()((set, get) => ({
  beats: initialBeats,
  isLoading: false,
  isHydrated: true,

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

    // 2. Immediate persistent local update
    const updatedBeats = [newBeat, ...state.beats];
    set({ beats: updatedBeats });
    persistBeats(updatedBeats);
    console.log(`[CATALOG_PERSISTENCE] Beat added & persisted locally: ${newBeat.id} (${newBeat.title})`);

    // 3. Write to Authoritative Firestore collection: beats/{beatId} (non-blocking)
    const cleanDoc = sanitizeBeatForFirestore(newBeat);
    try {
      await setDoc(doc(db, 'beats', newBeat.id), cleanDoc);
      console.log(`[FIRESTORE_CATALOG] Beat persisted to Firestore: ${newBeat.id}`);
    } catch (err: any) {
      console.warn('[FIRESTORE_CATALOG] Firestore direct write warning (persisted locally):', err?.message || err);
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
    const state = get();
    const updatedBeats = state.beats.map((b) =>
      b.id === id ? { ...b, ...partialBeat } : b
    );
    set({ beats: updatedBeats });
    persistBeats(updatedBeats);
    console.log(`[CATALOG_PERSISTENCE] Beat updated: ${id}`);

    // Authoritative Firestore update
    const cleanPartial = sanitizeBeatForFirestore(partialBeat);
    try {
      await updateDoc(doc(db, 'beats', id), cleanPartial);
      console.log(`[FIRESTORE_CATALOG] Beat updated in Firestore: ${id}`);
    } catch (err: any) {
      console.warn('[FIRESTORE_CATALOG] Firestore updateDoc warning:', err?.message || err);
    }
  },

  bulkUpdateBeats: async (ids: string[], partialBeat: Partial<Beat>) => {
    const state = get();
    const idSet = new Set(ids);
    const updatedBeats = state.beats.map((b) =>
      idSet.has(b.id) ? { ...b, ...partialBeat } : b
    );
    set({ beats: updatedBeats });
    persistBeats(updatedBeats);

    const cleanPartial = sanitizeBeatForFirestore(partialBeat);
    const chunkSize = 20;
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (id) => {
          try {
            await updateDoc(doc(db, 'beats', id), cleanPartial);
          } catch (err: any) {
            console.warn(`[FIRESTORE_CATALOG] Firestore bulk update warning for ${id}:`, err?.message || err);
          }
        })
      );
    }
  },

  bulkDeleteBeats: async (ids: string[]) => {
    const state = get();
    const idSet = new Set(ids);
    const updatedBeats = state.beats.filter((b) => !idSet.has(b.id));
    set({ beats: updatedBeats });
    persistBeats(updatedBeats);

    const chunkSize = 20;
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (id) => {
          try {
            await deleteDoc(doc(db, 'beats', id));
          } catch (err: any) {
            console.warn(`[FIRESTORE_CATALOG] Firestore bulk delete warning for ${id}:`, err?.message || err);
          }
        })
      );
    }
  },

  removeBeat: async (id: string) => {
    const state = get();
    const updatedBeats = state.beats.filter((b) => b.id !== id);
    set({ beats: updatedBeats });
    persistBeats(updatedBeats);
    console.log(`[CATALOG_PERSISTENCE] Beat removed: ${id}`);

    // Authoritative Firestore deletion
    try {
      await deleteDoc(doc(db, 'beats', id));
      console.log(`[FIRESTORE_CATALOG] Beat removed from Firestore: ${id}`);
    } catch (err: any) {
      console.warn('[FIRESTORE_CATALOG] Firestore deleteDoc warning:', err?.message || err);
    }
  },

  clearCatalog: () => {
    set({ beats: [] });
    persistBeats([]);
  },
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

      if (liveBeats.length > 0) {
        // Sort chronological descending
        liveBeats.sort((a, b) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });

        // Merge with local state to ensure no local unsynced beats are lost
        const currentBeats = useBeatCatalogStore.getState().beats;
        const mergedMap = new Map<string, Beat>();
        
        // Add live beats first
        for (const lb of liveBeats) {
          mergedMap.set(lb.id, lb);
        }
        // Add current local beats if not in live beats
        for (const cb of currentBeats) {
          if (!mergedMap.has(cb.id)) {
            mergedMap.set(cb.id, cb);
          }
        }

        const mergedBeats = Array.from(mergedMap.values());
        mergedBeats.sort((a, b) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });

        useBeatCatalogStore.setState({
          beats: mergedBeats,
          isLoading: false,
          isHydrated: true,
        });
        persistBeats(mergedBeats);

        console.log(`[FIRESTORE_CATALOG] Synced ${liveBeats.length} beats from cloud database (${mergedBeats.length} total).`);
      }
    },
    (err) => {
      console.warn('[FIRESTORE_CATALOG] onSnapshot subscription warning:', err?.message || err);
      useBeatCatalogStore.setState({ isLoading: false });
    }
  );
}
