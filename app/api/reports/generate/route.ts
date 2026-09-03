import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { buildReportSections } from "@/lib/report-data";
import { zoneReportLabel } from "@/lib/reports";
import { pruneToSubsection, reportSubsectionForLeaf } from "@/lib/report-section-map";

/**
 * Real report data for the "Download Report" PDF - the exact section tree
 * from the client's own "ATARI AMS REPORT" export. KVK Admin/User are always
 * scoped to their own KVK; Super Admin gets every KVK in the zone by
 * default, or one specific KVK via ?kvk=<name> (matches the Reports filter's
 * existing KVK dropdown).
 *
 * `?subsection=<form-management leaf path>` prunes the tree to just that
 * leaf's report subsection (see lib/report-section-map.ts) - the download a
 * Form Management list page offers is that same slice of the big report, not
 * a flat one-table export. `matched: false` on the response means the leaf
 * has no report subsection and the caller should fall back to its own flat
 * export.
 */
export async function GET(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const kvkNameFilter = url.searchParams.get("kvk");
  const subsectionLeaf = url.searchParams.get("subsection");
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

  let sections = await buildReportSections({ kvkId, zoneId: auth.session.zoneId });

  let matched: boolean | undefined;
  if (subsectionLeaf) {
    const ref = reportSubsectionForLeaf(subsectionLeaf);
    if (ref) {
      const pruned = pruneToSubsection(sections, ref);
      matched = pruned.length > 0;
      if (matched) sections = pruned;
    } else {
      matched = false;
    }
  }

  return NextResponse.json({
    zoneLabel: zone?.name ? zoneReportLabel(zone.name) : "ATARI",
    kvkNames: kvks.map((k) => k.name),
    sections,
    ...(matched === undefined ? {} : { matched }),
  });
}
