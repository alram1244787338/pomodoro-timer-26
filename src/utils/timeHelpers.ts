// src/utils/timeHelpers.ts

import { type TimerSettings } from '../types';

/**
 * Formats a given time in seconds into a MM:SS string.
 * @param {number} timeInSeconds - The time in seconds to format.
 * @returns {string} The formatted time string (e.g., "25:00").
 */
export const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
};

/** Converts every duration in a settings object from seconds to minutes. */
export const settingsToMinutes = (settings: TimerSettings): TimerSettings => ({
  work: settings.work / 60,
  shortBreak: settings.shortBreak / 60,
  longBreak: settings.longBreak / 60,
});

/** Converts every duration in a settings object from minutes to seconds. */
export const settingsToSeconds = (settings: TimerSettings): TimerSettings => ({
  work: settings.work * 60,
  shortBreak: settings.shortBreak * 60,
  longBreak: settings.longBreak * 60,
});