import { z } from "zod";
import { CATEGORY, COMPLEXITY } from "./generated/enums/questions.enums";

const categoryEnum = z.nativeEnum(CATEGORY);
const complexityEnum = z.nativeEnum(COMPLEXITY);

export const matchDataSchema = z.object({
  user1_id: z.string().uuid(),
  user2_id: z.string().uuid(),
  complexity: complexityEnum,
  category: z
    .array(categoryEnum)
    .min(1, { message: "At least one category is required" })
    // Enforce uniqueness of categories
    .refine((categories) => new Set(categories).size === categories.length, {
      message: "Categories must be unique",
    }),
    // idk need yet or not but i will keep it here
    //   created_at: z.date().optional(),
    //   updated_at: z.date().optional(),
    //   deleted_at: z.date().nullable().optional(),
});

export const criteriaSchema = z.object({
  complexity: complexityEnum,
  category: z
    .array(categoryEnum)
    .min(1, { message: "At least one category is required" })
    // Enforce uniqueness of categories
    .refine((categories) => new Set(categories).size === categories.length, {
      message: "Categories must be unique",
    }),
});



export const matchRequestSchema = z.object({
  userId: z.string().uuid(),
  criteria: criteriaSchema
});

export type CriteriaDto = z.infer<typeof criteriaSchema>;
export type MatchDataDto = z.infer<typeof matchDataSchema>;
export type MatchRequestDto = z.infer<typeof matchRequestSchema>;