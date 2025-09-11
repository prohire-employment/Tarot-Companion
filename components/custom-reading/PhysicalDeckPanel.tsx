import React, { useState, useRef, memo, useCallback } from 'react';
import type { DrawnCard, TarotCard } from '../../types';
import { useUiStore } from '../../store/uiStore';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { findBestMatch } from '../../lib/stringSimilarity';
import { useSettingsStore } from '../../store/settingsStore';
import { identifyCardFromImage } from '../../services/geminiService';
import CameraModal from '../home/CameraModal';
import Spinner from '../Spinner';
import { CameraIcon, MicIcon, PhotoIcon } from '../icons/NavIcons';

interface PhysicalDeckPanelProps {
  method: 'photo' | 'voice';
  deck: TarotCard[];
  onGetReading: (cards: DrawnCard[]) => void;
}

const PhysicalDeckPanel: React.FC<PhysicalDeckPanelProps> = ({ method, deck, onGetReading }) => {
    const { showToast } = useUiStore();
    const { settings } = useSettingsStore();

    // Shared State
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState("Reading the card's energy...");
    const [recognizedCard, setRecognizedCard] = useState<TarotCard | null>(null);
    const [isKeyDown, setIsKeyDown] = useState(false);


    // Camera State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Voice State
    const handleVoiceResult = (transcript: string) => {
        const match = findBestMatch(transcript, deck);
        if (match) {
            setRecognizedCard(match);
        } else {
            showToast(`Could not identify "${transcript}". Please try again.`);
        }
    };

    const { isListening, startListening, stopListening } = useSpeechRecognition({
        onResult: handleVoiceResult,
        onError: (error) => {
            showToast(error);
        },
    });
    
    // Image Processing
    const processImage = async (base64Image: string) => {
        setProcessingMessage("Reading the card's energy...");
        setIsProcessing(true);
        setRecognizedCard(null);
        try {
            const cardName = await identifyCardFromImage(base64Image);
            const match = findBestMatch(cardName, deck, 0.7); // Higher threshold for AI
            if (match) {
                setRecognizedCard(match);
            } else {
                showToast(`Could not identify a card from the image. Please try again with a clearer picture.`);
            }
        } catch (error) {
            showToast(error instanceof Error ? error.message : "An unknown error occurred during image processing.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (typeof e.target?.result === 'string') {
                    processImage(e.target.result);
                } else {
                    showToast("Could not read the selected image file.");
                }
            };
            reader.onerror = () => {
                showToast("Failed to read the selected file.");
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleTakePicture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUrl = canvas.toDataURL('image/jpeg');
            processImage(dataUrl);
        }
        closeCamera();
    };

    // Shared Logic
    const handleConfirmRecognition = () => {
        if (!recognizedCard) return;
        const isReversed = settings.includeReversals && Math.random() > 0.5; // Assume random reversal
        const card: DrawnCard[] = [{ card: recognizedCard, isReversed }];
        onGetReading(card);
    };

    const handleRetry = () => {
        setRecognizedCard(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Camera Modal Logic
    const openCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      } catch (err) {
        let message = "Could not access the camera. Please ensure it is not in use by another application.";
        if (err instanceof Error) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                 message = "Camera access was denied. Please enable camera permissions for this site in your browser settings to use this feature.";
            }
            else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                message = "No camera was found on your device.";
            }
        }
        showToast(message);
      }
    };

    const closeCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsCameraOpen(false);
    };
    
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
      if ((e.key === ' ' || e.key === 'Enter') && !isListening && !isKeyDown) {
          e.preventDefault();
          setIsKeyDown(true);
          startListening();
      }
    }, [isListening, isKeyDown, startListening]);

    const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
        if ((e.key === ' ' || e.key === 'Enter') && isListening) {
            e.preventDefault();
            setIsKeyDown(false);
            stopListening();
        }
    }, [isListening, stopListening]);

    const handleBlur = useCallback(() => {
        if (isListening) {
            setIsKeyDown(false);
            stopListening();
        }
    }, [isListening, stopListening]);

    const renderConfirmation = () => (
         <div className="text-center space-y-4 p-4 bg-bg/30 rounded-lg animate-fade-in">
            <p className="text-sub">I see:</p>
            <p className="text-xl font-bold text-accent">{recognizedCard!.name}</p>
            <p className="text-sub">Is this correct?</p>
            <div className="flex gap-4 justify-center">
                <button onClick={handleConfirmRecognition} className="flex-1 bg-accent text-accent-dark font-bold py-2 px-4 rounded-ui">Yes, Get Reading</button>
                <button onClick={handleRetry} className="flex-1 bg-border text-text font-bold py-2 px-4 rounded-ui">Try Again</button>
            </div>
        </div>
    );
    

    if (isProcessing) {
        return (
            <div className="flex justify-center items-center h-24">
                <Spinner message={processingMessage} />
            </div>
        );
    }
    
    if (recognizedCard) return renderConfirmation();

    if (method === 'photo') {
        return (
            <div className="space-y-4 animate-fade-in">
                <div className="text-center p-3 bg-bg/30 rounded-lg text-sub text-sm">
                    Use your physical deck. Upload a clear photo of a single card, or use your device's camera.
                </div>
                <div className="flex gap-4">
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelected} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-border text-text font-bold py-3 rounded-ui hover:bg-border/70 flex items-center justify-center gap-2"><PhotoIcon className="w-5 h-5" /> Upload</button>
                    <button onClick={openCamera} className="flex-1 bg-border text-text font-bold py-3 rounded-ui hover:bg-border/70 flex items-center justify-center gap-2"><CameraIcon className="w-5 h-5" /> Use Camera</button>
                </div>
                 <CameraModal isOpen={isCameraOpen} onClose={closeCamera} onTakePicture={handleTakePicture} videoRef={videoRef} canvasRef={canvasRef} />
            </div>
        );
    }

    if (method === 'voice') {
        return (
            <div className="text-center space-y-4 animate-fade-in">
                <div className="text-center p-3 bg-bg/30 rounded-lg text-sub text-sm">
                    Use your physical deck. Press and hold the button below, then clearly speak the name of the card you have drawn.
                </div>
                <button
                    onMouseDown={startListening}
                    onMouseUp={stopListening}
                    onMouseLeave={stopListening}
                    onTouchStart={(e) => { e.preventDefault(); startListening(); }}
                    onTouchEnd={stopListening}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                    onBlur={handleBlur}
                    className={`mx-auto px-6 py-3 w-full max-w-xs rounded-ui transition-all duration-200 font-bold flex items-center justify-center gap-2 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        isListening
                        ? 'bg-red-600 text-white scale-105 shadow-lg'
                        : 'bg-border text-text active:scale-105'
                    }`}
                >
                    <MicIcon className="w-5 h-5" />
                    {isListening ? 'Listening...' : 'Press & Hold to Speak'}
                </button>
            </div>
        );
    }
    
    return null;
};

export default memo(PhysicalDeckPanel);