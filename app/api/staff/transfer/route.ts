import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { safeErrorMessage } from "@/lib/safe-error-message";

/**
 * Transfer a staff member to another KVK. Records the hop in StaffTransfer
 * (from = the staff's current KVK, to = the chosen KVK) and moves the staff
 * row to the destination, so the transfer then shows only under the
 * destination KVK's "Details of Staff Transferred" list - never the source.
 */
export async function POST(request: Request) {
  const auth = await requireSession(["KVK_ADMIN", "SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const staffId = typeof body?.staffId === "string" ? body.staffId : "";
  const toKvkName = typeof body?.toKvkName === "string" ? body.toKvkName.trim() : "";
  const transferDate = typeof body?.transferDate === "string" ? body.transferDate : "";

  if (!staffId || !toKvkName || !transferDate) {
    return NextResponse.json({ error: "Staff, destination KVK and date of relieving are all required." }, { status: 400 });
  }

  try {
    const staff = await prisma.staff.findFirst({
      where: { id: staffId, ...(auth.session.kvkId ? { kvkId: auth.session.kvkId } : { zoneId: auth.session.zoneId }) },
      select: { id: true, kvkId: true, name: true },
    });
    if (!staff) {
      return NextResponse.json({ error: "Staff not found, or not in your scope." }, { status: 404 });
    }

    const toKvk = await prisma.kvk.findFirst({
      where: { name: toKvkName, zoneId: auth.session.zoneId },
      select: { id: true, zoneId: true },
    });
    if (!toKvk) {
      return NextResponse.json({ error: "Destination KVK not found in your zone." }, { status: 400 });
    }
    if (toKvk.id === staff.kvkId) {
      return NextResponse.json({ error: "The staff member is already at that KVK." }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.staffTransfer.create({
        data: {
          staffId: staff.id,
          fromKvkId: staff.kvkId,
          toKvkId: toKvk.id,
          zoneId: toKvk.zoneId,
          transferDate: new Date(transferDate),
        },
      }),
      prisma.staff.update({
        where: { id: staff.id },
        data: { kvkId: toKvk.id, transferStatus: "Transferred" },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: safeErrorMessage(error, "Could not complete the transfer.") }, { status: 400 });
  }
}
