// src/constants.ts
// Single source of truth for app-wide display text and default config.

import { type Mode, type TimerSettings } from './types';

export const APP_NAME = 'MelloFocus';

export const MODE_LABELS: Record<Mode, string> = {
  work: 'Work',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

export const DEFAULT_SETTINGS: TimerSettings = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};
