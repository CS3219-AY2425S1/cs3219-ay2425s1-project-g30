'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  Table as ReactTable,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
  Updater,
  TableState,
  TableOptions,
} from '@tanstack/react-table';
import * as React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

import { LoadingSpinner } from '../ui/spinner';

import { DataTablePagination } from './DataTablePagination';

export interface ControlledTableStateProps {
  // pagination
  pagination: PaginationState;
  onPaginationChange: (updater: Updater<PaginationState>) => void;
  rowCount: number;

  // sorting
  sorting: SortingState;
  onSortingChange: (updater: Updater<SortingState>) => void;

  // filtering
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: (updater: Updater<ColumnFiltersState>) => void;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  confirmLoading: boolean;
  controlledState?: ControlledTableStateProps;
  TableToolbar?: React.FC<{ table: ReactTable<TData> }>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  confirmLoading,
  controlledState,
  TableToolbar,
}: DataTableProps<TData, TValue>) {
  let tableState: Partial<TableState> = {};

  if (controlledState) {
    tableState = {
      ...tableState,
      pagination: controlledState.pagination,
      sorting: controlledState.sorting,
      columnFilters: controlledState.columnFilters,
    };
  }

  let tableOptions: TableOptions<TData> = {
    data,
    columns,
    state: tableState,
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  };

  if (controlledState) {
    tableOptions = {
      ...tableOptions,
      // pagination
      manualPagination: true,
      onPaginationChange: controlledState.onPaginationChange,
      rowCount: controlledState.rowCount,
      // sorting
      manualSorting: true,
      onSortingChange: controlledState.onSortingChange,
      // filtering
      manualFiltering: true,
      onColumnFiltersChange: controlledState.onColumnFiltersChange,
    };
  }

  const table = useReactTable(tableOptions);

  return (
    <div className="space-y-4">
      {TableToolbar && <TableToolbar table={table} />}
      <div className="relative rounded-md border">
        {confirmLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
            <LoadingSpinner className="text-gray-500 w-8 h-8" />
          </div>
        )}
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(header.id === 'actions' ? 'w-20' : '')}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody
            className={`${confirmLoading ? 'opacity-50' : 'opacity-100'}`}
          >
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
