import { useState, useEffect, useRef, useCallback } from 'react';
import type { SpeechRecognition, SpeechRecognitionErrorEvent } from '../types';

interface UseSpeechRecognitionProps {
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
}

interface CustomWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
}
declare const window: CustomWindow;


export const useSpeechRecognition = ({ onResult, onError }: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onend = () => {
        setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = `Speech recognition error: ${event.error}`;
      switch (event.error) {
        case 'not-allowed':
          errorMessage = "Microphone access denied. Please enable it in your browser settings.";
          break;
        case 'no-speech':
          errorMessage = "No speech was detected. Please try again.";
          break;
        case 'network':
          errorMessage = "A network error occurred. Please check your connection.";
          break;
        case 'aborted':
           // Don't show an error for manual aborts
           return;
        default:
          break;
      }
      onError(errorMessage);
    };

    recognitionRef.current = recognition;
  }, [onResult, onError]);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || isListening) {
      return;
    }

    try {
      recognition.start();
      setIsListening(true);
    } catch (e) {
      // Catch immediate errors from start(), e.g., if already started
      onError("Could not start speech recognition. Please try again.");
    }
  }, [isListening, onError]);
  
  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || !isListening) {
      return;
    }
    // The onend event will fire naturally, which will set isListening to false.
    recognition.stop();
  }, [isListening]);

  return { isListening, startListening, stopListening, isSupported: !!recognitionRef.current };
};
