import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

type RouteParams = { params: Promise<{ id: string }> };

/** Edit Role - Super Admin only (client spec: "State Admin and District Admin: No Edit/Delete option for roles", Org Admin gets View only too). A system role's name/slug is protected; hierarchy level and description can still be adjusted. */
export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireSession(["SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const role = await prisma.role.findFirst({ where: { id, OR: [{ zoneId: null }, { zoneId: auth.session.zoneId }] } });
  if (!role) return NextResponse.json({ error: "Role not found." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const hierarchyLevel = Number(body?.hierarchyLevel);
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!Number.isInteger(hierarchyLevel) || hierarchyLevel < 1 || hierarchyLevel > 9) {
    return NextResponse.json({ error: "Hierarchy level is required (1-9)." }, { status: 400 });
  }

  const data: { hierarchyLevel: number; description: string | null; name?: string; slug?: string } = {
    hierarchyLevel,
    description: description || null,
  };
  if (!role.isSystemRole) {
    if (!name || !/^[a-z][a-z0-9_]*$/.test(name)) {
      return NextResponse.json(
        { error: "Role name is required and must be snake_case (e.g. state_admin, state_user)." },
        { status: 400 },
      );
    }
    data.name = name;
    data.slug = name;
  }

  await prisma.role.update({ where: { id: role.id }, data });
  return NextResponse.json({ ok: true });
}

/** Delete Role - Super Admin only, and only ever a custom (non-system) role - the 9 base roles from the client's spec can never be removed. */
export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await requireSession(["SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const role = await prisma.role.findFirst({ where: { id, zoneId: auth.session.zoneId } });
  if (!role) return NextResponse.json({ error: "Role not found." }, { status: 404 });
  if (role.isSystemRole) {
    return NextResponse.json({ error: "System roles can't be deleted." }, { status: 400 });
  }

  try {
    await prisma.role.delete({ where: { id: role.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const isForeignKeyError =
      typeof error === "object" && error !== null && "code" in error && error.code === "P2003";
    return NextResponse.json(
      { error: isForeignKeyError ? "Can't delete - this role has real records (e.g. Targets) still referencing it." : "Could not delete this role." },
      { status: 400 },
    );
  }
}
