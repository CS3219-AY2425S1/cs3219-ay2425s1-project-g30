import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  COLLABORATION_SERVICE_HOST: z.string().default('localhost'),
  QUESTION_SERVICE_HOST: z.string().default('localhost'),
  AUTH_SERVICE_HOST: z.string().default('localhost'),
  USER_SERVICE_HOST: z.string().default('localhost'),

  HOCUSPOCUS_PORT: z
    .string()
    .transform((v) => parseInt(v, 10))
    .default('1234')
    .pipe(z.number()),

  SUPABASE_URL: z.string().min(1),
  SUPABASE_KEY: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;
