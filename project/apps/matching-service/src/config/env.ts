import { z } from 'zod';
export const envSchema = z.object({
  SUPABASE_URL: z.string().min(1),
  SUPABASE_KEY: z.string().min(1),
  NODE_ENV: z.string().default('development'),
  MATCHING_SERVICE_HOST: z.string().default('localhost'),
});
