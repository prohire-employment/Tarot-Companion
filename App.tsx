import React, { useEffect } from 'react';
import { useUiStore } from './store/uiStore';
import type { View } from './types';
import HomeView from './components/views/HomeView';
import JournalView from './components/views/JournalView';
import CalendarView from './components/views/CalendarView';
import SettingsView from './components/views/SettingsView';
import LibraryView from './components/views/LibraryView';
import AboutView from './components/views/AboutView';
import { Toast } from './components/Toast';
import { HomeIcon, JournalIcon, CalendarIcon, SettingsIcon, LibraryIcon } from './components/icons/NavIcons';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { useHashRouter } from './hooks/useHashRouter';
import ErrorBoundary from './components/ErrorBoundary';
import { useDeckStore } from './store/deckStore';
import { useAlmanac } from './hooks/useAlmanac';
import { LunarPhaseIcon } from './components/icons/AlmanacIcons';
import { useNotificationScheduler } from './hooks/useNotificationScheduler';
import OnboardingTutorial from './components/onboarding/OnboardingTutorial';

const App: React.FC = () => {
  const { activeView, hideToast, toastMessage } = useUiStore();
  const loadDeck = useDeckStore(state => state.loadDeck);
  const almanac = useAlmanac();

  // Initialize and manage routing
  useHashRouter();

  // Initialize notification scheduling
  useNotificationScheduler();

  // Centralized data loading on app start
  useEffect(() => {
    loadDeck();
  }, [loadDeck]);

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <HomeView />;
      case 'journal':
        return <JournalView />;
      case 'calendar':
        return <CalendarView />;
      case 'library':
        return <LibraryView />;
      case 'settings':
        return <SettingsView />;
      case 'about':
        return <AboutView />;
      default:
        return <HomeView />;
    }
  };

  const navItems = [
    { view: 'home', label: 'Home', icon: HomeIcon },
    { view: 'journal', label: 'Journal', icon: JournalIcon },
    { view: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { view: 'library', label: 'Library', icon: LibraryIcon },
    { view: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const scrollableViews: View[] = ['journal', 'library'];

  return (
    <div className="flex flex-col min-h-screen relative">
      <header className="bg-surface/70 backdrop-blur-lg border-b border-border sticky top-0 z-10 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-serif font-bold text-accent tracking-wider">Tarot Companion</h1>
          <div className="flex items-center gap-2 text-sub text-sm font-sans" title={`Current lunar phase: ${almanac.lunarPhase}`}>
            <LunarPhaseIcon phase={almanac.lunarPhase} className="w-5 h-5" />
            <span className="hidden sm:inline">{almanac.lunarPhase}</span>
          </div>
        </div>
      </header>
      
      <main className="flex-grow p-4 md:p-6 max-w-4xl mx-auto w-full">
        <ErrorBoundary>
          <div key={activeView} className="animate-fade-in">
            {renderView()}
          </div>
        </ErrorBoundary>
      </main>

      <nav className="bg-surface/70 backdrop-blur-lg border-t border-border sticky bottom-0 z-10 p-2">
        <div className="max-w-4xl mx-auto flex justify-around">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.view;
            return (
              <a
                key={item.view}
                href={`#${item.view}`}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-ui w-24 h-16 transition-all duration-300 ease-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                  isActive ? 'bg-accent/10 text-accent scale-105' : 'text-sub hover:bg-border/50 hover:text-text'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </a>
            )
          })}
        </div>
      </nav>

      {scrollableViews.includes(activeView) && <ScrollToTopButton />}

      <Toast message={toastMessage} onClose={hideToast} />
      
      <OnboardingTutorial />
    </div>
  );
};

export default App;