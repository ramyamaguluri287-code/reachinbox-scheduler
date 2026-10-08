import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

prisma.$connect()
  .then(() => console.log('✅ PostgreSQL connected via Prisma'))
  .catch((err: any) => console.error('❌ PostgreSQL connection error:', err.message));
