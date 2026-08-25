import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

/**
 * Real counts for the Dashboard's stat cards and progress-chart summaries.
 * Training/Extension Activity have no status column anywhere in the schema
 * (confirmed against schema.prisma), so their progress cards only ever get
 * a total + "KVKs with entries" breakdown, not an ongoing/completed split -
 * OFT and FLD do carry a real TrialStatus, so those get the full split.
 *
 * Every scalar total/count/kvksWithEntries below is DERIVED from the same
 * five groupBy queries the chart rows already need - it used to also run a
 * separate count()/count(status)/findMany(distinct) per metric (23 queries
 * total). Each Prisma call here is a real network round trip to Neon, so
 * cutting 23 down to 8 is a real latency win independent of anything about
 * function region - don't reintroduce the separate count queries.
 */
export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const kvkId = auth.session.role === "KVK_ADMIN" ? auth.session.kvkId ?? undefined : undefined;
  const scope = kvkId ? { kvkId } : { zoneId: auth.session.zoneId };

  const [
    kvks,
    totalKvks,
    oftByKvkStatus,
    fldByKvkStatus,
    trainingByKvk,
    extensionByKvk,
    otherExtensionByKvk,
    staffByRoleGroups,
    oftAgg,
    fldDemoAgg,
  ] = await Promise.all([
      prisma.kvk.findMany({
        where: kvkId ? { id: kvkId } : { zoneId: auth.session.zoneId },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.kvk.count({ where: { zoneId: auth.session.zoneId } }),
      prisma.oft.groupBy({ by: ["kvkId", "status"], where: scope, _count: { _all: true } }),
      prisma.fld.groupBy({ by: ["kvkId", "status"], where: scope, _count: { _all: true } }),
      prisma.training.groupBy({ by: ["kvkId"], where: scope, _count: { _all: true } }),
      prisma.extensionActivity.groupBy({ by: ["kvkId"], where: scope, _count: { _all: true } }),
      prisma.otherExtensionActivity.groupBy({ by: ["kvkId"], where: scope, _count: { _all: true } }),
      prisma.staff.groupBy({ by: ["sanctionedPost"], where: scope, _count: { _all: true } }),
      /** Real per-OFT fields (not just the ongoing/completed status split) for the "OFT - detailed analytics" page's Cost/Quantity/Replications stat cards. */
      prisma.oft.aggregate({
        where: scope,
        _sum: { quantity: true, costOfOft: true, noOfTrialReplicationFarmer: true },
      }),
      /** FLD's own model has no quantity/farmer/demonstration fields - those live on the child FldDemonstrationDetail rows, scoped via the parent FLD's kvkId since the child itself only carries zoneId. */
      prisma.fldDemonstrationDetail.aggregate({
        where: kvkId ? { fld: { kvkId } } : { zoneId: auth.session.zoneId },
        _sum: { noOfDemonstrations: true, noOfFarmers: true },
      }),
    ]);

  const staffByRole = Object.fromEntries(
    staffByRoleGroups.map((g) => [g.sanctionedPost, g._count._all]),
  );
  const staffTotal = staffByRoleGroups.reduce((sum, g) => sum + g._count._all, 0);

  /** Ongoing/completed/total/kvksWithEntries, all read off one status-split groupBy result. */
  function statusSummary(groups: { kvkId: string; status: string; _count: { _all: number } }[]) {
    let ongoing = 0;
    let completed = 0;
    const kvkSet = new Set<string>();
    for (const g of groups) {
      if (g.status === "ONGOING") ongoing += g._count._all;
      else completed += g._count._all;
      kvkSet.add(g.kvkId);
    }
    return { total: ongoing + completed, ongoing, completed, kvksWithEntries: kvkSet.size };
  }

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

  /** Total entries + distinct-KVK count read off a plain groupBy(["kvkId"]) result, optionally merged with a second one (Extension = extensionActivity + otherExtensionActivity combined). */
  function countSummary(...groupsList: { kvkId: string; _count: { _all: number } }[][]) {
    let total = 0;
    const kvkSet = new Set<string>();
    for (const groups of groupsList) {
      for (const g of groups) {
        total += g._count._all;
        kvkSet.add(g.kvkId);
      }
    }
    return { total, kvksWithEntries: kvkSet.size };
  }

  const oft = statusSummary(oftByKvkStatus);
  const fld = statusSummary(fldByKvkStatus);
  const training = countSummary(trainingByKvk);
  const extension = countSummary(extensionByKvk, otherExtensionByKvk);

  return NextResponse.json({
    totalKvks,
    oft: {
      ...oft,
      quantity: Number(oftAgg._sum.quantity ?? 0),
      cost: Number(oftAgg._sum.costOfOft ?? 0),
      replications: oftAgg._sum.noOfTrialReplicationFarmer ?? 0,
    },
    fld: {
      ...fld,
      demonstrations: fldDemoAgg._sum.noOfDemonstrations ?? 0,
      farmersCovered: fldDemoAgg._sum.noOfFarmers ?? 0,
    },
    training,
    extension,
    staff: { total: staffTotal },
    staffByRole,
    charts: {
      oft: buildStatusRows(oftByKvkStatus),
      fld: buildStatusRows(fldByKvkStatus),
      training: buildTotalRows(toCountMap(trainingByKvk)),
      extension: buildTotalRows(toCountMap(extensionByKvk), toCountMap(otherExtensionByKvk)),
    },
  });
}
