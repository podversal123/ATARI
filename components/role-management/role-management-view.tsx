"use client";

import { useMemo, useState } from "react";
import { Plus, Search, MoreVertical, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BASE_ROLES, HIERARCHY_LEVELS, PERMISSIONS, type RoleDefinition } from "@/lib/rbac";
import { useSession } from "@/lib/session";

type Role = RoleDefinition & { id: string };

/** The 9 roles from the Role Management spec — reference data, not user data, so it's real rather than empty. */
const ROLES: Role[] = BASE_ROLES.map((role) => ({
  ...role,
  id: role.name.toLowerCase().replace(/\s+/g, "_"),
}));

/** A KVK Admin only ever deals with their own two roles — the rest of the hierarchy is Super Admin's concern. */
const KVK_VISIBLE_ROLE_NAMES = new Set(["KVK Admin", "KVK User"]);
const KVK_ROLES: Role[] = ROLES.filter((role) => KVK_VISIBLE_ROLE_NAMES.has(role.name));

type RoleFormState = {
  name: string;
  hierarchyLevel: string;
  description: string;
};

const EMPTY_FORM: RoleFormState = { name: "", hierarchyLevel: "", description: "" };

/**
 * Role Management screen. This phase is UI-only (no backend yet), so Add /
 * Edit / Delete / Manage Permissions all render and validate exactly like
 * the reference, but don't persist anything — same "static/mock" convention
 * as the rest of the app's list pages until the database step lands.
 */
export function RoleManagementView() {
  const session = useSession();
  const isKvk = session.role !== "super-admin";
  const roles = isKvk ? KVK_ROLES : ROLES;

  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState<RoleFormState>(EMPTY_FORM);

  const [permissionsRole, setPermissionsRole] = useState<Role | null>(null);
  const [checkedPermissions, setCheckedPermissions] = useState<Set<string>>(new Set());

  const [deleteRole, setDeleteRole] = useState<Role | null>(null);

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return roles;
    return roles.filter((role) => role.name.toLowerCase().includes(query));
  }, [search, roles]);

  function openCreate() {
    setEditingRole(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(role: Role) {
    setEditingRole(role);
    setForm({
      name: role.name,
      hierarchyLevel: String(role.hierarchyLevel),
      description: "",
    });
    setFormOpen(true);
  }

  function openPermissions(role: Role) {
    setPermissionsRole(role);
    setCheckedPermissions(new Set());
  }

  function togglePermission(permission: string) {
    setCheckedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permission)) {
        next.delete(permission);
      } else {
        next.add(permission);
      }
      return next;
    });
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by role name..."
            className="w-72 pl-8"
          />
        </div>
        {!isKvk && (
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-3.5" />
            Add Role
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <TableHead className="w-16 px-4 py-3">S.No.</TableHead>
            <TableHead className="px-4 py-3">Name</TableHead>
            {!isKvk && <TableHead className="w-16 px-4 py-3 text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRoles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isKvk ? 2 : 3} className="px-4 py-16 text-center text-muted-foreground">
                No roles found.
              </TableCell>
            </TableRow>
          ) : (
            filteredRoles.map((role, index) => (
              <TableRow key={role.id}>
                <TableCell className="px-4 py-4 text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="px-4 py-4 font-medium text-foreground">{role.name}</TableCell>
                {!isKvk && (
                  <TableCell className="px-4 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm">
                            <MoreVertical className="size-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(role)}>
                          <Pencil className="size-3.5" />
                          Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openPermissions(role)}>
                          <ShieldCheck className="size-3.5" />
                          Manage Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteRole(role)}>
                          <Trash2 className="size-3.5" />
                          Delete Role
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
        <span>
          Showing {filteredRoles.length === 0 ? 0 : 1} to {filteredRoles.length} of {filteredRoles.length}{" "}
          entries
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="secondary" size="sm" disabled>
            1
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>

      {/* Add / Edit Role */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Role" : "Add Role"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="role-name">Role Name *</Label>
              <Input
                id="role-name"
                placeholder="e.g. custom_admin"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Use snake_case (e.g. state_admin, state_user)
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hierarchy-level">Hierarchy Level *</Label>
              <Select
                value={form.hierarchyLevel}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, hierarchyLevel: value as string }))
                }
              >
                <SelectTrigger id="hierarchy-level" className="w-full">
                  <SelectValue placeholder="Select a level" />
                </SelectTrigger>
                <SelectContent>
                  {HIERARCHY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Lower number = higher authority. Affects who can see and manage this role.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                placeholder="Optional description of this role"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => setFormOpen(false)}
              disabled={!form.name.trim() || !form.hierarchyLevel}
            >
              {editingRole ? "Save Changes" : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Permissions */}
      <Dialog open={permissionsRole !== null} onOpenChange={(open) => !open && setPermissionsRole(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Permissions — {permissionsRole?.name}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            {PERMISSIONS.map((permission) => (
              <label
                key={permission}
                className="flex items-center gap-2 rounded-md border border-border px-2.5 py-2 text-sm"
              >
                <Checkbox
                  checked={checkedPermissions.has(permission)}
                  onCheckedChange={() => togglePermission(permission)}
                />
                {permission}
              </label>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionsRole(null)}>
              Cancel
            </Button>
            <Button onClick={() => setPermissionsRole(null)}>Save Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={deleteRole !== null} onOpenChange={(open) => !open && setDeleteRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role “{deleteRole?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the role and its permission configuration. Users currently assigned this
              role will need to be reassigned. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => setDeleteRole(null)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
