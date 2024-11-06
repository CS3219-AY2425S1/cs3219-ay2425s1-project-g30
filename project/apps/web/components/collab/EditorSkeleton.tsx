'use client';

import { Skeleton } from '@/components/ui/skeleton';

export const LanguageSelectSkeleton = () => <Skeleton className="w-48 h-10" />;

export const RunButtonSkeleton = () => <Skeleton className="w-24 h-10" />;

export const EditorAreaSkeleton = () => (
  <Skeleton className="w-full h-[400px] rounded-md mb-4" />
);

export const OutputSectionSkeleton = () => (
  <div className="mt-8 h-[184px] p-6 border border-1 rounded-md shadow-md">
    <Skeleton className="w-1/4 h-8 mb-4" />
    <Skeleton className="w-full h-[60px] rounded-md" />
  </div>
);

const EditorSkeleton = () => {
  return (
    <div className="w-1/2">
      {/* Top bar with language select and Run Code button skeleton */}
      <div className="h-[calc(100vh-336px)] border border-1 rounded-md shadow-md">
        <div className="flex flex-row justify-between gap-2 p-4 border-b border-gray-300">
          <LanguageSelectSkeleton />
          <RunButtonSkeleton />
        </div>

        {/* Code Editor Area Skeleton */}
        <div className="p-6">
          <EditorAreaSkeleton />
        </div>
      </div>

      {/* Output Section Skeleton */}
      <OutputSectionSkeleton />
    </div>
  );
};

export default EditorSkeleton;
