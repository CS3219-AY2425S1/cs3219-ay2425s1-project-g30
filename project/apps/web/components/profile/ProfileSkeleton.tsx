'use client';

import { Skeleton } from '@/components/ui/skeleton';

const ProfileSkeleton = () => {
  return (
    <div className="container p-6 mx-auto">
      <div className="flex items-center justify-start my-5">
        <Skeleton className="w-32 h-6" />
      </div>
      <div className="flex flex-row gap-8 p-8 my-8 border border-gray-200 rounded-lg shadow-md">
        {/* Picture */}
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="flex flex-col justify-center w-full gap-6 my-3">
          {/* Username */}
          <div className="flex flex-row items-center gap-6">
            <Skeleton className="w-20 h-6" />
            <Skeleton className="w-64 h-10" />
            <Skeleton className="w-16 h-10" />
          </div>
          {/* Email */}
          <div className="flex flex-row items-center gap-6">
            <Skeleton className="w-20 h-6" />
            <Skeleton className="w-64 h-10" />
            <Skeleton className="w-16 h-10" />
          </div>
          {/* Password */}
          <div className="flex flex-row items-center gap-6">
            <Skeleton className="w-20 h-6" />
            <Skeleton className="w-40 h-10" />
          </div>
          {/* Delete */}
          <Skeleton className="w-32 h-10" />
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
