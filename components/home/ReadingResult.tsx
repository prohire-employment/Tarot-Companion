import React, { useState } from 'react';
import type { DrawnCard, Spread } from '../../types';
import TagInput from './TagInput';
import { useSound } from '../../hooks/useSound';

interface ReadingResultProps {
  drawnCards: DrawnCard[];
  interpretation: {
    overall: string;
    cards: { cardName: string, meaning: string }[];
  };
  spread: Spread;
  question: string;
  onSave: (impression: string, tags: string[]) => void;
  onReset: () => void;
}

const BookmarkIcon: React.FC<{ className?: string }> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.082l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
    </svg>
);

const ReadingResult: React.FC<ReadingResultProps> = ({
  drawnCards,
  interpretation,
  spread,
  question,
  onSave,
  onReset,
}) => {
  const [impression, setImpression] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [view, setView] = useState<'interpretation' | 'journal'>('interpretation');
  const { playSound } = useSound();

  const handleSaveClick = () => {
    playSound('save');
    onSave(impression.trim(), tags);
  };
  
  return (
    <div className="space-y-8 animate-fade-in font-serif">
      <section className="text-center">
        <h2 className="text-3xl font-bold text-accent">{spread.name}</h2>
        {question && <p className="text-lg text-sub mt-2 italic">For: "{question}"</p>}
      </section>

      {view === 'journal' ? (
        <section className="space-y-6 bg-surface/80 rounded-card shadow-main p-6 card-border animate-fade-in">
          <h2 className="text-2xl font-bold text-accent text-center">Save to Journal</h2>
          <p className="text-sub text-center max-w-lg mx-auto">Add your personal reflections to this reading before saving it for future reference.</p>
          
          <div className="space-y-4 font-sans max-w-lg mx-auto">
              <div>
                  <label htmlFor="impression" className="font-bold text-accent text-lg block mb-2 font-serif">Your Impression</label>
                  <textarea
                      id="impression"
                      value={impression}
                      onChange={e => setImpression(e.target.value)}
                      placeholder="How does this reading feel to you? What does it bring to mind?"
                      rows={4}
                      className="w-full bg-bg/50 border border-border rounded-ui p-3 text-text placeholder-sub/70 focus:ring-2 focus:ring-accent"
                      autoFocus
                  />
              </div>
              <TagInput tags={tags} setTags={setTags} />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-6 font-sans max-w-lg mx-auto">
              <button onClick={() => setView('interpretation')} className="flex-1 bg-border text-text font-bold py-2 px-4 rounded-ui hover:bg-border/70 transition-colors">
                Back
              </button>
              <button onClick={handleSaveClick} className="flex-1 bg-accent text-accent-dark font-bold py-3 px-4 rounded-ui text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-glow transform transition-all duration-300">
                <BookmarkIcon className="w-5 h-5" />
                Save Reading
              </button>
          </div>
        </section>
      ) : (
        <section className="bg-surface/80 rounded-card shadow-main p-6 card-border flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
            <p className="text-sub text-center sm:text-left flex-grow">Happy with this reading? Save it to your journal to reflect on it later.</p>
            <button onClick={() => setView('journal')} className="w-full sm:w-auto bg-accent text-accent-dark font-bold py-3 px-6 rounded-ui text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-glow hover:scale-105 transform transition-all duration-300">
              <BookmarkIcon className="w-5 h-5" />
              Save to Journal
            </button>
        </section>
      )}

      <div className="space-y-8">
        <section className="bg-surface rounded-card shadow-main p-6 card-border">
            <h3 className="text-xl font-bold text-accent mb-4">Overall Message</h3>
            <p className="text-text whitespace-pre-wrap">{interpretation.overall}</p>
        </section>

        <section>
            <h3 className="text-xl font-bold text-accent mb-4 text-center">Cards Drawn</h3>
            <div className="space-y-6">
            {drawnCards.map((drawnCard, index) => {
                const cardInterpretation = interpretation.cards.find(ci => ci.cardName === drawnCard.card.name);
                return (
                <div key={drawnCard.card.id} className="md:flex gap-6 p-4 bg-surface rounded-card shadow-main card-border">
                    <div className="flex-shrink-0 md:w-40 mx-auto mb-4 md:mb-0">
                    <img src={drawnCard.imageUrl || drawnCard.card.imageUrl} alt={drawnCard.card.name} className={`w-full h-auto rounded-lg shadow-lg ${drawnCard.isReversed ? 'transform rotate-180' : ''}`} />
                    </div>
                    <div className="flex-grow">
                    <h4 className="text-lg font-bold text-accent">{spread.positions[index].title}: {drawnCard.card.name} {drawnCard.isReversed && '(Reversed)'}</h4>
                    <p className="text-sub text-sm italic mb-2">{drawnCard.isReversed ? drawnCard.card.reversedKeywords.join(', ') : drawnCard.card.uprightKeywords.join(', ')}</p>
                    <p className="text-text whitespace-pre-wrap">{cardInterpretation?.meaning}</p>
                    </div>
                </div>
                );
            })}
            </div>
        </section>
      </div>
      
      <section className="text-center pt-4 border-t border-border">
          <button onClick={onReset} className="font-sans text-sub underline hover:text-text transition-colors">
              Discard & Start a New Reading
          </button>
      </section>
    </div>
  );
};

export default ReadingResult;