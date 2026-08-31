/**
 * Module Images data model.
 *
 * Source of truth: "Module Images UI.pdf" (client spec) - Super Admin finds
 * and bulk-downloads KVK-submitted photographs by Reporting Year / KVK /
 * Category(Form), while a KVK uploads photographs with a mandatory caption
 * against whichever Form Management category they're currently working in.
 *
 * Per the spec's own rule ("the system should not maintain a separate
 * hard-coded category list for Module Images... whenever a new
 * heading/sub-module is added in Form Management it should automatically
 * become available in Module Images"), the Category/Form options are
 * `REPORT_FORM_LEAVES` - the same flattened Form Management leaf list
 * Reports already draws from - not a list re-typed here.
 *
 * No real uploaded photographs exist yet (Phase 1, no backend/storage), so
 * `MODULE_IMAGE_ROWS` stays empty - same "real chrome, honest empty state"
 * convention as the rest of this app (Masters tables, Dashboard charts)
 * rather than fabricating sample photographs.
 */

import { REPORT_FORM_LEAVES } from "./reports";
import type { NavLeafPath } from "./navigation";

export const MODULE_IMAGE_CATEGORIES: NavLeafPath[] = REPORT_FORM_LEAVES;

/** Every category path, so "all selected" in the Category checklist is one Set comparison rather than a special-case flag. */
export const ALL_CATEGORY_PATHS = new Set(
  MODULE_IMAGE_CATEGORIES.map((leaf) => leaf.path),
);

/** Descending, current year first - matches the spec's own example list (2026, 2025, 2024, etc.). */
export const MODULE_IMAGE_REPORTING_YEARS: string[] = Array.from(
  { length: 6 },
  (_, i) => String(new Date().getFullYear() - i),
);

export const MAX_IMAGE_SIZE_MB = 5;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export type ModuleImageRecord = {
  id: string;
  kvk: string;
  reportingYear: string;
  date: string;
  categoryPath: string;
  categoryLabel: string;
  caption: string;
  /**
   * Publish state. A KVK owns its own photographs and decides when one goes
   * live (uploads land as Not Published / draft), but the Super Admin holds
   * final authority and can publish or unpublish anything - the governance
   * split agreed with the client. Only published photographs should ever
   * flow onward into reports/gallery once those are wired up.
   */
  published: boolean;
  previewUrl?: string;
};

export type PublishFilter = "all" | "published" | "unpublished";

export const PUBLISH_FILTER_OPTIONS: { value: PublishFilter; label: string }[] =
  [
    { value: "all", label: "All Status" },
    { value: "published", label: "Published" },
    { value: "unpublished", label: "Not Published" },
  ];

/** No backend/storage yet - kept empty rather than fabricated (see file header). */
export const MODULE_IMAGE_ROWS: ModuleImageRecord[] = [];

export type BulkDownloadMode = "selected-kvks-category" | "all-images";

export const BULK_DOWNLOAD_OPTIONS: {
  mode: BulkDownloadMode;
  label: string;
  description: string;
}[] = [
  {
    mode: "selected-kvks-category",
    label: "Selected KVKs & Category",
    description:
      "Download every photograph for the selected KVKs and category.",
  },
  {
    mode: "all-images",
    label: "All Images (All Categories)",
    description:
      "Download all images for the selected filters, grouped by category.",
  },
];
