import { PrismaClient } from '@prisma/client';

// Use DATABASE_URL directly from environment to avoid any loading issues
const databaseUrl = process.env.DATABASE_URL || 'postgresql://portfolio:portfolio@database:5432/portfolio?sslmode=disable';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

