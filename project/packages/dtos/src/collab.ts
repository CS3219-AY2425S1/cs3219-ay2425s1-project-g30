import { z } from "zod";
import { CATEGORY, COMPLEXITY } from "./generated/enums/questions.enums";
import { questionSchema } from "./questions";
import { collectionMetadataSchema } from "./metadata";

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
  id: z.string().uuid().nullable(),
  username: z.string(),
});

export const collabInfoSchema = z.object({
  id: z.string().uuid(),
  started_at: z.date(),
  ended_at: z.date().nullable(),
  collab_user1: collaboratorSchema,
  collab_user2: collaboratorSchema,
  partner: collaboratorSchema.optional(),
  question: questionSchema,
  language: z.string(),
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
  language: z.string(), // default value provided by the database
  started_at: z.date(),
  ended_at: z.date().nullable(),
});

export const collabCollectionSchema = z.object({
  metadata: collectionMetadataSchema,
  collaborations: z.array(collabInfoSchema),
});

export const collabUpdateLanguageSchema = z.object({
  collab_id: z.string().uuid(),
  language: z.string(),
});

export const sortCollaborationsQuerySchema = z.object({
  field: z.string(),
  order: z.enum(["asc", "desc"]),
});

export const collabFiltersSchema = z.object({
  user_id: z.string().uuid(),
  has_ended: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val.toLowerCase() === "true") return true;
      if (val.toLowerCase() === "false") return false;
      return val;
    }
    return val;
  }, z.boolean()),

  collab_user_id: z.string().uuid().optional(), // use partner username instead, client does not know user_id
  q_title: z.string().optional(),
  q_category: z.array(categoryEnum).optional(),
  q_complexity: z.array(complexityEnum).optional(),

  offset: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),

  sort: z.array(sortCollaborationsQuerySchema).optional(),
});

export const activeCollabExistsSchema = z.object({
  user_id: z.string().uuid(),
});

export const executionSnapshotSchema = z.object({
  id: z.string().uuid(),
  collaboration_id: z.string().uuid(),
  code: z.string(),
  output: z.string(),
  language: z.string(),
  user_id: z.string().uuid(),
  created_at: z.date(),
});

export const executionSnapshotCollectionSchema = z.object({
  metadata: collectionMetadataSchema,
  snapshots: z.array(executionSnapshotSchema),
});

export const executionSnapshotCreateSchema = executionSnapshotSchema.omit({
  id: true,
  created_at: true,
});

export type CollabFiltersDto = z.infer<typeof collabFiltersSchema>;
export type CollabUserDto = z.infer<typeof collaboratorSchema>;
export type CollabInfoDto = z.infer<typeof collabInfoSchema>;
export type CollabRequestDto = z.infer<typeof collabRequestSchema>;
export type CollabQuestionDto = z.infer<typeof collabQuestionSchema>;
export type CollabCreateDto = z.infer<typeof collabCreateSchema>;
export type CollabDto = z.infer<typeof collabSchema>;
export type CollabCollectionDto = z.infer<typeof collabCollectionSchema>;
export type ActiveCollabExistsDto = z.infer<typeof activeCollabExistsSchema>;
export type collabUpdateLanguageDto = z.infer<
  typeof collabUpdateLanguageSchema
>;

export type ExecutionSnapshotDto = z.infer<typeof executionSnapshotSchema>;
export type ExecutionSnapshotCollectionDto = z.infer<
  typeof executionSnapshotCollectionSchema
>;
export type ExecutionSnapshotCreateDto = z.infer<
  typeof executionSnapshotCreateSchema
>;
