'use client';

import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';

import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import DifficultyBadge from '@/components/DifficultyBadge';
import { Badge } from '@/components/ui/badge';

import { CollabInfoiWithPartner } from './HistoryTable';

export const columns: ColumnDef<CollabInfoiWithPartner>[] = [
  {
    id: 'question.q_title',
    accessorFn: (row) => row.question.q_title,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Question" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`/history/${row.original.id}`}
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
    accessorFn: (row) => row.partner.username,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Partner" />
    ),
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="mr-2">
          {row.original.partner.username}
        </Badge>
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
      return new Date(row.original.started_at).toLocaleString();
    },
  },
  {
    id: 'ended_at',
    accessorFn: (row) => row.ended_at,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ended At" />
    ),
    cell: ({ row }) => {
      if (row.original.ended_at) {
        return new Date(row.original.ended_at).toLocaleString();
      } else {
        return null;
      }
    },
  },
];
