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

interface EndCollabModalProps {
  onEndCollab: () => void;
}

export default function EndCollabModal({ onEndCollab }: EndCollabModalProps) {
  const confirmLoading = useCollabStore.use.confirmLoading();
  const isEndCollabModalOpen = useCollabStore.use.isEndCollabModalOpen();
  const setEndCollabModalOpen = useCollabStore.use.setEndCollabModalOpen();

  return (
    <Dialog open={isEndCollabModalOpen} onOpenChange={setEndCollabModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>End Collaboration Session</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to end the session now?
        </DialogDescription>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setEndCollabModalOpen(false)}
            disabled={confirmLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onEndCollab}
            disabled={confirmLoading}
          >
            End Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
