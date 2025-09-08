import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Spread } from '../types';
import { LS_SPREADS_KEY } from '../constants';

interface SpreadState {
  customSpreads: Spread[];
  addSpread: (spread: Spread) => void;
  updateSpread: (spread: Spread) => void;
  deleteSpread: (spreadId: string) => void;
}

export const useSpreadStore = create<SpreadState>()(
  persist(
    (set) => ({
      customSpreads: [],
      addSpread: (spread) => set((state) => ({ 
        customSpreads: [...state.customSpreads, spread]
      })),
      updateSpread: (updatedSpread) => set((state) => ({
        customSpreads: state.customSpreads.map(s => s.id === updatedSpread.id ? updatedSpread : s)
      })),
      deleteSpread: (spreadId) => set((state) => ({
        customSpreads: state.customSpreads.filter(s => s.id !== spreadId)
      })),
    }),
    {
      name: LS_SPREADS_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);