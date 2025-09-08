import React, { useRef } from 'react';
import type { JournalEntry } from '../../types';
import { useModalFocus } from '../../hooks/useModalFocus';
import { useUiStore } from '../../store/uiStore';

interface CalendarDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntry[];
}

const CalendarDayModal: React.FC<CalendarDayModalProps> = ({ isOpen, onClose, entries }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useModalFocus({ isOpen, onClose, modalRef });

  const { setJournalFilter } = useUiStore();

  const handleViewInJournal = () => {
    if (entries.length > 0) {
      setJournalFilter({ dateISO: entries[0].dateISO });
      window.location.hash = 'journal';
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  const dateString = entries.length > 0 ? new Date(entries[0].dateISO + 'T00:00:00').toDateString() : '';

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-modal-title"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={e => e.stopPropagation()}
        className="bg-surface rounded-card shadow-main p-6 card-border max-w-lg w-full font-serif flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        <div className="flex justify-between items-start mb-4 flex-shrink-0">
          <h2 id="day-modal-title" className="text-2xl font-bold text-accent">
            Readings for {dateString}
          </h2>
          <button onClick={onClose} className="text-sub hover:text-text p-1 -mt-2 -mr-2" aria-label="Close">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-2 flex-grow no-scrollbar">
          {entries.map(entry => (
            <div key={entry.id} className="border-l-2 border-accent/30 pl-4">
              <h3 className="font-bold text-text">{entry.spread.name}</h3>
              {entry.question && <p className="text-sub text-sm italic">"{entry.question}"</p>}
              <p className="text-sub text-sm mt-1">
                Card{entry.drawnCards.length > 1 ? 's' : ''}: {entry.drawnCards.map(dc => dc.card.name).join(', ')}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-end pt-6 mt-4 border-t border-border font-sans flex-shrink-0">
          <button onClick={handleViewInJournal} className="bg-accent text-accent-dark font-bold py-2 px-4 rounded-ui">
            View in Journal
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarDayModal;
