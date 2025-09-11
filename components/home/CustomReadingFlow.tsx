import React, { useState, useMemo, useEffect, useRef, useCallback, memo } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { useSpreadStore } from '../../store/spreadStore';
import { useReadingStore } from '../../store/readingStore';
import { SPREADS } from '../../data/spreads';
import type { Spread, DrawnCard, TarotCard, DeckType } from '../../types';
import SpreadDetailModal from './SpreadDetailModal';
import SpreadInfoModal from './SpreadInfoModal';
import { useModalFocus } from '../../hooks/useModalFocus';
import DigitalDrawPanel from '../custom-reading/DigitalDrawPanel';
import ManualInputPanel from '../custom-reading/ManualInputPanel';
import PhysicalDeckPanel from '../custom-reading/PhysicalDeckPanel';
import { useDeckStore } from '../../store/deckStore';
import Spinner from '../Spinner';
import { useUiStore } from '../../store/uiStore';

// --- Sub-components for better organization ---

const InfoIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
  </svg>
);

interface ReadingConfigurationProps {
    setSettings: (updater: (prev: any) => any) => void;
    deckType: DeckType;
    selectedSpreadId: string;
    setSelectedSpreadId: (id: string) => void;
    availableSpreads: Spread[];
    configQuestion: string;
    setConfigQuestion: (q: string) => void;
    openInfoModal: () => void;
    openDetailModal: () => void;
}

const ReadingConfiguration: React.FC<ReadingConfigurationProps> = memo(({ setSettings, deckType, selectedSpreadId, setSelectedSpreadId, availableSpreads, configQuestion, setConfigQuestion, openInfoModal, openDetailModal }) => {
    const deckTypeOptions = [
        { id: 'full', label: 'Full Deck (78)' },
        { id: 'major', label: 'Major Arcana (22)' },
        { id: 'minor', label: 'Minor Arcana (56)' },
    ];
    const selectedSpread = availableSpreads.find(s => s.id === selectedSpreadId)!;
    
    return (
         <fieldset className="border border-border/50 rounded-lg p-4 space-y-4 font-sans">
            <legend className="px-2 font-serif text-accent font-bold text-lg">Step 1: Set Your Intention</legend>
            <div className="space-y-2">
                <label id="deck-type-label" className="text-sub font-medium block">Choose your deck.</label>
                <div role="radiogroup" aria-labelledby="deck-type-label" className="flex flex-col sm:flex-row gap-2 rounded-lg bg-bg/50 p-1">
                    {deckTypeOptions.map(opt => (
                    <button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={deckType === opt.id}
                        onClick={() => setSettings(prev => ({ ...prev, deckType: opt.id as any }))}
                        className={`flex-1 p-2 rounded-md text-sm transition-colors font-bold ${
                        deckType === opt.id ? 'bg-accent text-accent-dark' : 'hover:bg-border'
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
                    <button type="button" onClick={openInfoModal} className="ml-2 text-sub hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full" aria-label="View details for all available spreads">
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
                    <button onClick={openDetailModal} className="text-left text-sm text-sub mt-2 px-1 hover:text-accent transition-colors underline decoration-dotted underline-offset-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md">
                        {selectedSpread.description}
                    </button>
                )}
            </div>
            <div className="space-y-2">
                <label htmlFor="reading-question" className="text-sub font-medium block">
                    What is your question or focus? (Optional)
                </label>
                <textarea id="reading-question" value={configQuestion} onChange={e => setConfigQuestion(e.target.value)} placeholder="e.g., What should I focus on this week?" rows={2} className="w-full bg-bg/50 border border-border rounded-ui p-3 text-text placeholder-sub/70 focus:ring-2 focus:ring-accent focus:border-accent transition" />
            </div>
        </fieldset>
    );
});


interface CardInputSelectionProps {
    inputMethod: string;
    setInputMethod: (method: any) => void;
    spread: Spread;
    deck: TarotCard[];
    onStart: (cards: DrawnCard[]) => void;
}

const CardInputSelection: React.FC<CardInputSelectionProps> = memo(({ inputMethod, setInputMethod, spread, deck, onStart }) => {
    const inputOptions = [
        { id: 'digital', label: 'Digital Draw' },
        { id: 'manual', label: 'Manual Input' },
        { id: 'photo', label: 'From Photo' },
        { id: 'voice', label: 'From Voice' },
    ];
    
    return (
        <fieldset className="border border-border/50 rounded-lg p-4 space-y-4 font-sans">
            <legend className="px-2 font-serif text-accent font-bold text-lg">Step 2: Draw Your Cards</legend>
            <div>
                <label id="input-method-label" className="text-sub font-medium mb-3 block">How would you like to provide your card(s)?</label>
                <div role="radiogroup" aria-labelledby="input-method-label" className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                    {inputOptions.map(opt => {
                        const isDisabled = spread.cardCount > 1 && (opt.id === 'photo' || opt.id === 'voice');
                        return (
                            <button
                              key={opt.id}
                              role="radio"
                              aria-checked={inputMethod === opt.id}
                              onClick={() => setInputMethod(opt.id as any)}
                              disabled={isDisabled}
                              className={`p-3 rounded-ui text-sm font-semibold transition-all duration-200 ease-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${inputMethod === opt.id ? 'bg-accent text-accent-dark shadow-md' : 'bg-border/50 hover:bg-border'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {opt.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {inputMethod === 'digital' && <DigitalDrawPanel spread={spread} deck={deck} onDraw={onStart} />}
            {inputMethod === 'manual' && <ManualInputPanel spread={spread} deck={deck} onGetReading={onStart} />}
            {(inputMethod === 'photo' || inputMethod === 'voice') && <PhysicalDeckPanel method={inputMethod} deck={deck} onGetReading={onStart} />}
        </fieldset>
    );
});


// --- Main Component ---

interface CustomReadingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onStartReading: (cards: DrawnCard[], spread: Spread, question: string) => void;
}

const CustomReadingFlow: React.FC<CustomReadingFlowProps> = ({ isOpen, onClose, onStartReading }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    useModalFocus({ isOpen, onClose, modalRef });
    const { showToast } = useUiStore();

    const { settings, setSettings } = useSettingsStore();
    const { customSpreads } = useSpreadStore();
    const { 
        configQuestion, setConfigQuestion,
        selectedSpreadId, setSelectedSpreadId,
        inputMethod, setInputMethod,
        resetConfig
    } = useReadingStore();

    const { deck, isLoading: isDeckLoading, error: deckError } = useDeckStore();
    
    const [isSpreadDetailModalOpen, setIsSpreadDetailModalOpen] = useState(false);
    const [isSpreadInfoModalOpen, setIsSpreadInfoModalOpen] = useState(false);
    
    const availableSpreads = useMemo(() => [...SPREADS, ...customSpreads], [customSpreads]);
    const selectedSpread = useMemo(() => availableSpreads.find(s => s.id === selectedSpreadId)!, [availableSpreads, selectedSpreadId]);

    const availableDeck = useMemo(() => {
        if (!deck) return [];
        switch (settings.deckType) {
            case 'major': return deck.filter(c => c.arcana === 'Major');
            case 'minor': return deck.filter(c => c.arcana === 'Minor');
            case 'full': default: return deck;
        }
    }, [settings.deckType, deck]);

    useEffect(() => {
        if (!isOpen) {
            setTimeout(resetConfig, 300);
        }
    }, [isOpen, resetConfig]);
    
    useEffect(() => {
        const isSelectedSpreadAvailable = availableSpreads.some(s => s.id === selectedSpreadId);
        if (!isSelectedSpreadAvailable) {
            setSelectedSpreadId(SPREADS[0].id);
        }
    }, [availableSpreads, selectedSpreadId, setSelectedSpreadId]);

    useEffect(() => {
        if (selectedSpread.cardCount > 1 && (inputMethod === 'photo' || inputMethod === 'voice')) {
            setInputMethod('digital');
            showToast("Photo/Voice input is for single-card spreads only. Switched to Digital Draw.");
        }
    }, [selectedSpread, inputMethod, setInputMethod, showToast]);

    const startReading = useCallback((cards: DrawnCard[]) => {
      onStartReading(cards, selectedSpread, configQuestion);
    }, [onStartReading, selectedSpread, configQuestion]);

    if (!isOpen) return null;

    return (
        <div 
          className="fixed inset-0 bg-black/80 z-40 flex items-center justify-center p-4 animate-fade-in"
          role="dialog" aria-modal="true" aria-labelledby="custom-reading-title"
          onClick={onClose}
        >
            <div
                ref={modalRef}
                onClick={e => e.stopPropagation()}
                className="bg-surface rounded-card shadow-main p-6 card-border max-w-2xl w-full flex flex-col font-serif"
                style={{ maxHeight: '90vh' }}
            >
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 id="custom-reading-title" className="text-2xl font-bold text-accent">New Reading</h2>
                    <button onClick={onClose} className="text-sub hover:text-text p-1 -mt-2 -mr-2" aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="space-y-4 overflow-y-auto pr-2 flex-grow no-scrollbar">
                    {isDeckLoading && deck.length === 0 ? (
                        <div className="flex justify-center items-center h-64">
                          <Spinner message="Loading deck..." />
                        </div>
                    ) : deckError ? (
                        <div className="text-center p-8 bg-red-900/20 rounded-lg">
                            <p className="font-bold text-red-400">Error Loading Deck</p>
                            <p className="text-sub mt-2">{deckError}</p>
                        </div>
                    ) : (
                    <>
                        <ReadingConfiguration
                            setSettings={setSettings}
                            deckType={settings.deckType}
                            selectedSpreadId={selectedSpreadId}
                            setSelectedSpreadId={setSelectedSpreadId}
                            availableSpreads={availableSpreads}
                            configQuestion={configQuestion}
                            setConfigQuestion={setConfigQuestion}
                            openInfoModal={() => setIsSpreadInfoModalOpen(true)}
                            openDetailModal={() => setIsSpreadDetailModalOpen(true)}
                        />
                        <CardInputSelection
                            inputMethod={inputMethod}
                            setInputMethod={setInputMethod}
                            spread={selectedSpread}
                            deck={availableDeck}
                            onStart={startReading}
                        />
                    </>
                    )}
                </div>
            </div>
            
            <SpreadDetailModal isOpen={isSpreadDetailModalOpen} onClose={() => setIsSpreadDetailModalOpen(false)} spread={selectedSpread} />
            <SpreadInfoModal isOpen={isSpreadInfoModalOpen} onClose={() => setIsSpreadInfoModalOpen(false)} spreads={availableSpreads} />
        </div>
    );
};

export default CustomReadingFlow;