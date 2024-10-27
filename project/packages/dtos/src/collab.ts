import { z } from "zod";
import { questionSchema } from "./questions";

export const collabCreateSchema = z.object({
  user1_id: z.string().uuid(),
  user2_id: z.string().uuid(),
  match_req1_id: z.string().uuid(), // user 1's match request id, may not be needed
  match_req2_id: z.string().uuid(), // user 2's match request id, may not be needed

  question_id: z.string().uuid(), // chosen question id
});

export const collabRoomSchema = z.object({
  room_id: z.string(),
  user1_id: z.string().uuid(),
  user2_id: z.string().uuid(),

  question: questionSchema,
});

export type CollabCreateDto = z.infer<typeof collabCreateSchema>;
export type CollabRoomDto = z.infer<typeof collabRoomSchema>;
