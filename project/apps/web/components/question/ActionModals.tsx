'use client';

import { QuestionDto, UpdateQuestionDto } from '@repo/dtos/questions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import DeleteModal from '@/components/question/DeleteModal';
import EditModal from '@/components/question/EditModal';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useToast } from '@/hooks/use-toast';
import { deleteQuestion, updateQuestion } from '@/lib/api/question';
import { useQuestionsStore } from '@/stores/useQuestionStore';

interface ActionModalsProps {
  id: string;
  question: QuestionDto;
}

export const ActionModals = ({ id, question }: ActionModalsProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const setConfirmLoading = useQuestionsStore.use.setConfirmLoading();
  const setEditModalOpen = useQuestionsStore.use.setEditModalOpen();
  const setDeleteModalOpen = useQuestionsStore.use.setDeleteModalOpen();

  const { toast } = useToast();
  const updateMutation = useMutation({
    mutationFn: (updatedQuestion: UpdateQuestionDto) =>
      updateQuestion(updatedQuestion),
    onMutate: () => setConfirmLoading(true),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.Question, id],
      });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.Question] });
      setEditModalOpen(false);
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Question updated successfully',
      });
    },
    onSettled: () => setConfirmLoading(false),
    onError: (error) => {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteQuestion(id),
    onMutate: () => setConfirmLoading(true),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.Question, id],
      });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.Question] });
      setDeleteModalOpen(false);
      router.push('/questions');
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Question deleted successfully',
      });
    },
    onSettled: () => setConfirmLoading(false),
    onError: (error) => {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message,
      });
    },
  });

  const handleEditQuestion = (updatedQuestion: UpdateQuestionDto) => {
    updateMutation.mutate(updatedQuestion);
  };

  const handleDeleteQuestion = () => {
    deleteMutation.mutate(id);
  };
  return (
    <>
      {question && (
        <EditModal onSubmit={handleEditQuestion} initialValues={question} />
      )}

      {question && (
        <DeleteModal
          onDelete={handleDeleteQuestion}
          questionTitle={question.q_title}
        />
      )}
    </>
  );
};
