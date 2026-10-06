import { create } from 'zustand';

interface DiscoveryFilters {
  searchQuery: string;
  genre: string | null;
  bpm: number | null;
  key: string | null;
  mood: string | null;
  energy: string | null;
  style: string | null;
  tag: string | null;
  instrument: string | null;
  maxPrice: number | null;
  rankingPeriod: 'week' | 'month' | 'all';
  sortBy: 'featured' | 'new' | 'trending' | 'mostPlayed' | 'mostPurchased' | 'recent' | 'price-asc' | 'price-desc' | 'bpm-asc';
  viewMode: 'grid' | 'list';
}

interface DiscoveryStore extends DiscoveryFilters {
  setSearchQuery: (query: string) => void;
  setGenre: (genre: string | null) => void;
  setBpm: (bpm: number | null) => void;
  setKey: (key: string | null) => void;
  setMood: (mood: string | null) => void;
  setEnergy: (energy: string | null) => void;
  setStyle: (style: string | null) => void;
  setTag: (tag: string | null) => void;
  setInstrument: (instrument: string | null) => void;
  setMaxPrice: (maxPrice: number | null) => void;
  setRankingPeriod: (period: 'week' | 'month' | 'all') => void;
  setSortBy: (sortBy: DiscoveryFilters['sortBy']) => void;
  setViewMode: (viewMode: DiscoveryFilters['viewMode']) => void;
  resetFilters: () => void;
}

export const useDiscoveryStore = create<DiscoveryStore>((set) => ({
  searchQuery: '',
  genre: null,
  bpm: null,
  key: null,
  mood: null,
  energy: null,
  style: null,
  tag: null,
  instrument: null,
  maxPrice: null,
  rankingPeriod: 'all',
  sortBy: 'featured',
  viewMode: 'grid',

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setGenre: (genre) => set({ genre }),
  setBpm: (bpm) => set({ bpm }),
  setKey: (key) => set({ key }),
  setMood: (mood) => set({ mood }),
  setEnergy: (energy) => set({ energy }),
  setStyle: (style) => set({ style }),
  setTag: (tag) => set({ tag }),
  setInstrument: (instrument) => set({ instrument }),
  setMaxPrice: (maxPrice) => set({ maxPrice }),
  setRankingPeriod: (rankingPeriod) => set({ rankingPeriod }),
  setSortBy: (sortBy) => set({ sortBy }),
  setViewMode: (viewMode) => set({ viewMode }),
  resetFilters: () => set({
    searchQuery: '',
    genre: null,
    bpm: null,
    key: null,
    mood: null,
    energy: null,
    style: null,
    tag: null,
    instrument: null,
    maxPrice: null,
    rankingPeriod: 'all',
  }),
}));
