-- AlterTable
ALTER TABLE "Institute" ADD COLUMN     "districtId" TEXT,
ADD COLUMN     "stateId" TEXT;

-- CreateIndex
CREATE INDEX "Institute_stateId_idx" ON "Institute"("stateId");

-- CreateIndex
CREATE INDEX "Institute_districtId_idx" ON "Institute"("districtId");

-- AddForeignKey
ALTER TABLE "Institute" ADD CONSTRAINT "Institute_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Institute" ADD CONSTRAINT "Institute_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;
