'use client';

import { QuestionDto } from '@repo/dtos/questions';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import DifficultyBadge from '@/components/DifficultyBadge';
import { ActionModals } from '@/components/question/ActionModals';
import QuestionSkeleton from '@/components/question/QuestionSkeleton';
import TestCasesSection from '@/components/question/test-cases-section/TestCasesSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { fetchQuestionById } from '@/lib/api/question';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQuestionsStore } from '@/stores/useQuestionStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface QuestionPageProps {
  params: {
    id: string;
  };
}

const QuestionPageContent = ({ id }: { id: string }) => {
  const user = useAuthStore.use.user();
  const setEditModalOpen = useQuestionsStore.use.setEditModalOpen();
  const setDeleteModalOpen = useQuestionsStore.use.setDeleteModalOpen();
  const confirmLoading = useQuestionsStore.use.confirmLoading();

  const { data: question } = useSuspenseQuery<QuestionDto>({
    queryKey: [QUERY_KEYS.Question, id],
    queryFn: () => fetchQuestionById(id),
  });

  if (!question) {
    return notFound();
  }

  return (
    <div className="container p-6 mx-auto">
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
        className={`bg-white shadow-md rounded-lg p-6 relative ${confirmLoading ? 'opacity-50' : 'opacity-100'}`}
      >
        {user?.role === 'Admin' && (
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
        )}

        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {question.q_title}
          </h1>
          <DifficultyBadge complexity={question.q_complexity} />
        </div>
        <ReactMarkdown remarkPlugins={[[remarkGfm]]}>
          {question.q_desc}
        </ReactMarkdown>
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
      {question && <ActionModals question={question} id={id} />}
      {user?.role === 'Admin' && <TestCasesSection questionId={id} />}
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
