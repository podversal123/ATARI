-- CreateEnum
CREATE TYPE "MasterListType" AS ENUM ('STAFF_CATEGORY', 'JOB_TYPE', 'PAY_LEVEL', 'PAY_SCALE', 'SANCTIONED_POST', 'DISCIPLINE', 'BANK_ACCOUNT_TYPE', 'SEASON', 'UNIT', 'CROP_TYPE', 'IMPORTANT_DAY', 'INFRASTRUCTURE_TYPE', 'SOIL_WATER_ANALYSIS_TYPE', 'EQUIPMENT_TYPE', 'ASSET_FUNDING_SOURCE', 'NARI_ACTIVITY', 'NARI_NUTRITION_GARDEN_TYPE', 'NARI_CROP_CATEGORY', 'NICRA_CATEGORY', 'NICRA_SEED_FODDER_BANK', 'NICRA_DIGNITARY_TYPE', 'NICRA_PI_CO_PI_TYPE', 'IMPACT_SPECIFIC_AREA', 'ENTERPRISE_TYPE', 'ACCOUNT_TYPE', 'PROGRAMME_TYPE', 'PPV_FRA_TRAINING_TYPE', 'VIP_DIGNITARY', 'FLD_ACTIVITY', 'ARYA_ENTERPRISE', 'TSP_SCSP_TYPE', 'TSP_SCSP_ACTIVITY', 'NATURAL_FARMING_ACTIVITY', 'NATURAL_FARMING_SOIL_PARAMETER', 'AGRI_DRONE_DEMONSTRATIONS_ON', 'PRODUCT_CATEGORY');

-- CreateEnum
CREATE TYPE "PresentStatusOptionKind" AS ENUM ('VEHICLE', 'EQUIPMENT');

-- CreateTable
CREATE TABLE "MasterListItem" (
    "id" TEXT NOT NULL,
    "type" "MasterListType" NOT NULL,
    "name" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterListItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OftSubject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "OftSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OftThematicAreaMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "OftThematicAreaMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FldSector" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "FldSector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FldThematicAreaMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sectorId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "FldThematicAreaMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FldCategoryMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sectorId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "FldCategoryMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FldSubCategoryMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "FldSubCategoryMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subCategoryId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "CropMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CfldCropMaster" (
    "id" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "CfldCropMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTypeMaster" (
    "id" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "typeName" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "ProductTypeMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productTypeMasterId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "ProductMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CroppingSystemMaster" (
    "id" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "CroppingSystemMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmingSystemMaster" (
    "id" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "farmingSystemName" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "FarmingSystemMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NicraCategoryMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "NicraCategoryMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NicraSubCategoryMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "NicraSubCategoryMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundingAgencyMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "FundingAgencyMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialProjectMaster" (
    "id" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "fundingAgencyId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "FinancialProjectMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "equipmentType" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "EquipmentMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresentStatusOption" (
    "id" TEXT NOT NULL,
    "kind" "PresentStatusOptionKind" NOT NULL,
    "statusCode" TEXT NOT NULL,
    "statusLabel" TEXT NOT NULL,
    "hideInNextYear" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "PresentStatusOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MasterListItem_zoneId_type_idx" ON "MasterListItem"("zoneId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "MasterListItem_zoneId_type_name_key" ON "MasterListItem"("zoneId", "type", "name");

-- CreateIndex
CREATE INDEX "OftSubject_zoneId_idx" ON "OftSubject"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "OftSubject_zoneId_name_key" ON "OftSubject"("zoneId", "name");

-- CreateIndex
CREATE INDEX "OftThematicAreaMaster_zoneId_idx" ON "OftThematicAreaMaster"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "OftThematicAreaMaster_subjectId_name_key" ON "OftThematicAreaMaster"("subjectId", "name");

-- CreateIndex
CREATE INDEX "FldSector_zoneId_idx" ON "FldSector"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "FldSector_zoneId_name_key" ON "FldSector"("zoneId", "name");

-- CreateIndex
CREATE INDEX "FldThematicAreaMaster_zoneId_idx" ON "FldThematicAreaMaster"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "FldThematicAreaMaster_sectorId_name_key" ON "FldThematicAreaMaster"("sectorId", "name");

-- CreateIndex
CREATE INDEX "FldCategoryMaster_zoneId_idx" ON "FldCategoryMaster"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "FldCategoryMaster_sectorId_name_key" ON "FldCategoryMaster"("sectorId", "name");

-- CreateIndex
CREATE INDEX "FldSubCategoryMaster_zoneId_idx" ON "FldSubCategoryMaster"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "FldSubCategoryMaster_categoryId_name_key" ON "FldSubCategoryMaster"("categoryId", "name");

-- CreateIndex
CREATE INDEX "CropMaster_zoneId_idx" ON "CropMaster"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "CropMaster_subCategoryId_name_key" ON "CropMaster"("subCategoryId", "name");

-- CreateIndex
CREATE INDEX "CfldCropMaster_zoneId_idx" ON "CfldCropMaster"("zoneId");

-- CreateIndex
CREATE INDEX "ProductTypeMaster_zoneId_idx" ON "ProductTypeMaster"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTypeMaster_zoneId_categoryName_typeName_key" ON "ProductTypeMaster"("zoneId", "categoryName", "typeName");

-- CreateIndex
CREATE INDEX "ProductMaster_zoneId_idx" ON "ProductMaster"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductMaster_productTypeMasterId_name_key" ON "ProductMaster"("productTypeMasterId", "name");

-- CreateIndex
CREATE INDEX "CroppingSystemMaster_zoneId_idx" ON "CroppingSystemMaster"("zoneId");

-- CreateIndex
CREATE INDEX "FarmingSystemMaster_zoneId_idx" ON "FarmingSystemMaster"("zoneId");

-- CreateIndex
CREATE INDEX "NicraCategoryMaster_zoneId_idx" ON "NicraCategoryMaster"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "NicraCategoryMaster_zoneId_name_key" ON "NicraCategoryMaster"("zoneId", "name");

-- CreateIndex
CREATE INDEX "NicraSubCategoryMaster_zoneId_idx" ON "NicraSubCategoryMaster"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "NicraSubCategoryMaster_categoryId_name_key" ON "NicraSubCategoryMaster"("categoryId", "name");

-- CreateIndex
CREATE INDEX "FundingAgencyMaster_zoneId_idx" ON "FundingAgencyMaster"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "FundingAgencyMaster_zoneId_name_key" ON "FundingAgencyMaster"("zoneId", "name");

-- CreateIndex
CREATE INDEX "FinancialProjectMaster_zoneId_idx" ON "FinancialProjectMaster"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialProjectMaster_fundingAgencyId_projectName_key" ON "FinancialProjectMaster"("fundingAgencyId", "projectName");

-- CreateIndex
CREATE INDEX "EquipmentMaster_zoneId_idx" ON "EquipmentMaster"("zoneId");

-- CreateIndex
CREATE INDEX "PresentStatusOption_zoneId_idx" ON "PresentStatusOption"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "PresentStatusOption_zoneId_kind_statusCode_key" ON "PresentStatusOption"("zoneId", "kind", "statusCode");

-- AddForeignKey
ALTER TABLE "MasterListItem" ADD CONSTRAINT "MasterListItem_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OftSubject" ADD CONSTRAINT "OftSubject_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OftThematicAreaMaster" ADD CONSTRAINT "OftThematicAreaMaster_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "OftSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FldSector" ADD CONSTRAINT "FldSector_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FldThematicAreaMaster" ADD CONSTRAINT "FldThematicAreaMaster_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "FldSector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FldCategoryMaster" ADD CONSTRAINT "FldCategoryMaster_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "FldSector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FldSubCategoryMaster" ADD CONSTRAINT "FldSubCategoryMaster_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FldCategoryMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropMaster" ADD CONSTRAINT "CropMaster_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "FldSubCategoryMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CfldCropMaster" ADD CONSTRAINT "CfldCropMaster_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTypeMaster" ADD CONSTRAINT "ProductTypeMaster_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMaster" ADD CONSTRAINT "ProductMaster_productTypeMasterId_fkey" FOREIGN KEY ("productTypeMasterId") REFERENCES "ProductTypeMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CroppingSystemMaster" ADD CONSTRAINT "CroppingSystemMaster_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmingSystemMaster" ADD CONSTRAINT "FarmingSystemMaster_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicraCategoryMaster" ADD CONSTRAINT "NicraCategoryMaster_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicraSubCategoryMaster" ADD CONSTRAINT "NicraSubCategoryMaster_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "NicraCategoryMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingAgencyMaster" ADD CONSTRAINT "FundingAgencyMaster_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialProjectMaster" ADD CONSTRAINT "FinancialProjectMaster_fundingAgencyId_fkey" FOREIGN KEY ("fundingAgencyId") REFERENCES "FundingAgencyMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentMaster" ADD CONSTRAINT "EquipmentMaster_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresentStatusOption" ADD CONSTRAINT "PresentStatusOption_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
