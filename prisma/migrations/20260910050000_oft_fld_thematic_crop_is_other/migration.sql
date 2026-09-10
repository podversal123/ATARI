-- The OFT Thematic Area / FLD Thematic Area / Crop masters also carry the
-- "Mark as 'Other' option" checkbox and are used as dropdown sources inside
-- the bespoke OFT and FLD forms, so they need the same flag column.
ALTER TABLE "OftThematicAreaMaster" ADD COLUMN "isOther" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "FldThematicAreaMaster" ADD COLUMN "isOther" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CropMaster" ADD COLUMN "isOther" BOOLEAN NOT NULL DEFAULT false;
