import React from 'react';
import { type TimerProps } from '../types';
import { formatTime } from '../utils/timeHelpers';

import styles from './Timer.module.css';

const Timer: React.FC<TimerProps> = ({ time, isRunning, onStartStop, onReset }) => (
  <div>
    <div className={styles.timer}>
      {formatTime(time)}
    </div>
    <div className={styles.actionButtons}>
      <button
        className="action-button start-button"
        onClick={onStartStop}>
        {isRunning ? "Pause" : "Start"}
      </button>
      <button
        className="action-button reset-button"
        onClick={onReset}>
        Reset
      </button>
    </div>
  </div>
);

export default Timer;
