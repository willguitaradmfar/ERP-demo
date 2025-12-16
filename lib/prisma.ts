/*
 * Prisma Client Singleton
 *
 * Cria uma única instância do Prisma Client para ser reutilizada
 * em toda a aplicação Next.js. Evita múltiplas conexões ao banco
 * de dados durante o desenvolvimento com hot-reload.
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
