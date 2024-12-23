'use client';

import { ROLE } from '@repo/dtos/generated/enums/auth.enums';
import {
  SortUsersQueryDto,
  UserCollectionDto,
  UserFiltersDto,
} from '@repo/dtos/users';
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
import { fetchUsers } from '@/lib/api/users';
import { useAuthStore } from '@/stores/useAuthStore';
import { useManageUsersStore } from '@/stores/useManageUsersStore';

import { columns } from './columns';
import { UsersTableToolbar } from './UsersTableToolbar';

export function UsersTable() {
  const fetchUser = useAuthStore.use.fetchUser();
  const user = useAuthStore.use.user();
  if (!user) return;
  const confirmLoading = useManageUsersStore.use.confirmLoading();
  const setConfirmLoading = useManageUsersStore.use.setConfirmLoading();
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
      id: 'username',
      desc: false,
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
    fetchUser();
    if (confirmLoading) {
      setConfirmLoading(true);
    } else {
      setConfirmLoading(false);
    }
  }, [pagination, sorting, debouncedColumnFilters, setConfirmLoading]);

  const { data } = useSuspenseQuery<UserCollectionDto>({
    queryKey: [QUERY_KEYS.Users, pagination, sorting, debouncedColumnFilters],
    queryFn: async () => {
      const username = debouncedColumnFilters.find((f) => f.id === 'username')
        ?.value as string;

      const email = debouncedColumnFilters.find((f) => f.id === 'email')
        ?.value as string;

      const roles = debouncedColumnFilters.find((f) => f.id === 'role')
        ?.value as ROLE[];

      const offset = pagination.pageIndex * pagination.pageSize;
      const limit = pagination.pageSize;

      const sort = sorting.map(
        (s) =>
          ({
            field: s.id,
            order: s.desc ? 'desc' : 'asc',
          }) as SortUsersQueryDto,
      );

      const queryParams: UserFiltersDto = {
        username,
        email,
        roles,
        offset,
        limit,
        sort,
      };

      return await fetchUsers(queryParams);
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
  const users = data.users;

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
    <>
      <DataTable
        data={users}
        columns={columns}
        confirmLoading={confirmLoading || isDebouncing}
        controlledState={controlledState}
        TableToolbar={UsersTableToolbar}
      />
    </>
  );
}
