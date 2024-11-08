'use client';

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

interface NotifyEndCollabProps {
  collabPartner: string;
  onEndCollab: () => void;
}

export default function NotifyEndCollabModal({
  collabPartner,
  onEndCollab,
}: NotifyEndCollabProps) {
  const confirmLoading = useCollabStore.use.confirmLoading();
  const isNotifyEndCollabModalOpen =
    useCollabStore.use.isNotifyEndCollabModalOpen();
  const setNotifyEndCollabModalOpen =
    useCollabStore.use.setNotifyEndCollabModalOpen();
  const setCollabEnding = useCollabStore.use.setCollabEnding();
  const setCollabExpiryTime = useCollabStore.use.setCollabExpiryTime();

  const handleContinue = () => {
    const expiryTime = new Date();
    expiryTime.setSeconds(expiryTime.getSeconds() + 60);
    setCollabExpiryTime(expiryTime);
    setNotifyEndCollabModalOpen(false);
    setCollabEnding(true);
  };

  return (
    <Dialog open={isNotifyEndCollabModalOpen} onOpenChange={handleContinue}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>End of Collaboration Session</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Your partner, {collabPartner}, has ended the session. You may continue
          to work on the question until the session closes.
        </DialogDescription>
        <DialogDescription>The session will close in 60s.</DialogDescription>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onEndCollab}
            disabled={confirmLoading}
          >
            End Now
          </Button>
          <Button
            variant="default"
            onClick={handleContinue}
            disabled={confirmLoading}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
