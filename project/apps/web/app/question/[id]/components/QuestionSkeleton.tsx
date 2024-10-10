import { Skeleton } from "@/components/ui/skeleton";

const QuestionSkeleton = () => {
  return (
    <div className="container mx-auto p-4">
      {/* Back Button */}
      <div className="flex items-center my-4">
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Question Details */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center mb-4 gap-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-6 w-full mb-4" />
        <Skeleton className="h-6 w-full mb-4" />
        <Skeleton className="h-6 w-5/6 mb-6" />
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionSkeleton;
