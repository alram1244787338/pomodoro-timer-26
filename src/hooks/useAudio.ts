import { useRef, useCallback } from 'react';
import type { AudioPlayerHandle } from '../components/AudioPlayer';

export const useAudio = () => {
  const playerRef = useRef<AudioPlayerHandle>(null);

  const playAlert = useCallback(() => {
    playerRef.current?.play();
  }, []);

  const primeAudio = useCallback(() => {
    playerRef.current?.prime();
  }, []);

  return { playerRef, playAlert, primeAudio };
};
