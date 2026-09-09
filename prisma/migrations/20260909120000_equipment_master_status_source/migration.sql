-- Reference /create-equipment (View KVK Equipments master) captures Present
-- Status and Source of fund on the equipment master itself. The yearly
-- Equipment Details list then only displays Source of fund - it is not
-- re-entered per year - so both columns belong on Equipment, not on the
-- yearly EquipmentStatus child.
ALTER TABLE "Equipment" ADD COLUMN "presentStatus" TEXT;
ALTER TABLE "Equipment" ADD COLUMN "sourceOfFund" TEXT;
