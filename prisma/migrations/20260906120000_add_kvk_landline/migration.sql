-- The reference Edit KVK form has a distinct "Landline" text field separate from Mobile/Fax; the model had no column for it, so entering a Landline and saving did nothing (client report, 2026-09-04).
ALTER TABLE "Kvk" ADD COLUMN "landline" TEXT;
