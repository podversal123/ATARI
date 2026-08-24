/**
 * Reports module data model.
 *
 * Source of truth: "ATARI AMS reports workflow.pdf" (client spec, sections
 * 1-26) - the KVK Report and Super Admin/Admin Report screens, their filter
 * sets, cascading Zone→State→Host Organisation→KVK behaviour, and the
 * dynamic preview states (idle / generating / no-data / stale-filters) are
 * all transcribed from that document, not guessed.
 *
 * Form options reuse FORM_MANAGEMENT (lib/navigation.ts) instead of the
 * spec's own illustrative/truncated example list, per the spec's own rule
 * that "the form list should come dynamically from the forms available in
 * ATARI AMS".
 */

import {
  FORM_MANAGEMENT,
  flattenLeafPaths,
  type NavLeafPath,
} from "./navigation";
import {
  KVK_MASTER_ROWS,
  STATE_MASTER_ROWS,
  ZONE_MASTER_ROWS,
} from "./masters";

export type ReportFormOption = { slug: string; label: string };

/** The 6 real Form Management categories, usable as "Select Form" options on both report screens. */
export const REPORT_FORM_OPTIONS: ReportFormOption[] = FORM_MANAGEMENT.map(
  (item) => ({
    slug: item.slug,
    label: item.label,
  }),
);

/**
 * Every individual form leaf across all of Form Management (e.g. "Employee
 * Details" inside About KVK), not just the 6 top-level categories - lets a
 * report be scoped to one particular sub-form, not only a whole category.
 */
export const REPORT_FORM_LEAVES: NavLeafPath[] =
  flattenLeafPaths(FORM_MANAGEMENT);

export const ALL_FORM_PATHS = new Set(
  REPORT_FORM_LEAVES.map((leaf) => leaf.path),
);

export type ReportStatus = "Submitted" | "Verified" | "Pending";

export const REPORT_TABLE_COLUMNS = [
  "S.No",
  "Form Name",
  "Submitted By",
  "Submission Date",
  "Status",
] as const;

export type QuickSelectRange =
  | "today"
  | "this-week"
  | "this-month"
  | "last-month"
  | "this-year"
  | "custom";

export const QUICK_SELECT_OPTIONS: {
  value: QuickSelectRange;
  label: string;
}[] = [
  { value: "today", label: "Today" },
  { value: "this-week", label: "This Week" },
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "this-year", label: "This Year" },
  { value: "custom", label: "Custom Range" },
];

function toInputDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Resolves a quick-select pill to a concrete {from, to} date pair; "custom" leaves the current dates untouched. */
export function resolveQuickSelectRange(
  range: QuickSelectRange,
): { from: string; to: string } | null {
  const now = new Date();
  const today = toInputDate(now);

  switch (range) {
    case "today":
      return { from: today, to: today };
    case "this-week": {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      return { from: toInputDate(start), to: today };
    }
    case "this-month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: toInputDate(start), to: today };
    }
    case "last-month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: toInputDate(start), to: toInputDate(end) };
    }
    case "this-year": {
      const start = new Date(now.getFullYear(), 0, 1);
      return { from: toInputDate(start), to: today };
    }
    case "custom":
      return null;
  }
}

/** Zones available to the Zone dropdown - currently just the one real zone this deployment covers. */
export const REPORT_ZONE_OPTIONS = ZONE_MASTER_ROWS.map((row) => row.zoneName);

/** States under a given zone, derived from the real State Master rows. */
export function statesForZone(zoneName: string): string[] {
  return STATE_MASTER_ROWS.filter((row) => row.zoneName === zoneName).map(
    (row) => row.stateName,
  );
}

/** Host Organisations under a given state, derived from the real KVK Master rows (the only master that links hostOrg to state). */
export function hostOrgsForState(stateName: string): string[] {
  const orgs = new Set(
    KVK_MASTER_ROWS.filter((row) => row.stateName === stateName).map(
      (row) => row.hostOrg,
    ),
  );
  return Array.from(orgs);
}

/** KVKs under a given Host Organisation, derived from the real KVK Master rows. */
export function kvksForHostOrg(hostOrg: string): string[] {
  return KVK_MASTER_ROWS.filter((row) => row.hostOrg === hostOrg).map(
    (row) => row.kvk,
  );
}

/**
 * Districts under a given Host Organisation, derived from the real KVK
 * Master rows. A Host Organisation isn't confined to one district - the
 * real data shows e.g. BAU Sabour spanning Araria/Arwal/Aurangabad/Banka/
 * Bhagalpur - so District narrows the KVK picker one step further inside
 * an already-chosen Host Organisation, not the other way around.
 */
export function districtsForHostOrg(hostOrg: string): string[] {
  const districts = new Set(
    KVK_MASTER_ROWS.filter((row) => row.hostOrg === hostOrg).map(
      (row) => row.districtName,
    ),
  );
  return Array.from(districts);
}

/** KVKs under a given Host Organisation, further narrowed to one district. */
export function kvksForDistrict(
  hostOrg: string,
  districtName: string,
): string[] {
  return KVK_MASTER_ROWS.filter(
    (row) => row.hostOrg === hostOrg && row.districtName === districtName,
  ).map((row) => row.kvk);
}

/**
 * Multi-state cascade helpers - Reports' State/Host Organisation/District
 * pickers are all checkbox multi-selects (client direction: individual
 * states show their own Host Orgs with single/multi checkboxes; selecting
 * every state shows an "All Hosts/All Districts/All KVKs" scope). All
 * derived from the same real KVK Master rows as the single-select versions
 * above.
 */

export const ALL_STATES = STATE_MASTER_ROWS.map((row) => row.stateName);

/** Union of Host Organisations across every given state. */
export function hostOrgsForStates(stateNames: string[]): string[] {
  const orgs = new Set(
    KVK_MASTER_ROWS.filter((row) => stateNames.includes(row.stateName)).map(
      (row) => row.hostOrg,
    ),
  );
  return Array.from(orgs);
}

/** Every real Host Organisation, regardless of state - used once every state is selected. */
export const ALL_HOST_ORGS = Array.from(
  new Set(KVK_MASTER_ROWS.map((row) => row.hostOrg)),
);

/** Union of Districts across every given Host Organisation. */
export function districtsForHostOrgs(hostOrgs: string[]): string[] {
  const districts = new Set(
    KVK_MASTER_ROWS.filter((row) => hostOrgs.includes(row.hostOrg)).map(
      (row) => row.districtName,
    ),
  );
  return Array.from(districts);
}

/** Every real district a Host Organisation is confirmed to reach - used once every Host Org is selected. */
export const ALL_HOST_ORG_DISTRICTS = Array.from(
  new Set(KVK_MASTER_ROWS.map((row) => row.districtName)),
);

/** KVKs matching any of the given Host Organisations AND any of the given Districts. */
export function kvksForHostOrgsAndDistricts(
  hostOrgs: string[],
  districts: string[],
): string[] {
  return KVK_MASTER_ROWS.filter(
    (row) => hostOrgs.includes(row.hostOrg) && districts.includes(row.districtName),
  ).map((row) => row.kvk);
}

/** Formats a Date as DD/MM/YYYY, matching the spec's mockup date format. */
export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

let reportSequence = 0;

/** Generates a report reference in the RPT-YYYYMMDD-#### format the spec requires in the header. */
export function generateReportId(): string {
  reportSequence += 1;
  const today = new Date();
  const stamp = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(
    today.getDate(),
  ).padStart(2, "0")}`;
  return `RPT-${stamp}-${String(reportSequence).padStart(4, "0")}`;
}
