import { Skeleton } from '@/components/ui/skeleton';

const TestCasesSkeleton = () => (
  <div className="p-6 mt-6 bg-white rounded-lg shadow-md">
    {/* Description */}
    <h3 className="mb-4 text-2xl font-bold text-gray-800">
      <Skeleton className="w-48 h-6" />
    </h3>
    <div className="text-gray-600">
      <Skeleton className="w-3/4 h-4 mb-2" />
    </div>
    <div className="mb-6 text-gray-600">
      <Skeleton className="w-2/3 h-4" />
    </div>
    <Skeleton className="w-1/4 h-40 mb-6" />

    {/* JSON Input */}
    <Skeleton className="w-full h-64 mb-4" />

    {/* Save Button */}
    <div className="flex justify-end mt-4">
      <Skeleton className="w-24 h-10" />
    </div>
  </div>
);

export default TestCasesSkeleton;
