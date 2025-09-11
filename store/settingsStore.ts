import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppSettings } from '../types';
import { LS_SETTINGS_KEY } from '../constants';

interface SettingsState {
  settings: AppSettings;
  setSettings: (settings: AppSettings | ((prev: AppSettings) => AppSettings)) => void;
}

const defaultSettings: AppSettings = {
  reminderTime: '09:00',
  notificationsEnabled: false,
  deckType: 'full',
  includeReversals: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      setSettings: (newSettings) => set((state) => ({
        settings: typeof newSettings === 'function' ? newSettings(state.settings) : newSettings
      })),
    }),
    {
      name: LS_SETTINGS_KEY,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.settings = { ...defaultSettings, ...state.settings };
        }
      },
    }
  )
);