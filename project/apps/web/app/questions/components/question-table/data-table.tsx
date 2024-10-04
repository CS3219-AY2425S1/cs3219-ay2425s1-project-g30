// data-table.tsx
import React, { useState } from "react";
import {
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/multi-select";
import { QuestionDto } from "@repo/dtos/questions";
import { columns } from "./columns";
import { Input } from "@/components/ui/input";
import {
  CATEGORY,
  COMPLEXITY,
} from "@repo/dtos/generated/enums/questions.enums";

interface DataTableProps {
  data: QuestionDto[];
  confirmLoading: boolean;
}

export function DataTable({ data, confirmLoading }: DataTableProps) {
  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const categoryOptions = [
    { value: CATEGORY.DataStructures, label: "Data Structures" },
    { value: CATEGORY.Algorithms, label: "Algorithms" },
    { value: CATEGORY.BrainTeaser, label: "Brain Teaser" },
    { value: CATEGORY.Strings, label: "Strings" },
    { value: CATEGORY.Databases, label: "Databases" },
    { value: CATEGORY.BitManipulation, label: "Bit Manipulation" },
    { value: CATEGORY.Arrays, label: "Arrays" },
    { value: CATEGORY.Recursion, label: "Recursion" },
  ];

  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div>
      {/* Filters and Search Bar Container */}
      <div className="flex justify-between items-end my-4">
        {/* Filters Container */}
        <div className="flex gap-4">
          {/* Difficulty Filter */}
          <div className="w-64">
            <h2 className="font-semibold mb-2">Filter by Difficulty</h2>
            <MultiSelect
              options={[
                { value: COMPLEXITY.Easy, label: "Easy" },
                { value: COMPLEXITY.Medium, label: "Medium" },
                { value: COMPLEXITY.Hard, label: "Hard" },
              ]}
              onValueChange={(values) => {
                table.getColumn("q_complexity")?.setFilterValue(values);
              }}
              placeholder="Select Difficulty"
            />
          </div>

          {/* Category Filter */}
          <div className="w-64">
            <h2 className="font-semibold mb-2">Filter by Categories</h2>
            <MultiSelect
              options={categoryOptions}
              onValueChange={(values) => {
                table.getColumn("q_category")?.setFilterValue(values);
              }}
              placeholder="Select Category"
            />
          </div>
        </div>

        {/* Search Input Container */}
        <div className="flex-grow max-w-lg">
          <Input
            type="text"
            className="flex w-full pl-3 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inheri"
            placeholder="Search questions..."
            onChange={(e) => {
              table.getColumn("q_title")?.setFilterValue(e.target.value);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody
            className={`${confirmLoading ? "opacity-50" : "opacity-100"}`}
          >
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
