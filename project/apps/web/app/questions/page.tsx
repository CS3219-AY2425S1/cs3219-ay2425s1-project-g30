// page.tsx
"use client";

import { Suspense, useState } from "react";
import { Plus } from "lucide-react";
import { QuestionDto, CreateQuestionDto } from "@repo/dtos/questions";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import CreateModal from "./components/CreateModal";
import { createQuestion, fetchQuestions } from "@/lib/api/question";
import EmptyPlaceholder from "./components/EmptyPlaceholder";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { DataTable } from "./components/question-table/data-table";
import QuestionsSkeleton from "./components/QuestionsSkeleton";
import { useToast } from "@/hooks/use-toast";

const QuestionRepositoryContent = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { toast } = useToast();
  const { data } = useSuspenseQuery<QuestionDto[]>({
    queryKey: [QUERY_KEYS.Question],
    queryFn: fetchQuestions,
  });

  const createMutation = useMutation({
    mutationFn: (newQuestion: CreateQuestionDto) => createQuestion(newQuestion),
    onMutate: () => setConfirmLoading(true),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.Question] });
      setCreateModalOpen(false);
      toast({
        variant: "success",
        title: "Success",
        description: "Question created successfully",
      });
    },
    onSettled: () => setConfirmLoading(false),
    onError: (error: any) => {
      console.error("Error creating question:", error);
      toast({
        variant: "error",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleCreateQuestion = (newQuestion: CreateQuestionDto) => {
    createMutation.mutate(newQuestion);
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center my-4">
        <h1 className="text-xl font-semibold">Question Repository</h1>
        <Button variant="outline" disabled={confirmLoading} onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      {data?.length === 0 ? (
        <EmptyPlaceholder />
      ) : (
        <DataTable data={data} confirmLoading={confirmLoading} />
      )}

      <CreateModal open={isCreateModalOpen} setOpen={setCreateModalOpen} onCreate={handleCreateQuestion} />
    </div>
  );
}

const QuestionRepository = () => {
  return (
    <Suspense fallback={<QuestionsSkeleton />}>
      <QuestionRepositoryContent />
    </Suspense>
  );
};

export default QuestionRepository;