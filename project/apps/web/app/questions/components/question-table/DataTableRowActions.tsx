"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ActionModals } from "@/components/question/ActionModals";
import { QuestionDto } from "@repo/dtos/questions";
import { Pencil, Trash2 } from "lucide-react";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const question = row.original as QuestionDto;
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            className="gap-2"
            onSelect={() => setEditModalOpen(true)}
          >
            <Pencil className="w-4 h-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            onSelect={() => setDeleteModalOpen(true)}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ActionModals
        id={question.id}
        question={question}
        setConfirmLoading={() => {}}
        isEditModalOpen={isEditModalOpen}
        setEditModalOpen={setEditModalOpen}
        isDeleteModalOpen={isDeleteModalOpen}
        setDeleteModalOpen={setDeleteModalOpen}
      />
    </>
  );
}
