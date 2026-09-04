-- CreateTable: "Farm Implement Details" standalone About-KVK leaf (atariams.org /view-implement)
CREATE TABLE "FarmImplement" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "yearOfPurchase" INTEGER,
    "totalCost" DECIMAL(12,2),
    "presentStatus" TEXT,
    "sourceOfFund" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarmImplement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FarmImplement_zoneId_idx" ON "FarmImplement"("zoneId");
CREATE INDEX "FarmImplement_kvkId_idx" ON "FarmImplement"("kvkId");

ALTER TABLE "FarmImplement" ADD CONSTRAINT "FarmImplement_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
