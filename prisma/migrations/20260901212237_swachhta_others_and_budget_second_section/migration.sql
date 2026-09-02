/*
  Warnings:

  - You are about to drop the column `additionalLineItems` on the `SwachhtaBudgetExpenditure` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SwachhtaBudgetExpenditure" DROP COLUMN "additionalLineItems",
ADD COLUMN     "otherTotalExpenditure" DECIMAL(14,2),
ADD COLUMN     "otherVillagesCovered" INTEGER;

-- AlterTable
ALTER TABLE "SwachhtaObservance" ADD COLUMN     "noOfOthers" INTEGER NOT NULL DEFAULT 0;
