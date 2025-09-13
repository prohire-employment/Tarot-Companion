import { create } from 'zustand';
import { SPREADS } from '../data/spreads';
import type { Spread, DrawnCard, ReadingPhase, InterpretationLayer, InterpretedCard } from '../types';

type InputMethod = 'digital' | 'manual' | 'photo' | 'voice';

// Combines state from the old reducer and the old flow store
interface ReadingStoreState {
    // --- Active Reading State (from the old reducer) ---
    phase: ReadingPhase;
    drawnCards: DrawnCard[];
    interpretation: {
        overall: InterpretationLayer;
        cards: InterpretedCard[];
    } | null;
    spread: Spread | null; // The spread used for the active reading
    question: string; // The question for the active reading
    error: string | null;

    // --- Configuration State (from the old useReadingFlowStore) ---
    configQuestion: string;
    selectedSpreadId: string;
    inputMethod: InputMethod;
    
    // --- Actions ---
    setConfigQuestion: (question: string) => void;
    setSelectedSpreadId: (id: string) => void;
    setInputMethod: (method: InputMethod) => void;
    resetConfig: () => void;

    startReading: (payload: { cards: DrawnCard[], spread: Spread, question: string }) => void;
    setImageGenerationSuccess: (payload: { cardsWithImages: DrawnCard[] }) => void;
    setImageGenerationFailure: (payload: { error: string }) => void;
    setInterpretationSuccess: (payload: { interpretation: ReadingStoreState['interpretation'] }) => void;
    setInterpretationFailure: (payload: { error: string }) => void;
    retryImageGeneration: () => void;
    retryInterpretation: () => void;
    continueWithoutArt: () => void;
    resetReading: () => void;
}

const initialConfigState = {
  configQuestion: '',
  selectedSpreadId: SPREADS[1].id, // Default to Past, Present, Future
  inputMethod: 'digital' as const,
};

const initialReadingState = {
    phase: 'dashboard' as const,
    drawnCards: [],
    interpretation: null,
    spread: null,
    question: '',
    error: null,
};

export const useReadingStore = create<ReadingStoreState>((set) => ({
    ...initialReadingState,
    ...initialConfigState,

    // --- Config Actions ---
    setConfigQuestion: (question) => set({ configQuestion: question }),
    setSelectedSpreadId: (id) => set({ selectedSpreadId: id }),
    setInputMethod: (method) => set({ inputMethod: method }),
    resetConfig: () => set(initialConfigState),

    // --- Reading Flow Actions (mirroring the old reducer) ---
    startReading: ({ cards, spread, question }) => set({
        ...initialReadingState, // Clear previous reading results
        phase: 'generatingImages',
        drawnCards: cards,
        spread: spread,
        question: question,
    }),
    
    setImageGenerationSuccess: ({ cardsWithImages }) => set(state => ({
        ...state,
        phase: 'loading',
        drawnCards: cardsWithImages,
        error: null,
    })),

    setImageGenerationFailure: ({ error }) => set({ phase: 'imageError', error: error }),
    
    setInterpretationSuccess: ({ interpretation }) => set(state => ({
        ...state,
        phase: 'result',
        interpretation: interpretation,
        error: null,
    })),

    setInterpretationFailure: ({ error }) => set({ phase: 'interpretationError', error: error }),

    retryImageGeneration: () => set(state => ({ ...state, phase: 'generatingImages', error: null })),
    
    retryInterpretation: () => set(state => ({ ...state, phase: 'loading', error: null })),

    continueWithoutArt: () => set(state => ({ ...state, phase: 'loading', error: null })),

    resetReading: () => set({ ...initialReadingState }),
}));