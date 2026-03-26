import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL não configurada. Defina em configs/.env ou como variável de ambiente.');
}

/**
 * Shared Prisma client instance for the application.
 * The database URL is validated at module load time to fail fast on misconfiguration.
 */
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

