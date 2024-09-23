import { z } from "zod";

export enum Complexity {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard",
}

export enum Category {
  Strings = "Strings",
  Algorithms = "Algorithms",
  DataStructures = "Data Structures",
  BitManipulation = "Bit Manipulation",
  Recursion = "Recursion",
  Databases = "Databases",
  BrainTeaser = "Brain Teaser",
  Arrays = "Arrays",
}

const ComplexitySchema = z.nativeEnum(Complexity);
const CategorySchema = z.nativeEnum(Category);

const commonQuestionFields = z.object({
  q_title: z.string().min(1),
  q_desc: z.string().min(1),
  q_category: CategorySchema,
  q_complexity: ComplexitySchema,
});

export const questionSchema = commonQuestionFields.extend({
  id: z.bigint(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
});

export const createQuestionSchema = commonQuestionFields;

export const updateQuestionSchema = commonQuestionFields.extend({
  id: z.bigint(),
});

export const deleteQuestionSchema = z.object({
  id: z.bigint(),
});

export type QuestionDto = z.infer<typeof questionSchema>;
export type CreateQuestionDto = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionDto = z.infer<typeof updateQuestionSchema>;
export type DeleteQuestionDto = z.infer<typeof deleteQuestionSchema>;
