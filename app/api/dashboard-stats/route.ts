import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

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
    totalKvks,
    oftCount,
    oftOngoing,
    oftCompleted,
    oftKvks,
    fldCount,
    fldOngoing,
    fldCompleted,
    fldKvks,
    trainingCount,
    trainingKvks,
    extensionCount,
    extensionKvks,
    otherExtensionCount,
    otherExtensionKvks,
    staffCount,
    staffByRoleGroups,
  ] = await Promise.all([
    prisma.kvk.count({ where: { zoneId: auth.session.zoneId } }),
    prisma.oft.count({ where: scope }),
    prisma.oft.count({ where: { ...scope, status: "ONGOING" } }),
    prisma.oft.count({ where: { ...scope, status: "COMPLETED" } }),
    prisma.oft.findMany({ where: scope, select: { kvkId: true }, distinct: ["kvkId"] }),
    prisma.fld.count({ where: scope }),
    prisma.fld.count({ where: { ...scope, status: "ONGOING" } }),
    prisma.fld.count({ where: { ...scope, status: "COMPLETED" } }),
    prisma.fld.findMany({ where: scope, select: { kvkId: true }, distinct: ["kvkId"] }),
    prisma.training.count({ where: scope }),
    prisma.training.findMany({ where: scope, select: { kvkId: true }, distinct: ["kvkId"] }),
    prisma.extensionActivity.count({ where: scope }),
    prisma.extensionActivity.findMany({ where: scope, select: { kvkId: true }, distinct: ["kvkId"] }),
    prisma.otherExtensionActivity.count({ where: scope }),
    prisma.otherExtensionActivity.findMany({ where: scope, select: { kvkId: true }, distinct: ["kvkId"] }),
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
  });
}
