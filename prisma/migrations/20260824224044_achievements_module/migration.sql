-- CreateEnum
CREATE TYPE "TrialStatus" AS ENUM ('ONGOING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SwachhtaObservanceKind" AS ENUM ('SEWA', 'PAKHWADA');

-- CreateTable
CREATE TABLE "TechnicalAchievementSummaryEntry" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "reportingYear" INTEGER NOT NULL,
    "sectionCode" TEXT NOT NULL,
    "metricCode" TEXT NOT NULL,
    "casteCategory" TEXT,
    "value" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnicalAchievementSummaryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Oft" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "reportingYear" INTEGER NOT NULL,
    "staff" TEXT NOT NULL,
    "trialOnForm" TEXT NOT NULL,
    "problemDiagnosed" TEXT,
    "status" "TrialStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Oft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fld" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "reportingYear" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "category" TEXT NOT NULL,
    "subCategory" TEXT NOT NULL,
    "technologyDemonstrated" TEXT NOT NULL,
    "status" "TrialStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fld_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FldExtensionTraining" (
    "id" TEXT NOT NULL,
    "fldId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "activityCount" INTEGER NOT NULL,
    "participantCount" INTEGER NOT NULL,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FldExtensionTraining_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FldTechnicalFeedback" (
    "id" TEXT NOT NULL,
    "fldId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "crop" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FldTechnicalFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Training" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "reportingYear" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "program" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "venue" TEXT,
    "trainingDiscipline" TEXT,
    "thematicArea" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtensionActivity" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "reportingYear" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "natureOfExtensionActivity" TEXT NOT NULL,
    "noOfActivities" INTEGER NOT NULL,
    "noOfParticipants" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExtensionActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtherExtensionActivity" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "reportingYear" INTEGER NOT NULL,
    "natureOfExtensionActivity" TEXT NOT NULL,
    "noOfActivities" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtherExtensionActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnologyWeekCelebration" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "typeOfActivities" TEXT NOT NULL,
    "noOfActivities" INTEGER NOT NULL,
    "relatedCropTechnology" TEXT,
    "numberOfParticipants" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnologyWeekCelebration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CelebrationDay" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "importantDay" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "noOfActivities" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CelebrationDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoshanMaaha" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "activitiesConducted" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "saplingsPlanted" INTEGER NOT NULL DEFAULT 0,
    "vegetableKits" INTEGER NOT NULL DEFAULT 0,
    "participantsGirls" INTEGER NOT NULL DEFAULT 0,
    "participantsPublicRepresentatives" INTEGER NOT NULL DEFAULT 0,
    "participantsFarmWoman" INTEGER NOT NULL DEFAULT 0,
    "participantsFarmers" INTEGER NOT NULL DEFAULT 0,
    "participantsAganwadiWorkers" INTEGER NOT NULL DEFAULT 0,
    "participantsGovtOfficials" INTEGER NOT NULL DEFAULT 0,
    "totalParticipants" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PoshanMaaha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwachhtaObservance" (
    "id" TEXT NOT NULL,
    "kind" "SwachhtaObservanceKind" NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "dateDurationOfObservation" TEXT NOT NULL,
    "totalNoOfActivitiesUndertaken" INTEGER NOT NULL,
    "noOfStaffs" INTEGER NOT NULL,
    "noOfFarmers" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SwachhtaObservance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwachhtaBudgetExpenditure" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "reportingYear" INTEGER NOT NULL,
    "vermicompostingVillagesCovered" INTEGER NOT NULL,
    "vermicompostingTotalExpenditure" DECIMAL(14,2) NOT NULL,
    "additionalLineItems" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SwachhtaBudgetExpenditure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnologyProductProduction" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "variety" TEXT NOT NULL,
    "quantity" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnologyProductProduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoilTestingEquipment" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "analysis" TEXT NOT NULL,
    "equipmentName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoilTestingEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoilWaterPlantAnalysis" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "analysis" TEXT NOT NULL,
    "noOfSamplesAnalyzed" INTEGER NOT NULL,
    "noOfVillagesCovered" INTEGER NOT NULL,
    "amountRealized" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoilWaterPlantAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorldSoilDay" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "noOfActivitiesConducted" INTEGER NOT NULL,
    "soilHealthCardsDistributed" INTEGER NOT NULL,
    "noOfVip" INTEGER NOT NULL,
    "vipNames" TEXT,
    "totalParticipants" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorldSoilDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "journalName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HumanResourceDevelopment" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "staff" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "venue" TEXT,
    "organizer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HumanResourceDevelopment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KvkAward" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "award" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "achievement" TEXT,
    "conferringAuthority" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KvkAward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScientistAward" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "headScientist" TEXT NOT NULL,
    "award" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "achievement" TEXT,
    "conferringAuthority" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScientistAward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmerAward" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "farmerName" TEXT NOT NULL,
    "address" TEXT,
    "contactNumber" TEXT,
    "award" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "achievement" TEXT,
    "conferringAuthority" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarmerAward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TechnicalAchievementSummaryEntry_zoneId_idx" ON "TechnicalAchievementSummaryEntry"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "TechnicalAchievementSummaryEntry_kvkId_reportingYear_sectio_key" ON "TechnicalAchievementSummaryEntry"("kvkId", "reportingYear", "sectionCode", "metricCode", "casteCategory");

-- CreateIndex
CREATE INDEX "Oft_zoneId_idx" ON "Oft"("zoneId");

-- CreateIndex
CREATE INDEX "Oft_kvkId_reportingYear_idx" ON "Oft"("kvkId", "reportingYear");

-- CreateIndex
CREATE INDEX "Fld_zoneId_idx" ON "Fld"("zoneId");

-- CreateIndex
CREATE INDEX "Fld_kvkId_reportingYear_idx" ON "Fld"("kvkId", "reportingYear");

-- CreateIndex
CREATE INDEX "FldExtensionTraining_zoneId_idx" ON "FldExtensionTraining"("zoneId");

-- CreateIndex
CREATE INDEX "FldExtensionTraining_fldId_idx" ON "FldExtensionTraining"("fldId");

-- CreateIndex
CREATE INDEX "FldTechnicalFeedback_zoneId_idx" ON "FldTechnicalFeedback"("zoneId");

-- CreateIndex
CREATE INDEX "FldTechnicalFeedback_fldId_idx" ON "FldTechnicalFeedback"("fldId");

-- CreateIndex
CREATE INDEX "Training_zoneId_idx" ON "Training"("zoneId");

-- CreateIndex
CREATE INDEX "Training_kvkId_reportingYear_idx" ON "Training"("kvkId", "reportingYear");

-- CreateIndex
CREATE INDEX "ExtensionActivity_zoneId_idx" ON "ExtensionActivity"("zoneId");

-- CreateIndex
CREATE INDEX "ExtensionActivity_kvkId_reportingYear_idx" ON "ExtensionActivity"("kvkId", "reportingYear");

-- CreateIndex
CREATE INDEX "OtherExtensionActivity_zoneId_idx" ON "OtherExtensionActivity"("zoneId");

-- CreateIndex
CREATE INDEX "OtherExtensionActivity_kvkId_reportingYear_idx" ON "OtherExtensionActivity"("kvkId", "reportingYear");

-- CreateIndex
CREATE INDEX "TechnologyWeekCelebration_zoneId_idx" ON "TechnologyWeekCelebration"("zoneId");

-- CreateIndex
CREATE INDEX "TechnologyWeekCelebration_kvkId_idx" ON "TechnologyWeekCelebration"("kvkId");

-- CreateIndex
CREATE INDEX "CelebrationDay_zoneId_idx" ON "CelebrationDay"("zoneId");

-- CreateIndex
CREATE INDEX "CelebrationDay_kvkId_idx" ON "CelebrationDay"("kvkId");

-- CreateIndex
CREATE INDEX "PoshanMaaha_zoneId_idx" ON "PoshanMaaha"("zoneId");

-- CreateIndex
CREATE INDEX "PoshanMaaha_kvkId_idx" ON "PoshanMaaha"("kvkId");

-- CreateIndex
CREATE INDEX "SwachhtaObservance_zoneId_idx" ON "SwachhtaObservance"("zoneId");

-- CreateIndex
CREATE INDEX "SwachhtaObservance_kvkId_kind_idx" ON "SwachhtaObservance"("kvkId", "kind");

-- CreateIndex
CREATE INDEX "SwachhtaBudgetExpenditure_zoneId_idx" ON "SwachhtaBudgetExpenditure"("zoneId");

-- CreateIndex
CREATE INDEX "SwachhtaBudgetExpenditure_kvkId_reportingYear_idx" ON "SwachhtaBudgetExpenditure"("kvkId", "reportingYear");

-- CreateIndex
CREATE INDEX "TechnologyProductProduction_zoneId_idx" ON "TechnologyProductProduction"("zoneId");

-- CreateIndex
CREATE INDEX "TechnologyProductProduction_kvkId_idx" ON "TechnologyProductProduction"("kvkId");

-- CreateIndex
CREATE INDEX "SoilTestingEquipment_zoneId_idx" ON "SoilTestingEquipment"("zoneId");

-- CreateIndex
CREATE INDEX "SoilTestingEquipment_kvkId_idx" ON "SoilTestingEquipment"("kvkId");

-- CreateIndex
CREATE INDEX "SoilWaterPlantAnalysis_zoneId_idx" ON "SoilWaterPlantAnalysis"("zoneId");

-- CreateIndex
CREATE INDEX "SoilWaterPlantAnalysis_kvkId_idx" ON "SoilWaterPlantAnalysis"("kvkId");

-- CreateIndex
CREATE INDEX "WorldSoilDay_zoneId_idx" ON "WorldSoilDay"("zoneId");

-- CreateIndex
CREATE INDEX "WorldSoilDay_kvkId_idx" ON "WorldSoilDay"("kvkId");

-- CreateIndex
CREATE INDEX "Publication_zoneId_idx" ON "Publication"("zoneId");

-- CreateIndex
CREATE INDEX "Publication_kvkId_idx" ON "Publication"("kvkId");

-- CreateIndex
CREATE INDEX "HumanResourceDevelopment_zoneId_idx" ON "HumanResourceDevelopment"("zoneId");

-- CreateIndex
CREATE INDEX "HumanResourceDevelopment_kvkId_idx" ON "HumanResourceDevelopment"("kvkId");

-- CreateIndex
CREATE INDEX "KvkAward_zoneId_idx" ON "KvkAward"("zoneId");

-- CreateIndex
CREATE INDEX "KvkAward_kvkId_idx" ON "KvkAward"("kvkId");

-- CreateIndex
CREATE INDEX "ScientistAward_zoneId_idx" ON "ScientistAward"("zoneId");

-- CreateIndex
CREATE INDEX "ScientistAward_kvkId_idx" ON "ScientistAward"("kvkId");

-- CreateIndex
CREATE INDEX "FarmerAward_zoneId_idx" ON "FarmerAward"("zoneId");

-- CreateIndex
CREATE INDEX "FarmerAward_kvkId_idx" ON "FarmerAward"("kvkId");

-- AddForeignKey
ALTER TABLE "TechnicalAchievementSummaryEntry" ADD CONSTRAINT "TechnicalAchievementSummaryEntry_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oft" ADD CONSTRAINT "Oft_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fld" ADD CONSTRAINT "Fld_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FldExtensionTraining" ADD CONSTRAINT "FldExtensionTraining_fldId_fkey" FOREIGN KEY ("fldId") REFERENCES "Fld"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FldTechnicalFeedback" ADD CONSTRAINT "FldTechnicalFeedback_fldId_fkey" FOREIGN KEY ("fldId") REFERENCES "Fld"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Training" ADD CONSTRAINT "Training_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtensionActivity" ADD CONSTRAINT "ExtensionActivity_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtherExtensionActivity" ADD CONSTRAINT "OtherExtensionActivity_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnologyWeekCelebration" ADD CONSTRAINT "TechnologyWeekCelebration_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CelebrationDay" ADD CONSTRAINT "CelebrationDay_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoshanMaaha" ADD CONSTRAINT "PoshanMaaha_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwachhtaObservance" ADD CONSTRAINT "SwachhtaObservance_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwachhtaBudgetExpenditure" ADD CONSTRAINT "SwachhtaBudgetExpenditure_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnologyProductProduction" ADD CONSTRAINT "TechnologyProductProduction_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoilTestingEquipment" ADD CONSTRAINT "SoilTestingEquipment_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoilWaterPlantAnalysis" ADD CONSTRAINT "SoilWaterPlantAnalysis_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldSoilDay" ADD CONSTRAINT "WorldSoilDay_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HumanResourceDevelopment" ADD CONSTRAINT "HumanResourceDevelopment_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KvkAward" ADD CONSTRAINT "KvkAward_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScientistAward" ADD CONSTRAINT "ScientistAward_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmerAward" ADD CONSTRAINT "FarmerAward_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
