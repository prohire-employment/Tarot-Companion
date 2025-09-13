import React, { useState, memo } from 'react';
import type { DrawnCard, Spread, InterpretationLayer } from '../../types';
import TagInput from './TagInput';

interface ReadingResultProps {
  drawnCards: DrawnCard[];
  interpretation: {
    overall: InterpretationLayer;
    cards: (InterpretationLayer & {cardName: string})[];
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

const InterpretationTabs: React.FC<{ interpretation: InterpretationLayer }> = ({ interpretation }) => {
  const [activeTab, setActiveTab] = useState<'outer' | 'inner' | 'whispers'>('outer');
  
  const tabs = [
    { id: 'outer', label: 'Outer', content: interpretation.outer, description: "Practical, real-world guidance." },
    { id: 'inner', label: 'Inner', content: interpretation.inner, description: "Psychological & emotional landscape." },
    { id: 'whispers', label: 'Whispers', content: interpretation.whispers, description: "Spiritual lesson & intuitive message." },
  ];
  
  const activeTabContent = tabs.find(t => t.id === activeTab)?.content;

  return (
    <div className="font-sans">
      <div className="border-b border-border/50 mb-3" role="tablist" aria-orientation="horizontal">
        {tabs.map(tab => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 -mb-px text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-t-md ${activeTab === tab.id ? 'text-accent border-b-2 border-accent' : 'text-sub hover:text-text'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-1 min-h-[60px]">
          <div 
            id={`tabpanel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="text-text whitespace-pre-wrap animate-fade-in text-sm"
          >
            {activeTabContent}
          </div>
      </div>
    </div>
  );
};


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

  const handleSaveClick = () => {
    onSave(impression.trim(), tags);
  };
  
  return (
    <div className="space-y-8 animate-fade-in font-serif">
      <section className="text-center">
        <h2 className="text-3xl font-bold text-accent">{spread.name}</h2>
        {question && <p className="text-lg text-sub mt-2 italic">For: "{question}"</p>}
      </section>

      {view === 'journal' ? (
        <section className="space-y-6 bg-surface/70 backdrop-blur-lg rounded-card shadow-main p-6 card-border animate-fade-in">
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
              <button 
                onClick={handleSaveClick} 
                className="flex-1 bg-accent text-accent-dark font-bold py-3 px-4 rounded-ui text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-glow transform transition-all duration-300 hover:scale-105 active:scale-100"
              >
                <BookmarkIcon className="w-5 h-5" />
                Save
              </button>
          </div>
        </section>
      ) : (
        <section className="bg-surface/70 backdrop-blur-lg rounded-card shadow-main p-6 card-border flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
            <p className="text-sub text-center sm:text-left flex-grow">Happy with this reading? Save it to your journal to reflect on it later.</p>
            <button onClick={() => setView('journal')} className="w-full sm:w-auto bg-accent text-accent-dark font-bold py-3 px-6 rounded-ui text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-glow hover:scale-105 transform transition-all duration-300">
              <BookmarkIcon className="w-5 h-5" />
              Save to Journal
            </button>
        </section>
      )}

      <div className="space-y-8">
        <section className="bg-surface/70 backdrop-blur-lg rounded-card shadow-main p-6 card-border">
            <h3 className="text-xl font-bold text-accent mb-2">Overall Message</h3>
            <InterpretationTabs interpretation={interpretation.overall} />
        </section>

        <section>
            <h3 className="text-xl font-bold text-accent mb-4 text-center">Cards Drawn</h3>
            <div className="space-y-6">
            {drawnCards.map((drawnCard, index) => {
                const cardInterpretation = interpretation.cards.find(ci => ci.cardName === drawnCard.card.name);
                if (!cardInterpretation) return null;
                return (
                <div key={drawnCard.card.id} className="md:flex gap-6 p-4 bg-surface/70 backdrop-blur-lg rounded-card shadow-main card-border">
                    <div className="flex-shrink-0 md:w-40 mx-auto mb-4 md:mb-0">
                    <img src={drawnCard.imageUrl || drawnCard.card.imageUrl} alt={drawnCard.card.name} className={`w-full h-auto rounded-lg shadow-lg ${drawnCard.isReversed ? 'transform rotate-180' : ''}`} />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-lg font-bold text-accent">{spread.positions[index].title}: {drawnCard.card.name} {drawnCard.isReversed && '(Reversed)'}</h4>
                      <p className="text-sub text-sm italic mb-2">{drawnCard.isReversed ? drawnCard.card.reversedKeywords.join(', ') : drawnCard.card.uprightKeywords.join(', ')}</p>
                      <InterpretationTabs interpretation={cardInterpretation} />
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

export default memo(ReadingResult);