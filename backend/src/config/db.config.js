/**
 * Prisma Client Singleton
 * 
 * Prevents Hot Module Replacement (HMR) from exhausting database connections
 * during local development by using a single, reusable instance.
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config(); // Load environment variables from .env file
const globalForPrisma = global;
const clientOptions = {};

try {
  const pgAdapter = require('@prisma/adapter-pg');
  
  // Resolve the factory safely for CommonJS
  const PrismaPgClass = pgAdapter?.PrismaPg || pgAdapter?.PrismaPgAdapter || pgAdapter?.default?.PrismaPg;
  
  if (typeof PrismaPgClass === 'function') {
    // Prisma v7 requires an instantiated adapter using 'connectionString'
    const adapterInstance = new PrismaPgClass({
      connectionString: process.env.DATABASE_URL
    });
    
    clientOptions.adapter = adapterInstance;
  }
} catch (err) {
  console.error("Prisma driver adapter failed to load:", err);
  // Fallback: If you are not using a driver adapter structure, Prisma v7 still 
  // requires you to explicitly pass configuration details to the constructor.
}

// In Prisma 7, ensure clientOptions has the adapter attached 
const prisma = globalForPrisma.prisma || new PrismaClient(clientOptions);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;