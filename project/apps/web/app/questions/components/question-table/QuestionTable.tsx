"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { fetchQuestions } from "@/lib/api/question";
import { QuestionCollectionDto } from "@repo/dtos/questions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table/DataTable";

import EmptyPlaceholder from "../EmptyPlaceholder";
import { columns } from "./columns";
import { useQuestionsState } from "@/contexts/QuestionsStateContext";
import { QuestionTableToolbar } from "./QuestionTableToolbar";
import { PaginationState } from "@tanstack/react-table";
import { useState } from "react";

export function QuestionTable() {
  const { confirmLoading } = useQuestionsState();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data } = useSuspenseQuery<QuestionCollectionDto>({
    queryKey: [QUERY_KEYS.Question, pagination],
    queryFn: () => fetchQuestions(pagination.pageIndex, pagination.pageSize),
  });

  const metadata = data.metadata;
  const questions = data.questions;

  return (
    <>
      {metadata.count === 0 ? (
        <EmptyPlaceholder />
      ) : (
        <DataTable
          data={questions}
          columns={columns}
          confirmLoading={confirmLoading}
          TableToolbar={QuestionTableToolbar}
          isPaginationControlled
          pagination={pagination}
          onPaginationChange={setPagination}
          rowCount={metadata.totalCount}
        />
      )}
    </>
  );
}
