/**
 * Role & scope taxonomy for the Access Management module.
 *
 * Source of truth: the client's "ATARI Access Management – Role & User Flow"
 * spec, cross-checked against the real Role Management / User Management
 * screens in the reference recording (atari-client.vercel.app/role-view and
 * /view-users) — hierarchy order, role names, and field labels below all
 * come from one of those two, not guessed.
 */

export type ScopeKind = "system" | "state" | "district" | "organisation" | "kvk";

export type RoleDefinition = {
  sNo: number;
  name: string;
  parentRole: string;
  /** Lower number = higher authority (matches the "Hierarchy Level" field seen on the Add Role modal). */
  hierarchyLevel: number;
  scope: ScopeKind;
};

/** The 9 roles shown on the real Role Management page, in the same order. */
export const BASE_ROLES: RoleDefinition[] = [
  { sNo: 1, name: "Super Admin", parentRole: "System Level", hierarchyLevel: 1, scope: "system" },
  { sNo: 2, name: "State Admin", parentRole: "Super Admin", hierarchyLevel: 2, scope: "state" },
  { sNo: 3, name: "District Admin", parentRole: "State Admin", hierarchyLevel: 3, scope: "district" },
  { sNo: 4, name: "Org Admin", parentRole: "District Admin", hierarchyLevel: 4, scope: "organisation" },
  { sNo: 5, name: "KVK Admin", parentRole: "Org Admin", hierarchyLevel: 5, scope: "kvk" },
  { sNo: 6, name: "KVK User", parentRole: "KVK Admin", hierarchyLevel: 6, scope: "kvk" },
  { sNo: 7, name: "State User", parentRole: "State Admin", hierarchyLevel: 6, scope: "state" },
  { sNo: 8, name: "District User", parentRole: "District Admin", hierarchyLevel: 7, scope: "district" },
  { sNo: 9, name: "Org User", parentRole: "Org Admin", hierarchyLevel: 8, scope: "organisation" },
];

/** Options for the "Hierarchy Level" select on the Add/Edit Role modal. */
export const HIERARCHY_LEVELS = [
  { value: "1", label: "1 - Super Admin (Highest)" },
  { value: "2", label: "2 - State Admin" },
  { value: "3", label: "3 - District Admin" },
  { value: "4", label: "4 - Org Admin" },
  { value: "5", label: "5 - KVK Admin" },
  { value: "6", label: "6 - KVK User" },
  { value: "7", label: "7 - Custom" },
  { value: "8", label: "8 - Custom" },
  { value: "9", label: "9 - Custom (Lowest)" },
];

/** The 10 permissions Super Admin can grant/restrict per role (spec section 6B/7). */
export const PERMISSIONS = [
  "View",
  "Add / Create",
  "Edit",
  "Delete",
  "Approve",
  "Export",
  "Manage Users",
  "Manage Masters",
  "Manage Forms",
  "Manage Permissions",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/** Zone IV covers Bihar & Jharkhand (per spec: "Assign State (Zone IV - PATNA & JHARKHAND)"). */
export const STATES = ["Bihar", "Jharkhand"];

/** District names, sourced from the real KVK Admin rows seen on the reference User Management screen. */
export const DISTRICTS = [
  "Araria",
  "Arwal",
  "Aurangabad",
  "Banka",
  "Bhojpur",
  "Gaya",
  "Jehanabad",
  "Katihar",
  "Khagaria",
  "Lakhisarai",
  "Madhubani",
  "Patna",
  "Purnea",
  "Saharsa",
  "West Champaran",
];

/** KVKs, one per district above — matches the "KVK <District>" naming seen in the reference. */
export const KVKS = DISTRICTS.map((district) => ({
  name: `KVK ${district}`,
  district,
  state: "Bihar",
}));

/** Which scope field (if any) to show once a Role is picked in Create/Edit User. */
export function scopeFieldFor(
  scope: ScopeKind
): { label: string; placeholder: string; kind: ScopeKind } | null {
  switch (scope) {
    case "system":
      return null;
    case "state":
      return { label: "State", placeholder: "Select state", kind: "state" };
    case "district":
      return { label: "District", placeholder: "Select district", kind: "district" };
    case "organisation":
      return {
        label: "Organisation / Institution",
        placeholder: "Enter organisation name",
        kind: "organisation",
      };
    case "kvk":
      return { label: "KVK", placeholder: "Select KVK", kind: "kvk" };
  }
}
