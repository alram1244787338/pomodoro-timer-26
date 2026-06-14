import { useState, useEffect, useRef, useCallback } from 'react';
import { type Mode, type TimerSettings } from '../types';

/**
 * Manages the Pomodoro logic (Work -> Break cycles) and time tracking.
 */
export const usePomodoro = (
  timerSettings: TimerSettings,
  onTimerComplete: () => void // Callback to run when timer ends (e.g. play sound)
) => {
  const [timeLeft, setTimeLeft] = useState(timerSettings.work);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<Mode>("work");
  const [sessionCount, setSessionCount] = useState(0);

  // The invisible anchor for Delta Time calculation
  const timerEndTime = useRef<number | null>(null);

  // --- Logic: Handle what happens when the timer hits 0 ---
  const handleTimerEnd = useCallback(() => {
    setIsRunning(false);
    onTimerComplete(); // Play the sound!

    if (mode === "work") {
      setSessionCount(prev => {
        const newCount = prev + 1;
        // Decision: Long break or Short break?
        if (newCount % 4 === 0) {
          setMode("longBreak");
          setTimeLeft(timerSettings.longBreak);
        } else {
          setMode("shortBreak");
          setTimeLeft(timerSettings.shortBreak);
        }
        return newCount;
      });
    } else {
      // Break is over, back to work
      setMode("work");
      setTimeLeft(timerSettings.work);
    }
  }, [mode, timerSettings, onTimerComplete]);

  // --- Logic: The Ticking Clock (Delta Method) ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isRunning) {
      // 1. Set the target time if not set
      timerEndTime.current ??= Date.now() + timeLeft * 1000;

      interval = setInterval(() => {
        const now = Date.now();
        // 2. Calculate remaining time
        const secondsLeft = Math.ceil((timerEndTime.current! - now) / 1000);

        if (secondsLeft <= 0) {
          setTimeLeft(0);
          handleTimerEnd();
          timerEndTime.current = null; // Reset for next cycle
        } else {
          setTimeLeft(secondsLeft);
        }
      }, 100);
    } else {
      timerEndTime.current = null;
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, handleTimerEnd]);

  // --- Public Actions ---

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerSettings[mode]);
    setSessionCount(0);
    timerEndTime.current = null;
  };

  const changeMode = (newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(timerSettings[newMode]);
    setIsRunning(false);
    timerEndTime.current = null;
  };

  const updateTimeFromSettings = (newSettings: TimerSettings) => {
     // If stopped, immediately update the display to match the new setting
     if (!isRunning) {
        setTimeLeft(newSettings[mode]);
     }
  };

  return {
    timeLeft,
    isRunning,
    mode,
    sessionCount,
    toggleTimer,
    resetTimer,
    changeMode,
    updateTimeFromSettings
  };
};
