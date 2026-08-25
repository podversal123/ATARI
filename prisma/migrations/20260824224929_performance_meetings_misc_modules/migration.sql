-- CreateTable
CREATE TABLE "KvkActivityImpact" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "specificArea" TEXT NOT NULL,
    "briefDetails" TEXT,
    "farmersBenefitted" INTEGER NOT NULL,
    "horizontalSpread" TEXT,
    "adoptionPercent" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KvkActivityImpact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntrepreneurshipDetail" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "entrepreneurOrEnterprise" TEXT NOT NULL,
    "enterpriseType" TEXT NOT NULL,
    "membersAssociated" INTEGER NOT NULL,
    "annualIncome" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntrepreneurshipDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuccessStory" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "farmerOrEntrepreneur" TEXT NOT NULL,
    "experience" TEXT,
    "majorAchievement" TEXT NOT NULL,
    "storyTitle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuccessStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistrictLevelData" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "reportingYear" INTEGER NOT NULL,
    "items" TEXT NOT NULL,
    "information" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DistrictLevelData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationalAreaDetail" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "reportingYear" INTEGER NOT NULL,
    "taluk" TEXT,
    "block" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "majorCrops" TEXT,
    "majorProblems" TEXT,
    "thrustAreas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationalAreaDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VillageAdoptionProgramme" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "reportingYear" INTEGER NOT NULL,
    "village" TEXT NOT NULL,
    "block" TEXT NOT NULL,
    "actionTaken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VillageAdoptionProgramme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriorityThrustArea" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "reportingYear" INTEGER NOT NULL,
    "thrustArea" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriorityThrustArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemonstrationUnit" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "demoUnitName" TEXT NOT NULL,
    "yearOfEstt" INTEGER NOT NULL,
    "areaSqMt" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemonstrationUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstructionalFarmCrop" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "areaHa" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstructionalFarmCrop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionUnit" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "qty" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstructionalFarmLivestock" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "animalName" TEXT NOT NULL,
    "speciesBreed" TEXT,
    "produceType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstructionalFarmLivestock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelUtilization" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "months" TEXT NOT NULL,
    "traineesStayed" INTEGER NOT NULL,
    "traineeDays" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostelUtilization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffQuartersPerformance" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "noOfStaffQuarters" INTEGER NOT NULL,
    "dateOfCompletion" TIMESTAMP(3),
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffQuartersPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RainWaterHarvesting" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "trainingProgrammes" INTEGER NOT NULL,
    "demonstrations" INTEGER NOT NULL,
    "plantMaterialProduced" INTEGER NOT NULL,
    "farmerVisits" INTEGER NOT NULL,
    "officialVisits" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RainWaterHarvesting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetDetail" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "salaryAllocation" DECIMAL(14,2) NOT NULL,
    "salaryExpenditure" DECIMAL(14,2) NOT NULL,
    "generalGrantAllocation" DECIMAL(14,2) NOT NULL,
    "generalGrantExpenditure" DECIMAL(14,2) NOT NULL,
    "capitalGrantAllocation" DECIMAL(14,2) NOT NULL,
    "capitalGrantExpenditure" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectWiseBudgetPerformance" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "fundingAgency" TEXT,
    "budgetEstimate" DECIMAL(14,2) NOT NULL,
    "budgetAllocated" DECIMAL(14,2) NOT NULL,
    "budgetReleased" DECIMAL(14,2) NOT NULL,
    "expenditure" DECIMAL(14,2) NOT NULL,
    "unspentBalance" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectWiseBudgetPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevolvingFund" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "reportingYear" INTEGER NOT NULL,
    "openingBalance" DECIMAL(14,2) NOT NULL,
    "incomeDuringYear" DECIMAL(14,2) NOT NULL,
    "expenditureDuringYear" DECIMAL(14,2) NOT NULL,
    "closing" DECIMAL(14,2) NOT NULL,
    "kind" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevolvingFund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueGeneration" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "headName" TEXT NOT NULL,
    "income" DECIMAL(14,2) NOT NULL,
    "sponsoringAgency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevenueGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceGeneration" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "programmeName" TEXT NOT NULL,
    "purpose" TEXT,
    "sourcesOfFund" TEXT,
    "amountLakhs" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunctionalLinkage" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "natureOfLinkage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FunctionalLinkage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialProgramme" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "programmeType" TEXT NOT NULL,
    "programmeName" TEXT NOT NULL,
    "initiationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecialProgramme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SacMeeting" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "participants" INTEGER NOT NULL,
    "statutoryMembers" INTEGER NOT NULL,
    "recommendations" TEXT,
    "actionTaken" TEXT,
    "reason" TEXT,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SacMeeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtherMeeting" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "meetingType" TEXT NOT NULL,
    "agenda" TEXT,
    "representativeFromAtari" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtherMeeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrevalentDiseaseCrop" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "diseaseName" TEXT NOT NULL,
    "crop" TEXT NOT NULL,
    "outbreakDate" TIMESTAMP(3) NOT NULL,
    "areaAffected" DECIMAL(10,2) NOT NULL,
    "commodityLossPercent" DECIMAL(5,2) NOT NULL,
    "preventiveMeasures" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrevalentDiseaseCrop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrevalentDiseaseLivestock" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "diseaseName" TEXT NOT NULL,
    "speciesAffected" TEXT NOT NULL,
    "outbreakDate" TIMESTAMP(3) NOT NULL,
    "mortalityMorbidity" TEXT,
    "animalsVaccinated" INTEGER NOT NULL,
    "preventiveMeasures" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrevalentDiseaseLivestock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NykTraining" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "programmeTitle" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "male" INTEGER NOT NULL,
    "female" INTEGER NOT NULL,
    "fundReceived" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NykTraining_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PpvFraTrainingProgramme" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT,
    "venue" TEXT,
    "resourcePerson" TEXT,
    "participants" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PpvFraTrainingProgramme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PpvFraFarmerDetail" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "crop" TEXT NOT NULL,
    "registrationNo" TEXT NOT NULL,
    "farmerName" TEXT NOT NULL,
    "block" TEXT,
    "district" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PpvFraFarmerDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaweFetFitProgramme" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "attachmentType" TEXT NOT NULL,
    "attachment" TEXT,
    "numberOfStudents" INTEGER NOT NULL,
    "daysStayed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RaweFetFitProgramme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VipVisitor" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "dignitaryType" TEXT NOT NULL,
    "ministerName" TEXT NOT NULL,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VipVisitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalMobileApp" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "mobileAppsDeveloped" INTEGER NOT NULL,
    "appName" TEXT,
    "appLanguage" TEXT,
    "meantFor" TEXT,
    "timesDownloaded" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigitalMobileApp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalWebPortal" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "visitors" INTEGER NOT NULL,
    "farmersRegistered" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigitalWebPortal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalKisanSarathi" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "farmersRegisteredKsp" INTEGER NOT NULL,
    "phoneCallAddressed" INTEGER NOT NULL,
    "answeredCall" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigitalKisanSarathi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalKmas" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "farmersCovered" INTEGER NOT NULL,
    "advisoriesSent" INTEGER NOT NULL,
    "messagesCrop" BOOLEAN NOT NULL DEFAULT false,
    "messagesLivestock" BOOLEAN NOT NULL DEFAULT false,
    "messagesWeather" BOOLEAN NOT NULL DEFAULT false,
    "messagesMarketing" BOOLEAN NOT NULL DEFAULT false,
    "messagesAwareness" BOOLEAN NOT NULL DEFAULT false,
    "messagesOtherEnterprises" BOOLEAN NOT NULL DEFAULT false,
    "messagesAnyOther" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigitalKmas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalOtherChannel" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "textAdvisories" INTEGER NOT NULL DEFAULT 0,
    "textFarmers" INTEGER NOT NULL DEFAULT 0,
    "whatsappAdvisories" INTEGER NOT NULL DEFAULT 0,
    "whatsappFarmers" INTEGER NOT NULL DEFAULT 0,
    "socialMediaAdvisories" INTEGER NOT NULL DEFAULT 0,
    "socialMediaFarmers" INTEGER NOT NULL DEFAULT 0,
    "weatherBulletinAdvisories" INTEGER NOT NULL DEFAULT 0,
    "weatherBulletinFarmers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigitalOtherChannel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KvkActivityImpact_zoneId_idx" ON "KvkActivityImpact"("zoneId");

-- CreateIndex
CREATE INDEX "KvkActivityImpact_kvkId_idx" ON "KvkActivityImpact"("kvkId");

-- CreateIndex
CREATE INDEX "EntrepreneurshipDetail_zoneId_idx" ON "EntrepreneurshipDetail"("zoneId");

-- CreateIndex
CREATE INDEX "EntrepreneurshipDetail_kvkId_idx" ON "EntrepreneurshipDetail"("kvkId");

-- CreateIndex
CREATE INDEX "SuccessStory_zoneId_idx" ON "SuccessStory"("zoneId");

-- CreateIndex
CREATE INDEX "SuccessStory_kvkId_idx" ON "SuccessStory"("kvkId");

-- CreateIndex
CREATE INDEX "DistrictLevelData_zoneId_idx" ON "DistrictLevelData"("zoneId");

-- CreateIndex
CREATE INDEX "DistrictLevelData_kvkId_reportingYear_idx" ON "DistrictLevelData"("kvkId", "reportingYear");

-- CreateIndex
CREATE INDEX "OperationalAreaDetail_zoneId_idx" ON "OperationalAreaDetail"("zoneId");

-- CreateIndex
CREATE INDEX "OperationalAreaDetail_kvkId_reportingYear_idx" ON "OperationalAreaDetail"("kvkId", "reportingYear");

-- CreateIndex
CREATE INDEX "VillageAdoptionProgramme_zoneId_idx" ON "VillageAdoptionProgramme"("zoneId");

-- CreateIndex
CREATE INDEX "VillageAdoptionProgramme_kvkId_reportingYear_idx" ON "VillageAdoptionProgramme"("kvkId", "reportingYear");

-- CreateIndex
CREATE INDEX "PriorityThrustArea_zoneId_idx" ON "PriorityThrustArea"("zoneId");

-- CreateIndex
CREATE INDEX "PriorityThrustArea_kvkId_reportingYear_idx" ON "PriorityThrustArea"("kvkId", "reportingYear");

-- CreateIndex
CREATE INDEX "DemonstrationUnit_zoneId_idx" ON "DemonstrationUnit"("zoneId");

-- CreateIndex
CREATE INDEX "DemonstrationUnit_kvkId_idx" ON "DemonstrationUnit"("kvkId");

-- CreateIndex
CREATE INDEX "InstructionalFarmCrop_zoneId_idx" ON "InstructionalFarmCrop"("zoneId");

-- CreateIndex
CREATE INDEX "InstructionalFarmCrop_kvkId_idx" ON "InstructionalFarmCrop"("kvkId");

-- CreateIndex
CREATE INDEX "ProductionUnit_zoneId_idx" ON "ProductionUnit"("zoneId");

-- CreateIndex
CREATE INDEX "ProductionUnit_kvkId_idx" ON "ProductionUnit"("kvkId");

-- CreateIndex
CREATE INDEX "InstructionalFarmLivestock_zoneId_idx" ON "InstructionalFarmLivestock"("zoneId");

-- CreateIndex
CREATE INDEX "InstructionalFarmLivestock_kvkId_idx" ON "InstructionalFarmLivestock"("kvkId");

-- CreateIndex
CREATE INDEX "HostelUtilization_zoneId_idx" ON "HostelUtilization"("zoneId");

-- CreateIndex
CREATE INDEX "HostelUtilization_kvkId_idx" ON "HostelUtilization"("kvkId");

-- CreateIndex
CREATE INDEX "StaffQuartersPerformance_zoneId_idx" ON "StaffQuartersPerformance"("zoneId");

-- CreateIndex
CREATE INDEX "StaffQuartersPerformance_kvkId_idx" ON "StaffQuartersPerformance"("kvkId");

-- CreateIndex
CREATE INDEX "RainWaterHarvesting_zoneId_idx" ON "RainWaterHarvesting"("zoneId");

-- CreateIndex
CREATE INDEX "RainWaterHarvesting_kvkId_idx" ON "RainWaterHarvesting"("kvkId");

-- CreateIndex
CREATE INDEX "BudgetDetail_zoneId_idx" ON "BudgetDetail"("zoneId");

-- CreateIndex
CREATE INDEX "BudgetDetail_kvkId_idx" ON "BudgetDetail"("kvkId");

-- CreateIndex
CREATE INDEX "ProjectWiseBudgetPerformance_zoneId_idx" ON "ProjectWiseBudgetPerformance"("zoneId");

-- CreateIndex
CREATE INDEX "ProjectWiseBudgetPerformance_kvkId_idx" ON "ProjectWiseBudgetPerformance"("kvkId");

-- CreateIndex
CREATE INDEX "RevolvingFund_zoneId_idx" ON "RevolvingFund"("zoneId");

-- CreateIndex
CREATE INDEX "RevolvingFund_kvkId_reportingYear_idx" ON "RevolvingFund"("kvkId", "reportingYear");

-- CreateIndex
CREATE INDEX "RevenueGeneration_zoneId_idx" ON "RevenueGeneration"("zoneId");

-- CreateIndex
CREATE INDEX "RevenueGeneration_kvkId_idx" ON "RevenueGeneration"("kvkId");

-- CreateIndex
CREATE INDEX "ResourceGeneration_zoneId_idx" ON "ResourceGeneration"("zoneId");

-- CreateIndex
CREATE INDEX "ResourceGeneration_kvkId_idx" ON "ResourceGeneration"("kvkId");

-- CreateIndex
CREATE INDEX "FunctionalLinkage_zoneId_idx" ON "FunctionalLinkage"("zoneId");

-- CreateIndex
CREATE INDEX "FunctionalLinkage_kvkId_idx" ON "FunctionalLinkage"("kvkId");

-- CreateIndex
CREATE INDEX "SpecialProgramme_zoneId_idx" ON "SpecialProgramme"("zoneId");

-- CreateIndex
CREATE INDEX "SpecialProgramme_kvkId_idx" ON "SpecialProgramme"("kvkId");

-- CreateIndex
CREATE INDEX "SacMeeting_zoneId_idx" ON "SacMeeting"("zoneId");

-- CreateIndex
CREATE INDEX "SacMeeting_kvkId_idx" ON "SacMeeting"("kvkId");

-- CreateIndex
CREATE INDEX "OtherMeeting_zoneId_idx" ON "OtherMeeting"("zoneId");

-- CreateIndex
CREATE INDEX "OtherMeeting_kvkId_idx" ON "OtherMeeting"("kvkId");

-- CreateIndex
CREATE INDEX "PrevalentDiseaseCrop_zoneId_idx" ON "PrevalentDiseaseCrop"("zoneId");

-- CreateIndex
CREATE INDEX "PrevalentDiseaseCrop_kvkId_idx" ON "PrevalentDiseaseCrop"("kvkId");

-- CreateIndex
CREATE INDEX "PrevalentDiseaseLivestock_zoneId_idx" ON "PrevalentDiseaseLivestock"("zoneId");

-- CreateIndex
CREATE INDEX "PrevalentDiseaseLivestock_kvkId_idx" ON "PrevalentDiseaseLivestock"("kvkId");

-- CreateIndex
CREATE INDEX "NykTraining_zoneId_idx" ON "NykTraining"("zoneId");

-- CreateIndex
CREATE INDEX "NykTraining_kvkId_idx" ON "NykTraining"("kvkId");

-- CreateIndex
CREATE INDEX "PpvFraTrainingProgramme_zoneId_idx" ON "PpvFraTrainingProgramme"("zoneId");

-- CreateIndex
CREATE INDEX "PpvFraTrainingProgramme_kvkId_idx" ON "PpvFraTrainingProgramme"("kvkId");

-- CreateIndex
CREATE INDEX "PpvFraFarmerDetail_zoneId_idx" ON "PpvFraFarmerDetail"("zoneId");

-- CreateIndex
CREATE INDEX "PpvFraFarmerDetail_kvkId_year_idx" ON "PpvFraFarmerDetail"("kvkId", "year");

-- CreateIndex
CREATE INDEX "RaweFetFitProgramme_zoneId_idx" ON "RaweFetFitProgramme"("zoneId");

-- CreateIndex
CREATE INDEX "RaweFetFitProgramme_kvkId_idx" ON "RaweFetFitProgramme"("kvkId");

-- CreateIndex
CREATE INDEX "VipVisitor_zoneId_idx" ON "VipVisitor"("zoneId");

-- CreateIndex
CREATE INDEX "VipVisitor_kvkId_idx" ON "VipVisitor"("kvkId");

-- CreateIndex
CREATE INDEX "DigitalMobileApp_zoneId_idx" ON "DigitalMobileApp"("zoneId");

-- CreateIndex
CREATE INDEX "DigitalMobileApp_kvkId_idx" ON "DigitalMobileApp"("kvkId");

-- CreateIndex
CREATE INDEX "DigitalWebPortal_zoneId_idx" ON "DigitalWebPortal"("zoneId");

-- CreateIndex
CREATE INDEX "DigitalWebPortal_kvkId_idx" ON "DigitalWebPortal"("kvkId");

-- CreateIndex
CREATE INDEX "DigitalKisanSarathi_zoneId_idx" ON "DigitalKisanSarathi"("zoneId");

-- CreateIndex
CREATE INDEX "DigitalKisanSarathi_kvkId_idx" ON "DigitalKisanSarathi"("kvkId");

-- CreateIndex
CREATE INDEX "DigitalKmas_zoneId_idx" ON "DigitalKmas"("zoneId");

-- CreateIndex
CREATE INDEX "DigitalKmas_kvkId_idx" ON "DigitalKmas"("kvkId");

-- CreateIndex
CREATE INDEX "DigitalOtherChannel_zoneId_idx" ON "DigitalOtherChannel"("zoneId");

-- CreateIndex
CREATE INDEX "DigitalOtherChannel_kvkId_idx" ON "DigitalOtherChannel"("kvkId");

-- AddForeignKey
ALTER TABLE "KvkActivityImpact" ADD CONSTRAINT "KvkActivityImpact_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntrepreneurshipDetail" ADD CONSTRAINT "EntrepreneurshipDetail_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuccessStory" ADD CONSTRAINT "SuccessStory_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistrictLevelData" ADD CONSTRAINT "DistrictLevelData_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationalAreaDetail" ADD CONSTRAINT "OperationalAreaDetail_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VillageAdoptionProgramme" ADD CONSTRAINT "VillageAdoptionProgramme_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriorityThrustArea" ADD CONSTRAINT "PriorityThrustArea_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemonstrationUnit" ADD CONSTRAINT "DemonstrationUnit_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructionalFarmCrop" ADD CONSTRAINT "InstructionalFarmCrop_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionUnit" ADD CONSTRAINT "ProductionUnit_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructionalFarmLivestock" ADD CONSTRAINT "InstructionalFarmLivestock_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelUtilization" ADD CONSTRAINT "HostelUtilization_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffQuartersPerformance" ADD CONSTRAINT "StaffQuartersPerformance_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RainWaterHarvesting" ADD CONSTRAINT "RainWaterHarvesting_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetDetail" ADD CONSTRAINT "BudgetDetail_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectWiseBudgetPerformance" ADD CONSTRAINT "ProjectWiseBudgetPerformance_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevolvingFund" ADD CONSTRAINT "RevolvingFund_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueGeneration" ADD CONSTRAINT "RevenueGeneration_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceGeneration" ADD CONSTRAINT "ResourceGeneration_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FunctionalLinkage" ADD CONSTRAINT "FunctionalLinkage_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialProgramme" ADD CONSTRAINT "SpecialProgramme_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SacMeeting" ADD CONSTRAINT "SacMeeting_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtherMeeting" ADD CONSTRAINT "OtherMeeting_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrevalentDiseaseCrop" ADD CONSTRAINT "PrevalentDiseaseCrop_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrevalentDiseaseLivestock" ADD CONSTRAINT "PrevalentDiseaseLivestock_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NykTraining" ADD CONSTRAINT "NykTraining_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PpvFraTrainingProgramme" ADD CONSTRAINT "PpvFraTrainingProgramme_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PpvFraFarmerDetail" ADD CONSTRAINT "PpvFraFarmerDetail_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaweFetFitProgramme" ADD CONSTRAINT "RaweFetFitProgramme_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VipVisitor" ADD CONSTRAINT "VipVisitor_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalMobileApp" ADD CONSTRAINT "DigitalMobileApp_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalWebPortal" ADD CONSTRAINT "DigitalWebPortal_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalKisanSarathi" ADD CONSTRAINT "DigitalKisanSarathi_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalKmas" ADD CONSTRAINT "DigitalKmas_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalOtherChannel" ADD CONSTRAINT "DigitalOtherChannel_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
