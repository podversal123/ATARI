-- AlterTable
ALTER TABLE "Kvk" ADD COLUMN     "instituteId" TEXT;

-- AddForeignKey
ALTER TABLE "Kvk" ADD CONSTRAINT "Kvk_instituteId_fkey" FOREIGN KEY ("instituteId") REFERENCES "Institute"("id") ON DELETE SET NULL ON UPDATE CASCADE;
