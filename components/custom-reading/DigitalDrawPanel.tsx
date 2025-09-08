import React from 'react';
import type { Spread, DrawnCard, TarotCard } from '../../types';
import { useSettingsStore } from '../../store/settingsStore';

interface DigitalDrawPanelProps {
  spread: Spread;
  deck: TarotCard[];
  onDraw: (cards: DrawnCard[]) => void;
}

const DigitalDrawPanel: React.FC<DigitalDrawPanelProps> = ({ spread, deck, onDraw }) => {
  const { settings } = useSettingsStore();

  const drawCards = (count: number): DrawnCard[] => {
    const shuffled = [...deck].sort(() => 0.5 - Math.random());
    const drawn = shuffled.slice(0, count);
    return drawn.map(card => ({
      card,
      isReversed: settings.includeReversals && Math.random() > 0.5,
    }));
  };

  const handleDigitalDraw = () => {
    const cards = drawCards(spread.cardCount);
    onDraw(cards);
  };

  return (
    <div className="text-center pt-2 animate-fade-in">
      <p className="text-sub mb-4">
        Let fate decide. Draw {spread.cardCount > 1 ? `${spread.cardCount} cards` : 'a card'} from the digital deck.
      </p>
      <button 
        onClick={handleDigitalDraw} 
        className="bg-accent text-accent-dark font-bold py-3 px-8 rounded-ui transition-all duration-300 text-lg shadow-lg hover:shadow-glow hover:scale-105 transform"
      >
        Draw Your Card(s)
      </button>
    </div>
  );
};

export default DigitalDrawPanel;
