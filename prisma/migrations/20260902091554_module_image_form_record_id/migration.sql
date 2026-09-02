-- AlterTable
ALTER TABLE "ModuleImage" ADD COLUMN     "formRecordId" TEXT;

-- CreateIndex
CREATE INDEX "ModuleImage_formRecordId_idx" ON "ModuleImage"("formRecordId");
