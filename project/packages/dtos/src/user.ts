import { z } from "zod";
import { passwordSchema, emailSchema } from "./auth";

export const userProfileSchema = z
  .object({
    id: z.string(),
    email: emailSchema,
    username: z.string().min(4),
  })
  .required();
  
export const updateUserSchema = z
  .object({
    email: emailSchema,
    username: z.string().min(4),
    password: passwordSchema,
  })
  

export type UserProfileDto = z.infer<typeof userProfileSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
