import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { PERMISSION_TYPE_BY_LABEL } from "@/lib/rbac-server";
import { PERMISSIONS } from "@/lib/rbac";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * Manage Permissions - Super Admin only (client spec's Action Control table:
 * only Super Admin has "Manage Permissions" checked; every other role,
 * State/District/Org Admin included, tops out at View). Replaces a role's
 * whole permission set on save - simpler and matches the real "Save
 * Permissions" flow (select the full set, not toggle one at a time against
 * a live diff).
 */
export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await requireSession(["SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const role = await prisma.role.findFirst({ where: { id, OR: [{ zoneId: null }, { zoneId: auth.session.zoneId }] } });
  if (!role) return NextResponse.json({ error: "Role not found." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const labels: unknown[] = Array.isArray(body?.permissions) ? body.permissions : [];
  const validLabels = labels.filter((l): l is (typeof PERMISSIONS)[number] =>
    typeof l === "string" && (PERMISSIONS as readonly string[]).includes(l),
  );
  const types = validLabels.map((label) => PERMISSION_TYPE_BY_LABEL[label]);

  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId: role.id } }),
    ...types.map((type) => prisma.rolePermission.create({ data: { roleId: role.id, type } })),
  ]);

  return NextResponse.json({ ok: true });
}
