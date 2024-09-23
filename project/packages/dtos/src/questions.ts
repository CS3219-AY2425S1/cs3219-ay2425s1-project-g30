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

export const questionSchema = z
  .object({
    id: z.bigint(),
    created_at: z.date(),
    updated_at: z.date(),
    deleted_at: z.date().nullable(),
    q_title: z.string(),
    q_desc: z.string(),
    q_category: CategorySchema,
    q_complexity: ComplexitySchema,
  })
  .required();

export const createQuestionSchema = z
  .object({
    q_title: z.string().min(1),
    q_desc: z.string().min(1),
    q_category: CategorySchema,
    q_complexity: ComplexitySchema,
  })
  .required();

export const updateQuestionSchema = z
  .object({
    id: z.bigint(),
    q_title: z.string().min(1),
    q_desc: z.string().min(1),
    q_category: CategorySchema,
    q_complexity: ComplexitySchema,
  })
  .required();

export const deleteQuestionSchema = z.object({
  id: z.bigint(),
});

export type QuestionDto = z.infer<typeof questionSchema>;
export type CreateQuestionDto = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionDto = z.infer<typeof updateQuestionSchema>;
export type DeleteQuestionDto = z.infer<typeof deleteQuestionSchema>;
