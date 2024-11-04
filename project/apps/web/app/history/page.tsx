'use client';

import { Suspense } from 'react';

import { HistoryTable } from '@/components/history/history-table/HistoryTable';
import QuestionsSkeleton from '@/components/question/QuestionsSkeleton';

const QuestionRepositoryContent = () => {
  return (
    <div className="container p-6 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between my-4">
        <h1 className="text-xl font-semibold">Past Collaboration Sessions</h1>
      </div>

      {/* Table */}
      <HistoryTable />
    </div>
  );
};

const QuestionRepository = () => {
  return (
    <Suspense fallback={<QuestionsSkeleton />}>
      <QuestionRepositoryContent />
    </Suspense>
  );
};

export default QuestionRepository;
