-- The "Mark as 'Other' option" flag was only on MasterListItem + the 6
-- dedicated Production/Training masters. The FLD/OFT hierarchical masters
-- (Subject, Sector, Category, Sub Category) also carry the checkbox and are
-- used as Form Management dropdown sources, so they need the same column.
ALTER TABLE "OftSubject" ADD COLUMN "isOther" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "FldSector" ADD COLUMN "isOther" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "FldCategoryMaster" ADD COLUMN "isOther" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "FldSubCategoryMaster" ADD COLUMN "isOther" BOOLEAN NOT NULL DEFAULT false;
