-- Report 3.11.B needs a General/OBC/SC/ST x M/F breakdown for "Number of farmers under exposure".
ALTER TABLE "CraExtensionActivity" ADD COLUMN "farmersByCategory" JSONB;
