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
import { useProfileStore } from '@/stores/useProfileStore';

interface DeleteModalProps {
  onDelete: () => void;
  username: string;
}

export default function DeleteModal({ onDelete, username }: DeleteModalProps) {
  const isDeleteModalOpen = useProfileStore.use.isDeleteModalOpen();
  const setDeleteModalOpen = useProfileStore.use.setDeleteModalOpen();
  const confirmLoading = useProfileStore.use.confirmLoading();

  return (
    <Dialog open={isDeleteModalOpen} onOpenChange={setDeleteModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Profile</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div>Are you sure you want to delete your account, {username}?</div>
          <div>All associated data will be permanently deleted.</div>
          <br />
          <div>This action cannot be undone.</div>
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={confirmLoading}
            onClick={() => setDeleteModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={confirmLoading}
            onClick={onDelete}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
