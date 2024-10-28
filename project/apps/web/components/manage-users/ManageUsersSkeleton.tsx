import { Skeleton } from '@/components/ui/skeleton';

const ManageUsersSkeleton = () => (
  <div className="container p-6 mx-auto">
    {/* Table Header */}
    <div className="flex items-center my-4">
      <h1 className="text-xl font-semibold">
        <Skeleton className="w-48 h-6" />
      </h1>
    </div>

    {/* Table */}
    <div className="w-full overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-3 gap-4 p-4">
        <Skeleton className="w-1/4 h-6" />
        <Skeleton className="w-1/4 h-6" />
        <Skeleton className="w-1/4 h-6" />
      </div>

      {/* Table Body */}
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-3 gap-4 p-4 border-t border-gray-200"
        >
          <Skeleton className="w-full h-6" />
          <Skeleton className="w-1/4 h-6" />
          <Skeleton className="w-full h-6" />
        </div>
      ))}
    </div>
  </div>
);

export default ManageUsersSkeleton;
