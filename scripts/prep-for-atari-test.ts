/**
 * 2026-09-08 pre-test data prep (client: "kal ATARI test karega").
 *
 * 1. CREDENTIALS - every KVK admin user gets the username (email) from
 *    "KVK New Credentials - Sheet1.pdf" and the password `Atari@54321`
 *    (the client overrode the sheet's `Atari@321`). Super Admin is left
 *    untouched unless --include-super is passed.
 *
 * 2. WEST SINGHBHUM WIPE - keep only "About KVK -> KVK Details" (the Kvk
 *    row itself) and the login account; delete every child data row.
 *
 * Run: npx tsx scripts/prep-for-atari-test.ts            (dry run - prints the plan)
 *      npx tsx scripts/prep-for-atari-test.ts --apply    (writes)
 *      add --include-super to also reset the Super Admin password
 */
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

config({ path: ".env.local" });

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const NEW_PASSWORD = "Atari@54321";

/** email (new username) -> KVK name as printed in the sheet. 66 rows. */
const SHEET: [string, string][] = [
  ["kvkararia@atariams.org", "KVK Araria"],
  ["kvkarwal@atariams.org", "KVK Arwal"],
  ["kvkaurangabad@atariams.org", "KVK Aurangabad"],
  ["kvkbanka@atariams.org", "KVK Banka"],
  ["kvkbegusarai@atariams.org", "KVK Begusarai"],
  ["kvkbhojpur@atariams.org", "KVK Bhojpur"],
  ["kvkbokaro@atariams.org", "KVK Bokaro"],
  ["kvkbuxar@atariams.org", "KVK Buxar"],
  ["kvkchatra@atariams.org", "KVK Chatra"],
  ["kvkdhanbad@atariams.org", "KVK DHANBAD"],
  ["kvkdarbhanga@atariams.org", "KVK Darbhanga"],
  ["kvkdeoghar@atariams.org", "KVK Deoghar"],
  ["kvkdumka@atariams.org", "KVK Dumka"],
  ["kvkeastchamparan@atariams.org", "KVK East Champaran"],
  ["kvkeastchamparanii@atariams.org", "KVK East Champaran-II"],
  ["kvkeastsinghbhum@atariams.org", "KVK East Singhbhum"],
  ["kvkgarhwa@atariams.org", "KVK Garhwa"],
  ["kvkgayaii@atariams.org", "KVK Gaya-II"],
  ["kvkgiridih@atariams.org", "KVK Giridih"],
  ["kvkgodda@atariams.org", "KVK Godda"],
  ["kvkgopalganj@atariams.org", "KVK Gopalganj"],
  ["kvkgumla@atariams.org", "KVK Gumla"],
  ["kvkjamtara@atariams.org", "KVK Jamtara"],
  ["kvkjamui@atariams.org", "KVK Jamui"],
  ["kvkjehanabad@atariams.org", "KVK Jehanabad"],
  ["kvkkaimur@atariams.org", "KVK Kaimur"],
  ["kvkkatihar@atariams.org", "KVK Katihar"],
  ["kvkkhagaria@atariams.org", "KVK Khagaria"],
  ["kvkkhunti@atariams.org", "KVK Khunti"],
  ["kvkkishanganj@atariams.org", "KVK Kishanganj"],
  ["kvkkoderma@atariams.org", "KVK Koderma"],
  ["kvklakhisarai@atariams.org", "KVK Lakhisarai"],
  ["kvklatehar@atariams.org", "KVK Latehar"],
  ["kvklohardaga@atariams.org", "KVK Lohardaga"],
  ["kvkmadhepura@atariams.org", "KVK Madhepura"],
  ["kvkmadhubaniii@atariams.org", "KVK Madhubani-II"],
  ["kvkmanpurgaya@atariams.org", "KVK Manpur Gaya"],
  ["kvkmunger@atariams.org", "KVK Munger"],
  ["kvkmuzaffarpur@atariams.org", "KVK Muzaffarpur"],
  ["kvkmuzaffarpurii@atariams.org", "KVK Muzaffarpur-II"],
  ["kvknalanda@atariams.org", "KVK Nalanda"],
  ["kvknawada@atariams.org", "KVK Nawada"],
  ["kvkpakur@atariams.org", "KVK Pakur"],
  ["kvkpalamu@atariams.org", "KVK Palamu"],
  ["kvkpatna@atariams.org", "KVK Patna"],
  ["kvkpurnea@atariams.org", "KVK Purnea"],
  ["kvkramgarh@atariams.org", "KVK Ramgarh"],
  ["kvkranchi@atariams.org", "KVK Ranchi"],
  ["kvksaharsa@atariams.org", "KVK Saharsa"],
  ["kvksahibganj@atariams.org", "KVK Sahibganj"],
  ["kvksamastipur@atariams.org", "KVK Samastipur"],
  ["kvksamastipurii@atariams.org", "KVK Samastipur-II"],
  ["kvksaraikela@atariams.org", "KVK Saraikela"],
  ["kvksheikhpura@atariams.org", "KVK Sheikhpura"],
  ["kvksheohar@atariams.org", "KVK Sheohar"],
  ["kvksimdega@atariams.org", "KVK Simdega"],
  ["kvksitamarhi@atariams.org", "KVK Sitamarhi"],
  ["kvksiwan@atariams.org", "KVK Siwan"],
  ["kvksupaul@atariams.org", "KVK Supaul"],
  ["kvkvaishali@atariams.org", "KVK Vaishali"],
  ["kvkwestchamparani@atariams.org", "KVK West Champaran-I"],
  ["kvkwestchamparanii@atariams.org", "KVK West Champaran-II"],
  ["kvkwestsinghbhum@atariams.org", "KVK West Singhbhum"],
  ["kvkbhagalpur@atariams.org", "Kvk Bhagalpur"],
  ["kvkrohtas@atariams.org", "Kvk Rohtas"],
  ["kvksaran@atariams.org", "RPCAU-KVK Saran"],
];

/** Sheet KVK name -> DB Kvk.name where they differ (sheet dropped a suffix / prefix / used different case). */
const NAME_ALIAS: Record<string, string> = {
  "kvk dhanbad": "KVK Dhanbad",
  "kvk east champaran": "KVK East Champaran-I",
  "kvk manpur gaya": "KVK Manpur Gaya-I",
  "kvk muzaffarpur": "KVK Muzaffarpur-I",
  "kvk samastipur": "KVK Samastipur-I",
  "kvk bhagalpur": "KVK Bhagalpur",
  "kvk rohtas": "KVK Rohtas",
  "rpcau-kvk saran": "KVK Saran",
};

async function main() {
  const apply = process.argv.includes("--apply");
  const includeSuper = process.argv.includes("--include-super");

  const users = await prisma.user.findMany({
    include: { kvk: { select: { id: true, name: true } } },
  });
  const byKvkName = new Map(users.filter((u) => u.kvk).map((u) => [u.kvk!.name.toLowerCase(), u]));

  console.log("========== 1. CREDENTIALS ==========");
  const hash = await bcrypt.hash(NEW_PASSWORD, 12);
  let matched = 0;
  const usedUserIds = new Set<string>();
  const unmatchedSheet: string[] = [];

  for (const [email, sheetName] of SHEET) {
    const dbName = NAME_ALIAS[sheetName.toLowerCase()] ?? sheetName;
    const user = byKvkName.get(dbName.toLowerCase());
    if (!user) {
      unmatchedSheet.push(`${email}  (sheet "${sheetName}" -> "${dbName}")`);
      continue;
    }
    usedUserIds.add(user.id);
    matched += 1;
    console.log(`  ${user.username.padEnd(24)} -> ${email.padEnd(34)} [${user.kvk!.name}]`);
    if (apply) {
      await prisma.user.update({
        where: { id: user.id },
        data: { username: email, passwordHash: hash },
      });
    }
  }
  console.log(`\n  ${apply ? "updated" : "would update"} ${matched}/${SHEET.length} KVK users; password -> "${NEW_PASSWORD}"`);

  const kvkUsersMissed = users.filter((u) => u.kvk && !usedUserIds.has(u.id));
  if (unmatchedSheet.length) console.log(`  !! sheet rows with NO DB user:\n     ${unmatchedSheet.join("\n     ")}`);
  if (kvkUsersMissed.length) console.log(`  !! DB KVK users with NO sheet row:\n     ${kvkUsersMissed.map((u) => `${u.username} [${u.kvk!.name}]`).join("\n     ")}`);

  const superUser = users.find((u) => u.role === "SUPER_ADMIN");
  if (superUser) {
    if (includeSuper) {
      console.log(`\n  Super Admin "${superUser.username}" password -> "${NEW_PASSWORD}" (--include-super)`);
      if (apply) await prisma.user.update({ where: { id: superUser.id }, data: { passwordHash: hash } });
    } else {
      console.log(`\n  Super Admin "${superUser.username}" left untouched (pass --include-super to also reset it).`);
    }
  }

  console.log("\n========== 2. WEST SINGHBHUM WIPE ==========");
  const wsb = await prisma.kvk.findFirst({
    where: { name: { contains: "West Singhbhum", mode: "insensitive" } },
    select: { id: true, name: true },
  });
  if (!wsb) {
    console.log("  West Singhbhum not found - skipped.");
  } else {
    const kid = wsb.id;
    console.log(`  Keeping: Kvk row "${wsb.name}" (${kid}) + its login account. Everything else (incl. login history) cleared.`);

    const del: Record<string, number> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wipe = async (label: string, run: () => Promise<{ count: number }>, dryCount: () => Promise<number>) => {
      del[label] = apply ? (await run()).count : await dryCount();
    };

    // Fld / Vehicle children (FldDemonstrationDetail / FldExtensionTraining /
    // FldTechnicalFeedback / VehicleStatus) have no kvkId column and no
    // onDelete cascade, so clear them by parent id first.
    const fldIds = (await prisma.fld.findMany({ where: { kvkId: kid }, select: { id: true } })).map((r) => r.id);
    const vehIds = (await prisma.vehicle.findMany({ where: { kvkId: kid }, select: { id: true } })).map((r) => r.id);
    if (fldIds.length) {
      await wipe("fldDemonstrationDetail", () => prisma.fldDemonstrationDetail.deleteMany({ where: { fldId: { in: fldIds } } }), () => prisma.fldDemonstrationDetail.count({ where: { fldId: { in: fldIds } } }));
      await wipe("fldExtensionTraining", () => prisma.fldExtensionTraining.deleteMany({ where: { fldId: { in: fldIds } } }), () => prisma.fldExtensionTraining.count({ where: { fldId: { in: fldIds } } }));
      await wipe("fldTechnicalFeedback", () => prisma.fldTechnicalFeedback.deleteMany({ where: { fldId: { in: fldIds } } }), () => prisma.fldTechnicalFeedback.count({ where: { fldId: { in: fldIds } } }));
    }
    if (vehIds.length) {
      await wipe("vehicleStatus", () => prisma.vehicleStatus.deleteMany({ where: { vehicleId: { in: vehIds } } }), () => prisma.vehicleStatus.count({ where: { vehicleId: { in: vehIds } } }));
    }

    // StaffTransfer before Staff (Staff FK, no cascade).
    await wipe("staffTransfer(from)", () => prisma.staffTransfer.deleteMany({ where: { fromKvkId: kid } }), () => prisma.staffTransfer.count({ where: { fromKvkId: kid } }));
    await wipe("staffTransfer(to)", () => prisma.staffTransfer.deleteMany({ where: { toKvkId: kid } }), () => prisma.staffTransfer.count({ where: { toKvkId: kid } }));

    // Every table that carries a kvkId, except the login account (needed to
    // sign in) - the client wants West Singhbhum completely empty apart from
    // its own "About KVK -> KVK Details" record.
    const kvkIdTables = await prisma.$queryRawUnsafe<{ table_name: string }[]>(
      `SELECT table_name::text AS table_name FROM information_schema.columns
       WHERE table_schema = 'public' AND column_name = 'kvkId'
         AND table_name NOT IN ('User') ORDER BY table_name`,
    );
    for (const { table_name } of kvkIdTables) {
      const model = table_name.charAt(0).toLowerCase() + table_name.slice(1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const px = (prisma as any)[model];
      if (!px?.deleteMany) continue;
      await wipe(model, () => px.deleteMany({ where: { kvkId: kid } }), () => px.count({ where: { kvkId: kid } }));
    }
    for (const [m, c] of Object.entries(del)) console.log(`  ${apply ? "deleted" : "would delete"} ${String(c).padStart(3)}  ${m}`);
  }

  console.log(`\n${apply ? "DONE - changes written." : "DRY RUN - re-run with --apply to write."}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
