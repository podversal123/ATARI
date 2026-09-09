import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

/**
 * The KVK's own equipment master rows, for the "Equipment" dropdown on the
 * yearly Equipment Details (EquipmentStatus) form - the reference's own
 * /create-equipment-details form pulls the same per-KVK list. KVK-scoped
 * like /api/staff-options; a Super Admin session (no kvkId) gets the whole
 * zone's equipment.
 */
export async function GET() {
  const auth = await requireSession(["SUPER_ADMIN", "KVK_ADMIN"]);
  if (!auth.ok) return auth.response;

  const rows = await prisma.equipment.findMany({
    where: auth.session.kvkId ? { kvkId: auth.session.kvkId } : { zoneId: auth.session.zoneId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return NextResponse.json({ rows });
}
