import { config as loadEnvironment } from 'dotenv';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'prisma/config';

const packageDirectory = fileURLToPath(new URL('.', import.meta.url));

loadEnvironment({
  path: resolve(packageDirectory, '../../.env'),
});

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url:
      process.env.DATABASE_URL ??
      'postgresql://alif:alif@localhost:5432/alif?schema=public',
  },
});
