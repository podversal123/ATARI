import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

// Co-locate with the Neon database (ap-southeast-1 / Singapore) - without this Vercel runs functions in its default us-east region, adding a cross-Pacific round trip to every query.
export const preferredRegion = "sin1";

/**
 * Real counts for the Dashboard's stat cards and progress-chart summaries.
 * Training/Extension Activity have no status column anywhere in the schema
 * (confirmed against schema.prisma), so their progress cards only ever get
 * a total + "KVKs with entries" breakdown, not an ongoing/completed split -
 * OFT and FLD do carry a real TrialStatus, so those get the full split.
 */
export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const kvkId = auth.session.role === "KVK_ADMIN" ? auth.session.kvkId ?? undefined : undefined;
  const scope = kvkId ? { kvkId } : { zoneId: auth.session.zoneId };

  const [
    kvks,
    totalKvks,
    oftCount,
    oftOngoing,
    oftCompleted,
    oftKvks,
    oftByKvkStatus,
    fldCount,
    fldOngoing,
    fldCompleted,
    fldKvks,
    fldByKvkStatus,
    trainingCount,
    trainingKvks,
    trainingByKvk,
    extensionCount,
    extensionKvks,
    extensionByKvk,
    otherExtensionCount,
    otherExtensionKvks,
    otherExtensionByKvk,
    staffCount,
    staffByRoleGroups,
  ] = await Promise.all([
    prisma.kvk.findMany({
      where: kvkId ? { id: kvkId } : { zoneId: auth.session.zoneId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.kvk.count({ where: { zoneId: auth.session.zoneId } }),
    prisma.oft.count({ where: scope }),
    prisma.oft.count({ where: { ...scope, status: "ONGOING" } }),
    prisma.oft.count({ where: { ...scope, status: "COMPLETED" } }),
    prisma.oft.findMany({ where: scope, select: { kvkId: true }, distinct: ["kvkId"] }),
    prisma.oft.groupBy({ by: ["kvkId", "status"], where: scope, _count: { _all: true } }),
    prisma.fld.count({ where: scope }),
    prisma.fld.count({ where: { ...scope, status: "ONGOING" } }),
    prisma.fld.count({ where: { ...scope, status: "COMPLETED" } }),
    prisma.fld.findMany({ where: scope, select: { kvkId: true }, distinct: ["kvkId"] }),
    prisma.fld.groupBy({ by: ["kvkId", "status"], where: scope, _count: { _all: true } }),
    prisma.training.count({ where: scope }),
    prisma.training.findMany({ where: scope, select: { kvkId: true }, distinct: ["kvkId"] }),
    prisma.training.groupBy({ by: ["kvkId"], where: scope, _count: { _all: true } }),
    prisma.extensionActivity.count({ where: scope }),
    prisma.extensionActivity.findMany({ where: scope, select: { kvkId: true }, distinct: ["kvkId"] }),
    prisma.extensionActivity.groupBy({ by: ["kvkId"], where: scope, _count: { _all: true } }),
    prisma.otherExtensionActivity.count({ where: scope }),
    prisma.otherExtensionActivity.findMany({ where: scope, select: { kvkId: true }, distinct: ["kvkId"] }),
    prisma.otherExtensionActivity.groupBy({ by: ["kvkId"], where: scope, _count: { _all: true } }),
    prisma.staff.count({ where: scope }),
    prisma.staff.groupBy({ by: ["sanctionedPost"], where: scope, _count: { _all: true } }),
  ]);

  const staffByRole = Object.fromEntries(
    staffByRoleGroups.map((g) => [g.sanctionedPost, g._count._all]),
  );

  const extensionKvkSet = new Set([
    ...extensionKvks.map((r) => r.kvkId),
    ...otherExtensionKvks.map((r) => r.kvkId),
  ]);

  /** One row per KVK in scope (even KVKs with zero entries), sorted busiest-first for the Bar/List/Area chart views. */
  function buildStatusRows(groups: { kvkId: string; status: string; _count: { _all: number } }[]) {
    const byKvk = new Map<string, { ongoing: number; completed: number }>();
    for (const g of groups) {
      const row = byKvk.get(g.kvkId) ?? { ongoing: 0, completed: 0 };
      if (g.status === "ONGOING") row.ongoing = g._count._all;
      else row.completed = g._count._all;
      byKvk.set(g.kvkId, row);
    }
    return kvks
      .map((k) => ({ id: k.id, label: k.name, ...(byKvk.get(k.id) ?? { ongoing: 0, completed: 0 }) }))
      .sort((a, b) => b.ongoing + b.completed - (a.ongoing + a.completed));
  }

  function toCountMap(groups: { kvkId: string; _count: { _all: number } }[]) {
    return new Map(groups.map((g) => [g.kvkId, g._count._all]));
  }

  function buildTotalRows(...maps: Map<string, number>[]) {
    const combined = new Map<string, number>();
    for (const m of maps) for (const [id, count] of m) combined.set(id, (combined.get(id) ?? 0) + count);
    return kvks
      .map((k) => ({ id: k.id, label: k.name, total: combined.get(k.id) ?? 0 }))
      .sort((a, b) => b.total - a.total);
  }

  return NextResponse.json({
    totalKvks,
    oft: { total: oftCount, ongoing: oftOngoing, completed: oftCompleted, kvksWithEntries: oftKvks.length },
    fld: { total: fldCount, ongoing: fldOngoing, completed: fldCompleted, kvksWithEntries: fldKvks.length },
    training: { total: trainingCount, kvksWithEntries: trainingKvks.length },
    extension: {
      total: extensionCount + otherExtensionCount,
      kvksWithEntries: extensionKvkSet.size,
    },
    staff: { total: staffCount },
    staffByRole,
    charts: {
      oft: buildStatusRows(oftByKvkStatus),
      fld: buildStatusRows(fldByKvkStatus),
      training: buildTotalRows(toCountMap(trainingByKvk)),
      extension: buildTotalRows(toCountMap(extensionByKvk), toCountMap(otherExtensionByKvk)),
    },
  });
}
