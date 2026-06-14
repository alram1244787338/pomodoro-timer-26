import './App.css';

// Components
import Timer from './components/Timer';
import ModeSelector from './components/ModeSelector';
import SessionCounter from './components/SessionCounter';
import SettingsModal from './components/SettingsModal';
import Feedback from './components/Feedback';

// Hooks
import { useAudio } from './hooks/useAudio';
import { useSettings } from './hooks/useSettings';
import { usePomodoro } from './hooks/usePomodoro';
import { useDocumentTitle } from './hooks/useDocumentTitle';

function App() {
  const { audioRef, alertSound, playAlert, primeAudio } = useAudio();
  const { settings, isOpen, openSettings, closeSettings, saveSettings } = useSettings();
  const {
    actualTime,
    isRunning,
    actualMode,
    sessionCount,
    toggleTimer,
    resetTimer,
    changeMode,
  } = usePomodoro(settings, playAlert);

  useDocumentTitle(actualTime, actualMode, isRunning);

  // Unlock audio on the user gesture, then start/stop the timer.
  const handleStartStop = () => {
    primeAudio();
    toggleTimer();
  };

  return (
    <div className="page-layout">

      <header className="page-header">
        <div className="header-content">
          <h2>MelloFocus</h2>
          <button className="settings-button" onClick={openSettings}>
            ⚙️ Settings
          </button>
        </div>
      </header>

      <main className="page-content">
        <div className={`pomodoro-container ${actualMode}`}>
          <SessionCounter sessionCount={sessionCount} />

          <ModeSelector
            actualMode={actualMode}
            handleModeChange={changeMode}
          />

          <Timer
            actualTime={actualTime}
            isRunning={isRunning}
            handleStartStop={handleStartStop}
            handleReset={resetTimer}
          />
        </div>
      </main>

      <SettingsModal
        show={isOpen}
        onClose={closeSettings}
        onSave={saveSettings}
        currentSettings={settings}
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
