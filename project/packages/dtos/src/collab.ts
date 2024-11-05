import { z } from "zod";
import { CATEGORY, COMPLEXITY } from "./generated/enums/questions.enums";
import { questionSchema } from "./questions";

const categoryEnum = z.nativeEnum(CATEGORY);
const complexityEnum = z.nativeEnum(COMPLEXITY);

export const collabQuestionSchema = z.object({
  complexity: complexityEnum,
  category: z
    .array(categoryEnum)
    .min(1, { message: "At least one category is required" })
    // Enforce uniqueness of categories
    .refine((categories) => new Set(categories).size === categories.length, {
      message: "Categories must be unique",
    }),
});

// Optional TODO: Do we want to also keep track of the number of question the user has done?
export const collaboratorSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
});

export const collabInfoSchema = z.object({
  collab_user1: collaboratorSchema,
  collab_user2: collaboratorSchema,
  question: questionSchema,
});

export const collabCreateSchema = z.object({
  user1_id: z.string().uuid(),
  user2_id: z.string().uuid(),
  match_id: z.string().uuid(),
  question_id: z.string().uuid(),
});

export const collabRequestSchema = collabQuestionSchema.extend({
  user1_id: z.string().uuid(),
  user2_id: z.string().uuid(),
  match_id: z.string().uuid(),
});

export const collabSchema = collabCreateSchema.extend({
  id: z.string().uuid(),
});

export const responseWrapperSchema = z.object({
  data: z.array(collabSchema),
  count: z.number(),
  message: z.string().optional(),
});

export const sortCollaborationsQuerySchema = z.object({
  field: z.string(),
  order: z.enum(["asc", "desc"]),
});

export const collabFiltersSchema = z.object({
  user_id: z.string().uuid(),
  includeEnded: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val.toLowerCase() === "true") return true;
      if (val.toLowerCase() === "false") return false;
      return val;
    }
    return val;
  }, z.boolean()),
  collab_user_id: z.string().uuid().optional(),

  offset: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),

  sort: z.array(sortCollaborationsQuerySchema).optional(),
});

export type CollabFiltersDto = z.infer<typeof collabFiltersSchema>;
export type CollabUserDto = z.infer<typeof collaboratorSchema>;
export type CollabInfoDto = z.infer<typeof collabInfoSchema>;
export type CollabRequestDto = z.infer<typeof collabRequestSchema>;
export type CollabQuestionDto = z.infer<typeof collabQuestionSchema>;
export type CollabCreateDto = z.infer<typeof collabCreateSchema>;
export type CollabDto = z.infer<typeof collabSchema>;
export type ResponseWrapperDto = z.infer<typeof responseWrapperSchema>;
