import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

/**
 * The KVK's own vehicle master rows, for the "Vehicle" dropdown on the
 * yearly Vehicle Details (VehicleStatus) form - the reference's own
 * /create-vehicle-details form pulls the same per-KVK list rather than
 * letting the user re-type a vehicle name. KVK-scoped like /api/staff-options;
 * a Super Admin session (no kvkId) gets the whole zone's vehicles.
 */
export async function GET() {
  const auth = await requireSession(["SUPER_ADMIN", "KVK_ADMIN"]);
  if (!auth.ok) return auth.response;

  const rows = await prisma.vehicle.findMany({
    where: auth.session.kvkId ? { kvkId: auth.session.kvkId } : { zoneId: auth.session.zoneId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, registrationNo: true },
  });

  return NextResponse.json({ rows });
}
