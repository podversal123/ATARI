-- "Mark as Other option" for the six dedicated-model masters that already
-- show the checkbox and feed a Form Management dropdown: Cropping System,
-- Farming System, Product Type, Products, Training Area, Training Thematic
-- Area. Same behaviour as MasterListItem.isOther.
ALTER TABLE "CroppingSystemMaster" ADD COLUMN "isOther" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "FarmingSystemMaster" ADD COLUMN "isOther" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProductTypeMaster" ADD COLUMN "isOther" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProductMaster" ADD COLUMN "isOther" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TrainingAreaMaster" ADD COLUMN "isOther" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TrainingThematicAreaMaster" ADD COLUMN "isOther" BOOLEAN NOT NULL DEFAULT false;
