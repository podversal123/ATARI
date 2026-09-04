-- "Equipment Details" leaf under Achievements > Soil and Water Testing (atariams.org) carries a Reporting Year the model was missing.
ALTER TABLE "SoilTestingEquipment" ADD COLUMN "reportingYear" INTEGER;
