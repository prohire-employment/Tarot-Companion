import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { JournalEntry } from '../types';
import { LS_ENTRIES_KEY } from '../constants';

interface JournalState {
  entries: JournalEntry[];
  addEntry: (entry: JournalEntry) => void;
  updateEntry: (entry: JournalEntry) => void;
  deleteEntry: (entryId: string) => void;
  setEntries: (entries: JournalEntry[]) => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) => set((state) => ({ 
        entries: [entry, ...state.entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) 
      })),
      updateEntry: (updatedEntry) => set((state) => ({
        entries: state.entries.map(e => e.id === updatedEntry.id ? updatedEntry : e)
      })),
      deleteEntry: (entryId) => set((state) => ({
        entries: state.entries.filter(e => e.id !== entryId)
      })),
      setEntries: (entries) => set({ entries }),
    }),
    {
      name: LS_ENTRIES_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);