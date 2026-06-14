import { useState, useEffect, useRef, useCallback } from 'react';
import { type Mode, type TimerSettings } from '../types';

/**
 * Manages the Pomodoro logic (Work -> Break cycles) and time tracking.
 */
export const usePomodoro = (
  timerSettings: TimerSettings, 
  onTimerComplete: () => void // Callback to run when timer ends (e.g. play sound)
) => {
  const [actualTime, setActualTime] = useState(timerSettings.work);
  const [isRunning, setIsRunning] = useState(false);
  const [actualMode, setActualMode] = useState<Mode>("work");
  const [sessionCount, setSessionCount] = useState(0);
  
  // The invisible anchor for Delta Time calculation
  const timerEndTime = useRef<number | null>(null);

  // --- Logic: Handle what happens when the timer hits 0 ---
  const handleTimerEnd = useCallback(() => {
    setIsRunning(false);
    onTimerComplete(); // Play the sound!

    if (actualMode === "work") {
      setSessionCount(prev => {
        const newCount = prev + 1;
        // Decision: Long break or Short break?
        if (newCount % 4 === 0) {
          setActualMode("longBreak");
          setActualTime(timerSettings.longBreak);
        } else {
          setActualMode("shortBreak");
          setActualTime(timerSettings.shortBreak);
        }
        return newCount;
      });
    } else {
      // Break is over, back to work
      setActualMode("work");
      setActualTime(timerSettings.work);
    }
  }, [actualMode, timerSettings, onTimerComplete]);

  // --- Logic: The Ticking Clock (Delta Method) ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isRunning) {
      // 1. Set the target time if not set
      timerEndTime.current ??= Date.now() + actualTime * 1000;

      interval = setInterval(() => {
        const now = Date.now();
        // 2. Calculate remaining time
        const secondsLeft = Math.ceil((timerEndTime.current! - now) / 1000);

        if (secondsLeft <= 0) {
          setActualTime(0);
          handleTimerEnd();
          timerEndTime.current = null; // Reset for next cycle
        } else {
          setActualTime(secondsLeft);
        }
      }, 100);
    } else {
      timerEndTime.current = null;
    }

    return () => clearInterval(interval);
  }, [isRunning, actualTime, handleTimerEnd]);

  // --- Sync display time when settings change (only while paused) ---
  const currentModeDuration = timerSettings[actualMode];
  useEffect(() => {
    if (!isRunning) {
      setActualTime(currentModeDuration);
    }
  }, [currentModeDuration, isRunning]);

  // --- Public Actions ---

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setActualTime(timerSettings[actualMode]);
    setSessionCount(0);
    timerEndTime.current = null;
  };

  const changeMode = (newMode: Mode) => {
    setActualMode(newMode);
    setActualTime(timerSettings[newMode]);
    setIsRunning(false);
    timerEndTime.current = null;
  };

  return {
    actualTime,
    isRunning,
    actualMode,
    sessionCount,
    toggleTimer,
    resetTimer,
    changeMode,
  };
};