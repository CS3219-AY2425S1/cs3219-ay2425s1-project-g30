"use client";

import { useEffect } from "react";
import { useZodForm } from "@/lib/form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateQuestionDto, createQuestionSchema } from "@repo/dtos/questions";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CATEGORY, COMPLEXITY } from "@/constants/question";

interface CreateModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCreate: (data: CreateQuestionDto) => void;
}

export default function CreateModal({
  open,
  setOpen,
  onCreate,
}: CreateModalProps) {
  const form = useZodForm({
    schema: createQuestionSchema,
    defaultValues: {
      q_title: "",
      q_desc: "",
      q_complexity: undefined,
      q_category: [],
    },
  });

  const categories = Object.values(CATEGORY);

  const handleSubmit = (data: CreateQuestionDto) => {
    onCreate(data);
  };

  useEffect(() => {
    if (!open) {
      form.reset();
      form.clearErrors();
    }
  }, [open, form]);

  // Function to display the label with an asterisk for required fields
  const renderLabelWithAsterisk = (label: string) => (
    <span>
      {label} <span className="text-red-500">*</span>
    </span>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
                <FormItem>
                  <FormLabel className="text-black">
                    {renderLabelWithAsterisk("Title")}
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
                <FormItem>
                  <FormLabel className="text-black">
                    {renderLabelWithAsterisk("Description")}
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
                <FormItem>
                  <FormLabel className="text-black">
                    {renderLabelWithAsterisk("Complexity")}
                  </FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select complexity" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(COMPLEXITY).map((level) => (
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
                <FormItem>
                  <FormLabel className="text-black">
                    {renderLabelWithAsterisk("Categories")}
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
                            field.value?.includes(cat) ? "default" : "secondary"
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
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={Object.keys(form.formState.errors).length !== 0}
              >
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
