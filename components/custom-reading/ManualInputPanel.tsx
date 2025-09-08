import React, { useState, useEffect } from 'react';
import type { Spread, DrawnCard, TarotCard, ManualCardState } from '../../types';
import { useSettingsStore } from '../../store/settingsStore';
import { useUiStore } from '../../store/uiStore';
import CardSelector from '../home/CardSelector';

interface ManualInputPanelProps {
  spread: Spread;
  deck: TarotCard[];
  onGetReading: (cards: DrawnCard[]) => void;
}

const ManualInputPanel: React.FC<ManualInputPanelProps> = ({ spread, deck, onGetReading }) => {
  const { settings } = useSettingsStore();
  const { showToast } = useUiStore();
  const [manualCardState, setManualCardState] = useState<ManualCardState[]>([]);

  useEffect(() => {
    setManualCardState(Array(spread.cardCount).fill(null).map(() => ({ cardId: '', reversed: false })));
  }, [spread.cardCount]);

  const handleManualDraw = () => {
    if (manualCardState.some(s => !s.cardId)) {
      showToast('Please select all cards for the spread.');
      return;
    }
    const cards: DrawnCard[] = manualCardState.map(s => ({
      card: deck.find(c => c.id === s.cardId)!,
      isReversed: s.reversed,
    }));
    onGetReading(cards);
  };
  
  const selectedIds = manualCardState.map(s => s.cardId).filter(Boolean);

  return (
    <div className="space-y-4 animate-fade-in">
      {spread.positions.map((pos, index) => {
        const currentCardId = manualCardState[index]?.cardId ?? '';
        // A card is available if it's not selected elsewhere, or if it's the one currently selected in this dropdown
        const availableForThisSelector = deck.filter(
          card => !selectedIds.includes(card.id) || card.id === currentCardId
        );

        return (
          <div key={index} className="space-y-3 p-4 bg-bg/30 rounded-lg border border-border/50">
            <CardSelector
              label={pos.title}
              availableDeck={availableForThisSelector}
              selectedValue={currentCardId}
              onValueChange={(cardId) => {
                const newState = [...manualCardState];
                newState[index] = { ...newState[index], cardId };
                setManualCardState(newState);
              }}
            />
            {settings.includeReversals && (
              <label className="flex items-center gap-2 text-text cursor-pointer">
                <input
                  type="checkbox"
                  checked={manualCardState[index]?.reversed ?? false}
                  onChange={e => {
                    const newState = [...manualCardState];
                    newState[index] = { ...newState[index], reversed: e.target.checked };
                    setManualCardState(newState);
                  }}
                  className="form-checkbox bg-bg/50 border-border text-accent focus:ring-accent rounded"
                />
                Reversed
              </label>
            )}
          </div>
        )
      })}
      <button 
        onClick={handleManualDraw} 
        className="w-full bg-accent text-accent-dark font-bold py-3 px-8 rounded-ui transition-all duration-300 text-lg shadow-lg hover:shadow-glow hover:scale-105 transform"
      >
        Get Reading
      </button>
    </div>
  );
};

export default ManualInputPanel;
