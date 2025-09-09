import React, { useCallback } from 'react';
import type { JournalEntry } from '../../types';

interface JournalEntryCardProps {
    entry: JournalEntry;
    onEdit: (entry: JournalEntry) => void;
    onDelete: (id: string) => void;
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry, onEdit, onDelete }) => {
    
    const handleEditClick = useCallback(() => {
        onEdit(entry);
    }, [entry, onEdit]);
    
    const handleDeleteClick = useCallback(() => {
        onDelete(entry.id);
    }, [entry.id, onDelete]);

    return (
        <article className="bg-surface rounded-card shadow-main p-6 card-border animate-fade-in">
            <header className="border-b border-border pb-3 mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-accent">{entry.spread.name}</h3>
                        <p className="text-sm text-sub">{new Date(entry.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 font-sans">
                        <button onClick={handleEditClick} className="text-xs bg-border/50 px-3 py-1 rounded-md hover:bg-border">Edit</button>
                        <button onClick={handleDeleteClick} className="text-xs bg-red-900/50 text-red-300 px-3 py-1 rounded-md hover:bg-red-900/80">Delete</button>
                    </div>
                </div>
                {entry.question && <p className="text-sub italic mt-2">Question: "{entry.question}"</p>}
            </header>

            <div className="space-y-4">
                {entry.interpretation && (
                    <details className="group">
                        <summary className="cursor-pointer text-text font-bold hover:text-accent transition-colors list-none flex justify-between items-center">
                            <span>AI Interpretation</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-sub transition-transform duration-200 group-open:rotate-180">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </summary>
                        <div className="mt-2 pl-4 border-l-2 border-accent/20 space-y-3">
                            <h4 className="font-semibold text-accent/80">Overall Message</h4>
                            <p className="text-sub text-sm whitespace-pre-wrap">{entry.interpretation.overall}</p>
                            <h4 className="font-semibold text-accent/80">Card Meanings</h4>
                            <ul className="space-y-2">
                                {entry.interpretation.cards?.map((cardInterp, index) => {
                                    const position = entry.spread?.positions?.[index];
                                    return (
                                        <li key={index} className="text-sub text-sm">
                                            <strong>{position?.title || `Position ${index + 1}`} ({cardInterp.cardName}):</strong> {cardInterp.meaning}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </details>
                )}

                <div>
                    <h4 className="font-bold text-text">Your Impression</h4>
                    <p className="text-sub text-sm whitespace-pre-wrap">{entry.impression || "No impression recorded."}</p>
                </div>

                {entry.tags && entry.tags.length > 0 && (
                <div>
                    <h4 className="font-bold text-text">Tags</h4>
                    <div className="flex flex-wrap gap-2 mt-1 font-sans">
                    {entry.tags.map(tag => <span key={tag} className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">{tag}</span>)}
                    </div>
                </div>
                )}

                <div>
                    <h4 className="font-bold text-text">Cards Drawn</h4>
                    <div className="flex flex-wrap gap-4 mt-2">
                        {entry.drawnCards.map(dc => (
                        <div key={dc.card.id} className="text-center text-xs text-sub">
                            <img src={dc.imageUrl || dc.card.imageUrl} alt={dc.card.name} className={`w-20 h-auto rounded shadow-sm ${dc.isReversed ? 'transform rotate-180' : ''}`} />
                            <p className="mt-1">{dc.card.name}</p>
                            {dc.isReversed && <p>(Reversed)</p>}
                        </div>
                        ))}
                    </div>
                </div>
            </div>
        </article>
    );
};

export default React.memo(JournalEntryCard);