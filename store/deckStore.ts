import { create } from 'zustand';
import type { TarotCard } from '../types';

interface DeckState {
  deck: TarotCard[];
  isLoading: boolean;
  error: string | null;
  loadDeck: () => Promise<void>;
}

export const useDeckStore = create<DeckState>((set, get) => ({
  deck: [],
  isLoading: false,
  error: null,
  loadDeck: async () => {
    // Prevent re-fetching if deck is already loaded or is currently loading
    if (get().deck.length > 0 || get().isLoading) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      // Use dynamic import to code-split the large card data file
      const { TAROT_DECK } = await import('../data/cards');
      set({ deck: TAROT_DECK, isLoading: false });
    } catch (err) {
      console.error("Failed to load Tarot deck:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      set({ isLoading: false, error: `Could not load card library. ${message}` });
    }
  },
}));