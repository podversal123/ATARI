import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

/**
 * The live reference keeps "Total Land with KVK" as a repeatable Item + In
 * Ha section at the bottom of the Edit KVK form (atariams.org /edit-kvks),
 * with "Add More Item" / "Remove Item" and one save for the whole set. Our
 * About KVK > Land Details leaf mirrors that shape through this endpoint:
 * GET returns the KVK's current land rows, PUT replaces the whole set
 * (create new rows, update changed ones, drop removed ones). The rows still
 * live in the same Land table that report section 1.3.B reads.
 */
export async function GET() {
  const auth = await requireSession(["SUPER_ADMIN", "KVK_ADMIN"]);
  if (!auth.ok) return auth.response;

  const rows = await prisma.land.findMany({
    where: auth.session.kvkId
      ? { kvkId: auth.session.kvkId }
      : { zoneId: auth.session.zoneId },
    orderBy: { createdAt: "asc" },
    select: { id: true, item: true, areaHa: true },
  });

  return NextResponse.json({
    // The reference prints every land area to two decimals ("1.70", "5.00").
    rows: rows.map((r) => ({ id: r.id, item: r.item, areaHa: Number(r.areaHa).toFixed(2) })),
  });
}

type IncomingRow = { id?: string; item?: string; areaHa?: string };

export async function PUT(request: Request) {
  const auth = await requireSession(["SUPER_ADMIN", "KVK_ADMIN"]);
  if (!auth.ok) return auth.response;

  const { kvkId, zoneId } = auth.session;
  if (!kvkId) {
    return NextResponse.json(
      { error: "Land Details is edited from a KVK login." },
      { status: 400 },
    );
  }

  let body: { rows?: IncomingRow[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const clean = (body.rows ?? [])
    .map((r) => ({
      id: typeof r.id === "string" ? r.id : undefined,
      item: (r.item ?? "").trim(),
      areaHa: (r.areaHa ?? "").trim(),
    }))
    .filter((r) => r.item || r.areaHa);

  for (const r of clean) {
    if (!r.item) {
      return NextResponse.json({ error: "Every land row needs an item." }, { status: 400 });
    }
    if (r.areaHa && Number.isNaN(Number(r.areaHa))) {
      return NextResponse.json({ error: `"${r.areaHa}" is not a valid area.` }, { status: 400 });
    }
  }

  const existing = await prisma.land.findMany({ where: { kvkId }, select: { id: true } });
  const keepIds = new Set(clean.filter((r) => r.id).map((r) => r.id as string));
  const toDelete = existing.filter((r) => !keepIds.has(r.id)).map((r) => r.id);

  await prisma.$transaction([
    ...(toDelete.length
      ? [prisma.land.deleteMany({ where: { id: { in: toDelete }, kvkId } })]
      : []),
    ...clean
      .filter((r) => r.id)
      .map((r) =>
        prisma.land.updateMany({
          where: { id: r.id as string, kvkId },
          data: { item: r.item, areaHa: r.areaHa ? Number(r.areaHa) : 0 },
        }),
      ),
    ...clean
      .filter((r) => !r.id)
      .map((r) =>
        prisma.land.create({
          data: { kvkId, zoneId, item: r.item, areaHa: r.areaHa ? Number(r.areaHa) : 0 },
        }),
      ),
  ]);

  return NextResponse.json({ ok: true });
}
