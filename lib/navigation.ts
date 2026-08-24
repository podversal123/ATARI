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

export type MasterColumn = {
  key: string;
  label: string;
};

export type NavLeaf = {
  type: "leaf";
  slug: string;
  label: string;
  /** Columns for the list page this leaf renders, in display order. */
  columns: MasterColumn[];
  /** Overrides `label` on the landing-page card only, for the confirmed real cases where a bare leaf's card title differs from its own page title (e.g. card "Technical Achievement" vs page "Technical Achievement Summary"). */
  cardLabel?: string;
};

export type NavGroup = {
  type: "group";
  slug: string;
  label: string;
  children: NavItem[];
  /** Overrides `label` for the page H1/breadcrumb only - used when the sidebar name and the real in-page title differ (confirmed real case: sidebar says "Production Masters", the page itself says "Production & Projects"). */
  pageTitle?: string;
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

function leaf(
  slug: string,
  label: string,
  columns: MasterColumn[] = GENERIC_MASTER_COLUMNS,
  cardLabel?: string,
): NavLeaf {
  return { type: "leaf", slug, label, columns, cardLabel };
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
      ? child
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
  extra?: { pageTitle?: string; description?: string },
): NavGroup {
  return { type: "group", slug, label, children, ...extra };
}

/** All Masters -> Training & Extension Masters -> Training Master (columns confirmed on screen) */
const trainingMaster = group("training", "Training Master", [
  leaf("training-type", "Training Type Master", [
    { key: "trainingType", label: "Training Type" },
  ]),
  leaf("training-area", "Training Area Master", [
    { key: "trainingType", label: "Training Type" },
    { key: "trainingAreaName", label: "Training Area Name" },
  ]),
  /** 2 columns, confirmed against the reference). */
  leaf("training-thematic-area", "Training Thematic Area Master", [
    { key: "trainingAreaName", label: "Training Area Name" },
    { key: "thematicArea", label: "Training Thematic Area" },
  ]),
  leaf("training-clientele", "Training Clientele Master", [
    { key: "clientele", label: "Name" },
  ]),
  leaf("funding-source", "Funding Source Master", [
    { key: "fundingSource", label: "Name" },
  ]),
]);

/** All Masters -> Training & Extension Masters (3-card landing confirmed on screen) */
const trainingExtensionMasters = group(
  "training-extension",
  "Training & Extension Masters",
  [
    trainingMaster,
    group("extension-activities", "Extension Activities", [
      leaf("extension-activity", "Extension Activity Master", [
        { key: "activityName", label: "Name" },
      ]),
      leaf("other-extension-activity", "Other Extension Activity Master", [
        { key: "activityName", label: "Name" },
      ]),
    ]),
    group("events", "Events", [
      leaf("events-master", "Events Master", [
        { key: "eventName", label: "Event Name" },
      ]),
    ]),
  ],
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
      leaf("pay-level", "Pay Level Master"),
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
        { key: "categoryName", label: "Category Name" },
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
      leaf(
        "type-of-enterprise",
        "Enterprises",
        GENERIC_MASTER_COLUMNS,
        "Type of Enterprise Master",
      ),
      leaf(
        "account-type",
        "Account Types",
        GENERIC_MASTER_COLUMNS,
        "Account Type Master",
      ),
      leaf(
        "programme-type",
        "Programs",
        GENERIC_MASTER_COLUMNS,
        "Programme Type Master",
      ),
      leaf(
        "ppv-fra-training-type",
        "PPV & FRA",
        GENERIC_MASTER_COLUMNS,
        "PPV & FRA Training Type Master",
      ),
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
        { key: "agencyName", label: "Agency Name" },
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
    leaf("zone-master", "Zones Master", [
      { key: "zoneName", label: "Zone Name" },
    ]),
    leaf("state-master", "States Master", [
      { key: "zoneName", label: "Zone Name" },
      { key: "stateName", label: "State Name" },
    ]),
    leaf("district-master", "Districts Master", [
      { key: "zoneName", label: "Zone Name" },
      { key: "stateName", label: "State Name" },
      { key: "districtName", label: "District Name" },
    ]),
    leaf("institute-master", "Institute Master", [
      { key: "instituteName", label: "Institute Name" },
    ]),
    leaf("host-master", "Host Master", [
      { key: "hostName", label: "Host Name" },
    ]),
    /** Column order/labels confirmed exactly against the reference: Mobile, Email, Address, Year of Sanction - not the Mobile/Address/E-Mail/Sanction Year order this leaf had before. */
    leaf("kvk-master", "KVK Master", [
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
        { key: "thematicAreasCount", label: "Thematic Areas Count" },
      ]),
      leaf("oft-thematic-area", "OFT Thematic Area Master", [
        { key: "thematicArea", label: "Thematic Area Name" },
        { key: "subjectName", label: "Subject Name" },
      ]),
    ]),
    group("fld", "FLD Masters", [
      leaf("sector", "Sector Master", [
        { key: "sectorName", label: "Sector Name" },
        { key: "categoriesCount", label: "Categories Count" },
      ]),
      leaf("fld-thematic-area", "FLD Thematic Area Master", [
        { key: "thematicAreaName", label: "Thematic Area Name" },
        { key: "sectorName", label: "Sector Name" },
      ]),
      /** Real columns confirmed live. */
      leaf("category", "Category Master", [
        { key: "categoryName", label: "Category Name" },
        { key: "sectorName", label: "Sector Name" },
        { key: "subCategoriesCount", label: "Sub Categories Count" },
      ]),
      /** 4 columns, confirmed against the reference) - 3 were missing. */
      leaf("sub-category", "Sub-category Master", [
        { key: "subCategoryName", label: "Sub Category Name" },
        { key: "categoryName", label: "Category Name" },
        { key: "sectorName", label: "Sector Name" },
        { key: "cropsCount", label: "Crops Count" },
      ]),
      /** 3 columns, confirmed against the reference). */
      leaf("crop", "Crop Master", [
        { key: "cropName", label: "Crop Name" },
        { key: "subCategoryName", label: "Sub Category Name" },
        { key: "category", label: "Category Name" },
      ]),
      leaf("activity", "Activity Master", [
        { key: "name", label: "Activity Name" },
      ]),
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
        ]),
        /** 2 columns, confirmed against the reference). */
        leaf("product-type", "Product Type Master", [
          { key: "productCategoryName", label: "Product Category Name" },
          { key: "productCategoryType", label: "Product Category Type" },
        ]),
        /** 3 columns, confirmed against the reference). */
        leaf("products", "Products", [
          { key: "productCategoryName", label: "Product Category Name" },
          { key: "productCategoryType", label: "Product Category Type" },
          { key: "productName", label: "Product Name" },
        ]),
      ],
    ),
    group("climate-resilient-agriculture", "Climate Resilient Agriculture", [
      leaf("cropping-system", "Cropping System Master", [
        { key: "season", label: "Season Name" },
        { key: "cropName", label: "Crop Name" },
      ]),
      /** Season Name is the FIRST column in the real table - it was missing entirely. */
      leaf("farming-system", "Farming System Master", [
        { key: "season", label: "Season Name" },
        { key: "farmingSystemName", label: "Farming System Name" },
      ]),
    ]),
    group("arya", "ARYA", [
      leaf("arya-enterprise", "ARYA Enterprise Master", [
        { key: "name", label: "Enterprise Name" },
      ]),
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
      leaf("natural-farming-activity", "Natural Farming Activity Master", [
        { key: "name", label: "Activity Name" },
      ]),
      leaf("soil-parameter", "Natural Farming Soil Parameter Master", [
        { key: "name", label: "Type" },
      ]),
    ]),
    group("agri-drone", "Agri-Drone", [
      leaf("demonstrations-on", "Agri-Drone Demonstrations On Master", [
        { key: "name", label: "Demonstrations On" },
      ]),
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
      leaf("publication-items", "Publication Items Master", [
        { key: "itemName", label: "Publication Item" },
      ]),
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
      leaf("view-kvks", "View KVKs", [
        { key: "zoneName", label: "Zone Name" },
        { key: "stateName", label: "State Name" },
        { key: "hostOrg", label: "Host Org" },
        { key: "districtName", label: "District Name" },
        { key: "kvk", label: "KVK" },
        { key: "mobile", label: "Mobile" },
      ]),
      leaf("bank-account-details", "Bank Account Details", [
        { key: "kvk", label: "KVK" },
        { key: "accountType", label: "Account Type" },
        { key: "accountName", label: "Account Name" },
        { key: "bankName", label: "Bank Name" },
        { key: "location", label: "Location" },
        { key: "accountNumber", label: "Account Number" },
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
      leaf("employee-details", "Employee Details", [
        { key: "kvk", label: "KVK" },
        { key: "photo", label: "Photo" },
        { key: "resume", label: "Resume" },
        { key: "staffName", label: "Staff Name" },
        { key: "position", label: "Position" },
        { key: "mobile", label: "Mobile" },
        { key: "email", label: "Email" },
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
  /** Real columns confirmed live. */
  leaf(
    "oft",
    "OFT",
    [
      { key: "reportingYear", label: "Reporting Year" },
      { key: "kvk", label: "KVK" },
      { key: "staff", label: "Staff" },
      { key: "trialOnForm", label: "Trial on Form" },
      { key: "problemDiagnosed", label: "Problem Diagnosed" },
    ],
    "On Farm Trial",
  ),
  /**
   * Real group and leaf names confirmed against the Form Summary KVK breakdown, with leaf labels and columns re-confirmed against the reference.
   */
  group("front-line-demonstration", "Front Line Demonstrations (FLD)", [
    leaf(
      "view-fld",
      "Front Line Demonstrations (FLD)",
      [
        { key: "reportingYear", label: "Reporting Year" },
        { key: "kvk", label: "KVK" },
        { key: "category", label: "Category" },
        { key: "subCategory", label: "Sub Category" },
        {
          key: "technologyDemonstrated",
          label: "Name of Technology Demonstrated",
        },
      ],
      "View FLD",
    ),
    /** Real tab wording confirmed 2026-08-22; the tables behind these two tabs were never captured in either source, so their columns stay unconfirmed. */
    leaf(
      "fld-extension-training",
      "Extension & Training activities under FLD",
      GENERIC_MASTER_COLUMNS,
      "Extension and Training activities under FLD",
    ),
    leaf(
      "fld-technical-feedback",
      "Technical Feedback on FLD",
      GENERIC_MASTER_COLUMNS,
      "Technical Feedback on the demonstrated technology",
    ),
  ]),
  leaf(
    "trainings",
    "Trainings",
    [
      { key: "reportingYear", label: "Reporting Year" },
      { key: "kvk", label: "KVK" },
      { key: "startDate", label: "Start Date" },
      { key: "endDate", label: "End Date" },
      { key: "program", label: "Training Program" },
      { key: "title", label: "Training Title" },
    ],
    "Training",
  ),
  /** Real columns confirmed live at /forms/achievements/extension-activities. */
  group("extension", "Extension", [
    leaf("extension-activities", "Extension Activities", [
      { key: "reportingYear", label: "Reporting Year" },
      { key: "kvk", label: "KVK" },
      { key: "startDate", label: "Start Date" },
      { key: "endDate", label: "End Date" },
      {
        key: "nameOfExtensionActivities",
        label: "Name of Extension Activities",
      },
      { key: "noOf", label: "No Of" },
    ]),
    /** 4 real columns confirmed 2026-08-22 - this leaf previously had none. */
    leaf("other-extension-activities", "Other Extension Activities", [
      { key: "reportingYear", label: "Reporting Year" },
      { key: "kvk", label: "KVK" },
      {
        key: "natureOfExtensionActivity",
        label: "Nature of Extension Activity",
      },
      { key: "noOfActivities", label: "No of Activities" },
    ]),
  ]),
  group("special-days", "Special Days", [
    /** Real table leads with the two dates, then KVK - unusual ordering, preserved deliberately. */
    leaf("technology-week-celebration", "Technology Week Celebration", [
      { key: "startDate", label: "Start Date" },
      { key: "endDate", label: "End Date" },
      { key: "kvk", label: "KVK" },
      { key: "typeOfActivities", label: "Type of Activities" },
      { key: "noOfActivities", label: "No of Activities" },
      { key: "relatedCropTechnology", label: "Related Crop/Livestock Technology" },
    ]),
    leaf("celebration-days", "Celebration Days", [
      { key: "kvk", label: "KVK" },
      { key: "importantDay", label: "Important Days" },
      { key: "eventDate", label: "Event Date" },
      { key: "noOfActivities", label: "No of Activities" },
    ]),
    /** 4 confirmed columns; a 5th beginning "NO OF V" and more sit off-screen right and stay undeclared rather than guessed. */
    leaf("world-soil-day", "World Soil Day", [
      { key: "kvk", label: "KVK" },
      { key: "reportingYear", label: "Reporting Year" },
      { key: "noOfActivitiesConducted", label: "No of Activities Conducted" },
      {
        key: "soilHealthCardsDistributed",
        label: "Soil Health Cards Distributed",
      },
    ]),
    /** Real columns confirmed live. */
    leaf("poshan-maaha", "Poshan Maaha", [
      { key: "kvk", label: "KVK" },
      { key: "activityDate", label: "Activity Date" },
      { key: "activitiesConducted", label: "Activities Conducted" },
      { key: "eventName", label: "Event Name" },
      { key: "saplingsPlanted", label: "Saplings Planted" },
      { key: "vegetableKits", label: "Vegetable Kits" },
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
      "Details of Quarterly Budget Expenditure on Swachhta",
    ),
  ]),
  /** 5 real columns confirmed 2026-08-22. Real H1 keeps the lowercase wording; the landing card is longer. */
  leaf(
    "production-supply",
    "Production and supply of Technological products",
    [
      { key: "kvk", label: "KVK" },
      { key: "reportingYear", label: "Reporting Year" },
      { key: "category", label: "Category" },
      { key: "variety", label: "Variety" },
      { key: "quantity", label: "Quantity" },
    ],
    "Production & Supply of Technological Products",
  ),
  /** 6 real columns confirmed 2026-08-22. */
  leaf(
    "soil-water-testing",
    "Soil, Water and Plant analysis",
    [
      { key: "kvk", label: "KVK" },
      { key: "startDate", label: "Start Date" },
      { key: "endDate", label: "End Date" },
      { key: "analysis", label: "Analysis" },
      { key: "noOfSamplesAnalyzed", label: "No of Samples Analyzed" },
      { key: "noOfVillagesCovered", label: "No of Villages Covered" },
    ],
    "Detail of Soil, Water and Plant Analysis",
  ),
  /** Real page title + columns confirmed live. */
  leaf("publications", "KVKs Publication Details", [
    { key: "kvk", label: "KVK" },
    { key: "publicationYear", label: "Publication Year" },
    { key: "publicationItem", label: "Publication Item" },
    { key: "title", label: "Title" },
    { key: "authorName", label: "Author Name" },
  ]),
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
  group("awards", "Award and Recognition", [
    leaf(
      "kvk",
      "Awards (KVK)",
      [
        { key: "kvk", label: "KVK" },
        { key: "reportingYear", label: "Reporting Year" },
        { key: "award", label: "Award" },
        { key: "amount", label: "Amount" },
        { key: "achievement", label: "Achievement" },
        { key: "conferringAuthority", label: "Conferring Authority" },
      ],
      "KVK",
    ),
    leaf("scientist", "Scientist", [
      { key: "kvk", label: "KVK" },
      { key: "reportingYear", label: "Reporting Year" },
      { key: "headScientist", label: "Head Scientist" },
      { key: "award", label: "Award" },
      { key: "amount", label: "Amount" },
    ]),
    leaf("farmer", "Farmer", [
      { key: "kvk", label: "KVK" },
      { key: "reportingYear", label: "Reporting Year" },
      { key: "farmerName", label: "Farmer Name" },
      { key: "address", label: "Address" },
      { key: "contactNumber", label: "Contact Number" },
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
      /** Real list columns confirmed via video-frames/frame_0640.png (the multi-tab report in the source PDF is the per-record edit form, not this list). */
      /**
       * 10 columns, confirmed against the reference by combining the two
       * scroll positions of the real table. The old single
       * "District" column was actually "District Yield", and the four columns
       * after it were scrolled off-screen in the earlier pass.
       */
      leaf("technical-parameter", "Technical Parameter", [
        { key: "reportingYear", label: "Reporting Year" },
        { key: "crop", label: "Crop" },
        { key: "technologyDemonstrated", label: "Technology Demonstrated" },
        { key: "areaHa", label: "Area Ha" },
        { key: "numberOfFarmers", label: "Number of Farmers" },
        { key: "districtYield", label: "District Yield" },
        { key: "stateYield", label: "State Yield" },
        { key: "potentialYield", label: "Potential Yield" },
        { key: "status", label: "Status" },
        { key: "completedAt", label: "Completed At" },
      ]),
      leaf("extension-activity-cfld", "Extension Activity (CFLD)"),
      leaf("budget-utilization", "Budget Utilization"),
    ]),
    group("nicra", "NICRA", [
      leaf("basic-information", "Basic Information"),
      leaf("details", "Details"),
      leaf("training", "Training"),
      leaf("extension-activity-nicra", "Extension Activity (NICRA)"),
    ]),
    group("nicra-others", "NICRA Others", [
      leaf("intervention", "Intervention"),
      leaf("revenue-generated", "Revenue Generated"),
      leaf("custom-hiring-farm-implement", "Custom Hiring of Farm-Implement"),
      leaf("village-wise-vcrmc", "Village wise VCRMC"),
      leaf("soil-health-card", "Soil Health Card prepared and distributed"),
      leaf("convergence-programme", "Convergence Programme"),
      leaf(
        "dignitaries-visited-nicra-villages",
        "Dignitaries visited NICRA Villages",
      ),
      leaf("pi-co-pi-list", "Name of PI & Co-PI List"),
    ]),
    group("arya-safal", "ARYA/SAFAL", [
      leaf("arya-safal-current-year", "Current Year Details"),
      leaf("arya-safal-previous-year", "Previous Year Evaluation"),
    ]),
    group("natural-farming", "Natural Farming", [
      leaf("nf-geographical", "Geographical information"),
      leaf("nf-physical", "Physical information"),
      leaf("nf-demonstration", "Demonstration Information"),
      leaf(
        "nf-already-practicing",
        "Farmer Already Practicing Natural Farming",
      ),
      leaf("nf-beneficiaries", "Details of Beneficiaries"),
      leaf("nf-soil-data", "Soil Data information"),
      leaf("nf-budget-expenditure", "Budget Expenditure"),
    ]),
    group("tsp-scsp", "TSP/SCSP", [
      leaf("tsp-activities", "TSP Activities"),
      leaf("scsp-activities", "SCSP Activities"),
    ]),
    /**
     * The first two NARI labels are truncated in the card itself; they are
     * completed from the third, which renders in full and fixes the shared
     * "Nutri-Smart village" wording.
     */
    group("nari", "NARI", [
      leaf("nari-nutrition-garden", "Details of established Nutrition Garden in Nutri-Smart village"),
      leaf("nari-bio-fortified", "Details of Bio-fortified crops used in Nutri-Smart village"),
      leaf("nari-value-addition", "Details of Value addition in Nutri-Smart village"),
      leaf("nari-training", "Training programmes in Nutri-Smart village"),
      leaf("nari-extension", "Extension activities under NARI Project"),
    ]),
    group("agri-drone", "Agri-Drone", [
      leaf("agri-drone-introduction", "Introduction"),
      leaf("agri-drone-demonstration", "Demonstration Details"),
    ]),
    group("fpo-cbbo", "FPO and CBBO", [
      leaf("fpo-cbbo-details", "Details FPO and CBBO"),
      leaf("fpo-management", "FPO Management"),
    ]),
    group("drmr", "DRMR", [
      leaf("drmr-details", "DRMR Details"),
      leaf("drmr-activity", "DRMR Activity"),
    ]),
    group("cra", "Climate Resilient Agriculture (CRA)", [
      leaf("cra-details", "CRA Details"),
      leaf("cra-extension-activity", "Extension Activity (CRA)"),
    ]),
    group("csisa", "CSISA", [
      leaf("csisa-details", "Details of Cereal Systems Initiative for South Asia"),
    ]),
    group("seed-hub", "Seed Hub Program", [leaf("seed-hub-program", "Seed Hub Program")]),
    /** Card label is truncated on screen; kept to the legible portion rather than invented. */
    group("other-programmes", "Other Programmes", [
      leaf("other-programme", "Any other programme organized by KVK"),
    ]),
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
        { key: "storyTitle", label: "Title of the Success Story" },
      ]),
    ]),
    group("district-village-performance", "District and Village Performance", [
      leaf("district-level-data", "District Level Data", [
        { key: "kvk", label: "KVK" },
        { key: "reportingYear", label: "Reporting Year" },
        { key: "items", label: "Items" },
        { key: "information", label: "Information" },
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
      ]),
      leaf("instructional-farm-crops", "Instructional Farm - Crops", [
        { key: "kvk", label: "KVK Name" },
        { key: "cropName", label: "Name of the Crop" },
        { key: "areaHa", label: "Area (ha)" },
      ]),
      leaf("production-units", "Production Units", [
        { key: "kvk", label: "KVK Name" },
        { key: "productName", label: "Name of the Product" },
        { key: "qty", label: "Qty" },
      ]),
      leaf("instructional-farm-livestock", "Instructional Farm - Livestock", [
        { key: "kvk", label: "KVK Name" },
        { key: "animalName", label: "Name of the Animal/Bird/Aquatics" },
        { key: "speciesBreed", label: "Species / Breed / Variety" },
        { key: "produceType", label: "Type of Produce" },
      ]),
      leaf("hostel-utilization", "Hostel Utilization", [
        { key: "kvk", label: "KVK Name" },
        { key: "months", label: "Months" },
        { key: "traineesStayed", label: "No. of Trainees Stayed" },
        { key: "traineeDays", label: "Trainee Days (Days Stayed)" },
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
      ]),
      leaf("project-wise-budget-performance", "Project-wise Budget", [
        { key: "kvk", label: "KVK" },
        { key: "projectName", label: "Project Name" },
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
  leaf("sac-meetings", "SAC Meetings", [
    { key: "kvk", label: "KVK Name" },
    { key: "startDate", label: "Start Date" },
    { key: "endDate", label: "End Date" },
    { key: "participants", label: "No of Participants" },
    {
      key: "statutoryMembers",
      label: "Total Statutory Members Present (State Line Department)",
    },
    { key: "recommendations", label: "Salient Recommendations" },
  ]),
  leaf("other-meetings", "Other Meetings related to ATARI", [
    { key: "kvk", label: "KVK Name" },
    { key: "date", label: "Date" },
    { key: "meetingType", label: "Type of Meeting" },
    { key: "agenda", label: "Agenda" },
    { key: "remarks", label: "Remarks" },
  ]),
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
   * Real sub-items and placement (nested under Miscellaneous Information)
   * confirmed by the client directly. No column list was supplied for any
   * of the five, so each stays on the generic single "Name" column until
   * the client shares one, same as every other still-unconfirmed leaf.
   */
  group("digital-information", "Digital Information", [
    leaf("digital-mobile-app", "Details of Mobile App"),
    leaf("digital-web-portal", "Details of Web Portal"),
    leaf("digital-kisan-sarathi", "Details of Kisan Sarathi"),
    leaf(
      "digital-kmas",
      "Kisan Mobile Advisory Services/KMAS(m-Kisan Portal/National Farmers Portal/ SMS Portal)",
    ),
    leaf(
      "digital-other-channels",
      "Details of messages send through other channels",
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
