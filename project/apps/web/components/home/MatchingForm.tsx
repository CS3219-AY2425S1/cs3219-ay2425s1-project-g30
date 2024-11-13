'use client';

import {
  CATEGORY,
  COMPLEXITY,
} from '@repo/dtos/generated/enums/questions.enums';
import { matchCriteriaSchema, MatchRequestMsgDto } from '@repo/dtos/match';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useZodForm } from '@/lib/form';
import { useAuthStore } from '@/stores/useAuthStore';
import { renderLabelWithAsterisk } from '@/utils/renderLabelWithAsterisk';

interface MatchingFormProps {
  onMatch: (matchRequest: MatchRequestMsgDto) => void;
}

const MatchingForm = ({ onMatch }: MatchingFormProps) => {
  const user = useAuthStore.use.user();
  const form = useZodForm({
    schema: matchCriteriaSchema,
    defaultValues: {
      complexity: undefined,
      category: [],
    },
  });

  const complexities = Object.values(COMPLEXITY);
  const categories = Object.values(CATEGORY);

  const handleSubmit = (data: {
    complexity: COMPLEXITY;
    category: CATEGORY[];
  }): void => {
    if (user) {
      const matchRequest: MatchRequestMsgDto = {
        ...data,
        userId: user.id,
      };
      onMatch(matchRequest);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Find Your Match</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Question Difficulty Dropdown */}
          <FormField
            control={form.control}
            name="complexity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-bold text-black mb-2">
                  {renderLabelWithAsterisk('Difficulty')}
                </FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Categories Section */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-bold text-black mb-2">
                  {renderLabelWithAsterisk('Categories')}
                </FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Badge
                        key={cat}
                        onClick={() =>
                          field.value?.includes(cat)
                            ? field.onChange(
                                field.value?.filter((value) => value !== cat),
                              )
                            : field.onChange([...field.value, cat])
                        }
                        variant={
                          field.value?.includes(cat) ? 'default' : 'secondary'
                        }
                        className="cursor-pointer"
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="pt-4">
            <Button type="submit" variant="default" className="w-full">
              Find Match
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MatchingForm;
