import React, { useState } from 'react';
import type { Spread } from '../../types';
import { useSettingsStore } from '../../store/settingsStore';
import SpreadInfoModal from './SpreadInfoModal';

interface ReadingSetupProps {
  selectedSpreadId: string;
  setSelectedSpreadId: (id: string) => void;
  availableSpreads: Spread[];
  selectedSpread: Spread;
  question: string;
  setQuestion: (q: string) => void;
  onShowSpreadDetails: () => void;
}

const InfoIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
  </svg>
);

const ReadingSetup: React.FC<ReadingSetupProps> = ({
  selectedSpreadId,
  setSelectedSpreadId,
  availableSpreads,
  selectedSpread,
  question,
  setQuestion,
  onShowSpreadDetails
}) => {
  const { settings, setSettings } = useSettingsStore();
  const [isSpreadInfoModalOpen, setIsSpreadInfoModalOpen] = useState(false);

  const deckTypeOptions = [
    { id: 'full', label: 'Full Deck (78)' },
    { id: 'major', label: 'Major Arcana (22)' },
    { id: 'minor', label: 'Minor Arcana (56)' },
  ];

  return (
    <>
      <fieldset className="border border-border/50 rounded-lg p-4 space-y-4">
        <legend className="px-2 font-serif text-accent font-bold text-lg">Step 1: Set Your Intention</legend>
        
        <div className="space-y-2">
          <label className="text-sub font-medium block">Choose your deck.</label>
          <div className="flex flex-col sm:flex-row gap-2 rounded-lg bg-bg/50 p-1">
            {deckTypeOptions.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, deckType: opt.id as any }))}
                className={`flex-1 p-2 rounded-md text-sm transition-colors font-bold ${
                  settings.deckType === opt.id ? 'bg-accent text-accent-dark' : 'hover:bg-border'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <label className="text-sub font-medium block">Choose your spread.</label>
            <button
              type="button"
              onClick={() => setIsSpreadInfoModalOpen(true)}
              className="ml-2 text-sub hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full"
              aria-label="View all spread details"
            >
              <InfoIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <select value={selectedSpreadId} onChange={e => setSelectedSpreadId(e.target.value)} className="w-full appearance-none bg-bg/50 border border-border rounded-ui p-3 text-text focus:ring-2 focus:ring-accent focus:border-accent">
              {availableSpreads.map(s => <option key={s.id} value={s.id}>{s.name} ({s.cardCount} {s.cardCount > 1 ? 'cards' : 'card'})</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-sub">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>
          {selectedSpread && (
              <button 
                  onClick={onShowSpreadDetails} 
                  className="text-left text-sm text-sub mt-2 px-1 hover:text-accent transition-colors underline decoration-dotted underline-offset-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
              >
                  {selectedSpread.description}
              </button>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="reading-question" className="text-sub font-medium block">
            What is your question or focus? (Optional)
          </label>
          <textarea
            id="reading-question"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="e.g., What should I focus on this week?"
            rows={2}
            className="w-full bg-bg/50 border border-border rounded-ui p-3 text-text placeholder-sub/70 focus:ring-2 focus:ring-accent focus:border-accent transition"
          />
        </div>
      </fieldset>
      
      <SpreadInfoModal
        isOpen={isSpreadInfoModalOpen}
        onClose={() => setIsSpreadInfoModalOpen(false)}
        spreads={availableSpreads}
      />
    </>
  );
};

export default ReadingSetup;