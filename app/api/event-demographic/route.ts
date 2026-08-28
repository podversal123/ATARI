import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

const reqStr = (v: string | undefined) => v?.trim() ?? "";
const reqInt = (v: string | undefined) => parseInt(v ?? "0", 10) || 0;
const str = (v: string | undefined) => (v?.trim() ? v.trim() : undefined);
const reqDate = (v: string | undefined) => new Date(v ?? Date.now());
const int = (v: string | undefined) => (v?.trim() ? parseInt(v, 10) || 0 : undefined);

/** DemographicBreakdown's own key convention (generalMale/generalFemale/...) - shared by both leaves below, each with just one real breakdown block. */
function demographicData(v: Record<string, string>) {
  return {
    generalMale: reqInt(v.generalMale),
    generalFemale: reqInt(v.generalFemale),
    obcMale: reqInt(v.obcMale),
    obcFemale: reqInt(v.obcFemale),
    scMale: reqInt(v.scMale),
    scFemale: reqInt(v.scFemale),
    stMale: reqInt(v.stMale),
    stFemale: reqInt(v.stFemale),
  };
}

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
    const demographics = demographicData(v);
    await prisma.technologyWeekCelebration.create({
      data: {
        ...ctx,
        startDate: reqDate(v.startDate),
        endDate: reqDate(v.endDate),
        typeOfActivities: reqStr(v.typeOfActivities),
        noOfActivities: reqInt(v.noOfActivities),
        relatedCropTechnology: str(v.relatedCropTechnology),
        /** Server-computed from the real breakdown below, never trusted from the client - the reference has no separate "total" input for this leaf, the demographic block IS the source. */
        numberOfParticipants: Object.values(demographics).reduce((sum, n) => sum + n, 0),
        ...demographics,
      },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  if (slug === "world-soil-day") {
    await prisma.worldSoilDay.create({
      data: {
        ...ctx,
        reportingYear: int(v.reportingYear),
        noOfActivitiesConducted: reqInt(v.noOfActivitiesConducted),
        soilHealthCardsDistributed: reqInt(v.soilHealthCardsDistributed),
        noOfVip: reqInt(v.noOfVip),
        vipNames: str(v.vipNames),
        totalParticipants: reqInt(v.totalParticipants),
        ...demographicData(v),
      },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  return NextResponse.json({ error: "Unknown event type." }, { status: 400 });
}
