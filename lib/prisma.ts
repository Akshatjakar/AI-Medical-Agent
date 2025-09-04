// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Prevent multiple Prisma Clients in dev (causes "too many connections" errors)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"], // optional logging
  });

// Save client in global for hot-reloading in development
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
