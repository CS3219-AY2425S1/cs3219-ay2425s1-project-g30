"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onDelete: () => void;
  questionTitle: string;
}

export default function DeleteModal({
  open,
  setOpen,
  onDelete,
  questionTitle,
}: DeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Question</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div>
            Are you sure you want to delete the question "{questionTitle}"?
          </div>
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
