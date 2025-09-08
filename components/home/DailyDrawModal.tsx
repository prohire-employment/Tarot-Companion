import React, { useRef, useEffect } from 'react';
import { useModalFocus } from '../../hooks/useModalFocus';
import { useSound } from '../../hooks/useSound';
import CardBack from '../CardBack';

interface DailyDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDraw: () => void;
  isLoading?: boolean;
}

const DailyDrawModal: React.FC<DailyDrawModalProps> = ({ isOpen, onClose, onDraw, isLoading = false }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useModalFocus({ isOpen, onClose, modalRef });
  const { playSound } = useSound();

  useEffect(() => {
    if (isOpen) {
      playSound('open');
    }
  }, [isOpen, playSound]);

  const handleClose = () => {
    if (isLoading) return;
    playSound('close');
    onClose();
  };

  const handleDraw = () => {
    if (isLoading) return;
    playSound('draw');
    onDraw();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-draw-title"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        onClick={e => e.stopPropagation()}
        className="bg-surface rounded-card shadow-main p-8 card-border max-w-sm w-full text-center font-serif"
      >
        <h2 id="daily-draw-title" className="text-2xl font-bold text-accent mb-2">
          Your Daily Draw
        </h2>
        <p className="text-sub mb-6">The cards await. Take a deep breath and draw your card for the day.</p>
        
        <div className="w-40 mx-auto mb-6">
            <CardBack isShimmering />
        </div>
        
        <div className="flex flex-col gap-3 font-sans">
            <button
              onClick={handleDraw}
              disabled={isLoading}
              className="w-full bg-accent text-accent-dark font-bold py-3 px-4 rounded-ui text-lg hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-wait"
            >
              {isLoading ? 'Preparing...' : 'Draw Card of the Day'}
            </button>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="w-full bg-border text-text font-bold py-2 px-4 rounded-ui hover:bg-border/70 transition-colors disabled:opacity-70"
            >
              Maybe Later
            </button>
        </div>
      </div>
    </div>
  );
};

export default DailyDrawModal;