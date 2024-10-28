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
import { useManageUsersStore } from '@/stores/useManageUsersStore';

interface DeleteModalProps {
  onDelete: () => void;
  username: string;
}

export default function DeleteModal({ onDelete, username }: DeleteModalProps) {
  const isDeleteModalOpen = useManageUsersStore.use.isDeleteModalOpen();
  const setDeleteModalOpen = useManageUsersStore.use.setDeleteModalOpen();

  return (
    <Dialog open={isDeleteModalOpen} onOpenChange={setDeleteModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div>Confirm the deletion of user {username}?</div>
          <div>This action cannot be undone.</div>
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
