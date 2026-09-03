/**
 * One-off import: adds Staff / Employee Details from the live reference's
 * "Download Excel Report" on https://atariams.org/view-staff (downloaded
 * 2026-09-03 - 635 data rows across all 66 KVKs; note the site's own
 * paginated table claims 706 entries, ~71 more than its own Excel export
 * carries - that gap is on the reference site's side, not something this
 * script can resolve, since Excel is the only complete-in-one-shot source
 * available). Staff is a KVK-scoped leaf with no Super Admin "add on a
 * KVK's behalf" flow (see app/api/leaf-record/route.ts), so this writes
 * directly via Prisma - matching each row's District to the right KVK the
 * same way scripts/sync-kvk-from-reference.ts and
 * scripts/import-bank-accounts.ts already do.
 *
 * Deliberately skips photoUrl/resumeUrl - the reference site has real
 * staff photographs, but this Excel export doesn't carry the image URLs,
 * and bulk-copying real people's photos wasn't asked for.
 *
 * Run: npx tsx scripts/import-staff.ts <path-to-xlsx>            (dry run)
 *      npx tsx scripts/import-staff.ts <path-to-xlsx> --apply    (writes)
 */
import { config } from "dotenv";
import ExcelJS from "exceljs";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

config({ path: ".env.local" });

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type Row = {
  district: string;
  name: string;
  sanctionedPost: string;
  dateOfBirth: Date | null;
  mobile: string;
  email: string;
  discipline: string;
  payScale: string;
  dateOfJoining: Date | null;
  category: string;
};

function cellText(v: unknown): string {
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object" && "text" in (v as object)) return String((v as { text: unknown }).text);
  if (typeof v === "object" && "result" in (v as object)) return String((v as { result: unknown }).result);
  return String(v).trim();
}

function cellDate(v: unknown): Date | null {
  if (v == null || v === "") return null;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  const s = cellText(v);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function readRows(xlsxPath: string): Promise<Row[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(xlsxPath);
  const sheet = workbook.worksheets[0];
  const rows: Row[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header
    const v = row.values as unknown[];
    // idx: 1 S.No, 2 State, 3 District, 4 KVK, 5 Staff Name, 6 Post, 7 DOB,
    // 8 Mobile Number, 9 Email, 10 Discipline, 11 Pay Band, 12 Pay Scale,
    // 13 Date Of Joining, 14 Caste
    const district = cellText(v[3]);
    const name = cellText(v[5]);
    if (!district || !name) return;
    const payBand = cellText(v[11]);
    const payScale = cellText(v[12]);
    rows.push({
      district,
      name,
      sanctionedPost: cellText(v[6]) || "Not specified",
      dateOfBirth: cellDate(v[7]),
      mobile: cellText(v[8]),
      email: cellText(v[9]),
      discipline: cellText(v[10]),
      payScale: payScale || payBand,
      dateOfJoining: cellDate(v[13]),
      category: cellText(v[14]),
    });
  });
  return rows;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const xlsxPath = process.argv[2];
  if (!xlsxPath || xlsxPath === "--apply") {
    throw new Error("Usage: npx tsx scripts/import-staff.ts <path-to-xlsx> [--apply]");
  }

  const refRows = await readRows(xlsxPath);

  const zone = await prisma.zone.findFirst();
  if (!zone) throw new Error("No zone found.");

  const kvks = await prisma.kvk.findMany({ where: { zoneId: zone.id }, include: { district: true } });
  const kvkIdByDistrict = new Map(kvks.map((k) => [k.district.name.trim(), k.id]));

  const existing = await prisma.staff.findMany({ where: { zoneId: zone.id } });
  const existingKeys = new Set(
    existing.map((r) => `${r.kvkId}::${r.name.trim().toLowerCase()}::${(r.mobile ?? "").trim()}`),
  );

  let toCreate = 0;
  let alreadyPresent = 0;
  const unmatchedDistricts = new Set<string>();
  const creates: {
    kvkId: string;
    zoneId: string;
    name: string;
    sanctionedPost: string;
    dateOfBirth: Date | null;
    mobile: string;
    email: string;
    discipline: string;
    payScale: string;
    dateOfJoining: Date | null;
    category: string;
  }[] = [];

  for (const row of refRows) {
    const kvkId = kvkIdByDistrict.get(row.district.trim());
    if (!kvkId) {
      unmatchedDistricts.add(row.district);
      continue;
    }
    const key = `${kvkId}::${row.name.trim().toLowerCase()}::${row.mobile.trim()}`;
    if (existingKeys.has(key)) {
      alreadyPresent += 1;
      continue;
    }
    existingKeys.add(key);
    toCreate += 1;
    creates.push({
      kvkId,
      zoneId: zone.id,
      name: row.name,
      sanctionedPost: row.sanctionedPost,
      dateOfBirth: row.dateOfBirth,
      mobile: row.mobile,
      email: row.email,
      discipline: row.discipline,
      payScale: row.payScale,
      dateOfJoining: row.dateOfJoining,
      category: row.category,
    });
  }

  console.log(`Reference rows: ${refRows.length}`);
  // Covers both "already in the local DB" and "duplicate of an earlier row
  // in this same reference sheet" - the same key set guards against both,
  // so this count doesn't distinguish which.
  console.log(`Already present / duplicate within sheet (skipped): ${alreadyPresent}`);
  console.log(`To create: ${toCreate}`);
  console.log(`Existing local rows not matched by any reference row (untouched): ${existing.length - alreadyPresent}`);
  if (unmatchedDistricts.size) {
    console.log(`Districts with NO local KVK match: ${[...unmatchedDistricts].join(", ")}`);
  }

  if (!apply) {
    console.log("\nDry run only - pass --apply to write these changes.");
    return;
  }

  if (creates.length) {
    await prisma.staff.createMany({ data: creates });
  }
  console.log(`\nApplied: ${creates.length} staff record(s) created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
