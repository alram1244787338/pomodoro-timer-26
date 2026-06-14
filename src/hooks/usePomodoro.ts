import { useReducer, useEffect, useRef, useCallback } from 'react';
import { type Mode, type TimerSettings } from '../types';
import {
  pomodoroReducer,
  createInitialState,
} from './pomodoroMachine';

/**
 * Drives the Pomodoro state machine and connects it to the real world.
 *
 * Responsibilities are split on purpose:
 *   - {@link pomodoroReducer} owns every rule (mode switching, session counting,
 *     what happens when a phase ends) as pure, testable transitions.
 *   - This hook owns only the side-effectful parts: the wall-clock countdown and
 *     firing {@link onTimerComplete} when a phase finishes.
 *
 * The public API is intentionally unchanged from the previous implementation.
 */
export const usePomodoro = (
  timerSettings: TimerSettings,
  onTimerComplete: () => void, // Callback to run when a phase ends (e.g. play sound)
) => {
  const [state, dispatch] = useReducer(
    pomodoroReducer,
    timerSettings,
    createInitialState,
  );
  const { mode, status, secondsLeft, sessionCount } = state;
  const isRunning = status === 'running';

  // Latest values mirrored into refs so the clock effect can read them without
  // re-subscribing on every tick.
  const secondsLeftRef = useRef(secondsLeft);
  secondsLeftRef.current = secondsLeft;
  const onCompleteRef = useRef(onTimerComplete);
  onCompleteRef.current = onTimerComplete;

  // Wall-clock deadline used for delta-time counting, so the countdown stays
  // accurate even if interval callbacks are delayed or throttled.
  const deadlineRef = useRef<number | null>(null);

  // --- The ticking clock (delta method) ---
  // Keyed only on `status`: starting/pausing (re)creates the clock, while the
  // per-second `secondsLeft` updates flow back in via TICK without resetting it.
  useEffect(() => {
    if (status !== 'running') {
      deadlineRef.current = null; // the single place the anchor is cleared
      return;
    }

    deadlineRef.current ??= Date.now() + secondsLeftRef.current * 1000;

    const intervalId = setInterval(() => {
      const secondsRemaining = Math.ceil(
        (deadlineRef.current! - Date.now()) / 1000,
      );

      if (secondsRemaining > 0) {
        // Just advance the countdown — no phase decisions happen here.
        dispatch({ type: 'TICK', secondsLeft: secondsRemaining });
        return;
      }

      // Boundary reached: stop the clock first so COMPLETE can only fire once,
      // then let the machine pick the next phase and run the completion effect.
      clearInterval(intervalId);
      deadlineRef.current = null;
      dispatch({ type: 'COMPLETE' });
      onCompleteRef.current();
    }, 100);

    return () => clearInterval(intervalId);
  }, [status]);

  // --- Public actions: each maps to exactly one explicit transition ---

  const toggleTimer = useCallback(() => {
    dispatch({ type: 'TOGGLE' });
  }, []);

  const resetTimer = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const changeMode = useCallback((newMode: Mode) => {
    dispatch({ type: 'CHANGE_MODE', mode: newMode });
  }, []);

  const updateTimeFromSettings = useCallback((newSettings: TimerSettings) => {
    dispatch({ type: 'SYNC_SETTINGS', settings: newSettings });
  }, []);

  return {
    actualTime: secondsLeft,
    isRunning,
    actualMode: mode,
    sessionCount,
    toggleTimer,
    resetTimer,
    changeMode,
    updateTimeFromSettings,
  };
};
