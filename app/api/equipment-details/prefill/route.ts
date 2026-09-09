import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

/**
 * Carry-forward for the yearly Equipment Details (EquipmentStatus) Add
 * form: given an equipment name, return the fields to pre-fill from that
 * equipment's MOST RECENT year's status, falling back to the Equipment
 * master's own current values on a first-ever entry. Source of Funding is a
 * read-only column derived from the master, so it is not carried here.
 */
export async function GET(request: Request) {
  const auth = await requireSession(["SUPER_ADMIN", "KVK_ADMIN"]);
  if (!auth.ok) return auth.response;

  const value = new URL(request.url).searchParams.get("value")?.trim() ?? "";
  if (!value) return NextResponse.json({ fields: {} });

  const scope = auth.session.kvkId
    ? { kvkId: auth.session.kvkId }
    : { zoneId: auth.session.zoneId };

  const equipment = await prisma.equipment.findFirst({
    where: { ...scope, name: value },
    select: { id: true, presentStatus: true, repairingCost: true },
  });
  if (!equipment) return NextResponse.json({ fields: {} });

  const last = await prisma.equipmentStatus.findFirst({
    where: { equipmentId: equipment.id },
    orderBy: { reportingYear: "desc" },
  });

  const num = (v: unknown) => (v == null ? "" : String(v));

  const fields = last
    ? {
        presentStatus: last.presentStatus ?? "",
        repairingCost: num(last.repairingCost),
      }
    : {
        presentStatus: equipment.presentStatus ?? "",
        repairingCost: num(equipment.repairingCost),
      };

  return NextResponse.json({ fields });
}
