-- CreateEnum
CREATE TYPE "ProjectTrialStatus" AS ENUM ('ONGOING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SubPlanType" AS ENUM ('TSP', 'SCSP');

-- CreateTable
CREATE TABLE "CfldTechnicalParameter" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "reportingYear" INTEGER NOT NULL,
    "crop" TEXT NOT NULL,
    "technologyDemonstrated" TEXT NOT NULL,
    "areaHa" DECIMAL(10,2) NOT NULL,
    "numberOfFarmers" INTEGER NOT NULL,
    "districtYield" DECIMAL(10,2),
    "stateYield" DECIMAL(10,2),
    "potentialYield" DECIMAL(10,2),
    "status" "ProjectTrialStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CfldTechnicalParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CfldExtensionActivity" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "activitiesOrganized" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "placeOfActivity" TEXT NOT NULL,
    "farmersAttended" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CfldExtensionActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CfldBudgetUtilization" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "crop" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "overallFundAllocation" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CfldBudgetUtilization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CfldCropWiseImage" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "crop" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CfldCropWiseImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NicraBasicInformation" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "rfDistrictNormal" DECIMAL(10,2),
    "rfDistrictReceived" DECIMAL(10,2),
    "maxTemperature" DECIMAL(5,2),
    "minTemperature" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NicraBasicInformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NicraDetails" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "seasonName" TEXT NOT NULL,
    "technologyDemonstration" TEXT NOT NULL,
    "noOfFarmers" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NicraDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NicraTraining" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "farmersAttended" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NicraTraining_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NicraExtensionActivity" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "activityName" TEXT NOT NULL,
    "places" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "farmersAttended" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NicraExtensionActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NicraIntervention" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "seedBankFodderBank" TEXT NOT NULL,
    "crop" TEXT NOT NULL,
    "variety" TEXT NOT NULL,
    "quantityQuintal" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NicraIntervention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NicraRevenueGenerated" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "revenue" DECIMAL(14,2) NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NicraRevenueGenerated_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NicraCustomHiringFarmImplement" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "farmImplementName" TEXT NOT NULL,
    "farmersUsed" INTEGER NOT NULL,
    "areaCovered" DECIMAL(10,2) NOT NULL,
    "hoursUsed" DECIMAL(10,2) NOT NULL,
    "revenueGenerated" DECIMAL(14,2) NOT NULL,
    "repairExpenditure" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NicraCustomHiringFarmImplement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NicraVillageWiseVcrmc" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "villageName" TEXT NOT NULL,
    "constitutionDate" TIMESTAMP(3),
    "members" INTEGER NOT NULL,
    "meetingsOrganized" INTEGER NOT NULL,
    "meetingDate" TIMESTAMP(3),
    "secretaryName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NicraVillageWiseVcrmc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NicraSoilHealthCard" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "samplesCollected" INTEGER NOT NULL,
    "samplesAnalysed" INTEGER NOT NULL,
    "shcIssued" INTEGER NOT NULL,
    "farmersBenefitted" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NicraSoilHealthCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NicraConvergenceProgramme" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "scheme" TEXT NOT NULL,
    "natureOfWork" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NicraConvergenceProgramme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NicraDignitaryVisit" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "vipExperts" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateOfVisit" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NicraDignitaryVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NicraPiCoPi" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "piCoPi" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NicraPiCoPi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AryaCurrentYearDetail" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "enterprise" TEXT NOT NULL,
    "viableUnits" INTEGER NOT NULL,
    "closedUnits" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "groupsFormed" INTEGER NOT NULL,
    "groupsActive" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AryaCurrentYearDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AryaPreviousYearEvaluation" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "enterprise" TEXT NOT NULL,
    "totalClosed" INTEGER NOT NULL,
    "closingDate" TIMESTAMP(3),
    "totalRestarted" INTEGER NOT NULL,
    "restartedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AryaPreviousYearEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NfGeographicalInfo" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "agroClimaticZone" TEXT NOT NULL,
    "farmingSituation" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NfGeographicalInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NfPhysicalInfo" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "activityName" TEXT NOT NULL,
    "trainingTitle" TEXT NOT NULL,
    "trainingDate" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL,
    "participants" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NfPhysicalInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NfDemonstrationInfo" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "farmerName" TEXT NOT NULL,
    "activityName" TEXT NOT NULL,
    "crop" TEXT NOT NULL,
    "variety" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NfDemonstrationInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NfAlreadyPracticing" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "farmerName" TEXT NOT NULL,
    "address" TEXT,
    "normalCropsGrown" TEXT,
    "practicingYear" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NfAlreadyPracticing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NfBeneficiary" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "numberOfBlock" INTEGER NOT NULL,
    "numberOfVillage" INTEGER NOT NULL,
    "numberOfTraining" INTEGER NOT NULL,
    "farmersInfluenced" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NfBeneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NfSoilData" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "crop" TEXT NOT NULL,
    "beforePh" DECIMAL(5,2) NOT NULL,
    "beforeEc" DECIMAL(6,2) NOT NULL,
    "beforeEcOc" DECIMAL(6,2) NOT NULL,
    "afterPh" DECIMAL(5,2) NOT NULL,
    "afterEc" DECIMAL(6,2) NOT NULL,
    "afterEcOc" DECIMAL(6,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NfSoilData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NfBudgetExpenditure" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "activityName" TEXT NOT NULL,
    "activitiesOrganised" INTEGER NOT NULL,
    "budgetSanction" DECIMAL(14,2) NOT NULL,
    "budgetExpenditure" DECIMAL(14,2) NOT NULL,
    "totalBudgetExpenditure" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NfBudgetExpenditure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubPlanActivity" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "type" "SubPlanType" NOT NULL,
    "activities" TEXT NOT NULL,
    "noOfTraining" INTEGER NOT NULL,
    "beneficiaries" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubPlanActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NariNutritionGarden" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "nutriSmartVillage" TEXT NOT NULL,
    "typeOfNutritionalGarden" TEXT NOT NULL,
    "numbers" INTEGER NOT NULL,
    "areaSqm" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NariNutritionGarden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NariBioFortified" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "nutriSmartVillage" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "categoryOfCrop" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NariBioFortified_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NariValueAddition" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "nutriSmartVillage" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "valueAddedProduct" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NariValueAddition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NariTraining" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "nutriSmartVillage" TEXT NOT NULL,
    "areaOfTraining" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "titleOfTraining" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NariTraining_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NariExtension" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "nutriSmartVillage" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "nameOfActivity" TEXT NOT NULL,
    "noOfActivities" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NariExtension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgriDroneIntroduction" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "centreName" TEXT NOT NULL,
    "companyOfDrone" TEXT NOT NULL,
    "modelOfDrone" TEXT NOT NULL,
    "dronesSanctioned" INTEGER NOT NULL,
    "dronesPurchased" INTEGER NOT NULL,
    "amountSanctioned" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgriDroneIntroduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgriDroneDemonstration" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "centreName" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "dateOfDemos" TIMESTAMP(3) NOT NULL,
    "placeOfDemos" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "noOfDemos" INTEGER NOT NULL,
    "areaCovered" DECIMAL(10,2) NOT NULL,
    "noOfFarmers" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgriDroneDemonstration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FpoCbboDetail" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "noOfBlocksAllocated" INTEGER NOT NULL,
    "noOfFposRegistered" INTEGER NOT NULL,
    "trainingReceived" TEXT,
    "businessPlanPrepared" BOOLEAN NOT NULL DEFAULT false,
    "noOfFposDoingBusiness" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FpoCbboDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FpoManagement" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "registrationNo" TEXT NOT NULL,
    "dateOfRegistration" TIMESTAMP(3) NOT NULL,
    "fpoName" TEXT NOT NULL,
    "fpoAddress" TEXT,
    "totalBomMembers" INTEGER NOT NULL,
    "financialPosition" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FpoManagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrmrDetail" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "varietiesUsedInIp" TEXT NOT NULL,
    "situations" TEXT NOT NULL,
    "varietiesUsedInFp" TEXT NOT NULL,
    "netReturnImprovedPractice" DECIMAL(12,2) NOT NULL,
    "netReturnFarmerPractice" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrmrDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrmrActivity" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "training" TEXT,
    "flds" TEXT,
    "awarenessCamps" TEXT,
    "distributionOfLiterature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrmrActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CraDetail" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "technologyDemonstrated" TEXT NOT NULL,
    "croppingSystem" TEXT NOT NULL,
    "areaHa" DECIMAL(10,2) NOT NULL,
    "noOfFarmer" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CraDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CraExtensionActivity" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "extensionActivity" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "withinOrWithoutState" TEXT,
    "exposureVisits" INTEGER NOT NULL,
    "farmersUnderExposure" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CraExtensionActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CsisaDetail" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "villageCovered" INTEGER NOT NULL,
    "blockCovered" INTEGER NOT NULL,
    "districtCovered" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CsisaDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeedHubProgram" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "variety" TEXT NOT NULL,
    "areaHa" DECIMAL(10,2) NOT NULL,
    "yieldHa" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeedHubProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtherProgramme" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "programmeName" TEXT NOT NULL,
    "programmeDate" TIMESTAMP(3) NOT NULL,
    "venue" TEXT,
    "purpose" TEXT,
    "participants" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtherProgramme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CfldTechnicalParameter_zoneId_idx" ON "CfldTechnicalParameter"("zoneId");

-- CreateIndex
CREATE INDEX "CfldTechnicalParameter_kvkId_reportingYear_idx" ON "CfldTechnicalParameter"("kvkId", "reportingYear");

-- CreateIndex
CREATE INDEX "CfldExtensionActivity_zoneId_idx" ON "CfldExtensionActivity"("zoneId");

-- CreateIndex
CREATE INDEX "CfldExtensionActivity_kvkId_idx" ON "CfldExtensionActivity"("kvkId");

-- CreateIndex
CREATE INDEX "CfldBudgetUtilization_zoneId_idx" ON "CfldBudgetUtilization"("zoneId");

-- CreateIndex
CREATE INDEX "CfldBudgetUtilization_kvkId_idx" ON "CfldBudgetUtilization"("kvkId");

-- CreateIndex
CREATE INDEX "CfldCropWiseImage_zoneId_idx" ON "CfldCropWiseImage"("zoneId");

-- CreateIndex
CREATE INDEX "CfldCropWiseImage_kvkId_idx" ON "CfldCropWiseImage"("kvkId");

-- CreateIndex
CREATE INDEX "NicraBasicInformation_zoneId_idx" ON "NicraBasicInformation"("zoneId");

-- CreateIndex
CREATE INDEX "NicraBasicInformation_kvkId_idx" ON "NicraBasicInformation"("kvkId");

-- CreateIndex
CREATE INDEX "NicraDetails_zoneId_idx" ON "NicraDetails"("zoneId");

-- CreateIndex
CREATE INDEX "NicraDetails_kvkId_idx" ON "NicraDetails"("kvkId");

-- CreateIndex
CREATE INDEX "NicraTraining_zoneId_idx" ON "NicraTraining"("zoneId");

-- CreateIndex
CREATE INDEX "NicraTraining_kvkId_idx" ON "NicraTraining"("kvkId");

-- CreateIndex
CREATE INDEX "NicraExtensionActivity_zoneId_idx" ON "NicraExtensionActivity"("zoneId");

-- CreateIndex
CREATE INDEX "NicraExtensionActivity_kvkId_idx" ON "NicraExtensionActivity"("kvkId");

-- CreateIndex
CREATE INDEX "NicraIntervention_zoneId_idx" ON "NicraIntervention"("zoneId");

-- CreateIndex
CREATE INDEX "NicraIntervention_kvkId_idx" ON "NicraIntervention"("kvkId");

-- CreateIndex
CREATE INDEX "NicraRevenueGenerated_zoneId_idx" ON "NicraRevenueGenerated"("zoneId");

-- CreateIndex
CREATE INDEX "NicraRevenueGenerated_kvkId_year_idx" ON "NicraRevenueGenerated"("kvkId", "year");

-- CreateIndex
CREATE INDEX "NicraCustomHiringFarmImplement_zoneId_idx" ON "NicraCustomHiringFarmImplement"("zoneId");

-- CreateIndex
CREATE INDEX "NicraCustomHiringFarmImplement_kvkId_idx" ON "NicraCustomHiringFarmImplement"("kvkId");

-- CreateIndex
CREATE INDEX "NicraVillageWiseVcrmc_zoneId_idx" ON "NicraVillageWiseVcrmc"("zoneId");

-- CreateIndex
CREATE INDEX "NicraVillageWiseVcrmc_kvkId_idx" ON "NicraVillageWiseVcrmc"("kvkId");

-- CreateIndex
CREATE INDEX "NicraSoilHealthCard_zoneId_idx" ON "NicraSoilHealthCard"("zoneId");

-- CreateIndex
CREATE INDEX "NicraSoilHealthCard_kvkId_idx" ON "NicraSoilHealthCard"("kvkId");

-- CreateIndex
CREATE INDEX "NicraConvergenceProgramme_zoneId_idx" ON "NicraConvergenceProgramme"("zoneId");

-- CreateIndex
CREATE INDEX "NicraConvergenceProgramme_kvkId_idx" ON "NicraConvergenceProgramme"("kvkId");

-- CreateIndex
CREATE INDEX "NicraDignitaryVisit_zoneId_idx" ON "NicraDignitaryVisit"("zoneId");

-- CreateIndex
CREATE INDEX "NicraDignitaryVisit_kvkId_idx" ON "NicraDignitaryVisit"("kvkId");

-- CreateIndex
CREATE INDEX "NicraPiCoPi_zoneId_idx" ON "NicraPiCoPi"("zoneId");

-- CreateIndex
CREATE INDEX "NicraPiCoPi_kvkId_idx" ON "NicraPiCoPi"("kvkId");

-- CreateIndex
CREATE INDEX "AryaCurrentYearDetail_zoneId_idx" ON "AryaCurrentYearDetail"("zoneId");

-- CreateIndex
CREATE INDEX "AryaCurrentYearDetail_kvkId_idx" ON "AryaCurrentYearDetail"("kvkId");

-- CreateIndex
CREATE INDEX "AryaPreviousYearEvaluation_zoneId_idx" ON "AryaPreviousYearEvaluation"("zoneId");

-- CreateIndex
CREATE INDEX "AryaPreviousYearEvaluation_kvkId_idx" ON "AryaPreviousYearEvaluation"("kvkId");

-- CreateIndex
CREATE INDEX "NfGeographicalInfo_zoneId_idx" ON "NfGeographicalInfo"("zoneId");

-- CreateIndex
CREATE INDEX "NfGeographicalInfo_kvkId_idx" ON "NfGeographicalInfo"("kvkId");

-- CreateIndex
CREATE INDEX "NfPhysicalInfo_zoneId_idx" ON "NfPhysicalInfo"("zoneId");

-- CreateIndex
CREATE INDEX "NfPhysicalInfo_kvkId_idx" ON "NfPhysicalInfo"("kvkId");

-- CreateIndex
CREATE INDEX "NfDemonstrationInfo_zoneId_idx" ON "NfDemonstrationInfo"("zoneId");

-- CreateIndex
CREATE INDEX "NfDemonstrationInfo_kvkId_idx" ON "NfDemonstrationInfo"("kvkId");

-- CreateIndex
CREATE INDEX "NfAlreadyPracticing_zoneId_idx" ON "NfAlreadyPracticing"("zoneId");

-- CreateIndex
CREATE INDEX "NfAlreadyPracticing_kvkId_idx" ON "NfAlreadyPracticing"("kvkId");

-- CreateIndex
CREATE INDEX "NfBeneficiary_zoneId_idx" ON "NfBeneficiary"("zoneId");

-- CreateIndex
CREATE INDEX "NfBeneficiary_kvkId_idx" ON "NfBeneficiary"("kvkId");

-- CreateIndex
CREATE INDEX "NfSoilData_zoneId_idx" ON "NfSoilData"("zoneId");

-- CreateIndex
CREATE INDEX "NfSoilData_kvkId_idx" ON "NfSoilData"("kvkId");

-- CreateIndex
CREATE INDEX "NfBudgetExpenditure_zoneId_idx" ON "NfBudgetExpenditure"("zoneId");

-- CreateIndex
CREATE INDEX "NfBudgetExpenditure_kvkId_idx" ON "NfBudgetExpenditure"("kvkId");

-- CreateIndex
CREATE INDEX "SubPlanActivity_zoneId_idx" ON "SubPlanActivity"("zoneId");

-- CreateIndex
CREATE INDEX "SubPlanActivity_kvkId_type_idx" ON "SubPlanActivity"("kvkId", "type");

-- CreateIndex
CREATE INDEX "NariNutritionGarden_zoneId_idx" ON "NariNutritionGarden"("zoneId");

-- CreateIndex
CREATE INDEX "NariNutritionGarden_kvkId_idx" ON "NariNutritionGarden"("kvkId");

-- CreateIndex
CREATE INDEX "NariBioFortified_zoneId_idx" ON "NariBioFortified"("zoneId");

-- CreateIndex
CREATE INDEX "NariBioFortified_kvkId_idx" ON "NariBioFortified"("kvkId");

-- CreateIndex
CREATE INDEX "NariValueAddition_zoneId_idx" ON "NariValueAddition"("zoneId");

-- CreateIndex
CREATE INDEX "NariValueAddition_kvkId_idx" ON "NariValueAddition"("kvkId");

-- CreateIndex
CREATE INDEX "NariTraining_zoneId_idx" ON "NariTraining"("zoneId");

-- CreateIndex
CREATE INDEX "NariTraining_kvkId_idx" ON "NariTraining"("kvkId");

-- CreateIndex
CREATE INDEX "NariExtension_zoneId_idx" ON "NariExtension"("zoneId");

-- CreateIndex
CREATE INDEX "NariExtension_kvkId_idx" ON "NariExtension"("kvkId");

-- CreateIndex
CREATE INDEX "AgriDroneIntroduction_zoneId_idx" ON "AgriDroneIntroduction"("zoneId");

-- CreateIndex
CREATE INDEX "AgriDroneIntroduction_kvkId_year_idx" ON "AgriDroneIntroduction"("kvkId", "year");

-- CreateIndex
CREATE INDEX "AgriDroneDemonstration_zoneId_idx" ON "AgriDroneDemonstration"("zoneId");

-- CreateIndex
CREATE INDEX "AgriDroneDemonstration_kvkId_idx" ON "AgriDroneDemonstration"("kvkId");

-- CreateIndex
CREATE INDEX "FpoCbboDetail_zoneId_idx" ON "FpoCbboDetail"("zoneId");

-- CreateIndex
CREATE INDEX "FpoCbboDetail_kvkId_idx" ON "FpoCbboDetail"("kvkId");

-- CreateIndex
CREATE INDEX "FpoManagement_zoneId_idx" ON "FpoManagement"("zoneId");

-- CreateIndex
CREATE INDEX "FpoManagement_kvkId_idx" ON "FpoManagement"("kvkId");

-- CreateIndex
CREATE INDEX "DrmrDetail_zoneId_idx" ON "DrmrDetail"("zoneId");

-- CreateIndex
CREATE INDEX "DrmrDetail_kvkId_idx" ON "DrmrDetail"("kvkId");

-- CreateIndex
CREATE INDEX "DrmrActivity_zoneId_idx" ON "DrmrActivity"("zoneId");

-- CreateIndex
CREATE INDEX "DrmrActivity_kvkId_idx" ON "DrmrActivity"("kvkId");

-- CreateIndex
CREATE INDEX "CraDetail_zoneId_idx" ON "CraDetail"("zoneId");

-- CreateIndex
CREATE INDEX "CraDetail_kvkId_idx" ON "CraDetail"("kvkId");

-- CreateIndex
CREATE INDEX "CraExtensionActivity_zoneId_idx" ON "CraExtensionActivity"("zoneId");

-- CreateIndex
CREATE INDEX "CraExtensionActivity_kvkId_idx" ON "CraExtensionActivity"("kvkId");

-- CreateIndex
CREATE INDEX "CsisaDetail_zoneId_idx" ON "CsisaDetail"("zoneId");

-- CreateIndex
CREATE INDEX "CsisaDetail_kvkId_idx" ON "CsisaDetail"("kvkId");

-- CreateIndex
CREATE INDEX "SeedHubProgram_zoneId_idx" ON "SeedHubProgram"("zoneId");

-- CreateIndex
CREATE INDEX "SeedHubProgram_kvkId_idx" ON "SeedHubProgram"("kvkId");

-- CreateIndex
CREATE INDEX "OtherProgramme_zoneId_idx" ON "OtherProgramme"("zoneId");

-- CreateIndex
CREATE INDEX "OtherProgramme_kvkId_idx" ON "OtherProgramme"("kvkId");

-- AddForeignKey
ALTER TABLE "CfldTechnicalParameter" ADD CONSTRAINT "CfldTechnicalParameter_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CfldExtensionActivity" ADD CONSTRAINT "CfldExtensionActivity_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CfldBudgetUtilization" ADD CONSTRAINT "CfldBudgetUtilization_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CfldCropWiseImage" ADD CONSTRAINT "CfldCropWiseImage_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicraBasicInformation" ADD CONSTRAINT "NicraBasicInformation_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicraDetails" ADD CONSTRAINT "NicraDetails_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicraTraining" ADD CONSTRAINT "NicraTraining_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicraExtensionActivity" ADD CONSTRAINT "NicraExtensionActivity_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicraIntervention" ADD CONSTRAINT "NicraIntervention_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicraRevenueGenerated" ADD CONSTRAINT "NicraRevenueGenerated_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicraCustomHiringFarmImplement" ADD CONSTRAINT "NicraCustomHiringFarmImplement_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicraVillageWiseVcrmc" ADD CONSTRAINT "NicraVillageWiseVcrmc_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicraSoilHealthCard" ADD CONSTRAINT "NicraSoilHealthCard_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicraConvergenceProgramme" ADD CONSTRAINT "NicraConvergenceProgramme_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicraDignitaryVisit" ADD CONSTRAINT "NicraDignitaryVisit_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicraPiCoPi" ADD CONSTRAINT "NicraPiCoPi_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AryaCurrentYearDetail" ADD CONSTRAINT "AryaCurrentYearDetail_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AryaPreviousYearEvaluation" ADD CONSTRAINT "AryaPreviousYearEvaluation_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NfGeographicalInfo" ADD CONSTRAINT "NfGeographicalInfo_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NfPhysicalInfo" ADD CONSTRAINT "NfPhysicalInfo_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NfDemonstrationInfo" ADD CONSTRAINT "NfDemonstrationInfo_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NfAlreadyPracticing" ADD CONSTRAINT "NfAlreadyPracticing_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NfBeneficiary" ADD CONSTRAINT "NfBeneficiary_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NfSoilData" ADD CONSTRAINT "NfSoilData_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NfBudgetExpenditure" ADD CONSTRAINT "NfBudgetExpenditure_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubPlanActivity" ADD CONSTRAINT "SubPlanActivity_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NariNutritionGarden" ADD CONSTRAINT "NariNutritionGarden_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NariBioFortified" ADD CONSTRAINT "NariBioFortified_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NariValueAddition" ADD CONSTRAINT "NariValueAddition_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NariTraining" ADD CONSTRAINT "NariTraining_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NariExtension" ADD CONSTRAINT "NariExtension_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgriDroneIntroduction" ADD CONSTRAINT "AgriDroneIntroduction_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgriDroneDemonstration" ADD CONSTRAINT "AgriDroneDemonstration_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FpoCbboDetail" ADD CONSTRAINT "FpoCbboDetail_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FpoManagement" ADD CONSTRAINT "FpoManagement_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrmrDetail" ADD CONSTRAINT "DrmrDetail_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrmrActivity" ADD CONSTRAINT "DrmrActivity_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraDetail" ADD CONSTRAINT "CraDetail_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraExtensionActivity" ADD CONSTRAINT "CraExtensionActivity_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CsisaDetail" ADD CONSTRAINT "CsisaDetail_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeedHubProgram" ADD CONSTRAINT "SeedHubProgram_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtherProgramme" ADD CONSTRAINT "OtherProgramme_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
