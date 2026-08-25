-- CreateTable
CREATE TABLE "Target" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "reportingYear" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "setByRole" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Target_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Target_zoneId_idx" ON "Target"("zoneId");

-- CreateIndex
CREATE INDEX "Target_kvkId_idx" ON "Target"("kvkId");

-- CreateIndex
CREATE UNIQUE INDEX "Target_kvkId_reportingYear_category_key" ON "Target"("kvkId", "reportingYear", "category");

-- AddForeignKey
ALTER TABLE "Target" ADD CONSTRAINT "Target_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
