import { z } from "zod";

import { CATEGORY, COMPLEXITY } from "./generated/enums/questions.enums";
import { collectionMetadataSchema } from "./metatdata";

const categoryEum = z.nativeEnum(CATEGORY);
const complexityEnum = z.nativeEnum(COMPLEXITY);

export const getQuestionsQuerySchema = z.object({
  title: z.string().optional(),
  category: categoryEum.optional(),
  complexity: complexityEnum.optional(),
  includeDeleted: z.coerce.boolean().optional(),

  offset: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

const commonQuestionFields = z.object({
  q_title: z.string().min(1, { message: "Title must not be empty" }),
  q_desc: z.string().min(1, { message: "Description must not be empty" }),
  q_category: z
    .array(categoryEum)
    .min(1, { message: "At least one category is required" })
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

export const questionCollectionSchema = z.object({
  metadata: collectionMetadataSchema,
  questions: z.array(questionSchema),
});

export const createQuestionSchema = commonQuestionFields;

export const updateQuestionSchema = commonQuestionFields.extend({
  id: z.string().uuid(),
});

export type GetQuestionsQueryDto = z.infer<typeof getQuestionsQuerySchema>;

export type QuestionDto = z.infer<typeof questionSchema>;
export type QuestionCollectionDto = z.infer<typeof questionCollectionSchema>;

export type CreateQuestionDto = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionDto = z.infer<typeof updateQuestionSchema>;
