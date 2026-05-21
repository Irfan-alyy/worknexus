/**
 * Prisma Client Singleton
 * 
 * Prevents Hot Module Replacement (HMR) from exhausting database connections
 * during local development by using a single, reusable instance.
 * 
 * In production, this ensures one consistent connection pool across the application.
 */

const { PrismaClient } = require('@prisma/client');

const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;