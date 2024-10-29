'use client';

import { CreateQuestionDto } from '@repo/dtos/questions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Suspense } from 'react';

import { ActionModals } from '@/components/question/ActionModals';
import CreateModal from '@/components/question/CreateModal';
import { QuestionTable } from '@/components/question/question-table/QuestionTable';
import QuestionsSkeleton from '@/components/question/QuestionsSkeleton';
import { Button } from '@/components/ui/button';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useToast } from '@/hooks/use-toast';
import { createQuestion } from '@/lib/api/question';
import { useQuestionsStore } from '@/stores/useQuestionStore';

const QuestionRepositoryContent = () => {
  const queryClient = useQueryClient();
  const selectedQuestion = useQuestionsStore.use.selectedQuestion();
  const confirmLoading = useQuestionsStore.use.confirmLoading();
  const setConfirmLoading = useQuestionsStore.use.setConfirmLoading();
  const setCreateModalOpen = useQuestionsStore.use.setCreateModalOpen();

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
    <div className="container p-6 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between my-4">
        <h1 className="text-xl font-semibold">Question Repository</h1>
        <Button
          variant="outline"
          disabled={confirmLoading}
          onClick={() => setCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Table */}
      <QuestionTable />

      <CreateModal onCreate={handleCreateQuestion} />
      {selectedQuestion && (
        <ActionModals id={selectedQuestion.id} question={selectedQuestion} />
      )}
    </div>
  );
};

const QuestionRepository = () => {
  return (
    <Suspense fallback={<QuestionsSkeleton />}>
      <QuestionRepositoryContent />
    </Suspense>
  );
};

export default QuestionRepository;
