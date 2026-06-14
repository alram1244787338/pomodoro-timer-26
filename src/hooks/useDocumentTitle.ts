import { useEffect } from 'react';
import { formatTime } from '../utils/timeHelpers';
import { MODE_LABELS, APP_NAME } from '../constants';
import type { Mode } from '../types';

export const useDocumentTitle = (time: number, mode: Mode, isRunning: boolean) => {
  useEffect(() => {
    document.title = isRunning
      ? `${formatTime(time)} - ${MODE_LABELS[mode]}`
      : APP_NAME;
  }, [time, mode, isRunning]);
};
