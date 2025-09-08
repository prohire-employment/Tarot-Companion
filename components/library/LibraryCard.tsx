import React, { useCallback } from 'react';
import { useCardImageStore } from '../../store/cardImageStore';
import type { TarotCard } from '../../types';

interface LibraryCardProps {
    card: TarotCard;
    onClick: (card: TarotCard) => void;
}

const LibraryCard: React.FC<LibraryCardProps> = ({ card, onClick }) => {
    // By selecting only the specific image URL, this component will only re-render
    // when its own image is added to the cache, not when any other image is.
    const cachedImageUrl = useCardImageStore(state => state.imageCache[card.id]);
    const hasCustomArt = !!cachedImageUrl;

    const handleClick = useCallback(() => {
        onClick(card);
    }, [onClick, card]);

    return (
        <button 
            onClick={handleClick}
            className="text-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
        >
            <img 
                src={cachedImageUrl || card.imageUrl} 
                alt={card.name} 
                className={`w-full h-auto rounded-lg shadow-md transition-all duration-300 group-hover:shadow-glow group-hover:scale-105 ${hasCustomArt ? 'border-2 border-accent/70' : ''}`}
                loading="lazy"
            />
            <p className="text-xs text-sub mt-2 transition-colors group-hover:text-text">{card.name}</p>
        </button>
    );
};

export default React.memo(LibraryCard);