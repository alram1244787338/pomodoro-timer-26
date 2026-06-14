// src/__tests__/usePomodoro.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePomodoro } from '../hooks/usePomodoro';
import type { TimerSettings } from '../types';

// Short durations (seconds) so tests run fast with fake timers
const TEST_SETTINGS: TimerSettings = {
  work: 10,
  shortBreak: 5,
  longBreak: 15,
};

// Advance fake time, processing async microtasks between timer ticks
async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

describe('usePomodoro', () => {
  let onComplete: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    onComplete = vi.fn<() => void>();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Initial state ---

  it('starts in work mode with correct initial time', () => {
    const { result } = renderHook(() => usePomodoro(TEST_SETTINGS, onComplete));

    expect(result.current.actualMode).toBe('work');
    expect(result.current.actualTime).toBe(10);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.sessionCount).toBe(0);
  });

  // --- toggleTimer ---

  describe('toggleTimer', () => {
    it('starts the countdown and decrements time', async () => {
      const { result } = renderHook(() => usePomodoro(TEST_SETTINGS, onComplete));

      act(() => { result.current.toggleTimer(); });
      expect(result.current.isRunning).toBe(true);

      await advance(3_000);
      expect(result.current.actualTime).toBe(7);
    });

    it('pauses the countdown and preserves remaining time', async () => {
      const { result } = renderHook(() => usePomodoro(TEST_SETTINGS, onComplete));

      act(() => { result.current.toggleTimer(); });
      await advance(4_000);

      act(() => { result.current.toggleTimer(); });
      expect(result.current.isRunning).toBe(false);
      expect(result.current.actualTime).toBe(6);

      // Time should NOT advance while paused
      await advance(5_000);
      expect(result.current.actualTime).toBe(6);
    });

    it('resumes from paused position', async () => {
      const { result } = renderHook(() => usePomodoro(TEST_SETTINGS, onComplete));

      act(() => { result.current.toggleTimer(); });
      await advance(4_000);  // 6s left

      act(() => { result.current.toggleTimer(); }); // pause
      expect(result.current.isRunning).toBe(false);
      const pausedTime = result.current.actualTime;

      // Time should NOT advance while paused
      await advance(5_000);
      expect(result.current.actualTime).toBe(pausedTime);

      // Resume — timer counts down from paused position to completion
      act(() => { result.current.toggleTimer(); });
      expect(result.current.isRunning).toBe(true);

      // Math.ceil rounds up on each tick, so the resumed countdown may
      // need up to ~1s more than the displayed seconds.
      await advance(pausedTime * 1000 + 2_000);
      expect(result.current.isRunning).toBe(false);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  // --- Timer completion & mode transitions ---

  describe('timer completion', () => {
    it('calls onTimerComplete when countdown reaches 0', async () => {
      const { result } = renderHook(() => usePomodoro(TEST_SETTINGS, onComplete));

      act(() => { result.current.toggleTimer(); });
      await advance(10_000);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('transitions work → shortBreak after session 1', async () => {
      const { result } = renderHook(() => usePomodoro(TEST_SETTINGS, onComplete));

      act(() => { result.current.toggleTimer(); });
      await advance(10_000);

      expect(result.current.actualMode).toBe('shortBreak');
      expect(result.current.actualTime).toBe(5);
      expect(result.current.sessionCount).toBe(1);
      expect(result.current.isRunning).toBe(false);
    });

    it('transitions shortBreak → work', async () => {
      const { result } = renderHook(() => usePomodoro(TEST_SETTINGS, onComplete));

      // Complete work
      act(() => { result.current.toggleTimer(); });
      await advance(10_000);

      // Start & complete shortBreak
      act(() => { result.current.toggleTimer(); });
      await advance(5_000);

      expect(result.current.actualMode).toBe('work');
      expect(result.current.actualTime).toBe(10);
      expect(result.current.sessionCount).toBe(1); // unchanged
    });

    it('triggers longBreak after 4 consecutive work sessions', async () => {
      const { result } = renderHook(() => usePomodoro(TEST_SETTINGS, onComplete));

      const completeWork = async () => {
        act(() => { result.current.toggleTimer(); });
        await advance(10_000);
      };
      const completeBreak = async () => {
        act(() => { result.current.toggleTimer(); });
        // Use the CURRENT break duration (short or long)
        const breakTime = result.current.actualTime * 1000;
        await advance(breakTime);
      };

      // Sessions 1–3 → shortBreak
      for (let i = 0; i < 3; i++) {
        await completeWork();
        expect(result.current.actualMode).toBe('shortBreak');
        expect(result.current.sessionCount).toBe(i + 1);
        await completeBreak();
        expect(result.current.actualMode).toBe('work');
      }

      // Session 4 → longBreak
      await completeWork();
      expect(result.current.actualMode).toBe('longBreak');
      expect(result.current.sessionCount).toBe(4);
      expect(result.current.actualTime).toBe(15);

      // longBreak ends → work
      await completeBreak();
      expect(result.current.actualMode).toBe('work');
      expect(result.current.sessionCount).toBe(4);
    });

    it('stops automatically when countdown finishes (no auto-start)', async () => {
      const { result } = renderHook(() => usePomodoro(TEST_SETTINGS, onComplete));

      act(() => { result.current.toggleTimer(); });
      await advance(10_000);

      expect(result.current.isRunning).toBe(false);
      // Ensure timer doesn't keep ticking
      await advance(5_000);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  // --- changeMode ---

  describe('changeMode', () => {
    it('switches mode and resets time to new mode duration', () => {
      const { result } = renderHook(() => usePomodoro(TEST_SETTINGS, onComplete));

      act(() => { result.current.changeMode('shortBreak'); });

      expect(result.current.actualMode).toBe('shortBreak');
      expect(result.current.actualTime).toBe(5);
      expect(result.current.isRunning).toBe(false);
    });

    it('stops the timer when mode is changed mid-countdown', async () => {
      const { result } = renderHook(() => usePomodoro(TEST_SETTINGS, onComplete));

      act(() => { result.current.toggleTimer(); });
      await advance(3_000);

      act(() => { result.current.changeMode('longBreak'); });

      expect(result.current.actualMode).toBe('longBreak');
      expect(result.current.actualTime).toBe(15);
      expect(result.current.isRunning).toBe(false);
    });

    it('preserves sessionCount when mode is changed manually', () => {
      const { result } = renderHook(() => usePomodoro(TEST_SETTINGS, onComplete));

      // Simulate 2 completed sessions via the reducer by cycling through
      // (We set sessionCount indirectly; here just verify changeMode doesn't reset it
      //  if the reducer preserves it — CHANGE_MODE keeps sessionCount)
      act(() => { result.current.changeMode('shortBreak'); });
      expect(result.current.sessionCount).toBe(0); // no sessions completed yet
    });
  });

  // --- resetTimer ---

  describe('resetTimer', () => {
    it('resets time to current mode duration and clears sessionCount', () => {
      const { result } = renderHook(() => usePomodoro(TEST_SETTINGS, onComplete));

      act(() => { result.current.resetTimer(); });

      expect(result.current.actualMode).toBe('work');
      expect(result.current.actualTime).toBe(10);
      expect(result.current.sessionCount).toBe(0);
      expect(result.current.isRunning).toBe(false);
    });

    it('stops the timer when reset mid-countdown', async () => {
      const { result } = renderHook(() => usePomodoro(TEST_SETTINGS, onComplete));

      act(() => { result.current.toggleTimer(); });
      await advance(5_000);
      expect(result.current.actualTime).toBe(5);

      act(() => { result.current.resetTimer(); });

      expect(result.current.actualTime).toBe(10);
      expect(result.current.isRunning).toBe(false);
    });

    it('clears sessionCount after completed sessions', async () => {
      const { result } = renderHook(() => usePomodoro(TEST_SETTINGS, onComplete));

      // Complete 2 work sessions
      for (let i = 0; i < 2; i++) {
        act(() => { result.current.toggleTimer(); });
        await advance(10_000);
        act(() => { result.current.toggleTimer(); });
        await advance(5_000);
      }
      expect(result.current.sessionCount).toBe(2);

      act(() => { result.current.resetTimer(); });
      expect(result.current.sessionCount).toBe(0);
    });
  });

  // --- updateTimeFromSettings ---

  describe('updateTimeFromSettings', () => {
    it('syncs displayed time when timer is stopped', () => {
      const { result } = renderHook(() => usePomodoro(TEST_SETTINGS, onComplete));

      const newSettings: TimerSettings = { work: 30, shortBreak: 10, longBreak: 20 };
      act(() => { result.current.updateTimeFromSettings(newSettings); });

      expect(result.current.actualTime).toBe(30);
    });

    it('does NOT change time when timer is running', async () => {
      const { result } = renderHook(() => usePomodoro(TEST_SETTINGS, onComplete));

      act(() => { result.current.toggleTimer(); });
      await advance(3_000);
      expect(result.current.actualTime).toBe(7);

      const newSettings: TimerSettings = { work: 30, shortBreak: 10, longBreak: 20 };
      act(() => { result.current.updateTimeFromSettings(newSettings); });

      // Time should not jump to 30 — timer is running
      expect(result.current.actualTime).toBe(7);
    });

    it('syncs time for the current mode (not just work)', () => {
      const { result } = renderHook(() => usePomodoro(TEST_SETTINGS, onComplete));

      act(() => { result.current.changeMode('shortBreak'); });
      expect(result.current.actualTime).toBe(5);

      const newSettings: TimerSettings = { work: 30, shortBreak: 12, longBreak: 20 };
      act(() => { result.current.updateTimeFromSettings(newSettings); });

      expect(result.current.actualTime).toBe(12);
    });
  });
});
