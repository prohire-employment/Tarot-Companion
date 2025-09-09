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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

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
        setTimeout(() => inputRef.current?.focus(), 50);
        setHighlightedIndex(-1);
    } else {
        setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLLIElement;
      highlightedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleSelect = (cardId: string) => {
    onValueChange(cardId);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % filteredDeck.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + filteredDeck.length) % filteredDeck.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredDeck[highlightedIndex]) {
        handleSelect(filteredDeck[highlightedIndex].id);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
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
              onChange={e => {
                setSearchTerm(e.target.value);
                setHighlightedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search for a card..."
              className="w-full bg-bg/50 border border-border rounded-md p-2 text-text placeholder-sub/70 focus:ring-2 focus:ring-accent"
            />
          </div>
          <ul
            ref={listRef}
            className="max-h-60 overflow-y-auto"
            role="listbox"
          >
            {filteredDeck.length > 0 ? (
              filteredDeck.map((card, index) => {
                const isHighlighted = index === highlightedIndex;
                const isSelected = card.id === selectedValue;
                return (
                  <li
                    key={card.id}
                    onClick={() => handleSelect(card.id)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    role="option"
                    aria-selected={isSelected}
                    className={`p-3 cursor-pointer transition-colors ${
                      isHighlighted ? 'bg-border' : isSelected ? 'bg-accent/20' : 'hover:bg-border/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <SuitIcon arcana={card.arcana} suit={card.suit} className="w-5 h-5 text-sub flex-shrink-0" />
                      <span className="truncate">{card.name}</span>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="p-3 text-sub text-center">No results found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default React.memo(CardSelector);