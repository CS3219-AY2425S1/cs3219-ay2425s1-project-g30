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
import { useQuestionsStore } from '@/stores/useQuestionStore';

interface DeleteModalProps {
  onDelete: () => void;
  questionTitle: string;
}

const DeleteModal = ({ onDelete, questionTitle }: DeleteModalProps) => {
  const isDeleteModalOpen = useQuestionsStore.use.isDeleteModalOpen();
  const setDeleteModalOpen = useQuestionsStore.use.setDeleteModalOpen();

  return (
    <Dialog open={isDeleteModalOpen} onOpenChange={setDeleteModalOpen}>
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
};

export default DeleteModal;
