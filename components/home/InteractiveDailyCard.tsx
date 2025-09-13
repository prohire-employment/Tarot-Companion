import React from 'react';
import CardBack from '../CardBack';
import Spinner from '../Spinner';
import type { JournalEntry } from '../../types';

interface InteractiveDailyCardProps {
    dailyDraw: JournalEntry | undefined;
    onDraw: () => void;
    onViewInJournal: (entryId: string) => void;
    isFlipping: boolean;
    isLoading: boolean;
}

const InteractiveDailyCard: React.FC<InteractiveDailyCardProps> = ({ dailyDraw, onDraw, onViewInJournal, isFlipping, isLoading }) => {
    
    if (dailyDraw) {
        return (
            <div className="animate-fade-in font-serif">
                <h3 className="text-xl font-bold text-text mb-4">Your Card of the Day</h3>
                <div className="flex flex-col md:flex-row items-center gap-6 text-left max-w-lg mx-auto">
                    <img 
                        src={dailyDraw.drawnCards[0].imageUrl || dailyDraw.drawnCards[0].card.imageUrl} 
                        alt={dailyDraw.drawnCards[0].card.name} 
                        className={`w-32 h-auto rounded-lg shadow-lg flex-shrink-0 ${dailyDraw.drawnCards[0].isReversed ? 'transform rotate-180' : ''}`} 
                    />
                    <div>
                        <p className="text-lg font-bold text-accent">{dailyDraw.drawnCards[0].card.name}</p>
                        <p className="text-sub italic text-sm mb-2">{dailyDraw.interpretation.cards[0].outer}</p>
                        <a 
                            href="#journal" 
                            onClick={(e) => {
                                e.preventDefault();
                                onViewInJournal(dailyDraw.id);
                            }}
                            className="font-sans text-accent underline text-sm hover:text-accent/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
                            View full reading in Journal
                        </a>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col items-center text-center font-serif">
            <h3 className="text-xl font-bold text-text mb-2">Daily Ritual</h3>
            <p className="text-sub mb-6 max-w-xs mx-auto">Begin with a single card for focus and guidance throughout your day.</p>
            <div className="w-48 h-64 perspective-1000">
                <button
                    onClick={onDraw}
                    disabled={isLoading}
                    className={`relative w-full h-full flip-card ${isFlipping ? 'flipped' : ''}`}
                    aria-label="Draw card of the day"
                >
                    <div className="flip-card-back">
                        <CardBack isShimmering={!isLoading} />
                    </div>
                    <div className="flip-card-front bg-surface rounded-card card-border flex items-center justify-center">
                        {isLoading && <Spinner message="Revealing..." />}
                    </div>
                </button>
            </div>
        </div>
    );
};

export default InteractiveDailyCard;