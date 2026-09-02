import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { parseResultTables, type OftResultTable } from "@/lib/oft-result-tables";

const str = (v: string | undefined) => (v?.trim() ? v.trim() : null);

/**
 * Real "Edit OFT Result" page (atari-client.vercel.app, confirmed
 * 2026-09-02) - Final Recommendation/Constraints Identified/Process of
 * Farmers Participation/Result/Remark, Photographs + Supplementary
 * Datasheets uploads, and the Dynamic Result Tables (lib/oft-result-tables.ts).
 * Replaces the earlier single-textarea placeholder dialog entirely.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSession(["KVK_ADMIN", "SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const kvkScope = auth.session.kvkId ? { kvkId: auth.session.kvkId } : { zoneId: auth.session.zoneId };

  const record = await prisma.oft.findFirst({
    where: { id, ...kvkScope },
    include: { technologyOptions: { orderBy: { id: "asc" } } },
  });
  if (!record) return NextResponse.json({ error: "Record not found." }, { status: 404 });

  return NextResponse.json({
    finalRecommendation: record.finalRecommendation ?? "",
    constraintsIdentified: record.constraintsIdentified ?? "",
    farmersParticipationProcess: record.farmersParticipationProcess ?? "",
    resultSummary: record.resultSummary ?? "",
    remark: record.remark ?? "",
    photographUrls: record.photographUrls,
    supplementaryDatasheetUrls: record.supplementaryDatasheetUrls,
    resultTables: parseResultTables(
      record.resultTablesJson,
      record.technologyOptions.map((t) => t.label),
    ),
    status: record.status,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSession(["KVK_ADMIN", "SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const kvkScope = auth.session.kvkId ? { kvkId: auth.session.kvkId } : { zoneId: auth.session.zoneId };

  const body = await request.json().catch(() => null);
  const markCompleted = body?.markCompleted === true;
  const resultTables: OftResultTable[] = Array.isArray(body?.resultTables) ? body.resultTables : [];
  const photographUrls: string[] = Array.isArray(body?.photographUrls) ? body.photographUrls : [];
  const supplementaryDatasheetUrls: string[] = Array.isArray(body?.supplementaryDatasheetUrls)
    ? body.supplementaryDatasheetUrls
    : [];

  const result = await prisma.oft.updateMany({
    where: { id, ...kvkScope },
    data: {
      finalRecommendation: str(body?.finalRecommendation),
      constraintsIdentified: str(body?.constraintsIdentified),
      farmersParticipationProcess: str(body?.farmersParticipationProcess),
      resultSummary: str(body?.resultSummary),
      remark: str(body?.remark),
      photographUrls,
      supplementaryDatasheetUrls,
      resultTablesJson: resultTables.length > 0 ? JSON.stringify(resultTables) : null,
      ...(markCompleted ? { status: "COMPLETED" } : {}),
    },
  });
  if (result.count === 0) return NextResponse.json({ error: "Record not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
