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

interface DeleteModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onDelete: () => void;
  username: string;
}

export default function DeleteModal({
  open,
  setOpen,
  onDelete,
  username,
}: DeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Profile</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div>Are you sure you want to delete your account {username}?</div>
          <div>This action cannot be undone.</div>
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
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
