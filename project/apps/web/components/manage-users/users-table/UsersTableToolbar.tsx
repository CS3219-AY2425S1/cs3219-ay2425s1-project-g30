'use client';

import { Cross2Icon } from '@radix-ui/react-icons';
import { ROLE } from '@repo/dtos/generated/enums/auth.enums';
import { Table } from '@tanstack/react-table';

import { DataTableFacetedFilter } from '@/components/data-table/DataTableFacetedFilter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ROLES = Object.values(ROLE).map((value) => ({
  label: value,
  value,
}));

interface UsersTableToolbarProps<TData> {
  table: Table<TData>;
}

export function UsersTableToolbar<TData>({
  table,
}: UsersTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center flex-1 space-x-2">
        <Input
          placeholder="Filter users..."
          value={(table.getColumn('username')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('username')?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn('role') && (
          <DataTableFacetedFilter
            column={table.getColumn('role')}
            title="Role"
            options={ROLES}
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
