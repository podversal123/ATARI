import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { buildReportSections } from "@/lib/report-data";
import { zoneReportLabel } from "@/lib/reports";

/**
 * Real report data for the "Download Report" PDF - the exact section tree
 * from the client's own "ATARI AMS REPORT" export. KVK Admin/User are always
 * scoped to their own KVK; Super Admin gets every KVK in the zone by
 * default, or one specific KVK via ?kvk=<name> (matches the Reports filter's
 * existing KVK dropdown).
 */
export async function GET(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const kvkNameFilter = new URL(request.url).searchParams.get("kvk");
  const isKvkScoped = auth.session.role !== "SUPER_ADMIN";

  let kvkId: string | undefined = isKvkScoped ? auth.session.kvkId ?? undefined : undefined;
  if (!isKvkScoped && kvkNameFilter && kvkNameFilter !== "All") {
    const match = await prisma.kvk.findFirst({
      where: { zoneId: auth.session.zoneId, name: kvkNameFilter },
      select: { id: true },
    });
    kvkId = match?.id;
  }

  const [zone, kvks] = await Promise.all([
    prisma.zone.findUnique({ where: { id: auth.session.zoneId }, select: { name: true } }),
    prisma.kvk.findMany({
      where: kvkId ? { id: kvkId } : { zoneId: auth.session.zoneId },
      select: { name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const sections = await buildReportSections({ kvkId, zoneId: auth.session.zoneId });

  return NextResponse.json({
    zoneLabel: zone?.name ? zoneReportLabel(zone.name) : "ATARI",
    kvkNames: kvks.map((k) => k.name),
    sections,
  });
}
