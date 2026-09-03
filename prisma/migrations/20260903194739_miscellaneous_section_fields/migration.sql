-- Real Add form fields confirmed live (atariams.org, 2026-09-04) for the Miscellaneous
-- Information section's leaves - NYK Training's real General/OBC/SC/ST x M/F breakdown
-- (Male/Female stay the list table's own aggregate columns), RAWE/FET/FIT Programme's
-- real Male/Female student counts (Number of Student/Days Stayed stay aggregate/computed
-- columns), and PPV & FRA Sensitization Farmer Details' real multi-file "Images" upload.
-- IF NOT EXISTS makes this idempotent, same reasoning as this session's other migrations.

ALTER TABLE "NykTraining" ADD COLUMN IF NOT EXISTS "generalMale" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "NykTraining" ADD COLUMN IF NOT EXISTS "generalFemale" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "NykTraining" ADD COLUMN IF NOT EXISTS "obcMale" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "NykTraining" ADD COLUMN IF NOT EXISTS "obcFemale" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "NykTraining" ADD COLUMN IF NOT EXISTS "scMale" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "NykTraining" ADD COLUMN IF NOT EXISTS "scFemale" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "NykTraining" ADD COLUMN IF NOT EXISTS "stMale" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "NykTraining" ADD COLUMN IF NOT EXISTS "stFemale" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "RaweFetFitProgramme" ADD COLUMN IF NOT EXISTS "male" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "RaweFetFitProgramme" ADD COLUMN IF NOT EXISTS "female" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "PpvFraFarmerDetail" ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT '{}';
