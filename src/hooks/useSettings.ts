import { useState } from 'react';
import { type TimerSettings } from '../types';
import { minutesToSeconds } from '../utils/timeHelpers';

const DEFAULT_SETTINGS: TimerSettings = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

/**
 * Owns the timer settings (stored canonically in seconds) and the open/close
 * state of the settings modal.
 *
 * This hook is the single place responsible for *saving* settings: callers hand
 * it the values the user typed (minutes) and it stores the canonical seconds.
 * The timer (usePomodoro) reacts to the resulting `settings` change on its own,
 * so this hook never needs to know the timer exists.
 */
export const useSettings = () => {
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [isOpen, setIsOpen] = useState(false);

  const openSettings = () => setIsOpen(true);
  const closeSettings = () => setIsOpen(false);

  const saveSettings = (settingsInMinutes: TimerSettings) => {
    setSettings(minutesToSeconds(settingsInMinutes));
    setIsOpen(false);
  };

  return {
    settings,
    isOpen,
    openSettings,
    closeSettings,
    saveSettings,
  };
};
