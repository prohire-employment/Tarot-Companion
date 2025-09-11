import React, { useState, useRef } from 'react';
import { useUiStore } from '../../store/uiStore';
import { useModalFocus } from '../../hooks/useModalFocus';
import { HomeIcon, JournalIcon, CalendarIcon } from '../icons/NavIcons';

// Simple "new reading" icon
const NewReadingIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const tutorialSteps = [
  {
    icon: () => <div className="text-4xl">✨</div>,
    title: "Welcome to Tarot Companion",
    text: "Your personal guide to the world of Tarot. Let's take a quick look at the key features to get you started on your journey."
  },
  {
    icon: HomeIcon,
    title: "The Home Screen",
    text: "This is your sacred space. Each day, you can perform a 'Card of the Day' draw for quick insight, or start a 'New Reading' for a deeper inquiry."
  },
  {
    icon: NewReadingIcon,
    title: "Custom Readings",
    text: "Choose from various spreads, set your intention, and draw cards digitally, manually, or even by identifying cards from your physical deck using your camera."
  },
  {
    icon: JournalIcon,
    title: "Your Personal Journal",
    text: "Every reading can be saved here. Add your personal impressions and tags to build a rich history of your spiritual journey, which you can search and filter."
  },
  {
    icon: CalendarIcon,
    title: "Calendar View",
    text: "Visualize your reading history at a glance. The calendar also displays lunar phases and seasonal holidays (Sabbats) to add context to your readings."
  },
  {
    icon: () => <div className="text-4xl">💖</div>,
    title: "You're All Set!",
    text: "Explore, reflect, and let the cards guide you. Your journey begins now. Happy reading!"
  }
];

const OnboardingTutorial: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { hasSeenTutorial, setHasSeenTutorial } = useUiStore();
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setHasSeenTutorial(true);
  };

  useModalFocus({ isOpen: !hasSeenTutorial, onClose: handleClose, modalRef });

  if (hasSeenTutorial) {
    return null;
  }

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  const goToNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const goToPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <div
        ref={modalRef}
        className="bg-surface rounded-card shadow-main p-8 card-border max-w-md w-full text-center font-serif flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6 text-accent">
          <Icon className="w-8 h-8" />
        </div>
        
        <h2 id="tutorial-title" className="text-2xl font-bold text-accent mb-4">
          {step.title}
        </h2>

        <p className="text-sub mb-8 min-h-[96px] flex items-center">{step.text}</p>

        <div className="flex items-center justify-center gap-2 mb-6">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-accent' : 'bg-border'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-4 w-full font-sans">
          {currentStep > 0 && (
            <button
              onClick={goToPrev}
              className="bg-border text-text font-bold py-2 px-4 rounded-ui flex-1 hover:bg-border/70 transition-colors"
            >
              Previous
            </button>
          )}

          <button
            onClick={goToNext}
            className="bg-accent text-accent-dark font-bold py-2 px-4 rounded-ui flex-1 hover:opacity-90 transition-opacity"
          >
            {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
        
         {currentStep < tutorialSteps.length - 1 && (
            <button onClick={handleClose} className="text-xs text-sub mt-6 underline hover:text-text">
                Skip Tutorial
            </button>
         )}
      </div>
    </div>
  );
};

export default OnboardingTutorial;