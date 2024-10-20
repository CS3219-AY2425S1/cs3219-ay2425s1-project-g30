'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import MatchSkeleton from '@/components/match/MatchSkeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/useAuthStore';

const MatchPageContent = () => {
  const user = useAuthStore.use.user();

  // TODO: Replace placeholder user name and question
  const userName = 'John Doe';
  const question = {
    title: 'Sample Question Title',
    description:
      'This is a placeholder description of the question. It can be a long and detailed problem statement.',
  };

  return (
    <div className="h-screen py-4 px-8">
      {/* Header with Back button */}
      <div className="flex items-center mb-4">
        <Link href="/">
          <Button variant="link" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <span className="text-md">You've been paired with</span>
        <span className="text-md font-semibold ml-1 mr-2">{userName}</span>
        <Avatar className="w-8 h-8">
          <AvatarImage />
          <AvatarFallback>{user?.username[0]}</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex max-h-fit gap-8">
        {/* Question info */}
        <div className="w-1/2 h-[calc(100vh-120px)] p-6 border border-1 rounded-md shadow-md bg-white">
          <h2 className="text-xl font-semibold mb-4">{question.title}</h2>
          <p>{question.description}</p>
        </div>

        {/* Code editor */}
        <textarea
          className="w-1/2 h-[calc(100vh-120px)] p-6 border border-1 rounded-md shadow-md"
          placeholder="Write your code here..."
        />
      </div>
    </div>
  );
};

const MatchPage = () => {
  return (
    <Suspense fallback={<MatchSkeleton />}>
      <MatchPageContent />
    </Suspense>
  );
};

export default MatchPage;
