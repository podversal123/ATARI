import "server-only";
import type { PermissionType } from "@/lib/generated/prisma/enums";
import { PERMISSIONS, type Permission } from "@/lib/rbac";

/** lib/rbac.ts's display strings <-> the DB's PermissionType enum - kept in one place since every API route that touches permissions needs both directions. */
export const PERMISSION_TYPE_BY_LABEL: Record<Permission, PermissionType> = {
  View: "VIEW",
  "Add / Create": "ADD_CREATE",
  Edit: "EDIT",
  Delete: "DELETE",
  Approve: "APPROVE",
  Export: "EXPORT",
  "Manage Users": "MANAGE_USERS",
  "Manage Masters": "MANAGE_MASTERS",
  "Manage Forms": "MANAGE_FORMS",
  "Manage Permissions": "MANAGE_PERMISSIONS",
};

export const PERMISSION_LABEL_BY_TYPE: Record<PermissionType, Permission> = Object.fromEntries(
  PERMISSIONS.map((label) => [PERMISSION_TYPE_BY_LABEL[label], label]),
) as Record<PermissionType, Permission>;

/**
 * "An Admin can create only the next permitted level below them" (client
 * spec, section 9) - Super Admin has full authority so isn't restricted by
 * this map at all (checked separately). Every other Admin can create their
 * one paired User role plus the next Admin level down (section 4's
 * user-level hierarchy: e.g. State Admin -> State User AND District Admin).
 * KVK Admin has no further Admin level below it, only KVK User.
 */
export const CREATABLE_ROLE_SLUGS: Record<string, string[]> = {
  state_admin: ["district_admin", "state_user"],
  district_admin: ["org_admin", "district_user"],
  org_admin: ["kvk_admin", "org_user"],
  kvk_admin: ["kvk_user"],
};

/** The 9 system role slugs, in their real hierarchy order - system roles can never be renamed or deleted from Role Management. */
export const SYSTEM_ROLE_SLUGS = [
  "super_admin",
  "state_admin",
  "district_admin",
  "org_admin",
  "kvk_admin",
  "kvk_user",
  "state_user",
  "district_user",
  "org_user",
] as const;
