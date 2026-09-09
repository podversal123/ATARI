-- Reference /infra-performance/staff-quaters/create captures two fields the
-- rebuild's StaffQuarters row was missing: a Yes/No "Whether staff quarters
-- have been completed" flag, and a free-text "Occupancy Details" (report
-- 1.3.C prints the latter as its own summary column, distinct from Remark).
ALTER TABLE "StaffQuarters" ADD COLUMN "whetherCompleted" BOOLEAN;
ALTER TABLE "StaffQuarters" ADD COLUMN "occupancyDetails" TEXT;
