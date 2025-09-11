import { useEffect } from 'react';
import { useJournalStore } from '../store/journalStore';
import { useSettingsStore } from '../store/settingsStore';
import { useUiStore } from '../store/uiStore';
import { getLocalISO_Date } from '../lib/utils';

export const useNotificationScheduler = () => {
  const { entries } = useJournalStore();
  const { settings } = useSettingsStore();
  const { showToast } = useUiStore();

  useEffect(() => {
    // Exit if notifications are disabled or not supported by the browser.
    if (!settings.notificationsEnabled || !('Notification' in window)) {
      return;
    }

    // A key to track the last day we triggered a reminder check, to avoid spamming.
    const LS_LAST_CHECK_KEY = 'tc.lastNotificationCheckISO';

    const showReminderNotification = () => {
        const message = 'The cards await. Time for your daily Tarot Companion reading.';
        if (Notification.permission === 'granted') {
            // Standard browser notification.
            new Notification('Tarot Companion', { body: message, icon: '/public/favicon.svg' });
        } else {
            // Fallback for edge cases (e.g., OS-level blocks) by showing an in-app toast.
            showToast(message);
        }
    };
    
    // This function runs once per day to check if a reminder should be shown.
    const performDailyCheck = () => {
        const todayISO = getLocalISO_Date(new Date());
        const hasDrawnDaily = entries.some(e => e.dateISO === todayISO && e.spread.id === 'single-card');

        if (!hasDrawnDaily) {
            showReminderNotification();
        }
        
        // Mark today as checked to prevent re-triggering.
        localStorage.setItem(LS_LAST_CHECK_KEY, todayISO);
    };

    // --- Main Scheduling Logic ---

    let scheduledTimeoutId: number;

    const scheduleNextCheck = () => {
        // Clear any previously scheduled check to prevent duplicates from re-renders.
        if (scheduledTimeoutId) clearTimeout(scheduledTimeoutId);

        // 1. Check for missed reminders since the app was last opened.
        // This handles the case where the reminder time passed while the app was closed.
        const todayISO = getLocalISO_Date(new Date());
        const lastCheckISO = localStorage.getItem(LS_LAST_CHECK_KEY);
        
        if (lastCheckISO !== todayISO) {
             const [hours, minutes] = settings.reminderTime.split(':').map(Number);
             const now = new Date();
             const reminderTimeToday = new Date();
             reminderTimeToday.setHours(hours, minutes, 0, 0);

             // If the reminder time has already passed today, perform the check immediately.
             if (now >= reminderTimeToday) {
                 performDailyCheck();
             }
        }
        
        // 2. Schedule the next reminder for the correct upcoming time.
        // This handles cases where the app is open or the reminder is in the future.
        const [hours, minutes] = settings.reminderTime.split(':').map(Number);
        const now = new Date();
        
        let nextReminderDate = new Date();
        nextReminderDate.setHours(hours, minutes, 0, 0);

        // If the reminder time for today has already passed, schedule it for tomorrow.
        if (nextReminderDate <= now) {
            nextReminderDate.setDate(nextReminderDate.getDate() + 1);
        }
      
        const msUntilNextReminder = nextReminderDate.getTime() - now.getTime();
      
        scheduledTimeoutId = window.setTimeout(() => {
            performDailyCheck();
            // After the check runs, schedule the next one for the following day.
            scheduleNextCheck();
        }, msUntilNextReminder);
    };

    // Only run scheduling logic if permission has been granted.
    // The permission is requested in SettingsView when the user enables notifications.
    if (Notification.permission === 'granted') {
        scheduleNextCheck();
    }

    // Cleanup function to clear the timeout when the component unmounts
    // or when the dependencies change, preventing memory leaks and duplicate timers.
    return () => clearTimeout(scheduledTimeoutId);

  }, [settings.notificationsEnabled, settings.reminderTime, entries, showToast]);
};
