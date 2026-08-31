import { BASE_ROLES, DISTRICTS, KVKS, STATES, scopeFieldFor, type ScopeKind } from "@/lib/rbac";

export const KVK_USER_ROLE = "KVK User";

export function roleByName(name: string) {
  return BASE_ROLES.find((role) => role.name === name);
}

/** Matches the slugs seeded for the 9 real system roles (prisma/seed-roles.ts) - every BASE_ROLES name transforms to its slug the same way. */
export function roleSlugFromName(name: string) {
  return name.toLowerCase().replace(/\s+/g, "_");
}

/**
 * The real Create/Edit User forms have no separate "Username" field (per the
 * reference) - login already works off a plain `username` column, so the
 * email doubles as it here, same as typing either one at the login screen.
 * Only ever called with a `scopeField`'s own `kind`, which is never
 * "system" (scopeFieldFor returns null for that case) - typed to accept
 * the full ScopeKind anyway since that's the real return type.
 */
export function scopeBodyKey(kind: ScopeKind) {
  switch (kind) {
    case "system":
      return null;
    case "state":
      return "stateName";
    case "district":
      return "districtName";
    case "organisation":
      return "hostOrgName";
    case "kvk":
      return "kvkName";
  }
}

export function scopeOptionsFor(kind: ReturnType<typeof scopeFieldFor>) {
  if (!kind) return null;
  switch (kind.kind) {
    case "state":
      return STATES;
    case "district":
      return DISTRICTS;
    case "kvk":
      return KVKS.map((kvk) => kvk.name);
    default:
      return null;
  }
}
