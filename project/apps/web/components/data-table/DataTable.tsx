"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  Table as ReactTable,
  VisibilityState,
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
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";
import { DataTablePagination } from "./DataTablePagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  confirmLoading: boolean;
  TableToolbar?: React.FC<{ table: ReactTable<TData> }>;
  // determines if pagination is controlled by parent component
  isPaginationControlled?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: (updater: Updater<PaginationState>) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  confirmLoading,
  TableToolbar,
  isPaginationControlled = false,
  pagination,
  onPaginationChange,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  let tableState: Partial<TableState> = {
    sorting,
    columnVisibility,
    rowSelection,
    columnFilters,
  };

  if (isPaginationControlled) {
    // check if pagination and onPaginationChange is provided
    if (!pagination || !onPaginationChange) {
      throw new Error(
        "If pagination is controlled, both pagination and onPaginationChange must be provided.",
      );
    }
    // set pagination state
    tableState = {
      ...tableState,
      pagination,
    };
  }

  let tableOptions: TableOptions<TData> = {
    data,
    columns,
    state: tableState,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  };

  if (isPaginationControlled) {
    tableOptions = {
      ...tableOptions,
      manualPagination: true,
      onPaginationChange,
    };
  } else {
    tableOptions = {
      ...tableOptions,
      getPaginationRowModel: getPaginationRowModel(),
    };
  }

  const table = useReactTable(tableOptions);

  return (
    <div className="space-y-4">
      {TableToolbar && <TableToolbar table={table} />}
      <div className="rounded-md border">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(header.id === "actions" ? "w-20" : "")}
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
            className={`${confirmLoading ? "opacity-50" : "opacity-100"}`}
          >
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
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
