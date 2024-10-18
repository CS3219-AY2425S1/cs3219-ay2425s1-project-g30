'use client';

import { Skeleton } from '@/components/ui/skeleton';

const MatchSkeleton = () => {
  return (
    <div className="h-screen py-4 px-8">
      {/* Header with Back button skeleton*/}
      <div className="flex items-center mb-4">
        <Skeleton className="w-8 h-8 mr-4" />
        <Skeleton className="w-40 h-6 mr-4" />{' '}
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>

      <div className="flex max-h-fit gap-8">
        {/* Question skeleton */}
        <div className="w-1/2 h-[calc(100vh-120px)] p-6 border border-1 rounded-md shadow-md bg-white">
          <Skeleton className="w-3/4 h-8 mb-4" />
          <Skeleton className="w-full h-32" />
        </div>

        {/* Code editor skeleton */}
        <div className="w-1/2 h-[calc(100vh-120px)]">
          <Skeleton className="w-full h-full p-6 border border-1 rounded-md shadow-md" />
        </div>
      </div>
    </div>
  );
};

export default MatchSkeleton;
