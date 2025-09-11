import React, { useRef, useMemo } from 'react';
import type { TarotCard } from '../../types';
import { useModalFocus } from '../../hooks/useModalFocus';
import { useCardImageStore } from '../../store/cardImageStore';
import { useJournalStore } from '../../store/journalStore';
import { useUiStore } from '../../store/uiStore';
import { SuitIcon } from '../icons/SuitIcons';

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: TarotCard | null;
}

const CardDetailModal: React.FC<CardDetailModalProps> = ({ isOpen, onClose, card }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useModalFocus({ isOpen, onClose, modalRef });

  const { imageCache } = useCardImageStore();
  const { entries } = useJournalStore();
  const { setJournalFilter } = useUiStore();

  const journalAppearances = useMemo(() => {
    if (!card) return [];
    return entries
      .filter(entry => entry.drawnCards.some(dc => dc.card.id === card.id))
      .map(entry => ({
          id: entry.id,
          date: new Date(entry.createdAt).toLocaleDateString(),
          spread: entry.spread.name,
      }));
  }, [card, entries]);

  const handleViewEntry = (entryId: string) => {
    setJournalFilter({ type: 'id', value: entryId });
    window.location.hash = 'journal';
    onClose();
  };

  if (!isOpen || !card) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-detail-title"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={e => e.stopPropagation()}
        className="bg-surface rounded-card shadow-main p-6 card-border max-w-4xl w-full font-serif flex flex-col md:flex-row gap-6"
        style={{ maxHeight: '90vh' }}
      >
        <div className="flex-shrink-0 md:w-1/3 text-center">
            <img 
                src={imageCache[card.id] || card.imageUrl} 
                alt={card.name} 
                className="w-full max-w-[250px] mx-auto h-auto rounded-lg shadow-lg"
            />
        </div>

        <div className="flex-grow md:w-2/3 flex flex-col min-h-0">
             <div className="flex justify-between items-start mb-4 flex-shrink-0">
                <div>
                    <h2 id="card-detail-title" className="text-2xl font-bold text-accent">{card.name}</h2>
                    <div className="flex items-center gap-2 text-sub text-sm">
                        <SuitIcon arcana={card.arcana} suit={card.suit} className="w-4 h-4" />
                        <span>{card.arcana} Arcana {card.suit !== 'None' ? ` • ${card.suit}` : ''}</span>
                    </div>
                </div>
                <button onClick={onClose} className="text-sub hover:text-text p-1 -mt-2 -mr-2" aria-label="Close">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            
            <div className="space-y-4 overflow-y-auto pr-2 flex-grow no-scrollbar">
                <div>
                    <h3 className="font-bold text-accent/80">Upright Keywords</h3>
                    <p className="text-sub text-sm italic">{card.uprightKeywords.join(', ')}</p>
                </div>
                 <div>
                    <h3 className="font-bold text-accent/80">Reversed Keywords</h3>
                    <p className="text-sub text-sm italic">{card.reversedKeywords.join(', ')}</p>
                </div>
                <div>
                    <h3 className="font-bold text-accent/80">Journal Appearances</h3>
                    {journalAppearances.length > 0 ? (
                        <ul className="list-disc list-inside text-sub text-sm space-y-1 mt-1">
                            {journalAppearances.map(entry => (
                                <li key={entry.id}>
                                    <button onClick={() => handleViewEntry(entry.id)} className="underline hover:text-text text-left">
                                        {entry.date}: {entry.spread}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sub text-sm italic">This card has not appeared in your journal yet.</p>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default CardDetailModal;