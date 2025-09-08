import React, { useRef } from 'react';
import { useModalFocus } from '../../hooks/useModalFocus';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useModalFocus({ isOpen, onClose, modalRef });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={e => e.stopPropagation()}
        className="bg-surface rounded-card shadow-main p-6 card-border max-w-md w-full"
      >
        <h2 id="confirm-modal-title" className="text-2xl font-serif font-bold text-accent mb-4">{title}</h2>
        <div className="text-sub font-sans mb-6">{children}</div>
        <div className="flex gap-4 justify-end font-sans">
          <button
            onClick={onClose}
            className="bg-border text-text font-bold py-2 px-4 rounded-ui hover:bg-border/70 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white font-bold py-2 px-4 rounded-ui hover:bg-red-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;