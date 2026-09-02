import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * Real "Edit" for View KVKs (client direction, 2026-09-01 - Edit should open
 * a dedicated page pre-filled with the real record, matching "Add New", and
 * actually save). Mirrors POST /api/kvks's own validation - same required
 * fields, same "resolve name -> id" lookups for State/District/Host/
 * Institute - since KVK creation was never wired through the generic
 * leaf-record registry (kvk-master-add-form.tsx posts to this same /api/kvks
 * route directly, not /api/leaf-record), Edit needs this same bespoke route
 * rather than the generic /api/leaf-record/update.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireSession(["SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;
  const { id } = await params;

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

  const existing = await prisma.kvk.findFirst({ where: { id, zoneId } });
  if (!existing) {
    return NextResponse.json({ error: "KVK not found." }, { status: 404 });
  }

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
  const institute = instituteName ? await prisma.institute.findFirst({ where: { zoneId, name: instituteName } }) : null;
  if (instituteName && !institute) {
    return NextResponse.json({ error: `Unknown institute: ${instituteName}` }, { status: 400 });
  }

  const nameTaken = await prisma.kvk.findFirst({
    where: { zoneId, name, id: { not: id } },
  });
  if (nameTaken) {
    return NextResponse.json({ error: "A KVK with this name already exists." }, { status: 409 });
  }

  await prisma.kvk.update({
    where: { id },
    data: {
      name,
      address,
      email,
      officePhone: mobile,
      fax: fax || null,
      sanctionYear,
      stateId: state.id,
      districtId: district.id,
      hostOrgId: hostOrg.id,
      instituteId: institute?.id ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
