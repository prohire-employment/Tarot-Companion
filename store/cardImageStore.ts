import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CardImageState {
  imageCache: Record<string, string>; // cardId -> base64 data URL
  addImageToCache: (cardId: string, imageUrl: string) => void;
  clearCache: () => void;
}

export const useCardImageStore = create<CardImageState>()(
  persist(
    (set) => ({
      imageCache: {},
      addImageToCache: (cardId, imageUrl) => set((state) => ({
        imageCache: { ...state.imageCache, [cardId]: imageUrl }
      })),
      clearCache: () => set({ imageCache: {} }),
    }),
    {
      name: 'tc.card-images',
      storage: createJSONStorage(() => localStorage),
    }
  )
);