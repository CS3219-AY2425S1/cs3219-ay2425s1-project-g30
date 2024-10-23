'use client';

import { setInterval, clearInterval } from 'audio-context-timers';
import { useEffect, useState, useRef, useCallback } from 'react';

export const useAudioContextTimer = (intervalMs: number) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + intervalMs / 1000);
    }, intervalMs);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [intervalMs]);

  const resetTimer = useCallback(() => {
    setElapsedTime(0);
  }, []);

  return { elapsedTime, resetTimer };
};
