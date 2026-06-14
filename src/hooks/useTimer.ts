// src/hooks/useTimer.ts
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Generic countdown timer using the delta-time method.
 *
 * Knows nothing about pomodoro modes — only counts down from a given
 * number of seconds and calls `onComplete` when time runs out.
 *
 * The delta-time approach anchors to `Date.now() + seconds * 1000` and
 * polls every 100ms, which prevents drift from accumulated interval lag.
 *
 * Uses a ref-based running guard (`activeRef`) so that the interval
 * callback can synchronously stop itself on completion, without waiting
 * for the React state update to propagate.
 */
export const useTimer = (initialTime: number, onComplete: () => void) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const timerEndTime = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Ref-based guard: the interval callback reads this synchronously to
  // prevent re-entry after completion, even before React re-renders.
  const activeRef = useRef(false);

  // Keep callback ref fresh without re-creating the interval
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Interval lifecycle — only tied to isRunning.
  // We intentionally do NOT include timeLeft in deps: the interval reads
  // from the stable timerEndTime ref, so it doesn't need re-creation on
  // every tick.
  useEffect(() => {
    if (!isRunning) {
      activeRef.current = false;
      timerEndTime.current = null;
      return;
    }

    activeRef.current = true;

    // Anchor the end-time on first tick (or after resume)
    timerEndTime.current ??= Date.now() + timeLeft * 1000;

    const interval = setInterval(() => {
      // Synchronous guard — prevents re-entry after completion
      if (!activeRef.current) return;

      const secondsLeft = Math.ceil(
        (timerEndTime.current! - Date.now()) / 1000
      );

      if (secondsLeft <= 0) {
        activeRef.current = false;       // stop immediately (sync)
        timerEndTime.current = null;
        setTimeLeft(0);
        setIsRunning(false);             // triggers effect cleanup
        onCompleteRef.current();
      } else {
        setTimeLeft(secondsLeft);
      }
    }, 100);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const start = useCallback(() => {
    if (!isRunning) setIsRunning(true);
  }, [isRunning]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((time?: number) => {
    activeRef.current = false;
    setIsRunning(false);
    timerEndTime.current = null;
    setTimeLeft(time ?? timeLeft);
  }, [timeLeft]);

  return { timeLeft, setTimeLeft, isRunning, start, pause, reset };
};
