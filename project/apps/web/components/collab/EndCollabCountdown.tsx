import { useEffect } from 'react';
import { useTimer } from 'react-timer-hook';

import { useCollabStore } from '@/stores/useCollabStore';

interface EndCollabCountdownProps {
  onEndCollab: () => void;
}

export const EndCollabCountdown = ({
  onEndCollab,
}: EndCollabCountdownProps) => {
  const collabExpiryTime = useCollabStore.use.collabExpiryTime();
  const collabEnding = useCollabStore.use.collabEnding();
  const isNotifyEndCollabModalOpen =
    useCollabStore.use.isNotifyEndCollabModalOpen();

  const { seconds, restart, pause } = useTimer({
    expiryTimestamp: new Date(),
    autoStart: false,
    onExpire: () => {
      onEndCollab();
    },
  });

  useEffect(() => {
    if (!isNotifyEndCollabModalOpen && collabEnding) {
      restart(collabExpiryTime);
    } else pause();
  }, [isNotifyEndCollabModalOpen, collabEnding, collabExpiryTime]);

  return (
    collabEnding && (
      <div className="flex items-center mb-4">
        <span className="mr-4 font-medium text-md">
          Your session is ending in... {seconds}s
        </span>
      </div>
    )
  );
};
