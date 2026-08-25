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
  oft: ["reportingYear", "discipline", "staff", "thematicArea", "trialOnForm", "problemDiagnosed", "sourceOfTechnology", "productionSystem", "performanceIndicators", "finalRecommendation", "constraintsIdentified", "farmersParticipationProcess", "quantity", "unit", "noOfTrialReplicationFarmer", "startMonth", "endMonth", "criticalInput", "costOfOft", "fundingAgency", "resultSummary", "status"],
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
  nfDemonstrationInfo: ["farmerName", "activityName", "crop", "variety"],
  nfAlreadyPracticing: ["farmerName", "address", "normalCropsGrown", "practicingYear"],
  nfBeneficiary: ["numberOfBlock", "numberOfVillage", "numberOfTraining", "farmersInfluenced"],
  nfSoilData: ["season", "type", "crop", "beforePh", "beforeEc", "beforeEcOc", "afterPh", "afterEc", "afterEcOc"],
  nfBudgetExpenditure: ["activityName", "activitiesOrganised", "budgetSanction", "budgetExpenditure", "totalBudgetExpenditure"],
  subPlanActivity: ["type", "activities", "noOfTraining", "beneficiaries"],
  nariNutritionGarden: ["nutriSmartVillage", "typeOfNutritionalGarden", "numbers", "areaSqm"],
  nariBioFortified: ["nutriSmartVillage", "season", "activity", "categoryOfCrop"],
  nariValueAddition: ["nutriSmartVillage", "cropName", "valueAddedProduct", "activity"],
  nariTraining: ["nutriSmartVillage", "areaOfTraining", "activity", "titleOfTraining"],
  nariExtension: ["nutriSmartVillage", "activity", "nameOfActivity", "noOfActivities"],
  agriDroneIntroduction: ["year", "centreName", "companyOfDrone", "modelOfDrone", "dronesSanctioned", "dronesPurchased", "amountSanctioned"],
  agriDroneDemonstration: ["centreName", "district", "dateOfDemos", "placeOfDemos", "cropName", "noOfDemos", "areaCovered", "noOfFarmers"],
  fpoCbboDetail: ["noOfBlocksAllocated", "noOfFposRegistered", "trainingReceived", "businessPlanPrepared", "noOfFposDoingBusiness"],
  fpoManagement: ["registrationNo", "dateOfRegistration", "fpoName", "fpoAddress", "totalBomMembers", "financialPosition"],
  drmrDetail: ["varietiesUsedInIp", "situations", "varietiesUsedInFp", "netReturnImprovedPractice", "netReturnFarmerPractice"],
  drmrActivity: ["startDate", "endDate", "training", "flds", "awarenessCamps", "distributionOfLiterature"],
  craDetail: ["season", "technologyDemonstrated", "croppingSystem", "areaHa", "noOfFarmer"],
  craExtensionActivity: ["extensionActivity", "startDate", "endDate", "withinOrWithoutState", "exposureVisits", "farmersUnderExposure"],
  csisaDetail: ["season", "villageCovered", "blockCovered", "districtCovered"],
  seedHubProgram: ["season", "cropName", "variety", "areaHa", "yieldHa"],
  otherProgramme: ["programmeName", "programmeDate", "venue", "purpose", "participants"],
  kvkActivityImpact: ["specificArea", "briefDetails", "farmersBenefitted", "horizontalSpread", "adoptionPercent"],
  entrepreneurshipDetail: ["entrepreneurOrEnterprise", "enterpriseType", "membersAssociated", "annualIncome"],
  successStory: ["farmerOrEntrepreneur", "experience", "majorAchievement", "storyTitle"],
  districtLevelData: ["reportingYear", "items", "information"],
  operationalAreaDetail: ["reportingYear", "taluk", "block", "village", "majorCrops", "majorProblems", "thrustAreas"],
  villageAdoptionProgramme: ["reportingYear", "village", "block", "actionTaken"],
  priorityThrustArea: ["reportingYear", "thrustArea"],
  demonstrationUnit: ["demoUnitName", "yearOfEstt", "areaSqMt"],
  instructionalFarmCrop: ["cropName", "areaHa"],
  productionUnit: ["productName", "qty"],
  instructionalFarmLivestock: ["animalName", "speciesBreed", "produceType"],
  hostelUtilization: ["months", "traineesStayed", "traineeDays"],
  rainWaterHarvesting: ["trainingProgrammes", "demonstrations", "plantMaterialProduced", "farmerVisits", "officialVisits"],
  budgetDetail: ["salaryAllocation", "salaryExpenditure", "generalGrantAllocation", "generalGrantExpenditure", "capitalGrantAllocation", "capitalGrantExpenditure"],
  projectWiseBudgetPerformance: ["projectName", "fundingAgency", "budgetEstimate", "budgetAllocated", "budgetReleased", "expenditure", "unspentBalance"],
  revolvingFund: ["reportingYear", "openingBalance", "incomeDuringYear", "expenditureDuringYear", "closing", "kind"],
  revenueGeneration: ["headName", "income", "sponsoringAgency"],
  resourceGeneration: ["programmeName", "purpose", "sourcesOfFund", "amountLakhs"],
  functionalLinkage: ["organizationName", "natureOfLinkage"],
  prevalentDiseaseCrop: ["diseaseName", "crop", "outbreakDate", "areaAffected", "commodityLossPercent", "preventiveMeasures"],
  prevalentDiseaseLivestock: ["diseaseName", "speciesAffected", "outbreakDate", "mortalityMorbidity", "animalsVaccinated", "preventiveMeasures"],
  ppvFraTrainingProgramme: ["date", "title", "type", "venue", "resourcePerson", "participants"],
  ppvFraFarmerDetail: ["year", "crop", "registrationNo", "farmerName", "block", "district"],
  raweFetFitProgramme: ["startDate", "endDate", "attachmentType", "numberOfStudents", "daysStayed"],
  vipVisitor: ["visitDate", "dignitaryType", "ministerName", "observations"],
  digitalMobileApp: ["mobileAppsDeveloped", "appName", "appLanguage", "meantFor", "timesDownloaded"],
  digitalWebPortal: ["visitors", "farmersRegistered"],
  digitalKisanSarathi: ["farmersRegisteredKsp", "phoneCallAddressed", "answeredCall"],
  digitalKmas: ["farmersCovered", "advisoriesSent", "messagesCrop", "messagesLivestock", "messagesWeather", "messagesMarketing", "messagesAwareness", "messagesOtherEnterprises", "messagesAnyOther"],
  digitalOtherChannel: ["textAdvisories", "textFarmers", "whatsappAdvisories", "whatsappFarmers", "socialMediaAdvisories", "socialMediaFarmers", "weatherBulletinAdvisories", "weatherBulletinFarmers"],
  sacMeeting: ["startDate", "endDate", "participants", "statutoryMembers", "recommendations", "actionTaken", "reason"],
  otherMeeting: ["date", "meetingType", "agenda", "representativeFromAtari"],
};

type ScopeMode = "direct" | { via: string };

type Entry = { code: string; title: string; model: string; scope: ScopeMode };
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
        { code: "3.1.D", title: "Socio-Economic Impact", model: "cfldSocioEconomicImpact", scope: { via: "cfldTechnicalParameter" } },
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
        { code: "3.6.A", title: "TSP / SCSP Activities", model: "subPlanActivity", scope: "direct" },
      ]},
      { num: "3.7", title: "NARI", items: [
        { code: "3.7.A", title: "Nutrition Garden", model: "nariNutritionGarden", scope: "direct" },
        { code: "3.7.B", title: "Bio-fortified Crops", model: "nariBioFortified", scope: "direct" },
        { code: "3.7.C", title: "Value Addition", model: "nariValueAddition", scope: "direct" },
        { code: "3.7.D", title: "Training Program", model: "nariTraining", scope: "direct" },
        { code: "3.7.E", title: "Extension Activities", model: "nariExtension", scope: "direct" },
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
        { code: "2.2.A", title: "OFT Summary", model: "oft", scope: "direct" },
      ]},
      { num: "2.3", title: "Front Line Demonstration", items: [
        { code: "2.3.A", title: "FLD Summary", model: "fld", scope: "direct" },
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
        { code: "2.7.A", title: "Swachhta hi Sewa / Pakhwada", model: "swachhtaObservance", scope: "direct" },
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
        { code: "2.2.A", title: "OFT Summary", model: "oft", scope: "direct" },
      ]},
      { num: "2.3", title: "Front Line Demonstration", items: [
        { code: "2.3.A", title: "FLD Summary", model: "fld", scope: "direct" },
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
        { code: "2.7.A", title: "Swachhta hi Sewa / Pakhwada", model: "swachhtaObservance", scope: "direct" },
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
