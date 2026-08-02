import { z } from 'zod';

export const databaseEnvironmentSchema = z
  .object({
    DATABASE_URL: z
      .string()
      .trim()
      .min(1, 'DATABASE_URL is required.')
      .refine(
        (value) =>
          value.startsWith('postgresql://') ||
          value.startsWith('postgres://'),
        'DATABASE_URL must be a PostgreSQL connection string.',
      ),
  })
  .passthrough();

export type DatabaseEnvironment = z.infer<
  typeof databaseEnvironmentSchema
>;

export function validateDatabaseEnvironment(
  values: Record<string, unknown>,
): DatabaseEnvironment {
  return databaseEnvironmentSchema.parse(values);
}
