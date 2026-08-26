/**
 * Seeds the real Products Master data from the client's
 * "atariams_products.xlsx" (528 rows: Name / Type / Category), via the same
 * MASTER_CREATE_REGISTRY create() functions the real Add New forms use -
 * not a duplicate insert path - so category/type resolution and validation
 * stay identical to what a user typing this in by hand would get.
 */
import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { MASTER_CREATE_REGISTRY } from "../lib/masters-registry";
import { ZONE_MASTER_ROWS } from "../lib/masters";

config({ path: ".env.local" });

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type Row = { name: string; type: string; category: string };

async function main() {
  const rows: Row[] = JSON.parse(readFileSync(join(__dirname, "products-seed-data.json"), "utf-8"));

  const zone = await prisma.zone.findFirst({ where: { name: ZONE_MASTER_ROWS[0].zoneName } });
  if (!zone) throw new Error("Zone not found - run the main seed script first.");

  const categories = Array.from(new Set(rows.map((r) => r.category)));

  const seenTypes = new Set<string>();
  const types: { category: string; type: string }[] = [];
  for (const row of rows) {
    const key = JSON.stringify([row.category, row.type]);
    if (seenTypes.has(key)) continue;
    seenTypes.add(key);
    types.push({ category: row.category, type: row.type });
  }

  let categoryCount = 0;
  for (const name of categories) {
    try {
      await MASTER_CREATE_REGISTRY["product-category"]({ name }, zone.id);
      categoryCount += 1;
    } catch (error) {
      console.error(`Category "${name}" failed:`, (error as Error).message);
    }
  }
  console.log(`Product categories created: ${categoryCount}/${categories.length}`);

  let typeCount = 0;
  for (const { category, type } of types) {
    try {
      await MASTER_CREATE_REGISTRY["product-type"](
        { productCategoryName: category, productCategoryType: type },
        zone.id,
      );
      typeCount += 1;
    } catch (error) {
      console.error(`Type "${category} / ${type}" failed:`, (error as Error).message);
    }
  }
  console.log(`Product types created: ${typeCount}/${types.length}`);

  let productCount = 0;
  let failed = 0;
  for (const row of rows) {
    try {
      await MASTER_CREATE_REGISTRY["products"](
        { productCategoryName: row.category, productCategoryType: row.type, productName: row.name },
        zone.id,
      );
      productCount += 1;
    } catch (error) {
      failed += 1;
      console.error(`Product "${row.name}" (${row.category} / ${row.type}) failed:`, (error as Error).message);
    }
  }
  console.log(`Products created: ${productCount}/${rows.length} (${failed} failed)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
