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
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

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
           setIsListening(false);
           return;
        default:
          break;
      }
      onError(errorMessage);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [onResult, onError]);

  const toggleListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
        onError("Speech recognition is not supported on this browser.");
        return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        // Catch immediate errors from start(), e.g., if already started
        onError("Could not start speech recognition. Please try again.");
        setIsListening(false);
      }
    }
  }, [isListening, onError]);
  
  const stopListening = useCallback(() => {
    if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
    }
  }, [isListening]);

  return { isListening, toggleListening, stopListening, isSupported: !!recognitionRef.current };
};
