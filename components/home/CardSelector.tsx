import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { TarotCard } from '../../types';
import { SuitIcon } from '../icons/SuitIcons';

interface CardSelectorProps {
  label: string;
  availableDeck: TarotCard[];
  selectedValue: string;
  onValueChange: (cardId: string) => void;
}

const CardSelector: React.FC<CardSelectorProps> = ({
  label,
  availableDeck,
  selectedValue,
  onValueChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCard = useMemo(
    () => availableDeck.find(c => c.id === selectedValue),
    [selectedValue, availableDeck]
  );

  const filteredDeck = useMemo(
    () =>
      availableDeck.filter(card =>
        card.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [availableDeck, searchTerm]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
        // Delay focus to allow for render
        setTimeout(() => inputRef.current?.focus(), 50);
    } else {
        // Clear search when dropdown closes
        setSearchTerm('');
    }
  }, [isOpen]);

  const handleSelect = (cardId: string) => {
    onValueChange(cardId);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="space-y-2 relative" ref={wrapperRef}>
      <label className="font-bold text-accent">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full appearance-none bg-bg/50 border border-border rounded-ui p-3 text-text text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <span className="flex items-center gap-3">
          {selectedCard && <SuitIcon arcana={selectedCard.arcana} suit={selectedCard.suit} className="w-5 h-5 text-accent flex-shrink-0" />}
          <span className="truncate">{selectedCard?.name || 'Select a card...'}</span>
        </span>
        <svg
          className={`fill-current h-4 w-4 transform transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-ui shadow-lg">
          <div className="p-2">
            <input
              ref={inputRef}
              type="search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search for a card..."
              className="w-full bg-bg/50 border border-border rounded-md p-2 text-text placeholder-sub/70 focus:ring-2 focus:ring-accent"
            />
          </div>
          <ul
            className="max-h-60 overflow-y-auto"
            role="listbox"
          >
            {filteredDeck.length > 0 ? (
              filteredDeck.map(card => (
                <li
                  key={card.id}
                  onClick={() => handleSelect(card.id)}
                  role="option"
                  aria-selected={card.id === selectedValue}
                  className={`p-3 cursor-pointer hover:bg-border/50 transition-colors ${
                    card.id === selectedValue ? 'bg-accent/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <SuitIcon arcana={card.arcana} suit={card.suit} className="w-5 h-5 text-sub flex-shrink-0" />
                    <span className="truncate">{card.name}</span>
                  </div>
                </li>
              ))
            ) : (
              <li className="p-3 text-sub text-center">No results found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CardSelector;
