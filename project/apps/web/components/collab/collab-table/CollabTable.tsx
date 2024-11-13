'use client';

import { CollabCollectionDto, CollabFiltersDto } from '@repo/dtos/collab';
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
import { getCollabs } from '@/lib/api/collab';
import { useQuestionsStore } from '@/stores/useQuestionStore';

import { CollabTableToolbar } from './CollabTableToolbar';
import { getColumns } from './columns';

interface CollabTableProps {
  showEndedSessions: boolean;
}

export function CollabTable({ showEndedSessions }: CollabTableProps) {
  const { userData } = useMe();
  const confirmLoading = useQuestionsStore.use.confirmLoading();
  const setConfirmLoading = useQuestionsStore.use.setConfirmLoading();
  const [isDebouncing, setIsDebouncing] = useState(false);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const resetPagination = () => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  };

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'started_at',
      desc: true,
    },
  ]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const debouncedColumnFilters = useDebounce(
    columnFilters,
    300,
    () => {
      setConfirmLoading(true);
      setIsDebouncing(true);
    },
    () => {
      setConfirmLoading(false);
      setIsDebouncing(false);
    },
  );

  useEffect(() => {
    if (confirmLoading) {
      setConfirmLoading(true);
    } else {
      setConfirmLoading(false);
    }
  }, [pagination, sorting, debouncedColumnFilters, setConfirmLoading]);

  const { data } = useSuspenseQuery<CollabCollectionDto>({
    queryKey: [QUERY_KEYS.Collab, pagination, sorting, debouncedColumnFilters],
    queryFn: async () => {
      const user_id = userData!.id;

      const q_title = debouncedColumnFilters.find(
        (f) => f.id === 'question.q_title',
      )?.value as string;

      const q_category = debouncedColumnFilters.find(
        (f) => f.id === 'question.q_category',
      )?.value as CATEGORY[];

      const q_complexity = debouncedColumnFilters.find(
        (f) => f.id === 'question.q_complexity',
      )?.value as COMPLEXITY[];

      const offset = pagination.pageIndex * pagination.pageSize;
      const limit = pagination.pageSize;

      const sort = sorting.map(
        (s) =>
          ({
            field: s.id,
            order: s.desc ? 'desc' : 'asc',
          }) as SortQuestionsQueryDto,
      );

      const queryParams: CollabFiltersDto = {
        user_id,
        has_ended: showEndedSessions,
        q_title,
        q_category,
        q_complexity,
        offset,
        limit,
        sort,
      };

      return await getCollabs(queryParams);
    },
  });

  const onPaginationChange = (updater: Updater<PaginationState>) => {
    startTransition(() => {
      setPagination(updater);
    });
  };

  const onSortingChange = (updater: Updater<SortingState>) => {
    startTransition(() => {
      setSorting(updater);
      resetPagination();
    });
  };

  const onColumnFiltersChange = (updater: Updater<ColumnFiltersState>) => {
    startTransition(() => {
      setColumnFilters(updater);
      resetPagination();
    });
  };

  const metadata = data.metadata;
  const collaborations = data.collaborations;

  const controlledState: ControlledTableStateProps = {
    pagination,
    onPaginationChange,
    rowCount: metadata.totalCount,
    sorting,
    onSortingChange,
    columnFilters,
    onColumnFiltersChange,
  };

  return (
    <DataTable
      data={collaborations}
      columns={getColumns(showEndedSessions)}
      confirmLoading={confirmLoading || isDebouncing}
      controlledState={controlledState}
      TableToolbar={CollabTableToolbar}
    />
  );
}
