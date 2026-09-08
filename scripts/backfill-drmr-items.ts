/**
 * One-off backfill: the DRMR Activity import misfiled per-item quantities
 * (Seeds / Fertilizers / PP chemicals / equipments / Kisan Mela / Any other)
 * into `DrmrActivity.farmersByCategory` as `{ seeds: "200 Kg", ... }` instead
 * of a General/OBC/SC/ST x M/F block. Report 3.10.B needs them as
 * `DrmrActivityItem` rows. This reads those keys and creates the child rows.
 *
 * Run: npx tsx scripts/backfill-drmr-items.ts            (dry run)
 *      npx tsx scripts/backfill-drmr-items.ts --apply    (writes)
 */
import { config } from "dotenv";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

config({ path: ".env.local" });
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) });
const APPLY = process.argv.includes("--apply");

/** misfiled JSON key -> { itemKey, unit } */
const KEY_MAP: Record<string, { itemKey: string; unit: string | null }> = {
  seeds: { itemKey: "seeds", unit: "Kg" },
  fertilizer: { itemKey: "fertilizers", unit: "Kg" },
  ppChemicals: { itemKey: "ppChemicals", unit: "Lit." },
  largeEquip: { itemKey: "largeEquipments", unit: "Number" },
  smallEquip: { itemKey: "smallEquipments", unit: "Number" },
  kisanMela: { itemKey: "kisanMela", unit: "No." },
  anyOther: { itemKey: "anyOther", unit: null },
};

/** "200 Kg" / "9 Lit." / "1,120 Kg" -> 200 / 9 / 1120 */
function parseQty(v: unknown): number | null {
  if (v == null) return null;
  const m = String(v).replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

async function main() {
  const records = await prisma.drmrActivity.findMany({
    select: { id: true, zoneId: true, itemActivity: true, unit: true, quantity: true, farmersByCategory: true, items: { select: { id: true } } },
  });
  let created = 0;
  let skipped = 0;
  for (const r of records) {
    if (r.items.length > 0) { skipped++; continue; }
    const j = (r.farmersByCategory ?? {}) as Record<string, unknown>;
    const rows: { itemKey: string; unit: string | null; quantity: number | null; nameSpecification: string | null }[] = [];
    for (const [jsonKey, meta] of Object.entries(KEY_MAP)) {
      const raw = j[jsonKey];
      if (raw == null || String(raw).trim() === "") continue;
      if (meta.itemKey === "anyOther") {
        // free text - the "Name/Specification", not a quantity
        rows.push({ itemKey: "anyOther", unit: meta.unit, quantity: null, nameSpecification: String(raw).trim() });
        continue;
      }
      const q = parseQty(raw);
      if (q != null && q !== 0) rows.push({ itemKey: meta.itemKey, unit: meta.unit, quantity: q, nameSpecification: null });
    }
    // the loose itemActivity/unit/quantity trio, if it held anything
    if (r.itemActivity?.trim() && r.quantity != null) {
      rows.push({ itemKey: r.itemActivity.trim().toLowerCase().replace(/\s+/g, ""), unit: r.unit ?? null, quantity: Number(r.quantity), nameSpecification: null });
    }
    if (rows.length === 0) { skipped++; continue; }
    console.log(`  DrmrActivity ${r.id}: ${rows.map((x) => `${x.itemKey}=${x.quantity ?? x.nameSpecification}${x.unit ? " " + x.unit : ""}`).join(", ")}`);
    if (APPLY) {
      await prisma.drmrActivityItem.createMany({
        data: rows.map((x) => ({ drmrActivityId: r.id, zoneId: r.zoneId, itemKey: x.itemKey, nameSpecification: x.nameSpecification, unit: x.unit, quantity: x.quantity, farmersByCategory: undefined })),
      });
    }
    created += rows.length;
  }
  console.log(`\n${APPLY ? "CREATED" : "WOULD CREATE"} ${created} DrmrActivityItem rows across ${records.length - skipped} submissions; ${skipped} skipped.`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
