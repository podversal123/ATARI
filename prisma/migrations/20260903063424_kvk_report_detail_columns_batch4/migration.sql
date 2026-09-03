-- AlterTable
ALTER TABLE "NicraBasicInformation" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "reportingDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "NicraDetails" ADD COLUMN     "bcr" DECIMAL(8,2),
ADD COLUMN     "generalFemale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "generalMale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "grossCost" DECIMAL(14,2),
ADD COLUMN     "grossReturn" DECIMAL(14,2),
ADD COLUMN     "month" TEXT,
ADD COLUMN     "obcFemale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "obcMale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scFemale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scMale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stFemale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stMale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "yield" DECIMAL(14,2);

-- AlterTable
ALTER TABLE "NicraTraining" ADD COLUMN     "duration" TEXT,
ADD COLUMN     "trainingType" TEXT;

-- AlterTable
ALTER TABLE "Publication" ADD COLUMN     "isbnNumber" TEXT,
ADD COLUMN     "naasRating" TEXT,
ADD COLUMN     "pageNumber" TEXT,
ADD COLUMN     "publisherName" TEXT;

-- AlterTable
ALTER TABLE "SubPlanActivity" ADD COLUMN     "fundReceivedLakh" DECIMAL(14,2),
ADD COLUMN     "locationBeneficiaries" JSONB,
ADD COLUMN     "physicalOutcomeNote" TEXT;
