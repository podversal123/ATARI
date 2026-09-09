-- Reference /create-vehicle (View Vehicles master) captures Total Run(km/hrs)
-- and Present Status on the vehicle master itself, and /view-vehicle lists
-- them. The yearly VehicleStatus keeps its own per-year values for report
-- section 1.4.B.
ALTER TABLE "Vehicle" ADD COLUMN "totalRun" DECIMAL(12,2);
ALTER TABLE "Vehicle" ADD COLUMN "presentStatus" TEXT;
