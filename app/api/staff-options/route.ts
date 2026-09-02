import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

/**
 * Real staff names for the "Name of SMS/KVK Head" dropdown that recurs
 * across several Achievements forms (OFT, FLD, Extension Activities,
 * Trainings, ...) in the real reference (atari-client.vercel.app, confirmed
 * 2026-08-15 screenshots) - was a plain free-text field before, letting a
 * KVK Admin type any name instead of picking a real employee. KVK-scoped
 * (a KVK Admin only ever sees their own KVK's staff) rather than zone-wide
 * like the All Masters options endpoint, since staff genuinely belong to
 * one KVK, not the whole zone - a Super Admin session (no kvkId) gets every
 * staff member in the zone instead, same "aggregate view" convention used
 * elsewhere in this app for Super Admin.
 */
export async function GET() {
  const auth = await requireSession(["SUPER_ADMIN", "KVK_ADMIN"]);
  if (!auth.ok) return auth.response;

  const rows = await prisma.staff.findMany({
    where: auth.session.kvkId ? { kvkId: auth.session.kvkId } : { zoneId: auth.session.zoneId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return NextResponse.json({ rows });
}
