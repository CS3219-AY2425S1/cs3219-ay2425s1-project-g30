'use client';

import { Cross2Icon } from '@radix-ui/react-icons';
import {
  CATEGORY,
  COMPLEXITY,
} from '@repo/dtos/generated/enums/questions.enums';
import { Table } from '@tanstack/react-table';

import { DataTableFacetedFilter } from '@/components/data-table/DataTableFacetedFilter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// filter value and label should both be the enum values
// e.g. "Data Structures" as opposed to "DataStructures"
const COMPLEXITIES = Object.values(COMPLEXITY).map((value) => ({
  label: value,
  value,
}));

const CATEGORIES = Object.values(CATEGORY).map((value) => ({
  label: value,
  value,
}));

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function CollabTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center flex-1 space-x-2">
        <Input
          placeholder="Filter questions..."
          value={
            (table.getColumn('question.q_title')?.getFilterValue() as string) ??
            ''
          }
          onChange={(event) =>
            table
              .getColumn('question.q_title')
              ?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn('question.q_complexity') && (
          <DataTableFacetedFilter
            column={table.getColumn('question.q_complexity')}
            title="Complexity"
            options={COMPLEXITIES}
            includeFacets={false}
          />
        )}
        {table.getColumn('question.q_category') && (
          <DataTableFacetedFilter
            column={table.getColumn('question.q_category')}
            title="Category"
            options={CATEGORIES}
            includeFacets={false}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
