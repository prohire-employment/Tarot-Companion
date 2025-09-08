import { useState, useEffect } from 'react';

/**
 * Tracks whether the user has scrolled past a certain threshold on the page.
 * @param threshold The scroll position (in pixels) to check against. Defaults to 10.
 * @returns A boolean indicating if the user has scrolled past the threshold.
 */
export const useScrollPosition = (threshold: number = 10) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > threshold) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
};
