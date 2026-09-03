/**
 * FULL REPLACE import for Vehicles + Vehicle Details + Equipments +
 * Equipment Details (the 4 remaining "About KVK" leaves) from the live
 * reference site atariams.org.
 *
 * Unlike every other scripts/import-*.ts in this repo (which merge new
 * reference rows into existing local data), this one was explicitly
 * requested as a full replace: delete all existing local rows for these 4
 * leaves first, then insert the reference data fresh. So there is no
 * "already present" dedup against the DB - only dedup *within* the
 * reference export itself (see below).
 *
 * Data source: instead of the site's own "Download Excel Report" (which
 * 500s on /view-vehicle-details) or the client-side DataTables Excel/CSV
 * buttons (silently produced no file), the 4 datasets were pulled directly
 * from the underlying DataTables server-side JSON endpoints the admin
 * panel itself calls (vehicle-data, view-vehicle-details, equipment-data,
 * view-equipment-details), fetched from the logged-in browser session and
 * saved as plain JSON. This is strictly better than the Excel exports: it
 * preserves the reference site's own internal numeric ids (vehicle_id /
 * equipment_id), which lets the *-details datasets link to their parent
 * record by id instead of guessing via name/registration-number matching.
 *
 * Files expected (downloaded 2026-09-03, counts from the reference site):
 *   vehicles-raw.json           286 rows  (id, kvkName, name, regNo, yearOfPurchase, cost)
 *   vehicle-details-raw.json    174 rows  (refVehicleId, year, totalRun, status, repairCost, fundingSource, ...)
 *   equipment-raw.json         1927 rows  (id, kvkName, name, yearOfPurchase, cost, status, sourceOfFund)
 *   equipment-details-raw.json  920 rows  (refEquipmentId, year, sourceOfFund, status, ...)
 *
 * Garbage/duplicate handling (per explicit "purana garbage data nhi hona
 * chahiye" instruction):
 *  - equipment-raw.json has 24 exact-duplicate (kvk, name, year, cost)
 *    pairs, all with matching status/sourceOfFund too - genuine duplicate
 *    entries, not distinct units (unlike vehicles, where same-named
 *    blank-reg-no rows differ in year/cost and are real distinct units).
 *    The lower reference id is kept as canonical; the higher id is dropped
 *    and remapped to the canonical id so its equipment-details rows still
 *    attach correctly.
 *  - vehicle-details-raw.json has 4, and equipment-details-raw.json has 29,
 *    exact (refVehicleId/refEquipmentId, year) collisions (the DB unique
 *    constraint only allows one status row per vehicle/equipment per
 *    year) - last-one-wins, since row order mirrors reference insertion
 *    order and the later entry is the more likely correction.
 *
 * KVK name resolution reuses the KVK_NAME_OVERRIDES map established across
 * this session's other import scripts (sync-kvk-from-reference.ts,
 * import-bank-accounts.ts, import-staff.ts, import-staff-transfers.ts,
 * import-infrastructure.ts) - verified 0 unmatched KVK names across all 4
 * files with this map.
 *
 * Run: npx tsx scripts/import-vehicles-equipment.ts            (dry run)
 *      npx tsx scripts/import-vehicles-equipment.ts --apply     (writes)
 *
 * Optional: pass a directory as the first arg to read the 4 *-raw.json
 * files from somewhere other than the Windows Downloads folder.
 */
import { config } from "dotenv";
import fs from "fs";
import { randomUUID } from "crypto";
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

// A few reference rows have a "year of purchase" that's actually multiple
// years run together (e.g. "200720102017" for equipmentId 274 "Generator
// (03)" - 3 units bought in different years crammed into one field) which
// overflows Postgres int4. Treated as unknown (0) rather than guessed at,
// same as this script's handling of blank/non-numeric values.
function toInt(v: unknown): number {
  const n = parseInt(String(v ?? "").trim(), 10);
  if (!Number.isFinite(n)) return 0;
  return n > 2147483647 || n < -2147483648 ? 0 : n;
}

function toDecimal(v: unknown): number {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) ? n : 0;
}

function toDecimalOrNull(v: unknown): number | null {
  if (v === null || v === undefined || String(v).trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toStringOrNull(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

type VehicleRow = { vehicleId: number; kvkName: string; name: string; regNo: string | null; yearOfPurchase: string; cost: string };
type VehicleDetailRow = {
  refVehicleId: number;
  year: string;
  totalRun: number | string | null;
  status: string | null;
  repairCost: number | string | null;
  fundingSource: string | null;
};
type EquipmentRow = { equipmentId: number; kvkName: string; name: string; yearOfPurchase: string; cost: string; status: string | null; sourceOfFund: string | null };
type EquipmentDetailRow = { refEquipmentId: number; year: string; sourceOfFund: unknown; status: string | null };

async function main() {
  const apply = process.argv.includes("--apply");
  const dir = process.argv.slice(2).find((a) => a !== "--apply") ?? "C:/Users/hansh/Downloads/";
  const baseDir = dir.endsWith("/") ? dir : dir + "/";

  const vehicles: VehicleRow[] = JSON.parse(fs.readFileSync(baseDir + "vehicles-raw.json", "utf8"));
  const vehicleDetails: VehicleDetailRow[] = JSON.parse(fs.readFileSync(baseDir + "vehicle-details-raw.json", "utf8"));
  const equipment: EquipmentRow[] = JSON.parse(fs.readFileSync(baseDir + "equipment-raw.json", "utf8"));
  const equipmentDetails: EquipmentDetailRow[] = JSON.parse(fs.readFileSync(baseDir + "equipment-details-raw.json", "utf8"));

  const zone = await prisma.zone.findFirst();
  if (!zone) throw new Error("No zone found.");
  const kvks = await prisma.kvk.findMany({ where: { zoneId: zone.id } });
  const kvkIdByName = new Map(kvks.map((k) => [normalizeName(k.name), k.id]));
  function resolveKvkId(rawName: string): string | undefined {
    const norm = normalizeName(rawName);
    return kvkIdByName.get(norm) ?? kvkIdByName.get(normalizeName(KVK_NAME_OVERRIDES[norm] ?? ""));
  }

  // --- Dedup equipment master rows (see header comment) ---
  const equipmentDedupKey = (r: EquipmentRow) => `${normalizeName(r.kvkName)}::${normalizeName(r.name)}::${r.yearOfPurchase}::${r.cost}`;
  const equipmentCanonicalByKey = new Map<string, EquipmentRow>();
  const equipmentIdRemap = new Map<number, number>(); // dropped id -> kept id
  for (const row of [...equipment].sort((a, b) => a.equipmentId - b.equipmentId)) {
    const key = equipmentDedupKey(row);
    const existing = equipmentCanonicalByKey.get(key);
    if (existing) {
      equipmentIdRemap.set(row.equipmentId, existing.equipmentId);
    } else {
      equipmentCanonicalByKey.set(key, row);
    }
  }
  const dedupedEquipment = [...equipmentCanonicalByKey.values()];

  // --- Build fresh Vehicle rows with our own generated ids ---
  const vehicleLocalId = new Map<number, string>(); // refVehicleId -> local Vehicle.id
  const vehicleCreates: { id: string; kvkId: string; zoneId: string; name: string; registrationNo: string; yearOfPurchase: number; cost: number }[] = [];
  const unmatchedVehicleKvks = new Set<string>();
  for (const row of vehicles) {
    const kvkId = resolveKvkId(row.kvkName);
    if (!kvkId) {
      unmatchedVehicleKvks.add(row.kvkName);
      continue;
    }
    const id = randomUUID();
    vehicleLocalId.set(row.vehicleId, id);
    vehicleCreates.push({
      id,
      kvkId,
      zoneId: zone.id,
      name: row.name,
      registrationNo: row.regNo ?? "",
      yearOfPurchase: toInt(row.yearOfPurchase),
      cost: toDecimal(row.cost),
    });
  }

  // --- Build fresh VehicleStatus rows, deduped by (refVehicleId, year) ---
  const vehicleStatusByKey = new Map<string, VehicleDetailRow>();
  for (const row of vehicleDetails) {
    vehicleStatusByKey.set(`${row.refVehicleId}::${row.year}`, row); // last wins
  }
  const vehicleStatusCreates: {
    vehicleId: string;
    zoneId: string;
    reportingYear: number;
    totalRunKmHrs: number | null;
    presentStatus: string | null;
    repairingCost: number | null;
    fundingSource: string | null;
  }[] = [];
  const unresolvedVehicleStatuses: string[] = [];
  for (const row of vehicleStatusByKey.values()) {
    const localVehicleId = vehicleLocalId.get(row.refVehicleId);
    if (!localVehicleId) {
      unresolvedVehicleStatuses.push(`refVehicleId=${row.refVehicleId} (${row.year})`);
      continue;
    }
    vehicleStatusCreates.push({
      vehicleId: localVehicleId,
      zoneId: zone.id,
      reportingYear: toInt(row.year),
      totalRunKmHrs: toDecimalOrNull(row.totalRun),
      presentStatus: toStringOrNull(row.status),
      repairingCost: toDecimalOrNull(row.repairCost),
      fundingSource: toStringOrNull(row.fundingSource),
    });
  }

  // --- Build fresh Equipment rows with our own generated ids ---
  const equipmentLocalId = new Map<number, string>(); // refEquipmentId -> local Equipment.id
  const equipmentCreates: { id: string; kvkId: string; zoneId: string; name: string; yearOfPurchase: number; cost: number }[] = [];
  const unmatchedEquipmentKvks = new Set<string>();
  for (const row of dedupedEquipment) {
    const kvkId = resolveKvkId(row.kvkName);
    if (!kvkId) {
      unmatchedEquipmentKvks.add(row.kvkName);
      continue;
    }
    const id = randomUUID();
    equipmentLocalId.set(row.equipmentId, id);
    equipmentCreates.push({
      id,
      kvkId,
      zoneId: zone.id,
      name: row.name,
      yearOfPurchase: toInt(row.yearOfPurchase),
      cost: toDecimal(row.cost),
    });
  }
  function resolveEquipmentLocalId(refId: number): string | undefined {
    const canonicalRefId = equipmentIdRemap.get(refId) ?? refId;
    return equipmentLocalId.get(canonicalRefId);
  }

  // --- Build fresh EquipmentStatus rows, deduped by (refEquipmentId, year) ---
  const equipmentStatusByKey = new Map<string, EquipmentDetailRow>();
  for (const row of equipmentDetails) {
    const canonicalRefId = equipmentIdRemap.get(row.refEquipmentId) ?? row.refEquipmentId;
    equipmentStatusByKey.set(`${canonicalRefId}::${row.year}`, row); // last wins
  }
  const equipmentStatusCreates: { equipmentId: string; zoneId: string; reportingYear: number; sourceOfFund: string | null; presentStatus: string | null }[] = [];
  const unresolvedEquipmentStatuses: string[] = [];
  for (const row of equipmentStatusByKey.values()) {
    const localEquipmentId = resolveEquipmentLocalId(row.refEquipmentId);
    if (!localEquipmentId) {
      unresolvedEquipmentStatuses.push(`refEquipmentId=${row.refEquipmentId} (${row.year})`);
      continue;
    }
    equipmentStatusCreates.push({
      equipmentId: localEquipmentId,
      zoneId: zone.id,
      reportingYear: toInt(row.year),
      sourceOfFund: toStringOrNull(row.sourceOfFund),
      presentStatus: toStringOrNull(row.status),
    });
  }

  const existingVehicleCount = await prisma.vehicle.count({ where: { zoneId: zone.id } });
  const existingVehicleStatusCount = await prisma.vehicleStatus.count({ where: { zoneId: zone.id } });
  const existingEquipmentCount = await prisma.equipment.count({ where: { zoneId: zone.id } });
  const existingEquipmentStatusCount = await prisma.equipmentStatus.count({ where: { zoneId: zone.id } });

  console.log("=== Vehicles ===");
  console.log(`Reference rows: ${vehicles.length}, to create: ${vehicleCreates.length}`);
  if (unmatchedVehicleKvks.size) console.log(`Unmatched KVK names: ${[...unmatchedVehicleKvks].join(", ")}`);
  console.log(`Existing local rows to delete: ${existingVehicleCount}`);

  console.log("\n=== Vehicle Details (status) ===");
  console.log(`Reference rows: ${vehicleDetails.length}, deduped: ${vehicleStatusByKey.size}, to create: ${vehicleStatusCreates.length}`);
  if (unresolvedVehicleStatuses.length) console.log(`Unresolved: ${unresolvedVehicleStatuses.join(", ")}`);
  console.log(`Existing local rows to delete: ${existingVehicleStatusCount}`);

  console.log("\n=== Equipment ===");
  console.log(`Reference rows: ${equipment.length}, deduped (removed ${equipment.length - dedupedEquipment.length} exact dupes): ${dedupedEquipment.length}, to create: ${equipmentCreates.length}`);
  if (unmatchedEquipmentKvks.size) console.log(`Unmatched KVK names: ${[...unmatchedEquipmentKvks].join(", ")}`);
  console.log(`Existing local rows to delete: ${existingEquipmentCount}`);

  console.log("\n=== Equipment Details (status) ===");
  console.log(`Reference rows: ${equipmentDetails.length}, deduped: ${equipmentStatusByKey.size}, to create: ${equipmentStatusCreates.length}`);
  if (unresolvedEquipmentStatuses.length) console.log(`Unresolved: ${unresolvedEquipmentStatuses.join(", ")}`);
  console.log(`Existing local rows to delete: ${existingEquipmentStatusCount}`);

  if (!apply) {
    console.log("\nDry run only - pass --apply to write these changes.");
    return;
  }

  await prisma.vehicleStatus.deleteMany({ where: { zoneId: zone.id } });
  await prisma.vehicle.deleteMany({ where: { zoneId: zone.id } });
  await prisma.equipmentStatus.deleteMany({ where: { zoneId: zone.id } });
  await prisma.equipment.deleteMany({ where: { zoneId: zone.id } });

  if (vehicleCreates.length) await prisma.vehicle.createMany({ data: vehicleCreates });
  if (vehicleStatusCreates.length) await prisma.vehicleStatus.createMany({ data: vehicleStatusCreates });
  if (equipmentCreates.length) await prisma.equipment.createMany({ data: equipmentCreates });
  if (equipmentStatusCreates.length) await prisma.equipmentStatus.createMany({ data: equipmentStatusCreates });

  console.log(
    `\nApplied: ${existingVehicleCount + existingVehicleStatusCount + existingEquipmentCount + existingEquipmentStatusCount} old row(s) deleted; ` +
      `${vehicleCreates.length} vehicles, ${vehicleStatusCreates.length} vehicle statuses, ${equipmentCreates.length} equipment, ${equipmentStatusCreates.length} equipment statuses created.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
