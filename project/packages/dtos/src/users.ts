import { Session } from "@supabase/auth-js";
import { z } from "zod";
import { Tables } from "./generated/types/auth.types";
import { collectionMetadataSchema } from "./metatdata";
import exp from "constants";

export type UserDataDto = Tables<"profiles">;

export type UserSessionDto = { userData: UserDataDto; session: Session };

export type UserAuthRecordDto = {
  id: string;
  last_sign_in_at?: string;
  role?: string;
};

export const userSchema = z.custom<UserDataDto>();

export const userCollectionSchema = z.object({
  metadata: collectionMetadataSchema,
  users: z.array(userSchema),
})

export const userFiltersSchema = z.object({
  email: z.string().optional(),
  username: z.string().optional(),
  // includeDeleted: z.coerce.boolean().optional(),

  offset: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),

  // sort: z.array(sortUserSchema).optional(),
});

export const updateUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
});

export type UserCollectionDto = z.infer<typeof userCollectionSchema>;
export type UserFiltersDto = z.infer<typeof userFiltersSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
