// src/hooks/pomodoroMachine.test.ts
//
// Unit tests for the pure Pomodoro state machine. No React, no fake timers —
// just "given this state, dispatch this action, expect that state". This is the
// regression net for the timing rules that are easy to break during refactors.

import { describe, it, expect } from 'vitest';
import {
  pomodoroReducer,
  getNextPhase,
  createInitialState,
  SESSIONS_BEFORE_LONG_BREAK,
  type PomodoroState,
} from './pomodoroMachine';
import { type TimerSettings } from '../types';

const SETTINGS: TimerSettings = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

/** Build a state, overriding any fields the specific test cares about. */
const makeState = (overrides: Partial<PomodoroState> = {}): PomodoroState => ({
  ...createInitialState(SETTINGS),
  ...overrides,
});

describe('createInitialState', () => {
  it('starts paused in a full-length work phase with no sessions counted', () => {
    expect(createInitialState(SETTINGS)).toEqual({
      mode: 'work',
      status: 'paused',
      secondsLeft: SETTINGS.work,
      sessionCount: 0,
      settings: SETTINGS,
    });
  });
});

describe('getNextPhase', () => {
  it('sends work -> short break for the first three sessions', () => {
    for (let completed = 0; completed < SESSIONS_BEFORE_LONG_BREAK - 1; completed++) {
      expect(getNextPhase('work', completed, SETTINGS)).toEqual({
        mode: 'shortBreak',
        sessionCount: completed + 1,
        secondsLeft: SETTINGS.shortBreak,
      });
    }
  });

  it('sends work -> long break on every fourth session', () => {
    expect(getNextPhase('work', SESSIONS_BEFORE_LONG_BREAK - 1, SETTINGS)).toEqual({
      mode: 'longBreak',
      sessionCount: SESSIONS_BEFORE_LONG_BREAK,
      secondsLeft: SETTINGS.longBreak,
    });
    // ...and again on the eighth session.
    expect(getNextPhase('work', 2 * SESSIONS_BEFORE_LONG_BREAK - 1, SETTINGS)).toEqual({
      mode: 'longBreak',
      sessionCount: 2 * SESSIONS_BEFORE_LONG_BREAK,
      secondsLeft: SETTINGS.longBreak,
    });
  });

  it('returns to work from any break without changing the session count', () => {
    expect(getNextPhase('shortBreak', 2, SETTINGS)).toEqual({
      mode: 'work',
      sessionCount: 2,
      secondsLeft: SETTINGS.work,
    });
    expect(getNextPhase('longBreak', 4, SETTINGS)).toEqual({
      mode: 'work',
      sessionCount: 4,
      secondsLeft: SETTINGS.work,
    });
  });
});

describe('pomodoroReducer / TOGGLE', () => {
  it('flips paused -> running and back without touching anything else', () => {
    const paused = makeState({ secondsLeft: 100, sessionCount: 3 });
    const running = pomodoroReducer(paused, { type: 'TOGGLE' });

    expect(running.status).toBe('running');
    expect(running.secondsLeft).toBe(100);
    expect(running.sessionCount).toBe(3);
    expect(running.mode).toBe('work');

    const pausedAgain = pomodoroReducer(running, { type: 'TOGGLE' });
    expect(pausedAgain.status).toBe('paused');
    expect(pausedAgain.sessionCount).toBe(3);
  });
});

describe('pomodoroReducer / TICK', () => {
  it('advances the countdown only', () => {
    const state = makeState({ status: 'running', secondsLeft: 100, sessionCount: 2 });
    const ticked = pomodoroReducer(state, { type: 'TICK', secondsLeft: 99 });

    expect(ticked.secondsLeft).toBe(99);
    expect(ticked.status).toBe('running');
    expect(ticked.mode).toBe('work');
    expect(ticked.sessionCount).toBe(2);
  });

  it('returns the same reference when the value is unchanged (re-render guard)', () => {
    const state = makeState({ status: 'running', secondsLeft: 100 });
    const ticked = pomodoroReducer(state, { type: 'TICK', secondsLeft: 100 });

    expect(ticked).toBe(state);
  });

  it('never performs a phase transition, even at zero', () => {
    const state = makeState({ status: 'running', mode: 'work', secondsLeft: 1 });
    const ticked = pomodoroReducer(state, { type: 'TICK', secondsLeft: 0 });

    // TICK is purely the countdown; deciding what happens at zero is COMPLETE's job.
    expect(ticked.mode).toBe('work');
    expect(ticked.secondsLeft).toBe(0);
    expect(ticked.status).toBe('running');
  });
});

describe('pomodoroReducer / COMPLETE', () => {
  it('work -> short break and increments the session count, then pauses', () => {
    const state = makeState({ status: 'running', mode: 'work', secondsLeft: 0, sessionCount: 0 });
    const next = pomodoroReducer(state, { type: 'COMPLETE' });

    expect(next.mode).toBe('shortBreak');
    expect(next.sessionCount).toBe(1);
    expect(next.secondsLeft).toBe(SETTINGS.shortBreak);
    expect(next.status).toBe('paused');
  });

  it('work -> long break on the fourth completed session', () => {
    const state = makeState({ status: 'running', mode: 'work', secondsLeft: 0, sessionCount: 3 });
    const next = pomodoroReducer(state, { type: 'COMPLETE' });

    expect(next.mode).toBe('longBreak');
    expect(next.sessionCount).toBe(SESSIONS_BEFORE_LONG_BREAK);
    expect(next.secondsLeft).toBe(SETTINGS.longBreak);
    expect(next.status).toBe('paused');
  });

  it('break -> work, leaving the session count alone', () => {
    const state = makeState({ status: 'running', mode: 'shortBreak', secondsLeft: 0, sessionCount: 2 });
    const next = pomodoroReducer(state, { type: 'COMPLETE' });

    expect(next.mode).toBe('work');
    expect(next.sessionCount).toBe(2);
    expect(next.secondsLeft).toBe(SETTINGS.work);
    expect(next.status).toBe('paused');
  });

  it('runs a full four-session cycle: work/break x3 then a long break', () => {
    let state = makeState({ status: 'running' });
    const seenBreaks: string[] = [];

    for (let i = 0; i < SESSIONS_BEFORE_LONG_BREAK; i++) {
      state = pomodoroReducer({ ...state, status: 'running' }, { type: 'COMPLETE' }); // finish work
      seenBreaks.push(state.mode);
      state = pomodoroReducer({ ...state, status: 'running' }, { type: 'COMPLETE' }); // finish break
    }

    expect(seenBreaks).toEqual(['shortBreak', 'shortBreak', 'shortBreak', 'longBreak']);
    expect(state.mode).toBe('work');
    expect(state.sessionCount).toBe(SESSIONS_BEFORE_LONG_BREAK);
  });
});

describe('pomodoroReducer / RESET', () => {
  it('restores the current phase to full length and clears the session count', () => {
    const state = makeState({
      status: 'running',
      mode: 'shortBreak',
      secondsLeft: 5,
      sessionCount: 3,
    });
    const reset = pomodoroReducer(state, { type: 'RESET' });

    expect(reset.status).toBe('paused');
    expect(reset.mode).toBe('shortBreak'); // mode is kept...
    expect(reset.secondsLeft).toBe(SETTINGS.shortBreak); // ...and refilled
    expect(reset.sessionCount).toBe(0); // session count is cleared
  });
});

describe('pomodoroReducer / CHANGE_MODE', () => {
  it('switches phase and refills time without disturbing the session count', () => {
    const state = makeState({
      status: 'running',
      mode: 'work',
      secondsLeft: 10,
      sessionCount: 2,
    });
    const changed = pomodoroReducer(state, { type: 'CHANGE_MODE', mode: 'longBreak' });

    expect(changed.mode).toBe('longBreak');
    expect(changed.secondsLeft).toBe(SETTINGS.longBreak);
    expect(changed.status).toBe('paused');
    expect(changed.sessionCount).toBe(2); // explicitly untouched
  });
});

describe('pomodoroReducer / SYNC_SETTINGS', () => {
  const NEW_SETTINGS: TimerSettings = {
    work: 30 * 60,
    shortBreak: 6 * 60,
    longBreak: 20 * 60,
  };

  it('refreshes the visible countdown when paused', () => {
    const state = makeState({ status: 'paused', mode: 'work', secondsLeft: SETTINGS.work });
    const synced = pomodoroReducer(state, { type: 'SYNC_SETTINGS', settings: NEW_SETTINGS });

    expect(synced.settings).toEqual(NEW_SETTINGS);
    expect(synced.secondsLeft).toBe(NEW_SETTINGS.work);
  });

  it('stores new durations but leaves a running countdown alone', () => {
    const state = makeState({ status: 'running', mode: 'work', secondsLeft: 123 });
    const synced = pomodoroReducer(state, { type: 'SYNC_SETTINGS', settings: NEW_SETTINGS });

    expect(synced.settings).toEqual(NEW_SETTINGS);
    expect(synced.secondsLeft).toBe(123); // unchanged mid-run...

    // ...but the new durations apply on the next phase transition.
    const next = pomodoroReducer({ ...synced, secondsLeft: 0 }, { type: 'COMPLETE' });
    expect(next.secondsLeft).toBe(NEW_SETTINGS.shortBreak);
  });
});
