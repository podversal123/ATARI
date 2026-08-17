/**
 * Single source of truth for the Super Admin sidebar.
 *
 * The sidebar component renders this tree directly, and the dynamic
 * `/masters/[...slug]` and `/forms/[...slug]` routes resolve pages from
 * the same `href` values, so every link in the sidebar always points at a
 * real, working page — there are no dead links.
 *
 * Columns for each list page are filled in from what was actually visible
 * in the reference recording/screenshots where possible. Leaves without a
 * confirmed real column list fall back to the generic single "Name" column
 * until the client's screenshots show the real field list.
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
};

export type NavGroup = {
  type: "group";
  slug: string;
  label: string;
  children: NavItem[];
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

const GENERIC_MASTER_COLUMNS: MasterColumn[] = [
  { key: "name", label: "Name" },
];

function leaf(slug: string, label: string, columns: MasterColumn[] = GENERIC_MASTER_COLUMNS): NavLeaf {
  return { type: "leaf", slug, label, columns };
}

function group(slug: string, label: string, children: NavItem[]): NavGroup {
  return { type: "group", slug, label, children };
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
  leaf("training-thematic-area", "Training Thematic Area Master", [
    { key: "thematicArea", label: "Thematic Area" },
  ]),
  leaf("training-clientele", "Training Clientele Master", [
    { key: "clientele", label: "Clientele" },
  ]),
  leaf("funding-source", "Funding Source Master", [
    { key: "fundingSource", label: "Funding Source" },
  ]),
]);

/** All Masters -> Training & Extension Masters (3-card landing confirmed on screen) */
const trainingExtensionMasters = group("training-extension", "Training & Extension Masters", [
  trainingMaster,
  group("extension-activities", "Extension Activities", [
    leaf("extension-activity", "Extension Activity Master", [
      { key: "activityName", label: "Activity Name" },
    ]),
    leaf("other-extension-activity", "Other Extension Activity Master", [
      { key: "activityName", label: "Activity Name" },
    ]),
  ]),
  group("events", "Events", [leaf("events", "Events Master")]),
]);

/** All Masters -> Other Masters (sub-groups + columns confirmed on screen) */
const otherMasters = group("other", "Other Masters", [
  group("employee", "Employee Masters", [
    leaf("staff-category", "Staff Category Master"),
    leaf("job-type", "Job Type Master"),
    leaf("pay-level", "Pay Level Master"),
    leaf("pay-scale", "Pay Scale Master"),
    leaf("sanctioned-post", "Sanctioned Post Master"),
    leaf("discipline", "Discipline Master"),
  ]),
  group("bank", "Bank Masters", [leaf("bank-account-type", "Bank Account Type Master")]),
  group("calendar-context", "Calendar & Context Masters", [
    leaf("season", "Season Master"),
    leaf("unit", "Unit Master"),
    leaf("crop-type", "Crop Type Master"),
    leaf("important-day", "Important Day Master"),
  ]),
  group("resource", "Resource Masters", [
    leaf("infrastructure", "Infrastructure", [{ key: "name", label: "Name" }]),
    leaf("soil-water", "Soil Water"),
    leaf("vehicle-present-status", "Vehicle Present Status"),
    leaf("equipment-present-status", "Equipment Present Status", [
      { key: "statusCode", label: "Status Code" },
      { key: "statusLabel", label: "Status Label" },
      { key: "hideInNextYear", label: "Hide in Next Year" },
      { key: "isActive", label: "Is Active" },
    ]),
    leaf("equipment-type", "Equipment Type Master"),
    leaf("equipment", "Equipment Master", [
      { key: "name", label: "Name" },
      { key: "equipmentType", label: "Equipment Type" },
    ]),
    leaf("asset-funding-source", "Asset Funding Source Master"),
  ]),
  group("nari", "NARI Masters", [
    leaf("nari-activity", "NARI Activity Master"),
    leaf("nari-nutrition-garden-type", "NARI Nutrition Garden Type Master"),
  ]),
  group("nicra", "NICRA Masters", [
    leaf("nicra-category", "NICRA Category Master"),
    leaf("nicra-sub-category", "NICRA Sub-category Master", [
      { key: "subCategoryName", label: "Sub Category Name" },
      { key: "categoryName", label: "Category Name" },
    ]),
    leaf("nicra-seed-fodder-bank", "NICRA Seed/Fodder Bank Master"),
    leaf("nicra-dignitary-type", "NICRA Dignitary Type Master"),
    leaf("nicra-pi-co-pi-type", "NICRA PI/CO-PI Type Master"),
  ]),
]);

/** All Masters -> Basic Masters (columns + tab order confirmed on screen) */
const basicMasters = group("basic", "Basic Masters", [
  leaf("zone-master", "Zone Master", [{ key: "zoneName", label: "Zone Name" }]),
  leaf("state-master", "State Master", [
    { key: "zoneName", label: "Zone Name" },
    { key: "stateName", label: "State Name" },
  ]),
  leaf("district-master", "District Master", [
    { key: "zoneName", label: "Zone Name" },
    { key: "stateName", label: "State Name" },
    { key: "districtName", label: "District Name" },
  ]),
  leaf("institute-master", "Institute Master", [{ key: "instituteName", label: "Institute Name" }]),
  leaf("host-master", "Host Master", [{ key: "hostName", label: "Host Name" }]),
  leaf("kvk-master", "KVK Master", [
    { key: "zoneName", label: "Zone Name" },
    { key: "stateName", label: "State Name" },
    { key: "hostOrg", label: "Host Org" },
    { key: "districtName", label: "District Name" },
    { key: "kvk", label: "KVK" },
    { key: "mobile", label: "Mobile" },
  ]),
]);

/** All Masters -> OFT & FLD Masters (two tab-sets confirmed on screen: OFT side, FLD side) */
const oftFldMasters = group("oft-fld", "OFT & FLD Masters", [
  group("oft", "OFT Masters", [
    leaf("subject", "Subject Master"),
    leaf("oft-thematic-area", "OFT Thematic Area Master", [
      { key: "thematicArea", label: "Thematic Area" },
    ]),
  ]),
  group("fld", "FLD Masters", [
    leaf("sector", "Sector Master"),
    leaf("fld-thematic-area", "FLD Thematic Area Master"),
    leaf("category", "Category Master"),
    leaf("sub-category", "Sub-category Master", [
      { key: "subCategoryName", label: "Sub Category Name" },
    ]),
    leaf("crop", "Crop Master", [
      { key: "cropName", label: "Crop Name" },
      { key: "category", label: "Category" },
    ]),
    leaf("activity", "Activity Master"),
  ]),
]);

/**
 * All Masters -> Production Masters (6-card landing confirmed on screen).
 * Label confirmed as "Production Masters" from the reference recording,
 * seen repeatedly in the sidebar across many frames — takes precedence over
 * an earlier single-screenshot catalog note that guessed "Production & Projects".
 */
const productionProjects = group("production", "Production Masters", [
  group("seed-planting-bio", "Production of Seed/Planting Materials/Bio Products", [
    leaf("product-category", "Product Category Master"),
    leaf("product-type", "Product Type Master"),
    leaf("products", "Products Master"),
  ]),
  group("climate-resilient-agriculture", "Climate Resilient Agriculture", [
    leaf("cropping-system", "Cropping System Master", [
      { key: "season", label: "Season" },
      { key: "cropName", label: "Crop Name" },
    ]),
    leaf("farming-system", "Farming System Master", [
      { key: "farmingSystemName", label: "Farming System Name" },
    ]),
  ]),
  group("arya", "ARYA", [leaf("arya-enterprise", "ARYA Enterprise Master")]),
  group("tsp-scsp", "TSP/SCSP", [
    leaf("tsp-scsp-type", "Type Master"),
    leaf("tsp-scsp-activity", "Activity Master"),
  ]),
  group("natural-farming", "Natural Farming", [
    leaf("natural-farming-activity", "Activity Master"),
    leaf("soil-parameter", "Soil Parameter Master"),
  ]),
  group("agri-drone", "Agri-Drone", [leaf("demonstrations-on", "Demonstrations On Master")]),
]);

export const ALL_MASTERS: NavItem[] = [
  basicMasters,
  oftFldMasters,
  trainingExtensionMasters,
  productionProjects,
  group("publication", "Publication Masters", [
    leaf("publication-items", "Publication Items Master", [{ key: "itemName", label: "Item Name" }]),
  ]),
  otherMasters,
];

/** Form Management -> About KVK (5-card landing confirmed on screen; card->leaf pairing inferred from the matching badge names on the real Form Summary expand rows) */
const aboutKvk = group("about-kvk", "About KVK", [
  group("basic", "Basic", [
    leaf("view-kvks", "View KVKs", [
      { key: "kvk", label: "KVK" },
      { key: "address", label: "Address" },
      { key: "hostOrganization", label: "Host Organization" },
      { key: "mobile", label: "Mobile" },
      { key: "landline", label: "Landline" },
      { key: "fax", label: "Fax" },
      { key: "email", label: "E-mail" },
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
  group("employee", "Employee", [
    leaf("employee-details", "Employee Details", [
      { key: "kvk", label: "KVK" },
      { key: "photo", label: "Photo" },
      { key: "resume", label: "Resume" },
      { key: "staffName", label: "Staff Name" },
      { key: "position", label: "Position" },
      { key: "mobile", label: "Mobile" },
      { key: "email", label: "Email" },
    ]),
    leaf("staff-transferred", "Staff Transferred", [
      { key: "staffName", label: "Staff Name" },
      { key: "kvkNameBeforeTransfer", label: "KVK Name Before Transfer" },
      { key: "latestKvkName", label: "Latest KVK Name" },
    ]),
  ]),
  group("land-infrastructure", "Land & Infrastructure", [
    leaf("infrastructure-details", "Infrastructure Details"),
  ]),
  group("vehicles", "Vehicles", [
    leaf("view-vehicles", "View Vehicles", [
      { key: "vehicleName", label: "Vehicle Name" },
      { key: "registrationNo", label: "Registration No" },
      { key: "yearOfPurchase", label: "Year of Purchase" },
      { key: "totalCost", label: "Total Cost" },
    ]),
    leaf("vehicle-details", "Vehicle Details", [
      { key: "reportingYear", label: "Reporting Year" },
      { key: "kvk", label: "KVK" },
      { key: "vehicleName", label: "Vehicle Name" },
      { key: "registrationNumber", label: "Registration Number" },
      { key: "totalRun", label: "Total Run" },
    ]),
  ]),
  group("equipments", "Equipments", [
    leaf("view-equipments", "View Equipments"),
    leaf("equipment-details", "Equipment Details"),
  ]),
]);

/** Form Management -> Achievements (13-card landing confirmed on screen) */
const achievements = group("achievements", "Achievements", [
  leaf("technical-achievement", "Technical Achievement"),
  leaf("on-farm-trial", "On Farm Trial"),
  leaf("front-line-demonstration", "Front Line Demonstration"),
  leaf("training", "Training", [
    { key: "reportingYear", label: "Reporting Year" },
    { key: "kvk", label: "KVK" },
    { key: "startEndDate", label: "Start-End Date" },
    { key: "program", label: "Program" },
    { key: "title", label: "Title" },
  ]),
  leaf("extension", "Extension"),
  leaf("other-extension-activities", "Other Extension Activities"),
  group("special-days", "Special Days", [
    leaf("technology-week-celebration", "Technology Week Celebration"),
    leaf("celebration-days", "Celebration Days", [
      { key: "kvk", label: "KVK" },
      { key: "importantDay", label: "Important Day" },
      { key: "eventDate", label: "Event Date" },
      { key: "noOfActivities", label: "No of Activities" },
    ]),
    leaf("world-soil-day", "World Soil Day"),
    leaf("poshan-maaha", "Poshan Maaha"),
  ]),
  leaf("production-supply", "Production & Supply"),
  leaf("soil-water-testing", "Soil and Water Testing"),
  leaf("publications", "Publications"),
  leaf("hrd", "Human Resources Development"),
  group("award-recognition", "Award and Recognition", [
    leaf("award-kvk", "KVK"),
    leaf("award-scientist", "Scientist"),
    leaf("award-farmer", "Farmer"),
  ]),
]);

/** Form Management -> Projects (landing confirmed on screen: ARYA/SAFAL, Natural Farming, TSP/SCSP, NARI, Agri-Drone, FPO and CBBO, Swachhta Bharat Abhiyaan, CFLD) */
const projects = group("projects", "Projects", [
  leaf("arya-safal", "ARYA/SAFAL"),
  leaf("natural-farming", "Natural Farming"),
  leaf("tsp-scsp", "TSP/SCSP"),
  leaf("nari", "NARI"),
  leaf("agri-drone", "Agri-Drone"),
  leaf("fpo-cbbo", "FPO and CBBO"),
  group("swachhta-bharat-abhiyaan", "Swachhta Bharat Abhiyaan", [
    leaf("sewa", "Sewa"),
    leaf("pakhwada", "Pakhwada"),
    leaf("budget-expenditure", "Budget expenditure"),
  ]),
  group("cfld", "CFLD", [
    leaf("technical-parameter", "Technical Parameter", [
      { key: "numberOfFarmers", label: "Number of Farmers" },
      { key: "districtYield", label: "District Yield" },
      { key: "stateYield", label: "State Yield" },
      { key: "potentialYield", label: "Potential Yield" },
      { key: "status", label: "Status" },
      { key: "completedAt", label: "Completed At" },
    ]),
    leaf("extension-activity", "Extension Activity"),
    leaf("budget-utilization", "Budget Utilization"),
  ]),
]);

export const FORM_MANAGEMENT: NavItem[] = [
  aboutKvk,
  achievements,
  projects,
  leaf("performance", "Performance Indicators"),
  leaf("meetings", "Meetings"),
  leaf("miscellaneous", "Miscellaneous"),
];

export const SIDEBAR: SidebarSection[] = [
  { slug: "dashboard", label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { slug: "form-summary", label: "Form Summary", href: "/form-summary", icon: "form-summary" },
  { slug: "masters", label: "All Masters", icon: "masters", children: ALL_MASTERS },
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
  { slug: "module-images", label: "Module Images", href: "/module-images", icon: "module-images" },
  { slug: "gallery", label: "Gallery", href: "/gallery", icon: "gallery" },
  { slug: "targets", label: "Targets", href: "/targets", icon: "targets" },
  { slug: "log-history", label: "Log History", href: "/log-history", icon: "log-history" },
  { slug: "notifications", label: "Notifications", href: "/notifications", icon: "notifications" },
  { slug: "reports", label: "Reports", href: "/reports", icon: "reports" },
];

/**
 * Resolves a slug path (e.g. ["other", "resource", "equipment"]) to the
 * node it points at — a leaf (rendered as a list page) or a group
 * (rendered as a card grid of its children) — plus the breadcrumb trail.
 */
export function resolveNavPath(
  root: NavItem[],
  slugPath: string[]
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
