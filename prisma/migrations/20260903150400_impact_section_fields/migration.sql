-- AlterTable
ALTER TABLE "EntrepreneurshipDetail" ADD COLUMN     "economicSocialStatus" TEXT,
ADD COLUMN     "majorAchievements" TEXT,
ADD COLUMN     "majorConstraints" TEXT,
ADD COLUMN     "periodTimeline" TEXT,
ADD COLUMN     "presentWorkingCondition" TEXT,
ADD COLUMN     "registeredAddress" TEXT,
ADD COLUMN     "registrationDetails" TEXT,
ADD COLUMN     "reportingYear" INTEGER,
ADD COLUMN     "roleOfKvk" TEXT;

-- AlterTable
ALTER TABLE "KvkActivityImpact" ADD COLUMN     "reportingYear" INTEGER;

-- AlterTable
ALTER TABLE "SuccessStory" ADD COLUMN     "awardsReceived" TEXT,
ADD COLUMN     "cellNoEmail" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "detailsOfPractices" TEXT,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "fullAddress" TEXT,
ADD COLUMN     "futurePlans" TEXT,
ADD COLUMN     "grossIncome" DECIMAL(14,2),
ADD COLUMN     "impactOutcome" TEXT,
ADD COLUMN     "planImplementSupport" TEXT,
ADD COLUMN     "professionalMembership" TEXT,
ADD COLUMN     "reportingYear" INTEGER,
ADD COLUMN     "resultsOutput" TEXT,
ADD COLUMN     "situationAnalysis" TEXT,
ADD COLUMN     "supportingImageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
