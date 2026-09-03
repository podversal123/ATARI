/**
 * One-off import: adds Infrastructure Details from the live reference's
 * "Download Excel Report" on https://atariams.org/view-infra (downloaded
 * 2026-09-03 - 657 rows: KVK, Name of infrastructure, Not yet started,
 * Completed upto plinth/lintel/roof level, Totally completed, Plinth area
 * (m2), Under use or not, Source of funding). Infrastructure is a
 * KVK-scoped leaf with no Super Admin "add on a KVK's behalf" flow (see
 * app/api/leaf-record/route.ts), so this writes directly via Prisma - same
 * approach as the other scripts/import-*.ts / scripts/sync-*.ts scripts.
 *
 * The 4 existing local rows (all under KVK Bhagalpur: blank name +
 * funding "Test", "Area under Admin Building", "Others, if any", "Area
 * under Boundary Wall") don't match any of the reference's real 15
 * Bhagalpur rows - confirmed test/manual data, not real reference data.
 * Deleted here rather than left mixed in with the real import, matching
 * the standing "no garbage entries" direction from this session's earlier
 * cleanups.
 *
 * Run: npx tsx scripts/import-infrastructure.ts <path-to-xlsx>            (dry run)
 *      npx tsx scripts/import-infrastructure.ts <path-to-xlsx> --apply    (writes)
 */
import { config } from "dotenv";
import ExcelJS from "exceljs";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

config({ path: ".env.local" });

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Same known KVK-name variants reconciled in scripts/sync-kvk-from-reference.ts,
// scripts/import-bank-accounts.ts, scripts/import-staff.ts, and
// scripts/import-staff-transfers.ts - this reference site uses these
// inconsistently across its own exports.
const KVK_NAME_OVERRIDES: Record<string, string> = {
  "krishi vigyan kendra, dumka,": "KVK Dumka",
  "krishi vigyan kendra, dumka": "KVK Dumka",
  "krishi vigyan kendra, nawada": "KVK Nawada",
  "kvk rohtas": "KVK Rohtas",
  "kvk bhagalpur": "KVK Bhagalpur",
  "rpcau-kvk saran": "KVK Saran",
  "kvk manpur gaya": "KVK Manpur Gaya-I",
  // Bare name (no suffix) = the "-I"/primary KVK, same convention confirmed
  // during the original View KVKs reconciliation (scripts/sync-kvk-from-reference.ts).
  "kvk muzaffarpur": "KVK Muzaffarpur-I",
  "kvk east champaran": "KVK East Champaran-I",
  "kvk samastipur": "KVK Samastipur-I",
};

function normalizeName(v: string): string {
  return v.trim().toLowerCase().replace(/\s+/g, " ");
}

function cellText(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "object" && "text" in (v as object)) return String((v as { text: unknown }).text);
  if (typeof v === "object" && "result" in (v as object)) return String((v as { result: unknown }).result);
  return String(v).trim();
}

function cellBool(v: unknown): boolean {
  return cellText(v).trim().toLowerCase() === "yes";
}

function cellDecimal(v: unknown): number | null {
  if (typeof v === "number") return v;
  const s = cellText(v);
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

type Row = {
  kvkName: string;
  infraName: string;
  notYetStarted: boolean;
  completedPlinthLevel: boolean;
  completedLintelLevel: boolean;
  completedRoofLevel: boolean;
  totallyCompleted: boolean;
  plinthAreaSqM: number | null;
  underUse: boolean;
  sourceOfFunding: string;
};

async function readRows(xlsxPath: string): Promise<Row[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(xlsxPath);
  const sheet = workbook.worksheets[0];
  const rows: Row[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header
    const v = (row.values as unknown[]).slice(1);
    // idx: 0 S.No, 1 KVK, 2 Name of infrastructure, 3 Not yet started,
    // 4 Completed plinth, 5 Completed lintel, 6 Completed roof,
    // 7 Totally completed, 8 Plinth area, 9 Under use, 10 Source of funding
    const kvkName = cellText(v[1]);
    const infraName = cellText(v[2]);
    if (!kvkName || !infraName) return;
    rows.push({
      kvkName,
      infraName,
      notYetStarted: cellBool(v[3]),
      completedPlinthLevel: cellBool(v[4]),
      completedLintelLevel: cellBool(v[5]),
      completedRoofLevel: cellBool(v[6]),
      totallyCompleted: cellBool(v[7]),
      plinthAreaSqM: cellDecimal(v[8]),
      underUse: cellBool(v[9]),
      sourceOfFunding: cellText(v[10]),
    });
  });
  return rows;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const xlsxPath = process.argv[2];
  if (!xlsxPath || xlsxPath === "--apply") {
    throw new Error("Usage: npx tsx scripts/import-infrastructure.ts <path-to-xlsx> [--apply]");
  }

  const refRows = await readRows(xlsxPath);

  const zone = await prisma.zone.findFirst();
  if (!zone) throw new Error("No zone found.");

  const kvks = await prisma.kvk.findMany({ where: { zoneId: zone.id } });
  const kvkIdByName = new Map(kvks.map((k) => [normalizeName(k.name), k.id]));
  function resolveKvkId(rawName: string): string | undefined {
    const norm = normalizeName(rawName);
    return kvkIdByName.get(norm) ?? kvkIdByName.get(normalizeName(KVK_NAME_OVERRIDES[norm] ?? ""));
  }

  // Garbage local rows to delete first (see file header comment).
  const garbage = await prisma.infrastructure.findMany({
    where: {
      zoneId: zone.id,
      infrastructureName: { in: ["", "Area under Admin Building", "Others, if any", "Area under Boundary Wall"] },
    },
  });

  const existing = await prisma.infrastructure.findMany({ where: { zoneId: zone.id } });
  const existingKeys = new Set(
    existing
      .filter((r) => !garbage.some((g) => g.id === r.id))
      .map((r) => `${r.kvkId}::${normalizeName(r.infrastructureName)}`),
  );

  let toCreate = 0;
  let alreadyPresent = 0;
  const unmatchedKvks = new Set<string>();
  const creates: {
    kvkId: string;
    zoneId: string;
    infrastructureName: string;
    notYetStarted: boolean;
    completedPlinthLevel: boolean;
    completedLintelLevel: boolean;
    completedRoofLevel: boolean;
    totallyCompleted: boolean;
    plinthAreaSqM: number | null;
    underUse: boolean;
    sourceOfFunding: string;
  }[] = [];

  for (const row of refRows) {
    const kvkId = resolveKvkId(row.kvkName);
    if (!kvkId) {
      unmatchedKvks.add(row.kvkName);
      continue;
    }
    const key = `${kvkId}::${normalizeName(row.infraName)}`;
    if (existingKeys.has(key)) {
      alreadyPresent += 1;
      continue;
    }
    existingKeys.add(key);
    toCreate += 1;
    creates.push({
      kvkId,
      zoneId: zone.id,
      infrastructureName: row.infraName,
      notYetStarted: row.notYetStarted,
      completedPlinthLevel: row.completedPlinthLevel,
      completedLintelLevel: row.completedLintelLevel,
      completedRoofLevel: row.completedRoofLevel,
      totallyCompleted: row.totallyCompleted,
      plinthAreaSqM: row.plinthAreaSqM,
      underUse: row.underUse,
      sourceOfFunding: row.sourceOfFunding,
    });
  }

  console.log(`Reference rows: ${refRows.length}`);
  console.log(`Garbage local rows to delete: ${garbage.length}`);
  console.log(`Already present (skipped): ${alreadyPresent}`);
  console.log(`To create: ${toCreate}`);
  if (unmatchedKvks.size) {
    console.log(`KVK names with no local match: ${[...unmatchedKvks].join(", ")}`);
  }

  if (!apply) {
    console.log("\nDry run only - pass --apply to write these changes.");
    return;
  }
  if (garbage.length) {
    await prisma.infrastructure.deleteMany({ where: { id: { in: garbage.map((g) => g.id) } } });
  }
  if (creates.length) {
    await prisma.infrastructure.createMany({ data: creates });
  }
  console.log(`\nApplied: ${garbage.length} garbage row(s) deleted, ${creates.length} infrastructure record(s) created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
