import React from 'react';
import { type SessionCounterProps } from '../types';
import styles from './SessionCounter.module.css';

const SESSIONS_PER_CYCLE = 4;

const SessionCounter: React.FC<SessionCounterProps> = ({ sessionCount }) => (
  <p className={styles.sessionCount}>
    Session: {sessionCount} / {SESSIONS_PER_CYCLE}
  </p>
);

export default SessionCounter;
