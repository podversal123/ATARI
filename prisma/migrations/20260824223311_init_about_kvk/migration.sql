-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'KVK_ADMIN', 'KVK_USER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "kvkId" TEXT,
    "zoneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Institute" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostOrganization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "officePhone" TEXT,
    "mobilePhone" TEXT,
    "fax" TEXT,
    "email" TEXT,
    "zoneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kvk" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "officePhone" TEXT,
    "fax" TEXT,
    "email" TEXT,
    "sanctionYear" INTEGER,
    "zoneId" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "hostOrgId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kvk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "location" TEXT,
    "accountNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "sanctionedPost" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "discipline" TEXT,
    "payScale" TEXT,
    "dateOfJoining" TIMESTAMP(3),
    "category" TEXT,
    "jobType" TEXT,
    "position" TEXT,
    "mobile" TEXT,
    "email" TEXT,
    "photoUrl" TEXT,
    "resumeUrl" TEXT,
    "allowances" TEXT,
    "transferStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffTransfer" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "fromKvkId" TEXT NOT NULL,
    "toKvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "transferDate" TIMESTAMP(3) NOT NULL,
    "numberOfTransfers" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Infrastructure" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "infrastructureName" TEXT NOT NULL,
    "notYetStarted" BOOLEAN NOT NULL DEFAULT false,
    "completedPlinthLevel" BOOLEAN NOT NULL DEFAULT false,
    "completedLintelLevel" BOOLEAN NOT NULL DEFAULT false,
    "completedRoofLevel" BOOLEAN NOT NULL DEFAULT false,
    "totallyCompleted" BOOLEAN NOT NULL DEFAULT false,
    "plinthAreaSqM" DECIMAL(10,2),
    "underUse" BOOLEAN NOT NULL DEFAULT false,
    "sourceOfFunding" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Infrastructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Land" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "description" TEXT,
    "areaHa" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Land_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffQuarters" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "dateOfCompletion" TIMESTAMP(3),
    "numberOfQuarters" INTEGER NOT NULL DEFAULT 0,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffQuarters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffQuarterOccupancy" (
    "id" TEXT NOT NULL,
    "staffQuartersId" TEXT NOT NULL,
    "quarterNumber" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "occupied" BOOLEAN NOT NULL,

    CONSTRAINT "StaffQuarterOccupancy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registrationNo" TEXT NOT NULL,
    "yearOfPurchase" INTEGER NOT NULL,
    "cost" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleStatus" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "reportingYear" INTEGER NOT NULL,
    "totalRunKmHrs" DECIMAL(12,2),
    "presentStatus" TEXT,
    "repairingCost" DECIMAL(12,2),
    "fundingSource" TEXT,
    "fundingAgency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "kvkId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "yearOfPurchase" INTEGER NOT NULL,
    "cost" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentStatus" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "reportingYear" INTEGER NOT NULL,
    "sourceOfFund" TEXT,
    "fundingAgency" TEXT,
    "presentStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EquipmentStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_zoneId_idx" ON "User"("zoneId");

-- CreateIndex
CREATE INDEX "User_kvkId_idx" ON "User"("kvkId");

-- CreateIndex
CREATE UNIQUE INDEX "Zone_name_key" ON "Zone"("name");

-- CreateIndex
CREATE INDEX "State_zoneId_idx" ON "State"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "State_zoneId_name_key" ON "State"("zoneId", "name");

-- CreateIndex
CREATE INDEX "District_zoneId_idx" ON "District"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "District_stateId_name_key" ON "District"("stateId", "name");

-- CreateIndex
CREATE INDEX "Institute_zoneId_idx" ON "Institute"("zoneId");

-- CreateIndex
CREATE INDEX "HostOrganization_zoneId_idx" ON "HostOrganization"("zoneId");

-- CreateIndex
CREATE INDEX "Kvk_zoneId_idx" ON "Kvk"("zoneId");

-- CreateIndex
CREATE INDEX "Kvk_stateId_idx" ON "Kvk"("stateId");

-- CreateIndex
CREATE INDEX "Kvk_districtId_idx" ON "Kvk"("districtId");

-- CreateIndex
CREATE INDEX "Kvk_hostOrgId_idx" ON "Kvk"("hostOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "Kvk_zoneId_name_key" ON "Kvk"("zoneId", "name");

-- CreateIndex
CREATE INDEX "BankAccount_zoneId_idx" ON "BankAccount"("zoneId");

-- CreateIndex
CREATE INDEX "BankAccount_kvkId_idx" ON "BankAccount"("kvkId");

-- CreateIndex
CREATE INDEX "Staff_zoneId_idx" ON "Staff"("zoneId");

-- CreateIndex
CREATE INDEX "Staff_kvkId_idx" ON "Staff"("kvkId");

-- CreateIndex
CREATE INDEX "StaffTransfer_zoneId_idx" ON "StaffTransfer"("zoneId");

-- CreateIndex
CREATE INDEX "StaffTransfer_staffId_idx" ON "StaffTransfer"("staffId");

-- CreateIndex
CREATE INDEX "StaffTransfer_fromKvkId_idx" ON "StaffTransfer"("fromKvkId");

-- CreateIndex
CREATE INDEX "StaffTransfer_toKvkId_idx" ON "StaffTransfer"("toKvkId");

-- CreateIndex
CREATE INDEX "Infrastructure_zoneId_idx" ON "Infrastructure"("zoneId");

-- CreateIndex
CREATE INDEX "Infrastructure_kvkId_idx" ON "Infrastructure"("kvkId");

-- CreateIndex
CREATE INDEX "Land_zoneId_idx" ON "Land"("zoneId");

-- CreateIndex
CREATE INDEX "Land_kvkId_idx" ON "Land"("kvkId");

-- CreateIndex
CREATE INDEX "StaffQuarters_zoneId_idx" ON "StaffQuarters"("zoneId");

-- CreateIndex
CREATE INDEX "StaffQuarters_kvkId_idx" ON "StaffQuarters"("kvkId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffQuarterOccupancy_staffQuartersId_quarterNumber_month_key" ON "StaffQuarterOccupancy"("staffQuartersId", "quarterNumber", "month");

-- CreateIndex
CREATE INDEX "Vehicle_zoneId_idx" ON "Vehicle"("zoneId");

-- CreateIndex
CREATE INDEX "Vehicle_kvkId_idx" ON "Vehicle"("kvkId");

-- CreateIndex
CREATE INDEX "VehicleStatus_zoneId_idx" ON "VehicleStatus"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleStatus_vehicleId_reportingYear_key" ON "VehicleStatus"("vehicleId", "reportingYear");

-- CreateIndex
CREATE INDEX "Equipment_zoneId_idx" ON "Equipment"("zoneId");

-- CreateIndex
CREATE INDEX "Equipment_kvkId_idx" ON "Equipment"("kvkId");

-- CreateIndex
CREATE INDEX "EquipmentStatus_zoneId_idx" ON "EquipmentStatus"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentStatus_equipmentId_reportingYear_key" ON "EquipmentStatus"("equipmentId", "reportingYear");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Institute" ADD CONSTRAINT "Institute_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostOrganization" ADD CONSTRAINT "HostOrganization_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kvk" ADD CONSTRAINT "Kvk_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kvk" ADD CONSTRAINT "Kvk_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kvk" ADD CONSTRAINT "Kvk_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kvk" ADD CONSTRAINT "Kvk_hostOrgId_fkey" FOREIGN KEY ("hostOrgId") REFERENCES "HostOrganization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffTransfer" ADD CONSTRAINT "StaffTransfer_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffTransfer" ADD CONSTRAINT "StaffTransfer_fromKvkId_fkey" FOREIGN KEY ("fromKvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffTransfer" ADD CONSTRAINT "StaffTransfer_toKvkId_fkey" FOREIGN KEY ("toKvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Infrastructure" ADD CONSTRAINT "Infrastructure_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Land" ADD CONSTRAINT "Land_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffQuarters" ADD CONSTRAINT "StaffQuarters_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffQuarterOccupancy" ADD CONSTRAINT "StaffQuarterOccupancy_staffQuartersId_fkey" FOREIGN KEY ("staffQuartersId") REFERENCES "StaffQuarters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleStatus" ADD CONSTRAINT "VehicleStatus_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentStatus" ADD CONSTRAINT "EquipmentStatus_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
