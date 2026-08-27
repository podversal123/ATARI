-- Real "3.5.C Demonstration Information" / "3.5.D Farmers Practicing" (super-v2-prod.pdf p.65, 68-74) are full per-farmer narrative writeups, not the original 4/4 flat fields.
ALTER TABLE "NfDemonstrationInfo" ADD COLUMN "farmerAddress" TEXT;
ALTER TABLE "NfDemonstrationInfo" ADD COLUMN "farmerContact" TEXT;
ALTER TABLE "NfDemonstrationInfo" ADD COLUMN "agroClimaticZone" TEXT;
ALTER TABLE "NfDemonstrationInfo" ADD COLUMN "croppingPattern" TEXT;
ALTER TABLE "NfDemonstrationInfo" ADD COLUMN "farmingSituation" TEXT;
ALTER TABLE "NfDemonstrationInfo" ADD COLUMN "latitude" DECIMAL(10,4);
ALTER TABLE "NfDemonstrationInfo" ADD COLUMN "longitude" DECIMAL(10,4);
ALTER TABLE "NfDemonstrationInfo" ADD COLUMN "season" TEXT;
ALTER TABLE "NfDemonstrationInfo" ADD COLUMN "technologyDemonstrated" TEXT;
ALTER TABLE "NfDemonstrationInfo" ADD COLUMN "areaHa" DECIMAL(10,2);
ALTER TABLE "NfDemonstrationInfo" ADD COLUMN "farmerPracticeDetail" TEXT;
ALTER TABLE "NfDemonstrationInfo" ADD COLUMN "parameters" JSONB;
ALTER TABLE "NfDemonstrationInfo" ADD COLUMN "farmerFeedback" TEXT;

ALTER TABLE "NfAlreadyPracticing" ADD COLUMN "contactNumber" TEXT;
ALTER TABLE "NfAlreadyPracticing" ADD COLUMN "activityName" TEXT;
ALTER TABLE "NfAlreadyPracticing" ADD COLUMN "crop" TEXT;
ALTER TABLE "NfAlreadyPracticing" ADD COLUMN "technologyDemonstrated" TEXT;
ALTER TABLE "NfAlreadyPracticing" ADD COLUMN "areaHa" DECIMAL(10,2);
ALTER TABLE "NfAlreadyPracticing" ADD COLUMN "parameters" JSONB;
ALTER TABLE "NfAlreadyPracticing" ADD COLUMN "farmerFeedback" TEXT;
