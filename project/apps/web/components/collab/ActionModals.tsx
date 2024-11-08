'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import EndCollabModal from '@/components/collab/EndCollabModal';
import EndSessionModal from '@/components/collab/EndSessionModal';
import NotifyEndCollabModal from '@/components/collab/NotifyEndCollabModal';
import { useToast } from '@/hooks/use-toast';
import { useCollabStore } from '@/stores/useCollabStore';

interface ActionModalsProps {
  collabId: string;
  collabPartner: string;
  onEndSession: () => void;
  onEndCollab: () => void;
}

export const ActionModals = ({
  collabId,
  collabPartner,
  onEndSession,
  onEndCollab,
}: ActionModalsProps) => {
  const endSession = useCollabStore.use.endSession();
  const setConfirmLoading = useCollabStore.use.setConfirmLoading();

  const router = useRouter();
  const { toast } = useToast();

  const endSessionMutation = useMutation({
    mutationFn: async () => await onEndSession(),
    onMutate: () => setConfirmLoading(true),
    onSuccess: async () => {
      endSession();
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

  const handleEndSession = () => {
    endSessionMutation.mutate();
  };

  return (
    <>
      {collabId && (
        <EndSessionModal
          collabPartner={collabPartner}
          onEndSession={handleEndSession}
        />
      )}
      {collabId && <EndCollabModal onEndCollab={onEndCollab} />}
      {collabId && (
        <NotifyEndCollabModal
          collabPartner={collabPartner}
          onEndCollab={onEndCollab}
        />
      )}
    </>
  );
};
