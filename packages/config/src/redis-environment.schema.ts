import { z } from 'zod';

export const redisEnvironmentSchema = z
  .object({
    REDIS_URL: z
      .string()
      .trim()
      .url('REDIS_URL must be a valid URL.')
      .refine(
        (value) =>
          value.startsWith('redis://') ||
          value.startsWith('rediss://'),
        'REDIS_URL must use redis:// or rediss://.',
      ),
  })
  .passthrough();

export type RedisEnvironment = z.infer<
  typeof redisEnvironmentSchema
>;

export type RedisConnectionConfiguration = {
  host: string;
  port: number;
  username?: string;
  password?: string;
  db: number;
  tls?: Record<string, never>;
};

export function parseRedisUrl(
  value: string,
): RedisConnectionConfiguration {
  const url = new URL(value);

  if (
    url.protocol !== 'redis:' &&
    url.protocol !== 'rediss:'
  ) {
    throw new Error(
      'Redis URL must use redis:// or rediss://.',
    );
  }

  const databaseText = url.pathname.replace(/^\//, '');
  const database =
    databaseText.length === 0
      ? 0
      : Number.parseInt(databaseText, 10);

  if (!Number.isInteger(database) || database < 0) {
    throw new Error(
      `Redis database must be a non-negative integer. Received: ${databaseText}`,
    );
  }

  return {
    host: url.hostname,
    port: url.port
      ? Number.parseInt(url.port, 10)
      : 6379,
    db: database,
    ...(url.username
      ? {
          username: decodeURIComponent(url.username),
        }
      : {}),
    ...(url.password
      ? {
          password: decodeURIComponent(url.password),
        }
      : {}),
    ...(url.protocol === 'rediss:'
      ? {
          tls: {},
        }
      : {}),
  };
}
