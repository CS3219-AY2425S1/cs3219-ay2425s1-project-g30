'use client';

import { CollabInfoDto } from '@repo/dtos/collab';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import HistoryPane from '@/components/history-view/HistoryPane';
import HistoryViewSkeleton from '@/components/history-view/HistoryViewSkeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { getCollabInfoById } from '@/lib/api/collab';
import { useAuthStore } from '@/stores/useAuthStore';

interface HistoryViewProps {
  params: {
    id: string;
  };
}

const HistoryViewContent = ({ id }: { id: string }) => {
  const user = useAuthStore.use.user();

  const { data: collabInfo } = useSuspenseQuery<CollabInfoDto>({
    queryKey: [QUERY_KEYS.Collab, id],
    queryFn: () => getCollabInfoById(id),
  });

  if (!collabInfo) {
    return notFound();
  }

  const partnerUsername =
    collabInfo.collab_user1.id == user?.id
      ? collabInfo.collab_user2.username
      : collabInfo.collab_user1.username;
  const question = {
    title: collabInfo.question.q_title || 'Untitled Question',
    description: collabInfo.question.q_desc || 'No description',
  };

  return (
    <div className="h-screen px-8 py-4">
      {/* Header with Back button */}
      <div className="flex items-center mb-4">
        <Button
          variant="link"
          onClick={() => window.history.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-md">Collaboration Partner</span>
        <Avatar className="w-8 h-8 ml-2">
          <AvatarImage />
          <AvatarFallback>{partnerUsername[0]}</AvatarFallback>
        </Avatar>
        <span className="ml-2 mr-2 font-medium text-md">{partnerUsername}</span>
        <span className="ml-6 font-thin italic text-slate-500">
          Read-only View
        </span>
      </div>

      <div className="flex gap-8 max-h-fit">
        {/* Question info */}
        <div className="w-1/2 h-[calc(100vh-120px)] p-6 border border-1 rounded-md shadow-md bg-white">
          <h2 className="mb-4 text-xl font-semibold">{question.title}</h2>
          <p>{question.description}</p>
        </div>
        {/* Snapshot selection and code editor */}
        <HistoryPane collabInfo={collabInfo} className="w-1/2" />
      </div>
    </div>
  );
};

const HistoryView = ({ params }: HistoryViewProps) => {
  const { id } = params;
  return (
    <Suspense fallback={<HistoryViewSkeleton />}>
      <HistoryViewContent id={id} />
    </Suspense>
  );
};

export default HistoryView;
