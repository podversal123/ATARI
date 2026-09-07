/**
 * One-off backfill: the 3-accounts-per-role seed (Super Admin + one admin
 * per KVK) never captured a display name, email, or phone for any user, so
 * User Management showed those columns blank for all 67 accounts (client
 * report, 2026-09-06 - "fill the Email ID and Phone Number wherever the
 * required user details are missing").
 *
 * A KVK admin account IS its KVK, so its contact details come straight
 * from the KVK row (name / email / officePhone) - this is exactly what the
 * real atariams.org /view-users shows (KVK Araria -> arariaakvk@gmail.com,
 * 9431645217, matching that KVK's own contact). The Super Admin has no KVK;
 * it takes the reference's own values (name "Atari Super Admin", email
 * "superadmin@atari.com", no phone).
 *
 * Only fills blanks - never overwrites a value a user already has.
 *
 * Run: npx tsx scripts/backfill-user-contacts.ts            (dry run)
 *      npx tsx scripts/backfill-user-contacts.ts --apply    (writes)
 */
import { config } from "dotenv";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

config({ path: ".env.local" });

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SUPER_ADMIN_NAME = "Atari Super Admin";
const SUPER_ADMIN_EMAIL = "superadmin@atari.com";

async function main() {
  const apply = process.argv.includes("--apply");

  const users = await prisma.user.findMany({
    include: { kvk: { select: { name: true, email: true, officePhone: true } } },
    orderBy: { username: "asc" },
  });

  let updated = 0;
  for (const u of users) {
    const data: { name?: string; email?: string; phone?: string } = {};

    if (u.role === "SUPER_ADMIN") {
      if (!u.name) data.name = SUPER_ADMIN_NAME;
      if (!u.email) data.email = SUPER_ADMIN_EMAIL;
    } else if (u.kvk) {
      if (!u.name && u.kvk.name) data.name = u.kvk.name;
      if (!u.email && u.kvk.email) data.email = u.kvk.email;
      if (!u.phone && u.kvk.officePhone) data.phone = u.kvk.officePhone;
    }

    if (Object.keys(data).length === 0) continue;
    updated += 1;
    console.log(`${u.username.padEnd(24)} <- ${JSON.stringify(data)}`);
    if (apply) await prisma.user.update({ where: { id: u.id }, data });
  }

  console.log(`\n${apply ? "updated" : "would update"} ${updated} of ${users.length} users`);
  if (!apply) console.log("Dry run. Re-run with --apply to write.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
