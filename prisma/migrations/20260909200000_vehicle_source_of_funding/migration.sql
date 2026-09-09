-- View Vehicles master form gains a "Source of Funding" field (Equipment
-- already has one). Stored on the Vehicle master row.
ALTER TABLE "Vehicle" ADD COLUMN "sourceOfFunding" TEXT;
