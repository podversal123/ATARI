import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { percentIncreaseInYield, yieldGapMinimizedPercent } from "@/lib/cfld-formulas";
import { leafCategoryLabel, syncModuleImages } from "@/lib/leaf-record-registry";

const CFLD_LEAF_PATH = "projects/cfld/technical-parameter";
const CFLD_TRAINING_SLOT = "cfld-training";
const CFLD_ACTION_SLOT = "cfld-action";

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
  const reportingDateRaw = str(technical.reportingDate);
  const reportingDate = reportingDateRaw ? new Date(reportingDateRaw) : undefined;
  if (!reportingDate || Number.isNaN(reportingDate.getTime())) {
    return NextResponse.json({ error: "Reporting Year is required." }, { status: 400 });
  }

  const ctx = { kvkId: auth.session.kvkId, zoneId: auth.session.zoneId };

  const farmerYield = dec(technical.farmerYield);
  const demoYieldAvg = dec(technical.demoYieldAvg);
  const districtYield = dec(technical.districtYield);
  const stateYield = dec(technical.stateYield);
  const potentialYield = dec(technical.potentialYield);

  const record = await prisma.cfldTechnicalParameter.create({
    data: {
      ...ctx,
      /**
       * reportingYear is ALWAYS derived from reportingDate, never from a
       * separately-submitted value - the real form has only one "Reporting
       * Year" control, a full date-picker (cfld-technical-parameter-page.tsx),
       * so there is nothing else to fall back to. A `reqInt(technical.
       * reportingYear)` fallback used to sit here for a field the client
       * never actually sends; if a save ever landed with an empty date,
       * Prisma silently skipped `reportingDate` (left the DB's existing
       * value alone) while `reportingYear` still got overwritten from that
       * dead fallback - the two could drift apart on the same row.
       * Requiring the date above (real audit finding, 2026-09-11 - 12 of
       * 175 live CFLD records had reportingYear disagree with
       * reportingDate's own year) closes that gap for every future save.
       */
      reportingYear: reportingDate.getFullYear(),
      reportingDate,
      month: str(technical.month),
      season: reqStr(technical.season),
      cropType: str(technical.cropType),
      crop: reqStr(technical.crop),
      cropDemonstrated: reqStr(technical.crop),
      variety: str(technical.variety),
      areaHa: reqDec(technical.areaHa),
      targetAreaHa: dec(technical.targetAreaHa),
      targetDemonstrations: technical.targetDemonstrations?.trim() ? parseInt(technical.targetDemonstrations, 10) : undefined,
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
      status,
    },
  });

  {
    const photoBase = {
      kvkId: auth.session.kvkId,
      zoneId: auth.session.zoneId,
      categoryPath: CFLD_LEAF_PATH,
      categoryLabel: leafCategoryLabel(CFLD_LEAF_PATH),
      reportingYear: reportingDate.getFullYear(),
      activityDate: reportingDate,
      formRecordId: record.id,
      uploadedById: auth.session.sub,
    };
    const asJson = (v: unknown) => (typeof v === "string" ? v : JSON.stringify(v ?? []));
    await syncModuleImages(asJson(body?.trainingPhotos), { ...photoBase, slot: CFLD_TRAINING_SLOT });
    await syncModuleImages(asJson(body?.actionPhotos), { ...photoBase, slot: CFLD_ACTION_SLOT });
  }

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
