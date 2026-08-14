/**
 * Single source of truth for the Super Admin sidebar.
 *
 * The sidebar component renders this tree directly, and the dynamic
 * `/masters/[...slug]` and `/forms/[...slug]` routes resolve pages from
 * the same `href` values, so every link in the sidebar always points at a
 * real, working page — there are no dead links.
 *
 * Columns for each list page are filled in from what was actually visible
 * in the reference recording where possible. Groups that were named in the
 * nav but never opened on screen (Basic Masters, OFT & FLD Masters,
 * Production Masters, Publication Masters) get a generic placeholder
 * column set until the client provides the real field list.
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

/** All Masters -> Training & Extension Masters (columns confirmed on screen) */
const trainingExtensionMasters = group("training-extension", "Training & Extension Masters", [
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

export const ALL_MASTERS: NavItem[] = [
  group("basic", "Basic Masters", [leaf("placeholder", "Basic Masters list")]),
  group("oft-fld", "OFT & FLD Masters", [leaf("placeholder", "OFT & FLD Masters list")]),
  trainingExtensionMasters,
  group("production", "Production Masters", [leaf("placeholder", "Production Masters list")]),
  group("publication", "Publication Masters", [leaf("placeholder", "Publication Masters list")]),
  otherMasters,
];

export const FORM_MANAGEMENT: NavItem[] = [
  group("about-kvk", "About KVK", [
    leaf("employee-details", "Employee Details"),
    leaf("staff-transferred", "Staff Transferred", [
      { key: "staffName", label: "Staff Name" },
      { key: "kvkNameBeforeTransfer", label: "KVK Name Before Transfer" },
      { key: "latestKvkName", label: "Latest KVK Name" },
    ]),
  ]),
  leaf("achievements", "Achievements"),
  group("projects", "Projects", [
    group("cfld", "CFLD", [
      leaf("technical-parameter", "Technical Parameter", [
        { key: "reportingYear", label: "Reporting Year" },
        { key: "crop", label: "Crop" },
        { key: "technologyDemonstrated", label: "Technology Demonstrated" },
        { key: "areaHa", label: "Area (Ha)" },
        { key: "numberOfFarmers", label: "Number of Farmers" },
        { key: "district", label: "District" },
      ]),
      leaf("extension-activity", "Extension Activity"),
      leaf("budget-utilization", "Budget Utilization"),
    ]),
  ]),
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
