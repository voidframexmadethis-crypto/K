import { create } from 'zustand';
import { Beat } from '../types';

interface AudioState {
  currentBeat: Beat | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  queue: Beat[];
  queueIndex: number;
  history: Beat[];
  isShuffle: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isQueueOpen: boolean;
  playbackSpeed: number;
  isRadioMode: boolean;
}

interface AudioStore extends AudioState {
  // Actions
  setBeat: (beat: Beat) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  next: () => void;
  previous: () => void;
  addToQueue: (beat: Beat) => void;
  setQueue: (beats: Beat[]) => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: 'none' | 'one' | 'all') => void;
  toggleQueue: () => void;
  clearQueue: () => void;
  removeFromQueue: (id: string) => void;
  setPlaybackSpeed: (speed: number) => void;
  setRadioMode: (active: boolean) => void;
}

export const useAudioStore = create<AudioStore>((set) => ({
  currentBeat: null,
  isPlaying: false,
  volume: 0.8,
  progress: 0,
  duration: 0,
  queue: [],
  queueIndex: 0,
  history: [],
  isShuffle: false,
  repeatMode: 'none',
  isQueueOpen: false,
  playbackSpeed: 1.0,
  isRadioMode: false,

  setBeat: (beat) => {
    // Dynamically log analytics event
    import('../services/analyticsService').then(({ logAnalyticsEvent }) => {
      const eventPayload: any = {
        eventType: 'play'
      };
      if (beat?.id) {
        eventPayload.beatId = beat.id;
      }
      if (beat?.title) {
        eventPayload.beatTitle = beat.title;
      }
      logAnalyticsEvent(eventPayload);
    }).catch(() => {});

    set((state) => {
      const newHistory = state.currentBeat ? [state.currentBeat, ...state.history.slice(0, 19)] : state.history;
      return { 
        currentBeat: beat, 
        isPlaying: true, 
        progress: 0,
        history: newHistory
      };
    });
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setVolume: (volume) => set({ volume }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  
  next: () => set((state) => {
    if (state.queue.length === 0) return state;
    
    let nextIndex = state.queueIndex + 1;
    if (state.isShuffle) {
      nextIndex = Math.floor(Math.random() * state.queue.length);
    } else if (nextIndex >= state.queue.length) {
      if (state.repeatMode === 'all') nextIndex = 0;
      else return { ...state, isPlaying: false };
    }

    return {
      queueIndex: nextIndex,
      currentBeat: state.queue[nextIndex],
      progress: 0,
      isPlaying: true
    };
  }),

  previous: () => set((state) => {
    if (state.queue.length === 0) return state;
    const prevIndex = (state.queueIndex - 1 + state.queue.length) % state.queue.length;
    return {
      queueIndex: prevIndex,
      currentBeat: state.queue[prevIndex],
      progress: 0,
      isPlaying: true
    };
  }),

  addToQueue: (beat) => set((state) => ({ queue: [...state.queue, beat] })),
  setQueue: (beats) => set({ queue: beats, queueIndex: 0 }),
  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
  setRepeatMode: (mode) => set({ repeatMode: mode }),
  toggleQueue: () => set((state) => ({ isQueueOpen: !state.isQueueOpen })),
  clearQueue: () => set({ queue: [], queueIndex: 0 }),
  removeFromQueue: (id) => set((state) => ({ 
    queue: state.queue.filter(b => b.id !== id) 
  })),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setRadioMode: (active) => set({ isRadioMode: active }),
}));
