-- Vehicle / Equipment master forms gain a conditional "Repairing Cost"
-- field, shown only when Present Status is "Repairing".
ALTER TABLE "Vehicle" ADD COLUMN "repairingCost" DECIMAL(12,2);
ALTER TABLE "Equipment" ADD COLUMN "repairingCost" DECIMAL(12,2);
