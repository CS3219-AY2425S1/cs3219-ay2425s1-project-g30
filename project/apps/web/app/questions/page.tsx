"use client"

import { Suspense, useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { QuestionDto, CreateQuestionDto } from '@repo/dtos/questions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { QUERY_KEYS } from '@/constants/queryKeys';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Select from 'react-select';
import CreateModal from './components/CreateModal';
import { toast } from '@/hooks/use-toast';
import { createQuestion, fetchQuestions } from '@/lib/api/question';
import Link from 'next/link';
import DifficultyBadge from '@/components/DifficultyBadge';
import QuestionsSkeleton from './components/QuestionsSkeleton';
import EmptyPlaceholder from './components/EmptyPlaceholder';
import { CATEGORY, COMPLEXITY } from '@/constants/question';

type SortField = 'q_title' | 'q_complexity' | 'q_category';

const QuestionRepositoryContent = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

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
        variant: 'success',
        title: 'Success',
        description: 'Question created successfully',
      });
    },
    onSettled: () => setConfirmLoading(false),
    onError: (error) => {
      console.error('Error creating question:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error creating question: ' + error,
      });
    },
  });

  const handleCreateQuestion = (newQuestion: CreateQuestionDto) => {
    createMutation.mutate(newQuestion);
  };

  const [sortField, setSortField] = useState<SortField>('q_title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [filterDifficulty, setFilterDifficulty] = useState<Array<{ value: COMPLEXITY; label: string }>>([]);
  const [filterCategories, setFilterCategories] = useState<Array<{ value: CATEGORY; label: string }>>([]);

  const complexityOrder: { [key in COMPLEXITY]: number } = {
    [COMPLEXITY.Easy]: 1,
    [COMPLEXITY.Medium]: 2,
    [COMPLEXITY.Hard]: 3,
  };
  
  const categoryOptions = [
    { value: CATEGORY.DataStructures, label: 'Data Structures' },
    { value: CATEGORY.Algorithms, label: 'Algorithms' },
    { value: CATEGORY.BrainTeaser, label: 'Brain Teaser' },
    { value: CATEGORY.Strings, label: 'Strings' },
    { value: CATEGORY.Databases, label: 'Databases' },
    { value: CATEGORY.BitManipulation, label: 'Bit Manipulation' },
    { value: CATEGORY.Arrays, label: 'Arrays' },
    { value: CATEGORY.Recursion, label: 'Recursion' },
  ];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((question) => {
      const difficultyMatch =
        filterDifficulty.length === 0 ||
        filterDifficulty.some((option) => option.value === question.q_complexity);

      const categoryMatch =
        filterCategories.length === 0 ||
        question.q_category.some((cat) =>
          filterCategories.some((option) => option.value === cat)
        );

      return difficultyMatch && categoryMatch;
    });
  }, [data, filterDifficulty, filterCategories]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
  
      if (sortField === 'q_title') {
        aValue = a.q_title.toLowerCase();
        bValue = b.q_title.toLowerCase();
      } else if (sortField === 'q_complexity') {
        aValue = complexityOrder[a.q_complexity as COMPLEXITY];
        bValue = complexityOrder[b.q_complexity as COMPLEXITY];
      } else if (sortField === 'q_category') {
        aValue = a.q_category.join(', ').toLowerCase();
        bValue = b.q_category.join(', ').toLowerCase();
      } else {
        return 0;
      }
  
      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortField, sortOrder]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center my-4">
        <h1 className="text-xl font-semibold">Question Repository</h1>
        <Button
          variant="outline"
          disabled={confirmLoading}
          onClick={() => setCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 my-4">
        {/* Difficulty Filter */}
        <div className="w-64">
          <h2 className="font-semibold mb-2">Filter by Difficulty</h2>
          <Select
            isMulti
            options={[
              { value: COMPLEXITY.Easy, label: 'Easy' },
              { value: COMPLEXITY.Medium, label: 'Medium' },
              { value: COMPLEXITY.Hard, label: 'Hard' },
            ]}
            value={filterDifficulty}
            onChange={(selectedOptions) => {
              setFilterDifficulty(selectedOptions as { value: COMPLEXITY; label: string }[] || []);
            }}
            placeholder="Select Difficulty"
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* Topic Filter */}
        <div className="w-200">
          <h2 className="font-semibold mb-2">Filter by Topics</h2>
          <Select
            isMulti
            options={categoryOptions}
            value={filterCategories}
            onChange={(selectedOptions) => {
              setFilterCategories(selectedOptions as { value: CATEGORY; label: string }[] || []);
            }}
            placeholder="Select Topic(s)"
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
      </div>

      {/* Table */}
      {data?.length === 0 ? (
        <EmptyPlaceholder />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                onClick={() => handleSort('q_title')}
                className="cursor-pointer"
                style={{ width: '40%' }}
              >
                Title{' '}
                {sortField === 'q_title' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                onClick={() => handleSort('q_complexity')}
                className="cursor-pointer"
                style={{ width: '10%' }}
              >
                Difficulty{' '}
                {sortField === 'q_complexity' &&
                  (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                onClick={() => handleSort('q_category')}
                className="cursor-pointer"
                style={{ width: '50%' }}
              >
                Categories{' '}
                {sortField === 'q_category' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody
            className={`${confirmLoading ? 'opacity-50' : 'opacity-100'}`}
          >
            {sortedData.map((question) => (
              <TableRow key={question.id}>
                <TableCell style={{ width: '40%' }}>
                  <Link
                    href={`/question/${question.id}`}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    {question.q_title}
                  </Link>
                </TableCell>
                <TableCell style={{ width: '10%' }}>
                  <DifficultyBadge complexity={question.q_complexity} />
                </TableCell>
                <TableCell style={{ width: '50%' }}>
                  <div className="flex flex-wrap gap-2 max-w-md">
                    {question.q_category.map((category) => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className="mr-2"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CreateModal
        open={isCreateModalOpen}
        setOpen={setCreateModalOpen}
        onCreate={handleCreateQuestion}
      />
    </div>
  );
};

const QuestionRepository = () => {
  return (
    <Suspense fallback={<QuestionsSkeleton />}>
      <QuestionRepositoryContent />
    </Suspense>
  );
};

export default QuestionRepository;
