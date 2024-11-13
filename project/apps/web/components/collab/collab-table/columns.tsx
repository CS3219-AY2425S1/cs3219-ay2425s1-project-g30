'use client';

import { CollabInfoDto } from '@repo/dtos/collab';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import Link from 'next/link';

import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import DifficultyBadge from '@/components/DifficultyBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const DATE_FORMAT = 'D MMM YY, h:mm A';

const endedAtColumn: ColumnDef<CollabInfoDto> = {
  id: 'ended_at',
  accessorFn: (row) => row.ended_at,
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Ended At" />
  ),
  cell: ({ row }) => {
    if (row.original.ended_at) {
      const dateStr = dayjs(row.original.ended_at).format(DATE_FORMAT);
      return <span className="ml-1 mr-2">{dateStr}</span>;
    } else {
      return null;
    }
  },
};

export const getColumns = (
  showEndedSessions: boolean,
): ColumnDef<CollabInfoDto>[] => {
  return [
    {
      id: 'question.q_title',
      accessorFn: (row) => row.question.q_title,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Question" />
      ),
      cell: ({ row }) => {
        return (
          <Link
            href={`/${showEndedSessions ? 'history' : 'collab'}/${row.original.id}`} // Redirect to history page if showEndedSessions
            className="text-blue-500 hover:text-blue-700"
          >
            {row.original.question.q_title}
          </Link>
        );
      },
      enableColumnFilter: true,
      enableSorting: false,
    },
    {
      id: 'question.q_complexity',
      accessorFn: (row) => row.question.q_complexity,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Complexity" />
      ),
      cell: ({ row }) => {
        return (
          <DifficultyBadge complexity={row.original.question.q_complexity} />
        );
      },
      enableColumnFilter: false,
      enableSorting: false,
    },
    {
      id: 'question.q_category',
      accessorFn: (row) => row.question.q_category,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Categories" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex flex-wrap max-w-md gap-2">
            {row.original.question.q_category.map((category) => (
              <Badge key={category} variant="secondary" className="mr-2">
                {category}
              </Badge>
            ))}
          </div>
        );
      },
      enableColumnFilter: false,
      enableSorting: false,
    },
    {
      id: 'partner.username',
      accessorFn: (row) => row.partner?.username,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Partner" />
      ),
      cell: ({ row }) => {
        const username = row.original.partner?.username || 'Unknown';
        return (
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage />
              <AvatarFallback>{username[0]}</AvatarFallback>
            </Avatar>
            <span className="ml-1 mr-2 font-semibold text-md">{username}</span>
          </div>
        );
      },
      enableColumnFilter: false,
      enableSorting: false,
    },
    {
      id: 'started_at',
      accessorFn: (row) => row.started_at,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Started At" />
      ),
      cell: ({ row }) => {
        const dateStr = dayjs(row.original.started_at).format(DATE_FORMAT);
        return <span className="ml-1 mr-2">{dateStr}</span>;
      },
    },
    // Conditionally include 'ended_at' column
    ...(showEndedSessions ? [endedAtColumn] : []),
  ];
};
