import { z } from "zod";

import {
  QuestionCategories,
  QuestionComplexity,
} from "./generated/enums/questions.enums";

export const categoryEnum = z.nativeEnum(QuestionCategories);
export const complexityEnum = z.nativeEnum(QuestionComplexity);

export const getQuestionsQuerySchema = z.object({
  title: z.string().optional(),
  category: categoryEnum.optional(),
  complexity: complexityEnum.optional(),
  includeDeleted: z.coerce.boolean().optional(),
});

const commonQuestionFields = z.object({
  q_title: z.string().min(1),
  q_desc: z.string().min(1),
  q_category: z
    .array(categoryEnum)
    .min(1)
    // enforce uniqueness of categories
    .refine((categories) => new Set(categories).size === categories.length, {
      message: "Categories must be unique",
    }),
  q_complexity: complexityEnum,
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
