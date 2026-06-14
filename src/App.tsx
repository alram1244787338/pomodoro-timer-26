import './App.css';

// Components
import Timer from './components/Timer';
import ModeSelector from './components/ModeSelector';
import SettingsModal from './components/SettingsModal';
import Feedback from './components/Feedback';

// Hooks
import { usePomodoroApp } from './hooks/usePomodoroApp';

function App() {
  const {
    actualTime,
    isRunning,
    actualMode,
    sessionCount,
    handleStartStop,
    resetTimer,
    changeMode,
    settingsInMinutes,
    showSettings,
    openSettings,
    handleSaveSettings,
    closeSettings,
    audioRef,
    alertSound,
  } = usePomodoroApp();

  return (
    <div className="page-layout">

      <header className="page-header">
        <div className="header-content">
          <h2>MelloFocus</h2>
          <button
             className="settings-button"
             onClick={openSettings}
          >
            ⚙️ Settings
          </button>
        </div>
      </header>

      <main className="page-content">
        <div className={`pomodoro-container ${actualMode}`}>
          <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
            Session: {sessionCount} / 4
          </p>

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
        show={showSettings}
        onClose={closeSettings}
        onSave={handleSaveSettings}
        currentSettings={settingsInMinutes}
      />

      <footer className="page-footer">
        <p>
          A portfolio project by <a href="https://github.com/MatheusPMello/pomodoro-timer" target="_blank" rel="noopener noreferrer">MatheusPMello</a>
        </p>
        <Feedback />
      </footer>

      {/* The Audio Element is managed by the useAudio hook */}
      <audio ref={audioRef} src={alertSound} preload='auto'>
        <track kind="captions" srcLang="en" src=""/>
      </audio>

    </div>
  );
}

export default App;