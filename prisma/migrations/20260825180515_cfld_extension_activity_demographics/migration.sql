-- Real per-category farmer counts (CFLD Extension Activity.pdf, 2026-08-25) replace the single aggregate count.
ALTER TABLE "CfldExtensionActivity" DROP COLUMN "farmersAttended";
ALTER TABLE "CfldExtensionActivity" ADD COLUMN "generalMale" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CfldExtensionActivity" ADD COLUMN "generalFemale" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CfldExtensionActivity" ADD COLUMN "obcMale" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CfldExtensionActivity" ADD COLUMN "obcFemale" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CfldExtensionActivity" ADD COLUMN "scMale" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CfldExtensionActivity" ADD COLUMN "scFemale" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CfldExtensionActivity" ADD COLUMN "stMale" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CfldExtensionActivity" ADD COLUMN "stFemale" INTEGER NOT NULL DEFAULT 0;
