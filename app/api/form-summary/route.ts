import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { getTrackedLeaves, yearWhereFor } from "@/lib/form-summary-data";

/**
 * Real per-KVK, per-form entry counts across every one of the app's 109
 * real trackable Form Management leaves (see lib/form-summary-data.ts) -
 * was a 100% static placeholder page before this (every stat hardcoded to
 * 0, every row "Not filled"/"-"). One groupBy per tracked leaf's model,
 * fired together via Promise.all (same discipline as /api/dashboard-stats
 * and the report engine's buildReportSections) - ~109 queries, the same
 * order of magnitude as the already-proven report engine.
 *
 * `?year=` scopes every count to that reporting year (client report,
 * 2026-09-04: the year dropdown showed only the current year and did
 * nothing). Models with a real year/date field are filtered; the ~38 with
 * neither (roster tables etc.) count all-time in every year's view, which
 * is correct - there is no year to scope them by.
 */
export async function GET(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const kvkId = auth.session.role === "SUPER_ADMIN" ? undefined : auth.session.kvkId ?? undefined;

  const yearParam = new URL(request.url).searchParams.get("year");
  const year = yearParam && /^\d{4}$/.test(yearParam) ? Number(yearParam) : undefined;

  const kvks = await prisma.kvk.findMany({
    where: kvkId ? { id: kvkId } : { zoneId: auth.session.zoneId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const leaves = getTrackedLeaves();

  const countsPerLeaf = await Promise.all(
    leaves.map(async (leaf) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const delegate = (prisma as any)[leaf.model];
      const field = leaf.kvkField ?? "kvkId";
      const where: Record<string, unknown> = kvkId
        ? { [field]: kvkId }
        : { zoneId: auth.session.zoneId };
      if (leaf.extraWhere) Object.assign(where, leaf.extraWhere);
      if (year !== undefined) Object.assign(where, yearWhereFor(leaf.model, year));
      try {
        const groups: { [key: string]: unknown; _count: { _all: number } }[] = await delegate.groupBy({
          by: [field],
          where,
          _count: { _all: true },
        });
        const byKvk = new Map<string, number>();
        for (const g of groups) byKvk.set(String(g[field]), g._count._all);
        return { leaf, byKvk };
      } catch {
        return { leaf, byKvk: new Map<string, number>() };
      }
    }),
  );

  const formsTracked = leaves.length;

  const byKvk = kvks.map((kvk) => {
    const sectionsMap = new Map<string, { path: string; label: string; count: number }[]>();
    let filled = 0;
    for (const { leaf, byKvk: counts } of countsPerLeaf) {
      const count = counts.get(kvk.id) ?? 0;
      if (count > 0) filled += 1;
      const list = sectionsMap.get(leaf.topSection) ?? [];
      list.push({ path: leaf.path, label: leaf.label, count });
      sectionsMap.set(leaf.topSection, list);
    }
    const sections = Array.from(sectionsMap.entries()).map(([sectionLabel, leavesInSection]) => ({
      sectionLabel,
      leaves: leavesInSection,
    }));
    return {
      id: kvk.id,
      name: kvk.name,
      filled,
      total: formsTracked,
      percent: formsTracked === 0 ? 0 : Math.round((filled / formsTracked) * 100),
      sections,
    };
  });

  const totalPossible = kvks.length * formsTracked;
  const totalFilled = byKvk.reduce((sum, k) => sum + k.filled, 0);

  /**
   * Real year list for the dropdown - distinct `reportingYear`s actually
   * present across the busiest year-scoped models (OFT/FLD/Training/
   * Extension), plus the current year so a fresh year is always pickable.
   */
  const currentYear = new Date().getFullYear();
  const yearRows = await Promise.all(
    (["oft", "fld", "training", "extensionActivity"] as const).map((model) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prisma as any)[model]
        .findMany({
          where: kvkId ? { kvkId } : { zoneId: auth.session.zoneId },
          select: { reportingYear: true },
          distinct: ["reportingYear"],
        })
        .catch(() => [] as { reportingYear: number }[]),
    ),
  );
  const years = Array.from(
    new Set<number>([
      currentYear,
      ...yearRows.flat().map((r: { reportingYear: number }) => r.reportingYear),
    ]),
  )
    .filter((y) => y >= 2000 && y <= currentYear + 1)
    .sort((a, b) => b - a);

  return NextResponse.json({
    kvks: kvks.map((k) => ({ id: k.id, name: k.name })),
    totalKvks: kvks.length,
    formsTracked,
    totalFilled,
    totalPossible,
    overallProgressPercent: totalPossible === 0 ? 0 : Math.round((totalFilled / totalPossible) * 100),
    byKvk,
    years,
    year: year ?? null,
  });
}
