import React, { useEffect } from 'react';
import { useJournalStore } from './store/journalStore';
import { useSettingsStore } from './store/settingsStore';
import { useUiStore } from './store/uiStore';
import type { View } from './types';
import HomeView from './components/views/HomeView';
import JournalView from './components/views/JournalView';
import CalendarView from './components/views/CalendarView';
import SettingsView from './components/views/SettingsView';
import LibraryView from './components/views/LibraryView';
import Toast from './components/Toast';
import { HomeIcon, JournalIcon, CalendarIcon, SettingsIcon, LibraryIcon } from './components/icons/NavIcons';
import ScrollToTopButton from './components/ScrollToTopButton';
import { getLocalISO_Date } from './lib/utils';
import { useHashRouter } from './hooks/useHashRouter';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  const { entries } = useJournalStore();
  const { settings } = useSettingsStore();
  const { activeView, toastMessage, showToast, hideToast } = useUiStore();

  // Initialize and manage routing
  useHashRouter();

  useEffect(() => {
    if (!settings.notificationsEnabled || !('Notification' in window)) {
      return;
    }

    let timeoutId: number;

    const scheduleNextReminder = () => {
      const [hh, mm] = settings.reminderTime.split(':').map(Number);
      const now = new Date();
      
      let reminderDate = new Date();
      reminderDate.setHours(hh, mm, 0, 0);

      if (reminderDate <= now) {
        // If time has already passed for today, schedule for tomorrow
        reminderDate.setDate(reminderDate.getDate() + 1);
      }
      
      const msToReminder = reminderDate.getTime() - now.getTime();
      
      timeoutId = window.setTimeout(() => {
        const todayISO = getLocalISO_Date();
        const hasDrawnToday = entries.some(e => e.dateISO === todayISO);

        if (!hasDrawnToday) {
            const msg = 'The cards await. Time for your daily Tarot Companion reading.';
            if (Notification.permission === 'granted') {
                new Notification('Tarot Companion', { body: msg, icon: '/public/favicon.svg' });
            } else {
                showToast(msg);
            }
        }
        
        // Schedule the next reminder
        scheduleNextReminder();
      }, msToReminder);
    };

    scheduleNextReminder();

    return () => clearTimeout(timeoutId);
  }, [settings.notificationsEnabled, settings.reminderTime, entries, showToast]);


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
    </div>
  );
};

export default App;
