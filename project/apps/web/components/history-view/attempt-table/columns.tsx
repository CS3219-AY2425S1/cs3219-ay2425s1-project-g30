import { AttemptDto } from '@repo/dtos/attempt';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';

import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { HistoryPaneView, useHistoryStore } from '@/stores/useHistoryStore';

const DATE_FORMAT = 'D MMM YY, H:mm';

export const columns: ColumnDef<AttemptDto>[] = [
  {
    id: 'name',
    accessorFn: (row) => row.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Snapshot" />
    ),
    cell: ({ row }) => {
      const setSelectedAttempt = useHistoryStore.use.setSelectedAttempt();
      const setHistoryPaneView = useHistoryStore.use.setHistoryPaneView();
      return (
        <button
          onClick={() => {
            setSelectedAttempt(row.original);
            setHistoryPaneView(HistoryPaneView.Code); // Switch to code view
          }}
          className="text-blue-500 hover:text-blue-700"
        >
          {row.original.name}
        </button>
      );
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
      return <span>{dayjs(row.original.created_at).format(DATE_FORMAT)}</span>; // need to update this to use the correct date format
    },
    enableColumnFilter: false,
    enableSorting: false,
  },
];
