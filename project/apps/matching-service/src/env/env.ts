import { z } from 'zod';
export const envSchema = z.object({
  SUPABASE_URL: z.string().min(1),
  SUPABASE_KEY: z.string().min(1),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  MATCHING_SERVICE_HOST: z.string().default('localhost'),
  QUESTION_SERVICE_HOST: z.string().default('localhost'),
  AUTH_SERVICE_HOST: z.string().default('localhost'),
  RABBITMQ_URL: z.string().default('amqp://localhost:5672'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
});

export type Env = z.infer<typeof envSchema>;
