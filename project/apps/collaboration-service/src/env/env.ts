import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  COLLABORATION_SERVICE_HOST: z.string().default('localhost'),

  SUPABASE_URL: z.string().min(1),
  SUPABASE_KEY: z.string().min(1),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
});

export type Env = z.infer<typeof envSchema>;
