-- Reference /create-staff has a "Level" select (Level - 1 .. Level - 14) that
-- is distinct from the free-text "Pay Scale" amount; the rebuild's Staff row
-- had no column for it.
ALTER TABLE "Staff" ADD COLUMN "payBand" TEXT;
