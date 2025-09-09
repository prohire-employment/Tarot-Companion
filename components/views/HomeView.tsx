
import React, { useState, useMemo, useReducer, useEffect, useCallback } from 'react';
import { useJournalStore } from '../../store/journalStore';
import { useUiStore } from '../../store/uiStore';
import { SPREADS } from '../../data/spreads';
import { getInterpretation, generateCardImage } from '../../services/geminiService';
import type { Spread, DrawnCard, JournalEntry, ReadingState, ReadingAction, TarotCard } from '../../types';
import ReadingResult from '../home/ReadingResult';
import Spinner from '../Spinner';
import { useAlmanac } from '../../hooks/useAlmanac';
import { useCardImageStore } from '../../store/cardImageStore';
import CustomReadingFlow from '../home/CustomReadingFlow';
import DailyDrawModal from '../home/DailyDrawModal';
import { useDeckStore } from '../../store/deckStore';
import { useSettingsStore } from '../../store/settingsStore';
import { shuffleArray, getLocalISO_Date } from '../../lib/utils';

const initialState: ReadingState = {
    phase: 'dashboard',
    drawnCards: [],
    interpretation: null,
    spread: null,
    question: '',
    error: null,
};

function readingReducer(state: ReadingState, action: ReadingAction): ReadingState {
    switch (action.type) {
        case 'START_READING':
            return {
                ...initialState,
                phase: 'generatingImages',
                drawnCards: action.payload.cards,
                spread: action.payload.spread,
                question: action.payload.question,
            };
        case 'IMAGE_GENERATION_SUCCESS':
            return {
                ...state,
                phase: 'loading',
                drawnCards: action.payload.cardsWithImages,
                error: null,
            };
        case 'IMAGE_GENERATION_FAILURE':
            return { ...state, phase: 'imageError', error: action.payload.error };
        case 'INTERPRETATION_SUCCESS':
            return { ...state, phase: 'result', interpretation: action.payload.interpretation, error: null };
        case 'INTERPRETATION_FAILURE':
            return { ...state, phase: 'interpretationError', error: action.payload.error };
        case 'RETRY_IMAGE_GENERATION':
             return { ...state, phase: 'generatingImages', error: null };
        case 'CONTINUE_WITHOUT_ART':
            return { ...state, phase: 'loading', error: null };
        case 'RESET':
            return initialState;
        default:
            return state;
    }
}

const HomeView: React.FC = () => {
    // Stores & Hooks
    const { entries, addEntry } = useJournalStore();
    const { imageCache, addImageToCache } = useCardImageStore();
    const { showToast } = useUiStore();
    const { settings } = useSettingsStore();
    const almanacInfo = useAlmanac();
    const [state, dispatch] = useReducer(readingReducer, initialState);

    // Local UI State
    const [isDailyDrawModalOpen, setIsDailyDrawModalOpen] = useState(false);
    const [isCustomReadingModalOpen, setIsCustomReadingModalOpen] = useState(false);
    const [isDailyDrawLoading, setIsDailyDrawLoading] = useState(false);
    
    // Memos
    const todayISO = getLocalISO_Date();
    const entryForToday = useMemo(() => entries.find(e => e.dateISO === todayISO), [entries, todayISO]);

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
                dispatch({ type: 'IMAGE_GENERATION_SUCCESS', payload: { cardsWithImages } });
            } catch (err) {
                const message = err instanceof Error ? err.message : 'An unknown error occurred while creating card art.';
                dispatch({ type: 'IMAGE_GENERATION_FAILURE', payload: { error: message } });
            }
        };

        const processInterpretation = async (cards: DrawnCard[], spread: Spread, question: string) => {
            try {
                const result = await getInterpretation(cards, spread, question, almanacInfo);
                dispatch({ type: 'INTERPRETATION_SUCCESS', payload: { interpretation: result } });
            } catch (err) {
                const message = err instanceof Error ? err.message : 'An unknown error occurred.';
                dispatch({ type: 'INTERPRETATION_FAILURE', payload: { error: message } });
            }
        };

        if (state.phase === 'generatingImages') {
            processImageGeneration(state.drawnCards);
        } else if (state.phase === 'loading' && state.spread) {
            processInterpretation(state.drawnCards, state.spread, state.question);
        } else if (state.phase === 'interpretationError' && state.error) {
            showToast(`Error: ${state.error}`);
            dispatch({ type: 'RESET' });
        }
    }, [state.phase, state.drawnCards, state.spread, state.question, state.error, imageCache, addImageToCache, almanacInfo, showToast]);


    const startReading = (cards: DrawnCard[], spread: Spread, question: string) => {
        if (cards.length === 0 || cards.some(c => !c.card)) {
            showToast("Not all cards were selected for the reading.");
            return;
        }
        dispatch({ type: 'START_READING', payload: { cards, spread, question } });
    };
    
    const handleStartDailyDraw = async () => {
        setIsDailyDrawLoading(true);
        try {
            await useDeckStore.getState().loadDeck();
            const currentDeck = useDeckStore.getState().deck;

            if (!currentDeck || currentDeck.length === 0) {
                showToast("Card deck could not be loaded. Please try again.");
                return;
            }

            const dailySpread = SPREADS.find(s => s.id === 'single-card')!;
            const shuffled = shuffleArray<TarotCard>(currentDeck);
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
        if (!state.interpretation || !state.spread) return;

        const newEntry: JournalEntry = {
            id: `entry-${crypto.randomUUID()}`,
            createdAt: new Date().toISOString(),
            dateISO: todayISO,
            spread: state.spread,
            drawnCards: state.drawnCards,
            interpretation: state.interpretation,
            question: state.question.trim() || undefined,
            impression,
            tags: tags.length > 0 ? tags : undefined,
        };
        addEntry(newEntry);
        showToast('Reading saved to journal!');
        dispatch({ type: 'RESET' });
    }, [addEntry, showToast, state.drawnCards, state.interpretation, state.question, state.spread, todayISO]);

    const handleReset = useCallback(() => {
        dispatch({ type: 'RESET' });
    }, []);

    const getLoadingMessage = () => {
        if (state.phase === 'generatingImages') {
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
                {entryForToday ? (
                    <div className="animate-fade-in">
                        <h3 className="text-xl font-bold text-text mb-4">Your Card of the Day</h3>
                        <div className="flex flex-col md:flex-row items-center gap-6 text-left">
                            <img 
                                src={entryForToday.drawnCards[0].imageUrl || entryForToday.drawnCards[0].card.imageUrl} 
                                alt={entryForToday.drawnCards[0].card.name} 
                                className={`w-32 h-auto rounded-lg shadow-lg flex-shrink-0 ${entryForToday.drawnCards[0].isReversed ? 'transform rotate-180' : ''}`} 
                            />
                            <div>
                                <p className="text-lg font-bold text-accent">{entryForToday.drawnCards[0].card.name}</p>
                                <p className="text-sub italic text-sm mb-2">{entryForToday.interpretation.cards[0].meaning}</p>
                                <a href="#journal" className="font-sans text-accent underline text-sm hover:text-accent/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">View full reading in Journal</a>
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
        switch (state.phase) {
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
                        <p className="text-sub mb-2 max-w-md mx-auto">{state.error || "An unexpected error occurred."}</p>
                        <p className="text-sub mb-6">You can try again, or continue with the default card art.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center font-sans">
                            <button onClick={() => dispatch({ type: 'RETRY_IMAGE_GENERATION' })} className="flex-1 bg-accent text-accent-dark font-bold py-3 px-4 rounded-ui">Retry Generation</button>
                            <button onClick={() => dispatch({ type: 'CONTINUE_WITHOUT_ART'})} className="flex-1 bg-border text-text font-bold py-3 px-4 rounded-ui">Continue with Default Art</button>
                        </div>
                    </div>
                );
            case 'result':
                return state.interpretation && state.drawnCards.length > 0 && state.spread && (
                    <ReadingResult
                        drawnCards={state.drawnCards}
                        interpretation={state.interpretation}
                        spread={state.spread}
                        question={state.question}
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
                onStartReading={(cards, spread, question) => {
                    setIsCustomReadingModalOpen(false);
                    startReading(cards, spread, question);
                }}
            />
        </div>
    );
};

export default HomeView;