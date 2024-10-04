"use client";

import { Suspense } from "react";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { notFound, useRouter } from "next/navigation";
import {
  fetchQuestionById,
  updateQuestion,
  deleteQuestion,
} from "@/lib/api/question";
import { QuestionDto, UpdateQuestionDto } from "@repo/dtos/questions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import DifficultyBadge from "@/components/DifficultyBadge";
import { Badge } from "@/components/ui/badge";
import { QUERY_KEYS } from "@/constants/queryKeys";
import QuestionSkeleton from "./components/QuestionSkeleton";
import EditModal from "./components/EditModal";
import DeleteModal from "./components/DeleteModal";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface QuestionPageProps {
  params: {
    id: string;
  };
}

const QuestionPageContent = ({ id }: { id: string }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { toast } = useToast();
  const { data: question } = useSuspenseQuery<QuestionDto>({
    queryKey: [QUERY_KEYS.Question, id],
    queryFn: () => fetchQuestionById(id),
  });

  const updateMutation = useMutation({
    mutationFn: (updatedQuestion: UpdateQuestionDto) =>
      updateQuestion(updatedQuestion),
    onMutate: () => setConfirmLoading(true),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.Question, id],
      });
      setEditModalOpen(false);
      toast({
        variant: "success",
        title: "Success",
        description: "Question updated successfully",
      });
    },
    onSettled: () => setConfirmLoading(false),
    onError: (error) => {
      toast({
        variant: "error",
        title: "Error",
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteQuestion(id),
    onMutate: () => setConfirmLoading(true),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.Question, id],
      });
      setDeleteModalOpen(false);
      router.push("/questions");
      toast({
        variant: "success",
        title: "Success",
        description: "Question deleted successfully",
      });
    },
    onSettled: () => setConfirmLoading(false),
    onError: (error) => {
      toast({
        variant: "error",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleEditQuestion = (updatedQuestion: UpdateQuestionDto) => {
    updateMutation.mutate(updatedQuestion);
  };

  const handleDeleteQuestion = () => {
    deleteMutation.mutate(id);
  };

  if (!question) {
    return notFound();
  }

  return (
    <div className="container p-4 mx-auto">
      {/* Back Button */}
      <div className="flex items-center my-4">
        <Link href="/questions">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Questions
          </Button>
        </Link>
      </div>

      {/* Question Details */}
      <div
        className={`bg-white shadow-md rounded-lg p-6 relative ${confirmLoading ? "opacity-50" : "opacity-100"}`}
      >
        <div className="absolute flex gap-2 top-4 right-4">
          <Button
            variant="outline"
            disabled={confirmLoading}
            onClick={() => setEditModalOpen(true)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            disabled={confirmLoading}
            onClick={() => setDeleteModalOpen(true)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {question.q_title}
          </h1>
          <DifficultyBadge complexity={question.q_complexity} />
        </div>
        <p className="mb-6 text-gray-600">{question.q_desc}</p>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="font-bold text-gray-700">Categories </div>
            <div className="flex gap-2">
              {question.q_category.map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {question && (
        <EditModal
          open={isEditModalOpen}
          setOpen={setEditModalOpen}
          onSubmit={handleEditQuestion}
          initialValues={question}
        />
      )}

      {question && (
        <DeleteModal
          open={isDeleteModalOpen}
          setOpen={setDeleteModalOpen}
          onDelete={handleDeleteQuestion}
          questionTitle={question.q_title}
        />
      )}
    </div>
  );
};

const QuestionPage = ({ params }: QuestionPageProps) => {
  const { id } = params;

  return (
    <Suspense fallback={<QuestionSkeleton />}>
      <QuestionPageContent id={id} />
    </Suspense>
  );
};

export default QuestionPage;
