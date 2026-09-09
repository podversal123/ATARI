-- Yearly Equipment Details gains a conditional "Repairing Cost" field
-- (shown only when Present Status is "Repairing"), matching Vehicle Details.
ALTER TABLE "EquipmentStatus" ADD COLUMN "repairingCost" DECIMAL(12,2);
