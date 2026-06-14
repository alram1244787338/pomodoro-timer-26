// src/hooks/usePomodoro.ts
import { useReducer, useCallback, useRef } from 'react';
import type { Mode, TimerSettings } from '../types';
import { pomodoroReducer } from './pomodoroReducer';
import { useTimer } from './useTimer';

const SESSIONS_BEFORE_LONG_BREAK = 4;

/**
 * Orchestrates the Pomodoro timer by composing:
 *   - useTimer        (countdown engine — no domain knowledge)
 *   - pomodoroReducer (state machine — no side effects)
 *
 * This hook is the only place that wires "time's up" to "switch mode",
 * keeping the two concerns cleanly separated.
 */
export const usePomodoro = (
  timerSettings: TimerSettings,
  onTimerComplete: () => void
) => {
  const [pomodoroState, dispatch] = useReducer(pomodoroReducer, {
    mode: "work" as Mode,
    sessionCount: 0,
  });

  const { mode, sessionCount } = pomodoroState;

  // Keep latest values in refs so the onComplete callback (which is
  // captured once by useTimer's ref) can always read fresh state.
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const sessionCountRef = useRef(sessionCount);
  sessionCountRef.current = sessionCount;
  const timerSettingsRef = useRef(timerSettings);
  timerSettingsRef.current = timerSettings;
  const onTimerCompleteRef = useRef(onTimerComplete);
  onTimerCompleteRef.current = onTimerComplete;

  const { timeLeft, setTimeLeft, isRunning, start, pause, reset } =
    useTimer(timerSettings.work, () => {
      onTimerCompleteRef.current();
      dispatch({ type: "TIMER_END" });

      // Mirror the reducer's next-mode logic so we can set timeLeft
      // synchronously (dispatch is async, so state.mode hasn't changed yet).
      const currentMode = modeRef.current;
      const currentCount = sessionCountRef.current;
      const nextMode: Mode =
        currentMode === "work"
          ? (currentCount + 1) % SESSIONS_BEFORE_LONG_BREAK === 0
            ? "longBreak"
            : "shortBreak"
          : "work";
      setTimeLeft(timerSettingsRef.current[nextMode]);
    });

  // --- Public API ---

  const toggleTimer = useCallback(() => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }, [isRunning, pause, start]);

  const resetTimer = useCallback(() => {
    dispatch({ type: "RESET" });
    reset(timerSettings[mode]);
  }, [dispatch, mode, reset, timerSettings]);

  const changeMode = useCallback(
    (newMode: Mode) => {
      pause();
      dispatch({ type: "CHANGE_MODE", mode: newMode });
      setTimeLeft(timerSettings[newMode]);
    },
    [dispatch, pause, setTimeLeft, timerSettings]
  );

  const updateTimeFromSettings = useCallback(
    (newSettings: TimerSettings) => {
      // Only sync displayed time when the timer is stopped
      if (!isRunning) {
        setTimeLeft(newSettings[mode]);
      }
    },
    [isRunning, mode, setTimeLeft]
  );

  return {
    actualTime: timeLeft,
    isRunning,
    actualMode: mode,
    sessionCount,
    toggleTimer,
    resetTimer,
    changeMode,
    updateTimeFromSettings,
  };
};
