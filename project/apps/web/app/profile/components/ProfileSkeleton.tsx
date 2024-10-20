import { Skeleton } from '@/components/ui/skeleton';

const ProfileSkeleton = () => (
  <div className="container mx-auto p-4">
    {/* Profile Header */}
    <div className="flex items-center my-4">
      <Skeleton className="h-10 w-32" />
    </div>

    {/* Profile Details */}
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center mb-4 gap-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-48" />
      </div>
      <Skeleton className="h-6 w-full mb-4" />
      <Skeleton className="h-6 w-full mb-4" />
      <Skeleton className="h-6 w-5/6 mb-6" />
    </div>

    {/* Action Buttons */}
    <div className="flex gap-4 mt-6">
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-32" />
    </div>
  </div>
);

export default ProfileSkeleton;
