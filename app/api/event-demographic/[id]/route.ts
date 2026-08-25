import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

// Co-locate with the Neon database (ap-southeast-1 / Singapore) - without this Vercel runs functions in its default us-east region, adding a cross-Pacific round trip to every query.
export const preferredRegion = "sin1";

const reqStr = (v: string | undefined) => v?.trim() ?? "";
const reqInt = (v: string | undefined) => parseInt(v ?? "0", 10) || 0;
const str = (v: string | undefined) => (v?.trim() ? v.trim() : undefined);
const reqDate = (v: string | undefined) => new Date(v ?? Date.now());
const numStr = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const dateStr = (v: Date | null | undefined) => (v ? v.toISOString().slice(0, 10) : "");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSession(["KVK_ADMIN"]);
  if (!auth.ok) return auth.response;
  if (!auth.session.kvkId) {
    return NextResponse.json({ error: "No KVK on this account." }, { status: 400 });
  }
  const { id } = await params;
  const slug = new URL(request.url).searchParams.get("slug");

  if (slug === "technology-week-celebration") {
    const record = await prisma.technologyWeekCelebration.findFirst({
      where: { id, kvkId: auth.session.kvkId },
    });
    if (!record) return NextResponse.json({ error: "Record not found." }, { status: 404 });
    return NextResponse.json({
      values: {
        startDate: dateStr(record.startDate),
        endDate: dateStr(record.endDate),
        typeOfActivities: record.typeOfActivities,
        noOfActivities: numStr(record.noOfActivities),
        relatedCropTechnology: record.relatedCropTechnology ?? "",
        numberOfParticipants: numStr(record.numberOfParticipants),
      },
    });
  }

  if (slug === "world-soil-day") {
    const record = await prisma.worldSoilDay.findFirst({
      where: { id, kvkId: auth.session.kvkId },
    });
    if (!record) return NextResponse.json({ error: "Record not found." }, { status: 404 });
    return NextResponse.json({
      values: {
        noOfActivitiesConducted: numStr(record.noOfActivitiesConducted),
        soilHealthCardsDistributed: numStr(record.soilHealthCardsDistributed),
        noOfVip: numStr(record.noOfVip),
        vipNames: record.vipNames ?? "",
        totalParticipants: numStr(record.totalParticipants),
      },
    });
  }

  return NextResponse.json({ error: "Unknown event type." }, { status: 400 });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSession(["KVK_ADMIN"]);
  if (!auth.ok) return auth.response;
  if (!auth.session.kvkId) {
    return NextResponse.json({ error: "No KVK on this account." }, { status: 400 });
  }
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const slug = body?.slug;
  const v: Record<string, string> = body?.values ?? {};

  if (slug === "technology-week-celebration") {
    const result = await prisma.technologyWeekCelebration.updateMany({
      where: { id, kvkId: auth.session.kvkId },
      data: {
        startDate: reqDate(v.startDate),
        endDate: reqDate(v.endDate),
        typeOfActivities: reqStr(v.typeOfActivities),
        noOfActivities: reqInt(v.noOfActivities),
        relatedCropTechnology: str(v.relatedCropTechnology),
        numberOfParticipants: reqInt(v.numberOfParticipants),
      },
    });
    if (result.count === 0) return NextResponse.json({ error: "Record not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  if (slug === "world-soil-day") {
    const result = await prisma.worldSoilDay.updateMany({
      where: { id, kvkId: auth.session.kvkId },
      data: {
        noOfActivitiesConducted: reqInt(v.noOfActivitiesConducted),
        soilHealthCardsDistributed: reqInt(v.soilHealthCardsDistributed),
        noOfVip: reqInt(v.noOfVip),
        vipNames: str(v.vipNames),
        totalParticipants: reqInt(v.totalParticipants),
      },
    });
    if (result.count === 0) return NextResponse.json({ error: "Record not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown event type." }, { status: 400 });
}
