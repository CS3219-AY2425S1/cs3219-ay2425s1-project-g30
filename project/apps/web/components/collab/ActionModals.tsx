'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import TerminateModal from '@/components/collab/TerminateModal';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useToast } from '@/hooks/use-toast';
import { CollabInfoDto } from '@repo/dtos/collab';
import { endCollab } from '@/lib/api/collab';
import { useCollabStore } from '@/stores/useCollabStore';

interface ActionModalsProps {
  collab: CollabInfoDto;
  collabId: string;
}

export const ActionModals = ({ collab, collabId }: ActionModalsProps) => {
  const setConfirmLoading = useCollabStore.use.setConfirmLoading();
  const setTerminateModalOpen = useCollabStore.use.setTerminateModalOpen();

  const queryClient = useQueryClient();
  const router = useRouter();

  const { toast } = useToast();

  const terminateMutation = useMutation({
    mutationFn: (id: string) => endCollab(id),
    onMutate: () => setConfirmLoading(true),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.Collab, collabId],
      });
      setTerminateModalOpen(false);
      router.replace('/');
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Collaboration session ended successfully',
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

  const handleEndCollab = () => {
    terminateMutation.mutate(collabId);
  };

  return (
    <>
      {collab && (
        <TerminateModal onTerminate={handleEndCollab} collab={collab} />
      )}
    </>
  );
};
