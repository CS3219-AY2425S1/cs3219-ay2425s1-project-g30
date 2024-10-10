import { Skeleton } from "@/components/ui/skeleton";

const QuestionsSkeleton = () => (
  <div className="container mx-auto p-4">
    {/* Table Header */}
    <div className="flex items-center my-4">
      <h1 className="text-xl font-semibold">
        <Skeleton className="h-6 w-48" />
      </h1>
    </div>

    {/* Table */}
    <div className="w-full overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-3 gap-4 p-4">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-6 w-1/4" />
      </div>

      {/* Table Body */}
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-3 gap-4 p-4 border-t border-gray-200"
        >
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-full" />
        </div>
      ))}
    </div>
  </div>
);

export default QuestionsSkeleton;
