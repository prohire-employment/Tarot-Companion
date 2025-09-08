export type Arcana = 'Major' | 'Minor';
export type Suit = 'Wands' | 'Cups' | 'Swords' | 'Pentacles' | 'None';

export interface TarotCard {
  id: string;
  name: string;
  arcana: Arcana;
  suit: Suit;
  uprightKeywords: string[];
  reversedKeywords: string[];
  imageUrl?: string;
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
  reversed: boolean;
  position: string; // e.g., 'Past', 'Present', 'The Situation'
}

export interface AlmanacInfo {
  lunarPhase: string;
  season: string;
  holiday: string | null;
}

export interface Interpretation {
  outer: string;
  inner: string;
  whispers: string[];
}

export interface JournalEntry {
  id: string;
  dateISO: string;
  question?: string;
  drawnCards: DrawnCard[];
  impression: string;
  interpretation: Interpretation;
  almanac: AlmanacInfo;
  createdAt: string;
  tags?: string[];
}

export interface AppSettings {
  reminderTime: string;
  notificationsEnabled: boolean;
  deckType: 'full' | 'major' | 'minor';
  includeReversals: boolean;
}

export type View = 'home' | 'journal' | 'calendar' | 'settings';

export type ManualCardState = {
  cardId: string;
  reversed: boolean;
};

// Web Speech API types for browsers that support it
export interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: any; // SpeechGrammarList is complex, 'any' is fine for now
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  abort(): void;
  start(): void;
  stop(): void;
}

export interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}
