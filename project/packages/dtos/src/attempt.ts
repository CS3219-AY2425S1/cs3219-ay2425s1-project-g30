import z from "zod";
import { collectionMetadataSchema } from "./metadata";

export const attemptFiltersSchema = z.object({
  collab_id: z.string().uuid(),
  user_id: z.string().uuid(),
});

export const attemptSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  language: z.string(),
  document: z.array(z.number()).nullable(), // document stores the Y.js document state
  code: z.string().nullable(), // code stores the raw code text in string format
  output: z.string().nullable(),
  created_at: z.date(),
});

export const attemptCollectionSchema = z.object({
  metadata: collectionMetadataSchema,
  attempts: z.array(attemptSchema),
});

export type AttemptFiltersDto = z.infer<typeof attemptFiltersSchema>;

export type AttemptDto = z.infer<typeof attemptSchema>;
export type AttemptCollectionDto = z.infer<typeof attemptCollectionSchema>;
