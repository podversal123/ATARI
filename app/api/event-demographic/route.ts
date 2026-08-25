import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

// Co-locate with the Neon database (ap-southeast-1 / Singapore) - without this Vercel runs functions in its default us-east region, adding a cross-Pacific round trip to every query.
export const preferredRegion = "sin1";

const reqStr = (v: string | undefined) => v?.trim() ?? "";
const reqInt = (v: string | undefined) => parseInt(v ?? "0", 10) || 0;
const str = (v: string | undefined) => (v?.trim() ? v.trim() : undefined);
const reqDate = (v: string | undefined) => new Date(v ?? Date.now());

/** Backs EventDemographicDialog's two leaves - Technology Week Celebration and World Soil Day. */
export async function POST(request: Request) {
  const auth = await requireSession(["KVK_ADMIN"]);
  if (!auth.ok) return auth.response;
  if (!auth.session.kvkId) {
    return NextResponse.json({ error: "No KVK on this account." }, { status: 400 });
  }
  const ctx = { kvkId: auth.session.kvkId, zoneId: auth.session.zoneId };

  const body = await request.json().catch(() => null);
  const slug = body?.slug;
  const v: Record<string, string> = body?.values ?? {};

  if (slug === "technology-week-celebration") {
    await prisma.technologyWeekCelebration.create({
      data: {
        ...ctx,
        startDate: reqDate(v.startDate),
        endDate: reqDate(v.endDate),
        typeOfActivities: reqStr(v.typeOfActivities),
        noOfActivities: reqInt(v.noOfActivities),
        relatedCropTechnology: str(v.relatedCropTechnology),
        numberOfParticipants: reqInt(v.numberOfParticipants),
      },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  if (slug === "world-soil-day") {
    await prisma.worldSoilDay.create({
      data: {
        ...ctx,
        noOfActivitiesConducted: reqInt(v.noOfActivitiesConducted),
        soilHealthCardsDistributed: reqInt(v.soilHealthCardsDistributed),
        noOfVip: reqInt(v.noOfVip),
        vipNames: str(v.vipNames),
        totalParticipants: reqInt(v.totalParticipants),
      },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  return NextResponse.json({ error: "Unknown event type." }, { status: 400 });
}
