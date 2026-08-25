import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

/**
 * Lazy singleton so this module can be imported at build time (Next.js
 * evaluates top-level route code during `next build`) without requiring
 * DATABASE_URL to already be set - the client is only constructed on first
 * real use. Cached on `globalThis` in dev so Next.js's hot reload doesn't
 * open a fresh pooled connection on every file save.
 */
declare global {
  var __prisma: PrismaClient | undefined;
}

function createClient() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = globalThis.__prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
