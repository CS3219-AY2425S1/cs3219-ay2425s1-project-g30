'use client';

import { CollabInfoDto } from '@repo/dtos/collab';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { notFound, useRouter } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';

import { ActionModals } from '@/components/collab/ActionModals';
import CollaborativeEditor, {
  CollaborativeEditorRef,
} from '@/components/collab/CollaborativeEditor';
import CollabSkeleton from '@/components/collab/CollabSkeleton';
import { EndCollabCountdown } from '@/components/collab/EndCollabCountdown';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useToast } from '@/hooks/use-toast';
import { getCollabInfoById } from '@/lib/api/collab';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCollabStore } from '@/stores/useCollabStore';

interface CollabPageProps {
  params: {
    id: string;
  };
}

const CollabPageContent = ({ id }: { id: string }) => {
  const user = useAuthStore.use.user();
  const collabEnding = useCollabStore.use.collabEnding();
  const endCollab = useCollabStore.use.endCollab();
  const setEndSessionModalOpen = useCollabStore.use.setEndSessionModalOpen();
  const setEndCollabModalOpen = useCollabStore.use.setEndCollabModalOpen();
  const setConfirmLoading = useCollabStore.use.setConfirmLoading();
  const editorRef = useRef<CollaborativeEditorRef>(null);

  const router = useRouter();
  const { toast } = useToast();

  const { data: collabInfo } = useSuspenseQuery<CollabInfoDto>({
    queryKey: [QUERY_KEYS.Collab, id],
    queryFn: () => getCollabInfoById(id),
  });

  if (!collabInfo) {
    return notFound();
  }

  const partnerUsername =
    collabInfo.collab_user1.id == user!.id
      ? collabInfo.collab_user2.username
      : collabInfo.collab_user1.username;

  const question = {
    title: collabInfo.question.q_title,
    description: collabInfo.question.q_desc,
  };

  const endCollabMutation = useMutation({
    mutationFn: () => endCollab(collabInfo.id),
    onMutate: () => setConfirmLoading(true),
    onSuccess: async () => {
      setEndCollabModalOpen(false);
      router.replace(`/history/${collabInfo.id}`);
      toast({
        variant: 'default',
        title: 'Collaboration Ended',
        description: 'Your collaboration session has ended',
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
    if (editorRef.current) editorRef.current.handleEndSession();
  };

  const handleEndCollab = () => {
    endCollabMutation.mutate();
  };

  // Disallow user from entering collab sessions without a valid session
  useEffect(() => {
    // If no collaboration session is found
    const collaboration = sessionStorage.getItem('collaboration');
    if (!collaboration) router.replace('/');

    // If url valid, but user is not any of the matched users
    if (
      collabInfo.collab_user1.id != user!.id &&
      collabInfo.collab_user2.id != user!.id
    )
      return notFound();
  }, [collabInfo, router]);

  return (
    <div className="h-screen px-8 py-4">
      {/* Header with Back button */}
      <div className="flex flex-row justify-between">
        <div className="flex items-center mb-4">
          <Button
            variant="link"
            onClick={() =>
              collabEnding
                ? setEndCollabModalOpen(true)
                : setEndSessionModalOpen(true)
            }
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-md">You've been paired with</span>
          <Avatar className="w-8 h-8 ml-2">
            <AvatarImage />
            <AvatarFallback>{partnerUsername[0]}</AvatarFallback>
          </Avatar>
          <span className="ml-2 mr-2 font-medium text-md">
            {partnerUsername}
          </span>
        </div>
        <EndCollabCountdown onEndCollab={handleEndCollab} />
      </div>

      <div className="flex gap-8 max-h-fit">
        {/* Question info */}
        <div className="w-1/2 h-[calc(100vh-120px)] p-6 border border-1 rounded-md shadow-md bg-white">
          <h2 className="mb-4 text-xl font-semibold">{question.title}</h2>
          {question.description}
        </div>

        {/* Code editor */}
        <CollaborativeEditor ref={editorRef} id={id} className="w-1/2" />
      </div>
      {collabInfo && (
        <ActionModals
          onEndSession={handleEndSession}
          onEndCollab={handleEndCollab}
          collabPartner={partnerUsername}
          collabId={id}
        />
      )}
    </div>
  );
};

const CollabPage = ({ params }: CollabPageProps) => {
  const { id } = params;

  return (
    <Suspense fallback={<CollabSkeleton />}>
      <CollabPageContent id={id} />
    </Suspense>
  );
};

export default CollabPage;
