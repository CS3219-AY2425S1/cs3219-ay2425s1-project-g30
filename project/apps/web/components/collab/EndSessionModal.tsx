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

interface EndSessionModalProps {
  collabPartner: string;
  onEndSession: () => void;
}

export default function EndSessionModal({
  collabPartner,
  onEndSession,
}: EndSessionModalProps) {
  const confirmLoading = useCollabStore.use.confirmLoading();
  const isEndSessionModalOpen = useCollabStore.use.isEndSessionModalOpen();
  const setEndSessionModalOpen = useCollabStore.use.setEndSessionModalOpen();

  return (
    <Dialog open={isEndSessionModalOpen} onOpenChange={setEndSessionModalOpen}>
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
            onClick={() => setEndSessionModalOpen(false)}
            disabled={confirmLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onEndSession}
            disabled={confirmLoading}
          >
            End
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
