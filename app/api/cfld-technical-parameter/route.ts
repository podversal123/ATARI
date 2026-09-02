import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { percentIncreaseInYield, yieldGapMinimizedPercent } from "@/lib/cfld-formulas";

const str = (v: string | undefined) => (v?.trim() ? v.trim() : undefined);
const reqStr = (v: string | undefined) => v?.trim() ?? "";
const reqInt = (v: string | undefined) => parseInt(v ?? "0", 10) || 0;
const dec = (v: string | undefined) => (v?.trim() ? Number(v) : undefined);
const reqDec = (v: string | undefined) => Number(v) || 0;

/**
 * Backs the CFLD Technical Parameter dialog's 4 tabs. The dialog's own
 * "Socio Economic Parameters" tab renders both the caste/gender demographic
 * breakdown (farmersByCategory JSON on the parent record) and the report's
 * own produce/income "Socio-economic impact" fields (CfldSocioEconomicImpact
 * - Total Produce/Selling Rate/Employment Generated etc.). Create only:
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
  const socioEconomic = body?.socioEconomic ?? {};
  const perception = body?.perception ?? {};
  const status = body?.status === "COMPLETED" ? "COMPLETED" : "ONGOING";

  if (!technical.crop || !technical.technologyDemonstrated) {
    return NextResponse.json({ error: "Crop and Technology Demonstrated are required." }, { status: 400 });
  }

  const ctx = { kvkId: auth.session.kvkId, zoneId: auth.session.zoneId };

  const farmerYield = dec(technical.farmerYield);
  const demoYieldAvg = dec(technical.demoYieldAvg);
  const districtYield = dec(technical.districtYield);
  const stateYield = dec(technical.stateYield);
  const potentialYield = dec(technical.potentialYield);
  const reportingDate = str(technical.reportingDate) ? new Date(technical.reportingDate) : undefined;
  const trainingPhotoUrls = Array.isArray(technical.trainingPhotoUrls)
    ? technical.trainingPhotoUrls.filter((v: unknown): v is string => typeof v === "string")
    : [];
  const actionPhotoUrls = Array.isArray(technical.actionPhotoUrls)
    ? technical.actionPhotoUrls.filter((v: unknown): v is string => typeof v === "string")
    : [];

  const record = await prisma.cfldTechnicalParameter.create({
    data: {
      ...ctx,
      reportingYear: reportingDate ? reportingDate.getFullYear() : reqInt(technical.reportingYear),
      reportingDate,
      month: str(technical.month),
      season: reqStr(technical.season),
      cropType: str(technical.cropType),
      crop: reqStr(technical.crop),
      cropDemonstrated: reqStr(technical.crop),
      variety: str(technical.variety),
      areaHa: reqDec(technical.areaHa),
      numberOfFarmers: reqInt(technical.numberOfFarmers),
      farmersByCategory: demographics,
      detailOfTechnologyDemonstrated: reqStr(technical.technologyDemonstrated),
      existingFarmerPractice: str(technical.existingFarmerPractice),
      yieldFarmerFieldQha: farmerYield,
      yieldDemoMaxQha: dec(technical.demoYieldMax),
      yieldDemoMinQha: dec(technical.demoYieldMin),
      yieldDemoAvgQha: demoYieldAvg,
      districtYield,
      stateYield,
      potentialYield,
      percentIncrease: percentIncreaseInYield(demoYieldAvg, farmerYield),
      yieldGapMinimizedPercentDistrict: yieldGapMinimizedPercent(districtYield, demoYieldAvg),
      yieldGapMinimizedPercentState: yieldGapMinimizedPercent(stateYield, demoYieldAvg),
      yieldGapMinimizedPercentPotential: yieldGapMinimizedPercent(potentialYield, demoYieldAvg),
      trainingPhotoUrls,
      actionPhotoUrls,
      status,
    },
  });

  const hasEconomic = Object.values(economic).some((v) => v !== "" && v != null);
  if (hasEconomic) {
    const farmerGrossCost = dec(economic.costFarmer);
    const farmerGrossReturn = dec(economic.grossReturnFarmer);
    const demoGrossCost = dec(economic.costDemo);
    const demoGrossReturn = dec(economic.grossReturnDemo);
    await prisma.cfldEconomicParameter.create({
      data: {
        cfldTechnicalParameterId: record.id,
        zoneId: auth.session.zoneId,
        detailOfTechnology: reqStr(technical.technologyDemonstrated),
        farmerGrossCost,
        demoGrossCost,
        farmerGrossReturn,
        demoGrossReturn,
        farmerNetReturn:
          farmerGrossReturn !== undefined && farmerGrossCost !== undefined
            ? farmerGrossReturn - farmerGrossCost
            : undefined,
        demoNetReturn:
          demoGrossReturn !== undefined && demoGrossCost !== undefined
            ? demoGrossReturn - demoGrossCost
            : undefined,
        farmerBcRatio:
          farmerGrossReturn !== undefined && farmerGrossCost
            ? farmerGrossReturn / farmerGrossCost
            : undefined,
        demoBcRatio:
          demoGrossReturn !== undefined && demoGrossCost
            ? demoGrossReturn / demoGrossCost
            : undefined,
        additionalIncome: dec(economic.additionalIncome),
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

  const hasSocioEconomic = Object.values(socioEconomic).some((v) => v !== "" && v != null);
  if (hasSocioEconomic) {
    await prisma.cfldSocioEconomicImpact.create({
      data: {
        cfldTechnicalParameterId: record.id,
        zoneId: auth.session.zoneId,
        cropDemonstrated: reqStr(technical.crop),
        totalProduceObtainedKg: dec(socioEconomic.totalProduceObtainedKg),
        produceSoldKgPerHousehold: dec(socioEconomic.produceSoldKgPerHousehold),
        sellingRatePerKg: dec(socioEconomic.sellingRatePerKg),
        produceUsedOwnFarmKg: dec(socioEconomic.produceUsedOwnFarmKg),
        produceDistributedToOthersKg: dec(socioEconomic.produceDistributedToOthersKg),
        purposeOfIncomeUtilized: str(socioEconomic.purposeOfIncomeUtilized),
        employmentGeneratedMandays: dec(socioEconomic.employmentGeneratedMandays),
      },
    });
  }

  return NextResponse.json({ id: record.id }, { status: 201 });
}
