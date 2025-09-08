import React, { useEffect, useCallback } from 'react';
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

const App: React.FC = () => {
  const { entries } = useJournalStore();
  const { settings } = useSettingsStore();
  const { activeView, setActiveView, toastMessage, showToast, hideToast } = useUiStore();

  const scheduleReminder = useCallback(() => {
    if (!settings.notificationsEnabled || !('Notification' in window)) return;

    const [hh, mm] = settings.reminderTime.split(':').map(Number);
    
    const checkTime = () => {
      const now = new Date();
      if (now.getHours() === hh && now.getMinutes() === mm) {
        const hasDrawnToday = entries.some(e => e.dateISO === now.toISOString().slice(0, 10));
        if (!hasDrawnToday) {
          const msg = 'The cards await. Time for your daily Tarot Companion reading.';
          if (Notification.permission === 'granted') {
            new Notification('Tarot Companion', { body: msg, icon: '/public/favicon.svg' });
          } else {
            showToast(msg);
          }
        }
      }
    };
    
    const intervalId = setInterval(checkTime, 60000);
    return () => clearInterval(intervalId);
  }, [settings.notificationsEnabled, settings.reminderTime, entries, showToast]);

  useEffect(() => {
    const clearSchedule = scheduleReminder();
    return clearSchedule;
  }, [scheduleReminder]);

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

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-surface/70 backdrop-blur-lg border-b border-border sticky top-0 z-10 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-serif font-bold text-accent tracking-wider">Tarot Companion</h1>
        </div>
      </header>
      
      <main className="flex-grow p-4 md:p-6 max-w-4xl mx-auto w-full">
        <div key={activeView} className="animate-fade-in">
          {renderView()}
        </div>
      </main>

      <nav className="bg-surface/70 backdrop-blur-lg border-t border-border sticky bottom-0 z-10 p-2">
        <div className="max-w-4xl mx-auto flex justify-around">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view as View)}
                aria-pressed={isActive}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-ui w-24 h-16 transition-all duration-300 ease-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                  isActive ? 'bg-accent/10 text-accent scale-105' : 'text-sub hover:bg-border/50 hover:text-text'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <Toast message={toastMessage} onClose={hideToast} />
    </div>
  );
};

export default App;