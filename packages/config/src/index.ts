import { z } from "zod";

export * from './database-environment.schema';
export * from './redis-environment.schema';
export * from './runtime-environment.schema';

export const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  AI_PROVIDER: z.string().default("gemini"),
  AI_API_KEY: z.string().optional(),
});

export type Environment = z.infer<typeof environmentSchema>;

export function loadEnvironment(
  source: Record<string, string | undefined> = {},
): Environment {
  return environmentSchema.parse(source);
}
