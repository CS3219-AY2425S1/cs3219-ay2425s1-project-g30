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
import { useAuthStore } from '@/stores/useAuthStore';
import { useCollabStore } from '@/stores/useCollabStore';

interface TerminateModalProps {
  onTerminate: () => void;
}

export default function TerminateModal({ onTerminate }: TerminateModalProps) {
  const user = useAuthStore.use.user();
  const collab = useCollabStore.use.collaboration();
  const confirmLoading = useCollabStore.use.confirmLoading();
  const isTerminateModalOpen = useCollabStore.use.isTerminateModalOpen();
  const setTerminateModalOpen = useCollabStore.use.setTerminateModalOpen();
  const collabPartner =
    collab?.collab_user1.id === user?.id
      ? collab?.collab_user2
      : collab?.collab_user1;

  return (
    <Dialog open={isTerminateModalOpen} onOpenChange={setTerminateModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>End Collaboration Session</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div>
            Are you sure you want to end the current session with{' '}
            {collabPartner?.username}?
          </div>
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
