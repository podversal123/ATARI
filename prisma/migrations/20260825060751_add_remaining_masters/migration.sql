-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MasterListType" ADD VALUE 'TRAINING_CLIENTELE';
ALTER TYPE "MasterListType" ADD VALUE 'TRAINING_FUNDING_SOURCE';
ALTER TYPE "MasterListType" ADD VALUE 'EXTENSION_ACTIVITY_MASTER';
ALTER TYPE "MasterListType" ADD VALUE 'OTHER_EXTENSION_ACTIVITY_MASTER';
ALTER TYPE "MasterListType" ADD VALUE 'EVENTS_MASTER';
ALTER TYPE "MasterListType" ADD VALUE 'PUBLICATION_ITEM';

-- CreateTable
CREATE TABLE "TrainingTypeMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "TrainingTypeMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingAreaMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trainingTypeId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "TrainingAreaMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingThematicAreaMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trainingAreaId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "TrainingThematicAreaMaster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainingTypeMaster_zoneId_idx" ON "TrainingTypeMaster"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingTypeMaster_zoneId_name_key" ON "TrainingTypeMaster"("zoneId", "name");

-- CreateIndex
CREATE INDEX "TrainingAreaMaster_zoneId_idx" ON "TrainingAreaMaster"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingAreaMaster_trainingTypeId_name_key" ON "TrainingAreaMaster"("trainingTypeId", "name");

-- CreateIndex
CREATE INDEX "TrainingThematicAreaMaster_zoneId_idx" ON "TrainingThematicAreaMaster"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingThematicAreaMaster_trainingAreaId_name_key" ON "TrainingThematicAreaMaster"("trainingAreaId", "name");

-- AddForeignKey
ALTER TABLE "TrainingTypeMaster" ADD CONSTRAINT "TrainingTypeMaster_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingAreaMaster" ADD CONSTRAINT "TrainingAreaMaster_trainingTypeId_fkey" FOREIGN KEY ("trainingTypeId") REFERENCES "TrainingTypeMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingThematicAreaMaster" ADD CONSTRAINT "TrainingThematicAreaMaster_trainingAreaId_fkey" FOREIGN KEY ("trainingAreaId") REFERENCES "TrainingAreaMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
