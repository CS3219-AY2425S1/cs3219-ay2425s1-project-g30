'use client';

import { Suspense } from 'react';

import SessionsSkeleton from '@/components/sessions/SessionsSkeleton';
import { SessionsTable } from '@/components/sessions/SessionsTable';

const SessionsRepositoryContent = () => {
  return (
    <div className="container p-6 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between my-4">
        <h1 className="text-xl font-semibold">Active Collaboration Sessions</h1>
      </div>

      {/* Table */}
      <SessionsTable />
    </div>
  );
};

const SessionsRepository = () => {
  return (
    <Suspense fallback={<SessionsSkeleton />}>
      <SessionsRepositoryContent />
    </Suspense>
  );
};

export default SessionsRepository;
