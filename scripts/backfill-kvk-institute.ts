/**
 * One-off backfill: sets Kvk.instituteId for every KVK that doesn't have
 * one yet, derived from its host organization via
 * lib/institute-classification.ts (ICAR / CAU / SAU / NGO - the standard
 * ICAR host-organization taxonomy that the Institute Master already
 * holds).
 *
 * Why this is needed: Kvk.instituteId was added on 2026-08-27, after the
 * 66 KVKs were already seeded, so all of them were left unset. That made
 * "Group by Institute" and the Institute filter on the dashboard
 * analytics pages (OFT / FLD / Training / Extension) collapse every KVK
 * into one "Not set" bar. prisma/seed.ts now sets this on create too, so
 * this script only matters for the already-seeded database.
 *
 * Idempotent: only touches KVKs where instituteId is null. A Super Admin
 * can still correct any individual KVK afterwards in KVK Master.
 *
 * Run: npx tsx scripts/backfill-kvk-institute.ts            (dry run)
 *      npx tsx scripts/backfill-kvk-institute.ts --apply    (writes)
 */
import { config } from "dotenv";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { classifyHostOrgToInstitute, INSTITUTE_CATEGORIES } from "../lib/institute-classification";

config({ path: ".env.local" });

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const apply = process.argv.includes("--apply");

  const zones = await prisma.zone.findMany({ select: { id: true } });

  for (const zone of zones) {
    // Ensure the 4 Institute Master rows exist for this zone - a database
    // that never had them created through the UI would otherwise have
    // nothing to link to.
    const instituteIdByName = new Map<string, string>();
    for (const name of INSTITUTE_CATEGORIES) {
      let inst = await prisma.institute.findFirst({ where: { zoneId: zone.id, name } });
      if (!inst) {
        if (apply) {
          inst = await prisma.institute.create({ data: { name, zoneId: zone.id } });
          console.log(`  + created Institute Master row "${name}"`);
        } else {
          console.log(`  (would create Institute Master row "${name}")`);
        }
      }
      if (inst) instituteIdByName.set(name, inst.id);
    }

    const kvks = await prisma.kvk.findMany({
      where: { zoneId: zone.id, instituteId: null },
      select: { id: true, name: true, hostOrg: { select: { name: true } } },
      orderBy: { name: "asc" },
    });

    if (kvks.length === 0) {
      console.log(`Zone ${zone.id}: nothing to backfill.`);
      continue;
    }

    const counts: Record<string, number> = {};
    for (const kvk of kvks) {
      const hostName = kvk.hostOrg?.name ?? "";
      const category = classifyHostOrgToInstitute(hostName);
      const instituteId = instituteIdByName.get(category);
      counts[category] = (counts[category] ?? 0) + 1;
      console.log(`  ${kvk.name.padEnd(28)} <- ${category.padEnd(4)} (host: ${hostName})`);
      if (apply && instituteId) {
        await prisma.kvk.update({ where: { id: kvk.id }, data: { instituteId } });
      }
    }
    console.log(
      `Zone ${zone.id}: ${apply ? "updated" : "would update"} ${kvks.length} KVKs -`,
      Object.entries(counts).map(([k, n]) => `${k}: ${n}`).join(", "),
    );
  }

  if (!apply) console.log("\nDry run. Re-run with --apply to write.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
