-- DropForeignKey
ALTER TABLE "OftResultRow" DROP CONSTRAINT "OftResultRow_oftId_fkey";

-- DropForeignKey
ALTER TABLE "OftTechnologyOption" DROP CONSTRAINT "OftTechnologyOption_oftId_fkey";

-- AddForeignKey
ALTER TABLE "OftTechnologyOption" ADD CONSTRAINT "OftTechnologyOption_oftId_fkey" FOREIGN KEY ("oftId") REFERENCES "Oft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OftResultRow" ADD CONSTRAINT "OftResultRow_oftId_fkey" FOREIGN KEY ("oftId") REFERENCES "Oft"("id") ON DELETE CASCADE ON UPDATE CASCADE;
