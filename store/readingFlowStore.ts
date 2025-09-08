import { create } from 'zustand';
import { SPREADS } from '../data/spreads';

type InputMethod = 'digital' | 'manual' | 'photo' | 'voice';

interface ReadingFlowState {
  question: string;
  selectedSpreadId: string;
  inputMethod: InputMethod;
  setQuestion: (question: string) => void;
  setSelectedSpreadId: (id: string) => void;
  setInputMethod: (method: InputMethod) => void;
  reset: () => void;
}

const getInitialState = () => ({
  question: '',
  selectedSpreadId: SPREADS[0].id,
  inputMethod: 'digital' as const,
});

export const useReadingFlowStore = create<ReadingFlowState>((set) => ({
  ...getInitialState(),
  setQuestion: (question) => set({ question }),
  setSelectedSpreadId: (id) => set({ selectedSpreadId: id }),
  setInputMethod: (method) => set({ inputMethod: method }),
  reset: () => set(getInitialState()),
}));
