import React, { useState, useRef } from 'react';
import type { AppSettings, Spread, TarotCard, ManualCardState } from '../../types';
import { CameraIcon, MicIcon, PhotoIcon } from '../icons/NavIcons';
import CardSelector from './CardSelector';

interface InputMethodSelectorProps {
  selectedSpread: Spread;
  handleDigitalDraw: () => void;
  handleManualDraw: () => void;
  openCamera: () => void;
  handleToggleListening: () => void;
  isListening: boolean;
  manualCardState: ManualCardState[];
  setManualCardState: React.Dispatch<React.SetStateAction<ManualCardState[]>>;
  availableDeck: TarotCard[];
  settings: AppSettings;
  handleFileSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputMethodSelector: React.FC<InputMethodSelectorProps> = ({
  selectedSpread,
  handleDigitalDraw,
  handleManualDraw,
  openCamera,
  handleToggleListening,
  isListening,
  manualCardState,
  setManualCardState,
  availableDeck,
  settings,
  handleFileSelected,
}) => {
  const [inputMethod, setInputMethod] = useState<'digital' | 'manual' | 'photo' | 'voice'>('digital');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inputOptions = [
    { id: 'digital', label: 'Digital Draw' },
    { id: 'manual', label: 'Manual Input' },
    { id: 'photo', label: 'From Photo' },
    { id: 'voice', label: 'From Voice' },
  ];
  const isMultiCardSpread = selectedSpread.cardCount > 1;

  return (
    <fieldset className="border border-border/50 rounded-lg p-4 space-y-4">
      <legend className="px-2 font-serif text-accent font-bold text-lg">Step 2: Draw Your Cards</legend>
      <div>
        <p className="text-sub font-medium mb-3">How would you like to provide your card(s)?</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
          {inputOptions.map(opt => {
            const isDisabled = isMultiCardSpread && (opt.id === 'photo' || opt.id === 'voice');
            return (
              <button key={opt.id} onClick={() => setInputMethod(opt.id as any)} disabled={isDisabled} className={`p-3 rounded-ui text-sm font-semibold transition-all duration-200 ease-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${inputMethod === opt.id ? 'bg-accent text-accent-dark shadow-md' : 'bg-border/50 hover:bg-border'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {opt.label}
              </button>
            )
          })}
        </div>
        {isMultiCardSpread && (inputMethod === 'photo' || inputMethod === 'voice') && <p className="text-xs text-center text-sub/80 mt-2">Photo and Voice input are available for single-card draws only.</p>}
      </div>

      {inputMethod === 'digital' && (
        <div className="text-center pt-2">
          <p className="text-sub mb-4">Let fate decide. Draw {selectedSpread.cardCount > 1 ? `${selectedSpread.cardCount} cards` : 'a card'} from the digital deck.</p>
          <button onClick={handleDigitalDraw} className="bg-accent text-accent-dark font-bold py-3 px-8 rounded-ui transition-all duration-300 text-lg shadow-lg hover:shadow-glow hover:scale-105 transform">Draw Your Card(s)</button>
        </div>
      )}

      {inputMethod === 'manual' && (
        <div className="space-y-4">
          {selectedSpread.positions.map((pos, index) => (
            <div key={index} className="space-y-3 p-4 bg-bg/30 rounded-lg border border-border/50">
                <CardSelector
                    label={pos.title}
                    availableDeck={availableDeck}
                    selectedValue={manualCardState[index]?.cardId}
                    onValueChange={(cardId) => {
                        const newState = [...manualCardState];
                        newState[index] = { ...newState[index], cardId };
                        setManualCardState(newState);
                    }}
                />
              {settings.includeReversals && <label className="flex items-center gap-2 text-text">
                <input
                  type="checkbox"
                  checked={manualCardState[index]?.reversed}
                  onChange={e => {
                    const newState = [...manualCardState];
                    newState[index] = { ...newState[index], reversed: e.target.checked };
                    setManualCardState(newState);
                  }}
                  className="form-checkbox bg-bg/50 border-border text-accent focus:ring-accent rounded"
                />
                Reversed
              </label>}
            </div>
          ))}
          <button onClick={handleManualDraw} className="w-full bg-accent text-accent-dark font-bold py-3 px-8 rounded-ui transition-all duration-300 text-lg shadow-lg hover:shadow-glow hover:scale-105 transform">Get Reading</button>
        </div>
      )}

      {inputMethod === 'photo' && !isMultiCardSpread && (
        <div className="flex gap-4">
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelected} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-border text-text font-bold py-3 rounded-ui hover:bg-border/70 flex items-center justify-center gap-2"><PhotoIcon className="w-5 h-5" /> Upload</button>
          <button onClick={openCamera} className="flex-1 bg-border text-text font-bold py-3 rounded-ui hover:bg-border/70 flex items-center justify-center gap-2"><CameraIcon className="w-5 h-5" /> Use Camera</button>
        </div>
      )}

      {inputMethod === 'voice' && !isMultiCardSpread && (
        <div className="text-center">
          <p className="text-sub mb-4">{isListening ? "Listening..." : "Press the button and speak the card name clearly."}</p>
          <button onClick={handleToggleListening} className={`mx-auto px-6 py-3 rounded-full transition-colors font-bold flex items-center justify-center gap-2 ${isListening ? 'bg-red-500 text-white' : 'bg-border text-text'}`}>
            <MicIcon className="w-5 h-5" />
            {isListening ? 'Stop' : 'Speak'}
          </button>
        </div>
      )}
    </fieldset>
  );
};

export default InputMethodSelector;