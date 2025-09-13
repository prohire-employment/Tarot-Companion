
import React, { useState, useMemo, useCallback } from 'react';
import { useJournalStore } from '../../store/journalStore';
import { useUiStore } from '../../store/uiStore';
import type { JournalEntry } from '../../types';
import JournalEntryCard from '../journal/JournalEntryCard';
import EntryEditorModal from '../journal/EntryEditorModal';
import ConfirmModal from '../ConfirmModal';

const JournalView: React.FC = () => {
  const { entries, deleteEntry } = useJournalStore();
  const { journalFilter, setJournalFilter } = useUiStore();

  const [activeTag, setActiveTag] = useState<string | null>(null);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<JournalEntry | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [entryToDeleteId, setEntryToDeleteId] = useState<string | null>(null);

  const handleEdit = useCallback((entry: JournalEntry) => {
    setEntryToEdit(entry);
    setIsEditorOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((id: string) => {
    setEntryToDeleteId(id);
    setIsConfirmOpen(true);
  }, []);

  const proceedWithDelete = useCallback(() => {
    if (entryToDeleteId) {
      deleteEntry(entryToDeleteId);
    }
    setIsConfirmOpen(false);
    setEntryToDeleteId(null);
  }, [entryToDeleteId, deleteEntry]);

  const handleTagClick = useCallback((tag: string) => {
    // Clicking a tag sets it as a local filter. Clicking it again clears it.
    setActiveTag(prev => (prev === tag ? null : tag));
    // Clear any global date/id filters when a tag is clicked
    if (journalFilter) {
      setJournalFilter(null);
    }
  }, [setJournalFilter, journalFilter]);

  const clearFilters = useCallback(() => {
    setJournalFilter(null);
    setActiveTag(null);
  }, [setJournalFilter]);

  const filteredEntries = useMemo(() => {
    let filtered = entries;

    if (journalFilter) {
      if (journalFilter.type === 'id') {
        filtered = entries.filter(e => e.id === journalFilter.value);
      } else if (journalFilter.type === 'date') {
        filtered = entries.filter(e => e.dateISO === journalFilter.value);
      }
    } else if (activeTag) {
      filtered = entries.filter(e => e.tags?.includes(activeTag));
    }

    return filtered;
  }, [entries, journalFilter, activeTag]);

  const getFilterDescription = (): string => {
    if (journalFilter) {
      if (journalFilter.type === 'id') {
        return `Showing a single entry.`;
      }
      if (journalFilter.type === 'date') {
        const [year, month, day] = journalFilter.value.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return `Showing entries for ${date.toLocaleDateString()}.`;
      }
    }
    if (activeTag) {
      return `Showing entries tagged with "${activeTag}".`;
    }
    return '';
  };

  const renderContent = () => {
    if (entries.length === 0) {
      return (
        <div className="text-center py-16 bg-surface/70 backdrop-blur-lg rounded-card shadow-main card-border">
          <h3 className="text-xl font-bold text-text">Your Journal is Empty</h3>
          <p className="text-sub mt-2">Perform a reading on the Home screen to begin your collection.</p>
        </div>
      );
    }
    
    if (filteredEntries.length === 0) {
      return (
         <div className="text-center py-16 bg-surface/70 backdrop-blur-lg rounded-card shadow-main card-border">
          <h3 className="text-xl font-bold text-text">No Entries Found</h3>
          <p className="text-sub mt-2">No entries match your current filter.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {filteredEntries.map(entry => (
          <JournalEntryCard 
            key={entry.id}
            entry={entry}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            onTagClick={handleTagClick}
          />
        ))}
      </div>
    );
  };
  
  const showFilterBar = journalFilter || activeTag;

  return (
    <>
      <div className="space-y-6 font-serif">
        <h2 className="text-3xl font-bold text-accent text-center">Journal</h2>

        {showFilterBar && (
          <div className="bg-surface/70 backdrop-blur-lg rounded-card shadow-main p-4 card-border flex flex-col sm:flex-row justify-between items-center gap-4 animate-fade-in">
            <p className="text-sub text-sm text-center sm:text-left">
              {getFilterDescription()}
            </p>
            <button
              onClick={clearFilters}
              className="font-sans bg-border text-text font-bold text-sm py-2 px-4 rounded-ui hover:bg-border/70 transition-colors flex-shrink-0"
            >
              Clear Filter
            </button>
          </div>
        )}

        {renderContent()}
      </div>

      <EntryEditorModal 
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        entryToEdit={entryToEdit}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={proceedWithDelete}
        title="Delete Entry?"
      >
        <p>Are you sure you want to delete this journal entry? This action cannot be undone.</p>
      </ConfirmModal>
    </>
  );
};

export default JournalView;
