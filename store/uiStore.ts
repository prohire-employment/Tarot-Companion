import { create } from 'zustand';
import { View } from '../types';

interface UIState {
  activeView: View;
  toastMessage: string | null;
  setActiveView: (view: View) => void;
  showToast: (message: string) => void;
  hideToast: () => void;
}

export const useUiStore = create<UIState>((set) => ({
  activeView: 'home',
  toastMessage: null,
  setActiveView: (view) => set({ activeView: view }),
  showToast: (message) => set({ toastMessage: message }),
  hideToast: () => set({ toastMessage: null }),
}));
