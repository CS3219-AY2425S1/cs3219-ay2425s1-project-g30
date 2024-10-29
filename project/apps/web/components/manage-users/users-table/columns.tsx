'use client';

import { ROLE } from '@repo/dtos/generated/enums/auth.enums';
import { UserDataDto } from '@repo/dtos/users';
import { ColumnDef, SortingFn } from '@tanstack/react-table';

import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import RoleBadge from '@/components/RoleBadge';

import { UsersTableRowActions } from './UsersTableRowActions';

// User Role sorting order
const roleOrder: { [key in ROLE]: number } = {
  [ROLE.Admin]: 1,
  [ROLE.User]: 2,
};

const roleSortingFn: SortingFn<UserDataDto> = (rowA, rowB, columnId) => {
  const valueA = rowA.getValue(columnId) as ROLE;
  const valueB = rowB.getValue(columnId) as ROLE;
  return roleOrder[valueA] - roleOrder[valueB];
};

export const columns: ColumnDef<UserDataDto>[] = [
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Username" />
    ),
    cell: ({ row }) => {
      return row.original.username;
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return row.original.email;
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      return <RoleBadge role={row.original.role} />;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    sortingFn: roleSortingFn,
  },
  {
    id: 'actions',
    cell: ({ row }) => <UsersTableRowActions row={row} />,
  },
];
