import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

const str = (v: string | undefined) => (v?.trim() ? v.trim() : undefined);
const reqStr = (v: string | undefined) => v?.trim() ?? "";
const reqInt = (v: string | undefined) => parseInt(v ?? "0", 10) || 0;
const dec = (v: string | undefined) => (v?.trim() ? Number(v) : undefined);
const reqDec = (v: string | undefined) => Number(v) || 0;

/**
 * Backs the CFLD Technical Parameter dialog's 4 tabs. The dialog's own
 * "Socio Economic Parameters" tab renders a caste/gender demographic
 * breakdown (not the report's produce/income "Socio-economic impact"
 * section) - stored in farmersByCategory (JSON) on the parent record, which
 * is exactly what that field was designed for. The report's own
 * Total-Produce/Selling-Rate/Employment-Generated fields
 * (CfldSocioEconomicImpact) have no matching inputs anywhere in this dialog
 * yet, so that child table isn't populated from this route - not guessed,
 * left for whenever those fields are actually added to the UI. Create only:
 * editing an existing record needs a real row id threaded through
 * EmptyDataTable's rows, which no leaf in this app has yet (a broader,
 * separate gap, not specific to CFLD).
 */
export async function POST(request: Request) {
  const auth = await requireSession(["KVK_ADMIN"]);
  if (!auth.ok) return auth.response;
  if (!auth.session.kvkId) {
    return NextResponse.json({ error: "No KVK on this account." }, { status: 400 });
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

  const ctx = { kvkId: auth.session.kvkId, zoneId: auth.session.zoneId };

  const record = await prisma.cfldTechnicalParameter.create({
    data: {
      ...ctx,
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

  const hasEconomic = Object.values(economic).some((v) => v !== "" && v != null);
  if (hasEconomic) {
    await prisma.cfldEconomicParameter.create({
      data: {
        cfldTechnicalParameterId: record.id,
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

  const hasPerception = Object.values(perception).some((v) => v !== "" && v != null);
  if (hasPerception) {
    await prisma.cfldFarmersPerception.create({
      data: {
        cfldTechnicalParameterId: record.id,
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

  return NextResponse.json({ id: record.id }, { status: 201 });
}
