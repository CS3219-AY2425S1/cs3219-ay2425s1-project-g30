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
  onLeaveSession: () => void;
}

export default function NotifyEndCollabModal({
  collabPartner,
  onLeaveSession,
}: NotifyEndCollabProps) {
  const confirmLoading = useCollabStore.use.confirmLoading();
  const isNotifyEndCollabModalOpen =
    useCollabStore.use.isNotifyEndCollabModalOpen();
  const setNotifyEndCollabModalOpen =
    useCollabStore.use.setNotifyEndCollabModalOpen();

  return (
    <Dialog
      open={isNotifyEndCollabModalOpen}
      onOpenChange={setNotifyEndCollabModalOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>End of Collaboration Session</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Your partner, {collabPartner}, has ended the session. You may continue
          working on the question, but please note:
        </DialogDescription>
        <DialogDescription>
          Any further changes will <strong>NOT be saved</strong>, and you will
          not be able to return to this page once you leave.
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onLeaveSession}
            disabled={confirmLoading}
          >
            Leave
          </Button>
          <Button
            variant="default"
            onClick={() => setNotifyEndCollabModalOpen(false)}
            disabled={confirmLoading}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
