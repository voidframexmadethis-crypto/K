import { create } from 'zustand';
import { Beat } from '../types';

export interface UserPlaylist {
  id: string;
  name: string;
  beatIds: string[];
  createdAt: string;
}

interface UserPreferencesState {
  recentBeats: Beat[];
  playlists: UserPlaylist[];
  favorites: string[];
  beatBattleVotes: Record<string, 'A' | 'B'>;
  
  // Actions
  addRecentBeat: (beat: Beat) => void;
  createPlaylist: (name: string) => UserPlaylist;
  addToPlaylist: (playlistId: string, beatId: string) => void;
  removeFromPlaylist: (playlistId: string, beatId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  toggleFavorite: (beatId: string) => void;
  voteBeatBattle: (battleId: string, choice: 'A' | 'B') => void;
}

const RECENT_KEY = 'kraezelv_recent_beats_v1';
const PLAYLISTS_KEY = 'kraezelv_user_playlists_v1';
const VOTES_KEY = 'kraezelv_battle_votes_v1';
const FAVORITES_KEY = 'kraezelv_favorite_beats_v1';

function loadFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function loadRecent(): Beat[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function loadPlaylists(): UserPlaylist[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PLAYLISTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [{
    id: 'my_next_project',
    name: 'MY NEXT PROJECT',
    beatIds: [],
    createdAt: new Date().toISOString()
  }];
}

function loadVotes(): Record<string, 'A' | 'B'> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export const useUserPreferencesStore = create<UserPreferencesState>((set, get) => ({
  recentBeats: loadRecent(),
  playlists: loadPlaylists(),
  favorites: loadFavorites(),
  beatBattleVotes: loadVotes(),

  addRecentBeat: (beat: Beat) => {
    if (!beat || !beat.id) return;
    const current = get().recentBeats;
    const filtered = current.filter(b => b.id !== beat.id);
    const updated = [beat, ...filtered].slice(0, 15);
    set({ recentBeats: updated });
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch (e) {}
  },

  createPlaylist: (name: string) => {
    const newPl: UserPlaylist = {
      id: `pl_${Date.now()}`,
      name: name.trim() || 'NEW PLAYLIST',
      beatIds: [],
      createdAt: new Date().toISOString()
    };
    const updated = [...get().playlists, newPl];
    set({ playlists: updated });
    try {
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
    } catch (e) {}
    return newPl;
  },

  addToPlaylist: (playlistId: string, beatId: string) => {
    const updated = get().playlists.map(pl => {
      if (pl.id === playlistId) {
        if (pl.beatIds.includes(beatId)) return pl;
        return { ...pl, beatIds: [...pl.beatIds, beatId] };
      }
      return pl;
    });
    set({ playlists: updated });
    try {
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
    } catch (e) {}
  },

  removeFromPlaylist: (playlistId: string, beatId: string) => {
    const updated = get().playlists.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, beatIds: pl.beatIds.filter(id => id !== beatId) };
      }
      return pl;
    });
    set({ playlists: updated });
    try {
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
    } catch (e) {}
  },

  deletePlaylist: (playlistId: string) => {
    const updated = get().playlists.filter(pl => pl.id !== playlistId);
    set({ playlists: updated });
    try {
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
    } catch (e) {}
  },

  toggleFavorite: (beatId: string) => {
    const current = get().favorites;
    const isFav = current.includes(beatId);
    const updated = isFav ? current.filter(id => id !== beatId) : [...current, beatId];
    set({ favorites: updated });
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch (e) {}
  },

  voteBeatBattle: (battleId: string, choice: 'A' | 'B') => {
    const updated = { ...get().beatBattleVotes, [battleId]: choice };
    set({ beatBattleVotes: updated });
    try {
      localStorage.setItem(VOTES_KEY, JSON.stringify(updated));
    } catch (e) {}
  }
}));
