import { useEffect } from 'react';
import { type Mode } from '../types';
import { formatTime } from '../utils/timeHelpers';
import { APP_NAME, MODE_LABELS } from '../constants';

/**
 * Keeps the browser tab title in sync: shows the countdown while running,
 * falls back to the app name otherwise.
 */
export const useDocumentTitle = (timeLeft: number, mode: Mode, isRunning: boolean) => {
  useEffect(() => {
    document.title = isRunning
      ? `${formatTime(timeLeft)} - ${MODE_LABELS[mode]}`
      : APP_NAME;
  }, [timeLeft, mode, isRunning]);
};
