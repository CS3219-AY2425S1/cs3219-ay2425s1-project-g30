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

interface LeaveSessionModalProps {
  onLeaveSession: () => void;
}

export default function LeaveSessionModal({
  onLeaveSession,
}: LeaveSessionModalProps) {
  const confirmLoading = useCollabStore.use.confirmLoading();
  const isLeaveSessionModalOpen = useCollabStore.use.isLeaveSessionModalOpen();
  const setIsLeaveSessionModalOpen =
    useCollabStore.use.setIsLeaveSessionModalOpen();

  return (
    <Dialog
      open={isLeaveSessionModalOpen}
      onOpenChange={setIsLeaveSessionModalOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave Collaboration Session</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to leave the session now?
        </DialogDescription>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsLeaveSessionModalOpen(false)}
            disabled={confirmLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onLeaveSession}
            disabled={confirmLoading}
          >
            Leave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
