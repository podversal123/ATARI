/**
 * Seeds the real reference hierarchy (Zone -> State -> District -> Host
 * Organization -> KVK) from lib/masters.ts's confirmed 66-KVK dataset, plus
 * one login per role: a Super Admin and one KVK Admin per KVK.
 *
 * Usernames follow this app's existing role-inference convention
 * (lib/session.tsx: a "kvk"-prefixed username resolves to KVK Admin) - each
 * KVK Admin's username is "kvk-<slug of the KVK's district>".
 */
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import {
  ZONE_MASTER_ROWS,
  HOST_MASTER_ROWS,
  KVK_MASTER_ROWS,
} from "../lib/masters";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const zoneName = ZONE_MASTER_ROWS[0].zoneName;
  const zone = await prisma.zone.upsert({
    where: { name: zoneName },
    update: {},
    create: { name: zoneName },
  });

  const stateIdByName = new Map<string, string>();
  const districtIdByKey = new Map<string, string>();
  const hostOrgIdByName = new Map<string, string>();

  for (const row of KVK_MASTER_ROWS) {
    if (!stateIdByName.has(row.stateName)) {
      const state = await prisma.state.upsert({
        where: { zoneId_name: { zoneId: zone.id, name: row.stateName } },
        update: {},
        create: { name: row.stateName, zoneId: zone.id },
      });
      stateIdByName.set(row.stateName, state.id);
    }
    const stateId = stateIdByName.get(row.stateName)!;

    const districtKey = `${row.stateName}::${row.districtName}`;
    if (!districtIdByKey.has(districtKey)) {
      const district = await prisma.district.upsert({
        where: { stateId_name: { stateId, name: row.districtName } },
        update: {},
        create: { name: row.districtName, stateId, zoneId: zone.id },
      });
      districtIdByKey.set(districtKey, district.id);
    }

    if (!hostOrgIdByName.has(row.hostOrg)) {
      const contact = HOST_MASTER_ROWS.find((h) => h.hostName === row.hostOrg);
      const existing = await prisma.hostOrganization.findFirst({
        where: { zoneId: zone.id, name: row.hostOrg },
      });
      const hostOrg =
        existing ??
        (await prisma.hostOrganization.create({
          data: {
            name: row.hostOrg,
            address: contact?.address,
            officePhone: contact?.phone,
            email: contact?.email,
            zoneId: zone.id,
          },
        }));
      hostOrgIdByName.set(row.hostOrg, hostOrg.id);
    }
  }

  const kvkAdminPassword = process.env.SEED_KVK_ADMIN_PASSWORD;
  const superAdminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD;
  if (!kvkAdminPassword || !superAdminPassword) {
    throw new Error(
      "Set SEED_KVK_ADMIN_PASSWORD and SEED_SUPER_ADMIN_PASSWORD in .env.local before seeding.",
    );
  }
  const kvkAdminPasswordHash = await bcrypt.hash(kvkAdminPassword, 12);
  const superAdminPasswordHash = await bcrypt.hash(superAdminPassword, 12);

  await prisma.user.upsert({
    where: { username: "superadmin" },
    update: {},
    create: {
      username: "superadmin",
      passwordHash: superAdminPasswordHash,
      role: "SUPER_ADMIN",
      zoneId: zone.id,
    },
  });

  let created = 0;
  for (const row of KVK_MASTER_ROWS) {
    const stateId = stateIdByName.get(row.stateName)!;
    const districtId = districtIdByKey.get(`${row.stateName}::${row.districtName}`)!;
    const hostOrgId = hostOrgIdByName.get(row.hostOrg)!;

    const kvk = await prisma.kvk.upsert({
      where: { zoneId_name: { zoneId: zone.id, name: row.kvk } },
      update: {},
      create: {
        name: row.kvk,
        address: row.address,
        officePhone: row.mobile === "-" ? null : row.mobile,
        email: row.email,
        sanctionYear: Number.isFinite(Number(row.sanctionYear))
          ? Number(row.sanctionYear)
          : null,
        zoneId: zone.id,
        stateId,
        districtId,
        hostOrgId,
      },
    });

    const username = `kvk-${slugify(row.kvk.replace(/^KVK\s+/i, ""))}`;
    await prisma.user.upsert({
      where: { username },
      update: {},
      create: {
        username,
        passwordHash: kvkAdminPasswordHash,
        role: "KVK_ADMIN",
        zoneId: zone.id,
        kvkId: kvk.id,
      },
    });
    created += 1;
  }

  console.log(`Seeded 1 zone, ${stateIdByName.size} states, ${districtIdByKey.size} districts, ${hostOrgIdByName.size} host orgs, ${created} KVKs, ${created + 1} users (1 super admin + ${created} KVK admins).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
