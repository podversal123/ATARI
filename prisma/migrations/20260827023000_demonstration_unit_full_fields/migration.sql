-- Real "4.3.A Demonstration Units" report table (super-v2-prod.pdf p.84) has 6 more columns than this model originally captured.
ALTER TABLE "DemonstrationUnit" ADD COLUMN "varietyBreed" TEXT;
ALTER TABLE "DemonstrationUnit" ADD COLUMN "produce" TEXT;
ALTER TABLE "DemonstrationUnit" ADD COLUMN "qty" DECIMAL(12,2);
ALTER TABLE "DemonstrationUnit" ADD COLUMN "costOfInputs" DECIMAL(14,2);
ALTER TABLE "DemonstrationUnit" ADD COLUMN "grossIncome" DECIMAL(14,2);
ALTER TABLE "DemonstrationUnit" ADD COLUMN "remarks" TEXT;
