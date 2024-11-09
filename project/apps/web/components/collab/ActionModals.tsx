'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import TerminateModal from '@/components/collab/TerminateModal';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCollabStore } from '@/stores/useCollabStore';

interface ActionModalsProps {
  collabId: string;
  collabPartner: string;
  onEndSession: () => void;
}

export const ActionModals = ({
  collabId,
  collabPartner,
  onEndSession,
}: ActionModalsProps) => {
  const user = useAuthStore.use.user();
  const queryClient = useQueryClient();
  const setConfirmLoading = useCollabStore.use.setConfirmLoading();
  const setTerminateModalOpen = useCollabStore.use.setTerminateModalOpen();
  const endCollab = useCollabStore.use.endCollab();

  const router = useRouter();
  const { toast } = useToast();

  const terminateMutation = useMutation({
    mutationFn: (id: string) => endCollab(id),
    onMutate: () => setConfirmLoading(true),
    onSuccess: async () => {
      setTerminateModalOpen(false);
      onEndSession();
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.Collab, user?.id],
      });
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
      {collabId && (
        <TerminateModal
          collabPartner={collabPartner}
          onTerminate={handleEndCollab}
        />
      )}
    </>
  );
};
