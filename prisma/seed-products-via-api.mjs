/**
 * Seeds Products Master via the real running app's own /api/master-record
 * endpoint (not a direct Prisma script) - lib/masters-registry.ts is
 * marked "server-only" and refuses to load outside the Next.js server
 * runtime, so this reuses the exact same validated create path a real user
 * typing this into the Add New form would hit, over HTTP against the dev
 * server already running on :3000.
 */
import { readFileSync } from "fs";

const BASE = "http://localhost:3000";
const rows = JSON.parse(readFileSync(new URL("./products-seed-data.json", import.meta.url), "utf-8"));

async function login() {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "superadmin", password: process.env.SEED_SUPER_ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  const cookie = res.headers.get("set-cookie");
  if (!cookie) throw new Error("No session cookie returned.");
  return cookie.split(";")[0];
}

async function create(cookie, path, values) {
  const res = await fetch(`${BASE}/api/master-record`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ path, values }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, error: data.error };
}

async function runPool(items, size, worker) {
  let index = 0;
  let ok = 0;
  let failed = 0;
  async function next() {
    while (index < items.length) {
      const i = index++;
      const result = await worker(items[i]);
      if (result.ok) ok += 1;
      else {
        failed += 1;
        console.error(`Failed:`, items[i], "->", result.error);
      }
    }
  }
  await Promise.all(Array.from({ length: size }, next));
  return { ok, failed };
}

async function main() {
  const cookie = await login();
  console.log("Logged in.");

  const categories = [...new Set(rows.map((r) => r.category))];
  const catResult = await runPool(categories, 5, (name) => create(cookie, "product-category", { name }));
  console.log(`Categories: ${catResult.ok}/${categories.length} ok, ${catResult.failed} failed`);

  const seenTypes = new Set();
  const types = [];
  for (const row of rows) {
    const key = JSON.stringify([row.category, row.type]);
    if (seenTypes.has(key)) continue;
    seenTypes.add(key);
    types.push({ category: row.category, type: row.type });
  }
  const typeResult = await runPool(types, 5, ({ category, type }) =>
    create(cookie, "product-type", { productCategoryName: category, productCategoryType: type }),
  );
  console.log(`Types: ${typeResult.ok}/${types.length} ok, ${typeResult.failed} failed`);

  const productResult = await runPool(rows, 8, (row) =>
    create(cookie, "products", {
      productCategoryName: row.category,
      productCategoryType: row.type,
      productName: row.name,
    }),
  );
  console.log(`Products: ${productResult.ok}/${rows.length} ok, ${productResult.failed} failed`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
