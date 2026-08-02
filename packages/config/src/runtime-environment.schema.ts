import {
  databaseEnvironmentSchema,
  type DatabaseEnvironment,
} from './database-environment.schema';
import {
  redisEnvironmentSchema,
  type RedisEnvironment,
} from './redis-environment.schema';

export const runtimeEnvironmentSchema =
  databaseEnvironmentSchema.merge(
    redisEnvironmentSchema,
  );

export type RuntimeEnvironment =
  DatabaseEnvironment & RedisEnvironment;

export function validateRuntimeEnvironment(
  values: Record<string, unknown>,
): RuntimeEnvironment {
  return runtimeEnvironmentSchema.parse(values);
}
