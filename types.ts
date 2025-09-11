// Foundational Types
export type Arcana = 'Major' | 'Minor';
export type Suit = 'None' | 'Wands' | 'Cups' | 'Swords' | 'Pentacles';
export type View = 'home' | 'journal' | 'calendar' | 'settings' | 'library' | 'about';
export type DeckType = 'full' | 'major' | 'minor';

// Data Structures
export interface TarotCard {
  id: string;
  name: string;
  arcana: Arcana;
  suit: Suit;
  uprightKeywords: string[];
  reversedKeywords: string[];
  imageUrl: string;
}

export interface SpreadPosition {
  title: string;
  description: string;
}

export interface Spread {
  id:string;
  name: string;
  description: string;
  cardCount: number;
  positions: SpreadPosition[];
}

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
  imageUrl?: string;
}

export interface JournalEntry {
  id: string;
  createdAt: string; // ISO string
  dateISO: string; // 'YYYY-MM-DD'
  spread: Spread;
  drawnCards: DrawnCard[];
  interpretation: {
    overall: string;
    cards: {
      cardName: string;
      meaning: string;
    }[];
  };
  question?: string;
  impression: string;
  tags?: string[];
}

// Application State & Settings
export interface AppSettings {
  reminderTime: string; // 'HH:mm'
  notificationsEnabled: boolean;
  deckType: DeckType;
  includeReversals: boolean;
}

export interface AlmanacInfo {
  lunarPhase: string;
  season: string;
  holiday: string | null;
  upcomingHolidays: { name: string; date: Date }[];
}

export interface ManualCardState {
  cardId: string;
  reversed: boolean;
}

export type JournalFilter = { type: 'date'; value: string } | { type: 'id'; value: string };


// State Reducer for HomeView Reading Flow
export type ReadingPhase = 'dashboard' | 'generatingImages' | 'loading' | 'result' | 'imageError' | 'interpretationError';

export interface ReadingState {
    phase: ReadingPhase;
    drawnCards: DrawnCard[];
    interpretation: {
        overall: string;
        cards: { cardName: string; meaning: string }[];
    } | null;
    spread: Spread | null;
    question: string;
    error: string | null;
}

export type ReadingAction =
    | { type: 'START_READING'; payload: { cards: DrawnCard[], spread: Spread, question: string } }
    | { type: 'IMAGE_GENERATION_SUCCESS'; payload: { cardsWithImages: DrawnCard[] } }
    | { type: 'IMAGE_GENERATION_FAILURE'; payload: { error: string } }
    | { type: 'INTERPRETATION_SUCCESS'; payload: { interpretation: ReadingState['interpretation'] } }
    | { type: 'INTERPRETATION_FAILURE'; payload: { error: string } }
    | { type: 'RETRY_IMAGE_GENERATION' }
    | { type: 'RETRY_INTERPRETATION' }
    | { type: 'CONTINUE_WITHOUT_ART' }
    | { type: 'RESET' };


// Browser API Extensions (for Speech Recognition)
export interface SpeechRecognitionErrorEvent extends Event {
  readonly error: 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported';
  readonly message: string;
}

export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly confidence: number;
  readonly transcript: string;
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: any; // SpeechGrammarList is a complex type, 'any' is acceptable here for simplicity
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  abort(): void;
  start(): void;
  stop(): void;
}