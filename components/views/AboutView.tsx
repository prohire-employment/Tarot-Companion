
import React from 'react';
import { APP_VERSION, REPO_URL } from '../../constants';

const ExternalLinkIcon: React.FC<{ className?: string }> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5M15 3.75l6 6m0 0v-4.5m0 4.5h-4.5" />
  </svg>
);

const AboutView: React.FC = () => {
  return (
    <div className="space-y-8 font-serif animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-accent">About Tarot Companion</h2>
        <a href="#settings" className="font-sans text-sub underline hover:text-text transition-colors mt-2 inline-block">
          &larr; Back to Settings
        </a>
      </div>

      <section className="bg-surface/70 backdrop-blur-lg rounded-card shadow-main p-6 card-border space-y-6">
        <div>
          <h3 className="text-xl font-bold text-accent mb-2">The App</h3>
          <p className="text-sub font-sans leading-relaxed">
            A calm, sacred, journal-like app for daily Tarot. It logs your card draws, offers AI-powered layered meanings, and adapts to the current lunar phase, season, and Wiccan/occult holidays. All your data is stored locally in your browser, ensuring complete privacy.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-accent mb-2">The Deck</h3>
          <p className="text-sub font-sans leading-relaxed">
            The card names, meanings, and structure are based on the traditional Rider-Waite-Smith Tarot deck, first published in 1909. This foundational deck is widely used and provides a rich symbolic language for interpretation. The card art within the app is a mix of default symbolic placeholders and unique, AI-generated art created as you perform readings.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-accent mb-2">Resources & Credits</h3>
          <div className="font-sans space-y-3">
            <p className="text-sub">
              <strong>Version:</strong> {APP_VERSION}
            </p>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-accent underline hover:text-accent/80">
              GitHub Repository <ExternalLinkIcon className="w-4 h-4" />
            </a>
             <a href={`${REPO_URL}#data-privacy`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-accent underline hover:text-accent/80">
              Privacy Policy <ExternalLinkIcon className="w-4 h-4" />
            </a>
          </div>
        </div>

      </section>
    </div>
  );
};

export default AboutView;
