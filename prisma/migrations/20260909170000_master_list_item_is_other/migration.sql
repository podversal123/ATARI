-- "Mark as Other option" on a master's create form: the flagged row becomes
-- the "Other" choice in every Form Management dropdown sourced from that
-- master, and picking it opens a free-text input beside the dropdown.
ALTER TABLE "MasterListItem" ADD COLUMN "isOther" BOOLEAN NOT NULL DEFAULT false;
