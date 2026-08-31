import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, type SessionPayload } from "@/lib/auth";
import { requireSession } from "@/lib/api-auth";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * Who can edit/delete a given user - the client spec's Action Control
 * table, taken as authoritative over an earlier, looser draft note in the
 * same document (flagged separately, not guessed past): Super Admin edits/
 * deletes anyone; KVK Admin only KVK Users in their own KVK; every other
 * role (State/District/Org Admin) is View only, so never reaches here as
 * true.
 */
function canManage(
  session: SessionPayload,
  target: { kvkId: string | null; assignedRole: { slug: string } | null },
) {
  if (session.roleSlug === "kvk_admin") {
    return target.kvkId === session.kvkId && target.assignedRole?.slug === "kvk_user";
  }
  return false;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const target = await prisma.user.findFirst({
    where: { id, zoneId: auth.session.zoneId },
    include: { assignedRole: true },
  });
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const isSuperAdmin = auth.session.role === "SUPER_ADMIN";
  if (!isSuperAdmin && !canManage(auth.session, target)) {
    return NextResponse.json({ error: "Not authorized to edit this user." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const newPassword = typeof body?.password === "string" ? body.password : "";
  const roleSlug = typeof body?.roleSlug === "string" ? body.roleSlug : "";
  const stateName = typeof body?.stateName === "string" ? body.stateName.trim() : "";
  const districtName = typeof body?.districtName === "string" ? body.districtName.trim() : "";
  const hostOrgName = typeof body?.hostOrgName === "string" ? body.hostOrgName.trim() : "";
  const kvkName = typeof body?.kvkName === "string" ? body.kvkName.trim() : "";

  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (email) {
    const existingEmail = await prisma.user.findFirst({ where: { email, id: { not: target.id } } });
    if (existingEmail) return NextResponse.json({ error: "That email is already in use." }, { status: 400 });
  }

  /**
   * Role/scope reassignment - only a Super Admin can move a user to a
   * different role or scope (a KVK Admin editing their own KVK's users
   * never touches these fields, since canManage() only ever lets them edit
   * an already-fixed kvk_user). Mirrors the resolution logic in POST
   * /api/users, minus the CREATABLE_ROLE_SLUGS gate since Super Admin can
   * assign any of the 9 real roles.
   */
  let roleUpdate: {
    role: import("@/lib/auth").SessionPayload["role"];
    roleId: string;
    stateId: string | null;
    districtId: string | null;
    hostOrgId: string | null;
    kvkId: string | null;
  } | null = null;

  if (isSuperAdmin && roleSlug) {
    const targetRole = await prisma.role.findFirst({
      where: { slug: roleSlug, OR: [{ zoneId: null }, { zoneId: auth.session.zoneId }] },
    });
    if (!targetRole) return NextResponse.json({ error: `Unknown role: ${roleSlug}` }, { status: 400 });

    let stateId: string | null = null;
    let districtId: string | null = null;
    let hostOrgId: string | null = null;
    let kvkId: string | null = null;

    if (targetRole.scope === "STATE") {
      if (!stateName) return NextResponse.json({ error: "State is required." }, { status: 400 });
      const state = await prisma.state.findFirst({ where: { zoneId: auth.session.zoneId, name: stateName } });
      if (!state) return NextResponse.json({ error: `Unknown state: ${stateName}` }, { status: 400 });
      stateId = state.id;
    } else if (targetRole.scope === "DISTRICT") {
      if (!districtName) return NextResponse.json({ error: "District is required." }, { status: 400 });
      const district = await prisma.district.findFirst({ where: { name: districtName }, include: { state: true } });
      if (!district) return NextResponse.json({ error: `Unknown district: ${districtName}` }, { status: 400 });
      districtId = district.id;
      stateId = district.stateId;
    } else if (targetRole.scope === "ORG") {
      if (!hostOrgName) return NextResponse.json({ error: "Organisation is required." }, { status: 400 });
      const hostOrg = await prisma.hostOrganization.findFirst({ where: { zoneId: auth.session.zoneId, name: hostOrgName } });
      if (!hostOrg) return NextResponse.json({ error: `Unknown organisation: ${hostOrgName}` }, { status: 400 });
      hostOrgId = hostOrg.id;
    } else if (targetRole.scope === "KVK") {
      if (!kvkName) return NextResponse.json({ error: "KVK is required." }, { status: 400 });
      const kvk = await prisma.kvk.findFirst({ where: { zoneId: auth.session.zoneId, name: kvkName } });
      if (!kvk) return NextResponse.json({ error: `Unknown KVK: ${kvkName}` }, { status: 400 });
      kvkId = kvk.id;
      hostOrgId = kvk.hostOrgId;
      districtId = kvk.districtId;
      stateId = kvk.stateId;
    }

    roleUpdate = { role: targetRole.authLevel, roleId: targetRole.id, stateId, districtId, hostOrgId, kvkId };
  }

  await prisma.user.update({
    where: { id: target.id },
    data: {
      name,
      email: email || null,
      phone: phone || null,
      ...(newPassword ? { passwordHash: await hashPassword(newPassword) } : {}),
      ...(roleUpdate ?? {}),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const target = await prisma.user.findFirst({
    where: { id, zoneId: auth.session.zoneId },
    include: { assignedRole: true },
  });
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const isSuperAdmin = auth.session.role === "SUPER_ADMIN";
  if (!isSuperAdmin && !canManage(auth.session, target)) {
    return NextResponse.json({ error: "Not authorized to delete this user." }, { status: 403 });
  }
  if (target.id === auth.session.sub) {
    return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: target.id } });
  return NextResponse.json({ ok: true });
}
