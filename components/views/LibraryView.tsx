import React, { useState, useMemo, useCallback } from 'react';
import { TAROT_DECK } from '../../data/cards';
import CardDetailModal from '../library/CardDetailModal';
import type { TarotCard } from '../../types';
import LibraryCard from '../library/LibraryCard';

const LibraryView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);

    const filteredDeck = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return TAROT_DECK;
        return TAROT_DECK.filter(card => 
            card.name.toLowerCase().includes(term) ||
            card.uprightKeywords.some(kw => kw.toLowerCase().includes(term)) ||
            card.reversedKeywords.some(kw => kw.toLowerCase().includes(term))
        );
    }, [searchTerm]);

    const handleCardClick = useCallback((card: TarotCard) => {
        setSelectedCard(card);
    }, []);

    return (
        <>
            <div className="space-y-6 font-serif">
                <h2 className="text-3xl font-bold text-accent text-center">Card Library</h2>
                
                <div className="font-sans">
                    <input 
                        type="search"
                        placeholder="Search by name or keyword..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-surface/80 border border-border rounded-ui p-3 text-text placeholder-sub/70 focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {filteredDeck.map(card => (
                        <LibraryCard
                           key={card.id}
                           card={card}
                           onClick={handleCardClick}
                        />
                    ))}
                </div>

                {filteredDeck.length === 0 && (
                     <div className="text-center py-16 bg-surface rounded-card shadow-main card-border">
                        <p className="text-sub">No cards found for "{searchTerm}".</p>
                    </div>
                )}
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