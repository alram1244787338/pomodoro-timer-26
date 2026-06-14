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

/**
 * The single source of truth for converting between the unit the timer runs on
 * (seconds) and the unit the user edits in the settings form (minutes).
 * Keeping both directions here prevents the `* 60` / `/ 60` math from drifting
 * across components and hooks.
 */
export const minutesToSeconds = (settings: TimerSettings): TimerSettings => ({
  work: settings.work * 60,
  shortBreak: settings.shortBreak * 60,
  longBreak: settings.longBreak * 60,
});

export const secondsToMinutes = (settings: TimerSettings): TimerSettings => ({
  work: settings.work / 60,
  shortBreak: settings.shortBreak / 60,
  longBreak: settings.longBreak / 60,
});