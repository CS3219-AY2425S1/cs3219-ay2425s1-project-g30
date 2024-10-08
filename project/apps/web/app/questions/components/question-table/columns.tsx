"use client";

import { ColumnDef, SortingFn } from "@tanstack/react-table";

import { QuestionDto } from "@repo/dtos/questions";
import DifficultyBadge from "@/components/DifficultyBadge";
import { Badge } from "@/components/ui/badge";
import { CATEGORY, COMPLEXITY } from "@repo/dtos/generated/enums/questions.enums";
import Link from "next/link";
import { DataTableRowActions } from "./QuestionTableRowActions";
import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";

// Complexity sorting order
const complexityOrder: { [key in COMPLEXITY]: number } = {
  [COMPLEXITY.Easy]: 1,
  [COMPLEXITY.Medium]: 2,
  [COMPLEXITY.Hard]: 3,
};

// Sorting function for complexity
const complexitySortingFn: SortingFn<QuestionDto> = (rowA, rowB, columnId) => {
  const valueA = rowA.getValue(columnId) as COMPLEXITY;
  const valueB = rowB.getValue(columnId) as COMPLEXITY;
  return complexityOrder[valueA] - complexityOrder[valueB];
};

// Sorting function for categories by number of categories
const categorySortingFn: SortingFn<QuestionDto> = (rowA, rowB, columnId) => {
  const valueA = rowA.getValue(columnId) as string[];
  const valueB = rowB.getValue(columnId) as string[];
  return valueA.length - valueB.length;
};

export const columns: ColumnDef<QuestionDto>[] = [
  {
    accessorKey: "q_title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`/question/${row.original.id}`}
          className="text-blue-500 hover:text-blue-700"
        >
          {row.original.q_title}
        </Link>
      );
    },
  },
  {
    accessorKey: "q_complexity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Complexity" />
    ),
    cell: ({ row }) => {
      return <DifficultyBadge complexity={row.original.q_complexity} />;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    sortingFn: complexitySortingFn,
  },
  {
    accessorKey: "q_category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Categories" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-wrap gap-2 max-w-md">
          {row.original.q_category.map((category) => (
            <Badge key={category} variant="secondary" className="mr-2">
              {category}
            </Badge>
          ))}
        </div>
      );
    },
    filterFn: (row, id, filterValues: string[]) => {
      const rowValues = row.getValue(id) as string[];
      return (
        filterValues.length === 0 ||
        filterValues.every((filterValue) => rowValues.includes(CATEGORY[filterValue as keyof typeof CATEGORY]))
      );
    },
    sortingFn: categorySortingFn,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
