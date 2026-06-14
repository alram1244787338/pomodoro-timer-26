import { useRef, useImperativeHandle, forwardRef } from 'react';
import alertSound from '../assets/alert.mp3';

export interface AudioPlayerHandle {
  play: () => void;
  prime: () => void;
}

const AudioPlayer = forwardRef<AudioPlayerHandle>((_, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useImperativeHandle(ref, () => ({
    play() {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.error('Audio play failed:', e));
      }
    },
    prime() {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          // Expected error if file not loaded, we just need the user gesture
        });
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    },
  }));

  return (
    <audio ref={audioRef} src={alertSound} preload="auto">
      <track kind="captions" srcLang="en" src="" />
    </audio>
  );
});

export default AudioPlayer;
