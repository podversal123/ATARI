"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePolling } from "@/lib/use-polling";
import { KeyRound, MoreVertical, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  roleName: string;
  kvkName: string;
  createdAt: string;
  lastLogin: string | null;
};

type EditFormState = { name: string; email: string; phone: string; password: string };
const EMPTY_EDIT_FORM: EditFormState = { name: "", email: "", phone: "", password: "" };

/**
 * User Management screen, wired to the real /api/users CRUD - list, create
 * (its own dedicated page, see create-user-page.tsx), edit, and delete all
 * round-trip through Prisma now instead of the earlier hardcoded empty
 * state. Reset Password reuses the same edit endpoint (a password-only
 * PATCH), since it's the same underlying action a real admin can already do
 * from Edit User - no separate backend needed for it.
 */
export function UserManagementView() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>(EMPTY_EDIT_FORM);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [deleteUser, setDeleteUser] = useState<UserRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  /** `silent` skips the loading state - used for background polling refreshes so the table doesn't flash "Loading users..." over data that's already on screen. */
  function loadUsers(silent = false) {
    if (!silent) setLoading(true);
    fetch("/api/users")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { users: UserRow[] }) => {
        setUsers(data.users);
        setListError(null);
      })
      .catch(() => {
        if (!silent) setListError("Could not load users.");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => loadUsers(), []);
  usePolling(() => loadUsers(true));

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  function openEdit(user: UserRow) {
    setEditUser(user);
    setEditForm({ name: user.name, email: user.email, phone: user.phone, password: "" });
    setEditError(null);
  }

  async function submitEdit() {
    if (!editUser) return;
    if (!editForm.name.trim()) {
      setEditError("Name is required.");
      return;
    }
    setEditError(null);
    setEditSubmitting(true);
    try {
      const response = await fetch(`/api/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          email: editForm.email.trim(),
          phone: editForm.phone.trim(),
          ...(editForm.password ? { password: editForm.password } : {}),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setEditError(data.error ?? "Could not save changes.");
        return;
      }
      setEditUser(null);
      loadUsers();
    } catch {
      setEditError("Could not reach the server. Please try again.");
    } finally {
      setEditSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteUser) return;
    setDeleteError(null);
    setDeleting(true);
    try {
      const response = await fetch(`/api/users/${deleteUser.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setDeleteError(data.error ?? "Could not delete this user.");
        return;
      }
      setDeleteUser(null);
      loadUsers();
    } catch {
      setDeleteError("Could not reach the server. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email..."
            className="w-72 pl-8"
          />
        </div>
        <Link href="/user-management/create" className={cn(buttonVariants({ size: "sm" }))}>
          <Plus className="size-3.5" />
          Create User
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <TableHead className="px-4 py-3">Name</TableHead>
            <TableHead className="px-4 py-3">Email</TableHead>
            <TableHead className="px-4 py-3">Phone</TableHead>
            <TableHead className="px-4 py-3">Role</TableHead>
            <TableHead className="px-4 py-3">Created</TableHead>
            <TableHead className="px-4 py-3">Last Login</TableHead>
            <TableHead className="w-20 px-4 py-3 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                Loading users...
              </TableCell>
            </TableRow>
          ) : listError ? (
            <TableRow>
              <TableCell colSpan={6} className="px-4 py-16 text-center text-destructive">
                {listError}
              </TableCell>
            </TableRow>
          ) : filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="px-4 py-3 font-medium text-foreground">{user.name}</TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">{user.email || "-"}</TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">{user.phone || "-"}</TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">{user.roleName}</TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "-"}
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(user)}>
                        <Pencil className="size-3.5" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => {
                          setDeleteUser(user);
                          setDeleteError(null);
                        }}
                      >
                        <Trash2 className="size-3.5" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
        <span>
          Showing {filtered.length === 0 ? 0 : 1} to {filtered.length} of {filtered.length} entries
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>

      {/* Edit User */}
      <Dialog open={editUser !== null} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-password">New Password (Optional)</Label>
              <Input
                id="edit-password"
                type="password"
                autoComplete="new-password"
                value={editForm.password}
                onChange={(event) => setEditForm((prev) => ({ ...prev, password: event.target.value }))}
              />
            </div>
            {editError && <p className="text-sm text-destructive">{editError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)} disabled={editSubmitting}>
              Cancel
            </Button>
            <Button onClick={submitEdit} disabled={editSubmitting}>
              {editSubmitting ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={deleteUser !== null} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user "{deleteUser?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes their account and login access. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
