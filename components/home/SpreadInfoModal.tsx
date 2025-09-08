import React, { useRef } from 'react';
import type { Spread } from '../../types';
import { useModalFocus } from '../../hooks/useModalFocus';

interface SpreadInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  spreads: Spread[];
}

const SpreadInfoModal: React.FC<SpreadInfoModalProps> = ({ isOpen, onClose, spreads }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useModalFocus({ isOpen, onClose, modalRef });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="spread-info-title"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        className="bg-surface rounded-card shadow-main p-6 card-border max-w-2xl w-full font-serif flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        <div className="flex justify-between items-start mb-4 flex-shrink-0">
            <h2 id="spread-info-title" className="text-2xl font-bold text-accent">
                Available Spreads
            </h2>
            <button 
                onClick={onClose} 
                className="text-sub hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full p-1 -mr-2 -mt-2"
                aria-label="Close spread details"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <div className="space-y-6 overflow-y-auto pr-2 no-scrollbar flex-grow">
          {spreads.map((spread) => (
            <div key={spread.id} className="border-t border-border/50 pt-4">
              <h3 className="font-bold text-xl text-text">{spread.name} <span className="text-base text-sub font-normal">({spread.cardCount} card{spread.cardCount !== 1 && 's'})</span></h3>
              <p className="text-sub italic mt-1 mb-3">{spread.description}</p>
              <div className="space-y-2">
                {spread.positions.map((position, index) => (
                  <div key={index} className="border-l-2 border-accent/30 pl-3 text-sm">
                    <h4 className="font-bold text-text/90">{position.title}</h4>
                    <p className="text-sub">{position.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex-shrink-0 mt-6 text-right">
             <button 
                onClick={onClose} 
                className="bg-accent text-accent-dark font-bold py-2 px-6 rounded-ui font-sans"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default SpreadInfoModal;