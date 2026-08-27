-- Real "4.2.A District Level Data" report section (super-v2-prod.pdf p.83) is actually 3 tables under one heading; these 2 new tables cover the crop-productivity and livestock-production ones DistrictLevelData didn't.
CREATE TABLE "DistrictCropProductivity" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "areaHa" DECIMAL(10,2) NOT NULL,
    "productionMt" DECIMAL(10,2) NOT NULL,
    "productivityQha" DECIMAL(10,2) NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DistrictCropProductivity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DistrictLivestockProduction" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "livestockName" TEXT NOT NULL,
    "number" DECIMAL(12,2) NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DistrictLivestockProduction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DistrictCropProductivity_zoneId_idx" ON "DistrictCropProductivity"("zoneId");
CREATE INDEX "DistrictCropProductivity_kvkId_idx" ON "DistrictCropProductivity"("kvkId");
CREATE INDEX "DistrictLivestockProduction_zoneId_idx" ON "DistrictLivestockProduction"("zoneId");
CREATE INDEX "DistrictLivestockProduction_kvkId_idx" ON "DistrictLivestockProduction"("kvkId");

ALTER TABLE "DistrictCropProductivity" ADD CONSTRAINT "DistrictCropProductivity_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DistrictLivestockProduction" ADD CONSTRAINT "DistrictLivestockProduction_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
