import { useEffect } from 'react';
import { useUiStore } from '../store/uiStore';
import type { View } from '../types';

const getPathFromHash = (): View => {
  const hash = window.location.hash.slice(1);
  const validViews: View[] = ['home', 'journal', 'calendar', 'library', 'settings'];
  return (validViews.includes(hash as View) ? hash : 'home') as View;
};

/**
 * A hook that syncs the uiStore's activeView with the browser's URL hash.
 * This enables routing, deep-linking, and browser back/forward navigation.
 */
export const useHashRouter = () => {
  const setActiveView = useUiStore((state) => state.setActiveView);

  useEffect(() => {
    const handleHashChange = () => {
      setActiveView(getPathFromHash());
    };

    // Sync on initial mount and on hash change
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [setActiveView]);
};
