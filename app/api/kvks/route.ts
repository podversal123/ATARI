import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const kvks = await prisma.kvk.findMany({
    where: { zoneId: auth.session.zoneId },
    include: { state: true, district: true, hostOrg: true, zone: true },
    orderBy: { name: "asc" },
  });

  const rows = kvks.map((kvk) => ({
    zoneName: kvk.zone.name,
    stateName: kvk.state.name,
    hostOrg: kvk.hostOrg.name,
    districtName: kvk.district.name,
    kvk: kvk.name,
    mobile: kvk.officePhone ?? "-",
    fax: kvk.fax ?? "-",
    email: kvk.email ?? "",
    address: kvk.address ?? "",
    sanctionYear: kvk.sanctionYear ? String(kvk.sanctionYear) : "",
  }));

  return NextResponse.json({ rows, totalCount: rows.length });
}

export async function POST(request: Request) {
  const auth = await requireSession(["SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const stateName = typeof body?.stateName === "string" ? body.stateName : "";
  const districtName = typeof body?.districtName === "string" ? body.districtName : "";
  const instituteName = typeof body?.instituteName === "string" ? body.instituteName : "";
  const hostOrgName = typeof body?.hostOrgName === "string" ? body.hostOrgName : "";
  const address = typeof body?.address === "string" ? body.address : "";
  const email = typeof body?.email === "string" ? body.email : "";
  const mobile = typeof body?.mobile === "string" ? body.mobile : "";
  const fax = typeof body?.fax === "string" ? body.fax : "";
  const sanctionYear = Number.isFinite(Number(body?.sanctionYear))
    ? Number(body.sanctionYear)
    : null;

  if (!name || !stateName || !districtName || !hostOrgName) {
    return NextResponse.json(
      { error: "Name, state, district, and host organization are required." },
      { status: 400 },
    );
  }

  const zoneId = auth.session.zoneId;

  const state = await prisma.state.findFirst({ where: { zoneId, name: stateName } });
  if (!state) {
    return NextResponse.json({ error: `Unknown state: ${stateName}` }, { status: 400 });
  }
  const district = await prisma.district.findFirst({
    where: { stateId: state.id, name: districtName },
  });
  if (!district) {
    return NextResponse.json({ error: `Unknown district: ${districtName}` }, { status: 400 });
  }
  const hostOrg = await prisma.hostOrganization.findFirst({
    where: { zoneId, name: hostOrgName },
  });
  if (!hostOrg) {
    return NextResponse.json(
      { error: `Unknown host organization: ${hostOrgName}` },
      { status: 400 },
    );
  }
  /** Institute is a real, required field on the reference "Create KVK" form (kvk-master-add-form.tsx) that was never actually sent to the backend before - wired through 2026-08-27. */
  const institute = instituteName ? await prisma.institute.findFirst({ where: { zoneId, name: instituteName } }) : null;
  if (instituteName && !institute) {
    return NextResponse.json({ error: `Unknown institute: ${instituteName}` }, { status: 400 });
  }

  const existing = await prisma.kvk.findUnique({ where: { zoneId_name: { zoneId, name } } });
  if (existing) {
    return NextResponse.json({ error: "A KVK with this name already exists." }, { status: 409 });
  }

  const kvk = await prisma.kvk.create({
    data: {
      name,
      address,
      email,
      officePhone: mobile,
      fax: fax || undefined,
      sanctionYear,
      zoneId,
      stateId: state.id,
      districtId: district.id,
      hostOrgId: hostOrg.id,
      instituteId: institute?.id,
    },
  });

  return NextResponse.json({ id: kvk.id }, { status: 201 });
}
