'use client';

import { CollabInfoDto } from '@repo/dtos/collab';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Suspense, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { ActionModals } from '@/components/collab/ActionModals';
import CollaborativeEditor, {
  CollaborativeEditorRef,
} from '@/components/collab/CollaborativeEditor';
import CollabSkeleton from '@/components/collab/CollabSkeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { QUERY_KEYS } from '@/constants/queryKeys';
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
  const setTerminateModalOpen = useCollabStore.use.setTerminateModalOpen();
  const editorRef = useRef<CollaborativeEditorRef>(null);

  const { data: collabInfo } = useSuspenseQuery<CollabInfoDto>({
    queryKey: [QUERY_KEYS.Collab, id],
    queryFn: () => getCollabInfoById(id),
  });

  if (!collabInfo) {
    return notFound();
  }

  const endSession = () => {
    if (editorRef.current) {
      editorRef.current.endSession();
    }
  };

  const partnerUsername =
    user && collabInfo.collab_user1.id == user.id
      ? collabInfo.collab_user2.username
      : collabInfo.collab_user1.username;

  const question = {
    title: collabInfo.question.q_title,
    description: collabInfo.question.q_desc,
    id: collabInfo.question.id,
  };

  return (
    <div className="h-screen px-8 py-4">
      {/* Header with Back button */}
      <div className="flex items-center mb-4">
        <Button
          variant="link"
          onClick={() => setTerminateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-md">You've been paired with</span>
        <Avatar className="w-8 h-8 ml-2">
          <AvatarImage />
          <AvatarFallback>{partnerUsername[0]}</AvatarFallback>
        </Avatar>
        <span className="ml-2 mr-2 font-medium text-md">{partnerUsername}</span>
      </div>

      <div className="flex gap-8 max-h-fit">
        {/* Question info */}
        <div className="markdown w-1/2 h-[calc(100vh-120px)] p-6 border border-1 rounded-md shadow-md bg-white overflow-y-auto">
          <h2 className="mb-4 text-xl font-semibold">{question.title}</h2>
          <ReactMarkdown remarkPlugins={[[remarkGfm]]}>
            {question.description}
          </ReactMarkdown>
        </div>

        {/* Code editor */}
        <CollaborativeEditor
          ref={editorRef}
          collabId={id}
          questionId={question.id}
          className="w-1/2"
        />
      </div>
      {collabInfo && (
        <ActionModals
          onEndSession={endSession}
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
