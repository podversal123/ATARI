/*
  Warnings:

  - You are about to drop the `OftResultRow` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OftResultRow" DROP CONSTRAINT "OftResultRow_oftId_fkey";

-- AlterTable
ALTER TABLE "Oft" ADD COLUMN     "photographUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "remark" TEXT,
ADD COLUMN     "resultTablesJson" TEXT,
ADD COLUMN     "supplementaryDatasheetUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "OftResultRow";
