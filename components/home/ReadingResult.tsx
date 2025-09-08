import React from 'react';
import type { DrawnCard, Interpretation, Spread } from '../../types';
import Spinner from '../Spinner';
import TagInput from './TagInput';
import CardBack from '../CardBack';

interface ReadingResultProps {
  selectedSpread: Spread;
  drawnCards: DrawnCard[];
  interpretation: Interpretation | null;
  question?: string;
  impression: string;
  setImpression: (imp: string) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  handleSaveEntry: () => void;
  handleNewReading: () => void;
  handleSaveImage: (imageUrl: string, cardName: string) => void;
}

const interpretationLoadingMessages = [
  "Consulting the cosmos...",
  "Weaving the threads of fate...",
  "Translating ancient whispers...",
];

const LoadingInterpretation: React.FC = () => (
  <div className="flex flex-col items-center justify-center gap-6 py-8">
    <Spinner message={interpretationLoadingMessages} />
  </div>
);

const ReadingResult: React.FC<ReadingResultProps> = ({
  selectedSpread,
  drawnCards,
  interpretation,
  question,
  impression,
  setImpression,
  tags,
  setTags,
  handleSaveEntry,
  handleNewReading,
  handleSaveImage
}) => {
  const isLoading = interpretation === null;

  return (
    <section>
      <div className="bg-surface rounded-card shadow-main p-6 space-y-6 card-border animate-fade-in">
        <h2 className="text-3xl font-serif font-bold text-accent mb-2 text-center">{selectedSpread.name} Reading</h2>

        <div className={`grid gap-6 ${drawnCards.length > 1 ? '' : 'justify-items-center'}`} style={{ gridTemplateColumns: drawnCards.length > 1 ? `repeat(auto-fit, minmax(180px, 1fr))` : '1fr' }}>
          {drawnCards.map((dc, i) => (
            <div key={i} className={`text-center space-y-2 flex flex-col items-center opacity-0 animate-flip-in w-full ${drawnCards.length === 1 ? 'max-w-xs' : ''}`} style={{ animationDelay: `${i * 150}ms` }}>
              <h3 className="text-lg font-bold text-accent">{dc.position}</h3>
              {dc.card.imageUrl ? (
                <div className="relative group w-full">
                  <img src={dc.card.imageUrl} alt={`AI generated art for ${dc.card.name}`} className="rounded-card shadow-md w-full animate-fade-in" />
                  <button
                    onClick={() => handleSaveImage(dc.card.imageUrl!, dc.card.name)}
                    className="absolute bottom-2 right-2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="Save Image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </button>
                </div>
              ) : (
                <CardBack />
              )}
              <p className="font-semibold text-text text-lg mt-1">{dc.card.name}</p>
              <p className="text-sm text-sub">{dc.reversed ? '(Reversed)' : '(Upright)'}</p>
            </div>
          ))}
        </div>

        {question && (
          <div className="border-t border-border pt-4">
            <h3 className="font-bold text-accent text-lg">Your Question</h3>
            <p className="italic text-sub">"{question}"</p>
          </div>
        )}

        <div className="border-t border-border pt-4 font-serif">
          {isLoading ? <LoadingInterpretation /> : (
            <div className="space-y-6">
              <div className="opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <h3 className="font-bold text-accent text-lg">Outer</h3>
                <p className="text-text/90 whitespace-pre-wrap">{interpretation?.outer}</p>
              </div>
              <div className="opacity-0 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <h3 className="font-bold text-accent text-lg">Inner</h3>
                <p className="text-text/90 whitespace-pre-wrap">{interpretation?.inner}</p>
              </div>
              <div className="opacity-0 animate-fade-in" style={{ animationDelay: '600ms' }}>
                <h3 className="font-bold text-accent text-lg">Whispers for Reflection</h3>
                <ul className="list-disc list-inside space-y-1 text-text/90">
                  {interpretation?.whispers.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-4 space-y-6">
          <div>
            <label htmlFor="impression" className="font-bold text-accent text-lg block mb-2 font-serif">
              Your Personal Impression
            </label>
            <textarea
              id="impression"
              value={impression}
              onChange={e => setImpression(e.target.value)}
              placeholder="How does this reading feel to you? What thoughts or feelings come up?"
              rows={4}
              className="w-full bg-bg/50 border border-border rounded-ui p-3 text-text placeholder-sub/70 focus:ring-2 focus:ring-accent focus:border-accent transition font-sans"
              disabled={isLoading}
            />
          </div>
          <TagInput tags={tags} setTags={setTags} />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button onClick={handleNewReading} className="flex-1 bg-border text-text font-bold py-3 px-4 rounded-ui hover:bg-border/70 transition-colors">
            New Reading
          </button>
          <button onClick={handleSaveEntry} disabled={isLoading} className="flex-1 bg-accent text-accent-dark font-bold py-3 px-4 rounded-ui hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Interpreting...' : 'Save to Journal'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReadingResult;