'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import EndSessionModal from '@/components/collab/EndSessionModal';
import LeaveSessionModal from '@/components/collab/LeaveSessionModal';
import NotifyEndCollabModal from '@/components/collab/NotifyEndCollabModal';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCollabStore } from '@/stores/useCollabStore';

interface ActionModalsProps {
  collabId: string;
  collabPartner: string;
  notifyPartner: () => void;
}

export const ActionModals = ({
  collabId,
  collabPartner,
  notifyPartner,
}: ActionModalsProps) => {
  const user = useAuthStore.use.user();
  const queryClient = useQueryClient();
  const setConfirmLoading = useCollabStore.use.setConfirmLoading();
  const endCollab = useCollabStore.use.endCollab();
  const leaveSession = useCollabStore.use.leaveSession();
  const setConfirmLoading = useCollabStore.use.setConfirmLoading();

  const router = useRouter();
  const { toast } = useToast();

  const endSessionMutation = useMutation({
    mutationFn: async () => endCollab(collabId),
    onMutate: () => setConfirmLoading(true),
    onSuccess: async () => {
      notifyPartner();
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.Collab, user?.id],
      });
      router.replace('/');
      toast({
        variant: 'success',
        title: 'End of Collaboration Session',
        description: 'You have ended the session successfully',
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

  const leaveSessionMutation = useMutation({
    mutationFn: async () => await leaveSession(),
    onMutate: () => setConfirmLoading(true),
    onSuccess: async () => {
      router.replace('/');
      toast({
        variant: 'default',
        title: 'End of Collaboration Session',
        description: 'You have succesfully left the session',
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

  const handleLeaveSession = () => {
    leaveSessionMutation.mutate();
  };

  return (
    <>
      {collabId && (
        <EndSessionModal
          collabPartner={collabPartner}
          onEndSession={handleEndSession}
        />
      )}
      {collabId && <LeaveSessionModal onLeaveSession={handleLeaveSession} />}
      {collabId && (
        <NotifyEndCollabModal
          collabPartner={collabPartner}
          onLeaveSession={handleLeaveSession}
        />
      )}
    </>
  );
};
