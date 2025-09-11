import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { View, JournalFilter } from '../types';

interface UIState {
  activeView: View;
  toastMessage: string | null;
  journalFilter: JournalFilter | null;
  hasSeenTutorial: boolean;
  setActiveView: (view: View) => void;
  showToast: (message: string) => void;
  hideToast: () => void;
  setJournalFilter: (filter: JournalFilter | null) => void;
  setHasSeenTutorial: (hasSeen: boolean) => void;
}

export const useUiStore = create<UIState>()(
  persist(
    (set) => ({
      activeView: 'home',
      toastMessage: null,
      journalFilter: null,
      hasSeenTutorial: false,
      setActiveView: (view) => set({ activeView: view }),
      showToast: (message) => set({ toastMessage: message }),
      hideToast: () => set({ toastMessage: null }),
      setJournalFilter: (filter) => set({ journalFilter: filter }),
      setHasSeenTutorial: (hasSeen) => set({ hasSeenTutorial: hasSeen }),
    }),
    {
      name: 'tc.ui',
      storage: createJSONStorage(() => localStorage),
      // Only persist the tutorial status, not transient state like toasts or filters.
      partialize: (state) => ({ hasSeenTutorial: state.hasSeenTutorial }),
    }
  )
);