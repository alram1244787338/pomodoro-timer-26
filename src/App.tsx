import { useState } from 'react';
import './App.css';
import { type TimerSettings } from './types';
import { APP_NAME, DEFAULT_SETTINGS } from './constants';

// Components
import Timer from './components/Timer';
import ModeSelector from './components/ModeSelector';
import SettingsModal from './components/SettingsModal';
import Feedback from './components/Feedback';

// Hooks
import { useAudio } from './hooks/useAudio';
import { usePomodoro } from './hooks/usePomodoro';
import { useDocumentTitle } from './hooks/useDocumentTitle';

function App() {
  // 1. Setup Audio
  const { audioRef, alertSound, playAlert, primeAudio } = useAudio();

  // 2. Setup Settings State (stored in seconds)
  const [timerSettings, setTimerSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 3. Setup Pomodoro Logic (Injecting settings and the sound player)
  const {
    timeLeft,
    isRunning,
    mode,
    sessionCount,
    toggleTimer,
    resetTimer,
    changeMode,
    updateTimeFromSettings
  } = usePomodoro(timerSettings, playAlert);

  // 4. Keep the browser tab title in sync
  useDocumentTitle(timeLeft, mode, isRunning);

  // --- Handlers ---

  const handleStartStop = () => {
    primeAudio();
    toggleTimer();
  };

  const handleSaveSettings = (newSettings: TimerSettings) => {
    // SettingsModal already hands back seconds, so we just store and apply.
    setTimerSettings(newSettings);
    updateTimeFromSettings(newSettings);
    setIsSettingsOpen(false);
  };

  // --- Render ---

  return (
    <div className="page-layout">

      <header className="page-header">
        <div className="header-content">
          <h2>{APP_NAME}</h2>
          <button
             className="settings-button"
             onClick={() => setIsSettingsOpen(true)}
          >
            ⚙️ Settings
          </button>
        </div>
      </header>

      <main className="page-content">
        <div className={`pomodoro-container ${mode}`}>
          <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
            Session: {sessionCount} / 4
          </p>

          <ModeSelector
            mode={mode}
            onModeChange={changeMode}
          />

          <Timer
            timeLeft={timeLeft}
            isRunning={isRunning}
            onStartStop={handleStartStop}
            onReset={resetTimer}
          />
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        settings={timerSettings}
      />

      <footer className="page-footer">
        <p>
          A portfolio project by <a href="https://github.com/MatheusPMello/pomodoro-timer" target="_blank" rel="noopener noreferrer">MatheusPMello</a>
        </p>
        <Feedback />
      </footer>

      {/* The Audio Element is managed by hook*/}
      <audio ref={audioRef} src={alertSound} preload='auto'>
        <track kind="captions" srcLang="en" src=""/>
      </audio>

    </div>
  );
}

export default App;
