'use client';

import { DataTable } from '@/components/data-table/DataTable';
import { useHistoryStore } from '@/stores/useHistoryStore';

import AttemptTableSkeleton from './AttemptTableSkeleton';
import { columns } from './columns';

export function AttemptTable() {
  const attemptCollection = useHistoryStore.use.attemptCollection();
  const confirmLoading = useHistoryStore.use.confirmLoading();

  const data = attemptCollection?.attempts!;

  if (!data || confirmLoading) {
    return <AttemptTableSkeleton />;
  }

  return (
    <DataTable
      data={data}
      columns={columns}
      confirmLoading={confirmLoading}
      showPagination={false}
    />
  );
}
