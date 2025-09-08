import { useCallback } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { SOUNDS } from '../data/sounds';

// Cache Audio objects to prevent re-creating them on every play.
const audioCache: { [key in keyof typeof SOUNDS]?: HTMLAudioElement } = {};

/**
 * A hook for playing UI sounds based on user settings.
 */
export const useSound = () => {
  const soundsEnabled = useSettingsStore((state) => state.settings.soundsEnabled);

  const playSound = useCallback((soundName: keyof typeof SOUNDS) => {
    if (!soundsEnabled) return;

    try {
      if (!audioCache[soundName]) {
        audioCache[soundName] = new Audio(SOUNDS[soundName]);
      }
      // play() returns a promise which can reject if the user hasn't interacted with the page yet.
      audioCache[soundName]?.play().catch(e => console.error("Error playing sound:", e));
    } catch (e) {
        console.error("Could not play sound", e);
    }
  }, [soundsEnabled]);

  return { playSound };
};
