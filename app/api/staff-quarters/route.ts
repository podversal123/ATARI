import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { parseStaffQuartersBody, writeOccupancy } from "./shared";

/**
 * Create a Staff Quarters record, transcribed from the live reference
 * (atariams.org /infra-performance/staff-quaters/create, KVK admin): the
 * five summary fields plus a 12-month x 6-quarter Yes/No occupancy grid.
 * The rows feed report section 1.3.C. KVK creation was never wired through
 * the generic leaf-record registry for this shape, so the bespoke form
 * (staff-quarters-form.tsx) posts here directly.
 */
export async function POST(request: Request) {
  const auth = await requireSession(["SUPER_ADMIN", "KVK_ADMIN"]);
  if (!auth.ok) return auth.response;

  const { kvkId, zoneId } = auth.session;
  if (!kvkId) {
    return NextResponse.json(
      { error: "Staff Quarters is added from a KVK login." },
      { status: 400 },
    );
  }

  const parsed = parseStaffQuartersBody(await request.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const record = await prisma.staffQuarters.create({
      data: {
        kvkId,
        zoneId,
        dateOfCompletion: parsed.dateOfCompletion,
        whetherCompleted: parsed.whetherCompleted,
        numberOfQuarters: parsed.numberOfQuarters,
        occupancyDetails: parsed.occupancyDetails,
        remark: parsed.remark,
      },
    });
    await writeOccupancy(record.id, parsed.occupancy);
    return NextResponse.json({ ok: true, id: record.id });
  } catch (err) {
    console.error("staff-quarters create failed", err);
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
  }
}
