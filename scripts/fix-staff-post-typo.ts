import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

/**
 * One-off cleanup: the client's staff export spelled the flagship KVK post
 * "SMS (Subject Matter Speaclist)" - a typo of "Specialist". The Dashboard's
 * Staff Summary card keys off the standard spelling, so 265 SMS staff (the
 * largest single category) were rendering as 0. Rewrites the sanctionedPost
 * to the correct designation. Idempotent; run with --apply to commit.
 */
const WRONG = "SMS (Subject Matter Speaclist)";
const RIGHT = "SMS (Subject Matter Specialist)";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const apply = process.argv.includes("--apply");
  const affected = await prisma.staff.count({ where: { sanctionedPost: WRONG } });
  console.log(`Rows with "${WRONG}": ${affected}`);
  if (!apply) {
    console.log("Dry run - pass --apply to update.");
    return;
  }
  const res = await prisma.staff.updateMany({
    where: { sanctionedPost: WRONG },
    data: { sanctionedPost: RIGHT },
  });
  console.log(`Updated ${res.count} rows -> "${RIGHT}".`);
}

main().finally(() => prisma.$disconnect());
