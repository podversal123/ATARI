import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

// Co-locate with the Neon database (ap-southeast-1 / Singapore) - without this Vercel runs functions in its default us-east region, adding a cross-Pacific round trip to every query.
export const preferredRegion = "sin1";

const str = (v: string | undefined) => (v?.trim() ? v.trim() : undefined);
const reqStr = (v: string | undefined) => v?.trim() ?? "";
const reqInt = (v: string | undefined) => parseInt(v ?? "0", 10) || 0;
const dec = (v: string | undefined) => (v?.trim() ? Number(v) : undefined);
const reqDec = (v: string | undefined) => Number(v) || 0;
const numStr = (v: unknown) => (v === null || v === undefined ? "" : String(v));

/** Loads one CFLD Technical Parameter record (+ its Economic/Perception children) shaped exactly like CfldTechnicalParameterDialog's own state, for the Edit flow. */
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

  const record = await prisma.cfldTechnicalParameter.findFirst({
    where: { id, kvkId: auth.session.kvkId },
    include: { economicParameters: true, farmersPerceptions: true },
  });
  if (!record) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }

  const economic = record.economicParameters[0];
  const perception = record.farmersPerceptions[0];
  const demographics = (record.farmersByCategory as Record<string, string> | null) ?? {};

  return NextResponse.json({
    technical: {
      reportingYear: numStr(record.reportingYear),
      season: record.season,
      crop: record.crop,
      variety: "",
      areaHa: numStr(record.areaHa),
      technologyDemonstrated: record.detailOfTechnologyDemonstrated,
      existingFarmerPractice: record.existingFarmerPractice ?? "",
      farmerYield: numStr(record.yieldFarmerFieldQha),
      demoYieldMax: numStr(record.yieldDemoMaxQha),
      demoYieldMin: numStr(record.yieldDemoMinQha),
      demoYieldAvg: numStr(record.yieldDemoAvgQha),
      district: "",
      stateYield: numStr(record.stateYield),
      potentialYield: numStr(record.potentialYield),
      numberOfFarmers: numStr(record.numberOfFarmers),
    },
    economic: economic
      ? {
          costDemo: numStr(economic.demoGrossCost),
          costFarmer: numStr(economic.farmerGrossCost),
          grossReturnDemo: numStr(economic.demoGrossReturn),
          grossReturnFarmer: numStr(economic.farmerGrossReturn),
          netReturnDemo: numStr(economic.demoNetReturn),
          netReturnFarmer: numStr(economic.farmerNetReturn),
          bcRatioDemo: numStr(economic.demoBcRatio),
          bcRatioFarmer: numStr(economic.farmerBcRatio),
        }
      : {},
    demographics,
    perception: perception
      ? {
          suitability: perception.suitability ?? "",
          likingsPreference: perception.liking ?? "",
          affordability: numStr(perception.affordabilityPercent),
          negativeEffect: perception.negativeEffect ?? "",
          acceptableToAll: perception.acceptableToGroup ?? "",
          suggestions: perception.suggestions ?? "",
          farmerFeedback: perception.farmerFeedback ?? "",
        }
      : {},
    status: record.status,
  });
}

/** Updates the parent record's own fields, and replaces its Economic/Perception children wholesale (simpler and just as correct as a partial merge, since the dialog always submits the full tab state). */
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

  const existing = await prisma.cfldTechnicalParameter.findFirst({
    where: { id, kvkId: auth.session.kvkId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const technical = body?.technical ?? {};
  const economic = body?.economic ?? {};
  const demographics = body?.demographics ?? {};
  const perception = body?.perception ?? {};
  const status = body?.status === "COMPLETED" ? "COMPLETED" : "ONGOING";

  if (!technical.crop || !technical.technologyDemonstrated) {
    return NextResponse.json({ error: "Crop and Technology Demonstrated are required." }, { status: 400 });
  }

  await prisma.cfldTechnicalParameter.update({
    where: { id },
    data: {
      reportingYear: reqInt(technical.reportingYear),
      season: reqStr(technical.season),
      crop: reqStr(technical.crop),
      cropDemonstrated: reqStr(technical.crop),
      areaHa: reqDec(technical.areaHa),
      numberOfFarmers: reqInt(technical.numberOfFarmers),
      farmersByCategory: demographics,
      detailOfTechnologyDemonstrated: reqStr(technical.technologyDemonstrated),
      existingFarmerPractice: str(technical.existingFarmerPractice),
      yieldFarmerFieldQha: dec(technical.farmerYield),
      yieldDemoMaxQha: dec(technical.demoYieldMax),
      yieldDemoMinQha: dec(technical.demoYieldMin),
      yieldDemoAvgQha: dec(technical.demoYieldAvg),
      stateYield: dec(technical.stateYield),
      potentialYield: dec(technical.potentialYield),
      status,
    },
  });

  await prisma.cfldEconomicParameter.deleteMany({ where: { cfldTechnicalParameterId: id } });
  const hasEconomic = Object.values(economic).some((v) => v !== "" && v != null);
  if (hasEconomic) {
    await prisma.cfldEconomicParameter.create({
      data: {
        cfldTechnicalParameterId: id,
        zoneId: auth.session.zoneId,
        detailOfTechnology: reqStr(technical.technologyDemonstrated),
        farmerGrossCost: dec(economic.costFarmer),
        demoGrossCost: dec(economic.costDemo),
        farmerGrossReturn: dec(economic.grossReturnFarmer),
        demoGrossReturn: dec(economic.grossReturnDemo),
        farmerNetReturn: dec(economic.netReturnFarmer),
        demoNetReturn: dec(economic.netReturnDemo),
        farmerBcRatio: dec(economic.bcRatioFarmer),
        demoBcRatio: dec(economic.bcRatioDemo),
      },
    });
  }

  await prisma.cfldFarmersPerception.deleteMany({ where: { cfldTechnicalParameterId: id } });
  const hasPerception = Object.values(perception).some((v) => v !== "" && v != null);
  if (hasPerception) {
    await prisma.cfldFarmersPerception.create({
      data: {
        cfldTechnicalParameterId: id,
        zoneId: auth.session.zoneId,
        technologyDetail: reqStr(technical.technologyDemonstrated),
        suitability: str(perception.suitability),
        liking: str(perception.likingsPreference),
        affordabilityPercent: dec(perception.affordability),
        negativeEffect: str(perception.negativeEffect),
        acceptableToGroup: str(perception.acceptableToAll),
        suggestions: str(perception.suggestions),
        farmerFeedback: str(perception.farmerFeedback),
      },
    });
  }

  return NextResponse.json({ ok: true });
}
