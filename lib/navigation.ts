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
  /** Overrides `label` for the page H1/breadcrumb only — used when the sidebar name and the real in-page title differ (confirmed real case: sidebar says "Production Masters", the page itself says "Production & Projects"). */
  pageTitle?: string;
  /** Subtitle shown under the page title on a group's landing page, when confirmed from a real reference screenshot. */
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

const GENERIC_MASTER_COLUMNS: MasterColumn[] = [
  { key: "name", label: "Name" },
];

function leaf(slug: string, label: string, columns: MasterColumn[] = GENERIC_MASTER_COLUMNS): NavLeaf {
  return { type: "leaf", slug, label, columns };
}

/**
 * Cards for a group's landing page. If any direct child is itself a group,
 * every child becomes its own card (a bare leaf child is wrapped as a
 * single-item card reusing its own name — confirmed real pattern on pages
 * like Achievements, which mixes leaves and groups as siblings, each its
 * own card). If no child is a group (e.g. Basic Masters, Publication
 * Masters), the whole node becomes one card listing all its leaves inline.
 */
export function landingCards(node: NavGroup): NavGroup[] {
  const hasSubGroup = node.children.some((child) => child.type === "group");
  if (!hasSubGroup) return [node];
  return node.children.map((child) =>
    child.type === "group" ? child : { type: "group", slug: child.slug, label: child.label, children: [child] }
  );
}

function group(
  slug: string,
  label: string,
  children: NavItem[],
  extra?: { pageTitle?: string; description?: string }
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
    leaf("infrastructure", "Infrastructure Master", [{ key: "name", label: "Name" }]),
    leaf("soil-water", "Soil Water Analysis Master"),
    leaf("vehicle-present-status", "Vehicle Present Status Master"),
    leaf("equipment-present-status", "Equipment Present Status Master", [
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
    leaf("nari-crop-category", "NARI Crop Category Master"),
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
  group("performance-indicator", "Performance Indicator Masters", [
    leaf("impact-specific-area", "Impact Specific Area Master"),
    leaf("type-of-enterprise", "Type of Enterprise Master"),
    leaf("account-type", "Account Type Master"),
    leaf("programme-type", "Programme Type Master"),
    leaf("ppv-fra-training-type", "PPV & FRA Training Type Master"),
    leaf("vip-dignitary", "VIP Dignitary Master"),
  ]),
  group("project-wise-budget", "Project Wise Budget Masters", [
    leaf("funding-agency", "Funding Agency Master"),
    leaf("financial-project", "Financial Project Master"),
  ]),
], { description: "Manage employee, training, extension, and other master data" });

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
], { description: "Manage zones, states, institutes, hosts, and districts" });

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
  group("cfld", "CFLD Master", [leaf("cfld-crop", "CFLD Crop Master")]),
], { description: "Manage OFT (On Farm Testing), FLD (Front Line Demonstrations), and CFLD masters" });

/**
 * All Masters -> Production Masters (6-card landing confirmed on screen).
 * Sidebar label is "Production Masters" (confirmed repeatedly in the
 * reference recording), but the page's own H1 reads "Production & Projects"
 * — confirmed directly via atari-photo-zip/IMG-20260817-WA0233.jpg
 * (URL /all-master/production-projects). Both are real; `pageTitle` carries
 * the in-page override.
 */
const productionProjects = group("production", "Production Masters", [
  group("seed-planting-bio", "Production of Seed/Planting Materials/Bio Products", [
    leaf("product-category", "Product Category Master"),
    leaf("product-type", "Product Type Master"),
    leaf("products", "Products"),
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
], {
  pageTitle: "Production & Projects",
  description: "Manage production items, climate resilient agriculture, and ARYA enterprise masters",
});

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

/**
 * Form Management -> About KVK (5-card landing confirmed on the real reference
 * screenshot: Basic Information / Employee Information / Land & Infrastructure
 * Information / Vehicles Information / Equipments Information, each linking to
 * the exact page names shown there). All columns below are transcribed directly
 * from the client's real PDF data exports ("atari zip file.zip", folder
 * "7. about kvk admin data") — not guessed.
 */
const aboutKvk = group("about-kvk", "About KVK", [
  group("basic", "Basic Information", [
    leaf("view-kvks", "View KVKs", [
      { key: "kvk", label: "Name of KVK" },
      { key: "address", label: "Address" },
      { key: "telephoneOffice", label: "Telephone (Office)" },
      { key: "telephoneFax", label: "Telephone (FAX)" },
      { key: "email", label: "E-Mail" },
      { key: "sanctionYear", label: "Sanction Year" },
    ]),
    leaf("bank-account-details", "Bank Account Details", [
      { key: "kvk", label: "KVK Name" },
      { key: "accountType", label: "Account Type" },
      { key: "accountName", label: "Account Name" },
      { key: "bankName", label: "Name of the Bank" },
      { key: "location", label: "Location" },
      { key: "accountNumber", label: "Account Number" },
    ]),
  ]),
  group("employee", "Employee Information", [
    leaf("employee-details", "Employee Details", [
      { key: "kvk", label: "KVK" },
      { key: "sanctionedPost", label: "Sanctioned Post" },
      { key: "nameOfIncumbent", label: "Name of the Incumbent" },
      { key: "dob", label: "Date of Birth" },
      { key: "discipline", label: "Discipline" },
      { key: "payScale", label: "Pay Scale with Present Basic" },
      { key: "dateOfJoining", label: "Date of Joining" },
      { key: "category", label: "Category (SC/ST/OBC/General)" },
      { key: "jobType", label: "Job Type" },
      { key: "mobile", label: "Mobile" },
      { key: "email", label: "Email" },
    ]),
    leaf("staff-transferred", "Staff Transferred", [
      { key: "staffName", label: "Staff Name" },
      { key: "kvkNameBeforeTransfer", label: "KVK Name Before Transfer" },
      { key: "latestKvkName", label: "Latest KVK Name" },
    ]),
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
      { key: "areaHa", label: "Area (Ha)" },
    ]),
    /** Real columns confirmed live at /forms/about-kvk/infrastructure/staff-quarters (atari-photo-zip/IMG-20260815-WA0269.jpg). */
    leaf("staff-quarters", "Staff Quarters", [
      { key: "kvk", label: "KVK" },
      { key: "noOfStaffQuarters", label: "No of Staff Quarters" },
      { key: "dateOfCompletion", label: "Date of Completion" },
      { key: "remark", label: "Remark" },
    ]),
  ]),
  group("vehicles", "Vehicles Information", [
    leaf("view-vehicles", "Vehicles", [
      { key: "kvk", label: "KVK" },
      { key: "typeOfVehicle", label: "Type of Vehicle" },
      { key: "registrationNo", label: "Registration No." },
      { key: "yearOfPurchase", label: "Year of Purchase" },
      { key: "cost", label: "Cost (Rs.)" },
    ]),
    /** Real columns confirmed live at /forms/about-kvk/vehicle-details (atari-photo-zip/IMG-20260817-WA0028.jpg) — this is the full confirmed set, no horizontal scroll beyond it in the source. */
    leaf("vehicle-details", "Vehicle Details", [
      { key: "reportingYear", label: "Reporting Year" },
      { key: "kvk", label: "KVK" },
      { key: "vehicleName", label: "Vehicle Name" },
      { key: "registrationNumber", label: "Registration Number" },
      { key: "totalRunKms", label: "Total Run (Kms)" },
    ]),
  ]),
  group("equipments", "Equipments Information", [
    leaf("view-equipments", "Equipments", [
      { key: "kvk", label: "KVK" },
      { key: "equipmentName", label: "Equipment Name" },
      { key: "yearOfPurchase", label: "Year of Purchase" },
      { key: "cost", label: "Cost" },
      { key: "sourceOfFunding", label: "Source of Funding" },
    ]),
    leaf("equipment-details", "Equipment Details", [
      { key: "year", label: "Year" },
      { key: "kvk", label: "KVK" },
      { key: "equipmentName", label: "Equipment Name" },
      { key: "yearOfPurchase", label: "Year of Purchase" },
      { key: "cost", label: "Cost" },
      { key: "sourceOfFund", label: "Source of Fund" },
      { key: "presentStatus", label: "Present Status" },
    ]),
  ]),
], { description: "Manage KVK basic information, staff, infrastructure, vehicles, and equipments" });

/**
 * Form Management -> Achievements (13-card landing confirmed on screen).
 * "On Farm Trial" and "Front Line Demonstration" real source data (client's
 * zip, "8.ADMIN ACHIEVEMENT" folder) turned out to be complex multi-section
 * reports (a 20-category summary table plus a detailed per-crop/technology
 * breakdown with full economics), not flat tables — so both keep the generic
 * single-column view rather than guessed columns until a real simple-list
 * schema is confirmed. The FLD file (78 pages) was read in full for its
 * structure; the OFT file (18MB) could not be opened in this environment, so
 * its structure is unconfirmed but presumed parallel to FLD's.
 */
const achievements = group("achievements", "Achievements", [
  leaf("technical-achievement", "Technical Achievement Summary"),
  leaf("oft", "On Farm Trials (OFT)"),
  /**
   * Real page is a group of 3 leaves, confirmed via video-frames-2/frame_0859.png
   * and frame_0864.png (Achievements landing page). The 3rd leaf's full title was
   * truncated in every captured frame ("Technical Feedback on the demonstrated
   * tech…") — kept as the visible fragment rather than guessing the rest.
   */
  group("front-line-demonstration", "Front Line Demonstration", [
    leaf("view-fld", "View FLD"),
    leaf("fld-extension-training", "Extension and Training activities under FLD"),
    leaf("fld-technical-feedback", "Technical Feedback on the demonstrated tech…"),
  ]),
  leaf("trainings", "Trainings", [
    { key: "reportingYear", label: "Reporting Year" },
    { key: "kvk", label: "KVK" },
    { key: "startEndDate", label: "Start-End Date" },
    { key: "program", label: "Program" },
    { key: "title", label: "Title" },
  ]),
  /** Real columns confirmed live at /forms/achievements/extension-activities (atari-photo-zip/IMG-20260817-WA0027.jpg). */
  group("extension", "Extension", [
    leaf("extension-activities", "Extension Activities", [
      { key: "reportingYear", label: "Reporting Year" },
      { key: "kvk", label: "KVK" },
      { key: "startDate", label: "Start Date" },
      { key: "endDate", label: "End Date" },
      { key: "nameOfExtensionActivities", label: "Name of Extension Activities" },
      { key: "noOf", label: "No Of" },
    ]),
    leaf("other-extension-activities", "Other Extension Activities"),
  ]),
  group("special-days", "Special Days", [
    leaf("technology-week-celebration", "Technology Week Celebration"),
    leaf("celebration-days", "Celebration of important days", [
      { key: "kvk", label: "KVK" },
      { key: "importantDay", label: "Important Day" },
      { key: "eventDate", label: "Event Date" },
      { key: "noOfActivities", label: "No of Activities" },
    ]),
    leaf("world-soil-day", "Details of World Soil Day Celebration"),
    leaf("poshan-maaha", "Poshan Maaha"),
  ]),
  leaf("production-supply", "Production and supply of Technological products"),
  leaf("soil-water-testing", "Detail of Soil, Water and Plant analysis"),
  /** Never scrolled into view in any captured source — unconfirmed, kept generic rather than guessed. */
  leaf("publications", "Publications"),
  leaf("hrd", "Human Resources Development"),
  group("awards", "Award and Recognition", [
    leaf("kvk", "KVK"),
    leaf("scientist", "Scientist"),
    leaf("farmer", "Farmer"),
  ]),
  /**
   * Real location confirmed via atari-photo-zip/IMG-20260817-WA0030.jpg: reached
   * from the Achievements page (sidebar highlights "Achievements" as active), not
   * from Projects. Our URL nests it under achievements/ for a consistent
   * breadcrumb; the real app's own URL is flatter (/forms/swachhta-bharat-
   * abhiyaan/sewa), an apparent routing quirk in the reference app itself.
   */
  group("swachhta-bharat-abhiyaan", "Swachhta Bharat Abhiyaan", [
    leaf("sewa", "Swachhta hi Sewa", [
      { key: "kvk", label: "KVK" },
      { key: "dateDurationOfObservation", label: "Date Duration of Observation" },
      { key: "totalNoOfActivitiesUndertaken", label: "Total No of Activities Undertaken" },
      { key: "noOfStaffs", label: "No of Staffs" },
      { key: "noOfFarmers", label: "No of Farmers" },
    ]),
    leaf("pakhwada", "Swachta Pakhwada"),
    leaf("budget-expenditure", "Budget expenditure"),
  ]),
]);

/**
 * Form Management -> Projects.
 *
 * Real card grid confirmed directly from a reference screenshot of this exact
 * page (client's zip, "Projects form/Screenshot 2026-08-13 145837.png"): CFLD,
 * NICRA, and NICRA Others cards were fully visible with their card->leaf
 * pairing; ARYA/SAFAL, Natural Farming and TSP/SCSP cards were visible in the
 * grid but the screenshot was scrolled before their leaf links appeared, and
 * more cards exist further down that were never captured in any reference —
 * so those five groups below keep the leaf structure from the earlier
 * video/screenshot pass (not re-confirmed this round) rather than guessing
 * new ones. Swachhta Bharat Abhiyaan was removed from here — the real app
 * reaches it from the Achievements page, not Projects (see `achievements`
 * above).
 */
const projects = group("projects", "Projects", [
  group("cfld", "CFLD", [
    /** Real list columns confirmed via video-frames/frame_0640.png (the multi-tab report in the source PDF is the per-record edit form, not this list). */
    leaf("technical-parameter", "Technical Parameter", [
      { key: "reportingYear", label: "Reporting Year" },
      { key: "crop", label: "Crop" },
      { key: "technologyDemonstrated", label: "Technology Demonstrated" },
      { key: "areaHa", label: "Area Ha" },
      { key: "numberOfFarmers", label: "Number of Farmers" },
      { key: "district", label: "District" },
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
    leaf("dignitaries-visited-nicra-villages", "Dignitaries visited NICRA Villages"),
    leaf("pi-co-pi-list", "Name of PI & Co-PI List"),
  ]),
  /**
   * These 6 were confirmed as real card headers on this page (same visual
   * style as CFLD/NICRA above, atari-master-data/master/Projects form/
   * Screenshot 2026-08-13 145837.png), but the screenshot scrolled away
   * before their own inline leaf lists came into view — rather than guess
   * their real sub-items, each wraps a single leaf that reuses the card's
   * own confirmed name, so the card renders correctly without fabricating
   * new content.
   */
  group("arya-safal", "ARYA/SAFAL", [leaf("arya-safal", "ARYA/SAFAL")]),
  group("natural-farming", "Natural Farming", [leaf("natural-farming", "Natural Farming")]),
  group("tsp-scsp", "TSP/SCSP", [leaf("tsp-scsp", "TSP/SCSP")]),
  group("nari", "NARI", [leaf("nari", "NARI")]),
  group("agri-drone", "Agri-Drone", [leaf("agri-drone", "Agri-Drone")]),
  group("fpo-cbbo", "FPO and CBBO", [leaf("fpo-cbbo", "FPO and CBBO")]),
], { description: "Manage project details, technical parameters, extension activities, and budget utilization" });

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

export type SearchResult = {
  label: string;
  href: string;
  /** Breadcrumb-style path shown under the label, e.g. "All Masters / Basic Masters". */
  section: string;
};

function flattenNavTree(items: NavItem[], basePath: string, section: string): SearchResult[] {
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
