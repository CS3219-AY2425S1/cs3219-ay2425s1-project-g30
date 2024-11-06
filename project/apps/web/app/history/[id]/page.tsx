'use client';

import { CollabInfoWithDocumentDto } from '@repo/dtos/collab';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import HistoryEditor from '@/components/history-view/HistoryEditor';
import HistoryViewSkeleton from '@/components/history-view/HistoryViewSkeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { fetchCollaHistorybById } from '@/lib/api/collab';
import { useAuthStore } from '@/stores/useAuthStore';

interface HistoryViewProps {
  params: {
    id: string;
  };
}

const HistoryViewContent = ({ id }: { id: string }) => {
  const user = useAuthStore.use.user();

  const { data: collab } = useSuspenseQuery<CollabInfoWithDocumentDto>({
    queryKey: [QUERY_KEYS.Collab, id],
    queryFn: () => fetchCollaHistorybById(id),
  });

  if (!collab) {
    return notFound();
  }

  const partnerUsername =
    collab.collab_user1.id == user?.id
      ? collab.collab_user2.username
      : collab.collab_user1.username;
  const question = {
    title: collab.question.q_title || 'Untitled Question',
    description: collab.question.q_desc || 'No description',
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
        <span className="ml-1 mr-2 font-semibold text-md">
          {partnerUsername}
        </span>
        <Avatar className="w-8 h-8">
          <AvatarImage />
          <AvatarFallback>{partnerUsername[0]}</AvatarFallback>
        </Avatar>
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
        {/* Code editor */}
        <HistoryEditor collab={collab} className="w-1/2" />
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
