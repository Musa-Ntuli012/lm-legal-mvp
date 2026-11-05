import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient singleton for database access.
 *
 * In development, the client is stored on the global object to prevent
 * multiple instances from being created during hot-reloading (tsx watch).
 * Each reload would otherwise create a new PrismaClient, exhausting
 * database connections.
 *
 * Usage: import { prisma } from './db';
 * Example: await prisma.profile.findUnique({ where: { email } });
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
