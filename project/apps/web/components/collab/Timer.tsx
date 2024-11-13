import React, { useEffect, useState } from 'react';
import { PauseIcon, PlayIcon, TimerResetIcon } from 'lucide-react';

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
    <div className="flex items-center gap-1">
      <span className="text-gray-400 tex-sm">{displayTime}</span>
      {timerState.isRunning ? (
        <PauseIcon
          onClick={pauseTimer}
          className="w-4 h-4 text-gray-700 cursor-pointer"
        />
      ) : (
        <PlayIcon
          onClick={startTimer}
          className="w-4 h-4 text-gray-700 cursor-pointer"
        />
      )}
      <TimerResetIcon
        onClick={resetTimer}
        className="w-4 h-4 text-gray-700 cursor-pointer"
      />
    </div>
  );
};

export default Timer;
