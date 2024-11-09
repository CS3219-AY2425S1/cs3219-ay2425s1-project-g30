import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

export interface TimerState {
  isRunning: boolean;
  elapsedTime: number; // in seconds
  lastStartTime: number | null; // UNIX timestamp in milliseconds
}

interface TimerProps {
  timerState: TimerState;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
}

const Timer: React.FC<TimerProps> = ({
  timerState,
  startTimer,
  pauseTimer,
  resetTimer,
}) => {
  const [displayTime, setDisplayTime] = useState<string>('00:00:00');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const updateDisplayTime = () => {
      let totalSeconds = timerState.elapsedTime;
      if (timerState.isRunning && timerState.lastStartTime) {
        const currentTime = Date.now();
        totalSeconds += Math.floor(
          (currentTime - timerState.lastStartTime) / 1000,
        );
      }

      const hours = Math.floor(totalSeconds / 3600)
        .toString()
        .padStart(2, '0');
      const minutes = Math.floor((totalSeconds % 3600) / 60)
        .toString()
        .padStart(2, '0');
      const seconds = (totalSeconds % 60).toString().padStart(2, '0');
      setDisplayTime(`${hours}:${minutes}:${seconds}`);
    };

    updateDisplayTime();

    if (timerState.isRunning) {
      interval = setInterval(updateDisplayTime, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState]);

  return (
    <div className="flex items-center gap-4">
      <span className="text-2xl font-mono">{displayTime}</span>
      {timerState.isRunning ? (
        <Button onClick={pauseTimer} variant="destructive">
          Pause
        </Button>
      ) : (
        <Button onClick={startTimer} variant="default">
          Start
        </Button>
      )}
      <Button
        onClick={resetTimer}
        variant="ghost"
        disabled={timerState.elapsedTime === 0}
      >
        Reset
      </Button>
    </div>
  );
};

export default Timer;
