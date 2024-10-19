'use client';

import { CreateQuestionDto } from '@repo/dtos/questions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Suspense, useState } from 'react';

import { ActionModals } from '@/components/question/ActionModals';
import { Button } from '@/components/ui/button';
import { QUERY_KEYS } from '@/constants/queryKeys';
import {
  QuestionsStateProvider,
  useQuestionsState,
} from '@/contexts/QuestionsStateContext';
import { useToast } from '@/hooks/use-toast';
import { createQuestion } from '@/lib/api/question';

import CreateModal from './components/CreateModal';
import { QuestionTable } from './components/question-table/QuestionTable';
import QuestionsSkeleton from './components/QuestionsSkeleton';

const QuestionRepositoryContent = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const {
    confirmLoading,
    setConfirmLoading,
    selectedQuestion,
    isEditModalOpen,
    isDeleteModalOpen,
    setEditModalOpen,
    setDeleteModalOpen,
  } = useQuestionsState();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (newQuestion: CreateQuestionDto) => createQuestion(newQuestion),
    onMutate: () => setConfirmLoading(true),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.Question] });
      setCreateModalOpen(false);
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Question created successfully',
      });
    },
    onSettled: () => setConfirmLoading(false),
    onError: (error: any) => {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message,
      });
    },
  });

  const handleCreateQuestion = (newQuestion: CreateQuestionDto) => {
    createMutation.mutate(newQuestion);
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center my-4">
        <h1 className="text-xl font-semibold">Question Repository</h1>
        <Button
          variant="outline"
          disabled={confirmLoading}
          onClick={() => setCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <QuestionTable />

      <CreateModal
        open={isCreateModalOpen}
        setOpen={setCreateModalOpen}
        onCreate={handleCreateQuestion}
      />
      {selectedQuestion && (
        <ActionModals
          id={selectedQuestion.id}
          question={selectedQuestion}
          setConfirmLoading={setConfirmLoading}
          isEditModalOpen={isEditModalOpen}
          setEditModalOpen={setEditModalOpen}
          isDeleteModalOpen={isDeleteModalOpen}
          setDeleteModalOpen={setDeleteModalOpen}
        />
      )}
    </div>
  );
};

const QuestionRepository = () => {
  return (
    <QuestionsStateProvider>
      <Suspense fallback={<QuestionsSkeleton />}>
        <QuestionRepositoryContent />
      </Suspense>
    </QuestionsStateProvider>
  );
};

export default QuestionRepository;
