import { create } from 'zustand';
import { CreatureMood } from '../types';

interface GazeTarget {
  x: number; // -1..1 relative to creature
  y: number; // -1..1 relative to creature
}

interface CreatureState {
  mood: CreatureMood;
  gaze: GazeTarget | null;
  bounceToken: number;
  setMood: (mood: CreatureMood) => void;
  setGaze: (gaze: GazeTarget | null) => void;
  bounce: () => void;
}

export const useCreatureStore = create<CreatureState>()((set) => ({
  mood: 'idle',
  gaze: null,
  bounceToken: 0,
  setMood: (mood) => set({ mood }),
  setGaze: (gaze) => set({ gaze }),
  bounce: () => set((s) => ({ bounceToken: s.bounceToken + 1 })),
}));
