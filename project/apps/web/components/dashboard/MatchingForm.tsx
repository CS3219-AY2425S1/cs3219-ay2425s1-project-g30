'use client';

import {
  CATEGORY,
  COMPLEXITY,
} from '@repo/dtos/generated/enums/questions.enums';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MatchingFormProps {
  startMatching: () => void;
}

const MatchingForm = ({ startMatching }: MatchingFormProps) => {
  const complexities = Object.values(COMPLEXITY);
  const categories = Object.values(CATEGORY);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    startMatching();
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category],
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Find Your Match</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Question Difficulty Dropdown */}
        <div>
          <div className="block text-sm font-bold text-black mb-2">
            Question Difficulty
          </div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select question difficulty" />
            </SelectTrigger>
            <SelectContent>
              {complexities.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Categories Section */}
        <div>
          <div className="block text-sm font-bold text-black mb-2">
            Categories
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                onClick={() => toggleCategory(category)}
                variant={
                  selectedCategories.includes(category)
                    ? 'default'
                    : 'secondary'
                }
                className="cursor-pointer"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button type="submit" variant="default" className="w-full">
            Find Match
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MatchingForm;
