import React, { useRef } from 'react';
import type { Spread } from '../../types';
import { useModalFocus } from '../../hooks/useModalFocus';

interface SpreadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  spread: Spread;
}

const SpreadDetailModal: React.FC<SpreadDetailModalProps> = ({ isOpen, onClose, spread }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useModalFocus({ isOpen, onClose, modalRef });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="spread-detail-title"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={e => e.stopPropagation()}
        className="bg-surface rounded-card shadow-main p-6 card-border max-w-lg w-full font-serif"
      >
        <div className="flex justify-between items-start mb-4">
            <h2 id="spread-detail-title" className="text-2xl font-bold text-accent">
                {spread.name}
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
        
        <p className="text-sub mb-6">{spread.description}</p>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
          {spread.positions.map((position, index) => (
            <div key={index} className="border-l-2 border-accent/30 pl-4">
              <h3 className="font-bold text-text">{position.title}</h3>
              <p className="text-sub">{position.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpreadDetailModal;