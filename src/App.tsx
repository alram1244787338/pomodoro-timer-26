import { useState } from 'react';
import './App.css';
import { type TimerSettings } from './types';
import { DEFAULT_SETTINGS_SECONDS, SESSIONS_BEFORE_LONG_BREAK, APP_NAME } from './constants';

// Components
import Timer from './components/Timer';
import ModeSelector from './components/ModeSelector';
import SettingsModal from './components/SettingsModal';
import Feedback from './components/Feedback';
import AudioPlayer from './components/AudioPlayer';

// Hooks
import { useAudio } from './hooks/useAudio';
import { usePomodoro } from './hooks/usePomodoro';
import { useDocumentTitle } from './hooks/useDocumentTitle';

function App() {
  // 1. Setup Audio
  const { playerRef, playAlert, primeAudio } = useAudio();

  // 2. Setup Settings State
  const [timerSettings, setTimerSettings] = useState<TimerSettings>(DEFAULT_SETTINGS_SECONDS);
  const [showSettings, setShowSettings] = useState(false);

  // 3. Setup Pomodoro Logic (Injecting settings and the sound player)
  const {
    time,
    isRunning,
    mode,
    sessionCount,
    toggleTimer,
    resetTimer,
    changeMode,
    updateTimeFromSettings
  } = usePomodoro(timerSettings, playAlert);

  // --- Handlers ---

  const handleStartStop = () => {
    primeAudio();
    toggleTimer();
  };

  const handleSaveSettings = (newSettings: TimerSettings) => {
    setTimerSettings(newSettings);
    updateTimeFromSettings(newSettings);
    setShowSettings(false);
  };

  useDocumentTitle(time, mode, isRunning);

  // --- Render ---

  return (
    <div className="page-layout">
      
      <header className="page-header">
        <div className="header-content">
          <h2>{APP_NAME}</h2>
          <button 
             className="settings-button" 
             onClick={() => setShowSettings(true)}
          >
            ⚙️ Settings
          </button>
        </div>
      </header>

      <main className="page-content">
        <div className={`pomodoro-container ${mode}`}>
          <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
            Session: {sessionCount} / {SESSIONS_BEFORE_LONG_BREAK}
          </p>

          <ModeSelector
            mode={mode}
            onModeChange={changeMode}
          />

          <Timer
            time={time}
            isRunning={isRunning}
            onStartStop={handleStartStop}
            onReset={resetTimer}
          />
        </div>
      </main>

      <SettingsModal 
        show={showSettings} 
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
        currentSettings={timerSettings}
      />

      <footer className="page-footer">
        <p>
          A portfolio project by <a href="https://github.com/MatheusPMello/pomodoro-timer" target="_blank" rel="noopener noreferrer">MatheusPMello</a>
        </p>
        <Feedback />
      </footer>

      <AudioPlayer ref={playerRef} />

    </div>
  );
}

export default App;