// src/types/index.ts

export type Mode = "work" | "shortBreak" | "longBreak";

export interface TimerSettings {
  work: number;
  shortBreak: number;
  longBreak: number;
}

// --- Pomodoro State Machine ---

export interface PomodoroState {
  mode: Mode;
  sessionCount: number;
}

export type PomodoroAction =
  | { type: "TIMER_END" }
  | { type: "CHANGE_MODE"; mode: Mode }
  | { type: "RESET" };

// --- Component Props ---

export interface SettingsModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (settings: TimerSettings) => void;
  currentSettings: TimerSettings;
}

export interface ModeSelectorProps {
  actualMode: Mode;
  handleModeChange: (mode: Mode) => void;
}

export interface TimerProps {
  actualTime: number;
  isRunning: boolean;
  handleStartStop: () => void;
  handleReset: () => void;
}

export interface FeedbackFormElements extends HTMLFormControlsCollection {
  message: HTMLTextAreaElement;
}

export interface FeedbackFormElement extends HTMLFormElement {
  readonly elements: FeedbackFormElements;
}
