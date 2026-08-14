"use client";

import { useState } from "react";
import { Eye, EyeOff, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BASE_ROLES, DISTRICTS, KVKS, STATES, scopeFieldFor } from "@/lib/rbac";

type UserFormState = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  roleName: string;
  scopeValue: string;
};

const EMPTY_FORM: UserFormState = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  roleName: "",
  scopeValue: "",
};

function roleByName(name: string) {
  return BASE_ROLES.find((role) => role.name === name);
}

function scopeOptionsFor(kind: ReturnType<typeof scopeFieldFor>) {
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

/**
 * User Management screen. No accounts exist yet in this phase (no backend),
 * so the table always renders its real empty state — same "static/mock"
 * convention as the rest of the app. Create User renders and validates
 * exactly like the reference but doesn't persist a row; Edit/Delete per-row
 * actions wire up once real accounts exist (Phase 3).
 */
export function UserManagementView() {
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<UserFormState>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedRole = roleByName(form.roleName);
  const scopeField = selectedRole ? scopeFieldFor(selectedRole.scope) : null;
  const scopeOptions = scopeOptionsFor(scopeField);

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowPassword(false);
    setFormOpen(true);
  }

  function updateForm<K extends keyof UserFormState>(key: K, value: UserFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onRoleChange(roleName: string) {
    setForm((prev) => ({ ...prev, roleName, scopeValue: "" }));
  }

  function submitForm() {
    if (!form.fullName.trim() || !form.email.trim() || !form.roleName) {
      setFormError("Full name, email and role are required.");
      return;
    }
    if (scopeField && !form.scopeValue) {
      setFormError(`${scopeField.label} is required for this role.`);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setFormError("Password and confirm password do not match.");
      return;
    }

    setFormOpen(false);
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
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-3.5" />
          Create User
        </Button>
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
          <TableRow>
            <TableCell colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
              No users found.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
        <span>Showing 0 to 0 of 0 entries</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>

      {/* Create User */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="user-name">Full Name</Label>
              <Input
                id="user-name"
                placeholder="Enter full name"
                value={form.fullName}
                onChange={(event) => updateForm("fullName", event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                placeholder="name@atariams.org"
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-phone">Phone Number (Optional)</Label>
              <Input
                id="user-phone"
                placeholder="10-digit mobile (6–9...)"
                value={form.phone}
                onChange={(event) => updateForm("phone", event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-password">Password</Label>
              <div className="relative">
                <Input
                  id="user-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(event) => updateForm("password", event.target.value)}
                  className="pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Must contain uppercase, lowercase, and number
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-confirm-password">Confirm Password</Label>
              <Input
                id="user-confirm-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={(event) => updateForm("confirmPassword", event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-role">Role *</Label>
              <Select value={form.roleName} onValueChange={(value) => onRoleChange(value as string)}>
                <SelectTrigger id="user-role" className="w-full">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {BASE_ROLES.map((role) => (
                    <SelectItem key={role.name} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {scopeField &&
              (scopeOptions ? (
                <div className="space-y-1.5">
                  <Label htmlFor="user-scope">{scopeField.label} *</Label>
                  <Select
                    value={form.scopeValue}
                    onValueChange={(value) => updateForm("scopeValue", value as string)}
                  >
                    <SelectTrigger id="user-scope" className="w-full">
                      <SelectValue placeholder={scopeField.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {scopeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="user-scope-text">{scopeField.label} *</Label>
                  <Input
                    id="user-scope-text"
                    placeholder={scopeField.placeholder}
                    value={form.scopeValue}
                    onChange={(event) => updateForm("scopeValue", event.target.value)}
                  />
                </div>
              ))}

            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitForm}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
