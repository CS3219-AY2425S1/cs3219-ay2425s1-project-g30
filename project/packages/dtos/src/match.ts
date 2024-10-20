import { z } from "zod";
import { CATEGORY, COMPLEXITY } from "./generated/enums/questions.enums";

const categoryEnum = z.nativeEnum(CATEGORY);
const complexityEnum = z.nativeEnum(COMPLEXITY);

export const matchCriteriaSchema = z.object({
  complexity: complexityEnum,
  category: z
    .array(categoryEnum)
    .min(1, { message: "At least one category is required" })
    // Enforce uniqueness of categories
    .refine((categories) => new Set(categories).size === categories.length, {
      message: "Categories must be unique",
    }),
});

export const matchDataSchema = matchCriteriaSchema.extend({
  user1_id: z.string().uuid(),
  user2_id: z.string().uuid(),
  id: z.string().uuid(),
  question_id: z.string().uuid(),
});

export const matchRequestMsgSchema = matchCriteriaSchema.extend({
  userId: z.string().uuid(),
});

export const matchRequestSchema = matchRequestMsgSchema.extend({
  match_req_id: z.string().uuid(),
  timestamp: z.number().int(),
});

export const matchCancelSchema = z.object({
  match_req_id: z.string().uuid(),
});

export type MatchCriteriaDto = z.infer<typeof matchCriteriaSchema>;
export type MatchDataDto = z.infer<typeof matchDataSchema>;
export type MatchRequestDto = z.infer<typeof matchRequestSchema>;
export type MatchCancelDto = z.infer<typeof matchCancelSchema>;
export type MatchRequestMsgDto = z.infer<typeof matchRequestMsgSchema>;
