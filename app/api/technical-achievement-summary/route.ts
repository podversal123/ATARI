import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

/**
 * Real counts for the sections of the Technical Achievement Summary matrix
 * report that map unambiguously to an operational table (OFT/FLD counts,
 * trial/area totals, Training/Extension Activity/Soil-Water-Analysis
 * counts). "Target" and the General/OBC/SC/ST x M/F demographic breakdown
 * have no real data source anywhere in this schema (no target-setting
 * feature, no per-record caste/gender capture on these models) - those stay
 * 0 rather than fabricated, same honest-empty-state principle the UI
 * already documented before this route existed.
 */
export async function GET(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const reportingYear = Number(url.searchParams.get("year")) || new Date().getFullYear();
  const kvkNameFilter = url.searchParams.get("kvk") || undefined;

  let kvkId: string | undefined;
  if (auth.session.role === "KVK_ADMIN" && auth.session.kvkId) {
    kvkId = auth.session.kvkId;
  } else if (kvkNameFilter) {
    const kvk = await prisma.kvk.findFirst({
      where: { zoneId: auth.session.zoneId, name: kvkNameFilter },
    });
    kvkId = kvk?.id;
  }

  const scope = kvkId ? { kvkId } : { zoneId: auth.session.zoneId };

  const [
    oftCount,
    oftKvkCount,
    oftTrialSum,
    fldCount,
    fldAreaSum,
    trainingCount,
    extensionCount,
    soilWaterCount,
  ] = await Promise.all([
    prisma.oft.count({ where: { ...scope, reportingYear } }),
    prisma.oft
      .findMany({ where: { ...scope, reportingYear }, select: { kvkId: true }, distinct: ["kvkId"] })
      .then((rows) => rows.length),
    prisma.oft.aggregate({
      where: { ...scope, reportingYear },
      _sum: { noOfTrialReplicationFarmer: true },
    }),
    prisma.fld.count({ where: { ...scope, reportingYear } }),
    prisma.fldDemonstrationDetail.aggregate({
      where: kvkId ? { fld: { kvkId, reportingYear } } : { zoneId: auth.session.zoneId, fld: { reportingYear } },
      _sum: { areaHa: true },
    }),
    prisma.training.count({ where: { ...scope, reportingYear } }),
    prisma.extensionActivity.count({ where: { ...scope, reportingYear } }),
    prisma.soilWaterPlantAnalysis.count({ where: scope }),
  ]);

  const zeroMatrix = Array(11).fill(0);

  return NextResponse.json({
    reportingYear,
    sections: {
      "oft-fld-0": {
        metrics: [0, oftCount, oftKvkCount, oftTrialSum._sum.noOfTrialReplicationFarmer ?? 0],
        leadColumn: 0,
        matrix: zeroMatrix,
      },
      "oft-fld-1": {
        metrics: [0, fldCount, Number(fldAreaSum._sum.areaHa ?? 0)],
        leadColumn: 0,
        matrix: zeroMatrix,
      },
      "training-extension-0": {
        metrics: [0, trainingCount],
        leadColumn: 0,
        matrix: zeroMatrix,
      },
      "training-extension-1": {
        metrics: [0, extensionCount],
        leadColumn: 0,
        matrix: zeroMatrix,
      },
      "seed-planting-0": { metrics: [0, 0, 0], leadColumn: 0, matrix: zeroMatrix },
      "seed-planting-1": { metrics: [0, 0, 0], leadColumn: 0, matrix: zeroMatrix },
      "livestock-soil-0": { metrics: [0, 0, 0], leadColumn: 0, matrix: zeroMatrix },
      "livestock-soil-1": {
        metrics: [0, soilWaterCount],
        leadColumn: 0,
        matrix: zeroMatrix,
      },
    },
  });
}
