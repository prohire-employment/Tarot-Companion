import React, { useState, useMemo } from 'react';
import { useJournalStore } from '../../store/journalStore';
import { JournalIcon } from '../icons/NavIcons';
import { useUiStore } from '../../store/uiStore';
import type { JournalEntry } from '../../types';
import ConfirmModal from '../ConfirmModal';
import EntryEditorModal from '../journal/EntryEditorModal';
import CardBack from '../CardBack';

const JournalView: React.FC = () => {
  const { entries, deleteEntry } = useJournalStore();
  const { setActiveView, showToast } = useUiStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(entries[0]?.id || null);

  // State for modals
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [entryToDeleteId, setEntryToDeleteId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<JournalEntry | null>(null);

  const filteredEntries = useMemo(() => {
    if (!searchTerm) return entries;
    const lowercasedTerm = searchTerm.toLowerCase();
    return entries.filter(entry => {
      const cardNames = entry.drawnCards.map(dc => dc.card.name).join(' ');
      const content = `${entry.dateISO} ${entry.question || ''} ${cardNames} ${entry.impression} ${entry.interpretation.outer} ${entry.interpretation.inner} ${entry.interpretation.whispers.join(' ')} ${(entry.tags || []).join(' ')}`;
      return content.toLowerCase().includes(lowercasedTerm);
    });
  }, [entries, searchTerm]);

  const toggleEntry = (id: string) => {
    setExpandedEntryId(expandedEntryId === id ? null : id);
  };
  
  const handleDeleteClick = (entryId: string) => {
    setEntryToDeleteId(entryId);
    setIsDeleteConfirmOpen(true);
  };
  
  const proceedWithDelete = () => {
    if (entryToDeleteId) {
      deleteEntry(entryToDeleteId);
      showToast('Journal entry deleted.');
      if (expandedEntryId === entryToDeleteId) {
        setExpandedEntryId(null);
      }
    }
    setEntryToDeleteId(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleEditClick = (entry: JournalEntry) => {
    setEntryToEdit(entry);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6 font-serif">
        <h2 className="text-3xl font-bold text-accent text-center">Your Journal</h2>
        
        {entries.length > 0 && (
          <div className="sticky top-[73px] z-[5] bg-bg/80 backdrop-blur-sm py-2 -mx-2 px-2">
            <input
              type="search"
              placeholder="Search by card, date, or text..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-border rounded-ui p-3 text-text placeholder-sub/70 focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-sans"
            />
          </div>
        )}

        {filteredEntries.length > 0 ? (
          <ul className="space-y-4" role="list">
            {filteredEntries.map(entry => {
              const isExpanded = expandedEntryId === entry.id;
              return (
                <li key={entry.id} className="bg-surface rounded-card shadow-main overflow-hidden card-border">
                  <button 
                    onClick={() => toggleEntry(entry.id)} 
                    className="w-full text-left p-4 hover:bg-border/30 transition-colors rounded-t-card focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                    aria-expanded={isExpanded}
                    aria-controls={`entry-content-${entry.id}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <strong className="text-lg text-text">{entry.drawnCards.map(dc => dc.card.name).join(', ')}</strong>
                        <p className="text-sm text-sub">{new Date(entry.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`transform transition-transform text-sub ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>▼</span>
                    </div>
                    {!isExpanded && <p className="text-sub mt-2 truncate">{entry.question ? `"${entry.question}"` : (entry.impression || entry.interpretation.outer)}</p>}
                  </button>
                  
                  <div 
                    id={`entry-content-${entry.id}`}
                    className={`transition-all duration-500 ease-soft overflow-hidden ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="p-4 border-t border-border space-y-4">
                       <div className="opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
                          <h4 className="font-bold text-accent">Date</h4>
                          <p>{new Date(entry.createdAt).toLocaleString()}</p>
                       </div>
                       {entry.question && (
                        <div className="opacity-0 animate-fade-in" style={{ animationDelay: '150ms' }}>
                          <h4 className="font-bold text-accent">Your Question</h4>
                          <p className="whitespace-pre-wrap italic">"{entry.question}"</p>
                        </div>
                       )}
                       <div className="opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
                          <h4 className="font-bold text-accent">Card(s) Drawn</h4>
                          {entry.drawnCards.length > 1 ? (
                            <div className="flex overflow-x-auto gap-4 py-4 snap-x snap-mandatory no-scrollbar -mx-4 px-4">
                              {entry.drawnCards.map((dc, i) => (
                                <div key={i} className="flex-shrink-0 w-48 md:w-56 snap-center space-y-2 text-center">
                                  {dc.card.imageUrl ? (
                                    <img src={dc.card.imageUrl} alt={`Art for ${dc.card.name}`} className="rounded-card shadow-md w-full" />
                                  ) : (
                                    <CardBack />
                                  )}
                                  <div className="px-1">
                                    <p className="font-bold text-text text-base">{dc.position}</p>
                                    <p className="text-sub text-sm">{dc.card.name} {dc.reversed ? '(Reversed)' : ''}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-2 flex justify-center">
                              {entry.drawnCards[0] && (
                                <div className="w-64 md:w-72 space-y-2 text-center">
                                  {entry.drawnCards[0].card.imageUrl ? (
                                    <img src={entry.drawnCards[0].card.imageUrl} alt={`Art for ${entry.drawnCards[0].card.name}`} className="rounded-card shadow-md w-full" />
                                  ) : (
                                    <CardBack />
                                  )}
                                  <div className="px-1">
                                    <p className="font-bold text-text text-lg">{entry.drawnCards[0].position}</p>
                                    <p className="text-sub">{entry.drawnCards[0].card.name} {entry.drawnCards[0].reversed ? '(Reversed)' : ''}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                       <div className="opacity-0 animate-fade-in" style={{ animationDelay: '250ms' }}>
                          <h4 className="font-bold text-accent">Impression</h4>
                          <p className="whitespace-pre-wrap">{entry.impression || 'No impression recorded.'}</p>
                       </div>
                       <div className="opacity-0 animate-fade-in" style={{ animationDelay: '300ms' }}>
                          <h4 className="font-bold text-accent">Tags</h4>
                          {entry.tags && entry.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {entry.tags.map(tag => (
                                <span key={tag} className="bg-accent/20 text-accent text-xs font-medium px-2.5 py-1 rounded-full font-sans">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p>No tags recorded.</p>
                          )}
                        </div>
                        <div className="opacity-0 animate-fade-in" style={{ animationDelay: '350ms' }}>
                          <h4 className="font-bold text-accent">Outer</h4>
                          <p>{entry.interpretation.outer}</p>
                       </div>
                       <div className="opacity-0 animate-fade-in" style={{ animationDelay: '400ms' }}>
                          <h4 className="font-bold text-accent">Inner</h4>
                          <p>{entry.interpretation.inner}</p>
                       </div>
                       <div className="opacity-0 animate-fade-in" style={{ animationDelay: '450ms' }}>
                          <h4 className="font-bold text-accent">Whispers</h4>
                          <ul className="list-disc list-inside">
                             {entry.interpretation.whispers.map((w,i)=><li key={i}>{w}</li>)}
                          </ul>
                       </div>
                       <div className="flex justify-end gap-2 pt-4 border-t border-border/50 font-sans">
                          <button onClick={() => handleEditClick(entry)} className="bg-border px-4 py-2 text-sm rounded-md hover:bg-border/70">Edit</button>
                          <button onClick={() => handleDeleteClick(entry.id)} className="bg-red-900/50 px-4 py-2 text-sm text-red-300 rounded-md hover:bg-red-900/80">Delete</button>
                       </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="text-center text-sub py-10">
            {entries.length === 0 ? (
               <div className="text-center text-sub py-16 px-6 bg-surface rounded-card card-border">
                <JournalIcon className="w-16 h-16 mx-auto text-sub/50 mb-4" />
                <h3 className="text-xl font-serif text-text mb-2">Your Journal Awaits</h3>
                <p>The story of your journey will be written here.</p>
                <button onClick={() => setActiveView('home')} className="mt-4 font-sans bg-accent text-accent-dark font-bold py-2 px-6 rounded-ui hover:opacity-90 transition-opacity">
                  Draw Your First Card
                </button>
              </div>
            ) : (
              <p>No entries match your search.</p>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={proceedWithDelete}
        title="Delete Entry?"
      >
        <p>Are you sure you want to delete this journal entry? This action cannot be undone.</p>
      </ConfirmModal>

      <EntryEditorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        entryToEdit={entryToEdit}
      />
    </>
  );
};

export default JournalView;