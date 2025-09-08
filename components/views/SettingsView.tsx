import React, { useRef, useState, useEffect } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { useJournalStore } from '../../store/journalStore';
import { useUiStore } from '../../store/uiStore';
import type { AppSettings, JournalEntry, Spread } from '../../types';
import ConfirmModal from '../ConfirmModal';
import { useSpreadStore } from '../../store/spreadStore';
import SpreadEditorModal from '../settings/SpreadEditorModal';
import { MAX_CUSTOM_SPREADS } from '../../constants';

const SettingsView: React.FC = () => {
  const { settings, setSettings } = useSettingsStore();
  const { entries, setEntries } = useJournalStore();
  const { customSpreads, deleteSpread } = useSpreadStore();
  const { showToast } = useUiStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const fileToImport = useRef<File | null>(null);

  // State for spread management
  const [isSpreadModalOpen, setIsSpreadModalOpen] = useState(false);
  const [spreadToEdit, setSpreadToEdit] = useState<Spread | undefined>(undefined);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [spreadToDeleteId, setSpreadToDeleteId] = useState<string | null>(null);
  const [showSpreadLimitError, setShowSpreadLimitError] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handlePreferencesSave = () => {
    setSettings(prev => ({
      ...prev,
      includeReversals: localSettings.includeReversals,
    }));
    showToast('Reading preferences saved!');
  };

  const handleRemindersSave = async () => {
    if (localSettings.notificationsEnabled && 'Notification' in window && Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        showToast('Notifications permission not granted.');
        const updatedSettings = { ...localSettings, notificationsEnabled: false };
        setLocalSettings(updatedSettings);
        setSettings(updatedSettings);
      } else {
        setSettings(localSettings);
        showToast('Notifications enabled!');
      }
    } else {
       setSettings(localSettings);
       showToast('Reminder settings saved.');
    }
  };

  const handleExport = () => {
    if (entries.length === 0) {
      showToast('Journal is empty, nothing to export.');
      return;
    }
    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().slice(0, 10);
    link.download = `tarot-companion-backup-${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Journal exported successfully.');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      fileToImport.current = file;
      setIsConfirmOpen(true);
    }
    event.target.value = ''; // Reset file input
  };

  const proceedWithImport = () => {
    if (!fileToImport.current) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File could not be read");
        const importedEntries = JSON.parse(text);
        if (Array.isArray(importedEntries)) {
          // A simple validation for the first entry
          const firstEntry = importedEntries[0] as JournalEntry;
          if (firstEntry && firstEntry.id && firstEntry.dateISO && firstEntry.drawnCards) {
             setEntries(importedEntries);
             showToast(`Successfully imported ${importedEntries.length} entries.`);
          } else {
            throw new Error("File does not appear to be a valid journal backup.");
          }
        } else {
          throw new Error("Invalid journal file format.");
        }
      } catch (error) {
        showToast(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    };
    reader.readAsText(fileToImport.current);
    setIsConfirmOpen(false);
    fileToImport.current = null;
  };

  const handleOpenSpreadModal = (spread?: Spread) => {
    setSpreadToEdit(spread);
    setIsSpreadModalOpen(true);
  };

  const handleDeleteClick = (spreadId: string) => {
    setSpreadToDeleteId(spreadId);
    setIsDeleteConfirmOpen(true);
  };
  
  const proceedWithDelete = () => {
    if (spreadToDeleteId) {
      deleteSpread(spreadToDeleteId);
      showToast('Custom spread deleted.');
    }
    setSpreadToDeleteId(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleCreateNewSpread = () => {
    if (customSpreads.length >= MAX_CUSTOM_SPREADS) {
      setShowSpreadLimitError(true);
    } else {
      handleOpenSpreadModal();
    }
  };

  return (
    <>
    <div className="space-y-8 font-serif">
      <h2 className="text-3xl font-bold text-accent text-center">Settings</h2>

      <section className="bg-surface rounded-card shadow-main p-6 card-border">
        <h3 className="text-xl font-bold text-accent mb-4">Reading Preferences</h3>
        <div className="space-y-6 font-sans">
          <div className="flex items-center justify-between">
            <label htmlFor="includeReversals" className="text-text">Include reversed cards</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="includeReversals"
                type="checkbox"
                checked={localSettings.includeReversals}
                onChange={e => setLocalSettings(prev => ({ ...prev, includeReversals: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
           <button onClick={handlePreferencesSave} className="w-full bg-accent text-accent-dark font-bold py-2 px-4 rounded-ui mt-2 hover:opacity-90 transition-opacity">
            Save Preferences
          </button>
        </div>
      </section>

      <section className="bg-surface rounded-card shadow-main p-6 card-border">
        <h3 className="text-xl font-bold text-accent mb-4">Reminders</h3>
        <div className="space-y-4 font-sans">
          <div className="flex items-center justify-between">
            <label htmlFor="reminderTime" className="text-text">Daily reminder time</label>
            <input
              id="reminderTime"
              type="time"
              value={localSettings.reminderTime}
              onChange={e => setLocalSettings(prev => ({ ...prev, reminderTime: e.target.value }))}
              className="bg-bg/50 border border-border rounded-lg p-2 text-text"
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="enableNotifs" className="text-text">Enable notifications</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="enableNotifs"
                type="checkbox"
                checked={localSettings.notificationsEnabled}
                onChange={e => setLocalSettings(prev => ({ ...prev, notificationsEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
          <button onClick={handleRemindersSave} className="w-full bg-accent text-accent-dark font-bold py-2 px-4 rounded-ui mt-4 hover:opacity-90 transition-opacity">
            Save Reminder Settings
          </button>
        </div>
      </section>

      <section className="bg-surface rounded-card shadow-main p-6 card-border">
          <h3 className="text-xl font-bold text-accent mb-4">Custom Spreads</h3>
          <div className="space-y-4 font-sans">
            {customSpreads.length > 0 ? (
              <ul className="space-y-3">
                {customSpreads.map(spread => (
                  <li key={spread.id} className="flex justify-between items-center bg-bg/40 p-3 rounded-lg">
                    <div>
                      <p className="font-bold text-text">{spread.name}</p>
                      <p className="text-sm text-sub">{spread.cardCount} card{spread.cardCount !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenSpreadModal(spread)} className="bg-border px-3 py-1 text-sm rounded-md hover:bg-border/70">Edit</button>
                      <button onClick={() => handleDeleteClick(spread.id)} className="bg-red-900/50 px-3 py-1 text-sm text-red-300 rounded-md hover:bg-red-900/80">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sub text-center italic">You haven't created any custom spreads yet.</p>
            )}

            <button
              onClick={handleCreateNewSpread}
              className="w-full bg-accent text-accent-dark font-bold py-2 px-4 rounded-ui mt-2 hover:opacity-90 transition-opacity"
            >
              Create New Spread
            </button>
            {showSpreadLimitError && (
              <div role="alert" className="bg-accent/10 border border-accent/30 text-accent p-3 rounded-lg text-sm flex justify-between items-center mt-2 animate-fade-in">
                <p>You've reached the limit of {MAX_CUSTOM_SPREADS} spreads. Please delete one to create a new one.</p>
                <button 
                  onClick={() => setShowSpreadLimitError(false)} 
                  className="p-1 rounded-full hover:bg-accent/20"
                  aria-label="Dismiss"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </section>

      <section className="bg-surface rounded-card shadow-main p-6 card-border">
        <h3 className="text-xl font-bold text-accent mb-4">Data Management</h3>
        <div className="space-y-4 font-sans">
          <p className="text-sub text-sm">All your data is stored securely in your browser. You can back it up to a file or import a previous backup.</p>
          <div className="flex gap-4">
            <button onClick={handleExport} className="flex-1 bg-border text-text font-bold py-2 px-4 rounded-ui hover:bg-border/70 transition-colors">
              Export Journal
            </button>
            <button onClick={handleImportClick} className="flex-1 bg-border text-text font-bold py-2 px-4 rounded-ui hover:bg-border/70 transition-colors">
              Import Journal
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="application/json"
              onChange={handleFileSelected}
              className="hidden"
            />
          </div>
        </div>
      </section>
    </div>

    <ConfirmModal
      isOpen={isConfirmOpen}
      onClose={() => setIsConfirmOpen(false)}
      onConfirm={proceedWithImport}
      title="Overwrite Journal?"
    >
      <p>Importing this file will replace all entries in your current journal. This action cannot be undone.</p>
      <p className="mt-2">Are you sure you want to continue?</p>
    </ConfirmModal>

    <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={proceedWithDelete}
        title="Delete Spread?"
      >
        <p>Are you sure you want to delete this custom spread? This action cannot be undone.</p>
      </ConfirmModal>

      <SpreadEditorModal
        isOpen={isSpreadModalOpen}
        onClose={() => setIsSpreadModalOpen(false)}
        spreadToEdit={spreadToEdit}
      />
    </>
  );
};

export default SettingsView;