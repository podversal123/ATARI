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

  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (email) {
    const existingEmail = await prisma.user.findFirst({ where: { email, id: { not: target.id } } });
    if (existingEmail) return NextResponse.json({ error: "That email is already in use." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: target.id },
    data: {
      name,
      email: email || null,
      phone: phone || null,
      ...(newPassword ? { passwordHash: await hashPassword(newPassword) } : {}),
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
