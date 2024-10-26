import { z } from "zod";

export const collabCreateSchema = z.object({
  user1_id: z.string().uuid(),
  user2_id: z.string().uuid(),
  match_req1_id: z.string().uuid(), // user 1's match request id, may not be needed
  match_req2_id: z.string().uuid(), // user 2's match request id, may not be needed

  question_id: z.string().uuid(), // chosen question id
});

export const collabSchema = z.object({
  id: z.string().uuid(),
  user1_id: z.string().uuid(),
  user2_id: z.string().uuid(),
  question_id: z.string().uuid(),
});

export type CollabCreateDto = z.infer<typeof collabCreateSchema>;
export type CollabDto = z.infer<typeof collabSchema>;
