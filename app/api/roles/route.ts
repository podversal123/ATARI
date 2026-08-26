import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { PERMISSION_LABEL_BY_TYPE } from "@/lib/rbac-server";

/**
 * Real Role Management list - the 9 system roles (shared, zoneId: null)
 * plus any custom roles a Super Admin has added in their own zone. Viewable
 * by any signed-in admin-level account (client spec: every Admin role gets
 * at least View on Role Management); only Super Admin can mutate (enforced
 * in the mutating routes, not here).
 */
export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const roles = await prisma.role.findMany({
    where: { OR: [{ zoneId: null }, { zoneId: auth.session.zoneId }] },
    include: { permissions: true, _count: { select: { users: true } } },
    orderBy: { hierarchyLevel: "asc" },
  });

  return NextResponse.json({
    roles: roles.map((role) => ({
      id: role.id,
      name: role.name,
      slug: role.slug,
      hierarchyLevel: role.hierarchyLevel,
      scope: role.scope,
      description: role.description ?? "",
      isSystemRole: role.isSystemRole,
      userCount: role._count.users,
      permissions: role.permissions.map((p) => PERMISSION_LABEL_BY_TYPE[p.type]),
    })),
  });
}

/** Add Role - Super Admin only, per the client spec ("Have control on all the roles and permission"). Always a custom (non-system) role in the Super Admin's own zone. */
export async function POST(request: Request) {
  const auth = await requireSession(["SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const hierarchyLevel = Number(body?.hierarchyLevel);
  const description = typeof body?.description === "string" ? body.description.trim() : "";

  if (!name || !/^[a-z][a-z0-9_]*$/.test(name)) {
    return NextResponse.json(
      { error: "Role name is required and must be snake_case (e.g. state_admin, state_user)." },
      { status: 400 },
    );
  }
  if (!Number.isInteger(hierarchyLevel) || hierarchyLevel < 1 || hierarchyLevel > 9) {
    return NextResponse.json({ error: "Hierarchy level is required (1-9)." }, { status: 400 });
  }

  const existing = await prisma.role.findFirst({
    where: { slug: name, OR: [{ zoneId: null }, { zoneId: auth.session.zoneId }] },
  });
  if (existing) {
    return NextResponse.json({ error: `A role named "${name}" already exists.` }, { status: 400 });
  }

  /**
   * A custom role has no real page/API built for it yet (only the 9 system
   * roles have a defined authLevel/scope in the spec), so it starts with no
   * access at all - KVK_USER-equivalent auth level, KVK scope, zero
   * permissions - until a Super Admin grants some via Manage Permissions.
   * Never invented as broader than that.
   */
  const role = await prisma.role.create({
    data: {
      name,
      slug: name,
      hierarchyLevel,
      scope: "KVK",
      authLevel: "KVK_USER",
      description: description || null,
      isSystemRole: false,
      zoneId: auth.session.zoneId,
    },
  });

  return NextResponse.json({ ok: true, id: role.id }, { status: 201 });
}
