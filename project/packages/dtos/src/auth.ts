import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(4, "Username must be at least 4 characters long");
export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters long");
export const emailSchema = z.string().email("This is not a valid email");

export const signUpSchema = z
  .object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .required()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });

export type SignUpDto = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type SignInDto = z.infer<typeof signInSchema>;
