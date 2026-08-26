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
  /**
   * Form Summary and the report engine each fan out 100+ independent
   * groupBy/count queries per request via Promise.all (one per tracked
   * leaf/model - see lib/form-summary-data.ts). The Neon pool's default
   * `max` is 10, so most of those queries were queueing behind each other
   * in batches of 10 instead of actually running concurrently, and every
   * batch pays the full Singapore round-trip latency. The connection
   * string already points at Neon's pooled (pgbouncer) endpoint, which
   * comfortably holds far more than this, so raising `max` here lets the
   * real bottleneck (network RTT) be paid once instead of ~11 times.
   */
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL, max: 30 });
  return new PrismaClient({ adapter });
}

export const prisma = globalThis.__prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
