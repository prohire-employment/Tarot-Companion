import React, { useState, useRef } from 'react';
import type { DrawnCard, TarotCard } from '../../types';
import { useUiStore } from '../../store/uiStore';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { findBestMatch } from '../../lib/stringSimilarity';
import { TAROT_DECK } from '../../data/cards';
import { useSettingsStore } from '../../store/settingsStore';
import { identifyCardFromImage } from '../../services/geminiService';
import CameraModal from '../home/CameraModal';
import Spinner from '../Spinner';
import { CameraIcon, MicIcon, PhotoIcon } from '../icons/NavIcons';

interface PhysicalDeckPanelProps {
  method: 'photo' | 'voice';
  onGetReading: (cards: DrawnCard[]) => void;
}

const PhysicalDeckPanel: React.FC<PhysicalDeckPanelProps> = ({ method, onGetReading }) => {
    const { showToast } = useUiStore();
    const { settings } = useSettingsStore();

    // Shared State
    const [isProcessing, setIsProcessing] = useState(false);
    const [recognizedCard, setRecognizedCard] = useState<TarotCard | null>(null);

    // Camera State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Voice State
    const handleVoiceResult = (transcript: string) => {
        setIsProcessing(false);
        const match = findBestMatch(transcript, TAROT_DECK);
        if (match) {
            setRecognizedCard(match);
        } else {
            showToast(`Could not identify "${transcript}". Please try again.`);
        }
    };

    const { isListening, toggleListening } = useSpeechRecognition({
        onResult: handleVoiceResult,
        onError: (error) => {
            setIsProcessing(false);
            showToast(error);
        },
    });
    
    // Image Processing
    const processImage = async (base64Image: string) => {
        setIsProcessing(true);
        setRecognizedCard(null);
        try {
            const cardName = await identifyCardFromImage(base64Image);
            const match = findBestMatch(cardName, TAROT_DECK, 0.7); // Higher threshold for AI
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
                }
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
    };
    
    const handleVoiceToggle = () => {
        if (!isListening) {
            setIsProcessing(true);
        } else {
            setIsProcessing(false);
        }
        toggleListening();
    }

    // Camera Modal Logic
    const openCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      } catch (err) {
        let message = "Could not access camera.";
        if (err instanceof Error) {
            if (err.name === 'NotAllowedError') message = "Camera access was denied. Please enable it in your browser settings.";
            else if (err.name === 'NotFoundError') message = "No camera found on this device.";
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
                <Spinner message={method === 'photo' ? "Reading the card's energy..." : 'Listening...'} />
            </div>
        );
    }
    
    if (recognizedCard) {
        return renderConfirmation();
    }

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
                    Use your physical deck. Press the button below and clearly speak the name of the card you have drawn.
                </div>
                <p className="text-sub h-5">{isListening ? "Listening..." : " "}</p>
                <button onClick={handleVoiceToggle} className={`mx-auto px-6 py-3 rounded-full transition-colors font-bold flex items-center justify-center gap-2 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-border text-text'}`}>
                    <MicIcon className="w-5 h-5" />
                    {isListening ? 'Stop' : 'Speak'}
                </button>
                <div className="text-left text-xs text-sub/80 p-3 bg-bg/20 rounded-lg space-y-1">
                    <p><strong>Tips for best results:</strong></p>
                    <ul className="list-disc list-inside">
                        <li>Speak clearly and close to your microphone.</li>
                        <li>Say only the name of the card, for example: "The High Priestess" or "Ace of Cups".</li>
                        <li>If the wrong card is identified, simply click "Try Again" and repeat the name.</li>
                    </ul>
                </div>
            </div>
        );
    }
    
    return null;
};

export default PhysicalDeckPanel;