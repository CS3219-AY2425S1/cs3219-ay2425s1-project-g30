'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function MatchingForm() {
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];
  const questionDifficulties = ['Easy', 'Medium', 'Hard'];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Form submitted');
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Find Your Match</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Skill Level Dropdown */}
        <div>
          <label className="block text-black mb-1">Skill Level</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select skill level" />
            </SelectTrigger>
            <SelectContent>
              {skillLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Question Difficulty Dropdown */}
        <div>
          <label className="block text-black mb-1">Question Difficulty</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select question difficulty" />
            </SelectTrigger>
            <SelectContent>
              {questionDifficulties.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
}
