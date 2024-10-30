import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  COLLABORATION_SERVICE_HOST: z.string().default('localhost'),
  AUTH_SERVICE_HOST: z.string().default('localhost'),

  HOCUSPOCUS_PORT: z.number().default(1234),

  SUPABASE_URL: z.string().min(1),
  SUPABASE_KEY: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;
