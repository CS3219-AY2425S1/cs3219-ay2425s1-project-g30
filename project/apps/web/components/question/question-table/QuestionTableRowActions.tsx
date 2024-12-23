'use client';

import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { QuestionDto } from '@repo/dtos/questions';
import { Row } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQuestionsStore } from '@/stores/useQuestionStore';

interface QuestionTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function QuestionTableRowActions<TData>({
  row,
}: QuestionTableRowActionsProps<TData>) {
  const user = useAuthStore.use.user();
  const setEditModalOpen = useQuestionsStore.use.setEditModalOpen();
  const setDeleteModalOpen = useQuestionsStore.use.setDeleteModalOpen();
  const setSelectedQuestion = useQuestionsStore.use.setSelectedQuestion();

  const question = row.original as QuestionDto;
  const handleOpenEdit = () => {
    setSelectedQuestion(question);
    setEditModalOpen(true);
  };

  const handleOpenDelete = () => {
    setSelectedQuestion(question);
    setDeleteModalOpen(true);
  };
  return (
    <>
      {user && user.role === 'Admin' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
              <DotsHorizontalIcon className="w-4 h-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem className="gap-2" onSelect={handleOpenEdit}>
              <Pencil className="w-4 h-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2" onSelect={handleOpenDelete}>
              <Trash2 className="w-4 h-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}
