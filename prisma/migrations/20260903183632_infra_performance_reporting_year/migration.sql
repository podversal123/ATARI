-- Adds the missing "Reporting Year" field (real Add form field on
-- atariams.org for these 5 Infrastructure Performance leaves, confirmed
-- live 2026-09-03/04) to 5 models, plus catches up 3 Impact-section models
-- (KvkActivityImpact, EntrepreneurshipDetail, SuccessStory) whose columns
-- from an earlier migration were recorded as applied in _prisma_migrations
-- but never actually landed on the live database (same silent-drift issue
-- documented in this session) - IF NOT EXISTS makes this safe to run
-- against a database that already has some or all of these columns.

ALTER TABLE "KvkActivityImpact" ADD COLUMN IF NOT EXISTS "reportingYear" INTEGER;

ALTER TABLE "EntrepreneurshipDetail" ADD COLUMN IF NOT EXISTS "reportingYear" INTEGER;
ALTER TABLE "EntrepreneurshipDetail" ADD COLUMN IF NOT EXISTS "registeredAddress" TEXT;
ALTER TABLE "EntrepreneurshipDetail" ADD COLUMN IF NOT EXISTS "registrationDetails" TEXT;
ALTER TABLE "EntrepreneurshipDetail" ADD COLUMN IF NOT EXISTS "roleOfKvk" TEXT;
ALTER TABLE "EntrepreneurshipDetail" ADD COLUMN IF NOT EXISTS "periodTimeline" TEXT;
ALTER TABLE "EntrepreneurshipDetail" ADD COLUMN IF NOT EXISTS "economicSocialStatus" TEXT;
ALTER TABLE "EntrepreneurshipDetail" ADD COLUMN IF NOT EXISTS "presentWorkingCondition" TEXT;
ALTER TABLE "EntrepreneurshipDetail" ADD COLUMN IF NOT EXISTS "majorAchievements" TEXT;
ALTER TABLE "EntrepreneurshipDetail" ADD COLUMN IF NOT EXISTS "majorConstraints" TEXT;

ALTER TABLE "SuccessStory" ADD COLUMN IF NOT EXISTS "reportingYear" INTEGER;
ALTER TABLE "SuccessStory" ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3);
ALTER TABLE "SuccessStory" ADD COLUMN IF NOT EXISTS "education" TEXT;
ALTER TABLE "SuccessStory" ADD COLUMN IF NOT EXISTS "cellNoEmail" TEXT;
ALTER TABLE "SuccessStory" ADD COLUMN IF NOT EXISTS "fullAddress" TEXT;
ALTER TABLE "SuccessStory" ADD COLUMN IF NOT EXISTS "professionalMembership" TEXT;
ALTER TABLE "SuccessStory" ADD COLUMN IF NOT EXISTS "awardsReceived" TEXT;
ALTER TABLE "SuccessStory" ADD COLUMN IF NOT EXISTS "situationAnalysis" TEXT;
ALTER TABLE "SuccessStory" ADD COLUMN IF NOT EXISTS "planImplementSupport" TEXT;
ALTER TABLE "SuccessStory" ADD COLUMN IF NOT EXISTS "detailsOfPractices" TEXT;
ALTER TABLE "SuccessStory" ADD COLUMN IF NOT EXISTS "resultsOutput" TEXT;
ALTER TABLE "SuccessStory" ADD COLUMN IF NOT EXISTS "impactOutcome" TEXT;
ALTER TABLE "SuccessStory" ADD COLUMN IF NOT EXISTS "futurePlans" TEXT;
ALTER TABLE "SuccessStory" ADD COLUMN IF NOT EXISTS "supportingImageUrls" TEXT[] DEFAULT '{}';
ALTER TABLE "SuccessStory" ADD COLUMN IF NOT EXISTS "grossIncome" DECIMAL(14,2);

ALTER TABLE "DemonstrationUnit" ADD COLUMN IF NOT EXISTS "reportingYear" INTEGER;
ALTER TABLE "InstructionalFarmCrop" ADD COLUMN IF NOT EXISTS "reportingYear" INTEGER;
ALTER TABLE "ProductionUnit" ADD COLUMN IF NOT EXISTS "reportingYear" INTEGER;
ALTER TABLE "InstructionalFarmLivestock" ADD COLUMN IF NOT EXISTS "reportingYear" INTEGER;
ALTER TABLE "HostelUtilization" ADD COLUMN IF NOT EXISTS "reportingYear" INTEGER;
