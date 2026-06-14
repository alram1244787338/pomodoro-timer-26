// src/hooks/pomodoroMachine.ts
//
// Pure state machine for the Pomodoro cycle.
//
// This module deliberately contains NO React, NO timers and NO side effects
// (sound, document.title, etc). It only answers the question:
//   "given the current state and an action, what is the next state?"
//
// Keeping the rules here (instead of inside a hook full of `if`s) means:
//   - the Work -> Break -> Long Break rules live in one explicit place,
//   - every transition is a named action with no hidden side effects,
//   - the whole thing is trivially unit-testable without rendering anything.

import { type Mode, type TimerSettings } from '../types';

/** How many work sessions must complete before a long break is offered. */
export const SESSIONS_BEFORE_LONG_BREAK = 4;

/** A running timer is counting down; a paused timer is frozen. */
export type TimerStatus = 'running' | 'paused';

export interface PomodoroState {
  /** Which phase we are currently in. */
  mode: Mode;
  /** Whether the countdown is advancing. */
  status: TimerStatus;
  /** Seconds remaining in the current phase. */
  secondsLeft: number;
  /** Number of completed work sessions in the current cycle. */
  sessionCount: number;
  /** Durations (in seconds) for each mode. Part of the machine state so that
   *  transitions never need an external dependency to know how long a phase is. */
  settings: TimerSettings;
}

export type PomodoroAction =
  /** Flip between running and paused. */
  | { type: 'TOGGLE' }
  /** Advance the countdown to a new remaining value (clock-driven). */
  | { type: 'TICK'; secondsLeft: number }
  /** The current phase reached zero: move to the next phase. */
  | { type: 'COMPLETE' }
  /** Reset the current phase to full length and clear the session count. */
  | { type: 'RESET' }
  /** Manually switch to a specific phase. */
  | { type: 'CHANGE_MODE'; mode: Mode }
  /** Apply new durations from settings. */
  | { type: 'SYNC_SETTINGS'; settings: TimerSettings };

/**
 * Pure rule for "what comes after this phase finishes".
 *
 * - Finishing WORK increments the session count, then chooses a long break
 *   every {@link SESSIONS_BEFORE_LONG_BREAK} sessions, otherwise a short break.
 * - Finishing any break returns to work and leaves the session count untouched.
 *
 * Returns only the fields that change so callers can spread it onto state.
 */
export const getNextPhase = (
  mode: Mode,
  sessionCount: number,
  settings: TimerSettings,
): Pick<PomodoroState, 'mode' | 'sessionCount' | 'secondsLeft'> => {
  if (mode === 'work') {
    const nextSessionCount = sessionCount + 1;
    const longBreakDue = nextSessionCount % SESSIONS_BEFORE_LONG_BREAK === 0;
    const nextMode: Mode = longBreakDue ? 'longBreak' : 'shortBreak';

    return {
      mode: nextMode,
      sessionCount: nextSessionCount,
      secondsLeft: settings[nextMode],
    };
  }

  return {
    mode: 'work',
    sessionCount,
    secondsLeft: settings.work,
  };
};

/** Build the starting state: a paused Work phase at full length. */
export const createInitialState = (settings: TimerSettings): PomodoroState => ({
  mode: 'work',
  status: 'paused',
  secondsLeft: settings.work,
  sessionCount: 0,
  settings,
});

/**
 * The single source of truth for every state transition.
 *
 * Each case is intentionally narrow so that one action never has surprising
 * side effects on unrelated fields (e.g. TOGGLE never touches the session
 * count, CHANGE_MODE never touches it either).
 */
export const pomodoroReducer = (
  state: PomodoroState,
  action: PomodoroAction,
): PomodoroState => {
  switch (action.type) {
    case 'TOGGLE':
      return {
        ...state,
        status: state.status === 'running' ? 'paused' : 'running',
      };

    case 'TICK': {
      // Pure countdown advance only — it never decides what happens at zero.
      // Bail out (same reference) when the visible value is unchanged so that
      // sub-second clock polling does not trigger needless re-renders.
      if (action.secondsLeft === state.secondsLeft) {
        return state;
      }
      return { ...state, secondsLeft: action.secondsLeft };
    }

    case 'COMPLETE':
      // All "what to do when the time is up" logic lives here, decoupled from
      // the ticking above. The next phase always starts paused.
      return {
        ...state,
        ...getNextPhase(state.mode, state.sessionCount, state.settings),
        status: 'paused',
      };

    case 'RESET':
      return {
        ...state,
        status: 'paused',
        secondsLeft: state.settings[state.mode],
        sessionCount: 0,
      };

    case 'CHANGE_MODE':
      return {
        ...state,
        mode: action.mode,
        secondsLeft: state.settings[action.mode],
        status: 'paused',
      };

    case 'SYNC_SETTINGS':
      return {
        ...state,
        settings: action.settings,
        // Only refresh the visible countdown while paused, so changing settings
        // mid-run does not yank the clock the user is watching.
        secondsLeft:
          state.status === 'paused'
            ? action.settings[state.mode]
            : state.secondsLeft,
      };

    default:
      return state;
  }
};
