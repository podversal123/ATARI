-- Single-KVK report (Atari_Management_System_Deviation_Report.pdf 1.3.A) prints a
-- "Status" column that the 93pg all-KVK export does not carry.
ALTER TABLE "DemonstrationUnit" ADD COLUMN "status" TEXT;
