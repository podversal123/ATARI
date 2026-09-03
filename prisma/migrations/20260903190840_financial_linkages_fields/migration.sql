-- Real Add form fields confirmed live (atariams.org, 2026-09-04) for Financial Performance's
-- 5 leaves and Linkages' 2 leaves - were missing entirely before (Financial Year date ranges,
-- the real TSP/SCSP Allocation+Expenditure pairs on Budget Details, Reporting Year on both
-- Linkages leaves, and 3 more fields on Special Programmes). IF NOT EXISTS makes this
-- idempotent, same reasoning as this session's other migrations.

ALTER TABLE "BudgetDetail" ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3);
ALTER TABLE "BudgetDetail" ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP(3);
ALTER TABLE "BudgetDetail" ADD COLUMN IF NOT EXISTS "generalTspExpenditure" DECIMAL(14,2);
ALTER TABLE "BudgetDetail" ADD COLUMN IF NOT EXISTS "generalScspExpenditure" DECIMAL(14,2);
ALTER TABLE "BudgetDetail" ADD COLUMN IF NOT EXISTS "capitalTspExpenditure" DECIMAL(14,2);
ALTER TABLE "BudgetDetail" ADD COLUMN IF NOT EXISTS "capitalScspExpenditure" DECIMAL(14,2);

ALTER TABLE "ProjectWiseBudgetPerformance" ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3);
ALTER TABLE "ProjectWiseBudgetPerformance" ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP(3);

ALTER TABLE "RevenueGeneration" ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3);
ALTER TABLE "RevenueGeneration" ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP(3);

ALTER TABLE "ResourceGeneration" ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3);
ALTER TABLE "ResourceGeneration" ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP(3);

ALTER TABLE "FunctionalLinkage" ADD COLUMN IF NOT EXISTS "reportingYear" INTEGER;

ALTER TABLE "SpecialProgramme" ADD COLUMN IF NOT EXISTS "reportingYear" INTEGER;
ALTER TABLE "SpecialProgramme" ADD COLUMN IF NOT EXISTS "purpose" TEXT;
ALTER TABLE "SpecialProgramme" ADD COLUMN IF NOT EXISTS "fundingAgency" TEXT;
ALTER TABLE "SpecialProgramme" ADD COLUMN IF NOT EXISTS "amount" DECIMAL(14,2);
