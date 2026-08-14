import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().startsWith('postgres://', { message: 'Must be a valid Postgres URL' }),
  CORS_ORIGIN: z.string().default('http://localhost:5173')
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env | undefined{
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}