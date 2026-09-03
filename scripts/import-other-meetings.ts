/**
 * One-off import: adds "Details of other meeting related to ATARI" rows
 * from the live reference's own DataTables server-side JSON endpoint
 * (https://atariams.org/miscellaneous/view-other-meeting - downloaded
 * 2026-09-03, 1039 rows across all reporting years, fetched directly the
 * same way as scripts/import-vehicles-equipment.ts since this page's own
 * "Download Excel Report" wasn't tried first here but the direct-JSON route
 * is strictly more reliable per that script's own findings). OtherMeeting is
 * a KVK-scoped leaf with no Super Admin "add on a KVK's behalf" flow (see
 * app/api/leaf-record/route.ts), so this writes directly via Prisma - same
 * approach as every other scripts/import-*.ts in this repo.
 *
 * KVK name resolution: all 43 unique KVK names in this export resolve
 * cleanly against the same KVK_NAME_OVERRIDES map reused from every other
 * import script in this session - no new variants found.
 *
 * Garbage/duplicate handling: 4 exact-duplicate (kvk, date, type, agenda,
 * representative) groups (5 extra rows) found in the reference export
 * itself - deduped here, first occurrence kept.
 *
 * Run: npx tsx scripts/import-other-meetings.ts <path-to-json>            (dry run)
 *      npx tsx scripts/import-other-meetings.ts <path-to-json> --apply    (writes)
 */
import { config } from "dotenv";
import fs from "fs";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

config({ path: ".env.local" });

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const KVK_NAME_OVERRIDES: Record<string, string> = {
  "krishi vigyan kendra, dumka,": "KVK Dumka",
  "krishi vigyan kendra, dumka": "KVK Dumka",
  "krishi vigyan kendra, nawada": "KVK Nawada",
  "kvk rohtas": "KVK Rohtas",
  "kvk bhagalpur": "KVK Bhagalpur",
  "rpcau-kvk saran": "KVK Saran",
  "kvk manpur gaya": "KVK Manpur Gaya-I",
  "kvk muzaffarpur": "KVK Muzaffarpur-I",
  "kvk east champaran": "KVK East Champaran-I",
  "kvk samastipur": "KVK Samastipur-I",
};

function normalizeName(v: string): string {
  return v.trim().toLowerCase().replace(/\s+/g, " ");
}

// The reference's own agenda/representative text comes back HTML-entity
// encoded in ~13% of rows (&amp;, &#039;, &quot;, ...) - decoded here so the
// app stores/displays real characters instead of literal "&#039;" (caught
// live, 2026-09-03, after the first import round-tripped them verbatim).
function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

type Row = {
  kvkName: string;
  date: string;
  meetingType: string;
  agenda: string | null;
  representativeFromAtari: string | null;
};

async function main() {
  const apply = process.argv.includes("--apply");
  const jsonPath = process.argv[2];
  if (!jsonPath || jsonPath === "--apply") {
    throw new Error("Usage: npx tsx scripts/import-other-meetings.ts <path-to-json> [--apply]");
  }

  const refRows: Row[] = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  const zone = await prisma.zone.findFirst();
  if (!zone) throw new Error("No zone found.");

  const kvks = await prisma.kvk.findMany({ where: { zoneId: zone.id } });
  const kvkIdByName = new Map(kvks.map((k) => [normalizeName(k.name), k.id]));
  function resolveKvkId(rawName: string): string | undefined {
    const norm = normalizeName(rawName);
    return kvkIdByName.get(norm) ?? kvkIdByName.get(normalizeName(KVK_NAME_OVERRIDES[norm] ?? ""));
  }

  // Dedup exact-duplicate reference rows (see header comment) - first wins.
  const dedupKey = (r: Row) =>
    `${normalizeName(r.kvkName)}::${r.date}::${normalizeName(r.meetingType)}::${normalizeName(r.agenda ?? "")}::${normalizeName(r.representativeFromAtari ?? "")}`;
  const seen = new Set<string>();
  const dedupedRows: Row[] = [];
  for (const row of refRows) {
    const key = dedupKey(row);
    if (seen.has(key)) continue;
    seen.add(key);
    dedupedRows.push(row);
  }

  const existing = await prisma.otherMeeting.findMany({ where: { zoneId: zone.id } });
  const existingKeys = new Set(
    existing.map((r) => `${r.kvkId}::${r.date.toISOString().slice(0, 10)}::${normalizeName(r.meetingType)}::${normalizeName(r.agenda ?? "")}`),
  );

  let toCreate = 0;
  let alreadyPresent = 0;
  const unmatchedKvks = new Set<string>();
  const creates: { kvkId: string; zoneId: string; date: Date; meetingType: string; agenda: string | null; representativeFromAtari: string | null }[] = [];

  for (const row of dedupedRows) {
    const kvkId = resolveKvkId(row.kvkName);
    if (!kvkId) {
      unmatchedKvks.add(row.kvkName);
      continue;
    }
    const key = `${kvkId}::${row.date}::${normalizeName(row.meetingType)}::${normalizeName(row.agenda ?? "")}`;
    if (existingKeys.has(key)) {
      alreadyPresent += 1;
      continue;
    }
    existingKeys.add(key);
    toCreate += 1;
    creates.push({
      kvkId,
      zoneId: zone.id,
      date: new Date(row.date),
      meetingType: row.meetingType,
      agenda: row.agenda ? decodeHtmlEntities(row.agenda) : row.agenda,
      representativeFromAtari: row.representativeFromAtari ? decodeHtmlEntities(row.representativeFromAtari) : row.representativeFromAtari,
    });
  }

  console.log(`Reference rows: ${refRows.length}, deduped (removed ${refRows.length - dedupedRows.length} exact dupes): ${dedupedRows.length}`);
  console.log(`Already present (skipped): ${alreadyPresent}`);
  console.log(`To create: ${toCreate}`);
  if (unmatchedKvks.size) {
    console.log(`KVK names with no local match: ${[...unmatchedKvks].join(", ")}`);
  }

  if (!apply) {
    console.log("\nDry run only - pass --apply to write these changes.");
    return;
  }
  if (creates.length) {
    await prisma.otherMeeting.createMany({ data: creates });
  }
  console.log(`\nApplied: ${creates.length} other-meeting record(s) created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
