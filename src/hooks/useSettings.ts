import { useState, useCallback } from 'react';
import { type TimerSettings } from '../types';

const DEFAULT_SETTINGS_MINUTES: TimerSettings = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
};

/**
 * Manages timer settings in minutes (the user-facing unit)
 * and provides a seconds conversion for the timer engine.
 * Also owns the settings modal visibility state.
 */
export const useSettings = () => {
  const [settingsInMinutes, setSettingsInMinutes] =
    useState<TimerSettings>(DEFAULT_SETTINGS_MINUTES);
  const [showSettings, setShowSettings] = useState(false);

  const settingsInSeconds: TimerSettings = {
    work: settingsInMinutes.work * 60,
    shortBreak: settingsInMinutes.shortBreak * 60,
    longBreak: settingsInMinutes.longBreak * 60,
  };

  const updateSettings = useCallback((newSettingsInMinutes: TimerSettings) => {
    setSettingsInMinutes(newSettingsInMinutes);
  }, []);

  const openSettings = useCallback(() => setShowSettings(true), []);
  const closeSettings = useCallback(() => setShowSettings(false), []);

  return {
    settingsInMinutes,
    settingsInSeconds,
    showSettings,
    updateSettings,
    openSettings,
    closeSettings,
  };
};
