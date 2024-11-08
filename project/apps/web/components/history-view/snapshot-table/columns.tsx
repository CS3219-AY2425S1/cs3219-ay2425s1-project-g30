import { ExecutionSnapshotDto } from '@repo/dtos/collab';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';

import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';

const DATE_FORMAT = 'D MMM YY, H:mm';

export const columns: ColumnDef<ExecutionSnapshotDto>[] = [
  {
    id: 'snapshot',
    accessorFn: (row) => row.created_at,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Snapshot" />
    ),
    cell: ({ row }) => {
      return <span>{dayjs(row.original.created_at).format(DATE_FORMAT)}</span>;
    },
    enableColumnFilter: false,
    enableSorting: false,
  },
  {
    id: 'created_at',
    accessorFn: (row) => row.created_at,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      return <span>{dayjs(row.original.created_at).format(DATE_FORMAT)}</span>;
    },
  },
];
