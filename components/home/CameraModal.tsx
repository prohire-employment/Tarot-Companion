import React, { useRef } from 'react';
import { useModalFocus } from '../../hooks/useModalFocus';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTakePicture: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onTakePicture,
  videoRef,
  canvasRef,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useModalFocus({ isOpen, onClose, modalRef });

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef} 
      className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-modal-title"
    >
      <h2 id="camera-modal-title" className="sr-only">Camera View</h2>
      <video ref={videoRef} autoPlay playsInline className="max-w-full max-h-[80%] rounded-lg mb-4"></video>
      <div className="flex gap-4">
        <button onClick={onTakePicture} className="bg-accent text-accent-dark font-bold py-3 px-6 rounded-ui focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-accent">Take Picture</button>
        <button onClick={onClose} className="bg-border text-text font-bold py-3 px-6 rounded-ui focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-accent">Cancel</button>
      </div>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default CameraModal;
