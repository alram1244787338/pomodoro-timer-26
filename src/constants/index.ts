import type { Mode } from '../types';

export const APP_NAME = 'MelloFocus';

export const MODE_LABELS: Record<Mode, string> = {
  work: 'Work',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

export const SESSIONS_BEFORE_LONG_BREAK = 4;

export const SETTINGS_FIELD_LABELS: Record<Mode, string> = {
  work: `${MODE_LABELS.work} (minutes)`,
  shortBreak: `${MODE_LABELS.shortBreak} (minutes)`,
  longBreak: `${MODE_LABELS.longBreak} (minutes)`,
};

export const DEFAULT_SETTINGS_SECONDS = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
} as const;

export const SETTINGS_CONSTRAINTS = {
  min: 1,
  max: 120,
} as const;
