/**
 * One-off import: adds Bank Account Details from the live reference
 * (https://atariams.org/bank-account-details, downloaded as its own
 * "Download Excel Report" on 2026-09-03 - 290 rows) that aren't already in
 * the local DB. Bank Account Details is a KVK-scoped leaf with no Super
 * Admin "add on a KVK's behalf" flow yet (see app/api/leaf-record/route.ts's
 * own comment on this), so this can't go through the normal Add New form -
 * writes directly via Prisma instead, matching each row's District to the
 * right KVK the same reliable way scripts/sync-kvk-from-reference.ts does.
 *
 * Dedupes against what's already there by (kvkId, accountNumber) so the 2
 * real Bhagalpur rows already seeded don't get duplicated.
 *
 * Run: npx tsx scripts/import-bank-accounts.ts <path-to-xlsx>            (dry run)
 *      npx tsx scripts/import-bank-accounts.ts <path-to-xlsx> --apply    (writes)
 */
import { config } from "dotenv";
import ExcelJS from "exceljs";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

config({ path: ".env.local" });

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type Row = {
  state: string;
  district: string;
  kvk: string;
  accountType: string;
  accountName: string;
  bankName: string;
  location: string;
  accountNumber: string;
};

function cellText(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "object" && "text" in (v as object)) return String((v as { text: unknown }).text);
  if (typeof v === "object" && "result" in (v as object)) return String((v as { result: unknown }).result);
  return String(v).trim();
}

function normalizeAccountType(raw: string): string {
  const t = raw.trim();
  if (t.toUpperCase() === "REVOLVING FUND") return "Revolving Fund";
  return t; // KVK, CFLD already match the master's own casing
}

async function readRows(xlsxPath: string): Promise<Row[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(xlsxPath);
  const sheet = workbook.worksheets[0];
  const rows: Row[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header
    const v = (row.values as unknown[]).slice(1).map(cellText);
    // S.No, State, District, KVK, Account Type, Account Name, Bank Name, Location, Account Number
    if (!v[2]) return;
    rows.push({
      state: v[1] ?? "",
      district: v[2] ?? "",
      kvk: v[3] ?? "",
      accountType: normalizeAccountType(v[4] ?? ""),
      accountName: v[5] ?? "",
      bankName: v[6] ?? "",
      location: v[7] ?? "",
      accountNumber: v[8] ?? "",
    });
  });
  return rows;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const xlsxPath = process.argv[2];
  if (!xlsxPath || xlsxPath === "--apply") {
    throw new Error("Usage: npx tsx scripts/import-bank-accounts.ts <path-to-xlsx> [--apply]");
  }

  const refRows = await readRows(xlsxPath);

  const zone = await prisma.zone.findFirst();
  if (!zone) throw new Error("No zone found.");

  const kvks = await prisma.kvk.findMany({ where: { zoneId: zone.id }, include: { district: true } });
  const kvkIdByDistrict = new Map(kvks.map((k) => [k.district.name.trim(), k.id]));

  const existing = await prisma.bankAccount.findMany({ where: { zoneId: zone.id } });
  const existingKeys = new Set(existing.map((r) => `${r.kvkId}::${r.accountNumber.trim()}`));

  let toCreate = 0;
  let alreadyPresent = 0;
  const unmatchedDistricts = new Set<string>();
  const creates: { kvkId: string; zoneId: string; accountType: string; accountName: string; bankName: string; location: string; accountNumber: string }[] = [];

  for (const row of refRows) {
    const kvkId = kvkIdByDistrict.get(row.district.trim());
    if (!kvkId) {
      unmatchedDistricts.add(row.district);
      continue;
    }
    const key = `${kvkId}::${row.accountNumber.trim()}`;
    if (existingKeys.has(key)) {
      alreadyPresent += 1;
      continue;
    }
    existingKeys.add(key); // guard against dupes within the reference sheet itself
    toCreate += 1;
    creates.push({
      kvkId,
      zoneId: zone.id,
      accountType: row.accountType,
      accountName: row.accountName,
      bankName: row.bankName,
      location: row.location,
      accountNumber: row.accountNumber,
    });
  }

  console.log(`Reference rows: ${refRows.length}`);
  console.log(`Already present (skipped): ${alreadyPresent}`);
  console.log(`To create: ${toCreate}`);
  if (unmatchedDistricts.size) {
    console.log(`Districts with NO local KVK match: ${[...unmatchedDistricts].join(", ")}`);
  }

  const accountTypes = new Set(refRows.map((r) => r.accountType));
  const existingTypes = await prisma.masterListItem.findMany({
    where: { zoneId: zone.id, type: "BANK_ACCOUNT_TYPE" },
  });
  const existingTypeNames = new Set(existingTypes.map((t) => t.name));
  const missingTypes = [...accountTypes].filter((t) => !existingTypeNames.has(t));
  if (missingTypes.length) {
    console.log(`Bank Account Type Master missing: ${missingTypes.join(", ")}`);
  }

  if (!apply) {
    console.log("\nDry run only - pass --apply to write these changes.");
    return;
  }

  for (const t of missingTypes) {
    await prisma.masterListItem.create({ data: { zoneId: zone.id, type: "BANK_ACCOUNT_TYPE", name: t } });
  }
  if (creates.length) {
    await prisma.bankAccount.createMany({ data: creates });
  }
  console.log(`\nApplied: ${missingTypes.length} account type(s) added, ${creates.length} bank account record(s) created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
