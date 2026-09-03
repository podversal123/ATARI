-- AlterTable
ALTER TABLE "DigitalWebPortal" ADD COLUMN     "portalName" TEXT;

-- AlterTable
ALTER TABLE "EntrepreneurshipDetail" ADD COLUMN     "technicalComponents" TEXT,
ADD COLUMN     "yearOfEstablishment" INTEGER;

-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "equipmentType" TEXT;

-- AlterTable
ALTER TABLE "Infrastructure" ADD COLUMN     "fundingAgencyName" TEXT;

-- AlterTable
ALTER TABLE "KvkActivityImpact" ADD COLUMN     "impactObjective" TEXT,
ADD COLUMN     "impactSubjective" TEXT,
ADD COLUMN     "incomeAfter" DECIMAL(14,2),
ADD COLUMN     "incomeBefore" DECIMAL(14,2);

-- AlterTable
ALTER TABLE "PriorityThrustArea" ADD COLUMN     "achievement" TEXT,
ADD COLUMN     "majorFocus" TEXT;

-- AlterTable
ALTER TABLE "SuccessStory" ADD COLUMN     "costBenefitRatio" DECIMAL(8,2),
ADD COLUMN     "enterprise" TEXT,
ADD COLUMN     "netIncome" DECIMAL(14,2);

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "vehicleType" TEXT;
