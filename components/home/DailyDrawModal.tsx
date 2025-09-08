import React, { useState, useEffect, useRef } from 'react';
import type { JournalEntry, DrawnCard, Interpretation, AlmanacInfo } from '../../types';
import { useJournalStore } from '../../store/journalStore';
import { useUiStore } from '../../store/uiStore';
import CardBack from '../CardBack';
import { useModalFocus } from '../../hooks/useModalFocus';

interface DailyDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    drawnCard: DrawnCard;
    interpretation: Interpretation;
  } | null;
  almanac: AlmanacInfo;
}

const DailyDrawModal: React.FC<DailyDrawModalProps> = ({ isOpen, onClose, data, almanac }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { addEntry } = useJournalStore();
  const { showToast } = useUiStore();
  const [impression, setImpression] = useState('');

  useModalFocus({ isOpen, onClose, modalRef });

  useEffect(() => {
    if (isOpen) {
      setImpression(''); // Reset impression when modal opens
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!data) return;

    const now = new Date();
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      dateISO: now.toISOString().slice(0, 10),
      drawnCards: [data.drawnCard],
      impression: impression.trim(),
      interpretation: data.interpretation,
      almanac,
      createdAt: now.toISOString(),
    };
    addEntry(newEntry);
    showToast('Daily draw saved to journal.');
    onClose();
  };

  if (!isOpen || !data) return null;

  const { drawnCard } = data;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog" aria-modal="true" aria-labelledby="daily-draw-title"
      onClick={onClose}
    >
      <div
        ref={modalRef} onClick={e => e.stopPropagation()}
        className="bg-surface rounded-card shadow-main p-6 card-border max-w-md w-full font-serif"
      >
        <div className="flex justify-between items-start mb-4">
            <div className="w-6"></div> {/* Spacer for alignment */}
            <h2 id="daily-draw-title" className="text-2xl font-bold text-accent text-center">
                Your Card of the Day
            </h2>
            <button 
                onClick={onClose} 
                className="text-sub hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full p-1"
                aria-label="Close"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className="text-center space-y-2 mb-6">
          <div className="max-w-[240px] mx-auto">
            {drawnCard.card.imageUrl ? (
              <img src={drawnCard.card.imageUrl} alt={`Art for ${drawnCard.card.name}`} className="rounded-xl shadow-lg w-full" />
            ) : (
              <CardBack />
            )}
          </div>
          <p className="font-semibold text-text text-xl">{drawnCard.card.name}</p>
          <p className="text-sub">{drawnCard.reversed ? '(Reversed)' : '(Upright)'}</p>
        </div>

        <div className="space-y-2 font-sans">
          <label htmlFor="daily-impression" className="font-bold text-sub block">
            Your Personal Impression
          </label>
          <textarea
            id="daily-impression"
            value={impression}
            onChange={e => setImpression(e.target.value)}
            placeholder="How does this card feel to you today?"
            rows={4}
            className="w-full bg-bg/50 border border-border rounded-ui p-3 text-text placeholder-sub/70 focus:ring-2 focus:ring-accent focus:border-accent transition"
          />
        </div>

        <div className="flex gap-4 justify-end font-sans mt-6">
          <button
            onClick={onClose}
            className="bg-border text-text font-bold py-2 px-4 rounded-ui hover:bg-border/70 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-accent text-accent-dark font-bold py-2 px-4 rounded-ui hover:opacity-90 transition-opacity"
          >
            Save to Journal
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyDrawModal;