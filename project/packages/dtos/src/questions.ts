import { z } from "zod";

export const categorySchema = z.string().min(1);
export const complexitySchema = z.string().min(1);

export const getQuestionsQuerySchema = z.object({
  title: z.string().optional(),
  category: categorySchema.optional(),
  complexity: complexitySchema.optional(),
  includeDeleted: z.coerce.boolean().optional(),
});

const commonQuestionFields = z.object({
  q_title: z.string().min(1, { message: "Title must not be empty" }),
  q_desc: z.string().min(1, { message: "Description must not be empty" }),
  q_category: z
    .array(categorySchema)
    .min(1, { message: "At least one category is required" })
    // enforce uniqueness of categories
    .refine((categories) => new Set(categories).size === categories.length, {
      message: "Categories must be unique",
    }),
  q_complexity: complexitySchema,
});

export const questionSchema = commonQuestionFields.extend({
  id: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
});

export const createQuestionSchema = commonQuestionFields;

export const updateQuestionSchema = commonQuestionFields.extend({
  id: z.string().uuid(),
});

export type GetQuestionsQueryDto = z.infer<typeof getQuestionsQuerySchema>;

export type QuestionDto = z.infer<typeof questionSchema>;
export type CreateQuestionDto = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionDto = z.infer<typeof updateQuestionSchema>;
