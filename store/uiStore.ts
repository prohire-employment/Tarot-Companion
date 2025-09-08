import { create } from 'zustand';
import type { View, JournalFilter } from '../types';

interface UIState {
  activeView: View;
  toastMessage: string | null;
  journalFilter: JournalFilter | null;
  setActiveView: (view: View) => void;
  showToast: (message: string) => void;
  hideToast: () => void;
  setJournalFilter: (filter: JournalFilter | null) => void;
}

export const useUiStore = create<UIState>((set) => ({
  activeView: 'home', // Initial state is simple, hook will sync it.
  toastMessage: null,
  journalFilter: null,
  setActiveView: (view) => set({ activeView: view }), // Only sets state
  showToast: (message) => set({ toastMessage: message }),
  hideToast: () => set({ toastMessage: null }),
  setJournalFilter: (filter) => set({ journalFilter: filter }),
}));
