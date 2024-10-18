'use client';

import { QuestionDto } from '@repo/dtos/questions';

import DifficultyBadge from '@/components/DifficultyBadge';
import { Badge } from '@/components/ui/badge';

interface QuestionCardProps {
  question: QuestionDto;
}

const QuestionCard = ({ question }: QuestionCardProps) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full cursor-default select-none border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-bold text-gray-800">{question.q_title}</h2>
        <DifficultyBadge complexity={question.q_complexity} />
      </div>

      <p className="mb-4 text-gray-600 truncate">{question.q_desc}</p>

      <div className="flex flex-wrap gap-2">
        {question.q_category.map((category) => (
          <Badge key={category} variant="secondary">
            {category}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
