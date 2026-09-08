-- Report 3.10.B renders one DRMR submission as a fixed list of Item/Activity
-- rows, each with its own Quantity + General/OBC/SC/ST x M/F block.
CREATE TABLE "DrmrActivityItem" (
  "id" TEXT NOT NULL,
  "drmrActivityId" TEXT NOT NULL,
  "zoneId" TEXT NOT NULL,
  "itemKey" TEXT NOT NULL,
  "nameSpecification" TEXT,
  "unit" TEXT,
  "quantity" DECIMAL(14,2),
  "farmersByCategory" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DrmrActivityItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DrmrActivityItem_drmrActivityId_idx" ON "DrmrActivityItem"("drmrActivityId");
CREATE INDEX "DrmrActivityItem_zoneId_idx" ON "DrmrActivityItem"("zoneId");

ALTER TABLE "DrmrActivityItem"
  ADD CONSTRAINT "DrmrActivityItem_drmrActivityId_fkey"
  FOREIGN KEY ("drmrActivityId") REFERENCES "DrmrActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
