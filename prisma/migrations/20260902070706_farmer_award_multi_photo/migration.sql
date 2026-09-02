/*
  Warnings:

  - You are about to drop the column `photoUrl` on the `FarmerAward` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FarmerAward" DROP COLUMN "photoUrl",
ADD COLUMN     "photoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
