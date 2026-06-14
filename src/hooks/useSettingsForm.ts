import { useState, useEffect } from 'react';
import { type TimerSettings } from '../types';
import { settingsToMinutes, settingsToSeconds } from '../utils/timeHelpers';

/**
 * Ensures every duration is at least 1 (minute), matching the inputs' min="1".
 */
const clampMinutes = (settings: TimerSettings): TimerSettings => ({
  work: Math.max(1, settings.work),
  shortBreak: Math.max(1, settings.shortBreak),
  longBreak: Math.max(1, settings.longBreak),
});

/**
 * Owns the Settings form: holds the editable values (in minutes), validates
 * input, and converts back to seconds on submit. The modal stays presentational
 * and callers never deal with the minute/second conversion.
 */
export const useSettingsForm = (settings: TimerSettings, isOpen: boolean) => {
  const [values, setValues] = useState<TimerSettings>(() => settingsToMinutes(settings));

  // Re-sync the form with the latest settings each time the modal opens.
  useEffect(() => {
    if (isOpen) {
      setValues(settingsToMinutes(settings));
    }
  }, [isOpen, settings]);

  const handleChange = (name: keyof TimerSettings, rawValue: string) => {
    setValues(prev => ({
      ...prev,
      [name]: rawValue === '' ? 0 : Number(rawValue),
    }));
  };

  const handleBlur = (name: keyof TimerSettings) => {
    setValues(prev => (prev[name] < 1 ? { ...prev, [name]: 1 } : prev));
  };

  const toSecondsSettings = (): TimerSettings => settingsToSeconds(clampMinutes(values));

  return { values, handleChange, handleBlur, toSecondsSettings };
};
