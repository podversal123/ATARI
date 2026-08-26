-- AlterTable
ALTER TABLE "CropMaster" ADD COLUMN     "quantityDataType" TEXT,
ADD COLUMN     "quantityRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unit" TEXT;

-- AlterTable
ALTER TABLE "ProductMaster" ADD COLUMN     "quantityDataType" TEXT,
ADD COLUMN     "quantityRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unit" TEXT;
