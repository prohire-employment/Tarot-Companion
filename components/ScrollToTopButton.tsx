

import React from 'react';
import { useScrollPosition } from '../hooks/useScrollPosition';

export const ScrollToTopButton: React.FC = () => {
  const isScrolled = useScrollPosition(200); // Show button after scrolling 200px

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed bottom-24 right-4 z-20 w-12 h-12 bg-accent text-accent-dark rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-soft ${
        isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    </button>
  );
};