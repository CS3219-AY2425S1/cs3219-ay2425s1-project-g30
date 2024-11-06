'use client';

import { Suspense } from 'react';

import { HistoryTable } from '@/components/history/history-table/HistoryTable';
import HistorySkeleton from '@/components/history/HistorySkeleton';

const HistoryRepositoryContent = () => {
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

const HistoryRepository = () => {
  return (
    <Suspense fallback={<HistorySkeleton />}>
      <HistoryRepositoryContent />
    </Suspense>
  );
};

export default HistoryRepository;
