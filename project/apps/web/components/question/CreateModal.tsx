'use client';

import {
  CATEGORY,
  COMPLEXITY,
} from '@repo/dtos/generated/enums/questions.enums';
import { CreateQuestionDto, createQuestionSchema } from '@repo/dtos/questions';
import { useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useZodForm } from '@/lib/form';
import { useQuestionsStore } from '@/stores/useQuestionStore';
import { renderLabelWithAsterisk } from '@/utils/renderLabelWithAsterisk';

interface CreateModalProps {
  onCreate: (data: CreateQuestionDto) => void;
}

const CreateModal = ({ onCreate }: CreateModalProps) => {
  const isCreateModalOpen = useQuestionsStore.use.isCreateModalOpen();
  const setCreateModalOpen = useQuestionsStore.use.setCreateModalOpen();
  const confirmLoading = useQuestionsStore.use.confirmLoading();
  const form = useZodForm({
    schema: createQuestionSchema,
    defaultValues: {
      q_title: '',
      q_desc: '',
      q_complexity: undefined,
      q_category: [],
    },
  });

  const categories = Object.values(CATEGORY);
  const complexities = Object.values(COMPLEXITY);

  const handleSubmit = (data: CreateQuestionDto) => {
    onCreate(data);
  };

  useEffect(() => {
    if (!open) {
      form.reset();
      form.clearErrors();
    }
  }, [open, form]);

  return (
    <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Create New Question</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Title Field */}
            <FormField
              control={form.control}
              name="q_title"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-black">
                    {renderLabelWithAsterisk('Title')}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="q_desc"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-black">
                    {renderLabelWithAsterisk('Description')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-y max-h-64"
                      placeholder="Enter description"
                      spellCheck={false}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Complexity Dropdown */}
            <FormField
              control={form.control}
              name="q_complexity"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-black">
                    {renderLabelWithAsterisk('Complexity')}
                  </FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select complexity" />
                      </SelectTrigger>
                      <SelectContent>
                        {complexities.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categories Multi-Select */}
            <FormField
              control={form.control}
              name="q_category"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-black">
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={confirmLoading}
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={
                  Object.keys(form.formState.errors).length !== 0 ||
                  confirmLoading
                }
              >
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateModal;
