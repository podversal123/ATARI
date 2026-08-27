-- Batch 2 of the super-v2-prod.pdf field audit: 17 models across Agri-Drone, Budget Details, CRA, FPO, Hostel Facilities, Instructional Farm (crop/livestock), NARI Training/Extension, Other Programmes, PPV&FRA (both tables), Prevalent Diseases (Livestock), Production Units, Project-wise Budget, Resource Generation, Seed Hub Program.
-- AlterTable
ALTER TABLE "AgriDroneIntroduction" ADD COLUMN     "advantages" TEXT,
ADD COLUMN     "amountSanctionedDemo" DECIMAL(14,2),
ADD COLUMN     "amountUtilisedDemo" DECIMAL(14,2),
ADD COLUMN     "areaCoveredDemoHa" DECIMAL(10,2),
ADD COLUMN     "costPerDrone" DECIMAL(14,2),
ADD COLUMN     "farmersParticipated" INTEGER,
ADD COLUMN     "operationType" TEXT,
ADD COLUMN     "pilotNameContact" TEXT,
ADD COLUMN     "targetAreaHa" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "BudgetDetail" ADD COLUMN     "capitalMainGrant" DECIMAL(14,2),
ADD COLUMN     "capitalScsp" DECIMAL(14,2),
ADD COLUMN     "capitalTsp" DECIMAL(14,2),
ADD COLUMN     "generalMainGrant" DECIMAL(14,2),
ADD COLUMN     "generalScsp" DECIMAL(14,2),
ADD COLUMN     "generalTsp" DECIMAL(14,2);

-- AlterTable
ALTER TABLE "CraDetail" ADD COLUMN     "crop" TEXT,
ADD COLUMN     "cropYieldQha" DECIMAL(10,2),
ADD COLUMN     "farmersByCategory" JSONB,
ADD COLUMN     "farmingSystem" TEXT,
ADD COLUMN     "systemProductivityQha" DECIMAL(10,2),
ADD COLUMN     "totalReturnRsHa" DECIMAL(14,2),
ADD COLUMN     "yieldFarmerPracticeQha" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "FpoManagement" ADD COLUMN     "areaHa" DECIMAL(10,2),
ADD COLUMN     "commodityIdentified" TEXT,
ADD COLUMN     "proposedActivity" TEXT,
ADD COLUMN     "successIndicator" TEXT,
ADD COLUMN     "totalFarmersAttached" INTEGER;

-- AlterTable
ALTER TABLE "HostelUtilization" ADD COLUMN     "reasonForShortFall" TEXT;

-- AlterTable
ALTER TABLE "InstructionalFarmCrop" ADD COLUMN     "costOfInputs" DECIMAL(14,2),
ADD COLUMN     "grossIncome" DECIMAL(14,2),
ADD COLUMN     "produceType" TEXT,
ADD COLUMN     "qty" DECIMAL(12,2),
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "season" TEXT,
ADD COLUMN     "variety" TEXT;

-- AlterTable
ALTER TABLE "InstructionalFarmLivestock" ADD COLUMN     "costOfInputs" DECIMAL(14,2),
ADD COLUMN     "grossIncome" DECIMAL(14,2),
ADD COLUMN     "qty" DECIMAL(12,2),
ADD COLUMN     "remarks" TEXT;

-- AlterTable
ALTER TABLE "NariExtension" ADD COLUMN     "female" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "male" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "NariTraining" ADD COLUMN     "female" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "male" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "numberOfCourses" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "OtherProgramme" ADD COLUMN     "farmersByCategory" JSONB;

-- AlterTable
ALTER TABLE "PpvFraFarmerDetail" ADD COLUMN     "characteristics" TEXT,
ADD COLUMN     "mobileNo" TEXT,
ADD COLUMN     "village" TEXT;

-- AlterTable
ALTER TABLE "PpvFraTrainingProgramme" ADD COLUMN     "farmersByCategory" JSONB;

-- AlterTable
ALTER TABLE "PrevalentDiseaseLivestock" ADD COLUMN     "areaAffected" DECIMAL(10,2),
ADD COLUMN     "commodityLossPercent" DECIMAL(5,2);

-- AlterTable
ALTER TABLE "ProductionUnit" ADD COLUMN     "costOfInputs" DECIMAL(14,2),
ADD COLUMN     "grossIncome" DECIMAL(14,2),
ADD COLUMN     "remarks" TEXT;

-- AlterTable
ALTER TABLE "ProjectWiseBudgetPerformance" ADD COLUMN     "accountNumber" TEXT;

-- AlterTable
ALTER TABLE "ResourceGeneration" ADD COLUMN     "infrastructureCreated" TEXT;

-- AlterTable
ALTER TABLE "SeedHubProgram" ADD COLUMN     "amountGeneratedLakh" DECIMAL(14,2),
ADD COLUMN     "farmersPurchased" INTEGER,
ADD COLUMN     "qtySeedProducedQ" DECIMAL(12,2),
ADD COLUMN     "qtySeedSaleOutOtherOrgQ" DECIMAL(12,2),
ADD COLUMN     "qtySeedSaleOutQ" DECIMAL(12,2),
ADD COLUMN     "qtySeedSaleOutToFarmersQ" DECIMAL(12,2),
ADD COLUMN     "totalAmountInProjectLakh" DECIMAL(14,2),
ADD COLUMN     "villagesCovered" INTEGER;

