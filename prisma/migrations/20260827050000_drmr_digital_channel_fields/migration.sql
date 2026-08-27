ALTER TABLE "DigitalOtherChannel" ADD COLUMN     "advisoriesSent" INTEGER,
ADD COLUMN     "channel" TEXT,
ADD COLUMN     "farmersCovered" INTEGER,
ADD COLUMN     "messagesAwareness" INTEGER DEFAULT 0,
ADD COLUMN     "messagesCrop" INTEGER DEFAULT 0,
ADD COLUMN     "messagesLivestock" INTEGER DEFAULT 0,
ADD COLUMN     "messagesMarketing" INTEGER DEFAULT 0,
ADD COLUMN     "messagesOtherEnterprises" INTEGER DEFAULT 0,
ADD COLUMN     "messagesWeather" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "DrmrActivity" ADD COLUMN     "farmersByCategory" JSONB,
ADD COLUMN     "itemActivity" TEXT,
ADD COLUMN     "quantity" DECIMAL(12,2),
ADD COLUMN     "unit" TEXT;

-- AlterTable
ALTER TABLE "DrmrDetail" ADD COLUMN     "anmrRsHaFp" DECIMAL(12,2),
ADD COLUMN     "anmrRsHaIp" DECIMAL(12,2),
ADD COLUMN     "bcRatioFp" DECIMAL(6,2),
ADD COLUMN     "bcRatioIp" DECIMAL(6,2),
ADD COLUMN     "cocRsHaFp" DECIMAL(12,2),
ADD COLUMN     "cocRsHaIp" DECIMAL(12,2),
ADD COLUMN     "gmrRsHaFp" DECIMAL(12,2),
ADD COLUMN     "gmrRsHaIp" DECIMAL(12,2),
ADD COLUMN     "yieldKgHaFp" DECIMAL(10,2),
ADD COLUMN     "yieldKgHaIp" DECIMAL(10,2),
ADD COLUMN     "yiofpPercentFp" DECIMAL(6,2),
ADD COLUMN     "yiofpPercentIp" DECIMAL(6,2);

