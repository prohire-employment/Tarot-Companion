import React, { useState, useEffect, useRef } from 'react';
import type { Spread, SpreadPosition } from '../../types';
import { useSpreadStore } from '../../store/spreadStore';
import { useUiStore } from '../../store/uiStore';
import { useModalFocus } from '../../hooks/useModalFocus';

interface SpreadEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  spreadToEdit?: Spread;
}

const defaultPosition = (): SpreadPosition => ({ title: '', description: '' });

const SpreadEditorModal: React.FC<SpreadEditorModalProps> = ({ isOpen, onClose, spreadToEdit }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { addSpread, updateSpread } = useSpreadStore();
  const { showToast } = useUiStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [positions, setPositions] = useState<SpreadPosition[]>([defaultPosition()]);
  const [cardCountInput, setCardCountInput] = useState('1');
  const [cardCountError, setCardCountError] = useState<string | null>(null);

  useModalFocus({ isOpen, onClose, modalRef });

  useEffect(() => {
    if (isOpen) {
      if (spreadToEdit) {
        setName(spreadToEdit.name);
        setDescription(spreadToEdit.description);
        setPositions(spreadToEdit.positions);
        setCardCountInput(String(spreadToEdit.positions.length));
      } else {
        // Reset to default for new spread
        setName('');
        setDescription('');
        setPositions([defaultPosition()]);
        setCardCountInput('1');
      }
      setCardCountError(null); // Reset error on open
    }
  }, [isOpen, spreadToEdit]);

  if (!isOpen) return null;

  const handlePositionChange = (index: number, field: 'title' | 'description', value: string) => {
    const newPositions = [...positions];
    newPositions[index] = { ...newPositions[index], [field]: value };
    setPositions(newPositions);
  };

  const handleCardCountChange = (value: string) => {
    setCardCountInput(value);
    const num = parseInt(value, 10);
    
    if (isNaN(num) || num < 1) {
        setCardCountError("At least 1 card is required.");
        return;
    }
    if (num > 12) {
        setCardCountError("Maximum of 12 cards allowed.");
        return;
    }
    
    setCardCountError(null); // Clear error if valid
    
    const currentCount = positions.length;
    if (num > currentCount) {
        const newPositions = [...positions, ...Array(num - currentCount).fill(null).map(defaultPosition)];
        setPositions(newPositions);
    } else if (num < currentCount) {
        setPositions(positions.slice(0, num));
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      showToast('Spread name is required.');
      return;
    }
    if (positions.some(p => !p.title.trim())) {
      showToast('All position titles are required.');
      return;
    }
    if (cardCountError) {
      showToast('Please correct the number of cards.');
      return;
    }

    const spreadData: Spread = {
      id: spreadToEdit?.id || `custom-${crypto.randomUUID()}`,
      name: name.trim(),
      description: description.trim(),
      cardCount: positions.length,
      positions,
    };
    
    if (spreadToEdit) {
      updateSpread(spreadData);
      showToast('Spread updated successfully.');
    } else {
      addSpread(spreadData);
      showToast('Spread created successfully.');
    }
    onClose();
  };

  const isSaveDisabled = !!cardCountError || !name.trim() || positions.some(p => !p.title.trim());

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog" aria-modal="true" aria-labelledby="spread-editor-title"
      onClick={onClose}
    >
      <div
        ref={modalRef} onClick={e => e.stopPropagation()}
        className="bg-surface rounded-card shadow-main p-6 card-border max-w-2xl w-full flex flex-col font-serif"
        style={{ maxHeight: '90vh' }}
      >
        <div className="flex justify-between items-start mb-4 flex-shrink-0">
          <h2 id="spread-editor-title" className="text-2xl font-bold text-accent">
            {spreadToEdit ? 'Edit Custom Spread' : 'Create Custom Spread'}
          </h2>
          <button onClick={onClose} className="text-sub hover:text-text p-1 -mt-2 -mr-2" aria-label="Close">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-2 flex-grow no-scrollbar">
          <div className="font-sans">
            <label htmlFor="spread-name" className="font-bold text-sub block mb-1">Spread Name</label>
            <input id="spread-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-bg/50 border border-border rounded-ui p-2 text-text" />
          </div>
          <div className="font-sans">
            <label htmlFor="spread-desc" className="font-bold text-sub block mb-1">Description</label>
            <textarea id="spread-desc" value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full bg-bg/50 border border-border rounded-ui p-2 text-text" />
          </div>
          <div className="font-sans">
            <label htmlFor="spread-count" className="font-bold text-sub block mb-1">Number of Cards</label>
            <input 
                id="spread-count" 
                type="number" 
                value={cardCountInput} 
                onChange={e => handleCardCountChange(e.target.value)} 
                min="1" 
                max="12" 
                className={`w-24 bg-bg/50 border rounded-ui p-2 text-text transition-colors ${cardCountError ? 'border-red-500/70 focus:ring-1 focus:ring-red-500' : 'border-border focus:ring-accent'}`}
                aria-invalid={!!cardCountError}
                aria-describedby="card-count-error"
            />
             {cardCountError && <p id="card-count-error" className="text-red-400 text-sm mt-1">{cardCountError}</p>}
          </div>

          <h3 className="text-xl font-bold text-accent pt-2 border-t border-border">Positions</h3>
          <div className="space-y-4 font-sans">
            {positions.map((pos, index) => (
              <div key={index} className="p-3 bg-bg/30 rounded-lg border border-border/50">
                <p className="text-sub font-bold mb-2">Position {index + 1}</p>
                 <div>
                    <label htmlFor={`pos-title-${index}`} className="text-xs font-bold text-sub">Title</label>
                    <input id={`pos-title-${index}`} type="text" value={pos.title} onChange={e => handlePositionChange(index, 'title', e.target.value)} className="w-full bg-bg/80 border border-border rounded-md p-2 text-text text-sm" />
                </div>
                <div className="mt-2">
                    <label htmlFor={`pos-desc-${index}`} className="text-xs font-bold text-sub">Description</label>
                    <input id={`pos-desc-${index}`} type="text" value={pos.description} onChange={e => handlePositionChange(index, 'description', e.target.value)} className="w-full bg-bg/80 border border-border rounded-md p-2 text-text text-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 justify-end pt-6 mt-4 border-t border-border font-sans flex-shrink-0">
          <button onClick={onClose} className="bg-border text-text font-bold py-2 px-4 rounded-ui">Cancel</button>
          <button 
            onClick={handleSave} 
            disabled={isSaveDisabled}
            className="bg-accent text-accent-dark font-bold py-2 px-4 rounded-ui disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            Save Spread
          </button>
        </div>
      </div>
    </div>
  );
};
export default SpreadEditorModal;