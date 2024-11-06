'use client';

import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { UserDataDto } from '@repo/dtos/users';
import { Row } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/useAuthStore';
import { useManageUsersStore } from '@/stores/useManageUsersStore';

interface UsersTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function UsersTableRowActions<TData>({
  row,
}: UsersTableRowActionsProps<TData>) {
  const adminUser = useAuthStore.use.user();
  const setUpdateModalOpen = useManageUsersStore.use.setUpdateModalOpen();
  const setDeleteModalOpen = useManageUsersStore.use.setDeleteModalOpen();
  const setSelectedUser = useManageUsersStore.use.setSelectedUser();

  const user = row.original as UserDataDto;
  const handleOpenEdit = () => {
    setSelectedUser(user);
    setUpdateModalOpen(true);
  };

  const handleOpenDelete = () => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  return (
    <>
      {adminUser && adminUser.id !== user.id && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
              <DotsHorizontalIcon className="w-4 h-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem className="gap-2" onSelect={handleOpenEdit}>
              <Pencil className="w-4 h-4" /> Update
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2" onSelect={handleOpenDelete}>
              <Trash2 className="w-4 h-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}
