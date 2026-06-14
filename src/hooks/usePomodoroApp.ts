import { useEffect } from 'react';
import { formatTime } from '../utils/timeHelpers';
import { type TimerSettings } from '../types';

import { useAudio } from './useAudio';
import { useSettings } from './useSettings';
import { usePomodoro } from './usePomodoro';

const MODE_LABELS = {
  work: 'Work',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
} as const;

/**
 * Orchestrator hook: wires audio, settings, pomodoro timer, and document title
 * into a single interface for the App component.
 *
 * App.tsx only needs to call this hook and render UI — all cross-cutting
 * coordination lives here.
 */
export const usePomodoroApp = () => {
  // --- Audio ---
  const { audioRef, alertSound, playAlert, primeAudio } = useAudio();

  // --- Settings (minutes = source of truth) ---
  const {
    settingsInMinutes,
    settingsInSeconds,
    showSettings,
    updateSettings,
    openSettings,
    closeSettings,
  } = useSettings();

  // --- Pomodoro timer engine ---
  // usePomodoro has an internal effect that syncs actualTime whenever
  // settingsInSeconds[actualMode] changes while the timer is paused,
  // so no manual "updateTimeFromSettings" call is needed.
  const {
    actualTime,
    isRunning,
    actualMode,
    sessionCount,
    toggleTimer,
    resetTimer,
    changeMode,
  } = usePomodoro(settingsInSeconds, playAlert);

  // --- Handlers ---

  const handleStartStop = () => {
    primeAudio();
    toggleTimer();
  };

  const handleSaveSettings = (newSettingsInMinutes: TimerSettings) => {
    updateSettings(newSettingsInMinutes);
    closeSettings();
  };

  // --- Document title ---
  useEffect(() => {
    const timeString = formatTime(actualTime);
    document.title = isRunning
      ? `${timeString} - ${MODE_LABELS[actualMode]}`
      : 'MelloFocus';
  }, [actualTime, actualMode, isRunning]);

  return {
    // Timer state
    actualTime,
    isRunning,
    actualMode,
    sessionCount,

    // Actions
    handleStartStop,
    resetTimer,
    changeMode,

    // Settings
    settingsInMinutes,
    showSettings,
    openSettings,
    handleSaveSettings,
    closeSettings,

    // Audio
    audioRef,
    alertSound,
  };
};
