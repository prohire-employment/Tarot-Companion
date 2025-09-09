import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useDeckStore } from '../../store/deckStore';
import CardDetailModal from '../library/CardDetailModal';
import type { TarotCard } from '../../types';
import LibraryCard from '../library/LibraryCard';
import { useDebounce } from '../../hooks/useDebounce';
import CardSkeleton from '../library/CardSkeleton';

const LibraryView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);

    const { deck, isLoading, error, loadDeck } = useDeckStore();

    useEffect(() => {
        loadDeck();
    }, [loadDeck]);

    const filteredDeck = useMemo(() => {
        if (!deck) return [];
        const term = debouncedSearchTerm.toLowerCase().trim();
        if (!term) return deck;
        return deck.filter(card => 
            card.name.toLowerCase().includes(term) ||
            card.uprightKeywords.some(kw => kw.toLowerCase().includes(term)) ||
            card.reversedKeywords.some(kw => kw.toLowerCase().includes(term))
        );
    }, [debouncedSearchTerm, deck]);

    const handleCardClick = useCallback((card: TarotCard) => {
        setSelectedCard(card);
    }, []);
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 18 }).map((_, index) => (
                        <CardSkeleton key={index} />
                    ))}
                </div>
            );
        }
        
        if (error) {
            return (
                 <div className="text-center py-16 bg-surface rounded-card shadow-main card-border">
                    <p className="text-red-400 font-bold">Failed to Load Library</p>
                    <p className="text-sub/80 mt-2">{error}</p>
                </div>
            );
        }

        if (filteredDeck.length > 0) {
            return (
                 <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {filteredDeck.map(card => (
                        <LibraryCard
                           key={card.id}
                           card={card}
                           onClick={handleCardClick}
                        />
                    ))}
                </div>
            );
        }
        
        return (
            <div className="text-center py-16 bg-surface rounded-card shadow-main card-border">
                <p className="text-sub">No cards found for "{searchTerm}".</p>
            </div>
        );
    };

    return (
        <>
            <div className="space-y-6 font-serif">
                <h2 className="text-3xl font-bold text-accent text-center">Card Library</h2>
                
                <div className="font-sans">
                    <input 
                        type="search"
                        placeholder="Search by name or keyword (upright/reversed)..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-surface/80 border border-border rounded-ui p-3 text-text placeholder-sub/70 focus:ring-2 focus:ring-accent"
                    />
                </div>

                {renderContent()}
            </div>

            <CardDetailModal 
                isOpen={!!selectedCard}
                onClose={() => setSelectedCard(null)}
                card={selectedCard}
            />
        </>
    );
};

export default LibraryView;