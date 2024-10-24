import { z } from "zod";

export const passwordSchema = z.string().min(6);
export const emailSchema = z.string().email("This is not a valid email");

export const signUpSchema = z
  .object({
    email: emailSchema,
    username: z.string().min(4),
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
