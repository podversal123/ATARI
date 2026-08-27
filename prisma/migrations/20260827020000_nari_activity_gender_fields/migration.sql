-- Real NARI report tables (3.7.A/B/C) need an OFT/FLD/Not Specified activity split and a Male/Female breakdown, confirmed against super-v2-prod.pdf p.76-77.
ALTER TABLE "NariNutritionGarden" ADD COLUMN "activity" TEXT NOT NULL DEFAULT 'Not Specified';
ALTER TABLE "NariNutritionGarden" ADD COLUMN "male" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "NariNutritionGarden" ADD COLUMN "female" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "NariBioFortified" ADD COLUMN "numberOfCrops" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "NariBioFortified" ADD COLUMN "male" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "NariBioFortified" ADD COLUMN "female" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "NariValueAddition" ADD COLUMN "numberOfProducts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "NariValueAddition" ADD COLUMN "male" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "NariValueAddition" ADD COLUMN "female" INTEGER NOT NULL DEFAULT 0;
