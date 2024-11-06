import { Session } from "@supabase/auth-js";
import { z } from "zod";
import { Tables } from "./generated/types/auth.types";
import { collectionMetadataSchema } from "./metadata";
import { emailSchema, passwordSchema, usernameSchema } from "./auth";
import { ROLE } from "./generated/enums/auth.enums";

export type UserDataDto = Tables<"profiles">;
const rolesEnum = z.nativeEnum(ROLE);

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
});

export const sortUsersQuerySchema = z.object({
  field: z.string(),
  order: z.enum(["asc", "desc"]),
});

export const userFiltersSchema = z.object({
  email: z.string().optional(),
  username: z.string().optional(),
  roles: z.array(rolesEnum).optional(),
  // includeDeleted: z.coerce.boolean().optional(),

  offset: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),

  sort: z.array(sortUsersQuerySchema).optional(),
});

export const updateUserSchema = z.object({
  id: z.string().uuid(),
  email: emailSchema,
  username: usernameSchema,
  role: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    id: z.string().uuid(),
    newPassword: passwordSchema,
    confirmNewPassword: passwordSchema,
  })
  .required()
  .superRefine(({ confirmNewPassword, newPassword }, ctx) => {
    if (confirmNewPassword !== newPassword) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmNewPassword"],
      });
    }
  });

export type UserCollectionDto = z.infer<typeof userCollectionSchema>;
export type UserFiltersDto = z.infer<typeof userFiltersSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type SortUsersQueryDto = z.infer<typeof sortUsersQuerySchema>;
