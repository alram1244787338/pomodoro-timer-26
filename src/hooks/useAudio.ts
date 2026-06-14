import { useRef, useCallback } from 'react';
import alertSound from '../assets/alert.mp3';

export const useAudio = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const playAlert = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
  }, []);

  const primeAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Expected error if file not loaded, we just need the user gesture
      });
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return {
    audioRef,
    alertSound,
    playAlert,
    primeAudio
  };
};