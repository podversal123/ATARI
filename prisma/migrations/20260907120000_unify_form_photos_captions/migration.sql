-- Unify every multi-photo upload field through ModuleImage so each photo
-- carries a caption and flows to Module Images + Reports.
--
-- 1. ModuleImage gains `slot` - "" is the primary end-of-form Photographs
--    section (main OFT/FLD/Training/Extension forms + every generic leaf); a
--    record can also carry "oft-result" (Edit OFT Result's Photographs) and
--    "cfld-training" / "cfld-action" (the two CFLD Technical Parameter cards)
--    on the same formRecordId without one section's save wiping another's.
-- 2. Backfill: move the only pre-existing photo array (Oft.photographUrls -
--    the Edit OFT Result Photographs) into ModuleImage under slot
--    "oft-result". The other five arrays are empty in every environment.
-- 3. Drop the six now-unused image array columns.

ALTER TABLE "ModuleImage" ADD COLUMN "slot" TEXT NOT NULL DEFAULT '';
CREATE INDEX "ModuleImage_formRecordId_slot_idx" ON "ModuleImage"("formRecordId", "slot");

INSERT INTO "ModuleImage" (
  "id", "kvkId", "zoneId", "categoryPath", "categoryLabel", "reportingYear",
  "activityDate", "caption", "imageUrl", "published", "uploadedById",
  "formRecordId", "slot", "createdAt", "updatedAt"
)
SELECT
  'mig-' || md5(random()::text || clock_timestamp()::text || u.url),
  o."kvkId",
  o."zoneId",
  COALESCE(mi."categoryPath", 'achievements/oft'),
  COALESCE(mi."categoryLabel", 'Achievements - OFT'),
  o."reportingYear",
  COALESCE(o."startMonth", now()),
  '',
  u.url,
  true,
  NULL,
  o."id",
  'oft-result',
  now(),
  now()
FROM "Oft" o
CROSS JOIN LATERAL unnest(o."photographUrls") AS u(url)
LEFT JOIN LATERAL (
  SELECT "categoryPath", "categoryLabel"
  FROM "ModuleImage"
  WHERE "formRecordId" = o."id" AND "slot" = ''
  LIMIT 1
) mi ON true
WHERE array_length(o."photographUrls", 1) > 0;

ALTER TABLE "Oft" DROP COLUMN "photographUrls";
ALTER TABLE "CfldTechnicalParameter" DROP COLUMN "trainingPhotoUrls";
ALTER TABLE "CfldTechnicalParameter" DROP COLUMN "actionPhotoUrls";
ALTER TABLE "FarmerAward" DROP COLUMN "photoUrls";
ALTER TABLE "SuccessStory" DROP COLUMN "supportingImageUrls";
ALTER TABLE "PpvFraFarmerDetail" DROP COLUMN "images";
