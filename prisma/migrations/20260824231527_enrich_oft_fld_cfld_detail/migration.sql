/*
  Warnings:

  - You are about to drop the column `technologyDemonstrated` on the `CfldTechnicalParameter` table. All the data in the column will be lost.
  - Added the required column `cropDemonstrated` to the `CfldTechnicalParameter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `detailOfTechnologyDemonstrated` to the `CfldTechnicalParameter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `season` to the `CfldTechnicalParameter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discipline` to the `Oft` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thematicArea` to the `Oft` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CfldTechnicalParameter" DROP COLUMN "technologyDemonstrated",
ADD COLUMN     "cropDemonstrated" TEXT NOT NULL,
ADD COLUMN     "detailOfTechnologyDemonstrated" TEXT NOT NULL,
ADD COLUMN     "existingFarmerPractice" TEXT,
ADD COLUMN     "farmersByCategory" JSONB,
ADD COLUMN     "percentIncrease" DECIMAL(6,2),
ADD COLUMN     "season" TEXT NOT NULL,
ADD COLUMN     "yieldDemoAvgQha" DECIMAL(10,2),
ADD COLUMN     "yieldDemoMaxQha" DECIMAL(10,2),
ADD COLUMN     "yieldDemoMinQha" DECIMAL(10,2),
ADD COLUMN     "yieldFarmerFieldQha" DECIMAL(10,2),
ADD COLUMN     "yieldGapKgHaDistrict" DECIMAL(10,2),
ADD COLUMN     "yieldGapKgHaPotential" DECIMAL(10,2),
ADD COLUMN     "yieldGapKgHaState" DECIMAL(10,2),
ADD COLUMN     "yieldGapMinimizedPercentDistrict" DECIMAL(6,2),
ADD COLUMN     "yieldGapMinimizedPercentPotential" DECIMAL(6,2),
ADD COLUMN     "yieldGapMinimizedPercentState" DECIMAL(6,2);

-- AlterTable
ALTER TABLE "Oft" ADD COLUMN     "constraintsIdentified" TEXT,
ADD COLUMN     "costOfOft" DECIMAL(12,2),
ADD COLUMN     "criticalInput" TEXT,
ADD COLUMN     "discipline" TEXT NOT NULL,
ADD COLUMN     "endMonth" TIMESTAMP(3),
ADD COLUMN     "farmersParticipationProcess" TEXT,
ADD COLUMN     "finalRecommendation" TEXT,
ADD COLUMN     "fundingAgency" TEXT,
ADD COLUMN     "noOfTrialReplicationFarmer" INTEGER,
ADD COLUMN     "performanceIndicators" TEXT,
ADD COLUMN     "productionSystem" TEXT,
ADD COLUMN     "quantity" DECIMAL(10,2),
ADD COLUMN     "resultSummary" TEXT,
ADD COLUMN     "sourceOfTechnology" TEXT,
ADD COLUMN     "startMonth" TIMESTAMP(3),
ADD COLUMN     "thematicArea" TEXT NOT NULL,
ADD COLUMN     "unit" TEXT;

-- CreateTable
CREATE TABLE "OftTechnologyOption" (
    "id" TEXT NOT NULL,
    "oftId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "OftTechnologyOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OftResultRow" (
    "id" TEXT NOT NULL,
    "oftId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "technologyOption" TEXT NOT NULL,
    "proposed" TEXT,
    "actual" TEXT,

    CONSTRAINT "OftResultRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FldDemonstrationDetail" (
    "id" TEXT NOT NULL,
    "fldId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "cropOrItem" TEXT NOT NULL,
    "thematicArea" TEXT,
    "technologyDemonstrated" TEXT,
    "noOfDemonstrations" INTEGER NOT NULL,
    "noOfFarmers" INTEGER NOT NULL,
    "areaHa" DECIMAL(10,2) NOT NULL,
    "yieldDemoQha" DECIMAL(10,2),
    "yieldCheckQha" DECIMAL(10,2),
    "percentIncrease" DECIMAL(6,2),
    "grossCostDemo" DECIMAL(12,2),
    "grossReturnDemo" DECIMAL(12,2),
    "netReturnDemo" DECIMAL(12,2),
    "bcrDemo" DECIMAL(6,2),
    "grossCostCheck" DECIMAL(12,2),
    "grossReturnCheck" DECIMAL(12,2),
    "netReturnCheck" DECIMAL(12,2),
    "bcrCheck" DECIMAL(6,2),
    "laborReductionManDays" DECIMAL(10,2),
    "costReductionRs" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FldDemonstrationDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CfldEconomicParameter" (
    "id" TEXT NOT NULL,
    "cfldTechnicalParameterId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "detailOfTechnology" TEXT NOT NULL,
    "farmerGrossCost" DECIMAL(12,2),
    "farmerGrossReturn" DECIMAL(12,2),
    "farmerNetReturn" DECIMAL(12,2),
    "farmerBcRatio" DECIMAL(6,2),
    "demoGrossCost" DECIMAL(12,2),
    "demoGrossReturn" DECIMAL(12,2),
    "demoNetReturn" DECIMAL(12,2),
    "demoBcRatio" DECIMAL(6,2),
    "additionalIncome" DECIMAL(12,2),

    CONSTRAINT "CfldEconomicParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CfldSocioEconomicImpact" (
    "id" TEXT NOT NULL,
    "cfldTechnicalParameterId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "cropDemonstrated" TEXT NOT NULL,
    "totalProduceObtainedKg" DECIMAL(12,2),
    "produceSoldKgPerHousehold" DECIMAL(12,2),
    "sellingRatePerKg" DECIMAL(10,2),
    "produceUsedOwnFarmKg" DECIMAL(12,2),
    "produceDistributedToOthersKg" DECIMAL(12,2),
    "purposeOfIncomeUtilized" TEXT,
    "employmentGeneratedMandays" DECIMAL(10,2),

    CONSTRAINT "CfldSocioEconomicImpact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CfldFarmersPerception" (
    "id" TEXT NOT NULL,
    "cfldTechnicalParameterId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "technologyDetail" TEXT NOT NULL,
    "suitability" TEXT,
    "liking" TEXT,
    "affordabilityPercent" DECIMAL(5,2),
    "negativeEffect" TEXT,
    "acceptableToGroup" TEXT,
    "suggestions" TEXT,
    "farmerFeedback" TEXT,

    CONSTRAINT "CfldFarmersPerception_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OftTechnologyOption_zoneId_idx" ON "OftTechnologyOption"("zoneId");

-- CreateIndex
CREATE INDEX "OftTechnologyOption_oftId_idx" ON "OftTechnologyOption"("oftId");

-- CreateIndex
CREATE INDEX "OftResultRow_zoneId_idx" ON "OftResultRow"("zoneId");

-- CreateIndex
CREATE INDEX "OftResultRow_oftId_idx" ON "OftResultRow"("oftId");

-- CreateIndex
CREATE INDEX "FldDemonstrationDetail_zoneId_idx" ON "FldDemonstrationDetail"("zoneId");

-- CreateIndex
CREATE INDEX "FldDemonstrationDetail_fldId_idx" ON "FldDemonstrationDetail"("fldId");

-- CreateIndex
CREATE INDEX "CfldEconomicParameter_zoneId_idx" ON "CfldEconomicParameter"("zoneId");

-- CreateIndex
CREATE INDEX "CfldEconomicParameter_cfldTechnicalParameterId_idx" ON "CfldEconomicParameter"("cfldTechnicalParameterId");

-- CreateIndex
CREATE INDEX "CfldSocioEconomicImpact_zoneId_idx" ON "CfldSocioEconomicImpact"("zoneId");

-- CreateIndex
CREATE INDEX "CfldSocioEconomicImpact_cfldTechnicalParameterId_idx" ON "CfldSocioEconomicImpact"("cfldTechnicalParameterId");

-- CreateIndex
CREATE INDEX "CfldFarmersPerception_zoneId_idx" ON "CfldFarmersPerception"("zoneId");

-- CreateIndex
CREATE INDEX "CfldFarmersPerception_cfldTechnicalParameterId_idx" ON "CfldFarmersPerception"("cfldTechnicalParameterId");

-- AddForeignKey
ALTER TABLE "OftTechnologyOption" ADD CONSTRAINT "OftTechnologyOption_oftId_fkey" FOREIGN KEY ("oftId") REFERENCES "Oft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OftResultRow" ADD CONSTRAINT "OftResultRow_oftId_fkey" FOREIGN KEY ("oftId") REFERENCES "Oft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FldDemonstrationDetail" ADD CONSTRAINT "FldDemonstrationDetail_fldId_fkey" FOREIGN KEY ("fldId") REFERENCES "Fld"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CfldEconomicParameter" ADD CONSTRAINT "CfldEconomicParameter_cfldTechnicalParameterId_fkey" FOREIGN KEY ("cfldTechnicalParameterId") REFERENCES "CfldTechnicalParameter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CfldSocioEconomicImpact" ADD CONSTRAINT "CfldSocioEconomicImpact_cfldTechnicalParameterId_fkey" FOREIGN KEY ("cfldTechnicalParameterId") REFERENCES "CfldTechnicalParameter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CfldFarmersPerception" ADD CONSTRAINT "CfldFarmersPerception_cfldTechnicalParameterId_fkey" FOREIGN KEY ("cfldTechnicalParameterId") REFERENCES "CfldTechnicalParameter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
