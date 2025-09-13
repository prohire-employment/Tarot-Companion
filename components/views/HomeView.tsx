
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useJournalStore } from '../../store/journalStore';
import { useUiStore } from '../../store/uiStore';
import { SPREADS } from '../../data/spreads';
import { getInterpretation, generateCardImage } from '../../services/geminiService';
import type { Spread, DrawnCard, JournalEntry, TarotCard } from '../../types';
import ReadingResult from '../home/ReadingResult';
import Spinner from '../Spinner';
import { useAlmanac } from '../../hooks/useAlmanac';
import { useCardImageStore } from '../../store/cardImageStore';
import CustomReadingFlow from '../home/CustomReadingFlow';
import { useDeckStore } from '../../store/deckStore';
import { useSettingsStore } from '../../store/settingsStore';
import { shuffleArray, getLocalISO_Date } from '../../lib/utils';
import { useReadingStore } from '../../store/readingStore';
import JourneyVisualizer from '../home/JourneyVisualizer';
import InteractiveDailyCard from '../home/InteractiveDailyCard';
import DeckCta from '../home/DeckCta';

const HomeView: React.FC = () => {
    // Stores & Hooks
    const { entries, addEntry } = useJournalStore();
    const { imageCache, addImageToCache } = useCardImageStore();
    const { showToast, setJournalFilter } = useUiStore();
    const { settings } = useSettingsStore();
    const { deck } = useDeckStore();
    const almanacInfo = useAlmanac();

    const {
        phase, drawnCards, interpretation, spread, question, error,
        startReading: storeStartReading,
        setImageGenerationSuccess,
        setImageGenerationFailure,
        setInterpretationSuccess,
        setInterpretationFailure,
        retryImageGeneration,
        retryInterpretation,
        continueWithoutArt,
        resetReading
    } = useReadingStore();

    // Local UI State
    const [isCustomReadingModalOpen, setIsCustomReadingModalOpen] = useState(false);
    const [isDailyDrawLoading, setIsDailyDrawLoading] = useState(false);
    const [isDailyCardFlipped, setIsDailyCardFlipped] = useState(false);
    
    // Memos
    const todayISOForDashboard = getLocalISO_Date();
    const dailyDrawForToday = useMemo(
        () => entries.find(e => e.dateISO === todayISOForDashboard && e.spread.id === 'single-card'),
        [entries, todayISOForDashboard]
    );

    // Async Effects for State Machine
    useEffect(() => {
        const processImageGeneration = async (cards: DrawnCard[]) => {
            try {
                const cardsWithImages: DrawnCard[] = [];
                for (const drawnCard of cards) {
                    let imageUrl = imageCache[drawnCard.card.id];
                    if (!imageUrl) {
                        imageUrl = await generateCardImage(drawnCard.card);
                        addImageToCache(drawnCard.card.id, imageUrl);
                    }
                    cardsWithImages.push({ ...drawnCard, imageUrl });
                }
                setImageGenerationSuccess({ cardsWithImages });
            } catch (err) {
                const message = err instanceof Error ? err.message : 'An unknown error occurred while creating card art.';
                setImageGenerationFailure({ error: message });
            }
        };

        const processInterpretation = async (cards: DrawnCard[], currentSpread: Spread, currentQuestion: string) => {
            try {
                const result = await getInterpretation(cards, currentSpread, currentQuestion, almanacInfo);
                setInterpretationSuccess({ interpretation: result });
            } catch (err) {
                const message = err instanceof Error ? err.message : 'An unknown error occurred.';
                setInterpretationFailure({ error: message });
            }
        };

        if (phase === 'generatingImages') {
            processImageGeneration(drawnCards);
        } else if (phase === 'loading' && spread) {
            processInterpretation(drawnCards, spread, question);
        }
    }, [phase, drawnCards, spread, question, imageCache, addImageToCache, almanacInfo, setImageGenerationSuccess, setImageGenerationFailure, setInterpretationSuccess, setInterpretationFailure]);


    const startReading = useCallback((cards: DrawnCard[], readingSpread: Spread, readingQuestion: string) => {
        if (cards.length === 0 || cards.some(c => !c.card)) {
            showToast("Not all cards were selected for the reading.");
            return;
        }
        storeStartReading({ cards, spread: readingSpread, question: readingQuestion });
    }, [showToast, storeStartReading]);
    
    const handleStartDailyDraw = useCallback(async () => {
        setIsDailyDrawLoading(true);
        setIsDailyCardFlipped(true);

        await new Promise(resolve => setTimeout(resolve, 400));

        try {
            if (!deck || deck.length === 0) {
                showToast("Card deck is not available. Please try again later.");
                setIsDailyDrawLoading(false);
                setIsDailyCardFlipped(false);
                return;
            }

            const dailySpread = SPREADS.find(s => s.id === 'single-card')!;
            const shuffled = shuffleArray<TarotCard>(deck);
            const drawnCard = shuffled[0];

            if (!drawnCard) {
                showToast("Could not draw a card from the deck.");
                setIsDailyDrawLoading(false);
                setIsDailyCardFlipped(false);
                return;
            }
            
            const cards: DrawnCard[] = [{
                card: drawnCard,
                isReversed: settings.includeReversals && Math.random() > 0.5,
            }];
            startReading(cards, dailySpread, "Card of the Day");
        } catch (e) {
            showToast("An error occurred while preparing the draw.");
            setIsDailyDrawLoading(false);
            setIsDailyCardFlipped(false);
        }
    }, [deck, settings.includeReversals, showToast, startReading]);

    const handleSaveToJournal = useCallback((impression: string, tags: string[]) => {
        if (!interpretation || !spread) return;
        
        const todayISO = getLocalISO_Date(); // Get current date at time of save

        const newEntry: JournalEntry = {
            id: `entry-${crypto.randomUUID()}`,
            createdAt: new Date().toISOString(),
            dateISO: todayISO,
            spread: spread,
            drawnCards: drawnCards,
            interpretation: interpretation,
            question: question.trim() || undefined,
            impression,
            tags: tags.length > 0 ? tags : undefined,
        };
        addEntry(newEntry);
        showToast('Reading saved to journal!');
        resetReading();
    }, [addEntry, showToast, drawnCards, interpretation, question, spread, resetReading]);

    const handleReset = useCallback(() => {
        resetReading();
    }, [resetReading]);

    const handleViewJournalEntry = useCallback((entryId: string) => {
        setJournalFilter({ type: 'id', value: entryId });
        window.location.hash = 'journal';
    }, [setJournalFilter]);

    const getLoadingMessage = () => {
        if (phase === 'generatingImages') {
            return [ "Sketching the unseen...", "Weaving threads of light...", "Giving form to whispers..." ];
        }
        return [ "Gathering cosmic echoes...", "Listening to the cards' story...", "Interpreting the symbols..." ];
    };

    const renderDashboard = () => (
        <div className="space-y-8 animate-fade-in font-serif">
            {/* Section 1: Journey Visualizer or Welcome */}
            {entries.length > 0 ? (
                <div className="bg-surface/70 backdrop-blur-lg rounded-card p-6 card-border text-center">
                    <h2 className="text-2xl font-bold text-accent mb-2">Your Journey's Reflection</h2>
                    <p className="text-sub max-w-md mx-auto mb-4">This is a living reflection of your readings. The size and brightness of each orb represent its presence in your journal.</p>
                    <JourneyVisualizer entries={entries} />
                </div>
            ) : (
                <div className="bg-surface/70 backdrop-blur-lg rounded-card p-6 card-border text-center">
                    <h2 className="text-2xl font-bold text-accent mb-2">Welcome, Seeker</h2>
                    <p className="text-sub max-w-md mx-auto">Center your thoughts, take a breath, and let the cards offer their wisdom.</p>
                </div>
            )}
            
            {/* Section 2: Daily Ritual */}
            <div className="bg-surface/70 backdrop-blur-lg rounded-card p-6 card-border shadow-main min-h-[420px] flex flex-col justify-center text-center">
                <InteractiveDailyCard 
                    dailyDraw={dailyDrawForToday}
                    onDraw={handleStartDailyDraw}
                    onViewInJournal={handleViewJournalEntry}
                    isFlipping={isDailyCardFlipped}
                    isLoading={isDailyDrawLoading}
                />
            </div>
            
            {/* Section 3: Deeper Inquiry */}
            <div className="bg-surface/70 backdrop-blur-lg rounded-card p-6 card-border shadow-main h-full">
                <DeckCta onClick={() => setIsCustomReadingModalOpen(true)} />
            </div>
        </div>
    );

    const renderContent = () => {
        switch (phase) {
            case 'loading':
            case 'generatingImages':
                return (
                    <div className="flex justify-center items-center h-64 animate-fade-in">
                        <Spinner message={getLoadingMessage()} />
                    </div>
                );
            case 'imageError':
                 return (
                    <div className="bg-surface/70 backdrop-blur-lg rounded-card shadow-main p-6 card-border animate-fade-in text-center font-serif">
                        <h3 className="text-2xl font-bold text-red-400 mb-4">Art Generation Failed</h3>
                        <p className="text-sub mb-2 max-w-md mx-auto">{error || "An unexpected error occurred."}</p>
                        <p className="text-sub mb-6">You can try again, or continue with the default card art.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center font-sans">
                            <button onClick={retryImageGeneration} className="flex-1 bg-accent text-accent-dark font-bold py-3 px-4 rounded-ui">Retry Generation</button>
                            <button onClick={continueWithoutArt} className="flex-1 bg-border text-text font-bold py-3 px-4 rounded-ui">Continue with Default Art</button>
                        </div>
                    </div>
                );
            case 'interpretationError':
                return (
                   <div className="bg-surface/70 backdrop-blur-lg rounded-card shadow-main p-6 card-border animate-fade-in text-center font-serif">
                       <h3 className="text-2xl font-bold text-red-400 mb-4">Interpretation Failed</h3>
                       <p className="text-sub mb-6 max-w-md mx-auto">{error || "An unexpected error occurred while interpreting the cards."}</p>
                       <div className="flex flex-col sm:flex-row gap-4 justify-center font-sans">
                           <button onClick={retryInterpretation} className="flex-1 bg-accent text-accent-dark font-bold py-3 px-4 rounded-ui">Retry Interpretation</button>
                           <button onClick={resetReading} className="flex-1 bg-border text-text font-bold py-3 px-4 rounded-ui">Start Over</button>
                       </div>
                   </div>
               );
            case 'result':
                return interpretation && drawnCards.length > 0 && spread && (
                    <ReadingResult
                        drawnCards={drawnCards}
                        interpretation={interpretation}
                        spread={spread}
                        question={question}
                        onSave={handleSaveToJournal}
                        onReset={handleReset}
                    />
                );
            case 'dashboard':
            default:
                return renderDashboard();
        }
    };

    return (
        <div className="space-y-8 font-sans">
            {renderContent()}
            
            <CustomReadingFlow
                isOpen={isCustomReadingModalOpen}
                onClose={() => setIsCustomReadingModalOpen(false)}
                onStartReading={(cards, readingSpread, readingQuestion) => {
                    setIsCustomReadingModalOpen(false);
                    startReading(cards, readingSpread, readingQuestion);
                }}
            />
        </div>
    );
};

export default HomeView;
