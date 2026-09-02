-- AlterTable
ALTER TABLE "CfldTechnicalParameter" ADD COLUMN     "actionPhotoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "cropType" TEXT,
ADD COLUMN     "trainingPhotoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "variety" TEXT;
