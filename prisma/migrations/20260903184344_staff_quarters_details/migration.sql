-- Real Add form fields confirmed live (atariams.org/infra-performance/staff-quaters/create,
-- 2026-09-04) - "whetherCompleted" (Yes/No), "occupancyDetails" (free text), and
-- "quarterlyCompletion" (the Jan-Dec x Quarter 1-6 Yes/No completion matrix, stored as
-- one JSON object rather than 72 separate columns) were missing entirely before.
-- IF NOT EXISTS makes this idempotent, same reasoning as this session's other migrations.

ALTER TABLE "StaffQuartersPerformance" ADD COLUMN IF NOT EXISTS "whetherCompleted" TEXT;
ALTER TABLE "StaffQuartersPerformance" ADD COLUMN IF NOT EXISTS "occupancyDetails" TEXT;
ALTER TABLE "StaffQuartersPerformance" ADD COLUMN IF NOT EXISTS "quarterlyCompletion" JSONB;
