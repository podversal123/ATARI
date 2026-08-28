/**
 * Single source of truth for the Super Admin sidebar.
 *
 * The sidebar component renders this tree directly, and the dynamic
 * `/masters/[...slug]` and `/forms/[...slug]` routes resolve pages from
 * the same `href` values, so every link in the sidebar always points at a
 * real, working page - there are no dead links.
 *
 * Columns for each list page are filled in from what was actually visible
 * in the reference where possible. Leaves without a
 * confirmed real column list fall back to the generic single "Name" column
 * until the reference show the real field list.
 */

import { INSTITUTE_MASTER_ROWS } from "./masters";

export type MasterColumn = {
  key: string;
  label: string;
  /** Overrides `label` on the Add/Edit form field only, for confirmed real cases where the form's field text is more specific than its own table's column header (e.g. table "Name" vs form "Training Clientele Name"). Table header keeps using `label`. */
  formLabel?: string;
  /** Server-computed display column (e.g. a child-row count) - shown in the list table, but never rendered as an input on the Add/Edit form since there's nothing for a user to type into it. */
  readonly?: boolean;
  /** Renders a real file-upload control instead of a text input, and a thumbnail/"View" link instead of raw text in the list table. The stored value is the uploaded file's Vercel Blob URL. */
  fileKind?: "image" | "document";
  /** Which /api/upload validation rule (size/mime-type) and storage folder applies - required whenever fileKind is set. Mirrors lib/blob.ts's UploadKind (kept as a separate literal type, not imported, since that file is server-only and this one is loaded client-side too). */
  uploadKind?: "staff-photo" | "staff-resume" | "cfld-crop-image";
  /**
   * Renders as a <select> populated by another All Masters leaf's real
   * saved rows (fetched from /api/master-options) instead of free text a
   * user could mistype - the backend already validates these parent
   * references by exact name match (see masters-registry.ts), so this
   * closes the gap between "typo silently rejected on submit" and
   * "typo never possible". `master` is the source leaf's slug, `optionKey`
   * is which field on its list() rows supplies the option text. When
   * `dependsOnKey`/`filterKey` are both set, the option list is narrowed to
   * rows whose `filterKey` matches this form's current value for
   * `dependsOnKey` (a second-level parent picker, e.g. Sub-category's
   * "Category" options narrowed to the already-selected Sector).
   */
  sourceMaster?: {
    master: string;
    optionKey: string;
    dependsOnKey?: string;
    filterKey?: string;
  };
  /**
   * Renders as a real checkbox instead of a text input ("checkbox", stored
   * as "true"/"false") - or, for "demographic-breakdown", the shared
   * General/OBC/SC/ST x Male/Female table (DemographicBreakdown) instead of
   * a single input. A demographic-breakdown column is display-only in the
   * list table (never a real column there - `readonly` would be for a
   * single value, not a whole block) and spans both grid columns on the
   * Add/Edit form.
   */
  fieldKind?: "checkbox" | "demographic-breakdown";
  /** demographic-breakdown only - prepended to DemographicBreakdown's own key convention (e.g. "farmers" -> "farmersGeneralMale") so one form can hold two independent blocks (Farmers + Extension Officials). Omit for a single block. */
  demographicPrefix?: string;
  /** True for a column that only makes sense on the Add/Edit form (currently just demographic-breakdown, which represents 8 real DB columns, not one) - excluded from the list table's header/rows entirely, the opposite of `readonly` (which excludes a column from the form, not the table). */
  formOnly?: boolean;
  /** Renders as a <select> from a fixed, known-real option list (not another master's saved rows, not free text) - e.g. Institute Name's real 4-option set. */
  staticOptions?: string[];
};

export type NavLeaf = {
  type: "leaf";
  slug: string;
  label: string;
  /** Columns for the list page this leaf renders, in display order. */
  columns: MasterColumn[];
  /** Overrides `label` on the landing-page card only, for the confirmed real cases where a bare leaf's card title differs from its own page title (e.g. card "Technical Achievement" vs page "Technical Achievement Summary"). */
  cardLabel?: string;
  /** Overrides `label` on the leaf's own detail page (H1 + breadcrumb) only - mirrors NavGroup.pageTitle, for the confirmed real case where the landing-card link text differs from the page's own title (card link "OFT" vs page "On Farm Trials (OFT)", confirmed live 2026-08-15 reference screenshot). */
  pageTitle?: string;
  /**
   * Whether the Add/Create form shows the "Mark as 'Other' option" checkbox.
   * The real reference shows this on almost every simple master's create
   * form regardless of field count, with only a few confirmed exceptions
   * (Events Master, Publication Items, Natural Farming Activity) - so it
   * isn't reliably inferable from column shape. Leave unset for leaves
   * without confirmed reference evidence either way (falls back to the old
   * single-"name"-column heuristic in AddLeafPage).
   */
  showMarkAsOther?: boolean;
};

export type NavGroup = {
  type: "group";
  slug: string;
  label: string;
  children: NavItem[];
  /** Overrides `label` for the page H1/breadcrumb only - used when the sidebar name and the real in-page title differ (confirmed real case: sidebar says "Production Masters", the page itself says "Production & Projects"). */
  pageTitle?: string;
  /** Overrides `label` on the *parent's* landing-page card only (mirrors NavLeaf.cardLabel) - confirmed real case: NICRA's own page/report-section title is the longer "NICRA (Technology Demonstration component)", but its card on the Projects landing page just says "NICRA". */
  cardLabel?: string;
  /** Subtitle shown under the page title on a group's landing page, when confirmed from the reference. */
  description?: string;
};

export type NavItem = NavLeaf | NavGroup;

export type SidebarSection = {
  slug: string;
  label: string;
  href?: string;
  icon: SidebarIconName;
  children?: NavItem[];
};

export type SidebarIconName =
  | "dashboard"
  | "form-summary"
  | "masters"
  | "role-management"
  | "user-management"
  | "form-management"
  | "module-images"
  | "gallery"
  | "targets"
  | "log-history"
  | "notifications"
  | "reports";

const GENERIC_MASTER_COLUMNS: MasterColumn[] = [{ key: "name", label: "Name" }];

/** General/OBC/SC/ST x Male/Female flat fields for leaves whose real report table needs the farmersByCategory breakdown but uses the generic AddLeafPage form (not a bespoke dialog like CFLD's DemographicBreakdown) - the API assembles these 8 fields into one JSON object on save. */
const DEMOGRAPHIC_COLUMNS: MasterColumn[] = [
  { key: "generalMale", label: "General - Male" },
  { key: "generalFemale", label: "General - Female" },
  { key: "obcMale", label: "OBC - Male" },
  { key: "obcFemale", label: "OBC - Female" },
  { key: "scMale", label: "SC - Male" },
  { key: "scFemale", label: "SC - Female" },
  { key: "stMale", label: "ST - Male" },
  { key: "stFemale", label: "ST - Female" },
];

function leaf(
  slug: string,
  label: string,
  columns: MasterColumn[] = GENERIC_MASTER_COLUMNS,
  cardLabel?: string,
  showMarkAsOther?: boolean,
  pageTitle?: string,
): NavLeaf {
  return { type: "leaf", slug, label, columns, cardLabel, showMarkAsOther, pageTitle };
}

/**
 * Cards for a group's landing page. If any direct child is itself a group,
 * every child becomes its own card (a bare leaf child is wrapped as a
 * single-item card reusing its own name - confirmed real pattern on pages
 * like Achievements, which mixes leaves and groups as siblings, each its
 * own card). If no child is a group (e.g. Basic Masters, Publication
 * Masters), the whole node becomes one card listing all its leaves inline.
 */
export function landingCards(node: NavGroup): NavGroup[] {
  const hasSubGroup = node.children.some((child) => child.type === "group");
  if (!hasSubGroup) return [node];
  return node.children.map((child) =>
    child.type === "group"
      ? { ...child, label: child.cardLabel ?? child.label }
      : {
          type: "group",
          slug: child.slug,
          label: child.cardLabel ?? child.label,
          children: [child],
        },
  );
}

function group(
  slug: string,
  label: string,
  children: NavItem[],
  extra?: { pageTitle?: string; cardLabel?: string; description?: string },
): NavGroup {
  return { type: "group", slug, label, children, ...extra };
}

/** All Masters -> Training & Extension Masters -> Training Master (columns confirmed on screen) */
const trainingMaster = group("training", "Training Master", [
  leaf("training-type", "Training Type Master", [
    { key: "trainingType", label: "Training Type" },
  ]),
  leaf("training-area", "Training Area Master", [
    { key: "trainingType", label: "Training Type", sourceMaster: { master: "training-type", optionKey: "trainingType" } },
    { key: "trainingAreaName", label: "Training Area Name" },
  ], undefined, true),
  /** 2 columns, confirmed against the reference). */
  leaf("training-thematic-area", "Training Thematic Area Master", [
    { key: "trainingAreaName", label: "Training Area Name", sourceMaster: { master: "training-area", optionKey: "trainingAreaName" } },
    { key: "thematicArea", label: "Training Thematic Area" },
  ], undefined, true),
  leaf("training-clientele", "Training Clientele Master", [
    { key: "clientele", label: "Name", formLabel: "Training Clientele Name" },
  ], undefined, true),
  leaf("funding-source", "Funding Source Master", [
    { key: "fundingSource", label: "Name", formLabel: "Funding Source Name" },
  ], undefined, true),
]);

/** All Masters -> Training & Extension Masters (3-card landing confirmed on screen) */
const trainingExtensionMasters = group(
  "training-extension",
  "Training & Extension Masters",
  [
    trainingMaster,
    group("extension-activities", "Extension Activities", [
      leaf("extension-activity", "Extension Activity Master", [
        { key: "activityName", label: "Name", formLabel: "Extension Activity Name" },
      ], undefined, true),
      leaf("other-extension-activity", "Other Extension Activity Master", [
        { key: "activityName", label: "Name", formLabel: "Other Extension Activity Name" },
      ]),
    ]),
    group("events", "Events", [
      leaf("events-master", "Events Master", [
        { key: "eventName", label: "Event Name" },
      ], undefined, false),
    ]),
  ],
  {
    pageTitle: "Training & Extension",
    description: "Manage training masters, extension activities, and events",
  },
);

/** All Masters -> Other Masters (sub-groups + columns confirmed on screen) */
const otherMasters = group(
  "other",
  "Other Masters",
  [
    group("employee", "Employee Masters", [
      leaf("staff-category", "Staff Category Master", [
        { key: "name", label: "Category Name" },
      ]),
      leaf("job-type", "Job Type Master"),
      /** Real column confirmed live - "Level Name", not the generic "Name" default. */
      leaf("pay-level", "Pay Level Master", [
        { key: "name", label: "Level Name" },
      ]),
      leaf("pay-scale", "Pay Scale Master", [
        { key: "name", label: "Scale Name" },
      ]),
      leaf("sanctioned-post", "Sanctioned Post Master", [
        { key: "name", label: "Post Name" },
      ]),
      leaf("discipline", "Discipline Master", [
        { key: "name", label: "Discipline Name" },
      ]),
    ]),
    group("bank", "Bank Masters", [
      leaf("bank-account-type", "Bank Account Type Master"),
    ]),
    group("calendar-context", "Calendar & Context Masters", [
      leaf("season", "Season Master", [{ key: "name", label: "Season Name" }]),
      leaf("unit", "Unit Master", [{ key: "name", label: "Unit Name" }]),
      leaf("crop-type", "Crop Type Master", [
        { key: "name", label: "Type Name" },
      ]),
      leaf("important-day", "Important Day Master", [
        { key: "name", label: "Day Name" },
      ]),
    ]),
    /**
     * Resource Masters' real page H1 drops the "Master" suffix that the landing
     * card keeps - so `label` carries the real
     * page title and `cardLabel` the real card text, which is exactly what that
     * pair of fields is for.
     */
    group("resource", "Resource Masters", [
      leaf(
        "infrastructure",
        "Infrastructure",
        [{ key: "name", label: "Name" }],
        "Infrastructure Master",
      ),
      leaf(
        "soil-water",
        "Soil Water",
        [{ key: "name", label: "Analysis Name" }],
        "Soil Water Analysis Master",
      ),
      /** Same 4-column shape as Equipment Present Status below - confirmed against the reference. */
      leaf(
        "vehicle-present-status",
        "Vehicle Present Status",
        [
          { key: "statusCode", label: "Status Code" },
          { key: "statusLabel", label: "Status Label" },
          { key: "hideInNextYear", label: "Hide in Next Year" },
          { key: "isActive", label: "Is Active" },
        ],
        "Vehicle Present Status Master",
      ),
      leaf(
        "equipment-present-status",
        "Equipment Present Status",
        [
          { key: "statusCode", label: "Status Code" },
          { key: "statusLabel", label: "Status Label" },
          { key: "hideInNextYear", label: "Hide in Next Year" },
          { key: "isActive", label: "Is Active" },
        ],
        "Equipment Present Status Master",
      ),
      leaf("equipment-type", "Equipment Type Master"),
      leaf("equipment", "Equipment Master", [
        { key: "name", label: "Name" },
        { key: "equipmentType", label: "Equipment Type" },
      ]),
      leaf("asset-funding-source", "Asset Funding Source Master"),
    ]),
    group("nari", "NARI Masters", [
      leaf("nari-activity", "NARI Activity Master", [
        { key: "name", label: "Activity Name" },
      ]),
      leaf("nari-nutrition-garden-type", "NARI Nutrition Garden Type Master"),
      leaf("nari-crop-category", "NARI Crop Category Master"),
    ]),
    group("nicra", "NICRA Masters", [
      leaf("nicra-category", "NICRA Category Master", [
        { key: "name", label: "Category Name" },
      ]),
      leaf("nicra-sub-category", "NICRA Sub-category Master", [
        { key: "subCategoryName", label: "Sub Category Name" },
        { key: "categoryName", label: "Category Name", sourceMaster: { master: "nicra-category", optionKey: "name" } },
      ]),
      leaf("nicra-seed-fodder-bank", "NICRA Seed/Fodder Bank Master", [
        { key: "name", label: "Seed Bank Fodder Bank" },
      ]),
      leaf("nicra-dignitary-type", "NICRA Dignitary Type Master", [
        { key: "name", label: "Type" },
      ]),
      leaf("nicra-pi-co-pi-type", "NICRA PI/CO-PI Type Master", [
        { key: "name", label: "Type" },
      ]),
    ]),
    /** Same page-H1-vs-card-label split as Resource Masters above. */
    group("performance-indicator", "Performance Indicator Masters", [
      leaf(
        "impact-specific-area",
        "Impact Areas",
        [{ key: "name", label: "Specific Area Name" }],
        "Impact Specific Area Master",
      ),
      /** Real column confirmed live. */
      leaf(
        "type-of-enterprise",
        "Enterprises",
        [{ key: "name", label: "Enterprise Type Name" }],
        "Type of Enterprise Master",
      ),
      /** Real column confirmed live. */
      leaf(
        "account-type",
        "Account Types",
        [{ key: "name", label: "Account Type" }],
        "Account Type Master",
      ),
      /** Real column confirmed live. */
      leaf(
        "programme-type",
        "Programs",
        [{ key: "name", label: "Programme Type" }],
        "Programme Type Master",
      ),
      /** Real column confirmed live. */
      leaf(
        "ppv-fra-training-type",
        "PPV & FRA",
        [{ key: "name", label: "Type Name" }],
        "PPV & FRA Training Type Master",
      ),
      /** Real column confirmed live - genuinely a plain "Name" column. */
      leaf(
        "vip-dignitary",
        "VIP Dignitaries",
        GENERIC_MASTER_COLUMNS,
        "VIP Dignitary Master",
      ),
    ]),
    group("project-wise-budget", "Project Wise Budget Masters", [
      leaf("funding-agency", "Funding Agency Master", [
        { key: "name", label: "Agency Name" },
      ]),
      /** 2 columns, confirmed against the reference) - the second column was missing entirely. */
      leaf("financial-project", "Financial Project Master", [
        { key: "projectName", label: "Project Name" },
        { key: "agencyName", label: "Agency Name", sourceMaster: { master: "funding-agency", optionKey: "name" } },
      ]),
    ]),
  ],
  {
    description: "Manage employee, training, extension, and other master data",
  },
);

/** All Masters -> Basic Masters (columns + tab order confirmed on screen) */
const basicMasters = group(
  "basic",
  "Basic Masters",
  [
    leaf("zone-master", "Zone Master", [
      { key: "zoneName", label: "Zone Name" },
    ]),
    leaf("state-master", "State Master", [
      { key: "zoneName", label: "Zone Name" },
      { key: "stateName", label: "State Name" },
    ]),
    leaf("district-master", "District Master", [
      { key: "zoneName", label: "Zone Name" },
      { key: "stateName", label: "State Name" },
      { key: "districtName", label: "District Name" },
    ]),
    /** State Name/District Name columns removed (2026-08-27) - the real reference's 4 institutes (ICAR/NGO/CAU/SAU) are national bodies with no state/district of their own, and no confirmed reference ever showed those columns on this leaf; they rendered permanently blank. */
    leaf("institute-master", "Institute Master", [
      { key: "zoneName", label: "Zone Name" },
      { key: "instituteName", label: "Institute Name", staticOptions: INSTITUTE_MASTER_ROWS.map((r) => r.instituteName) },
    ]),
    leaf("host-master", "Host Master", [
      { key: "hostName", label: "Host Name" },
      { key: "directorExtension", label: "Director Extension" },
      { key: "address", label: "Address" },
      { key: "phone", label: "Landline" },
      { key: "mobile", label: "Mobile" },
      { key: "fax", label: "Fax" },
      { key: "email", label: "Email" },
    ]),
    /** Column order/labels confirmed exactly against the reference: Mobile, Email, Address, Year of Sanction - not the Mobile/Address/E-Mail/Sanction Year order this leaf had before. */
    /** Institute column added 2026-08-27 - the real "Create KVK" reference form (kvk-master-add-form.tsx) already had a required Institute field, it was just never submitted to the backend. */
    leaf("kvk-master", "KVK Master", [
      { key: "zoneName", label: "Zone Name" },
      { key: "stateName", label: "State Name" },
      { key: "hostOrg", label: "Host Org" },
      { key: "districtName", label: "District Name" },
      { key: "instituteName", label: "Institute", staticOptions: INSTITUTE_MASTER_ROWS.map((r) => r.instituteName) },
      { key: "kvk", label: "KVK" },
      { key: "mobile", label: "Mobile" },
      { key: "fax", label: "Fax" },
      { key: "email", label: "Email" },
      { key: "address", label: "Address" },
      { key: "sanctionYear", label: "Year of Sanction" },
    ]),
  ],
  { description: "Manage zones, states, institutes, hosts, and districts" },
);

/** All Masters -> OFT & FLD Masters (two tab-sets confirmed on screen: OFT side, FLD side) */
const oftFldMasters = group(
  "oft-fld",
  "OFT & FLD Masters",
  [
    /**
     * Column sets below were re-confirmed against the real reference in the
     * 2026-08-22 audit -
     * several of these tables carry a second/third column that earlier passes
     * missed because the reference table scrolls horizontally.
     */
    group("oft", "OFT Masters", [
      leaf("subject", "Subject Master", [
        { key: "subjectName", label: "Subject Name" },
        { key: "thematicAreasCount", label: "Thematic Areas Count", readonly: true },
      ], undefined, true),
      leaf("oft-thematic-area", "OFT Thematic Area Master", [
        { key: "thematicArea", label: "Thematic Area Name" },
        { key: "subjectName", label: "Subject Name", sourceMaster: { master: "subject", optionKey: "subjectName" } },
      ], undefined, true),
    ]),
    group("fld", "FLD Masters", [
      leaf("sector", "Sector Master", [
        { key: "sectorName", label: "Sector Name" },
        { key: "categoriesCount", label: "Categories Count", readonly: true },
      ], undefined, true),
      leaf("fld-thematic-area", "FLD Thematic Area Master", [
        { key: "thematicAreaName", label: "Thematic Area Name" },
        { key: "sectorName", label: "Sector Name", sourceMaster: { master: "sector", optionKey: "sectorName" } },
      ]),
      /** Real columns confirmed live. */
      leaf("category", "Category Master", [
        { key: "categoryName", label: "Category Name" },
        { key: "sectorName", label: "Sector Name", sourceMaster: { master: "sector", optionKey: "sectorName" } },
        { key: "subCategoriesCount", label: "Sub Categories Count", readonly: true },
      ], undefined, true),
      /** 4 columns, confirmed against the reference) - 3 were missing. */
      leaf("sub-category", "Sub-category Master", [
        { key: "subCategoryName", label: "Sub Category Name" },
        {
          key: "categoryName",
          label: "Category Name",
          sourceMaster: { master: "category", optionKey: "categoryName", dependsOnKey: "sectorName", filterKey: "sectorName" },
        },
        { key: "sectorName", label: "Sector Name", sourceMaster: { master: "sector", optionKey: "sectorName" } },
        { key: "cropsCount", label: "Crops Count", readonly: true },
      ], undefined, true),
      /**
       * 3 columns, confirmed against the reference). Real Create form also
       * has Unit and Quantity Data Type (dropdowns in the reference) plus a
       * "Quantity required in forms" checkbox - same treatment as Products
       * Master: free-text for Unit/Quantity Data Type since the real
       * dropdown option list wasn't visible in the reference, a real
       * checkbox for Quantity Required.
       */
      leaf("crop", "Crop Master", [
        { key: "cropName", label: "Crop Name" },
        {
          key: "subCategoryName",
          label: "Sub Category Name",
          sourceMaster: { master: "sub-category", optionKey: "subCategoryName", dependsOnKey: "category", filterKey: "categoryName" },
        },
        { key: "category", label: "Category Name", sourceMaster: { master: "category", optionKey: "categoryName" } },
        { key: "quantityRequired", label: "Quantity required in forms", fieldKind: "checkbox" },
      ], undefined, true),
      /** Real reference: Create Activity has no "Mark as Other" checkbox, unlike every other single-Name master in this group. */
      leaf("activity", "Activity Master", [
        { key: "name", label: "Activity Name" },
      ], undefined, false),
    ]),
    group("cfld", "CFLD Master", [
      leaf("cfld-crop", "CFLD Crop Master", [
        { key: "season", label: "Season" },
        { key: "type", label: "Type" },
        { key: "cropName", label: "Crop Name" },
      ]),
    ]),
  ],
  {
    description:
      "Manage OFT (On Farm Testing), FLD (Front Line Demonstrations), and CFLD masters",
  },
);

/**
 * All Masters -> Production Masters (6-card landing confirmed on screen).
 * Sidebar label is "Production Masters" (confirmed repeatedly in the
 * reference), but the page's own H1 reads "Production & Projects"
 * - confirmed directly via atari-photo-zip/IMG-20260817-WA0233.jpg
 * (URL /all-master/production-projects). Both are real; `pageTitle` carries
 * the in-page override.
 */
const productionProjects = group(
  "production",
  "Production Masters",
  [
    group(
      "seed-planting-bio",
      "Production of Seed/Planting Materials/Bio Products",
      [
        leaf("product-category", "Product Category Master", [
          { key: "name", label: "Product Category Name" },
        ], undefined, true),
        /** 2 columns, confirmed against the reference). */
        leaf("product-type", "Product Type Master", [
          { key: "productCategoryName", label: "Product Category Name" },
          { key: "productCategoryType", label: "Product Category Type" },
        ], undefined, true),
        /**
         * Real Create form also has Unit and Quantity Data Type (both
         * dropdowns in the reference) plus a "Quantity required in forms"
         * checkbox - wired here as free-text for Unit/Quantity Data Type
         * since the real dropdown's option list wasn't visible in the
         * reference, and a checkbox for Quantity Required (that part was
         * unambiguous).
         */
        leaf("products", "Products", [
          { key: "productCategoryName", label: "Product Category Name" },
          { key: "productCategoryType", label: "Product Category Type" },
          { key: "productName", label: "Product Name" },
          { key: "quantityRequired", label: "Quantity required in forms", fieldKind: "checkbox" },
        ], undefined, true),
      ],
    ),
    group("climate-resilient-agriculture", "Climate Resilient Agriculture", [
      leaf("cropping-system", "Cropping System Master", [
        { key: "season", label: "Season Name" },
        { key: "cropName", label: "Crop Name" },
      ], undefined, true),
      /** Season Name is the FIRST column in the real table - it was missing entirely. */
      leaf("farming-system", "Farming System Master", [
        { key: "season", label: "Season Name" },
        { key: "farmingSystemName", label: "Farming System Name" },
      ], undefined, true),
    ]),
    group("arya", "ARYA", [
      leaf("arya-enterprise", "ARYA Enterprise Master", [
        { key: "name", label: "Enterprise Name" },
      ], undefined, true),
    ]),
    group("tsp-scsp", "TSP/SCSP", [
      leaf("tsp-scsp-type", "TSP/SCSP Type Master", [
        { key: "name", label: "Type Name" },
      ]),
      leaf("tsp-scsp-activity", "TSP/SCSP Activity Master", [
        { key: "name", label: "Activity Name" },
      ]),
    ]),
    group("natural-farming", "Natural Farming", [
      /** Confirmed real exception: unlike every other single-"name" master, this one's real Create form has no "Mark as Other" checkbox. */
      leaf("natural-farming-activity", "Natural Farming Activity Master", [
        { key: "name", label: "Activity Name" },
      ], undefined, false),
      leaf("soil-parameter", "Natural Farming Soil Parameter Master", [
        { key: "name", label: "Type" },
      ], undefined, true),
    ]),
    group("agri-drone", "Agri-Drone", [
      leaf("demonstrations-on", "Agri-Drone Demonstrations On Master", [
        { key: "name", label: "Demonstrations On" },
      ], undefined, true),
    ]),
  ],
  {
    pageTitle: "Production & Projects",
    description:
      "Manage production items, climate resilient agriculture, and ARYA enterprise masters",
  },
);

export const ALL_MASTERS: NavItem[] = [
  basicMasters,
  oftFldMasters,
  trainingExtensionMasters,
  productionProjects,
  group(
    "publication",
    "Publication Masters",
    [
      /** Landing-page card text is "Publication Items" (no "Master" suffix) - confirmed against the reference, same page-H1-vs-card-label split as Resource/Performance Indicator Masters elsewhere in this file. */
      leaf("publication-items", "Publication Items Master", [
        { key: "itemName", label: "Publication Item" },
      ], "Publication Items", false),
    ],
    {
      pageTitle: "Publications",
      description: "Manage publication items and related master data",
    },
  ),
  otherMasters,
];

/**
 * Form Management -> About KVK (5-card landing confirmed on the real reference
 * the reference: Basic Information / Employee Information / Land & Infrastructure
 * Information / Vehicles Information / Equipments Information, each linking to
 * the exact page names shown there). All columns below are transcribed directly
 * from the client's real PDF data exports ("atari zip file.zip", folder
 * "7. about kvk admin data") - not guessed.
 */
const aboutKvk = group(
  "about-kvk",
  "About KVK",
  [
    group("basic", "Basic Information", [
      /** All 6 columns re-confirmed against the reference - the previous set was entirely wrong. */
      /**
       * Column set + order re-confirmed live against atariams.org's own
       * "View KVK Details" table (2026-08-24, client pointer #1 "add more
       * headings"): the real table carries two more columns past the
       * earlier 8 - a trailing "Host Organization Name" repeat of the same
       * host field alongside the leading "Organization Name" column (a real
       * quirk of the live app, not a mistake here - both show the same
       * institute per row), and "Year of Sanction" at the very end before
       * Action.
       */
      /** "Host Organization Name" used to duplicate the "Host Org" column above (same `hostOrg` key twice) - real bug, fixed 2026-08-28. */
      leaf("view-kvks", "View KVKs", [
        { key: "zoneName", label: "Zone Name" },
        { key: "stateName", label: "State Name" },
        { key: "hostOrg", label: "Host Org" },
        { key: "districtName", label: "District Name" },
        { key: "kvk", label: "KVK" },
        { key: "mobile", label: "Mobile" },
        { key: "email", label: "Email" },
        { key: "address", label: "Address" },
        { key: "sanctionYear", label: "Year of Sanction" },
      ]),
      leaf("bank-account-details", "Bank Account Details", [
        { key: "kvk", label: "KVK" },
        { key: "accountType", label: "Account Type" },
        { key: "accountName", label: "Account Name" },
        { key: "bankName", label: "Bank Name" },
        { key: "location", label: "Location" },
        { key: "accountNumber", label: "Account" },
      ]),
    ]),
    group("employee", "Employee Information", [
      /**
       * Real leading columns confirmed against the reference: the table opens
       * with KVK, a Photo thumbnail and a Resume cell, then Staff Name /
       * Position - not the Sanctioned Post / Name of the Incumbent / DOB /
       * Discipline set guessed earlier. Its horizontal scrollbar shows roughly
       * as many columns again hidden to the right, which no capture in either
       * source reaches, so only the confirmed 7 are declared here.
       */
      /**
       * Column set re-confirmed live against atariams.org's own "View
       * Staff" table (2026-08-24, client pointer #2 "add more headings"):
       * the real table has 4 more columns than the earlier pass caught -
       * Position (right after Staff Name) and Email (right after Position,
       * contradicting the earlier "no Email column" read - a fuller scroll
       * of the real table shows it does have one) both up front, plus
       * Category and Transfer Status trailing after Details of Allowances.
       */
      leaf("employee-details", "Employee Details", [
        { key: "kvk", label: "KVK Name" },
        { key: "photo", label: "Photo", fileKind: "image", uploadKind: "staff-photo" },
        { key: "resume", label: "Resume", fileKind: "document", uploadKind: "staff-resume" },
        { key: "staffName", label: "Staff Name" },
        { key: "position", label: "Position" },
        { key: "email", label: "Email" },
        { key: "sanctionedPost", label: "Sanctioned Post" },
        { key: "mobile", label: "Mobile" },
        { key: "payScale", label: "Pay Scale" },
        { key: "dateOfJoining", label: "Date of Joining" },
        { key: "jobType", label: "Job Type" },
        { key: "allowances", label: "Details of Allowances" },
        { key: "category", label: "Category" },
        { key: "transferStatus", label: "Transfer Status" },
      ]),
      leaf(
        "staff-transferred",
        "Staff Transferred",
        [
          { key: "staffName", label: "Staff Name" },
          { key: "kvkNameBeforeTransfer", label: "KVK Name Before Transfer" },
          { key: "latestKvkName", label: "Latest KVK Name" },
        ],
        "Details of Staff Transferred",
      ),
    ]),
    group("land-infrastructure", "Land & Infrastructure Information", [
      leaf("infrastructure-details", "Infrastructure Details", [
        { key: "kvk", label: "KVK" },
        { key: "infraMasterName", label: "Infra Master Name" },
        { key: "notYetStarted", label: "Not Yet Started" },
        { key: "completedPlinthLevel", label: "Completed Plinth Level" },
        { key: "completedLintelLevel", label: "Completed Lintel Level" },
        { key: "completedRoofLevel", label: "Completed Roof Level" },
        { key: "totallyCompleted", label: "Totally Completed" },
        { key: "plinthAreaSqM", label: "Plinth Area (Sq M)" },
        { key: "underUse", label: "Under Use" },
        { key: "sourceOfFunding", label: "Source of Funding" },
      ]),
      leaf("land-details", "Land Details", [
        { key: "kvk", label: "KVK" },
        { key: "item", label: "Item" },
        { key: "areaHa", label: "Area Ha" },
      ]),
      /** Real columns confirmed live at /forms/about-kvk/infrastructure/staff-quarters. */
      leaf("staff-quarters", "Staff Quarters", [
        { key: "kvk", label: "KVK" },
        { key: "noOfStaffQuarters", label: "No of Staff Quarters" },
        { key: "dateOfCompletion", label: "Date of Completion" },
        { key: "remark", label: "Remark" },
      ]),
    ]),
    group("vehicles", "Vehicles Information", [
      /** 4 columns and no KVK column at all - confirmed 2026-08-22. Page H1 is "View Vehicles"; the landing card says "Vehicles". */
      leaf(
        "view-vehicles",
        "View Vehicles",
        [
          { key: "vehicleName", label: "Vehicle Name" },
          { key: "registrationNo", label: "Registration No" },
          { key: "yearOfPurchase", label: "Year of Purchase" },
          { key: "totalCost", label: "Total Cost" },
        ],
        "Vehicles",
      ),
      /** Real columns confirmed live at /forms/about-kvk/vehicle-details - this is the full confirmed set, no horizontal scroll beyond it in the source. */
      leaf("vehicle-details", "Vehicle Details", [
        { key: "reportingYear", label: "Reporting Year" },
        { key: "kvk", label: "KVK" },
        { key: "vehicleName", label: "Vehicle Name" },
        { key: "registrationNumber", label: "Registration Number" },
        { key: "totalRunKms", label: "Total Run (Kms)" },
      ]),
    ]),
    group("equipments", "Equipments Information", [
      leaf(
        "view-equipments",
        "View Equipments",
        [
          { key: "kvk", label: "KVK" },
          { key: "equipmentName", label: "Equipment Name" },
          { key: "companyBrandModel", label: "Company / Brand / Model" },
          { key: "yearOfPurchase", label: "Year of Purchase" },
          { key: "totalCost", label: "Total Cost (Rs)" },
          { key: "sourceOfFunding", label: "Source of Funding" },
        ],
        "Equipments",
      ),
      /** Positions 4-5 were wrong: the real table has Company / Brand / Model and Source of Fund there. Anything beyond column 5 sits under the pinned Action column and is unconfirmed. */
      leaf("equipment-details", "Equipment Details", [
        { key: "reportingYear", label: "Reporting Year" },
        { key: "kvk", label: "KVK" },
        { key: "equipmentName", label: "Equipment Name" },
        { key: "companyBrandModel", label: "Company / Brand / Model" },
        { key: "sourceOfFund", label: "Source of Fund" },
      ]),
    ]),
  ],
  {
    description:
      "Manage KVK basic information, staff, infrastructure, vehicles, and equipments",
  },
);

/**
 * Form Management -> Achievements (13-card landing confirmed on screen).
 * "On Farm Trial" and "Front Line Demonstration" real source data (client's
 * zip, "8.ADMIN ACHIEVEMENT" folder) turned out to be complex multi-section
 * reports (a 20-category summary table plus a detailed per-crop/technology
 * breakdown with full economics), not flat tables - so both keep the generic
 * single-column view rather than guessed columns until a real simple-list
 * schema is confirmed. The FLD file (78 pages) was read in full for its
 * structure; the OFT file (18MB) could not be opened in this environment, so
 * its structure is unconfirmed but presumed parallel to FLD's.
 */
const achievements = group("achievements", "Achievements", [
  leaf(
    "technical-achievement",
    "Technical Achievement Summary",
    GENERIC_MASTER_COLUMNS,
    "Technical Achievement",
  ),
  /** Columns re-confirmed live against atariams.org's own "View OFT Details" table (2026-08-25): Reporting Year IS a real column here, right after S.No - the earlier AMS User Manual read had wrongly called it filter-only. */
  leaf(
    "oft",
    "OFT",
    [
      { key: "reportingYear", label: "Reporting Year" },
      { key: "kvk", label: "KVK Name" },
      { key: "staff", label: "Staff" },
      { key: "trialOnForm", label: "Title of On Farm Trial (OFT)" },
      { key: "problemDiagnosed", label: "Problem Diagnosed" },
      { key: "status", label: "Ongoing/Completed" },
    ],
    "On Farm Trial",
    undefined,
    /** Real page H1/breadcrumb confirmed live 2026-08-15 ("project over" reference): "On Farm Trials (OFT)" - the landing-card link text stays the short "OFT" (label, above). */
    "On Farm Trials (OFT)",
  ),
  /**
   * Client direction (2026-08-25): keep this app's existing flow/structure
   * exactly as-is - only fix naming/columns to match atariams.org, don't
   * remove or restructure. Note for the record: the real Super Admin
   * sidebar's FLD section only shows "View FLD" as a child - "Extension &
   * Training activities under FLD" and "Technical Feedback on FLD" below
   * were not found there (verified live, both visually and via DOM) - kept
   * anyway per explicit instruction, not because they were re-confirmed.
   * View FLD's own columns did get a real fix: Reporting Year/Start
   * Date/End Date, confirmed present in the real table.
   */
  /** Card label confirmed live 2026-08-15 ("project over" reference): the landing card reads the short "Front Line Demonstration" (singular, no "(FLD)") - the group's own label stays the long form for the leaf breadcrumbs/tabs beneath it. */
  group("front-line-demonstration", "Front Line Demonstrations (FLD)", [
    leaf(
      "view-fld",
      "Front Line Demonstrations (FLD)",
      [
        { key: "reportingYear", label: "Reporting Year" },
        { key: "startDate", label: "Start Date" },
        { key: "endDate", label: "End Date" },
        { key: "kvk", label: "KVK Name" },
        { key: "category", label: "Crop Category" },
        { key: "subCategory", label: "Crop Name" },
        {
          key: "technologyDemonstrated",
          label: "Name of Technology Demonstrated",
        },
        { key: "status", label: "Ongoing/Completed" },
      ],
      "View FLD",
    ),
    leaf(
      "fld-extension-training",
      "Extension & Training activities under FLD",
      [
        { key: "fldName", label: "FLD Name" },
        { key: "activity", label: "Activity" },
        { key: "date", label: "Date" },
        { key: "activityCount", label: "No. of Activity" },
        { key: "participantCount", label: "No. of Participant" },
        { key: "remark", label: "Remark" },
      ],
      "Extension and Training activities under FLD",
    ),
    leaf(
      "fld-technical-feedback",
      "Technical Feedback on FLD",
      [
        { key: "fld", label: "FLD" },
        { key: "crop", label: "Crop" },
        { key: "feedback", label: "Feedback" },
      ],
      "Technical Feedback on the demonstrated technology",
    ),
  ], { cardLabel: "Front Line Demonstration" }),
  /** Columns re-confirmed live against atariams.org's own "Achievements On Training" screenshot (2026-08-24, client pointer #9) - the real table has 3 more columns than the earlier AMS User Manual pass caught: Start Date, End Date, and Training Title all sit between KVK Name and Venue; "Training Type" was never a real column, replaced by these. */
  leaf(
    "trainings",
    "Trainings",
    [
      { key: "reportingYear", label: "Reporting Year" },
      { key: "kvk", label: "KVK Name" },
      { key: "startDate", label: "Start Date" },
      { key: "endDate", label: "End Date" },
      { key: "program", label: "Training Program" },
      { key: "title", label: "Training Title" },
      { key: "venue", label: "Venue" },
      { key: "trainingDiscipline", label: "Training Discipline" },
      /**
       * Real 3-level master chain confirmed live 2026-08-15 ("project over"
       * reference): Training Type -> Training Area -> Training Thematic
       * Area (see `trainingMaster` group above). `thematicArea` already
       * existed as a plain field, now wired to the chain's real dropdown
       * instead of free text; `trainingType`/`trainingArea` are new. All
       * three are `formOnly` since the real LIST table (re-confirmed live
       * 2026-08-24, comment above) does NOT show them, only the Edit form does.
       */
      { key: "trainingType", label: "Training Type", sourceMaster: { master: "training-type", optionKey: "trainingType" }, formOnly: true },
      { key: "trainingArea", label: "Training Area", sourceMaster: { master: "training-area", optionKey: "trainingAreaName", dependsOnKey: "trainingType", filterKey: "trainingType" }, formOnly: true },
      { key: "thematicArea", label: "Thematic Area", sourceMaster: { master: "training-thematic-area", optionKey: "thematicArea", dependsOnKey: "trainingArea", filterKey: "trainingAreaName" } },
      /** Real dropdown added 2026-08-28 (client request) - sourced from the real Training Clientele Master, same sourceMaster pattern as every other cross-master dropdown. Venue has no equivalent master anywhere in the reference (only ever appears as a free-text field), so it stays plain text rather than guessing option values. */
      { key: "clientele", label: "Clientele", sourceMaster: { master: "training-clientele", optionKey: "clientele" } },
      { key: "onCampusOffCampus", label: "On Campus/Off Campus", staticOptions: ["On Campus", "Off Campus"], formOnly: true },
      { key: "courseCoordinator", label: "Course Co-ordinator", formOnly: true },
      { key: "fundingSource", label: "Funding Source", formOnly: true },
      { key: "fundingAgencyName", label: "Funding Agency Name", formOnly: true },
      { key: "farmersDetails", label: "Farmers Details", fieldKind: "demographic-breakdown", formOnly: true },
    ],
    "Training",
  ),
  /** Columns re-confirmed live against atariams.org's own "Extension programmes" / "Other Extension Activity" screenshots (2026-08-24, client pointer #10) - both real tables lead with Reporting Year, and Extension Activities also carries Start/End Date; the earlier AMS User Manual pass had missed all three. */
  group("extension", "Extension", [
    leaf("extension-activities", "Extension Activities", [
      { key: "reportingYear", label: "Reporting Year" },
      { key: "kvk", label: "KVK Name" },
      { key: "startDate", label: "Start Date" },
      { key: "endDate", label: "End Date" },
      /** Real dropdown (client request, 2026-08-28) - sourced from the real Extension Activity Master, same sourceMaster pattern as every other cross-master dropdown. */
      {
        key: "natureOfExtensionActivity",
        label: "Nature of Extension Activity",
        sourceMaster: { master: "extension-activity", optionKey: "activityName" },
      },
      { key: "noOfActivities", label: "No. of Activities" },
      { key: "noOfParticipants", label: "No. of Participants" },
      /** Real Edit form fields confirmed live 2026-08-15 ("project over" reference, "Edit Extension Activities") - `staff` plain text (same convention as Oft.staff); two independent demographic blocks (Farmers + Extension Officials), both previously entirely missing. */
      { key: "staff", label: "Name of SMS/KVK Head", formOnly: true },
      { key: "farmersDetails", label: "Farmers", fieldKind: "demographic-breakdown", demographicPrefix: "farmers", formOnly: true },
      { key: "extensionOfficials", label: "Extension Officials", fieldKind: "demographic-breakdown", demographicPrefix: "officials", formOnly: true },
    ]),
    leaf("other-extension-activities", "Other Extension Activities", [
      { key: "reportingYear", label: "Reporting Year" },
      { key: "kvk", label: "KVK Name" },
      {
        key: "natureOfExtensionActivity",
        label: "Nature of Extension Activity",
        sourceMaster: { master: "other-extension-activity", optionKey: "activityName" },
      },
      { key: "noOfActivities", label: "No. of Activities" },
      /** Real Edit form fields confirmed live 2026-08-15 ("Edit Other Extension Activities") - were entirely missing before this. */
      { key: "staff", label: "Name of SMS/KVK Head", formOnly: true },
      { key: "startDate", label: "Start Date", formOnly: true },
      { key: "endDate", label: "End Date", formOnly: true },
    ]),
  ]),
  group("special-days", "Special Days", [
    /** Columns re-confirmed live against atariams.org's own "View Technology Week Celebration" screenshot (2026-08-24, client pointer #11): the real table DOES carry Start Date and End Date after all - the earlier AMS User Manual read missed them. */
    leaf("technology-week-celebration", "Technology Week Celebration", [
      { key: "startDate", label: "Start Date" },
      { key: "endDate", label: "End Date" },
      { key: "kvk", label: "KVK" },
      { key: "typeOfActivities", label: "Type of Activities" },
      { key: "noOfActivities", label: "No. of Activities" },
      {
        key: "relatedCropTechnology",
        label: "Related Crop/Livestock Technology",
      },
      { key: "numberOfParticipants", label: "Number of Participants" },
    ]),
    /** Real sidebar label confirmed live: "Celebration of important days", not "Celebration Days". */
    leaf("celebration-days", "Celebration of important days", [
      { key: "kvk", label: "KVK" },
      { key: "importantDay", label: "Important Days" },
      { key: "eventDate", label: "Event Date" },
      { key: "noOfActivities", label: "No of Activities" },
      /** Real Edit form fields confirmed live 2026-08-15 ("Edit Celebration Days") - same two-block shape as Extension Activities above, were entirely missing before this. */
      { key: "farmersDetails", label: "Farmers", fieldKind: "demographic-breakdown", demographicPrefix: "farmers", formOnly: true },
      { key: "extensionOfficials", label: "Extension Officials", fieldKind: "demographic-breakdown", demographicPrefix: "officials", formOnly: true },
    ]),
    /** Real columns confirmed live, extended 2026-08-24 with the participant breakdown from the client's own Poshan Maah reporting sheet. */
    leaf("poshan-maaha", "Poshan Maaha", [
      { key: "kvk", label: "KVK" },
      { key: "activityDate", label: "Activity Date" },
      { key: "activitiesConducted", label: "Activities Conducted" },
      { key: "eventName", label: "Event Name" },
      { key: "saplingsPlanted", label: "Saplings Planted" },
      { key: "vegetableKits", label: "Vegetable Kits" },
      { key: "participantsGirls", label: "Participants - Girls" },
      {
        key: "participantsPublicRepresentatives",
        label: "Participants - Public Representatives",
      },
      { key: "participantsFarmWoman", label: "Participants - Farm Woman" },
      { key: "participantsFarmers", label: "Participants - Farmers" },
      {
        key: "participantsAganwadiWorkers",
        label: "Participants - Aganwadi Workers",
      },
      {
        key: "participantsGovtOfficials",
        label: "Participants - Govt Officials",
      },
      { key: "totalParticipants", label: "Total Participants" },
    ]),
  ]),
  /**
   * Real location confirmed via atari-photo-zip/IMG-20260817-WA0030.jpg: reached
   * from the Achievements page (sidebar highlights "Achievements" as active), not
   * from Projects. Our URL nests it under achievements/ for a consistent
   * breadcrumb; the real app's own URL is flatter (/forms/swachhta-bharat-
   * abhiyaan/sewa), an apparent routing quirk in the reference app itself.
   */
  group("swachhta-bharat-abhiyaan", "Swachhta Bharat Abhiyaan", [
    leaf(
      "sewa",
      "Swachhta hi Sewa",
      [
        { key: "kvk", label: "KVK" },
        {
          key: "dateDurationOfObservation",
          label: "Date Duration of Observation",
        },
        {
          key: "totalNoOfActivitiesUndertaken",
          label: "Total No of Activities Undertaken",
        },
        { key: "noOfStaffs", label: "No of Staffs" },
        { key: "noOfFarmers", label: "No of Farmers" },
      ],
      "Observation of Swachhta hi Sewa SBA",
    ),
    /** Same shape as Sewa, confirmed 2026-08-22 - this leaf previously had no real columns. */
    leaf(
      "pakhwada",
      "Swachta Pakhwada",
      [
        { key: "kvk", label: "KVK" },
        {
          key: "dateDurationOfObservation",
          label: "Date Duration of Observation",
        },
        {
          key: "totalNoOfActivitiesUndertaken",
          label: "Total No of Activities Undertaken",
        },
        { key: "noOfStaffs", label: "No of Staffs" },
        { key: "noOfFarmers", label: "No of Farmers" },
      ],
      "Observation of Swachta Pakhwada",
    ),
    /** 4 confirmed columns; more vermicomposting-style pairs follow off-screen and stay undeclared. */
    leaf(
      "budget-expenditure",
      "Budget expenditure",
      [
        { key: "kvk", label: "KVK" },
        { key: "reportingYear", label: "Reporting Year" },
        {
          key: "vermicompostingVillagesCovered",
          label: "Vermicomposting No of Village Covered",
        },
        {
          key: "vermicompostingTotalExpenditure",
          label: "Vermicomposting Total Expenditure",
        },
      ],
      "Details of quarterly budget expenditure on Swachh activities including SAP",
    ),
  ]),
  /** Re-confirmed live 2026-08-24 against atariams.org: Reporting Year is a filter there, not a column - the earlier version wrongly included it as one. */
  leaf(
    "production-supply",
    "Production and supply of Technological products",
    [
      { key: "kvk", label: "KVK" },
      { key: "category", label: "Category" },
      { key: "variety", label: "Variety" },
      { key: "quantity", label: "Quantity" },
    ],
    "Production & Supply of Technological Products",
  ),
  /**
   * Real group + structure confirmed live against atariams.org (2026-08-24,
   * client pointers #12 and #15): "Soil and Water Testing" is its own
   * section with 3 leaves - a soil-testing-equipment inventory (new, not
   * previously modeled), the Soil/Water/Plant analysis table (now with the
   * Start/End Date columns the earlier pass missed), and World Soil Day
   * Celebration. World Soil Day genuinely lives here in the real app, not
   * nested under Technology Week Celebration as the client's own pointer
   * text suggested - moved out of the `special-days` group above to match
   * what's actually live.
   */
  group("soil-water", "Soil and Water Testing", [
    leaf("soil-testing-equipment", "Equipment Details", [
      { key: "kvk", label: "KVK Name" },
      { key: "analysis", label: "Analysis" },
      { key: "equipmentName", label: "Equipment Name" },
      { key: "quantity", label: "Quantity" },
    ]),
    leaf(
      "soil-water-testing",
      "Soil, Water and Plant analysis",
      [
        { key: "kvk", label: "KVK Name" },
        { key: "startDate", label: "Start Date" },
        { key: "endDate", label: "End Date" },
        { key: "analysis", label: "Analysis" },
        { key: "noOfSamplesAnalyzed", label: "No. of Samples Analyzed" },
        { key: "noOfVillagesCovered", label: "No. of Villages Covered" },
        { key: "amountRealized", label: "Amount Realized (Rs.)" },
      ],
      "Detail of Soil, Water and Plant Analysis",
    ),
    leaf(
      "world-soil-day",
      "World Soil Day",
      [
        { key: "kvk", label: "KVK Name" },
        /** Real field confirmed live 2026-08-15 - was entirely missing before this. */
        { key: "reportingYear", label: "Reporting Year" },
        {
          key: "noOfActivitiesConducted",
          label: "No. of Activity Conducted",
        },
        {
          key: "soilHealthCardsDistributed",
          label: "Soil Health Cards Distributed",
        },
        { key: "noOfVip", label: "No of VIP" },
        { key: "vipNames", label: "Name(s) of VIP(s) Involved if Any" },
        {
          key: "totalParticipants",
          label: "Total No. of Participants Attended the Programme",
        },
      ],
      "Details of World Soil Day Celebration",
    ),
  ]),
  /** Re-confirmed live against atariams.org (2026-08-25): real page H1 is "Publication List", and the real table has only 5 named columns - Author Type/Naas Rating/ISBN Number were never real, removed. Publication Item and Year are filters there, not columns. */
  leaf(
    "publications",
    "Publication List",
    [
      { key: "kvk", label: "KVK Name" },
      { key: "itemName", label: "Item Name" },
      { key: "title", label: "Title" },
      { key: "authorName", label: "Author Name" },
      { key: "journalName", label: "Journal Name" },
    ],
    "KVKs Publication Details",
  ),
  /** 6 real columns confirmed 2026-08-22. Real H1 is hyphenated and singular; the landing card uses the longer plural form. */
  leaf(
    "hrd",
    "Human-Resource Development",
    [
      { key: "kvk", label: "KVK" },
      { key: "staff", label: "Staff" },
      { key: "course", label: "Course" },
      { key: "startDate", label: "Start Date" },
      { key: "endDate", label: "End Date" },
      { key: "venue", label: "Venue" },
      { key: "organizer", label: "Organizer" },
    ],
    "Human Resources Development",
  ),
  /**
   * All three tabs re-confirmed against the reference - the earlier
   * "award name / awarding body / year / recipient" shape was a reasonable
   * guess but wrong in every column. Real tables all lead with KVK +
   * Reporting Year. Each has a horizontal scrollbar,
   * so further columns exist (the edit forms carry Achievement and
   * Conferring Authority) - those stay undeclared rather than guessed.
   */
  /** Columns confirmed against the client's own "View Award" screenshots for KVK/Scientist/Farmer (AMS User Manual p.82-84). Reporting Year is a filter there, not a column. */
  group("awards", "Award and Recognition", [
    leaf(
      "kvk",
      "Awards (KVK)",
      [
        { key: "kvk", label: "KVK Name" },
        { key: "award", label: "Award" },
        { key: "amount", label: "Amount" },
        { key: "achievement", label: "Achievement" },
        { key: "conferringAuthority", label: "Conferring Authority" },
      ],
      "KVK",
    ),
    leaf("scientist", "Scientist", [
      { key: "kvk", label: "KVK Name" },
      { key: "headScientist", label: "Scientist" },
      { key: "award", label: "Award" },
      { key: "amount", label: "Amount" },
      { key: "achievement", label: "Achievement" },
      { key: "conferringAuthority", label: "Conferring Authority" },
    ]),
    leaf("farmer", "Farmer", [
      { key: "kvk", label: "KVK Name" },
      { key: "farmerName", label: "Farmer Name" },
      { key: "address", label: "Address" },
      { key: "contactNumber", label: "Contact No." },
      { key: "award", label: "Award" },
      { key: "amount", label: "Amount" },
      { key: "achievement", label: "Achievement" },
      { key: "conferringAuthority", label: "Conferring Authority" },
    ]),
  ]),
]);

/**
 * Form Management -> Projects.
 *
 * Real card grid confirmed directly from a the reference of this exact
 * page (client's zip, "Projects form/the reference 2026-08-13 145837.png"): CFLD,
 * NICRA, and NICRA Others cards were fully visible with their card->leaf
 * pairing; ARYA/SAFAL, Natural Farming and TSP/SCSP cards were visible in the
 * grid but the reference was scrolled before their leaf links appeared, and
 * more cards exist further down that were never captured in any reference -
 * so those five groups below keep the leaf structure from the earlier
 * video/the reference pass (not re-confirmed this round) rather than guessing
 * new ones. Swachhta Bharat Abhiyaan was removed from here - the real app
 * reaches it from the Achievements page, not Projects (see `achievements`
 * above).
 */
const projects = group(
  "projects",
  "Projects",
  [
    group("cfld", "CFLD", [
      /**
       * Columns confirmed against the client's own live atariams.org
       * "Technical Parameters of CFLD" screenshot (2026-08-24, full-width,
       * real rows with an Ongoing/Completed status badge matching this
       * app's own OFT/FLD badge colours) - supersedes an earlier merge from
       * two lower-confidence sources that had added "Existing Variety
       * Name"/"Existing Yield" as list columns; those belong on the Add
       * form only (already present there), not this list. Reporting Year
       * appears here as its own real column - a genuine exception to how
       * every other Reporting-Year-filtered list in this app works.
       */
      leaf("technical-parameter", "Technical Parameter", [
        { key: "reportingYear", label: "Reporting Year" },
        { key: "kvk", label: "KVK Name" },
        { key: "crop", label: "Crop" },
        { key: "technologyDemonstrated", label: "Technology Demonstrated" },
        { key: "areaHa", label: "Area (ha)" },
        { key: "numberOfFarmers", label: "Number of Farmer" },
        { key: "districtYield", label: "District Yield (D)" },
        { key: "stateYield", label: "State Yield (S)" },
        { key: "potentialYield", label: "Potential Yield (P)" },
        { key: "status", label: "Status" },
      ]),
      /** Columns confirmed against the client's own "Extension Activities" (CFLD) screenshot (AMS User Manual p.28). */
      /** Number-of-farmers columns confirmed from the client's real "Extension activities under CFLD conducted" table (CFLD Extension Activity.pdf, 2026-08-25) - General/OBC/SC/ST each split Male/Female, matching the report's own grouped column header exactly. */
      leaf("extension-activity-cfld", "Extension Activity (CFLD)", [
        { key: "kvk", label: "KVK Name" },
        { key: "season", label: "Season" },
        { key: "activitiesOrganized", label: "Extension Activities Organized" },
        { key: "date", label: "Date" },
        { key: "placeOfActivity", label: "Place of Activity" },
        { key: "generalMale", label: "General - Male" },
        { key: "generalFemale", label: "General - Female" },
        { key: "obcMale", label: "OBC - Male" },
        { key: "obcFemale", label: "OBC - Female" },
        { key: "scMale", label: "SC - Male" },
        { key: "scFemale", label: "SC - Female" },
        { key: "stMale", label: "ST - Male" },
        { key: "stFemale", label: "ST - Female" },
      ]),
      /** Columns confirmed against the client's own "Budget Utilization" (CFLD) screenshot (AMS User Manual p.29). */
      /** Columns confirmed against the client's own live atariams.org "Budget Utilization" screenshot (2026-08-24) - a simpler, more current structure than the earlier manual screenshot's Items/Budget Received/Budget Utilization/Balance breakdown. */
      leaf("budget-utilization", "Budget Utilization", [
        { key: "kvk", label: "KVK Name" },
        { key: "crop", label: "Crop" },
        { key: "season", label: "Season" },
        { key: "overallFundAllocation", label: "Overall Fund Allocation" },
      ]),
      /** New leaf, confirmed against the client's own "Crop wise Photographs" screenshot (AMS User Manual p.27) - not present before this pass. */
      leaf("crop-wise-images", "Crop Wise Images", [
        { key: "kvk", label: "KVK Name" },
        { key: "crop", label: "Crop" },
        { key: "image", label: "Image", fileKind: "image", uploadKind: "cfld-crop-image" },
      ]),
    ]),
    /**
     * Real columns + structure confirmed live against atariams.org
     * (2026-08-24, client pointer #19 "replicate the complete form headings
     * and structure"): real group label is "NICRA (Technology Demonstration
     * component)", and "NICRA Others" is nested INSIDE NICRA as its own
     * expandable "Others" child in the real sidebar - not a sibling
     * top-level group as coded before.
     */
    group("nicra", "NICRA (Technology Demonstration component)", [
      leaf("basic-information", "Basic Information", [
        { key: "kvk", label: "KVK" },
        { key: "rfDistrictNormal", label: "RF (mm) district Normal" },
        { key: "rfDistrictReceived", label: "RF (mm) district Received" },
        { key: "maxTemperature", label: "Max. Temperature 0C" },
        { key: "minTemperature", label: "Min. Temperature 0C" },
      ]),
      leaf("details", "Details", [
        { key: "kvk", label: "KVK" },
        { key: "cropName", label: "Crop Name" },
        { key: "seasonName", label: "Season Name" },
        { key: "technologyDemonstration", label: "Technology demonstration" },
        { key: "noOfFarmers", label: "No. of farmers" },
      ]),
      leaf("training", "Training", [
        { key: "kvk", label: "KVK Name" },
        { key: "title", label: "Title" },
        { key: "startDate", label: "Start Date" },
        { key: "endDate", label: "End Date" },
        { key: "farmersAttended", label: "Number of farmers attended" },
      ]),
      leaf("extension-activity-nicra", "Extension Activity (NICRA)", [
        { key: "kvk", label: "KVK Name" },
        { key: "activityName", label: "Activity Name" },
        { key: "places", label: "Places" },
        { key: "startDate", label: "Start Date" },
        { key: "endDate", label: "End Date" },
        { key: "farmersAttended", label: "Number of farmers attended" },
      ]),
      group("others", "Others", [
        leaf("intervention", "Intervention", [
          { key: "kvk", label: "KVK Name" },
          { key: "startDate", label: "Start Date" },
          { key: "endDate", label: "End Date" },
          { key: "seedBankFodderBank", label: "Seed Bank/Fodder Bank" },
          { key: "crop", label: "Crop" },
          { key: "variety", label: "Variety" },
          { key: "quantity", label: "Quantity in (q)" },
        ]),
        leaf("revenue-generated", "Revenue Generated", [
          { key: "kvk", label: "KVK" },
          { key: "year", label: "Year" },
          { key: "revenue", label: "Revenue" },
          { key: "total", label: "Total" },
        ]),
        leaf(
          "custom-hiring-farm-implement",
          "Custom Hiring of Farm-Implement",
          [
            { key: "kvk", label: "KVK" },
            {
              key: "farmImplementName",
              label: "Name of farm implement/equipment",
            },
            {
              key: "farmersUsed",
              label: "No. of farmers used Implement",
            },
            {
              key: "areaCovered",
              label: "Area covered by Farm Implement",
            },
            { key: "hoursUsed", label: "Farm Implement used (In Hours)" },
            {
              key: "revenueGenerated",
              label: "Revenue generated by Farm Implement (Rs.)",
            },
            {
              key: "repairExpenditure",
              label: "Expenditure incurred on repairing (Rs.)",
            },
          ],
        ),
        leaf("village-wise-vcrmc", "Village wise VCRMC", [
          { key: "kvk", label: "KVK" },
          { key: "villageName", label: "Village name" },
          { key: "constitutionDate", label: "VCRMC Constitution date" },
          { key: "members", label: "VCRMC members (no.)" },
          {
            key: "meetingsOrganized",
            label: "Meetings organized by VCRMC (no.)",
          },
          { key: "meetingDate", label: "Date of VCRMC meeting" },
          { key: "secretaryName", label: "Name of Secretary" },
        ]),
        leaf(
          "soil-health-card",
          "Soil Health Card prepared and distributed",
          [
            { key: "startDate", label: "Start Date" },
            { key: "endDate", label: "End Date" },
            { key: "kvk", label: "KVK" },
            {
              key: "samplesCollected",
              label: "No. of soil samples collected",
            },
            { key: "samplesAnalysed", label: "No. of samples analysed" },
            { key: "shcIssued", label: "SHC issued" },
            {
              key: "farmersBenefitted",
              label: "No. of farmers benefitted",
            },
          ],
        ),
        leaf("convergence-programme", "Convergence Programme", [
          { key: "startDate", label: "Start Date" },
          { key: "endDate", label: "End Date" },
          { key: "kvk", label: "KVK" },
          { key: "scheme", label: "Development Scheme /Programme" },
          { key: "natureOfWork", label: "Nature of work" },
          { key: "amount", label: "Amount (Rs.)" },
        ]),
        leaf(
          "dignitaries-visited-nicra-villages",
          "Dignitaries visited NICRA Villages",
          [
            { key: "kvk", label: "KVK" },
            { key: "vipExperts", label: "VIP/Experts" },
            { key: "name", label: "Name" },
            { key: "dateOfVisit", label: "Date of visited" },
          ],
        ),
        leaf("pi-co-pi-list", "Name of PI & Co-PI List", [
          { key: "startDate", label: "Start Date" },
          { key: "endDate", label: "End Date" },
          { key: "kvk", label: "KVK" },
          { key: "piCoPi", label: "PI/CO PI" },
          { key: "name", label: "Name" },
        ]),
      ]),
    ], { cardLabel: "NICRA" }),
    /** Card label confirmed live (2026-08-29, "project over" reference): "ARYA / SAFAL", not the earlier no-"/SAFAL" guess. */
    group("arya-safal", "Attracting and Retaining Youth in Agriculture(ARYA)", [
      leaf("arya-safal-current-year", "Current Year Details", [
        { key: "kvk", label: "KVK Name" },
        { key: "enterprise", label: "Enterprise" },
        { key: "viableUnits", label: "Viable units" },
        { key: "closedUnits", label: "Closed units" },
        { key: "startDate", label: "Start Date" },
        { key: "endDate", label: "End Date" },
        { key: "groupsFormed", label: "No. of Groups Formed" },
        { key: "groupsActive", label: "No. of Groups active" },
      ]),
      leaf("arya-safal-previous-year", "Previous Year Evaluation", [
        { key: "kvk", label: "KVK Name" },
        { key: "enterprise", label: "Enterprise" },
        { key: "totalClosed", label: "Total Closed" },
        { key: "closingDate", label: "Closing Date" },
        { key: "totalRestarted", label: "Total Restarted" },
        { key: "restartedDate", label: "Restarted date" },
      ]),
    ], { cardLabel: "ARYA / SAFAL" }),
    /** Real group label confirmed live: "Out-scaling of Natural Farming" (in-page title); card label on the Projects landing page is the short "Natural Farming" (confirmed live, 2026-08-29 "project over" reference). */
    group("natural-farming", "Out-scaling of Natural Farming", [
      leaf("nf-geographical", "Geographical information", [
        { key: "kvk", label: "KVK Name" },
        { key: "startDate", label: "Start Date" },
        { key: "endDate", label: "End Date" },
        { key: "agroClimaticZone", label: "Agro Climatic Zone" },
        {
          key: "farmingSituation",
          label: "Farming Situation of the Selected Farmer",
        },
        { key: "latitude", label: "Latitude (N)" },
        { key: "longitude", label: "Longitude (E)" },
      ]),
      /** Re-confirmed live 2026-08-25 via direct URL (atariams.org/project/natural-farming/physical-information) - the page's own H1 just says the generic "Natural Farming" (matches every other leaf in this group), but the URL and columns line up exactly, so this is the right leaf. */
      leaf("nf-physical", "Physical information", [
        { key: "kvk", label: "KVK Name" },
        { key: "activityName", label: "Activity Name" },
        {
          key: "trainingTitle",
          label: "Title of Natural Farming training Programme",
        },
        { key: "trainingDate", label: "Date of Training" },
        { key: "venue", label: "Venue of programme" },
        { key: "participants", label: "Participants" },
      ]),
      leaf("nf-demonstration", "Demonstration Information", [
        { key: "kvk", label: "KVK Name" },
        { key: "farmerName", label: "Farmer Name" },
        { key: "activityName", label: "Name of Activity" },
        { key: "crop", label: "Crop" },
        { key: "variety", label: "Variety" },
        { key: "farmerAddress", label: "Address of Farmer" },
        { key: "farmerContact", label: "Contact Number" },
        { key: "agroClimaticZone", label: "Agro Climatic Zone" },
        { key: "croppingPattern", label: "Cropping Pattern" },
        { key: "farmingSituation", label: "Farming Situation" },
        { key: "latitude", label: "Latitude (N)" },
        { key: "longitude", label: "Longitude (E)" },
        { key: "season", label: "Season" },
        { key: "technologyDemonstrated", label: "NF Component/Technology Demonstrated" },
        { key: "areaHa", label: "Area (ha) in NF Practice" },
        { key: "farmerPracticeDetail", label: "Detail of Farmer Practice" },
        { key: "farmerFeedback", label: "Farmer Feedback" },
      ]),
      leaf(
        "nf-already-practicing",
        "Farmer Already Practicing Natural Farming",
        [
          { key: "kvk", label: "KVK Name" },
          { key: "farmerName", label: "Farmer Name" },
          { key: "address", label: "Address" },
          { key: "normalCropsGrown", label: "Normal crops grown" },
          {
            key: "practicingYear",
            label: "Practicing year of natural farming",
          },
          { key: "contactNumber", label: "Contact Number" },
          { key: "activityName", label: "Name of Activity" },
          { key: "crop", label: "Crop" },
          { key: "technologyDemonstrated", label: "NF Component/Technology Demonstrated" },
          { key: "areaHa", label: "Area (ha) in NF Practice" },
          { key: "farmerFeedback", label: "Farmer Feedback" },
        ],
      ),
      leaf("nf-beneficiaries", "Details of Beneficiaries", [
        { key: "kvk", label: "KVK Name" },
        { key: "numberOfBlock", label: "Number of block" },
        { key: "numberOfVillage", label: "Number of village" },
        { key: "numberOfTraining", label: "Number of training" },
        {
          key: "farmersInfluenced",
          label: "No. of farmers influenced to adopt Natural Farming",
        },
      ]),
      leaf("nf-soil-data", "Soil Data information", [
        { key: "kvk", label: "KVK Name" },
        { key: "season", label: "Season" },
        { key: "type", label: "Type" },
        { key: "crop", label: "Crop" },
        { key: "beforePh", label: "Before pH" },
        { key: "beforeEc", label: "Before EC (dS/m)" },
        { key: "beforeEcOc", label: "Before EC OC (%)" },
        { key: "afterPh", label: "After pH" },
        { key: "afterEc", label: "After EC (dS/m)" },
        { key: "afterEcOc", label: "After EC OC (%)" },
      ]),
      leaf("nf-budget-expenditure", "Budget Expenditure", [
        { key: "kvk", label: "KVK Name" },
        { key: "activityName", label: "Name of Activity" },
        { key: "activitiesOrganised", label: "Number of activity organised" },
        { key: "budgetSanction", label: "Budget sanction (Rs)" },
        { key: "budgetExpenditure", label: "Budget expenditure (Rs)" },
        {
          key: "totalBudgetExpenditure",
          label: "Total Budget Expenditure (Rs)",
        },
      ]),
    ], { cardLabel: "Natural Farming" }),
    /** Real structure confirmed live: ONE combined leaf "View Sub Plan Activity" with a Type column (TSP/SCSP), not two separate leaves. */
    group("tsp-scsp", "TSP/SCSP", [
      leaf("view-sub-plan-activity", "View Sub Plan Activity", [
        { key: "kvk", label: "KVK Name" },
        { key: "type", label: "Type" },
        { key: "activities", label: "Activities" },
        { key: "noOfTraining", label: "No of Training" },
        { key: "beneficiaries", label: "No. of beneficiaries" },
      ]),
    ]),
    /**
     * The first two NARI labels are truncated in the card itself; they are
     * completed from the third, which renders in full and fixes the shared
     * "Nutri-Smart village" wording.
     */
    /** Real columns confirmed live against atariams.org for all 5 leaves (2026-08-24, client pointer #19). */
    group("nari", "NARI", [
      leaf(
        "nari-nutrition-garden",
        "Details of established Nutrition Garden in Nutri-Smart village",
        [
          { key: "kvk", label: "KVK Name" },
          { key: "nutriSmartVillage", label: "Name of Nutri-Smart Village" },
          {
            key: "typeOfNutritionalGarden",
            label: "Type of Nutritional Garden",
          },
          { key: "numbers", label: "Numbers" },
          { key: "areaSqm", label: "Area (sqm)" },
          { key: "activity", label: "Activity", sourceMaster: { master: "nari-activity", optionKey: "name" } },
          { key: "male", label: "Male" },
          { key: "female", label: "Female" },
        ],
      ),
      leaf(
        "nari-bio-fortified",
        "Details of Bio-fortified crops used in Nutri-Smart village",
        [
          { key: "kvk", label: "KVK Name" },
          { key: "nutriSmartVillage", label: "Name of Nutri-Smart Village" },
          { key: "season", label: "Season" },
          { key: "activity", label: "Activity", sourceMaster: { master: "nari-activity", optionKey: "name" } },
          { key: "categoryOfCrop", label: "Category of crop" },
          { key: "numberOfCrops", label: "No. of Crops" },
          { key: "male", label: "Male" },
          { key: "female", label: "Female" },
        ],
      ),
      leaf(
        "nari-value-addition",
        "Details of Value addition in Nutri-Smart village",
        [
          { key: "kvk", label: "KVK Name" },
          { key: "nutriSmartVillage", label: "Name of Nutri-Smart Village" },
          { key: "cropName", label: "Name of Crop" },
          { key: "valueAddedProduct", label: "Name of Value-added product" },
          { key: "activity", label: "Activity", sourceMaster: { master: "nari-activity", optionKey: "name" } },
          { key: "numberOfProducts", label: "No. of Products" },
          { key: "male", label: "Male" },
          { key: "female", label: "Female" },
        ],
      ),
      leaf("nari-training", "Training programmes in Nutri-Smart village", [
        { key: "kvk", label: "KVK Name" },
        { key: "nutriSmartVillage", label: "Name of Nutri-Smart Village" },
        { key: "areaOfTraining", label: "Area of Training" },
        { key: "activity", label: "Activity" },
        { key: "titleOfTraining", label: "Title of Training" },
        { key: "numberOfCourses", label: "No. of Courses" },
        { key: "male", label: "Male" },
        { key: "female", label: "Female" },
      ]),
      leaf("nari-extension", "Extension activities under NARI Project", [
        { key: "kvk", label: "KVK Name" },
        { key: "nutriSmartVillage", label: "Name of Nutri-Smart Village" },
        { key: "activity", label: "Activity" },
        { key: "nameOfActivity", label: "Name of Activity" },
        { key: "noOfActivities", label: "No of Activities" },
        { key: "male", label: "Male" },
        { key: "female", label: "Female" },
      ]),
    ]),
    group("agri-drone", "Agri-Drone", [
      leaf("agri-drone-introduction", "Introduction", [
        { key: "kvk", label: "KVK Name" },
        { key: "year", label: "Year" },
        { key: "centreName", label: "Project implementing centre name" },
        { key: "companyOfDrone", label: "Company of Drone" },
        { key: "modelOfDrone", label: "Model of Drone" },
        { key: "dronesSanctioned", label: "No. of Agri Drones Sanctioned" },
        { key: "dronesPurchased", label: "No. of Agri Drones Purchased" },
        { key: "amountSanctioned", label: "Amount sanctioned (Rs)" },
        { key: "costPerDrone", label: "Purchased cost of each Drone (Rs.)" },
        { key: "pilotNameContact", label: "Name and contact No of Agri Drone Pilot" },
        { key: "targetAreaHa", label: "Target Area for Demonstration (ha)" },
        { key: "amountSanctionedDemo", label: "Amount sanctioned for Demonstrations (Rs)" },
        { key: "amountUtilisedDemo", label: "Amount utilised for Demonstrations (Rs)" },
        { key: "areaCoveredDemoHa", label: "Area covered under demos (ha)" },
        { key: "operationType", label: "Operation carried out" },
        { key: "farmersParticipated", label: "No. of farmers participated" },
        { key: "advantages", label: "Advantages observed" },
      ]),
      leaf("agri-drone-demonstration", "Demonstration Details", [
        { key: "kvk", label: "KVK Name" },
        { key: "centreName", label: "Project Implementing Centre Name" },
        { key: "district", label: "District" },
        { key: "dateOfDemos", label: "Date of Demons." },
        { key: "placeOfDemos", label: "Place of demons." },
        { key: "cropName", label: "Crop Name" },
        { key: "noOfDemos", label: "No. of demos" },
        { key: "areaCovered", label: "Area covered under demos." },
        { key: "noOfFarmers", label: "No of farmers" },
      ]),
    ]),
    group("fpo-cbbo", "FPO and CBBO", [
      /** Columns confirmed against the client's own "Formation and Promotion of FPOs as CBBOs under NCDC funding" list + Add screenshots (AMS User Manual p.33-34) - the Add form collects several more fields than the list shows, but a custom multi-field form wasn't built for this leaf; it uses the generic per-column form like every other Projects sub-leaf. */
      leaf("fpo-cbbo-details", "Details FPO and CBBO", [
        { key: "kvk", label: "KVK Name" },
        { key: "noOfBlocksAllocated", label: "No. of Blocks Allocated" },
        {
          key: "noOfFposRegistered",
          label: "No. of FPOs Registered as CBBO",
        },
        {
          key: "trainingReceived",
          label: "Training Received by FPO Members",
        },
        {
          key: "businessPlanPrepared",
          label: "Is Business Plan Prepared for FPOs as CBBOs",
        },
        { key: "noOfFposDoingBusiness", label: "No. of FPOs Doing Business" },
      ]),
      /** Columns confirmed against the client's own "Details of commodity-based organizations/farmers cooperative society/FPO formed/Associated with KVK under NCDC funding" screenshot (AMS User Manual p.34). */
      leaf("fpo-management", "FPO Management", [
        { key: "kvk", label: "KVK Name" },
        { key: "registrationNo", label: "Registration No." },
        { key: "dateOfRegistration", label: "Date of Registration" },
        { key: "fpoName", label: "Name of the FPO" },
        { key: "fpoAddress", label: "Address of FPO" },
        { key: "totalBomMembers", label: "Total No. of BOM Members" },
        { key: "financialPosition", label: "Financial Position" },
        { key: "proposedActivity", label: "Proposed Activity" },
        { key: "commodityIdentified", label: "Commodity Identified" },
        { key: "areaHa", label: "Area (ha)" },
        { key: "totalFarmersAttached", label: "Total No. of Farmers Attached" },
        { key: "successIndicator", label: "Success Indicator" },
      ]),
    ]),
    group("drmr", "DRMR", [
      /** Columns confirmed against the client's own "Augmenting Rapeseed-Mustard Production..." (DRMR) screenshot (AMS User Manual p.35). A 6th column ("Net Return Farmer Practice") was cut off mid-word in the source screenshot but is an unambiguous completion, not a guess. */
      leaf("drmr-details", "DRMR Details", [
        { key: "kvk", label: "KVK Name" },
        { key: "varietiesUsedInIp", label: "Varieties Used in IP" },
        {
          key: "situations",
          label: "Situations (Irrigated/Rainfed)",
        },
        { key: "varietiesUsedInFp", label: "Varieties Used in FP" },
        {
          key: "netReturnImprovedPractice",
          label: "Net Return Improved Practice (Rs./ha)",
        },
        {
          key: "netReturnFarmerPractice",
          label: "Net Return Farmer Practice (Rs./ha)",
        },
        { key: "yieldKgHaIp", label: "Yield (Kg/ha) - IP" },
        { key: "yieldKgHaFp", label: "Yield (Kg/ha) - FP" },
        { key: "yiofpPercentIp", label: "YIOFP (%) - IP" },
        { key: "yiofpPercentFp", label: "YIOFP (%) - FP" },
        { key: "cocRsHaIp", label: "COC (Rs./ha) - IP" },
        { key: "cocRsHaFp", label: "COC (Rs./ha) - FP" },
        { key: "gmrRsHaIp", label: "GMR (Rs./ha) - IP" },
        { key: "gmrRsHaFp", label: "GMR (Rs./ha) - FP" },
        { key: "anmrRsHaIp", label: "ANMR (Rs./ha) - IP" },
        { key: "anmrRsHaFp", label: "ANMR (Rs./ha) - FP" },
        { key: "bcRatioIp", label: "B:C Ratio (GMR/COC) - IP" },
        { key: "bcRatioFp", label: "B:C Ratio (GMR/COC) - FP" },
      ]),
      /** Columns confirmed against the client's own "DRMR Activity" screenshot (AMS User Manual p.37). */
      leaf("drmr-activity", "DRMR Activity", [
        { key: "kvk", label: "KVK Name" },
        { key: "startDate", label: "Start Date" },
        { key: "endDate", label: "End Date" },
        { key: "training", label: "Training" },
        {
          key: "flds",
          label: "Frontline Demonstration (FLDs) and Other Demonstrations",
        },
        { key: "awarenessCamps", label: "Awareness Camps" },
        { key: "distributionOfLiterature", label: "Distribution of Literature" },
        {
          key: "itemActivity",
          label: "Item/Activity",
          staticOptions: [
            "Training (Capacity building /skill development etc)",
            "Frontline demonstrations (FLDs) and other demonstrations",
            "Awareness camps, exposure visit etc",
            "Distribution of Literature",
          ],
        },
        { key: "unit", label: "Unit" },
        { key: "quantity", label: "Quantity" },
        ...DEMOGRAPHIC_COLUMNS,
      ]),
    ]),
    /** Columns confirmed against the client's own "Climate Resilient" and "CRA Extension Activity" screenshots (AMS User Manual p.30-32). */
    group("cra", "Climate Resilient Agriculture (CRA)", [
      leaf("cra-details", "CRA Details", [
        { key: "kvk", label: "KVK Name" },
        { key: "season", label: "Season" },
        { key: "technologyDemonstrated", label: "Technology Demonstrated" },
        { key: "croppingSystem", label: "Cropping System" },
        { key: "areaHa", label: "Area (ha)" },
        { key: "noOfFarmer", label: "No. of Farmer" },
        { key: "farmingSystem", label: "Farming System" },
        { key: "crop", label: "Crop Under Demonstration" },
        { key: "cropYieldQha", label: "Crop Yield (q/ha)" },
        { key: "systemProductivityQha", label: "System Productivity (q/ha)" },
        { key: "totalReturnRsHa", label: "Total Return (Rs./ha)" },
        { key: "yieldFarmerPracticeQha", label: "Yield Under Farmer Practice (q/ha)" },
        ...DEMOGRAPHIC_COLUMNS,
      ]),
      leaf("cra-extension-activity", "Extension Activity (CRA)", [
        { key: "kvk", label: "KVK Name" },
        { key: "extensionActivity", label: "Extension Activity" },
        { key: "startDate", label: "Start Date" },
        { key: "endDate", label: "End Date" },
        { key: "withinOrWithoutState", label: "Within State/Without State" },
        { key: "exposureVisits", label: "Exposure Visit (No.)" },
        {
          key: "farmersUnderExposure",
          label: "Number of Farmers Under Exposure",
        },
      ]),
    ]),
    group("csisa", "CSISA", [
      leaf(
        "csisa-details",
        "Details of Cereal Systems Initiative for South Asia",
        [
          { key: "kvk", label: "KVK Name" },
          { key: "season", label: "Season" },
          { key: "villageCovered", label: "Village Covered(no.)" },
          { key: "blockCovered", label: "Block Covered(no.)" },
          { key: "districtCovered", label: "District Covered(no.)" },
        ],
      ),
    ]),
    group("seed-hub", "Seed Hub Program", [
      leaf("seed-hub-program", "Seed Hub Program", [
        { key: "kvk", label: "KVK Name" },
        { key: "season", label: "Season" },
        { key: "cropName", label: "Crop Name" },
        { key: "variety", label: "Variety" },
        { key: "areaHa", label: "Area (ha)" },
        { key: "yieldHa", label: "Yield (ha)" },
        { key: "qtySeedProducedQ", label: "Quantity of Seed Produced (Q)" },
        { key: "qtySeedSaleOutQ", label: "Quantity of Seed Sale Out (Q)" },
        { key: "farmersPurchased", label: "No. of Farmers Purchased Seed" },
        { key: "qtySeedSaleOutToFarmersQ", label: "Quantity Sale Out to Farmers (Q)" },
        { key: "villagesCovered", label: "No. of Villages Covered" },
        { key: "qtySeedSaleOutOtherOrgQ", label: "Quantity Sale Out to Other Org (Q)" },
        { key: "amountGeneratedLakh", label: "Amount Generated (Lakh)" },
        { key: "totalAmountInProjectLakh", label: "Total Amount in Project (Lakh)" },
      ]),
    ]),
    /** Real full label confirmed live: "Any other programme organized by KVK, not covered above" - the earlier "Other Programmes" was a truncated-on-screen guess. */
    group(
      "other-programmes",
      "Any other programme organized by KVK, not covered above",
      [
        leaf("other-programme", "Any other programme organized by KVK", [
          { key: "kvk", label: "KVK" },
          { key: "programmeName", label: "Name of the programme" },
          { key: "programmeDate", label: "Date of the programme" },
          { key: "venue", label: "Venue" },
          { key: "purpose", label: "Purpose" },
          { key: "participants", label: "No. of participants" },
          ...DEMOGRAPHIC_COLUMNS,
        ]),
      ],
    ),
  ],
  {
    description:
      "Manage project details, technical parameters, extension activities, and budget utilization",
  },
);

/**
 * Form Management -> Performance Indicators. All 20 leaves' real columns
 * confirmed live via the client's Form Management the reference reference
 * (2026-08-20) - real sample rows seen for Village Adoption Programme (KVK
 * Darbhanga), Operational Area Details (KVK East Champaran), District Level
 * Data (KVK Patna/Ramgarh), Project-wise Budget / Revenue Generation (Krishi
 * Vigyan Kendra Dumka), Resource Generation (KVK Munger), Special Programmes
 * (KVK Godda).
 */
const performanceIndicators = group(
  "performance",
  "Performance Indicators",
  [
    group("impact", "Impact", [
      leaf("impact-of-kvk-activities", "Impact of KVK Activities", [
        { key: "kvk", label: "KVK Name" },
        { key: "specificArea", label: "Name of Specific Area" },
        { key: "briefDetails", label: "Brief Details of the Area" },
        { key: "farmersBenefitted", label: "No. of Farmers Benefitted" },
        { key: "horizontalSpread", label: "Horizontal Spread (in area/no.)" },
        { key: "adoptionPercent", label: "% of Adoption" },
      ]),
      leaf("entrepreneurship-details", "Details of Entrepreneurship", [
        { key: "kvk", label: "KVK Name" },
        {
          key: "entrepreneurOrEnterprise",
          label: "Name of the Entrepreneur/Name of the Enterprise/Firm",
        },
        { key: "enterpriseType", label: "Type of Enterprise" },
        { key: "membersAssociated", label: "No of Members Associated" },
        {
          key: "annualIncome",
          label: "Annual Income/Revenue of the Enterprise",
        },
      ]),
      leaf("success-stories", "Success Stories", [
        { key: "kvk", label: "KVK Name" },
        {
          key: "farmerOrEntrepreneur",
          label: "Name of the Farmer/Entrepreneur",
        },
        { key: "experience", label: "Farming Experience/Experience in Enterprise" },
        { key: "majorAchievement", label: "Major Achievement of the Farmers" },
        {
          key: "storyTitle",
          label: "Title of the Success Story / Case Study",
        },
      ]),
    ]),
    group("district-village-performance", "District and Village Performance", [
      leaf("district-level-data", "District Level Data", [
        { key: "kvk", label: "KVK" },
        { key: "reportingYear", label: "Reporting Year" },
        { key: "items", label: "Items" },
        { key: "information", label: "Information" },
      ]),
      leaf("district-crop-productivity", "Productivity of Major Crops", [
        { key: "kvk", label: "KVK" },
        { key: "season", label: "Season" },
        { key: "type", label: "Type" },
        { key: "cropName", label: "Name of Crop" },
        { key: "areaHa", label: "Area (Ha)" },
        { key: "productionMt", label: "Production (MT)" },
        { key: "productivityQha", label: "Productivity (q/ha)" },
        { key: "remarks", label: "Remarks" },
      ]),
      leaf("district-livestock-production", "Production of Major Livestock Products", [
        { key: "kvk", label: "KVK" },
        { key: "livestockName", label: "Name of Livestock" },
        { key: "number", label: "Number" },
        { key: "remarks", label: "Remarks" },
      ]),
      leaf("operational-area-details", "Operational Area Details", [
        { key: "kvk", label: "KVK" },
        { key: "reportingYear", label: "Reporting Year" },
        { key: "taluk", label: "Taluk" },
        { key: "block", label: "Block" },
        { key: "village", label: "Village" },
        { key: "majorCrops", label: "Major Crops" },
        {
          key: "majorProblems",
          label: "Major Problems Identified (crop-wise)",
        },
        { key: "thrustAreas", label: "Identified Thrust Areas" },
      ]),
      leaf("village-adoption-programme", "Village Adoption Programme", [
        { key: "kvk", label: "KVK" },
        { key: "reportingYear", label: "Reporting Year" },
        { key: "village", label: "Village" },
        { key: "block", label: "Block" },
        { key: "actionTaken", label: "Action Taken for Development" },
      ]),
      leaf("priority-thrust-area", "Priority Thrust Area", [
        { key: "kvk", label: "KVK" },
        { key: "reportingYear", label: "Reporting Year" },
        { key: "thrustArea", label: "Thrust Area" },
      ]),
    ]),
    group("infrastructure-performance", "Infrastructure Performance", [
      leaf("demonstration-units", "Demonstration Units", [
        { key: "kvk", label: "KVK Name" },
        { key: "demoUnitName", label: "Name of Demo Unit" },
        { key: "yearOfEstt", label: "Year of Estt." },
        { key: "areaSqMt", label: "Area (Sq. mt)" },
        { key: "varietyBreed", label: "Variety/Breed" },
        { key: "produce", label: "Produce" },
        { key: "qty", label: "Qty." },
        { key: "costOfInputs", label: "Cost of Inputs" },
        { key: "grossIncome", label: "Gross Income" },
        { key: "remarks", label: "Remarks" },
      ]),
      leaf("instructional-farm-crops", "Instructional Farm - Crops", [
        { key: "kvk", label: "KVK Name" },
        { key: "cropName", label: "Name of the Crop" },
        { key: "areaHa", label: "Area (ha)" },
        { key: "season", label: "Season" },
        { key: "variety", label: "Variety" },
        { key: "produceType", label: "Type of Produce" },
        { key: "qty", label: "Qty." },
        { key: "costOfInputs", label: "Cost of Inputs" },
        { key: "grossIncome", label: "Gross Income" },
        { key: "remarks", label: "Remarks" },
      ]),
      leaf("production-units", "Production Units", [
        { key: "kvk", label: "KVK Name" },
        { key: "productName", label: "Name of the Product" },
        { key: "qty", label: "Qty" },
        { key: "costOfInputs", label: "Cost of Inputs" },
        { key: "grossIncome", label: "Gross Income" },
        { key: "remarks", label: "Remarks" },
      ]),
      leaf("instructional-farm-livestock", "Instructional Farm - Livestock", [
        { key: "kvk", label: "KVK Name" },
        { key: "animalName", label: "Name of the Animal/Bird/Aquatics" },
        { key: "speciesBreed", label: "Species / Breed / Variety" },
        { key: "produceType", label: "Type of Produce" },
        { key: "qty", label: "Qty." },
        { key: "costOfInputs", label: "Cost of Inputs" },
        { key: "grossIncome", label: "Gross Income" },
        { key: "remarks", label: "Remarks" },
      ]),
      leaf("hostel-utilization", "Hostel Utilization", [
        { key: "kvk", label: "KVK Name" },
        { key: "months", label: "Months" },
        { key: "traineesStayed", label: "No. of Trainees Stayed" },
        { key: "traineeDays", label: "Trainee Days (Days Stayed)" },
        { key: "reasonForShortFall", label: "Reason for Short Fall" },
      ]),
      leaf("staff-quarters-performance", "Staff Quarters", [
        { key: "kvk", label: "KVK Name" },
        { key: "noOfStaffQuarters", label: "No. of Staff Quarters" },
        { key: "dateOfCompletion", label: "Date of Completion" },
        { key: "remark", label: "Remark" },
      ]),
      leaf("rain-water-harvesting", "Rain Water Harvesting", [
        { key: "kvk", label: "KVK Name" },
        {
          key: "trainingProgrammes",
          label: "No of Training Programme Conducted",
        },
        { key: "demonstrations", label: "No. of Demonstrations" },
        {
          key: "plantMaterialProduced",
          label: "No. of Plant Material Produced",
        },
        { key: "farmerVisits", label: "Visit by the Farmers (No.)" },
        { key: "officialVisits", label: "Visit by the Officials (No.)" },
      ]),
    ]),
    group("financial-performance", "Financial Performance", [
      leaf("budget-details", "Budget Details", [
        { key: "kvk", label: "KVK" },
        { key: "salaryAllocation", label: "Salary Allocation" },
        { key: "salaryExpenditure", label: "Salary Expenditure" },
        {
          key: "generalGrantAllocation",
          label: "General Main Grant Allocation",
        },
        {
          key: "generalGrantExpenditure",
          label: "General Main Grant Expenditure",
        },
        {
          key: "capitalGrantAllocation",
          label: "Capital Main Grant Allocation",
        },
        {
          key: "capitalGrantExpenditure",
          label: "Capital Main Grant Expenditure",
        },
        { key: "generalMainGrant", label: "General Allocation - Main Grant" },
        { key: "generalTsp", label: "General Allocation - TSP" },
        { key: "generalScsp", label: "General Allocation - SCSP" },
        { key: "capitalMainGrant", label: "Capital Allocation - Main Grant" },
        { key: "capitalTsp", label: "Capital Allocation - TSP" },
        { key: "capitalScsp", label: "Capital Allocation - SCSP" },
      ]),
      leaf("project-wise-budget-performance", "Project-wise Budget", [
        { key: "kvk", label: "KVK" },
        { key: "projectName", label: "Project Name" },
        { key: "accountNumber", label: "Account Number" },
        { key: "fundingAgency", label: "Funding Agency" },
        { key: "budgetEstimate", label: "Budget Estimate" },
        { key: "budgetAllocated", label: "Budget Allocated" },
        { key: "budgetReleased", label: "Budget Released" },
        { key: "expenditure", label: "Expenditure" },
        { key: "unspentBalance", label: "Unspent Balance" },
      ]),
      leaf("revolving-fund", "Revolving Fund", [
        { key: "kvk", label: "KVK" },
        { key: "reportingYear", label: "Reporting Year" },
        { key: "openingBalance", label: "Opening Balance as on 1st April" },
        { key: "incomeDuringYear", label: "Income During the Year" },
        { key: "expenditureDuringYear", label: "Expenditure During the Year" },
        { key: "closing", label: "Closing" },
        { key: "kind", label: "Kind" },
      ]),
      leaf("revenue-generation", "Revenue Generation", [
        { key: "kvk", label: "KVK" },
        { key: "headName", label: "Name of Head" },
        { key: "income", label: "Income (Rs.)" },
        { key: "sponsoringAgency", label: "Sponsoring Agency" },
      ]),
      leaf("resource-generation", "Resource Generation", [
        { key: "kvk", label: "KVK" },
        { key: "programmeName", label: "Name of the Programme" },
        { key: "purpose", label: "Purpose of the Programme" },
        { key: "sourcesOfFund", label: "Sources of Fund" },
        { key: "amountLakhs", label: "Amount (Rs. Lakhs)" },
        { key: "infrastructureCreated", label: "Infrastructure Created" },
      ]),
    ]),
    group("linkages", "Linkages", [
      leaf("functional-linkage", "Functional Linkage", [
        { key: "kvk", label: "KVK Name" },
        { key: "organizationName", label: "Name of Organization" },
        { key: "natureOfLinkage", label: "Nature of Linkage" },
      ]),
      leaf("special-programmes", "Special Programmes", [
        { key: "kvk", label: "KVK Name" },
        { key: "programmeType", label: "Programme Type" },
        { key: "programmeName", label: "Name of the Programme/Scheme" },
        { key: "initiationDate", label: "Date/Month of Initiation" },
      ]),
    ]),
  ],
  {
    description:
      "Manage impact, district/village, infrastructure, financial, and linkage performance data",
  },
);

/** Form Management -> Meetings. Real columns confirmed live via the client's Form Management the reference reference (2026-08-20) - real rows seen for Other Meetings, KVK Latehar. */
const meetings = group("meetings", "Meetings", [
  /** Columns re-confirmed live 2026-08-25 - exact match, no change needed there. Real page H1/sidebar label is the fuller "Details of Scientific Advisory Committee(SAC) Meetings", not the shortened "SAC Meetings". */
  leaf(
    "sac-meetings",
    "Details of Scientific Advisory Committee(SAC) Meetings",
    [
      { key: "kvk", label: "KVK Name" },
      { key: "startDate", label: "Start Date" },
      { key: "endDate", label: "End Date" },
      { key: "participants", label: "No of Participants" },
      {
        key: "statutoryMembers",
        label: "Total Statutory Members Present (State Line Department)",
      },
      { key: "recommendations", label: "Salient Recommendations" },
      { key: "actionTaken", label: "Action Taken" },
      { key: "reason", label: "Reason" },
      { key: "file", label: "File" },
    ],
    "SAC Meetings",
  ),
  /** Columns re-confirmed live 2026-08-25 - exact match. Real page H1/sidebar label is "Details of other meeting related to ATARI". */
  leaf(
    "other-meetings",
    "Details of other meeting related to ATARI",
    [
      { key: "kvk", label: "KVK Name" },
      { key: "date", label: "Date" },
      { key: "meetingType", label: "Type of Meeting" },
      { key: "agenda", label: "Agenda" },
      {
        key: "representativeFromAtari",
        label: "Representative from ATARI",
      },
    ],
    "Other Meetings related to ATARI",
  ),
]);

/**
 * Form Management -> Miscellaneous. Real columns confirmed live via the
 * client's Form Management the reference reference (2026-08-20) - real rows
 * seen for RAWE/FET/FIT Programme (KVK Gumla, KVK Rohtas) and List of VIP
 * Visitors (KVK Nalanda). PPV & FRA Sensitization turned out to be 2
 * distinct real forms (Training Programme + Farmer Details), not one -
 * corrected from the earlier single-leaf guess.
 */
const miscellaneous = group("miscellaneous", "Miscellaneous Information", [
  leaf("prevalent-diseases-crops", "Prevalent Diseases in Crops", [
    { key: "kvk", label: "KVK Name" },
    { key: "diseaseName", label: "Name of the Disease" },
    { key: "crop", label: "Crop" },
    { key: "outbreakDate", label: "Date of Outbreak" },
    { key: "areaAffected", label: "Area Affected (in ha)" },
    { key: "commodityLossPercent", label: "% Commodity Loss" },
    {
      key: "preventiveMeasures",
      label: "Preventive Measures Taken for Area (in ha)",
    },
  ]),
  leaf("prevalent-diseases-livestock", "Prevalent Diseases in Livestock", [
    { key: "kvk", label: "KVK Name" },
    { key: "diseaseName", label: "Name of the Disease" },
    { key: "speciesAffected", label: "Species Affected" },
    { key: "outbreakDate", label: "Date of Outbreak" },
    { key: "mortalityMorbidity", label: "Number of Death/Morbidity Rate (%)" },
    { key: "animalsVaccinated", label: "Number of Animals Vaccinated" },
    {
      key: "preventiveMeasures",
      label: "Preventive Measures Taken for Area (in ha)",
    },
    { key: "areaAffected", label: "Area Affected (ha)" },
    { key: "commodityLossPercent", label: "% Commodity Loss" },
  ]),
  leaf("nyk-training", "NYK Training", [
    { key: "kvk", label: "KVK Name" },
    { key: "programmeTitle", label: "Title of the Training Programme" },
    { key: "startDate", label: "Start Date" },
    { key: "endDate", label: "End Date" },
    { key: "male", label: "Male" },
    { key: "female", label: "Female" },
    { key: "fundReceived", label: "Amount of Fund Received (Rs)" },
  ]),
  group("ppv-fra-sensitization", "PPV & FRA Sensitization", [
    leaf(
      "ppv-fra-training-programme",
      "PPV & FRA Sensitization Training Programme",
      [
        { key: "kvk", label: "KVK Name" },
        { key: "date", label: "Date" },
        { key: "title", label: "Title" },
        { key: "type", label: "Type" },
        { key: "venue", label: "Venue" },
        { key: "resourcePerson", label: "Resource Person" },
        { key: "participants", label: "No. of Participants" },
        ...DEMOGRAPHIC_COLUMNS,
      ],
    ),
    leaf("ppv-fra-farmer-details", "PPV & FRA Sensitization Farmer Details", [
      { key: "kvk", label: "KVK Name" },
      { key: "year", label: "Year" },
      { key: "crop", label: "Crop" },
      { key: "registrationNo", label: "Registration No." },
      { key: "farmerName", label: "Farmer Name" },
      { key: "block", label: "Block" },
      { key: "district", label: "District" },
      { key: "mobileNo", label: "Mobile No." },
      { key: "village", label: "Village" },
      { key: "characteristics", label: "Characteristics" },
    ]),
  ]),
  leaf("rawe-fet-fit-programme", "RAWE/FET/FIT Programme", [
    { key: "startDate", label: "Start Date" },
    { key: "endDate", label: "End Date" },
    { key: "kvk", label: "KVK" },
    { key: "attachmentType", label: "Attachment Type" },
    { key: "attachment", label: "Attachment" },
    { key: "numberOfStudents", label: "Number of Student" },
    { key: "daysStayed", label: "No of Days Stayed" },
  ]),
  leaf("vip-visitors", "List of VIP Visitors", [
    { key: "kvk", label: "KVK" },
    { key: "visitDate", label: "Date of Visit" },
    { key: "dignitaryType", label: "Type of Dignitaries" },
    { key: "ministerName", label: "Name of Hon'ble Minister" },
    { key: "observations", label: "Salient Points in His/Her Observation" },
  ]),
  /**
   * Real sub-items, placement (nested under Miscellaneous Information), and
   * columns confirmed against the client's own live atariams.org
   * screenshots for all 5 Digital Information sub-forms (2026-08-24).
   * Reporting Year/KVKs are filters there, not columns.
   */
  group("digital-information", "Digital Information", [
    leaf("digital-mobile-app", "Details of Mobile App", [
      { key: "kvk", label: "KVK Name" },
      {
        key: "mobileAppsDeveloped",
        label: "Number of Mobile Apps Developed by KVK",
      },
      { key: "appName", label: "Name of the Apps" },
      { key: "appLanguage", label: "Language of the Apps" },
      {
        key: "meantFor",
        label: "Meant for Crop/Livestock/Fishery/Others",
      },
      { key: "timesDownloaded", label: "No. of Times Downloaded" },
    ]),
    leaf("digital-web-portal", "Details of Web Portal", [
      { key: "kvk", label: "KVK Name" },
      { key: "visitors", label: "No. of Visitors Visited the Portal" },
      {
        key: "farmersRegistered",
        label: "No. of Farmers Registered on the Portal",
      },
    ]),
    leaf("digital-kisan-sarathi", "Details of Kisan Sarathi", [
      { key: "kvk", label: "KVK Name" },
      {
        key: "farmersRegisteredKsp",
        label: "No. of Farmers Registered on KSP Portal",
      },
      { key: "phoneCallAddressed", label: "Phone Call Addressed" },
      { key: "answeredCall", label: "Answered Call" },
    ]),
    leaf(
      "digital-kmas",
      "Kisan Mobile Advisory Services/KMAS(m-Kisan Portal/National Farmers Portal/ SMS Portal)",
      [
        { key: "kvk", label: "KVK Name" },
        { key: "farmersCovered", label: "No. of Farmers Covered" },
        { key: "advisoriesSent", label: "No of Advisories Sent" },
        { key: "messagesCrop", label: "Type of Messages - Crop" },
        { key: "messagesLivestock", label: "Type of Messages - Livestock" },
        { key: "messagesWeather", label: "Type of Messages - Weather" },
        { key: "messagesMarketing", label: "Type of Messages - Marketing" },
        { key: "messagesAwareness", label: "Type of Messages - Awareness" },
        {
          key: "messagesOtherEnterprises",
          label: "Type of Messages - Other Enterprises",
        },
        { key: "messagesAnyOther", label: "Type of Messages - Any Other" },
      ],
    ),
    leaf(
      "digital-other-channels",
      "Details of messages send through other channels",
      [
        { key: "kvk", label: "KVK Name" },
        { key: "textAdvisories", label: "Advisories Through Text Messages" },
        {
          key: "textFarmers",
          label: "No. of Farmers Sent Text Messages",
        },
        { key: "whatsappAdvisories", label: "Advisories Through WhatsApp" },
        { key: "whatsappFarmers", label: "No. of Farmers Sent WhatsApp" },
        {
          key: "socialMediaAdvisories",
          label: "Advisories Through Social Media",
        },
        {
          key: "socialMediaFarmers",
          label: "No. of Farmers Sent Social Media",
        },
        {
          key: "weatherBulletinAdvisories",
          label: "Advisories Through Weather Advisory Bulletin",
        },
        {
          key: "weatherBulletinFarmers",
          label: "No. of Farmers Sent Weather Advisory Bulletin",
        },
        {
          key: "channel",
          label: "Channel",
          staticOptions: [
            "Advisories through Text messages",
            "Advisories through WhatsApp",
            "Advisories through weather advisory bulletin",
            "Advisories through social media/FB/Twitter/Instagram/Other",
          ],
        },
        { key: "farmersCovered", label: "No. of Farmers Covered" },
        { key: "advisoriesSent", label: "No. of Advisories Sent" },
        { key: "messagesCrop", label: "Type of Messages - Crop" },
        { key: "messagesLivestock", label: "Type of Messages - Livestock" },
        { key: "messagesWeather", label: "Type of Messages - Weather" },
        { key: "messagesMarketing", label: "Type of Messages - Marketing" },
        { key: "messagesAwareness", label: "Type of Messages - Awareness" },
        { key: "messagesOtherEnterprises", label: "Type of Messages - Other Enterprises" },
      ],
    ),
  ]),
]);

export const FORM_MANAGEMENT: NavItem[] = [
  aboutKvk,
  achievements,
  projects,
  performanceIndicators,
  meetings,
  miscellaneous,
];

export const SIDEBAR: SidebarSection[] = [
  {
    slug: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
  },
  {
    slug: "form-summary",
    label: "Form Summary",
    href: "/form-summary",
    icon: "form-summary",
  },
  {
    slug: "masters",
    label: "All Masters",
    icon: "masters",
    children: ALL_MASTERS,
  },
  {
    slug: "role-management",
    label: "Role Management",
    href: "/role-management",
    icon: "role-management",
  },
  {
    slug: "user-management",
    label: "User Management",
    href: "/user-management",
    icon: "user-management",
  },
  {
    slug: "forms",
    label: "Form Management",
    icon: "form-management",
    children: FORM_MANAGEMENT,
  },
  {
    slug: "module-images",
    label: "Module Images",
    href: "/module-images",
    icon: "module-images",
  },
  { slug: "gallery", label: "Gallery", href: "/gallery", icon: "gallery" },
  { slug: "targets", label: "Targets", href: "/targets", icon: "targets" },
  {
    slug: "log-history",
    label: "Log History",
    href: "/log-history",
    icon: "log-history",
  },
  {
    slug: "notifications",
    label: "Notifications",
    href: "/notifications",
    icon: "notifications",
  },
  { slug: "reports", label: "Reports", href: "/reports", icon: "reports" },
];

export type SearchResult = {
  label: string;
  href: string;
  /** Breadcrumb-style path shown under the label, e.g. "All Masters / Basic Masters". */
  section: string;
};

export type NavLeafPath = { path: string; label: string; groupLabel: string };

/** Every leaf under a tree, with its full slug path and its top-level group label - used by the Reports "Select Form" checklist to let a user pick a specific sub-item (e.g. just "Employee Details" inside About KVK) rather than only whole top-level categories. */
export function flattenLeafPaths(
  items: NavItem[],
  basePath = "",
  groupLabel = "",
): NavLeafPath[] {
  return items.flatMap((item) => {
    const path = basePath ? `${basePath}/${item.slug}` : item.slug;
    const currentGroupLabel = groupLabel || item.label;
    if (item.type === "leaf") {
      return [{ path, label: item.label, groupLabel: currentGroupLabel }];
    }
    return flattenLeafPaths(item.children, path, currentGroupLabel);
  });
}

function flattenNavTree(
  items: NavItem[],
  basePath: string,
  section: string,
): SearchResult[] {
  return items.flatMap((item) => {
    const href = `${basePath}/${item.slug}`;
    if (item.type === "leaf") {
      return [{ label: item.label, href, section }];
    }
    return [
      { label: item.label, href, section },
      ...flattenNavTree(item.children, href, `${section} / ${item.label}`),
    ];
  });
}

/** Every navigable page in the app, flattened for the sidebar's Ctrl+K search. */
export const SEARCH_INDEX: SearchResult[] = SIDEBAR.flatMap((section) => {
  if (section.children) {
    return [
      { label: section.label, href: `/${section.slug}`, section: "" },
      ...flattenNavTree(section.children, `/${section.slug}`, section.label),
    ];
  }
  return [{ label: section.label, href: section.href!, section: "" }];
});

/**
 * Resolves a slug path (e.g. ["other", "resource", "equipment"]) to the
 * node it points at - a leaf (rendered as a list page) or a group
 * (rendered as a card grid of its children) - plus the breadcrumb trail.
 */
export function resolveNavPath(
  root: NavItem[],
  slugPath: string[],
): { node: NavItem; trail: NavItem[] } | null {
  let items = root;
  const trail: NavItem[] = [];

  for (let i = 0; i < slugPath.length; i++) {
    const current = items.find((item) => item.slug === slugPath[i]);
    if (!current) return null;
    trail.push(current);

    const isLastSegment = i === slugPath.length - 1;
    if (isLastSegment) return { node: current, trail };
    if (current.type === "leaf") return null;
    items = current.children;
  }

  return null;
}
