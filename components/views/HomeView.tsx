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
import DailyDrawModal from '../home/DailyDrawModal';
import { useDeckStore } from '../../store/deckStore';
import { useSettingsStore } from '../../store/settingsStore';
import { shuffleArray, getLocalISO_Date } from '../../lib/utils';
import { useReadingStore } from '../../store/readingStore';

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
    const [isDailyDrawModalOpen, setIsDailyDrawModalOpen] = useState(false);
    const [isCustomReadingModalOpen, setIsCustomReadingModalOpen] = useState(false);
    const [isDailyDrawLoading, setIsDailyDrawLoading] = useState(false);
    
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


    const startReading = (cards: DrawnCard[], readingSpread: Spread, readingQuestion: string) => {
        if (cards.length === 0 || cards.some(c => !c.card)) {
            showToast("Not all cards were selected for the reading.");
            return;
        }
        storeStartReading({ cards, spread: readingSpread, question: readingQuestion });
    };
    
    const handleStartDailyDraw = async () => {
        setIsDailyDrawLoading(true);
        try {
            if (!deck || deck.length === 0) {
                showToast("Card deck is not available. Please check your connection or try again later.");
                return;
            }

            const dailySpread = SPREADS.find(s => s.id === 'single-card')!;
            const shuffled = shuffleArray<TarotCard>(deck);
            const drawnCard = shuffled[0];

            if (!drawnCard) {
                showToast("Could not draw a card from the deck.");
                return;
            }
            
            const cards: DrawnCard[] = [{
                card: drawnCard,
                isReversed: settings.includeReversals && Math.random() > 0.5,
            }];
            setIsDailyDrawModalOpen(false);
            startReading(cards, dailySpread, "Card of the Day");
        } catch (e) {
            showToast("An error occurred while preparing the draw.");
        } finally {
            setIsDailyDrawLoading(false);
        }
    };

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

    const handleViewJournalEntry = (entryId: string) => {
        setJournalFilter({ type: 'id', value: entryId });
    };

    const getLoadingMessage = () => {
        if (phase === 'generatingImages') {
            return [ "Sketching the unseen...", "Weaving threads of light...", "Giving form to whispers..." ];
        }
        return [ "Gathering cosmic echoes...", "Listening to the cards' story...", "Interpreting the symbols..." ];
    };

    const renderDashboard = () => (
        <div className="space-y-8 animate-fade-in text-center font-serif">
            <div className="bg-surface/70 rounded-card p-6 card-border">
                <h2 className="text-2xl font-bold text-accent mb-2">Welcome, Seeker</h2>
                <p className="text-sub max-w-md mx-auto">Center your thoughts, take a breath, and let the cards offer their wisdom.</p>
            </div>
            
            <div className="bg-surface/70 rounded-card p-6 card-border shadow-main min-h-[230px] flex flex-col justify-center">
                {dailyDrawForToday ? (
                    <div className="animate-fade-in">
                        <h3 className="text-xl font-bold text-text mb-4">Your Card of the Day</h3>
                        <div className="flex flex-col md:flex-row items-center gap-6 text-left">
                            <img 
                                src={dailyDrawForToday.drawnCards[0].imageUrl || dailyDrawForToday.drawnCards[0].card.imageUrl} 
                                alt={dailyDrawForToday.drawnCards[0].card.name} 
                                className={`w-32 h-auto rounded-lg shadow-lg flex-shrink-0 ${dailyDrawForToday.drawnCards[0].isReversed ? 'transform rotate-180' : ''}`} 
                            />
                            <div>
                                <p className="text-lg font-bold text-accent">{dailyDrawForToday.drawnCards[0].card.name}</p>
                                <p className="text-sub italic text-sm mb-2">{dailyDrawForToday.interpretation.cards[0].meaning}</p>
                                <a 
                                    href="#journal" 
                                    onClick={() => handleViewJournalEntry(dailyDrawForToday.id)}
                                    className="font-sans text-accent underline text-sm hover:text-accent/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
                                    View full reading in Journal
                                </a>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <h3 className="text-xl font-bold text-text mb-4">Daily Ritual</h3>
                        <p className="text-sub mb-6">Begin with a single card for focus and guidance throughout your day.</p>
                        <button 
                            onClick={() => setIsDailyDrawModalOpen(true)} 
                            className="w-full max-w-xs mx-auto bg-accent text-accent-dark font-bold py-3 px-8 rounded-ui transition-all duration-300 text-lg shadow-lg hover:shadow-glow hover:scale-105 transform"
                        >
                            Draw Card of the Day
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-surface/70 rounded-card p-6 card-border">
                <h3 className="text-xl font-bold text-text mb-4">Deeper Inquiry</h3>
                <p className="text-sub mb-6">When you seek more detailed insight, choose a spread that fits your question.</p>
                <button 
                    onClick={() => setIsCustomReadingModalOpen(true)}
                    className="w-full max-w-xs mx-auto bg-border text-text font-bold py-3 px-8 rounded-ui hover:bg-border/70 transition-colors"
                >
                    Start a New Reading
                </button>
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
                    <div className="bg-surface rounded-card shadow-main p-6 card-border animate-fade-in text-center font-serif">
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
                   <div className="bg-surface rounded-card shadow-main p-6 card-border animate-fade-in text-center font-serif">
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

            <DailyDrawModal
                isOpen={isDailyDrawModalOpen}
                onClose={() => setIsDailyDrawModalOpen(false)}
                onDraw={handleStartDailyDraw}
                isLoading={isDailyDrawLoading}
            />
            
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