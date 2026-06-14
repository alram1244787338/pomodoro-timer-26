import { useEffect } from 'react';
import { type Mode } from '../types';
import { formatTime } from '../utils/timeHelpers';

const MODE_LABELS: Record<Mode, string> = {
  work: 'Work',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

const IDLE_TITLE = 'MelloFocus';

/**
 * Keeps the browser tab title in sync with the running timer.
 * While running it shows "MM:SS - Mode"; otherwise it falls back to the app name.
 */
export const useDocumentTitle = (time: number, mode: Mode, isRunning: boolean) => {
  useEffect(() => {
    document.title = isRunning
      ? `${formatTime(time)} - ${MODE_LABELS[mode]}`
      : IDLE_TITLE;
  }, [time, mode, isRunning]);
};
