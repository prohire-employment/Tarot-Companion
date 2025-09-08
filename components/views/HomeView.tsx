import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { JournalEntry, DrawnCard, Interpretation, TarotCard, Spread, ManualCardState } from '../../types';
import { useAlmanac } from '../../hooks/useAlmanac';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useJournalStore } from '../../store/journalStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useUiStore } from '../../store/uiStore';
import { useSpreadStore } from '../../store/spreadStore';
import { TAROT_DECK } from '../../data/cards';
import { SPREADS as defaultSpreads } from '../../data/spreads';
import { getSpreadInterpretation, identifyCardFromImage } from '../../services/geminiService';
import Spinner from '../Spinner';
import ReadingSetup from '../home/ReadingSetup';
import InputMethodSelector from '../home/InputMethodSelector';
import ReadingResult from '../home/ReadingResult';
import CameraModal from '../home/CameraModal';
import SpreadDetailModal from '../home/SpreadDetailModal';
import DailyDrawModal from '../home/DailyDrawModal';
import CardBack from '../CardBack';

const findCardByName = (name: string): TarotCard | undefined => {
  if (!name) return undefined;
  const normalizedName = name.toLowerCase().trim().replace(/[.,]/g, '');
  return TAROT_DECK.find(c =>
    c.name.toLowerCase().replace(/[.,]/g, '') === normalizedName
  );
};

const HomeView: React.FC = () => {
  const { settings } = useSettingsStore();
  const { entries, addEntry } = useJournalStore();
  const { showToast, setActiveView } = useUiStore();
  const { customSpreads } = useSpreadStore();

  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [interpretation, setInterpretation] = useState<Interpretation | null>(null);
  const [impression, setImpression] = useState('');
  const [question, setQuestion] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const almanac = useAlmanac();

  const [isSpreadDetailModalOpen, setIsSpreadDetailModalOpen] = useState(false);
  const [isDailyDrawLoading, setIsDailyDrawLoading] = useState(false);
  const [dailyDrawData, setDailyDrawData] = useState<{ drawnCard: DrawnCard; interpretation: Interpretation } | null>(null);


  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const dailyDrawEntryToday = useMemo(() => (
      entries.find(e => e.dateISO === todayISO && e.drawnCards.length === 1 && e.drawnCards[0].position === 'Card of the Day')
  ), [entries, todayISO]);


  const availableDeck = useMemo(() => {
    switch (settings.deckType) {
      case 'major':
        return TAROT_DECK.filter(c => c.arcana === 'Major');
      case 'minor':
        return TAROT_DECK.filter(c => c.arcana === 'Minor');
      case 'full':
      default:
        return TAROT_DECK;
    }
  }, [settings.deckType]);

  const allSpreads = useMemo(() => 
    [...defaultSpreads, ...customSpreads].sort((a,b) => a.cardCount - b.cardCount || a.name.localeCompare(b.name)), 
    [customSpreads]
  );

  const availableSpreads = useMemo(() => {
    return allSpreads.filter(s => s.cardCount <= availableDeck.length);
  }, [availableDeck, allSpreads]);

  const [selectedSpreadId, setSelectedSpreadId] = useState<string>(availableSpreads[0].id);
  
  useEffect(() => {
    if (!availableSpreads.find(s => s.id === selectedSpreadId)) {
      setSelectedSpreadId(availableSpreads[0].id);
    }
  }, [availableSpreads, selectedSpreadId]);
  
  const selectedSpread = useMemo(() => availableSpreads.find(s => s.id === selectedSpreadId)!, [selectedSpreadId, availableSpreads]);
  
  const [manualCardState, setManualCardState] = useState<ManualCardState[]>([]);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const resetState = useCallback(() => {
    setDrawnCards([]);
    setInterpretation(null);
    setImpression('');
    setTags([]);
    setError(null);
    setIsLoading(false);
    setLoadingMessage('');
  }, []);

  useEffect(() => {
    resetState();
    if (availableDeck.length > 0 && selectedSpread) {
      setManualCardState(
        Array(selectedSpread.cardCount).fill(null).map(() => ({
          cardId: availableDeck[0].id,
          reversed: false,
        }))
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSpreadId, availableDeck, resetState]);
  
  // This effect triggers when cards are drawn and ready for interpretation.
  useEffect(() => {
    if (drawnCards.length > 0 && interpretation === null && !isLoading && !error) {
      let isCancelled = false;

      const performReading = async () => {
        try {
          const interpretationResult = await getSpreadInterpretation(drawnCards, almanac, selectedSpread.name, question);
          if (isCancelled) return;
          setInterpretation(interpretationResult);
        } catch (err) {
          if (!isCancelled) {
            // The custom error from GeminiService has a `userFriendlyMessage` property
            const message = (err instanceof Error && 'userFriendlyMessage' in err)
              ? (err as any).userFriendlyMessage
              : 'An unexpected error occurred during the reading.';
            setError(message);
            // Keep drawn cards visible even if interpretation fails.
          }
        }
      };

      performReading();
      return () => { isCancelled = true; };
    }
  }, [drawnCards, interpretation, isLoading, error, selectedSpread.name, almanac, question]);


  const handleDigitalDraw = useCallback(() => {
    if (selectedSpread.cardCount > availableDeck.length) {
      setError(`The selected deck is too small for a "${selectedSpread.name}" spread.`);
      return;
    }
    resetState();
    setIsLoading(true);
    setLoadingMessage('Shuffling the deck...');

    setTimeout(() => {
      const deckCopy = [...availableDeck];
      const cards: DrawnCard[] = [];
      for (let i = 0; i < selectedSpread.cardCount; i++) {
        if (deckCopy.length === 0) break;
        const randomIndex = Math.floor(Math.random() * deckCopy.length);
        const card = deckCopy.splice(randomIndex, 1)[0];
        cards.push({
          card,
          reversed: settings.includeReversals && Math.random() < 0.3,
          position: selectedSpread.positions[i].title,
        });
      }
      setDrawnCards(cards);
      setIsLoading(false);
    }, 1000);
  }, [availableDeck, resetState, selectedSpread, settings.includeReversals]);
  
  const handleManualDraw = useCallback(() => {
    resetState();
    const cards: DrawnCard[] = manualCardState.map((state, i) => {
      const card = availableDeck.find(c => c.id === state.cardId)!;
      return {
        card,
        reversed: state.reversed,
        position: selectedSpread.positions[i].title,
      };
    });
    setDrawnCards(cards);
  }, [availableDeck, manualCardState, resetState, selectedSpread.positions]);

  const processImage = useCallback(async (base64: string) => {
    resetState();
    setIsLoading(true);
    setLoadingMessage('Identifying your card...');
    try {
      const cardName = await identifyCardFromImage(base64);
      if (cardName) {
        const card = findCardByName(cardName);
        if (card) {
          setDrawnCards([{
            card,
            reversed: false, // Photo identification assumes upright
            position: selectedSpread.positions[0].title,
          }]);
        } else {
          setError(`Identified "${cardName}", but it's not in the deck.`);
        }
      } else {
        setError("Could not identify a card in the image. Please try again.");
      }
    } catch (err) {
      const message = (err instanceof Error && 'userFriendlyMessage' in err)
        ? (err as any).userFriendlyMessage
        : 'An unexpected error occurred while identifying the card.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [resetState, selectedSpread.positions]);

  const handleFileSelected = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const base64 = dataUrl.split(',')[1];
        processImage(base64);
      };
      reader.readAsDataURL(file);
    }
  }, [processImage]);

  const openCamera = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraOpen(true);
        }
      } catch (err) {
        setError("Could not access camera. Please grant permission and try again.");
      }
    } else {
      setError("Camera access is not supported by your browser.");
    }
  }, []);
  
  const closeCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  }, []);

  const handleTakePicture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
        processImage(base64);
      }
    }
    closeCamera();
  }, [closeCamera, processImage]);

  const onSpeechResult = useCallback((transcript: string) => {
    const foundCard = findCardByName(transcript);
    if (foundCard) {
      resetState();
      setDrawnCards([{ 
        card: foundCard, 
        reversed: false,
        position: selectedSpread.positions[0].title,
      }]);
    } else {
      setError(`Could not find a card matching "${transcript}". Please try again.`);
    }
  }, [resetState, selectedSpread.positions]);

  const { isListening, toggleListening } = useSpeechRecognition({
    onResult: onSpeechResult,
    onError: setError,
  });

  const handleStartListening = useCallback(() => {
    resetState();
    toggleListening();
  }, [resetState, toggleListening]);

  const handleSaveEntry = useCallback(() => {
    if (drawnCards.length === 0 || !interpretation) return;
    const now = new Date();
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      dateISO: now.toISOString().slice(0, 10),
      question: question || undefined,
      drawnCards,
      impression,
      interpretation,
      almanac,
      createdAt: now.toISOString(),
      tags: tags.length > 0 ? tags : undefined,
    };
    addEntry(newEntry);
    showToast('Entry saved successfully.');
    setActiveView('journal');
    setQuestion('');
    resetState();
  }, [drawnCards, interpretation, question, impression, almanac, tags, addEntry, showToast, setActiveView, resetState]);
  
  const handleNewReading = useCallback(() => {
    setQuestion('');
    resetState();
  }, [resetState]);

  const handleSaveImage = useCallback((imageUrl: string, cardName: string) => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    const sanitizedCardName = cardName.replace(/\s+/g, '_');
    link.download = `TarotCompanion_${sanitizedCardName}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleDailyDraw = useCallback(async () => {
    setError(null);
    setIsDailyDrawLoading(true);
    try {
      const spread = defaultSpreads.find(s => s.id === 'single-card');
      if (!spread) {
        throw new Error('Could not find the Card of the Day spread.');
      }

      const deckCopy = [...availableDeck];
      const randomIndex = Math.floor(Math.random() * deckCopy.length);
      const card = deckCopy[randomIndex];
      const drawnCard: DrawnCard = {
        card,
        reversed: settings.includeReversals && Math.random() < 0.3,
        position: spread.positions[0].title,
      };

      const interpretation = await getSpreadInterpretation([drawnCard], almanac, spread.name, 'Daily Card');
      
      setDailyDrawData({ drawnCard, interpretation });
    } catch (err) {
      const message = (err instanceof Error && 'userFriendlyMessage' in err)
        ? (err as any).userFriendlyMessage
        : 'An unexpected error occurred during the daily draw.';
      setError(message);
    } finally {
      setIsDailyDrawLoading(false);
    }
  }, [almanac, availableDeck, settings.includeReversals]);

  const showSetup = drawnCards.length === 0 && !isLoading && !isCameraOpen;
  const showResult = drawnCards.length > 0 && !isLoading;

  return (
    <div className="space-y-8">
      <section className="bg-surface rounded-card shadow-main p-6 space-y-4 card-border text-center">
        <h2 className="text-3xl font-serif font-bold text-accent mb-2">Your Daily Draw</h2>
        {dailyDrawEntryToday ? (
          <div className="animate-fade-in space-y-3">
            <p className="text-sub">You've completed your daily draw. See you tomorrow!</p>
            <div className="max-w-[180px] mx-auto text-center">
              {dailyDrawEntryToday.drawnCards[0].card.imageUrl ? (
                <img src={dailyDrawEntryToday.drawnCards[0].card.imageUrl} alt={`Art for ${dailyDrawEntryToday.drawnCards[0].card.name}`} className="rounded-card shadow-md w-full" />
              ) : (
                 <CardBack />
              )}
              <p className="font-semibold text-text text-lg mt-2">{dailyDrawEntryToday.drawnCards[0].card.name}</p>
              <p className="text-sm text-sub">{dailyDrawEntryToday.drawnCards[0].reversed ? '(Reversed)' : '(Upright)'}</p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sub mb-4">Take a moment for yourself. Draw a single card for focus and guidance.</p>
            <button
              onClick={handleDailyDraw}
              disabled={isDailyDrawLoading}
              className="bg-accent text-accent-dark font-bold py-3 px-8 rounded-ui transition-all duration-300 text-lg shadow-lg hover:shadow-glow hover:scale-105 transform disabled:opacity-50 disabled:cursor-wait disabled:scale-100 disabled:shadow-lg"
            >
              {isDailyDrawLoading ? 'Drawing...' : 'Draw Your Card'}
            </button>
          </div>
        )}
      </section>

      {showSetup && (
        <section className="bg-surface rounded-card shadow-main p-6 space-y-6 card-border">
          <h2 className="text-3xl font-serif font-bold text-accent mb-2 text-center">Start a New Reading</h2>
          <ReadingSetup
            selectedSpreadId={selectedSpreadId}
            setSelectedSpreadId={setSelectedSpreadId}
            availableSpreads={availableSpreads}
            selectedSpread={selectedSpread}
            question={question}
            setQuestion={setQuestion}
            onShowSpreadDetails={() => setIsSpreadDetailModalOpen(true)}
          />
          <InputMethodSelector
            selectedSpread={selectedSpread}
            handleDigitalDraw={handleDigitalDraw}
            handleManualDraw={handleManualDraw}
            openCamera={openCamera}
            handleToggleListening={handleStartListening}
            isListening={isListening}
            manualCardState={manualCardState}
            setManualCardState={setManualCardState}
            availableDeck={availableDeck}
            settings={settings}
            handleFileSelected={handleFileSelected}
          />
        </section>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <Spinner message={loadingMessage} />
        </div>
      )}

      {error && !isDailyDrawLoading && (
        <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-lg text-center">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="mt-2 bg-red-500/20 px-3 py-1 rounded-md text-sm hover:bg-red-500/40">Dismiss</button>
        </div>
      )}

      <CameraModal
        isOpen={isCameraOpen}
        onClose={closeCamera}
        onTakePicture={handleTakePicture}
        videoRef={videoRef}
        canvasRef={canvasRef}
      />
      
      <SpreadDetailModal
        isOpen={isSpreadDetailModalOpen}
        onClose={() => setIsSpreadDetailModalOpen(false)}
        spread={selectedSpread}
      />
      
      <DailyDrawModal
        isOpen={!!dailyDrawData}
        onClose={() => setDailyDrawData(null)}
        data={dailyDrawData}
        almanac={almanac}
      />

      {showResult && (
        <ReadingResult
            selectedSpread={selectedSpread}
            drawnCards={drawnCards}
            interpretation={interpretation}
            question={question}
            impression={impression}
            setImpression={setImpression}
            tags={tags}
            setTags={setTags}
            handleSaveEntry={handleSaveEntry}
            handleNewReading={handleNewReading}
            handleSaveImage={handleSaveImage}
        />
      )}
    </div>
  );
};

export default HomeView;