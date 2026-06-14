import { useState, useEffect, useRef, useCallback } from 'react';
import { type Mode, type TimerSettings } from '../types';
import { SESSIONS_BEFORE_LONG_BREAK } from '../constants';

/**
 * Manages the Pomodoro logic (Work -> Break cycles) and time tracking.
 */
export const usePomodoro = (
  timerSettings: TimerSettings, 
  onTimerComplete: () => void // Callback to run when timer ends (e.g. play sound)
) => {
  const [time, setTime] = useState(timerSettings.work);
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
        if (newCount % SESSIONS_BEFORE_LONG_BREAK === 0) {
          setMode("longBreak");
          setTime(timerSettings.longBreak);
        } else {
          setMode("shortBreak");
          setTime(timerSettings.shortBreak);
        }
        return newCount;
      });
    } else {
      // Break is over, back to work
      setMode("work");
      setTime(timerSettings.work);
    }
  }, [mode, timerSettings, onTimerComplete]);

  // --- Logic: The Ticking Clock (Delta Method) ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isRunning) {
      // 1. Set the target time if not set
      timerEndTime.current ??= Date.now() + time * 1000;

      interval = setInterval(() => {
        const now = Date.now();
        // 2. Calculate remaining time
        const secondsLeft = Math.ceil((timerEndTime.current! - now) / 1000);

        if (secondsLeft <= 0) {
          setTime(0);
          handleTimerEnd();
          timerEndTime.current = null; // Reset for next cycle
        } else {
          setTime(secondsLeft);
        }
      }, 100);
    } else {
      timerEndTime.current = null;
    }

    return () => clearInterval(interval);
  }, [isRunning, time, handleTimerEnd]);

  // --- Public Actions ---

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(timerSettings[mode]);
    setSessionCount(0);
    timerEndTime.current = null;
  };

  const changeMode = (newMode: Mode) => {
    setMode(newMode);
    setTime(timerSettings[newMode]);
    setIsRunning(false);
    timerEndTime.current = null;
  };

  const updateTimeFromSettings = (newSettings: TimerSettings) => {
     // If stopped, immediately update the display to match the new setting
     if (!isRunning) {
        setTime(newSettings[mode]);
     }
  };

  return {
    time,
    isRunning,
    mode,
    sessionCount,
    toggleTimer,
    resetTimer,
    changeMode,
    updateTimeFromSettings
  };
};