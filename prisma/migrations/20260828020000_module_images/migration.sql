-- CreateTable
CREATE TABLE "ModuleImage" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "categoryPath" TEXT NOT NULL,
    "categoryLabel" TEXT NOT NULL,
    "reportingYear" INTEGER NOT NULL,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "caption" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModuleImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModuleImage_zoneId_idx" ON "ModuleImage"("zoneId");

-- CreateIndex
CREATE INDEX "ModuleImage_kvkId_reportingYear_idx" ON "ModuleImage"("kvkId", "reportingYear");

-- CreateIndex
CREATE INDEX "ModuleImage_categoryPath_idx" ON "ModuleImage"("categoryPath");

-- AddForeignKey
ALTER TABLE "ModuleImage" ADD CONSTRAINT "ModuleImage_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleImage" ADD CONSTRAINT "ModuleImage_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

