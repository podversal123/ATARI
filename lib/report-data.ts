import "server-only";
import { prisma } from "@/lib/prisma";

export type ReportScope = { kvkId?: string; zoneId: string };
export type ReportColumn = { key: string; label: string };
export type ReportTable = { code: string; title: string; columns: ReportColumn[]; rows: Record<string, string>[] };
export type ReportSubsection = { num: string; title: string; tables: ReportTable[] };
export type ReportSection = { num: string; title: string; subsections: ReportSubsection[] };

function humanize(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function stringifyValue(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "object" && "toFixed" in (v as Record<string, unknown>)) return String(v);
  return String(v);
}

/**
 * Explicit real field list per model - mechanically extracted from
 * prisma/schema.prisma's own scalar fields (id/kvkId/zoneId/createdAt/
 * updatedAt/relations excluded), not guessed. Column ORDER here is field
 * declaration order in the schema, which is itself the order the client's
 * real report tends to follow for these same fields.
 */
const MODEL_FIELDS: Record<string, string[]> = {
  kvk: ["name", "address", "officePhone", "fax", "email", "sanctionYear"],
  bankAccount: ["accountType", "accountName", "bankName", "location", "accountNumber"],
  staff: ["sanctionedPost", "name", "dateOfBirth", "discipline", "payScale", "dateOfJoining", "category", "jobType", "position", "mobile", "email", "allowances", "transferStatus"],
  staffTransfer: ["transferDate", "numberOfTransfers"],
  infrastructure: ["infrastructureName", "notYetStarted", "completedPlinthLevel", "completedLintelLevel", "completedRoofLevel", "totallyCompleted", "plinthAreaSqM", "underUse", "sourceOfFunding"],
  land: ["item", "description", "areaHa"],
  staffQuarters: ["dateOfCompletion", "numberOfQuarters", "remark"],
  vehicle: ["name", "registrationNo", "yearOfPurchase", "cost"],
  vehicleStatus: ["reportingYear", "totalRunKmHrs", "presentStatus", "repairingCost", "fundingSource", "fundingAgency"],
  equipment: ["name", "yearOfPurchase", "cost"],
  equipmentStatus: ["reportingYear", "sourceOfFund", "fundingAgency", "presentStatus"],
  technicalAchievementSummaryEntry: ["reportingYear", "sectionCode", "metricCode", "casteCategory", "value"],
  oft: ["reportingYear", "discipline", "staff", "thematicArea", "trialOnForm", "problemDiagnosed", "sourceOfTechnology", "productionSystem", "performanceIndicators", "finalRecommendation", "constraintsIdentified", "farmersParticipationProcess", "quantity", "unit", "noOfTrialReplicationFarmer", "startMonth", "endMonth", "criticalInput", "costOfOft", "fundingAgency", "resultSummary", "status", "generalMale", "generalFemale", "obcMale", "obcFemale", "scMale", "scFemale", "stMale", "stFemale"],
  fld: ["reportingYear", "startDate", "endDate", "category", "subCategory", "technologyDemonstrated", "status"],
  fldExtensionTraining: ["activity", "date", "activityCount", "participantCount", "remark"],
  fldTechnicalFeedback: ["crop", "feedback"],
  training: ["reportingYear", "startDate", "endDate", "program", "title", "venue", "trainingDiscipline", "thematicArea"],
  extensionActivity: ["reportingYear", "startDate", "endDate", "natureOfExtensionActivity", "noOfActivities", "noOfParticipants"],
  otherExtensionActivity: ["reportingYear", "natureOfExtensionActivity", "noOfActivities"],
  technologyWeekCelebration: ["startDate", "endDate", "typeOfActivities", "noOfActivities", "relatedCropTechnology", "numberOfParticipants"],
  celebrationDay: ["importantDay", "eventDate", "noOfActivities"],
  worldSoilDay: ["noOfActivitiesConducted", "soilHealthCardsDistributed", "noOfVip", "vipNames", "totalParticipants"],
  poshanMaaha: ["activityDate", "activitiesConducted", "eventName", "saplingsPlanted", "vegetableKits", "participantsGirls", "participantsPublicRepresentatives", "participantsFarmWoman", "participantsFarmers", "participantsAganwadiWorkers", "participantsGovtOfficials", "totalParticipants"],
  swachhtaObservance: ["kind", "dateDurationOfObservation", "totalNoOfActivitiesUndertaken", "noOfStaffs", "noOfFarmers"],
  swachhtaBudgetExpenditure: ["reportingYear", "vermicompostingVillagesCovered", "vermicompostingTotalExpenditure"],
  technologyProductProduction: ["category", "variety", "quantity"],
  soilWaterPlantAnalysis: ["startDate", "endDate", "analysis", "noOfSamplesAnalyzed", "noOfVillagesCovered", "amountRealized"],
  publication: ["itemName", "title", "authorName", "journalName"],
  humanResourceDevelopment: ["staff", "course", "startDate", "endDate", "venue", "organizer"],
  kvkAward: ["award", "amount", "achievement", "conferringAuthority"],
  scientistAward: ["headScientist", "award", "amount", "achievement", "conferringAuthority"],
  farmerAward: ["farmerName", "address", "contactNumber", "award", "amount", "achievement", "conferringAuthority"],
  cfldTechnicalParameter: ["reportingYear", "season", "crop", "cropDemonstrated", "areaHa", "numberOfFarmers", "detailOfTechnologyDemonstrated", "existingFarmerPractice", "yieldFarmerFieldQha", "yieldDemoMaxQha", "yieldDemoMinQha", "yieldDemoAvgQha", "yieldGapKgHaDistrict", "yieldGapKgHaState", "yieldGapKgHaPotential", "yieldGapMinimizedPercentDistrict", "yieldGapMinimizedPercentState", "yieldGapMinimizedPercentPotential", "percentIncrease", "districtYield", "stateYield", "potentialYield", "status"],
  cfldExtensionActivity: ["season", "activitiesOrganized", "date", "placeOfActivity", "generalMale", "generalFemale", "obcMale", "obcFemale", "scMale", "scFemale", "stMale", "stFemale"],
  cfldBudgetUtilization: ["crop", "season", "overallFundAllocation"],
  cfldSocioEconomicImpact: ["cropDemonstrated", "totalProduceObtainedKg", "produceSoldKgPerHousehold", "sellingRatePerKg", "produceUsedOwnFarmKg", "produceDistributedToOthersKg", "purposeOfIncomeUtilized", "employmentGeneratedMandays"],
  nicraBasicInformation: ["rfDistrictNormal", "rfDistrictReceived", "maxTemperature", "minTemperature"],
  nicraDetails: ["cropName", "seasonName", "technologyDemonstration", "noOfFarmers"],
  nicraTraining: ["title", "startDate", "endDate", "farmersAttended"],
  nicraExtensionActivity: ["activityName", "places", "startDate", "endDate", "farmersAttended"],
  nicraIntervention: ["startDate", "endDate", "seedBankFodderBank", "crop", "variety", "quantityQuintal"],
  nicraRevenueGenerated: ["year", "revenue", "total"],
  nicraCustomHiringFarmImplement: ["farmImplementName", "farmersUsed", "areaCovered", "hoursUsed", "revenueGenerated", "repairExpenditure"],
  nicraVillageWiseVcrmc: ["villageName", "constitutionDate", "members", "meetingsOrganized", "meetingDate", "secretaryName"],
  nicraSoilHealthCard: ["startDate", "endDate", "samplesCollected", "samplesAnalysed", "shcIssued", "farmersBenefitted"],
  nicraConvergenceProgramme: ["startDate", "endDate", "scheme", "natureOfWork", "amount"],
  nicraDignitaryVisit: ["vipExperts", "name", "dateOfVisit"],
  nicraPiCoPi: ["startDate", "endDate", "piCoPi", "name"],
  aryaCurrentYearDetail: ["enterprise", "viableUnits", "closedUnits", "startDate", "endDate", "groupsFormed", "groupsActive"],
  aryaPreviousYearEvaluation: ["enterprise", "totalClosed", "closingDate", "totalRestarted", "restartedDate"],
  nfGeographicalInfo: ["startDate", "endDate", "agroClimaticZone", "farmingSituation", "latitude", "longitude"],
  nfPhysicalInfo: ["activityName", "trainingTitle", "trainingDate", "venue", "participants"],
  nfDemonstrationInfo: ["farmerName", "activityName", "crop", "variety", "farmerAddress", "farmerContact", "agroClimaticZone", "croppingPattern", "farmingSituation", "latitude", "longitude", "season", "technologyDemonstrated", "areaHa", "farmerPracticeDetail", "farmerFeedback"],
  nfAlreadyPracticing: ["farmerName", "address", "normalCropsGrown", "practicingYear", "contactNumber", "activityName", "crop", "technologyDemonstrated", "areaHa", "farmerFeedback"],
  nfBeneficiary: ["numberOfBlock", "numberOfVillage", "numberOfTraining", "farmersInfluenced"],
  nfSoilData: ["season", "type", "crop", "beforePh", "beforeEc", "beforeEcOc", "afterPh", "afterEc", "afterEcOc"],
  nfBudgetExpenditure: ["activityName", "activitiesOrganised", "budgetSanction", "budgetExpenditure", "totalBudgetExpenditure"],
  subPlanActivity: ["type", "activities", "noOfTraining", "beneficiaries"],
  nariNutritionGarden: ["nutriSmartVillage", "typeOfNutritionalGarden", "numbers", "areaSqm", "activity", "male", "female"],
  nariBioFortified: ["nutriSmartVillage", "season", "activity", "categoryOfCrop", "numberOfCrops", "male", "female"],
  nariValueAddition: ["nutriSmartVillage", "cropName", "valueAddedProduct", "activity", "numberOfProducts", "male", "female"],
  nariTraining: ["nutriSmartVillage", "areaOfTraining", "activity", "titleOfTraining", "numberOfCourses", "male", "female"],
  nariExtension: ["nutriSmartVillage", "activity", "nameOfActivity", "noOfActivities", "male", "female"],
  agriDroneIntroduction: ["year", "centreName", "companyOfDrone", "modelOfDrone", "dronesSanctioned", "dronesPurchased", "amountSanctioned", "costPerDrone", "pilotNameContact", "targetAreaHa", "amountSanctionedDemo", "amountUtilisedDemo", "areaCoveredDemoHa", "operationType", "farmersParticipated", "advantages"],
  agriDroneDemonstration: ["centreName", "district", "dateOfDemos", "placeOfDemos", "cropName", "noOfDemos", "areaCovered", "noOfFarmers"],
  fpoCbboDetail: ["noOfBlocksAllocated", "noOfFposRegistered", "trainingReceived", "businessPlanPrepared", "noOfFposDoingBusiness"],
  fpoManagement: ["registrationNo", "dateOfRegistration", "fpoName", "fpoAddress", "totalBomMembers", "financialPosition", "proposedActivity", "commodityIdentified", "areaHa", "totalFarmersAttached", "successIndicator"],
  drmrDetail: ["varietiesUsedInIp", "situations", "varietiesUsedInFp", "netReturnImprovedPractice", "netReturnFarmerPractice", "yieldKgHaIp", "yieldKgHaFp", "yiofpPercentIp", "yiofpPercentFp", "cocRsHaIp", "cocRsHaFp", "gmrRsHaIp", "gmrRsHaFp", "anmrRsHaIp", "anmrRsHaFp", "bcRatioIp", "bcRatioFp"],
  drmrActivity: ["startDate", "endDate", "training", "flds", "awarenessCamps", "distributionOfLiterature", "itemActivity", "unit", "quantity"],
  craDetail: ["season", "technologyDemonstrated", "croppingSystem", "areaHa", "noOfFarmer", "farmingSystem", "crop", "cropYieldQha", "systemProductivityQha", "totalReturnRsHa", "yieldFarmerPracticeQha"],
  craExtensionActivity: ["extensionActivity", "startDate", "endDate", "withinOrWithoutState", "exposureVisits", "farmersUnderExposure"],
  csisaDetail: ["season", "villageCovered", "blockCovered", "districtCovered"],
  seedHubProgram: ["season", "cropName", "variety", "areaHa", "yieldHa", "qtySeedProducedQ", "qtySeedSaleOutQ", "farmersPurchased", "qtySeedSaleOutToFarmersQ", "villagesCovered", "qtySeedSaleOutOtherOrgQ", "amountGeneratedLakh", "totalAmountInProjectLakh"],
  otherProgramme: ["programmeName", "programmeDate", "venue", "purpose", "participants"],
  kvkActivityImpact: ["specificArea", "briefDetails", "farmersBenefitted", "horizontalSpread", "adoptionPercent"],
  entrepreneurshipDetail: ["entrepreneurOrEnterprise", "enterpriseType", "membersAssociated", "annualIncome"],
  successStory: ["farmerOrEntrepreneur", "experience", "majorAchievement", "storyTitle"],
  districtLevelData: ["reportingYear", "items", "information"],
  districtCropProductivity: ["season", "type", "cropName", "areaHa", "productionMt", "productivityQha", "remarks"],
  districtLivestockProduction: ["livestockName", "number", "remarks"],
  operationalAreaDetail: ["reportingYear", "taluk", "block", "village", "majorCrops", "majorProblems", "thrustAreas"],
  villageAdoptionProgramme: ["reportingYear", "village", "block", "actionTaken"],
  priorityThrustArea: ["reportingYear", "thrustArea"],
  demonstrationUnit: ["demoUnitName", "yearOfEstt", "areaSqMt", "varietyBreed", "produce", "qty", "costOfInputs", "grossIncome", "remarks"],
  instructionalFarmCrop: ["cropName", "areaHa", "season", "variety", "produceType", "qty", "costOfInputs", "grossIncome", "remarks"],
  productionUnit: ["productName", "qty", "costOfInputs", "grossIncome", "remarks"],
  instructionalFarmLivestock: ["animalName", "speciesBreed", "produceType", "qty", "costOfInputs", "grossIncome", "remarks"],
  hostelUtilization: ["months", "traineesStayed", "traineeDays", "reasonForShortFall"],
  rainWaterHarvesting: ["trainingProgrammes", "demonstrations", "plantMaterialProduced", "farmerVisits", "officialVisits"],
  budgetDetail: ["salaryAllocation", "salaryExpenditure", "generalGrantAllocation", "generalGrantExpenditure", "capitalGrantAllocation", "capitalGrantExpenditure", "generalMainGrant", "generalTsp", "generalScsp", "capitalMainGrant", "capitalTsp", "capitalScsp"],
  projectWiseBudgetPerformance: ["projectName", "accountNumber", "fundingAgency", "budgetEstimate", "budgetAllocated", "budgetReleased", "expenditure", "unspentBalance"],
  revolvingFund: ["reportingYear", "openingBalance", "incomeDuringYear", "expenditureDuringYear", "closing", "kind"],
  revenueGeneration: ["headName", "income", "sponsoringAgency"],
  resourceGeneration: ["programmeName", "purpose", "sourcesOfFund", "amountLakhs", "infrastructureCreated"],
  functionalLinkage: ["organizationName", "natureOfLinkage"],
  prevalentDiseaseCrop: ["diseaseName", "crop", "outbreakDate", "areaAffected", "commodityLossPercent", "preventiveMeasures"],
  prevalentDiseaseLivestock: ["diseaseName", "speciesAffected", "outbreakDate", "mortalityMorbidity", "animalsVaccinated", "preventiveMeasures", "areaAffected", "commodityLossPercent"],
  ppvFraTrainingProgramme: ["date", "title", "type", "venue", "resourcePerson", "participants"],
  ppvFraFarmerDetail: ["year", "crop", "registrationNo", "farmerName", "block", "district", "mobileNo", "village", "characteristics"],
  raweFetFitProgramme: ["startDate", "endDate", "attachmentType", "numberOfStudents", "daysStayed"],
  vipVisitor: ["visitDate", "dignitaryType", "ministerName", "observations"],
  digitalMobileApp: ["mobileAppsDeveloped", "appName", "appLanguage", "meantFor", "timesDownloaded"],
  digitalWebPortal: ["visitors", "farmersRegistered"],
  digitalKisanSarathi: ["farmersRegisteredKsp", "phoneCallAddressed", "answeredCall"],
  digitalKmas: ["farmersCovered", "advisoriesSent", "messagesCrop", "messagesLivestock", "messagesWeather", "messagesMarketing", "messagesAwareness", "messagesOtherEnterprises", "messagesAnyOther"],
  digitalOtherChannel: ["channel", "farmersCovered", "advisoriesSent", "messagesCrop", "messagesLivestock", "messagesWeather", "messagesMarketing", "messagesAwareness", "messagesOtherEnterprises"],
  sacMeeting: ["startDate", "endDate", "participants", "statutoryMembers", "recommendations", "actionTaken", "reason"],
  otherMeeting: ["date", "meetingType", "agenda", "representativeFromAtari"],
};

type ScopeMode = "direct" | { via: string };

/**
 * `custom` covers the tables whose real shape (super-v2-prod.pdf) is a
 * State/KVK-grouped aggregate rather than a flat per-record dump of one
 * model's own columns - `model`/`scope` are unused for these (kept required
 * on the type only so every other entry stays a plain object literal).
 */
type Entry = { code: string; title: string; model: string; scope: ScopeMode; custom?: (scope: ReportScope) => Promise<{ columns: ReportColumn[]; rows: Record<string, string>[] }> };

const OFT_SUBJECT_ORDER = [
  "Technologies Assessed under Various Crops by KVKs (Crop Production)",
  "Technologies assessed under livestock and fisheries",
  "Technologies assessed under various enterprises",
  "Technologies assessed under women empowerment (Home science)",
  "Technologies assessed under various crops (Horticulture crops)",
];
const SECTOR_LETTERS = ["A", "B", "C", "D", "E"];

/**
 * "2.2.A OFT Summary" in the real report (super-v2-prod.pdf p.21-24) is a
 * State x Sector x Thematic Area pivot ("Technology Assessed by KVK"), not a
 * flat dump of Oft's own columns - confirmed directly against that PDF, not
 * guessed. The A-E sector grouping comes from OftSubject/
 * OftThematicAreaMaster, whose seeded names match the real report's A)-E)
 * groups thematic-area-for-thematic-area.
 *
 * Caveat (flagged, not asserted as certain): the real report never defines
 * "No. of technologies assessed" / "Locations" / "Trial/Replications"
 * precisely. This reads them as: technologies assessed = count of Oft
 * records in that thematic area, Locations = distinct KVKs, Trial/
 * Replications = sum of noOfTrialReplicationFarmer. Worth checking against
 * the client's own numbers once real OFT data exists in both states.
 */
async function buildOftTechnologySummary(scope: ReportScope) {
  const [subjects, oftRows, states] = await Promise.all([
    prisma.oftSubject.findMany({
      where: { zoneId: scope.zoneId, name: { in: OFT_SUBJECT_ORDER } },
      include: { thematicAreas: { orderBy: { id: "asc" } } },
    }),
    prisma.oft.findMany({
      where: scope.kvkId ? { kvkId: scope.kvkId } : { zoneId: scope.zoneId },
      select: {
        thematicArea: true,
        noOfTrialReplicationFarmer: true,
        kvkId: true,
        kvk: { select: { state: { select: { name: true } } } },
      },
    }),
    prisma.state.findMany({ where: { zoneId: scope.zoneId }, orderBy: { name: "asc" } }),
  ]);

  const stateNames = states.map((s) => s.name);
  const allCols = [...stateNames, "Total"];
  const columns: ReportColumn[] = [
    { key: "sector", label: "Sector wise Thematic Area" },
    ...allCols.flatMap((s) => [
      { key: `${s} tech`, label: `${s} - Technologies Assessed` },
      { key: `${s} loc`, label: `${s} - Locations` },
      { key: `${s} trial`, label: `${s} - Trial/Replications` },
    ]),
  ];
  const countKeys = allCols.flatMap((s) => [`${s} tech`, `${s} loc`, `${s} trial`]);

  function countsFor(matching: typeof oftRows) {
    const out: Record<string, number> = {};
    for (const state of stateNames) {
      const inState = matching.filter((r) => r.kvk.state.name === state);
      out[`${state} tech`] = inState.length;
      out[`${state} loc`] = new Set(inState.map((r) => r.kvkId)).size;
      out[`${state} trial`] = inState.reduce((sum, r) => sum + (r.noOfTrialReplicationFarmer ?? 0), 0);
    }
    out["Total tech"] = matching.length;
    out["Total loc"] = new Set(matching.map((r) => r.kvkId)).size;
    out["Total trial"] = matching.reduce((sum, r) => sum + (r.noOfTrialReplicationFarmer ?? 0), 0);
    return out;
  }

  const rows: Record<string, string>[] = [];
  const grandCounts: Record<string, number> = Object.fromEntries(countKeys.map((k) => [k, 0]));

  OFT_SUBJECT_ORDER.forEach((subjectName, i) => {
    const subject = subjects.find((s) => s.name === subjectName);
    if (!subject) return;
    rows.push({ sector: `${SECTOR_LETTERS[i]}) ${subject.name}` });

    const subTotalCounts: Record<string, number> = Object.fromEntries(countKeys.map((k) => [k, 0]));
    for (const area of subject.thematicAreas) {
      const matching = oftRows.filter((r) => r.thematicArea === area.name);
      const counts = countsFor(matching);
      const row: Record<string, string> = { sector: area.name };
      for (const key of countKeys) {
        row[key] = String(counts[key]);
        subTotalCounts[key] += counts[key];
        grandCounts[key] += counts[key];
      }
      rows.push(row);
    }

    const subRow: Record<string, string> = { sector: `Sub Total (${SECTOR_LETTERS[i]})` };
    for (const key of countKeys) subRow[key] = String(subTotalCounts[key]);
    rows.push(subRow);
  });

  const grandRow: Record<string, string> = { sector: "Grand Total" };
  for (const key of countKeys) grandRow[key] = String(grandCounts[key]);
  rows.push(grandRow);

  return { columns, rows };
}

const OFT_DEMOGRAPHIC_FIELDS = ["generalMale", "generalFemale", "obcMale", "obcFemale", "scMale", "scFemale", "stMale", "stFemale"] as const;

/**
 * "2.2.B State Wise OFT Details" (super-v2-prod.pdf p.24) - state-wise
 * rollup of the Farmers Details block (General/OBC/SC/ST x M/F) added to
 * Oft this session. Column order (category x gender, Total last) confirmed
 * from the reference's own row totals: the sum of the 8 category values
 * equals the last number in every one of its rows.
 */
async function buildOftStateWiseDetails(scope: ReportScope) {
  const [oftRows, states] = await Promise.all([
    prisma.oft.findMany({
      where: scope.kvkId ? { kvkId: scope.kvkId } : { zoneId: scope.zoneId },
      select: {
        generalMale: true, generalFemale: true, obcMale: true, obcFemale: true,
        scMale: true, scFemale: true, stMale: true, stFemale: true,
        kvk: { select: { state: { select: { name: true } } } },
      },
    }),
    prisma.state.findMany({ where: { zoneId: scope.zoneId }, orderBy: { name: "asc" } }),
  ]);

  const columns: ReportColumn[] = [
    { key: "state", label: "States" },
    ...OFT_DEMOGRAPHIC_FIELDS.map((f) => ({ key: f, label: humanize(f) })),
    { key: "total", label: "Total" },
  ];

  const rows: Record<string, string>[] = [];
  const grand: Record<string, number> = Object.fromEntries(OFT_DEMOGRAPHIC_FIELDS.map((f) => [f, 0]));
  for (const state of states.map((s) => s.name)) {
    const inState = oftRows.filter((r) => r.kvk.state.name === state);
    const row: Record<string, string> = { state };
    let total = 0;
    for (const f of OFT_DEMOGRAPHIC_FIELDS) {
      const sum = inState.reduce((s, r) => s + r[f], 0);
      row[f] = String(sum);
      total += sum;
      grand[f] += sum;
    }
    row.total = String(total);
    rows.push(row);
  }
  const grandRow: Record<string, string> = { state: "Total" };
  let grandTotal = 0;
  for (const f of OFT_DEMOGRAPHIC_FIELDS) {
    grandRow[f] = String(grand[f]);
    grandTotal += grand[f];
  }
  grandRow.total = String(grandTotal);
  rows.push(grandRow);

  return { columns, rows };
}

/**
 * "2.2.C KVK Wise OFT Details" in the real report is a full narrative
 * write-up per trial (18 numbered fields + a photo placeholder + nested
 * Technology Option/Results tables) grouped under each KVK's own heading -
 * this report engine's flat grid renderer can't reproduce that document
 * layout, but every field it lists is one this app already collects on
 * Oft, so this renders that same full field set as a flat table sorted by
 * KVK instead. A deliberate, flagged simplification of presentation, not a
 * guess at the underlying data.
 */
async function buildOftKvkWiseDetails(scope: ReportScope) {
  const fields = MODEL_FIELDS.oft;
  const rows = await prisma.oft.findMany({
    where: scope.kvkId ? { kvkId: scope.kvkId } : { zoneId: scope.zoneId },
    select: { ...Object.fromEntries(fields.map((f) => [f, true])), kvk: { select: { name: true } } },
    orderBy: { kvk: { name: "asc" } },
  });
  const columns: ReportColumn[] = [{ key: "kvk", label: "KVK" }, ...fields.map((f) => ({ key: f, label: humanize(f) }))];
  const outRows = rows.map((r) => {
    const row: Record<string, string> = { kvk: r.kvk.name };
    for (const f of fields) row[f] = stringifyValue((r as unknown as Record<string, unknown>)[f]);
    return row;
  });
  return { columns, rows: outRows };
}

/** Real, fixed order the reference report lists FLD sectors in (super-v2-prod.pdf p.34-37) - matches this app's own FLD Sector Master 1:1. */
const FLD_SECTOR_ORDER = [
  "Crop Production",
  "Horticultural Crops",
  "Livestock and Fisheries",
  "Other Enterprises",
  "Women Empowerment",
  "Farm Implements and Machinery",
  "Crop Hybrid Varieties",
];

/**
 * "2.3.A FLD Summary" is a per-sector rollup of FldDemonstrationDetail, not
 * a dump of the parent Fld record's own fields (confirmed against
 * super-v2-prod.pdf p.34-35 directly). No. of FLDs/Demonstrations/Area/
 * beneficiaries are unambiguous sums; the Yield Demo/Check columns use a
 * demonstration-count-weighted average across that sector's rows - the
 * reference never states its own formula and the numbers on the one real
 * page checked don't cleanly resolve to a simple sum or plain average, so
 * this is a best-effort reading flagged for the client to verify once real
 * multi-row FLD data exists, not asserted as exact.
 */
async function buildFldSectorSummary(scope: ReportScope) {
  const details = await prisma.fldDemonstrationDetail.findMany({
    where: scope.kvkId ? { fld: { kvkId: scope.kvkId } } : { zoneId: scope.zoneId },
    select: { fldId: true, sector: true, noOfDemonstrations: true, areaHa: true, noOfFarmers: true, yieldDemoQha: true, yieldCheckQha: true },
  });

  const columns: ReportColumn[] = [
    { key: "sector", label: "Sector" },
    { key: "flds", label: "No. of FLDs" },
    { key: "demos", label: "No. of Demonstrations" },
    { key: "area", label: "Area (ha)" },
    { key: "beneficiaries", label: "No. of beneficiaries" },
    { key: "yieldDemo", label: "Yield in Demo (q/ha)" },
    { key: "yieldCheck", label: "Yield in Check (q/ha)" },
  ];

  function weightedYield(rows: typeof details, key: "yieldDemoQha" | "yieldCheckQha") {
    let weightedSum = 0;
    let weight = 0;
    for (const r of rows) {
      const v = r[key];
      if (v === null) continue;
      const w = r.noOfDemonstrations || 1;
      weightedSum += Number(v) * w;
      weight += w;
    }
    return weight === 0 ? 0 : weightedSum / weight;
  }

  const rows: Record<string, string>[] = [];
  let totalFlds = 0, totalDemos = 0, totalArea = 0, totalBeneficiaries = 0;
  const allRowsForYield: typeof details = [];

  for (const sector of FLD_SECTOR_ORDER) {
    const inSector = details.filter((d) => d.sector === sector);
    allRowsForYield.push(...inSector);
    const flds = new Set(inSector.map((d) => d.fldId)).size;
    const demos = inSector.reduce((s, d) => s + d.noOfDemonstrations, 0);
    const area = inSector.reduce((s, d) => s + Number(d.areaHa), 0);
    const beneficiaries = inSector.reduce((s, d) => s + d.noOfFarmers, 0);
    totalFlds += flds; totalDemos += demos; totalArea += area; totalBeneficiaries += beneficiaries;
    rows.push({
      sector,
      flds: String(flds),
      demos: String(demos),
      area: area.toFixed(2),
      beneficiaries: String(beneficiaries),
      yieldDemo: weightedYield(inSector, "yieldDemoQha").toFixed(2),
      yieldCheck: weightedYield(inSector, "yieldCheckQha").toFixed(2),
    });
  }

  rows.push({
    sector: "Total",
    flds: String(totalFlds),
    demos: String(totalDemos),
    area: totalArea.toFixed(2),
    beneficiaries: String(totalBeneficiaries),
    yieldDemo: weightedYield(allRowsForYield, "yieldDemoQha").toFixed(2),
    yieldCheck: weightedYield(allRowsForYield, "yieldCheckQha").toFixed(2),
  });

  return { columns, rows };
}

/**
 * "2.3.B State wise details of Front-Line Demonstration" (super-v2-prod.pdf
 * p.35) - the reference gives each sector its own sub-column set (Farm
 * Implements and Machinery reports "No. of Implements" instead of an area
 * figure, matching its labor/cost-reduction economics variant). This report
 * engine's flat single-header-row table can't vary columns per sector, so
 * every sector uses the same 3 columns (farmers/demonstrations/area) that
 * apply to the majority of sectors - a flagged simplification for the one
 * sector (Farm Implements and Machinery) whose real column meaning differs.
 */
async function buildFldStateWiseDetails(scope: ReportScope) {
  const [details, states] = await Promise.all([
    prisma.fldDemonstrationDetail.findMany({
      where: scope.kvkId ? { fld: { kvkId: scope.kvkId } } : { zoneId: scope.zoneId },
      select: { sector: true, noOfDemonstrations: true, areaHa: true, noOfFarmers: true, fld: { select: { kvk: { select: { state: { select: { name: true } } } } } } },
    }),
    prisma.state.findMany({ where: { zoneId: scope.zoneId }, orderBy: { name: "asc" } }),
  ]);

  const stateNames = states.map((s) => s.name);
  const columns: ReportColumn[] = [
    { key: "state", label: "States" },
    ...FLD_SECTOR_ORDER.flatMap((sector) => [
      { key: `${sector} farmers`, label: `${sector} - No. of farmers` },
      { key: `${sector} demo`, label: `${sector} - No. of demo` },
      { key: `${sector} area`, label: `${sector} - Area (ha)` },
    ]),
    { key: "Total farmers", label: "Total - No. of farmers" },
    { key: "Total demo", label: "Total - No. of demo" },
    { key: "Total area", label: "Total - Area (ha)" },
  ];

  function rowFor(rowsInScope: typeof details) {
    const row: Record<string, string> = {};
    let totalFarmers = 0, totalDemo = 0, totalArea = 0;
    for (const sector of FLD_SECTOR_ORDER) {
      const inSector = rowsInScope.filter((d) => d.sector === sector);
      const farmers = inSector.reduce((s, d) => s + d.noOfFarmers, 0);
      const demo = inSector.reduce((s, d) => s + d.noOfDemonstrations, 0);
      const area = inSector.reduce((s, d) => s + Number(d.areaHa), 0);
      row[`${sector} farmers`] = String(farmers);
      row[`${sector} demo`] = String(demo);
      row[`${sector} area`] = area.toFixed(2);
      totalFarmers += farmers; totalDemo += demo; totalArea += area;
    }
    row["Total farmers"] = String(totalFarmers);
    row["Total demo"] = String(totalDemo);
    row["Total area"] = totalArea.toFixed(2);
    return row;
  }

  const rows: Record<string, string>[] = stateNames.map((state) => ({
    state,
    ...rowFor(details.filter((d) => d.fld.kvk.state.name === state)),
  }));
  rows.push({ state: "Total", ...rowFor(details) });

  return { columns, rows };
}

/**
 * "2.3.C Details of Front-Line Demonstration" (super-v2-prod.pdf p.35-37) -
 * grouped by sector, then by thematic area, listing every crop x state
 * combination with the same economics/yield columns FldDemonstrationDetail
 * already stores 1:1 (confirmed against the reference's own column
 * headers). The reference further nests a "Cereals of Crop Production"-
 * style category label between sector and crop that this schema has no
 * distinct field for (only sector/cropOrItem/thematicArea exist) - grouped
 * by thematic area here instead as the closest real field, a flagged
 * simplification of the grouping label only, not of the underlying data.
 */
async function buildFldDetailsBySector(scope: ReportScope) {
  const details = await prisma.fldDemonstrationDetail.findMany({
    where: scope.kvkId ? { fld: { kvkId: scope.kvkId } } : { zoneId: scope.zoneId },
    select: {
      sector: true, cropOrItem: true, thematicArea: true, noOfDemonstrations: true, noOfFarmers: true, areaHa: true,
      yieldDemoQha: true, yieldCheckQha: true, percentIncrease: true,
      grossCostDemo: true, grossReturnDemo: true, netReturnDemo: true, bcrDemo: true,
      grossCostCheck: true, grossReturnCheck: true, netReturnCheck: true, bcrCheck: true,
      fld: { select: { kvk: { select: { state: { select: { name: true } } } } } },
    },
  });

  const columns: ReportColumn[] = [
    { key: "sector", label: "Sector" },
    { key: "thematicArea", label: "Thematic Area" },
    { key: "crop", label: "Crop" },
    { key: "state", label: "State" },
    { key: "demos", label: "No. of Demonstration" },
    { key: "farmers", label: "No. of Farmers" },
    { key: "area", label: "Area(ha)" },
    { key: "yieldDemo", label: "Yield Demo (q/ha)" },
    { key: "yieldCheck", label: "Yield Check (q/ha)" },
    { key: "percentIncrease", label: "% Increase" },
    { key: "grossCostDemo", label: "Gross Cost Demo" },
    { key: "grossReturnDemo", label: "Gross Return Demo" },
    { key: "netReturnDemo", label: "Net Return Demo" },
    { key: "bcrDemo", label: "BCR Demo" },
    { key: "grossCostCheck", label: "Gross Cost Check" },
    { key: "grossReturnCheck", label: "Gross Return Check" },
    { key: "netReturnCheck", label: "Net Return Check" },
    { key: "bcrCheck", label: "BCR Check" },
  ];

  const sorted = [...details].sort((a, b) => {
    const bySector = FLD_SECTOR_ORDER.indexOf(a.sector) - FLD_SECTOR_ORDER.indexOf(b.sector);
    if (bySector !== 0) return bySector;
    return a.thematicArea?.localeCompare(b.thematicArea ?? "") ?? 0;
  });

  const rows = sorted.map((d) => ({
    sector: d.sector,
    thematicArea: d.thematicArea ?? "",
    crop: d.cropOrItem,
    state: d.fld.kvk.state.name,
    demos: String(d.noOfDemonstrations),
    farmers: String(d.noOfFarmers),
    area: Number(d.areaHa).toFixed(2),
    yieldDemo: stringifyValue(d.yieldDemoQha),
    yieldCheck: stringifyValue(d.yieldCheckQha),
    percentIncrease: stringifyValue(d.percentIncrease),
    grossCostDemo: stringifyValue(d.grossCostDemo),
    grossReturnDemo: stringifyValue(d.grossReturnDemo),
    netReturnDemo: stringifyValue(d.netReturnDemo),
    bcrDemo: stringifyValue(d.bcrDemo),
    grossCostCheck: stringifyValue(d.grossCostCheck),
    grossReturnCheck: stringifyValue(d.grossReturnCheck),
    netReturnCheck: stringifyValue(d.netReturnCheck),
    bcrCheck: stringifyValue(d.bcrCheck),
  }));

  return { columns, rows };
}

/**
 * "2.7.A Swachhta hi Sewa" / "2.7.B Swachta Pakhwada" are two separate
 * tables in the real report (super-v2-prod.pdf p.41), not one combined
 * table distinguished by a "Kind" column - this schema already stores them
 * that way (SwachhtaObservance.kind), so this just filters by kind instead
 * of rendering kind as a column.
 */
function buildSwachhtaByKind(kind: "SEWA" | "PAKHWADA") {
  return async (scope: ReportScope) => {
    const fields = MODEL_FIELDS.swachhtaObservance.filter((f) => f !== "kind");
    const rows = await prisma.swachhtaObservance.findMany({
      where: { kind, ...(scope.kvkId ? { kvkId: scope.kvkId } : { zoneId: scope.zoneId }) },
      select: Object.fromEntries(fields.map((f) => [f, true])),
      take: 200,
    });
    const columns: ReportColumn[] = fields.map((key) => ({ key, label: humanize(key) }));
    const outRows = rows.map((r) => Object.fromEntries(fields.map((f) => [f, stringifyValue((r as Record<string, unknown>)[f])])));
    return { columns, rows: outRows };
  };
}

/**
 * Real, fixed row order for "3.6.A TSP Activities" / "3.6.B SCSP
 * Activities" (super-v2-prod.pdf p.75-76: "a. Achievements of physical
 * output under TSP/SCSP") - matches this app's own TSP/SCSP Activity
 * Master 1:1 (5 values: Trainings, OFT, FLD, "Mobile agro- advisory to
 * farmers", Other activities).
 */
const SUB_PLAN_ACTIVITY_ORDER = ["Trainings", "OFT", "FLD", "Mobile agro- advisory to farmers", "Other activities"];

/**
 * "3.6.A TSP Activities" / "3.6.B SCSP Activities" in the real report is a
 * Bihar/Jharkhand x fixed-Activity pivot ("No. of Trainings/Demos" and "No.
 * of Farmers" per activity) - not a flat dump of SubPlanActivity's own rows
 * (confirmed against the reference PDF directly). Uses the existing
 * type/activities/noOfTraining/beneficiaries fields, just grouped instead
 * of listed.
 */
function buildSubPlanByType(type: "TSP" | "SCSP") {
  return async (scope: ReportScope) => {
    const rows = await prisma.subPlanActivity.findMany({
      where: { type, ...(scope.kvkId ? { kvkId: scope.kvkId } : { zoneId: scope.zoneId }) },
      select: { activities: true, noOfTraining: true, beneficiaries: true, kvk: { select: { state: { select: { name: true } } } } },
    });
    const states = await prisma.state.findMany({ where: { zoneId: scope.zoneId }, orderBy: { name: "asc" } });
    const stateNames = states.map((s) => s.name);
    const allCols = [...stateNames, "Total"];

    const columns: ReportColumn[] = [
      { key: "activity", label: "Name of Activities" },
      ...allCols.flatMap((s) => [
        { key: `${s} demos`, label: `${s} - No. of Trainings/Demos` },
        { key: `${s} farmers`, label: `${s} - No. of Farmers` },
      ]),
    ];

    const outRows: Record<string, string>[] = [];
    const grand: Record<string, number> = Object.fromEntries(allCols.flatMap((s) => [[`${s} demos`, 0], [`${s} farmers`, 0]]));

    for (const activity of SUB_PLAN_ACTIVITY_ORDER) {
      const matching = rows.filter((r) => r.activities === activity);
      const row: Record<string, string> = { activity };
      for (const state of stateNames) {
        const inState = matching.filter((r) => r.kvk.state.name === state);
        const demos = inState.reduce((s, r) => s + r.noOfTraining, 0);
        const farmers = inState.reduce((s, r) => s + r.beneficiaries, 0);
        row[`${state} demos`] = String(demos);
        row[`${state} farmers`] = String(farmers);
        grand[`${state} demos`] += demos;
        grand[`${state} farmers`] += farmers;
      }
      const totalDemos = matching.reduce((s, r) => s + r.noOfTraining, 0);
      const totalFarmers = matching.reduce((s, r) => s + r.beneficiaries, 0);
      row["Total demos"] = String(totalDemos);
      row["Total farmers"] = String(totalFarmers);
      grand["Total demos"] += totalDemos;
      grand["Total farmers"] += totalFarmers;
      outRows.push(row);
    }

    const grandRow: Record<string, string> = { activity: "Grand Total" };
    for (const key of Object.keys(grand)) grandRow[key] = String(grand[key]);
    outRows.push(grandRow);

    return { columns, rows: outRows };
  };
}

/** Real, fixed row order for NARI's "3.7.A/B/C" State x Activity pivots (super-v2-prod.pdf p.76-77) - matches this app's own NARI Activity Master 1:1 (OFT, FLD, Not Specified). */
const NARI_ACTIVITY_ORDER = ["OFT", "FLD", "Not Specified"];

/**
 * "3.7.A Nutrition Garden" / "3.7.B Bio-fortified Crops" / "3.7.C Value
 * Addition" in the real report are all the same shape: Bihar/Jharkhand/
 * Total x Activity(OFT/FLD/Not Specified), each with a count column (No.
 * of Gardens/Crops/Products) plus Male/Female/Total - confirmed directly
 * against the reference PDF, not a flat dump of each model's own rows.
 * `countField`/`countLabel` are the one thing that differs per model.
 */
function buildNariByActivity(
  model: "nariNutritionGarden" | "nariBioFortified" | "nariValueAddition" | "nariTraining" | "nariExtension",
  countField: "numbers" | "numberOfCrops" | "numberOfProducts" | "numberOfCourses" | "noOfActivities",
  countLabel: string,
) {
  return async (scope: ReportScope) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegate = (prisma as any)[model];
    const rows: { activity: string; count: number; male: number; female: number; kvk: { state: { name: string } } }[] =
      await delegate.findMany({
        where: scope.kvkId ? { kvkId: scope.kvkId } : { zoneId: scope.zoneId },
        select: { activity: true, [countField]: true, male: true, female: true, kvk: { select: { state: { select: { name: true } } } } },
      }).then((rs: Record<string, unknown>[]) =>
        rs.map((r) => ({ activity: String(r.activity), count: Number(r[countField]), male: Number(r.male), female: Number(r.female), kvk: r.kvk as { state: { name: string } } })),
      );
    const states = await prisma.state.findMany({ where: { zoneId: scope.zoneId }, orderBy: { name: "asc" } });
    const stateNames = states.map((s) => s.name);
    const allCols = [...stateNames, "Total"];

    const columns: ReportColumn[] = [
      { key: "activity", label: "Activity" },
      ...allCols.flatMap((s) => [
        { key: `${s} count`, label: `${s} - ${countLabel}` },
        { key: `${s} male`, label: `${s} - Male` },
        { key: `${s} female`, label: `${s} - Female` },
        { key: `${s} total`, label: `${s} - Total` },
      ]),
    ];

    const outRows: Record<string, string>[] = [];
    const grand: Record<string, number> = Object.fromEntries(
      allCols.flatMap((s) => [[`${s} count`, 0], [`${s} male`, 0], [`${s} female`, 0], [`${s} total`, 0]]),
    );

    for (const activity of NARI_ACTIVITY_ORDER) {
      const matching = rows.filter((r) => r.activity === activity);
      const row: Record<string, string> = { activity };
      for (const state of stateNames) {
        const inState = matching.filter((r) => r.kvk.state.name === state);
        const count = inState.reduce((s, r) => s + r.count, 0);
        const male = inState.reduce((s, r) => s + r.male, 0);
        const female = inState.reduce((s, r) => s + r.female, 0);
        row[`${state} count`] = String(count);
        row[`${state} male`] = String(male);
        row[`${state} female`] = String(female);
        row[`${state} total`] = String(male + female);
        grand[`${state} count`] += count;
        grand[`${state} male`] += male;
        grand[`${state} female`] += female;
        grand[`${state} total`] += male + female;
      }
      const totalCount = matching.reduce((s, r) => s + r.count, 0);
      const totalMale = matching.reduce((s, r) => s + r.male, 0);
      const totalFemale = matching.reduce((s, r) => s + r.female, 0);
      row["Total count"] = String(totalCount);
      row["Total male"] = String(totalMale);
      row["Total female"] = String(totalFemale);
      row["Total total"] = String(totalMale + totalFemale);
      grand["Total count"] += totalCount;
      grand["Total male"] += totalMale;
      grand["Total female"] += totalFemale;
      grand["Total total"] += totalMale + totalFemale;
      outRows.push(row);
    }

    const grandRow: Record<string, string> = { activity: "Grand Total" };
    for (const key of Object.keys(grand)) grandRow[key] = String(grand[key]);
    outRows.push(grandRow);

    return { columns, rows: outRows };
  };
}

type Sub = { num: string; title: string; items: Entry[] };
type Sec = { num: string; title: string; subs: Sub[] };

/** The exact section/subsection/table tree from the client's real "ATARI AMS REPORT" export (super-v2-prod.pdf), in TOC order. */
/** Shared between both report variants - identical in both the 93pg (Super Admin) and 50pg (KVK-scoped) real source PDFs' TOCs. */
const PROJECTS_SECTION: Sec = {
    num: "3", title: "PROJECTS", subs: [
      { num: "3.1", title: "CFLD", items: [
        { code: "3.1.A", title: "Technical Parameter", model: "cfldTechnicalParameter", scope: "direct" },
        { code: "3.1.B", title: "Extension Activity", model: "cfldExtensionActivity", scope: "direct" },
        { code: "3.1.C", title: "Budget Utilization", model: "cfldBudgetUtilization", scope: "direct" },
      ]},
      { num: "3.2", title: "NICRA", items: [
        { code: "3.2.A", title: "Basic Information", model: "nicraBasicInformation", scope: "direct" },
        { code: "3.2.B", title: "Details", model: "nicraDetails", scope: "direct" },
        { code: "3.2.C", title: "Training", model: "nicraTraining", scope: "direct" },
        { code: "3.2.D", title: "Extension Activity", model: "nicraExtensionActivity", scope: "direct" },
      ]},
      { num: "3.3", title: "NICRA Others", items: [
        { code: "3.3.A", title: "Intervention", model: "nicraIntervention", scope: "direct" },
        { code: "3.3.B", title: "Revenue Generated", model: "nicraRevenueGenerated", scope: "direct" },
        { code: "3.3.C", title: "Custom Hiring", model: "nicraCustomHiringFarmImplement", scope: "direct" },
        { code: "3.3.D", title: "VCRMC", model: "nicraVillageWiseVcrmc", scope: "direct" },
        { code: "3.3.E", title: "Soil Health Card", model: "nicraSoilHealthCard", scope: "direct" },
        { code: "3.3.F", title: "Convergence Programme", model: "nicraConvergenceProgramme", scope: "direct" },
        { code: "3.3.G", title: "Dignitaries Visited", model: "nicraDignitaryVisit", scope: "direct" },
        { code: "3.3.H", title: "PI/Co-PI List", model: "nicraPiCoPi", scope: "direct" },
      ]},
      { num: "3.4", title: "ARYA / SARAL", items: [
        { code: "3.4.A", title: "Current Year Details", model: "aryaCurrentYearDetail", scope: "direct" },
        { code: "3.4.B", title: "Previous Year Evaluation", model: "aryaPreviousYearEvaluation", scope: "direct" },
      ]},
      { num: "3.5", title: "Natural Farming", items: [
        { code: "3.5.A", title: "Geographical Information", model: "nfGeographicalInfo", scope: "direct" },
        { code: "3.5.B", title: "Physical Information", model: "nfPhysicalInfo", scope: "direct" },
        { code: "3.5.C", title: "Demonstration Information", model: "nfDemonstrationInfo", scope: "direct" },
        { code: "3.5.D", title: "Farmers Practicing", model: "nfAlreadyPracticing", scope: "direct" },
        { code: "3.5.E", title: "Beneficiaries", model: "nfBeneficiary", scope: "direct" },
        { code: "3.5.F", title: "Soil Data", model: "nfSoilData", scope: "direct" },
        { code: "3.5.G", title: "Budget Expenditure", model: "nfBudgetExpenditure", scope: "direct" },
      ]},
      { num: "3.6", title: "TSP/SCSP", items: [
        { code: "3.6.A", title: "TSP Activities", model: "subPlanActivity", scope: "direct", custom: buildSubPlanByType("TSP") },
        { code: "3.6.B", title: "SCSP Activities", model: "subPlanActivity", scope: "direct", custom: buildSubPlanByType("SCSP") },
      ]},
      { num: "3.7", title: "NARI", items: [
        { code: "3.7.A", title: "Nutrition Garden", model: "nariNutritionGarden", scope: "direct", custom: buildNariByActivity("nariNutritionGarden", "numbers", "No. of Gardens") },
        { code: "3.7.B", title: "Bio-fortified Crops", model: "nariBioFortified", scope: "direct", custom: buildNariByActivity("nariBioFortified", "numberOfCrops", "No. of Crops") },
        { code: "3.7.C", title: "Value Addition", model: "nariValueAddition", scope: "direct", custom: buildNariByActivity("nariValueAddition", "numberOfProducts", "No. of Products") },
        { code: "3.7.D", title: "Training Program", model: "nariTraining", scope: "direct", custom: buildNariByActivity("nariTraining", "numberOfCourses", "No. of Courses") },
        { code: "3.7.E", title: "Extension Activities", model: "nariExtension", scope: "direct", custom: buildNariByActivity("nariExtension", "noOfActivities", "No. of Activities") },
      ]},
      { num: "3.8", title: "Agri-Drone", items: [
        { code: "3.8.A", title: "Introduction", model: "agriDroneIntroduction", scope: "direct" },
        { code: "3.8.B", title: "Demonstration", model: "agriDroneDemonstration", scope: "direct" },
      ]},
      { num: "3.9", title: "FPO and CBBO", items: [
        { code: "3.9.A", title: "Details FPO and CBBO", model: "fpoCbboDetail", scope: "direct" },
        { code: "3.9.B", title: "FPO Management", model: "fpoManagement", scope: "direct" },
      ]},
      { num: "3.10", title: "DRMR", items: [
        { code: "3.10.A", title: "DRMR Details", model: "drmrDetail", scope: "direct" },
        { code: "3.10.B", title: "DRMR Activity", model: "drmrActivity", scope: "direct" },
      ]},
      { num: "3.11", title: "Climate Resilient Agriculture (CRA)", items: [
        { code: "3.11.A", title: "CRA Details", model: "craDetail", scope: "direct" },
        { code: "3.11.B", title: "Extension Activity", model: "craExtensionActivity", scope: "direct" },
      ]},
      { num: "3.12", title: "CSISA", items: [
        { code: "3.12.A", title: "CSISA", model: "csisaDetail", scope: "direct" },
      ]},
      { num: "3.13", title: "Seed Hub Program", items: [
        { code: "3.13.A", title: "Seed Hub Program", model: "seedHubProgram", scope: "direct" },
      ]},
      { num: "3.14", title: "Other Programmes", items: [
        { code: "3.14.A", title: "Other Programmes", model: "otherProgramme", scope: "direct" },
      ]},
    ],
};

const MEETINGS_SECTION: Sec = {
    num: "6", title: "MEETINGS", subs: [
      { num: "6.1", title: "SAC Meetings", items: [
        { code: "6.1", title: "SAC Meetings", model: "sacMeeting", scope: "direct" },
      ]},
      { num: "6.2", title: "Other Meetings", items: [
        { code: "6.2", title: "Other Meetings", model: "otherMeeting", scope: "direct" },
      ]},
    ],
};

/**
 * Two real, distinct section trees - the client's own 93pg "Super Admin"
 * export (all KVKs) and 50pg "KVK Report" export (one KVK) use different
 * numbering in several places, confirmed by diffing both source PDFs' own
 * Tables of Contents line by line (not assumed to be the same document at
 * two scopes). Sections 3 (PROJECTS) and 6 (MEETINGS) are identical between
 * them - only 1/2/4/5 diverge. Where a real code exists in the source PDF
 * but this app has no distinct backing data for it (e.g. KVK-report's
 * "2.3.B FLD Details" has no separate model from "2.3.A FLD Summary" -
 * same for Super Admin's "2.2.B/C State Wise / KVK Wise OFT Details"),
 * the code is skipped entirely rather than renumbered or duplicated - so a
 * later session that finds real distinct data for it can slot the exact
 * letter back in without shifting every later item.
 */
const SUPER_ADMIN_TREE: Sec[] = [
  {
    num: "1", title: "ABOUT KVK", subs: [
      { num: "1.1", title: "Basic Information", items: [
        { code: "1.1.A", title: "KVKs Details", model: "kvk", scope: "direct" },
        { code: "1.1.B", title: "Bank Account Details", model: "bankAccount", scope: "direct" },
      ]},
      { num: "1.2", title: "Employee Information", items: [
        { code: "1.2.A", title: "All KVK Staff", model: "staff", scope: "direct" },
        { code: "1.2.B", title: "Staff Transferred", model: "staffTransfer", scope: { via: "toKvk" } },
      ]},
      { num: "1.3", title: "Land & Infrastructure Information", items: [
        { code: "1.3.A", title: "Infrastructure Details", model: "infrastructure", scope: "direct" },
        { code: "1.3.B", title: "Land Details", model: "land", scope: "direct" },
        { code: "1.3.C", title: "Staff Quarters Details", model: "staffQuarters", scope: "direct" },
      ]},
      { num: "1.4", title: "Vehicles Information", items: [
        { code: "1.4.A", title: "Vehicles Details", model: "vehicle", scope: "direct" },
        { code: "1.4.B", title: "Vehicle Status", model: "vehicleStatus", scope: { via: "vehicle" } },
      ]},
      { num: "1.5", title: "Equipments Information", items: [
        { code: "1.5.A", title: "Equipments Details", model: "equipment", scope: "direct" },
        { code: "1.5.B", title: "Equipment Status", model: "equipmentStatus", scope: { via: "equipment" } },
      ]},
    ],
  },
  {
    num: "2", title: "ACHIEVEMENTS", subs: [
      { num: "2.1", title: "Technical Achievement", items: [
        { code: "2.1.A", title: "Technical Achievement Summary", model: "technicalAchievementSummaryEntry", scope: "direct" },
      ]},
      { num: "2.2", title: "On Farm Trial", items: [
        { code: "2.2.A", title: "OFT Summary", model: "oft", scope: "direct", custom: buildOftTechnologySummary },
        { code: "2.2.B", title: "State Wise OFT Details", model: "oft", scope: "direct", custom: buildOftStateWiseDetails },
        { code: "2.2.C", title: "KVK Wise OFT Details", model: "oft", scope: "direct", custom: buildOftKvkWiseDetails },
      ]},
      { num: "2.3", title: "Front Line Demonstration", items: [
        { code: "2.3.A", title: "FLD Summary", model: "fld", scope: "direct", custom: buildFldSectorSummary },
        { code: "2.3.B", title: "State Wise FLD Details", model: "fld", scope: "direct", custom: buildFldStateWiseDetails },
        { code: "2.3.C", title: "FLD Details", model: "fld", scope: "direct", custom: buildFldDetailsBySector },
        { code: "2.3.D", title: "Extension & Training activities under FLD", model: "fldExtensionTraining", scope: { via: "fld" } },
        { code: "2.3.E", title: "Technical Feedback on FLD", model: "fldTechnicalFeedback", scope: { via: "fld" } },
      ]},
      { num: "2.4", title: "Training", items: [
        { code: "2.4.A", title: "Trainings", model: "training", scope: "direct" },
      ]},
      { num: "2.5", title: "Extension", items: [
        { code: "2.5.A", title: "Extension Activities", model: "extensionActivity", scope: "direct" },
        { code: "2.5.B", title: "Other Extension Activities", model: "otherExtensionActivity", scope: "direct" },
      ]},
      { num: "2.6", title: "Special Days", items: [
        { code: "2.6.A", title: "Technology Week", model: "technologyWeekCelebration", scope: "direct" },
        { code: "2.6.B", title: "Celebration Days", model: "celebrationDay", scope: "direct" },
        { code: "2.6.C", title: "World Soil Day", model: "worldSoilDay", scope: "direct" },
        { code: "2.6.D", title: "Poshan Maah", model: "poshanMaaha", scope: "direct" },
      ]},
      { num: "2.7", title: "Swacha Bharat Abhiyan", items: [
        { code: "2.7.A", title: "Swachhta hi Sewa", model: "swachhtaObservance", scope: "direct", custom: buildSwachhtaByKind("SEWA") },
        { code: "2.7.B", title: "Swachta Pakhwada", model: "swachhtaObservance", scope: "direct", custom: buildSwachhtaByKind("PAKHWADA") },
        { code: "2.7.C", title: "Budget Expenditure", model: "swachhtaBudgetExpenditure", scope: "direct" },
      ]},
      { num: "2.8", title: "Production & Supply", items: [
        { code: "2.8.A", title: "Production and Supply", model: "technologyProductProduction", scope: "direct" },
      ]},
      { num: "2.9", title: "Soil and Water Testing", items: [
        { code: "2.9.A", title: "Analysis Details", model: "soilWaterPlantAnalysis", scope: "direct" },
      ]},
      { num: "2.10", title: "Publications", items: [
        { code: "2.10.A", title: "Publications", model: "publication", scope: "direct" },
      ]},
      { num: "2.11", title: "Human Resources Development", items: [
        { code: "2.11.A", title: "Human Resources Development", model: "humanResourceDevelopment", scope: "direct" },
      ]},
      { num: "2.12", title: "Award and Recognition", items: [
        { code: "2.12.A", title: "KVK Awards", model: "kvkAward", scope: "direct" },
        { code: "2.12.B", title: "Scientist Awards", model: "scientistAward", scope: "direct" },
        { code: "2.12.C", title: "Farmer Awards", model: "farmerAward", scope: "direct" },
      ]},
    ],
  },
  PROJECTS_SECTION,
  {
    num: "4", title: "PERFORMANCE", subs: [
      { num: "4.1", title: "Impact", items: [
        { code: "4.1.A", title: "Impact of KVK activities", model: "kvkActivityImpact", scope: "direct" },
        { code: "4.1.B", title: "Entrepreneurship", model: "entrepreneurshipDetail", scope: "direct" },
        { code: "4.1.C", title: "Success Stories", model: "successStory", scope: "direct" },
      ]},
      { num: "4.2", title: "District and Village Performance", items: [
        { code: "4.2.A", title: "District Level Data", model: "districtLevelData", scope: "direct" },
        { code: "4.2.A.1", title: "Productivity of Major Crops", model: "districtCropProductivity", scope: "direct" },
        { code: "4.2.A.2", title: "Production of Major Livestock Products", model: "districtLivestockProduction", scope: "direct" },
        { code: "4.2.B", title: "Operational Area Details", model: "operationalAreaDetail", scope: "direct" },
        { code: "4.2.C", title: "Village Adoption Programme", model: "villageAdoptionProgramme", scope: "direct" },
        { code: "4.2.D", title: "Priority Thrust Area", model: "priorityThrustArea", scope: "direct" },
      ]},
      { num: "4.3", title: "Infrastructure Performance", items: [
        { code: "4.3.A", title: "Demonstration Units", model: "demonstrationUnit", scope: "direct" },
        { code: "4.3.B", title: "Instructional Farm (crops)", model: "instructionalFarmCrop", scope: "direct" },
        { code: "4.3.C", title: "Production Units", model: "productionUnit", scope: "direct" },
        { code: "4.3.D", title: "Instructional Farm (livestock)", model: "instructionalFarmLivestock", scope: "direct" },
        { code: "4.3.E", title: "Hostel Facilities", model: "hostelUtilization", scope: "direct" },
        { code: "4.3.F", title: "Rain Water Harvesting", model: "rainWaterHarvesting", scope: "direct" },
      ]},
      { num: "4.4", title: "Financial Performance", items: [
        { code: "4.4.A", title: "Budget Details", model: "budgetDetail", scope: "direct" },
        { code: "4.4.B", title: "Project-wise Budget Details", model: "projectWiseBudgetPerformance", scope: "direct" },
        { code: "4.4.C", title: "Status of revolving fund", model: "revolvingFund", scope: "direct" },
        { code: "4.4.D", title: "Revenue generation", model: "revenueGeneration", scope: "direct" },
        { code: "4.4.E", title: "Resource Generation", model: "resourceGeneration", scope: "direct" },
      ]},
      { num: "4.5", title: "Linkages", items: [
        { code: "4.5.A", title: "Functional Linkage with Different Organizations", model: "functionalLinkage", scope: "direct" },
      ]},
    ],
  },
  {
    num: "5", title: "MISCELLANEOUS", subs: [
      { num: "5.1", title: "Prevalent Diseases", items: [
        { code: "5.1.A", title: "Prevalent diseases in Crops", model: "prevalentDiseaseCrop", scope: "direct" },
        { code: "5.1.B", title: "Prevalent diseases in Livestock/Fishery", model: "prevalentDiseaseLivestock", scope: "direct" },
      ]},
      { num: "5.2", title: "PPV & FRA Sensitization", items: [
        { code: "5.2.A", title: "Training & Awareness Program", model: "ppvFraTrainingProgramme", scope: "direct" },
        { code: "5.2.B", title: "Details of Plant Varieties", model: "ppvFraFarmerDetail", scope: "direct" },
      ]},
      { num: "5.3", title: "Digital Information", items: [
        { code: "5.3.A", title: "RAWE/FET programme", model: "raweFetFitProgramme", scope: "direct" },
        { code: "5.3.B", title: "List of VIP visitors", model: "vipVisitor", scope: "direct" },
        { code: "5.3.C", title: "Details of Mobile App", model: "digitalMobileApp", scope: "direct" },
        { code: "5.3.D", title: "Details of Web Portal", model: "digitalWebPortal", scope: "direct" },
        { code: "5.3.E", title: "Details of Kisan Sarathi", model: "digitalKisanSarathi", scope: "direct" },
        { code: "5.3.F", title: "Kisan Mobile Advisory Services/KMAS", model: "digitalKmas", scope: "direct" },
        { code: "5.3.G", title: "Details of messages sent through other channels", model: "digitalOtherChannel", scope: "direct" },
      ]},
    ],
  },
  MEETINGS_SECTION,
];

/** Diverges from SUPER_ADMIN_TREE in sections 1/2/4/5 only - confirmed against kvk-report-202607270504.pdf's own TOC. */
const KVK_TREE: Sec[] = [
  {
    num: "1", title: "ABOUT KVK", subs: [
      { num: "1.1", title: "Basic Information", items: [
        { code: "1.1.A", title: "KVKs Details", model: "kvk", scope: "direct" },
        { code: "1.1.B", title: "Bank Account Details", model: "bankAccount", scope: "direct" },
      ]},
      { num: "1.2", title: "Employee Information", items: [
        { code: "1.2.A", title: "All KVK Staff", model: "staff", scope: "direct" },
        { code: "1.2.B", title: "Staff Transferred", model: "staffTransfer", scope: { via: "toKvk" } },
      ]},
      { num: "1.3", title: "Infrastructure Information", items: [
        { code: "1.3.A", title: "Infrastructure Details", model: "infrastructure", scope: "direct" },
        { code: "1.3.B", title: "Staff Quarters Details", model: "staffQuarters", scope: "direct" },
      ]},
      { num: "1.4", title: "Vehicles Information", items: [
        { code: "1.4.A", title: "Vehicles Details", model: "vehicle", scope: "direct" },
        { code: "1.4.B", title: "Vehicle Status", model: "vehicleStatus", scope: { via: "vehicle" } },
      ]},
      { num: "1.5", title: "Equipments Information", items: [
        { code: "1.5.A", title: "Equipments Details", model: "equipment", scope: "direct" },
        { code: "1.5.B", title: "Equipment Status", model: "equipmentStatus", scope: { via: "equipment" } },
      ]},
    ],
  },
  {
    num: "2", title: "ACHIEVEMENTS", subs: [
      { num: "2.1", title: "Technical Achievement", items: [
        { code: "2.1.A", title: "Technical Achievement Summary", model: "technicalAchievementSummaryEntry", scope: "direct" },
      ]},
      { num: "2.2", title: "On Farm Trial", items: [
        { code: "2.2.A", title: "OFT Summary", model: "oft", scope: "direct", custom: buildOftTechnologySummary },
        { code: "2.2.B", title: "KVK Wise OFT Details", model: "oft", scope: "direct", custom: buildOftKvkWiseDetails },
      ]},
      { num: "2.3", title: "Front Line Demonstration", items: [
        { code: "2.3.A", title: "FLD Summary", model: "fld", scope: "direct", custom: buildFldSectorSummary },
        { code: "2.3.B", title: "FLD Details", model: "fld", scope: "direct", custom: buildFldDetailsBySector },
        { code: "2.3.C", title: "Extension & Training activities under FLD", model: "fldExtensionTraining", scope: { via: "fld" } },
        { code: "2.3.D", title: "Technical Feedback on FLD", model: "fldTechnicalFeedback", scope: { via: "fld" } },
      ]},
      { num: "2.4", title: "Training", items: [
        { code: "2.4.A", title: "Trainings", model: "training", scope: "direct" },
      ]},
      { num: "2.5", title: "Extension", items: [
        { code: "2.5.A", title: "Extension Activities", model: "extensionActivity", scope: "direct" },
        { code: "2.5.B", title: "Other Extension Activities", model: "otherExtensionActivity", scope: "direct" },
      ]},
      { num: "2.6", title: "Special Days", items: [
        { code: "2.6.A", title: "Technology Week", model: "technologyWeekCelebration", scope: "direct" },
        { code: "2.6.B", title: "Important Events", model: "celebrationDay", scope: "direct" },
        { code: "2.6.C", title: "World Soil Day", model: "worldSoilDay", scope: "direct" },
        { code: "2.6.D", title: "Poshan Maah", model: "poshanMaaha", scope: "direct" },
      ]},
      { num: "2.7", title: "Swacha Bharat Abhiyan", items: [
        { code: "2.7.A", title: "Swachhta hi Sewa", model: "swachhtaObservance", scope: "direct", custom: buildSwachhtaByKind("SEWA") },
        { code: "2.7.B", title: "Swachta Pakhwada", model: "swachhtaObservance", scope: "direct", custom: buildSwachhtaByKind("PAKHWADA") },
        { code: "2.7.C", title: "Budget Expenditure", model: "swachhtaBudgetExpenditure", scope: "direct" },
      ]},
      { num: "2.8", title: "Production & Supply", items: [
        { code: "2.8.A", title: "Production and Supply", model: "technologyProductProduction", scope: "direct" },
      ]},
      { num: "2.9", title: "Soil and Water Testing", items: [
        { code: "2.9.A", title: "Analysis Details", model: "soilWaterPlantAnalysis", scope: "direct" },
      ]},
      { num: "2.10", title: "Publications", items: [
        { code: "2.10.A", title: "Publications", model: "publication", scope: "direct" },
      ]},
      { num: "2.11", title: "Human Resources Development", items: [
        { code: "2.11.A", title: "Human Resources Development", model: "humanResourceDevelopment", scope: "direct" },
      ]},
      { num: "2.12", title: "Award and Recognition", items: [
        { code: "2.12.A", title: "KVK Awards", model: "kvkAward", scope: "direct" },
        { code: "2.12.B", title: "Scientist Awards", model: "scientistAward", scope: "direct" },
        { code: "2.12.C", title: "Farmer Awards", model: "farmerAward", scope: "direct" },
      ]},
    ],
  },
  PROJECTS_SECTION,
  {
    num: "4", title: "PERFORMANCE", subs: [
      { num: "4.1", title: "Impact", items: [
        { code: "4.1.A", title: "Impact of KVK activities", model: "kvkActivityImpact", scope: "direct" },
        { code: "4.1.B", title: "Entrepreneurship", model: "entrepreneurshipDetail", scope: "direct" },
        { code: "4.1.C", title: "Success Stories", model: "successStory", scope: "direct" },
      ]},
      { num: "4.2", title: "District and Village Performance", items: [
        { code: "4.2.A", title: "District Level Data", model: "districtLevelData", scope: "direct" },
        { code: "4.2.A.1", title: "Productivity of Major Crops", model: "districtCropProductivity", scope: "direct" },
        { code: "4.2.A.2", title: "Production of Major Livestock Products", model: "districtLivestockProduction", scope: "direct" },
        { code: "4.2.B", title: "Operational Area Details", model: "operationalAreaDetail", scope: "direct" },
        { code: "4.2.C", title: "Village Adoption Programme", model: "villageAdoptionProgramme", scope: "direct" },
        { code: "4.2.D", title: "Priority Thrust Area", model: "priorityThrustArea", scope: "direct" },
        { code: "4.2.E", title: "Prevalent diseases in Crops", model: "prevalentDiseaseCrop", scope: "direct" },
        { code: "4.2.F", title: "Prevalent diseases in Livestock/Fishery", model: "prevalentDiseaseLivestock", scope: "direct" },
      ]},
      { num: "4.3", title: "Infrastructure Performance", items: [
        { code: "4.3.A", title: "Demonstration Units", model: "demonstrationUnit", scope: "direct" },
        { code: "4.3.B", title: "Instructional Farm (crops)", model: "instructionalFarmCrop", scope: "direct" },
        { code: "4.3.C", title: "Production Units", model: "productionUnit", scope: "direct" },
        { code: "4.3.D", title: "Instructional Farm (livestock)", model: "instructionalFarmLivestock", scope: "direct" },
        { code: "4.3.E", title: "Hostel Facilities", model: "hostelUtilization", scope: "direct" },
        { code: "4.3.F", title: "Rain Water Harvesting", model: "rainWaterHarvesting", scope: "direct" },
      ]},
      { num: "4.4", title: "Financial Performance", items: [
        { code: "4.4.A", title: "Budget Details", model: "budgetDetail", scope: "direct" },
        { code: "4.4.B", title: "Project-wise Budget Details", model: "projectWiseBudgetPerformance", scope: "direct" },
        { code: "4.4.C", title: "Status of revolving fund", model: "revolvingFund", scope: "direct" },
        { code: "4.4.D", title: "Revenue generation", model: "revenueGeneration", scope: "direct" },
        { code: "4.4.E", title: "Resource Generation", model: "resourceGeneration", scope: "direct" },
      ]},
      { num: "4.5", title: "Linkages", items: [
        { code: "4.5.A", title: "Functional Linkage with Different Organizations", model: "functionalLinkage", scope: "direct" },
      ]},
    ],
  },
  {
    num: "5", title: "MISCELLANEOUS", subs: [
      { num: "5.1", title: "PPV & FRA Sensitization", items: [
        { code: "5.1.A", title: "Training & Awareness Program", model: "ppvFraTrainingProgramme", scope: "direct" },
        { code: "5.1.B", title: "Details of Plant Varieties", model: "ppvFraFarmerDetail", scope: "direct" },
      ]},
      { num: "5.2", title: "RAWE/FET & VIP Visitors", items: [
        { code: "5.2.A", title: "RAWE/FET programme", model: "raweFetFitProgramme", scope: "direct" },
        { code: "5.2.B", title: "List of VIP visitors", model: "vipVisitor", scope: "direct" },
      ]},
      { num: "5.3", title: "Digital Information", items: [
        { code: "5.3.A", title: "Details of Mobile App", model: "digitalMobileApp", scope: "direct" },
        { code: "5.3.B", title: "Details of Web Portal", model: "digitalWebPortal", scope: "direct" },
        { code: "5.3.C", title: "Details of Kisan Sarathi", model: "digitalKisanSarathi", scope: "direct" },
        { code: "5.3.D", title: "Kisan Mobile Advisory Services/KMAS", model: "digitalKmas", scope: "direct" },
        { code: "5.3.E", title: "Details of messages sent through other channels", model: "digitalOtherChannel", scope: "direct" },
      ]},
    ],
  },
  MEETINGS_SECTION,
];

function whereFor(entry: Entry, scope: ReportScope): Record<string, unknown> {
  if (entry.model === "kvk") return scope.kvkId ? { id: scope.kvkId } : { zoneId: scope.zoneId };
  const base = scope.kvkId ? { kvkId: scope.kvkId } : { zoneId: scope.zoneId };
  if (entry.scope === "direct") return base;
  return scope.kvkId ? { [entry.scope.via]: { kvkId: scope.kvkId } } : { zoneId: scope.zoneId };
}

async function fetchTable(entry: Entry, scope: ReportScope): Promise<ReportTable> {
  if (entry.custom) {
    try {
      const { columns, rows } = await entry.custom(scope);
      return { code: entry.code, title: entry.title, columns, rows };
    } catch {
      return { code: entry.code, title: entry.title, columns: [], rows: [] };
    }
  }
  const fields = MODEL_FIELDS[entry.model] ?? [];
  const columns: ReportColumn[] = fields.map((key) => ({ key, label: humanize(key) }));
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegate = (prisma as any)[entry.model];
    const rawRows: Record<string, unknown>[] = await delegate.findMany({
      where: whereFor(entry, scope),
      select: Object.fromEntries(fields.map((f) => [f, true])),
      take: 200,
    });
    const rows = rawRows.map((r) => Object.fromEntries(fields.map((f) => [f, stringifyValue(r[f])])));
    return { code: entry.code, title: entry.title, columns, rows };
  } catch {
    return { code: entry.code, title: entry.title, columns, rows: [] };
  }
}

/**
 * All ~105 tables across every section/subsection are independent - fire
 * every query at once rather than section-by-section, since Promise.all
 * inside a sequential for-loop would otherwise still serialize
 * subsection-to-subsection. Uses the KVK_TREE numbering whenever the report
 * is scoped to exactly one KVK (matches the real 50pg "kvk-report" export's
 * own numbering), SUPER_ADMIN_TREE otherwise (the real 93pg "all data"
 * export's numbering) - the same split the client's own two source PDFs use.
 */
export async function buildReportSections(scope: ReportScope): Promise<ReportSection[]> {
  const tree = scope.kvkId ? KVK_TREE : SUPER_ADMIN_TREE;
  const allEntries: { entry: Entry; secIdx: number; subIdx: number }[] = [];
  tree.forEach((sec, secIdx) =>
    sec.subs.forEach((sub, subIdx) => sub.items.forEach((entry) => allEntries.push({ entry, secIdx, subIdx }))),
  );

  const allTables = await Promise.all(allEntries.map(({ entry }) => fetchTable(entry, scope)));

  return tree.map((sec, secIdx) => ({
    num: sec.num,
    title: sec.title,
    subsections: sec.subs.map((sub, subIdx) => ({
      num: sub.num,
      title: sub.title,
      tables: allTables.filter((_, i) => allEntries[i].secIdx === secIdx && allEntries[i].subIdx === subIdx),
    })),
  }));
}
