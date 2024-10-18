import { z } from 'zod';
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  MATCHING_SERVICE_HOST: z.string().default('localhost'),
  QUESTION_SERVICE_HOST: z.string().default('localhost'),
  AUTH_SERVICE_HOST: z.string().default('localhost'),
  USER_SERVICE_HOST: z.string().default('localhost'),
});

export type Env = z.infer<typeof envSchema>;
