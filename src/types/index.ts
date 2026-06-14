// src/types/index.ts

export type Mode = "work" | "shortBreak" | "longBreak";

export interface TimerSettings {
  work: number;
  shortBreak: number;
  longBreak: number;
}

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: TimerSettings) => void;
  settings: TimerSettings;
}

export interface ModeSelectorProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export interface TimerProps {
  timeLeft: number;
  isRunning: boolean;
  onStartStop: () => void;
  onReset: () => void;
}

export interface FeedbackFormElements extends HTMLFormControlsCollection {
  message: HTMLTextAreaElement;
}

export interface FeedbackFormElement extends HTMLFormElement {
  readonly elements: FeedbackFormElements;
}