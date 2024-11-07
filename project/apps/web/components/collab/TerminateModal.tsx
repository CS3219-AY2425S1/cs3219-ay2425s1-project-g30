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

interface TerminateModalProps {
  collabPartner: string;
  onTerminate: () => void;
}

export default function TerminateModal({
  collabPartner,
  onTerminate,
}: TerminateModalProps) {
  const confirmLoading = useCollabStore.use.confirmLoading();
  const isTerminateModalOpen = useCollabStore.use.isTerminateModalOpen();
  const setTerminateModalOpen = useCollabStore.use.setTerminateModalOpen();

  return (
    <Dialog open={isTerminateModalOpen} onOpenChange={setTerminateModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>End Collaboration Session</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to end the current session with {collabPartner}?
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setTerminateModalOpen(false)}
            disabled={confirmLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onTerminate}
            disabled={confirmLoading}
          >
            End
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
