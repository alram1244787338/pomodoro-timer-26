// src/__tests__/pomodoroReducer.test.ts
import { describe, it, expect } from 'vitest';
import { pomodoroReducer } from '../hooks/pomodoroReducer';
import type { PomodoroState } from '../types';

describe('pomodoroReducer', () => {

  // --- TIMER_END: work → break transitions ---

  describe('TIMER_END from work', () => {
    it('transitions to shortBreak after session 1', () => {
      const state: PomodoroState = { mode: 'work', sessionCount: 0 };
      const next = pomodoroReducer(state, { type: 'TIMER_END' });
      expect(next).toEqual({ mode: 'shortBreak', sessionCount: 1 });
    });

    it('transitions to shortBreak after session 2', () => {
      const state: PomodoroState = { mode: 'work', sessionCount: 1 };
      const next = pomodoroReducer(state, { type: 'TIMER_END' });
      expect(next).toEqual({ mode: 'shortBreak', sessionCount: 2 });
    });

    it('transitions to shortBreak after session 3', () => {
      const state: PomodoroState = { mode: 'work', sessionCount: 2 };
      const next = pomodoroReducer(state, { type: 'TIMER_END' });
      expect(next).toEqual({ mode: 'shortBreak', sessionCount: 3 });
    });

    it('transitions to longBreak after session 4 (every 4th)', () => {
      const state: PomodoroState = { mode: 'work', sessionCount: 3 };
      const next = pomodoroReducer(state, { type: 'TIMER_END' });
      expect(next).toEqual({ mode: 'longBreak', sessionCount: 4 });
    });

    it('transitions to shortBreak after session 5 (cycle restarts)', () => {
      const state: PomodoroState = { mode: 'work', sessionCount: 4 };
      const next = pomodoroReducer(state, { type: 'TIMER_END' });
      expect(next).toEqual({ mode: 'shortBreak', sessionCount: 5 });
    });

    it('transitions to longBreak after session 8 (second long break)', () => {
      const state: PomodoroState = { mode: 'work', sessionCount: 7 };
      const next = pomodoroReducer(state, { type: 'TIMER_END' });
      expect(next).toEqual({ mode: 'longBreak', sessionCount: 8 });
    });
  });

  // --- TIMER_END: break → work transitions ---

  describe('TIMER_END from break', () => {
    it('transitions from shortBreak to work without changing sessionCount', () => {
      const state: PomodoroState = { mode: 'shortBreak', sessionCount: 2 };
      const next = pomodoroReducer(state, { type: 'TIMER_END' });
      expect(next).toEqual({ mode: 'work', sessionCount: 2 });
    });

    it('transitions from longBreak to work without changing sessionCount', () => {
      const state: PomodoroState = { mode: 'longBreak', sessionCount: 4 };
      const next = pomodoroReducer(state, { type: 'TIMER_END' });
      expect(next).toEqual({ mode: 'work', sessionCount: 4 });
    });
  });

  // --- CHANGE_MODE ---

  describe('CHANGE_MODE', () => {
    it('changes to shortBreak', () => {
      const state: PomodoroState = { mode: 'work', sessionCount: 2 };
      const next = pomodoroReducer(state, { type: 'CHANGE_MODE', mode: 'shortBreak' });
      expect(next).toEqual({ mode: 'shortBreak', sessionCount: 2 });
    });

    it('changes to longBreak', () => {
      const state: PomodoroState = { mode: 'work', sessionCount: 2 };
      const next = pomodoroReducer(state, { type: 'CHANGE_MODE', mode: 'longBreak' });
      expect(next).toEqual({ mode: 'longBreak', sessionCount: 2 });
    });

    it('changes back to work', () => {
      const state: PomodoroState = { mode: 'shortBreak', sessionCount: 1 };
      const next = pomodoroReducer(state, { type: 'CHANGE_MODE', mode: 'work' });
      expect(next).toEqual({ mode: 'work', sessionCount: 1 });
    });
  });

  // --- RESET ---

  describe('RESET', () => {
    it('resets sessionCount to 0 while preserving current mode', () => {
      const state: PomodoroState = { mode: 'work', sessionCount: 3 };
      const next = pomodoroReducer(state, { type: 'RESET' });
      expect(next).toEqual({ mode: 'work', sessionCount: 0 });
    });

    it('preserves mode even during a break', () => {
      const state: PomodoroState = { mode: 'shortBreak', sessionCount: 2 };
      const next = pomodoroReducer(state, { type: 'RESET' });
      expect(next).toEqual({ mode: 'shortBreak', sessionCount: 0 });
    });

    it('is a no-op when sessionCount is already 0', () => {
      const state: PomodoroState = { mode: 'work', sessionCount: 0 };
      const next = pomodoroReducer(state, { type: 'RESET' });
      expect(next).toEqual(state);
    });
  });

  // --- Purity check ---

  it('does not mutate the original state', () => {
    const state: PomodoroState = { mode: 'work', sessionCount: 2 };
    const frozen = { ...state };
    pomodoroReducer(state, { type: 'TIMER_END' });
    expect(state).toEqual(frozen);
  });
});
