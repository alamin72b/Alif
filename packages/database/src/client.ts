import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from './generated/prisma/client';

export type DatabaseClient = PrismaClient;

export function createPrismaClient(
  connectionString: string,
): DatabaseClient {
  if (!connectionString.trim()) {
    throw new Error('A PostgreSQL connection string is required.');
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  return new PrismaClient({
    adapter,
  });
}
