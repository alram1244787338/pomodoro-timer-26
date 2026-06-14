// src/hooks/pomodoroReducer.ts
import type { Mode, PomodoroState, PomodoroAction } from '../types';

const SESSIONS_BEFORE_LONG_BREAK = 4;

/**
 * Pure state machine for pomodoro mode transitions.
 *
 * State transitions:
 *   work → shortBreak  (sessionCount < 4 or not divisible by 4)
 *   work → longBreak   (sessionCount divisible by 4)
 *   shortBreak / longBreak → work
 *
 * This function has no side effects — it only computes the next state
 * from the current state and an action. Easy to test in isolation.
 */
export function pomodoroReducer(
  state: PomodoroState,
  action: PomodoroAction
): PomodoroState {
  switch (action.type) {
    case "TIMER_END": {
      if (state.mode === "work") {
        const newCount = state.sessionCount + 1;
        const nextMode: Mode =
          newCount % SESSIONS_BEFORE_LONG_BREAK === 0
            ? "longBreak"
            : "shortBreak";
        return { mode: nextMode, sessionCount: newCount };
      }
      // Any break → back to work (session count unchanged)
      return { ...state, mode: "work" };
    }

    case "CHANGE_MODE":
      return { ...state, mode: action.mode };

    case "RESET":
      return { mode: state.mode, sessionCount: 0 };

    default:
      return state;
  }
}
