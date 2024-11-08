'use client';

import { useEffect, useState } from 'react';
import { useTimer } from 'react-timer-hook';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCollabStore } from '@/stores/useCollabStore';

interface EndSessionModalProps {
  collabPartner: string;
  onEndSession: () => void;
}

export default function EndSessionModal({
  collabPartner,
  onEndSession,
}: EndSessionModalProps) {
  const [confirmEnd, setConfirmEnd] = useState(false);
  const confirmLoading = useCollabStore.use.confirmLoading();
  const isEndSessionModalOpen = useCollabStore.use.isEndSessionModalOpen();
  const setEndSessionModalOpen = useCollabStore.use.setEndSessionModalOpen();

  const { seconds, pause, restart } = useTimer({
    expiryTimestamp: new Date(),
    autoStart: false,
    onExpire: () => {
      console.log('timer ended for FIRST user');
      console.log('collab ended for FIRST user');
      onEndSession();
    },
  });

  useEffect(() => {
    if (confirmEnd) {
      console.log('timer restarted for FIRST user');
      const newExpiry = new Date();
      newExpiry.setSeconds(newExpiry.getSeconds() + 5);
      restart(newExpiry);
    } else pause();
  }, [confirmEnd, pause, restart]);

  useEffect(() => {
    if (!isEndSessionModalOpen) setConfirmEnd(false);
  }, [isEndSessionModalOpen]);

  const renderCountdown = () => (
    <div className="flex flex-row items-center space-x-2">
      <p className="text-lg font-medium text-black">
        Your session will end in...
      </p>
      <span className="text-lg font-medium text-gray-600">{seconds}s</span>
    </div>
  );

  return (
    <Dialog open={isEndSessionModalOpen} onOpenChange={setEndSessionModalOpen}>
      <DialogContent className={confirmEnd ? 'flex flex-col items-center' : ''}>
        <DialogHeader>
          {!confirmEnd && <DialogTitle>End Collaboration Session</DialogTitle>}
        </DialogHeader>

        {!confirmEnd ? (
          <DialogDescription>
            Are you sure you want to end the current session with{' '}
            {collabPartner}?
          </DialogDescription>
        ) : (
          renderCountdown()
        )}

        <DialogFooter className={confirmEnd ? 'flex justify-center' : ''}>
          <Button
            variant="outline"
            onClick={() => setEndSessionModalOpen(false)}
            disabled={confirmLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => setConfirmEnd(true)}
            disabled={confirmEnd}
            className={confirmEnd ? 'hidden' : ''}
          >
            End
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
