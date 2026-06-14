import React from 'react';
import { type ModeSelectorProps, type Mode } from '../types';
import { MODE_LABELS } from '../constants';
import styles from './ModeSelector.module.css';

const MODES: Mode[] = ['work', 'shortBreak', 'longBreak'];

const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onModeChange }) => (
  <div className={styles.modeTabs}>
    {MODES.map(m => (
      <button
        key={m}
        className={`${styles.modeButton} ${mode === m ? styles.active : ''}`}
        onClick={() => onModeChange(m)}>
        {MODE_LABELS[m]}
      </button>
    ))}
  </div>
);

export default ModeSelector;
