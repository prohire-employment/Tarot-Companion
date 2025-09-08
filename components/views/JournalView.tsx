import React, { useState, useMemo, useEffect } from 'react';
import { useJournalStore } from '../../store/journalStore';
import { useUiStore } from '../../store/uiStore';
import type { JournalEntry } from '../../types';
import ConfirmModal from '../ConfirmModal';
import EntryEditorModal from '../journal/EntryEditorModal';
import JournalEntryCard from '../journal/JournalEntryCard';

const JournalView: React.FC = () => {
  const { entries, deleteEntry } = useJournalStore();
  const { journalFilter, setJournalFilter } = useUiStore();

  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [entryToEdit, setEntryToEdit] = useState<JournalEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<{ type: 'tag' | 'date', value: string } | null>(null);
  
  useEffect(() => {
    if (journalFilter) {
      setSearchTerm('');
      setActiveFilter({ type: 'date', value: journalFilter.dateISO });
      // Clear the filter from the store so it's not sticky
      setJournalFilter(null);
    }
  }, [journalFilter, setJournalFilter]);

  const uniqueTags = useMemo(() => {
    const allTags = new Set<string>();
    entries.forEach(entry => {
      entry.tags?.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  }, [entries]);
  
  const filteredEntries = useMemo(() => {
    return entries
      .filter(entry => {
        if (!activeFilter) return true;
        if (activeFilter.type === 'tag') {
          return entry.tags?.includes(activeFilter.value);
        }
        if (activeFilter.type === 'date') {
          return entry.dateISO === activeFilter.value;
        }
        return true;
      })
      .filter(entry => {
        const term = searchTerm.toLowerCase();
        if (!term) return true;
        
        const inQuestion = entry.question?.toLowerCase().includes(term);
        const inImpression = entry.impression?.toLowerCase().includes(term);
        const inCardNames = entry.drawnCards.some(dc => dc.card.name.toLowerCase().includes(term));
        const inSpreadName = entry.spread.name.toLowerCase().includes(term);

        return inQuestion || inImpression || inCardNames || inSpreadName;
      });
  }, [entries, searchTerm, activeFilter]);
  
  const handleTagClick = (tag: string | null) => {
    setSearchTerm('');
    if (tag && activeFilter?.type === 'tag' && activeFilter.value === tag) {
      setActiveFilter(null); // Toggle off if same tag is clicked
    } else if (tag) {
      setActiveFilter({ type: 'tag', value: tag });
    } else {
      setActiveFilter(null);
    }
  };

  return (
    <>
      <div className="space-y-6 font-serif">
        <h2 className="text-3xl font-bold text-accent text-center">My Journal</h2>
        
        <div className="bg-surface/70 p-4 rounded-card card-border font-sans space-y-4">
            <input 
                type="search"
                placeholder="Search by card, question, impression..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  if (activeFilter?.type === 'date') setActiveFilter(null); // Clear date filter when searching
                }}
                className="w-full bg-bg/50 border border-border rounded-ui p-3 text-text placeholder-sub/70 focus:ring-2 focus:ring-accent"
            />
            {uniqueTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={() => handleTagClick(null)}
                        className={`text-xs px-3 py-1 rounded-full transition-colors ${!activeFilter || activeFilter.type !== 'tag' ? 'bg-accent text-accent-dark font-bold' : 'bg-border/50 text-sub hover:bg-border'}`}
                    >
                        All
                    </button>
                    {uniqueTags.map(tag => (
                        <button 
                            key={tag}
                            onClick={() => handleTagClick(tag)}
                            className={`text-xs px-3 py-1 rounded-full transition-colors ${activeFilter?.type === 'tag' && activeFilter.value === tag ? 'bg-accent text-accent-dark font-bold' : 'bg-border/50 text-sub hover:bg-border'}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}
            {activeFilter?.type === 'date' && (
              <div className="flex justify-center">
                <div className="bg-accent/20 text-accent text-sm px-3 py-1 rounded-full flex items-center gap-2">
                  <span>Showing reading for: {new Date(activeFilter.value + 'T00:00:00').toDateString()}</span>
                  <button onClick={() => setActiveFilter(null)} className="font-bold text-lg leading-none">&times;</button>
                </div>
              </div>
            )}
        </div>

        {filteredEntries.length > 0 ? (
          <div className="space-y-6">
            {filteredEntries.map(entry => (
              <JournalEntryCard 
                key={entry.id}
                entry={entry}
                onEdit={() => setEntryToEdit(entry)}
                onDelete={() => setEntryToDelete(entry.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface rounded-card shadow-main card-border">
            <p className="text-sub">No journal entries found.</p>
            <p className="text-sub/80 mt-2">Try adjusting your search or filter, or complete a reading to save it here.</p>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!entryToDelete}
        onClose={() => setEntryToDelete(null)}
        onConfirm={() => {
          if (entryToDelete) deleteEntry(entryToDelete);
          setEntryToDelete(null);
        }}
        title="Delete Entry?"
      >
        <p>Are you sure you want to delete this journal entry? This action cannot be undone.</p>
      </ConfirmModal>

      <EntryEditorModal
        isOpen={!!entryToEdit}
        onClose={() => setEntryToEdit(null)}
        entryToEdit={entryToEdit}
      />
    </>
  );
};

export default JournalView;
