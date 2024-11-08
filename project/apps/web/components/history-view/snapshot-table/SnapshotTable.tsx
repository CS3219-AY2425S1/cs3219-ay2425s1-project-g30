'use client';

import {
  CollabCollectionDto,
  CollabFiltersDto,
  CollabInfoWithDocumentDto,
  ExecutionSnapshotCollectionDto,
} from '@repo/dtos/collab';
import {
  CATEGORY,
  COMPLEXITY,
} from '@repo/dtos/generated/enums/questions.enums';
import { SortQuestionsQueryDto } from '@repo/dtos/questions';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Updater,
} from '@tanstack/react-table';
import { startTransition, useEffect, useState } from 'react';

import {
  ControlledTableStateProps,
  DataTable,
} from '@/components/data-table/DataTable';
import { QUERY_KEYS } from '@/constants/queryKeys';
import useDebounce from '@/hooks/useDebounce';
import { useMe } from '@/hooks/useMe';
import { getCollabs, getExecutionSnapshots } from '@/lib/api/collab';
import { useQuestionsStore } from '@/stores/useQuestionStore';

import { columns } from './columns';

interface SnapshotTableProps {
  collab: CollabInfoWithDocumentDto;
}

export function SnapshotTable({ collab }: SnapshotTableProps) {
  //   const confirmLoading = useQuestionsStore.use.confirmLoading();
  //   const setConfirmLoading = useQuestionsStore.use.setConfirmLoading();
  //   const [isDebouncing, setIsDebouncing] = useState(false);

  //   const [pagination, setPagination] = useState<PaginationState>({
  //     pageIndex: 0,
  //     pageSize: 10,
  //   });

  //   const resetPagination = () => {
  //     setPagination((prev) => ({
  //       ...prev,
  //       pageIndex: 0,
  //     }));
  //   };

  //   const [sorting, setSorting] = useState<SortingState>([
  //     {
  //       id: 'started_at',
  //       desc: true,
  //     },
  //   ]);

  //   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  //   const debouncedColumnFilters = useDebounce(
  //     columnFilters,
  //     300,
  //     () => {
  //       setConfirmLoading(true);
  //       setIsDebouncing(true);
  //     },
  //     () => {
  //       setConfirmLoading(false);
  //       setIsDebouncing(false);
  //     },
  //   );

  //   useEffect(() => {
  //     if (confirmLoading) {
  //       setConfirmLoading(true);
  //     } else {
  //       setConfirmLoading(false);
  //     }
  //   }, [pagination, sorting, debouncedColumnFilters, setConfirmLoading]);

  const collabId = collab.id;

  const { data } = useSuspenseQuery<ExecutionSnapshotCollectionDto>({
    queryKey: [QUERY_KEYS.Snapshot, collabId],
    queryFn: async () => {
      return getExecutionSnapshots(collabId);
    },
  });

  //   const onPaginationChange = (updater: Updater<PaginationState>) => {
  //     startTransition(() => {
  //       setPagination(updater);
  //     });
  //   };

  //   const onSortingChange = (updater: Updater<SortingState>) => {
  //     startTransition(() => {
  //       setSorting(updater);
  //       resetPagination();
  //     });
  //   };

  //   const onColumnFiltersChange = (updater: Updater<ColumnFiltersState>) => {
  //     startTransition(() => {
  //       setColumnFilters(updater);
  //       resetPagination();
  //     });
  //   };

  const metadata = data.metadata;
  const snapshots = data.snapshots;

  //   const controlledState: ControlledTableStateProps = {
  //     pagination,
  //     onPaginationChange,
  //     rowCount: metadata.totalCount,
  //     sorting,
  //     onSortingChange,
  //     columnFilters,
  //     onColumnFiltersChange,
  //   };

  return (
    <DataTable
      data={snapshots}
      columns={columns}
      confirmLoading={false}
      //   TableToolbar={HistoryTableToolbar}
    />
  );
}
