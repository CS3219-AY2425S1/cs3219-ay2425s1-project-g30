'use client';

import { Skeleton } from '@/components/ui/skeleton';

export const EditorAreaSkeleton = () => (
  <Skeleton className="w-full h-[400px] rounded-md mb-4" />
);

const HistoryEditorSkeleton = () => {
  return (
    <div className="w-1/2">
      <div className="h-[calc(100vh-336px)] border border-1 rounded-md shadow-md">
        {/* Code Editor Area Skeleton */}
        <div className="p-6">
          <EditorAreaSkeleton />
        </div>
      </div>
    </div>
  );
};

export default HistoryEditorSkeleton;
