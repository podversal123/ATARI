-- AlterTable
ALTER TABLE "AgriDroneDemonstration" ADD COLUMN     "generalFemale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "generalMale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "obcFemale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "obcMale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scFemale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scMale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stFemale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stMale" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "AryaCurrentYearDetail" ADD COLUMN     "avgUnitSize" DECIMAL(14,2),
ADD COLUMN     "costPerUnit" DECIMAL(14,2),
ADD COLUMN     "economicGainsPerUnit" DECIMAL(14,2),
ADD COLUMN     "employmentMandaysFemale" INTEGER,
ADD COLUMN     "employmentMandaysMale" INTEGER,
ADD COLUMN     "productionPerUnit" DECIMAL(14,2),
ADD COLUMN     "ruralYouthFemale" INTEGER,
ADD COLUMN     "ruralYouthMale" INTEGER,
ADD COLUMN     "saleValue" DECIMAL(14,2),
ADD COLUMN     "trainingsConducted" INTEGER,
ADD COLUMN     "unitsEstablished" INTEGER;

-- AlterTable
ALTER TABLE "AryaPreviousYearEvaluation" ADD COLUMN     "costFixed" DECIMAL(14,2),
ADD COLUMN     "costVariable" DECIMAL(14,2),
ADD COLUMN     "employmentFamily" INTEGER,
ADD COLUMN     "employmentOtherThanFamily" INTEGER,
ADD COLUMN     "grossCostPerUnitYear" DECIMAL(14,2),
ADD COLUMN     "grossReturnPerUnitYear" DECIMAL(14,2),
ADD COLUMN     "netBenefitPerUnitYear" DECIMAL(14,2),
ADD COLUMN     "personsVisited" INTEGER,
ADD COLUMN     "sizeFemale" INTEGER,
ADD COLUMN     "sizeMale" INTEGER,
ADD COLUMN     "sizeNoOfUnit" INTEGER,
ADD COLUMN     "sizeUnitCapacity" DECIMAL(14,2),
ADD COLUMN     "totalProductionPerUnitYear" DECIMAL(14,2),
ADD COLUMN     "unitsEstablishedProgressive" INTEGER;

-- AlterTable
ALTER TABLE "CfldTechnicalParameter" ADD COLUMN     "targetAreaHa" DECIMAL(10,2),
ADD COLUMN     "targetDemonstrations" INTEGER;

-- AlterTable
ALTER TABLE "FpoCbboDetail" ADD COLUMN     "assistanceEconomicActivities" INTEGER,
ADD COLUMN     "avgMembersPerFpo" INTEGER,
ADD COLUMN     "businessPlanWithoutCbbo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "noOfFpoEquityGrant" INTEGER,
ADD COLUMN     "noOfFpoManagementCost" INTEGER,
ADD COLUMN     "noOfTrainingProgrammes" INTEGER,
ADD COLUMN     "techBackstoppingFpos" INTEGER;

-- AlterTable
ALTER TABLE "NfBeneficiary" ADD COLUMN     "farmersEngagedAllSeason" INTEGER,
ADD COLUMN     "farmersEngagedOneSeason" INTEGER,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "reportingYear" INTEGER;

-- AlterTable
ALTER TABLE "NfPhysicalInfo" ADD COLUMN     "generalFemale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "generalMale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "obcFemale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "obcMale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "scFemale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scMale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stFemale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stMale" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "NfSoilData" ADD COLUMN     "afterK" DECIMAL(10,2),
ADD COLUMN     "afterMicrobes" DECIMAL(14,2),
ADD COLUMN     "afterN" DECIMAL(10,2),
ADD COLUMN     "afterP" DECIMAL(10,2),
ADD COLUMN     "beforeK" DECIMAL(10,2),
ADD COLUMN     "beforeMicrobes" DECIMAL(14,2),
ADD COLUMN     "beforeN" DECIMAL(10,2),
ADD COLUMN     "beforeP" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "NicraBasicInformation" ADD COLUMN     "drySpell10Days" INTEGER,
ADD COLUMN     "drySpell15Days" INTEGER,
ADD COLUMN     "drySpell20Days" INTEGER,
ADD COLUMN     "floodDurationDays" INTEGER,
ADD COLUMN     "floodIntensiveRainMm" DECIMAL(10,2),
ADD COLUMN     "floodWaterDepthCm" DECIMAL(10,2),
ADD COLUMN     "nicraAdoptedVillages" INTEGER;

-- AlterTable
ALTER TABLE "NicraDetails" ADD COLUMN     "areaOrUnit" DECIMAL(14,2),
ADD COLUMN     "category" TEXT,
ADD COLUMN     "netReturn" DECIMAL(14,2),
ADD COLUMN     "subCategory" TEXT;
