"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { fetchQuestions } from "@/lib/api/question";
import {
  QuestionFiltersDto,
  QuestionCollectionDto,
  SortQuestionsQueryDto,
} from "@repo/dtos/questions";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ControlledTableStateProps,
  DataTable,
} from "@/components/data-table/DataTable";

import EmptyPlaceholder from "../EmptyPlaceholder";
import { columns } from "./columns";
import { useQuestionsState } from "@/contexts/QuestionsStateContext";
import { QuestionTableToolbar } from "./QuestionTableToolbar";
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Updater,
} from "@tanstack/react-table";
import { startTransition, useCallback, useState } from "react";
import {
  CATEGORY,
  COMPLEXITY,
} from "@repo/dtos/generated/enums/questions.enums";
import useDebounce from "@/hooks/useDebounce";

export function QuestionTable() {
  const { confirmLoading } = useQuestionsState();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const resetPagination = () => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  };

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "q_title",
      desc: false,
    },
  ]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const debouncedColumnFilters = useDebounce(columnFilters, 500);

  const { data } = useSuspenseQuery<QuestionCollectionDto>({
    queryKey: [
      QUERY_KEYS.Question,
      pagination,
      sorting,
      debouncedColumnFilters,
    ],
    queryFn: () => {
      console.log("filters", debouncedColumnFilters);
      const title = debouncedColumnFilters.find((f) => f.id === "q_title")
        ?.value as string;

      const categories = debouncedColumnFilters.find(
        (f) => f.id === "q_category",
      )?.value as CATEGORY[];

      const complexities = debouncedColumnFilters.find(
        (f) => f.id === "q_complexity",
      )?.value as COMPLEXITY[];

      const offset = pagination.pageIndex * pagination.pageSize;
      const limit = pagination.pageSize;

      const sort = sorting.map(
        (s) =>
          ({
            field: s.id,
            order: s.desc ? "desc" : "asc",
          }) as SortQuestionsQueryDto,
      );

      const queryParams: QuestionFiltersDto = {
        title,
        categories,
        complexities,
        offset,
        limit,
        sort,
      };

      return fetchQuestions(queryParams);
    },
  });

  const onPaginationChange = (updater: Updater<PaginationState>) => {
    startTransition(() => {
      setPagination(updater);
    });
  };

  const onSortingChange = (updater: Updater<SortingState>) => {
    startTransition(() => {
      setSorting(updater);
      resetPagination();
    });
  };

  const onColumnFiltersChange = (updater: Updater<ColumnFiltersState>) => {
    startTransition(() => {
      setColumnFilters(updater);
      resetPagination();
    });
  };

  const metadata = data.metadata;
  const questions = data.questions;

  const controlledState: ControlledTableStateProps = {
    pagination,
    onPaginationChange,
    rowCount: metadata.totalCount,
    sorting,
    onSortingChange,
    columnFilters,
    onColumnFiltersChange,
  };

  return (
    <>
      <DataTable
        data={questions}
        columns={columns}
        confirmLoading={confirmLoading}
        controlledState={controlledState}
        TableToolbar={QuestionTableToolbar}
      />
    </>
  );
}
